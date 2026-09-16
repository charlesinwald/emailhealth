export interface Report {
  email: string;
  title: string;
  status: "healthy" | "unhealthy" | "unknown";
  message: string;
  expanded?: boolean;
}