import React from 'react';
import { motion } from 'framer-motion';
import { Save, Shield, Sliders, BellRing, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const AdminSettings: React.FC = () => {
  const { toast } = useToast();

  const handleSave = () => {
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Settings Saved",
        description: "System configuration has been updated successfully.",
        className: "bg-green-50 border-green-200"
      });
    }, 500);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">System Settings</h1>
          <p className="text-muted-foreground">Configure global inventory parameters</p>
        </div>
        <Button className="btn-primary-gradient" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" /> Save Changes
        </Button>
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="bg-muted/50 w-full justify-start h-12 p-1">
          <TabsTrigger value="inventory" className="data-[state=active]:bg-card h-10 px-6">
            <Sliders className="w-4 h-4 mr-2" /> Inventory Control
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-card h-10 px-6">
            <BellRing className="w-4 h-4 mr-2" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-card h-10 px-6">
            <Database className="w-4 h-4 mr-2" /> System & Data
          </TabsTrigger>
        </TabsList>

        {/* Inventory Settings */}
        <TabsContent value="inventory" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock Thresholds</CardTitle>
              <CardDescription>Set minimum stock levels to trigger low-stock alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Lab Equipment Min. Level (Default)</Label>
                  <Input type="number" defaultValue="5" />
                  <p className="text-xs text-muted-foreground">Global default for new lab equipment</p>
                </div>
                <div className="space-y-2">
                  <Label>Furniture Min. Level (Default)</Label>
                  <Input type="number" defaultValue="10" />
                  <p className="text-xs text-muted-foreground">Global default for new furniture items</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Policy Enforcement
                </h3>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base">Strict Stock-Out Prevention</Label>
                    <p className="text-sm text-muted-foreground">Prevent issuing items if stock reaches 0</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base">Auto-Approve Low Cost</Label>
                    <p className="text-sm text-muted-foreground">Auto-approve requests under Rs. 5,000</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Alerts</CardTitle>
              <CardDescription>Configure who gets notified for system events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base">Low Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">Notify Admin & HOD when stock is low</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base">New Request Alerts</Label>
                  <p className="text-sm text-muted-foreground">Notify Approvers immediately upon submission</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base">Weekly Reports</Label>
                  <p className="text-sm text-muted-foreground">Send summary reports every Monday</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>General Configuration</CardTitle>
              <CardDescription>System-wide parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Academic Year</Label>
                  <Input defaultValue="2024/2025" />
                </div>
                <div className="space-y-2">
                  <Label>University Name</Label>
                  <Input defaultValue="University of Jaffna" disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>System Maintenance Mode</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Switch />
                  <span className="text-sm text-muted-foreground">Enable to block non-admin access</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default AdminSettings;