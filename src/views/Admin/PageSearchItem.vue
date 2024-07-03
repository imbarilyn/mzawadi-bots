<script lang="ts" setup>
import { useAdminHomeStore } from '../../stores/admin/home'
import { useTabsStore } from '../../stores/admin/tabs'
import { useRouter } from 'vue-router'
import { useColorGenerator } from '../../composables/color-generator'
import { onMounted } from 'vue'

interface PageItem {
  name: string
  path: string
  id: string
}

const props = defineProps<{
  page: PageItem
}>()

const { bgColor, bgHoverColor, textColor, setColor } = useColorGenerator(props.page.name)

onMounted(() => {
  setColor()
})

const homeStore = useAdminHomeStore()
const tabsStore = useTabsStore()
const router = useRouter()

const visitClick = () => {
  homeStore.closeSearchDialog()

  setTimeout(async () => {
    try {
      // activate the tab
      await tabsStore.updateActiveTab(props.page.name)

      if (props.page.name === 'Home') {
        await router.push({
          name: 'AdminHome',
          params: { page: props.page.path },
          query: { pageId: props.page.id }
        })
        return
      } else if (props.page.name === 'Settings') {
        await router.push({
          name: 'AdminSettingsTab',
          params: { tab: 'general' },
          query: { pageId: props.page.id }
        })
        return
      }

      await router.push({
        name: 'DynamicPage',
        params: { pageId: props.page.id }
      })
    } catch (e) {
      console.error(e)
    }
  }, 300)
}

const deleteClick = (e: any) => {
  e.stopPropagation()

  homeStore.closeSearchDialog()

  homeStore.openDeleteDialog()

  homeStore.setPageToDelete(props.page.id)
}
</script>

<template>
  <div
    :class="[bgHoverColor]"
    class="flex flex-row items-center space-x-2 p-6 rounded-md cursor-pointer transition duration-300 active:scale-95"
    @click="visitClick"
  >
    <div class="flex flex-row w-full justify-between">
      <div class="flex flex-row space-x-2">
        <div :class="[bgColor]" class="h-10 w-10 p-1 rounded-md flex justify-center items-center">
          <span :class="[textColor]" class="material-icons-outlined">description</span>
        </div>
        <div class="flex flex-col">
          <p :class="[textColor]" class="text-sm">
            {{ page.name }}
          </p>
          <p class="text-xs text-neutral-400">
            {{ page.name }}
          </p>
        </div>
      </div>
      <div class="flex flex-row items-center space-x-2">
        <button class="btn btn-sm btn-square btn-ghost" @click.prevent="visitClick">
          <i class="material-icons text-neutral-400 !text-xl">open_in_new</i>
        </button>
        <button class="btn btn-sm btn-square btn-ghost" @click.prevent="deleteClick($event)">
          <i class="material-icons-outlined text-red-500 !text-xl">delete</i>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
