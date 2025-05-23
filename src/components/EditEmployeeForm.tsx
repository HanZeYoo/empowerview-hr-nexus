
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import JobHistorySection from "./JobHistorySection";

const formSchema = z.object({
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  gender: z.enum(["M", "F", "O"]).optional(),
  birthdate: z.date().optional(),
  hiredate: z.date(),
  sepdate: z.date().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface Employee {
  empno: string;
  lastname: string | null;
  firstname: string | null;
  birthdate: string | null;
  gender: string | null;
  hiredate: string | null;
  sepdate: string | null;
}

interface JobHistory {
  id?: string;
  jobcode: string;
  deptcode: string;
  effdate: Date;
  salary: number | null;
}

interface EditEmployeeFormProps {
  employee: Employee;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EditEmployeeForm: React.FC<EditEmployeeFormProps> = ({ 
  employee, 
  onSuccess, 
  onCancel 
}) => {
  const [isJobHistoryDialogOpen, setIsJobHistoryDialogOpen] = useState(false);
  const [jobHistories, setJobHistories] = useState<JobHistory[]>([]);
  const [isLoadingJobHistories, setIsLoadingJobHistories] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: employee.firstname || "",
      lastname: employee.lastname || "",
      gender: (employee.gender as "M" | "F" | "O") || undefined,
      birthdate: employee.birthdate ? parseISO(employee.birthdate) : undefined,
      hiredate: employee.hiredate ? parseISO(employee.hiredate) : new Date(),
      sepdate: employee.sepdate ? parseISO(employee.sepdate) : null,
    },
  });

  useEffect(() => {
    // Update form when employee changes
    form.reset({
      firstname: employee.firstname || "",
      lastname: employee.lastname || "",
      gender: (employee.gender as "M" | "F" | "O") || undefined,
      birthdate: employee.birthdate ? parseISO(employee.birthdate) : undefined,
      hiredate: employee.hiredate ? parseISO(employee.hiredate) : new Date(),
      sepdate: employee.sepdate ? parseISO(employee.sepdate) : null,
    });

    // Fetch job histories for this employee
    fetchJobHistories();
  }, [employee, form]);

  const fetchJobHistories = async () => {
    setIsLoadingJobHistories(true);
    try {
      const { data, error } = await supabase
        .from("jobhistory")
        .select("*")
        .eq("empno", employee.empno)
        .order("effdate", { ascending: false });

      if (error) throw error;

      // Convert to the expected format
      const formattedJobHistories = data.map(job => ({
        id: `${job.empno}-${job.jobcode}-${job.effdate}`,
        jobcode: job.jobcode,
        deptcode: job.deptcode || "",
        effdate: new Date(job.effdate),
        salary: job.salary
      }));

      setJobHistories(formattedJobHistories);
    } catch (error: any) {
      console.error("Error fetching job histories:", error.message);
      toast({
        variant: "destructive",
        title: "Failed to load job histories",
        description: error.message,
      });
    } finally {
      setIsLoadingJobHistories(false);
    }
  };

  const handleJobHistoriesChange = (updatedJobHistories: JobHistory[]) => {
    setJobHistories(updatedJobHistories);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const updatedEmployee = {
        firstname: data.firstname || null,
        lastname: data.lastname || null,
        gender: data.gender || null,
        birthdate: data.birthdate ? format(data.birthdate, "yyyy-MM-dd") : null,
        hiredate: data.hiredate ? format(data.hiredate, "yyyy-MM-dd") : null,
        sepdate: data.sepdate ? format(data.sepdate, "yyyy-MM-dd") : null,
      };

      const { error } = await supabase
        .from("employee")
        .update(updatedEmployee)
        .eq("empno", employee.empno);

      if (error) throw error;

      toast({
        title: "Employee Updated",
        description: "Employee information has been successfully updated",
      });

      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error("Error updating employee:", error.message);
      toast({
        variant: "destructive",
        title: "Failed to update employee",
        description: error.message,
      });
    }
  };

  const handleManageJobHistory = async () => {
    setIsJobHistoryDialogOpen(true);
  };
  
  const handleSaveJobHistories = async () => {
    try {
      // First, delete all existing job histories for this employee
      const { error: deleteError } = await supabase
        .from("jobhistory")
        .delete()
        .eq("empno", employee.empno);
      
      if (deleteError) throw deleteError;
      
      // Then insert all current job histories
      if (jobHistories.length > 0) {
        const jobHistoryRecords = jobHistories.map(history => ({
          empno: employee.empno,
          jobcode: history.jobcode,
          deptcode: history.deptcode,
          effdate: format(new Date(history.effdate), "yyyy-MM-dd"),
          salary: history.salary
        }));

        const { error: insertError } = await supabase
          .from("jobhistory")
          .insert(jobHistoryRecords);

        if (insertError) throw insertError;
      }
      
      setIsJobHistoryDialogOpen(false);
      toast({
        title: "Job Histories Updated",
        description: "Job history information has been successfully updated",
      });
    } catch (error: any) {
      console.error("Error updating job histories:", error.message);
      toast({
        variant: "destructive",
        title: "Failed to update job histories",
        description: error.message,
      });
    }
  };

  const employeeName = `${employee.firstname || ""} ${employee.lastname || ""}`.trim();

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                    <SelectItem value="O">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="birthdate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Birth Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hiredate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Hire Date*</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="sepdate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Separation Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Not separated</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-2">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start mb-2"
                        onClick={() => field.onChange(null)}
                      >
                        Clear date
                      </Button>
                    </div>
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      disabled={(date) => 
                        date < (form.getValues().hiredate || new Date()) || 
                        date > new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleManageJobHistory}
              className="w-full"
            >
              Manage Job History
            </Button>
          </div>

          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit">
              Update Employee
            </Button>
          </div>
        </form>
      </Form>

      {/* Job History Dialog */}
      <Dialog 
        open={isJobHistoryDialogOpen} 
        onOpenChange={setIsJobHistoryDialogOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Job History</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <JobHistorySection 
              employeeNumber={employee.empno}
              employeeName={employeeName}
              onJobHistoriesChange={handleJobHistoriesChange}
              existingJobHistories={jobHistories}
            />
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsJobHistoryDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveJobHistories}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditEmployeeForm;
