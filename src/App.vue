<template>
  <div class="flex min-h-screen flex-col">
    <HeaderComponent />
    <RouterView class="flex-1" />
    <FooterComponent />
  </div>
</template>

<script setup>
  import FooterComponent from './components/FooterComponent.vue'
  import HeaderComponent from './components/HeaderComponent.vue'
</script>
