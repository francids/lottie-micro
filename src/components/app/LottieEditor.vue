<script setup lang="ts">
import { ref, watch } from "vue";
import InputNumber from "../../volt/InputNumber.vue";
import Slider from "../../volt/Slider.vue";

import LottieLayerEditor from './LottieLayerEditor.vue';

interface Layer {
  ind: number;
  ty: number;
  nm?: string;
  hd?: boolean;
  ks?: {
    o?: { k: number | number[] };
  };
  bm?: number;
  [key: string]: any;
}

interface Props {
  lottieData: any;
  animationColors: string[];
  originalFrameRate: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  updateDimensions: [width: number, height: number];
  updateSpeed: [speed: number];
  updateColor: [oldColor: string, newColor: string];
  updateLayerPropertyRequested: [payload: { index: number; propertyKey: string; value: any }];
  updateLayerOrderRequested: [payload: { oldIndex: number; newIndex: number }];
}>();

const editableWidth = ref(0);
const editableHeight = ref(0);
const editableSpeed = ref(1);

// Initialize values when lottieData changes
watch(
  () => props.lottieData,
  (newData) => {
    if (newData) {
      editableWidth.value = newData.w;
      editableHeight.value = newData.h;
    }
  },
  { immediate: true }
);

const handleDimensionUpdate = () => {
  emit("updateDimensions", editableWidth.value, editableHeight.value);
};

const handleSpeedUpdate = () => {
  emit("updateSpeed", editableSpeed.value);
};

const handleColorUpdate = (oldColor: string, newColor: string) => {
  emit("updateColor", oldColor, newColor);
};

const handleLayerPropertyUpdate = (payload: { index: number; propertyKey: string; value: any }) => {
  emit("updateLayerPropertyRequested", payload);
};

const handleLayerOrderUpdate = (payload: { oldIndex: number; newIndex: number }) => {
  emit("updateLayerOrderRequested", payload);
};

defineExpose({
  editableWidth,
  editableHeight,
  editableSpeed
});
</script>

<template>
  <div class="p-4 space-y-6 w-full h-full overflow-y-auto">
    <div class="space-y-4">
      <h3 class="font-medium text-lg text-surface-700 dark:text-surface-0">Edit Properties</h3>

      <!-- Dimensions -->
      <div class="space-y-3">
        <h4 class="font-medium text-sm text-surface-600 dark:text-surface-400">Dimensions</h4>
        <div class="space-y-2">
          <div>
            <label class="block text-xs text-surface-500 dark:text-surface-400 mb-1">Width</label>
            <InputNumber
              v-model="editableWidth"
              @update:model-value="handleDimensionUpdate"
              :min="1"
              :useGrouping="false"
              fluid
            />
          </div>
          <div>
            <label class="block text-xs text-surface-500 dark:text-surface-400 mb-1">Height</label>
            <InputNumber
              v-model="editableHeight"
              @update:model-value="handleDimensionUpdate"
              :min="1"
              :useGrouping="false"
              fluid
            />
          </div>
        </div>
      </div>

      <!-- Speed -->
      <div class="space-y-3">
        <h4 class="font-medium text-sm text-surface-600 dark:text-surface-400">Speed</h4>
        <div>
          <label class="block text-xs text-surface-500 dark:text-surface-400 mb-1">
            Speed ({{ editableSpeed }}x)
          </label>
          <Slider
            v-model="editableSpeed"
            @update:model-value="handleSpeedUpdate"
            :min="0.1"
            :max="3"
            :step="0.1"
            class="w-full"
          />
        </div>
      </div>

      <!-- Colors -->
      <div class="space-y-3">
        <h4 class="font-medium text-sm text-surface-600 dark:text-surface-400">Colors</h4>
        <div class="space-y-2" v-if="animationColors.length > 0">
          <div
            v-for="(color, index) in animationColors"
            :key="index"
            class="flex items-center space-x-2"
          >
            <div
              class="w-6 h-6 rounded border border-surface-300 dark:border-surface-600"
              :style="{ backgroundColor: color }"
            ></div>
            <input
              :value="color"
              @change="
                handleColorUpdate(
                  color,
                  ($event.target as HTMLInputElement).value
                )
              "
              type="color"
              class="flex-1 h-8 border border-surface-300 dark:border-surface-700 rounded-md cursor-pointer bg-surface-0 dark:bg-surface-950 enabled:hover:border-surface-400 dark:enabled:hover:border-surface-600 focus:border-primary focus:outline-hidden"
            />
          </div>
        </div>
        <div v-else class="text-xs text-surface-500 dark:text-surface-400 italic">
          No editable colors detected in this animation
        </div>
      </div>

      <!-- Layer Editor -->
      <div class="space-y-3" v-if="lottieData && lottieData.layers">
        <LottieLayerEditor
          :layers="lottieData.layers"
          @update-layer-property="handleLayerPropertyUpdate"
          @update-layer-order="handleLayerOrderUpdate"
        />
      </div>
      <div v-else class="text-xs text-surface-500 dark:text-surface-400 italic">
        Animation data or layers not available for editing.
      </div>
    </div>
  </div>
</template>
