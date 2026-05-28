import React, { useState, useEffect } from 'react';

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const currentYear = new Date().getFullYear();
// Create an array of years from currentYear + 5 down to currentYear - 50
const YEARS = Array.from({ length: 56 }, (_, i) => currentYear + 5 - i);

export default function MonthYearPicker({ value, onChange, isEndDate, presentLabel = "Present" }) {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [isPresent, setIsPresent] = useState(false);

  // Parse initial or incoming value to update local state
  useEffect(() => {
    if (!value) {
      setMonth("");
      setYear("");
      setIsPresent(false);
      return;
    }

    if (isEndDate && value.toLowerCase() === "present") {
      setIsPresent(true);
      setMonth("");
      setYear("");
      return;
    }

    setIsPresent(false);
    
    let parsedMonth = "";
    let parsedYear = "";

    const parts = value.split(/[\s-]+/);
    if (parts.length >= 2) {
      if (isNaN(parts[0])) {
        // e.g. "Jan 2023"
        parsedMonth = parts[0].substring(0, 3);
        parsedYear = parts[1];
      } else {
        // e.g. "2023-01" or "01-2023"
        if (parts[0].length === 4) {
          parsedYear = parts[0];
          const monthIndex = parseInt(parts[1], 10) - 1;
          if (monthIndex >= 0 && monthIndex < 12) {
            parsedMonth = MONTHS[monthIndex];
          }
        } else {
          const monthIndex = parseInt(parts[0], 10) - 1;
          if (monthIndex >= 0 && monthIndex < 12) {
            parsedMonth = MONTHS[monthIndex];
          }
          parsedYear = parts[1];
        }
      }
    } else if (parts.length === 1 && parts[0].length === 4 && !isNaN(parts[0])) {
        parsedYear = parts[0];
    } else {
        const yearMatch = value.match(/\d{4}/);
        if (yearMatch) parsedYear = yearMatch[0];
        MONTHS.forEach(m => {
            if (value.toLowerCase().includes(m.toLowerCase())) parsedMonth = m;
        });
    }

    setMonth(MONTHS.find(m => m.toLowerCase() === parsedMonth.toLowerCase()) || "");
    setYear(parsedYear || "");
  }, [value, isEndDate]);

  const handleMonthChange = (e) => {
    const newMonth = e.target.value;
    setMonth(newMonth);
    onChange(newMonth && year ? `${newMonth} ${year}` : newMonth || year || "");
  };

  const handleYearChange = (e) => {
    const newYear = e.target.value;
    setYear(newYear);
    onChange(month && newYear ? `${month} ${newYear}` : month || newYear || "");
  };

  const handlePresentChange = (e) => {
    const checked = e.target.checked;
    setIsPresent(checked);
    if (checked) {
      onChange("Present");
    } else {
      onChange(month && year ? `${month} ${year}` : month || year || "");
    }
  };

  return (
    <div className="d-flex flex-column gap-2 w-100">
      <div className="d-flex gap-2 w-100">
        <select 
          className="input-control form-select" 
          value={month} 
          onChange={handleMonthChange}
          disabled={isPresent}
          style={{ flex: 1, minWidth: "80px", color: isPresent ? "#64748b" : "inherit" }}
        >
          <option value="">Month</option>
          {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        
        <select 
          className="input-control form-select" 
          value={year} 
          onChange={handleYearChange}
          disabled={isPresent}
          style={{ flex: 1, minWidth: "80px", color: isPresent ? "#64748b" : "inherit" }}
        >
          <option value="">Year</option>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      {isEndDate && (
        <div className="mt-1">
          <label className="form-check-label d-flex align-items-center gap-2" style={{ fontSize: "0.85rem", color: "#94a3b8", cursor: "pointer", userSelect: "none" }}>
            <input 
              className="form-check-input m-0" 
              type="checkbox" 
              checked={isPresent} 
              onChange={handlePresentChange} 
              style={{ cursor: "pointer" }}
            />
            {presentLabel}
          </label>
        </div>
      )}
    </div>
  );
}
