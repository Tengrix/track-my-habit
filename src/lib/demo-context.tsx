"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { DataService } from "@/lib/data-service";
import type { TopicNode } from "@/lib/types";
import { createDemoDataService } from "@/lib/demo-data-service";
import { createServerDataService } from "@/lib/server-data-service";

interface DataContextValue {
  isDemo: boolean;
  service: DataService;
  topics: TopicNode[];
  refreshTopics: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

interface DataProviderProps {
  isDemo: boolean;
  initialTopics: TopicNode[];
  children: ReactNode;
}

export function DataProvider({ isDemo, initialTopics, children }: DataProviderProps) {
  const service = useMemo(
    () => (isDemo ? createDemoDataService() : createServerDataService()),
    [isDemo]
  );

  const [topics, setTopics] = useState<TopicNode[]>(initialTopics);

  // Sync with server props for authenticated mode
  useEffect(() => {
    setTopics(initialTopics);
  }, [initialTopics]);

  // For demo mode, load topics from localStorage on mount
  useEffect(() => {
    if (isDemo) {
      service.getTopics().then(setTopics);
    }
  }, [isDemo, service]);

  const refreshTopics = useCallback(async () => {
    const fresh = await service.getTopics();
    setTopics(fresh);
  }, [service]);

  const value = useMemo(
    () => ({ isDemo, service, topics, refreshTopics }),
    [isDemo, service, topics, refreshTopics]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
