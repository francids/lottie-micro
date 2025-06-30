<script setup>
import AppLogo from "../common/AppLogo.vue";
</script>

<template>
  <footer class="bg-neutral-50 border-t border-neutral-200 mt-20">
    <div class="max-w-7xl mx-auto px-6 py-12">
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0"
      >
        <!-- Logo and Description -->
        <div class="space-y-4">
          <AppLogo class="h-6 w-auto" />
          <p class="text-neutral-600 text-sm max-w-md">
            A simple lottie editor for creating animations efficiently.
          </p>
        </div>

        <!-- Copyright -->
        <div>
          <p class="text-sm text-neutral-500">
            © {{ new Date().getFullYear() }} Lottie Micro. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>
