import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取产品数据文件
const productsPath = path.join(__dirname, 'src', 'data', 'products.js');
const productsContent = fs.readFileSync(productsPath, 'utf8');

// 替换图片路径，去掉开头的 `/`
const fixedContent = productsContent.replace(/"images":\s*\[([\s\S]*?)\]/g, (match, images) => {
  const fixedImages = images.replace(/"\/([^"]+)"/g, '"$1"');
  return `"images": [${fixedImages}]`;
});

// 写回文件
fs.writeFileSync(productsPath, fixedContent);

console.log('✅ 图片路径修复完成！');
console.log('所有图片路径已去掉开头的 `/`');
