
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import AddDepartmentForm from "@/components/AddDepartmentForm";
import EditDepartmentForm from "@/components/EditDepartmentForm";

export default function Departments() {
  const [departments, setDepartments] = useState<{ deptcode: string; deptname: string | null }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<{ deptcode: string; deptname: string | null } | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  async function fetchDepartments() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('department')
        .select('*')
        .order('deptname');

      if (error) {
        throw error;
      }

      setDepartments(data || []);
    } catch (error: any) {
      console.error("Error fetching departments:", error.message);
      toast({
        variant: "destructive",
        title: "Failed to load departments",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteDepartment(deptcode: string) {
    try {
      const { error } = await supabase
        .from('department')
        .delete()
        .eq('deptcode', deptcode);

      if (error) {
        throw error;
      }

      toast({
        title: "Department deleted",
        description: "The department has been deleted successfully.",
      });
      
      fetchDepartments();
    } catch (error: any) {
      console.error("Error deleting department:", error.message);
      toast({
        variant: "destructive",
        title: "Failed to delete department",
        description: error.message,
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedDepartment(null);
    }
  }

  const filteredDepartments = departments.filter(department => {
    const departmentName = department.deptname?.toLowerCase() || '';
    const departmentCode = department.deptcode.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return departmentName.includes(searchLower) || departmentCode.includes(searchLower);
  });

  return (
    <DashboardLayout title="Departments">
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-2xl font-bold">Departments Management</h1>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Department</DialogTitle>
              </DialogHeader>
              <AddDepartmentForm onDepartmentAdded={() => {
                fetchDepartments();
                setAddDialogOpen(false);
              }} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full"
          />
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>All Departments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : filteredDepartments.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department Code</TableHead>
                      <TableHead>Department Name</TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDepartments.map((department) => (
                      <TableRow key={department.deptcode}>
                        <TableCell className="font-medium">{department.deptcode}</TableCell>
                        <TableCell>{department.deptname}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setSelectedDepartment(department);
                                setEditDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setSelectedDepartment(department);
                                setDeleteDialogOpen(true);
                              }}
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
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">
                  {searchTerm ? "No departments match your search criteria." : "No departments found"}
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Department
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Department</DialogTitle>
                    </DialogHeader>
                    <AddDepartmentForm onDepartmentAdded={fetchDepartments} />
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Department Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
          </DialogHeader>
          {selectedDepartment && (
            <EditDepartmentForm 
              department={selectedDepartment}
              onDepartmentUpdated={() => {
                fetchDepartments();
                setEditDialogOpen(false);
              }}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Department Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the department "{selectedDepartment?.deptname}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedDepartment && deleteDepartment(selectedDepartment.deptcode)}
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
