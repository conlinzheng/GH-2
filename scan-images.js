import fs from 'fs';
import path from 'path';

// 获取当前目录路径
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 扫描public文件夹
function scanPublicFolder() {
  const publicPath = path.join(__dirname, 'public');
  const seriesList = [];
  const productList = [];
  
  // 读取public文件夹下的所有系列文件夹
  const seriesFolders = fs.readdirSync(publicPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  // 处理每个系列文件夹
  seriesFolders.forEach((seriesFolder, index) => {
    // 提取系列名称（去除数字前缀）
    const seriesName = seriesFolder.replace(/^\d+-/, '');
    const seriesId = `series-${index + 1}`;
    
    // 添加系列信息
    seriesList.push({
      id: seriesId,
      name: seriesName
    });
    
    // 读取系列文件夹下的所有图片
    const seriesPath = path.join(publicPath, seriesFolder);
    const images = fs.readdirSync(seriesPath)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
      });
    
    // 为每个图片生成产品信息
    images.forEach((image, imgIndex) => {
      const productId = `product-${seriesId}-${imgIndex + 1}`;
      const imagePath = `/${seriesFolder}/${image}`;
      
      // 提取产品名称（去除数字和特殊字符）
      let productName = image.replace(/\d+\s*\([^)]*\)/g, '').replace(/\.(jpg|jpeg|png|gif)$/i, '').trim();
      if (!productName) {
        productName = `${seriesName}产品${imgIndex + 1}`;
      }
      
      // 添加产品信息
      productList.push({
        id: productId,
        name: productName,
        seriesId: seriesId,
        seriesName: seriesName,
        price: 199 + Math.floor(Math.random() * 300), // 随机价格
        description: `${seriesName}系列产品，品质保证`,
        upperMaterial: '优质材料',
        innerMaterial: '舒适内里',
        soleMaterial: '防滑鞋底',
        minOrder: 1,
        customizable: true,
        tags: ['新品', '热销'],
        images: [imagePath]
      });
    });
  });
  
  return { seriesList, productList };
}

// 生成数据文件
function generateDataFiles() {
  const { seriesList, productList } = scanPublicFolder();
  
  // 生成系列数据
  const seriesData = JSON.stringify(seriesList, null, 2);
  fs.writeFileSync(path.join(__dirname, 'src', 'data', 'series.js'), `export default ${seriesData};`);
  
  // 生成产品数据
  const productData = JSON.stringify(productList, null, 2);
  fs.writeFileSync(path.join(__dirname, 'src', 'data', 'products.js'), `export default ${productData};`);
  
  console.log('✅ 扫描完成！');
  console.log(`📁 发现 ${seriesList.length} 个系列`);
  console.log(`📷 发现 ${productList.length} 个产品`);
  console.log('💾 数据已生成到 src/data/ 目录');
}

// 确保data目录存在
const dataDir = path.join(__dirname, 'src', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 执行扫描
try {
  generateDataFiles();
} catch (error) {
  console.error('❌ 扫描过程中出错:', error.message);
}
