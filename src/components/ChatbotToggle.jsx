
import { MessageCircle } from "lucide-react";
import { motion } from "motion/react";

export default function ChatbotToggle({ onClick }) {
  return (
    <div className="fixed bottom-6 right-6 z-9998 isolate">
      {/* Subtle ripple effects */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 rounded-xl bg-primary/30 pointer-events-none"
        animate={{
          scale: [1, 1.35, 1.7],
          opacity: [0.35, 0.15, 0],
        }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />

      <motion.div
        aria-hidden="true"
        className="absolute inset-0 rounded-xl bg-primary/30 pointer-events-none"
        animate={{
          scale: [1, 1.35, 1.7],
          opacity: [0.35, 0.15, 0],
        }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          ease: "easeOut",
          delay: 1.2,
        }}
      />

      {/* Chatbot button */}
      <motion.button
        type="button"
        onClick={onClick}
        whileHover={{ y: -3, scale: 1.04 }}
        whileTap={{ y: 1, scale: 0.96 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="
          relative z-10
          flex h-14 w-14 items-center justify-center
          rounded-xl
          border-3 border-line-strong
          bg-primary text-black
          shadow-[4px_4px_0_#141413]
          hover:shadow-[6px_6px_0_#141413]
          active:shadow-none
          transition-shadow duration-200
          cursor-pointer
          focus-visible:outline-2
          focus-visible:outline-offset-4
          focus-visible:outline-primary
        "
        title="Mở AI Assistant"
        aria-label="Mở AI Assistant"
      >
        <MessageCircle
          size={25}
          strokeWidth={2.5}
        />

        {/* AI Badge */}
        <span
          className="
            absolute -top-2 -right-2
            flex items-center justify-center
            min-w-7 h-6 px-1.5
            rounded-md
            border-2 border-line-strong
            bg-accent text-black
            text-[10px] font-black tracking-wide
            shadow-[2px_2px_0_#141413]
          "
        >
          AI
        </span>
      </motion.button>
    </div>
  );
}