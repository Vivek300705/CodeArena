import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import ProblemBuilder from "./src/utils/ProblemBuilder.js";
import Problem from "./src/models/Problem.model.js";
import connectDB from "./src/config/db_config.js";

// Check for API Key
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ Fatal: GEMINI_API_KEY environment variable is missing.");
  console.error("Please add GEMINI_API_KEY=your_key_here to your .env file.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("❌ Usage: node ai_generator.js \"Problem Text or description\"");
    process.exit(1);
  }
  
  const problemDescription = args.join(" ");
  console.log("🤖 Asking AI to analyze the problem and generate the scripts...");

  const prompt = \`
You are an expert compiler and competitive programming engineer.
Analyze the following problem description. You must extract its core essence and output a STRICT JSON object containing exactly the required fields to generate it in an ongoing platform.

CRITICAL: Return ONLY raw JSON. No markdown backticks, no markdown blocks. Just the { } object.

The output JSON must match this structure exactly:
{
  "title": "String (e.g., 'Container With Most Water')",
  "description": "String (the full markdown problem description, including constraints and problem statement)",
  "difficulty": "String (either 'easy', 'medium', or 'hard')",
  "tags": ["String", "String"],
  "examples": [
    {
      "input": "String (e.g., 'nums = [2,7,11,15], target = 9')",
      "output": "String",
      "explanation": "String"
    }
  ],
  "signature": {
    "functionName": "String",
    "returnType": "String (e.g., 'int', 'vector<int>', 'string', 'bool', 'vector<vector<int>>')",
    "parameters": [
      { "name": "String", "type": "String (same types as returnType)" }
    ]
  },
  "inputGeneratorCode": "String (A javascript function body that returns an array of randomly generated arguments matching the signature's parameters. Constraints must match the problem constraints. E.g., 'const n = Math.floor(Math.random() * 100) + 1; const arr = Array.from({length:n}, ()=>Math.floor(Math.random()*100)); return [arr];' Return ONLY the statements, no function declaration.)",
  "referenceSolutionCode": "String (A highly optimized javascript function string that represents the reference solution solving the problem. E.g., 'let map = new Map(); for(let i=0; i<nums.length; i++) { ... } return [];' Return ONLY the statements, no function declaration.)"
}

Problem Description to Analyze:
\${problemDescription}
  \`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
          temperature: 0.1
      }
    });

    let rawOutput = response.text;
    if (rawOutput.startsWith('\`\`\`json')) {
        rawOutput = rawOutput.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    }

    const aiData = JSON.parse(rawOutput);
    console.log(`✅ AI parsed successfully: "${aiData.title}"`);

    // Compile the JS code strings into actual functions
    // The AI returns just the body, so we wrap it:
    
    // We need the parameter names for the reference solution
    const paramNames = aiData.signature.parameters.map(p => p.name);
    
    const inputGenFn = new Function(aiData.inputGeneratorCode);
    const refSolutionFn = new Function(...paramNames, aiData.referenceSolutionCode);

    console.log("⚙️  Running ProblemBuilder engine...");
    const builder = new ProblemBuilder(aiData.signature);
    
    // Generate 100 testcases, driver code, and boilerplates
    const testcases = builder.generateTestCases(100, inputGenFn, refSolutionFn);
    const boilerplates = builder.getBoilerplates();
    const driverCodes = builder.getDriverCodes();

    // Assemble DB Object
    await connectDB();
    const { default: slugify } = await import("slugify");

    const problemData = {
        title: aiData.title,
        slug: slugify(aiData.title, { lower: true, strict: true }),
        description: aiData.description,
        difficulty: aiData.difficulty,
        tags: aiData.tags,
        timeLimit: 2000,
        memoryLimit: 256,
        examples: aiData.examples,
        testcases: [
            // Combine fake visible examples with the AI generated hidden cases
            ...aiData.examples.map(ex => ({ input: ex.input, output: ex.output, isHidden: false })),
            ...testcases
        ],
        boilerplates: boilerplates,
        driverCode: driverCodes,
        isDeleted: false,
        createdBy: "69b85df1ec3ce2fa4d7f71c5" // standard admin
    };

    const exists = await Problem.findOne({ title: aiData.title, isDeleted: false });
    if (exists) {
        await Problem.updateOne(
            { _id: exists._id },
            { $set: problemData }
        );
        console.log(`✅ Fully Automated AI Problem "${aiData.title}" Updated in DB!`);
    } else {
        await Problem.collection.insertOne(problemData);
        console.log(`✅ Fully Automated AI Problem "${aiData.title}" Created in DB!`);
    }

    // exit
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Generator Error:", error);
    process.exit(1);
  }
}

run().catch(console.error);
