"use client";

import React, { useEffect, useRef, useState } from "react";
import { useGetMessageForThread, useSendMessage } from "@/hooks/useEnquiry";
import { MessageThreadType } from "@/types/enquiry";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export const ChatSheet = ({
  enquiryId,
  brokerId,
  brokerName,
  threadType,
  submissionId,
  open,
  onOpenChange,
}: {
  enquiryId: string;
  brokerId: string;
  brokerName: string;
  threadType: MessageThreadType;
  submissionId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const {
    data: messages,
    isLoading,
    error,
  } = useGetMessageForThread(enquiryId, brokerId, threadType, submissionId);

  const { mutate: sendMessage, isPending: isSending } = useSendMessage(
    enquiryId,
    brokerId
  );
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    sendMessage(
      { message: newMessage },
      {
        onSuccess: () => {
          setNewMessage("");
        },
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full p-0 gap-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{brokerName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span>{brokerName}</span>
              <span className="text-xs font-normal text-muted-foreground">
                Broker
              </span>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center text-red-500">
              Failed to load messages
            </div>
          ) : (
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages && messages.length > 0 ? (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${
                        msg.senderType === "admin"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 text-sm ${
                          msg.senderType === "admin"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p>{msg.message}</p>
                        <span
                          className={`text-[10px] block mt-1 ${
                            msg.senderType === "admin"
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No messages yet. Start the conversation!
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="p-4 border-t mt-auto">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={isSending}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isSending || !newMessage.trim()}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
};
