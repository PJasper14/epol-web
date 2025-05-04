import "../../globals.css";
import { IncidentProvider } from "./IncidentContext";
 
export default function SafeguardingLayout({ children }: { children: React.ReactNode }) {
  return <IncidentProvider>{children}</IncidentProvider>;
} 