import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LostItem, FoundItem, Notification } from "@/constants/types";
import { FOUND_ITEMS } from "@/constants/mockData";

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
  notifications: Notification[];
  seenMatchPairs: string[];
}

interface AppStoreContextValue extends AppStoreData {
  addReport: (report: LostItem) => Promise<void>;
  addFoundReport: (report: FoundItem) => Promise<void>;
  addMatchHistory: (entry: MatchHistoryEntry) => Promise<void>;
  updateReport: (id: string, patch: Partial<LostItem>) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  deleteFoundReport: (id: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  unreadCount: number;
  isLoaded: boolean;
}

const STORAGE_KEY = "milgaya_store_v3";

const AppStoreContext = createContext<AppStoreContextValue>({
  myReports: [],
  myFoundReports: [],
  matchHistory: [],
  notifications: [],
  seenMatchPairs: [],
  addReport: async () => {},
  addFoundReport: async () => {},
  addMatchHistory: async () => {},
  updateReport: async () => {},
  deleteReport: async () => {},
  deleteFoundReport: async () => {},
  markNotificationRead: async () => {},
  markAllNotificationsRead: async () => {},
  clearAll: async () => {},
  unreadCount: 0,
  isLoaded: false,
});

function scoreMatch(lost: LostItem, found: FoundItem): number {
  let score = 0;
  if (lost.category === found.category) score += 60;
  const lostWords = lost.title.toLowerCase().split(/\s+/);
  const foundWords = found.title.toLowerCase().split(/\s+/);
  const shared = lostWords.filter((w) => w.length > 3 && foundWords.includes(w));
  score += shared.length * 15;
  const lostDesc = lost.description.toLowerCase();
  const foundDesc = found.description.toLowerCase();
  lostWords.forEach((w) => {
    if (w.length > 4 && foundDesc.includes(w)) score += 5;
  });
  return Math.min(score, 99);
}

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [myReports, setMyReports] = useState<LostItem[]>([]);
  const [myFoundReports, setMyFoundReports] = useState<FoundItem[]>([]);
  const [matchHistory, setMatchHistory] = useState<MatchHistoryEntry[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [seenMatchPairs, setSeenMatchPairs] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: Partial<AppStoreData> = JSON.parse(raw);
          setMyReports(parsed.myReports ?? []);
          setMyFoundReports(parsed.myFoundReports ?? []);
          setMatchHistory(parsed.matchHistory ?? []);
          setNotifications(parsed.notifications ?? []);
          setSeenMatchPairs(parsed.seenMatchPairs ?? []);
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
      history: MatchHistoryEntry[],
      notifs: Notification[],
      pairs: string[]
    ) => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            myReports: reports,
            myFoundReports: foundReports,
            matchHistory: history,
            notifications: notifs,
            seenMatchPairs: pairs,
          })
        );
      } catch (_) {}
    },
    []
  );

  // Auto-generate match notifications whenever active reports change
  useEffect(() => {
    if (!isLoaded || myReports.length === 0) return;

    const activeReports = myReports.filter((r) => r.status === "active");
    if (activeReports.length === 0) return;

    let newPairs = [...seenMatchPairs];
    const newNotifs: Notification[] = [];

    for (const lost of activeReports) {
      for (const found of FOUND_ITEMS) {
        const pairKey = `${lost.id}:${found.id}`;
        if (newPairs.includes(pairKey)) continue;

        const score = scoreMatch(lost, found);
        if (score >= 60) {
          newPairs.push(pairKey);
          const notif: Notification = {
            id: `match-${lost.id}-${found.id}`,
            type: "match",
            title: "Potential Match Found!",
            message: `Your "${lost.title}" (${lost.category}) may match a found item at ${found.foundLocation}. ${score}% similarity.`,
            time: "Just now",
            isRead: false,
            itemId: found.id,
          };
          newNotifs.push(notif);
        }
      }
    }

    if (newNotifs.length > 0) {
      const merged = [...newNotifs, ...notifications].slice(0, 50);
      setNotifications(merged);
      setSeenMatchPairs(newPairs);
      persist(myReports, myFoundReports, matchHistory, merged, newPairs);
    }
  // Only run when reports or load state changes — intentionally omitting notification/pair state
  // to avoid infinite loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, myReports]);

  const addReport = useCallback(
    async (report: LostItem) => {
      const next = [report, ...myReports];
      setMyReports(next);
      await persist(next, myFoundReports, matchHistory, notifications, seenMatchPairs);
    },
    [myReports, myFoundReports, matchHistory, notifications, seenMatchPairs, persist]
  );

  const addFoundReport = useCallback(
    async (report: FoundItem) => {
      const next = [report, ...myFoundReports];
      setMyFoundReports(next);
      await persist(myReports, next, matchHistory, notifications, seenMatchPairs);
    },
    [myReports, myFoundReports, matchHistory, notifications, seenMatchPairs, persist]
  );

  const addMatchHistory = useCallback(
    async (entry: MatchHistoryEntry) => {
      const next = [entry, ...matchHistory].slice(0, 50);
      setMatchHistory(next);
      await persist(myReports, myFoundReports, next, notifications, seenMatchPairs);
    },
    [myReports, myFoundReports, matchHistory, notifications, seenMatchPairs, persist]
  );

  const updateReport = useCallback(
    async (id: string, patch: Partial<LostItem>) => {
      const next = myReports.map((r) => (r.id === id ? { ...r, ...patch } : r));
      setMyReports(next);
      await persist(next, myFoundReports, matchHistory, notifications, seenMatchPairs);
    },
    [myReports, myFoundReports, matchHistory, notifications, seenMatchPairs, persist]
  );

  const deleteReport = useCallback(
    async (id: string) => {
      const next = myReports.filter((r) => r.id !== id);
      const nextPairs = seenMatchPairs.filter((p) => !p.startsWith(`${id}:`));
      setMyReports(next);
      setSeenMatchPairs(nextPairs);
      await persist(next, myFoundReports, matchHistory, notifications, nextPairs);
    },
    [myReports, myFoundReports, matchHistory, notifications, seenMatchPairs, persist]
  );

  const deleteFoundReport = useCallback(
    async (id: string) => {
      const next = myFoundReports.filter((r) => r.id !== id);
      setMyFoundReports(next);
      await persist(myReports, next, matchHistory, notifications, seenMatchPairs);
    },
    [myReports, myFoundReports, matchHistory, notifications, seenMatchPairs, persist]
  );

  const markNotificationRead = useCallback(
    async (id: string) => {
      const next = notifications.map((n) => n.id === id ? { ...n, isRead: true } : n);
      setNotifications(next);
      await persist(myReports, myFoundReports, matchHistory, next, seenMatchPairs);
    },
    [myReports, myFoundReports, matchHistory, notifications, seenMatchPairs, persist]
  );

  const markAllNotificationsRead = useCallback(async () => {
    const next = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(next);
    await persist(myReports, myFoundReports, matchHistory, next, seenMatchPairs);
  }, [myReports, myFoundReports, matchHistory, notifications, seenMatchPairs, persist]);

  const clearAll = useCallback(async () => {
    setMyReports([]);
    setMyFoundReports([]);
    setMatchHistory([]);
    setNotifications([]);
    setSeenMatchPairs([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AppStoreContext.Provider
      value={{
        myReports,
        myFoundReports,
        matchHistory,
        notifications,
        seenMatchPairs,
        addReport,
        addFoundReport,
        addMatchHistory,
        updateReport,
        deleteReport,
        deleteFoundReport,
        markNotificationRead,
        markAllNotificationsRead,
        clearAll,
        unreadCount,
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
