import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import Screen from "../components/Screen";
import AuthScreen from "../components/AuthScreen";
import { screens } from "../constants/screenConfig";
import { ROLES } from "../constants/roles";
import { pageMap } from "./pageMap";
import NotFound from "../pages/Guest/NotFound";
import ProtectRoute from "./ProtectRoute";
import AuthRoute from "./AuthRoute";

const pageModules = import.meta.glob("../pages/**/*.jsx", { eager: true });

function pageFor(path, config) {
  const Page = pageModules[pageMap[path]]?.default;
  return Page ? <Page /> : config ? <Screen config={config} /> : <NotFound />;
}

function AnimatedRoutes({ children }) {
  const location = useLocation();

  return (
    // <AnimatePresence mode="wait">
    //   <motion.div
    //     key={location.pathname}
    //     initial={{ opacity: 0, y: 20 }}
    //     animate={{ opacity: 1, y: 0 }}
    //     exit={{ opacity: 0, y: -20 }}
    //     transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    //   >
    //     {children}
    //   </motion.div>
    // </AnimatePresence>
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthRoute />}>
          {[
            ["/login", "login"],
            ["/verify-email", "verifyEmail"],
            ["/forgot-password", "forgot"],
            ["/reset-password", "reset"],
          ].map(([path, type]) => (
            <Route
              key={path}
              path={path}
              element={
                pageMap[path] ? pageFor(path) : <AuthScreen type={type} />
              }
            />
          ))}
        </Route>

        {/* Các đường dẫn cũ được chuyển hướng; không còn đăng ký công khai. */}
        <Route
          path="/register"
          element={<Navigate to="/verify-email" replace />}
        />
        <Route
          path="/verify-otp"
          element={<Navigate to="/verify-email" replace />}
        />

        {Object.entries(screens)
          .filter(([, config]) => config.group === "guest")
          .map(([path, config]) => (
            <Route key={path} path={path} element={pageFor(path, config)} />
          ))}

        {[
          ["student", ROLES.STUDENT],
          ["manager", ROLES.MANAGER],
        ].map(([group, role]) => (
          <Route key={group} element={<ProtectRoute role={role} />}>
            {Object.entries(screens)
              .filter(([, config]) => config.group === group)
              .map(([path, config]) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <AnimatedRoutes>{pageFor(path, config)}</AnimatedRoutes>
                  }
                />
              ))}
          </Route>
        ))}

        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
