
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, Building2, Briefcase, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Mock statistics (will be replaced with real data from Supabase)
  const stats = [
    { 
      title: "Total Employees", 
      value: "0", 
      icon: Users, 
      color: "bg-blue-100 text-blue-700",
      link: "/employees"
    },
    { 
      title: "Departments", 
      value: "0", 
      icon: Building2, 
      color: "bg-green-100 text-green-700",
      link: "/departments"
    },
    { 
      title: "Job Positions", 
      value: "0", 
      icon: Briefcase, 
      color: "bg-purple-100 text-purple-700",
      link: "/jobs"
    },
    { 
      title: "Recent Activities", 
      value: "0", 
      icon: Activity, 
      color: "bg-orange-100 text-orange-700",
      link: "/activities"
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
              <CardTitle>Connect to Supabase</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                This HR Management System requires Supabase for authentication and data storage. 
                Click the green Supabase button in the top right to connect.
              </p>
              <Button onClick={() => navigate("/login")}>
                Return to Login
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
