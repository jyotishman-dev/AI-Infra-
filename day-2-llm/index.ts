import { configDotenv } from "dotenv";
import { getLLMresponse } from "./ai/ai";


configDotenv()

const result = await getLLMresponse(
  "Generate fictional Indian user details with a name, age and an array of top AI skills."
);

console.log(result);


console.log("Gemini response:", result);