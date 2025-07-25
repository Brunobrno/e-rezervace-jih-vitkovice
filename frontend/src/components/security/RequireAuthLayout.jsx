// components/RequireAuthLayout.jsx
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../../api/auth";

export default function RequireAuthLayout() {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const check = async () => {
      try {
        const currentUser = await getCurrentUser();
        console.log(currentUser);
        if (!currentUser) {
          navigate("/login", { state: { from: location.pathname }, replace: true });
          return;
        }
        setUser(currentUser);
      } catch {
        navigate("/login", { state: { from: location.pathname }, replace: true });
      } finally {
        setChecking(false);
      }
    };
    check();
  }, [location.pathname, navigate]);

  if (checking) return <p>🔒 Ověřuji přihlášení...</p>;

  return <Outlet context={{ user }} />;
}
