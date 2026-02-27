"use client";

import { useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCreateCreditPack, useUpdateCreditPack } from "@/hooks/useCreditPack";
import { ICreditPack } from "@/types/credit-pack";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  credits: z.coerce
    .number()
    .int("Credits must be an integer")
    .positive("Credits must be positive"),
  priceInr: z.coerce.number().min(0, "Price must be non-negative"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be at most 500 characters"),
  flagText: z
    .string()
    .max(50, "Flag text must be at most 50 characters")
    .optional()
    .nullable()
    .transform((val) => val || null),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.coerce.number().int().optional().default(0),
});

type FormValues = z.output<typeof formSchema>;

interface PackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packToEdit?: ICreditPack | null;
}

export function PackDialog({ open, onOpenChange, packToEdit }: PackDialogProps) {
  const createPack = useCreateCreditPack();
  const updatePack = useUpdateCreditPack();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as never,
    defaultValues: {
      name: "",
      credits: 0,
      priceInr: 0,
      description: "",
      flagText: null,
      isActive: true,
      sortOrder: 0,
    },
  });

  useEffect(() => {
    if (packToEdit) {
      form.reset({
        name: packToEdit.name,
        credits: packToEdit.credits,
        priceInr: packToEdit.priceInr,
        description: packToEdit.description,
        flagText: packToEdit.flagText || null,
        isActive: packToEdit.isActive,
        sortOrder: packToEdit.sortOrder,
      });
    } else {
      form.reset({
        name: "",
        credits: 0,
        priceInr: 0,
        description: "",
        flagText: null,
        isActive: true,
        sortOrder: 0,
      });
    }
  }, [packToEdit, form, open]);

  const onSubmit = async (values: FormValues) => {
    console.log("Hello")
    console.log(packToEdit)
    try {
      if (packToEdit) {
        await updatePack.mutateAsync({
          packId: packToEdit.id,
          data: values,
        });
      } else {
        await createPack.mutateAsync(values);
      }
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  const isPending = createPack.isPending || updatePack.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {packToEdit ? "Edit Credit Pack" : "Create New Credit Pack"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Basic Pack" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="credits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credits</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 100"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priceInr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (INR)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 499"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the credit pack..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="flagText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flag Text (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Best Value"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Display badge like &quot;Most Popular&quot;
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormDescription>Lower = higher priority</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Only active packs are visible to brokers
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
                {packToEdit ? "Update Pack" : "Create Pack"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
