---
inclusion: always
---

# 🎯 Development Standards - RRHH Agent

## Code Quality Standards

### TypeScript
- Always use strict TypeScript
- Define interfaces for all data structures
- Use proper typing for props and state
- Avoid `any` type unless absolutely necessary

### React Best Practices
- Use functional components with hooks
- Implement proper error boundaries
- Use React.memo for performance optimization
- Follow hooks rules (no conditional hooks)

### Styling Guidelines
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing (4px grid)
- Use semantic color names from design system

### Performance Requirements
- Components should load in < 100ms
- Images must be optimized (WebP/AVIF)
- Bundle size should not exceed 500kb
- Lighthouse score must be > 90

### Accessibility Standards
- All interactive elements need ARIA labels
- Maintain color contrast ratio > 4.5:1
- Support keyboard navigation
- Test with screen readers

### Testing Requirements
- Unit tests for all custom hooks
- Integration tests for critical user flows
- E2E tests for authentication and chat
- Minimum 80% code coverage

## File Organization

### Component Structure
```typescript
// ComponentName.tsx
interface Props {
  // Define all props with types
}

const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // Component logic
  return (
    // JSX with proper accessibility
  )
}

export default ComponentName
```

### Hook Structure
```typescript
// useCustomHook.ts
interface HookReturn {
  // Define return type
}

export const useCustomHook = (): HookReturn => {
  // Hook logic with proper error handling
  return {
    // Return object
  }
}
```

## Error Handling

- Always wrap async operations in try-catch
- Provide meaningful error messages to users
- Log errors for debugging but don't expose sensitive info
- Implement graceful fallbacks for all features

## Security Guidelines

- Sanitize all user inputs
- Use HTTPS for all external requests
- Implement proper CORS policies
- Never expose sensitive data in client-side code