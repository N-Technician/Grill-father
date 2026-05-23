// Save this as: /api/chat.js in your GitHub repo (root level)
// This file works with Vercel's free serverless functions

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const { messages } = req.body;

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ reply: '❌ API key not configured' });
    }

    const nvidiaResponse = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-ai/deepseek-r1',
        messages: [
          {
            role: 'system',
            content: `You are a friendly AI assistant for Grill Father Restaurant, Kathmandu, Nepal.

RESTAURANT DETAILS:
📍 Location: Mid Baneshwor, Near Apex College, Kathmandu
📞 Phone: 9709035651
📧 Email: GrillFatherRestro@gmail.com

MENU ITEMS:
🍔 Grills & Mains: Grill Chicken, Mutton Sekuwa, Chicken Tikka, Chicken Sizzler, Mix Grill Platter
🍕 Pizza & Pasta: Special Pizza, Zorba Pizza, Spaghetti Carbonara
🥪 Sandwiches: Burger & Sandwich, Club Sandwich
🍚 Biryani & Rice: Biryaani, Jeera Rice, Chicken Thali, Veg Thali, Mutton Set
🌭 Other: Corn Dog, Butter Naan, Paneer Masala
🎂 Bakery: Vanilla Cake, Black Forest, Red Velvet, Donuts, Muffins, Pastry, Cookies
☕ Drinks: Cold Coffee, Fresh Lime, Milkshake, Lassi, Cappuccino, Coke/Fanta

🎉 PARTY PACKS: Small (10-20), Medium (20-40), Large (40-80), Custom (80+)

ORDERING OPTIONS:
✅ Dine-In | ✅ Takeaway | ✅ Home Delivery | ✅ WhatsApp: 9779804650880

INTERACTION RULES:
- Be warm, friendly, and concise
- Keep responses under 100 words
- Use emojis
- For orders: Direct to "Order Now" button or WhatsApp
- For party packs: Direct to "Party Pack" section
- Answer in English or Nepali`,
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
      console.error('NVIDIA Error:', nvidiaResponse.status, errorData);
      return res.status(200).json({ 
        reply: '⚠️ AI service temporarily unavailable. Please try WhatsApp: 9779804650880' 
      });
    }

    const data = await nvidiaResponse.json();
    const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Error:', error);
    return res.status(200).json({ 
      reply: `❌ Error: ${error.message}. Please try again or use WhatsApp.` 
    });
  }
}
