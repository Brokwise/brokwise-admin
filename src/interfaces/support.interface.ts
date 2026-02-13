export interface SupportTicketResponse {
  respondedBy: string | { _id: string; name: string; email: string };
  responseMessage: string;
  respondedAt: Date;
  emailSent: boolean;
}

export interface SupportTicket {
  _id: string;
  ticketId: string;
  name: string;
  email: string;
  contactNumber: string;
  category: 'Technical Support' | 'Account Issues' | 'Billing Support' | 'Feature Request' | 'Bug Report' | 'General Inquiry' | 'Partnership' | 'Other';
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignedTo?: string | { _id: string; name: string; email: string };
  responses: SupportTicketResponse[];
  tags: string[];
  source: 'Website' | 'Mobile App' | 'Email' | 'Phone' | 'Other';
  userAgent?: string;
  ipAddress?: string;
  resolvedAt?: Date;
  firstResponseAt?: Date;
  lastResponseAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportTicketFilters {
  category?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  email?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeStats?: boolean;
}

export interface SupportTicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  avgResponseTime: number;
  avgResolutionTime: number;
}

export interface SupportTicketListResponse {
  tickets: SupportTicket[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalTickets: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats?: SupportTicketStats;
}
