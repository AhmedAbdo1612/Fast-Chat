import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/util";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id: idtoAdd } = z.object({ id: z.string() }).parse(body);
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }
    const isAlreadyFriends = await fetchRedis(
      "sismember",
      `user:${session.user.id}:friends`,
      idtoAdd
    );
    if (isAlreadyFriends) {
      return new Response("Already friends", { status: 400 });
    }
    const hasFriendRequest = await fetchRedis(
      "sismember",
      `user:${session.user.id}:incoming_friend_requests`,
      idtoAdd
    );
    if (!hasFriendRequest) {
      return new Response("No friend request", { status: 400 });
    }

    const [userRaw, friendRaw] = (await Promise.all([
      fetchRedis("get", `${session.user.id}`),
      fetchRedis("get", `${idtoAdd}`),
    ])) as string[];
    const user = JSON.parse(userRaw) as User;
    const friend = JSON.parse(friendRaw) as User;
    await Promise.all([
      pusherServer.trigger(
        toPusherKey(`user:${idtoAdd}:friends`),
        "new_friend",
        user
      ),

      pusherServer.trigger(
        toPusherKey(`user:${session.user.id}:friends`),
        "new_friend",
        friend
      ),

      db.sadd(`user:${session.user.id}:friends`, idtoAdd),
      db.sadd(`user:${idtoAdd}:friends`, session.user.id),

      db.srem(`user:${session.user.id}:incoming_friend_requests`, idtoAdd),
    ]);

    return new Response("ok");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request paylod", { status: 422 });
    }
    return new Response("invalid request", { status: 400 });
  }
}
