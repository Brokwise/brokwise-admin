"use client";

import React, { useState, useEffect } from "react";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";

import { useCreateEnquiry } from "@/hooks/useEnquiry";
import { PropertyCategory, PropertyType } from "@/types/properties";
import { CreateEnquiryDTO } from "@/types/enquiry";

// --- Zod Schema ---

const budgetRangeSchema = z
  .object({
    min: z.number().min(0, "Minimum budget cannot be negative"),
    max: z.number().min(0, "Maximum budget cannot be negative"),
  })
  .refine((data) => data.max >= data.min, {
    message: "Max budget must be greater than or equal to min budget",
    path: ["max"],
  });

const sizeRangeSchema = z
  .object({
    min: z.number().min(0),
    max: z.number().min(0),
    unit: z.enum([
      "SQ_FT",
      "SQ_METER",
      "SQ_YARDS",
      "ACRES",
      "HECTARE",
      "BIGHA",
    ] as [string, ...string[]]),
  })
  .refine((data) => data.max >= data.min, {
    message: "Max size must be greater than or equal to min size",
    path: ["max"],
  });

const rentalIncomeRangeSchema = z
  .object({
    min: z.number().min(0),
    max: z.number().min(0),
  })
  .refine((data) => data.max >= data.min, {
    message: "Max income must be greater than or equal to min income",
    path: ["max"],
  });

const createEnquirySchema = z.object({
  address: z.string().min(3, "Address is required"),
  addressPlaceId: z
    .string()
    .min(1, "Please select an address from suggestions"),
  enquiryCategory: z.enum([
    "RESIDENTIAL",
    "COMMERCIAL",
    "INDUSTRIAL",
    "AGRICULTURAL",
    "RESORT",
    "FARM_HOUSE",
  ] as [string, ...string[]]),
  enquiryType: z.string().min(1, "Property Type is required"), // Narrowed down in UI based on Category
  budget: budgetRangeSchema,
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description cannot exceed 2000 characters"),

  // Optional Fields
  size: sizeRangeSchema.optional(),
  plotType: z.enum(["ROAD", "CORNER"] as [string, ...string[]]).optional(),
  facing: z
    .enum([
      "NORTH",
      "SOUTH",
      "EAST",
      "WEST",
      "NORTH_EAST",
      "NORTH_WEST",
      "SOUTH_EAST",
      "SOUTH_WEST",
    ] as [string, ...string[]])
    .optional(),
  frontRoadWidth: z.coerce.number().min(1).max(500).optional(),

  // Residential - Flat
  bhk: z.coerce.number().int().min(1).max(20).optional(),
  washrooms: z.coerce.number().int().min(1).max(20).optional(),
  preferredFloor: z.string().max(20).optional(),
  society: z.string().max(100).optional(),

  // Commercial - Hotel/Hostel
  rooms: z.coerce.number().int().min(1).max(1000).optional(),
  beds: z.coerce.number().int().min(1).max(5000).optional(),
  rentalIncome: rentalIncomeRangeSchema.optional(),

  // Industrial
  purpose: z.string().max(200).optional(),
  areaType: z
    .enum(["NEAR_RING_ROAD", "RIICO_AREA", "SEZ"] as [string, ...string[]])
    .optional(),
});

type CreateEnquiryFormValues = z.infer<typeof createEnquirySchema>;

// --- Constants ---

const CATEGORY_TYPE_MAP: Record<PropertyCategory, PropertyType[]> = {
  RESIDENTIAL: ["FLAT", "VILLA", "LAND"],
  COMMERCIAL: [
    "SHOWROOM",
    "HOTEL",
    "HOSTEL",
    "SHOP",
    "OFFICE_SPACE",
    "OTHER_SPACE",
  ],
  INDUSTRIAL: [
    "INDUSTRIAL_PARK",
    "INDUSTRIAL_LAND",
    "WAREHOUSE",
    "AGRICULTURAL_LAND",
  ],
  AGRICULTURAL: ["AGRICULTURAL_LAND"], // Assuming Agricultural maps to this type
  RESORT: ["RESORT"],
  FARM_HOUSE: ["FARM_HOUSE", "INDIVIDUAL"],
};

export const CreateEnquiry = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { mutate: createEnquiry, isPending } = useCreateEnquiry();

  const form = useForm<CreateEnquiryFormValues>({
    resolver: zodResolver(
      createEnquirySchema
    ) as Resolver<CreateEnquiryFormValues>,
    defaultValues: {
      address: "",
      addressPlaceId: "",
      budget: { min: 0, max: 0 },
      description: "",
    },
  });

  const { watch, setValue, control } = form;
  const selectedCategory = watch("enquiryCategory");
  const selectedType = watch("enquiryType");
  const addressLabel = watch("address");

  // Reset type when category changes
  useEffect(() => {
    setValue("enquiryType", "" as PropertyType);
  }, [selectedCategory, setValue]);

  const onSubmit = (data: CreateEnquiryFormValues) => {
    const { addressPlaceId, ...payload } = data;
    createEnquiry(payload as CreateEnquiryDTO, {
      onSuccess: () => {
        toast.success("Enquiry created successfully!");
        queryClient.invalidateQueries({ queryKey: ["enquiries"] });
        setOpen(false);
        form.reset();
      },
    });
  };

  const availableTypes = selectedCategory
    ? CATEGORY_TYPE_MAP[selectedCategory as PropertyCategory] || []
    : [];

  // --- Render Helpers ---

  const renderSizeFields = () => (
    <div className="space-y-4 border p-4 rounded-md">
      <h3 className="font-medium">Size Requirement</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={control}
          name="size.min"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Min Size</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="size.max"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Size</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="size.unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {[
                    "SQ_FT",
                    "SQ_METER",
                    "SQ_YARDS",
                    "ACRES",
                    "HECTARE",
                    "BIGHA",
                  ].map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Enquiry
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Create New Enquiry</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 px-6 py-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 pb-8"
            >
              {/* --- Location --- */}
              <div className="space-y-4">
                <FormField
                  control={control}
                  name="addressPlaceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Address <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <AddressAutocomplete
                          valueLabel={addressLabel}
                          valueId={field.value}
                          disabled={isPending}
                          onSelect={(item) => {
                            setValue("address", item.place_name, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                            field.onChange(item.id);
                          }}
                          onClear={() => {
                            setValue("address", "", {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                            field.onChange("");
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* --- Category & Type --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="enquiryCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Category <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.keys(CATEGORY_TYPE_MAP).map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="enquiryType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Property Type <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!selectedCategory}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* --- Budget --- */}
              <div className="space-y-4 border p-4 rounded-md">
                <h3 className="font-medium">Budget Range</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="budget.min"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Budget</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="budget.max"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Budget</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* --- Conditional Fields --- */}

              {/* Size: For Land, Villa, Warehouse, Commercial, Industrial */}
              {([
                "LAND",
                "VILLA",
                "WAREHOUSE",
                "INDUSTRIAL_LAND",
                "AGRICULTURAL_LAND",
                "SHOWROOM",
                "OFFICE_SPACE",
                "OTHER_SPACE",
                "SHOP",
              ].includes(selectedType) ||
                selectedCategory === "COMMERCIAL" ||
                selectedCategory === "INDUSTRIAL") &&
                renderSizeFields()}

              {/* Flat Specifics */}
              {selectedType === "FLAT" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="bhk"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>BHK</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="washrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Washrooms</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="society"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Society</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="preferredFloor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Floor</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Land / Villa Specifics */}
              {(selectedType === "LAND" ||
                selectedType === "VILLA" ||
                selectedType === "INDUSTRIAL_LAND" ||
                selectedType === "AGRICULTURAL_LAND") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="plotType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plot Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Plot Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ROAD">Road</SelectItem>
                            <SelectItem value="CORNER">Corner</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="facing"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facing</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Facing" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[
                              "NORTH",
                              "SOUTH",
                              "EAST",
                              "WEST",
                              "NORTH_EAST",
                              "NORTH_WEST",
                              "SOUTH_EAST",
                              "SOUTH_WEST",
                            ].map((f) => (
                              <SelectItem key={f} value={f}>
                                {f.replace("_", " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="frontRoadWidth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Front Road Width (ft)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Commercial (Hotel/Hostel) */}
              {(selectedType === "HOTEL" || selectedType === "HOSTEL") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="rooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rooms</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {selectedType === "HOSTEL" && (
                    <FormField
                      control={control}
                      name="beds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Beds</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}

              {/* Industrial */}
              {selectedCategory === "INDUSTRIAL" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purpose</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. Manufacturing, Warehousing"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="areaType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Area Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Area Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NEAR_RING_ROAD">
                              Near Ring Road
                            </SelectItem>
                            <SelectItem value="RIICO_AREA">
                              RIICO Area
                            </SelectItem>
                            <SelectItem value="SEZ">SEZ</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* --- Description --- */}
              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Description <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your requirements in detail..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Enquiry
              </Button>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
