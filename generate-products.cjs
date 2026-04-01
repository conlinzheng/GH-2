const fs = require('fs');
const path = require('path');

// 产品图文件夹路径
const productsImagesPath = path.join(__dirname, '产品图');
// 生成的产品数据文件路径
const productsDataPath = path.join(__dirname, 'src', 'data', 'products.json');

// 确保数据目录存在
const dataDir = path.dirname(productsDataPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 扫描产品图文件夹，生成产品数据
function generateProductsData() {
  try {
    const products = [];
    const series = [];
    const seriesNameMap = {};
    
    // 读取系列文件夹
    const seriesFolders = fs.readdirSync(productsImagesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    console.log('Found series folders:', seriesFolders);
    
    // 遍历每个系列
    seriesFolders.forEach((seriesFolder, seriesIndex) => {
      const seriesPath = path.join(productsImagesPath, seriesFolder);
      
      // 解析系列名称
      const seriesId = seriesFolder;
      const seriesName = seriesFolder.replace(/^\d+-/, '');
      
      // 添加系列信息
      series.push({ id: seriesId, name: seriesName });
      seriesNameMap[seriesId] = seriesName;
      
      // 读取系列中的图片文件
      const imageFiles = fs.readdirSync(seriesPath)
        .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
      
      console.log(`Found ${imageFiles.length} images in ${seriesFolder}`);
      
      // 为每个系列创建一个产品
      if (imageFiles.length > 0) {
        // 按文件名排序
        imageFiles.sort();
        
        // 提取产品名称（从系列名称中）
        const productName = `${seriesName}产品${seriesIndex + 1}`;
        
        // 生成产品ID
        const productId = `product${seriesIndex + 1}`;
        
        // 生成图片路径
        const images = imageFiles.map(image => `/images/产品图/${seriesFolder}/${image}`);
        
        // 创建产品数据
        const product = {
          id: productId,
          seriesId: seriesId,
          name: productName,
          description: `这是一款优质的${seriesName}产品`,
          price: `¥${(seriesIndex + 1) * 100}`,
          upperMaterial: seriesName.includes('真皮') ? '真皮' : 'PU',
          innerMaterial: seriesName.includes('真皮') ? '真皮' : '织物',
          soleMaterial: '橡胶',
          customizable: 'true',
          minOrder: '100',
          tags: ['新品', '热销'],
          images: images
        };
        
        products.push(product);
        console.log(`Created product: ${productName} with ${images.length} images`);
      }
    });
    
    // 生成完整的产品数据
    const productsData = {
      products: products,
      series: series,
      seriesNameMap: seriesNameMap
    };
    
    // 写入产品数据文件
    fs.writeFileSync(productsDataPath, JSON.stringify(productsData, null, 2));
    console.log(`Products data generated successfully: ${productsDataPath}`);
    console.log(`Generated ${products.length} products from ${series.length} series`);
    
    return productsData;
  } catch (error) {
    console.error('Error generating products data:', error);
    return null;
  }
}

// 复制产品图片到 public/images 目录
function copyProductImages() {
  try {
    const publicImagesPath = path.join(__dirname, 'public', 'images');
    const destinationPath = path.join(publicImagesPath, '产品图');
    
    // 确保目标目录存在
    if (!fs.existsSync(publicImagesPath)) {
      fs.mkdirSync(publicImagesPath, { recursive: true });
    }
    
    // 移除旧的产品图目录（如果存在）
    if (fs.existsSync(destinationPath)) {
      fs.rmSync(destinationPath, { recursive: true, force: true });
    }
    
    // 复制产品图目录
    copyDirectory(productsImagesPath, destinationPath);
    console.log(`Product images copied to: ${destinationPath}`);
  } catch (error) {
    console.error('Error copying product images:', error);
  }
}

// 递归复制目录
function copyDirectory(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  
  const files = fs.readdirSync(source);
  
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const destinationPath = path.join(destination, file);
    
    if (fs.statSync(sourcePath).isDirectory()) {
      copyDirectory(sourcePath, destinationPath);
    } else {
      fs.copyFileSync(sourcePath, destinationPath);
    }
  });
}

// 执行生成和复制操作
if (require.main === module) {
  console.log('Generating products data...');
  generateProductsData();
  
  console.log('\nCopying product images...');
  copyProductImages();
  
  console.log('\nDone!');
}

module.exports = { generateProductsData, copyProductImages };