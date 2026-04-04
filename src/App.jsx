import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { UserRightsProvider } from "./contexts/UserRightsContext.jsx";
import { router } from "./router.jsx";

function App() {
  return (
    <AuthProvider>
      <UserRightsProvider>
        <RouterProvider router={router} />
      </UserRightsProvider>
    </AuthProvider>
  );
}

export default App;
