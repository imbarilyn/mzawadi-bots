<script lang="ts" setup>
import {RouterView} from "vue-router";
import {useAppHomeStore} from "./stores/home";

const appHomeStore = useAppHomeStore();

</script>

<template>
  <RouterView #default="{ Component, route }">
    <!--    <template v-if="!appHomeStore.isAppFetching">-->
    <template v-if="Component">
      <component :is="Component" :key="route.fullPath"/>
    </template>
    <!--    </template>-->
    <template v-else-if="appHomeStore.isAppFetching">
      <div class="flex flex-col items-center justify-center h-screen">
        <div class="flex flex-col items-center justify-center mx-auto space-y-2">
          <span class="loading loading-ball loading-lg"></span>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            Loading...
          </p>
        </div>
      </div>
    </template>
  </RouterView>
</template>

<style scoped></style>
