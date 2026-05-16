'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { RosterData } from '@/lib/types';
import { extractDestinations } from '@/lib/utils/destinations';
import { calculateKilometers, formatBlockHours } from '@/lib/utils/geo/haversine';
import { useAuth } from './AuthContext';
import { fetchUserRoster, deleteMonthlyRoster } from '@/lib/actions/roster';
import { recomputeStats } from '@/lib/passport-stats';
import { saveRosterData } from '@/lib/actions/parseRoster';

interface RosterContextType {
  roster: RosterData | null;
  history: { month: string; year: string }[];
  isLoading: boolean;
  error: string | null;
  setRoster: (roster: RosterData) => Promise<void>;
  syncToSupabase: (data: RosterData) => Promise<{ success: boolean; error?: string }>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  loadSampleRoster: () => void;
  switchMonth: (month: string, year: string, includePrevious?: boolean) => Promise<void>;
  deleteRosterMonth: (month: string, year: string) => Promise<void>;
  refresh: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

const RosterContext = createContext<RosterContextType | undefined>(undefined);

const STORAGE_KEY = 'cemrosta-roster-storage';

export function RosterProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [roster, setRosterState] = useState<RosterData | null>(null);
  const [history, setHistory] = useState<{ month: string; year: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setErrorState] = useState<string | null>(null);

  const processRoster = useCallback((newRoster: RosterData): RosterData => {
    const destinations = extractDestinations(newRoster.events);
    const totalSectors = newRoster.events.filter((e) => e.type === 'FLIGHT').length;
    const totalDistance = newRoster.events.reduce((acc, e) => {
      if (e.type === 'FLIGHT' && e.depPort && e.arrPort) {
        return acc + calculateKilometers(e.depPort, e.arrPort);
      }
      return acc;
    }, 0);
    const totalBlockTime = formatBlockHours(newRoster.events);
    const uniqueDestinations = destinations.length;

    return {
      ...newRoster,
      destinations,
      stats: {
        totalSectors,
        totalMiles: totalDistance,
        totalBlockTime,
        uniqueDestinations,
      },
    };
  }, []);

  const setRoster = async (newRoster: RosterData) => {
    const processed = processRoster(newRoster);
    setRosterState(processed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { roster: processed } }));
    
    if (user) {
      // Refresh history after a new upload/set
      const result = await fetchUserRoster(user.id);
      if (result) setHistory(result.history);
    }
    
    setIsLoading(false);
    setErrorState(null);
  };

  const syncToSupabase = async (data: RosterData) => {
    if (!user) return { success: false, error: 'User not logged in' };
    
    setIsLoading(true);
    try {
      const result = await saveRosterData(user.id, data);
      if (result.success) {
        // Refresh history to include the new month
        const histResult = await fetchUserRoster(user.id);
        if (histResult) setHistory(histResult.history);
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (err) {
      console.error('Sync error:', err);
      return { success: false, error: 'Failed to sync with mission control' };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoster = useCallback(async (uid: string, m?: string, y?: string, includePrevious: boolean = false) => {
    setTimeout(() => setIsLoading(true), 0);
    try {
      const result = await fetchUserRoster(uid, m, y, includePrevious);
      if (result) {
        const processed = processRoster(result.roster);
        setRosterState(processed);
        setHistory(result.history);
        // Only save current/latest to local storage for quick reload
        if (!m && !y) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { roster: processed } }));
        }
      } else if (!m && !y) {
        // Only check local storage if no user data found and no specific month requested
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.state?.roster) setRosterState(parsed.state.roster);
          } catch (e) {
            console.error(e);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch roster', err);
    } finally {
      setIsLoading(false);
    }
  }, [processRoster]);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchRoster(user.id);
    } else {
      // Logged out: fallback to local storage
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.state?.roster) setRosterState(parsed.state.roster);
        } catch (e) {
          console.error(e);
        }
      }
      setIsLoading(false);
    }
  }, [user, fetchRoster]);

  const switchMonth = async (m: string, y: string, includePrevious: boolean = false) => {
    if (user) {
      await fetchRoster(user.id, m, y, includePrevious);
    }
  };

  const deleteRosterMonth = async (m: string, y: string) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const result = await deleteMonthlyRoster(user.id, m, y);
      if (result.success) {
        // Fetch remaining history to redirect if needed
        const histResult = await fetchUserRoster(user.id);
        if (histResult) {
          setHistory(histResult.history);
          if (histResult.history.length > 0) {
            // Switch to latest available month
            await fetchRoster(user.id, histResult.history[0].month, histResult.history[0].year);
          } else {
            // No history left, clear state
            setRosterState(null);
          }
        }
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    if (user) {
      await fetchRoster(user.id, roster?.month, roster?.year);
    }
  };

  const refreshStats = async () => {
    if (user) {
      await recomputeStats(user.id);
    }
  };

  const setLoading = (loading: boolean) => setIsLoading(loading);
  const setError = (err: string | null) => {
    setErrorState(err);
    setIsLoading(false);
  };
  const reset = () => {
    setRosterState(null);
    localStorage.removeItem(STORAGE_KEY);
    setIsLoading(false);
    setErrorState(null);
  };

  const loadSampleRoster = () => {
    const sampleData: RosterData = {
      month: 'May',
      year: '2026',
      crewName: 'Muhammad Azmierul',
      events: [
        {
          id: 'S4-353-02',
          type: 'STANDBY',
          date: '2026-05-02',
          signOn: '16:00',
          signOff: '23:59',
          description: 'A353 STANDBY DUTY 4',
        },
        {
          id: 'MH4-06',
          type: 'FLIGHT',
          date: '2026-05-06',
          flightNumber: 'MH 4',
          depPort: 'KUL',
          arrPort: 'LHR',
          signOn: '08:35',
          std: '09:53',
          sta: '16:33',
          signOff: '17:18',
          hotel: 'London Heathrow Hilton',
        },
        {
          id: 'MH1-07',
          type: 'FLIGHT',
          date: '2026-05-07',
          flightNumber: 'MH 1',
          depPort: 'LHR',
          arrPort: 'KUL',
          signOn: '20:35',
          std: '21:31',
          sta: '16:52',
          signOff: '17:37',
        },
        {
          id: 'MH376-18',
          type: 'FLIGHT',
          date: '2026-05-18',
          flightNumber: 'MH 376',
          depPort: 'KUL',
          arrPort: 'CAN',
          signOn: '07:45',
          std: '09:00',
          sta: '13:10',
          signOff: '14:00',
        },
        {
          id: 'MH377-18',
          type: 'FLIGHT',
          date: '2026-05-18',
          flightNumber: 'MH 377',
          depPort: 'CAN',
          arrPort: 'KUL',
          signOn: '14:25',
          sta: '18:30',
          signOff: '19:15',
        },
        {
          id: 'S2-353-28',
          type: 'STANDBY',
          date: '2026-05-28',
          signOn: '06:00',
          signOff: '16:00',
          description: 'A353 STANDBY DUTY 2',
        },
      ],
    };
    setRoster(sampleData);
  };

  return (
    <RosterContext.Provider
      value={{
        roster,
        history,
        isLoading,
        error,
        setRoster,
        syncToSupabase,
        setLoading,
        setError,
        reset,
        loadSampleRoster,
        switchMonth,
        deleteRosterMonth,
        refresh,
        refreshStats,
      }}
    >
      {children}
    </RosterContext.Provider>
  );
}

export function useRoster() {
  const context = useContext(RosterContext);
  if (context === undefined) {
    throw new Error('useRoster must be used within a RosterProvider');
  }
  return context;
}
