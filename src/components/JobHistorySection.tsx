
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { PlusCircle, Trash2, Pencil } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
  employeeName?: string;
  onJobHistoriesChange: (jobHistories: JobHistory[]) => void;
  isDisabled?: boolean;
  existingJobHistories?: JobHistory[];
  isViewOnly?: boolean;
}

const JobHistorySection: React.FC<JobHistorySectionProps> = ({
  employeeNumber,
  employeeName,
  onJobHistoriesChange,
  isDisabled = false,
  existingJobHistories = [],
  isViewOnly = false,
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobHistories, setJobHistories] = useState<JobHistory[]>(existingJobHistories);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingJobHistory, setEditingJobHistory] = useState<JobHistory | null>(null);
  const [editIndex, setEditIndex] = useState<number>(-1);
  
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

  // Initialize with existing job histories if provided
  useEffect(() => {
    if (existingJobHistories.length > 0) {
      setJobHistories(existingJobHistories);
    }
  }, [existingJobHistories]);

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

  // Edit a job history entry
  const handleEditJobHistory = (index: number) => {
    const jobHistory = jobHistories[index];
    setEditingJobHistory({ ...jobHistory });
    setEditIndex(index);
    setIsEditDialogOpen(true);
  };

  // Save edited job history
  const handleSaveEdit = () => {
    if (!editingJobHistory) return;
    
    // Validate inputs
    if (!editingJobHistory.jobcode) {
      toast({
        variant: "destructive",
        title: "Missing job",
        description: "Please select a job",
      });
      return;
    }
    
    if (!editingJobHistory.deptcode) {
      toast({
        variant: "destructive",
        title: "Missing department",
        description: "Please select a department",
      });
      return;
    }
    
    if (!editingJobHistory.effdate) {
      toast({
        variant: "destructive",
        title: "Missing effective date",
        description: "Please select an effective date",
      });
      return;
    }

    // Update job histories array
    const updatedJobHistories = [...jobHistories];
    updatedJobHistories[editIndex] = editingJobHistory;
    setJobHistories(updatedJobHistories);
    onJobHistoriesChange(updatedJobHistories);
    
    // Close dialog and reset form
    setIsEditDialogOpen(false);
    setEditingJobHistory(null);
    setEditIndex(-1);
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

  // Update a field in the edit job history form
  const handleEditInputChange = (field: keyof JobHistory, value: any) => {
    if (editingJobHistory) {
      setEditingJobHistory(prev => ({ ...prev!, [field]: value }));
    }
  };

  // Format the header as shown in the image
  const headerContent = (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center">Manage Job History Dialog</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="font-medium">Employee Number:</span>
          <span className="ml-2">{employeeNumber}</span>
          <span className="ml-2 text-gray-500">(non-editable)</span>
        </div>
        {employeeName && (
          <div>
            <span className="font-medium">Name:</span>
            <span className="ml-2">{employeeName}</span>
            <span className="ml-2 text-gray-500">(non-editable)</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {headerContent}

      {!isViewOnly && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                    format(newJobHistory.effdate, "dd-MMM-yyyy")
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
                  disabled={(date) => date < new Date("1900-01-01")}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Position</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5">$</span>
                <Input
                  type="number"
                  value={newJobHistory.salary || ""}
                  onChange={(e) => handleInputChange("salary", e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="Enter salary"
                  disabled={isDisabled || isLoading}
                  className="pl-7"
                />
              </div>
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
      )}

      {jobHistories.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Effective Date</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Job Position</TableHead>
                <TableHead>Salary</TableHead>
                {!isViewOnly && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobHistories.map((history, index) => (
                <TableRow key={history.id || index}>
                  <TableCell>
                    {format(new Date(history.effdate), "dd-MMM-yyyy")}
                  </TableCell>
                  <TableCell>
                    {departments.find(d => d.deptcode === history.deptcode)?.deptname || history.deptcode}
                  </TableCell>
                  <TableCell>
                    {jobs.find(j => j.jobcode === history.jobcode)?.jobdesc || history.jobcode}
                  </TableCell>
                  <TableCell>{history.salary !== null ? `$${history.salary.toLocaleString()}` : "-"}</TableCell>
                  {!isViewOnly && (
                    <TableCell className="text-right">
                      <Button 
                        variant="link" 
                        className="text-blue-600 hover:text-blue-800 px-2"
                        onClick={() => handleEditJobHistory(index)}
                        disabled={isDisabled}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="link" 
                        className="text-red-600 hover:text-red-800 px-2"
                        onClick={() => handleRemoveJobHistory(index)}
                        disabled={isDisabled}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-6 border rounded-md bg-gray-50">
          <p className="text-gray-500">No job history records found.</p>
        </div>
      )}

      {!isViewOnly && jobHistories.length > 0 && (
        <div className="flex justify-center mt-4">
          <Button 
            onClick={handleAddJobHistory}
            disabled={isDisabled || isLoading}
          >
            Add
          </Button>
        </div>
      )}

      {/* Edit Job History Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Job History</DialogTitle>
          </DialogHeader>
          
          {editingJobHistory && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-medium">Effective Date:</label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !editingJobHistory.effdate && "text-muted-foreground"
                        )}
                      >
                        {editingJobHistory.effdate ? (
                          format(new Date(editingJobHistory.effdate), "dd-MMM-yyyy")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={new Date(editingJobHistory.effdate)}
                        onSelect={(date) => handleEditInputChange("effdate", date)}
                        disabled={(date) => date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-medium">Department:</label>
                <div className="col-span-3">
                  <Select
                    value={editingJobHistory.deptcode}
                    onValueChange={(value) => handleEditInputChange("deptcode", value)}
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
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-medium">Job Position:</label>
                <div className="col-span-3">
                  <Select
                    value={editingJobHistory.jobcode}
                    onValueChange={(value) => handleEditInputChange("jobcode", value)}
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
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-medium">Salary:</label>
                <div className="col-span-3 relative">
                  <span className="absolute left-3 top-2.5">$</span>
                  <Input
                    type="number"
                    value={editingJobHistory.salary || ""}
                    onChange={(e) => handleEditInputChange("salary", e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="Enter salary"
                    className="pl-7"
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobHistorySection;
