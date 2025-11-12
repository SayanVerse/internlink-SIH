import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ArrowLeft, Briefcase, MapPin, GraduationCap, Sparkles } from "lucide-react";

interface Profile {
  full_name: string;
  degree: string;
  branch: string;
  college_name: string;
}

interface Recommendation {
  id: string;
  title: string;
  org_name: string;
  sector: string;
  description: string;
  city: string | null;
  state: string | null;
  remote: boolean;
  min_education: string;
  stipend_min: number | null;
  stipend_max: number | null;
  application_url: string;
  required_skills: string[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  
  const [preferences, setPreferences] = useState({
    skills: "",
    sectors: [] as string[],
    location: "",
    remote: false,
  });

  const sectors = [
    "Technology", "Healthcare", "Finance", "Education", "Government", 
    "Manufacturing", "Agriculture", "E-commerce", "Media", "Non-Profit"
  ];

  useEffect(() => {
    checkAuth();
  }, []);

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
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleSectorToggle = (sector: string) => {
    setPreferences((prev) => ({
      ...prev,
      sectors: prev.sectors.includes(sector)
        ? prev.sectors.filter((s) => s !== sector)
        : [...prev.sectors, sector],
    }));
  };

  const getRecommendations = async () => {
    setLoading(true);
    try {
      // Fetch internships based on preferences
      let query = supabase
        .from("internships")
        .select("*")
        .eq("active", true)
        .limit(5);

      if (preferences.remote) {
        query = query.eq("remote", true);
      }

      if (preferences.sectors.length > 0) {
        query = query.in("sector", preferences.sectors);
      }

      const { data, error } = await query;

      if (error) throw error;

      setRecommendations(data || []);
      setShowForm(false);

      toast({
        title: "Recommendations ready!",
        description: `Found ${data?.length || 0} matching internships for you.`,
      });
    } catch (error: any) {
      toast({
        title: "Error fetching recommendations",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (internship: Recommendation) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Record application
      const { error } = await supabase
        .from("applications")
        .insert({
          user_id: session.user.id,
          internship_id: internship.id,
        });

      if (error && !error.message.includes("duplicate")) throw error;

      // Open application URL
      window.open(internship.application_url, "_blank");

      toast({
        title: "Application recorded!",
        description: "Good luck with your application!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/")} size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-semibold">Intern Link</h2>
          </div>
          <div className="flex items-center gap-4">
            {profile && (
              <span className="text-sm text-muted-foreground">
                Welcome, {profile.full_name}
              </span>
            )}
            <LanguageSwitcher />
            <ThemeToggle />
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {showForm ? (
          <Card className="mx-auto max-w-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Find Your Perfect Internship
              </CardTitle>
              <CardDescription>
                Tell us about your preferences and we'll match you with the best opportunities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="skills">Your Skills</Label>
                <Input
                  id="skills"
                  placeholder="e.g., Python, React, Communication, Design"
                  value={preferences.skills}
                  onChange={(e) =>
                    setPreferences({ ...preferences, skills: e.target.value })
                  }
                />
              </div>

              <div className="space-y-3">
                <Label>Sectors of Interest (select multiple)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {sectors.map((sector) => (
                    <div key={sector} className="flex items-center space-x-2">
                      <Checkbox
                        id={sector}
                        checked={preferences.sectors.includes(sector)}
                        onCheckedChange={() => handleSectorToggle(sector)}
                      />
                      <Label htmlFor={sector} className="cursor-pointer">
                        {sector}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Preferred Location</Label>
                <Select
                  value={preferences.location}
                  onValueChange={(value) =>
                    setPreferences({ ...preferences, location: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Location</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                    <SelectItem value="Mumbai">Mumbai</SelectItem>
                    <SelectItem value="Bangalore">Bangalore</SelectItem>
                    <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                    <SelectItem value="Chennai">Chennai</SelectItem>
                    <SelectItem value="Pune">Pune</SelectItem>
                    <SelectItem value="Kolkata">Kolkata</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remote"
                  checked={preferences.remote}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, remote: checked as boolean })
                  }
                />
                <Label htmlFor="remote" className="cursor-pointer">
                  Show only remote internships
                </Label>
              </div>

              <Button
                onClick={getRecommendations}
                className="w-full bg-gradient-primary hover:bg-gradient-primary-hover"
                disabled={loading}
              >
                {loading ? "Finding matches..." : "Get Recommendations"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Personalized Recommendations</h2>
              <Button variant="outline" onClick={() => setShowForm(true)}>
                New Search
              </Button>
            </div>

            {recommendations.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No internships found matching your criteria. Try adjusting your preferences.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {recommendations.map((rec) => (
                  <Card key={rec.id} className="hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-xl">{rec.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            {rec.org_name}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {rec.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                          {rec.sector}
                        </span>
                        {rec.remote && (
                          <span className="inline-flex items-center rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500">
                            Remote
                          </span>
                        )}
                      </div>

                      {(rec.city || rec.state) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {rec.city}, {rec.state}
                        </div>
                      )}

                      {rec.min_education && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <GraduationCap className="h-4 w-4" />
                          {rec.min_education}
                        </div>
                      )}

                      {rec.stipend_min && (
                        <div className="text-sm font-semibold">
                          Stipend: ₹{rec.stipend_min.toLocaleString()}
                          {rec.stipend_max && ` - ₹${rec.stipend_max.toLocaleString()}`}
                          /month
                        </div>
                      )}

                      <Button
                        onClick={() => handleApply(rec)}
                        className="w-full bg-gradient-primary hover:bg-gradient-primary-hover"
                      >
                        Apply Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
