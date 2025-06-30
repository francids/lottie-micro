<script setup>
import AppLogo from "../common/AppLogo.vue";
</script>

<template>
  <footer
    class="bg-surface-50 dark:bg-surface-900 border-t border-surface-200 dark:border-surface-700"
  >
    <div class="max-w-7xl mx-auto px-6 py-12">
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0"
      >
        <!-- Logo and Description -->
        <div class="space-y-4">
          <AppLogo class="h-6 w-auto" />
          <p class="text-surface-600 dark:text-surface-400 text-sm max-w-md">
            A simple lottie editor for editing animations efficiently.
          </p>
        </div>

        <!-- Copyright -->
        <div>
          <p class="text-sm text-surface-500 dark:text-surface-400">
            © {{ new Date().getFullYear() }} Lottie Micro. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>
