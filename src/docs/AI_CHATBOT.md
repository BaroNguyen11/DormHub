# AI Chatbot Integration - DormHub

## Overview

DormHub has been integrated with an AI Chatbot assistant powered by 9Router's OpenAI-compatible API. The chatbot provides contextual help to both students and managers using the system.

## Architecture

### Components

```
src/
├── services/
│   └── ai.service.js          # AI API client and utilities
├── components/
│   ├── Chatbot.jsx            # Main chat window component
│   └── ChatbotToggle.jsx      # Floating toggle button
├── styles/
│   └── chatbot.css            # Chatbot styling
└── layouts/
    ├── StudentLayout.jsx      # Integrated with chatbot
    └── ManagerLayout.jsx      # Integrated with chatbot
```

### Flow

1. User clicks the floating chatbot toggle button
2. Chat window opens with welcome message
3. User sends message
4. Frontend formats conversation history + system prompt
5. Call to 9Router API via `/v1/chat/completions`
6. AI response displayed in chat
7. Conversation persists in component state (session-based)

## Configuration

### Environment Variables

Required variables in `.env`:

```bash
# AI Chatbot Configuration (9Router OpenAI-compatible API)
VITE_AI_BASE_URL=https://decide-garlic-mia-save.trycloudflare.com/v1
VITE_AI_API_KEY=sk-c5a30fbce7ee2c04-8jv8c0-1ea4a431
VITE_AI_MODEL=kr/claude-sonnet-4.5
```

### API Format

The service uses OpenAI-compatible format:

**Request:**
```json
{
  "model": "kr/claude-sonnet-4.5",
  "messages": [
    { "role": "system", "content": "System prompt..." },
    { "role": "user", "content": "User question" },
    { "role": "assistant", "content": "AI response" }
  ],
  "stream": false,
  "temperature": 0.7,
  "max_tokens": 2000
}
```

**Response:**
```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "AI response text"
      }
    }
  ]
}
```

## Features

### Role-Based Context

The chatbot provides different system prompts based on user role:

**For Students:**
- View and pay bills
- Submit maintenance requests
- View room and contract info
- Register for new rooms

**For Managers:**
- Manage rooms and buildings
- Approve registrations
- Create and manage bills
- Handle maintenance requests
- View statistics and reports

### UI Features

- **Floating toggle button** - Fixed bottom-right position with AI badge
- **Smooth animations** - Slide up, fade in effects
- **Auto-scroll** - Automatically scrolls to latest message
- **Loading states** - Typing indicator while AI is thinking
- **Error handling** - User-friendly error messages
- **Clear history** - Button to reset conversation
- **Mobile responsive** - Full-screen on small devices
- **Keyboard shortcuts** - Enter to send, Shift+Enter for new line

## Code Examples

### Using the AI Service

```javascript
import { aiService } from '../services/ai.service';

// Create system prompt
const systemPrompt = aiService.createSystemPrompt('STUDENT', user);

// Format messages
const messages = aiService.formatMessages(conversation, systemPrompt);

// Send to AI
const response = await aiService.sendChatMessage(messages, {
  temperature: 0.7,
  max_tokens: 2000
});
```

### Adding Chatbot to a Layout

```javascript
import { useState } from 'react';
import Chatbot from '../components/Chatbot';
import ChatbotToggle from '../components/ChatbotToggle';

export default function MyLayout({ children }) {
  const [chatbotOpen, setChatbotOpen] = useState(false);
  
  return (
    <>
      {children}
      
      <Chatbot 
        isOpen={chatbotOpen} 
        onClose={() => setChatbotOpen(false)} 
      />
      
      {!chatbotOpen && (
        <ChatbotToggle onClick={() => setChatbotOpen(true)} />
      )}
    </>
  );
}
```

## Security Considerations

### Current Implementation (Frontend Only)

⚠️ **Warning:** API keys are currently exposed in frontend environment variables. This is acceptable for:
- Development environments
- Internal tools
- Demos and prototypes

### For Production

API keys should NEVER be exposed in frontend code. Implement backend proxy:

#### Recommended Architecture

```
Frontend → Backend API → 9Router AI API
         (authenticated)  (API key hidden)
```

## Backend Integration Guide

### Step 1: Create AI Proxy Endpoint

**Backend API Route:** `POST /api/v1/ai/chat`

**Request:**
```json
{
  "message": "User question",
  "conversationHistory": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Response:**
```json
{
  "response": "AI answer",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Step 2: Backend Implementation (Spring Boot Example)

```java
@RestController
@RequestMapping("/api/v1/ai")
public class AIController {
    
    @Value("${ai.base.url}")
    private String aiBaseUrl;
    
    @Value("${ai.api.key}")
    private String aiApiKey;
    
    @Value("${ai.model}")
    private String aiModel;
    
    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(
        @RequestBody ChatRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        // 1. Get user context
        User user = userService.findByUsername(userDetails.getUsername());
        
        // 2. Build system prompt
        String systemPrompt = buildSystemPrompt(user);
        
        // 3. Format messages
        List<Message> messages = new ArrayList<>();
        messages.add(new Message("system", systemPrompt));
        messages.addAll(request.getConversationHistory());
        messages.add(new Message("user", request.getMessage()));
        
        // 4. Call 9Router API
        OpenAIRequest openAIRequest = OpenAIRequest.builder()
            .model(aiModel)
            .messages(messages)
            .temperature(0.7)
            .maxTokens(2000)
            .build();
            
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(aiApiKey);
        
        HttpEntity<OpenAIRequest> entity = new HttpEntity<>(openAIRequest, headers);
        
        OpenAIResponse aiResponse = restTemplate.postForObject(
            aiBaseUrl + "/chat/completions",
            entity,
            OpenAIResponse.class
        );
        
        // 5. Extract and return response
        String content = aiResponse.getChoices().get(0).getMessage().getContent();
        
        return ResponseEntity.ok(new ChatResponse(content, Instant.now()));
    }
    
    private String buildSystemPrompt(User user) {
        String basePrompt = "Bạn là trợ lý AI của DormHub...";
        
        if (user.getRole() == Role.STUDENT) {
            return basePrompt + "\nNgười dùng hiện tại: Sinh viên\n...";
        } else if (user.getRole() == Role.MANAGER) {
            return basePrompt + "\nNgười dùng hiện tại: Quản lý\n...";
        }
        
        return basePrompt;
    }
}
```

### Step 3: Update Frontend Service

```javascript
// Change ai.service.js to call backend instead
export async function sendChatMessage(messages, options = {}) {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('/api/v1/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      message: messages[messages.length - 1].content,
      conversationHistory: messages.slice(0, -1)
    })
  });
  
  const data = await response.json();
  return data.response;
}
```

### Step 4: Backend Environment Variables

```properties
# application.properties
ai.base.url=https://decide-garlic-mia-save.trycloudflare.com/v1
ai.api.key=sk-c5a30fbce7ee2c04-8jv8c0-1ea4a431
ai.model=kr/claude-sonnet-4.5
```

## Advanced Features (Future Enhancements)

### 1. Conversation Persistence

Store chat history in database:

```sql
CREATE TABLE chat_conversations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE chat_messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    conversation_id BIGINT NOT NULL,
    role ENUM('user', 'assistant') NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id)
);
```

### 2. Context-Aware Responses

Inject real-time data into prompts:

```javascript
const systemPrompt = `
Bạn là trợ lý AI của DormHub.

Thông tin người dùng:
- Tên: ${user.fullName}
- Phòng hiện tại: ${userRoom?.roomNumber || 'Chưa có'}
- Hóa đơn chưa thanh toán: ${unpaidBills.length} hóa đơn
- Tổng nợ: ${totalDebt.toLocaleString('vi-VN')} VNĐ

Hãy sử dụng thông tin này để tư vấn chính xác.
`;
```

### 3. Action Triggers

Allow AI to suggest actions:

```javascript
// AI can return structured data
{
  "type": "action",
  "action": "VIEW_BILL",
  "billId": 123,
  "message": "Bạn có 1 hóa đơn chưa thanh toán. Bạn có muốn xem không?"
}

// Frontend handles action
if (response.type === 'action') {
  // Show action button
  <button onClick={() => navigate(`/bills/${response.billId}`)}>
    Xem hóa đơn
  </button>
}
```

### 4. Multi-language Support

```javascript
const systemPrompt = createSystemPrompt(role, user, locale);

// In ai.service.js
export function createSystemPrompt(role, user, locale = 'vi') {
  const translations = {
    vi: 'Bạn là trợ lý AI...',
    en: 'You are an AI assistant...'
  };
  
  return translations[locale] || translations.vi;
}
```

### 5. Rate Limiting

Prevent abuse:

```java
@RateLimit(requests = 20, per = "1 minute")
@PostMapping("/chat")
public ResponseEntity<ChatResponse> chat(...) {
    // ...
}
```

## Troubleshooting

### Issue: CORS Error - "Access to fetch blocked by CORS policy"

**Cause:** 9Router API doesn't allow direct browser requests (CORS headers missing)

**Solution (Development):** Use Vite Proxy

This solution is already implemented in the project. The proxy configuration in `vite.config.js` routes requests through the Vite dev server, bypassing CORS:

1. **How it works:**
   - Frontend calls `/ai-proxy/v1/chat/completions`
   - Vite dev server proxies to `https://decide-garlic-mia-save.trycloudflare.com/v1/chat/completions`
   - Vite adds Authorization header server-side
   - No CORS issue because browser only sees same-origin request

2. **Configuration:**
   ```javascript
   // vite.config.js
   server: {
     proxy: {
       '/ai-proxy': {
         target: 'https://decide-garlic-mia-save.trycloudflare.com',
         changeOrigin: true,
         rewrite: (path) => path.replace(/^\/ai-proxy/, ''),
         configure: (proxy, options) => {
           proxy.on('proxyReq', (proxyReq, req, res) => {
             const apiKey = process.env.VITE_AI_API_KEY || 'sk-c5a30fbce7ee2c04-8jv8c0-1ea4a431';
             proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
           });
         }
       }
     }
   }
   ```

3. **Environment setup:**
   ```bash
   # .env
   VITE_AI_BASE_URL=/ai-proxy/v1
   VITE_AI_API_KEY=your-api-key
   ```

4. **Restart dev server:**
   ```bash
   npm run dev
   ```

**Solution (Production):** Backend Proxy

For production, you MUST implement a backend proxy (see Backend Integration Guide above). The Vite proxy only works in development mode.

### Issue: "API key không hợp lệ"

**Cause:** Wrong API key or expired token

**Solution:**
1. Check `.env` file has correct `VITE_AI_API_KEY`
2. Restart dev server after changing `.env`
3. Verify API key with 9Router support

### Issue: "Không thể kết nối tới AI server"

**Cause:** Network error or server unreachable

**Solution:**
1. Check internet connection
2. Verify `VITE_AI_BASE_URL` is correct (should be `/ai-proxy/v1` for dev)
3. Check if 9Router API is up
4. Ensure dev server is running (proxy won't work in production build)

### Issue: "Phản hồi từ AI không hợp lệ"

**Cause:** API response format changed

**Solution:**
1. Log full response: `console.log(data)`
2. Check if response structure matches expected format
3. Update `ai.service.js` to handle new format

### Issue: Chatbot không hiển thị

**Cause:** CSS not imported or z-index conflict

**Solution:**
1. Verify `@import './styles/chatbot.css';` in `index.css`
2. Check if other elements have higher z-index
3. Inspect element in browser DevTools

### Issue: Messages không auto-scroll

**Cause:** Ref not working or container height issue

**Solution:**
1. Check `messagesEndRef` is properly defined
2. Verify `.chatbot-messages` has `overflow-y: auto`
3. Try scrollIntoView with `block: 'end'` option

## Performance Optimization

### 1. Debounce User Input

Prevent too many API calls:

```javascript
import { debounce } from 'lodash';

const debouncedSend = debounce(handleSend, 500);
```

### 2. Lazy Load Chatbot

Only load when needed:

```javascript
import { lazy, Suspense } from 'react';

const Chatbot = lazy(() => import('../components/Chatbot'));

// In layout
<Suspense fallback={<div>Loading...</div>}>
  {chatbotOpen && <Chatbot ... />}
</Suspense>
```

### 3. Cache Responses

Cache common questions:

```javascript
const cache = new Map();

export async function sendChatMessage(messages) {
  const key = JSON.stringify(messages);
  
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const response = await fetch(...);
  cache.set(key, response);
  
  return response;
}
```

## Testing

### Manual Testing Checklist

- [ ] Chatbot toggle button visible and clickable
- [ ] Chat window opens/closes smoothly
- [ ] Welcome message displays on open
- [ ] User can send message
- [ ] AI response appears after loading
- [ ] Loading indicator shows while waiting
- [ ] Error messages display on failure
- [ ] Clear history button works
- [ ] Mobile responsive (full screen)
- [ ] Keyboard shortcuts work (Enter to send)
- [ ] Auto-scroll to latest message

### Test Cases

**Test 1: Basic Conversation**
1. Open chatbot
2. Send "Làm sao để xem hóa đơn?"
3. Verify AI responds with guidance

**Test 2: Role-Based Context**
1. Login as student
2. Open chatbot
3. Verify welcome message mentions student features
4. Logout and login as manager
5. Verify welcome message mentions manager features

**Test 3: Error Handling**
1. Disconnect internet
2. Send message
3. Verify error message displays

**Test 4: Clear History**
1. Send 3 messages
2. Click clear button
3. Verify conversation resets

## API Usage Monitoring

Track usage for cost management:

```javascript
// Add to ai.service.js
let requestCount = 0;
let totalTokens = 0;

export async function sendChatMessage(messages) {
  requestCount++;
  
  const response = await fetch(...);
  const data = await response.json();
  
  totalTokens += data.usage?.total_tokens || 0;
  
  console.log(`📊 API Usage: ${requestCount} requests, ${totalTokens} tokens`);
  
  return data.choices[0].message.content;
}
```

## Support

For issues or questions:
- **Frontend:** Check browser console for errors
- **Backend:** Check server logs for API call failures
- **9Router API:** Contact 9Router support

## License

This integration follows DormHub project license.

---

**Last Updated:** 2026-10-31  
**Version:** 1.0.0  
**Author:** DormHub Development Team
