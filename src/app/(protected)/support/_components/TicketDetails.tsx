import React, { useState } from 'react';
import { SupportTicket } from '@/interfaces/support.interface';
import { SupportService } from '@/services/support.service';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Send, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface TicketDetailsProps {
  ticket: SupportTicket;
  onClose: () => void;
}

const TicketDetails: React.FC<TicketDetailsProps> = ({ ticket, onClose }) => {
  const [replyMessage, setReplyMessage] = useState('');
  const queryClient = useQueryClient();

  const replyMutation = useMutation({
    mutationFn: async (data: { responseMessage: string; sendEmail: boolean }) => {
      return await SupportService.addResponse(ticket.ticketId, data);
    },
    onSuccess: () => {
      toast.success('Response sent successfully');
      setReplyMessage('');
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to send response');
      console.error(error);
    }
  });

  const handleSendReply = () => {
    if (!replyMessage.trim()) return;
    replyMutation.mutate({ responseMessage: replyMessage, sendEmail: true });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-500';
      case 'In Progress': return 'bg-yellow-500';
      case 'Resolved': return 'bg-green-500';
      case 'Closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low': return 'bg-green-500';
      case 'Medium': return 'bg-blue-500';
      case 'High': return 'bg-orange-500';
      case 'Urgent': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold mb-1">{ticket.ticketId}</h2>
          <p className="text-sm text-gray-500">Created on {format(new Date(ticket.createdAt), 'PPpp')}</p>
        </div>
        <div className="flex gap-2">
          <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
          <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <p className="font-semibold text-gray-500">User</p>
          <p>{ticket.name}</p>
          <p className="text-gray-400">{ticket.email}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-500">Category</p>
          <p>{ticket.category}</p>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> Original Message
        </h3>
        <p className="whitespace-pre-wrap">{ticket.message}</p>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col mb-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Conversation History
        </h3>
        <ScrollArea className="flex-1 border rounded-md p-4">
          {ticket.responses && ticket.responses.length > 0 ? (
            <div className="space-y-4">
              {ticket.responses.map((response, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg border shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-sm flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {typeof response.respondedBy === 'string' ? response.respondedBy : response.respondedBy?.name || 'Admin'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {format(new Date(response.respondedAt), 'PPpp')}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{response.responseMessage}</p>
                  {response.emailSent && (
                    <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Email sent
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">No responses yet.</p>
          )}
        </ScrollArea>
      </div>

      <div className="mt-auto pt-4 border-t">
        <h3 className="font-semibold mb-2">Reply</h3>
        <Textarea
          placeholder="Type your response here..."
          value={replyMessage}
          onChange={(e) => setReplyMessage(e.target.value)}
          className="mb-2 min-h-[100px]"
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSendReply}
            disabled={!replyMessage.trim() || replyMutation.isPending}
          >
            {replyMutation.isPending ? 'Sending...' : (
              <>
                <Send className="w-4 h-4 mr-2" /> Send Response
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
