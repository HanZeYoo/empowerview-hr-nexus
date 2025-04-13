
import React, { useState } from 'react';
import { History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import JobHistorySectionSimple from './JobHistorySectionSimple';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Employee {
  empno: string;
  lastname: string | null;
  firstname: string | null;
}

interface JobHistory {
  id?: string;
  jobcode: string;
  deptcode: string;
  effdate: Date;
  salary: number | null;
}

interface ManageJobHistoryButtonProps {
  employee: Employee;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const ManageJobHistoryButton: React.FC<ManageJobHistoryButtonProps> = ({ 
  employee, 
  variant = "outline",
  size = "sm"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [jobHistories, setJobHistories] = useState<JobHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchJobHistories = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("jobhistory")
        .select("*")
        .eq("empno", employee.empno)
        .order('effdate', { ascending: false });

      if (error) throw error;
      
      // Transform the dates to Date objects
      const formattedData = data.map(item => ({
        ...item,
        effdate: new Date(item.effdate),
        id: `${item.empno}-${item.jobcode}-${item.effdate}`
      }));
      
      setJobHistories(formattedData);
    } catch (error: any) {
      console.error("Error fetching job histories:", error.message);
      toast({
        variant: "destructive",
        title: "Failed to load job histories",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = async () => {
    await fetchJobHistories();
    setIsOpen(true);
  };

  const handleJobHistoriesChange = (updatedHistories: JobHistory[]) => {
    setJobHistories(updatedHistories);
  };

  return (
    <>
      <Button 
        variant={variant} 
        size={size}
        onClick={handleOpen}
      >
        <History className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Job History</DialogTitle>
            <DialogDescription>
              View and manage job history for {employee.firstname} {employee.lastname}
            </DialogDescription>
          </DialogHeader>
          <JobHistorySectionSimple 
            employeeNumber={employee.empno}
            employeeName={`${employee.firstname || ""} ${employee.lastname || ""}`}
            onJobHistoriesChange={handleJobHistoriesChange}
            existingJobHistories={jobHistories}
            isDisabled={isLoading}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManageJobHistoryButton;
