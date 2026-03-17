import dotenv from "dotenv";
dotenv.config();
import Problem from "./src/models/Problem.model.js";
import connectDB from "./src/config/db_config.js";
// Paste the ChatGPT JSON array here
const problems = [
  {
    "title": "Maximum Depth of Binary Tree",
    "description": "Given the `root` of a binary tree, return its maximum depth.\n\nA binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
    "difficulty": "easy",
    "tags": ["Tree", "Depth-First Search", "Breadth-First Search", "Binary Tree"],
    "timeLimit": 1000,
    "memoryLimit": 256,
    "testcases": [
      {
        "input": "1\n7\n3 9 20 null null 15 7\n",
        "output": "3\n",
        "isHidden": false
      }
    ],
    "boilerplates": [
      {
        "language": "cpp",
        "code": "/**\n * Definition for a binary tree node.\n * struct TreeNode {\n * int val; TreeNode *left; TreeNode *right;\n * };\n */\nclass Solution {\npublic:\n    int maxDepth(TreeNode* root) {\n        \n    }\n};"
      }
    ],
    "driverCode": [
      {
        "language": "cpp",
        "code": "// Standard level-order tree builder included in judge\nint main() {\n    int t; cin >> t;\n    Solution sol;\n    while(t--) {\n        string s; getline(cin >> ws, s);\n        TreeNode* root = buildTree(s);\n        cout << sol.maxDepth(root) << endl;\n    }\n    return 0;\n}"
      }
    ]
  },
  {
    "title": "Kth Largest Element in an Array",
    "description": "Given an integer array `nums` and an integer `k`, return the `kth` largest element in the array.\n\nNote that it is the `kth` largest element in the sorted order, not the `kth` unique element.",
    "difficulty": "medium",
    "tags": ["Array", "Divide and Conquer", "Sorting", "Heap (Priority Queue)", "Quickselect"],
    "timeLimit": 1000,
    "memoryLimit": 256,
    "testcases": [
      {
        "input": "2\n6\n3 2 1 5 6 4\n2\n9\n3 2 3 1 2 4 5 5 6\n4\n",
        "output": "5\n4\n",
        "isHidden": false
      }
    ],
    "boilerplates": [
      {
        "language": "cpp",
        "code": "class Solution {\npublic:\n    int findKthLargest(vector<int>& nums, int k) {\n        \n    }\n};"
      }
    ],
    "driverCode": [
      {
        "language": "cpp",
        "code": "int main() {\n    int t; cin >> t;\n    Solution sol;\n    while(t--) {\n        int n; cin >> n;\n        vector<int> nums(n); for(int i=0; i<n; i++) cin >> nums[i];\n        int k; cin >> k;\n        cout << sol.findKthLargest(nums, k) << endl;\n    }\n    return 0;\n}"
      }
    ]
  },
  {
    "title": "Lowest Common Ancestor of a Binary Tree",
    "description": "Given a binary tree, find the lowest common ancestor (LCA) of two given nodes in the tree.\n\nAccording to the definition of LCA on Wikipedia: “The lowest common ancestor is defined between two nodes p and q as the lowest node in T that has both p and q as descendants (where we allow a node to be a descendant of itself).”",
    "difficulty": "medium",
    "tags": ["Tree", "Depth-First Search", "Binary Tree"],
    "timeLimit": 1000,
    "memoryLimit": 256,
    "testcases": [
      {
        "input": "1\n9\n3 5 1 6 2 0 8 null null 7 4\n5 1\n",
        "output": "3\n",
        "isHidden": false
      }
    ],
    "boilerplates": [
      {
        "language": "cpp",
        "code": "class Solution {\npublic:\n    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {\n        \n    }\n};"
      }
    ],
    "driverCode": [
      {
        "language": "cpp",
        "code": "int main() {\n    int t; cin >> t;\n    Solution sol;\n    while(t--) {\n        string s; getline(cin >> ws, s);\n        int pv, qv; cin >> pv >> qv;\n        TreeNode* root = buildTree(s);\n        TreeNode* p = findNode(root, pv);\n        TreeNode* q = findNode(root, qv);\n        TreeNode* res = sol.lowestCommonAncestor(root, p, q);\n        cout << (res ? res->val : -1) << endl;\n    }\n    return 0;\n}"
      }
    ]
  },
  {
    "title": "Validate Binary Search Tree",
    "description": "Given the `root` of a binary tree, determine if it is a valid binary search tree (BST).\n\nA valid BST is defined as follows:\n- The left subtree of a node contains only nodes with keys less than the node's key.\n- The right subtree of a node contains only nodes with keys greater than the node's key.\n- Both the left and right subtrees must also be binary search trees.",
    "difficulty": "medium",
    "tags": ["Tree", "Depth-First Search", "Binary Search Tree", "Binary Tree"],
    "timeLimit": 1000,
    "memoryLimit": 256,
    "testcases": [
      {
        "input": "2\n3\n2 1 3\n5\n5 1 4 null null 3 6\n",
        "output": "true\nfalse\n",
        "isHidden": false
      }
    ],
    "boilerplates": [
      {
        "language": "cpp",
        "code": "class Solution {\npublic:\n    bool isValidBST(TreeNode* root) {\n        \n    }\n};"
      }
    ],
    "driverCode": [
      {
        "language": "cpp",
        "code": "int main() {\n    int t; cin >> t;\n    Solution sol;\n    while(t--) {\n        string s; getline(cin >> ws, s);\n        TreeNode* root = buildTree(s);\n        cout << (sol.isValidBST(root) ? \"true\" : \"false\") << endl;\n    }\n    return 0;\n}"
      }
    ]
  },
  {
    "title": "Invert Binary Tree",
    "description": "Given the `root` of a binary tree, invert the tree, and return its root.",
    "difficulty": "easy",
    "tags": ["Tree", "Depth-First Search", "Breadth-First Search", "Binary Tree"],
    "timeLimit": 1000,
    "memoryLimit": 256,
    "testcases": [
      {
        "input": "1\n7\n4 2 7 1 3 6 9\n",
        "output": "4 7 2 9 6 3 1\n",
        "isHidden": false
      }
    ],
    "boilerplates": [
      {
        "language": "cpp",
        "code": "class Solution {\npublic:\n    TreeNode* invertTree(TreeNode* root) {\n        \n    }\n};"
      }
    ],
    "driverCode": [
      {
        "language": "cpp",
        "code": "int main() {\n    int t; cin >> t;\n    Solution sol;\n    while(t--) {\n        string s; getline(cin >> ws, s);\n        TreeNode* root = buildTree(s);\n        TreeNode* res = sol.invertTree(root);\n        printLevelOrder(res);\n    }\n    return 0;\n}"
      }
    ]
  },
  {
    "title": "Binary Tree Level Order Traversal",
    "description": "Given the `root` of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
    "difficulty": "medium",
    "tags": ["Tree", "Breadth-First Search", "Binary Tree"],
    "timeLimit": 1000,
    "memoryLimit": 256,
    "testcases": [
      {
        "input": "1\n7\n3 9 20 null null 15 7\n",
        "output": "3\n9 20\n15 7\n",
        "isHidden": false
      }
    ],
    "boilerplates": [
      {
        "language": "cpp",
        "code": "class Solution {\npublic:\n    vector<vector<int>> levelOrder(TreeNode* root) {\n        \n    }\n};"
      }
    ],
    "driverCode": [
      {
        "language": "cpp",
        "code": "int main() {\n    int t; cin >> t;\n    Solution sol;\n    while(t--) {\n        string s; getline(cin >> ws, s);\n        TreeNode* root = buildTree(s);\n        auto res = sol.levelOrder(root);\n        for(auto& level : res) {\n            for(int i=0; i<level.size(); i++) cout << level[i] << (i == level.size()-1 ? \"\" : \" \");\n            cout << endl;\n        }\n    }\n    return 0;\n}"
      }
    ]
  },
  {
    "title": "Merge k Sorted Lists",
    "description": "You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
    "difficulty": "hard",
    "tags": ["Linked List", "Divide and Conquer", "Heap (Priority Queue)", "Merge Sort"],
    "timeLimit": 2000,
    "memoryLimit": 256,
    "testcases": [
      {
        "input": "1\n3\n3\n1 4 5\n3\n1 3 4\n2\n2 6\n",
        "output": "1 1 2 3 4 4 5 6\n",
        "isHidden": false
      }
    ],
    "boilerplates": [
      {
        "language": "cpp",
        "code": "class Solution {\npublic:\n    ListNode* mergeKLists(vector<ListNode*>& lists) {\n        \n    }\n};"
      }
    ],
    "driverCode": [
      {
        "language": "cpp",
        "code": "int main() {\n    int t; cin >> t;\n    Solution sol;\n    while(t--) {\n        int k; cin >> k;\n        vector<ListNode*> lists(k);\n        for(int i=0; i<k; i++) {\n            int n; cin >> n;\n            lists[i] = buildList(n);\n        }\n        ListNode* res = sol.mergeKLists(lists);\n        printList(res);\n    }\n    return 0;\n}"
      }
    ]
  },
  {
    "title": "Subsets",
    "description": "Given an integer array `nums` of unique elements, return all possible subsets (the power set).\n\nThe solution set must not contain duplicate subsets. Return the solution in any order.",
    "difficulty": "medium",
    "tags": ["Array", "Backtracking", "Bit Manipulation"],
    "timeLimit": 1000,
    "memoryLimit": 256,
    "testcases": [
      {
        "input": "1\n3\n1 2 3\n",
        "output": "\n1\n2\n1 2\n3\n1 3\n2 3\n1 2 3\n",
        "isHidden": false
      }
    ],
    "boilerplates": [
      {
        "language": "cpp",
        "code": "class Solution {\npublic:\n    vector<vector<int>> subsets(vector<int>& nums) {\n        \n    }\n};"
      }
    ],
    "driverCode": [
      {
        "language": "cpp",
        "code": "int main() {\n    int t; cin >> t;\n    Solution sol;\n    while(t--) {\n        int n; cin >> n;\n        vector<int> nums(n); for(int i=0; i<n; i++) cin >> nums[i];\n        auto res = sol.subsets(nums);\n        sort(res.begin(), res.end());\n        for(auto& sub : res) {\n            for(int i=0; i<sub.size(); i++) cout << sub[i] << (i == sub.size()-1 ? \"\" : \" \");\n            cout << endl;\n        }\n    }\n    return 0;\n}"
      }
    ]
  },
  {
    "title": "Binary Tree Zigzag Level Order Traversal",
    "description": "Given the `root` of a binary tree, return the zigzag level order traversal of its nodes' values. (i.e., from left to right, then right to left for the next level and alternate between).",
    "difficulty": "medium",
    "tags": ["Tree", "Breadth-First Search", "Binary Tree"],
    "timeLimit": 1000,
    "memoryLimit": 256,
    "testcases": [
      {
        "input": "1\n7\n3 9 20 null null 15 7\n",
        "output": "3\n20 9\n15 7\n",
        "isHidden": false
      }
    ],
    "boilerplates": [
      {
        "language": "cpp",
        "code": "class Solution {\npublic:\n    vector<vector<int>> zigzagLevelOrder(TreeNode* root) {\n        \n    }\n};"
      }
    ],
    "driverCode": [
      {
        "language": "cpp",
        "code": "int main() {\n    int t; cin >> t;\n    Solution sol;\n    while(t--) {\n        string s; getline(cin >> ws, s);\n        TreeNode* root = buildTree(s);\n        auto res = sol.zigzagLevelOrder(root);\n        for(auto& v : res) {\n            for(int i=0; i<v.size(); i++) cout << v[i] << (i == v.size()-1 ? \"\" : \" \");\n            cout << endl;\n        }\n    }\n    return 0;\n}"
      }
    ]
  },
  {
    "title": "Serialize and Deserialize Binary Tree",
    "description": "Serialization is the process of converting a data structure or object into a sequence of bits so that it can be stored in a file or memory buffer, or transmitted across a network connection link to be reconstructed later in the same or another computer environment.\n\nDesign an algorithm to serialize and deserialize a binary tree.",
    "difficulty": "hard",
    "tags": ["String", "Tree", "Depth-First Search", "Breadth-First Search", "Design", "Binary Tree"],
    "timeLimit": 2000,
    "memoryLimit": 256,
    "testcases": [
      {
        "input": "1\n5\n1 2 3 null null 4 5\n",
        "output": "1 2 3 null null 4 5\n",
        "isHidden": false
      }
    ],
    "boilerplates": [
      {
        "language": "cpp",
        "code": "class Codec {\npublic:\n    string serialize(TreeNode* root) {}\n    TreeNode* deserialize(string data) {}\n};"
      }
    ],
    "driverCode": [
      {
        "language": "cpp",
        "code": "int main() {\n    int t; cin >> t;\n    Codec ser, deser;\n    while(t--) {\n        string s; getline(cin >> ws, s);\n        TreeNode* root = deser.deserialize(s);\n        string out = ser.serialize(root);\n        cout << out << endl;\n    }\n    return 0;\n}"
      }
    ]
  }
]
async function run() {
  await connectDB();
  const { default: slugify } = await import("slugify");
  let created = 0;
  let updated = 0;
  for (const p of problems) {
    try {
      const exists = await Problem.findOne({ title: p.title, isDeleted: false });
      if (exists) {
        await Problem.updateOne({ _id: exists._id }, { $set: { boilerplates: p.boilerplates, driverCode: p.driverCode, testcases: p.testcases } });
        console.log(`🔄 Updated: ${p.title}`);
        updated++;
        continue;
      }
      p.createdBy = "69b85df1ec3ce2fa4d7f71c5";
      p.slug = slugify(p.title, { lower: true, strict: true });
      p.isDeleted = false;
      await Problem.collection.insertOne(p);
      console.log(`✅ Created: ${p.title}`);
      created++;
    } catch (err) {
      console.error(`❌ Error on "${p.title}": ${err.message}`);
    }
  }
  console.log(`\nDone! ${created} created, ${updated} updated.`);
  process.exit(0);
}
run().catch(console.error);
