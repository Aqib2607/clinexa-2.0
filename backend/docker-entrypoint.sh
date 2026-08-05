#!/bin/sh
set -e

# Automatically run database migrations if database connection is available
php artisan migrate --force || true

# Automatically seed essential database tables (departments, settings, etc.)
php artisan db:seed --force || true

# Cache configuration & routes in production if APP_KEY is present
if [ -n "$APP_KEY" ]; then
    php artisan config:cache || true
    php artisan route:cache || true
fi

exec "$@"


