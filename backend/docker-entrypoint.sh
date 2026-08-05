#!/bin/sh
set -e

# Run database migrations
php artisan migrate --force || true

# Seed the database ONLY on first boot (when departments table is empty).
# This prevents re-seeding on every container restart / redeploy.
DEPT_COUNT=$(php artisan tinker --no-interaction --execute="echo \App\Models\Department::count();" 2>/dev/null | tail -1)
if [ -z "$DEPT_COUNT" ] || [ "$DEPT_COUNT" = "0" ]; then
    echo ">>> First boot detected — seeding database..."
    php artisan db:seed --force || true
else
    echo ">>> Database already seeded ($DEPT_COUNT departments) — skipping seed."
fi

# Cache configuration & routes in production if APP_KEY is present
if [ -n "$APP_KEY" ]; then
    php artisan config:cache || true
    php artisan route:cache || true
fi

exec "$@"


