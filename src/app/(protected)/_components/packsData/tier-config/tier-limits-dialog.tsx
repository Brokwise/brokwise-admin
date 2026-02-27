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
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useUpdateTierLimits, useUpdateActivationLimits } from "@/hooks/useTierConfig";
import { TIER, TierLimitsConfig } from "@/types/tier-config";
import type { LimitType } from "./tier-limits-card";

const formSchema = z.object({
  PROPERTY_LISTING: z
    .number()
    .int("Must be an integer")
    .min(0, "Must be non-negative"),
  ENQUIRY_LISTING: z
    .number()
    .int("Must be an integer")
    .min(0, "Must be non-negative"),
  SUBMIT_PROPERTY_ENQUIRY: z
    .number()
    .int("Must be an integer")
    .min(0, "Must be non-negative"),
});

type FormValues = z.infer<typeof formSchema>;

interface TierLimitsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tier: TIER | null;
  currentLimits: TierLimitsConfig | null;
  limitType: LimitType;
  isCreating?: boolean;
}

const tierColors: Record<TIER, string> = {
  [TIER.BASIC]: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100",
  [TIER.ESSENTIAL]: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
  [TIER.PRO]: "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100",
};

const limitTypeLabels: Record<LimitType, string> = {
  regular: "Tier Limits",
  activation: "Activation Limits",
};

const descriptions: Record<LimitType, Record<keyof TierLimitsConfig, string>> = {
  regular: {
    PROPERTY_LISTING: "Free property listings allowed per month",
    ENQUIRY_LISTING: "Free enquiry listings allowed per month",
    SUBMIT_PROPERTY_ENQUIRY: "Free property enquiry submissions allowed per month",
  },
  activation: {
    PROPERTY_LISTING: "Property listings included in activation pack",
    ENQUIRY_LISTING: "Enquiry listings included in activation pack",
    SUBMIT_PROPERTY_ENQUIRY: "Property enquiry submissions included in activation pack",
  },
};

export function TierLimitsDialog({
  open,
  onOpenChange,
  tier,
  currentLimits,
  limitType,
  isCreating = false,
}: TierLimitsDialogProps) {
  const updateTierLimits = useUpdateTierLimits();
  const updateActivationLimits = useUpdateActivationLimits();

  const mutation = limitType === "regular" ? updateTierLimits : updateActivationLimits;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      PROPERTY_LISTING: 0,
      ENQUIRY_LISTING: 0,
      SUBMIT_PROPERTY_ENQUIRY: 0,
    },
  });

  useEffect(() => {
    if (currentLimits) {
      form.reset({
        PROPERTY_LISTING: currentLimits.PROPERTY_LISTING,
        ENQUIRY_LISTING: currentLimits.ENQUIRY_LISTING,
        SUBMIT_PROPERTY_ENQUIRY: currentLimits.SUBMIT_PROPERTY_ENQUIRY,
      });
    } else {
      form.reset({
        PROPERTY_LISTING: 0,
        ENQUIRY_LISTING: 0,
        SUBMIT_PROPERTY_ENQUIRY: 0,
      });
    }
  }, [currentLimits, form, open]);

  const onSubmit = async (values: FormValues) => {
    if (!tier) return;

    try {
      await mutation.mutateAsync({
        tier,
        limits: values,
      });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (!tier) return null;

  const actionLabel = isCreating && !currentLimits ? "Create" : "Save Changes";
  const titlePrefix = isCreating && !currentLimits ? "Configure" : "Edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {titlePrefix} {limitTypeLabels[limitType]} for
            <Badge className={tierColors[tier]}>{tier}</Badge>
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="PROPERTY_LISTING"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Listings</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    {descriptions[limitType].PROPERTY_LISTING}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ENQUIRY_LISTING"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enquiry Listings</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    {descriptions[limitType].ENQUIRY_LISTING}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="SUBMIT_PROPERTY_ENQUIRY"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Submit Property Enquiries</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    {descriptions[limitType].SUBMIT_PROPERTY_ENQUIRY}
                  </FormDescription>
                  <FormMessage />
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
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {actionLabel}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
