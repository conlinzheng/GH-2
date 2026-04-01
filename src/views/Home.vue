<template>
  <div class="min-h-screen flex flex-col">
    <!-- 头部导航 -->
    <header class="header bg-white shadow-sm sticky top-0 z-30">
      <div class="container">
        <div class="flex items-center justify-between py-4">
          <div class="logo">
            <h1 class="text-2xl font-bold text-primary">GH5</h1>
          </div>
          <nav class="flex items-center gap-4">
            <button 
              class="nav-btn" 
              id="refresh-data" 
              aria-label="刷新数据" 
              title="刷新数据"
              @click="refreshData"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 10a6 6 0 0 1 6-6h4m0 0l-3-3m3 3l-3 3m3 9a6 6 0 0 1-6 6H6m0 0l3 3m-3-3l3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button 
              class="nav-btn" 
              id="history-toggle" 
              aria-label="浏览历史" 
              title="浏览历史"
              @click="toggleHistory"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button 
              class="nav-btn" 
              id="language-toggle" 
              aria-label="切换语言"
              @click="toggleLanguage"
            >
              <span class="lang-text">{{ currentLang === 'zh' ? 'ZH' : currentLang === 'en' ? 'EN' : 'KO' }}</span>
            </button>
          </nav>
        </div>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="main flex-grow">
      <div class="container py-8">
        <!-- 轮播图 -->
        <section class="carousel-section mb-8" id="carousel">
          <div class="carousel-container h-64 md:h-80 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg overflow-hidden relative">
            <div class="carousel-track" id="carousel-track">
              <div class="carousel-slide w-full h-full flex items-center justify-center">
                <div class="carousel-content text-center text-white px-4">
                  <h2 class="carousel-title text-3xl md:text-4xl font-bold mb-2" id="carousel-title">{{ carouselTitle }}</h2>
                  <p class="carousel-description text-lg md:text-xl" id="carousel-description">{{ carouselDescription }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 搜索框 -->
        <section class="search-section" id="search-section">
          <div class="search-container">
            <div class="search-input-wrapper relative">
              <input 
                type="text" 
                class="search-input" 
                id="search-input" 
                placeholder="搜索产品名称、标签..."
                v-model="searchQuery"
                @input="updateClearButtonVisibility"
                @keydown.enter="searchProducts"
              >
              <button 
                class="search-clear-btn" 
                id="search-clear" 
                aria-label="清除搜索" 
                @click="resetSearch"
                :style="{ display: showClearButton ? 'flex' : 'none' }"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            <button 
              class="search-btn" 
              id="search-btn" 
              aria-label="搜索"
              @click="searchProducts"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </section>

        <!-- 产品系列 -->
        <section class="products-section" id="products-section">
          <div class="products-container" id="products-container">
            <div v-if="isLoading" class="loading flex flex-col items-center justify-center py-20">
              <div class="spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p class="mt-4">加载中...</p>
            </div>
            <div v-else-if="products.length === 0" class="text-center py-20">
              <p>暂无产品数据</p>
            </div>
            <div v-else>
              <!-- 系列筛选 -->
              <div class="flex flex-wrap gap-2 mb-8" id="series-filter">
                <button 
                  class="series-filter px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors" 
                  :class="{ 'bg-primary text-white': selectedSeries === null }"
                  @click="filterBySeries(null)"
                >
                  全部
                </button>
                <button 
                  v-for="series in series" 
                  :key="series.id"
                  class="series-filter px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors" 
                  :class="{ 'bg-primary text-white': selectedSeries === series.id }"
                  @click="filterBySeries(series.id)"
                >
                  {{ series.name }}
                </button>
              </div>

              <!-- 产品列表 -->
              <div v-for="(seriesProducts, seriesId) in productsBySeries" :key="seriesId" class="series-section">
                <h2 class="series-title">{{ seriesNameMap[seriesId] || seriesId }}</h2>
                <div class="series-products-wrapper relative">
                  <button 
                    class="series-nav-btn left" 
                    @click="scrollSeries(seriesId, -1)"
                  >
                    &lt;
                  </button>
                  <div class="series-products" :data-series-id="seriesId">
                    <div 
                      v-for="product in seriesProducts" 
                      :key="product.id"
                      class="product-card min-w-[250px] w-[250px]"
                    >
                      <div 
                        class="product-image-container cursor-pointer" 
                        @click="showProductDetails(product)"
                      >
                        <div v-if="product.images.length > 1" class="product-image-carousel h-48 relative">
                          <div 
                            v-for="(image, index) in product.images" 
                            :key="index"
                            class="carousel-item absolute inset-0 transition-opacity duration-500" 
                            :class="{ 'opacity-100': currentSlide[product.id] === index, 'opacity-0': currentSlide[product.id] !== index }"
                          >
                            <img :src="encodeURIComponent(image)" :alt="product.name" class="w-full h-full object-cover">
                          </div>
                          <div class="carousel-controls absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                            <button 
                              v-for="(image, index) in product.images" 
                              :key="index"
                              class="carousel-dot w-2 h-2 rounded-full bg-white/50 hover:bg-white transition-colors" 
                              :class="{ 'bg-white': currentSlide[product.id] === index }"
                              @click="currentSlide[product.id] = index"
                            ></button>
                          </div>
                        </div>
                        <div v-else class="product-image h-48">
                          <img :src="encodeURIComponent(product.images[0])" :alt="product.name" class="w-full h-full object-cover">
                        </div>
                      </div>
                      <div class="product-info p-4">
                        <h3 class="product-name text-lg font-medium mb-1">{{ product.name }}</h3>
                        <p class="product-price text-primary font-bold mb-2">{{ product.price || '' }}</p>
                        <div v-if="product.tags && product.tags.length > 0" class="product-tags flex flex-wrap gap-1">
                          <span v-for="tag in product.tags" :key="tag" class="product-tag px-2 py-1 text-xs bg-gray-100 rounded-full">
                            {{ tag }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button 
                    class="series-nav-btn right" 
                    @click="scrollSeries(seriesId, 1)"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- 联系我们弹窗 -->
    <div 
      class="contact-modal" 
      id="contact-modal" 
      role="dialog" 
      aria-modal="true" 
      :aria-hidden="!contactModalOpen"
      :class="{ 'active': contactModalOpen }"
    >
      <div 
        class="contact-modal-overlay" 
        id="contact-modal-overlay"
        @click="closeContactModal"
      ></div>
      <div class="contact-modal-content">
        <button 
          class="contact-modal-close absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
          id="contact-modal-close" 
          aria-label="关闭"
          @click="closeContactModal"
        >
          &times;
        </button>
        
        <div class="contact-modal-body p-6 md:flex gap-6">
          <div class="contact-modal-left md:w-1/2 mb-6 md:mb-0">
            <h2 class="contact-company-name text-2xl font-bold mb-4" id="contact-company-name">{{ companyName }}</h2>
            <div class="contact-company-info space-y-3">
              <div 
                class="contact-info-item flex items-center gap-3" 
                id="contact-description-item"
                :style="{ display: companyDescription ? 'flex' : 'none' }"
              >
                <span class="contact-info-icon">📝</span>
                <span class="contact-info-text" id="contact-company-description">{{ companyDescription }}</span>
              </div>
              <div 
                class="contact-info-item flex items-center gap-3" 
                id="contact-address-item"
                :style="{ display: companyAddress ? 'flex' : 'none' }"
              >
                <span class="contact-info-icon">📍</span>
                <span class="contact-info-text" id="contact-company-address">{{ companyAddress }}</span>
              </div>
              <div 
                class="contact-info-item flex items-center gap-3" 
                id="contact-phone-item"
                :style="{ display: companyPhone ? 'flex' : 'none' }"
              >
                <span class="contact-info-icon">📞</span>
                <span class="contact-info-text" id="contact-company-phone">{{ companyPhone }}</span>
              </div>
              <div 
                class="contact-info-item flex items-center gap-3" 
                id="contact-email-item"
                :style="{ display: companyEmail ? 'flex' : 'none' }"
              >
                <span class="contact-info-icon">✉️</span>
                <span class="contact-info-text" id="contact-company-email">{{ companyEmail }}</span>
              </div>
              <div 
                class="contact-info-item flex items-center gap-3" 
                id="contact-wechat-item"
                :style="{ display: companyWechat ? 'flex' : 'none' }"
              >
                <span class="contact-info-icon">💬</span>
                <span class="contact-info-text" id="contact-company-wechat">{{ companyWechat }}</span>
              </div>
              <div 
                class="contact-info-item flex items-center gap-3" 
                id="contact-hours-item"
                :style="{ display: workingHours ? 'flex' : 'none' }"
              >
                <span class="contact-info-icon">🕐</span>
                <span class="contact-info-text" id="contact-working-hours">{{ workingHours }}</span>
              </div>
            </div>
          </div>
          
          <div class="contact-modal-right md:w-1/2">
            <h3 class="contact-form-title text-xl font-bold mb-4" id="contact-form-title">{{ contactFormTitle }}</h3>
            <form 
              class="contact-form space-y-4" 
              id="contact-form"
              @submit.prevent="submitContactForm"
            >
              <div class="form-group">
                <label for="name" class="form-label block mb-1 font-medium" id="label-name">{{ labelName }}</label>
                <input type="text" id="name" name="name" class="form-input w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required>
              </div>
              <div class="form-group">
                <label for="email" class="form-label block mb-1 font-medium" id="label-email">{{ labelEmail }}</label>
                <input type="email" id="email" name="email" class="form-input w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required>
              </div>
              <div class="form-group">
                <label for="message" class="form-label block mb-1 font-medium" id="label-message">{{ labelMessage }}</label>
                <textarea id="message" name="message" class="form-textarea w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" rows="4" required></textarea>
              </div>
              <button 
                type="submit" 
                class="btn btn-primary w-full py-2"
                id="submit-btn" 
                :data-text-submit="submitText"
                :data-text-submitting="submittingText"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? submittingText : submitText }}
              </button>
            </form>
            <div 
              id="form-message" 
              class="form-message mt-4 p-3 rounded-md" 
              :class="{ 'bg-green-100 text-green-700': formMessageType === 'success', 'bg-red-100 text-red-700': formMessageType === 'error' }"
              :style="{ display: formMessage ? 'block' : 'none' }"
            >
              {{ formMessage }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 产品详情弹窗 -->
    <div 
      class="modal product-modal" 
      id="product-modal" 
      role="dialog" 
      aria-modal="true" 
      :aria-hidden="!productModalOpen"
      :style="{ display: productModalOpen ? 'flex' : 'none' }"
    >
      <div 
        class="modal-overlay" 
        id="modal-overlay"
        @click="closeProductDetails"
      ></div>
      <div class="modal-content">
        <button 
          class="modal-close absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
          id="modal-close" 
          aria-label="关闭"
          @click="closeProductDetails"
        >
          &times;
        </button>
        
        <div class="modal-body p-6 md:flex gap-6">
          <!-- 左侧图片 -->
          <div class="modal-images md:w-1/2 mb-6 md:mb-0">
            <div class="main-image-container mb-4">
              <img 
                id="modal-main-image" 
                :src="selectedProduct?.images[0] ? encodeURIComponent(selectedProduct.images[0]) : ''" 
                :alt="selectedProduct?.name || ''" 
                class="w-full h-64 object-cover rounded-md cursor-pointer"
                @click="openLightbox(selectedProduct?.images[0])"
              >
              <div class="zoom-hint text-center text-sm text-gray-500 mt-1">点击查看大图</div>
            </div>
            <div class="modal-gallery-container relative">
              <button 
                class="gallery-nav gallery-nav-left absolute left-0 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                @click="navigateGallery(-1)" 
                aria-label="上一张"
              >
                &lt;
              </button>
              <div class="modal-gallery flex gap-2 overflow-x-auto pb-2" id="modal-gallery">
                <div 
                  v-for="(image, index) in selectedProduct?.images" 
                  :key="index"
                  class="modal-gallery-item flex-shrink-0 w-20 h-20"
                >
                  <img 
                    :src="encodeURIComponent(image)" 
                    :alt="index + 1" 
                    class="gallery-thumb w-full h-full object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                    @click="changeMainImage(image)"
                  >
                  <div class="gallery-thumb-label text-center text-xs text-gray-500 mt-1">图片 {{ index + 1 }}</div>
                </div>
              </div>
              <button 
                class="gallery-nav gallery-nav-right absolute right-0 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                @click="navigateGallery(1)" 
                aria-label="下一张"
              >
                &gt;
              </button>
            </div>
          </div>

          <!-- 右侧信息 -->
          <div class="modal-info md:w-1/2">
            <div class="modal-series text-sm text-gray-500 mb-2" id="modal-series">{{ selectedProduct?.seriesId }}</div>
            <h2 class="text-2xl font-bold mb-2" id="modal-product-name">{{ selectedProduct?.name }}</h2>
            <p class="modal-description text-gray-600 mb-4" id="modal-description">{{ selectedProduct?.description || '无描述' }}</p>
            
            <!-- 产品详细信息 -->
            <div class="product-specs space-y-2 mb-6">
              <div class="spec-item">
                <span class="spec-label font-medium">鞋面材质：</span>
                <span class="spec-value" id="spec-upper">{{ selectedProduct?.upperMaterial || '-' }}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label font-medium">内里材质：</span>
                <span class="spec-value" id="spec-inner">{{ selectedProduct?.innerMaterial || '-' }}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label font-medium">鞋底材质：</span>
                <span class="spec-value" id="spec-sole">{{ selectedProduct?.soleMaterial || '-' }}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label font-medium">是否支持定制：</span>
                <span class="spec-value" id="spec-customizable">{{ selectedProduct?.customizable ? (selectedProduct.customizable === 'true' ? '支持' : '不支持') : '-' }}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label font-medium">起订量：</span>
                <span class="spec-value" id="spec-min-order">{{ selectedProduct?.minOrder || '-' }}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label font-medium">价格：</span>
                <span class="spec-value text-primary font-bold" id="spec-price">{{ selectedProduct?.price || '-' }}</span>
              </div>
            </div>
            
            <div class="modal-actions">
              <button 
                class="contact-btn btn btn-primary w-full"
                @click="openContactModal"
              >
                联系我们
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 大图查看器 -->
    <div 
      class="lightbox" 
      id="lightbox" 
      @click="closeLightbox"
      :style="{ display: lightboxOpen ? 'flex' : 'none' }"
    >
      <div class="lightbox-content" @click.stop>
        <span 
          class="close-lightbox absolute top-4 right-4 text-white text-3xl cursor-pointer hover:text-gray-300"
          @click="closeLightbox"
        >
          &times;
        </span>
        <button 
          class="lightbox-nav lightbox-prev"
          @click="navigateLightbox(-1)" 
          title="上一张"
          :style="{ display: currentLightboxImages.length <= 1 ? 'none' : 'block' }"
        >
          ❮
        </button>
        <img 
          class="lightbox-image" 
          id="lightbox-image" 
          :src="encodeURIComponent(currentLightboxImage)" 
          alt=""
        >
        <button 
          class="lightbox-nav lightbox-next"
          @click="navigateLightbox(1)" 
          title="下一张"
          :style="{ display: currentLightboxImages.length <= 1 ? 'none' : 'block' }"
        >
          ❯
        </button>
        <div 
          class="lightbox-counter absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm"
          id="lightbox-counter"
          :style="{ display: currentLightboxImages.length <= 1 ? 'none' : 'block' }"
        >
          {{ currentLightboxIndex + 1 }} / {{ currentLightboxImages.length }}
        </div>
      </div>
    </div>

    <!-- 浏览历史弹出窗口 -->
    <div 
      class="history-sidebar" 
      id="history-sidebar"
      :class="{ 'active': historyOpen }"
    >
      <div class="history-sidebar-header p-4 border-b flex justify-between items-center">
        <h3 class="font-bold text-lg">浏览历史</h3>
        <button 
          class="history-close-btn text-gray-500 hover:text-gray-700 text-xl"
          id="history-close-btn"
          @click="toggleHistory"
        >
          &times;
        </button>
      </div>
      <div class="history-sidebar-content p-4">
        <div id="history-widget" class="history-widget">
          <div v-if="browseHistory.length === 0" class="text-center py-8 text-gray-500">
            暂无浏览历史
          </div>
          <div v-else class="space-y-4">
            <div 
              v-for="item in browseHistory" 
              :key="item.id"
              class="history-item flex gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              @click="viewHistoryProduct(item.id)"
            >
              <img :src="encodeURIComponent(item.images[0])" :alt="item.name" class="w-16 h-16 object-cover rounded">
              <div class="flex-grow">
                <h4 class="font-medium text-sm line-clamp-2">{{ item.name }}</h4>
                <p class="text-xs text-gray-500 mt-1">{{ item.seriesId }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ item.viewTime }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div 
      class="history-overlay" 
      id="history-overlay"
      :class="{ 'active': historyOpen }"
      @click="toggleHistory"
    ></div>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-social-links flex gap-4" id="footer-social-links">
            <a 
              v-for="(url, platform) in socialLinks" 
              :key="platform"
              :href="url" 
              class="social-link" 
              :class="platform"
              target="_blank"
              rel="noopener noreferrer"
              :title="platform.charAt(0).toUpperCase() + platform.slice(1)"
            >
              <svg v-if="platform === 'facebook'" viewBox="0 0 24 24" class="w-5 h-5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              <svg v-else-if="platform === 'instagram'" viewBox="0 0 24 24" class="w-5 h-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              <svg v-else-if="platform === 'twitter'" viewBox="0 0 24 24" class="w-5 h-5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              <svg v-else-if="platform === 'youtube'" viewBox="0 0 24 24" class="w-5 h-5"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              <svg v-else-if="platform === 'tiktok'" viewBox="0 0 24 24" class="w-5 h-5"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v6.16c0 2.52-1.12 4.84-3.11 6.23-2.23 1.56-5.16 1.67-7.6.16-2.25-1.39-3.77-3.91-3.77-6.47V1.91c.85.91 1.87 1.63 3.03 2.09 1.26.5 2.64.58 3.91.26V.02z"/></svg>
              <svg v-else-if="platform === 'telegram'" viewBox="0 0 24 24" class="w-5 h-5"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              <svg v-else-if="platform === 'whatsapp'" viewBox="0 0 24 24" class="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <svg v-else-if="platform === 'linkedin'" viewBox="0 0 24 24" class="w-5 h-5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              <svg v-else-if="platform === 'pinterest'" viewBox="0 0 24 24" class="w-5 h-5"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/></svg>
              <svg v-else-if="platform === 'weibo'" viewBox="0 0 24 24" class="w-5 h-5"><path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.597.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.596zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.194.573zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.809-.232-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.581-.18-.402-.71.388-1.151.436-2.003.003-2.705-.647-1.061-2.225-1.389-3.464-.996-.946.301-1.571.901-1.825 1.753-.277.939-.019 1.711.676 2.427.381.392.851.634 1.381.753.105.024.202.039.293.058-.089.278-.208.55-.333.811l-.001.001c-.336.703-.751 1.509-1.261 1.939-.107.091-.222.133-.336.159l-.003.001c-.232.053-.471.024-.689-.116l.002-.007c.271-.373.485-.815.485-1.373 0-.103-.012-.201-.031-.293l-.002-.012c.135-.016.27-.042.405-.075.449-.109.829-.367 1.119-.762.292-.399.498-.879.598-1.378l.008-.043c.016-.089.024-.178.024-.262 0-.066-.009-.129-.022-.191l.007.003c-.131.16-.27.315-.422.459-.449.425-.989.73-1.586.889l-.023.005c-.099.022-.195.035-.293.043-.198.014-.393.009-.584-.015l.025-.002-.001.001h.002c-.523-.069-1.022-.264-1.456-.572-.433-.309-.762-.718-.971-1.191l-.009-.021c-.204-.462-.289-.946-.262-1.405l-.001-.026c.015-.262.082-.521.194-.761.111-.239.272-.456.474-.637.201-.181.441-.311.706-.383.265-.073.543-.082.813-.034l.002-.003c.252-.044.504-.062.752-.052l.005-.001h.001c.234-.009.464-.008.691.004l-.024-.001h.002c.505.026.971.152 1.375.369.401.216.74.522.995.894l.013.019c.249.364.417.763.497 1.163l.002.012c.026.103.042.208.05.313l.001.013c-.007.009-.015.018-.021.027-.076.111-.162.215-.254.314-.252.268-.555.494-.896.669-.341.176-.714.302-1.099.373l-.013.002c-.098.019-.195.036-.293.047l-.002.001c-.103.012-.206.019-.309.02-.103.002-.205 0-.306-.009l-.002-.001c-.102-.008-.203-.023-.303-.044z"/></svg>
            </a>
          </div>
          <button 
            class="footer-contact-btn btn btn-primary py-2 px-6"
            id="footer-contact-btn"
            @click="openContactModal"
          >
            联系我们
          </button>
          <p class="footer-text" id="footer-text">&copy; 2026 GH5. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import productsData from '../data/products.js'
import seriesData from '../data/series.js'

// 状态管理
const isLoading = ref(true)
const products = ref([])
const allProducts = ref([])
const series = ref([])
const seriesNameMap = ref({})
const selectedSeries = ref(null)
const searchQuery = ref('')
const showClearButton = ref(false)
const currentLang = ref('zh')
const contactModalOpen = ref(false)
const productModalOpen = ref(false)
const lightboxOpen = ref(false)
const historyOpen = ref(false)
const selectedProduct = ref(null)
const currentLightboxImages = ref([])
const currentLightboxIndex = ref(0)
const currentLightboxImage = ref('')
const browseHistory = ref([])
const isSubmitting = ref(false)
const formMessage = ref('')
const formMessageType = ref('')

// 轮播图状态
const currentSlide = ref({})

// 配置和翻译
const carouselTitle = ref('欢迎来到 GH5')
const carouselDescription = ref('探索我们的优质产品')
const companyName = ref('关于我们')
const companyDescription = ref('')
const companyAddress = ref('')
const companyPhone = ref('')
const companyEmail = ref('')
const companyWechat = ref('')
const workingHours = ref('')
const contactFormTitle = ref('联系我们')
const labelName = ref('姓名')
const labelEmail = ref('邮箱')
const labelMessage = ref('留言')
const submitText = ref('提交')
const submittingText = ref('提交中...')

// 社交链接
const socialLinks = ref({
  facebook: '',
  instagram: '',
  twitter: '',
  youtube: '',
  tiktok: '',
  telegram: '',
  whatsapp: '',
  linkedin: '',
  pinterest: '',
  weibo: ''
})

// 计算属性
const productsBySeries = computed(() => {
  const filtered = selectedSeries.value 
    ? products.value.filter(p => p.seriesId === selectedSeries.value)
    : products.value
  
  return filtered.reduce((acc, product) => {
    if (!acc[product.seriesId]) {
      acc[product.seriesId] = []
    }
    acc[product.seriesId].push(product)
    return acc
  }, {})
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

const refreshData = () => {
  loadProductsData()
}

const filterBySeries = (seriesId) => {
  selectedSeries.value = seriesId
}

const searchProducts = () => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) {
    products.value = allProducts.value
    return
  }
  
  products.value = allProducts.value.filter(product => {
    return (
      product.name.toLowerCase().includes(query) ||
      (product.tags && product.tags.some(tag => tag.toLowerCase().includes(query)))
    )
  })
}

const resetSearch = () => {
  searchQuery.value = ''
  showClearButton.value = false
  products.value = allProducts.value
}

const updateClearButtonVisibility = () => {
  showClearButton.value = searchQuery.value.length > 0
}

const toggleLanguage = () => {
  const languages = ['zh', 'en', 'ko']
  const currentIndex = languages.indexOf(currentLang.value)
  currentLang.value = languages[(currentIndex + 1) % languages.length]
  updateTranslations()
}

const updateTranslations = () => {
  // 这里可以根据当前语言更新翻译
  if (currentLang.value === 'zh') {
    carouselTitle.value = '欢迎来到 GH5'
    carouselDescription.value = '探索我们的优质产品'
    companyName.value = '关于我们'
    contactFormTitle.value = '联系我们'
    labelName.value = '姓名'
    labelEmail.value = '邮箱'
    labelMessage.value = '留言'
    submitText.value = '提交'
    submittingText.value = '提交中...'
  } else if (currentLang.value === 'en') {
    carouselTitle.value = 'Welcome to GH5'
    carouselDescription.value = 'Explore our quality products'
    companyName.value = 'About Us'
    contactFormTitle.value = 'Contact Us'
    labelName.value = 'Name'
    labelEmail.value = 'Email'
    labelMessage.value = 'Message'
    submitText.value = 'Submit'
    submittingText.value = 'Submitting...'
  } else if (currentLang.value === 'ko') {
    carouselTitle.value = 'GH5에 오신 것을 환영합니다'
    carouselDescription.value = '우리의 고품질 제품을 탐색하세요'
    companyName.value = '회사 소개'
    contactFormTitle.value = '연락처'
    labelName.value = '이름'
    labelEmail.value = '이메일'
    labelMessage.value = '메시지'
    submitText.value = '제출'
    submittingText.value = '제출 중...'
  }
}

const openContactModal = () => {
  contactModalOpen.value = true
}

const closeContactModal = () => {
  contactModalOpen.value = false
}

const showProductDetails = (product) => {
  selectedProduct.value = product
  productModalOpen.value = true
  
  // 添加到浏览历史
  addToHistory(product)
}

const closeProductDetails = () => {
  productModalOpen.value = false
  selectedProduct.value = null
}

const openLightbox = (image) => {
  if (!selectedProduct.value) return
  
  currentLightboxImages.value = selectedProduct.value.images
  currentLightboxIndex.value = currentLightboxImages.value.indexOf(image)
  currentLightboxImage.value = image
  lightboxOpen.value = true
}

const closeLightbox = () => {
  lightboxOpen.value = false
}

const navigateLightbox = (direction) => {
  if (currentLightboxImages.value.length === 0) return
  
  currentLightboxIndex.value += direction
  
  if (currentLightboxIndex.value < 0) {
    currentLightboxIndex.value = currentLightboxImages.value.length - 1
  } else if (currentLightboxIndex.value >= currentLightboxImages.value.length) {
    currentLightboxIndex.value = 0
  }
  
  currentLightboxImage.value = currentLightboxImages.value[currentLightboxIndex.value]
}

const changeMainImage = (image) => {
  if (!selectedProduct.value) return
  
  const index = selectedProduct.value.images.indexOf(image)
  if (index > 0) {
    // 将选中的图片移到第一位
    const images = [...selectedProduct.value.images]
    images.splice(index, 1)
    images.unshift(image)
    selectedProduct.value = { ...selectedProduct.value, images }
  }
}

const navigateGallery = (direction) => {
  const gallery = document.querySelector('.modal-gallery')
  if (gallery) {
    const scrollAmount = 200
    gallery.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' })
  }
}

const scrollSeries = (seriesId, direction) => {
  const seriesContainer = document.querySelector(`.series-products[data-series-id="${seriesId}"]`)
  if (seriesContainer) {
    const scrollAmount = 300
    seriesContainer.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' })
  }
}

const toggleHistory = () => {
  historyOpen.value = !historyOpen.value
}

const addToHistory = (product) => {
  // 检查是否已经在历史记录中
  const existingIndex = browseHistory.value.findIndex(item => item.id === product.id)
  if (existingIndex > -1) {
    // 如果存在，移到最前面
    browseHistory.value.splice(existingIndex, 1)
  }
  
  // 添加到历史记录
  const historyItem = {
    id: product.id,
    name: product.name,
    seriesId: product.seriesId,
    images: product.images,
    viewTime: new Date().toLocaleString()
  }
  
  browseHistory.value.unshift(historyItem)
  
  // 限制历史记录数量
  if (browseHistory.value.length > 10) {
    browseHistory.value = browseHistory.value.slice(0, 10)
  }
}

const viewHistoryProduct = (productId) => {
  const product = allProducts.value.find(p => p.id === productId)
  if (product) {
    showProductDetails(product)
    toggleHistory()
  }
}

const submitContactForm = async () => {
  try {
    isSubmitting.value = true
    
    // 模拟表单提交
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    formMessage.value = '感谢您的留言！我们会尽快与您联系。'
    formMessageType.value = 'success'
    
    // 重置表单
    document.getElementById('contact-form').reset()
    
    // 5秒后隐藏消息
    setTimeout(() => {
      formMessage.value = ''
    }, 5000)
  } catch (error) {
    console.error('Form submission error:', error)
    formMessage.value = '提交失败，请稍后重试。'
    formMessageType.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}

// 生命周期钩子
onMounted(() => {
  loadProductsData()
  
  // 初始化轮播图状态
  products.value.forEach(product => {
    currentSlide.value[product.id] = 0
  })
})

// 监听产品变化，更新轮播图状态
watch(products, (newProducts) => {
  newProducts.forEach(product => {
    if (!currentSlide.value[product.id]) {
      currentSlide.value[product.id] = 0
    }
  })
}, { deep: true })
</script>
