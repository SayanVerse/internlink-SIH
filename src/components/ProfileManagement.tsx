import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Save, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  full_name: string;
  date_of_birth: string | null;
  college_name: string | null;
  degree: string | null;
  branch: string | null;
}

export const ProfileManagement = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update(profile)
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully."
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">My Profile</CardTitle>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} size="sm">
            <Edit className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
        ) : (
          <Button onClick={handleSave} disabled={loading} size="sm">
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              <User className="h-10 w-10" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-xl">{profile.full_name}</h3>
            <p className="text-sm text-muted-foreground">Student</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <Input
              type="date"
              value={profile.date_of_birth || ""}
              onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label>College Name</Label>
            <Input
              value={profile.college_name || ""}
              onChange={(e) => setProfile({ ...profile, college_name: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label>Degree</Label>
            <Input
              value={profile.degree || ""}
              onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label>Branch/Specialization</Label>
            <Input
              value={profile.branch || ""}
              onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
              disabled={!isEditing}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
