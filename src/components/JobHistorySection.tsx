
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { PlusCircle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface JobHistory {
  id?: string;
  jobcode: string;
  deptcode: string;
  effdate: Date;
  salary: number | null;
}

interface Job {
  jobcode: string;
  jobdesc: string | null;
}

interface Department {
  deptcode: string;
  deptname: string | null;
}

interface JobHistorySectionProps {
  employeeNumber: string;
  onJobHistoriesChange: (jobHistories: JobHistory[]) => void;
  isDisabled?: boolean;
}

const JobHistorySection: React.FC<JobHistorySectionProps> = ({
  employeeNumber,
  onJobHistoriesChange,
  isDisabled = false,
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobHistories, setJobHistories] = useState<JobHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // New job history form state
  const [newJobHistory, setNewJobHistory] = useState<JobHistory>({
    jobcode: "",
    deptcode: "",
    effdate: new Date(),
    salary: null,
  });

  // Fetch jobs and departments on component mount
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch jobs
        const { data: jobsData, error: jobsError } = await supabase
          .from("job")
          .select("jobcode, jobdesc");
        
        if (jobsError) throw jobsError;
        setJobs(jobsData || []);
        
        // Fetch departments
        const { data: deptsData, error: deptsError } = await supabase
          .from("department")
          .select("deptcode, deptname");
        
        if (deptsError) throw deptsError;
        setDepartments(deptsData || []);
      } catch (error: any) {
        console.error("Error fetching data:", error.message);
        toast({
          variant: "destructive", 
          title: "Error fetching data",
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Add a new job history entry
  const handleAddJobHistory = () => {
    // Validate inputs
    if (!newJobHistory.jobcode) {
      toast({
        variant: "destructive",
        title: "Missing job",
        description: "Please select a job",
      });
      return;
    }
    
    if (!newJobHistory.deptcode) {
      toast({
        variant: "destructive",
        title: "Missing department",
        description: "Please select a department",
      });
      return;
    }
    
    if (!newJobHistory.effdate) {
      toast({
        variant: "destructive",
        title: "Missing effective date",
        description: "Please select an effective date",
      });
      return;
    }
    
    // Add to job histories array
    const updatedJobHistories = [...jobHistories, { ...newJobHistory, id: Date.now().toString() }];
    setJobHistories(updatedJobHistories);
    onJobHistoriesChange(updatedJobHistories);
    
    // Reset form
    setNewJobHistory({
      jobcode: "",
      deptcode: "",
      effdate: new Date(),
      salary: null,
    });
  };

  // Remove a job history entry
  const handleRemoveJobHistory = (index: number) => {
    const updatedJobHistories = [...jobHistories];
    updatedJobHistories.splice(index, 1);
    setJobHistories(updatedJobHistories);
    onJobHistoriesChange(updatedJobHistories);
  };

  // Update a field in the new job history form
  const handleInputChange = (field: keyof JobHistory, value: any) => {
    setNewJobHistory(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Manage Job History</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job</label>
          <Select
            disabled={isDisabled || isLoading}
            value={newJobHistory.jobcode}
            onValueChange={(value) => handleInputChange("jobcode", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select job" />
            </SelectTrigger>
            <SelectContent>
              {jobs.map((job) => (
                <SelectItem key={job.jobcode} value={job.jobcode}>
                  {job.jobdesc || job.jobcode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <Select
            disabled={isDisabled || isLoading}
            value={newJobHistory.deptcode}
            onValueChange={(value) => handleInputChange("deptcode", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.deptcode} value={dept.deptcode}>
                  {dept.deptname || dept.deptcode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={isDisabled || isLoading}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !newJobHistory.effdate && "text-muted-foreground"
                )}
              >
                {newJobHistory.effdate ? (
                  format(newJobHistory.effdate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="start">
              <Calendar
                mode="single"
                selected={newJobHistory.effdate}
                onSelect={(date) => handleInputChange("effdate", date)}
                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
          <div className="flex space-x-2">
            <Input
              type="number"
              value={newJobHistory.salary || ""}
              onChange={(e) => handleInputChange("salary", e.target.value ? parseFloat(e.target.value) : null)}
              placeholder="Enter salary"
              disabled={isDisabled || isLoading}
              className="flex-1"
            />
            <Button 
              type="button" 
              onClick={handleAddJobHistory} 
              disabled={isDisabled || isLoading}
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {jobHistories.length > 0 && (
        <div className="border rounded-md p-2 mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobHistories.map((history, index) => (
                <TableRow key={history.id || index}>
                  <TableCell>
                    {jobs.find(j => j.jobcode === history.jobcode)?.jobdesc || history.jobcode}
                  </TableCell>
                  <TableCell>
                    {departments.find(d => d.deptcode === history.deptcode)?.deptname || history.deptcode}
                  </TableCell>
                  <TableCell>{format(history.effdate, "PPP")}</TableCell>
                  <TableCell>{history.salary !== null ? `$${history.salary.toLocaleString()}` : "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveJobHistory(index)}
                      disabled={isDisabled}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default JobHistorySection;
