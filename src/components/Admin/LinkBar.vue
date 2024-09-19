<script lang="ts" setup>
import {usePageContentStore} from '@/stores/admin/page-data'
import {useRouter} from 'vue-router'
import {type Tab, useTabsStore} from "@/stores/admin/tabs";
import {onUpdated, ref} from "vue";


interface LinkBar {
  name: string
  text: string
  url: string
  chatbotId: string
  pageId: string
}

const tabsStore = useTabsStore()
const router = useRouter()

const props = defineProps<LinkBar>()

const homeTab = ref()
const settingsTab = ref()

// const openTabs = ref<Tab[] | null>();

homeTab.value = tabsStore.getTabs.find((tab: Tab) => tab.name === 'Home')
settingsTab.value = tabsStore.getTabs.find((tab: Tab) => tab.name === 'Settings')

onUpdated(() => {
  homeTab.value = tabsStore.getOpenTabs.find((tab: Tab) => tab.name === 'Home')
  settingsTab.value = tabsStore.getOpenTabs.find((tab: Tab) => tab.name === 'Settings')
})


const onSettingsClick = () => {
  // chatbotStore.pgSlug = props.url
  // console.log(chatbotStore.pgSlug)
  const pageStore = usePageContentStore()
  console.log(props)
  // navigate to the tab

  setTimeout(async () => {
    console.log()
    try {
      // activate the tab
      await tabsStore.updateActiveTab('Settings')
      console.log(props.name)
      await router.push({
        name: 'AdminSettingsTab',
        params: {tab: 'General'},
        query: {pageId: settingsTab.value?.pageId},
      })
    } catch (e) {
      console.log(e)
    }
  }, 300)
}
</script>

<template>
  <div class="z-30 px-3 py-4 bg-white flex flex-row justify-between w-full !space-x-4 border-b">
    <div class="flex flex-col">
      <h6 class="text-sm font-poppins-semi-bold text-nowrap">
        Click the link below to start using {{ props.name }} Chatbot!
      </h6>

      <div class="text-sm text-neutral-400 ml-2 flex flex-row items-center gap-1.5">
        <i class="material-icons !text-sm transition transform rotate-[135deg]">link</i>

        <RouterLink
            :to="props.url"
            class="text-xs text-neutral-400 ml-2 hover:text-neutral-600 underline"
            target="_blank"
        >
          {{ props.text }}
        </RouterLink>

        <!--        <RouterView>-->
        <!--          <component  :is ="UsersPage"/>-->
        <!--        </RouterView>-->
      </div>

    </div>
    <div class="flex ">
      <button
          class="btn btn-sm btn-ghost rounded-full md:rounded-md normal-case font-medium"
          @click="onSettingsClick"
      >
        <i class="material-icons text-neutral-400 !text-md">settings</i>
        <span class="hidden md:inline-block"> Settings </span>
      </button>
    </div>
  </div>
</template>

<style scoped></style>
