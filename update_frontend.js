const fs = require('fs');
const path = require('path');

const targetFiles = [
    'frontend/src/pages/user/HomePage.jsx',
    'frontend/src/pages/user/FAQPage.jsx',
    'frontend/src/pages/user/AboutPage.jsx',
    'frontend/src/pages/user/WarrantyPage.jsx',
    'frontend/src/pages/user/InstallmentPage.jsx',
    'frontend/src/pages/user/ProductsPage.jsx',
    'frontend/src/pages/user/OrderTrackingPage.jsx',
    'frontend/src/pages/user/CheckoutPage.jsx',
    'frontend/src/pages/auth/AdminLogin.jsx',
    'frontend/index.html'
];

const replacements = [
    { regex: /Laptop Shop/g, replace: 'Tech Shop' },
    { regex: /laptopshop/g, replace: 'techshop' },
    { regex: /Laptop cũ Cần Thơ/gi, replace: 'Thiết bị số Cần Thơ' },
    { regex: /laptop cũ/g, replace: 'thiết bị công nghệ' },
    { regex: /Laptop cũ/g, replace: 'Thiết bị công nghệ' },
    { regex: /laptop Gaming, Macbook, laptop văn phòng/gi, replace: 'điện thoại, tai nghe, phụ kiện' },
    { regex: /Thu mua laptop/gi, replace: 'Thu mua thiết bị' },
    { regex: /Vệ sinh laptop/gi, replace: 'Vệ sinh thiết bị' },
    { regex: /Sở hữu laptop/gi, replace: 'Sở hữu sản phẩm' },
    { regex: /sản phẩm laptop/gi, replace: 'sản phẩm công nghệ' },
    { regex: /Pin laptop/gi, replace: 'Pin thiết bị' },
    { regex: /Đơn vị chuyên laptop/gi, replace: 'Đơn vị chuyên thiết bị công nghệ' },
    { regex: /những chiếc laptop/gi, replace: 'những thiết bị' },
    { regex: /Tất cả laptop/gi, replace: 'Tất cả sản phẩm' },
    { regex: /chiếc laptop phù hợp/gi, replace: 'sản phẩm phù hợp' },
    { regex: /laptop, CPU, thương hiệu/gi, replace: 'điện thoại, tai nghe, thương hiệu' },
    { regex: /mua laptop/gi, replace: 'mua sản phẩm' },
    { regex: /đơn hàng laptop/gi, replace: 'đơn hàng thiết bị' },
    { regex: /Laptop văn phòng/gi, replace: 'Điện thoại, tai nghe' },
    { regex: /Laptop gaming/gi, replace: 'Phụ kiện cao cấp' },
    { regex: /nhận laptop/gi, replace: 'nhận sản phẩm' },
    { regex: /chọn laptop/gi, replace: 'chọn sản phẩm' }
];

targetFiles.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let originalContent = content;
        
        replacements.forEach(rule => {
            content = content.replace(rule.regex, rule.replace);
        });

        if (content !== originalContent) {
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log('Updated:', fullPath);
        }
    }
});
