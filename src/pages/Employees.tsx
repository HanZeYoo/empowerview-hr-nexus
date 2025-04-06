
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // This would be replaced with actual data from Supabase
  const employees = [];
  
  const handleAddEmployee = () => {
    toast({
      title: "Supabase Required",
      description: "Please connect Supabase to add employees to the database."
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
            {employees.length > 0 ? (
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Employee rows would be rendered here */}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="mt-2 text-lg font-medium text-gray-900">No employees found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Connect to Supabase to start adding employees to your HR system.
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
