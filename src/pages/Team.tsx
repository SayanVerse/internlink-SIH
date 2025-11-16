import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Phone } from "lucide-react";

const teamMembers = [
  {
    name: "Sayan Maiti",
    email: "sayan.official.2024@gmail.com",
    phone: "9609800163"
  },
  {
    name: "Soukarsha Dutta",
    email: "dsoukarsha@gmail.com",
    phone: "9477494999"
  },
  {
    name: "Sk Sania Aktari",
    email: "saniatoa2005@gmail.com",
    phone: "9832006373"
  },
  {
    name: "Yajdin Mallick",
    email: "yajdinmallick@gmail.com",
    phone: "9907674051"
  },
  {
    name: "Raj Nandini",
    email: "nandiniraj833@gmail.com",
    phone: "9304747624"
  },
  {
    name: "Rounak Kundu",
    email: "rounak7430@gmail.com",
    phone: "+91 98326 22086"
  }
];

const Team = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/50">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between p-4 md:p-6 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Team Tech Bridge
            </h1>
            <p className="text-muted-foreground text-lg">
              Smart India Hackathon 2025
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {teamMembers.map((member, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <CardDescription>Team Member</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <a 
                      href={`mailto:${member.email}`}
                      className="text-primary hover:underline break-all"
                    >
                      {member.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <a 
                      href={`tel:${member.phone}`}
                      className="text-foreground hover:text-primary transition-colors"
                    >
                      {member.phone}
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Team;
