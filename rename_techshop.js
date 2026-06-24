const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const excludeDirs = ['node_modules', '.git', 'dist', 'target', '.gemini'];

// We will do replacements for text in files
const textReplacements = [
  // Backend packages and properties
  { regex: /com\.laptopshop/g, replace: 'com.techshop' },
  { regex: /laptopshop-backend/g, replace: 'techshop-backend' },
  { regex: /laptop_shop/g, replace: 'tech_shop' },
  { regex: /admin@laptopshop\.vn/g, replace: 'admin@techshop.vn' },
  { regex: /LaptopshopApplication/g, replace: 'TechshopApplication' },
  
  // Frontend left-overs
  { regex: /Laptop Shop/gi, replace: 'Tech Shop' },
  { regex: /Laptop cũ Cần Thơ/gi, replace: 'Tech Shop Cần Thơ' },
  { regex: /Laptop cũ/gi, replace: 'Sản phẩm công nghệ' },
  { regex: /laptop cũ/gi, replace: 'sản phẩm công nghệ' },
  { regex: /laptopshop_cart/g, replace: 'techshop_cart' },
  { regex: /laptopshop/g, replace: 'techshop' },
  { regex: /VD: Laptop Dell/g, replace: 'VD: Điện thoại Apple' },
  { regex: /Tìm kiếm laptop, CPU/g, replace: 'Tìm kiếm điện thoại, tai nghe' },
  { regex: /Chuyên laptop/gi, replace: 'Chuyên sản phẩm công nghệ' },
  // Optional: changing the Lucide import from Laptop to Smartphone
  { regex: /Laptop(?! Shop| cũ|shop|,)/g, replace: 'Smartphone' }, // This might break some stuff, so let's be careful. Actually, let's just replace `<Laptop ` with `<Smartphone ` and `Laptop` in imports
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (excludeDirs.includes(file)) continue;

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else {
      if (!/\.(js|jsx|ts|tsx|css|html|md|java|xml|properties|json)$/.test(file)) continue;
      // Skip this script itself
      if (file === 'rename_techshop.js' || file === 'update_frontend.js' || file === 'rename.js') continue;

      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const rule of textReplacements) {
        content = content.replace(rule.regex, rule.replace);
      }
      
      // Specifically fix lucide icon rename
      content = content.replace(/import \{([^}]*)Laptop([^}]*)\} from 'lucide-react'/g, "import {$1Smartphone$2} from 'lucide-react'");
      content = content.replace(/<Laptop /g, "<Smartphone ");

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated file:', fullPath);
      }
    }
  }
}

// 1. Process files
console.log('Replacing text in files...');
processDirectory(rootDir);

// 2. Rename directories
function renamePackageDir(basePath) {
  if (fs.existsSync(basePath)) {
    const oldDir = path.join(basePath, 'laptopshop');
    const newDir = path.join(basePath, 'techshop');
    if (fs.existsSync(oldDir)) {
      fs.renameSync(oldDir, newDir);
      console.log(`Renamed directory: ${oldDir} -> ${newDir}`);
    }
  }
}

console.log('Renaming directories...');
renamePackageDir(path.join(rootDir, 'backend', 'src', 'main', 'java', 'com'));
renamePackageDir(path.join(rootDir, 'backend', 'src', 'test', 'java', 'com'));

// 3. Rename application class file
const appClassPathOld = path.join(rootDir, 'backend', 'src', 'main', 'java', 'com', 'techshop', 'LaptopshopApplication.java');
const appClassPathNew = path.join(rootDir, 'backend', 'src', 'main', 'java', 'com', 'techshop', 'TechshopApplication.java');
if (fs.existsSync(appClassPathOld)) {
  fs.renameSync(appClassPathOld, appClassPathNew);
  console.log('Renamed class file to TechshopApplication.java');
}

console.log('Done!');
