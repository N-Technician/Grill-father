export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    if (request.method !== "POST") {
      return new Response("Method not allowed", {status: 405, headers: corsHeaders});
    }
    try {
      const body = await request.json();
      const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.NVIDIA_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-ai/deepseek-v4-flash",
          messages: [
            {
              role: "system",
              content: "You are a friendly assistant for Grill & Bakes Family Restaurant in Kapan Marga, Kathmandu. Help with menu, orders, location. Phone: 9804650880. Keep replies short and warm."
            },
            ...(body.messages || [])
          ],
          temperature: 0.7,
          max_tokens: 400,
          stream: false,
        }),
      });
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: {...corsHeaders, "Content-Type": "application/json"},
      });
    } catch (err) {
      return new Response(JSON.stringify({error: err.message}), {
        status: 500, headers: corsHeaders,
      });
    }
  },
};





          
