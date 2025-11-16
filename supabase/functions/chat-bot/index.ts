import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get user from authorization header
    const authHeader = req.headers.get("authorization");
    let userProfile = null;
    let internshipCount = 0;

    if (authHeader && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const token = authHeader.replace("Bearer ", "");
        
        // Get user from token
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        
        if (!userError && user) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          
          if (profile) {
            userProfile = profile;
          }

          // Get user's application count
          const { count } = await supabase
            .from("applications")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);
          
          if (count !== null) {
            internshipCount = count;
          }
        }
      } catch (e) {
        console.log("Could not fetch user data:", e);
      }
    }

    // Fetch some active internships data for context
    let internshipsContext = "";
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const { data: internships } = await supabase
          .from("internships")
          .select("title, sector, org_name, city, remote, required_skills")
          .eq("active", true)
          .limit(10);
        
        if (internships && internships.length > 0) {
          internshipsContext = "\n\nAvailable internships include:\n" + 
            internships.map(i => 
              `- ${i.title} at ${i.org_name} (${i.sector}) in ${i.remote ? "Remote" : i.city || "Various locations"}`
            ).join("\n");
        }
      } catch (e) {
        console.log("Could not fetch internships:", e);
      }
    }

    let systemPrompt = `You are InternLink Bot, a helpful assistant for the PM Internship Scheme platform. 

Context: This platform helps students find internships through AI-powered recommendations.
${internshipsContext}

FAQs:
- How to find internships: Click "Find My Internship" and fill out your preferences
- Eligibility: Students from 10+2 to PG levels can apply
- Application process: Browse recommendations and apply through provided links
- Profile management: Edit your profile from the dashboard
- Support: Contact 9609800163 / 9477494999 or email sayan.official.2024@gmail.com`;

    if (userProfile) {
      systemPrompt += `\n\nUser Information:
- Name: ${userProfile.full_name}
- Education: ${userProfile.degree || "Not specified"}
- Branch: ${userProfile.branch || "Not specified"}
- College: ${userProfile.college_name || "Not specified"}
- Applications submitted: ${internshipCount}`;
    }

    systemPrompt += "\n\nBe helpful, concise, and friendly. Keep responses short and to the point. If asked about the user's profile or applications, use the information provided above.";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const botResponse = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that.";

    return new Response(
      JSON.stringify({ response: botResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("chat-bot error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
