
'use client';

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/context/auth-context";
import { updateUserProfileAction, updateAvatarAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Pen, Trash2, PlusCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const addressSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Address name is required"),
  details: z.string().min(1, "Address details are required"),
});

const profileFormSchema = z.object({
  displayName: z.string().min(3, "Username must be at least 3 characters."),
  addresses: z.array(addressSchema),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user, userData, loading, setUserData } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isAvatarPending, startAvatarTransition] = useTransition();
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: "",
      addresses: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "addresses",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (userData) {
      form.reset({
        displayName: userData.displayName || "",
        addresses: userData.addresses || [],
      });
      setAvatarUrl(userData.photoURL || "");
    }
  }, [user, userData, loading, router, form]);

  const onSubmit = (data: ProfileFormValues) => {
    if (!user) return;
    startTransition(async () => {
      const result = await updateUserProfileAction({ userId: user.uid, ...data });
      if (result.success) {
        toast({ title: "Profile Updated", description: "Your changes have been saved." });
        // Optimistic update of local state
        setUserData(prev => prev ? { ...prev, ...data, addresses: data.addresses.map(a => ({...a, id: a.id || uuidv4()})) } : null);
      } else {
        toast({ variant: "destructive", title: "Update Failed", description: "Could not save your changes." });
      }
    });
  };

  const handleAvatarUpdate = () => {
    if (!user || !avatarUrl) return;
    startAvatarTransition(async () => {
      const result = await updateAvatarAction({ userId: user.uid, photoURL: avatarUrl });
      if (result.success) {
        toast({ title: "Avatar Updated" });
        setUserData(prev => prev ? { ...prev, photoURL: avatarUrl } : null);
        setIsAvatarDialogOpen(false);
      } else {
        toast({ variant: "destructive", title: "Update Failed", description: "Could not update your avatar." });
      }
    });
  }

  if (loading || !user || !userData) {
    return (
        <div className="space-y-8">
            <header>
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-4 w-1/2 mt-2" />
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1"><Skeleton className="h-64 w-full" /></div>
                <div className="lg:col-span-2"><Skeleton className="h-96 w-full" /></div>
            </div>
        </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <header>
          <h1 className="font-headline text-4xl font-bold tracking-tight">User Profile</h1>
          <p className="text-muted-foreground">Manage your CyberFeast presence.</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
              <Card>
                  <CardContent className="pt-6 flex flex-col items-center text-center">
                      <Avatar className="w-24 h-24 mb-4 border-4 border-primary">
                          <AvatarImage src={userData.photoURL || `https://placehold.co/100x100.png`} />
                          <AvatarFallback>{userData.displayName?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <h2 className="text-xl font-bold font-headline">{userData.displayName}</h2>
                      <p className="text-muted-foreground">{user.email}</p>
                      
                      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="mt-4 gap-2">
                              <Pen className="w-3 h-3"/> Change Avatar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Change Avatar</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-2">
                            <Label htmlFor="avatarUrl">Image URL</Label>
                            <Input id="avatarUrl" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://example.com/image.png" />
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAvatarDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleAvatarUpdate} disabled={isAvatarPending}>
                              {isAvatarPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Save
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                  </CardContent>
              </Card>
               <Card>
                <CardHeader>
                    <CardTitle>Loyalty Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold text-primary">{userData.loyaltyPoints || 0}</p>
                    <p className="text-muted-foreground">Loyalty Points</p>
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
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Your username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input type="email" defaultValue={user.email || ''} disabled />
                </div>
                
                <Separator />

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Saved Addresses</h3>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', details: '' })}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Address
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <Card key={field.id} className="p-4 bg-secondary/30">
                        <div className="flex gap-4">
                          <div className="flex-1 space-y-2">
                            <FormField
                              control={form.control}
                              name={`addresses.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Location Name</FormLabel>
                                  <FormControl><Input placeholder="e.g., Home Base" {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`addresses.${index}.details`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Full Address</FormLabel>
                                  <FormControl><Input placeholder="Starlight Tower, Apt 42, Neo-Kyoto" {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                    {fields.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No saved addresses.</p>
                    )}
                  </div>
                </div>

                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
