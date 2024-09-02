<script lang="ts" setup>
import {useTabsStore} from '../../stores/admin/tabs'
import {onMounted} from 'vue'
import {useSettingsTabStore} from '../../stores/settings'
import SideItem from '../../components/Settings/SideItem.vue'

onMounted(() => {
  tabsStore.setActiveTabByPageName('settings')
})

const tabsStore = useTabsStore()
const settingsTabStore = useSettingsTabStore()

const settingsTabs = settingsTabStore.getSettingsTabs
</script>

<template>
  <section class="px-5 md:px-8 bg-white flex-1 overflow-hidden flex flex-col">
    <header
        class="py-3 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700"
    >
      <div class="flex items-center space-x-2 py-2">
        <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
          <path
              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
              stroke-linecap="round"
              stroke-linejoin="round"
          />
        </svg>
        <h4 class="text-lg font-semibold">Settings</h4>
      </div>
    </header>
    <section class="py-8 px-4 md:px-8 flex-1 flex flex-col w-full">

      <div class=" flex flex-row items-center gap-8 pb-6  border-b border-gray-200">
        <SideItem
            v-for="item in settingsTabs"
            :key="item.name"
            :active="item.active"
            :name="item.name"
            :title="item.title"
            :to="item.to"
        />
      </div>

      <div class="flex-1 overflow-hidden h-full">
        <div class="flex flex-1 overflow-auto h-full w-full justify-center">
          <RouterView #default="{ Component, route }">
            <Transition mode="out-in" name="fade-away">
              <component :is="Component" :key="route.fullPath"/>
            </Transition>
          </RouterView>
        </div>
      </div>
    </section>
  </section>
</template>

<style scoped>
.fade-away-enter-active {
  transition: opacity 0.3s ease-in-out;
}

.fade-away-enter-from {
  opacity: 0;
}

.fade-away-enter-to {
  opacity: 1;
}

.fade-away-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.fade-away-leave-from {
  opacity: 1;
}

.fade-away-leave-to {
  opacity: 0;
}
</style>
