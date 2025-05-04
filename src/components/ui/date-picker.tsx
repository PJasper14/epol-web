import * as React from "react";
import { CalendarIcon, X, ChevronDown, Calendar } from "lucide-react";
import { format, getYear, getMonth, setMonth, setYear, startOfMonth } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface SingleDatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
}

// Define types for renderCustomHeader props
interface CustomHeaderProps {
  date: Date;
  changeYear: (year: number) => void;
  changeMonth: (month: number) => void;
  decreaseMonth: () => void;
  increaseMonth: () => void;
  prevMonthButtonDisabled: boolean;
  nextMonthButtonDisabled: boolean;
}

export function SingleDatePicker({ value, onChange }: SingleDatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'date' | 'month'>('date');
  
  // Generate years (from 10 years ago to 10 years in the future)
  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);
  }, []);
  
  // Month names
  const months = React.useMemo(() => [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ], []);
  
  // Handle month selection
  const handleMonthSelect = (month: number) => {
    const newDate = new Date();
    if (value) {
      newDate.setFullYear(value.getFullYear());
    }
    newDate.setMonth(month);
    newDate.setDate(1); // Start of month
    onChange(newDate);
    setViewMode('date');
  };
  
  // Custom header with month and year dropdowns
  const renderCustomHeader = React.useCallback(({
    date,
    changeYear,
    changeMonth,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }: CustomHeaderProps) => (
    <div className="flex items-center justify-between px-2 py-2">
      <button
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        className="p-1 rounded-full hover:bg-red-700 text-white disabled:opacity-30"
        type="button"
      >
        <span className="sr-only">Previous Month</span>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <div className="flex gap-2">
        <div className="relative">
          <button
            onClick={() => setViewMode('month')}
            type="button"
            className="month-dropdown appearance-none bg-red-700 text-white px-3 py-1 pr-7 rounded border border-red-500 cursor-pointer text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white"
          >
            {months[getMonth(date)]}
            <ChevronDown className="h-3 w-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white" />
          </button>
        </div>
        
        <div className="relative">
          <select
            value={getYear(date)}
            onChange={({ target: { value } }) => changeYear(parseInt(value, 10))}
            className="year-dropdown appearance-none bg-red-700 text-white px-3 py-1 pr-7 rounded border border-red-500 cursor-pointer text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white"
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <ChevronDown className="h-3 w-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white" />
        </div>
      </div>
      
      <button
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
        className="p-1 rounded-full hover:bg-red-700 text-white disabled:opacity-30"
        type="button"
      >
        <span className="sr-only">Next Month</span>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  ), [months, setViewMode]);
  
  // Render month selection grid
  const renderMonthSelection = () => {
    const currentYear = value ? value.getFullYear() : new Date().getFullYear();
    
    return (
      <div className="month-selector bg-red-600 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold">Select Month</h3>
          <button 
            onClick={() => setViewMode('date')}
            className="text-white hover:underline text-sm font-medium"
          >
            Cancel
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {months.map((month, index) => (
            <button
              key={month}
              onClick={() => handleMonthSelect(index)}
              className={`py-2 px-3 text-sm rounded-md transition-colors ${
                value && getMonth(value) === index 
                  ? 'bg-white text-red-600 font-medium' 
                  : 'text-white hover:bg-red-700'
              }`}
            >
              {month}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={value ? "default" : "outline"}
          className={cn(
            "min-w-[180px] max-w-[260px] w-auto justify-start text-left font-normal relative",
            value
              ? "bg-red-600 text-white hover:bg-red-700 shadow-md"
              : ""
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            format(value, "LLL dd, y")
          ) : (
            <span>Pick a date</span>
          )}
          {value && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer hover:bg-red-700/20 rounded-full p-1"
            >
              <X className="h-4 w-4" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-transparent border-0 shadow-none">
        <div className="flex flex-col">
          <div className="bg-red-600 text-white p-3 rounded-t-lg flex justify-between">
            <div>
              <span className="font-semibold">Date:</span> {value ? format(value, "EEEE, d MMM") : <span className="text-gray-200">Select</span>}
            </div>
            <button
              onClick={() => onChange(null)}
              className="text-white hover:underline text-sm font-medium"
            >
              Reset
            </button>
          </div>
          
          {viewMode === 'date' ? (
            <DatePicker
              selected={value}
              onChange={(date) => {
                onChange(date);
                if (date) setOpen(false);
              }}
              inline
              calendarClassName="datepicker-calendar"
              renderCustomHeader={renderCustomHeader}
              showMonthDropdown={false}
              showYearDropdown={false}
            />
          ) : (
            renderMonthSelection()
          )}
          
          <div className="bg-red-600 text-white p-3 rounded-b-lg flex justify-end border-t border-red-700">
            <button
              onClick={() => setOpen(false)}
              className="bg-white text-red-600 rounded-md px-6 py-2 hover:bg-gray-100 transition-colors font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 