export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // GET request = show test page
    if (request.method === "GET") {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Grill & Bakes API</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 50px; background: #1a1a1a; color: white; }
            h1 { color: #e67e22; }
            .status { background: #27ae60; padding: 10px 30px; border-radius: 20px; display: inline-block; margin: 20px 0; }
          </style>
        </head>
        <body>
          <h1>🔥 Grill & Bakes API</h1>
          <div class="status">✅ Worker is Live!</div>
          <p>AI Chatbot backend is running perfectly.</p>
          <p>Powered by NVIDIA DeepSeek V4 Flash</p>
        </body>
        </html>
      `, {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "text/html" 
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
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
              content: `You are a friendly and helpful assistant for Grill & Bakes Family Restaurant located in Kapan Marga, Kathmandu, Nepal.

RESTAURANT INFO:
- Phone: 9709035651
- Email: GrillFatherrestro@gmail.com
- Location: Mid Baneshwor, Near Apex College

MENU:
Baked Items: Vanilla Cake, Black Forest, Red Velvet, Donuts, Muffins, Apple Pie, Pastry, Cookies
Chicken: Chicken Chilly, Roast Chicken, Chicken Lollipop, Chicken Drumstick, Chicken Tikka, Chicken Curry, Lemon Chicken, Garlic Chicken, Grill Chicken
Family Meals: Family Combo, Mix Grill Platter, Veg Thali, Chicken Thali, Mutton Set, Butter Naan, Paneer Masala, Jeera Rice, Biryaani
Fast Food: Burger & Sandwich, Club Sandwich, Corn Dog, Carbonara, Spaghetti Carbonara
Pizza: Special Pizza, Zorba Pizza
Sekuwa: Mutton Sekuwa
Drinks: Cold Coffee, Fresh Lime, Milkshake, Lassi, Cappuccino, Coke/Fanta

ORDERING:
- Dine-In, Takeaway, and Home Delivery available
- Orders via WhatsApp: 9779709035651

RULES:
- Be warm, concise, and helpful
- Answer in the same language as the customer (English or Nepali)
- For orders, guide them to use the "Order Now" button or WhatsApp
- Keep replies under 100 words unless detailed info is needed`
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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500, headers: corsHeaders,
      });
    }
  },
};






