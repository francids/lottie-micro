<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import InputText from '../../volt/InputText.vue';
import Button from '../../volt/Button.vue';
import Slider from '../../volt/Slider.vue';
// Assuming a simple Checkbox or Toggle component might be needed.
// For now, using a standard HTML checkbox.
// import Checkbox from '../../volt/Checkbox.vue'; // If available
import { BLEND_MODES, getBlendModeLabel, type BlendMode } from '../../utils/lottieUtils';

interface Layer {
  ind: number; // Index
  ty: number; // Type
  nm?: string; // Name
  hd?: boolean; // Hidden
  ks?: { // Transform
    o?: { k: number | number[] }; // Opacity (0-100 or array for animation)
    // Other transform properties like p, a, s, r exist but are not edited directly here yet
  };
  bm?: number; // Blend Mode
  // Other layer type specific properties
  [key: string]: any; // Allow other properties
}

interface Props {
  layers: Layer[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  updateLayerProperty: [payload: { index: number; propertyKey: string; value: any }];
  updateLayerOrder: [payload: { oldIndex: number; newIndex: number }];
}>();

// Local mutable copy for editing, if needed, or directly emit changes.
// For simplicity, we'll emit changes directly.

const getLayerOpacity = (layer: Layer): number => {
  if (layer.ks && layer.ks.o) {
    if (typeof layer.ks.o.k === 'number') {
      return layer.ks.o.k;
    }
    // If k is an array (animated property), return the first value or average,
    // or handle as per more detailed requirements. For now, take first.
    if (Array.isArray(layer.ks.o.k) && typeof layer.ks.o.k[0] === 'number') {
      return layer.ks.o.k[0];
    }
  }
  return 100; // Default to 100 if not defined
};

const updateName = (layerIndex: number, newName: string) => {
  emit('updateLayerProperty', { index: layerIndex, propertyKey: 'nm', value: newName });
};

const updateVisibility = (layerIndex: number, isHidden: boolean) => {
  emit('updateLayerProperty', { index: layerIndex, propertyKey: 'hd', value: isHidden });
};

const updateOpacity = (layerIndex: number, newOpacity: number) => {
  // Path to opacity is ks.o.k
  // Emitting a deep update might require special handling in the parent,
  // or the parent needs to know the full path.
  // For now, let's emit with a dot-separated path or a specific structure.
  emit('updateLayerProperty', { index: layerIndex, propertyKey: 'ks.o.k', value: newOpacity });
};

const updateBlendMode = (layerIndex: number, newBlendMode: number) => {
  emit('updateLayerProperty', { index: layerIndex, propertyKey: 'bm', value: newBlendMode });
};

const moveLayerUp = (layerActualIndex: number) => {
  if (layerActualIndex > 0) {
    emit('updateLayerOrder', { oldIndex: layerActualIndex, newIndex: layerActualIndex - 1 });
  }
};

const moveLayerDown = (layerActualIndex: number) => {
  if (layerActualIndex < props.layers.length - 1) {
    emit('updateLayerOrder', { oldIndex: layerActualIndex, newIndex: layerActualIndex + 1 });
  }
};

const availableBlendModes = computed(() => BLEND_MODES);

// Helper to get current blend mode or default
const getCurrentBlendModeValue = (layer: Layer): number => {
  return layer.bm === undefined ? 0 : layer.bm;
};

</script>

<template>
  <div class="space-y-3">
    <h4 class="font-medium text-sm text-surface-600 dark:text-surface-400">Layers</h4>
    <div v-if="layers && layers.length > 0" class="space-y-2">
      <!-- Lottie layers are typically rendered bottom-up, so we might want to reverse the list for display -->
      <div
        v-for="(layer, arrayIndex) in layers"
        :key="layer.ind"
        class="p-3 border border-surface-200 dark:border-surface-700 rounded-md space-y-2"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-surface-700 dark:text-surface-200">
            {{ layer.nm || `Layer ${layer.ind}` }} (Type: {{ layer.ty }})
          </span>
          <div class="flex space-x-1">
            <Button
              icon="pi pi-arrow-up"
              text
              size="sm"
              @click="moveLayerUp(arrayIndex)"
              :disabled="arrayIndex === 0"
              aria-label="Move layer up"
            />
            <Button
              icon="pi pi-arrow-down"
              text
              size="sm"
              @click="moveLayerDown(arrayIndex)"
              :disabled="arrayIndex === layers.length - 1"
              aria-label="Move layer down"
            />
          </div>
        </div>

        <!-- Name -->
        <div>
          <label :for="`layer-name-${layer.ind}`" class="block text-xs text-surface-500 dark:text-surface-400 mb-1">Name</label>
          <InputText
            :id="`layer-name-${layer.ind}`"
            :modelValue="layer.nm || ''"
            @update:modelValue="updateName(arrayIndex, $event)"
            placeholder="Layer Name"
            fluid
            class="text-sm"
          />
        </div>

        <!-- Visibility -->
        <div class="flex items-center space-x-2">
          <input
            type="checkbox"
            :id="`layer-visible-${layer.ind}`"
            :checked="!layer.hd"
            @change="updateVisibility(arrayIndex, !($event.target as HTMLInputElement).checked)"
            class="w-4 h-4 text-primary-600 bg-surface-100 border-surface-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-surface-800 focus:ring-2 dark:bg-surface-700 dark:border-surface-600"
          />
          <label :for="`layer-visible-${layer.ind}`" class="text-xs text-surface-500 dark:text-surface-400">Visible</label>
        </div>

        <!-- Opacity -->
        <div>
          <label :for="`layer-opacity-${layer.ind}`" class="block text-xs text-surface-500 dark:text-surface-400 mb-1">
            Opacity ({{ getLayerOpacity(layer) }}%)
          </label>
          <Slider
            :id="`layer-opacity-${layer.ind}`"
            :modelValue="getLayerOpacity(layer)"
            @update:modelValue="updateOpacity(arrayIndex, $event)"
            :min="0"
            :max="100"
            :step="1"
            class="w-full"
          />
        </div>

        <!-- Blend Mode -->
        <div>
          <label :for="`layer-blendmode-${layer.ind}`" class="block text-xs text-surface-500 dark:text-surface-400 mb-1">Blend Mode</label>
          <!-- Using a native select for now. Could be replaced with a Volt Dropdown if available and preferred -->
          <select
            :id="`layer-blendmode-${layer.ind}`"
            :value="getCurrentBlendModeValue(layer)"
            @change="updateBlendMode(arrayIndex, parseInt(($event.target as HTMLSelectElement).value))"
            class="w-full p-2 text-sm border border-surface-300 dark:border-surface-700 rounded-md cursor-pointer bg-surface-0 dark:bg-surface-900 text-surface-700 dark:text-surface-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option v-for="mode in availableBlendModes" :key="mode.value" :value="mode.value">
              {{ mode.label }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <div v-else class="text-xs text-surface-500 dark:text-surface-400 italic">
      No layers in this animation or data not loaded.
    </div>
  </div>
</template>

<style scoped>
/* Add any component-specific styles here if needed */
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1.25em 1.25em;
  padding-right: 2.5rem; /* Make space for the arrow */
}

.dark select {
    background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20fill%3D%22none%22%20stroke%3D%22%25239ca3af%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E');
}
</style>
