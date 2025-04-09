
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
  deptcode: z.string().min(1, { message: "Department code is required" }),
  deptname: z.string().min(1, { message: "Department name is required" }),
});

type FormValues = z.infer<typeof formSchema>;

interface AddDepartmentFormProps {
  onDepartmentAdded?: () => void;
}

const AddDepartmentForm: React.FC<AddDepartmentFormProps> = ({ onDepartmentAdded }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deptcode: "",
      deptname: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const { error } = await supabase.from("department").insert({
        deptcode: data.deptcode,
        deptname: data.deptname,
      });

      if (error) throw error;

      toast({
        title: "Department Added",
        description: "Department has been successfully added",
      });

      form.reset();
      if (onDepartmentAdded) onDepartmentAdded();
      
    } catch (error: any) {
      console.error("Error adding department:", error.message);
      toast({
        variant: "destructive",
        title: "Failed to add department",
        description: error.message,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="deptcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department Code*</FormLabel>
              <FormControl>
                <Input placeholder="Enter department code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deptname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department Name*</FormLabel>
              <FormControl>
                <Input placeholder="Enter department name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Add Department
        </Button>
      </form>
    </Form>
  );
};

export default AddDepartmentForm;
