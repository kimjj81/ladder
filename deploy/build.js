#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const CleanCSS = require('clean-css');

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
    'css/ladder.css'
];

// JS files to minify and combine
const JS_FILES = [
    'js/error-handler.js',
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
    console.log('📦 Minifying JavaScript files...');
    
    const jsContent = JS_FILES.map(file => {
        console.log(`  - Processing ${file}`);
        return `/* ${file} */\n${readFile(file)}`;
    }).join('\n\n');
    
    try {
        const result = await minify(jsContent, {
            compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug']
            },
            mangle: {
                reserved: ['LadderGame', 'StorageManager', 'App', 'UIComponents', 'SavedGamesManager']
            },
            format: {
                comments: false
            }
        });
        
        if (result.error) {
            console.error('JS minification error:', result.error);
            throw result.error;
        }
        
        writeFile(path.join(BUILD_DIR, 'js', 'app.min.js'), result.code);
        
        const originalSize = jsContent.length;
        const minifiedSize = result.code.length;
        const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
        
        console.log(`  ✅ JavaScript minified: ${originalSize} → ${minifiedSize} bytes (${savings}% reduction)`);
        
        return result.code;
    } catch (error) {
        console.error('JavaScript minification failed:', error);
        throw error;
    }
}

function processHTML() {
    console.log('📦 Processing HTML file...');
    
    let htmlContent = readFile('index.html');
    
    // Replace CSS links with minified version
    const cssLinkRegex = /<link rel="stylesheet" href="css\/(main|responsive|ladder)\.css">/g;
    htmlContent = htmlContent.replace(cssLinkRegex, '');
    
    // Add minified CSS link
    const headCloseTag = '</head>';
    const minifiedCSSLink = '    <link rel="stylesheet" href="css/app.min.css">\n';
    htmlContent = htmlContent.replace(headCloseTag, minifiedCSSLink + headCloseTag);
    
    // Replace JS script tags with minified version
    const jsScriptRegex = /<script src="js\/(error-handler|app|ladder-game|storage|ui-components|saved-games-manager)\.js"><\/script>/g;
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