import { MessageCircle } from "lucide-react";
import { motion } from "motion/react";

export default function ChatbotToggle({ onClick, isOpen }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 isolate">
      {/* Hiệu ứng loang tỏa mượt mà 60fps (Áp dụng công thức keyframe từ TasteNest) */}
      {!isOpen && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0, scale: 1 }}
          animate={{
            opacity: [0, 0.45, 0],
            scale: [1, 1.25, 1.55],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full bg-primary pointer-events-none transform-gpu"
        />
      )}

      {/* Nút Chatbot chính */}
      <motion.button
        type="button"
        onClick={onClick}
        whileTap={{ scale: 0.95 }}
        className="
          relative z-10
          flex h-14 w-14 items-center justify-center
          rounded-full
          border-3 border-line-strong
          bg-primary text-black
          shadow-[3px_3px_0_#141413]
          hover:shadow-[4px_4px_0_#141413]
          active:shadow-none
          transition-all duration-200
          cursor-pointer
          focus-visible:outline-2
          focus-visible:outline-offset-4
          focus-visible:outline-primary
        "
        title="Mở AI Assistant"
        aria-label="Mở AI Assistant"
      >
        <MessageCircle size={25} strokeWidth={2.5} />
      </motion.button>
    </div>
  );
}
