
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  jobcode: z.string().min(1, { message: "Job code is required" }),
  jobdesc: z.string().min(1, { message: "Job description is required" }),
});

type FormValues = z.infer<typeof formSchema>;

interface AddJobFormProps {
  onJobAdded?: () => void;
}

const AddJobForm: React.FC<AddJobFormProps> = ({ onJobAdded }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobcode: "",
      jobdesc: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const { error } = await supabase.from("job").insert({
        jobcode: data.jobcode,
        jobdesc: data.jobdesc,
      });

      if (error) throw error;

      toast({
        title: "Job Position Added",
        description: "Job position has been successfully added",
      });

      form.reset();
      if (onJobAdded) onJobAdded();
      
    } catch (error: any) {
      console.error("Error adding job position:", error.message);
      toast({
        variant: "destructive",
        title: "Failed to add job position",
        description: error.message,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="jobcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Code*</FormLabel>
              <FormControl>
                <Input placeholder="Enter job code" {...field} />
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
              <FormLabel>Job Description*</FormLabel>
              <FormControl>
                <Input placeholder="Enter job description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Add Job Position
        </Button>
      </form>
    </Form>
  );
};

export default AddJobForm;
