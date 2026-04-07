import { OpsLayout } from "@/components/ops/OpsLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Settings, DollarSign, Users, Shield, Bell, Database } from "lucide-react";
import { toast } from "sonner";

export default function OpsSettings() {
  const [paymentGate, setPaymentGate] = useState("post_delivery");
  const [blockingBehavior, setBlockingBehavior] = useState("soft_block");
  const [partialAdvance, setPartialAdvance] = useState(50);
  const [autoConfirmEmail, setAutoConfirmEmail] = useState(false);
  const [maxSessions, setMaxSessions] = useState(3);
  const [inactivityTimeout, setInactivityTimeout] = useState(30);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [vahanCronInterval, setVahanCronInterval] = useState(14);
  const [complianceDeadlineDays, setComplianceDeadlineDays] = useState(180);
  const [parkingDailyRate, setParkingDailyRate] = useState(200);

  const handleSave = (section: string) => {
    toast.success(`${section} settings saved successfully`);
  };

  return (
    <OpsLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">System configuration · Super Admin only</p>
        </div>

        <Tabs defaultValue="payment" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="payment" className="gap-1 text-xs"><DollarSign className="h-3.5 w-3.5" />Payment Gates</TabsTrigger>
            <TabsTrigger value="users" className="gap-1 text-xs"><Users className="h-3.5 w-3.5" />User Management</TabsTrigger>
            <TabsTrigger value="security" className="gap-1 text-xs"><Shield className="h-3.5 w-3.5" />Security</TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1 text-xs"><Bell className="h-3.5 w-3.5" />Notifications</TabsTrigger>
            <TabsTrigger value="system" className="gap-1 text-xs"><Database className="h-3.5 w-3.5" />System</TabsTrigger>
          </TabsList>

          {/* Payment Gate Configuration */}
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Gate Configuration</CardTitle>
                <CardDescription>Configure when payment is required in the deal lifecycle. Changes apply to new deals only.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Active Payment Gate</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: "pre_pickup", label: "Pre-Pickup", desc: "Payment required before pickup" },
                      { value: "post_pickup", label: "Post-Pickup", desc: "Payment after vehicle pickup" },
                      { value: "post_delivery", label: "Post-Delivery", desc: "Payment after broker delivery" },
                      { value: "partial", label: "Partial", desc: "Split payment at two stages" },
                    ].map((opt) => (
                      <button key={opt.value} onClick={() => setPaymentGate(opt.value)}
                        className={cn("rounded-lg border p-3 text-left transition-colors", paymentGate === opt.value ? "border-primary bg-primary/5" : "border-border hover:bg-accent")}>
                        <div className="flex items-center gap-2">
                          <div className={cn("h-3 w-3 rounded-full border-2", paymentGate === opt.value ? "border-primary bg-primary" : "border-muted-foreground")} />
                          <span className="text-sm font-medium">{opt.label}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {paymentGate === "partial" && (
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <Label className="text-sm font-semibold">Partial Payment Split</Label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Advance %</Label>
                        <Input type="number" value={partialAdvance} onChange={(e) => setPartialAdvance(Number(e.target.value))} className="mt-1" />
                        <p className="text-[10px] text-muted-foreground mt-1">Trigger: Allocation Confirmed</p>
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Balance %</Label>
                        <Input type="number" value={100 - partialAdvance} readOnly className="mt-1 bg-muted" />
                        <p className="text-[10px] text-muted-foreground mt-1">Trigger: Delivery Confirmed</p>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Blocking Behavior</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { value: "hard_block", label: "Hard Block", desc: "Pickup cannot proceed without payment" },
                      { value: "soft_block", label: "Soft Block", desc: "Proceeds but flagged for ops review" },
                      { value: "no_block", label: "No Block", desc: "Payment tracked independently" },
                    ].map((opt) => (
                      <button key={opt.value} onClick={() => setBlockingBehavior(opt.value)}
                        className={cn("rounded-lg border p-3 text-left transition-colors", blockingBehavior === opt.value ? "border-primary bg-primary/5" : "border-border hover:bg-accent")}>
                        <div className="flex items-center gap-2">
                          <div className={cn("h-3 w-3 rounded-full border-2", blockingBehavior === opt.value ? "border-primary bg-primary" : "border-muted-foreground")} />
                          <span className="text-sm font-medium">{opt.label}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">⚠️ Changes take effect for new deals only. In-flight deals continue with their original gate configuration.</p>
                </div>

                <Button onClick={() => handleSave("Payment Gate")}>Save Configuration</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ops User Management</CardTitle>
                <CardDescription>Manage ops team members, roles, and permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border">
                  <div className="grid grid-cols-5 gap-4 p-3 bg-muted/50 text-xs font-semibold text-muted-foreground">
                    <span>Name</span><span>Email</span><span>Roles</span><span>Status</span><span>Actions</span>
                  </div>
                  {[
                    { name: "Priya Mehta", email: "priya@drivex.in", roles: "ops_manager, onboarding_ops", status: "active" },
                    { name: "Amit Kumar", email: "amit@drivex.in", roles: "finance_ops", status: "active" },
                    { name: "Neha Sharma", email: "neha@drivex.in", roles: "onboarding_ops, kam", status: "active" },
                    { name: "Rekha M.", email: "rekha@drivex.in", roles: "qa_audit", status: "active" },
                    { name: "Suresh P.", email: "suresh@drivex.in", roles: "logistics_coordinator", status: "active" },
                    { name: "Arun K.", email: "arun@drivex.in", roles: "doc_exec", status: "active" },
                  ].map((user, i) => (
                    <div key={i} className="grid grid-cols-5 gap-4 p-3 border-t text-sm items-center">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-muted-foreground text-xs">{user.email}</span>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.split(", ").map(r => (
                          <span key={r} className="inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-800">{r}</span>
                        ))}
                      </div>
                      <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold bg-green-100 text-green-800 w-fit capitalize">{user.status}</span>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="text-xs h-7">Edit</Button>
                        <Button size="sm" variant="outline" className="text-xs h-7 text-destructive">Suspend</Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="gap-1"><Users className="h-4 w-4" /> Add Ops User</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Security Settings</CardTitle>
                <CardDescription>Session management, 2FA, and access controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Max Concurrent Sessions</Label>
                    <Input type="number" value={maxSessions} onChange={(e) => setMaxSessions(Number(e.target.value))} />
                    <p className="text-[10px] text-muted-foreground">Max sessions per user before oldest is revoked</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Inactivity Timeout (minutes)</Label>
                    <Input type="number" value={inactivityTimeout} onChange={(e) => setInactivityTimeout(Number(e.target.value))} />
                    <p className="text-[10px] text-muted-foreground">Auto-logout after this period of inactivity</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Require 2FA for Finance Ops</Label>
                    <p className="text-[10px] text-muted-foreground">Mandatory TOTP for Finance Ops and Super Admin roles</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Failed Login Lockout</Label>
                    <p className="text-[10px] text-muted-foreground">5 failed attempts → 15 min lockout + admin notification</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button onClick={() => handleSave("Security")}>Save Security Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notification Settings</CardTitle>
                <CardDescription>Configure automated reminders and alert thresholds</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Daily SLA Digest</Label>
                    <p className="text-[10px] text-muted-foreground">Send daily summary of overdue items to managers at 9 AM</p>
                  </div>
                  <Switch checked={dailyReminders} onCheckedChange={setDailyReminders} />
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Vahan Cron Interval (days)</Label>
                    <Input type="number" value={vahanCronInterval} onChange={(e) => setVahanCronInterval(Number(e.target.value))} />
                    <p className="text-[10px] text-muted-foreground">How often to check Vahan API for RTO status updates</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">RC Transfer Compliance Deadline (days)</Label>
                    <Input type="number" value={complianceDeadlineDays} onChange={(e) => setComplianceDeadlineDays(Number(e.target.value))} />
                    <p className="text-[10px] text-muted-foreground">Days after delivery for mandatory RC transfer</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Auto-Penalty on Compliance Breach</Label>
                    <p className="text-[10px] text-muted-foreground">Automatically apply penalties when RC transfer deadline passes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button onClick={() => handleSave("Notifications")}>Save Notification Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System */}
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Configuration</CardTitle>
                <CardDescription>Platform-wide operational parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Common Yard Parking Rate (₹/day)</Label>
                    <Input type="number" value={parkingDailyRate} onChange={(e) => setParkingDailyRate(Number(e.target.value))} />
                    <p className="text-[10px] text-muted-foreground">Daily parking charge for vehicles at common yard</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Default Commission Rate (%)</Label>
                    <Input type="number" defaultValue={5} />
                    <p className="text-[10px] text-muted-foreground">Platform commission on winning bids</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Cascade Offer Timeout (hours)</Label>
                    <Input type="number" defaultValue={1} />
                    <p className="text-[10px] text-muted-foreground">Time each broker gets to accept a cascade offer</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Max Cascade Validity (hours)</Label>
                    <Input type="number" defaultValue={6} />
                    <p className="text-[10px] text-muted-foreground">Total time window for cascade before marking as failed</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Zoho CRM Sync</Label>
                    <p className="text-[10px] text-muted-foreground">Enable outbound sync to Zoho for Services RTO requests</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">MetaX Event Sync</Label>
                    <p className="text-[10px] text-muted-foreground">Push status change events to MetaX analytics</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button onClick={() => handleSave("System")}>Save System Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </OpsLayout>
  );
}
