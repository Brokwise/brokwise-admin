"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form, FormStatus } from "@/hooks/useJDAForms";
import { format } from "date-fns";

const getStatusBadge = (status: FormStatus) => {
  const variants: Record<
    FormStatus,
    {
      variant: "default" | "secondary" | "destructive" | "outline";
      label: string;
    }
  > = {
    draft: { variant: "secondary", label: "Draft" },
    published: { variant: "default", label: "Published" },
    deleted: { variant: "destructive", label: "Deleted" },
  };

  const config = variants[status] || { variant: "outline", label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

interface ActionsCellProps {
  form: Form;
  onEdit: (form: Form) => void;
  onDelete: (form: Form) => void;
}

const ActionsCell = ({ form, onEdit, onDelete }: ActionsCellProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onEdit(form)}>
          Edit Form
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.open(form.fileUrl, "_blank")}>
          View File
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => onDelete(form)}
        >
          Delete Form
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const createColumns = (
  onEdit: (form: Form) => void,
  onDelete: (form: Form) => void
): ColumnDef<Form>[] => [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.getValue("title")}</span>
        {row.original.description && (
          <span className="text-xs text-muted-foreground truncate max-w-[300px]">
            {row.original.description}
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "version",
    header: "Version",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        v{row.getValue("version")}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => getStatusBadge(row.getValue("status")),
  },
  {
    accessorKey: "fileInfo",
    header: "File",
    cell: ({ row }) => {
      const { fileName } = row.original;
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span className="truncate max-w-[200px]" title={fileName}>
            {fileName}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Last Updated",
    cell: ({ row }) => {
      return (
        <span className="text-sm text-muted-foreground">
          {format(new Date(row.getValue("updatedAt")), "MMM d, yyyy")}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActionsCell form={row.original} onEdit={onEdit} onDelete={onDelete} />
    ),
  },
];
