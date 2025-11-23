import { GoogleGenAI, Type } from "@google/genai";
import { CreatureResponse, Language } from "../types";

// Initialize Gemini Client
// NOTE: process.env.API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getSystemInstruction = (language: Language) => `
Role Definition:
You are the 'Bio-Genesis Engine'. You are a transcendent expert in astrobiology, evolutionary psychology, biomechanics, and game design.
Your goal is to design a fictional creature based on the user's abstract idea, balancing Scientific Plausibility and Gameplay Mechanics.

Core Directives:
1. Logical Consistency: No magic. All features must have biological/chemical grounds.
2. Evolutionary Fit: Optimize for the environment.
3. Game Balance: Strong advantages must have fatal weaknesses.
4. Language Requirement: The user has selected **${language === 'ko' ? 'KOREAN' : 'ENGLISH'}**.

Process:
1. Input Analysis
2. Environmental Check
3. Biological Engineering
4. Visual Conception
5. JSON Construction

Output Rules:
- If Language is Korean ('ko'):
  - 'codex' fields (common_name, biological_description, etc.) MUST be in Korean.
  - 'traits' (name, effect, biological_basis) MUST be in Korean.
  - 'behavior_tree' descriptions MUST be in Korean.
  - 'weaknesses' MUST be in Korean.
  - 'taxonomy' values can be in Korean or English (standard terms).
- **CRITICAL EXCEPTION**: 'visual_generation_prompt' MUST ALWAYS be in ENGLISH, regardless of the selected language.
- 'scientific_name' should always be in Latin-style English format.

Output Format:
You must return a JSON object containing two main sections: 'codex' (Natural Language) and 'engine_data' (Game Engine JSON).
`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    codex: {
      type: Type.OBJECT,
      properties: {
        scientific_name: { type: Type.STRING },
        common_name: { type: Type.STRING },
        biological_description: { type: Type.STRING },
        ecological_role: { type: Type.STRING },
      },
      required: ["scientific_name", "common_name", "biological_description", "ecological_role"],
    },
    engine_data: {
      type: Type.OBJECT,
      properties: {
        entity_id: { type: Type.STRING },
        taxonomy: {
          type: Type.OBJECT,
          properties: {
            class: { type: Type.STRING },
            diet: { type: Type.STRING },
          },
          required: ["class", "diet"],
        },
        stats: {
          type: Type.OBJECT,
          properties: {
            hp: { type: Type.INTEGER },
            speed: { type: Type.INTEGER },
            intelligence: { type: Type.INTEGER },
            stealth: { type: Type.INTEGER },
          },
          required: ["hp", "speed", "intelligence", "stealth"],
        },
        traits: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              effect: { type: Type.STRING },
              biological_basis: { type: Type.STRING },
            },
            required: ["name", "effect", "biological_basis"],
          },
        },
        weaknesses: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        visual_generation_prompt: { type: Type.STRING },
        behavior_tree: {
          type: Type.OBJECT,
          properties: {
            idle: { type: Type.STRING },
            combat: { type: Type.STRING },
            mating: { type: Type.STRING },
          },
          required: ["idle", "combat", "mating"],
        },
      },
      required: ["entity_id", "taxonomy", "stats", "traits", "weaknesses", "visual_generation_prompt", "behavior_tree"],
    },
  },
  required: ["codex", "engine_data"],
};

export const generateCreatureData = async (userPrompt: string, language: Language): Promise<CreatureResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: getSystemInstruction(language),
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7, // Slightly creative but structured
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from Gemini");
    
    return JSON.parse(text) as CreatureResponse;
  } catch (error) {
    console.error("Error generating creature data:", error);
    throw error;
  }
};

export const generateCreatureImage = async (visualPrompt: string): Promise<string | null> => {
  try {
    // Using gemini-2.5-flash-image for image generation
    // Requesting a format suitable for "fake 3D" holograms: clear silhouette, black background.
    const prompt = `3D model character design, t-pose or dynamic pose, full body view, ${visualPrompt}. High contrast, bioluminescent details, solid black background (hex #000000), volumetric lighting, unreal engine 5 render style.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        // We don't set responseMimeType here as we want the default mixed content
      }
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          return `data:${mimeType};base64,${base64EncodeString}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error generating creature image:", error);
    return null;
  }
};

export const simulateBattle = async (creatureA: CreatureResponse, creatureB: CreatureResponse, language: Language): Promise<{ summary: string; log: string; winner: string; imageUrl: string | null }> => {
  try {
    // 1. Prepare Text Prompt
    const textPrompt = `
    Simulate a deadly battle between these two creatures.
    
    CREATURE A: ${creatureA.codex.common_name}
    - Stats: HP ${creatureA.engine_data.stats.hp}, Speed ${creatureA.engine_data.stats.speed}, Intel ${creatureA.engine_data.stats.intelligence}, Stealth ${creatureA.engine_data.stats.stealth}
    - Traits: ${creatureA.engine_data.traits.map(t => t.name).join(', ')}
    - Weaknesses: ${creatureA.engine_data.weaknesses.join(', ')}
    
    CREATURE B: ${creatureB.codex.common_name}
    - Stats: HP ${creatureB.engine_data.stats.hp}, Speed ${creatureB.engine_data.stats.speed}, Intel ${creatureB.engine_data.stats.intelligence}, Stealth ${creatureB.engine_data.stats.stealth}
    - Traits: ${creatureB.engine_data.traits.map(t => t.name).join(', ')}
    - Weaknesses: ${creatureB.engine_data.weaknesses.join(', ')}

    Analyze their biological advantages and disadvantages. Determine a winner based on logic (e.g., fire beats ice, speed beats brute force).
    
    OUTPUT FORMAT:
    You must return a JSON object with the following fields:
    - summary: A single, punchy sentence summarizing the outcome.
    - log: A detailed, dramatic battle report (3-4 paragraphs). Use Markdown formatting (bold, lists) but NO headers.
    - winner: The name of the winning creature.

    Language: ${language === 'ko' ? 'Korean' : 'English'}
    `;

    // 2. Prepare Image Prompt (Combined Visuals)
    const imagePrompt = `
      Cinematic action shot of a fight between two sci-fi creatures.
      Creature 1: ${creatureA.engine_data.visual_generation_prompt}.
      Creature 2: ${creatureB.engine_data.visual_generation_prompt}.
      Action: Dynamic combat pose, impact effects, dust particles, motion blur.
      Style: Unreal Engine 5 render, hyper-realistic, volumetric lighting, 8k resolution, cinematic composition.
    `;

    // 3. Schema for Text
    const battleSchema = {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        log: { type: Type.STRING },
        winner: { type: Type.STRING },
      },
      required: ["summary", "log", "winner"],
    };

    // 4. Execute both requests in parallel
    const [textResponse, imageResponse] = await Promise.all([
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: textPrompt,
        config: { 
          temperature: 0.8,
          responseMimeType: "application/json",
          responseSchema: battleSchema
        }
      }),
      ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: imagePrompt }] },
      })
    ]);

    // 5. Extract Text
    let battleData = { summary: "Analysis Failed", log: "Could not generate log.", winner: "Unknown" };
    try {
      if (textResponse.text) {
        battleData = JSON.parse(textResponse.text);
      }
    } catch (e) {
      console.error("Failed to parse battle JSON", e);
    }

    // 6. Extract Image
    let imageUrl = null;
    if (imageResponse.candidates && imageResponse.candidates[0].content.parts) {
      for (const part of imageResponse.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mimeType};base64,${base64EncodeString}`;
        }
      }
    }

    return { ...battleData, imageUrl };

  } catch (error) {
    console.error("Error simulating battle:", error);
    return { summary: "Error", log: "Could not run simulation.", winner: "None", imageUrl: null };
  }
};