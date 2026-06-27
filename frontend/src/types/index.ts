export interface ScanResult {
  id: number;
  target: string;
  status: 'scanning' | 'completed' | 'failed';
  created_at: string;
  results: any;
  start_time?: string;
  end_time?: string;
  duration?: number;
  mitre_mappings?: any[];
}

export interface ThreatIntel {
  id: number;
  query: string;
  intelligence_type: string;
  summary: string;
  raw_response: any;
  created_at: string;
}
