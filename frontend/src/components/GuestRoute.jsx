import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoaderIcon } from "./Icons";

export default function GuestRoute({ children }) {
  const { isAuthenticated, isChecking } = useAuth();

  if (isChecking) {
    return (
      <div className="route-loading">
        <LoaderIcon width={24} height={24} />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return children;
}
