"use client";
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SupportService } from '@/services/support.service';
import { SupportTicket, SupportTicketFilters } from '@/interfaces/support.interface';
import TicketDetails from './_components/TicketDetails';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { format } from 'date-fns';
import { Search, Filter, RefreshCw } from 'lucide-react';

const SupportPage = () => {
    const [filters, setFilters] = useState<SupportTicketFilters>({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        includeStats: true,
    });

    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['support-tickets', filters],
        queryFn: () => SupportService.getTickets(filters),
    });

    const handleFilterChange = (key: keyof SupportTicketFilters, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    };

    const handlePageChange = (newPage: number) => {
        setFilters((prev) => ({ ...prev, page: newPage }));
    };

    const openTicketDetails = (ticket: SupportTicket) => {
        setSelectedTicket(ticket);
        setIsSheetOpen(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Open': return 'bg-blue-500 hover:bg-blue-600';
            case 'In Progress': return 'bg-yellow-500 hover:bg-yellow-600';
            case 'Resolved': return 'bg-green-500 hover:bg-green-600';
            case 'Closed': return 'bg-gray-500 hover:bg-gray-600';
            default: return 'bg-gray-500 hover:bg-gray-600';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Low': return 'bg-green-500 hover:bg-green-600';
            case 'Medium': return 'bg-blue-500 hover:bg-blue-600';
            case 'High': return 'bg-orange-500 hover:bg-orange-600';
            case 'Urgent': return 'bg-red-500 hover:bg-red-600';
            default: return 'bg-gray-500 hover:bg-gray-600';
        }
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Support Tickets</h1>
                <Button variant="outline" size="icon" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            {/* Stats Cards */}
            {data?.stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border">
                        <h3 className="text-sm font-medium text-gray-500">Total Tickets</h3>
                        <p className="text-2xl font-bold">{data.stats.total}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border">
                        <h3 className="text-sm font-medium text-gray-500">Open Tickets</h3>
                        <p className="text-2xl font-bold text-blue-600">{data.stats.open}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border">
                        <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
                        <p className="text-2xl font-bold text-yellow-600">{data.stats.inProgress}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border">
                        <h3 className="text-sm font-medium text-gray-500">Resolved</h3>
                        <p className="text-2xl font-bold text-green-600">{data.stats.resolved}</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search tickets..."
                        className="pl-8"
                        value={filters.search || ''}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                </div>

                <Select
                    value={filters.category || 'all'}
                    onValueChange={(val) => handleFilterChange('category', val === 'all' ? undefined : val)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Technical Support">Technical Support</SelectItem>
                        <SelectItem value="Account Issues">Account Issues</SelectItem>
                        <SelectItem value="Billing Support">Billing Support</SelectItem>
                        <SelectItem value="Feature Request">Feature Request</SelectItem>
                        <SelectItem value="Bug Report">Bug Report</SelectItem>
                        <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                        <SelectItem value="Partnership">Partnership</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={filters.status || 'all'}
                    onValueChange={(val) => handleFilterChange('status', val === 'all' ? undefined : val)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={filters.priority || 'all'}
                    onValueChange={(val) => handleFilterChange('priority', val === 'all' ? undefined : val)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Tickets Table */}
            <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ticket ID</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10">
                                    Loading tickets...
                                </TableCell>
                            </TableRow>
                        ) : isError ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10 text-red-500">
                                    Error loading tickets. Please try again.
                                </TableCell>
                            </TableRow>
                        ) : data?.tickets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                                    No tickets found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.tickets.map((ticket) => (
                                <TableRow key={ticket._id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => openTicketDetails(ticket)}>
                                    <TableCell className="font-medium">{ticket.ticketId}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{ticket.name}</span>
                                            <span className="text-xs text-gray-500">{ticket.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{ticket.category}</TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                                    </TableCell>
                                    <TableCell>{format(new Date(ticket.createdAt), 'MMM d, yyyy')}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={(e) => {
                                            e.stopPropagation();
                                            openTicketDetails(ticket);
                                        }}>
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (data.pagination.hasPrev) handlePageChange(data.pagination.currentPage - 1);
                                }}
                                className={!data.pagination.hasPrev ? 'pointer-events-none opacity-50' : ''}
                            />
                        </PaginationItem>

                        {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    href="#"
                                    isActive={page === data.pagination.currentPage}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(page);
                                    }}
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        ))}

                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (data.pagination.hasNext) handlePageChange(data.pagination.currentPage + 1);
                                }}
                                className={!data.pagination.hasNext ? 'pointer-events-none opacity-50' : ''}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}

            {/* Ticket Details Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Ticket Details</SheetTitle>
                    </SheetHeader>
                    {selectedTicket && (
                        <div className="mt-6 h-full pb-10">
                            <TicketDetails ticket={selectedTicket} onClose={() => setIsSheetOpen(false)} />
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default SupportPage;
