<script setup lang="ts">

</script>

<template>
  <div class="flex flex-col h-screen relative">
    <RouterView #default="{ Component, route }">
      <component :is="Component" :key="route.fullPath"/>
    </RouterView>
  </div>
</template>

<style scoped>

</style>