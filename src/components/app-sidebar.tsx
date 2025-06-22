"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "firebase/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Receipt,
  User,
  Settings,
  LogOut,
  Heart,
  ShoppingCart as ShoppingCartIcon,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { auth } from "@/lib/firebase";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleCart, items, addItem } = useCart();
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const [isDragOver, setIsDragOver] = useState(false);

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/orders", label: "My Orders", icon: Receipt },
    { href: "/dashboard/favorites", label: "Favorites", icon: Heart },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push("/");
    } catch (error) {
      toast({ variant: "destructive", title: "Logout Failed", description: "Could not log you out. Please try again." });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const mealDataString = e.dataTransfer.getData("meal");
    if (mealDataString) {
      const mealData = JSON.parse(mealDataString);
      addItem({
        name: mealData.name,
        price: parseFloat(mealData.price),
        imageUrl: mealData.imageUrl,
      });
      toggleCart();
    }
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
             <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter 
        className="p-2"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
         <SidebarMenu>
           <SidebarMenuItem>
             <SidebarMenuButton onClick={toggleCart} tooltip="Open Cart" className={cn("relative", isDragOver && "bg-primary/20 border-primary border-dashed border-2")}>
                <div className="relative">
                    <ShoppingCartIcon />
                    {totalItems > 0 && (
                        <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 justify-center p-0">{totalItems}</Badge>
                    )}
                </div>
                <span className="flex-grow">
                    {isDragOver ? 'Drop to add' : 'Shopping Cart'}
                </span>
             </SidebarMenuButton>
           </SidebarMenuItem>
           {user && (
             <SidebarMenuItem>
               <SidebarMenuButton tooltip="Logout" onClick={handleLogout}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL || `https://placehold.co/40x40.png`} alt={userData?.displayName || 'User'} />
                  <AvatarFallback>{userData?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <span className="flex-grow">{userData?.displayName || 'User'}</span>
                <LogOut />
               </SidebarMenuButton>
             </SidebarMenuItem>
           )}
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
