const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'admin');

const files = [
  'BannersManage.jsx',
  'BrandsManage.jsx',
  'CategoriesManage.jsx',
  'MediaManage.jsx',
  'NeedsManage.jsx',
  'OrdersManage.jsx',
  'PostsManage.jsx',
  'ProductGroupsManage.jsx',
  'ProductsManage.jsx'
];

files.forEach(file => {
  const filePath = path.join(srcDir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Remove all useToast imports
  content = content.replace(/import\s+\{\s*useToast\s*\}\s*from\s*'[^']+';?\n?/g, '');
  
  // 2. Remove all const { showToast } = useToast();
  content = content.replace(/[ \t]*const\s+\{\s*showToast\s*\}\s*=\s*useToast\(\);?\n?/g, '');
  
  // 3. Add the import correctly at the top, after the first import (which is usually React)
  content = content.replace(/^(import React[^;]*;?)$/m, "$1\nimport { useToast } from '../components/ToastContext';");
  
  // 4. Add the hook inside the main component ONLY.
  // The main component matches "export default function ComponentName() {"
  content = content.replace(/(export default function [A-Za-z0-9_]+\([^)]*\)\s*\{)/, "$1\n  const { showToast } = useToast();");
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed', file);
});
