"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import type { Species } from "./species-types";

const POSTGRES_INTEGER_MAX = 2_147_483_647;

export const kingdoms = z.enum(["Animalia", "Plantae", "Fungi", "Protista", "Archaea", "Bacteria"]);

const optionalText = z.string().nullable().transform((value) => {
  if (value === null) return null;
  const trimmedValue = value.trim();
  return trimmedValue.length === 0 ? null : trimmedValue;
});

const optionalUrl = z
  .string()
  .nullable()
  .refine(
    (value) => value === null || value.trim().length === 0 || z.string().url().safeParse(value.trim()).success,
    "Enter a valid URL or leave this blank.",
  )
  .transform((value) => {
    if (value === null) return null;
    const trimmedValue = value.trim();
    return trimmedValue.length === 0 ? null : trimmedValue;
  });

export const speciesFormSchema = z.object({
  scientific_name: z.string().trim().min(1, "Scientific name is required."),
  common_name: optionalText,
  kingdom: kingdoms,
  total_population: z
    .number({ invalid_type_error: "Population must be a whole number." })
    .int("Population must be a whole number.")
    .min(0, "Population cannot be negative.")
    .max(POSTGRES_INTEGER_MAX, "Population is too large for the database.")
    .nullable(),
  image: optionalUrl,
  description: optionalText,
});

export type SpeciesFormValues = z.infer<typeof speciesFormSchema>;

export const emptySpeciesFormValues: SpeciesFormValues = {
  scientific_name: "",
  common_name: null,
  kingdom: "Animalia",
  total_population: null,
  image: null,
  description: null,
};

export function speciesToFormValues(species: Species): SpeciesFormValues {
  return {
    scientific_name: species.scientific_name,
    common_name: species.common_name,
    kingdom: species.kingdom,
    total_population: species.total_population,
    image: species.image,
    description: species.description,
  };
}

export function SpeciesFormFields({
  form,
  disabled = false,
}: {
  form: UseFormReturn<SpeciesFormValues>;
  disabled?: boolean;
}) {
  return (
    <div className="grid w-full items-center gap-5">
      <FormField
        control={form.control}
        name="scientific_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Scientific Name</FormLabel>
            <FormControl>
              <Input disabled={disabled} placeholder="Cavia porcellus" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="common_name"
        render={({ field }) => {
          const { value, ...rest } = field;
          return (
            <FormItem>
              <FormLabel>Common Name</FormLabel>
              <FormControl>
                <Input disabled={disabled} value={value ?? ""} placeholder="Guinea pig" {...rest} />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
      <FormField
        control={form.control}
        name="kingdom"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kingdom</FormLabel>
            <Select
              disabled={disabled}
              onValueChange={(value) => field.onChange(kingdoms.parse(value))}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a kingdom" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  {kingdoms.options.map((kingdom) => (
                    <SelectItem key={kingdom} value={kingdom}>
                      {kingdom}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="total_population"
        render={({ field }) => {
          const { value, ...rest } = field;
          return (
            <FormItem>
              <FormLabel>Total population</FormLabel>
              <FormControl>
                <Input
                  disabled={disabled}
                  type="number"
                  min={0}
                  max={POSTGRES_INTEGER_MAX}
                  step={1}
                  value={value ?? ""}
                  placeholder="300000"
                  {...rest}
                  onChange={(event) =>
                    field.onChange(event.target.value === "" ? null : event.target.valueAsNumber)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
      <FormField
        control={form.control}
        name="image"
        render={({ field }) => {
          const { value, ...rest } = field;
          return (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input disabled={disabled} value={value ?? ""} placeholder="https://example.com/species.jpg" {...rest} />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => {
          const { value, ...rest } = field;
          return (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  disabled={disabled}
                  value={value ?? ""}
                  placeholder="Describe this species."
                  className="min-h-28"
                  {...rest}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </div>
  );
}
