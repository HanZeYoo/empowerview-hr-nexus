
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  UserPlus, 
  Search, 
  Filter, 
  X,
  Pencil,
  Trash2,
  AlertCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import AddEmployeeForm from "@/components/AddEmployeeForm";
import EditEmployeeForm from "@/components/EditEmployeeForm";
import ManageJobHistoryButton from "@/components/ManageJobHistoryButton";

interface Employee {
  empno: string;
  lastname: string | null;
  firstname: string | null;
  birthdate: string | null;
  gender: string | null;
  hiredate: string | null;
  sepdate: string | null;
}

interface FilterOptions {
  gender: string | null;
  yearHired: string | null;
}

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    gender: null,
    yearHired: null,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('employee')
        .select('*')
        .order('lastname');

      if (error) {
        throw error;
      }

      setEmployees(data || []);
    } catch (error: any) {
      console.error("Error fetching employees:", error.message);
      toast({
        variant: "destructive",
        title: "Failed to load employees",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString();
  };

  const getYear = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).getFullYear().toString();
  };

  const getUniqueHireYears = () => {
    const years = employees
      .map(emp => getYear(emp.hiredate))
      .filter((year): year is string => year !== null);
    
    return Array.from(new Set(years)).sort().reverse();
  };

  const fetchJobHistoriesForEmployee = async (employeeNumber: string) => {
    try {
      const { data, error } = await supabase
        .from("jobhistory")
        .select("*")
        .eq("empno", employeeNumber);

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Error fetching job histories:", error.message);
      toast({
        variant: "destructive",
        title: "Failed to load job histories",
        description: error.message,
      });
      return [];
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const fullName = `${employee.firstname || ""} ${employee.lastname || ""}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = fullName.includes(searchLower) || 
                          (employee.empno && employee.empno.toLowerCase().includes(searchLower));
    
    const matchesGender = !filterOptions.gender || employee.gender === filterOptions.gender;
    
    const yearHired = getYear(employee.hiredate);
    const matchesYearHired = !filterOptions.yearHired || yearHired === filterOptions.yearHired;
    
    return matchesSearch && matchesGender && matchesYearHired;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const handleAddEmployee = () => {
    setIsAddDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditDialogOpen(true);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteEmployee = async () => {
    if (!selectedEmployee) return;
    
    try {
      const { error: jhError } = await supabase
        .from("jobhistory")
        .delete()
        .eq("empno", selectedEmployee.empno);
      
      if (jhError) throw jhError;

      const { error } = await supabase
        .from("employee")
        .delete()
        .eq("empno", selectedEmployee.empno);
        
      if (error) throw error;
      
      toast({
        title: "Employee Deleted",
        description: "Employee and all job history records have been successfully removed"
      });
      
      fetchEmployees();
      setIsDeleteDialogOpen(false);
      setSelectedEmployee(null);
      
    } catch (error: any) {
      console.error("Error deleting employee:", error.message);
      toast({
        variant: "destructive",
        title: "Failed to delete employee",
        description: error.message,
      });
    }
  };

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    fetchEmployees();
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    fetchEmployees();
  };

  const clearFilters = () => {
    setFilterOptions({
      gender: null,
      yearHired: null,
    });
  };

  const hasActiveFilters = filterOptions.gender !== null || filterOptions.yearHired !== null;

  return (
    <DashboardLayout title="Employees">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="relative flex-1">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
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
                        {(filterOptions.gender ? 1 : 0) + (filterOptions.yearHired ? 1 : 0)}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Gender</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem 
                    checked={filterOptions.gender === 'M'}
                    onCheckedChange={() => setFilterOptions({...filterOptions, gender: filterOptions.gender === 'M' ? null : 'M'})}
                  >
                    Male
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem 
                    checked={filterOptions.gender === 'F'}
                    onCheckedChange={() => setFilterOptions({...filterOptions, gender: filterOptions.gender === 'F' ? null : 'F'})}
                  >
                    Female
                  </DropdownMenuCheckboxItem>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Year Hired</DropdownMenuLabel>
                  
                  {getUniqueHireYears().map(year => (
                    <DropdownMenuCheckboxItem 
                      key={year}
                      checked={filterOptions.yearHired === year}
                      onCheckedChange={() => setFilterOptions({...filterOptions, yearHired: filterOptions.yearHired === year ? null : year})}
                    >
                      {year}
                    </DropdownMenuCheckboxItem>
                  ))}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={clearFilters} disabled={!hasActiveFilters}>
                    <X className="mr-2 h-4 w-4" /> Clear Filters
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mt-2">
                {filterOptions.gender && (
                  <div className="flex items-center bg-muted text-sm rounded-full px-3 py-1">
                    <span>Gender: {filterOptions.gender === 'M' ? 'Male' : 'Female'}</span>
                    <X 
                      className="ml-2 h-3 w-3 cursor-pointer" 
                      onClick={() => setFilterOptions({...filterOptions, gender: null})}
                    />
                  </div>
                )}
                {filterOptions.yearHired && (
                  <div className="flex items-center bg-muted text-sm rounded-full px-3 py-1">
                    <span>Hired: {filterOptions.yearHired}</span>
                    <X 
                      className="ml-2 h-3 w-3 cursor-pointer" 
                      onClick={() => setFilterOptions({...filterOptions, yearHired: null})}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          
          <Button onClick={handleAddEmployee}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : filteredEmployees.length > 0 ? (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Birth Date</TableHead>
                        <TableHead>Hire Date</TableHead>
                        <TableHead>Separation Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentEmployees.map((employee) => (
                        <TableRow key={employee.empno}>
                          <TableCell className="font-medium">{employee.empno}</TableCell>
                          <TableCell>{`${employee.firstname || ""} ${employee.lastname || ""}`}</TableCell>
                          <TableCell>{employee.gender === 'M' ? 'Male' : employee.gender === 'F' ? 'Female' : employee.gender || "-"}</TableCell>
                          <TableCell>{formatDate(employee.birthdate)}</TableCell>
                          <TableCell>{formatDate(employee.hiredate)}</TableCell>
                          <TableCell>{formatDate(employee.sepdate)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <ManageJobHistoryButton employee={employee} />
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditEmployee(employee)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => handleDeleteEmployee(employee)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageToShow;
                          if (totalPages <= 5) {
                            pageToShow = i + 1;
                          } else if (currentPage <= 3) {
                            pageToShow = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageToShow = totalPages - 4 + i;
                          } else {
                            pageToShow = currentPage - 2 + i;
                          }
                          
                          return (
                            <PaginationItem key={pageToShow}>
                              <PaginationLink 
                                isActive={currentPage === pageToShow}
                                onClick={() => setCurrentPage(pageToShow)}
                              >
                                {pageToShow}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <h3 className="mt-2 text-lg font-medium text-gray-900">No employees found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || hasActiveFilters ? "No employees match your search criteria." : "Start by adding employees to your HR system."}
                </p>
                <div className="mt-6">
                  <Button onClick={handleAddEmployee}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add your first employee
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Enter the employee's information below. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <AddEmployeeForm 
            onSuccess={handleAddSuccess} 
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {selectedEmployee && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Employee</DialogTitle>
              <DialogDescription>
                Update employee information for {selectedEmployee.firstname} {selectedEmployee.lastname} (ID: {selectedEmployee.empno})
              </DialogDescription>
            </DialogHeader>
            <EditEmployeeForm 
              employee={selectedEmployee}
              onSuccess={handleEditSuccess} 
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Employee
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedEmployee && (
                <>
                  Are you sure you want to delete the employee{' '}
                  <span className="font-semibold">
                    {selectedEmployee.firstname} {selectedEmployee.lastname}
                  </span>{' '}
                  (ID: {selectedEmployee.empno})? This action will also delete all job history records and cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteEmployee}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
