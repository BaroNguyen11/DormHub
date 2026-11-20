import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import Workspace from "./Workspace";

function AnimatedOutlet() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}

export default function PersistentLayout({ group, title }) {
  return <Workspace group={group} title={title}><AnimatedOutlet /></Workspace>;
}