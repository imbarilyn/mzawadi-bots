<script setup lang="ts">
import {useTabsStore} from "../../stores/admin/tabs.ts";
import {useAdminHomeStore} from "../../stores/admin/home.ts";
import SidebarPageItem from "./SidebarPageItem.vue";

const tabsStore = useTabsStore();
const homeStore = useAdminHomeStore();

const openSearchModal = () => {
  homeStore.openSearchDialog();
}

</script>

<template>
  <!-- Sidebar -->
  <div id="application-sidebar"
       class="-translate-x-full transition-all duration-300 transform z-30 hidden absolute top-0 start-0 bottom-0 w-64 bg-white border-e border-gray-200 pb-10 overflow-y-auto md:block md:translate-x-0 md:end-auto md::bottom-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300">
<!--    <div class="px-6">-->
<!--      <p class="flex-none text-xl font-semibold dark:text-white" aria-label="Pages">-->
<!--        Pages-->
<!--      </p>-->
<!--    </div>-->

    <nav class="overflow-x-hidden hs-accordion-group p-6 w-full flex flex-col flex-wrap overflow-scroll">
      <ul class="space-y-1.5">

        <li class="w-full py-5">
          <button class="flex items-center gap-x-3.5 py-2 px-2.5 font-medium w-full text-sm text-slate-700 rounded-lg bg-gray-100 transition duration-150 ease-in-out hover:bg-gray-200 focus:outline-none focus:bg-gray-200 active:scale-95"
                  @click="openSearchModal">
            <i class="material-icons text-neutral-400 !text-2xl">search</i>
            <span class="hidden md:inline-block">
              Search Bots
            </span>
          </button>
        </li>

        <template v-for="(tab) in tabsStore.getOpenTabs" :key="tab.id">
          <SidebarPageItem :title="tab.title" :name="tab.name" :active="tab.active" :to="tab.to" :page-id="tab.pageId" />
        </template>

      </ul>
    </nav>
  </div>
  <!-- End Sidebar -->
</template>

<style scoped>

</style>