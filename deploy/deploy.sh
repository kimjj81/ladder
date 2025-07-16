#!/bin/bash

# 사다리타기 게임 배포 스크립트
# Ladder Game Deployment Script

set -e  # Exit on any error

# Configuration
PROJECT_NAME="ladder-game"
BUILD_DIR="dist"
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
WEB_ROOT="/var/www/html"
BACKUP_DIR="/var/backups/nginx"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Check if required commands exist
check_dependencies() {
    log "Checking dependencies..."
    
    local deps=("nginx" "systemctl" "node" "npm")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            error "$dep is not installed. Please install it first."
            exit 1
        fi
    done
    
    success "All dependencies are available"
}

# Install Node.js and npm if not present
install_nodejs() {
    if ! command -v node &> /dev/null; then
        log "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        apt-get install -y nodejs
        success "Node.js installed"
    fi
}

# Build the application
build_application() {
    log "Building application..."
    
    if [[ ! -f "package.json" ]]; then
        error "package.json not found. Make sure you're in the project root directory."
        exit 1
    fi
    
    # Install dependencies
    npm install
    
    # Run build
    npm run build
    
    if [[ ! -d "$BUILD_DIR" ]]; then
        error "Build failed - $BUILD_DIR directory not found"
        exit 1
    fi
    
    success "Application built successfully"
}

# Create web directory and copy files
deploy_files() {
    log "Deploying files to web server..."
    
    # Create web root directory
    mkdir -p "$WEB_ROOT/$PROJECT_NAME"
    
    # Copy built files
    cp -r "$BUILD_DIR"/* "$WEB_ROOT/$PROJECT_NAME/"
    
    # Copy additional files
    if [[ -f "deploy/robots.txt" ]]; then
        cp "deploy/robots.txt" "$WEB_ROOT/$PROJECT_NAME/"
    fi
    
    if [[ -f "deploy/sitemap.xml" ]]; then
        cp "deploy/sitemap.xml" "$WEB_ROOT/$PROJECT_NAME/"
    fi
    
    # Set proper permissions
    chown -R www-data:www-data "$WEB_ROOT/$PROJECT_NAME"
    chmod -R 755 "$WEB_ROOT/$PROJECT_NAME"
    
    success "Files deployed to $WEB_ROOT/$PROJECT_NAME"
}

# Configure Nginx
configure_nginx() {
    log "Configuring Nginx..."
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Backup existing default configuration
    if [[ -f "/etc/nginx/sites-available/default" ]]; then
        cp "/etc/nginx/sites-available/default" "$BACKUP_DIR/default.$(date +%Y%m%d_%H%M%S).bak"
        warning "Existing default configuration backed up"
    fi
    
    # Check if ladder location already exists in default config
    if grep -q "location /ladder/" "/etc/nginx/sites-available/default"; then
        warning "Ladder game location already exists in nginx config"
        return 0
    fi
    
    # Manual configuration required
    warning "⚠️  MANUAL CONFIGURATION REQUIRED ⚠️"
    echo
    echo "The ladder game location blocks need to be manually added to your existing HTTPS server block."
    echo "Please add the following location blocks to your HTTPS server block in /etc/nginx/sites-available/default:"
    echo
    echo "Add these INSIDE the existing HTTPS server block (after the /kibana/ location):"
    echo "----------------------------------------"
    cat deploy/nginx.conf
    echo "----------------------------------------"
    echo
    echo "After adding the location blocks, run: sudo nginx -t && sudo systemctl reload nginx"
    echo
    read -p "Press Enter after you have manually added the configuration..."
    
    success "Manual nginx configuration step completed"
}

# Test and reload Nginx
reload_nginx() {
    log "Testing Nginx configuration..."
    
    if nginx -t; then
        success "Nginx configuration is valid"
        
        log "Reloading Nginx..."
        systemctl reload nginx
        success "Nginx reloaded successfully"
    else
        error "Nginx configuration test failed"
        exit 1
    fi
}

# Enable and start Nginx service
enable_nginx() {
    log "Ensuring Nginx is enabled and running..."
    
    systemctl enable nginx
    systemctl start nginx
    
    if systemctl is-active --quiet nginx; then
        success "Nginx is running"
    else
        error "Failed to start Nginx"
        exit 1
    fi
}

# Setup firewall (optional)
setup_firewall() {
    if command -v ufw &> /dev/null; then
        log "Configuring firewall..."
        
        ufw allow 'Nginx Full'
        ufw --force enable
        
        success "Firewall configured"
    else
        warning "UFW not found, skipping firewall configuration"
    fi
}

# Display deployment information
show_info() {
    echo
    success "🎉 Deployment completed successfully!"
    echo
    echo "📁 Application files: $WEB_ROOT/$PROJECT_NAME"
    echo "⚙️  Nginx config: $NGINX_SITES_AVAILABLE/$PROJECT_NAME"
    echo "🔧 Backup location: $BACKUP_DIR"
    echo
    echo "🌐 Your site should now be available at:"
    echo "   http://your-domain.com"
    echo "   http://$(hostname -I | awk '{print $1}')"
    echo
    echo "📋 Next steps:"
    echo "   1. Update DNS records to point to this server"
    echo "   2. Configure SSL certificate (recommended)"
    echo "   3. Update Google Ads client ID in the HTML file"
    echo "   4. Test the application thoroughly"
    echo
    echo "🔍 Useful commands:"
    echo "   - Check Nginx status: systemctl status nginx"
    echo "   - View Nginx logs: tail -f /var/log/nginx/error.log"
    echo "   - Test configuration: nginx -t"
    echo "   - Reload Nginx: systemctl reload nginx"
}

# Main deployment function
main() {
    log "Starting deployment of $PROJECT_NAME..."
    
    check_root
    check_dependencies
    build_application
    deploy_files
    configure_nginx
    reload_nginx
    enable_nginx
    setup_firewall
    show_info
}

# Handle script arguments
case "${1:-}" in
    "build-only")
        log "Building application only..."
        build_application
        success "Build completed"
        ;;
    "deploy-only")
        log "Deploying pre-built application..."
        check_root
        check_dependencies
        deploy_files
        configure_nginx
        reload_nginx
        enable_nginx
        show_info
        ;;
    "")
        main
        ;;
    *)
        echo "Usage: $0 [build-only|deploy-only]"
        echo
        echo "Options:"
        echo "  build-only   - Only build the application"
        echo "  deploy-only  - Only deploy (assumes build is already done)"
        echo "  (no args)    - Full build and deployment"
        exit 1
        ;;
esac