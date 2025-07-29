import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

import { useContext } from "react";
import { UserContext } from "../../context/UserContext";

export default function RequireRole({ roles = [] }) {
  const { user } = useContext(UserContext) || {};
  const [allowed, setAllowed] = useState(null); // null = loading
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    const userRoles = Array.isArray(user.role) ? user.role : [user.role];
    const hasRole = roles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      navigate("/unauthorized");
    } else {
      setAllowed(true);
    }
  }, [user, roles, navigate, location.pathname]);

  if (allowed === null) return <p>Kontroluji oprávnění...</p>;

  return allowed ? <Outlet /> : null;
}
