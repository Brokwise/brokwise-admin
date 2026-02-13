"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  useGetConversations,
  useGetConversationDetails,
  useSendMessage,
  useCreateConversation,
} from "@/hooks/useChat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Conversation } from "@/types/chat";
import {
  Loader2,
  Send,
  Search,
  Plus,
  MoreVertical,
  Phone,
  Video,
  Image as ImageIcon,
  MessageSquarePlusIcon,
} from "lucide-react";
import { format } from "date-fns";
import { generateFilePath, uploadFileToFirebase } from "@/lib/firebase-utils";
import { toast } from "sonner";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useBroker } from "@/hooks/useBroker";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/stores/authStore";
import {
  hasAnyPermission,
  hasPermission,
  normalizeUserType,
} from "@/lib/permissions";

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const rawUserType = useAuthStore((state) => state.userType);
  const permissions = useAuthStore((state) => state.permissions);
  const userType = normalizeUserType(rawUserType);

  const canReadMessages = hasAnyPermission(userType, permissions, [
    "message:read",
    "message:interact",
  ]);
  const canInteractMessages = hasPermission(
    userType,
    permissions,
    "message:interact"
  );
  const canReadBrokers = hasPermission(userType, permissions, "broker:read");
  const canStartConversation = canInteractMessages && canReadBrokers;

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const { brokers } = useBroker(canStartConversation);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [brokerSearchQuery, setBrokerSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: conversations, isLoading: isLoadingConversations } =
    useGetConversations(1, 10, canReadMessages);
  const { data: conversationDetails, isLoading: isLoadingMessages } =
    useGetConversationDetails(selectedConversationId!, 1, 100, canReadMessages);
  const { mutate } = useCreateConversation();
  const sendMessageMutation = useSendMessage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationDetails?.messages, selectedConversationId]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canInteractMessages) return;

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
    if (!canInteractMessages) return;
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
  const handleStartConversation = async (brokerId: string) => {
    if (!canStartConversation) return;
    mutate({ participantId: brokerId, participantType: "Broker" });
    // Ideally we would select the conversation after creation,
    // but the API might not return it immediately or we'd need to refetch.
  };

  const filteredConversations = conversations?.filter((conversation) =>
    getParticipantName(conversation)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const filteredBrokers = brokers?.filter(
    (b) =>
      b.firstName?.toLowerCase().includes(brokerSearchQuery.toLowerCase()) ||
      b.lastName?.toLowerCase().includes(brokerSearchQuery.toLowerCase()) ||
      b.email?.toLowerCase().includes(brokerSearchQuery.toLowerCase())
  );

  const requestedConversationId = searchParams.get("conversationId");

  useEffect(() => {
    if (!requestedConversationId) return;

    setSelectedConversationId((prev) =>
      prev === requestedConversationId ? prev : requestedConversationId
    );
  }, [requestedConversationId]);

  return (
    <div className="flex h-[calc(100vh-2rem)] overflow-hidden rounded-xl border bg-background shadow-sm">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 border-r bg-muted/5 flex flex-col md:w-96">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Messages</h2>
            {canStartConversation && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Plus className="h-5 w-5" />
                    <span className="sr-only">New message</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New Conversation</DialogTitle>
                    <DialogDescription>
                      Start a new conversation with a broker.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-2">
                    <Input
                      placeholder="Search brokers..."
                      value={brokerSearchQuery}
                      onChange={(e) => setBrokerSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="mt-2 max-h-[300px] overflow-y-auto space-y-2">
                    {filteredBrokers?.map((b) => (
                      <div
                        key={b._id}
                        className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {b.firstName?.charAt(0) || "B"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="grid gap-0.5">
                            <p className="text-sm font-medium leading-none">
                              {b.firstName} {b.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {b.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleStartConversation(b._id)}
                        >
                          Chat
                        </Button>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          {!canStartConversation && canReadMessages && (
            <p className="text-xs text-muted-foreground">
              You can view messages. Ask an admin for message interaction and
              broker view permissions to start new conversations.
            </p>
          )}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/50 border-muted-foreground/20"
            />
          </div>
        </div>
        <Separator />
        <ScrollArea className="flex-1">
          <div className="flex flex-col p-2 gap-1">
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
            ) : filteredConversations?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center">
                  <Search className="h-6 w-6 opacity-20" />
                </div>
                <p>
                  {searchQuery ? "No messages found" : "No conversations yet"}
                </p>
              </div>
            ) : (
              filteredConversations?.map((conversation) => {
                const isSelected = selectedConversationId === conversation._id;
                return (
                  <button
                    key={conversation._id}
                    onClick={() => setSelectedConversationId(conversation._id)}
                    className={cn(
                      "flex items-start gap-3 rounded-lg p-3 text-left transition-all hover:bg-muted/50",
                      isSelected && "bg-muted"
                    )}
                  >
                    <Avatar className="h-10 w-10 border">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getParticipantInitial(conversation)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium truncate text-sm">
                          {getParticipantName(conversation)}
                        </span>
                        {conversation.lastMessageAt && (
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {format(
                              new Date(conversation.lastMessageAt),
                              "MMM d"
                            )}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="truncate text-xs text-muted-foreground max-w-[180px]">
                          {conversation.lastMessage || "Started a conversation"}
                        </p>
                        {conversation.unreadCount ? (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-medium">
                            {conversation.unreadCount}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col bg-background min-w-0">
        {selectedConversationId ? (
          <>
            {/* Chat Header */}
            <div className="flex h-16 items-center justify-between border-b px-6 py-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              {conversations
                ?.filter((c) => c._id === selectedConversationId)
                .map((c) => (
                  <div key={c._id} className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 border">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getParticipantInitial(c)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-sm leading-none mb-1">
                        {getParticipantName(c)}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-green-500" />
                        <p className="text-xs text-muted-foreground">
                          {c.participantType}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                >
                  <Video className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-6 mx-1" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages List */}
            <ScrollArea className="flex-1 p-6">
              <div className="flex flex-col gap-6 min-h-full justify-end">
                {isLoadingMessages && !conversationDetails ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  conversationDetails?.messages
                    .slice()
                    .reverse()
                    .map((message) => {
                      const mySenderType =
                        userType === "manager" ? "Manager" : "Admin";
                      const isMe = message.senderType === mySenderType;
                      // Check if previous message was from same sender to group them visually (optional enhancement)
                      // const isSequence = index > 0 && arr[index - 1].senderType === message.senderType;

                      return (
                        <div
                          key={message._id}
                          className={cn(
                            "flex flex-col max-w-[70%]",
                            isMe ? "ml-auto items-end" : "mr-auto items-start"
                          )}
                        >
                          <div
                            className={cn(
                              "px-4 py-2.5 shadow-sm text-sm relative group",
                              isMe
                                ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                                : "bg-muted rounded-2xl rounded-tl-sm"
                            )}
                          >
                            {message.type === "image" && message.mediaUrl ? (
                              <div className="relative">
                                <Image
                                  width={300}
                                  height={300}
                                  src={message.mediaUrl}
                                  alt="Shared image"
                                  className="rounded-lg max-w-full h-auto object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                  loading="lazy"
                                />
                              </div>
                            ) : (
                              <p className="leading-relaxed whitespace-pre-wrap">
                                {message.content}
                              </p>
                            )}

                            {/* Time Tooltip on Hover or always visible tiny */}
                            <span
                              className={cn(
                                "absolute bottom-0 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-[-1.5rem]",
                                isMe
                                  ? "right-0 text-muted-foreground"
                                  : "left-0 text-muted-foreground"
                              )}
                            >
                              {format(new Date(message.createdAt), "h:mm a")}
                            </span>
                          </div>
                          {/* Alternative Timestamp placement (below bubble) */}
                          <span
                            className={cn(
                              "text-[10px] text-muted-foreground mt-1 px-1",
                              isMe ? "text-right" : "text-left"
                            )}
                          >
                            {format(new Date(message.createdAt), "h:mm a")}
                          </span>
                        </div>
                      );
                    })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-background border-t">
              {canInteractMessages ? (
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-end gap-2 max-w-4xl mx-auto"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-muted-foreground hover:text-foreground"
                          disabled={sendMessageMutation.isPending || isUploading}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {isUploading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <ImageIcon className="h-5 w-5" />
                          )}
                          <span className="sr-only">Attach file</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Attach image</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <div className="relative flex-1">
                    <Input
                      placeholder="Type your message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      disabled={sendMessageMutation.isPending || isUploading}
                      className="pr-12 min-h-[44px] py-3 rounded-full bg-muted/30 border-muted-foreground/20 focus-visible:ring-offset-0"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={
                        sendMessageMutation.isPending ||
                        !messageInput.trim() ||
                        isUploading
                      }
                      className={cn(
                        "absolute right-1 top-1 h-9 w-9 rounded-full transition-all",
                        messageInput.trim()
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-90"
                      )}
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      <span className="sr-only">Send</span>
                    </Button>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-center text-muted-foreground">
                  Read-only access. Ask an admin for message interaction
                  permission to reply.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground bg-muted/5">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/20 mb-6">
              <MessageSquarePlusIcon className="h-10 w-10 opacity-20" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">
              Select a conversation
            </h3>
            <p className="text-sm max-w-xs text-center mt-2">
              Choose a conversation from the sidebar or start a new one to begin
              chatting.
            </p>
            {canStartConversation && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mt-6">Start New Conversation</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New Conversation</DialogTitle>
                    <DialogDescription>
                      Select a broker to chat with
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-2">
                    <Input
                      placeholder="Search brokers..."
                      value={brokerSearchQuery}
                      onChange={(e) => setBrokerSearchQuery(e.target.value)}
                    />
                  </div>
                  {/* Reusing the broker list logic or extracting it would be better, but duplication for now is safe */}
                  <div className="mt-2 max-h-[300px] overflow-y-auto space-y-2">
                    {filteredBrokers?.map((b) => (
                      <div
                        key={b._id}
                        className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {b.firstName?.charAt(0) || "B"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="grid gap-0.5">
                            <p className="text-sm font-medium leading-none">
                              {b.firstName} {b.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {b.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleStartConversation(b._id)}
                        >
                          Chat
                        </Button>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
