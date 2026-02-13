import api from '@/lib/axios';
import {
  SupportTicket,
  SupportTicketFilters,
  SupportTicketListResponse,
  SupportTicketStats,
} from '@/interfaces/support.interface';

const BASE_URL = '/support/admin';

export const SupportService = {
  getTickets: async (filters: SupportTicketFilters = {}): Promise<SupportTicketListResponse> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`${BASE_URL}/tickets`, { params });
    return response.data;
  },

  getTicketById: async (ticketId: string): Promise<SupportTicket> => {
    const response = await api.get(`${BASE_URL}/tickets/${ticketId}`);
    return response.data;
  },

  updateTicket: async (
    ticketId: string,
    data: { status?: string; priority?: string; assignedTo?: string; tags?: string[] }
  ): Promise<SupportTicket> => {
    const response = await api.patch(`${BASE_URL}/tickets/${ticketId}`, data);
    return response.data;
  },

  addResponse: async (
    ticketId: string,
    data: { responseMessage: string; sendEmail?: boolean }
  ): Promise<SupportTicket> => {
    const response = await api.post(`${BASE_URL}/tickets/${ticketId}/responses`, data);
    return response.data;
  },

  deleteTicket: async (ticketId: string): Promise<void> => {
    await api.delete(`${BASE_URL}/tickets/${ticketId}`);
  },

  getStats: async (): Promise<SupportTicketStats> => {
    const response = await api.get(`${BASE_URL}/stats`);
    return response.data;
  },

  getTicketsByCategory: async (category: string, page = 1, limit = 20): Promise<SupportTicketListResponse> => {
    const response = await api.get(`${BASE_URL}/tickets/category/${encodeURIComponent(category)}`, {
      params: { page, limit }
    });
    return response.data;
  },

  searchTickets: async (query: string, page = 1, limit = 20): Promise<SupportTicketListResponse> => {
    const response = await api.get(`${BASE_URL}/search`, {
      params: { q: query, page, limit }
    });
    return response.data;
  }
};
