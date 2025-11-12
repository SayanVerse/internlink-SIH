import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const popularColleges = [
  "IIT Delhi",
  "IIT Bombay",
  "IIT Madras",
  "NIT Trichy",
  "BITS Pilani",
  "Delhi University",
  "Mumbai University",
  "Other",
];

const degrees = [
  { value: "btech", label: "B.Tech", branches: ["CSE", "ECE", "EEE", "ME", "CE", "AIML", "AIDS", "IT"] },
  { value: "bca", label: "BCA", branches: ["Computer Applications", "Data Science", "Cyber Security"] },
  { value: "mca", label: "MCA", branches: ["Computer Applications", "AI/ML", "Cloud Computing"] },
  { value: "mtech", label: "M.Tech", branches: ["CSE", "ECE", "VLSI", "Embedded Systems"] },
  { value: "barch", label: "B.Arch", branches: ["Architecture", "Urban Planning"] },
  { value: "bba", label: "BBA", branches: ["Management", "Finance", "Marketing"] },
  { value: "mba", label: "MBA", branches: ["Finance", "HR", "Marketing", "Operations"] },
];

export function SignupForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [date, setDate] = useState<Date>();
  const [selectedDegree, setSelectedDegree] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    college: "",
    degree: "",
    branch: "",
  });

  const selectedDegreeData = degrees.find((d) => d.value === selectedDegree);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast({
        title: "Date of birth required",
        description: "Please select your date of birth",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            date_of_birth: format(date, "yyyy-MM-dd"),
            college_name: formData.college,
            degree: formData.degree,
            branch: formData.branch,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      toast({
        title: "Account created!",
        description: "Welcome to Intern Link. Redirecting to dashboard...",
      });

      // Navigate to dashboard after successful signup
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          placeholder="John Doe"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signupEmail">Email Address</Label>
        <Input
          id="signupEmail"
          type="email"
          placeholder="your@email.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signupPassword">Password</Label>
        <div className="relative">
          <Input
            id="signupPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Date of Birth</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              className="pointer-events-auto"
              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="college">College Name</Label>
        <Select value={formData.college} onValueChange={(value) => setFormData({ ...formData, college: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select your college" />
          </SelectTrigger>
          <SelectContent>
            {popularColleges.map((college) => (
              <SelectItem key={college} value={college}>
                {college}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="degree">Degree</Label>
        <Select
          value={selectedDegree}
          onValueChange={(value) => {
            setSelectedDegree(value);
            setFormData({ ...formData, degree: value, branch: "" });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your degree" />
          </SelectTrigger>
          <SelectContent>
            {degrees.map((degree) => (
              <SelectItem key={degree.value} value={degree.value}>
                {degree.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedDegreeData && (
        <div className="space-y-2">
          <Label htmlFor="branch">Branch/Specialization</Label>
          <Select value={formData.branch} onValueChange={(value) => setFormData({ ...formData, branch: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select your branch" />
            </SelectTrigger>
            <SelectContent>
              {selectedDegreeData.branches.map((branch) => (
                <SelectItem key={branch} value={branch}>
                  {branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-gradient-primary hover:bg-gradient-primary-hover"
        disabled={loading}
      >
        Create Account
      </Button>
    </form>
  );
}
