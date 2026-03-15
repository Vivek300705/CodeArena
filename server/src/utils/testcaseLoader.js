import fs from "fs";
import path from "path";

export const loadTestCases = (problemId) => {
  const dirPath = path.join("testcases", problemId);

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
