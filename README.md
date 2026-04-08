# TMAG Fintech — Website

A full marketing landing page for TMAG Fintech with PHP backend and SQLite database.

## Project Structure

```
tmag-fintech/
├── index.html          # Main landing page
├── login.html          # Login / auth page
├── css/
│   └── style.css       # Full stylesheet (responsive)
├── js/
│   └── main.js         # Charts, market data, form logic
├── api/
│   └── waitlist.php    # POST endpoint — saves signups to SQLite
├── admin/
│   └── waitlist.php    # Admin panel to view/export signups
└── db/
    └── tmag.db         # Auto-created SQLite database (git-ignored)
```

## Requirements

- PHP 7.4+ with PDO and SQLite3 extensions
- A web server (Apache, Nginx) OR PHP's built-in server for local dev

## Quick Start (Local Dev)

```bash
cd tmag-fintech
php -S localhost:8080
```

Then open: http://localhost:8080

## Deployment

### Apache
Upload all files to your web root (e.g. `public_html/`).
Ensure `mod_rewrite` is enabled.

Add to `.htaccess`:
```apache
Options -Indexes
<Files "*.db">
  Deny from all
</Files>
```

### Nginx
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/tmag-fintech;
    index index.html;

    location /api/ {
        try_files $uri $uri/ =404;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }

    location ~* \.db$ {
        deny all;
    }
}
```

## Admin Panel

Access: `http://yourdomain.com/admin/waitlist.php`

Default password: `tmag_admin_2026`

**Change the password** in `admin/waitlist.php` before deploying:
```php
$ADMIN_PASS = 'your-secure-password-here';
```

You can export all waitlist signups as CSV from the admin panel.

## Waitlist API

**POST** `/api/waitlist.php`

Request body (JSON):
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "retail"
}
```

Response:
```json
{
  "success": true,
  "message": "You're on the list!",
  "position": 42
}
```

## Customisation

- **Brand colors**: Edit `:root` variables in `css/style.css`
- **Market data**: Edit `MARKET_DATA` object in `js/main.js` (connect to real API when ready)
- **Admin password**: Edit `$ADMIN_PASS` in `admin/waitlist.php`
- **Pricing**: Edit the pricing section in `index.html`

## Real Market Data (Future)

Replace the simulated data in `js/main.js` with a real provider:
- [Alpha Vantage](https://www.alphavantage.co/) (free tier available)
- [Twelve Data](https://twelvedata.com/)
- [Polygon.io](https://polygon.io/)

## Security Notes

1. Change the admin password before deploying
2. Block direct access to the `/db/` folder (see `.htaccess` above)
3. Add rate limiting to `/api/waitlist.php` in production
4. Consider adding reCAPTCHA to the waitlist form
