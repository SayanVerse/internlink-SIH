import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";

interface Internship {
  id: string;
  title: string;
  org_name: string;
  sector: string;
  city: string | null;
  state: string | null;
  remote: boolean;
  active: boolean;
  application_url: string;
  stipend_min: number | null;
}

interface InternshipManagementProps {
  onUpdate: () => void;
}

export function InternshipManagement({ onUpdate }: InternshipManagementProps) {
  const { toast } = useToast();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    sector: "",
    org_name: "",
    description: "",
    city: "",
    state: "",
    remote: false,
    min_education: "",
    required_skills: "",
    stipend_min: "",
    stipend_max: "",
    application_url: "",
    deadline: "",
    active: true,
  });

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("internships")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInternships(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching internships",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const skillsArray = formData.required_skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const internshipData = {
        title: formData.title,
        sector: formData.sector,
        org_name: formData.org_name,
        description: formData.description,
        city: formData.city || null,
        state: formData.state || null,
        remote: formData.remote,
        min_education: formData.min_education || null,
        required_skills: skillsArray,
        stipend_min: formData.stipend_min ? parseInt(formData.stipend_min) : null,
        stipend_max: formData.stipend_max ? parseInt(formData.stipend_max) : null,
        application_url: formData.application_url,
        deadline: formData.deadline || null,
        active: formData.active,
      };

      let error;
      if (editingId) {
        ({ error } = await supabase
          .from("internships")
          .update(internshipData)
          .eq("id", editingId));
      } else {
        ({ error } = await supabase.from("internships").insert(internshipData));
      }

      if (error) throw error;

      toast({
        title: editingId ? "Internship updated" : "Internship added",
        description: "The internship has been saved successfully.",
      });

      setDialogOpen(false);
      resetForm();
      fetchInternships();
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error saving internship",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this internship?")) return;

    try {
      const { error } = await supabase.from("internships").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Internship deleted",
        description: "The internship has been removed.",
      });

      fetchInternships();
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error deleting internship",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (internship: any) => {
    setEditingId(internship.id);
    setFormData({
      title: internship.title,
      sector: internship.sector,
      org_name: internship.org_name,
      description: internship.description,
      city: internship.city || "",
      state: internship.state || "",
      remote: internship.remote,
      min_education: internship.min_education || "",
      required_skills: internship.required_skills?.join(", ") || "",
      stipend_min: internship.stipend_min?.toString() || "",
      stipend_max: internship.stipend_max?.toString() || "",
      application_url: internship.application_url,
      deadline: internship.deadline || "",
      active: internship.active,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      sector: "",
      org_name: "",
      description: "",
      city: "",
      state: "",
      remote: false,
      min_education: "",
      required_skills: "",
      stipend_min: "",
      stipend_max: "",
      application_url: "",
      deadline: "",
      active: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manage Internships</h2>
          <p className="text-muted-foreground">Add, edit, or remove internship listings</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Internship
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Internship" : "Add New Internship"}
              </DialogTitle>
              <DialogDescription>
                Fill in the details below to {editingId ? "update" : "create"} an internship listing
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org_name">Organization *</Label>
                  <Input
                    id="org_name"
                    value={formData.org_name}
                    onChange={(e) => setFormData({ ...formData, org_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sector">Sector *</Label>
                  <Input
                    id="sector"
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_education">Minimum Education</Label>
                  <Input
                    id="min_education"
                    value={formData.min_education}
                    onChange={(e) => setFormData({ ...formData, min_education: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="required_skills">Required Skills (comma-separated)</Label>
                <Input
                  id="required_skills"
                  value={formData.required_skills}
                  onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
                  placeholder="e.g., Python, React, Communication"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stipend_min">Min Stipend (₹/month)</Label>
                  <Input
                    id="stipend_min"
                    type="number"
                    value={formData.stipend_min}
                    onChange={(e) => setFormData({ ...formData, stipend_min: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stipend_max">Max Stipend (₹/month)</Label>
                  <Input
                    id="stipend_max"
                    type="number"
                    value={formData.stipend_max}
                    onChange={(e) => setFormData({ ...formData, stipend_max: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="application_url">Application URL *</Label>
                <Input
                  id="application_url"
                  type="url"
                  value={formData.application_url}
                  onChange={(e) => setFormData({ ...formData, application_url: e.target.value })}
                  required
                  placeholder="https://example.com/apply"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="remote"
                    checked={formData.remote}
                    onCheckedChange={(checked) => setFormData({ ...formData, remote: checked })}
                  />
                  <Label htmlFor="remote">Remote Internship</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {editingId ? "Update" : "Create"} Internship
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Internship Listings</CardTitle>
          <CardDescription>Manage all internship opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {internships.map((internship) => (
                <TableRow key={internship.id}>
                  <TableCell className="font-medium">{internship.title}</TableCell>
                  <TableCell>{internship.org_name}</TableCell>
                  <TableCell>{internship.sector}</TableCell>
                  <TableCell>
                    {internship.remote ? (
                      <span className="text-green-500">Remote</span>
                    ) : (
                      `${internship.city}, ${internship.state}`
                    )}
                  </TableCell>
                  <TableCell>
                    {internship.active ? (
                      <span className="text-green-500">Active</span>
                    ) : (
                      <span className="text-muted-foreground">Inactive</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(internship.application_url, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(internship)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(internship.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
