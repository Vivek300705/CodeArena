import fs from 'fs';
import path from 'path';

/**
 * ProblemBuilder Engine
 * Automatically generates Boilerplates, Driver Code, and Testcases 
 * for LeetCode-style competitive programming platforms.
 */

const JS_TYPE_MAP = {
  'int': 'Number',
  'vector<int>': 'number[]',
  'string': 'string',
  'vector<string>': 'string[]',
  'bool': 'boolean',
  'vector<vector<int>>': 'number[][]',
};

const PYTHON_TYPE_MAP = {
  'int': 'int',
  'vector<int>': 'List[int]',
  'string': 'str',
  'vector<string>': 'List[str]',
  'bool': 'bool',
  'vector<vector<int>>': 'List[List[int]]',
};

const JAVA_TYPE_MAP = {
  'int': 'int',
  'vector<int>': 'int[]',
  'string': 'String',
  'vector<string>': 'String[]',
  'bool': 'boolean',
  'vector<vector<int>>': 'int[][]',
};

class ProblemBuilder {
  constructor(signature) {
    this.sig = signature;
  }

  // ============== BOILERPLATES ==============

  generateNodeBoilerplate() {
    const params = this.sig.parameters.map(p => p.name).join(', ');
    const jsdocs = this.sig.parameters.map(p => ` * @param {${JS_TYPE_MAP[p.type]}} ${p.name}`).join('\n');
    return `/**\n${jsdocs}\n * @return {${JS_TYPE_MAP[this.sig.returnType]}}\n */\nfunction ${this.sig.functionName}(${params}) {\n  // Write your solution here\n\n}`;
  }

  generatePythonBoilerplate() {
    const params = this.sig.parameters.map(p => `${p.name}: ${PYTHON_TYPE_MAP[p.type]}`).join(', ');
    return `from typing import List\n\nclass Solution:\n    def ${this.sig.functionName}(self, ${params}) -> ${PYTHON_TYPE_MAP[this.sig.returnType]}:\n        # Write your solution here\n        pass`;
  }

  generateCppBoilerplate() {
    const params = this.sig.parameters.map(p => {
      // Pass vectors by reference in C++
      if (p.type.includes('vector') || p.type === 'string') return `${p.type}& ${p.name}`;
      return `${p.type} ${p.name}`;
    }).join(', ');
    
    return `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    ${this.sig.returnType} ${this.sig.functionName}(${params}) {\n        // Write your solution here\n\n    }\n};`;
  }

  generateJavaBoilerplate() {
    const params = this.sig.parameters.map(p => `${JAVA_TYPE_MAP[p.type]} ${p.name}`).join(', ');
    return `import java.util.*;\n\nclass Solution {\n    public ${JAVA_TYPE_MAP[this.sig.returnType]} ${this.sig.functionName}(${params}) {\n        // Write your solution here\n\n    }\n}`;
  }

  getBoilerplates() {
    return [
      { language: 'node', code: this.generateNodeBoilerplate() },
      { language: 'python', code: this.generatePythonBoilerplate() },
      { language: 'cpp', code: this.generateCppBoilerplate() },
      { language: 'java', code: this.generateJavaBoilerplate() }
    ];
  }

  // ============== DRIVER CODES ==============
  
  // To keep it simple for this prototype, we're writing custom drivers 
  // that just expect a standard I/O format: t -> arg1 -> arg2 -> ...
  // A true, universal I/O generator requires an AST parser, but we'll 
  // do string-based parsing based on the signature types.

  generateNodeDriver() {
    let code = `// ── DRIVER (hidden) ──\nvar _fs = require("fs");\nvar _lines = _fs.readFileSync("/dev/stdin", "utf-8").trim().split(/\\s+/);\nvar _idx = 0;\nvar _t = parseInt(_lines[_idx++]);\nfor (var _i = 0; _i < _t; _i++) {\n`;
    
    const readParam = (p) => {
      if (p.type === 'int') return `  var _${p.name} = parseInt(_lines[_idx++]);\n`;
      if (p.type === 'string') return `  var _${p.name} = _lines[_idx++];\n`;
      if (p.type === 'vector<int>') return `  var _${p.name}_len = parseInt(_lines[_idx++]);\n  var _${p.name} = [];\n  for(var _j=0; _j<_${p.name}_len; _j++) _${p.name}.push(parseInt(_lines[_idx++]));\n`;
      if (p.type === 'vector<string>') return `  var _${p.name}_len = parseInt(_lines[_idx++]);\n  var _${p.name} = [];\n  for(var _j=0; _j<_${p.name}_len; _j++) _${p.name}.push(_lines[_idx++]);\n`;
      return '';
    };

    this.sig.parameters.forEach(p => { code += readParam(p); });
    
    const callArgs = this.sig.parameters.map(p => `_${p.name}`).join(', ');
    code += `  var _res = ${this.sig.functionName}(${callArgs});\n`;
    
    if (this.sig.returnType.includes('vector')) {
      code += `  console.log(_res.join(" "));\n`;
    } else {
      code += `  console.log(_res);\n`;
    }
    
    code += `}`;
    return code;
  }

  generateCppDriver() {
    let code = `// ── DRIVER (hidden) ──\n#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    int _t; cin >> _t;\n    Solution sol;\n    while (_t--) {\n`;
    
    const readParam = (p) => {
      if (p.type === 'int') return `        int _${p.name}; cin >> _${p.name};\n`;
      if (p.type === 'string') return `        string _${p.name}; cin >> _${p.name};\n`;
      if (p.type === 'vector<int>') return `        int _${p.name}_len; cin >> _${p.name}_len;\n        vector<int> _${p.name}(_${p.name}_len);\n        for(int _j=0; _j<_${p.name}_len; _j++) cin >> _${p.name}[_j];\n`;
      if (p.type === 'vector<string>') return `        int _${p.name}_len; cin >> _${p.name}_len;\n        vector<string> _${p.name}(_${p.name}_len);\n        for(int _j=0; _j<_${p.name}_len; _j++) cin >> _${p.name}[_j];\n`;
      return '';
    };

    this.sig.parameters.forEach(p => { code += readParam(p); });
    
    const callArgs = this.sig.parameters.map(p => `_${p.name}`).join(', ');
    code += `        auto _res = sol.${this.sig.functionName}(${callArgs});\n`;
    
    if (this.sig.returnType.includes('vector')) {
      code += `        for(int i=0; i< (int)_res.size(); i++) cout << _res[i] << (i == _res.size()-1 ? "" : " ");\n        cout << "\\n";\n`;
    } else {
      code += `        cout << _res << "\\n";\n`;
    }
    
    code += `    }\n    return 0;\n}`;
    return code;
  }

  generatePythonDriver() {
    let code = `# ── DRIVER (hidden) ──\nimport sys as _sys\n_input = _sys.stdin.read().split()\n_idx = 0\n_sol = Solution()\nif not _input: exit()\n_t = int(_input[_idx]); _idx += 1\nfor _ in range(_t):\n`;
    
    const readParam = (p) => {
      if (p.type === 'int') return `    _${p.name} = int(_input[_idx]); _idx += 1\n`;
      if (p.type === 'string') return `    _${p.name} = _input[_idx]; _idx += 1\n`;
      if (p.type === 'vector<int>') return `    _${p.name}_len = int(_input[_idx]); _idx += 1\n    _${p.name} = list(map(int, _input[_idx:_idx+_${p.name}_len])); _idx += _${p.name}_len\n`;
      if (p.type === 'vector<string>') return `    _${p.name}_len = int(_input[_idx]); _idx += 1\n    _${p.name} = _input[_idx:_idx+_${p.name}_len]; _idx += _${p.name}_len\n`;
      return '';
    };

    this.sig.parameters.forEach(p => { code += readParam(p); });
    
    const callArgs = this.sig.parameters.map(p => `_${p.name}`).join(', ');
    code += `    _res = _sol.${this.sig.functionName}(${callArgs})\n`;
    
    if (this.sig.returnType.includes('vector')) {
      code += `    print(*_res)\n`;
    } else {
      code += `    print(_res)\n`;
    }
    
    return code;
  }

  generateJavaDriver() {
    let code = `// ── DRIVER (hidden) ──\nimport java.util.*;\nclass Main {\n    public static void main(String[] args) {\n        Scanner _sc = new Scanner(System.in);\n        if (!_sc.hasNextInt()) return;\n        int _t = _sc.nextInt();\n        Solution sol = new Solution();\n        while (_t-- > 0) {\n`;
    
    const readParam = (p) => {
      if (p.type === 'int') return `            int _${p.name} = _sc.nextInt();\n`;
      if (p.type === 'string') return `            String _${p.name} = _sc.next();\n`;
      if (p.type === 'vector<int>') return `            int _${p.name}_len = _sc.nextInt();\n            int[] _${p.name} = new int[_${p.name}_len];\n            for(int _j=0; _j<_${p.name}_len; _j++) _${p.name}[_j] = _sc.nextInt();\n`;
      if (p.type === 'vector<string>') return `            int _${p.name}_len = _sc.nextInt();\n            String[] _${p.name} = new String[_${p.name}_len];\n            for(int _j=0; _j<_${p.name}_len; _j++) _${p.name}[_j] = _sc.next();\n`;
      return '';
    };

    this.sig.parameters.forEach(p => { code += readParam(p); });
    
    const callArgs = this.sig.parameters.map(p => `_${p.name}`).join(', ');
    let rType = JAVA_TYPE_MAP[this.sig.returnType];
    code += `            ${rType} _res = sol.${this.sig.functionName}(${callArgs});\n`;
    
    if (this.sig.returnType.includes('vector')) {
      code += `            for(int i=0; i<_res.length; i++) System.out.print(_res[i] + (i == _res.length-1 ? "" : " "));\n            System.out.println();\n`;
    } else {
      code += `            System.out.println(_res);\n`;
    }
    
    code += `        }\n    }\n}`;
    return code;
  }

  getDriverCodes() {
    return [
      { language: 'node', code: this.generateNodeDriver() },
      { language: 'python', code: this.generatePythonDriver() },
      { language: 'cpp', code: this.generateCppDriver() },
      { language: 'java', code: this.generateJavaDriver() }
    ];
  }

  // ============== TESTCASE GENERATOR ==============

  /**
   * Generates testcases by passing random inputs through a reference solution.
   * @param {number} count Number of testcases to generate
   * @param {function} inputGenFn Function that returns a random array of args mapping the parameters
   * @param {function} refSolution The reference JS solution to evaluate outputs
   */
  generateTestCases(count, inputGenFn, refSolution) {
    let inputStr = count + "\\n";
    let outputStr = "";

    for (let i = 0; i < count; i++) {
      const args = inputGenFn();
      
      // format input based on signature
      args.forEach((arg, index) => {
        const type = this.sig.parameters[index].type;
        if (type.includes('vector')) {
          inputStr += arg.length + "\\n";
          inputStr += arg.join(' ') + "\\n";
        } else {
          inputStr += arg + "\\n";
        }
      });

      // run reference solution
      const rawRes = refSolution(...args);
      
      // format output
      if (Array.isArray(rawRes)) {
        outputStr += rawRes.join(' ') + "\\n";
      } else {
        outputStr += rawRes + "\\n";
      }
    }

    // Return as a single mega-testcase object
    return [{
      input: inputStr,
      output: outputStr,
      isHidden: count > 3 // hidden if it's the massive one
    }];
  }
}

export default ProblemBuilder;
