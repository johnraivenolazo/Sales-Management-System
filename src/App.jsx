import { RouterProvider } from "react-router-dom";
import { MotionConfig } from "motion/react";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { UserRightsProvider } from "./contexts/UserRightsContext.jsx";
import { router } from "./router.jsx";

function App() {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <AuthProvider>
        <UserRightsProvider>
          <RouterProvider
            future={{
              v7_startTransition: true,
            }}
            router={router}
          />
        </UserRightsProvider>
      </AuthProvider>
    </MotionConfig>
  );
}

export default App;
