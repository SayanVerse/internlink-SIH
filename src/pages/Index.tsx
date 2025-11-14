import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Chatbot } from "@/components/Chatbot";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Briefcase, Users, Building2, TrendingUp, Target, Zap, Shield, User } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const stats = [
    { value: "500+", label: "Active Internships", icon: Briefcase },
    { value: "10K+", label: "Students Placed", icon: Users },
    { value: "50+", label: "Partner Organizations", icon: Building2 },
    { value: "95%", label: "Satisfaction Rate", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/50">
      {/* Language Switcher - Bottom Left */}
      <div className="fixed bottom-6 left-6 z-50">
        <LanguageSwitcher />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              const { data: { session } } = await supabase.auth.getSession();
              if (session) {
                navigate("/dashboard");
              } else {
                navigate("/auth");
              }
            }}
            className="rounded-full"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button
            variant="outline"
            onClick={() => navigate("/auth")}
            className="font-semibold"
          >
            Student Login
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-8 text-6xl font-bold tracking-tight md:text-8xl">
          Intern Link
        </h1>
        
        <p className="mb-12 max-w-3xl text-lg md:text-xl text-muted-foreground leading-relaxed">
          AI-powered recommendations for PM Internship Scheme candidates.
          Get 3-5 personalized internship suggestions based on your skills and
          preferences.
        </p>

        <Button
          size="lg"
          className="bg-gradient-primary hover:bg-gradient-primary-hover text-primary-foreground font-semibold text-lg px-8 py-6 rounded-xl"
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
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        {/* Stats Grid */}
        <div className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full max-w-6xl">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="border-border/50 bg-card/50 backdrop-blur p-8 hover:border-primary/50 transition-colors"
              >
                <div className="flex flex-col items-center gap-4">
                  <Icon className="h-8 w-8 text-primary" />
                  <div className="text-4xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* About Section */}
      <section className="px-4 py-20 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">About InternLink</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Empowering students through AI-powered internship recommendations under the PM Internship Scheme
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="p-6 text-center border-border/50 bg-card/50 backdrop-blur">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalized Matching</h3>
              <p className="text-muted-foreground">
                Our AI algorithm analyzes your skills, education, and preferences to find the perfect internship matches for you.
              </p>
            </Card>

            <Card className="p-6 text-center border-border/50 bg-card/50 backdrop-blur">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Results</h3>
              <p className="text-muted-foreground">
                Get 3-5 tailored internship recommendations within seconds. No more endless searching through job boards.
              </p>
            </Card>

            <Card className="p-6 text-center border-border/50 bg-card/50 backdrop-blur">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Opportunities</h3>
              <p className="text-muted-foreground">
                All internships are verified and part of the official PM Internship Scheme, ensuring quality and authenticity.
              </p>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">How InternLink Helps You</h3>
            <div className="space-y-4 text-lg text-muted-foreground">
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
      <footer className="px-4 py-8 border-t border-border/50 bg-card/20">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            Developed by <span className="font-semibold text-foreground">Team Tech Bridge</span>
          </p>
          <p className="text-sm text-muted-foreground mt-1">
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
