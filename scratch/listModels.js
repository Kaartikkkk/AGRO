const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '../server/.env' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    // We can fetch the list using the rest client or direct request
    // Alternatively, just try generating content with different common names 
    // to see which one works (e.g. gemini-1.5-flash, gemini-1.5-flash-8b, etc.)
    console.log("Checking API key:", process.env.GEMINI_API_KEY ? "Defined" : "Undefined");
    
    const testModels = [
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash-8b',
      'gemini-1.5-pro',
      'gemini-2.0-flash-exp',
      'gemini-2.0-flash'
    ];

    for (const modelName of testModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("test");
        console.log(`✅ Model '${modelName}' is supported and responsive!`);
      } catch (err) {
        console.log(`❌ Model '${modelName}' failed:`, err.message);
      }
    }
  } catch (error) {
    console.error("List models error:", error);
  }
}

listModels();
