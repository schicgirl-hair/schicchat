# SchicChat Premium System

Inclus :
- Chat client à la racine
- Admin dans `/admin`
- Google Apps Script dans `/apps-script`
- Favicons + image preview
- Collecte Google Sheets
- Dashboard admin
- Export CSV
- Notification email optionnelle
- Messages coach plus humains + CTA premium

À configurer :
1. Ouvre `config.js`.
2. Mets ton `webAppUrl` Apps Script.
3. Vérifie `clientToken`.

Admin :
1. Ouvre `admin/admin.js`.
2. Change `const LOCAL_PASSWORD = "change-this-password";`
3. Sur la page admin, entre ton mot de passe local, Web App URL, et ADMIN_TOKEN.

Apps Script :
1. Colle `apps-script/Code.gs` dans Google Apps Script.
2. Change CLIENT_TOKEN, ADMIN_TOKEN, et ADMIN_EMAIL optionnel.
3. Lance setupSheet().
4. Déploie en Web App : Execute as Me, Access Anyone.
