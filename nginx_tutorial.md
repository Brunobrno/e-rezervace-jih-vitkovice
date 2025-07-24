# Tutorial: Nginx jako reverzní proxy pro React dev server

Tento návod popisuje, jak nastavit Nginx tak, aby na portu 80 proxyoval požadavky na React dev server běžící na portu 3000.

---

## 1. Vytvoření konfiguračního souboru

Vytvoř nový soubor `/etc/nginx/sites-available/react` s následujícím obsahem:

```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```


## 2. aktivace konfigurace
```
sudo ln -s /etc/nginx/sites-available/<název> /etc/nginx/sites-enabled/<název>
```

## 3. Test a aktivace konfigurace

```
sudo nginx -t
sudo systemctl reload nginx
```

## (důležité) Zkontrolujte si povolený porty na firewallu!!!