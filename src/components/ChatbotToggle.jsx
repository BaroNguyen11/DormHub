
// import { MessageCircle } from "lucide-react";
// import { motion } from "motion/react";

// export default function ChatbotToggle({ onClick }) {
//   return (
//     <div className="fixed bottom-6 right-6 z-9998 isolate">
//       {/* Subtle ripple effects */}
//       <motion.div
//         aria-hidden="true"
//         className="absolute inset-0 rounded-xl bg-primary/30 pointer-events-none"
//         animate={{
//           scale: [1, 1.35, 1.7],
//           opacity: [0.35, 0.15, 0],
//         }}
//         transition={{
//           duration: 2.4,
//           repeat: Infinity,
//           ease: "easeOut",
//         }}
//       />

//       <motion.div
//         aria-hidden="true"
//         className="absolute inset-0 rounded-xl bg-primary/30 pointer-events-none"
//         animate={{
//           scale: [1, 1.35, 1.7],
//           opacity: [0.35, 0.15, 0],
//         }}
//         transition={{
//           duration: 2.4,
//           repeat: Infinity,
//           ease: "easeOut",
//           delay: 1.2,
//         }}
//       />

//       {/* Chatbot button */}
//       <motion.button
//         type="button"
//         onClick={onClick}
//         transition={{ duration: 0.18, ease: "easeOut" }}
//         className="
//           relative z-10
//           flex h-14 w-14 items-center justify-center
//           rounded-xl
//           border-3 border-line-strong
//           bg-primary text-black
//           shadow-[2px_2px_0_#141413]
//           hover:shadow-[4px_4px_0_#141413]
//           active:shadow-none
//           transition-all duration-200
//           cursor-pointer
//           focus-visible:outline-2
//           focus-visible:outline-offset-4
//           focus-visible:outline-primary
//           hover:-translate-0.5
//           active:translate-0.5
       
//         "
//         title="Mở AI Assistant"
//         aria-label="Mở AI Assistant"
//       >
//         <MessageCircle
//           size={25}
//           strokeWidth={2.5}
//         />

//       </motion.button>
//     </div>
//   );
// }
import { MessageCircle } from "lucide-react";
import { motion } from "motion/react";

export default function ChatbotToggle({ onClick, isOpen }) {
  return (
    <div className="fixed bottom-6 right-6 z-9998 isolate">
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
          className="absolute inset-0 rounded-xl bg-primary pointer-events-none transform-gpu"
        />
      )}

      {/* Nút Chatbot chính */}
      <motion.button
        type="button"
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="
          relative z-10
          flex h-14 w-14 items-center justify-center
          rounded-xl
          border-3 border-line-strong
          bg-primary text-black
          shadow-[2px_2px_0_#141413]
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