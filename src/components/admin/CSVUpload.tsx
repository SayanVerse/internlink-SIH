import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, AlertCircle, Download } from "lucide-react";
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

  const handleDownloadSample = () => {
    const sampleData = `title,sector,orgName,description,city,state,pin,remote,minEducation,requiredSkills,stipendMin,stipendMax,applicationUrl,deadline,active
Software Development Intern,IT,Tech Solutions Ltd,Develop web applications using React and Node.js,Bangalore,Karnataka,560001,false,Bachelor's,React;Node.js;JavaScript;MongoDB,15000,25000,https://example.com/apply1,2025-12-31,true
Data Analyst Intern,IT,DataCorp Analytics,Analyze business data and create insights using Python,Mumbai,Maharashtra,400001,true,Bachelor's,Python;SQL;Excel;Data Visualization,12000,20000,https://example.com/apply2,2025-11-30,true
Digital Marketing Intern,Marketing,AdVenture Media,Manage social media campaigns and SEO optimization,Delhi,Delhi,110001,false,Bachelor's,SEO;Social Media;Content Writing,10000,18000,https://example.com/apply3,2025-12-15,true
Frontend Developer Intern,IT,WebWorks India,Build responsive websites using modern frameworks,Chennai,Tamil Nadu,600001,true,Bachelor's,HTML;CSS;JavaScript;React;Tailwind,18000,28000,https://example.com/apply4,2025-12-20,true
Machine Learning Intern,IT,AI Innovations,Work on ML models and data pipelines,Hyderabad,Telangana,500001,false,Bachelor's,Python;TensorFlow;Machine Learning;Data Science,20000,30000,https://example.com/apply5,2026-01-15,true
Content Writer Intern,Marketing,ContentHub,Create engaging content for blogs and websites,Pune,Maharashtra,411001,true,Bachelor's,Content Writing;SEO;Research,8000,15000,https://example.com/apply6,2025-11-25,true
Business Analyst Intern,Finance,FinTech Solutions,Analyze business processes and recommend improvements,Gurgaon,Haryana,122001,false,Bachelor's,Excel;PowerPoint;Business Analysis,15000,22000,https://example.com/apply7,2025-12-10,true
Graphic Designer Intern,Design,Creative Studios,Design marketing materials and brand assets,Mumbai,Maharashtra,400002,true,Bachelor's,Photoshop;Illustrator;Figma;Canva,12000,20000,https://example.com/apply8,2025-11-28,true
Mobile App Developer Intern,IT,AppGenius,Develop Android/iOS applications,Bangalore,Karnataka,560002,false,Bachelor's,Flutter;React Native;Firebase;Mobile Development,18000,26000,https://example.com/apply9,2026-01-05,true
HR Intern,Human Resources,PeopleFirst HR,Support recruitment and employee engagement,Delhi,Delhi,110002,false,Bachelor's,Communication;MS Office;Recruitment,10000,16000,https://example.com/apply10,2025-12-08,true
Financial Analyst Intern,Finance,InvestPro,Analyze financial statements and market trends,Mumbai,Maharashtra,400003,false,Bachelor's,Excel;Financial Modeling;Accounting,16000,24000,https://example.com/apply11,2026-01-10,true
UI/UX Designer Intern,Design,DesignFlow,Create user-centered designs for web and mobile,Bangalore,Karnataka,560003,true,Bachelor's,Figma;Adobe XD;User Research;Prototyping,14000,22000,https://example.com/apply12,2025-12-18,true
Backend Developer Intern,IT,CloudTech Systems,Build scalable backend APIs and microservices,Hyderabad,Telangana,500002,false,Bachelor's,Node.js;Python;SQL;API Development,17000,27000,https://example.com/apply13,2025-12-25,true
Social Media Manager Intern,Marketing,BrandBoost,Manage social media presence across platforms,Chennai,Tamil Nadu,600002,true,Bachelor's,Social Media Marketing;Analytics;Content Creation,11000,19000,https://example.com/apply14,2025-11-30,true
Video Editor Intern,Media,MediaCraft Studios,Edit promotional videos and social media content,Pune,Maharashtra,411002,false,Bachelor's,Premiere Pro;After Effects;Video Editing,13000,21000,https://example.com/apply15,2025-12-12,true
Cybersecurity Intern,IT,SecureNet Solutions,Monitor security systems and conduct vulnerability assessments,Gurgaon,Haryana,122002,false,Bachelor's,Network Security;Ethical Hacking;Cybersecurity,19000,29000,https://example.com/apply16,2026-01-20,true
Sales Intern,Sales,SalesForce India,Support sales team with lead generation and client meetings,Mumbai,Maharashtra,400004,false,Bachelor's,Communication;Sales;MS Office,10000,17000,https://example.com/apply17,2025-12-05,true
Research Analyst Intern,Research,InsightLabs,Conduct market research and competitive analysis,Bangalore,Karnataka,560004,true,Bachelor's,Research;Data Analysis;Excel;Report Writing,14000,22000,https://example.com/apply18,2025-12-22,true
Product Management Intern,Product,InnovateTech,Assist in product development and roadmap planning,Delhi,Delhi,110003,false,Bachelor's,Product Management;Analytics;User Research,16000,25000,https://example.com/apply19,2026-01-08,true
IoT Developer Intern,IT,SmartDevices Co,Work on IoT projects and embedded systems,Chennai,Tamil Nadu,600003,false,Bachelor's,Arduino;Raspberry Pi;C++;Python;IoT,15000,23000,https://example.com/apply20,2025-12-28,true
E-commerce Manager Intern,E-commerce,ShopEase,Manage online store operations and inventory,Pune,Maharashtra,411003,true,Bachelor's,E-commerce;Digital Marketing;Analytics,12000,20000,https://example.com/apply21,2025-11-27,true
Blockchain Developer Intern,IT,CryptoTech Solutions,Develop smart contracts and blockchain applications,Hyderabad,Telangana,500003,false,Bachelor's,Solidity;Blockchain;Ethereum;Web3,20000,32000,https://example.com/apply22,2026-01-25,true
Quality Assurance Intern,IT,TestPro Systems,Test software applications and report bugs,Bangalore,Karnataka,560005,false,Bachelor's,Manual Testing;Automation;Selenium;JIRA,13000,21000,https://example.com/apply23,2025-12-15,true
Operations Manager Intern,Operations,LogiFlow,Optimize operational processes and supply chain,Mumbai,Maharashtra,400005,false,Bachelor's,Operations Management;Excel;Process Optimization,14000,22000,https://example.com/apply24,2025-12-30,true
DevOps Engineer Intern,IT,CloudOps Pro,Automate deployment pipelines and infrastructure,Gurgaon,Haryana,122003,true,Bachelor's,Docker;Kubernetes;CI/CD;AWS;Linux,18000,28000,https://example.com/apply25,2026-01-12,true`;

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_internships.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Sample downloaded",
      description: "You can now edit and upload this CSV file",
    });
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
          <Button 
            onClick={handleDownloadSample} 
            variant="outline" 
            className="w-full mb-4"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Sample CSV with 25 Real Internships
          </Button>
          
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
