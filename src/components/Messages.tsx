"use client";
import { cn, toPusherKey } from "@/lib/util";
import { Message } from "@/lib/validations/message";
import { FC, useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import Image from "next/image";
import { pusherClient } from "@/lib/pusher";

interface MessagesProps {
  initialMessages: Message[];
  sessionId: string;
  sessionImg: string | null | undefined;
  chatPartner: User;
  chatId: string;
}

const Messages: FC<MessagesProps> = ({
  initialMessages,
  sessionId,
  sessionImg,
  chatPartner,
  chatId,
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const scrollDownRef = useRef<HTMLDivElement | null>(null);
  const formatTimestamp = (timestamp: number) => {
    return format(timestamp, "HH:mm");
  };
  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`chat:${chatId}`)
    );

    const messageHandler = (message:Message) => {
      setMessages((prev) => [message, ...prev]);
    };
 
    pusherClient.bind("incoming-message", messageHandler);
    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`chat:${chatId}`)
      );
      pusherClient.unbind("incoming-message", messageHandler);
    };
  }, []);
  return (
    <div
      id="messages"
      className="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrolbar-thumb-rounded 
  scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
    >
      <div ref={scrollDownRef} />
      {messages.map((msg, index) => {
        const isCuurentUser = msg.senderId === sessionId;
        const hasNextMessage = messages[index - 1]?.senderId === msg.senderId;
        return (
          <div key={index} className="chat-message">
            <div
              className={cn("flex items-end", { "justify-end": isCuurentUser })}
            >
              <div
                className={cn(
                  "flex flex-col space-y-2 text-base max-w-xs mx-2",
                  {
                    "order-1 items-end": isCuurentUser,
                    "order-2 items-start": !isCuurentUser,
                  }
                )}
              >
                <span
                  className={cn("px-4 py-2 rounded-lg inline-block", {
                    "bg-indigo-600 text-white": isCuurentUser,
                    "bg-gray-200 text-gray-900": !isCuurentUser,
                    "rounded-br-none": !hasNextMessage && isCuurentUser,
                    "rounded-bl-none": !hasNextMessage && !isCuurentUser,
                  })}
                >
                  {msg.text}{" "}
                  <span className="ml-2 text-xs text-gray-400">
                    {formatTimestamp(msg.timestamp)}
                  </span>
                </span>
              </div>
              <div
                className={cn(
                  "relative w-6 h-6 rounded-full overflow-hidden ",
                  {
                    "order-2": isCuurentUser,
                    "order-1": !isCuurentUser,
                    invisible: hasNextMessage,
                  }
                )}
              >
                <Image
                  alt={chatPartner.name}
                  referrerPolicy="no-referrer"
                  fill
                  src={
                    isCuurentUser ? (sessionImg as string) : chatPartner.image
                  }
                  className="rounded-full"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Messages;
