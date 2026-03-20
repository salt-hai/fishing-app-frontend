<template>
  <div class="f-input-group">
    <label v-if="label" class="f-input__label">
      {{ label }}
    </label>
    <div class="f-input__wrapper">
      <input
        :type="type"
        :class="[
          'f-input',
          `f-input--${variant}`,
          `f-input--${size}`,
          {
            'f-input--error': error,
            'f-input--disabled': disabled,
            'f-input--loading': loading
          }
        ]"
        :placeholder="placeholder"
        :value="modelValue"
        :disabled="disabled || loading"
        @input="handleInput"
      />
      <span v-if="icon" class="f-input__icon">
        {{ icon }}
      </span>
      <span v-if="loading" class="f-input__loader">
        <svg class="f-input__spinner" viewBox="0 0 50 50">
          <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
        </svg>
      </span>
      <span v-if="error" class="f-input__error-icon">
        ⚠️
      </span>
    </div>
    <span v-if="error" class="f-input__error-text">
      {{ error }}
    </span>
    <span v-if="helper" class="f-input__helper">
      {{ helper }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label?: string
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'
  placeholder?: string
  variant?: 'default' | 'filled' | 'outlined'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  error?: string
  helper?: string
  disabled?: boolean
  loading?: boolean
  modelValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  variant: 'default',
  size: 'md',
  disabled: false,
  loading: false,
  modelValue: ''
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const modelValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  modelValue.value = target.value
}
</script>

<style scoped>
.f-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.f-input__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1F2937;
  margin-bottom: 0.25rem;
}

.f-input__wrapper {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid #E5E7EB;
  border-radius: 0.375rem;
  background: white;
  transition: all 0.2s ease;
}

.f-input__wrapper:focus-within {
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.f-input {
  flex: 1;
  padding: 0.75rem;
  font-size: 0.875rem;
  border: none;
  outline: none;
  background: transparent;
  color: #1F2937;
  font-weight: 400;
}

.f-input::placeholder {
  color: #9CA3AF;
}

.f-input--error {
  border-color: #EF4444;
}

.f-input--disabled {
  background: #F9FAFB;
  color: #9CA3AF;
  cursor: not-allowed;
}

.f-input__icon {
  position: absolute;
  right: 0.75rem;
  font-size: 1rem;
  color: #9CA3AF;
}

.f-input__loader {
  position: absolute;
  right: 0.75rem;
}

.f-input__spinner {
  animation: spin 1s linear infinite;
}

.f-input__spinner .path {
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  stroke-linecap: round;
}

.f-input__error-icon {
  position: absolute;
  right: 0.75rem;
  font-size: 1rem;
  color: #EF4444;
}

.f-input__error-text {
  font-size: 0.75rem;
  color: #EF4444;
  margin-top: 0.125rem;
}

.f-input__helper {
  font-size: 0.75rem;
  color: #6B7280;
  margin-top: 0.125rem;
}

/* Variants */
.f-input--filled {
  background: #F3F4F6;
  border-color: transparent;
}

.f-input--filled:focus-within {
  background: #F9FAFB;
  border-color: #007AFF;
}

.f-input--outlined {
  background: transparent;
  border: 2px solid #E5E7EB;
}

/* Sizes */
.f-input--sm {
  padding: 0.5rem;
  font-size: 0.8125rem;
}

.f-input--md {
  padding: 0.75rem;
  font-size: 0.875rem;
}

.f-input--lg {
  padding: 1rem;
  font-size: 1rem;
}

/* Icons and loaders */
.f-input__wrapper:focus-within ~ .f-input__icon {
  color: #007AFF;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
</style>
