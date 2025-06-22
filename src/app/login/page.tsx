import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md bg-background/80 backdrop-blur-sm border-primary/50 shadow-2xl shadow-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo />
          </div>
          <CardTitle className="font-headline text-3xl">Admin/Restaurant Login</CardTitle>
          <CardDescription>Enter your credentials to manage your digital storefront.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="user@domain.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_theme(colors.primary)]">
              Login with Hologram Key
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Not an admin?{" "}
            <Link href="/" className="text-accent hover:underline">
              Return to main portal
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
