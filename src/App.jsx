import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext.jsx";
import { Toaster } from "sonner";
import { Check, X, AlertTriangle, Info } from "lucide-react";

const badge =
  "size-7 shrink-0 grid place-items-center rounded-sm border-2 border-line-strong shadow-[1.5px_1.5px_0_#141413]";

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster
        position="top-right"
        icons={{
          success: (
            <span className={`${badge} bg-success text-black`}>
              <Check size={16} strokeWidth={3} />
            </span>
          ),
          error: (
            <span className={`${badge} bg-error text-white`}>
              <X size={16} strokeWidth={3} />
            </span>
          ),
          warning: (
            <span className={`${badge} bg-warning text-black`}>
              <AlertTriangle size={16} strokeWidth={3} />
            </span>
          ),
          info: (
            <span className={`${badge} bg-primary text-black`}>
              <Info size={16} strokeWidth={3} />
            </span>
          ),
        }}
        toastOptions={{
          className:
            "border-3 border-line-strong bg-surface rounded-sm p-4 shadow-[4px_4px_0_#141413] font-extrabold text-sm text-text flex items-center [&_[data-icon]]:!mr-4 [&_[data-icon]]:!mb-0 outline-none! transition-all",
        }}
      />
    </AuthProvider>
  );
}