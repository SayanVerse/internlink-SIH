import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Briefcase, User } from "lucide-react";
import { format } from "date-fns";

interface Application {
  id: string;
  applied_at: string;
  user_id: string;
  profiles: {
    full_name: string;
  };
  internships: {
    title: string;
    org_name: string;
  };
}

export function RecentApplications() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('applications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'applications',
        },
        () => {
          fetchApplications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          id,
          applied_at,
          user_id,
          internship_id
        `)
        .order("applied_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      
      // Fetch related data separately
      const appsWithDetails = await Promise.all(
        (data || []).map(async (app) => {
          const [profileResult, internshipResult] = await Promise.all([
            supabase.from("profiles").select("full_name").eq("id", app.user_id).single(),
            supabase.from("internships").select("title, org_name").eq("id", app.internship_id).single()
          ]);
          
          return {
            ...app,
            profiles: { full_name: profileResult.data?.full_name || "Unknown" },
            internships: {
              title: internshipResult.data?.title || "Unknown",
              org_name: internshipResult.data?.org_name || "Unknown"
            }
          };
        })
      );
      
      setApplications(appsWithDetails);
    } catch (error: any) {
      toast({
        title: "Error fetching applications",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading recent activity...</div>;
  }

  if (applications.length === 0) {
    return <div className="text-sm text-muted-foreground">No recent applications</div>;
  }

  return (
    <div className="space-y-3">
      {applications.map((app) => (
        <div
          key={app.id}
          className="flex items-start gap-3 text-sm p-2 hover:bg-muted/50 rounded-md cursor-pointer transition-colors"
          onClick={() => navigate('/admin?tab=users')}
        >
          <Briefcase className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium">
              User <span className="text-primary">{app.profiles.full_name}</span> applied for internship at{" "}
              <span className="font-semibold">{app.internships.org_name}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(app.applied_at), "MMM dd, yyyy 'at' hh:mm a")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
