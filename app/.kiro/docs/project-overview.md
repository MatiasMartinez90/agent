# 🚀 RRHH Agent - Project Overview

## 📖 Project Description

RRHH Agent is an AI-powered interview platform that enables candidates to complete job interviews through an intelligent chat interface with voice recording capabilities. The platform provides a modern, accessible, and efficient way to conduct initial screening interviews.

## 🎯 Key Features

### Core Functionality
- **AI Chat Interface**: Intelligent conversation flow powered by N8N webhooks
- **Voice Recording**: High-quality audio capture and playback
- **Google Authentication**: Secure login via AWS Amplify + Cognito
- **Chat Persistence**: Local storage with audio blob handling
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Technical Features
- **Real-time Chat**: Instant messaging with typing indicators
- **Audio Processing**: WebM audio recording with fallback formats
- **Avatar Caching**: Optimized user profile image handling
- **Error Boundaries**: Graceful error handling and recovery
- **Performance Optimization**: Code splitting and lazy loading

## 🏗️ Architecture

### Frontend Stack
- **Framework**: Next.js 13 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Authentication**: AWS Amplify + Cognito
- **State Management**: React hooks + SWR for data fetching
- **Audio**: Web Audio API with MediaRecorder

### Backend Integration
- **API**: N8N webhook for AI processing
- **Authentication**: AWS Cognito User Pools
- **Storage**: Browser localStorage for chat persistence
- **CDN**: AWS CloudFront for static assets

### Deployment
- **Hosting**: AWS S3 + CloudFront
- **CI/CD**: GitHub Actions
- **Monitoring**: Planned (Sentry, Web Vitals)

## 📁 Project Structure

```
app/
├── components/           # React components
│   ├── AIInterviewLogo.tsx
│   ├── UserAvatar.tsx
│   ├── VoiceRecorder.tsx
│   └── ...
├── hooks/               # Custom React hooks
│   ├── useChatPersistence.ts
│   ├── useVoiceRecording.ts
│   └── ...
├── lib/                 # Utility libraries
│   ├── useUser.ts
│   └── useEnv.ts
├── pages/               # Next.js pages
│   ├── index.tsx        # Landing page
│   ├── signin.tsx       # Authentication
│   ├── chat.tsx         # Main chat interface
│   └── admin.tsx        # Admin redirect
├── utils/               # Utility functions
│   ├── avatarCache.ts
│   ├── audioConverter.ts
│   └── ...
└── .kiro/              # Kiro configuration
    ├── tasks/          # Development tasks
    ├── agents/         # AI agents
    ├── workflows/      # Automation
    └── ...
```

## 🎨 Design System

### Color Palette
```css
/* Primary Colors */
--blue-600: #2563eb;
--purple-600: #9333ea;
--slate-900: #0f172a;
--slate-800: #1e293b;

/* Semantic Colors */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
```

### Typography
- **Headings**: Inter font family
- **Body**: System font stack
- **Code**: Menlo, Monaco, monospace

### Components
- **Buttons**: Rounded corners, gradient backgrounds
- **Cards**: Backdrop blur with border
- **Forms**: Consistent spacing and validation
- **Loading**: Skeleton screens and spinners

## 🔄 User Journey

### 1. Landing Page
- Value proposition presentation
- Clear call-to-action
- Modern, professional design

### 2. Authentication
- Google OAuth integration
- Simplified sign-in flow
- Error handling and recovery

### 3. Chat Interface
- AI-powered conversation
- Voice recording capability
- Real-time message exchange
- Chat history persistence

### 4. Completion
- Interview summary
- Next steps information
- Contact details

## 🚀 Performance Targets

### Core Web Vitals
- **LCP**: < 2.5 seconds
- **FID**: < 100 milliseconds
- **CLS**: < 0.1

### Bundle Size
- **Total**: < 500KB gzipped
- **Main**: < 300KB
- **Vendor**: < 200KB

### Lighthouse Scores
- **Performance**: > 90
- **Accessibility**: > 95
- **Best Practices**: > 90
- **SEO**: > 90

## 🔒 Security Considerations

### Authentication
- AWS Cognito for secure user management
- JWT tokens for session management
- Secure cookie handling

### Data Protection
- No sensitive data in localStorage
- HTTPS enforcement
- Input sanitization

### Privacy
- Minimal data collection
- Clear privacy policy
- User consent management

## 🧪 Testing Strategy

### Unit Tests
- Custom hooks testing
- Component behavior testing
- Utility function testing

### Integration Tests
- Authentication flow
- Chat functionality
- Voice recording

### E2E Tests
- Complete user journey
- Cross-browser compatibility
- Mobile device testing

## 📈 Analytics & Monitoring

### Performance Monitoring
- Web Vitals tracking
- Bundle size monitoring
- Error rate tracking

### User Analytics
- Feature usage tracking
- Conversion funnel analysis
- User behavior insights

### Error Tracking
- JavaScript error monitoring
- Network failure tracking
- User feedback collection

## 🔮 Future Enhancements

### Short Term
- PWA capabilities
- Offline support
- Enhanced accessibility

### Medium Term
- Multi-language support
- Advanced AI features
- Integration with HR systems

### Long Term
- Video interview capability
- Advanced analytics dashboard
- White-label solutions