# Prompting + Structured Output

## 1. Prompting

Prompting is the process of giving instructions to an LLM (Large Language Model) so that it can generate the desired response.

A well-written prompt helps the model understand:
- What task it needs to perform.
- What role it should follow.
- What format the response should have.
- What constraints or rules it must follow.

## 2. Message Roles

LLMs commonly work with different message roles:

| Role | Purpose |
|---|---|
| `system` | Defines the model's overall behavior, instructions, and boundaries. |
| `user` | Contains the actual task, question, or input from the user. |
| `assistant` | Contains the model's response. It can also contain examples in few-shot prompting. |

### Example

```text
System:
You are a helpful AI assistant.
Always respond professionally.

User:
Explain what TypeScript is.

Assistant:
TypeScript is a strongly typed programming language
built on top of JavaScript.
```

## 3. Few-Shot Prompting

Few-shot prompting is a technique where we provide an LLM with a small number of examples before asking it to perform a task.

These examples help the model understand the expected response pattern, structure, and style.

### Example

```text
System:
You are a sentiment classification assistant.

User:
Classify the sentiment of the following text.

Example 1:
Input: "I love this product!"
Output: Positive

Example 2:
Input: "This service is terrible."
Output: Negative

Now classify:
Input: "The experience was amazing!"
```

Expected output:

```text
Positive
```

**Why use few-shot prompting?**
- Helps maintain consistent responses.
- Demonstrates the expected output format.
- Helps with tasks that are difficult to explain using instructions alone.
- Reduces ambiguity in certain tasks.

## 4. Structured Output

By default, an LLM may return responses in natural language.

However, when building real-world applications, we often need responses in a predictable format, such as JSON.

Structured output allows us to define the expected structure of the model's response.

### Example: Without Structured Output

```text
The user's name is Rahul.
He is 23 years old and knows TypeScript,
Python, and Machine Learning.
```

This response is readable but difficult to consume reliably in application code.

### Example: With Structured Output

```json
{
  "name": "Rahul",
  "age": "23",
  "skills": [
    "TypeScript",
    "Python",
    "Machine Learning"
  ]
}
```

Now our application can work with predictable fields.

## 5. Why Do We Need Zod?

Even if an LLM returns JSON, that does not automatically guarantee that the data matches our application's expected structure.

For example, the model might return:

```json
{
  "name": "Rahul",
  "age": 23,
  "skills": "TypeScript"
}
```

But our application expects:
- `name` → string
- `age` → string
- `skills` → array of strings

This mismatch can cause runtime errors.

**Zod** is a TypeScript-first validation library that helps us define schemas and validate data at runtime.

### Example Using Zod

```ts
import { z } from "zod";

const UserProfileSchema = z.object({
  name: z.string(),
  age: z.string(),
  skills: z.array(z.string()),
});

// Generate TypeScript type from schema
type UserProfile = z.infer<typeof UserProfileSchema>;

// Validate incoming data
const user = UserProfileSchema.parse({
  name: "Rahul",
  age: "23",
  skills: ["TypeScript", "Python"],
});

console.log(user);
```

If the returned data does not match the schema, `.parse()` throws a validation error.

Alternatively, `.safeParse()` returns a result object instead of throwing an error.

## 6. Combining Gemini + Zod

We can combine Google's Gemini API with Zod to generate structured and validated responses.

```ts
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

// Define schema
const UserProfileSchema = z.object({
  name: z.string(),
  age: z.string(),
  skills: z.array(z.string()),
});

type UserProfile = z.infer<typeof UserProfileSchema>;

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// Convert Zod schema to JSON Schema
const jsonSchema = z.toJSONSchema(UserProfileSchema);

async function getLLMresponse(
  prompt: string
): Promise<UserProfile> {

  const interaction = await ai.interactions.create({
    model: "YOUR_SUPPORTED_GEMINI_MODEL",
    input: prompt,

    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: jsonSchema,
    },
  });

  const rawResponse = interaction.output_text;

  if (!rawResponse) {
    throw new Error("Empty response from Gemini");
  }

  // Parse and validate response
  const parsedData = UserProfileSchema.parse(
    JSON.parse(rawResponse)
  );

  return parsedData;
}

// Execute
const result = await getLLMresponse(
  "Generate a fictional Indian user profile with name, age and AI skills."
);

console.log(result);
```

## 7. Complete Workflow

```text
User Prompt
    |
    v
System Instructions
    |
    v
LLM (Gemini)
    |
    v
Structured JSON Response
    |
    v
JSON Parsing
    |
    v
Zod Schema Validation
    |
    v
Type-Safe Application Data
```

## 8. Key Takeaways

| Concept | What it does |
|---|---|
| Prompting | Gives instructions to an LLM. |
| System Role | Defines model behavior. |
| User Role | Provides the actual task. |
| Assistant Role | Represents model responses and can