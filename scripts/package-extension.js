#!/usr/bin/env node

/**
 * Package Extension Script
 * 
 * Creates a zip file of the extension for distribution.
 * Excludes development files and only includes what's needed to run the extension.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const EXTENSION_DIR = path.join(__dirname, '..', 'extension');
const OUTPUT_DIR = path.join(__dirname, '..', 'dist');
const ZIP_NAME = 'eir-data-liberator-extension.zip';

// Files/directories to include
const INCLUDE_PATTERNS = [
  'manifest.json',
  'content.js',
  'data-transfer.js',
  'popup.html',
  'styles.css',
  '*.png', // icons
  'eir-format-specification.md',
  'eir-format-simple.yaml',
  'src/**/*',
];

// Files/directories to exclude
const EXCLUDE_PATTERNS = [
  '**/.DS_Store',
  '**/node_modules',
  '**/*.log',
  '**/*.tmp',
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function packageExtension() {
  console.log('📦 Packaging extension...');
  
  // Ensure dist directory exists
  ensureDir(OUTPUT_DIR);
  
  const zipPath = path.join(OUTPUT_DIR, ZIP_NAME);
  
  // Remove old zip if exists
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }
  
  // Create zip using zip command (available on macOS/Linux)
  // For Windows, user can use 7-Zip or PowerShell
  try {
    const excludeArgs = EXCLUDE_PATTERNS.map(pattern => `-x "${pattern}"`).join(' ');
    
    // Change to extension directory and create zip
    const command = `cd "${EXTENSION_DIR}" && zip -r "${zipPath}" . ${excludeArgs} -x "*.DS_Store"`;
    
    execSync(command, { stdio: 'inherit' });
    
    const stats = fs.statSync(zipPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`\n✅ Extension packaged successfully!`);
    console.log(`   Location: ${zipPath}`);
    console.log(`   Size: ${sizeMB} MB`);
    console.log(`\n📥 Users can:`);
    console.log(`   1. Download this zip file`);
    console.log(`   2. Extract it`);
    console.log(`   3. Load it in Chrome/Edge/Brave as an unpacked extension`);
    
  } catch (error) {
    console.error('❌ Error creating zip file:', error.message);
    console.log('\n💡 Alternative: Use a zip tool manually:');
    console.log(`   1. Navigate to: ${EXTENSION_DIR}`);
    console.log(`   2. Select all files`);
    console.log(`   3. Create zip file`);
    process.exit(1);
  }
}

// Run packaging
packageExtension();

