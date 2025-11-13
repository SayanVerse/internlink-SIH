import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  full_name: string;
  degree: string;
  branch: string;
}

interface InternshipFormProps {
  profile: Profile;
  onClose: () => void;
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
  application_url: string;
  required_skills: string[];
  deadline: string | null;
  stipend_min: number | null;
  stipend_max: number | null;
}

const SUGGESTED_SKILLS = [
  "JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "React", "Node.js",
  "Distributed Systems", "Microservices", "Git", "SQL", "NoSQL", "HTML/CSS",
  "Data Analysis", "Data Science", "Machine Learning", "Statistics", "Pandas",
  "NumPy", "TensorFlow", "PyTorch", "OpenCV", "Spark", "Airflow", "Scala",
  "Kafka", "AWS", "Azure", "OCI", "Docker", "Kubernetes", "CI/CD", "Jenkins",
  "Ansible", "Linux", "UI/UX", "Figma", "Embedded C", "RTOS", "ARM", "CUDA",
  "Verilog", "SystemVerilog", "Graphics", "AutoCAD", "SolidWorks", "FEA",
  "ETABS", "Kotlin", "Android", "Firebase", "IoT", "MQTT", "ROS", "Excel",
  "PowerBI", "Financial Modeling", "Communication", "Leadership",
  "Project Management", "Research", "Content Writing", "Time Management"
];

const INTERESTS = [
  "Web Development", "Machine Learning", "Data Science", "Mobile App Development",
  "Cloud Computing", "Cybersecurity", "DevOps", "AI/ML", "Blockchain",
  "Game Development", "IoT", "Robotics", "AR/VR", "Computer Vision"
];

const SECTORS = [
  "IT Sector", "Healthcare", "Agriculture", "Education", "Public Administration",
  "Finance", "Manufacturing", "Tourism", "Environment", "Social Work",
  "E-commerce", "Media", "Non-Profit", "Government"
];

const POPULAR_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune", "Chennai", "Kolkata",
  "Ahmedabad", "Jaipur", "Lucknow", "Chandigarh", "Kochi", "Indore", "Bhopal"
];

export const InternshipForm = ({ profile, onClose }: InternshipFormProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: profile.full_name || "",
    education: "",
    interests: [] as string[],
    stream: profile.branch || "",
    year: new Date().getFullYear().toString(),
    skills: [] as string[],
    customSkills: "",
    sectors: [] as string[],
    pinCode: "",
    preferredLocations: [] as string[],
    isRural: false
  });

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  const getRecommendations = async () => {
    setLoading(true);
    try {
      const allSkills = [...formData.skills];
      if (formData.customSkills.trim()) {
        allSkills.push(...formData.customSkills.split(',').map(s => s.trim()));
      }

      // Simple rule-based matching
      let query = supabase
        .from("internships")
        .select("*")
        .eq("active", true)
        .limit(5);

      if (formData.sectors.length > 0) {
        query = query.in("sector", formData.sectors);
      }

      const { data: internships, error } = await query;
      
      if (error) throw error;

      // Score and sort internships
      const scored = (internships || []).map(internship => {
        let score = 0;
        
        // Sector match
        if (formData.sectors.includes(internship.sector)) score += 10;
        
        // Skills match
        const matchedSkills = internship.required_skills?.filter((skill: string) =>
          allSkills.some(userSkill => userSkill.toLowerCase().includes(skill.toLowerCase()))
        ) || [];
        score += matchedSkills.length * 5;
        
        // Location match
        if (formData.preferredLocations.length > 0) {
          if (internship.remote || formData.preferredLocations.includes(internship.city || "")) {
            score += 5;
          }
        }
        
        return { ...internship, score, matchedSkills };
      });

      scored.sort((a, b) => b.score - a.score);
      setRecommendations(scored.slice(0, 5) as any);
      setStep(5);
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

  const handleApply = async (internshipId: string, applicationUrl: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.from("applications").insert({
          user_id: user.id,
          internship_id: internshipId
        });

        toast({
          title: "Application recorded",
          description: "Opening application link..."
        });

        window.open(applicationUrl, "_blank");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Find My Internship - Step {step} of 5</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Your full name"
              />
            </div>
            <div>
              <Label>Education Level</Label>
              <Select value={formData.education} onValueChange={(v) => setFormData({ ...formData, education: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10+2">10+2</SelectItem>
                  <SelectItem value="Higher Secondary">Higher Secondary</SelectItem>
                  <SelectItem value="Diploma">Diploma</SelectItem>
                  <SelectItem value="Technical Course">Technical Course</SelectItem>
                  <SelectItem value="UG">UG - Bachelor's Degree</SelectItem>
                  <SelectItem value="PG">PG - Master's Degree</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label>Interests (Select Multiple)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {INTERESTS.map(interest => (
                  <Badge
                    key={interest}
                    variant={formData.interests.includes(interest) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFormData({
                      ...formData,
                      interests: toggleArrayItem(formData.interests, interest)
                    })}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>Stream (Field of Study)</Label>
              <Input value={formData.stream} onChange={(e) => setFormData({ ...formData, stream: e.target.value })} />
            </div>
            <div>
              <Label>Year</Label>
              <Input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              />
            </div>
            <div>
              <Label>Skills (Select Multiple)</Label>
              <div className="flex flex-wrap gap-2 mt-2 max-h-48 overflow-y-auto">
                {SUGGESTED_SKILLS.map(skill => (
                  <Badge
                    key={skill}
                    variant={formData.skills.includes(skill) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFormData({
                      ...formData,
                      skills: toggleArrayItem(formData.skills, skill)
                    })}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
              <Input
                className="mt-2"
                placeholder="Add custom skills (comma separated)"
                value={formData.customSkills}
                onChange={(e) => setFormData({ ...formData, customSkills: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label>Sectors of Interest (Select Multiple)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {SECTORS.map(sector => (
                  <Badge
                    key={sector}
                    variant={formData.sectors.includes(sector) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFormData({
                      ...formData,
                      sectors: toggleArrayItem(formData.sectors, sector)
                    })}
                  >
                    {sector}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div>
              <Label>PIN Code</Label>
              <Input
                value={formData.pinCode}
                onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                placeholder="Enter your PIN code"
              />
            </div>
            <div>
              <Label>Preferred Work Locations</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {POPULAR_CITIES.map(city => (
                  <Badge
                    key={city}
                    variant={formData.preferredLocations.includes(city) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFormData({
                      ...formData,
                      preferredLocations: toggleArrayItem(formData.preferredLocations, city)
                    })}
                  >
                    {city}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.isRural}
                onCheckedChange={(checked) => setFormData({ ...formData, isRural: !!checked })}
              />
              <Label>I am from a rural area</Label>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Your Recommendations</h3>
            {recommendations.length === 0 ? (
              <p className="text-muted-foreground">No internships found matching your criteria.</p>
            ) : (
              recommendations.map((rec: any) => (
                <Card key={rec.id} className="p-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-lg">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground">{rec.org_name}</p>
                    <p className="text-sm">{rec.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {rec.matchedSkills?.map((skill: string) => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-sm text-muted-foreground">
                        {rec.city && `${rec.city}, ${rec.state}`}
                        {rec.remote && " (Remote)"}
                      </div>
                      <Button onClick={() => handleApply(rec.id, rec.application_url)}>
                        Apply Now <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        <div className="flex justify-between pt-4">
          {step > 1 && step < 5 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
          )}
          {step < 4 && (
            <Button onClick={() => setStep(step + 1)} className="ml-auto">
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {step === 4 && (
            <Button onClick={getRecommendations} disabled={loading} className="ml-auto">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Get Recommendations
            </Button>
          )}
          {step === 5 && (
            <Button onClick={onClose} variant="outline" className="ml-auto">
              Close
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
