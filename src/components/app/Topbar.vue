<script setup lang="ts">
import SecondaryButton from "../../volt/SecondaryButton.vue";
import Toolbar from "../../volt/Toolbar.vue";
import AppLogo from "../common/AppLogo.vue";

interface Props {
  hasFile?: boolean;
}

withDefaults(defineProps<Props>(), {
  hasFile: false,
});

const emit = defineEmits<{
  reset: [];
}>();

const handleReset = () => {
  emit("reset");
};
</script>

<template>
  <Toolbar class="px-6 py-4">
    <template #start>
      <AppLogo class="h-5 w-auto" />
    </template>
    <template #end v-if="hasFile">
      <SecondaryButton label="Exit" @click="handleReset" size="small" />
    </template>
  </Toolbar>
</template>
