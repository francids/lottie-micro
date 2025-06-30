<script setup lang="ts">
import { ref, watch } from "vue";
import Splitter from "../../volt/Splitter.vue";
import SplitterPanel from "primevue/splitterpanel";
import LottieFileInfo from "./LottieFileInfo.vue";
import LottieControls from "./LottieControls.vue";
import LottiePreview from "./LottiePreview.vue";
import LottieEditor from "./LottieEditor.vue";
import { extractColors, updateColorInLottieData } from "../../utils/lottieUtils";

interface Props {
  lottieData: any;
  fileName: string;
}

const props = defineProps<Props>();

const isPlaying = ref(false);
const currentFrame = ref(0);
const totalFrames = ref(0);
const animationSpeed = ref(1);

// Editable properties
const editableWidth = ref(0);
const editableHeight = ref(0);
const editableSpeed = ref(1);
const animationColors = ref<string[]>([]);
const originalFrameRate = ref(0);

// Refs to child components
const previewRef = ref<InstanceType<typeof LottiePreview>>();
const editorRef = ref<InstanceType<typeof LottieEditor>>();

// Initialize values when lottieData changes
watch(
  () => props.lottieData,
  (newData) => {
    if (newData) {
      editableWidth.value = newData.w;
      editableHeight.value = newData.h;
      editableSpeed.value = animationSpeed.value;
      originalFrameRate.value = newData.fr;
      animationColors.value = extractColors(newData);
    }
  },
  { immediate: true }
);

const togglePlayback = () => {
  isPlaying.value = !isPlaying.value;
  previewRef.value?.togglePlayback();
};

const exportAnimation = () => {
  if (!props.lottieData) return;

  const dataStr = JSON.stringify(props.lottieData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = props.fileName.replace(".json", "_edited.json");
  link.click();

  URL.revokeObjectURL(url);
};

const updateDimensions = (width: number, height: number) => {
  if (!props.lottieData) return;

  props.lottieData.w = width;
  props.lottieData.h = height;
  editableWidth.value = width;
  editableHeight.value = height;
};

const updateSpeed = (speed: number) => {
  if (!props.lottieData) return;

  animationSpeed.value = speed;
  editableSpeed.value = speed;
  previewRef.value?.setSpeed(speed);

  props.lottieData.fr = originalFrameRate.value * speed;
};

const updateColor = (oldColor: string, newColor: string) => {
  if (!props.lottieData) return;

  const result = updateColorInLottieData(
    props.lottieData,
    oldColor,
    newColor,
    animationColors.value
  );
  
  animationColors.value = result.updatedColors;
  previewRef.value?.loadAnimation();
};

const handleFrameUpdate = (frame: number) => {
  currentFrame.value = frame;
};

const handlePlayStateUpdate = (playing: boolean) => {
  isPlaying.value = playing;
};

const handleAnimationLoaded = (frames: number) => {
  totalFrames.value = frames;
};
</script>

<template>
  <div class="flex flex-1 p-4 bg-surface-0 dark:bg-surface-950">
    <Splitter class="w-full h-full">
      <SplitterPanel :size="20" :minSize="15">
        <div class="p-4 space-y-6 w-full h-full">
          <LottieFileInfo 
            :lottie-data="lottieData" 
            :file-name="fileName" 
          />
          
          <LottieControls
            :is-playing="isPlaying"
            :file-name="fileName"
            :lottie-data="lottieData"
            @toggle-playback="togglePlayback"
            @export-animation="exportAnimation"
          />
        </div>
      </SplitterPanel>

      <SplitterPanel :size="55">
        <LottiePreview
          ref="previewRef"
          :lottie-data="lottieData"
          :editable-width="editableWidth"
          :editable-height="editableHeight"
          :animation-speed="animationSpeed"
          @frame-update="handleFrameUpdate"
          @play-state-update="handlePlayStateUpdate"
          @animation-loaded="handleAnimationLoaded"
        />
      </SplitterPanel>

      <SplitterPanel :size="25" :minSize="20">
        <LottieEditor
          ref="editorRef"
          :lottie-data="lottieData"
          :animation-colors="animationColors"
          :original-frame-rate="originalFrameRate"
          @update-dimensions="updateDimensions"
          @update-speed="updateSpeed"
          @update-color="updateColor"
        />
      </SplitterPanel>
    </Splitter>
  </div>
</template>
