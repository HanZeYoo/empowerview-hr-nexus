
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface JobHistory {
  empno: string;
  jobcode: string;
  deptcode: string | null;
  effdate: string;
  salary: number | null;
  employee_name?: string;
  job_desc?: string;
  dept_name?: string;
}

export default function JobHistories() {
  const [jobHistories, setJobHistories] = useState<JobHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchJobHistories();
  }, []);

  async function fetchJobHistories() {
    try {
      setIsLoading(true);
      
      // First get all job histories
      const { data: jobHistoryData, error: jobHistoryError } = await supabase
        .from('jobhistory')
        .select('*')
        .order('effdate', { ascending: false });
      
      if (jobHistoryError) throw jobHistoryError;
      
      const histories = jobHistoryData || [];
      
      // Get all employees to join with histories
      const { data: employeeData, error: employeeError } = await supabase
        .from('employee')
        .select('empno, firstname, lastname');
        
      if (employeeError) throw employeeError;
      
      // Get all jobs
      const { data: jobData, error: jobError } = await supabase
        .from('job')
        .select('jobcode, jobdesc');
        
      if (jobError) throw jobError;
      
      // Get all departments
      const { data: deptData, error: deptError } = await supabase
        .from('department')
        .select('deptcode, deptname');
        
      if (deptError) throw deptError;
      
      // Create lookup maps
      const employeeMap = Object.fromEntries(
        employeeData?.map(e => [e.empno, `${e.firstname || ""} ${e.lastname || ""}`]) || []
      );
      
      const jobMap = Object.fromEntries(
        jobData?.map(j => [j.jobcode, j.jobdesc]) || []
      );
      
      const deptMap = Object.fromEntries(
        deptData?.map(d => [d.deptcode, d.deptname]) || []
      );
      
      // Enrich job history data with related information
      const enrichedHistories = histories.map(history => ({
        ...history,
        employee_name: employeeMap[history.empno] || 'Unknown',
        job_desc: jobMap[history.jobcode] || 'Unknown',
        dept_name: history.deptcode ? (deptMap[history.deptcode] || 'Unknown') : 'N/A'
      }));
      
      setJobHistories(enrichedHistories);
    } catch (error: any) {
      console.error("Error fetching job histories:", error.message);
      toast({
        variant: "destructive",
        title: "Failed to load job history data",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const formatSalary = (salary: number | null) => {
    if (salary === null) return "-";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(salary);
  };

  const filteredHistories = jobHistories.filter(history => {
    const searchLower = searchTerm.toLowerCase();
    return history.employee_name?.toLowerCase().includes(searchLower) ||
           history.job_desc?.toLowerCase().includes(searchLower) ||
           history.dept_name?.toLowerCase().includes(searchLower) ||
           history.empno.toLowerCase().includes(searchLower);
  });

  return (
    <DashboardLayout title="Job History">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Employee Job History</h1>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Job History Records</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : filteredHistories.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Job Position</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Effective Date</TableHead>
                      <TableHead>Salary</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistories.map((history, index) => (
                      <TableRow key={`${history.empno}-${history.jobcode}-${history.effdate}-${index}`}>
                        <TableCell>{history.employee_name}</TableCell>
                        <TableCell>{history.job_desc}</TableCell>
                        <TableCell>{history.dept_name}</TableCell>
                        <TableCell>{formatDate(history.effdate)}</TableCell>
                        <TableCell>{formatSalary(history.salary)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No job history records found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
