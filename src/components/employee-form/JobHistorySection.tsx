
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import JobHistorySection from "@/components/JobHistorySection";
import { JobHistory } from "@/hooks/useEmployeeForm";

interface JobHistorySectionWrapperProps {
  employeeNumber: string;
  onJobHistoriesChange: (histories: JobHistory[]) => void;
  isDisabled: boolean;
}

const JobHistorySectionWrapper = ({ 
  employeeNumber, 
  onJobHistoriesChange, 
  isDisabled 
}: JobHistorySectionWrapperProps) => {
  const [isJobHistoryOpen, setIsJobHistoryOpen] = useState(false);

  return (
    <Collapsible 
      open={isJobHistoryOpen} 
      onOpenChange={setIsJobHistoryOpen}
      className="border rounded-md p-4"
    >
      <CollapsibleTrigger asChild>
        <Button 
          type="button" 
          variant="outline" 
          className="w-full flex justify-between"
          disabled={isDisabled}
        >
          <span>Manage Job History</span>
          <span>{isJobHistoryOpen ? "▲" : "▼"}</span>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4">
        <JobHistorySection 
          employeeNumber={employeeNumber} 
          onJobHistoriesChange={onJobHistoriesChange}
          isDisabled={isDisabled} 
        />
      </CollapsibleContent>
    </Collapsible>
  );
};

export default JobHistorySectionWrapper;
