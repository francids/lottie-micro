<script setup lang="ts">
import Button from "../../volt/Button.vue";
import SecondaryButton from "../../volt/SecondaryButton.vue";

interface Props {
  isPlaying: boolean;
  fileName: string;
  lottieData: any;
}

defineProps<Props>();

const emit = defineEmits<{
  togglePlayback: [];
  exportAnimation: [];
}>();

const handleTogglePlayback = () => {
  emit("togglePlayback");
};

const handleExportAnimation = () => {
  emit("exportAnimation");
};
</script>

<template>
  <div class="space-y-4">
    <h3 class="font-medium text-lg text-surface-700 dark:text-surface-0">Controls</h3>
    <div class="space-y-3">
      <SecondaryButton
        :label="isPlaying ? 'Pause' : 'Play'"
        @click="handleTogglePlayback"
        class="w-full"
      />
      <Button label="Export" @click="handleExportAnimation" class="w-full" />
    </div>
  </div>
</template>
