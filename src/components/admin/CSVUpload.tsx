import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CSVUploadProps {
  onUploadComplete: () => void;
}

export function CSVUpload({ onUploadComplete }: CSVUploadProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.split("\n");
    const headers = lines[0].split(",").map((h) => h.trim());
    const internships = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(",").map((v) => v.trim());
      const internship: any = {};

      headers.forEach((header, index) => {
        const value = values[index];
        
        if (header === "remote" || header === "active") {
          internship[header] = value.toLowerCase() === "true";
        } else if (header === "stipendMin" || header === "stipendMax") {
          internship[header] = value ? parseInt(value) : null;
        } else if (header === "requiredSkills") {
          internship[header] = value ? value.split(";").map((s) => s.trim()) : [];
        } else {
          internship[header] = value || null;
        }
      });

      // Map CSV headers to database columns
      const mappedInternship = {
        title: internship.title,
        sector: internship.sector,
        org_name: internship.orgName,
        description: internship.description,
        city: internship.city,
        state: internship.state,
        pin: internship.pin,
        remote: internship.remote,
        min_education: internship.minEducation,
        required_skills: internship.requiredSkills,
        stipend_min: internship.stipendMin,
        stipend_max: internship.stipendMax,
        application_url: internship.applicationUrl,
        deadline: internship.deadline,
        active: internship.active !== undefined ? internship.active : true,
      };

      internships.push(mappedInternship);
    }

    return internships;
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const text = await file.text();
      const internships = parseCSV(text);

      if (internships.length === 0) {
        throw new Error("No valid internships found in CSV");
      }

      const { error } = await supabase.from("internships").insert(internships);

      if (error) throw error;

      toast({
        title: "Upload successful",
        description: `${internships.length} internships have been added.`,
      });

      setFile(null);
      onUploadComplete();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">CSV Upload</h2>
        <p className="text-muted-foreground">Bulk upload internships from a CSV file</p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>CSV Format:</strong> title, sector, orgName, description, city, state, pin,
          remote, minEducation, requiredSkills, stipendMin, stipendMax, applicationUrl, deadline,
          active
          <br />
          <span className="text-xs">
            Note: requiredSkills should be semicolon-separated (e.g., Python;React;Communication)
          </span>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload Internships CSV
          </CardTitle>
          <CardDescription>
            Select a CSV file with internship data to bulk upload
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={loading}
            />
            <Button onClick={handleUpload} disabled={!file || loading}>
              <Upload className="mr-2 h-4 w-4" />
              {loading ? "Uploading..." : "Upload"}
            </Button>
          </div>

          {file && (
            <div className="text-sm text-muted-foreground">
              Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sample CSV Template</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`title,sector,orgName,description,city,state,pin,remote,minEducation,requiredSkills,stipendMin,stipendMax,applicationUrl,deadline,active
Software Engineer Intern,Technology,TechCorp,Full-stack development,Bangalore,Karnataka,560001,false,B.Tech,Python;React;JavaScript,15000,25000,https://example.com/apply,2025-12-31,true
Data Analyst Intern,Finance,FinServ,Data analysis and reporting,Mumbai,Maharashtra,400001,true,BCA,Excel;SQL;Tableau,12000,20000,https://example.com/apply,2025-11-30,true`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
