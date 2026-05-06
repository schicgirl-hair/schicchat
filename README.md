# SchicChat — structure organisée

## Structure

```text
schicchat/
├── index.html
├── style.css
├── script.js
├── config.js
├── sitechat.png
├── favicon.ico
├── favicon-16x16.png
├── favicon-32x32.png
├── apple-touch-icon.png
├── android-chrome-192x192.png
├── android-chrome-512x512.png
├── admin/
│   ├── index.html
│   ├── admin.css
│   └── admin.js
├── apps-script/
│   └── Code.gs
└── .gitignore
```

## Lien public cliente

```text
https://TON-USERNAME.github.io/schicchat/
```

## Lien admin

```text
https://TON-USERNAME.github.io/schicchat/admin/
```

Avant de publier l’admin, ouvre `admin/admin.js` et change :

```js
const LOCAL_PASSWORD = "change-this-password";
```

## Notes

- `config.js` garde tes liens produits et paramètres client.
- `admin.js` garde seulement un mot de passe local.
- `ADMIN_TOKEN` doit rester dans `apps-script/Code.gs` et être tapé dans l’admin.
- Le vrai `Code.gs` doit être collé dans Google Apps Script.
