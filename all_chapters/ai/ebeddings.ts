import { ai } from "./ai";

const sentences = [
  "TypeScript adds static typing to JavaScript.",
  "Zod validates data schemas at runtime.",
  "Node.js is a JavaScript runtime built on Chrome's V8 engine.",
  "PostgreSQL is a powerful open-source relational database.",
  "pgvector adds vector similarity search to Postgres.",
  "Cosine similarity measures the angle between two vectors.",
  "Docker containers package code and dependencies together.",
  "WebSockets allow full-duplex communication over a single TCP connection.",
  "Redis is an in-memory data structure store used for caching.",
  "Langfuse is an open-source LLM engineering platform for tracing."
];


async function getEmbedding(text: string): Promise<number[]> {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-2",
    contents: text,
  });

 const vector = response.embeddings?.[0]?.values;

  if (!vector) {
    throw new Error("Failed to generate embedding");
  }

  return vector;
}
  function cosineSimilarity(
  vecA: number[],
  vecB: number[]
): number {

  if (vecA.length !== vecB.length) {
    throw new Error("Vector dimensions do not match");
  }

  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magA += vecA[i] ** 2;
    magB += vecB[i] ** 2;
  }

  const denominator = Math.sqrt(magA) * Math.sqrt(magB);

  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
}

// 3. Store sentence embeddings
async function createKnowledgeBase() {
  console.log("Generating Gemini embeddings...\n");

  const embeddings = await Promise.all(
    sentences.map(async (text) => ({
      text,
      vector: await getEmbedding(text),
    }))
  );

  console.log("Knowledge base created!");
  console.log("Total documents:", embeddings.length);
  console.log("Vector dimensions:", embeddings[0]?.vector.length);

  return embeddings;
}

// 4. Semantic search
async function findClosestSentence(
  query: string,
  sentenceEmbeddings: {
    text: string;
    vector: number[];
  }[]
) {

  const queryVector = await getEmbedding(query);

  const results = sentenceEmbeddings.map((item) => ({
    text: item.text,
    score: cosineSimilarity(queryVector, item.vector),
  }));

  results.sort((a, b) => b.score - a.score);

  return results;
}

// 5. Main function
async function main() {

  const sentenceEmbeddings = await createKnowledgeBase();

  const questions = [
    "How to validate JSON data safely?",
    "What is used for fast in-memory caching?",
    "How to send real-time audio streams?"
  ];

  console.log("\n🚀 Gemini Vector Search (RAG Basics)\n");

  for (const question of questions) {

    const results = await findClosestSentence(
      question,
      sentenceEmbeddings
    );

    const bestMatch = results[0];

    console.log(`❓ Question: ${question}`);
    console.log(`✅ Closest Match: "${bestMatch.text}"`);
    console.log(`📊 Similarity Score: ${bestMatch.score.toFixed(4)}`);
    console.log("-----------------------------------");
  }
}

main().catch(console.error);