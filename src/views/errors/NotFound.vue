<script lang="ts" setup>

import {useRouter} from "vue-router";
import {ref} from "vue";
import {Tab, useTabsStore} from "../../stores/admin/tabs.ts";

const router = useRouter();
const tabsStore = useTabsStore();

const homeTab = ref();
homeTab.value = tabsStore.getTabs.find((tab: Tab) => tab.name === "Home");
const onGoBackHomeClick = async () => {
  await router.push({name: "AdminHome", params: {page: homeTab.value.to}, query: {pageId: homeTab.value.pageId}});
};
</script>

<template>
  <div class="flex-1 flex flex-col justify-center items-center h-screen">
    <img alt="404 error" class="w-1/4" src="../../assets/imgs/404-error.png"/>

    <div class="text-center">
      <h1 class="text-3xl font-bold text-neutral-900">Page not found</h1>
      <p class="text-neutral-500">The page you are looking for does not exist.</p>
    </div>

    <div class="mt-4">
      <button
          class="btn btn-primary btn-sm md:btn-md lg:btn-lg xl:btn-xl normal-case"
          @click="onGoBackHomeClick">
        Go back home
      </button>
    </div>
  </div>
</template>

<style scoped>

</style>