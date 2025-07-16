#!/usr/bin/env node

/**
 * Validation script for error handling implementation
 * Checks that all required error handling features are properly implemented
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Validating Error Handling Implementation...\n');

const validationResults = {
    passed: 0,
    failed: 0,
    warnings: 0
};

function validateFile(filePath, checks) {
    console.log(`📁 Validating ${filePath}...`);
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${filePath}`);
        validationResults.failed++;
        return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    checks.forEach(check => {
        const result = check.test(content);
        if (result) {
            console.log(`✅ ${check.name}`);
            validationResults.passed++;
        } else {
            console.log(`❌ ${check.name}`);
            validationResults.failed++;
        }
    });
    
    console.log('');
}

// Validate ErrorHandler class
validateFile('js/error-handler.js', [
    {
        name: 'ErrorHandler class exists',
        test: content => content.includes('class ErrorHandler')
    },
    {
        name: 'Browser compatibility checking',
        test: content => content.includes('checkBrowserSupport')
    },
    {
        name: 'Input validation methods',
        test: content => content.includes('validateSlotCount') && content.includes('validateSlotContent')
    },
    {
        name: 'Game state validation',
        test: content => content.includes('validateGameState')
    },
    {
        name: 'Storage error handling',
        test: content => content.includes('handleStorageError')
    },
    {
        name: 'Canvas fallback functionality',
        test: content => content.includes('createCanvasFallback')
    },
    {
        name: 'Canvas error handling',
        test: content => content.includes('handleCanvasError')
    },
    {
        name: 'Memory error handling',
        test: content => content.includes('handleMemoryError')
    },
    {
        name: 'Compatibility recommendations',
        test: content => content.includes('getCompatibilityRecommendations')
    },
    {
        name: 'Error reporting functionality',
        test: content => content.includes('createErrorReport')
    },
    {
        name: 'Global error handlers setup',
        test: content => content.includes('setupGlobalErrorHandlers')
    },
    {
        name: 'Analytics error reporting',
        test: content => content.includes('sendErrorToAnalytics')
    }
]);

// Validate StorageManager enhancements
validateFile('js/storage.js', [
    {
        name: 'Enhanced save game validation',
        test: content => content.includes('validateGameState')
    },
    {
        name: 'Progressive cleanup functionality',
        test: content => content.includes('performProgressiveCleanup')
    },
    {
        name: 'Storage quota handling',
        test: content => content.includes('QuotaExceededError')
    },
    {
        name: 'Fallback storage support',
        test: content => content.includes('saveFallbackGame')
    },
    {
        name: 'Enhanced error messages',
        test: content => content.includes('저장 공간이 부족합니다')
    }
]);

// Validate LadderGame error handling
validateFile('js/ladder-game.js', [
    {
        name: 'Enhanced game start error handling',
        test: content => content.includes('handleGameStartError')
    },
    {
        name: 'Canvas initialization error handling',
        test: content => content.includes('handleCanvasInitError')
    },
    {
        name: 'Canvas render error handling',
        test: content => content.includes('handleCanvasRenderError')
    },
    {
        name: 'Memory constraint checking',
        test: content => content.includes('isLowMemoryDevice')
    },
    {
        name: 'Enhanced browser compatibility checking',
        test: content => content.includes('checkGameSpecificCompatibility')
    },
    {
        name: 'Canvas fallback integration',
        test: content => content.includes('createCanvasFallback')
    }
]);

// Validate main HTML integration
validateFile('index.html', [
    {
        name: 'Error handler script included',
        test: content => content.includes('js/error-handler.js')
    },
    {
        name: 'Error handler loaded before other scripts',
        test: content => {
            const errorHandlerIndex = content.indexOf('js/error-handler.js');
            const appIndex = content.indexOf('js/app.js');
            return errorHandlerIndex < appIndex;
        }
    }
]);

// Validate test files exist
const testFiles = [
    'test-error-handling.html',
    'test-enhanced-error-handling.html'
];

testFiles.forEach(testFile => {
    if (fs.existsSync(testFile)) {
        console.log(`✅ Test file exists: ${testFile}`);
        validationResults.passed++;
    } else {
        console.log(`❌ Test file missing: ${testFile}`);
        validationResults.failed++;
    }
});

// Check for proper error handling patterns
console.log('🔍 Checking error handling patterns...\n');

const jsFiles = ['js/app.js', 'js/ladder-game.js', 'js/storage.js', 'js/ui-components.js'];

jsFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for try-catch blocks
        const tryCatchCount = (content.match(/try\s*{/g) || []).length;
        if (tryCatchCount > 0) {
            console.log(`✅ ${file}: ${tryCatchCount} try-catch blocks found`);
            validationResults.passed++;
        } else {
            console.log(`⚠️ ${file}: No try-catch blocks found`);
            validationResults.warnings++;
        }
        
        // Check for error logging
        const errorLogCount = (content.match(/console\.error|logError/g) || []).length;
        if (errorLogCount > 0) {
            console.log(`✅ ${file}: ${errorLogCount} error logging statements found`);
            validationResults.passed++;
        } else {
            console.log(`⚠️ ${file}: No error logging found`);
            validationResults.warnings++;
        }
    }
});

// Final results
console.log('\n📊 Validation Results:');
console.log(`✅ Passed: ${validationResults.passed}`);
console.log(`❌ Failed: ${validationResults.failed}`);
console.log(`⚠️ Warnings: ${validationResults.warnings}`);

const total = validationResults.passed + validationResults.failed;
const passRate = total > 0 ? (validationResults.passed / total * 100).toFixed(1) : 0;

console.log(`\n🎯 Pass Rate: ${passRate}%`);

if (passRate >= 90) {
    console.log('🎉 Excellent error handling implementation!');
} else if (passRate >= 75) {
    console.log('👍 Good error handling implementation with room for improvement.');
} else {
    console.log('⚠️ Error handling implementation needs significant improvement.');
}

// Exit with appropriate code
process.exit(validationResults.failed > 0 ? 1 : 0);