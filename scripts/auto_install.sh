#!/bin/bash

echo "🚀 Avvio script di inizializzazione Joomla..."

# Funzione per attendere il Database
wait_for_db() {
    echo "⏳ In attesa che il database ($JOOMLA_DB_HOST) sia pronto..."
    
    # Loop infinito finché la connessione non ha successo
    until php -r "try { new PDO('mysql:host=$JOOMLA_DB_HOST', '$JOOMLA_DB_USER', '$JOOMLA_DB_PASSWORD'); echo 'OK'; } catch (PDOException \$e) { exit(1); }" > /dev/null 2>&1; do
        echo "   ... DB non ancora raggiungibile, riprovo tra 3 secondi."
        sleep 3
    done
    echo "✅ Database connesso!"
}

# 1. Aspetta il DB
wait_for_db

# 2. Controlla se Joomla è già installato
if [ -f "/var/www/html/configuration.php" ]; then
    echo "✅ Joomla è già installato. Avvio Apache."
else
    echo "⚙️  Joomla non trovato. Inizio installazione..."

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

    # Rimuove la cartella di installazione
    if [ -d "/var/www/html/installation" ]; then
        echo "🗑️ Rimozione cartella installation..."
        rm -rf /var/www/html/installation
    fi
fi

# 3. Avvia Apache
exec apache2-foreground
