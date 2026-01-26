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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useUpdateCreditsPrice } from "@/hooks/useTierConfig";
import { CreditsPriceConfig } from "@/types/tier-config";

const formSchema = z.object({
  REQUEST_CONTACT: z.coerce
    .number()
    .int("Must be an integer")
    .min(0, "Must be non-negative"),
  MARK_PROPERTY_AS_FEATURED: z.coerce
    .number()
    .int("Must be an integer")
    .min(0, "Must be non-negative"),
  MARK_ENQUIRY_AS_URGENT: z.coerce
    .number()
    .int("Must be an integer")
    .min(0, "Must be non-negative"),
  PROPERTY_LISTING: z.coerce
    .number()
    .int("Must be an integer")
    .min(0, "Must be non-negative"),
  ENQUIRY_LISTING: z.coerce
    .number()
    .int("Must be an integer")
    .min(0, "Must be non-negative"),
  SUBMIT_PROPERTY_ENQUIRY: z.coerce
    .number()
    .int("Must be an integer")
    .min(0, "Must be non-negative"),
});

interface CreditsPriceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPrices: CreditsPriceConfig;
}

const fieldLabels: Record<keyof CreditsPriceConfig, string> = {
  REQUEST_CONTACT: "Request Contact",
  MARK_PROPERTY_AS_FEATURED: "Feature Property",
  MARK_ENQUIRY_AS_URGENT: "Urgent Enquiry",
  PROPERTY_LISTING: "Property Listing",
  ENQUIRY_LISTING: "Enquiry Listing",
  SUBMIT_PROPERTY_ENQUIRY: "Submit Enquiry",
};

export function CreditsPriceDialog({
  open,
  onOpenChange,
  currentPrices,
}: CreditsPriceDialogProps) {
  const updateCreditsPrice = useUpdateCreditsPrice();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      REQUEST_CONTACT: 0,
      MARK_PROPERTY_AS_FEATURED: 0,
      MARK_ENQUIRY_AS_URGENT: 0,
      PROPERTY_LISTING: 0,
      ENQUIRY_LISTING: 0,
      SUBMIT_PROPERTY_ENQUIRY: 0,
    },
  });

  useEffect(() => {
    if (currentPrices) {
      form.reset(currentPrices);
    }
  }, [currentPrices, form, open]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateCreditsPrice.mutateAsync({
        credits: values,
      });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Credit Prices</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(fieldLabels) as Array<keyof CreditsPriceConfig>).map(
                (fieldName) => (
                  <FormField
                    key={fieldName}
                    control={form.control}
                    name={fieldName}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{fieldLabels[fieldName]}</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateCreditsPrice.isPending}>
                {updateCreditsPrice.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
