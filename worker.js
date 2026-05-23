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
      return new Response(JSON.stringify({ error: "Only POST allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      const { messages } = await request.json();

      if (!messages || !Array.isArray(messages)) {
        return new Response(JSON.stringify({ reply: "Invalid message format" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!env.NVIDIA_API_KEY) {
        console.error("NVIDIA_API_KEY not set");
        return new Response(JSON.stringify({ reply: "Server configuration error" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const nvidiaResponse = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
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
              content: `You are a friendly and helpful assistant for Grill Father Restaurant located in Mid Baneshwor, Near Apex College, Kathmandu, Nepal.

RESTAURANT INFO:
📍 Location: Mid Baneshwor, Near Apex College, Kathmandu
📞 Phone: 9709035651
📧 Email: GrillFatherrestro@gmail.com
🗺️ Maps: https://maps.app.goo.gl/wD33BUkBjJBoETx36

MENU ITEMS:
🍔 Grills & Mains: Grill Chicken, Mutton Sekuwa, Chicken Tikka, Chicken Sizzler, Mix Grill Platter, Roast Chicken, Chicken Lollipop, Chicken Drumstick, Paneer Masala, Chicken Curry, Lemon Chicken, Garlic Chicken, Chicken Chilly

🍕 Pizza & Pasta: Special Pizza, Zorba Pizza, Spaghetti Carbonara, Carbonara

🥪 Sandwiches: Burger & Sandwich, Club Sandwich

🍚 Rice & Biryani: Biryaani, Jeera Rice, Chicken Thali, Veg Thali, Mutton Set

🌭 Other Items: Corn Dog, Butter Naan

🎂 Bakery: Vanilla Cake, Black Forest, Red Velvet, Donuts, Muffins, Apple Pie, Pastry, Cookies

☕ Drinks & Beverages: Cold Coffee, Fresh Lime, Milkshake, Lassi, Cappuccino, Coke/Fanta, Family Combo

🎉 PARTY PACKS (Min 10 people):
- Small Pack (10-20): Burger/Sandwich + Drinks + 1 special item
- Medium Pack (20-40): Burger + Biryani + Pizza + Drinks + 2 special items [MOST POPULAR]
- Large Pack (40-80): Full menu variety + Drinks + Desserts
- Custom Pack (80+): Fully customized with dedicated support

ORDERING OPTIONS:
✅ Dine-In: Eat at the restaurant
✅ Takeaway: Pack and take home
✅ Home Delivery: We deliver to your location
✅ WhatsApp Orders: 9779709035651

INTERACTION STYLE:
- Be warm, friendly, and concise
- Keep responses SHORT (2-3 sentences max)
- Use emojis to make it engaging
- Answer in English or Nepali based on customer's language
- For orders: Direct them to "Order Now" button or WhatsApp
- For party packs: Direct them to "Party Pack" section
- Never give specific prices - tell them to order for current rates`,
            },
            ...messages,
          ],
          temperature: 0.7,
          max_tokens: 300,
          stream: false,
        }),
      });

      if (!nvidiaResponse.ok) {
        const errorData = await nvidiaResponse.text();
        console.error("NVIDIA API Error:", nvidiaResponse.status, errorData);
        return new Response(
          JSON.stringify({
            reply: `⚠️ Service temporarily unavailable. Please try again in a moment.`,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const data = await nvidiaResponse.json();
      console.log("NVIDIA Response:", JSON.stringify(data));

      // Extract the actual response from NVIDIA's format
      const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

      return new Response(JSON.stringify({ reply }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Worker Error:", err.message);
      return new Response(
        JSON.stringify({
          reply: `❌ Error: ${err.message}. Please try again.`,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  },
};




