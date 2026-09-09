export interface Report {
  email: string;
  title: string;
  status: "healthy" | "unhealthy";
  message: string;
  expanded?: boolean;
}