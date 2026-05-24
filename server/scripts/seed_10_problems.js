import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Setup env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env.docker") });

// We need to import the Problem model dynamically or define it here if we don't want to rely on the app structure
const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
  tags: { type: [String], default: [] },
  testcases: [{ input: String, output: String, isHidden: { type: Boolean, default: false } }],
  boilerplates: [{ language: String, code: String }],
  driverCode: [{ language: String, code: String }],
  examples: [{ input: String, output: String, explanation: String }],
  timeLimit: { type: Number, default: 1000 },
  memoryLimit: { type: Number, default: 256 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
  isDeleted: { type: Boolean, default: false },
  slug: { type: String, unique: true }
}, { timestamps: true });

// Pre-save slug hook
import slugify from "slugify";
problemSchema.pre("save", function () {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
});

const Problem = mongoose.models.Problem || mongoose.model("Problem", problemSchema);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/codearena";

const problemsData = [
  {
    title: "Two Sum",
    difficulty: "easy",
    tags: ["Array", "Hash Table"],
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: ""
      }
    ],
    testcases: [
      { input: "4\n2 7 11 15\n9\n", output: "0 1\n", isHidden: false },
      { input: "3\n3 2 4\n6\n", output: "1 2\n", isHidden: false },
      { input: "2\n3 3\n6\n", output: "0 1\n", isHidden: true }
    ],
    boilerplates: [
      {
        language: "cpp",
        code: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};"
      },
      {
        language: "python",
        code: "class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        pass"
      },
      {
        language: "node",
        code: "class Solution {\n    twoSum(nums, target) {\n        \n    }\n}"
      }
    ],
    driverCode: [
      {
        language: "cpp",
        code: `int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for(int i=0; i<n; i++) cin >> nums[i];
    int target; cin >> target;
    Solution sol;
    vector<int> res = sol.twoSum(nums, target);
    cout << res[0] << " " << res[1] << endl;
    return 0;
}`
      },
      {
        language: "python",
        code: `import sys
def main():
    input_data = sys.stdin.read().split()
    if not input_data: return
    n = int(input_data[0])
    nums = [int(x) for x in input_data[1:n+1]]
    target = int(input_data[n+1])
    sol = Solution()
    res = sol.twoSum(nums, target)
    print(f"{res[0]} {res[1]}")
if __name__ == '__main__':
    main()`
      },
      {
        language: "node",
        code: `const fs = require('fs');
function main() {
    const input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/);
    if (!input || input.length === 0 || input[0] === '') return;
    const n = parseInt(input[0]);
    const nums = [];
    for(let i=1; i<=n; i++) nums.push(parseInt(input[i]));
    const target = parseInt(input[n+1]);
    const sol = new Solution();
    const res = sol.twoSum(nums, target);
    console.log(res[0] + " " + res[1]);
}
main();`
      }
    ]
  },
  {
    title: "Reverse String",
    difficulty: "easy",
    tags: ["String", "Two Pointers"],
    description: "Write a function that reverses a string. The input string is given as an array of characters `s`.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.",
    examples: [
      {
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
        explanation: ""
      }
    ],
    testcases: [
      { input: "5\nh e l l o\n", output: "o l l e h\n", isHidden: false },
      { input: "6\nH a n n a h\n", output: "h a n n a H\n", isHidden: true }
    ],
    boilerplates: [
      {
        language: "cpp",
        code: "class Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        \n    }\n};"
      },
      {
        language: "python",
        code: "class Solution:\n    def reverseString(self, s: list[str]) -> None:\n        pass"
      },
      {
        language: "node",
        code: "class Solution {\n    reverseString(s) {\n        \n    }\n}"
      }
    ],
    driverCode: [
      {
        language: "cpp",
        code: `int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<char> s(n);
    for(int i=0; i<n; i++) cin >> s[i];
    Solution sol;
    sol.reverseString(s);
    for(int i=0; i<n; i++) {
        cout << s[i] << (i==n-1?"":" ");
    }
    cout << endl;
    return 0;
}`
      },
      {
        language: "python",
        code: `import sys
def main():
    input_data = sys.stdin.read().split()
    if not input_data: return
    n = int(input_data[0])
    s = [x for x in input_data[1:n+1]]
    sol = Solution()
    sol.reverseString(s)
    print(" ".join(s))
if __name__ == '__main__':
    main()`
      },
      {
        language: "node",
        code: `const fs = require('fs');
function main() {
    const input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/);
    if (!input || input.length === 0 || input[0] === '') return;
    const n = parseInt(input[0]);
    const s = [];
    for(let i=1; i<=n; i++) s.push(input[i]);
    const sol = new Solution();
    sol.reverseString(s);
    console.log(s.join(" "));
}
main();`
      }
    ]
  },
  {
    title: "Palindrome Number",
    difficulty: "easy",
    tags: ["Math"],
    description: "Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.",
    examples: [
      {
        input: "x = 121",
        output: "true",
        explanation: "121 reads as 121 from left to right and from right to left."
      },
      {
        input: "x = -121",
        output: "false",
        explanation: "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome."
      }
    ],
    testcases: [
      { input: "121\n", output: "true\n", isHidden: false },
      { input: "-121\n", output: "false\n", isHidden: false },
      { input: "10\n", output: "false\n", isHidden: true },
      { input: "12321\n", output: "true\n", isHidden: true }
    ],
    boilerplates: [
      {
        language: "cpp",
        code: "class Solution {\npublic:\n    bool isPalindrome(int x) {\n        \n    }\n};"
      },
      {
        language: "python",
        code: "class Solution:\n    def isPalindrome(self, x: int) -> bool:\n        pass"
      },
      {
        language: "node",
        code: "class Solution {\n    isPalindrome(x) {\n        \n    }\n}"
      }
    ],
    driverCode: [
      {
        language: "cpp",
        code: `int main() {
    int x;
    if (!(cin >> x)) return 0;
    Solution sol;
    bool res = sol.isPalindrome(x);
    cout << (res ? "true" : "false") << endl;
    return 0;
}`
      },
      {
        language: "python",
        code: `import sys
def main():
    input_data = sys.stdin.read().split()
    if not input_data: return
    x = int(input_data[0])
    sol = Solution()
    res = sol.isPalindrome(x)
    print("true" if res else "false")
if __name__ == '__main__':
    main()`
      },
      {
        language: "node",
        code: `const fs = require('fs');
function main() {
    const input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/);
    if (!input || input.length === 0 || input[0] === '') return;
    const x = parseInt(input[0]);
    const sol = new Solution();
    const res = sol.isPalindrome(x);
    console.log(res ? "true" : "false");
}
main();`
      }
    ]
  },
  {
    title: "Contains Duplicate",
    difficulty: "easy",
    tags: ["Array", "Hash Table"],
    description: "Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.",
    examples: [
      {
        input: "nums = [1,2,3,1]",
        output: "true",
        explanation: "1 appears twice."
      },
      {
        input: "nums = [1,2,3,4]",
        output: "false",
        explanation: "Every element is distinct."
      }
    ],
    testcases: [
      { input: "4\n1 2 3 1\n", output: "true\n", isHidden: false },
      { input: "4\n1 2 3 4\n", output: "false\n", isHidden: false },
      { input: "10\n1 1 1 3 3 4 3 2 4 2\n", output: "true\n", isHidden: true }
    ],
    boilerplates: [
      {
        language: "cpp",
        code: "class Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        \n    }\n};"
      },
      {
        language: "python",
        code: "class Solution:\n    def containsDuplicate(self, nums: list[int]) -> bool:\n        pass"
      },
      {
        language: "node",
        code: "class Solution {\n    containsDuplicate(nums) {\n        \n    }\n}"
      }
    ],
    driverCode: [
      {
        language: "cpp",
        code: `int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for(int i=0; i<n; i++) cin >> nums[i];
    Solution sol;
    bool res = sol.containsDuplicate(nums);
    cout << (res ? "true" : "false") << endl;
    return 0;
}`
      },
      {
        language: "python",
        code: `import sys
def main():
    input_data = sys.stdin.read().split()
    if not input_data: return
    n = int(input_data[0])
    nums = [int(x) for x in input_data[1:n+1]]
    sol = Solution()
    res = sol.containsDuplicate(nums)
    print("true" if res else "false")
if __name__ == '__main__':
    main()`
      },
      {
        language: "node",
        code: `const fs = require('fs');
function main() {
    const input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/);
    if (!input || input.length === 0 || input[0] === '') return;
    const n = parseInt(input[0]);
    const nums = [];
    for(let i=1; i<=n; i++) nums.push(parseInt(input[i]));
    const sol = new Solution();
    const res = sol.containsDuplicate(nums);
    console.log(res ? "true" : "false");
}
main();`
      }
    ]
  },
  {
    title: "Maximum Subarray",
    difficulty: "medium",
    tags: ["Array", "Dynamic Programming"],
    description: "Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "[4,-1,2,1] has the largest sum = 6."
      },
      {
        input: "nums = [1]",
        output: "1",
        explanation: "The subarray [1] has the largest sum 1."
      }
    ],
    testcases: [
      { input: "9\n-2 1 -3 4 -1 2 1 -5 4\n", output: "6\n", isHidden: false },
      { input: "1\n1\n", output: "1\n", isHidden: false },
      { input: "5\n5 4 -1 7 8\n", output: "23\n", isHidden: true }
    ],
    boilerplates: [
      {
        language: "cpp",
        code: "class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        \n    }\n};"
      },
      {
        language: "python",
        code: "class Solution:\n    def maxSubArray(self, nums: list[int]) -> int:\n        pass"
      },
      {
        language: "node",
        code: "class Solution {\n    maxSubArray(nums) {\n        \n    }\n}"
      }
    ],
    driverCode: [
      {
        language: "cpp",
        code: `int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for(int i=0; i<n; i++) cin >> nums[i];
    Solution sol;
    cout << sol.maxSubArray(nums) << endl;
    return 0;
}`
      },
      {
        language: "python",
        code: `import sys
def main():
    input_data = sys.stdin.read().split()
    if not input_data: return
    n = int(input_data[0])
    nums = [int(x) for x in input_data[1:n+1]]
    sol = Solution()
    print(sol.maxSubArray(nums))
if __name__ == '__main__':
    main()`
      },
      {
        language: "node",
        code: `const fs = require('fs');
function main() {
    const input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/);
    if (!input || input.length === 0 || input[0] === '') return;
    const n = parseInt(input[0]);
    const nums = [];
    for(let i=1; i<=n; i++) nums.push(parseInt(input[i]));
    const sol = new Solution();
    console.log(sol.maxSubArray(nums));
}
main();`
      }
    ]
  },
  {
    title: "Missing Number",
    difficulty: "easy",
    tags: ["Array", "Math", "Bit Manipulation"],
    description: "Given an array `nums` containing `n` distinct numbers in the range `[0, n]`, return the only number in the range that is missing from the array.",
    examples: [
      {
        input: "nums = [3,0,1]",
        output: "2",
        explanation: "n = 3 since there are 3 numbers, so all numbers are in the range [0,3]. 2 is the missing number."
      },
      {
        input: "nums = [0,1]",
        output: "2",
        explanation: "n = 2, so all numbers are in the range [0,2]. 2 is the missing number."
      }
    ],
    testcases: [
      { input: "3\n3 0 1\n", output: "2\n", isHidden: false },
      { input: "2\n0 1\n", output: "2\n", isHidden: false },
      { input: "9\n9 6 4 2 3 5 7 0 1\n", output: "8\n", isHidden: true }
    ],
    boilerplates: [
      {
        language: "cpp",
        code: "class Solution {\npublic:\n    int missingNumber(vector<int>& nums) {\n        \n    }\n};"
      },
      {
        language: "python",
        code: "class Solution:\n    def missingNumber(self, nums: list[int]) -> int:\n        pass"
      },
      {
        language: "node",
        code: "class Solution {\n    missingNumber(nums) {\n        \n    }\n}"
      }
    ],
    driverCode: [
      {
        language: "cpp",
        code: `int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for(int i=0; i<n; i++) cin >> nums[i];
    Solution sol;
    cout << sol.missingNumber(nums) << endl;
    return 0;
}`
      },
      {
        language: "python",
        code: `import sys
def main():
    input_data = sys.stdin.read().split()
    if not input_data: return
    n = int(input_data[0])
    if n == 0:
        nums = []
    else:
        nums = [int(x) for x in input_data[1:n+1]]
    sol = Solution()
    print(sol.missingNumber(nums))
if __name__ == '__main__':
    main()`
      },
      {
        language: "node",
        code: `const fs = require('fs');
function main() {
    const input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/);
    if (!input || input.length === 0 || input[0] === '') return;
    const n = parseInt(input[0]);
    const nums = [];
    for(let i=1; i<=n; i++) nums.push(parseInt(input[i]));
    const sol = new Solution();
    console.log(sol.missingNumber(nums));
}
main();`
      }
    ]
  },
  {
    title: "Best Time to Buy and Sell Stock",
    difficulty: "easy",
    tags: ["Array", "Dynamic Programming"],
    description: "You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`th day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return `0`.",
    examples: [
      {
        input: "prices = [7,1,5,3,6,4]",
        output: "5",
        explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5."
      },
      {
        input: "prices = [7,6,4,3,1]",
        output: "0",
        explanation: "In this case, no transactions are done and the max profit = 0."
      }
    ],
    testcases: [
      { input: "6\n7 1 5 3 6 4\n", output: "5\n", isHidden: false },
      { input: "5\n7 6 4 3 1\n", output: "0\n", isHidden: false },
      { input: "2\n2 4\n", output: "2\n", isHidden: true }
    ],
    boilerplates: [
      {
        language: "cpp",
        code: "class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        \n    }\n};"
      },
      {
        language: "python",
        code: "class Solution:\n    def maxProfit(self, prices: list[int]) -> int:\n        pass"
      },
      {
        language: "node",
        code: "class Solution {\n    maxProfit(prices) {\n        \n    }\n}"
      }
    ],
    driverCode: [
      {
        language: "cpp",
        code: `int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> prices(n);
    for(int i=0; i<n; i++) cin >> prices[i];
    Solution sol;
    cout << sol.maxProfit(prices) << endl;
    return 0;
}`
      },
      {
        language: "python",
        code: `import sys
def main():
    input_data = sys.stdin.read().split()
    if not input_data: return
    n = int(input_data[0])
    prices = [int(x) for x in input_data[1:n+1]]
    sol = Solution()
    print(sol.maxProfit(prices))
if __name__ == '__main__':
    main()`
      },
      {
        language: "node",
        code: `const fs = require('fs');
function main() {
    const input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/);
    if (!input || input.length === 0 || input[0] === '') return;
    const n = parseInt(input[0]);
    const prices = [];
    for(let i=1; i<=n; i++) prices.push(parseInt(input[i]));
    const sol = new Solution();
    console.log(sol.maxProfit(prices));
}
main();`
      }
    ]
  },
  {
    title: "Climbing Stairs",
    difficulty: "easy",
    tags: ["Math", "Dynamic Programming"],
    description: "You are climbing a staircase. It takes `n` steps to reach the top.\n\nEach time you can either climb `1` or `2` steps. In how many distinct ways can you climb to the top?",
    examples: [
      {
        input: "n = 2",
        output: "2",
        explanation: "1. 1 step + 1 step\n2. 2 steps"
      },
      {
        input: "n = 3",
        output: "3",
        explanation: "1. 1 step + 1 step + 1 step\n2. 1 step + 2 steps\n3. 2 steps + 1 step"
      }
    ],
    testcases: [
      { input: "2\n", output: "2\n", isHidden: false },
      { input: "3\n", output: "3\n", isHidden: false },
      { input: "4\n", output: "5\n", isHidden: true },
      { input: "45\n", output: "1836311903\n", isHidden: true }
    ],
    boilerplates: [
      {
        language: "cpp",
        code: "class Solution {\npublic:\n    int climbStairs(int n) {\n        \n    }\n};"
      },
      {
        language: "python",
        code: "class Solution:\n    def climbStairs(self, n: int) -> int:\n        pass"
      },
      {
        language: "node",
        code: "class Solution {\n    climbStairs(n) {\n        \n    }\n}"
      }
    ],
    driverCode: [
      {
        language: "cpp",
        code: `int main() {
    int n;
    if (!(cin >> n)) return 0;
    Solution sol;
    cout << sol.climbStairs(n) << endl;
    return 0;
}`
      },
      {
        language: "python",
        code: `import sys
def main():
    input_data = sys.stdin.read().split()
    if not input_data: return
    n = int(input_data[0])
    sol = Solution()
    print(sol.climbStairs(n))
if __name__ == '__main__':
    main()`
      },
      {
        language: "node",
        code: `const fs = require('fs');
function main() {
    const input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/);
    if (!input || input.length === 0 || input[0] === '') return;
    const n = parseInt(input[0]);
    const sol = new Solution();
    console.log(sol.climbStairs(n));
}
main();`
      }
    ]
  },
  {
    title: "Valid Anagram",
    difficulty: "easy",
    tags: ["Hash Table", "String", "Sorting"],
    description: "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.\n\nAn **Anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
    examples: [
      {
        input: 's = "anagram", t = "nagaram"',
        output: "true",
        explanation: ""
      },
      {
        input: 's = "rat", t = "car"',
        output: "false",
        explanation: ""
      }
    ],
    testcases: [
      { input: "anagram\nnagaram\n", output: "true\n", isHidden: false },
      { input: "rat\ncar\n", output: "false\n", isHidden: false },
      { input: "a\nab\n", output: "false\n", isHidden: true }
    ],
    boilerplates: [
      {
        language: "cpp",
        code: "class Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        \n    }\n};"
      },
      {
        language: "python",
        code: "class Solution:\n    def isAnagram(self, s: str, t: str) -> bool:\n        pass"
      },
      {
        language: "node",
        code: "class Solution {\n    isAnagram(s, t) {\n        \n    }\n}"
      }
    ],
    driverCode: [
      {
        language: "cpp",
        code: `int main() {
    string s, t;
    if (!(cin >> s >> t)) return 0;
    Solution sol;
    bool res = sol.isAnagram(s, t);
    cout << (res ? "true" : "false") << endl;
    return 0;
}`
      },
      {
        language: "python",
        code: `import sys
def main():
    input_data = sys.stdin.read().split()
    if len(input_data) < 2: return
    s = input_data[0]
    t = input_data[1]
    sol = Solution()
    res = sol.isAnagram(s, t)
    print("true" if res else "false")
if __name__ == '__main__':
    main()`
      },
      {
        language: "node",
        code: `const fs = require('fs');
function main() {
    const input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 2) return;
    const s = input[0];
    const t = input[1];
    const sol = new Solution();
    const res = sol.isAnagram(s, t);
    console.log(res ? "true" : "false");
}
main();`
      }
    ]
  },
  {
    title: "Majority Element",
    difficulty: "easy",
    tags: ["Array", "Hash Table", "Divide and Conquer", "Sorting", "Counting"],
    description: "Given an array `nums` of size `n`, return the majority element.\n\nThe majority element is the element that appears more than `⌊n / 2⌋` times. You may assume that the majority element always exists in the array.",
    examples: [
      {
        input: "nums = [3,2,3]",
        output: "3",
        explanation: ""
      },
      {
        input: "nums = [2,2,1,1,1,2,2]",
        output: "2",
        explanation: ""
      }
    ],
    testcases: [
      { input: "3\n3 2 3\n", output: "3\n", isHidden: false },
      { input: "7\n2 2 1 1 1 2 2\n", output: "2\n", isHidden: false },
      { input: "1\n5\n", output: "5\n", isHidden: true }
    ],
    boilerplates: [
      {
        language: "cpp",
        code: "class Solution {\npublic:\n    int majorityElement(vector<int>& nums) {\n        \n    }\n};"
      },
      {
        language: "python",
        code: "class Solution:\n    def majorityElement(self, nums: list[int]) -> int:\n        pass"
      },
      {
        language: "node",
        code: "class Solution {\n    majorityElement(nums) {\n        \n    }\n}"
      }
    ],
    driverCode: [
      {
        language: "cpp",
        code: `int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for(int i=0; i<n; i++) cin >> nums[i];
    Solution sol;
    cout << sol.majorityElement(nums) << endl;
    return 0;
}`
      },
      {
        language: "python",
        code: `import sys
def main():
    input_data = sys.stdin.read().split()
    if not input_data: return
    n = int(input_data[0])
    nums = [int(x) for x in input_data[1:n+1]]
    sol = Solution()
    print(sol.majorityElement(nums))
if __name__ == '__main__':
    main()`
      },
      {
        language: "node",
        code: `const fs = require('fs');
function main() {
    const input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/);
    if (!input || input.length === 0 || input[0] === '') return;
    const n = parseInt(input[0]);
    const nums = [];
    for(let i=1; i<=n; i++) nums.push(parseInt(input[i]));
    const sol = new Solution();
    console.log(sol.majorityElement(nums));
}
main();`
      }
    ]
  }
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI, { dbName: "codearena" });
    console.log("Connected.");

    // Find any user to act as creator
    const db = mongoose.connection.db;
    const users = await db.collection("users").find({}).limit(1).toArray();
    let creatorId;
    if (users.length === 0) {
      console.log("No users found. Creating a dummy user...");
      const res = await db.collection("users").insertOne({
        username: "admin",
        email: "admin@codearena.com",
        password: "hashedpassword",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        rating: 1500
      });
      creatorId = res.insertedId;
    } else {
      creatorId = users[0]._id;
    }

    console.log("Using creator ID: " + creatorId);

    let addedCount = 0;
    for (const p of problemsData) {
      p.createdBy = creatorId;
      
      const existing = await Problem.findOne({ title: p.title, isDeleted: false });
      if (existing) {
        console.log("Skipping " + p.title + " (already exists).");
      } else {
        await Problem.create(p);
        console.log("Added " + p.title);
        addedCount++;
      }
    }

    console.log("Seed complete. Added " + addedCount + " problems.");
    process.exit(0);

  } catch (err) {
    console.error("Error seeding:", err);
    process.exit(1);
  }
}

seed();
