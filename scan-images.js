import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 扫描目录
const publicDir = path.join(__dirname, 'public');
const seriesDirs = fs.readdirSync(publicDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

console.log('扫描到的系列文件夹:', seriesDirs);

const products = [];
const series = [];

// 处理每个系列
seriesDirs.forEach((seriesName, seriesIndex) => {
  const seriesPath = path.join(publicDir, seriesName);
  const files = fs.readdirSync(seriesPath)
    .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
    .sort();

  console.log(`\n系列 ${seriesName} 中的图片文件:`, files);

  // 按产品分组
  const productGroups = {};

  files.forEach(file => {
    // 提取产品名称，去掉编号部分
    // 例如：产品1 (1).jpg -> 产品1
    const productNameMatch = file.match(/^(.*?)\s*\(\d+\)\.(jpg|jpeg|png|gif|webp)$/i);
    if (productNameMatch) {
      const productName = productNameMatch[1].trim();
      if (!productGroups[productName]) {
        productGroups[productName] = [];
      }
      productGroups[productName].push(file);
    } else {
      // 没有编号的文件作为单独产品
      productGroups[file] = [file];
    }
  });

  console.log(`系列 ${seriesName} 的产品分组:`, productGroups);

  // 为每个产品创建数据
  let productIndex = 1;
  Object.entries(productGroups).forEach(([productName, productFiles]) => {
    // 按编号排序，确保主图（编号1）在第一个
    productFiles.sort((a, b) => {
      const aMatch = a.match(/\((\d+)\)/);
      const bMatch = b.match(/\((\d+)\)/);
      const aNum = aMatch ? parseInt(aMatch[1]) : 1;
      const bNum = bMatch ? parseInt(bMatch[1]) : 1;
      return aNum - bNum;
    });

    // 生成产品ID
    const productId = `product-series-${seriesIndex + 1}-${productIndex}`;

    // 创建产品数据
    const product = {
      id: productId,
      name: productName,
      seriesId: `series-${seriesIndex + 1}`,
      seriesName: seriesName.replace(/^\d+-/, ''), // 去掉系列名称开头的数字和连字符
      price: Math.floor(Math.random() * 300) + 200, // 随机价格
      description: `${seriesName.replace(/^\d+-/, '')}系列产品，品质保证`,
      upperMaterial: '优质材料',
      innerMaterial: '舒适内里',
      soleMaterial: '防滑鞋底',
      minOrder: 1,
      customizable: true,
      tags: ['新品', '热销'],
      images: productFiles.map(file => `${seriesName}/${file}`)
    };

    products.push(product);
    productIndex++;
  });

  // 创建系列数据
  const seriesData = {
    id: `series-${seriesIndex + 1}`,
    name: seriesName.replace(/^\d+-/, ''),
    order: seriesIndex + 1,
    productCount: Object.keys(productGroups).length
  };

  series.push(seriesData);
});

// 写入产品数据文件
const productsPath = path.join(__dirname, 'src', 'data', 'products.js');
fs.writeFileSync(productsPath, `export default ${JSON.stringify(products, null, 2)};
`);

// 写入系列数据文件
const seriesPath = path.join(__dirname, 'src', 'data', 'series.js');
fs.writeFileSync(seriesPath, `export default ${JSON.stringify(series, null, 2)};
`);

console.log('\n✅ 图片扫描完成！');
console.log(`生成了 ${products.length} 个产品`);
console.log(`生成了 ${series.length} 个系列`);
console.log('产品数据已保存到 src/data/products.js');
console.log('系列数据已保存到 src/data/series.js');
