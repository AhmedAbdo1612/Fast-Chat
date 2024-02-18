import ChatInput from "@/components/ChatInput";
import Messages from "@/components/Messages";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { messsageArrayValidator } from "@/lib/validations/message";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    chatId: string;
  };
}
async function getChatMessages(chatId: string) {
  try {
    const results: string[] = await fetchRedis(
      "zrange",
      `chat:${chatId}:messages`,
      0,
      -1
    );
    const dbMeaages = results.map((message) => JSON.parse(message) as Message);
    const reversedDbmessages = dbMeaages.reverse();
    const messages = messsageArrayValidator.parse(reversedDbmessages);
    return messages;
  } catch (error) {
    notFound();
  }
}
const page = async ({ params }: PageProps) => {
  const { chatId } = params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return notFound();
  }
  const { user } = session;
  const [userId1, userId2] = chatId.split("--");
  if (user.id !== userId1 && user.id !== userId2) {
    notFound();
  }
  const chatPartnerId = user.id === userId1 ? userId2 : userId1;
  // const chatPartner = (await db.get(`${chatPartnerId}`)) as User;
  const chatPartnerRaw = (await fetchRedis(
    "get",
    `${chatPartnerId}`
  )) as string;
  const chatPartner = JSON.parse(chatPartnerRaw) as User;

  const initialMessages = await getChatMessages(chatId);

  return (
    <div className="flex flex-1 justify-between flex-col h-full max-h-[calc(100vh-6rem)] ">
      <div className=" bg-[#462bf6] rounded-md px-2 flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
        <div className= "relative flex items-center space-x-4 ">
          <div className="relative">
            <div className="relative w-8 sm:w-12 h- sm:h-12 ">
              <Image
                fill
                referrerPolicy="no-referrer"
                src={chatPartner.image}
                alt={chatPartner.name}
                className="rounded-full"
              />
            </div>
          </div>
          <div className="flex flex-col leading-tight">
            <div className="text-xl flex items-center">
              <span className=" mr-3  text-white font-bold">
                {chatPartner.name}
              </span>
            </div>
            <span className="text-sm text-gray-50">{chatPartner.email}</span>
          </div>
        </div>
      </div>
      <Messages
        initialMessages={initialMessages}
        sessionImg={session.user.image}
        chatPartner={chatPartner}
        sessionId={session.user.id}
        chatId={chatId}
      />
      <ChatInput chatPartner={chatPartner} chatId={chatId} />
    </div>
  );
};

export default page;
