import React, { useState } from 'react';
import { Container, Button, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Umožňuje odkazování v rámci SPA

// Komponenta pro ověření e-mailu
function EmailVerificationPage() {
  // Stavy komponenty:
  // - idle: čeká se na kliknutí
  // - loading: probíhá požadavek
  // - success: ověření proběhlo úspěšně
  // - error: něco se pokazilo
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState(null);

  // Načtení parametrů z URL (např. ?uidb64=abc&token=xyz)
  const searchParams = new URLSearchParams(window.location.search);
  const uidb64 = searchParams.get('uidb64');
  const token = searchParams.get('token');

  // Funkce spuštěná po kliknutí na tlačítko "Verifikovat"
  const handleVerify = async () => {
    // Zkontroluj, zda v URL jsou potřebné parametry
    if (!uidb64 || !token) {
      setErrorMsg('Chybí potřebné parametry v URL.');
      setStatus('error');
      return;
    }

    // Zobrazíme loading stav
    setStatus('loading');
    setErrorMsg(null);

    try {
      // Sestavíme URL pro API volání
      const url = `http://127.0.0.1:8000/api/account/registration/verify-email/${encodeURIComponent(uidb64)}/${encodeURIComponent(token)}`;
      
      // Pošleme GET požadavek na backend
      const response = await fetch(url, { method: 'GET' });

      // Pokud vše proběhlo OK
      if (response.ok) {
        setStatus('success');
      } else {
        // Jinak zobrazíme chybovou zprávu od backendu
        const data = await response.json();
        setErrorMsg(data.detail || 'Ověření selhalo.');
        setStatus('error');
      }
    } catch (err) {
      // Chyba při spojení se serverem
      setErrorMsg('Chyba při spojení se serverem.');
      setStatus('error');
    }
  };

  return (
    <Container className="my-5 p-4 shadow-sm border rounded" style={{ maxWidth: 500 }}>
      <h2 className="mb-4 text-center">Ověření e-mailu</h2>

      {/* Výchozí stav: uživatel může kliknout na tlačítko */}
      {status === 'idle' && (
        <>
          <p className="text-center">Kliknutím ověříš svůj e-mailový účet.</p>
          <div className="d-grid">
            <Button variant="primary" onClick={handleVerify}>
              Verifikovat
            </Button>
          </div>
        </>
      )}

      {/* Stav: načítání – zobrazí spinner */}
      {status === 'loading' && (
        <div className="text-center">
          <Spinner animation="border" role="status" />
          <p className="mt-3">Probíhá ověřování...</p>
        </div>
      )}

      {/* Stav: úspěšné ověření – zobrazí success hlášku a tlačítko na přihlášení */}
      {status === 'success' && (
        <>
          <Alert variant="success" className="text-center">
            E-mail byl úspěšně ověřen!
          </Alert>
          <div className="d-grid mt-3">
            {/* Odkaz na přihlášení – používá react-router */}
            <Button as={Link} to="/" variant="success">
              Přihlásit se
            </Button>
          </div>
        </>
      )}

      {/* Stav: chyba – zobrazí error hlášku a možnost zkusit znovu */}
      {status === 'error' && (
        <>
          <Alert variant="danger" className="text-center">
            Chyba: {errorMsg}
          </Alert>
          <div className="d-grid">
            <Button variant="danger" onClick={handleVerify}>
              Zkusit znovu
            </Button>
          </div>
        </>
      )}
    </Container>
  );
}

export default EmailVerificationPage;
