import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please configure it in the Settings > Secrets panel of AI Studio.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Active English practice partner chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { scenarioId, messages, systemPrompt } = req.body;

      if (!scenarioId || !messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "Missing required fields: scenarioId and messages." });
        return;
      }

      const ai = getAI();

      // Format conversation history for Gemini
      // Limit to last 15 messages to prevent context blowup and keep it snappy
      const recentMessages = messages.slice(-15);
      const userLastMessage = recentMessages[recentMessages.length - 1]?.text || "";

      // Format history as text for Gemini to process
      let historyText = "";
      recentMessages.forEach((msg) => {
        const sender = msg.role === 'user' ? 'User (Student)' : 'AI Partner';
        historyText += `${sender}: ${msg.text}\n`;
      });

      const instruction = `
You are an expert AI English practice partner for young children under the age of nine (6 to 9 years old). 
Your character description and scenario rules:
"${systemPrompt}"

The conversation history so far:
${historyText}

Based on this history, perform the following tasks:
1. Generate the next highly natural, super engaging English response as your cartoon/friendly persona. 
   CRITICAL: Keep your language extremely simple (CEFR Pre-A1/A1 level), using simple words and 1-2 very short sentences so a young child can easily read and understand. Always end with a very easy question to help the child reply.
2. Provide a natural, sweet, and fun Chinese translation for your new English response.
3. Critically analyze the child student's LAST message: "${userLastMessage}". Check for spelling, grammar, punctuation, and natural phrasing.
   - If there are errors, set "hasErrors" to true and provide the "corrected" simple English phrasing along with a supportive, cheerful, and super simple Chinese "explanation" suited for young kids (e.g., "哇，你太棒了！如果这样说会更好听哦：..."). Keep explanations very encouraging and easy to understand.
   - If the child's message is grammatically perfect and natural, set "hasErrors" to false, and leave "corrected" and "explanation" empty.
4. Offer 2-3 short, extremely simple English suggestions ("hints") (3-6 words each) on what the child can say next to keep the conversation going.

Respond strictly in JSON format matching the schema provided.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: instruction,
        config: {
          systemInstruction: "You are an expert, loving, and encouraging English teacher and cartoon-style speaking partner for children under 9 years old. Speak in extremely simple English and explain corrections in delightful, easy Chinese for kids.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              aiResponse: {
                type: Type.STRING,
                description: "The next reply in the conversation from the AI companion. Must be extremely simple, warm, 1-2 short sentences maximum.",
              },
              translation: {
                type: Type.STRING,
                description: "The child-friendly Chinese translation of the aiResponse.",
              },
              grammarCheck: {
                type: Type.OBJECT,
                properties: {
                  hasErrors: {
                    type: Type.BOOLEAN,
                    description: "Whether the child's last message has any issues."
                  },
                  corrected: {
                    type: Type.STRING,
                    description: "A super simple and natural version of the child's sentence. Leave empty if hasErrors is false."
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "Loving, highly encouraging, and simple Chinese explanation for a child. Leave empty if hasErrors is false."
                  }
                },
                required: ["hasErrors"]
              },
              hints: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING
                },
                description: "2-3 extremely short, basic English suggestions (3-6 words) that the child can use to reply."
              }
            },
            required: ["aiResponse", "translation", "grammarCheck", "hints"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No text content returned from Gemini model.");
      }

      res.json(JSON.parse(responseText.trim()));
    } catch (error: any) {
      console.error("Error in /api/chat:", error);
      res.status(500).json({ error: error?.message || "An error occurred while generating chat response." });
    }
  });

  // API Route: Writing analysis & grammar corrector
  app.post("/api/check-writing", async (req, res) => {
    try {
      const { text } = req.body;

      if (!text || typeof text !== "string") {
        res.status(400).json({ error: "Missing or invalid 'text' parameter in request body." });
        return;
      }

      const ai = getAI();

      const prompt = `
Please analyze the following English text written by a child ESL student (under the age of nine). 
Identify spelling mistakes, simple grammar errors, and offer a completely polished, native-level rewrite suitable for kids.

Student child's text:
"""
${text}
"""

Please provide:
1. A fully corrected and highly natural version of the text (kid-friendly).
2. A language score from 0 to 100 based on grammar accuracy and spelling. Be extremely generous, kind, and encouraging to the child!
3. High-level general feedback in Chinese explaining their strengths and major accomplishments, using a loving, supportive, and playful tone with sweet emojis.
4. A list of specific detailed corrections, each with the error fragment, the corrected form, and a super simple, easy-to-understand explanation in Chinese suited for a 7-year-old.
5. Two alternative versions of the text:
   - "professional": An advanced, beautiful, and shiny version of the text (using slightly more expressive but still basic kid-friendly vocabulary).
   - "casual": An extremely simple, short, and very easy friendly version suited for a 6 or 7-year-old child.

Respond strictly in JSON format matching the schema provided.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a loving, supportive, and playful English writing tutor for children under 9 years old. Analyze texts carefully, give highly encouraging and delightfully positive feedback, and suggest detailed corrections in extremely simple Chinese with sweet emojis.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              corrected: {
                type: Type.STRING,
                description: "The complete polished, grammatically perfect, and natural native-level version of the input text.",
              },
              score: {
                type: Type.INTEGER,
                description: "An overall language performance score from 0 to 100.",
              },
              overallFeedback: {
                type: Type.STRING,
                description: "General diagnostic feedback in Chinese highlighting key strengths, major mistake patterns, and improvement directions.",
              },
              detailedCorrections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    error: {
                      type: Type.STRING,
                      description: "The erroneous or awkward phrase/word exactly as written by the student."
                    },
                    fix: {
                      type: Type.STRING,
                      description: "The corrected or improved phrase/word."
                    },
                    explanation: {
                      type: Type.STRING,
                      description: "A clear, helpful explanation in Chinese why this was incorrect or how this correction enhances the passage."
                    }
                  },
                  required: ["error", "fix", "explanation"]
                }
              },
              alternativeVersions: {
                type: Type.OBJECT,
                properties: {
                  professional: {
                    type: Type.STRING,
                    description: "An elegant, formal, or business-grade rewrite of the student's text."
                  },
                  casual: {
                    type: Type.STRING,
                    description: "A warm, colloquial, friendly rewrite of the student's text."
                  }
                },
                required: ["professional", "casual"]
              }
            },
            required: ["corrected", "score", "overallFeedback", "detailedCorrections", "alternativeVersions"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response returned from the model.");
      }

      res.json(JSON.parse(responseText.trim()));
    } catch (error: any) {
      console.error("Error in /api/check-writing:", error);
      res.status(500).json({ error: error?.message || "An error occurred while evaluating your writing." });
    }
  });

  // API Route: Dynamic Topic Vocabulary Generator
  app.post("/api/generate-vocab", async (req, res) => {
    try {
      const { topic } = req.body;

      if (!topic || typeof topic !== "string") {
        res.status(400).json({ error: "Missing or invalid 'topic' parameter in request body." });
        return;
      }

      const ai = getAI();

      const prompt = `
Generate 5 simple, essential, and fun English vocabulary words suitable for a child ESL student (6 to 9 years old) related to the topic: "${topic}".
Important: The words should be highly visual, simple, and delightful (e.g. basic nouns, verbs, colors, animals, toys, simple feelings). Avoid complex academic words or advanced business idioms.

For each of the 5 items, provide:
1. The word.
2. The International Phonetic Alphabet (IPA) pronunciation.
3. Part of speech (e.g., n., v., adj., helper).
4. Sweet, easy Chinese translation meaning.
5. Extremely simple, clear English definition (written for a 7-year-old).
6. A childlike, delightful example sentence in English.
7. Easy Chinese translation of the example sentence.

Respond strictly in JSON format matching the schema.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an expert children's English lexicographer and tutor. Create delightful, basic, and practical vocabulary items for young kids under 9 with simple IPA phonetics, very easy child-friendly definitions, and lovely example sentences.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING, description: "The English word or idiom." },
                phonetic: { type: Type.STRING, description: "Phonetic IPA spelling, e.g., /ɪˈneɪt/." },
                pos: { type: Type.STRING, description: "Part of speech, e.g., 'adj.', 'v. phrase', 'idiom'." },
                meaning: { type: Type.STRING, description: "Concise Chinese meaning." },
                definition: { type: Type.STRING, description: "A simple English definition written for ESL learners." },
                exampleEn: { type: Type.STRING, description: "A natural English example sentence." },
                exampleZh: { type: Type.STRING, description: "The Chinese translation of the example sentence." }
              },
              required: ["word", "phonetic", "pos", "meaning", "definition", "exampleEn", "exampleZh"]
            }
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response returned from the model.");
      }

      res.json(JSON.parse(responseText.trim()));
    } catch (error: any) {
      console.error("Error in /api/generate-vocab:", error);
      res.status(500).json({ error: error?.message || "An error occurred while generating vocabulary." });
    }
  });

  // Vite middleware / Production serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
