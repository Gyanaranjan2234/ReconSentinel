import { useState } from 'react';
import client from '../api/client';
import { ScanResult } from '../types';

export function useScan() {
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const triggerScan = async (payload: {
    target: string;
    port_range: string;
    threads: number;
    aggressive_detection: boolean;
    ping_discovery: boolean;
  }): Promise<ScanResult | null> => {
    setLoading(true);
    setScanError(null);
    setCurrentScan(null);
    try {
      const response = await client.post('/api/scan/', payload);
      const createdScan: ScanResult = response.data;
      setCurrentScan(createdScan);

      // Poll progress endpoint for this scan in the background
      (async () => {
        const pollInterval = 2000;
        const startTime = Date.now();
        let hasStarted = false;
        
        while (true) {
          try {
            const prog = await client.get(`/api/scan/progress/${createdScan.id}`);
            const progressData = prog.data;
            
            if (progressData.progress > 0) {
              hasStarted = true;
            } else if (!hasStarted && (Date.now() - startTime > 10000)) {
              const errMsg = `Scan ${createdScan.id} timed out (stuck in QUEUED for more than 10 seconds).`;
              console.error(errMsg);
              setScanError('Scan initialization timed out. Please try again.');
              setCurrentScan({
                ...createdScan,
                status: 'failed',
                results: { stage: 'timeout', progress: 100 }
              });
              break;
            }
            
            if (progressData.status === 'completed') {
              setCurrentScan({
                ...createdScan,
                status: 'completed',
                results: progressData.results
              });
              break;
            } else if (progressData.status === 'failed') {
              setScanError(progressData.error || progressData.results?.error || 'Scan failed');
              setCurrentScan({
                ...createdScan,
                status: 'failed',
                results: { stage: 'failed', progress: 100 }
              });
              break;
            } else {
              setCurrentScan({
                ...createdScan,
                status: 'scanning',
                results: { stage: progressData.stage, progress: progressData.progress }
              });
            }
          } catch (e: any) {
            console.error(`Progress poll failed for ${createdScan.id}:`, e.message);
            setScanError(`Polling failed: ${e.message}`);
            setCurrentScan({
              ...createdScan,
              status: 'failed',
              results: { stage: 'failed', progress: 100 }
            });
            break; // Stop polling on error
          }
          await new Promise((res) => setTimeout(res, pollInterval));
        }
      })();
      
      return createdScan;
    } catch (err) {
      console.error('Failed to trigger scan:', err);
      const message = err.response?.data?.detail || err.message || 'Unknown error';
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
