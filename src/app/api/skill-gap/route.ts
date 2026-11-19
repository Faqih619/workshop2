import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const MODELS_TO_TRY = [
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite-preview",
];

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is missing in .env.local" },
      { status: 500 }
    );
  }

  try {
    const { studentSkills, opportunity } = await req.json();
    const genAI = new GoogleGenerativeAI(apiKey);

    const prompt = `Compare student skills (1-5 scale) with opportunity requirements.
    Student: ${JSON.stringify(studentSkills)}
    Role: ${opportunity.title}
    Description: ${opportunity.description || ""}
    Qualifications: ${opportunity.qualifications || ""}
    Required Skills: ${JSON.stringify(opportunity.required_skills || [])}

    Return ONLY raw JSON (no markdown):
    {
      "currentMatch": number,
      "potentialMatch": number,
      "skillGapsCount": number,
      "skillsComparison": [{ "skill": "string", "userLevel": number, "requiredLevel": number }],
      "actionPlan": {
        "priorityLabel": "HIGH PRIORITY",
        "steps": [{ "title": "string", "description": "string" }],
        "estimatedHours": number
      },
      "recommendedResources": [
        { "title": "string", "meta": "string", "skill": "string", "time": "string", "priority": "High", "actionLabel": "Start learning", "url": "string" }
      ]
    }`;

    let rawText = "";
    let lastError: unknown = null;

    for (const modelName of MODELS_TO_TRY) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await Promise.race([
          model.generateContent(prompt),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Timed out after 12s")), 12000)
          ),
        ]);
        rawText = result.response.text();
        console.log("AI succeeded using:", modelName);
        break;
      } catch (err: any) {
        console.error(`Model ${modelName} failed:`, err?.message || err);
        lastError = err;
      }
    }

    if (!rawText) {
      throw lastError || new Error("All Gemini models failed.");
    }

    const cleanJson = rawText.replace(/```json|```/g, "").trim();
    const aiData = JSON.parse(cleanJson);
    return NextResponse.json(aiData);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "AI service is temporarily unavailable. Please try again." },
      { status: 503 }
    );
  }
}