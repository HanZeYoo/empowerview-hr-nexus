
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="text-center max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-primary mb-6">
          EmpowerView HR Nexus
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          A complete HR management solution for tracking employees, departments, jobs, and job histories.
        </p>
        
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link to="/login">Login</Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <Link to="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
