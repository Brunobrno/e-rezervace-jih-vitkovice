// /components/RequireAuthLayout.jsx
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { getCurrentUser } from "../../api/auth";
import { UserContext } from "../../context/UserContext";

export default function RequireAuthLayout() {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const { user, setUser } = useContext(UserContext);  // <- teď používáme Context

  useEffect(() => {
    const check = async () => {
      try {
        const currentUser = await getCurrentUser();
        console.log(currentUser);
        if (!currentUser) {
          navigate("/login", {
            state: { from: location.pathname },
            replace: true,
          });
          return;
        }
        setUser(currentUser);  // <- nastavíme do kontextu
      } catch {
        navigate("/login", {
          state: { from: location.pathname },
          replace: true,
        });
      } finally {
        setChecking(false);
      }
    };
    check();
  }, [location.pathname, navigate, setUser]);

  if (checking) return <p>🔒 Ověřuji přihlášení...</p>;

  return <Outlet />;  // zachováno pro zpětnou kompatibilitu
}
