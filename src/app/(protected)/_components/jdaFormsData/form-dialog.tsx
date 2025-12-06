"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  useCreateForm,
  useUpdateForm,
  Form as IForm,
} from "@/hooks/useJDAForms";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import {
  uploadFileToFirebase,
  generateFilePath,
  convertImageToWebP,
} from "@/lib/firebase-utils";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["draft", "published"]),
  notifyBrokers: z.boolean().default(false),
});

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formToEdit?: IForm | null;
}

export function FormDialog({
  open,
  onOpenChange,
  formToEdit,
}: FormDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const createForm = useCreateForm();
  const updateForm = useUpdateForm();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "draft",
      notifyBrokers: false,
    },
  });

  useEffect(() => {
    if (formToEdit) {
      form.reset({
        title: formToEdit.title,
        description: formToEdit.description || "",
        status:
          formToEdit.status === "deleted"
            ? "draft"
            : (formToEdit.status as "draft" | "published"),
        notifyBrokers: false,
      });
      setFile(null);
    } else {
      form.reset({
        title: "",
        description: "",
        status: "draft",
        notifyBrokers: false,
      });
      setFile(null);
    }
  }, [formToEdit, form, open]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      let fileData = {
        fileUrl: formToEdit?.fileUrl,
        fileName: formToEdit?.fileName,
        fileType: formToEdit?.fileType,
        fileSize: formToEdit?.fileSize,
      };

      if (file) {
        setIsUploading(true);

        // Optimize/Convert file if needed
        const fileToUpload = await convertImageToWebP(file);

        // Generate path
        const path = generateFilePath(fileToUpload.name, "jda-forms");

        // Upload to Firebase
        const downloadURL = await uploadFileToFirebase(fileToUpload, path);

        fileData = {
          fileUrl: downloadURL,
          fileName: fileToUpload.name,
          fileType: fileToUpload.type as
            | "application/pdf"
            | "image/png"
            | "image/jpeg"
            | undefined,
          fileSize: fileToUpload.size,
        };
        setIsUploading(false);
      } else if (!formToEdit) {
        toast.error("Please select a file");
        return;
      }

      if (formToEdit) {
        await updateForm.mutateAsync({
          id: formToEdit._id,
          data: {
            ...values,
            ...(file ? fileData : {}),
            fileUrl: fileData.fileUrl!,
            fileName: fileData.fileName!,
            fileType: fileData.fileType!,
          },
        });
      } else {
        await createForm.mutateAsync({
          ...values,
          fileUrl: fileData.fileUrl!,
          fileName: fileData.fileName!,
          fileType: fileData.fileType!,
          fileSize: fileData.fileSize,
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to submit form");
      setIsUploading(false);
    }
  };

  const isPending = createForm.isPending || updateForm.isPending || isUploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {formToEdit ? "Edit JDA Form" : "Create New JDA Form"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Form title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>File</Label>
              <div className="flex items-center gap-2">
                {file ? (
                  <div className="flex items-center gap-2 p-2 border rounded-md flex-1">
                    <span className="text-sm truncate flex-1">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept=".pdf,image/png,image/jpeg,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setFile(file);
                      }}
                    />
                  </div>
                )}
              </div>
              {formToEdit && !file && (
                <p className="text-xs text-muted-foreground mt-1">
                  Current file: {formToEdit.fileName}
                </p>
              )}
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notifyBrokers"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Notify Brokers</FormLabel>
                    <FormDescription>
                      Send a notification to all brokers about this update
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {formToEdit ? "Update Form" : "Create Form"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
