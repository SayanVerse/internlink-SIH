import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Chatbot } from "@/components/Chatbot";
import { ProfileManagement } from "@/components/ProfileManagement";
import { HelpFAQ } from "@/components/HelpFAQ";
import { InternshipForm } from "@/components/InternshipForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, LogOut, Briefcase, User, HelpCircle, Sparkles } from "lucide-react";

interface Profile {
  full_name: string;
  degree: string;
  branch: string;
  college_name?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showInternshipForm, setShowInternshipForm] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // Check if we should auto-open the internship form
    if (searchParams.get("start") === "internship" && !loading) {
      setShowInternshipForm(true);
      // Clear the query param
      setSearchParams({});
    }
  }, [searchParams, loading]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Fetch user profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/50">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between p-3 sm:p-4 md:p-6 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" onClick={() => navigate("/")} size="sm" className="px-2 sm:px-3">
            <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
            <span className="text-xs sm:text-sm">Home</span>
          </Button>
          <h1 className="text-base sm:text-xl md:text-2xl font-bold hidden xs:block">InternLink Dashboard</h1>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setActiveTab("help")}
            className="h-8 w-8 sm:h-9 sm:w-9"
          >
            <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setActiveTab("profile")}
            className="h-8 w-8 sm:h-9 sm:w-9"
          >
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <ThemeToggle />
          <Button variant="outline" onClick={handleLogout} size="sm" className="px-2 sm:px-3">
            <LogOut className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm hidden xs:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 max-w-6xl">
        {!showInternshipForm ? (
          <>
            {/* Hero Section with Animation */}
            <div className="mb-8 sm:mb-12 text-center animate-fade-in">
              <div className="relative inline-block mb-4">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent animate-scale-in">
                  Welcome Back, {profile?.full_name?.split(' ')[0] || "Student"}!
                </h2>
                <Sparkles className="absolute -top-2 -right-8 h-6 w-6 text-primary animate-pulse" />
              </div>
              <p className="text-sm sm:text-lg text-muted-foreground mb-6 sm:mb-8 px-4 max-w-2xl mx-auto">
                Ready to discover your next career opportunity? Let's find the perfect internship for you.
              </p>
              
              {/* CTA Button with Gradient */}
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold text-sm sm:text-lg px-8 py-6 sm:px-10 sm:py-7 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={() => setShowInternshipForm(true)}
              >
                <Briefcase className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                Find My Perfect Internship
              </Button>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
              <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">500+</div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Active Internships</p>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">10K+</div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Students Placed</p>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">95%</div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Success Rate</p>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-primary/10">
                <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <User className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">My Profile</span>
                  <span className="sm:hidden">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="help" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Help & FAQ</span>
                  <span className="sm:hidden">Help</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="animate-fade-in">
                <ProfileManagement />
              </TabsContent>

              <TabsContent value="help" className="animate-fade-in">
                <HelpFAQ />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <InternshipForm
              profile={profile || { full_name: "", degree: "", branch: "" }}
              onClose={() => setShowInternshipForm(false)}
            />
          </div>
        )}
      </main>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Dashboard;
