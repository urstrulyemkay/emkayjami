/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Checkpoint {
  id: string;
  question: string;
  options: { value: string; label: string; severity?: string }[];
  voicePrompt: string;
}

interface AnalysisRequest {
  transcript: string;
  checkpoints: Checkpoint[];
  existingResponses: Record<string, string>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data, error: authError } = await supabase.auth.getClaims(token);
    
    if (authError || !data?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = data.claims.sub;
    console.log("Authenticated user:", userId);

    const { transcript, checkpoints, existingResponses } = await req.json() as AnalysisRequest;

    if (!transcript || !checkpoints?.length) {
      return new Response(
        JSON.stringify({ error: "Missing transcript or checkpoints" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analyzing transcript:", transcript.substring(0, 100) + "...");
    console.log("Checkpoints to fill:", checkpoints.length);

    // Build the prompt for AI analysis
    const checkpointDescriptions = checkpoints
      .filter(cp => !existingResponses[cp.id]) // Only unfilled checkpoints
      .map(cp => {
        const optionsStr = cp.options.map(o => `"${o.value}" (${o.label})`).join(", ");
        return `- ${cp.id}: "${cp.question}" | Options: ${optionsStr}`;
      })
      .join("\n");

    if (!checkpointDescriptions) {
      return new Response(
        JSON.stringify({ mappings: {}, message: "All checkpoints already filled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an expert vehicle inspection assistant. Analyze the spoken transcript from a vehicle inspector using EXCEPTION-BASED logic.

KEY INSIGHT: Inspectors only mention PROBLEMS. If something is NOT mentioned, it means it's OK/Good.

Your task:
1. Identify which checkpoints have ISSUES mentioned in the transcript
2. For those with issues, return the appropriate problem severity option
3. Return ONLY the checkpoints that have issues/problems mentioned

IMPORTANT:
- Return ONLY a valid JSON object with checkpoint IDs as keys and option values as values
- ONLY include checkpoints where the inspector mentioned a PROBLEM or ISSUE
- If something is described as "not available", "missing", "damaged", "not working", etc., include it with the appropriate severity
- Do NOT include checkpoints that are working fine - those will be auto-filled as OK
- Use exact option values (not labels)

Example: If inspector says "chassis number is not visible, everything else is fine"
- Return: {"vb_chassis_match": "not_visible"} 
- Do NOT include other fields - they will be auto-marked as OK

Example output format:
{"eng_oil": "low", "body_paint": "minor_scratches"}`;

    const userPrompt = `TRANSCRIPT FROM INSPECTOR:
"${transcript}"

CHECKPOINTS TO ANALYZE (only return ones with ISSUES mentioned):
${checkpointDescriptions}

Remember: Inspector only calls out problems. Return ONLY checkpoints with issues mentioned. All other checkpoints will be auto-filled as OK.`;

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.1,
        max_tokens: 1000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", errorText);
      return new Response(
        JSON.stringify({ error: "Analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    
    console.log("AI response content:", content);

    // Parse the JSON response (handle markdown code blocks)
    let mappings: Record<string, string> = {};
    try {
      // Remove markdown code blocks if present
      let jsonStr = content.trim();
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.slice(7);
      } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith("```")) {
        jsonStr = jsonStr.slice(0, -3);
      }
      jsonStr = jsonStr.trim();
      
      mappings = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error("Failed to parse AI response:", parseErr);
      mappings = {};
    }

    // Validate AI-detected issue mappings
    const issueMappings: Record<string, string> = {};
    for (const [checkpointId, value] of Object.entries(mappings)) {
      const checkpoint = checkpoints.find(cp => cp.id === checkpointId);
      if (checkpoint) {
        const validOption = checkpoint.options.find(o => o.value === value);
        if (validOption) {
          issueMappings[checkpointId] = value;
        }
      }
    }

    console.log("AI detected issues:", issueMappings);

    // Now auto-fill ALL unfilled checkpoints with their "ok" option (best case)
    // Exception: if AI detected an issue, use that instead
    const finalMappings: Record<string, string> = {};
    const unfilledCheckpoints = checkpoints.filter(cp => !existingResponses[cp.id]);
    
    for (const checkpoint of unfilledCheckpoints) {
      if (issueMappings[checkpoint.id]) {
        // AI detected an issue - use that
        finalMappings[checkpoint.id] = issueMappings[checkpoint.id];
      } else {
        // No issue mentioned - default to OK/best option
        const okOption = checkpoint.options.find(o => o.severity === "ok") || checkpoint.options[0];
        if (okOption) {
          finalMappings[checkpoint.id] = okOption.value;
        }
      }
    }

    const issueCount = Object.keys(issueMappings).length;
    const okCount = Object.keys(finalMappings).length - issueCount;
    
    console.log(`Final mappings: ${issueCount} issues detected, ${okCount} auto-filled as OK`);

    return new Response(
      JSON.stringify({ 
        mappings: finalMappings,
        issueCount,
        okCount,
        totalFilled: Object.keys(finalMappings).length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error analyzing transcript:", error instanceof Error ? error.message : "Unknown error");
    return new Response(
      JSON.stringify({ error: "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
