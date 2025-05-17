
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  // Generate an array of years for the dropdown
  const getCurrentYear = () => new Date().getFullYear();
  const startYear = 1950;
  const endYear = getCurrentYear() + 5;
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  ).reverse();

  // Custom caption component with year dropdown
  const CustomCaption = ({ 
    displayMonth,
    goToMonth, 
    nextMonth, 
    previousMonth
  }: {
    displayMonth: Date;
    goToMonth: (date: Date) => void;
    nextMonth: Date | undefined;
    previousMonth: Date | undefined;
  }) => {
    // Handle the case when displayMonth might be undefined
    const currentDate = displayMonth || new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const handleYearChange = (year: string) => {
      const newDate = new Date(currentDate);
      newDate.setFullYear(parseInt(year));
      goToMonth(newDate);
    };

    const handleMonthChange = (month: string) => {
      const newDate = new Date(currentDate);
      newDate.setMonth(parseInt(month));
      goToMonth(newDate);
    };

    const months = [
      { value: "0", label: "January" },
      { value: "1", label: "February" },
      { value: "2", label: "March" },
      { value: "3", label: "April" },
      { value: "4", label: "May" },
      { value: "5", label: "June" },
      { value: "6", label: "July" },
      { value: "7", label: "August" },
      { value: "8", label: "September" },
      { value: "9", label: "October" },
      { value: "10", label: "November" },
      { value: "11", label: "December" },
    ];

    return (
      <div className="flex justify-center px-1 pt-1 relative items-center">
        <div className="flex space-x-1">
          <Select
            value={currentMonth.toString()}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger className="h-7 w-[110px] text-xs font-medium">
              <SelectValue placeholder={months[currentMonth].label} />
            </SelectTrigger>
            <SelectContent 
              className="z-[150] bg-popover" 
              position="popper"
              align="start"
              sideOffset={4}
            >
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value} className="cursor-pointer">
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={currentYear.toString()}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="h-7 w-[80px] text-xs font-medium">
              <SelectValue placeholder={currentYear.toString()} />
            </SelectTrigger>
            <SelectContent 
              className="max-h-[200px] overflow-y-auto z-[150] bg-popover" 
              position="popper"
              align="start"
              sideOffset={4}
            >
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()} className="cursor-pointer">
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-x-1 flex items-center absolute right-1">
          <button
            onClick={() => previousMonth && goToMonth(previousMonth)}
            disabled={!previousMonth}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            )}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous month</span>
          </button>
          <button
            onClick={() => nextMonth && goToMonth(nextMonth)}
            disabled={!nextMonth}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            )}
            type="button"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next month</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto bg-popover shadow-lg", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium hidden", // Hide default caption
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
        Caption: CustomCaption,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
