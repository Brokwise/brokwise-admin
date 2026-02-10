export interface Message {
  _id: string;
  content?: string;
  type: "text" | "image" | "file";
  mediaUrl?: string;
  mediaType?: string;
  fileName?: string;
  fileSize?: number;
  read: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  conversationId: string;
  senderId: string;
  senderType: "Admin" | "Manager" | "Broker" | "Company";
  createdAt: string;
  updatedAt: string;
}

export interface ConversationParticipant {
  _id: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
}

export interface Conversation {
  _id: string;
  adminId: ConversationParticipant | string; // Populated or ID
  participantId: ConversationParticipant | string; // Populated or ID
  participantType: "Broker" | "Company";
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationDetails {
  conversation: Conversation;
  messages: Message[];
}

export interface SendMessagePayload {
  conversationId: string;
  content?: string;
  type?: "text" | "image" | "file";
  mediaUrl?: string;
  mediaType?: string;
  fileName?: string;
  fileSize?: number;
}

export interface CreateConversationPayload {
  participantId: string;
  participantType: "Broker" | "Company";
}
