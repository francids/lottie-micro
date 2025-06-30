<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue";
import lottie from "lottie-web";

interface Props {
  lottieData: any;
  editableWidth: number;
  editableHeight: number;
  animationSpeed: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  frameUpdate: [frame: number];
  playStateUpdate: [isPlaying: boolean];
  animationLoaded: [totalFrames: number];
}>();

const lottieContainer = ref<HTMLElement>();
let animation: any = null;

const loadAnimation = async () => {
  await nextTick();

  if (lottieContainer.value && props.lottieData) {
    if (animation) {
      animation.destroy();
    }

    animation = lottie.loadAnimation({
      container: lottieContainer.value,
      renderer: "svg",
      loop: true,
      autoplay: false,
      animationData: props.lottieData,
    });

    const totalFrames = props.lottieData.op - props.lottieData.ip;
    emit("animationLoaded", totalFrames);

    animation.addEventListener("enterFrame", () => {
      emit("frameUpdate", Math.floor(animation.currentFrame));
    });

    animation.addEventListener("complete", () => {
      emit("playStateUpdate", false);
    });

    animation.setSpeed(props.animationSpeed);
  }
};

const togglePlayback = () => {
  if (!animation || !props.lottieData) return;
  animation.togglePause();
};

const setSpeed = (speed: number) => {
  if (animation) {
    animation.setSpeed(speed);
  }
};

onMounted(() => {
  if (props.lottieData) {
    loadAnimation();
  }
});

watch(
  () => props.lottieData,
  () => {
    if (props.lottieData) {
      loadAnimation();
    }
  }
);

watch(
  () => [props.editableWidth, props.editableHeight],
  () => {
    loadAnimation();
  }
);

watch(
  () => props.animationSpeed,
  (newSpeed) => {
    setSpeed(newSpeed);
  }
);

defineExpose({
  togglePlayback,
  setSpeed,
  loadAnimation
});
</script>

<template>
  <div class="p-4 w-full h-full">
    <h3 class="font-medium text-lg mb-4 text-surface-700 dark:text-surface-0">Preview</h3>
    <div class="flex items-center justify-center">
      <div
        v-if="lottieData"
        ref="lottieContainer"
        class="w-full h-full max-w-md max-h-md border border-surface-200 dark:border-surface-700 rounded bg-surface-0 dark:bg-surface-950"
        :style="{
          aspectRatio: `${editableWidth} / ${editableHeight}`,
        }"
      ></div>
    </div>
  </div>
</template>
