#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

// Test configuration
const TEST_PORT = 8081;
const BUILD_DIR = 'dist';
const TIMEOUT = 5000;

// Colors for output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'blue') {
    console.log(`${colors[color]}[TEST]${colors.reset} ${message}`);
}

function success(message) {
    console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function error(message) {
    console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function warning(message) {
    console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

// Test functions
async function testBuildOutput() {
    log('Testing build output...');
    
    const tests = [
        { file: 'dist/index.html', description: 'HTML file exists' },
        { file: 'dist/css/app.min.css', description: 'Minified CSS exists' },
        { file: 'dist/js/app.min.js', description: 'Minified JS exists' },
        { file: 'dist/manifest.json', description: 'Web app manifest exists' }
    ];
    
    let passed = 0;
    
    for (const test of tests) {
        if (fs.existsSync(test.file)) {
            success(test.description);
            passed++;
        } else {
            error(test.description);
        }
    }
    
    return passed === tests.length;
}

async function testFileMinification() {
    log('Testing file minification...');
    
    const tests = [
        {
            original: ['css/main.css', 'css/responsive.css', 'css/ladder.css'],
            minified: 'dist/css/app.min.css',
            type: 'CSS'
        },
        {
            original: ['js/error-handler.js', 'js/storage.js', 'js/ui-components.js', 'js/app.js', 'js/ladder-game.js', 'js/saved-games-manager.js'],
            minified: 'dist/js/app.min.js',
            type: 'JavaScript'
        }
    ];
    
    let passed = 0;
    
    for (const test of tests) {
        const originalSize = test.original.reduce((total, file) => {
            if (fs.existsSync(file)) {
                return total + fs.statSync(file).size;
            }
            return total;
        }, 0);
        
        if (fs.existsSync(test.minified)) {
            const minifiedSize = fs.statSync(test.minified).size;
            const reduction = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
            
            if (minifiedSize < originalSize) {
                success(`${test.type} minified: ${originalSize} → ${minifiedSize} bytes (${reduction}% reduction)`);
                passed++;
            } else {
                error(`${test.type} not properly minified`);
            }
        } else {
            error(`${test.type} minified file not found`);
        }
    }
    
    return passed === tests.length;
}

async function testHTMLOptimization() {
    log('Testing HTML optimization...');
    
    if (!fs.existsSync('dist/index.html')) {
        error('HTML file not found');
        return false;
    }
    
    const htmlContent = fs.readFileSync('dist/index.html', 'utf8');
    const tests = [
        {
            test: () => htmlContent.includes('css/app.min.css'),
            description: 'HTML references minified CSS'
        },
        {
            test: () => htmlContent.includes('js/app.min.js'),
            description: 'HTML references minified JS'
        },
        {
            test: () => !htmlContent.includes('test-slot-editing-enhanced.js'),
            description: 'Test scripts removed from production HTML'
        },
        {
            test: () => htmlContent.includes('rel="preconnect"'),
            description: 'Performance optimizations added'
        },
        {
            test: () => htmlContent.includes('dns-prefetch'),
            description: 'DNS prefetch optimizations added'
        }
    ];
    
    let passed = 0;
    
    for (const test of tests) {
        if (test.test()) {
            success(test.description);
            passed++;
        } else {
            error(test.description);
        }
    }
    
    return passed === tests.length;
}

async function testStaticFileServing() {
    log('Testing static file serving...');
    
    return new Promise((resolve) => {
        // Start a simple HTTP server
        const server = http.createServer((req, res) => {
            const filePath = path.join(BUILD_DIR, req.url === '/' ? 'index.html' : req.url);
            
            if (fs.existsSync(filePath)) {
                const ext = path.extname(filePath);
                const contentTypes = {
                    '.html': 'text/html',
                    '.css': 'text/css',
                    '.js': 'application/javascript',
                    '.json': 'application/json'
                };
                
                const contentType = contentTypes[ext] || 'text/plain';
                const content = fs.readFileSync(filePath);
                
                // Simulate caching headers
                if (ext === '.css' || ext === '.js') {
                    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
                } else if (ext === '.html') {
                    res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
                }
                
                res.setHeader('Content-Type', contentType);
                res.writeHead(200);
                res.end(content);
            } else {
                res.writeHead(404);
                res.end('Not Found');
            }
        });
        
        server.listen(TEST_PORT, async () => {
            log(`Test server started on port ${TEST_PORT}`);
            
            const testUrls = [
                { url: '/', expectedStatus: 200, description: 'Root page serves correctly' },
                { url: '/css/app.min.css', expectedStatus: 200, description: 'CSS file serves correctly' },
                { url: '/js/app.min.js', expectedStatus: 200, description: 'JS file serves correctly' },
                { url: '/manifest.json', expectedStatus: 200, description: 'Manifest serves correctly' },
                { url: '/nonexistent.html', expectedStatus: 404, description: '404 for missing files' }
            ];
            
            let passed = 0;
            
            for (const test of testUrls) {
                try {
                    const response = await fetch(`http://localhost:${TEST_PORT}${test.url}`);
                    if (response.status === test.expectedStatus) {
                        success(test.description);
                        passed++;
                    } else {
                        error(`${test.description} (got ${response.status}, expected ${test.expectedStatus})`);
                    }
                } catch (err) {
                    error(`${test.description} (${err.message})`);
                }
            }
            
            server.close();
            resolve(passed === testUrls.length);
        });
    });
}

async function testNginxConfiguration() {
    log('Testing Nginx configuration...');
    
    if (!fs.existsSync('build/nginx.conf')) {
        error('Nginx configuration file not found');
        return false;
    }
    
    const nginxConfig = fs.readFileSync('build/nginx.conf', 'utf8');
    const tests = [
        {
            test: () => nginxConfig.includes('gzip on'),
            description: 'Gzip compression enabled'
        },
        {
            test: () => nginxConfig.includes('expires 1y'),
            description: 'Long-term caching for static assets'
        },
        {
            test: () => nginxConfig.includes('X-Frame-Options'),
            description: 'Security headers configured'
        },
        {
            test: () => nginxConfig.includes('Content-Security-Policy'),
            description: 'CSP header configured for Google Ads'
        },
        {
            test: () => nginxConfig.includes('pagead2.googlesyndication.com'),
            description: 'Google Ads domains whitelisted'
        }
    ];
    
    let passed = 0;
    
    for (const test of tests) {
        if (test.test()) {
            success(test.description);
            passed++;
        } else {
            error(test.description);
        }
    }
    
    return passed === tests.length;
}

async function testDeploymentFiles() {
    log('Testing deployment files...');
    
    const files = [
        { file: 'build/deploy.sh', description: 'Deployment script exists' },
        { file: 'build/nginx.conf', description: 'Nginx configuration exists' },
        { file: 'build/robots.txt', description: 'Robots.txt exists' },
        { file: 'build/sitemap.xml', description: 'Sitemap exists' },
        { file: 'DEPLOYMENT.md', description: 'Deployment documentation exists' }
    ];
    
    let passed = 0;
    
    for (const file of files) {
        if (fs.existsSync(file.file)) {
            success(file.description);
            passed++;
            
            // Check if deploy.sh is executable
            if (file.file === 'build/deploy.sh') {
                const stats = fs.statSync(file.file);
                if (stats.mode & parseInt('111', 8)) {
                    success('Deploy script is executable');
                } else {
                    warning('Deploy script may not be executable');
                }
            }
        } else {
            error(file.description);
        }
    }
    
    return passed === files.length;
}

// Polyfill for fetch if not available
async function fetch(url) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname,
            method: 'GET'
        };
        
        const req = http.request(options, (res) => {
            resolve({
                status: res.statusCode,
                headers: res.headers
            });
        });
        
        req.on('error', reject);
        req.setTimeout(TIMEOUT, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        
        req.end();
    });
}

// Main test runner
async function runTests() {
    console.log('🧪 Running deployment tests...\n');
    
    const tests = [
        { name: 'Build Output', fn: testBuildOutput },
        { name: 'File Minification', fn: testFileMinification },
        { name: 'HTML Optimization', fn: testHTMLOptimization },
        { name: 'Static File Serving', fn: testStaticFileServing },
        { name: 'Nginx Configuration', fn: testNginxConfiguration },
        { name: 'Deployment Files', fn: testDeploymentFiles }
    ];
    
    let totalPassed = 0;
    let totalTests = tests.length;
    
    for (const test of tests) {
        console.log(`\n📋 Running ${test.name} tests...`);
        try {
            const passed = await test.fn();
            if (passed) {
                totalPassed++;
                success(`${test.name} tests passed`);
            } else {
                error(`${test.name} tests failed`);
            }
        } catch (err) {
            error(`${test.name} tests failed: ${err.message}`);
        }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`📊 Test Results: ${totalPassed}/${totalTests} test suites passed`);
    
    if (totalPassed === totalTests) {
        success('🎉 All deployment tests passed! Ready for production.');
        return true;
    } else {
        error('❌ Some tests failed. Please fix the issues before deploying.');
        return false;
    }
}

// Run tests if called directly
if (require.main === module) {
    runTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = { runTests };