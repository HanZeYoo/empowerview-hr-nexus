
import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Users,
  Building2,
  Briefcase,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ClipboardList
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./AuthProvider";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
      navigate("/login");
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "There was an error logging out. Please try again."
      });
    }
  };

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Employees", icon: Users, href: "/employees" },
    { name: "Departments", icon: Building2, href: "/departments" },
    { name: "Jobs", icon: Briefcase, href: "/jobs" },
    { name: "Job Histories", icon: ClipboardList, href: "/jobhistories" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out md:relative md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <h2 className="text-xl font-bold text-primary">HR System</h2>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="md:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navItems.map((item) => (
              <Button 
                key={item.name}
                variant="ghost"
                className="w-full justify-start text-left font-normal hover:bg-gray-100"
                onClick={() => navigate(item.href)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Button>
            ))}
          </nav>

          {/* User info */}
          {user && (
            <div className="border-t border-b p-4">
              <div className="text-sm font-medium">{user.email}</div>
              <div className="text-xs text-gray-500">
                {user.user_metadata.first_name} {user.user_metadata.last_name}
              </div>
            </div>
          )}

          {/* Logout button */}
          <div className="p-4">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 h-16 flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="mr-4 md:hidden"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
