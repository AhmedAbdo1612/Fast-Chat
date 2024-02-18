import FriendRequestSidebarOption from "@/components/FriendRequestSidebarOption";
import { Icons } from "@/components/Icons";
import MobileChatLayout from "@/components/MobileChatLayout";
import SidebarChatList from "@/components/SidebarChatList";
import SignOutButton from "@/components/SignOutButton";
import { getFriendsByUserId } from "@/helpers/get-friends-by-user-id";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { SidebarOption } from "@/types/typing";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FC, ReactNode } from "react";
interface LayoutProps {
  children: ReactNode;
}
const sidebarOptions: SidebarOption[] = [
  {
    id: "1",
    name: "Add friend",
    href: "/dashboard/add",
    Icon: "UserPlus",
  },
];

const Layout: FC<LayoutProps> = async ({ children }) => {
  const session = await getServerSession(authOptions);
  if (!session) {
    notFound();
  }
  let friends;
  let unSeenRequestCount;
  try {
    friends = await getFriendsByUserId(session.user.id);
    unSeenRequestCount = (
      (await fetchRedis(
        "smembers",
        `user:${session.user.id}:incoming_friend_requests`
      )) as User[]
    ).length;
  } catch (error) {
    return notFound();
  }

  return (
    <div className="w-full flex h-screen">
      <div className="md:hidden">
        <MobileChatLayout
          session={session}
          friends={friends}
          unseenRequestCount={unSeenRequestCount}
          sidebarOptions={sidebarOptions}
        />
      </div>
      <div className="hidden md:flex h-full max-w-xs grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
        <Link href="/dashboard" className="flex h-16 shrink-0 items-center">
          <Icons.Logo className="h-8 w-auto text-indigo-600" />
        </Link>
        {friends.length > 0 && (
          <div className="text-xs font-semibold leading-6 text-gray-500">
            Your chats
          </div>
        )}
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="relative flex flex-1 flex-col gap-y-7">
            <li>
              <SidebarChatList sessionId={session.user.id} friends={friends} />
            </li>
            <li>
              <div className="text-xs font-semibold leading-6 text-gray-400">
                Overview
              </div>
              <ul role="list" className="-mx-2 mt-2 space-y-1">
                <Link
                  href={"/dashboard/add"}
                  className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold "
                >
                  <div className="text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
                    <Icons.UserPlus className="h-4 w-4" />
                  </div>
                  <p className="truncate">Add friend</p>
                </Link>
                <li>
                  <FriendRequestSidebarOption
                    sessionId={session.user.id}
                    initialUnseenRequestCount={unSeenRequestCount}
                  />
                </li>
              </ul>
            </li>

            <li className="overflow-clip -mx-6 mt-auto w-full flex items-center relative">
              <div className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900">
                <div className="relative h-8 w-8 bg-gray-50">
                  <Image
                    alt="Your profile pricture"
                    fill
                    referrerPolicy="no-referrer"
                    className="rounded-full"
                    src={session.user.image || ""}
                  />
                </div>
                <span className="sr-only">Your profile</span>
                <div className="flex flex-col shrink grow-0">
                  <div className="w-full flex gap-4 flex-nowrap items-center">
                    <span aria-hidden="true">{session.user.name}</span>
                    <SignOutButton className="h-full aspect-square " />
                  </div>
                  <span
                    className="text-xs max-w-xs  shrink truncate text-zinc-400 pr-3"
                    aria-hidden="true"
                  >
                    {session.user.email}
                  </span>
                </div>
              </div>
            </li>
          </ul>
        </nav>
      </div>
      <aside className="max-h-screen container py-16 md:py-12 w-full ">
        {children}
      </aside>
    </div>
  );
};
export default Layout;
