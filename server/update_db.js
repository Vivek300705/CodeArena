import mongoose from "mongoose";
import dotenv from "dotenv";
import Problem from "./src/models/Problem.model.js";

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, { dbName: "codearena" }).then(async () => {
  console.log('Connected to DB');
  const problems = await Problem.find({});
  console.log('Total problems: ' + problems.length);
  for (let p of problems) {
    console.log(p.title + ' -> ' + p.tags.join(', ') + ' -> Exs: ' + (p.examples ? p.examples.length : 0));
    if (p.title === 'Two Sum') {
      p.tags = ['Array', 'Hash Table'];
      p.examples = [
        {
          input: 'nums = [2,7,11,15], target = 9',
          output: '[0,1]',
          explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
        },
        {
          input: 'nums = [3,2,4], target = 6',
          output: '[1,2]',
          explanation: ''
        }
      ];
      p.testcases = [
        {
          input: '2\n4\n2 7 11 15\n9\n3\n3 2 4\n6\n',
          output: '0 1\n1 2\n',
          isHidden: false
        }
      ];
      
      p.boilerplates = [
        { language: 'node', code: 'const fs = require("fs");\n\nfunction twoSum(nums, target) {\n    // Write your code here\n    \n}\n\n// Read input and call twoSum\nconst input = fs.readFileSync("/dev/stdin", "utf-8").trim().split("\\n");\n// Custom runner logic here if needed...\nconsole.log(twoSum([2, 7, 11, 15], 9));\n' },
        { language: 'python', code: 'def twoSum(nums, target):\n    # Write your solution here\n    pass\n\nif __name__ == "__main__":\n    # Reading input from input.txt\n    pass\n' },
        { language: 'cpp', code: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Write your code here\n    return {};\n}\n\nint main() {\n    return 0;\n}\n' },
        { language: 'c', code: '#include <stdio.h>\n#include <stdlib.h>\n\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    // Write your code here\n    *returnSize = 2;\n    return NULL;\n}\n\nint main() {\n    return 0;\n}\n' },
        { language: 'java', code: 'import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n    }\n}\n' },
        { language: 'go', code: 'package main\nimport "fmt"\n\nfunc twoSum(nums []int, target int) []int {\n    // Write your code here\n    return []int{}\n}\n\nfunc main() {\n}\n' },
        { language: 'rust', code: 'impl Solution {\n    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {\n        // Write your code here\n        vec![]\n    }\n}\n\nstruct Solution;\nfn main() {\n}\n' }
      ];

      await Problem.updateOne({ _id: p._id }, { $set: { tags: p.tags, examples: p.examples, testcases: p.testcases, boilerplates: p.boilerplates } });
      console.log('Saved Two Sum explicitly');
    }
  }
  process.exit(0);
}).catch(console.error);
