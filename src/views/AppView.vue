<script setup lang="ts">
import { ref } from "vue";
import Topbar from "../components/app/Topbar.vue";
import Card from "../volt/Card.vue";
import SecondaryButton from "../volt/SecondaryButton.vue";
import LottieView from "../components/app/LottieView.vue";

const selectedFile = ref<File | null>(null);
const lottieData = ref<any>(null);
const fileInputRef = ref<HTMLInputElement>();

const handleFileSelect = () => {
  fileInputRef.value?.click();
};

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

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
        class="w-80 h-60 self-center m-auto flex flex-col items-center justify-center border-2 border-dashed border-surface-300 dark:border-surface-600"
      >
        <template #content>
          <div class="text-center space-y-4">
            <div class="text-surface-500 dark:text-surface-400">
              <p>Select a Lottie JSON file</p>
            </div>
            <SecondaryButton label="Select file" @click="handleFileSelect" />
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
