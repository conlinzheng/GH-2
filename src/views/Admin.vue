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

    <!-- 主要内容 -->
    <main class="main flex-grow">
      <div class="container py-8">
        <!-- 管理面板标题 -->
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-2xl font-bold">后台管理</h2>
          <button 
            class="btn btn-primary" 
            @click="openAddProductModal"
          >
            添加产品
          </button>
        </div>

        <!-- 产品管理 -->
        <section class="products-management mb-12">
          <h3 class="text-xl font-semibold mb-4">产品管理</h3>
          
          <!-- 搜索和筛选 -->
          <div class="flex flex-wrap gap-4 mb-6">
            <div class="search-input-wrapper relative flex-grow">
              <input 
                type="text" 
                class="search-input w-full" 
                placeholder="搜索产品名称..."
                v-model="adminSearchQuery"
                @input="searchAdminProducts"
              >
            </div>
            <select 
              class="form-select px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              v-model="adminSelectedSeries"
              @change="filterAdminProducts"
            >
              <option value="">全部系列</option>
              <option v-for="series in series" :key="series.id" :value="series.id">
                {{ series.name }}
              </option>
            </select>
          </div>

          <!-- 产品列表 -->
          <div v-if="isLoading" class="loading flex flex-col items-center justify-center py-20">
            <div class="spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p class="mt-4">加载中...</p>
          </div>
          <div v-else-if="adminProducts.length === 0" class="text-center py-20">
            <p>暂无产品数据</p>
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="bg-gray-100">
                  <th class="px-4 py-3 border border-gray-300 text-left">ID</th>
                  <th class="px-4 py-3 border border-gray-300 text-left">名称</th>
                  <th class="px-4 py-3 border border-gray-300 text-left">系列</th>
                  <th class="px-4 py-3 border border-gray-300 text-left">价格</th>
                  <th class="px-4 py-3 border border-gray-300 text-left">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in adminProducts" :key="product.id" class="hover:bg-gray-50">
                  <td class="px-4 py-3 border border-gray-300">{{ product.id }}</td>
                  <td class="px-4 py-3 border border-gray-300">{{ product.name }}</td>
                  <td class="px-4 py-3 border border-gray-300">{{ seriesNameMap[product.seriesId] || product.seriesId }}</td>
                  <td class="px-4 py-3 border border-gray-300">{{ product.price }}</td>
                  <td class="px-4 py-3 border border-gray-300">
                    <div class="flex gap-2">
                      <button 
                        class="btn btn-secondary" 
                        @click="editProduct(product)"
                      >
                        编辑
                      </button>
                      <button 
                        class="btn btn-danger" 
                        @click="deleteProduct(product.id)"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- 系列管理 -->
        <section class="series-management">
          <h3 class="text-xl font-semibold mb-4">系列管理</h3>
          
          <div class="flex justify-between items-center mb-6">
            <div class="flex flex-wrap gap-2">
              <button 
                v-for="series in series" 
                :key="series.id"
                class="series-tag px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                {{ series.name }}
              </button>
            </div>
            <button 
              class="btn btn-secondary" 
              @click="openAddSeriesModal"
            >
              添加系列
            </button>
          </div>
        </section>
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

// 方法
const loadProductsData = async () => {
  try {
    isLoading.value = true
    
    // 模拟数据加载
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟产品数据
    const mockProducts = [
      {
        id: 'product1',
        seriesId: '1-PU系列',
        name: 'PU系列产品1',
        description: '这是一款优质的PU系列产品',
        price: '¥199',
        upperMaterial: 'PU',
        innerMaterial: '织物',
        soleMaterial: '橡胶',
        customizable: 'true',
        minOrder: '100',
        tags: ['新品', '热销'],
        images: [
          'https://via.placeholder.com/300x400',
          'https://via.placeholder.com/300x400?text=Image+2'
        ]
      },
      {
        id: 'product2',
        seriesId: '2-真皮系列',
        name: '真皮系列产品1',
        description: '这是一款优质的真皮系列产品',
        price: '¥399',
        upperMaterial: '真皮',
        innerMaterial: '真皮',
        soleMaterial: '真皮',
        customizable: 'true',
        minOrder: '50',
        tags: ['高端', '真皮'],
        images: [
          'https://via.placeholder.com/300x400?text=Leather+1',
          'https://via.placeholder.com/300x400?text=Leather+2'
        ]
      },
      {
        id: 'product3',
        seriesId: '3-短靴系列',
        name: '短靴系列产品1',
        description: '这是一款优质的短靴系列产品',
        price: '¥299',
        upperMaterial: 'PU',
        innerMaterial: '绒毛',
        soleMaterial: '橡胶',
        customizable: 'false',
        minOrder: '200',
        tags: ['冬季', '保暖'],
        images: [
          'https://via.placeholder.com/300x400?text=Boots+1',
          'https://via.placeholder.com/300x400?text=Boots+2'
        ]
      }
    ]
    
    products.value = mockProducts
    allProducts.value = mockProducts
    
    // 模拟系列数据
    series.value = [
      { id: '1-PU系列', name: 'PU系列' },
      { id: '2-真皮系列', name: '真皮系列' },
      { id: '3-短靴系列', name: '短靴系列' },
      { id: '4-乐福系列', name: '乐福系列' },
      { id: '5-春季', name: '春季' },
      { id: '6-夏季', name: '夏季' },
      { id: '7-秋季', name: '秋季' }
    ]
    
    // 系列名称映射
    seriesNameMap.value = {
      '1-PU系列': 'PU系列',
      '2-真皮系列': '真皮系列',
      '3-短靴系列': '短靴系列',
      '4-乐福系列': '乐福系列',
      '5-春季': '春季',
      '6-夏季': '夏季',
      '7-秋季': '秋季'
    }
    
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