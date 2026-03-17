import dotenv from "dotenv";
dotenv.config();
import Problem from "./src/models/Problem.model.js";
import connectDB from "./src/config/db_config.js";

async function run() {
  await connectDB();

  await Problem.updateOne(
    { title: "Two Sum" },
    {
      $set: {
        boilerplates: [
          {
            language: "node",
            code: "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n  // Write your solution here\n\n}",
          },
          {
            language: "python",
            code: "class Solution:\n    def twoSum(self, nums, target):\n        # Write your solution here\n        pass",
          },
          {
            language: "cpp",
            code: "#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n\n    }\n};",
          },
          {
            language: "java",
            code: "import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n\n    }\n}",
          },
        ],
        driverCode: [
          {
            language: "node",
            code: '// ── DRIVER (hidden) ──\nvar _fs = require("fs");\nvar _lines = _fs.readFileSync("/dev/stdin", "utf-8").trim().split("\\n");\nvar _idx = 0;\nvar _t = parseInt(_lines[_idx++]);\nfor (var _i = 0; _i < _t; _i++) {\n  var _n = parseInt(_lines[_idx++]);\n  var _nums = _lines[_idx++].split(" ").map(Number);\n  var _target = parseInt(_lines[_idx++]);\n  var _res = twoSum(_nums, _target);\n  console.log(_res.join(" "));\n}',
          },
          {
            language: "python",
            code: "# ── DRIVER (hidden) ──\nimport sys as _sys\n_input = _sys.stdin.read().split()\n_idx = 0\n_sol = Solution()\n_t = int(_input[_idx]); _idx += 1\nfor _ in range(_t):\n    _n = int(_input[_idx]); _idx += 1\n    _nums = list(map(int, _input[_idx:_idx+_n])); _idx += _n\n    _target = int(_input[_idx]); _idx += 1\n    _res = _sol.twoSum(_nums, _target)\n    print(*_res)",
          },
          {
            language: "cpp",
            code: '// ── DRIVER (hidden) ──\nint main() {\n    int _t;\n    cin >> _t;\n    Solution sol;\n    while (_t--) {\n        int _n; cin >> _n;\n        vector<int> _nums(_n);\n        for (auto& x : _nums) cin >> x;\n        int _target; cin >> _target;\n        auto _res = sol.twoSum(_nums, _target);\n        for (int i = 0; i < (int)_res.size(); i++) {\n            if (i) cout << " ";\n            cout << _res[i];\n        }\n        cout << "\\n";\n    }\n    return 0;\n}',
          },
          {
            language: "java",
            code: '// ── DRIVER (hidden) ──\nclass Main {\n    public static void main(String[] args) throws Exception {\n        java.util.Scanner _sc = new java.util.Scanner(System.in);\n        int _t = _sc.nextInt();\n        Solution sol = new Solution();\n        while (_t-- > 0) {\n            int _n = _sc.nextInt();\n            int[] _nums = new int[_n];\n            for (int i = 0; i < _n; i++) _nums[i] = _sc.nextInt();\n            int _target = _sc.nextInt();\n            int[] _res = sol.twoSum(_nums, _target);\n            StringBuilder _sb = new StringBuilder();\n            for (int i = 0; i < _res.length; i++) {\n                if (i > 0) _sb.append(" ");\n                _sb.append(_res[i]);\n            }\n            System.out.println(_sb);\n        }\n    }\n}',
          },
        ],
      },
    }
  );

  console.log("Done: Two Sum updated.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
