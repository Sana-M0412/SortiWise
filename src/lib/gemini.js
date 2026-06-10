import { GoogleGenerativeAI } from '@google/generative-ai';

// Retrieve API key from Env or LocalStorage (settings panel)
export function getGeminiApiKey() {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey !== 'your_gemini_key_here' && envKey !== 'your_gemini_api_key_here' && !envKey.startsWith('your_')) {
    return envKey;
  }
  return localStorage.getItem('sortiwise_gemini_key') || '';
}

// System instructions to guide SortiWise AI segregation and reasoning
const SYSTEM_INSTRUCTIONS = `
You are the SortiWise AI Waste Classification Assistant, an expert in zero-shot visual reasoning, materials science, and environmental impact.
Your job is to identify waste items and return highly detailed, structured, sustainability-focused insights in English, Kannada, or Hindi.
Ensure all outputs are formatted as valid JSON matching this schema:
{
  "itemName": "String (common name of the item)",
  "category": "recyclable | compostable | hazardous | landfill | e-waste",
  "confidence": Number (0 to 1, estimate confidence level),
  "carbonFootprintKg": Number (estimated carbon footprint in kg CO2 equivalent to produce/dispose),
  "disposalInstructions": ["Array", "of", "step-by-step", "clear", "disposal", "actions"],
  "reuseIdeas": ["Array", "of", "creative", "upcycling/reuse", "ideas"],
  "alternatives": ["Array", "of", "eco-friendly", "reusable", "or", "biodegradable", "alternatives"],
  "environmentalReasoning": "String (educational explanation of why it fits this category and its carbon impact details)",
  "sustainabilityScore": Number (0 to 100, where 100 is highly sustainable and 0 is extremely damaging)
}

Classification Guide:
1. recyclable: Paper, cardboard, clean glass, clean metals, PET/HDPE plastics.
2. compostable: Food scraps, organic garden waste, biodegradable plastics (PLA) if certified, uncoated paper towels.
3. hazardous: Batteries, lightbulbs, medical waste, paint, aerosol cans, chemicals.
4. landfill: Soiled food containers, multi-material laminates (chip packets), broken mirrors/ceramic, diapers.
5. e-waste: Computers, cellphones, chargers, cables, circuit boards, appliances.

Reason logically and explain carbon foot-print impacts precisely.
`;

// Helper to convert File to generative part (inlineData)
async function fileToGenerativePart(imageFile) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({
        inlineData: {
          data: reader.result.split(',')[1],
          mimeType: imageFile.type
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
}

// Analyze waste via Multimodal Image Input
export async function analyzeWasteImage(imageFile, language = 'en') {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("Gemini API Key missing. Please set it in the Settings panel.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const imagePart = await fileToGenerativePart(imageFile);
  const prompt = `Classify this waste item. Provide the response in the language: "${language}".\n${SYSTEM_INSTRUCTIONS}`;

  const executeCall = async (modelName) => {
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: { responseMimeType: 'application/json' }
    });
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    return JSON.parse(responseText);
  };

  try {
    return await executeCall('gemini-2.5-flash');
  } catch (err) {
    console.warn("gemini-2.5-flash failed, attempting fallback to gemini-2.0-flash", err);
    return await executeCall('gemini-2.0-flash');
  }
}

// Analyze waste via Text Description
export async function analyzeWasteText(textDescription, language = 'en') {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("Gemini API Key missing. Please set it in the Settings panel.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const prompt = `Classify this waste item based on this description: "${textDescription}". Provide the response in the language: "${language}".\n${SYSTEM_INSTRUCTIONS}`;

  const executeCall = async (modelName) => {
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: { responseMimeType: 'application/json' }
    });
    const result = await model.generateContent([prompt]);
    const responseText = result.response.text();
    return JSON.parse(responseText);
  };

  try {
    return await executeCall('gemini-2.5-flash');
  } catch (err) {
    console.warn("gemini-2.5-flash failed, attempting fallback to gemini-2.0-flash", err);
    return await executeCall('gemini-2.0-flash');
  }
}

// Chat with the Coach
export async function askAICoach(chatHistory, message, language = 'en') {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return "Hi, I am your AI Sustainability Coach. Please add your Gemini API Key in Settings to enable conversations!";
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const formattedHistory = chatHistory.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  const executeCall = async (modelName) => {
    const model = genAI.getGenerativeModel({ model: modelName });
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: `You are the SortiWise AI Sustainability Coach. Your goal is to guide users to live a greener, low-carbon lifestyle. Answer questions concisely, friendly, and provide helpful eco-tips. Respond in ${language}.` }]
        },
        ...formattedHistory
      ]
    });
    const result = await chat.sendMessage(message);
    return result.response.text();
  };

  try {
    return await executeCall('gemini-2.5-flash');
  } catch (err) {
    console.warn("gemini-2.5-flash failed, attempting fallback to gemini-2.0-flash", err);
    return await executeCall('gemini-2.0-flash');
  }
}
