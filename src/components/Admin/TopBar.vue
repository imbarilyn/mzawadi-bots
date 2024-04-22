<script lang="ts" setup>
import {Tab, useTabsStore} from "../..//stores/admin/tabs.ts";
import {onUpdated, ref} from "vue";
import {useAdminHomeStore} from "../../stores/admin/home.ts";
import {useRouter} from "vue-router";

const tabsStore = useTabsStore();
const homeStore = useAdminHomeStore();

const homeTab = ref();
const settingsTab = ref();
const router = useRouter();

// const openTabs = ref<Tab[] | null>();

homeTab.value = tabsStore.getTabs.find((tab: Tab) => tab.name === "Home");
settingsTab.value = tabsStore.getTabs.find((tab: Tab) => tab.name === "Settings");


onUpdated(() => {
  homeTab.value = tabsStore.getOpenTabs.find((tab: Tab) => tab.name === "Home");
  settingsTab.value = tabsStore.getOpenTabs.find((tab: Tab) => tab.name === "Settings");
});

const openModal = () => {
  homeStore.openCreateDialog();
}

const openSearchModal = () => {
  homeStore.openSearchDialog();
}


const onSettingsClick = () => {
  // navigate to the tab

  setTimeout(async () => {
    try {
      // activate the tab
      await tabsStore.updateActiveTab("Settings");

      await  router.replace({name: "AdminSettingsTab", params: {tab: "General"}, query: {pageId: settingsTab.value?.pageId}});
    } catch (e) {
      console.log(e);
    }
  }, 300);
};

const activeTab = tabsStore.getActiveTab;
</script>

<template>
  <header class="z-30 flex flex-row w-full overflow-hidden p-2 border-b">
    <div class="h-10 sm:h-14 p-2 sm:p-3">
      <img src="/icon.png" class="w-full h-full object-center" alt="Bot Icon Img">
    </div>

    <span class="self-center material-icons-round text-2xl text-neutral-400">
      arrow_forward_ios
    </span>

    <div class="flex flex-row items-center w-full justify-between px-3">
      <div class="animate-slide-right flex items-center justify-center">
        <span class="self-center text-2xl font-poppins-bold whitespace-nowrap dark:text-white">{{ activeTab?.name }}</span>
      </div>

      <div class="flex flex-row">
        <div class="flex flex-row items-center justify-center">
          <button class="btn btn-sm btn-ghost normal-case rounded-full md:rounded-md font-medium"
                  @click="openSearchModal">
            <i class="material-icons text-neutral-400 !text-2xl">search</i>
            <span class="hidden md:inline-block">
              Search
            </span>
          </button>
          <button class="btn btn-sm btn-ghost rounded-full md:rounded-md normal-case font-medium"
                  @click="openModal">
            <i class="material-icons text-neutral-400 !text-2xl">add_box</i>
            <span class="hidden md:inline-block">
            New Bot
            </span>
          </button>
          <button class="btn btn-sm btn-ghost rounded-full md:rounded-md normal-case font-medium"
                  @click="onSettingsClick">
            <i class="material-icons text-neutral-400 !text-2xl">settings</i>
            <span class="hidden md:inline-block">
            Settings
            </span>
          </button>
        </div>
      </div>
    </div>
  </header>
<!--  <div class="z-30 bg-neutral-100 flex flex-row w-full overflow-hidden">-->
<!--    <div class="border-b p-2"></div>-->
<!--    <div class="px-3 py-2 flex flex-row items-center justify-start bg-neutral-100 border-y">-->
<!--      <h6 class="text-base font-semibold">-->
<!--        M-Zawadi-->
<!--      </h6>-->
<!--    </div>-->
<!--    &lt;!&ndash; Let's have the first default tab &ndash;&gt;-->
<!--    &lt;!&ndash;    <BarItem title="Home" icon="home" to="home" name="Home" active/>&ndash;&gt;-->
<!--    &lt;!&ndash; Let's loop through the opened tabs &ndash;&gt;-->
<!--    <BarItem v-if="homeTab" :active="homeTab.active" :icon="homeTab.icon" :name="homeTab.name"-->
<!--             :page-id="homeTab.pageId"-->
<!--             :title="homeTab.title" :to="homeTab.to"/>-->
<!--    <div class="flex flex-row w-8/12 overflow-auto">-->
<!--      <template v-for="(tab) in tabsStore.getOpenTabs">-->
<!--        <BarItem v-if="tab.name !== 'Settings' && tab.name !== 'Home'" :key="tab.name" :active="tab.active"-->
<!--                 :name="tab.name" :page-id="tab.pageId"-->
<!--                 :title="tab.title" :to="tab.to" icon="home"/>-->
<!--      </template>-->
<!--    </div>-->
<!--    <div class="flex flex-row items-center justify-start bg-neutral-100 grow border-y border-l">-->
<!--      <div class="p-3 flex items-center justify-center">-->
<!--        <button class="btn btn-xs btn-square btn-ghost" @click="openModal">-->
<!--          <i class="material-icons text-neutral-400 !text-base">add</i>-->
<!--        </button>-->
<!--      </div>-->
<!--    </div>-->
<!--    <BarItem :active="settingsTab.active" :icon="settingsTab.icon" :name="settingsTab.name"-->
<!--             :page-id="settingsTab.pageId"-->
<!--             :title="settingsTab.title" :to="settingsTab.to"/>-->
<!--    <div class="border-l border-b p-2"></div>-->
<!--  </div>-->
</template>

<style scoped>

</style>