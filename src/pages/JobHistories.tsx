
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
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

interface FilterOptions {
  department: string | null;
  job: string | null;
  year: string | null;
  salaryRange: string | null;
}

export default function JobHistories() {
  const [jobHistories, setJobHistories] = useState<JobHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    department: null,
    job: null,
    year: null,
    salaryRange: null
  });

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

  // Helper functions
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const getYear = (dateStr: string) => {
    return new Date(dateStr).getFullYear().toString();
  };

  const formatSalary = (salary: number | null) => {
    if (salary === null) return "-";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(salary);
  };

  // Get unique departments, jobs and years for filtering
  const getUniqueDepartments = () => {
    const departments = jobHistories
      .filter(h => h.deptcode && h.dept_name)
      .map(h => ({ code: h.deptcode!, name: h.dept_name! }));
    
    // Remove duplicates by code
    return Array.from(new Map(departments.map(item => 
      [item.code, item]
    )).values()).sort((a, b) => a.name.localeCompare(b.name));
  };

  const getUniqueJobs = () => {
    const jobs = jobHistories
      .filter(h => h.job_desc)
      .map(h => ({ code: h.jobcode, desc: h.job_desc! }));
    
    // Remove duplicates by code
    return Array.from(new Map(jobs.map(item => 
      [item.code, item]
    )).values()).sort((a, b) => a.desc.localeCompare(b.desc));
  };

  const getUniqueYears = () => {
    const years = jobHistories.map(h => getYear(h.effdate));
    return Array.from(new Set(years)).sort().reverse();
  };

  const getSalaryRanges = () => [
    { id: 'under50k', label: 'Under $50,000', min: 0, max: 50000 },
    { id: '50kTo100k', label: '$50,000 - $100,000', min: 50000, max: 100000 },
    { id: '100kPlus', label: 'Over $100,000', min: 100000, max: Infinity }
  ];

  // Apply filters and search
  const filteredHistories = jobHistories.filter(history => {
    // Text search
    const employeeName = history.employee_name?.toLowerCase() || '';
    const jobDesc = history.job_desc?.toLowerCase() || '';
    const deptName = history.dept_name?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      employeeName.includes(searchLower) || 
      jobDesc.includes(searchLower) || 
      deptName.includes(searchLower) ||
      history.empno.toLowerCase().includes(searchLower);
    
    // Department filter
    const matchesDepartment = !filterOptions.department || history.deptcode === filterOptions.department;
    
    // Job filter
    const matchesJob = !filterOptions.job || history.jobcode === filterOptions.job;
    
    // Year filter
    const historyYear = getYear(history.effdate);
    const matchesYear = !filterOptions.year || historyYear === filterOptions.year;
    
    // Salary range filter
    let matchesSalary = true;
    if (filterOptions.salaryRange) {
      const range = getSalaryRanges().find(r => r.id === filterOptions.salaryRange);
      if (range && history.salary !== null) {
        matchesSalary = history.salary >= range.min && history.salary < range.max;
      }
    }
    
    return matchesSearch && matchesDepartment && matchesJob && matchesYear && matchesSalary;
  });

  const clearFilters = () => {
    setFilterOptions({
      department: null,
      job: null,
      year: null,
      salaryRange: null
    });
  };

  const hasActiveFilters = Object.values(filterOptions).some(val => val !== null);

  return (
    <DashboardLayout title="Job History">
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-2xl font-bold">Employee Job History</h1>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter size={16} />
                  Filter
                  {hasActiveFilters && (
                    <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {Object.values(filterOptions).filter(v => v !== null).length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60">
                <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Department</DropdownMenuLabel>
                {getUniqueDepartments().map(dept => (
                  <DropdownMenuCheckboxItem 
                    key={dept.code}
                    checked={filterOptions.department === dept.code}
                    onCheckedChange={() => setFilterOptions({...filterOptions, 
                      department: filterOptions.department === dept.code ? null : dept.code
                    })}
                  >
                    {dept.name}
                  </DropdownMenuCheckboxItem>
                ))}
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Job Position</DropdownMenuLabel>
                {getUniqueJobs().map(job => (
                  <DropdownMenuCheckboxItem 
                    key={job.code}
                    checked={filterOptions.job === job.code}
                    onCheckedChange={() => setFilterOptions({...filterOptions, 
                      job: filterOptions.job === job.code ? null : job.code
                    })}
                  >
                    {job.desc}
                  </DropdownMenuCheckboxItem>
                ))}
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Effective Year</DropdownMenuLabel>
                {getUniqueYears().map(year => (
                  <DropdownMenuCheckboxItem 
                    key={year}
                    checked={filterOptions.year === year}
                    onCheckedChange={() => setFilterOptions({...filterOptions, 
                      year: filterOptions.year === year ? null : year
                    })}
                  >
                    {year}
                  </DropdownMenuCheckboxItem>
                ))}
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Salary Range</DropdownMenuLabel>
                {getSalaryRanges().map(range => (
                  <DropdownMenuCheckboxItem 
                    key={range.id}
                    checked={filterOptions.salaryRange === range.id}
                    onCheckedChange={() => setFilterOptions({...filterOptions, 
                      salaryRange: filterOptions.salaryRange === range.id ? null : range.id
                    })}
                  >
                    {range.label}
                  </DropdownMenuCheckboxItem>
                ))}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={clearFilters} disabled={!hasActiveFilters}>
                  <X className="mr-2 h-4 w-4" /> Clear Filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {filterOptions.department && (
              <div className="flex items-center bg-muted text-sm rounded-full px-3 py-1">
                <span>Department: {getUniqueDepartments().find(d => d.code === filterOptions.department)?.name}</span>
                <X 
                  className="ml-2 h-3 w-3 cursor-pointer" 
                  onClick={() => setFilterOptions({...filterOptions, department: null})}
                />
              </div>
            )}
            
            {filterOptions.job && (
              <div className="flex items-center bg-muted text-sm rounded-full px-3 py-1">
                <span>Job: {getUniqueJobs().find(j => j.code === filterOptions.job)?.desc}</span>
                <X 
                  className="ml-2 h-3 w-3 cursor-pointer" 
                  onClick={() => setFilterOptions({...filterOptions, job: null})}
                />
              </div>
            )}
            
            {filterOptions.year && (
              <div className="flex items-center bg-muted text-sm rounded-full px-3 py-1">
                <span>Year: {filterOptions.year}</span>
                <X 
                  className="ml-2 h-3 w-3 cursor-pointer" 
                  onClick={() => setFilterOptions({...filterOptions, year: null})}
                />
              </div>
            )}
            
            {filterOptions.salaryRange && (
              <div className="flex items-center bg-muted text-sm rounded-full px-3 py-1">
                <span>Salary: {getSalaryRanges().find(r => r.id === filterOptions.salaryRange)?.label}</span>
                <X 
                  className="ml-2 h-3 w-3 cursor-pointer" 
                  onClick={() => setFilterOptions({...filterOptions, salaryRange: null})}
                />
              </div>
            )}
          </div>
        )}

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
                <p className="text-muted-foreground">
                  {searchTerm || hasActiveFilters ? "No job history records match your criteria." : "No job history records found"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
