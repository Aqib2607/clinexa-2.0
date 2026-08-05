FROM php:8.2-cli-alpine

# Install system dependencies and PHP extensions
RUN apk add --no-cache \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    git \
    oniguruma-dev \
    libzip-dev

RUN docker-php-ext-install pdo pdo_mysql mbstring xml zip bcmath gd

# Copy composer from official image
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy application files
COPY . /app

# Install composer packages
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Permissions
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache && \
    chmod -R 775 /app/storage /app/bootstrap/cache

# Expose port (Render dynamically sets PORT)
ENV PORT=10000
EXPOSE ${PORT}

CMD ["sh", "-c", "php artisan config:cache && php artisan route:cache && php artisan serve --host 0.0.0.0 --port ${PORT:-10000}"]
