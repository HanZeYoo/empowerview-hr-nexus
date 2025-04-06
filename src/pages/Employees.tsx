
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Search } from "lucide-react";
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

interface Employee {
  empno: string;
  lastname: string | null;
  firstname: string | null;
  birthdate: string | null;
  gender: string | null;
  hiredate: string | null;
  sepdate: string | null;
}

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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

  const filteredEmployees = employees.filter((employee) => {
    const fullName = `${employee.firstname || ""} ${employee.lastname || ""}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return fullName.includes(searchLower) || 
           (employee.empno && employee.empno.toLowerCase().includes(searchLower));
  });

  const handleAddEmployee = () => {
    toast({
      title: "Feature Coming Soon",
      description: "The ability to add employees will be available soon."
    });
  };

  return (
    <DashboardLayout title="Employees">
      <div className="space-y-6">
        {/* Header with search and add button */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="relative w-full md:w-auto flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
          <Button onClick={handleAddEmployee}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>

        {/* Employee list */}
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : filteredEmployees.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Birth Date</TableHead>
                      <TableHead>Hire Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((employee) => (
                      <TableRow key={employee.empno}>
                        <TableCell className="font-medium">{employee.empno}</TableCell>
                        <TableCell>{`${employee.firstname || ""} ${employee.lastname || ""}`}</TableCell>
                        <TableCell>{employee.gender || "-"}</TableCell>
                        <TableCell>{formatDate(employee.birthdate)}</TableCell>
                        <TableCell>{formatDate(employee.hiredate)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">View Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="mt-2 text-lg font-medium text-gray-900">No employees found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? "No employees match your search criteria." : "Start by adding employees to your HR system."}
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
    </DashboardLayout>
  );
}
