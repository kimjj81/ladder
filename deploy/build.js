#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const CleanCSS = require('clean-css');
const babel = require('@babel/core');

// Build configuration
const BUILD_DIR = 'dist';
const SOURCE_DIR = '.';

// File patterns to copy as-is
const COPY_PATTERNS = [
    'index.html',
    'package.json',
    'README.md'
];

// CSS files to minify and combine
const CSS_FILES = [
    'css/main.css',
    'css/responsive.css',
    'css/ladder.css',
    'css/simple-ladder.css'
];

// JS files to minify and combine
const JS_FILES = [
    'js/language-manager.js',
    'js/error-handler.js',
    'js/simple-ladder-game.js',
    'js/compact-ladder-component.js',
    'js/storage.js',
    'js/ui-components.js',
    'js/app.js',
    'js/ladder-game.js',
    'js/saved-games-manager.js'
];

// Utility functions
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function readFile(filePath) {
    return fs.readFileSync(filePath, 'utf8');
}

function writeFile(filePath, content) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, content);
}

function copyFile(src, dest) {
    ensureDir(path.dirname(dest));
    fs.copyFileSync(src, dest);
}

// Build functions
async function minifyCSS() {
    console.log('📦 Minifying CSS files...');
    
    const cssContent = CSS_FILES.map(file => {
        console.log(`  - Processing ${file}`);
        return `/* ${file} */\n${readFile(file)}`;
    }).join('\n\n');
    
    const cleanCSS = new CleanCSS({
        level: 2,
        returnPromise: true
    });
    
    try {
        const result = await cleanCSS.minify(cssContent);
        
        if (result.errors.length > 0) {
            console.error('CSS minification errors:', result.errors);
            throw new Error('CSS minification failed');
        }
        
        writeFile(path.join(BUILD_DIR, 'css', 'app.min.css'), result.styles);
        
        const originalSize = cssContent.length;
        const minifiedSize = result.styles.length;
        const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
        
        console.log(`  ✅ CSS minified: ${originalSize} → ${minifiedSize} bytes (${savings}% reduction)`);
        
        return result.styles;
    } catch (error) {
        console.error('CSS minification failed:', error);
        throw error;
    }
}

async function minifyJS() {
    console.log('📦 Processing JavaScript files with Babel and minification...');
    
    const jsContent = JS_FILES.map(file => {
        console.log(`  - Processing ${file}`);
        return `/* ${file} */\n${readFile(file)}`;
    }).join('\n\n');
    
    try {
        // Add polyfills at the beginning
        const polyfillContent = `
// Core polyfills for older browsers
if (!Array.prototype.includes) {
    Array.prototype.includes = function(searchElement) {
        return this.indexOf(searchElement) !== -1;
    };
}

if (!Array.prototype.find) {
    Array.prototype.find = function(predicate) {
        for (var i = 0; i < this.length; i++) {
            if (predicate(this[i], i, this)) return this[i];
        }
        return undefined;
    };
}

if (!Array.from) {
    Array.from = function(arrayLike) {
        var result = [];
        for (var i = 0; i < arrayLike.length; i++) {
            result.push(arrayLike[i]);
        }
        return result;
    };
}

if (!Object.assign) {
    Object.assign = function(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];
            for (var key in source) {
                if (source.hasOwnProperty(key)) {
                    target[key] = source[key];
                }
            }
        }
        return target;
    };
}

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position) {
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
    };
}

// Promise polyfill for IE
if (typeof Promise === 'undefined') {
    window.Promise = function(executor) {
        var self = this;
        this.state = 'pending';
        this.value = undefined;
        this.handlers = [];
        
        function resolve(result) {
            if (self.state === 'pending') {
                self.state = 'resolved';
                self.value = result;
                self.handlers.forEach(handle);
            }
        }
        
        function reject(error) {
            if (self.state === 'pending') {
                self.state = 'rejected';
                self.value = error;
                self.handlers.forEach(handle);
            }
        }
        
        function handle(handler) {
            if (self.state === 'pending') {
                self.handlers.push(handler);
            } else {
                if (self.state === 'resolved' && typeof handler.onResolved === 'function') {
                    handler.onResolved(self.value);
                }
                if (self.state === 'rejected' && typeof handler.onRejected === 'function') {
                    handler.onRejected(self.value);
                }
            }
        }
        
        this.then = function(onResolved, onRejected) {
            return new Promise(function(resolve, reject) {
                handle({
                    onResolved: function(result) {
                        try {
                            resolve(onResolved ? onResolved(result) : result);
                        } catch (ex) {
                            reject(ex);
                        }
                    },
                    onRejected: function(error) {
                        try {
                            resolve(onRejected ? onRejected(error) : error);
                        } catch (ex) {
                            reject(ex);
                        }
                    }
                });
            });
        };
        
        try {
            executor(resolve, reject);
        } catch (ex) {
            reject(ex);
        }
    };
}

`;

        const fullJsContent = polyfillContent + jsContent;
        
        // First, transform ES6+ to ES5 using Babel
        console.log('  - Transforming ES6+ to ES5 with Babel...');
        const babelResult = await babel.transformAsync(fullJsContent, {
            presets: [
                ['@babel/preset-env', {
                    targets: {
                        ie: '11',
                        chrome: '60',
                        firefox: '55',
                        safari: '10.1'
                    },
                    useBuiltIns: false,
                    modules: false
                }]
            ],
            compact: false
        });
        
        if (!babelResult || !babelResult.code) {
            throw new Error('Babel transformation failed');
        }
        
        console.log('  ✅ ES6+ to ES5 transformation completed');
        
        // Then minify the ES5 code
        console.log('  - Minifying transformed code...');
        const result = await minify(babelResult.code, {
            compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug'],
                ecma: 5
            },
            mangle: {
                reserved: ['LadderGame', 'StorageManager', 'App', 'UIComponents', 'SavedGamesManager']
            },
            format: {
                comments: false
            },
            ecma: 5  // Ensure ES5 output
        });
        
        if (result.error) {
            console.error('JS minification error:', result.error);
            throw result.error;
        }
        
        writeFile(path.join(BUILD_DIR, 'js', 'app.min.js'), result.code);
        
        const originalSize = jsContent.length;
        const transformedSize = babelResult.code.length;
        const minifiedSize = result.code.length;
        const babelSavings = ((originalSize - transformedSize) / originalSize * 100).toFixed(1);
        const minifySavings = ((transformedSize - minifiedSize) / transformedSize * 100).toFixed(1);
        const totalSavings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
        
        console.log(`  ✅ JavaScript processed:`);
        console.log(`     Original: ${originalSize} bytes`);
        console.log(`     After Babel: ${transformedSize} bytes (${babelSavings}% change)`);
        console.log(`     After minify: ${minifiedSize} bytes (${minifySavings}% reduction)`);
        console.log(`     Total reduction: ${totalSavings}%`);
        
        return result.code;
    } catch (error) {
        console.error('JavaScript processing failed:', error);
        throw error;
    }
}

function processHTML() {
    console.log('📦 Processing HTML file...');
    
    let htmlContent = readFile('index.html');
    
    // Replace CSS links with minified version
    const cssLinkRegex = /<link rel="stylesheet" href="css\/(main|responsive|ladder|simple-ladder)\.css">/g;
    htmlContent = htmlContent.replace(cssLinkRegex, '');
    
    // Add minified CSS link
    const headCloseTag = '</head>';
    const minifiedCSSLink = '    <link rel="stylesheet" href="css/app.min.css">\n';
    htmlContent = htmlContent.replace(headCloseTag, minifiedCSSLink + headCloseTag);
    
    // Replace JS script tags with minified version
    const jsScriptRegex = /<script src="js\/(language-manager|error-handler|simple-ladder-game|compact-ladder-component|app|ladder-game|storage|ui-components|saved-games-manager)\.js"><\/script>/g;
    htmlContent = htmlContent.replace(jsScriptRegex, '');
    
    // Remove test script
    const testScriptRegex = /\s*<!-- Test Script \(remove in production\) -->\s*<script src="test-slot-editing-enhanced\.js"><\/script>/g;
    htmlContent = htmlContent.replace(testScriptRegex, '');
    
    // Add minified JS script
    const bodyCloseTag = '</body>';
    const minifiedJSScript = '    <script src="js/app.min.js"></script>\n';
    htmlContent = htmlContent.replace(bodyCloseTag, minifiedJSScript + bodyCloseTag);
    
    // Add cache busting and performance optimizations
    const metaViewport = htmlContent.match(/<meta name="viewport"[^>]*>/);
    if (metaViewport) {
        const optimizedMeta = `    <!-- Performance optimizations -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://www.google.com https://www.gstatic.com https://securepubads.g.doubleclick.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: http:; connect-src 'self' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://ep1.adtrafficquality.google https://securepubads.g.doubleclick.net; frame-src https://googleads.g.doubleclick.net https://www.google.com https://tpc.googlesyndication.com; fenced-frame-src https://googleads.g.doubleclick.net https://www.google.com;">
    <link rel="preconnect" href="https://pagead2.googlesyndication.com">
    <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com">`;
        
        htmlContent = htmlContent.replace(metaViewport[0], optimizedMeta);
    }
    
    writeFile(path.join(BUILD_DIR, 'index.html'), htmlContent);
    console.log('  ✅ HTML processed and optimized');
}

function copyAssets() {
    console.log('📦 Copying additional assets...');
    
    // Copy any additional files that might exist
    const additionalFiles = [
        'favicon.ico',
        'robots.txt',
        'sitemap.xml',
        'manifest.json'
    ];
    
    additionalFiles.forEach(file => {
        if (fs.existsSync(file)) {
            copyFile(file, path.join(BUILD_DIR, file));
            console.log(`  ✅ Copied ${file}`);
        }
    });
}

function generateManifest() {
    console.log('📦 Generating web app manifest...');
    
    const manifest = {
        name: "사다리타기 게임",
        short_name: "사다리타기",
        description: "랜덤 선택을 위한 재미있는 웹 게임",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#4CAF50",
        icons: [
            {
                src: "/icon-192.png",
                sizes: "192x192",
                type: "image/png"
            },
            {
                src: "/icon-512.png",
                sizes: "512x512",
                type: "image/png"
            }
        ]
    };
    
    writeFile(path.join(BUILD_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
    console.log('  ✅ Web app manifest generated');
}

// Main build function
async function build() {
    console.log('🚀 Starting build process...\n');
    
    try {
        // Clean build directory
        console.log('🧹 Cleaning build directory...');
        if (fs.existsSync(BUILD_DIR)) {
            fs.rmSync(BUILD_DIR, { recursive: true });
        }
        ensureDir(BUILD_DIR);
        console.log('  ✅ Build directory cleaned\n');
        
        // Minify assets
        await minifyCSS();
        await minifyJS();
        
        // Process HTML
        processHTML();
        
        // Copy additional assets
        copyAssets();
        
        // Generate manifest
        generateManifest();
        
        console.log('\n🎉 Build completed successfully!');
        console.log(`📁 Output directory: ${BUILD_DIR}`);
        
        // Show build statistics
        const distSize = getDirSize(BUILD_DIR);
        const sourceSize = getDirSize('css') + getDirSize('js') + fs.statSync('index.html').size;
        const savings = ((sourceSize - distSize) / sourceSize * 100).toFixed(1);
        
        console.log(`📊 Build statistics:`);
        console.log(`   Source size: ${formatBytes(sourceSize)}`);
        console.log(`   Built size: ${formatBytes(distSize)}`);
        console.log(`   Size reduction: ${savings}%`);
        
    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
}

// Utility functions for file size calculation
function getDirSize(dirPath) {
    if (!fs.existsSync(dirPath)) return 0;
    
    let size = 0;
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const file of files) {
        const filePath = path.join(dirPath, file.name);
        if (file.isDirectory()) {
            size += getDirSize(filePath);
        } else {
            size += fs.statSync(filePath).size;
        }
    }
    
    return size;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Run build if called directly
if (require.main === module) {
    build();
}

module.exports = { build };