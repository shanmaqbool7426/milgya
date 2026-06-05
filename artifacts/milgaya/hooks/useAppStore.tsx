import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LostItem, FoundItem } from "@/constants/types";

export interface MatchHistoryEntry {
  id: string;
  reportTitle: string;
  reportCategory: string;
  reportLocation: string;
  matchCount: number;
  topMatchTitle?: string;
  topMatchScore?: number;
  date: string;
}

interface AppStoreData {
  myReports: LostItem[];
  myFoundReports: FoundItem[];
  matchHistory: MatchHistoryEntry[];
}

interface AppStoreContextValue extends AppStoreData {
  addReport: (report: LostItem) => Promise<void>;
  addFoundReport: (report: FoundItem) => Promise<void>;
  addMatchHistory: (entry: MatchHistoryEntry) => Promise<void>;
  updateReport: (id: string, patch: Partial<LostItem>) => Promise<void>;
  clearAll: () => Promise<void>;
  isLoaded: boolean;
}

const STORAGE_KEY = "milgaya_store_v2";

const AppStoreContext = createContext<AppStoreContextValue>({
  myReports: [],
  myFoundReports: [],
  matchHistory: [],
  addReport: async () => {},
  addFoundReport: async () => {},
  addMatchHistory: async () => {},
  updateReport: async () => {},
  clearAll: async () => {},
  isLoaded: false,
});

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [myReports, setMyReports] = useState<LostItem[]>([]);
  const [myFoundReports, setMyFoundReports] = useState<FoundItem[]>([]);
  const [matchHistory, setMatchHistory] = useState<MatchHistoryEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: AppStoreData = JSON.parse(raw);
          setMyReports(parsed.myReports ?? []);
          setMyFoundReports(parsed.myFoundReports ?? []);
          setMatchHistory(parsed.matchHistory ?? []);
        }
      } catch (_) {
      } finally {
        setIsLoaded(true);
      }
    }
    load();
  }, []);

  const persist = useCallback(
    async (
      reports: LostItem[],
      foundReports: FoundItem[],
      history: MatchHistoryEntry[]
    ) => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            myReports: reports,
            myFoundReports: foundReports,
            matchHistory: history,
          })
        );
      } catch (_) {}
    },
    []
  );

  const addReport = useCallback(
    async (report: LostItem) => {
      const next = [report, ...myReports];
      setMyReports(next);
      await persist(next, myFoundReports, matchHistory);
    },
    [myReports, myFoundReports, matchHistory, persist]
  );

  const addFoundReport = useCallback(
    async (report: FoundItem) => {
      const next = [report, ...myFoundReports];
      setMyFoundReports(next);
      await persist(myReports, next, matchHistory);
    },
    [myReports, myFoundReports, matchHistory, persist]
  );

  const addMatchHistory = useCallback(
    async (entry: MatchHistoryEntry) => {
      const next = [entry, ...matchHistory].slice(0, 50);
      setMatchHistory(next);
      await persist(myReports, myFoundReports, next);
    },
    [myReports, myFoundReports, matchHistory, persist]
  );

  const updateReport = useCallback(
    async (id: string, patch: Partial<LostItem>) => {
      const next = myReports.map((r) => (r.id === id ? { ...r, ...patch } : r));
      setMyReports(next);
      await persist(next, myFoundReports, matchHistory);
    },
    [myReports, myFoundReports, matchHistory, persist]
  );

  const clearAll = useCallback(async () => {
    setMyReports([]);
    setMyFoundReports([]);
    setMatchHistory([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AppStoreContext.Provider
      value={{
        myReports,
        myFoundReports,
        matchHistory,
        addReport,
        addFoundReport,
        addMatchHistory,
        updateReport,
        clearAll,
        isLoaded,
      }}
    >
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore() {
  return useContext(AppStoreContext);
}
