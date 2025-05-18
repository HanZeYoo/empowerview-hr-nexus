
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

const formSchema = z.object({
  empno: z.string().min(1, { message: "Employee number is required" }),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  gender: z.enum(["M", "F", "O"]).optional(),
  birthdate: z.date().optional(),
  hiredate: z.date(),
  sepdate: z.date().optional().nullable(),
});

export type FormValues = z.infer<typeof formSchema>;

export interface JobHistory {
  jobcode: string;
  deptcode: string;
  effdate: Date;
  salary: number | null;
}

export const useEmployeeForm = (onSuccess?: () => void) => {
  const [isLoadingEmpNo, setIsLoadingEmpNo] = useState(true);
  const [nextEmpNo, setNextEmpNo] = useState("");
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

  return {
    form,
    isLoadingEmpNo,
    nextEmpNo,
    jobHistories,
    handleJobHistoriesChange,
    onSubmit
  };
};
