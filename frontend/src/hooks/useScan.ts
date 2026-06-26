import { useState } from 'react';
import axios from 'axios';
import { ScanResult } from '../types';

export function useScan() {
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const triggerScan = async (payload: {
    target: string;
    port_range: string;
    threads: number;
    aggressive_mode: boolean;
    ping_discovery: boolean;
  }): Promise<ScanResult | null> => {
    setLoading(true);
    setScanError(null);
    setCurrentScan(null);
    try {
      const response = await axios.post('/api/scan/', payload);
      const createdScan: ScanResult = response.data;
      setCurrentScan(createdScan);

      // Poll progress endpoint for this scan in the background
      (async () => {
        const pollInterval = 2000;
        while (true) {
          try {
            const prog = await axios.get(`/api/scan/progress/${createdScan.id}`);
            const latest: ScanResult = prog.data;
            setCurrentScan(latest);
            if (latest.status !== 'scanning') {
              break;
            }
          } catch (e) {
            console.warn('Progress poll failed:', e);
            break; // Stop polling on error to avoid infinite loops if scan is lost
          }
          await new Promise((res) => setTimeout(res, pollInterval));
        }
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

  const clearScan = () => {
    setCurrentScan(null);
    setScanError(null);
  };

  return {
    currentScan,
    loading,
    scanError,
    triggerScan,
    clearScan,
  };
}
