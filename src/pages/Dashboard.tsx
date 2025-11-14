import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Chatbot } from "@/components/Chatbot";
import { ProfileManagement } from "@/components/ProfileManagement";
import { HelpFAQ } from "@/components/HelpFAQ";
import { InternshipForm } from "@/components/InternshipForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, LogOut, Briefcase, User, HelpCircle } from "lucide-react";

interface Profile {
  full_name: string;
  degree: string;
  branch: string;
  college_name: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showInternshipForm, setShowInternshipForm] = useState(false);

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
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
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
            <div className="mb-6 sm:mb-8 text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-2">
                Welcome, {profile?.full_name || "Student"}!
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-4">
                Find your perfect internship or manage your profile
              </p>
              <Button
                size="lg"
                className="bg-gradient-primary hover:bg-gradient-primary-hover text-primary-foreground font-semibold text-sm sm:text-base px-6 py-5 sm:px-8 sm:py-6"
                onClick={() => setShowInternshipForm(true)}
              >
                <Briefcase className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Find My Internship
              </Button>
            </div>

            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="profile">
                  <User className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">My Profile</span>
                  <span className="sm:hidden">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="help">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Help & FAQ</span>
                  <span className="sm:hidden">Help</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <ProfileManagement />
              </TabsContent>

              <TabsContent value="help">
                <HelpFAQ />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="max-w-4xl mx-auto">
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
