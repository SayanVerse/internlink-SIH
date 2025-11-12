import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ArrowRight, Briefcase, Users, Building2, TrendingUp } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const stats = [
    { value: "500+", label: "Active Internships", icon: Briefcase },
    { value: "10K+", label: "Students Placed", icon: Users },
    { value: "50+", label: "Partner Organizations", icon: Building2 },
    { value: "95%", label: "Satisfaction Rate", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button
            variant="outline"
            onClick={() => navigate("/auth")}
            className="font-semibold"
          >
            Login
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
          onClick={() => navigate("/auth")}
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
    </div>
  );
};

export default Index;
