// components/RequireRole.jsx
import { useOutletContext, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function RequireRole({ roles = [], children }) {
  const { user } = useOutletContext() || {};
  const [allowed, setAllowed] = useState(null); // null = loading
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      setAllowed(false);
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    // předpokládáme, že user.roles je pole stringů, uprav podle modelu
    const userRoles = user.roles || [];

    const hasRole = roles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      // Nepovolený přístup - můžeš redirectnout nebo ukázat 403
      navigate("/unauthorized");
    } else {
      setAllowed(true);
    }
  }, [user, roles]);

  if (allowed === null) return <p>Kontroluji oprávnění...</p>;

  if (!allowed) return null; // redirectuje uživatele, takže nic nezobrazíme

  return <>{children}</>;
}
