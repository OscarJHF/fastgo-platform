export interface ApiError {
  timestamp?: string;
  status: number;
  error: string;
  message: string;
  fields?: Record<string, string>;
}
