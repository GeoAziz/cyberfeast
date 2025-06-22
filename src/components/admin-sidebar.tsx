
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LayoutDashboard, LogOut, Shield, ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AdminSidebar({ user }: { user: any }) {
    const router = useRouter();
    const { toast } = useToast();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast({ title: "Logged Out", description: "You have been successfully logged out." });
            router.push("/");
        } catch (error) {
            toast({ variant: "destructive", title: "Logout Failed", description: "Could not log you out. Please try again." });
        }
    };

    return (
        <div className="flex h-screen w-64 flex-col justify-between border-r bg-background p-4">
            <div>
                <div className="px-2 mb-4">
                    <Logo />
                </div>
                <nav className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                       <Link href="/admin">
                            <Shield className="h-4 w-4" />
                            Admin Home
                        </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                        <Link href="/dashboard">
                           <ChevronLeft className="h-4 w-4" />
                           Back to App
                        </Link>
                    </Button>
                </nav>
            </div>
            <div className='space-y-4'>
                <div className="flex items-center gap-3 rounded-md p-2">
                    <Avatar>
                        <AvatarImage src={user.photoURL} />
                        <AvatarFallback>{user.displayName?.charAt(0) || 'A'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-sm">{user.displayName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                </div>
                 <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
