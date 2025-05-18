
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import JobHistorySection from "./JobHistorySection";

const formSchema = z.object({
  empno: z.string().min(1, { message: "Employee number is required" }),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  gender: z.enum(["M", "F", "O"]).optional(),
  birthdate: z.date().optional(),
  hiredate: z.date(),
  sepdate: z.date().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface JobHistory {
  jobcode: string;
  deptcode: string;
  effdate: Date;
  salary: number | null;
}

interface AddEmployeeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({ onSuccess, onCancel }) => {
  const [isLoadingEmpNo, setIsLoadingEmpNo] = useState(true);
  const [nextEmpNo, setNextEmpNo] = useState("");
  const [isJobHistoryOpen, setIsJobHistoryOpen] = useState(false);
  const [jobHistories, setJobHistories] = useState<JobHistory[]>([]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      empno: "",
      firstname: "",
      lastname: "",
      gender: undefined,
      birthdate: undefined,
      hiredate: new Date(),
      sepdate: null,
    },
  });

  useEffect(() => {
    async function fetchNextEmployeeNumber() {
      try {
        setIsLoadingEmpNo(true);
        
        const { data, error } = await supabase
          .from("employee")
          .select("empno")
          .order("empno", { ascending: false })
          .limit(1);
          
        if (error) throw error;
        
        let nextNumber = "1001";
        
        if (data && data.length > 0) {
          const highestEmpNo = data[0].empno;
          const currentNumber = parseInt(highestEmpNo, 10);
          if (!isNaN(currentNumber)) {
            nextNumber = (currentNumber + 1).toString();
          }
        }
        
        setNextEmpNo(nextNumber);
        form.setValue("empno", nextNumber);
      } catch (error: any) {
        console.error("Error fetching next employee number:", error.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to generate employee number",
        });
      } finally {
        setIsLoadingEmpNo(false);
      }
    }
    
    fetchNextEmployeeNumber();
  }, [form]);

  const handleJobHistoriesChange = (updatedJobHistories: JobHistory[]) => {
    setJobHistories(updatedJobHistories);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const employee = {
        empno: data.empno,
        firstname: data.firstname || null,
        lastname: data.lastname || null,
        gender: data.gender || null,
        birthdate: data.birthdate ? format(data.birthdate, "yyyy-MM-dd") : null,
        hiredate: data.hiredate ? format(data.hiredate, "yyyy-MM-dd") : null,
        sepdate: data.sepdate ? format(data.sepdate, "yyyy-MM-dd") : null,
      };

      // Insert employee
      const { error: empError } = await supabase.from("employee").insert(employee);
      if (empError) throw empError;

      // Insert job histories if any
      if (jobHistories.length > 0) {
        const jobHistoryRecords = jobHistories.map(history => ({
          empno: data.empno,
          jobcode: history.jobcode,
          deptcode: history.deptcode,
          effdate: format(history.effdate, "yyyy-MM-dd"),
          salary: history.salary
        }));

        const { error: jobHistoryError } = await supabase
          .from("jobhistory")
          .insert(jobHistoryRecords);

        if (jobHistoryError) throw jobHistoryError;
      }

      toast({
        title: "Employee Added",
        description: "Employee has been successfully added",
      });

      form.reset();
      setJobHistories([]);
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error("Error adding employee:", error.message);
      toast({
        variant: "destructive",
        title: "Failed to add employee",
        description: error.message,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="empno"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee Number*</FormLabel>
              <FormControl>
                <Input 
                  placeholder={isLoadingEmpNo ? "" : "Enter employee number"} 
                  {...field} 
                  readOnly 
                  disabled={isLoadingEmpNo}
                  className={isLoadingEmpNo ? "bg-gray-100 cursor-not-allowed" : "bg-gray-100"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <PopoverContent className="w-auto p-0 z-50" align="start">
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
                  <PopoverContent className="w-auto p-0 z-50" align="start">
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
                <PopoverContent className="w-auto p-0 z-50" align="start">
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

        <Collapsible 
          open={isJobHistoryOpen} 
          onOpenChange={setIsJobHistoryOpen}
          className="border rounded-md p-4"
        >
          <CollapsibleTrigger asChild>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full flex justify-between"
              disabled={isLoadingEmpNo}
            >
              <span>Manage Job History</span>
              <span>{isJobHistoryOpen ? "▲" : "▼"}</span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <JobHistorySection 
              employeeNumber={nextEmpNo} 
              onJobHistoriesChange={handleJobHistoriesChange}
              isDisabled={isLoadingEmpNo} 
            />
          </CollapsibleContent>
        </Collapsible>

        <div className="flex gap-2 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoadingEmpNo}>
            Add Employee
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddEmployeeForm;
