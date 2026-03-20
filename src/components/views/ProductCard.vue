<template>
  <div class="product-card" @click="handleClick">
    <div class="product-card__image">
      <img :src="product.cover_url" :alt="product.product_name" class="product-card__img" />
      <div class="product-card__badges">
        <span v-if="product.support_one_hour" class="product-card__badge product-card__badge--fast">
          ⚡ 1小时
        </span>
        <span v-if="product.support_next_day" class="product-card__badge product-card__badge--next-day">
          🚚 隔日达
        </span>
        <span v-if="product.support_installment" class="product-card__badge product-card__badge--installment">
          💳 分期
        </span>
        <span v-if="product.support_repair" class="product-card__badge product-card__badge--repair">
          🔧 维修
        </span>
      </div>
    </div>
    <div class="product-card__info">
      <div class="product-card__tags">
        <span v-for="tag in tags" :key="tag.name" class="product-card__tag">
          {{ tag.name }}
        </span>
      </div>
      <h3 class="product-card__name">{{ product.product_name }}</h3>
      <div class="product-card__price-row">
        <span class="product-card__price">
          ¥{{ product.sale_price.toFixed(2) }}
        </span>
        <span class="product-card__sales">
          已售 {{ product.sales_count }}
        </span>
      </div>
      <div class="product-card__services">
        <span v-if="product.support_one_hour" class="product-card__service">⚡</span>
        <span v-if="product.support_next_day" class="product-card__service">🚚</span>
        <span v-if="product.support_installment" class="product-card__service">💳</span>
        <span v-if="product.support_repair" class="product-card__service">🔧</span>
      </div>
      <button class="product-card__add-cart" @click.stop="handleAddCart">
        加入购物车
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProductInfo } from '../../types/api.types'

interface Props {
  product: ProductInfo
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'click', product: ProductInfo): void
  (e: 'add-cart', product: ProductInfo): void
}>()

const tags = computed(() => {
  // 假设product有tags数组
  return [
    { name: '钓竿', type: 'product' },
    { name: '鱼线', type: 'product' }
  ]
})

const handleClick = () => {
  emit('click', props.product)
}

const handleAddCart = () => {
  emit('add-cart', props.product)
}
</script>

<style scoped>
.product-card {
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
}

.product-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
}

.product-card__image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.product-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-card__badges {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  gap: 8px;
}

.product-card__badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  backdrop-filter: blur(4px);
}

.product-card__badge--fast {
  background: rgba(0, 122, 255, 0.9);
}

.product-card__badge--next-day {
  background: rgba(16, 185, 129, 0.9);
}

.product-card__badge--installment {
  background: rgba(245, 158, 11, 0.9);
}

.product-card__badge--repair {
  background: rgba(239, 68, 68, 0.9);
}

.product-card__info {
  padding: 16px;
}

.product-card__tags {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.product-card__tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: #F5F5F7;
  color: #1F2937;
}

.product-card__name {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 8px;
  line-height: 1.4;
}

.product-card__price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.product-card__price {
  font-size: 20px;
  font-weight: 700;
  color: #EF4444;
}

.product-card__sales {
  font-size: 13px;
  color: #6B7280;
}

.product-card__services {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.product-card__service {
  font-size: 16px;
}

.product-card__add-cart {
  width: 100%;
  padding: 10px;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.product-card__add-cart:hover {
  background: #0056b3;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 122, 255, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .product-card__name {
    font-size: 15px;
  }

  .product-card__price {
    font-size: 18px;
  }

  .product-card__add-cart {
    padding: 8px;
    font-size: 13px;
  }
}
</style>
