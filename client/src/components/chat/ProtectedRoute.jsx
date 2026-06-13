import { Navigate } from "react-router-dom";


const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  console.log("TOKEN:", token);

  return token ? children : <Navigate to="/signup" replace />;
};

export default ProtectedRoute;
