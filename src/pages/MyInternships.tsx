import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, Briefcase, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Application {
  id: string;
  applied_at: string;
  internships: {
    title: string;
    org_name: string;
    description: string;
    application_url: string;
    city: string;
    state: string;
    stipend_min: number;
    stipend_max: number;
  };
}

const MyInternships = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("applications")
        .select(`
          id,
          applied_at,
          internships (
            title,
            org_name,
            description,
            application_url,
            city,
            state,
            stipend_min,
            stipend_max
          )
        `)
        .eq("user_id", user.id)
        .order("applied_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/50">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 md:p-6 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
        <ThemeToggle />
      </header>

      <main className="pt-24 pb-12 px-4 md:px-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">My Internships</h1>
          <p className="text-muted-foreground">Track all your internship applications</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Applications Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't applied for any internships yet. Apply now!
              </p>
              <Button onClick={() => navigate("/")}>
                Find Internships
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {applications.map((app) => (
              <Card key={app.id}>
                <CardHeader>
                  <CardTitle className="text-xl">{app.internships.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{app.internships.org_name}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm line-clamp-2">{app.internships.description}</p>
                  
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    {app.internships.city && (
                      <span>📍 {app.internships.city}, {app.internships.state}</span>
                    )}
                    {app.internships.stipend_min && (
                      <span>
                        💰 ₹{app.internships.stipend_min}
                        {app.internships.stipend_max && `-₹${app.internships.stipend_max}`}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Applied on: {format(new Date(app.applied_at), "MMM dd, yyyy")}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(app.internships.application_url, "_blank")}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Application
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyInternships;
