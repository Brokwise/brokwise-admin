"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useGetAllSubmissions,
  useGetEnquiry,
  useGetMessagesThreadsForEnquiry,
  useGetMessageForThread,
  useSendMessage,
} from "@/hooks/useEnquiry";
import { MessageThreadType } from "@/types/enquiry";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Building2,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  Info,
  FileText,
  CheckCircle2,
  ExternalLink,
  Clock,
  IndianRupee,
  MessageSquare,
  Send,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

import Image from "next/image";

const ChatSheet = ({
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

const EnquiryPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { data: enquiry, isLoading, error } = useGetEnquiry(id as string);
  const { data: messagesThreads, isLoading: isLoadingMessagesThreads } =
    useGetMessagesThreadsForEnquiry(id as string);
  const { data: submissions, isLoading: isLoadingSubmissions } =
    useGetAllSubmissions(id as string);

  const [selectedThread, setSelectedThread] = useState<{
    brokerId: string;
    brokerName: string;
    threadType: MessageThreadType;
    submissionId?: string;
  } | null>(null);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !enquiry) {
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load enquiry details.
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full p-6 space-y-6 bg-muted/10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              {enquiry.enquiryId}
              <Badge
                variant={enquiry.status === "active" ? "default" : "secondary"}
                className="uppercase"
              >
                {enquiry.status}
              </Badge>
            </h1>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              Created on {formatDate(enquiry.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Primary Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Property Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">
                  Category & Type
                </span>
                <p className="font-medium capitalize">
                  {enquiry.enquiryCategory} - {enquiry.enquiryType}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">
                  Budget Range
                </span>
                <p className="font-medium text-green-600">
                  {formatCurrency(enquiry.budget.min)} -{" "}
                  {formatCurrency(enquiry.budget.max)}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Location</span>
                <div className="flex items-start gap-1.5">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{enquiry.address || "N/A"}</p>
                  </div>
                </div>
              </div>
              {enquiry.size && (
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">
                    Size Preference
                  </span>
                  <p className="font-medium capitalize">
                    {enquiry.size.min} - {enquiry.size.max}{" "}
                    {enquiry.size.unit.toLowerCase().replace(/_/g, " ")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {enquiry.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          {/* Specific Details (Show only if present) */}
          {(enquiry.bhk ||
            enquiry.plotType ||
            enquiry.rooms ||
            enquiry.purpose) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Additional Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {enquiry.bhk && (
                  <div>
                    <span className="text-sm text-muted-foreground">BHK</span>
                    <p className="font-medium">{enquiry.bhk} BHK</p>
                  </div>
                )}
                {enquiry.plotType && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Plot Type
                    </span>
                    <p className="font-medium capitalize">
                      {enquiry.plotType.replace("_", " ")}
                    </p>
                  </div>
                )}
                {enquiry.facing && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Facing
                    </span>
                    <p className="font-medium capitalize">{enquiry.facing}</p>
                  </div>
                )}
                {enquiry.rooms && (
                  <div>
                    <span className="text-sm text-muted-foreground">Rooms</span>
                    <p className="font-medium">{enquiry.rooms}</p>
                  </div>
                )}
                {enquiry.purpose && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Purpose
                    </span>
                    <p className="font-medium">{enquiry.purpose}</p>
                  </div>
                )}
                {enquiry.washrooms && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Washrooms
                    </span>
                    <p className="font-medium">{enquiry.washrooms}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Submissions Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              Submissions
              <Badge variant="secondary" className="rounded-full">
                {submissions?.length || 0}
              </Badge>
            </h2>

            {isLoadingSubmissions ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : submissions && submissions.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {submissions.map((submission) => (
                  <Card key={submission._id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      {/* Property Image / Left Side */}
                      <div className="w-full md:w-48 h-32 md:h-auto bg-muted relative shrink-0">
                        {submission.propertyId.featuredMedia ? (
                          <Image
                            src={
                              submission.propertyId.featuredMedia.includes(
                                "firebasestorage.googleapis.com"
                              )
                                ? submission.propertyId.featuredMedia
                                : "/placeholder.webp"
                            }
                            alt="Property"
                            className="object-cover"
                            fill
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Building2 className="h-8 w-8" />
                          </div>
                        )}
                        <div className="absolute top-2 left-2">
                          <Badge
                            variant={
                              submission.status === "approved"
                                ? "default"
                                : submission.status === "rejected"
                                ? "destructive"
                                : "secondary"
                            }
                            className={cn(
                              "capitalize shadow-sm",
                              submission.status === "approved"
                                ? "bg-green-500 text-green-50"
                                : submission.status === "rejected"
                                ? "bg-red-500 text-red-50"
                                : "bg-yellow-500 text-yellow-50"
                            )}
                          >
                            {submission.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4 flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-base flex items-center gap-2">
                                {submission.propertyId.propertyType}
                                <span className="text-muted-foreground font-normal text-sm">
                                  in{" "}
                                  {typeof submission.propertyId.address ===
                                  "string"
                                    ? submission.propertyId.address
                                    : submission.propertyId.address.city}
                                </span>
                              </h3>
                              <div className="text-green-600 font-bold mt-1 flex items-center gap-1">
                                <IndianRupee className="h-4 w-4" />
                                {formatCurrency(
                                  submission.propertyId.totalPrice
                                ).replace("₹", "")}
                              </div>
                            </div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() =>
                                      router.push(
                                        `/enquiries/submission/${submission._id}`
                                      )
                                    }
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View Property Details</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <User className="h-3.5 w-3.5" />
                              <span className="truncate">
                                {submission.brokerId.firstName}{" "}
                                {submission.brokerId.lastName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5" />
                              <span>{submission.brokerId.mobile}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t mt-auto">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Submitted{" "}
                              {formatDate(submission.createdAt)}
                            </span>
                            {submission.isForwardedToEnquirer && (
                              <span className="flex items-center gap-1 text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="h-3 w-3" /> Forwarded
                              </span>
                            )}
                          </div>
                          {submission.submissionId && (
                            <span className="font-mono bg-muted px-1.5 py-0.5 rounded">
                              {submission.submissionId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
                <Building2 className="h-8 w-8 mx-auto text-muted-foreground/50" />
                <p className="mt-2 text-muted-foreground">
                  No submissions received yet.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Creator Info */}
          {enquiry.creatorInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Enquiry Source
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {enquiry.creatorInfo.firstName[0]}
                    {enquiry.creatorInfo.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium">
                      {enquiry.creatorInfo.firstName}{" "}
                      {enquiry.creatorInfo.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {enquiry.creatorInfo.companyName}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{enquiry.creatorInfo.mobile}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">
                      {enquiry.creatorInfo.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="capitalize">
                      {enquiry.creatorInfo.city}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statistics */}
          {enquiry.stats && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Submissions
                  </span>
                  <Badge variant="outline">
                    {enquiry.stats.totalSubmissions}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                  >
                    {enquiry.stats.pendingSubmissions}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Approved
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 hover:bg-green-100"
                  >
                    {enquiry.stats.approvedSubmissions}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Message Threads */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingMessagesThreads ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : messagesThreads && messagesThreads.length > 0 ? (
                <div className="space-y-2">
                  {messagesThreads.map((thread) => (
                    <Button
                      key={thread.participantBrokerId}
                      variant="outline"
                      className="w-full justify-between h-auto py-3 px-4"
                      onClick={() =>
                        setSelectedThread({
                          brokerId: thread.participantBrokerId,
                          brokerName:
                            thread.participantBrokerName || "Unknown Broker",
                          threadType: thread.threadType,
                          submissionId: thread.submissionId,
                        })
                      }
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Avatar className="h-8 w-8 border">
                          <AvatarFallback>
                            {(thread.participantBrokerName || "B")[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start truncate">
                          <span className="font-medium truncate">
                            {thread.participantBrokerName || "Broker"}
                          </span>
                          <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                            {thread.lastMessage}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {thread.unreadCount > 0 && (
                          <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                            {thread.unreadCount}
                          </Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(thread.lastMessageAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                            }
                          )}
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No conversations yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chat Sheet */}
      {selectedThread && (
        <ChatSheet
          enquiryId={id as string}
          brokerId={selectedThread.brokerId}
          brokerName={selectedThread.brokerName}
          threadType={selectedThread.threadType}
          submissionId={selectedThread.submissionId}
          open={!!selectedThread}
          onOpenChange={(open) => !open && setSelectedThread(null)}
        />
      )}
    </div>
  );
};

export default EnquiryPage;
