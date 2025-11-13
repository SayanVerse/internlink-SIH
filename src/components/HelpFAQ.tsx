import { Phone, Mail, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export const HelpFAQ = () => {
  const faqs = [
    {
      question: "How do I find internships?",
      answer: "Click on 'Find My Internship' button, fill out your preferences including skills, education, and location. Our AI will recommend 3-5 best-matched internships for you."
    },
    {
      question: "What is the eligibility criteria?",
      answer: "Students from 10+2 level to Post-Graduate level can apply. Make sure to fill your profile completely for better recommendations."
    },
    {
      question: "How does the recommendation system work?",
      answer: "Our system uses machine learning algorithms to match your skills, education, location preferences, and interests with available internships in the database."
    },
    {
      question: "Can I apply to multiple internships?",
      answer: "Yes! You can apply to as many internships as you want. Each application will be tracked in your dashboard."
    },
    {
      question: "How do I update my profile?",
      answer: "Go to your dashboard and click on 'Edit Profile'. You can update your personal information, education details, and skills."
    },
    {
      question: "What if I face technical issues?",
      answer: "Contact our support team through the phone numbers or email provided below. We're here to help!"
    },
    {
      question: "Is this service free?",
      answer: "Yes, the InternLink platform is completely free for students under the PM Internship Scheme."
    },
    {
      question: "How long does it take to get recommendations?",
      answer: "Recommendations are generated instantly after you submit your preferences. The process takes only a few seconds."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Contact Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Need help? Reach out to us through any of the following channels:
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Phone Support</p>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="link"
                    className="h-auto p-0 text-primary"
                    onClick={() => window.location.href = 'tel:9609800163'}
                  >
                    9609800163
                  </Button>
                  <span className="text-muted-foreground">/</span>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-primary"
                    onClick={() => window.location.href = 'tel:9477494999'}
                  >
                    9477494999
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Email Support</p>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="link"
                    className="h-auto p-0 text-primary text-sm"
                    onClick={() => window.location.href = 'mailto:sayan.official.2024@gmail.com'}
                  >
                    sayan.official.2024@gmail.com
                  </Button>
                  <br />
                  <Button
                    variant="link"
                    className="h-auto p-0 text-primary text-sm"
                    onClick={() => window.location.href = 'mailto:dsoukarsha@gmail.com'}
                  >
                    dsoukarsha@gmail.com
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};
