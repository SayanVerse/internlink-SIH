import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  ArrowLeft, 
  RefreshCw, 
  TrendingUp, 
  Users, 
  Briefcase, 
  UserPlus,
  Plus,
  Upload as UploadIcon
} from "lucide-react";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { InternshipManagement } from "@/components/admin/InternshipManagement";
import { UserManagement } from "@/components/admin/UserManagement";
import { CSVUpload } from "@/components/admin/CSVUpload";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInternships: 0,
    activeInternships: 0,
    totalUsers: 0,
    internUsers: 0,
  });
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (roleData?.role !== "admin") {
      toast({
        title: "Access denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    fetchStats();
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch internships count
      const { count: totalCount } = await supabase
        .from("internships")
        .select("*", { count: "exact", head: true });

      const { count: activeCount } = await supabase
        .from("internships")
        .select("*", { count: "exact", head: true })
        .eq("active", true);

      // Fetch users count
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Fetch intern users (users who have applied)
      const { count: internCount } = await supabase
        .from("applications")
        .select("user_id", { count: "exact", head: true });

      setStats({
        totalInternships: totalCount || 0,
        activeInternships: activeCount || 0,
        totalUsers: usersCount || 0,
        internUsers: internCount || 0,
      });

      setLastUpdate(new Date());
    } catch (error: any) {
      toast({
        title: "Error fetching stats",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={fetchStats} size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-8">
          <TabsList className="bg-primary/10">
            <TabsTrigger value="dashboard">
              <TrendingUp className="mr-2 h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="internships">
              <Briefcase className="mr-2 h-4 w-4" />
              Internships
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="mr-2 h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="upload">
              <UploadIcon className="mr-2 h-4 w-4" />
              Upload CSV
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            <AdminOverview stats={stats} lastUpdate={lastUpdate} loading={loading} />
          </TabsContent>

          <TabsContent value="internships">
            <InternshipManagement onUpdate={fetchStats} />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="upload">
            <CSVUpload onUploadComplete={fetchStats} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
