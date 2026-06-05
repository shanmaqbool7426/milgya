import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LostItem } from "@/constants/types";

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
  matchHistory: MatchHistoryEntry[];
}

interface AppStoreContextValue extends AppStoreData {
  addReport: (report: LostItem) => Promise<void>;
  addMatchHistory: (entry: MatchHistoryEntry) => Promise<void>;
  clearAll: () => Promise<void>;
  isLoaded: boolean;
}

const STORAGE_KEY = "milgaya_store_v1";

const AppStoreContext = createContext<AppStoreContextValue>({
  myReports: [],
  matchHistory: [],
  addReport: async () => {},
  addMatchHistory: async () => {},
  clearAll: async () => {},
  isLoaded: false,
});

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [myReports, setMyReports] = useState<LostItem[]>([]);
  const [matchHistory, setMatchHistory] = useState<MatchHistoryEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: AppStoreData = JSON.parse(raw);
          setMyReports(parsed.myReports ?? []);
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
    async (reports: LostItem[], history: MatchHistoryEntry[]) => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ myReports: reports, matchHistory: history })
        );
      } catch (_) {}
    },
    []
  );

  const addReport = useCallback(
    async (report: LostItem) => {
      const next = [report, ...myReports];
      setMyReports(next);
      await persist(next, matchHistory);
    },
    [myReports, matchHistory, persist]
  );

  const addMatchHistory = useCallback(
    async (entry: MatchHistoryEntry) => {
      const next = [entry, ...matchHistory].slice(0, 50);
      setMatchHistory(next);
      await persist(myReports, next);
    },
    [myReports, matchHistory, persist]
  );

  const clearAll = useCallback(async () => {
    setMyReports([]);
    setMatchHistory([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AppStoreContext.Provider
      value={{
        myReports,
        matchHistory,
        addReport,
        addMatchHistory,
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
