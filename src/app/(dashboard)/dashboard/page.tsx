import Button from "@/components/ui/Button";
import { getFriendsByUserId } from "@/helpers/get-friends-by-user-id";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { chatHrefConstructor } from "@/lib/util";
import { Message } from "@/lib/validations/message";
import { ChevronRight } from "lucide-react";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FC } from "react";

interface DashboardPageProps {}

const DashboardPage: FC<DashboardPageProps> = async ({}) => {
  const session = await getServerSession(authOptions);
  if (!session) notFound();
  const friends = await getFriendsByUserId(session.user.id);
  const lastActiveFriends = await Promise.all(
    friends.map(async (friend) => {
      const [lastMessage] = (await fetchRedis(
        "zrange",
        `chat:${chatHrefConstructor(session.user.id, friend.id)}:messages`,
        -1,
        -1
      )) as string[];
      const parsedLastMessage = lastMessage?( JSON.parse(lastMessage)as Message) :undefined;
      return {
        ...friend,
        lastMessage:parsedLastMessage,
      };
    })
  );
  return (
    <div className="container py-12">
      <h1 className="font-bold text-5xl mb-8">Recent Chats</h1>
      {lastActiveFriends.length === 0 ? (
        <p className="text-sm text-zinc-500 ">Nothing to show here...</p>
      ) : (
        lastActiveFriends.map((friend) => (
          <div
            key={friend.id}
            className="relative bg-zinc-50 border border-zinc-200 p-3 rounded-md "
          >
            <div className="absolute right-4 inset-y-0 items-center flex">
              <ChevronRight className="h-7 w-7 text-zinc-400 " />
            </div>

            <Link
              href={`/dashboard/chat/${chatHrefConstructor(
                session.user.id,
                friend.id
              )}`}
              className="relative sm:flex"
            >
              <div className="mb-4 flex-shrink-0 sm:mb-0 sm:mr-4">
                <div className="relative h-6 w-6">
                  <Image
                    referrerPolicy="no-referrer"
                    fill
                    alt=""
                    src={friend.image}
                    className="rounded-full"
                  />
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold">{friend.name}</h4>
                <p className="mt-1 max-w--md">
                  <span className="text-zinc-400">
                    {friend.lastMessage &&friend.lastMessage.senderId ===session.user.id ?'You: ':friend.name}
                  </span>
                  {friend.lastMessage &&friend.lastMessage.text}
                </p>
              </div>
            </Link>
          </div>
        ))
      )}
    </div>
  );
};

export default DashboardPage;
