import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Reports Generator</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Report Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Report Type:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="attendance" name="reportType" value="attendance" />
                    <Label htmlFor="attendance">Attendance</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="incidents" name="reportType" value="incidents" />
                    <Label htmlFor="incidents">Incidents</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="inventory" name="reportType" value="inventory" defaultChecked />
                    <Label htmlFor="inventory">Inventory</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="summary" name="reportType" value="summary" />
                    <Label htmlFor="summary">Summary</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateRange">Date Range</Label>
                <Input id="dateRange" placeholder="Jun 01 - Jun 15" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <select
                  id="department"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">All Departments</option>
                  <option value="field">Field Team</option>
                  <option value="admin">Administrative</option>
                  <option value="management">Management</option>
                </select>
              </div>

              <div>
                <Label className="block mb-2">Categories</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="safety" defaultChecked />
                    <Label htmlFor="safety">Safety Equipment</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="tools" defaultChecked />
                    <Label htmlFor="tools">Tools</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="medical" defaultChecked />
                    <Label htmlFor="medical">Medical Supplies</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="office" />
                    <Label htmlFor="office">Office Supplies</Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Output Format</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="pdf" name="outputFormat" value="pdf" />
                    <Label htmlFor="pdf">PDF</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="excel" name="outputFormat" value="excel" defaultChecked />
                    <Label htmlFor="excel">Excel</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="csv" name="outputFormat" value="csv" />
                    <Label htmlFor="csv">CSV</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="print" name="outputFormat" value="print" />
                    <Label htmlFor="print">Print</Label>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-6">
                <Button className="w-full">Generate Report</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md divide-y">
            <div className="p-4 flex justify-between items-center">
              <div>
                <h4 className="font-medium">Inventory Summary - June 2024</h4>
                <p className="text-sm text-muted-foreground">Generated on Jun 15, 2024</p>
              </div>
              <Button variant="outline" size="sm">Download</Button>
            </div>
            <div className="p-4 flex justify-between items-center">
              <div>
                <h4 className="font-medium">Incident Report - May 2024</h4>
                <p className="text-sm text-muted-foreground">Generated on Jun 02, 2024</p>
              </div>
              <Button variant="outline" size="sm">Download</Button>
            </div>
            <div className="p-4 flex justify-between items-center">
              <div>
                <h4 className="font-medium">Attendance Summary - Q2 2024</h4>
                <p className="text-sm text-muted-foreground">Generated on May 30, 2024</p>
              </div>
              <Button variant="outline" size="sm">Download</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 