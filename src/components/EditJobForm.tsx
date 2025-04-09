
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
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

const formSchema = z.object({
  jobcode: z.string().min(1, "Job code is required"),
  jobdesc: z.string().min(1, "Job description is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface EditJobFormProps {
  job: { jobcode: string; jobdesc: string | null };
  onJobUpdated: () => void;
  onCancel: () => void;
}

export default function EditJobForm({
  job,
  onJobUpdated,
  onCancel,
}: EditJobFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobcode: job.jobcode,
      jobdesc: job.jobdesc || "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("job")
        .update({
          jobdesc: values.jobdesc,
        })
        .eq("jobcode", job.jobcode);

      if (error) throw error;

      toast({
        title: "Job updated",
        description: "The job position has been updated successfully.",
      });
      
      onJobUpdated();
    } catch (error: any) {
      console.error("Error updating job:", error.message);
      toast({
        variant: "destructive",
        title: "Failed to update job",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="jobcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Code</FormLabel>
              <FormControl>
                <Input {...field} disabled className="bg-muted" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="jobdesc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Description</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Job"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
