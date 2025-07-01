<script setup lang="ts">
import { ref } from "vue";
import Topbar from "../components/app/Topbar.vue";
import Card from "../volt/Card.vue";
import SecondaryButton from "../volt/SecondaryButton.vue";
import LottieView from "../components/app/LottieView.vue";

const selectedFile = ref<File | null>(null);
const lottieData = ref<any>(null);
const fileInputRef = ref<HTMLInputElement>();
const isDragOver = ref(false);

const handleFileSelect = () => {
  fileInputRef.value?.click();
};

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    processFile(file);
  }
};

const processFile = async (file: File) => {
  if (file && file.type === "application/json") {
    selectedFile.value = file;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      lottieData.value = data;
    } catch (error) {
      alert("Error reading the file. Please select a valid JSON file.");
      selectedFile.value = null;
      lottieData.value = null;
    }
  } else {
    alert("Please select a valid JSON file");
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = true;
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;

  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    processFile(files[0]);
  }
};

const resetFile = () => {
  selectedFile.value = null;
  lottieData.value = null;
  fileInputRef.value!.value = "";
};
</script>

<template>
  <div class="flex h-screen w-full flex-col bg-surface-0 dark:bg-surface-950">
    <Topbar :hasFile="!!selectedFile" @reset="resetFile" />
    <main class="flex flex-1 bg-surface-0 dark:bg-surface-950">
      <input
        ref="fileInputRef"
        type="file"
        accept=".json"
        @change="handleFileChange"
        class="hidden"
      />

      <Card
        v-if="!selectedFile"
        class="w-96 h-60 self-center m-auto flex flex-col items-center justify-center border-2 border-dashed transition-colors cursor-pointer"
        :class="
          isDragOver
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20'
            : 'border-surface-300 dark:border-surface-600'
        "
        @click="handleFileSelect"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
      >
        <template #content>
          <div class="text-center space-y-4">
            <div class="text-surface-500 dark:text-surface-400">
              <p>
                {{
                  isDragOver
                    ? "Drop your Lottie file here"
                    : "Select a Lottie JSON file or drag and drop"
                }}
              </p>
            </div>
            <SecondaryButton
              :label="isDragOver ? 'Drop file' : 'Select file'"
              @click.stop="handleFileSelect"
            />
          </div>
        </template>
      </Card>

      <LottieView
        v-else
        :lottieData="lottieData"
        :fileName="selectedFile.name"
      />
    </main>
  </div>
</template>
