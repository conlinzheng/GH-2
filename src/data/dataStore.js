// 数据存储模块，用于在不同组件之间共享数据
import { reactive } from 'vue'
import productsData from './products.js'
import seriesData from './series.js'

// 产品数据
const products = reactive(productsData)

// 系列数据
const series = reactive(seriesData)

// 系列名称映射
const seriesNameMap = reactive({})
series.forEach(s => {
  seriesNameMap[s.id] = s.name
})

export default {
  products,
  series,
  seriesNameMap
}