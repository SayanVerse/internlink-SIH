import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिन्दी" },
  { code: "bn", name: "বাংলা" },
  { code: "te", name: "తెలుగు" },
  { code: "mr", name: "मराठी" },
  { code: "ta", name: "தமிழ்" },
];

export function LanguageSwitcher() {
  const { toast } = useToast();
  const [currentLang, setCurrentLang] = useState("en");
  const [googleTranslateLoaded, setGoogleTranslateLoaded] = useState(false);

  useEffect(() => {
    // Check if Google Translate is already loaded
    if ((window as any).google?.translate) {
      setGoogleTranslateLoaded(true);
      return;
    }

    // Load Google Translate script
    const script = document.createElement("script");
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    // Initialize Google Translate
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,hi,bn,te,mr,ta",
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        "google_translate_element"
      );
      setGoogleTranslateLoaded(true);
    };

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src*="translate.google.com"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const handleLanguageChange = (langCode: string) => {
    setCurrentLang(langCode);

    if (!googleTranslateLoaded) {
      toast({
        title: "Translation service loading",
        description: "Please wait a moment and try again.",
      });
      return;
    }

    try {
      // Find and trigger Google Translate dropdown
      const selectElement = document.querySelector(".goog-te-combo") as HTMLSelectElement;
      if (selectElement) {
        selectElement.value = langCode;
        selectElement.dispatchEvent(new Event("change"));
        
        toast({
          title: "Language changed",
          description: `Switched to ${languages.find(l => l.code === langCode)?.name}`,
        });
      }
    } catch (error) {
      console.error("Language switch error:", error);
      toast({
        title: "Translation error",
        description: "Failed to change language. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* Hidden Google Translate element */}
      <div id="google_translate_element" style={{ display: "none" }}></div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Globe className="h-5 w-5" />
            <span className="sr-only">Change language</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={currentLang === lang.code ? "bg-primary/10" : ""}
            >
              {lang.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
