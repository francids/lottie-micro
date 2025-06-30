<script setup lang="ts">
interface Props {
  lottieData: any;
  fileName: string;
}

defineProps<Props>();
</script>

<template>
  <div class="space-y-4">
    <h3 class="font-medium text-lg text-surface-700 dark:text-surface-0">File</h3>
    <div class="space-y-2 text-sm" v-if="lottieData">
      <div class="flex justify-between">
        <span class="text-surface-500 dark:text-surface-400">Name:</span>
        <span class="text-surface-700 dark:text-surface-0">{{ fileName }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-surface-500 dark:text-surface-400">Version:</span>
        <span class="text-surface-700 dark:text-surface-0">{{ lottieData.v }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-surface-500 dark:text-surface-400">FPS:</span>
        <span class="text-surface-700 dark:text-surface-0">{{ lottieData.fr }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-surface-500 dark:text-surface-400">Dimensions:</span>
        <span class="text-surface-700 dark:text-surface-0">{{ lottieData.w }}x{{ lottieData.h }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-surface-500 dark:text-surface-400">Duration:</span>
        <span class="text-surface-700 dark:text-surface-0">
          {{
            Math.round(
              ((lottieData.op - lottieData.ip) / lottieData.fr) * 100
            ) / 100
          }}s
        </span>
      </div>
    </div>
  </div>
</template>
