/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

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

    const systemPrompt = `You are an expert vehicle inspection assistant. Analyze the spoken transcript from a vehicle inspector and determine which inspection checkpoints can be filled based on what was said.

For each checkpoint, select the most appropriate option value based on the inspector's words. Only include checkpoints that are clearly mentioned or implied in the transcript.

IMPORTANT:
- Return ONLY a valid JSON object with checkpoint IDs as keys and option values as values
- Only include checkpoints where you have reasonable confidence from the transcript
- Use exact option values (not labels)
- If the transcript mentions something is "ok", "good", "fine", "working", etc., select the positive option
- If damage, issues, or problems are mentioned, select the appropriate severity option

Example output format:
{"eng_start": "easy_start", "eng_oil": "clean", "body_paint": "good"}`;

    const userPrompt = `TRANSCRIPT FROM INSPECTOR:
"${transcript}"

CHECKPOINTS TO ANALYZE:
${checkpointDescriptions}

Based on the transcript above, return a JSON object mapping checkpoint IDs to the appropriate option values. Only include checkpoints that are mentioned or clearly implied.`;

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
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
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
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

    // Validate mappings - ensure values match actual options
    const validatedMappings: Record<string, string> = {};
    for (const [checkpointId, value] of Object.entries(mappings)) {
      const checkpoint = checkpoints.find(cp => cp.id === checkpointId);
      if (checkpoint) {
        const validOption = checkpoint.options.find(o => o.value === value);
        if (validOption) {
          validatedMappings[checkpointId] = value;
        }
      }
    }

    console.log("Validated mappings:", validatedMappings);

    return new Response(
      JSON.stringify({ 
        mappings: validatedMappings,
        count: Object.keys(validatedMappings).length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to analyze transcript";
    console.error("Error analyzing transcript:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
