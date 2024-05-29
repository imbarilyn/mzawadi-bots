<script setup lang="ts">

</script>

<template>
  <RouterView #default="{Component, route}">
    <transition>
<!--      <template v-if="Component">-->
        <component :is="Component" :key="route.fullPath">
        </component>
<!--      </template>-->
    </transition>

  </RouterView>
</template>