<script setup>
import AppLogo from "../common/AppLogo.vue";
import Button from "../../volt/Button.vue";
</script>

<template>
  <nav class="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto bg-surface-0 dark:bg-surface-950">
    <AppLogo class="h-6 w-auto" />

    <Button label="Open editor" @click="$router.push('/app')" />
  </nav>
</template>
