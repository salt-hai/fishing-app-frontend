<template>
  <div class="venue-card" @click="handleClick">
    <div class="venue-card__image">
      <img :src="venue.cover_url" :alt="venue.venue_name" class="venue-card__img" />
      <div class="venue-card__badges">
        <span v-if="venue.badges?.recommend" class="venue-card__badge venue-card__badge--recommend">
          推荐
        </span>
        <span v-if="venue.badges?.hot" class="venue-card__badge venue-card__badge--hot">
          🔥 热门
        </span>
        <span v-if="venue.venue_score" class="venue-card__badge venue-card__badge--score">
          ⭐ {{ venue.venue_score.toFixed(1) }}
        </span>
      </div>
    </div>
    <div class="venue-card__info">
      <h3 class="venue-card__name">{{ venue.venue_name }}</h3>
      <div class="venue-card__location">
        📍 {{ venue.city }} {{ venue.district }}
      </div>
      <div class="venue-card__stats">
        <span class="venue-card__stat">
          👥 在线: {{ venue.online_count }}
        </span>
        <span class="venue-card__stat">
          🎣 在钓: {{ venue.fishing_count }}
        </span>
        <span class="venue-card__stat">
          ⭐ 收藏: {{ venue.favorite_count }}
        </span>
      </div>
      <div class="venue-card__tags">
        <span v-for="tag in tags" :key="tag" class="venue-card__tag" :class="`venue-card__tag--${tag.type}`">
          {{ tag.name }}
        </span>
      </div>
      <div class="venue-card__weather">
        <div class="venue-card__weather-item">
          <span class="venue-card__weather-icon">☀️</span>
          <span>{{ venue.temperature }}°C</span>
        </div>
        <div class="venue-card__weather-item">
          <span class="venue-card__weather-icon">💨</span>
          <span>风 {{ venue.wind_level }}级</span>
        </div>
        <div class="venue-card__weather-item highlight">
          <span class="venue-card__weather-icon">🐟</span>
          <span>鱼口 {{ venue.fish_mouth_level }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { VenueInfo } from '../../types/api.types'

interface Props {
  venue: VenueInfo
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'click', venue: VenueInfo): void
}>()

const tags = computed(() => {
  // 假设venue有tags数组，格式为：{ name: string, type: string }
  return [
    { name: '淡水钓', type: 'water' },
    { name: '鲫鱼', type: 'fish' },
    { name: '鲤鱼', type: 'fish' }
  ]
})

const handleClick = () => {
  emit('click', props.venue)
}
</script>

<style scoped>
.venue-card {
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
}

.venue-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
}

.venue-card__image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.venue-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.venue-card__badges {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  gap: 8px;
}

.venue-card__badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  backdrop-filter: blur(4px);
}

.venue-card__badge--recommend {
  background: rgba(0, 122, 255, 0.9);
}

.venue-card__badge--hot {
  background: rgba(239, 68, 68, 0.9);
}

.venue-card__badge--score {
  background: rgba(255, 255, 255, 0.95);
  color: #1F2937;
}

.venue-card__info {
  padding: 12px;
}

.venue-card__name {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 8px;
}

.venue-card__location {
  font-size: 13px;
  color: #6B7280;
  margin-bottom: 8px;
}

.venue-card__stats {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #6B7280;
}

.venue-card__stat {
  display: flex;
  align-items: center;
  gap: 4px;
}

.venue-card__tags {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.venue-card__tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.venue-card__tag--water {
  background: #007AFF;
  color: white;
}

.venue-card__tag--fish {
  background: #10B981;
  color: white;
}

.venue-card__weather {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #F9FAFB;
  border-radius: 8px;
  margin-top: 8px;
}

.venue-card__weather-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #6B7280;
}

.venue-card__weather-item.highlight {
  color: #10B981;
  font-weight: 500;
}

.venue-card__weather-icon {
  font-size: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .venue-card__stats {
    font-size: 12px;
    gap: 8px;
  }

  .venue-card__tags {
    gap: 6px;
  }

  .venue-card__weather {
    padding: 10px;
    font-size: 12px;
  }
}
</style>
