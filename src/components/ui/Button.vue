<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  variant: {
    type: String,
    default: "primary",
    validator: (value) =>
      ["primary", "secondary", "outline", "ghost"].includes(value),
  },
  size: {
    type: String,
    default: "md",
    validator: (value) => ["sm", "md", "lg"].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["click"]);

const buttonClasses = computed(() => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const variantClasses = {
    primary:
      "bg-sky-500 text-white hover:bg-sky-600 focus:ring-sky-400 active:bg-sky-700",
    secondary:
      "bg-neutral-50 text-neutral-800 hover:bg-neutral-100 focus:ring-neutral-400 active:bg-neutral-200",
    outline:
      "border border-sky-600 text-sky-600 hover:bg-sky-50 focus:ring-sky-500 active:bg-sky-100",
    ghost:
      "text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-500 active:bg-neutral-200",
  };

  return [
    baseClasses,
    sizeClasses[props.size],
    variantClasses[props.variant],
  ].join(" ");
});
</script>
