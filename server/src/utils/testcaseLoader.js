import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve from server root (two levels up from src/utils)
const TESTCASES_ROOT = path.join(__dirname, "..", "..", "testcases");

export const loadTestCases = (problemId) => {
  const dirPath = path.join(TESTCASES_ROOT, String(problemId));

  if (!fs.existsSync(dirPath)) {
    throw new Error("Testcase directory not found");
  }

  const files = fs.readdirSync(dirPath);

  const inputs = files.filter((file) => file.startsWith("input"));

  const testcases = inputs.map((inputFile) => {
    const outputFile = inputFile.replace("input", "output");

    const input = fs.readFileSync(path.join(dirPath, inputFile), "utf8");

    const output = fs.readFileSync(path.join(dirPath, outputFile), "utf8");

    return { input, output };
  });

  return testcases;
};
