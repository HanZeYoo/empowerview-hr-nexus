
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
  deptcode: z.string().min(1, "Department code is required"),
  deptname: z.string().min(1, "Department name is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface EditDepartmentFormProps {
  department: { deptcode: string; deptname: string | null };
  onDepartmentUpdated: () => void;
  onCancel: () => void;
}

export default function EditDepartmentForm({
  department,
  onDepartmentUpdated,
  onCancel,
}: EditDepartmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deptcode: department.deptcode,
      deptname: department.deptname || "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("department")
        .update({
          deptname: values.deptname,
        })
        .eq("deptcode", department.deptcode);

      if (error) throw error;

      toast({
        title: "Department updated",
        description: "The department has been updated successfully.",
      });
      
      onDepartmentUpdated();
    } catch (error: any) {
      console.error("Error updating department:", error.message);
      toast({
        variant: "destructive",
        title: "Failed to update department",
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
          name="deptcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department Code</FormLabel>
              <FormControl>
                <Input {...field} disabled className="bg-muted" />
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
              <FormLabel>Department Name</FormLabel>
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
            {isSubmitting ? "Updating..." : "Update Department"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
