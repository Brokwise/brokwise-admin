"use client";

import { useState, useEffect, useRef } from "react";

import {
  useGetConversations,
  useGetConversationDetails,
  useSendMessage,
} from "@/hooks/useChat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Conversation } from "@/types/chat";
import { Loader2, Send, Search, User, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { generateFilePath, uploadFileToFirebase } from "@/lib/firebase-utils";
import { toast } from "sonner";
import Image from "next/image";

export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messageInput, setMessageInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: conversations, isLoading: isLoadingConversations } =
    useGetConversations();
  const { data: conversationDetails, isLoading: isLoadingMessages } =
    useGetConversationDetails(selectedConversationId!, 1, 100);

  const sendMessageMutation = useSendMessage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationDetails?.messages, selectedConversationId]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversationId) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are supported");
      return;
    }

    try {
      setIsUploading(true);
      const path = generateFilePath(
        file.name,
        `conversations/${selectedConversationId}`
      );
      const downloadURL = await uploadFileToFirebase(file, path);

      sendMessageMutation.mutate(
        {
          conversationId: selectedConversationId,
          type: "image",
          mediaUrl: downloadURL,
          mediaType: file.type,
          fileName: file.name,
          fileSize: file.size,
        },
        {
          onSuccess: () => {
            // Message sent
          },
        }
      );
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast.error("Failed to send image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversationId) return;

    sendMessageMutation.mutate(
      {
        conversationId: selectedConversationId,
        content: messageInput,
      },
      {
        onSuccess: () => {
          setMessageInput("");
        },
      }
    );
  };

  const getParticipantName = (conversation: Conversation) => {
    if (typeof conversation.participantId === "object") {
      const participant = conversation.participantId;
      return (
        participant.companyName ||
        (participant.firstName && participant.lastName
          ? `${participant.firstName} ${participant.lastName}`
          : "") ||
        participant.name ||
        participant.email
      );
    }
    return "Unknown User";
  };

  const getParticipantInitial = (conversation: Conversation) => {
    const name = getParticipantName(conversation);
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.20))] overflow-hidden rounded-lg border bg-background shadow-sm">
      {/* Sidebar - Conversation List */}
      <div className="w-80 flex-shrink-0 border-r bg-muted/10 md:w-96 flex flex-col">
        <div className="p-4 border-b flex-shrink-0">
          <h2 className="text-xl font-semibold tracking-tight mb-4">
            Messages
          </h2>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search messages..." className="pl-8" />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-1 p-2">
            {isLoadingConversations ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))
            ) : conversations?.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No conversations found
              </div>
            ) : (
              conversations?.map((conversation) => {
                const isSelected = selectedConversationId === conversation._id;
                return (
                  <button
                    key={conversation._id}
                    onClick={() => setSelectedConversationId(conversation._id)}
                    className={cn(
                      "flex items-start gap-3 rounded-md p-3 text-left transition-all hover:bg-accent",
                      isSelected && "bg-accent"
                    )}
                  >
                    <Avatar>
                      <AvatarFallback>
                        {getParticipantInitial(conversation)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">
                          {getParticipantName(conversation)}
                        </span>
                        {conversation.lastMessageAt && (
                          <span className="text-xs text-muted-foreground">
                            {format(
                              new Date(conversation.lastMessageAt),
                              "MMM d"
                            )}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {conversation.lastMessage || "No messages yet"}
                      </p>
                    </div>
                    {conversation.unreadCount ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                        {conversation.unreadCount}
                      </span>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col bg-background h-full overflow-hidden">
        {selectedConversationId ? (
          <>
            {/* Chat Header */}
            <div className="flex h-16 items-center border-b px-6 flex-shrink-0">
              {conversations
                ?.filter((c) => c._id === selectedConversationId)
                .map((c) => (
                  <div key={c._id} className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {getParticipantInitial(c)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{getParticipantName(c)}</h3>
                      <p className="text-xs text-muted-foreground">
                        {c.participantType}
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            {/* Messages List */}
            <ScrollArea className="flex-1 p-6">
              <div className="flex flex-col gap-4 min-h-full justify-end">
                {isLoadingMessages && !conversationDetails ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  conversationDetails?.messages
                    .slice()
                    .reverse()
                    .map((message) => {
                      const isMe = message.senderType === "Admin";

                      return (
                        <div
                          key={message._id}
                          className={cn(
                            "flex w-max max-w-[75%] flex-col gap-1 rounded-lg px-4 py-2 text-sm",
                            isMe
                              ? "ml-auto bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          {message.type === "image" && message.mediaUrl ? (
                            <Image
                              width={100}
                              height={100}
                              src={message.mediaUrl}
                              alt="Image"
                              className="rounded-md max-w-full h-auto max-h-[300px] object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <p>{message.content}</p>
                          )}
                          <span
                            className={cn(
                              "text-[10px]",
                              isMe
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            )}
                          >
                            {format(new Date(message.createdAt), "HH:mm")}
                          </span>
                        </div>
                      );
                    })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t bg-background flex-shrink-0">
              <form
                onSubmit={handleSendMessage}
                className="flex gap-2 items-end"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={sendMessageMutation.isPending || isUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Paperclip className="h-4 w-4" />
                  )}
                </Button>
                <Input
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  disabled={sendMessageMutation.isPending || isUploading}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={
                    sendMessageMutation.isPending ||
                    !messageInput.trim() ||
                    isUploading
                  }
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/20">
              <User className="h-10 w-10 opacity-20" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">
              Select a conversation
            </h3>
            <p className="text-sm">
              Choose a conversation from the sidebar to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
