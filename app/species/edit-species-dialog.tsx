"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useRef, useState, type BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";
import {
  SpeciesFormFields,
  speciesFormSchema,
  speciesToFormValues,
  type SpeciesFormValues,
} from "./species-form";
import type { Species } from "./species-types";

export default function EditSpeciesDialog({ species, userId }: { species: Species; userId: string }) {
  const router = useRouter();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [open, setOpen] = useState(false);
  const form = useForm<SpeciesFormValues>({
    resolver: zodResolver(speciesFormSchema),
    defaultValues: speciesToFormValues(species),
    mode: "onChange",
  });
  const isSaving = form.formState.isSubmitting;

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSaving) return;
    form.reset(speciesToFormValues(species));
    setOpen(nextOpen);
  };

  const onSubmit = async (values: SpeciesFormValues) => {
    form.clearErrors("root");

    const supabase = createBrowserSupabaseClient();
    const { data: updatedSpecies, error } = await supabase
      .from("species")
      .update({
        scientific_name: values.scientific_name,
        common_name: values.common_name,
        kingdom: values.kingdom,
        total_population: values.total_population,
        description: values.description,
        image: values.image,
      })
      .eq("id", species.id)
      .eq("author", userId)
      .select("id")
      .maybeSingle();

    if (error !== null || updatedSpecies === null) {
      const message =
        error?.code === "23505"
          ? "Another species already uses that scientific name. Choose a unique name."
          : error?.message ?? "No species was updated. Check that you still own this record and try again.";

      form.setError("root", { message });
      return toast({
        title: "Unable to save species",
        description: message,
        variant: "destructive",
      });
    }

    form.reset(values);
    setOpen(false);
    router.refresh();

    return toast({
      title: "Species updated",
      description: `Saved changes to ${values.scientific_name}.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="secondary">
          Edit species
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-h-[88vh] w-[calc(100%-2rem)] overflow-y-auto rounded-xl bg-card sm:max-w-[640px]"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          titleRef.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle ref={titleRef} tabIndex={-1}>
            Edit species
          </DialogTitle>
          <DialogDescription>Update the information below, then save your changes.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={(event: BaseSyntheticEvent) => void form.handleSubmit(onSubmit)(event)}>
            <SpeciesFormFields form={form} disabled={isSaving} />
            {form.formState.errors.root?.message && (
              <p className="mt-4 text-sm font-medium text-destructive" role="alert">
                {form.formState.errors.root.message}
              </p>
            )}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" disabled={isSaving} onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
