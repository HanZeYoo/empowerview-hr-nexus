
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, Building2, Briefcase, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    employees: 0,
    departments: 0,
    jobs: 0,
    jobHistories: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      setIsLoading(true);
      try {
        // Fetch employee count
        const { count: employeeCount, error: employeeError } = await supabase
          .from('employee')
          .select('*', { count: 'exact', head: true });
        
        if (employeeError) throw employeeError;

        // Fetch department count
        const { count: departmentCount, error: departmentError } = await supabase
          .from('department')
          .select('*', { count: 'exact', head: true });
        
        if (departmentError) throw departmentError;

        // Fetch job count
        const { count: jobCount, error: jobError } = await supabase
          .from('job')
          .select('*', { count: 'exact', head: true });
        
        if (jobError) throw jobError;

        // Fetch job history count
        const { count: jobHistoryCount, error: jobHistoryError } = await supabase
          .from('jobhistory')
          .select('*', { count: 'exact', head: true });
        
        if (jobHistoryError) throw jobHistoryError;

        setCounts({
          employees: employeeCount || 0,
          departments: departmentCount || 0,
          jobs: jobCount || 0,
          jobHistories: jobHistoryCount || 0
        });
      } catch (error) {
        console.error("Error fetching counts:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCounts();
  }, []);
  
  // Stats array with actual counts
  const stats = [
    { 
      title: "Total Employees", 
      value: isLoading ? "Loading..." : counts.employees.toString(), 
      icon: Users, 
      color: "bg-blue-100 text-blue-700",
      link: "/employees"
    },
    { 
      title: "Departments", 
      value: isLoading ? "Loading..." : counts.departments.toString(), 
      icon: Building2, 
      color: "bg-green-100 text-green-700",
      link: "/departments"
    },
    { 
      title: "Job Positions", 
      value: isLoading ? "Loading..." : counts.jobs.toString(), 
      icon: Briefcase, 
      color: "bg-purple-100 text-purple-700",
      link: "/jobs"
    },
    { 
      title: "Job Histories", 
      value: isLoading ? "Loading..." : counts.jobHistories.toString(), 
      icon: Activity, 
      color: "bg-orange-100 text-orange-700",
      link: "/jobhistories"
    },
  ];

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full ${stat.color}`}>
                  <stat.icon size={18} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <Button 
                  variant="ghost" 
                  className="p-0 h-auto mt-1 text-sm font-normal text-muted-foreground hover:text-primary"
                  onClick={() => navigate(stat.link)}
                >
                  View details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>HR System Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                Welcome to your HR Management System powered by Supabase. 
                This dashboard shows key metrics from your HR database.
              </p>
              <Button onClick={() => navigate("/employees")}>
                Manage Employees
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate("/employees")}
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Employees
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate("/departments")}
              >
                <Building2 className="mr-2 h-4 w-4" />
                View Departments
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate("/jobs")}
              >
                <Briefcase className="mr-2 h-4 w-4" />
                Job Positions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
