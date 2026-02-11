#!/bin/bash

echo "⏳ Attendo il database..."
until php -r "try { new PDO('mysql:host=db;dbname=joomla_db', 'joomla_user', 'joomla_password'); echo 'OK'; } catch (Exception \$e) { exit(1); }" > /dev/null 2>&1; do
  sleep 2
done
echo "✅ Database pronto!"

if [ ! -f /var/www/html/configuration.php ]; then
  echo "🚀 Installazione Joomla in corso..."
  php /var/www/html/installation/joomla.php install \
    --db-host="db" --db-user="joomla_user" --db-pass="joomla_password" \
    --db-name="joomla_db" --db-type="mysqli" \
    --site-name="Joomla-MCP-Dev" \
    --admin-user="admin" --admin-username="admin" --admin-password="admin_password" \
    --admin-email="admin@example.com"
  
  rm -rf /var/www/html/installation
  echo "✅ Joomla installato!"
fi

# FONDAMENTALE: Avvia Apache e resta in ascolto (evita il 502)
exec apache2-foreground