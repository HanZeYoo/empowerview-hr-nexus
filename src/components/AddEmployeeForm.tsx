
import React from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useEmployeeForm } from "@/hooks/useEmployeeForm";
import BasicInfoFields from "@/components/employee-form/BasicInfoFields";
import DateFields from "@/components/employee-form/DateFields";
import JobHistorySectionWrapper from "@/components/employee-form/JobHistorySection";

interface AddEmployeeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({ onSuccess, onCancel }) => {
  const { 
    form, 
    isLoadingEmpNo, 
    nextEmpNo, 
    handleJobHistoriesChange, 
    onSubmit 
  } = useEmployeeForm(onSuccess);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BasicInfoFields form={form} isLoadingEmpNo={isLoadingEmpNo} />
        
        <DateFields form={form} />
        
        <JobHistorySectionWrapper
          employeeNumber={nextEmpNo}
          onJobHistoriesChange={handleJobHistoriesChange}
          isDisabled={isLoadingEmpNo}
        />

        <div className="flex gap-2 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoadingEmpNo}>
            Add Employee
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddEmployeeForm;
