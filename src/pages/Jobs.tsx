
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
import AddJobForm from "@/components/AddJobForm";
import EditJobForm from "@/components/EditJobForm";

export default function Jobs() {
  const [jobs, setJobs] = useState<{ jobcode: string; jobdesc: string | null }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<{ jobcode: string; jobdesc: string | null } | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('job')
        .select('*')
        .order('jobdesc');

      if (error) {
        throw error;
      }

      setJobs(data || []);
    } catch (error: any) {
      console.error("Error fetching jobs:", error.message);
      toast({
        variant: "destructive",
        title: "Failed to load jobs",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteJob(jobcode: string) {
    try {
      const { error } = await supabase
        .from('job')
        .delete()
        .eq('jobcode', jobcode);

      if (error) {
        throw error;
      }

      toast({
        title: "Job deleted",
        description: "The job position has been deleted successfully.",
      });
      
      fetchJobs();
    } catch (error: any) {
      console.error("Error deleting job:", error.message);
      toast({
        variant: "destructive",
        title: "Failed to delete job",
        description: error.message,
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedJob(null);
    }
  }

  const filteredJobs = jobs.filter(job => {
    const jobDesc = job.jobdesc?.toLowerCase() || '';
    const jobCode = job.jobcode.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return jobDesc.includes(searchLower) || jobCode.includes(searchLower);
  });

  return (
    <DashboardLayout title="Job Positions">
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-2xl font-bold">Job Positions Management</h1>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Job Position
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Job Position</DialogTitle>
              </DialogHeader>
              <AddJobForm onJobAdded={() => {
                fetchJobs();
                setAddDialogOpen(false);
              }} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search job positions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full"
          />
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>All Job Positions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Code</TableHead>
                      <TableHead>Job Description</TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobs.map((job) => (
                      <TableRow key={job.jobcode}>
                        <TableCell className="font-medium">{job.jobcode}</TableCell>
                        <TableCell>{job.jobdesc}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setSelectedJob(job);
                                setEditDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setSelectedJob(job);
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
                  {searchTerm ? "No job positions match your search criteria." : "No job positions found"}
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Job Position
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Job Position</DialogTitle>
                    </DialogHeader>
                    <AddJobForm onJobAdded={fetchJobs} />
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Job Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Job Position</DialogTitle>
          </DialogHeader>
          {selectedJob && (
            <EditJobForm 
              job={selectedJob}
              onJobUpdated={() => {
                fetchJobs();
                setEditDialogOpen(false);
              }}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Job Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the job position "{selectedJob?.jobdesc}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedJob && deleteJob(selectedJob.jobcode)}
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
