# 🎣 Pre-commit Hook Configuration

## Purpose
This hook runs automatically before each commit to ensure code quality and prevent issues from entering the repository.

## Checks Performed

### 1. Code Formatting
```bash
# Run Prettier to format code
npx prettier --write "**/*.{ts,tsx,js,jsx,json,md}"

# Run ESLint to fix auto-fixable issues
npx eslint --fix "**/*.{ts,tsx,js,jsx}"
```

### 2. Type Checking
```bash
# TypeScript type checking
npx tsc --noEmit
```

### 3. Testing
```bash
# Run tests for changed files
npm test -- --passWithNoTests --findRelatedTests
```

### 4. Bundle Size Check
```bash
# Check if bundle size increased significantly
node .kiro/scripts/analyze-bundle.js --check-size
```

### 5. Security Audit
```bash
# Check for security vulnerabilities
npm audit --audit-level moderate
```

## Installation

### Using Husky (Recommended)
```bash
# Install husky
npm install --save-dev husky

# Initialize husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "node .kiro/hooks/pre-commit.js"
```

### Manual Installation
```bash
# Copy hook to git hooks directory
cp .kiro/hooks/pre-commit.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## Configuration

### Skip Checks (Emergency)
```bash
# Skip all pre-commit checks (use sparingly)
git commit --no-verify -m "Emergency fix"
```

### Selective Skipping
```bash
# Skip specific checks using environment variables
SKIP_TESTS=true git commit -m "WIP: Work in progress"
SKIP_LINT=true git commit -m "Quick fix"
```

## Hook Script

### Pre-commit Implementation
```javascript
#!/usr/bin/env node

const { execSync } = require('child_process')
const process = require('process')

const runCheck = (command, description, skipEnv) => {
  if (process.env[skipEnv]) {
    console.log(`⏭️  Skipping ${description} (${skipEnv} set)`)
    return true
  }
  
  console.log(`🔍 Running ${description}...`)
  try {
    execSync(command, { stdio: 'inherit' })
    console.log(`✅ ${description} passed`)
    return true
  } catch (error) {
    console.error(`❌ ${description} failed`)
    return false
  }
}

const checks = [
  {
    command: 'npx prettier --check "**/*.{ts,tsx,js,jsx,json,md}"',
    description: 'Code formatting check',
    skipEnv: 'SKIP_FORMAT'
  },
  {
    command: 'npx eslint "**/*.{ts,tsx,js,jsx}"',
    description: 'ESLint check',
    skipEnv: 'SKIP_LINT'
  },
  {
    command: 'npx tsc --noEmit',
    description: 'TypeScript type check',
    skipEnv: 'SKIP_TYPES'
  },
  {
    command: 'npm test -- --passWithNoTests --watchAll=false',
    description: 'Unit tests',
    skipEnv: 'SKIP_TESTS'
  }
]

console.log('🎣 Running pre-commit hooks...\n')

let allPassed = true
for (const check of checks) {
  const passed = runCheck(check.command, check.description, check.skipEnv)
  if (!passed) {
    allPassed = false
  }
}

if (allPassed) {
  console.log('\n✅ All pre-commit checks passed!')
  process.exit(0)
} else {
  console.log('\n❌ Some pre-commit checks failed!')
  console.log('💡 Fix the issues above or use --no-verify to skip checks')
  process.exit(1)
}
```

## Troubleshooting

### Common Issues

#### Hook not running
```bash
# Check if hook is executable
ls -la .git/hooks/pre-commit

# Make executable if needed
chmod +x .git/hooks/pre-commit
```

#### Tests failing
```bash
# Run tests manually to see detailed output
npm test

# Update snapshots if needed
npm test -- --updateSnapshot
```

#### Type errors
```bash
# Run TypeScript check manually
npx tsc --noEmit

# Check specific files
npx tsc --noEmit path/to/file.ts
```

### Performance Optimization
- Only run tests for changed files
- Use incremental TypeScript checking
- Cache ESLint results
- Skip checks for WIP commits