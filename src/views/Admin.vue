<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- 头部导航 -->
    <header class="header bg-white shadow-sm sticky top-0 z-30">
      <div class="container">
        <div class="flex items-center justify-between py-4">
          <div class="logo">
            <h1 class="text-2xl font-bold text-primary">GH5 Admin</h1>
          </div>
          <nav class="flex items-center gap-4">
            <button 
              class="nav-btn" 
              @click="goToHome"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10 13V7M10 7L14 11M10 7L6 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </header>

    <!-- 主要内容 - 3栏布局 -->
    <main class="main flex-grow">
      <div class="container-fluid h-full p-0">
        <div class="flex h-full">
          <!-- 左栏：系列管理 -->
          <div class="w-1/4 border-r border-gray-200 bg-white">
            <div class="p-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold">系列管理</h3>
            </div>
            <div class="p-4">
              <div class="mb-4">
                <button 
                  class="btn btn-secondary w-full"
                  @click="openAddSeriesModal"
                >
                  添加系列
                </button>
              </div>
              <div class="space-y-2">
                <div 
                  v-for="(seriesItem, index) in series" 
                  :key="seriesItem.id"
                  class="series-item p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                  :class="{ 'bg-primary/10 border-primary': selectedSeriesId === seriesItem.id }"
                  @click="selectSeries(seriesItem.id)"
                >
                  <div class="flex justify-between items-center">
                    <div>
                      <h4 class="font-medium">{{ seriesItem.name }}</h4>
                      <p class="text-sm text-gray-500">{{ getSeriesProductCount(seriesItem.id) }} 个产品</p>
                      <p class="text-xs text-gray-400">{{ seriesItem.id }}</p>
                    </div>
                    <div class="flex gap-2">
                      <button 
                        class="text-sm text-gray-500 hover:text-primary"
                        @click.stop="moveSeries(index, -1)"
                        :disabled="index === 0"
                      >
                        ↑
                      </button>
                      <button 
                        class="text-sm text-gray-500 hover:text-primary"
                        @click.stop="moveSeries(index, 1)"
                        :disabled="index === series.length - 1"
                      >
                        ↓
                      </button>
                      <button 
                        class="text-sm text-gray-500 hover:text-primary"
                        @click.stop="editSeries(seriesItem)"
                      >
                        编辑
                      </button>
                      <button 
                        class="text-sm text-gray-500 hover:text-red-500"
                        @click.stop="deleteSeries(seriesItem.id)"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 中间栏：产品管理 -->
          <div class="w-1/2 border-r border-gray-200 bg-white">
            <div class="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 class="text-lg font-semibold">产品管理</h3>
              <button 
                class="btn btn-primary"
                @click="openAddProductModal"
              >
                添加产品
              </button>
            </div>
            <div class="p-4">
              <div class="mb-4">
                <input 
                  type="text" 
                  class="form-input w-full"
                  placeholder="搜索产品名称..."
                  v-model="adminSearchQuery"
                  @input="searchAdminProducts"
                >
              </div>
              <div v-if="isLoading" class="loading flex flex-col items-center justify-center py-10">
                <div class="spinner w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p class="mt-2">加载中...</p>
              </div>
              <div v-else-if="filteredProducts.length === 0" class="text-center py-10">
                <p>暂无产品数据</p>
              </div>
              <div v-else class="space-y-2">
                <div 
                  v-for="(product, index) in filteredProducts" 
                  :key="product.id"
                  class="product-item p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                  :class="{ 'bg-primary/10 border-primary': selectedProductId === product.id }"
                  @click="selectProduct(product)"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                      <img 
                        v-if="product.images && product.images.length > 0" 
                        :src="encodeURIComponent(product.images[0])" 
                        :alt="product.name"
                        class="w-full h-full object-cover"
                      >
                    </div>
                    <div class="flex-grow">
                      <h4 class="font-medium">{{ product.name }}</h4>
                      <p class="text-sm text-gray-500">{{ product.price }}</p>
                    </div>
                    <div class="flex gap-2">
                      <button 
                        class="text-sm text-gray-500 hover:text-primary"
                        @click.stop="moveProduct(index, -1)"
                        :disabled="index === 0"
                      >
                        ↑
                      </button>
                      <button 
                        class="text-sm text-gray-500 hover:text-primary"
                        @click.stop="moveProduct(index, 1)"
                        :disabled="index === filteredProducts.length - 1"
                      >
                        ↓
                      </button>
                      <button 
                        class="text-sm text-gray-500 hover:text-primary"
                        @click.stop="editProduct(product)"
                      >
                        编辑
                      </button>
                      <button 
                        class="text-sm text-gray-500 hover:text-red-500"
                        @click.stop="deleteProduct(product.id)"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右边栏：产品详情编辑 -->
          <div class="w-1/4 bg-white">
            <div class="p-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold">产品详情</h3>
            </div>
            <div class="p-4">
              <div v-if="!selectedProduct" class="text-center py-10">
                <p>请选择一个产品</p>
              </div>
              <div v-else>
                <div class="mb-4">
                  <label class="form-label">产品名称</label>
                  <input 
                    type="text" 
                    class="form-input w-full"
                    v-model="selectedProduct.name"
                    @input="updateProduct"
                  >
                </div>
                <div class="mb-4">
                  <label class="form-label">鞋面材质</label>
                  <input 
                    type="text" 
                    class="form-input w-full"
                    v-model="selectedProduct.upperMaterial"
                    @input="updateProduct"
                  >
                </div>
                <div class="mb-4">
                  <label class="form-label">内里材质</label>
                  <input 
                    type="text" 
                    class="form-input w-full"
                    v-model="selectedProduct.innerMaterial"
                    @input="updateProduct"
                  >
                </div>
                <div class="mb-4">
                  <label class="form-label">鞋底材质</label>
                  <input 
                    type="text" 
                    class="form-input w-full"
                    v-model="selectedProduct.soleMaterial"
                    @input="updateProduct"
                  >
                </div>
                <div class="mb-4">
                  <label class="form-label">价格</label>
                  <input 
                    type="text" 
                    class="form-input w-full"
                    v-model="selectedProduct.price"
                    @input="updateProduct"
                  >
                </div>
                <div class="mb-4">
                  <label class="form-label">是否支持定制</label>
                  <div class="flex gap-4">
                    <label class="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="customizable" 
                        value="true"
                        v-model="selectedProduct.customizable"
                        @change="updateProduct"
                      >
                      是
                    </label>
                    <label class="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="customizable" 
                        value="false"
                        v-model="selectedProduct.customizable"
                        @change="updateProduct"
                      >
                      否
                    </label>
                  </div>
                </div>
                <div class="mb-4">
                  <label class="form-label">起订量</label>
                  <input 
                    type="text" 
                    class="form-input w-full"
                    v-model="selectedProduct.minOrder"
                    @input="updateProduct"
                  >
                </div>
                <div class="mt-6">
                  <button 
                    class="btn btn-primary w-full"
                    @click="saveProductDetails"
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 添加/编辑产品弹窗 -->
    <div 
      class="modal" 
      :style="{ display: productModalOpen ? 'flex' : 'none' }"
    >
      <div 
        class="modal-overlay"
        @click="closeProductModal"
      ></div>
      <div class="modal-content max-w-2xl w-full">
        <div class="modal-header p-4 border-b flex justify-between items-center">
          <h3 class="text-xl font-bold">{{ isEditing ? '编辑产品' : '添加产品' }}</h3>
          <button 
            class="modal-close text-gray-500 hover:text-gray-700 text-2xl"
            @click="closeProductModal"
          >
            &times;
          </button>
        </div>
        
        <div class="modal-body p-6">
          <form @submit.prevent="saveProduct">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div class="form-group">
                <label class="form-label block mb-1 font-medium">产品ID</label>
                <input 
                  type="text" 
                  class="form-input w-full" 
                  v-model="formData.id"
                  :disabled="isEditing"
                  required
                >
              </div>
              <div class="form-group">
                <label class="form-label block mb-1 font-medium">产品名称</label>
                <input 
                  type="text" 
                  class="form-input w-full" 
                  v-model="formData.name"
                  required
                >
              </div>
              <div class="form-group">
                <label class="form-label block mb-1 font-medium">所属系列</label>
                <select 
                  class="form-select w-full" 
                  v-model="formData.seriesId"
                  required
                >
                  <option value="">请选择系列</option>
                  <option v-for="series in series" :key="series.id" :value="series.id">
                    {{ series.name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label block mb-1 font-medium">价格</label>
                <input 
                  type="text" 
                  class="form-input w-full" 
                  v-model="formData.price"
                  required
                >
              </div>
            </div>
            
            <div class="form-group mb-4">
              <label class="form-label block mb-1 font-medium">描述</label>
              <textarea 
                class="form-textarea w-full" 
                rows="3"
                v-model="formData.description"
              ></textarea>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div class="form-group">
                <label class="form-label block mb-1 font-medium">鞋面材质</label>
                <input 
                  type="text" 
                  class="form-input w-full" 
                  v-model="formData.upperMaterial"
                >
              </div>
              <div class="form-group">
                <label class="form-label block mb-1 font-medium">内里材质</label>
                <input 
                  type="text" 
                  class="form-input w-full" 
                  v-model="formData.innerMaterial"
                >
              </div>
              <div class="form-group">
                <label class="form-label block mb-1 font-medium">鞋底材质</label>
                <input 
                  type="text" 
                  class="form-input w-full" 
                  v-model="formData.soleMaterial"
                >
              </div>
              <div class="form-group">
                <label class="form-label block mb-1 font-medium">起订量</label>
                <input 
                  type="text" 
                  class="form-input w-full" 
                  v-model="formData.minOrder"
                >
              </div>
            </div>
            
            <div class="form-group mb-4">
              <label class="form-label block mb-1 font-medium">是否支持定制</label>
              <div class="flex gap-4">
                <label class="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="customizable" 
                    value="true"
                    v-model="formData.customizable"
                  >
                  是
                </label>
                <label class="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="customizable" 
                    value="false"
                    v-model="formData.customizable"
                  >
                  否
                </label>
              </div>
            </div>
            
            <div class="form-group mb-4">
              <label class="form-label block mb-1 font-medium">标签（用逗号分隔）</label>
              <input 
                type="text" 
                class="form-input w-full" 
                v-model="formTags"
                placeholder="如：新品,热销"
              >
            </div>
            
            <div class="form-group mb-6">
              <label class="form-label block mb-1 font-medium">图片URL（用逗号分隔）</label>
              <textarea 
                class="form-textarea w-full" 
                rows="3"
                v-model="formImages"
                placeholder="如：https://example.com/image1.jpg,https://example.com/image2.jpg"
              ></textarea>
            </div>
            
            <div class="flex justify-end gap-4">
              <button 
                type="button" 
                class="btn btn-secondary"
                @click="closeProductModal"
              >
                取消
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="isSaving"
              >
                {{ isSaving ? '保存中...' : '保存' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 添加系列弹窗 -->
    <div 
      class="modal" 
      :style="{ display: seriesModalOpen ? 'flex' : 'none' }"
    >
      <div 
        class="modal-overlay"
        @click="closeSeriesModal"
      ></div>
      <div class="modal-content max-w-md w-full">
        <div class="modal-header p-4 border-b flex justify-between items-center">
          <h3 class="text-xl font-bold">添加系列</h3>
          <button 
            class="modal-close text-gray-500 hover:text-gray-700 text-2xl"
            @click="closeSeriesModal"
          >
            &times;
          </button>
        </div>
        
        <div class="modal-body p-6">
          <form @submit.prevent="saveSeries">
            <div class="form-group mb-4">
              <label class="form-label block mb-1 font-medium">系列ID</label>
              <input 
                type="text" 
                class="form-input w-full" 
                v-model="newSeries.id"
                required
              >
            </div>
            <div class="form-group mb-6">
              <label class="form-label block mb-1 font-medium">系列名称</label>
              <input 
                type="text" 
                class="form-input w-full" 
                v-model="newSeries.name"
                required
              >
            </div>
            
            <div class="flex justify-end gap-4">
              <button 
                type="button" 
                class="btn btn-secondary"
                @click="closeSeriesModal"
              >
                取消
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import productsData from '../data/products.js'
import seriesData from '../data/series.js'
import { useRouter } from 'vue-router'

const router = useRouter()

// 状态管理
const isLoading = ref(true)
const products = ref([])
const allProducts = ref([])
const series = ref([])
const seriesNameMap = ref({})
const adminSearchQuery = ref('')
const adminSelectedSeries = ref('')
const productModalOpen = ref(false)
const seriesModalOpen = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const selectedSeriesId = ref('')
const selectedProductId = ref('')
const selectedProduct = ref(null)
const editingSeries = ref(null)

// 表单数据
const formData = ref({
  id: '',
  name: '',
  seriesId: '',
  price: '',
  description: '',
  upperMaterial: '',
  innerMaterial: '',
  soleMaterial: '',
  customizable: 'false',
  minOrder: '',
  tags: [],
  images: []
})

const formTags = ref('')
const formImages = ref('')

// 新系列数据
const newSeries = ref({
  id: '',
  name: ''
})

// 计算属性
const adminProducts = computed(() => {
  let filtered = [...products.value]
  
  // 按系列筛选
  if (adminSelectedSeries.value) {
    filtered = filtered.filter(p => p.seriesId === adminSelectedSeries.value)
  }
  
  // 按搜索词筛选
  if (adminSearchQuery.value) {
    const query = adminSearchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query)
    )
  }
  
  return filtered
})

// 过滤当前选中系列的产品
const filteredProducts = computed(() => {
  let filtered = [...products.value]
  
  // 按选中系列筛选
  if (selectedSeriesId.value) {
    filtered = filtered.filter(p => p.seriesId === selectedSeriesId.value)
  }
  
  // 按搜索词筛选
  if (adminSearchQuery.value) {
    const query = adminSearchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query)
    )
  }
  
  return filtered
})

// 方法
const loadProductsData = async () => {
  try {
    isLoading.value = true
    
    // 模拟数据加载
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 使用生成的数据
    products.value = productsData
    allProducts.value = productsData
    
    // 使用生成的系列数据
    series.value = seriesData
    
    // 系列名称映射
    seriesNameMap.value = {}
    series.value.forEach(s => {
      seriesNameMap.value[s.id] = s.name
    })
    
  } catch (error) {
    console.error('Load products data error:', error)
  } finally {
    isLoading.value = false
  }
}

const goToHome = () => {
  router.push('/')
}

const openAddProductModal = () => {
  isEditing.value = false
  formData.value = {
    id: '',
    name: '',
    seriesId: '',
    price: '',
    description: '',
    upperMaterial: '',
    innerMaterial: '',
    soleMaterial: '',
    customizable: 'false',
    minOrder: '',
    tags: [],
    images: []
  }
  formTags.value = ''
  formImages.value = ''
  productModalOpen.value = true
}

const editProduct = (product) => {
  isEditing.value = true
  formData.value = { ...product }
  formTags.value = product.tags.join(', ')
  formImages.value = product.images.join(', ')
  productModalOpen.value = true
}

const closeProductModal = () => {
  productModalOpen.value = false
}

const saveProduct = async () => {
  try {
    isSaving.value = true
    
    // 处理标签和图片
    formData.value.tags = formTags.value.split(',').map(tag => tag.trim()).filter(tag => tag)
    formData.value.images = formImages.value.split(',').map(image => image.trim()).filter(image => image)
    
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (isEditing.value) {
      // 编辑现有产品
      const index = products.value.findIndex(p => p.id === formData.value.id)
      if (index > -1) {
        products.value[index] = { ...formData.value }
        allProducts.value[index] = { ...formData.value }
      }
    } else {
      // 添加新产品
      products.value.push({ ...formData.value })
      allProducts.value.push({ ...formData.value })
    }
    
    closeProductModal()
  } catch (error) {
    console.error('Save product error:', error)
  } finally {
    isSaving.value = false
  }
}

const deleteProduct = (productId) => {
  if (confirm('确定要删除这个产品吗？')) {
    products.value = products.value.filter(p => p.id !== productId)
    allProducts.value = allProducts.value.filter(p => p.id !== productId)
  }
}

const openAddSeriesModal = () => {
  newSeries.value = {
    id: '',
    name: ''
  }
  seriesModalOpen.value = true
}

const closeSeriesModal = () => {
  seriesModalOpen.value = false
}

const saveSeries = async () => {
  try {
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    series.value.push({ ...newSeries.value })
    seriesNameMap.value[newSeries.value.id] = newSeries.value.name
    
    closeSeriesModal()
  } catch (error) {
    console.error('Save series error:', error)
  }
}

const searchAdminProducts = () => {
  // 搜索逻辑已在计算属性中实现
}

const filterAdminProducts = () => {
  // 筛选逻辑已在计算属性中实现
}

// 选择系列
const selectSeries = (seriesId) => {
  selectedSeriesId.value = seriesId
  selectedProductId.value = ''
  selectedProduct.value = null
}

// 选择产品
const selectProduct = (product) => {
  selectedProductId.value = product.id
  selectedProduct.value = product
}

// 获取系列产品数量
const getSeriesProductCount = (seriesId) => {
  return products.value.filter(p => p.seriesId === seriesId).length
}

// 编辑系列
const editSeries = (seriesItem) => {
  editingSeries.value = { ...seriesItem }
  // 这里可以打开系列编辑弹窗
  const newName = prompt('请输入新的系列名称:', seriesItem.name)
  if (newName && newName.trim()) {
    const index = series.value.findIndex(s => s.id === seriesItem.id)
    if (index > -1) {
      series.value[index].name = newName.trim()
      seriesNameMap.value[seriesItem.id] = newName.trim()
    }
  }
}

// 调整系列顺序
const moveSeries = (index, direction) => {
  if (direction === -1 && index > 0) {
    // 向上移动
    const temp = series.value[index]
    series.value[index] = series.value[index - 1]
    series.value[index - 1] = temp
  } else if (direction === 1 && index < series.value.length - 1) {
    // 向下移动
    const temp = series.value[index]
    series.value[index] = series.value[index + 1]
    series.value[index + 1] = temp
  }
}

// 调整产品顺序
const moveProduct = (index, direction) => {
  if (!selectedSeriesId.value) return
  
  // 获取当前系列的产品
  const seriesProducts = products.value.filter(p => p.seriesId === selectedSeriesId.value)
  
  if (direction === -1 && index > 0) {
    // 向上移动
    const temp = seriesProducts[index]
    seriesProducts[index] = seriesProducts[index - 1]
    seriesProducts[index - 1] = temp
  } else if (direction === 1 && index < seriesProducts.length - 1) {
    // 向下移动
    const temp = seriesProducts[index]
    seriesProducts[index] = seriesProducts[index + 1]
    seriesProducts[index + 1] = temp
  }
  
  // 更新产品顺序
  let productIndex = 0
  products.value = products.value.map(p => {
    if (p.seriesId === selectedSeriesId.value) {
      return seriesProducts[productIndex++]
    }
    return p
  })
  allProducts.value = [...products.value]
}

// 删除系列
const deleteSeries = (seriesId) => {
  if (confirm('确定要删除这个系列吗？删除后该系列的所有产品也会被删除。')) {
    // 删除系列
    series.value = series.value.filter(s => s.id !== seriesId)
    // 删除该系列的所有产品
    products.value = products.value.filter(p => p.seriesId !== seriesId)
    allProducts.value = allProducts.value.filter(p => p.seriesId !== seriesId)
    // 清除选择
    if (selectedSeriesId.value === seriesId) {
      selectedSeriesId.value = ''
      selectedProductId.value = ''
      selectedProduct.value = null
    }
  }
}

// 更新产品信息
const updateProduct = () => {
  // 实时更新产品信息
  if (selectedProduct.value) {
    const index = products.value.findIndex(p => p.id === selectedProduct.value.id)
    if (index > -1) {
      products.value[index] = { ...selectedProduct.value }
      allProducts.value[index] = { ...selectedProduct.value }
    }
  }
}

// 保存产品详情
const saveProductDetails = () => {
  // 保存产品详情
  alert('产品详情已保存')
}

// 生命周期钩子
onMounted(() => {
  loadProductsData()
})
</script>

<style scoped>
/* 自定义样式 */
.form-input,
.form-select,
.form-textarea {
  @apply px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent;
}

.form-label {
  @apply block mb-1 font-medium;
}

.btn {
  @apply px-4 py-2 rounded-md font-medium transition-colors;
}

.btn-primary {
  @apply bg-primary text-white hover:bg-primary/90;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-800 hover:bg-gray-300;
}

.btn-danger {
  @apply bg-red-500 text-white hover:bg-red-600;
}

.modal {
  @apply fixed inset-0 flex items-center justify-center z-50;
}

.modal-overlay {
  @apply absolute inset-0 bg-black/50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl relative;
}

.series-tag {
  @apply px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors;
}
</style>