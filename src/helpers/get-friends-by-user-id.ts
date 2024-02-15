import { fetchRedis } from "./redis";

export const getFriendsByUserId = async (userId: string) => {
  const friendIds = (await fetchRedis(
    "smembers",
    `user:${userId}:friends`
  )) as string[];
  const friends = await Promise.all(
    friendIds.map(async (id) => {
      const friend = JSON.parse(await fetchRedis("get", id));
      return friend as User;
    })
  );
  return friends
};
