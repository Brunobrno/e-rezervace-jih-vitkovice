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
        if (!currentUser) {
          navigate("/login", { state: { from: location.pathname } });
          return;
        }
        setUser(currentUser);
        setChecking(false);
      } catch {
        navigate("/login", { state: { from: location.pathname } });
      }
    };
    check();
  }, [location.pathname]);

  if (checking) return <p>🔒 Ověřuji přihlášení...</p>;

  // Předáme user do children přes context nebo props outlet
  return <Outlet context={{ user }} />;
}
