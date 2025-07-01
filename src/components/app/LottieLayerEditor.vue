<script setup lang="ts">
import { computed } from "vue";
import InputText from "../../volt/InputText.vue";
import Button from "../../volt/Button.vue";
import Slider from "../../volt/Slider.vue";
import Panel from "../../volt/Panel.vue";
import { BLEND_MODES, extractColorsFromLayer } from "../../utils/lottieUtils";

interface Layer {
  ind: number; // Index
  ty: number; // Type of the layer (e.g., shape, text, image, etc.)
  nm?: string; // Name
  hd?: boolean; // Hidden
  ks?: {
    // Transform
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
  updateLayerProperty: [
    payload: { index: number; propertyKey: string; value: any }
  ];
  updateLayerOrder: [payload: { oldIndex: number; newIndex: number }];
  updateLayerColor: [
    payload: {
      index: number;
      oldColor: string;
      newColor: string;
      path?: string;
    }
  ];
}>();

// Local mutable copy for editing, if needed, or directly emit changes.
// For simplicity, we'll emit changes directly.

const getLayerOpacity = (layer: Layer): number => {
  if (layer.ks && layer.ks.o) {
    if (typeof layer.ks.o.k === "number") {
      return layer.ks.o.k;
    }
    // If k is an array (animated property), return the first value or average,
    // or handle as per more detailed requirements. For now, take first.
    if (Array.isArray(layer.ks.o.k) && typeof layer.ks.o.k[0] === "number") {
      return layer.ks.o.k[0];
    }
  }
  return 100; // Default to 100 if not defined
};

const updateName = (layerIndex: number, newName: string) => {
  emit("updateLayerProperty", {
    index: layerIndex,
    propertyKey: "nm",
    value: newName,
  });
};

const updateOpacity = (layerIndex: number, newOpacity: number) => {
  emit("updateLayerProperty", {
    index: layerIndex,
    propertyKey: "ks.o.k",
    value: newOpacity,
  });
};

const updateBlendMode = (layerIndex: number, newBlendMode: number) => {
  emit("updateLayerProperty", {
    index: layerIndex,
    propertyKey: "bm",
    value: newBlendMode,
  });
};

const moveLayerUp = (layerActualIndex: number) => {
  if (layerActualIndex > 0) {
    emit("updateLayerOrder", {
      oldIndex: layerActualIndex,
      newIndex: layerActualIndex - 1,
    });
  }
};

const moveLayerDown = (layerActualIndex: number) => {
  if (layerActualIndex < props.layers.length - 1) {
    emit("updateLayerOrder", {
      oldIndex: layerActualIndex,
      newIndex: layerActualIndex + 1,
    });
  }
};

const availableBlendModes = computed(() => BLEND_MODES);

// Helper to get current blend mode or default
const getCurrentBlendModeValue = (layer: Layer): number => {
  return layer.bm === undefined ? 0 : layer.bm;
};

// Get unique colors for a specific layer with context
const getLayerColorContexts = (layer: Layer) => {
  const allColorContexts = extractColorsFromLayer(layer);
  const uniqueColors = new Map<string, any>();

  // Keep only the first occurrence of each color, preferring more specific types
  allColorContexts.forEach((context) => {
    if (!uniqueColors.has(context.color)) {
      uniqueColors.set(context.color, context);
    } else {
      // If we already have this color, keep the one with a more specific type
      const existing = uniqueColors.get(context.color);
      if (context.type !== "unknown" && existing.type === "unknown") {
        uniqueColors.set(context.color, context);
      }
    }
  });

  return Array.from(uniqueColors.values());
};

// Update color in a specific layer with optional path specificity
const updateLayerColor = (
  layerIndex: number,
  oldColor: string,
  newColor: string
) => {
  emit("updateLayerColor", {
    index: layerIndex,
    oldColor,
    newColor,
    // Don't pass path to update all instances of this color in the layer
    path: undefined,
  });
};
</script>

<template>
  <div class="space-y-3">
    <h4 class="font-medium text-sm text-surface-600 dark:text-surface-400">
      Layers
    </h4>
    <div v-if="layers && layers.length > 0" class="space-y-2">
      <!-- Lottie layers are typically rendered bottom-up, so we might want to reverse the list for display -->
      <Panel
        v-for="(layer, arrayIndex) in layers"
        :key="layer.ind"
        toggleable
        collapsed
        class="layer-panel"
      >
        <template #header>
          <div class="flex items-center justify-between w-full pr-2">
            <span
              class="text-xs font-semibold text-surface-700 dark:text-surface-200"
            >
              {{ layer.nm || `Layer ${layer.ind}` }} (Type: {{ layer.ty }})
            </span>
            <div class="flex items-center space-x-1">
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
        </template>

        <div class="space-y-3">
          <!-- Name -->
          <div>
            <label
              :for="`layer-name-${layer.ind}`"
              class="block text-xs text-surface-500 dark:text-surface-400 mb-1"
              >Name</label
            >
            <InputText
              :id="`layer-name-${layer.ind}`"
              :modelValue="layer.nm || ''"
              @update:modelValue="updateName(arrayIndex, $event)"
              placeholder="Layer Name"
              fluid
              class="text-sm"
            />
          </div>

          <!-- Opacity -->
          <div>
            <label
              :for="`layer-opacity-${layer.ind}`"
              class="block text-xs text-surface-500 dark:text-surface-400 mb-1"
            >
              Opacity ({{ getLayerOpacity(layer) }}%)
            </label>
            <Slider
              :id="`layer-opacity-${layer.ind}`"
              :modelValue="getLayerOpacity(layer)"
              @update:modelValue="(value: number) => {
                updateOpacity(arrayIndex, value);
              }"
              :min="0"
              :max="100"
              :step="1"
              class="w-full"
            />
          </div>

          <!-- Blend Mode -->
          <div>
            <label
              :for="`layer-blendmode-${layer.ind}`"
              class="block text-xs text-surface-500 dark:text-surface-400 mb-1"
              >Blend Mode</label
            >
            <!-- Using a native select for now. Could be replaced with a Volt Dropdown if available and preferred -->
            <select
              :id="`layer-blendmode-${layer.ind}`"
              :value="getCurrentBlendModeValue(layer)"
              @input="(event: any) => {
                updateBlendMode(
                  arrayIndex,
                  parseInt(event.target.value)
                );
              }"
              class="w-full p-2 text-sm border border-surface-300 dark:border-surface-700 rounded-md cursor-pointer bg-surface-0 dark:bg-surface-900 text-surface-700 dark:text-surface-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option
                v-for="mode in availableBlendModes"
                :key="mode.value"
                :value="mode.value"
              >
                {{ mode.label }}
              </option>
            </select>
          </div>

          <!-- Layer Colors -->
          <div v-if="getLayerColorContexts(layer).length > 0">
            <label
              class="block text-xs text-surface-500 dark:text-surface-400 mb-2"
            >
              Colors
            </label>
            <div class="space-y-2">
              <div
                v-for="(colorContext, colorIndex) in getLayerColorContexts(
                  layer
                )"
                :key="`${layer.ind}-${colorIndex}`"
                class="flex items-center space-x-2"
              >
                <div
                  class="w-6 h-6 rounded border border-surface-300 dark:border-surface-600 flex-shrink-0"
                  :style="{ backgroundColor: colorContext.color }"
                ></div>
                <div class="flex-1 min-w-0">
                  <span
                    class="text-xs text-surface-600 dark:text-surface-400 font-mono block"
                  >
                    {{ colorContext.color }}
                  </span>
                  <span
                    class="text-xs text-surface-400 dark:text-surface-500 capitalize"
                    v-if="colorContext.type !== 'unknown'"
                  >
                    {{ colorContext.type }}
                  </span>
                </div>
                <input
                  :value="colorContext.color"
                  @change="
                    updateLayerColor(
                      arrayIndex,
                      colorContext.color,
                      ($event.target as HTMLInputElement).value
                    )
                  "
                  type="color"
                  class="w-8 h-8 border border-surface-300 dark:border-surface-700 rounded cursor-pointer bg-surface-0 dark:bg-surface-950 flex-shrink-0"
                  :title="`Change ${colorContext.type} color ${colorContext.color}`"
                />
              </div>
            </div>
          </div>
          <div v-else>
            <label
              class="block text-xs text-surface-500 dark:text-surface-400 mb-1"
            >
              Colors
            </label>
            <p class="text-xs text-surface-400 dark:text-surface-500 italic">
              No editable colors found in this layer
            </p>
          </div>
        </div>
      </Panel>
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
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1.25em 1.25em;
  padding-right: 2.5rem; /* Make space for the arrow */
}

.dark select {
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20fill%3D%22none%22%20stroke%3D%22%25239ca3af%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E");
}

/* Custom styles for layer panels */
.layer-panel {
  margin-bottom: 0.5rem;
}

.layer-panel:last-child {
  margin-bottom: 0;
}

/* Ensure proper alignment of header elements */
.layer-panel :deep(.p-panel-header) {
  align-items: center;
}

.layer-panel :deep(.p-panel-header .p-panel-header-content) {
  flex: 1;
  display: flex;
  align-items: center;
}

.layer-panel :deep(.p-panel-toggle-button) {
  margin-left: 0.5rem;
  align-self: center;
}
</style>
