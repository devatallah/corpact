FROM php:8.4-fpm

# System dependencies
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    libicu-dev \
    libonig-dev \
    unzip \
    git \
    curl \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
    pdo_mysql \
    gd \
    zip \
    bcmath \
    intl \
    mbstring \
    opcache \
    pcntl

# Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# OPcache
RUN echo "opcache.enable=1\nopcache.memory_consumption=128\nopcache.max_accelerated_files=10000\nopcache.validate_timestamps=0" > /usr/local/etc/php/conf.d/opcache.ini

# PHP limits
RUN echo "upload_max_filesize=64M\npost_max_size=64M\nmemory_limit=256M" > /usr/local/etc/php/conf.d/custom.ini

# Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# PHP deps (cached layer)
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Node deps (cached layer)
COPY package.json package-lock.json ./
RUN npm ci

# Copy app
COPY . .

# Post-install scripts
RUN composer dump-autoload --optimize

# Build frontend
RUN npm run build

# Permissions
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Supervisor config
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 9000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
