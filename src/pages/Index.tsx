import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Chatbot } from "@/components/Chatbot";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Briefcase, Users, Building2, TrendingUp, Target, Zap, Shield, User, Menu, HelpCircle, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [typewriterText, setTypewriterText] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userName) {
      const text = isLoggedIn ? `Welcome Back, ${userName}` : `Hello, ${userName}, welcome to`;
      let index = 0;
      const interval = setInterval(() => {
        if (index <= text.length) {
          setTypewriterText(text.slice(0, index));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [userName, isLoggedIn]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsLoggedIn(!!session);
    
    if (session) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .single();
      
      if (profile) {
        setUserName(profile.full_name.split(' ')[0]);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setMenuOpen(false);
  };

  const stats = [
    { value: "500+", label: "Active Internships", icon: Briefcase },
    { value: "10K+", label: "Students Placed", icon: Users },
    { value: "50+", label: "Partner Organizations", icon: Building2 },
    { value: "95%", label: "Satisfaction Rate", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/50">
      {/* Language Switcher - Bottom Left */}
      <div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-50">
        <LanguageSwitcher />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-3 sm:p-4 md:p-6 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-2 sm:gap-4">
          <h2 className="text-lg sm:text-xl font-bold">InternLink</h2>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          {!isLoggedIn && (
            <Button
              variant="outline"
              onClick={() => navigate("/auth")}
              className="font-semibold text-xs sm:text-sm px-3 py-2 sm:px-4"
            >
              <span className="hidden xs:inline">Student </span>Login
            </Button>
          )}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-4 mt-8">
                {!isLoggedIn ? (
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => {
                      navigate("/auth");
                      setMenuOpen(false);
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => {
                        navigate("/profile");
                        setMenuOpen(false);
                      }}
                    >
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => {
                        navigate("/my-internships");
                        setMenuOpen(false);
                      }}
                    >
                      <Briefcase className="mr-2 h-4 w-4" />
                      My Internships
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => {
                    navigate("/help-faq");
                    setMenuOpen(false);
                  }}
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help & FAQ
                </Button>
                {isLoggedIn && (
                  <Button
                    variant="ghost"
                    className="justify-start text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 md:px-8 text-center pt-20 pb-12">
        {typewriterText && (
          <p className="mb-4 text-lg sm:text-xl md:text-2xl text-primary font-semibold">
            {typewriterText}
          </p>
        )}
        <h1 className="mb-6 sm:mb-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight">
          Intern Link
        </h1>
        
        <p className="mb-8 sm:mb-12 max-w-3xl text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed px-4">
          AI-powered recommendations for PM Internship Scheme candidates.
          Get 3-5 personalized internship suggestions based on your skills and
          preferences.
        </p>

        <Button
          size="lg"
          className="bg-gradient-primary hover:bg-gradient-primary-hover text-primary-foreground font-semibold text-base sm:text-lg px-6 py-5 sm:px-8 sm:py-6 rounded-xl w-auto"
          onClick={async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              navigate("/dashboard?start=internship");
            } else {
              navigate("/auth");
            }
          }}
        >
          Find my internship
          <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        {/* Stats Grid */}
        <div className="mt-12 sm:mt-16 md:mt-24 grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full max-w-6xl px-2">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="border-border/50 bg-card/50 backdrop-blur p-6 sm:p-8 hover:border-primary/50 transition-colors"
              >
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                  <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  <div className="text-3xl sm:text-4xl font-bold">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* About Section */}
      <section className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 px-2">About InternLink</h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              Empowering students through AI-powered internship recommendations under the PM Internship Scheme
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            <Card className="p-5 sm:p-6 text-center border-border/50 bg-card/50 backdrop-blur">
              <div className="mx-auto mb-3 sm:mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary/10">
                <Target className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Personalized Matching</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Our AI algorithm analyzes your skills, education, and preferences to find the perfect internship matches for you.
              </p>
            </Card>

            <Card className="p-5 sm:p-6 text-center border-border/50 bg-card/50 backdrop-blur">
              <div className="mx-auto mb-3 sm:mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Instant Results</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Get 3-5 tailored internship recommendations within seconds. No more endless searching through job boards.
              </p>
            </Card>

            <Card className="p-5 sm:p-6 text-center border-border/50 bg-card/50 backdrop-blur">
              <div className="mx-auto mb-3 sm:mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Verified Opportunities</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                All internships are verified and part of the official PM Internship Scheme, ensuring quality and authenticity.
              </p>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">How InternLink Helps You</h3>
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base md:text-lg text-muted-foreground">
              <p>
                <strong className="text-foreground">🎯 Smart Recommendations:</strong> Our platform uses advanced AI to match your unique profile with the most suitable internship opportunities.
              </p>
              <p>
                <strong className="text-foreground">📚 Comprehensive Database:</strong> Access hundreds of internships across various sectors including IT, Healthcare, Finance, Education, and more.
              </p>
              <p>
                <strong className="text-foreground">🚀 Career Growth:</strong> Gain valuable real-world experience and build your professional network through quality internships.
              </p>
              <p>
                <strong className="text-foreground">🤝 Government Backed:</strong> Part of the official PM Internship Scheme, providing authentic and verified opportunities for students.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 py-6 sm:py-8 border-t border-border/50 bg-card/20">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Developed by{" "}
            <button
              onClick={() => navigate("/team")}
              className="font-semibold text-foreground hover:text-primary transition-colors underline cursor-pointer"
            >
              Team Tech Bridge
            </button>
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Smart India Hackathon 2025
          </p>
        </div>
      </footer>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Index;
