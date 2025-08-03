# 🔍 Code Review Workflow

## Trigger
This workflow activates when:
- New code is committed
- Pull request is created
- File changes are detected in critical paths

## Review Checklist

### 🏗️ Architecture Review
- [ ] Does the code follow the established file structure?
- [ ] Are components properly organized (ui/ vs features/)?
- [ ] Are types centralized in the types/ directory?
- [ ] Is the component reusable or specific to a feature?

### 🚀 Performance Review
- [ ] Will this change increase bundle size significantly?
- [ ] Are expensive operations properly memoized?
- [ ] Is lazy loading implemented where appropriate?
- [ ] Are images optimized and using Next.js Image component?

### 🎨 UX/UI Review
- [ ] Is the component accessible (ARIA labels, keyboard nav)?
- [ ] Does it work properly on mobile devices?
- [ ] Are loading states implemented?
- [ ] Are error states handled gracefully?

### 🔒 Security Review
- [ ] Are user inputs properly sanitized?
- [ ] Are sensitive data properly handled?
- [ ] Are external requests using HTTPS?
- [ ] Is authentication properly implemented?

### 🧪 Testing Review
- [ ] Are unit tests included for new functionality?
- [ ] Are edge cases covered?
- [ ] Is error handling tested?
- [ ] Are integration tests updated if needed?

## Automated Checks

### Code Quality
```bash
# Run linting
npm run lint

# Run type checking
npx tsc --noEmit

# Run tests
npm test

# Check bundle size
npm run analyze
```

### Performance Checks
```bash
# Lighthouse CI
npx lhci autorun

# Bundle size check
npx bundlesize

# Performance budget check
npm run perf-budget
```

## Review Guidelines

### High Priority Issues
- Security vulnerabilities
- Performance regressions
- Accessibility violations
- Breaking changes

### Medium Priority Issues
- Code organization
- Missing tests
- Documentation gaps
- Minor performance issues

### Low Priority Issues
- Code style preferences
- Minor refactoring opportunities
- Documentation improvements

## Approval Criteria

### ✅ Auto-approve if:
- Only documentation changes
- Minor styling adjustments
- Test additions without logic changes
- Configuration updates

### 🔍 Manual review required for:
- New components or features
- Authentication changes
- Performance-critical code
- External API integrations

### ❌ Block if:
- Tests are failing
- Security issues detected
- Accessibility violations
- Performance budget exceeded