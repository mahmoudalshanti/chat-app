import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import { useAuthContext } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

function App() {
  const { authUser, isLoading } = useAuthContext();
  if (isLoading) return null;
  return (
    <div className="p-4 h-screen flex items-center justify-center">
      <Routes>
        <Route
          path="/"
          element={authUser?.fullName ? <Home /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/signup"
          element={!authUser?.fullName ? <SignUp /> : <Navigate to={"/"} />}
        />
        <Route
          path="/login"
          element={!authUser?.fullName ? <Login /> : <Navigate to={"/"} />}
        />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
