import { GoogleGenAI } from "@google/genai";

// Initialization - The API key is injected by the platform
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface PatentResult {
  title: string;
  patentNumber?: string;
  summary: string;
  link?: string;
  relevance: string;
  filingDate?: string;
}

export async function searchPatents(description: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        role: 'user',
        parts: [{
          text: `I have a technical solution/innovation described as follows: "${description}". 
          
          Please search for relevant patents, prior art, or similar technical disclosures. 
          Use Google Search to find real, existing patents from sources like Google Patents, USPTO, WIPO, or Espacenet.
          
          Provide a detailed analysis including:
          1. A list of 5-7 most relevant patents (with titles, links if possible, and summaries).
          2. A brief analysis of how the search results compare to my technical solution.
          3. Identification of potential "white space" or areas where my solution might be novel.
          
          Format the output using clear Markdown headings and bullet points.`
        }]
      }],
      config: {
        systemInstruction: "You are an expert Patent Analyst and IP Strategist. Your goal is to help inventors find prior art and assess the novelty of their technical solutions. You provide professional, precise, and highly relevant information. Always look for real patent records using Google Search grounding.",
        temperature: 0.2, // Lower temperature for more factual analysis
        tools: [
          { googleSearch: {} }
        ]
      },
    });

    return response.text || "No results found.";
  } catch (error) {
    console.error("Error searching patents:", error);
    throw new Error("Failed to perform patent search. Please try again later.");
  }
}
