import { useState } from 'react';
import Workspace from '../components/Workspace';
import Chatbot from '../components/Chatbot';
import ChatbotToggle from '../components/ChatbotToggle';

export default function StudentLayout({ title, children }) {
  const [chatbotOpen, setChatbotOpen] = useState(false);
  
  return (
    <>
      <Workspace group="student" title={title}>
        {children}
      </Workspace>
      
      {/* AI Chatbot */}
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
