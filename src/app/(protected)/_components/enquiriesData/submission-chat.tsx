"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, MessageSquare } from "lucide-react";
import { useGetMessageForThread, useSendMessage } from "@/hooks/useEnquiry";
import { cn } from "@/lib/utils";

interface SubmissionChatProps {
  enquiryId: string;
  brokerId: string;
  brokerName: string;
  submissionId: string;
  className?: string;
}

export const SubmissionChat = ({
  enquiryId,
  brokerId,
  brokerName,
  submissionId,
  className,
}: SubmissionChatProps) => {
  const {
    data: messages,
    isLoading,
    error,
  } = useGetMessageForThread(enquiryId, brokerId, "submitter_admin");

  const { mutate: sendMessage, isPending: isSending } = useSendMessage(
    enquiryId,
    brokerId
  );

  const [newMessage, setNewMessage] = useState("");
  // const scrollRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   if (scrollRef.current) {
  //     scrollRef.current.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    sendMessage(
      {
        message: newMessage,
        threadType: "submitter_admin",
        submissionId: submissionId,
      },
      {
        onSuccess: () => {
          setNewMessage("");
        },
      }
    );
  };

  return (
    <Card className={cn("h-[600px] flex flex-col", className)}>
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Chat with {brokerName}
        </CardTitle>
      </CardHeader>

      <div className="flex-1 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-red-500 text-sm">
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
              {/* <div ref={scrollRef} /> */}
            </div>
          </ScrollArea>
        )}
      </div>

      <div className="p-4 border-t mt-auto bg-background">
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
    </Card>
  );
};
