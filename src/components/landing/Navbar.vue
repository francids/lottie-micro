<script setup>
import AppLogo from "../common/AppLogo.vue";
import Button from "../ui/Button.vue";
</script>

<template>
  <nav class="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
    <AppLogo class="h-6 w-auto" />

    <Button @click="$router.push('/app')"> Open Editor </Button>
  </nav>
</template>
