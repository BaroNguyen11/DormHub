// src/components/ChatbotToggle.jsx
import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function ChatbotToggle({ onClick }) {
  return (
    <div className="fixed bottom-6 right-6 z-9998">
      {/* Ripple effect layers */}
      <motion.div
        className="absolute inset-0 bg-(--color-primary) rounded-lg opacity-0"
        animate={{
          scale: [1, 1.4, 1.8],
          opacity: [0.6, 0.3, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />
      
      <motion.div
        className="absolute inset-0 bg-(--color-primary) rounded-lg opacity-0"
        animate={{
          scale: [1, 1.4, 1.8],
          opacity: [0.6, 0.3, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeOut',
          delay: 0.7,
        }}
      />

      {/* Toggle button */}
      <motion.button
        onClick={onClick}
        whileHover={{ y: -4, scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-14 h-14 rounded-lg border border-(--color-line)
                 bg-(--color-primary) text-white
                 flex items-center justify-center
                 shadow-(--shadow-md)
                 transition-all duration-150
                 hover:bg-primary-hover hover:shadow-(--shadow-lift)
                 active:translate-y-0"
        title="Mở AI Assistant"
      >
        <MessageCircle size={24} />
        
        {/* AI badge */}
        <span className="absolute -top-1.5 -right-1.5 
                       bg-accent text-white
                       text-[10px] font-semibold font-(family-name:--font-family-display) tracking-wide
                       px-1.5 py-0.5 rounded leading-none
                       border-2 border-white shadow-sm">
          AI
        </span>
      </motion.button>
    </div>
  );
}
