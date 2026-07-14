"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import type { StudentYearKey } from "@/types/Student-api/grades";
import { useAuth } from "@/hooks/useAuth";

const STORAGE_KEY = "studentSelectedYear";

interface StudentYearContextType {
  /** Year the user is currently viewing (from Years page selection). */
  selectedYear: StudentYearKey | null;
  /** Current academic year from API/profile (e.g. senior). Used when selectedYear is null. */
  currentYear: StudentYearKey;
  /** Year to use for display and API calls: selectedYear ?? currentYear */
  displayYear: StudentYearKey;
  setSelectedYear: (year: StudentYearKey | null) => void;
  setCurrentYear: (year: StudentYearKey) => void;
}

const defaultYear: StudentYearKey = "senior";

const StudentYearContext = createContext<StudentYearContextType | undefined>(undefined);

export function StudentYearProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [selectedYear, setSelectedYearState] = useState<StudentYearKey | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "junior" || stored === "senior" || stored === "wheeler" ? stored : null;
  });
  const [currentYear, setCurrentYear] = useState<StudentYearKey>(defaultYear);

  useEffect(() => {
    if (!user) {
      queueMicrotask(() => setSelectedYearState(null));
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }, [user]);

  const setSelectedYear = useCallback((year: StudentYearKey | null) => {
    setSelectedYearState(year);
    if (year) {
      localStorage.setItem(STORAGE_KEY, year);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const displayYear = selectedYear ?? currentYear;

  const value: StudentYearContextType = {
    selectedYear,
    currentYear,
    displayYear,
    setSelectedYear,
    setCurrentYear,
  };

  return (
    <StudentYearContext.Provider value={value}>
      {children}
    </StudentYearContext.Provider>
  );
}

export function useStudentYear() {
  const context = useContext(StudentYearContext);
  if (context === undefined) {
    throw new Error("useStudentYear must be used within StudentYearProvider");
  }
  return context;
}
