import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Chatbot } from "@/components/Chatbot";
import { ArrowLeft, Eye, EyeOff, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ADMIN_EMAIL = "admin@pminternship.in";
const ADMIN_PASSWORD = "Admin@12345";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verify credentials match hardcoded admin credentials
      if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        throw new Error("Invalid admin credentials. Please check your email and password.");
      }

      // Try to sign in with Supabase
      let { error: signInError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      });

      // If user doesn't exist, create the admin account
      if (signInError && signInError.message.includes("Invalid login credentials")) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          options: {
            data: {
              full_name: "System Administrator",
              date_of_birth: "1990-01-01",
              college_name: "PM Internship Scheme",
              degree: "Administration",
              branch: "System",
            },
            emailRedirectTo: `${window.location.origin}/admin`,
          },
        });

        if (signUpError) throw signUpError;

        // Sign in after creating account
        const { error: finalSignInError } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
        });

        if (finalSignInError) throw finalSignInError;

        // Try to assign admin role (optional - won't block login)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          try {
            await supabase.from("user_roles").insert({
              user_id: user.id,
              role: "admin",
            });
          } catch {
            // Ignore role assignment errors
          }
        }
      } else if (signInError) {
        throw signInError;
      }

      toast({
        title: "Welcome, Administrator",
        description: "Successfully logged in to admin panel.",
      });

      // Force navigation to admin panel for admin user
      setTimeout(() => {
        navigate("/admin", { replace: true });
      }, 500);
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card">
      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Back Button */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
        <Button variant="outline" onClick={() => navigate("/")} className="text-xs sm:text-sm px-3 py-2">
          <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline">Back to </span>Home
        </Button>
      </div>

      {/* Admin Login Form */}
      <div className="flex min-h-screen items-center justify-center px-4 py-20">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur border-primary/20">
          <CardHeader className="text-center px-4 sm:px-6">
            <div className="mx-auto mb-3 sm:mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl">Admin Access</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Secure login for system administrators only
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@pminternship.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Admin Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:bg-gradient-primary-hover"
                disabled={loading}
              >
                <Shield className="mr-2 h-4 w-4" />
                {loading ? "Verifying..." : "Access Admin Panel"}
              </Button>
            </form>

            <div className="mt-6 rounded-lg bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground text-center">
                ⚠️ This area is restricted to authorized administrators only.
                Unauthorized access attempts are logged and monitored.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default AdminLogin;
