
import { GoogleGenAI } from "@google/genai";
import { configDotenv } from "dotenv";
import { z } from "zod";
configDotenv()




const UserProfileSchema = z.object({
  name: z.string(),
  age: z.string(),
  skills: z.array(z.string()),
});


console.log(process.env.GEMINI_API_KEY ? "API key loaded" : "API key missing");
type UserProfile = z.infer<typeof UserProfileSchema>;

// 2. Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing");
}

export const ai = new GoogleGenAI({ apiKey });


const jsonSchema = z.toJSONSchema(UserProfileSchema);


export async function getLLMresponse(prompt: string): Promise<UserProfile> {
  const interaction = await ai.interactions.create({
    model: "gemini-3.1-flash-lite",
    input: prompt,

    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: jsonSchema,
    },
  });


  const rawResponse = interaction.output_text;

  if (!rawResponse) {
    throw new Error("Gemini returned an empty response");
  }

  const parsedResponse = UserProfileSchema.parse(
    JSON.parse(rawResponse)
  );

  return parsedResponse;
}
