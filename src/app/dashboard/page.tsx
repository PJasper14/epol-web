import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <div className="text-sm text-muted-foreground">📅 {new Date().toLocaleDateString()}</div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center">
              <p className="text-4xl font-bold">45</p>
              <p className="text-sm text-muted-foreground">Staff Active</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center">
              <p className="text-4xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">New Incidents</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center">
              <p className="text-4xl font-bold">8</p>
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Activity Timeline</h3>
        <Card>
          <CardContent className="p-6">
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-sm text-muted-foreground w-28">• 09:45</span>
                <span>New incident reported: Water pollution</span>
              </li>
              <li className="flex items-start">
                <span className="text-sm text-muted-foreground w-28">• 09:30</span>
                <span>Low stock alert: Safety vests</span>
              </li>
              <li className="flex items-start">
                <span className="text-sm text-muted-foreground w-28">• 08:15</span>
                <span>Team A completed check-in</span>
              </li>
              <li className="flex items-start">
                <span className="text-sm text-muted-foreground w-28">• 08:00</span>
                <span>Team B missed scheduled check-in</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center bg-muted/20">
              [Bar Chart]
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Incidents by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center bg-muted/20">
              [Pie Chart]
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 