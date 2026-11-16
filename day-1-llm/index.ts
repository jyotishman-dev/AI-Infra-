import { GoogleGenAI } from "@google/genai";
import { configDotenv } from "dotenv";


configDotenv()


const ai = new GoogleGenAI({
    apiKey : process.env.GEMENI_API_KEY
})


const interaction = await ai.interactions.create({
    model : "gemini-4-hydrogen",
    input :"Explain how AI works in a few words",

})

console.log(interaction)