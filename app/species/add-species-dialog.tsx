"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
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
import { useState, type BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";
import { SpeciesFormFields, emptySpeciesFormValues, speciesFormSchema, type SpeciesFormValues } from "./species-form";
import WikipediaLookup from "./wikipedia-lookup";

export default function AddSpeciesDialog({ userId }: { userId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const form = useForm<SpeciesFormValues>({
    resolver: zodResolver(speciesFormSchema),
    defaultValues: emptySpeciesFormValues,
    mode: "onChange",
  });
  const isAdding = form.formState.isSubmitting;

  const handleOpenChange = (nextOpen: boolean) => {
    if (isAdding) return;
    if (!nextOpen) form.reset(emptySpeciesFormValues);
    setOpen(nextOpen);
  };

  const onSubmit = async (values: SpeciesFormValues) => {
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.from("species").insert([
      {
        author: userId,
        scientific_name: values.scientific_name,
        common_name: values.common_name,
        kingdom: values.kingdom,
        total_population: values.total_population,
        image: values.image,
        description: values.description,
      },
    ]);

    if (error) {
      return toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
      });
    }

    form.reset(emptySpeciesFormValues);
    setOpen(false);
    router.refresh();

    return toast({
      title: "New species added!",
      description: `Successfully added ${values.scientific_name}.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Icons.add className="mr-2 h-4 w-4" />
          Add species
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[88vh] w-[calc(100%-2rem)] overflow-y-auto rounded-xl bg-card sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Add a species</DialogTitle>
          <DialogDescription>Enter the record manually or begin with a Wikipedia article.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={(event: BaseSyntheticEvent) => void form.handleSubmit(onSubmit)(event)}>
            <WikipediaLookup form={form} disabled={isAdding} />
            <SpeciesFormFields form={form} disabled={isAdding} />
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={isAdding}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isAdding}>
                {isAdding ? "Adding…" : "Add species"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
