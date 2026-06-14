import { create } from "zustand";
import { ReportCategory, CommunityReport } from "@/types";

interface AppState {
  theme: "dark" | "light";
  toggleTheme: () => void;
  selectedReportCategory: ReportCategory | "all";
  setReportCategory: (category: ReportCategory | "all") => void;
  communityReports: CommunityReport[];
  setCommunityReports: (reports: CommunityReport[]) => void;
  upvoteReport: (id: string) => void;
  confirmReport: (id: string) => void;
  addReport: (report: CommunityReport) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: "dark",
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
  selectedReportCategory: "all",
  setReportCategory: (category) => set({ selectedReportCategory: category }),
  communityReports: [],
  setCommunityReports: (reports) => set({ communityReports: reports }),
  upvoteReport: (id) =>
    set((state) => ({
      communityReports: state.communityReports.map((r) =>
        r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r
      ),
    })),
  confirmReport: (id) =>
    set((state) => ({
      communityReports: state.communityReports.map((r) =>
        r.id === id ? { ...r, confirmations: r.confirmations + 1 } : r
      ),
    })),
  addReport: (report) =>
    set((state) => ({
      communityReports: [report, ...state.communityReports],
    })),
  isLoading: true,
  setLoading: (loading) => set({ isLoading: loading }),
}));
