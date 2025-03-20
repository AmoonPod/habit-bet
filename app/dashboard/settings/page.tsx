"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  CreditCard,
  Receipt,
  UserRound,
  Bell,
  ShieldCheck,
  CreditCardIcon,
  Clock,
  Sparkles,
  BarChart,
  Calendar,
  ArrowUp,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UpgradePlanModal } from "@/components/billing/UpgradePlanModal";
import { PaymentMethodModal } from "@/components/billing/PaymentMethodModal";
import { CancelSubscriptionModal } from "@/components/billing/CancelSubscriptionModal";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/use-subscription";
import { formatDate } from "@/lib/utils";

interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  status: string;
  description: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [isUpgradePlanModalOpen, setIsUpgradePlanModalOpen] = useState(false);
  const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] =
    useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();
  const supabase = createClient();
  const {
    subscription,
    isLoading: isSubscriptionLoading,
    refresh: refreshSubscription,
  } = useSubscription();

  // Add debug logging for subscription data
  useEffect(() => {
    if (subscription) {
      console.log("Current subscription data:", {
        tier: subscription.tier,
        isActive: subscription.isActive,
        expiresAt: subscription.expiresAt,
        limits: subscription.limits,
        features: subscription.features,
      });
    }
  }, [subscription]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      try {
        // Get user data
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
          setFullName(user.user_metadata?.full_name || "");
          setEmail(user.email || "");
        }

        // Get payment history
        const { data, error } = await supabase
          .from("habit_payments")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        if (error && error.code !== "PGRST116") throw error;

        if (data) {
          const formattedHistory = data.map((payment) => ({
            id: payment.uuid,
            date: new Date(payment.created_at || "").toLocaleDateString(),
            amount: payment.amount,
            status: payment.payment_status,
            description: `Payment for habit stake`,
          }));
          setPaymentHistory(formattedHistory);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load settings data. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle subscription cancelled (callback for CancelSubscriptionModal)
  const handleSubscriptionCancelled = useCallback(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  // Handle tab change
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  if (isLoading || isSubscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Enhance the subscription tier display
  // Format subscription details with enhanced logging
  const isPremium = subscription?.tier === "premium";
  const isActive = subscription?.isActive === true;
  const expiryDate = subscription?.expiresAt
    ? formatDate(new Date(subscription.expiresAt))
    : "No expiration";

  // Add extra debugging output
  console.log("Rendered with subscription tier:", subscription?.tier);
  console.log("isPremium calculated as:", isPremium);

  // Display subscription info in UI
  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, subscriptions, and preferences
        </p>
      </div>

      {/* Debug info in development only */}
      {process.env.NODE_ENV === "development" && (
        <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg mb-4 text-sm">
          <h3 className="font-bold mb-2">Debug Info:</h3>
          <p>
            Subscription Tier: <code>{subscription?.tier || "none"}</code>
          </p>
          <p>
            Is Premium: <code>{isPremium ? "true" : "false"}</code>
          </p>
          <p>
            Is Active: <code>{isActive ? "true" : "false"}</code>
          </p>
          <p>
            Features: <code>{JSON.stringify(subscription?.features)}</code>
          </p>
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserRound className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Billing</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user?.user_metadata?.full_name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleUpdateProfile} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-muted">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>
                    Manage your password and account security
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Password</h3>
                  <p className="text-sm text-muted-foreground">
                    Change your password or enable two-factor authentication
                  </p>
                </div>
                <Button variant="outline">Change Password</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Current Plan</CardTitle>
                    <CardDescription>
                      Manage your subscription plan
                    </CardDescription>
                  </div>
                </div>
                {!isPremium ? (
                  <Button
                    variant="default"
                    onClick={() => setIsUpgradePlanModalOpen(true)}
                  >
                    Upgrade Plan
                  </Button>
                ) : (
                  isActive && (
                    <Button
                      variant="outline"
                      onClick={() => setIsCancelModalOpen(true)}
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      Cancel Plan
                    </Button>
                  )
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-6 rounded-lg mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-lg">
                        {isPremium ? "Premium Plan" : "Free Plan"}
                      </h3>
                      {isActive && (
                        <Badge
                          variant={isPremium ? "default" : "secondary"}
                          className="ml-2"
                        >
                          {isPremium ? "Premium" : "Free"}
                        </Badge>
                      )}
                      {!isActive && subscription?.tier === "premium" && (
                        <Badge variant="destructive" className="ml-2">
                          Cancelled
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-2">
                      {isPremium
                        ? "Enjoy advanced features and unlimited habits with our premium plan."
                        : "Start building better habits with real money stakes."}
                    </p>

                    {subscription?.expiresAt && (
                      <div className="flex items-center text-sm text-muted-foreground mt-4">
                        <Calendar className="h-4 w-4 mr-2" />
                        {isActive && isPremium
                          ? `Renews on ${expiryDate}`
                          : subscription.tier === "premium" && !isActive
                          ? `Access until ${expiryDate}`
                          : null}
                      </div>
                    )}

                    <ul className="space-y-1 text-sm mt-4">
                      {isPremium ? (
                        <>
                          <li className="flex items-center">
                            <span className="mr-2 text-primary">✓</span>{" "}
                            Unlimited Habits
                          </li>
                          <li className="flex items-center">
                            <span className="mr-2 text-primary">✓</span>{" "}
                            Advanced Insights & Analytics
                          </li>
                          <li className="flex items-center">
                            <span className="mr-2 text-primary">✓</span> Minimum
                            Stake: $1 per habit
                          </li>
                          <li className="flex items-center">
                            <span className="mr-2 text-primary">✓</span>{" "}
                            AI-powered Recommendations
                          </li>
                        </>
                      ) : (
                        <>
                          <li className="flex items-center">
                            <span className="mr-2 text-primary">✓</span>{" "}
                            {subscription?.limits.habits || 5} Habits
                          </li>
                          <li className="flex items-center">
                            <span className="mr-2 text-primary">✓</span> Basic
                            Insights (Progress Charts)
                          </li>
                          <li className="flex items-center">
                            <span className="mr-2 text-primary">✓</span> Minimum
                            Stake: ${subscription?.limits.minStake || 5} per
                            habit
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold">
                      {isPremium ? "$4.99" : "Free"}
                    </span>
                    {isPremium && (
                      <span className="text-muted-foreground">/month</span>
                    )}
                  </div>
                </div>
              </div>

              {isPremium && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-muted">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Payment Method</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Visa ending in 4242
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPaymentMethodModalOpen(true)}
                      >
                        Update
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-muted">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Billing Cycle</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Monthly billing
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsUpgradePlanModalOpen(true)}
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {!isPremium && (
                <div className="border border-border rounded-lg p-4 bg-muted/30 mt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-primary/10">
                      <ArrowUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Upgrade to Premium</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Unlock unlimited habits, advanced analytics, and lower
                        minimum stakes.
                      </p>
                      <Button onClick={() => setIsUpgradePlanModalOpen(true)}>
                        View Premium Plans
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-muted">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>View your recent payments</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {paymentHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell>${payment.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              payment.status === "paid"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : payment.status === "failed"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            }`}
                          >
                            {payment.status.charAt(0).toUpperCase() +
                              payment.status.slice(1)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    No payment history available
                  </p>
                </div>
              )}

              {paymentHistory.length > 0 && (
                <div className="mt-4 flex justify-center">
                  <Button variant="outline" size="sm">
                    View All Transactions
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-muted">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Control how you receive notifications
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors">
                <div>
                  <h3 className="font-medium">Habit Reminders</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive reminders for your daily habits
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>

              <div className="flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors">
                <div>
                  <h3 className="font-medium">Progress Updates</h3>
                  <p className="text-sm text-muted-foreground">
                    Get notified about your habit progress and achievements
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>

              <div className="flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors">
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications about your habits and account
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <UpgradePlanModal
        isOpen={isUpgradePlanModalOpen}
        onClose={() => {
          // Prevent default behavior and manually close modal
          setIsUpgradePlanModalOpen(false);
          // Then refresh subscription data
          refreshSubscription();
        }}
        currentTier={subscription?.tier || "free"}
      />
      <PaymentMethodModal
        isOpen={isPaymentMethodModalOpen}
        onClose={() => {
          // Prevent default behavior and manually close modal
          setIsPaymentMethodModalOpen(false);
          // Then refresh subscription data
          refreshSubscription();
        }}
      />
      <CancelSubscriptionModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          // Prevent default behavior and manually close modal
          setIsCancelModalOpen(false);
          // Then refresh subscription data
          refreshSubscription();
        }}
        onSuccess={handleSubscriptionCancelled}
      />
    </div>
  );
}
