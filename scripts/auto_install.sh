#!/bin/bash

# Aspetta qualche secondo che il DB sia pronto (metodo grezzo ma efficace)
echo "⏳ Attendo che il Database si inizializzi..."
sleep 15

# Controlla se Joomla è già installato (se esiste configuration.php)
if [ -f "/var/www/html/configuration.php" ]; then
    echo "✅ Joomla è già installato. Avvio Apache."
else
    echo "🚀 Inizio installazione automatica di Joomla..."

    # Esegue l'installazione via CLI
    php /var/www/html/installation/joomla.php install \
        --db-type "mysql" \
        --db-host "$JOOMLA_DB_HOST" \
        --db-user "$JOOMLA_DB_USER" \
        --db-pass "$JOOMLA_DB_PASSWORD" \
        --db-name "$JOOMLA_DB_NAME" \
        --site-name "Joomla MCP Dev" \
        --admin-user "SuperAdmin" \
        --admin-username "admin" \
        --admin-password "admin" \
        --admin-email "admin@example.com"

    echo "✅ Installazione completata!"

    # Rimuove la cartella di installazione (obbligatorio per sicurezza in Joomla)
    if [ -d "/var/www/html/installation" ]; then
        echo "🗑️ Rimozione cartella installation..."
        rm -rf /var/www/html/installation
    fi
fi

# Avvia il processo principale di Apache (comando standard dell'immagine Joomla)
exec apache2-foreground
