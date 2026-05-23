export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow POST requests for chat
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ reply: "❌ Only POST requests allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    try {
      // Parse incoming request
      const requestBody = await request.json();
      const messages = requestBody.messages || [];

      // Verify API key exists
      if (!env.NVIDIA_API_KEY) {
        return new Response(
          JSON.stringify({ reply: "❌ Server error: API key not configured. Please contact admin." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Make request to NVIDIA DeepSeek API
      const nvidiaResponse = await fetch(
        "https://integrate.api.nvidia.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${env.NVIDIA_API_KEY}`,
          },
          body: JSON.stringify({
            model: "deepseek-ai/deepseek-r1",
            messages: [
              {
                role: "system",
                content: `You are a helpful and friendly AI assistant for Grill Father Restaurant in Kathmandu, Nepal.

RESTAURANT DETAILS:
📍 Location: Mid Baneshwor, Near Apex College, Kathmandu
📞 Phone: 9709035651
📧 Email: GrillFatherrestro@gmail.com

MENU:
🍔 Grills: Grill Chicken, Mutton Sekuwa, Chicken Tikka, Chicken Sizzler, Mix Grill Platter
🍕 Pizza: Special Pizza, Zorba Pizza, Spaghetti Carbonara
🥪 Sandwiches: Burger & Sandwich, Club Sandwich
🍚 Biryani & Rice: Biryaani, Jeera Rice, Chicken/Veg Thali, Mutton Set
🎂 Bakery: Vanilla Cake, Black Forest, Red Velvet, Donuts, Muffins, Pastry, Cookies
☕ Drinks: Cold Coffee, Milkshake, Lassi, Cappuccino, Fresh Lime, Coke/Fanta

🎉 PARTY PACKS: Small (10-20), Medium (20-40), Large (40-80), Custom (80+)

ORDERING: Dine-In | Takeaway | Home Delivery | WhatsApp: 9779709035651

RULES:
- Be warm, friendly, and concise
- Keep responses under 100 words
- Use emojis
- For orders: Direct to "Order Now" button or WhatsApp
- For party packs: Direct to "Party Pack" section`,
              },
              ...messages,
            ],
            temperature: 0.7,
            max_tokens: 300,
            stream: false,
          }),
        }
      );

      // Check if NVIDIA API response is OK
      if (!nvidiaResponse.ok) {
        const errorText = await nvidiaResponse.text();
        console.error(`NVIDIA API Error: ${nvidiaResponse.status} - ${errorText}`);
        return new Response(
          JSON.stringify({
            reply: "⚠️ AI service is temporarily unavailable. Please try again in a moment.",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Parse NVIDIA response
      const data = await nvidiaResponse.json();
      const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response. Please try again.";

      return new Response(
        JSON.stringify({ reply }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Error:", error.message);
      return new Response(
        JSON.stringify({
          reply: `❌ Error: ${error.message}. Please try again later.`,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  },
};






      
