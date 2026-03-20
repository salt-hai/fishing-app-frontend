<template>
  <button
    :type="type"
    :class="[
      'f-button',
      `f-button--${type}`,
      `f-button--${size}`,
      `f-button--${variant}`,
      {
        'f-button--disabled': disabled,
        'f-button--loading': loading
      }
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="f-button__loader">
      <svg class="f-button__spinner" viewBox="0 0 50 50">
        <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
      </svg>
    </span>
    <span class="f-button__content">
      <span v-if="icon" class="f-button__icon">
        {{ icon }}
      </span>
      <slot></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'default'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  disabled?: boolean
  loading?: boolean
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'default',
  size: 'md',
  disabled: false,
  loading: false,
  block: false
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.f-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 0.5rem;
}

.f-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.f-button:active:not(:disabled) {
  transform: translateY(0);
}

.f-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.f-button--loading {
  cursor: wait;
}

/* Variants */
.f-button--primary {
  background: #007AFF;
  color: white;
  border-color: #007AFF;
}

.f-button--primary:hover:not(:disabled) {
  background: #0056b3;
}

.f-button--secondary {
  background: #10B981;
  color: white;
  border-color: #10B981;
}

.f-button--secondary:hover:not(:disabled) {
  background: #059669;
}

.f-button--success {
  background: #10B981;
  color: white;
  border-color: #10B981;
}

.f-button--success:hover:not(:disabled) {
  background: #059669;
}

.f-button--warning {
  background: #F59E0B;
  color: white;
  border-color: #F59E0B;
}

.f-button--warning:hover:not(:disabled) {
  background: #D97706;
}

.f-button--danger {
  background: #EF4444;
  color: white;
  border-color: #EF4444;
}

.f-button--danger:hover:not(:disabled) {
  background: #DC2626;
}

.f-button--info {
  background: #3B82F6;
  color: white;
  border-color: #3B82F6;
}

.f-button--info:hover:not(:disabled) {
  background: #2563EB;
}

.f-button--default {
  background: white;
  color: #1F2937;
  border-color: #E5E7EB;
}

.f-button--default:hover:not(:disabled) {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

/* Sizes */
.f-button--sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

.f-button--md {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.f-button--lg {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

/* Block */
.f-button--block {
  width: 100%;
}

/* Icon */
.f-button__icon {
  font-size: 1rem;
}

/* Loader */
.f-button__spinner {
  animation: spin 1s linear infinite;
}

.f-button__spinner .path {
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  stroke-linecap: round;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
</style>
