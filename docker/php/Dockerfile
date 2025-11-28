FROM php:8.2-fpm-alpine

# Install required extensions
RUN apk add --no-cache \
    curl \
    && docker-php-ext-install \
    opcache

# Configure PHP for production
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Set working directory
WORKDIR /srv/nginx/pages

# Expose PHP-FPM port
EXPOSE 9000

CMD ["php-fpm"]

