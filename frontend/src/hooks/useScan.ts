import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ScanResult } from '../types';

export function useScan() {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const refreshScans = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/scan/');
      setScans(response.data);
    } catch (err) {
      console.error('Failed to load scans:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerScan = async (payload: {
    target: string;
    port_range: string;
    threads: number;
    aggressive_mode: boolean;
    ping_discovery: boolean;
  }): Promise<ScanResult | null> => {
    setLoading(true);
    setScanError(null);
    try {
      const response = await axios.post('/api/scan/', payload);
      const createdScan: ScanResult = response.data;
      // Add created scan immediately
      setScans((prev) => [createdScan, ...prev.filter((scan) => scan.id !== createdScan.id)]);

      // Poll progress endpoint for this scan in the background
      (async () => {
        const pollInterval = 2000;
        while (true) {
          try {
            const prog = await axios.get(`/api/scan/progress/${createdScan.id}`);
            const latest: ScanResult = prog.data;
            // update local scans list with latest
            setScans((prev) => [latest, ...prev.filter((s) => s.id !== latest.id)]);
            if (latest.status !== 'scanning') {
              break;
            }
          } catch (e) {
            console.warn('Progress poll failed:', e);
          }
          await new Promise((res) => setTimeout(res, pollInterval));
        }
        // Refresh full list once done to ensure consistency
        await refreshScans();
      })();

      return createdScan;
    } catch (err) {
      console.error('Failed to trigger scan:', err);
      const message = axios.isAxiosError(err)
        ? err.response?.data?.detail || err.message
        : err instanceof Error
        ? err.message
        : 'Unknown error';
      setScanError(String(message));
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshScans();
    
    const interval = setInterval(() => {
      refreshScans();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [refreshScans]);

  const clearHistory = async (): Promise<boolean> => {
    setLoading(true);
    setScanError(null);
    try {
      await axios.delete('/api/scan/');
      await refreshScans();
      return true;
    } catch (err) {
      console.error('Failed to clear scan history:', err);
      const message = axios.isAxiosError(err)
        ? err.response?.data?.detail || err.message
        : err instanceof Error
        ? err.message
        : 'Unknown error';
      setScanError(String(message));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    scans,
    loading,
    scanError,
    triggerScan,
    refreshScans,
    clearHistory,
  };
}
