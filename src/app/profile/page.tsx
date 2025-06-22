import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Pen } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-headline text-4xl font-bold tracking-tight">User Profile</h1>
        <p className="text-muted-foreground">Manage your CyberFeast presence.</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
            <Card>
                <CardContent className="pt-6 flex flex-col items-center text-center">
                    <Avatar className="w-24 h-24 mb-4 border-4 border-primary">
                        <AvatarImage src="https://placehold.co/100x100.png" />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-bold font-headline">User Name</h2>
                    <p className="text-muted-foreground">user.email@cyber.com</p>
                    <div className="mt-4">
                        <Badge variant="secondary">Loyalty Points: 1,337</Badge>
                    </div>
                    <Button variant="ghost" size="sm" className="mt-4 gap-2">
                        <Pen className="w-3 h-3"/> Change Avatar
                    </Button>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue="UserName" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="user.email@cyber.com" disabled />
                </div>
              </div>
              
              <Separator />

              <div className="space-y-2">
                <Label>Saved Addresses</Label>
                <div className="p-4 border rounded-md bg-secondary/50">
                  <p className="font-semibold">Home Base</p>
                  <p className="text-sm text-muted-foreground">Starlight Tower, Apt 42, Neo-Kyoto</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Payment Methods</Label>
                <div className="p-4 border rounded-md bg-secondary/50">
                   <p className="font-semibold">CyberCard **** 2077</p>
                </div>
              </div>
              <Button className="bg-primary hover:bg-primary/90">Save Changes</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
