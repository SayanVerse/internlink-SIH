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
      navigate("/admin-login");
      return;
    }

    // Allow access if admin email, otherwise check role
    if (session.user.email === "admin@pminternship.in") {
      fetchStats();
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
        <div className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <ThemeToggle />
            <Button variant="ghost" onClick={() => navigate("/")} size="sm" className="px-2 sm:px-3">
              <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Back</span>
            </Button>
            <h1 className="text-lg sm:text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-end">
            <Button variant="outline" onClick={fetchStats} size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button variant="outline" onClick={handleLogout} size="sm" className="px-2 sm:px-3 text-xs sm:text-sm">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Tabs defaultValue="dashboard" className="space-y-4 sm:space-y-8">
          <TabsList className="bg-primary/10 grid grid-cols-2 sm:grid-cols-4 w-full">
            <TabsTrigger value="dashboard" className="text-xs sm:text-sm">
              <TrendingUp className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Dashboard</span>
              <span className="xs:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="internships" className="text-xs sm:text-sm">
              <Briefcase className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Internships</span>
              <span className="xs:hidden">Jobs</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm">
              <Users className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-xs sm:text-sm">
              <UploadIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Upload CSV</span>
              <span className="xs:hidden">Upload</span>
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
