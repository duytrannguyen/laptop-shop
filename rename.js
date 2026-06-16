const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const excludeDirs = ['node_modules', '.git', 'dist', 'target', '.gemini'];
const excludeFiles = ['rename.js'];

// Renaming rules:
// QKSHOP.VN -> Laptop Shop
// QKSHOP -> Laptop Shop
// qkshop.vn@gmail.com -> contact@laptopshop.vn
// qkshop.vn -> laptopshop.vn
// admin@qkshop.vn -> admin@laptopshop.vn
// qkshop_cart -> laptopshop_cart
// com.qkshop -> com.laptopshop
// qkshop -> laptopshop

const replacements = [
  { regex: /QKSHOP\.VN/g, replace: 'Laptop Shop' },
  { regex: /QKSHOP/g, replace: 'Laptop Shop' },
  { regex: /qkshop\.vn@gmail\.com/g, replace: 'contact@laptopshop.vn' },
  { regex: /admin@qkshop\.vn/g, replace: 'admin@laptopshop.vn' },
  { regex: /qkshop\.vn/g, replace: 'laptopshop.vn' },
  { regex: /qkshop_cart/g, replace: 'laptopshop_cart' },
  { regex: /com\.qkshop/g, replace: 'com.laptopshop' },
  { regex: /qkshop/g, replace: 'laptopshop' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    
    // Check excludes
    if (excludeDirs.includes(file) || excludeFiles.includes(file)) continue;

    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else {
      // Only process text files based on extension
      if (!/\.(js|jsx|ts|tsx|css|html|md|java|xml|properties|json)$/.test(file)) continue;

      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const rule of replacements) {
        content = content.replace(rule.regex, rule.replace);
      }

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated:', fullPath);
      }
    }
  }
}

// 1. Process files
console.log('Replacing text in files...');
processDirectory(rootDir);

// 2. Rename directories if needed
console.log('Renaming directories...');
const backendJavaDir = path.join(rootDir, 'backend', 'src', 'main', 'java', 'com');
if (fs.existsSync(backendJavaDir)) {
  const oldDir = path.join(backendJavaDir, 'qkshop');
  const newDir = path.join(backendJavaDir, 'laptopshop');
  if (fs.existsSync(oldDir)) {
    fs.renameSync(oldDir, newDir);
    console.log(`Renamed directory: ${oldDir} -> ${newDir}`);
  }
}

console.log('Done!');
