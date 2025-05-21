
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, User, Briefcase, Calendar } from "lucide-react";
import JobHistorySectionSimple from "@/components/JobHistorySectionSimple";

interface Employee {
  empno: string;
  lastname: string | null;
  firstname: string | null;
  birthdate: string | null;
  gender: string | null;
  hiredate: string | null;
  sepdate: string | null;
}

export default function EmployeeView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setIsLoading(true);
        if (!id) return;

        const { data, error } = await supabase
          .from("employee")
          .select("*")
          .eq("empno", id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setEmployee(data);
        }
      } catch (error: any) {
        console.error("Error fetching employee:", error.message);
        toast({
          variant: "destructive",
          title: "Error fetching employee",
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not specified";
    return new Date(dateStr).toLocaleDateString();
  };

  const getFullName = (employee: Employee | null) => {
    if (!employee) return "";
    return `${employee.firstname || ""} ${employee.lastname || ""}`.trim() || "Unnamed Employee";
  };

  return (
    <DashboardLayout title={isLoading ? "Loading..." : getFullName(employee)}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/employees")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Employees
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : employee ? (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Employee Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">ID</dt>
                    <dd className="text-base">{employee.empno}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                    <dd className="text-base">{getFullName(employee)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Gender</dt>
                    <dd className="text-base">
                      {employee.gender === 'M' ? 'Male' : employee.gender === 'F' ? 'Female' : 'Not specified'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Birth Date</dt>
                    <dd className="text-base">{formatDate(employee.birthdate)}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Employment Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Hire Date</dt>
                    <dd className="text-base">{formatDate(employee.hiredate)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Separation Date</dt>
                    <dd className="text-base">{employee.sepdate ? formatDate(employee.sepdate) : "Still employed"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Employment Status</dt>
                    <dd className="text-base">
                      {employee.sepdate ? (
                        <span className="text-destructive">Former Employee</span>
                      ) : (
                        <span className="text-green-600">Active Employee</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Job History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <JobHistorySectionSimple employeeId={employee.empno} />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">Employee not found</h3>
            <p className="text-muted-foreground mt-2">The requested employee could not be found or may have been deleted.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
