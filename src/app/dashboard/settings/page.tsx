import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
        <Button>Save Changes</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="font-medium">Email Notifications:</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="emailIncidents" defaultChecked />
                <Label htmlFor="emailIncidents">Incident Reports</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="emailStock" defaultChecked />
                <Label htmlFor="emailStock">Low Stock Alerts</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="emailSummary" />
                <Label htmlFor="emailSummary">Daily Summary</Label>
              </div>
            </div>

            <h3 className="font-medium mt-4">SMS Notifications:</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="smsCritical" defaultChecked />
                <Label htmlFor="smsCritical">Critical Incidents</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="smsCheckins" />
                <Label htmlFor="smsCheckins">Team Check-ins</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="font-medium">Low Stock Threshold:</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input type="radio" id="globalThreshold" name="thresholdType" value="global" />
                <Label htmlFor="globalThreshold">Global Setting</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="perItemThreshold" name="thresholdType" value="perItem" defaultChecked />
                <Label htmlFor="perItemThreshold">Per-Item Setting</Label>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="defaultThreshold">Default Threshold:</Label>
              <Input id="defaultThreshold" type="number" defaultValue="10" />
            </div>
          </CardContent>
        </Card>

        {/* System Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle>System Maintenance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="font-medium">Database Backup:</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input type="radio" id="backupDaily" name="backupFrequency" value="daily" defaultChecked />
                <Label htmlFor="backupDaily">Daily</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="backupWeekly" name="backupFrequency" value="weekly" />
                <Label htmlFor="backupWeekly">Weekly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="backupMonthly" name="backupFrequency" value="monthly" />
                <Label htmlFor="backupMonthly">Monthly</Label>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Last Backup: Jun 14, 2024 01:00 AM</p>
              <Button variant="outline" size="sm">Run Backup</Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="archiveAfter">Auto-Archive After:</Label>
              <select
                id="archiveAfter"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="3">3 Months</option>
                <option value="6" selected>6 Months</option>
                <option value="12">12 Months</option>
                <option value="never">Never</option>
              </select>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium text-red-600">Danger Zone</h3>
              <p className="text-sm text-muted-foreground mb-2">These actions cannot be undone</p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">Clear Cache</Button>
                <Button variant="destructive" size="sm">Reset Database</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 