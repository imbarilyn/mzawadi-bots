<script setup lang="ts">

</script>

<template>
  <div class="flex flex-col relative">
    <RouterView name="default" #default="{ Component, route }">
      <Transition name="route" mode="out-in" appear>
        <template v-if="Component">
          <component :is="Component" :key="route.fullPath"/>
        </template>
      </Transition>
    </RouterView>
  </div>
</template>

<style scoped>

</style>