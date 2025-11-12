import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, UserPlus, TrendingUp, Plus, Upload, UserCog } from "lucide-react";

interface AdminOverviewProps {
  stats: {
    totalInternships: number;
    activeInternships: number;
    totalUsers: number;
    internUsers: number;
  };
  lastUpdate: Date;
  loading: boolean;
}

export function AdminOverview({ stats, lastUpdate, loading }: AdminOverviewProps) {
  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Internships
            </CardTitle>
            <Briefcase className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalInternships}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalInternships} loaded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Internships
            </CardTitle>
            <UserPlus className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeInternships}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeInternships} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Intern Users
            </CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.internUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered user</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last Update
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {lastUpdate.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Auto-refresh: 30s</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-primary/10 hover:bg-primary/20 text-primary">
              <Plus className="mr-2 h-4 w-4" />
              Add New Internship
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Upload className="mr-2 h-4 w-4" />
              Upload CSV File
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <UserCog className="mr-2 h-4 w-4" />
              Manage Users
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <UserPlus className="h-4 w-4 text-green-500" />
              <span>{stats.totalUsers} registered users</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Users className="h-4 w-4 text-primary" />
              <span>{stats.internUsers} intern users</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Briefcase className="h-4 w-4 text-blue-500" />
              <span>{stats.activeInternships} active internships</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <span>{stats.totalInternships} total opportunities</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
