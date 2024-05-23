<script lang="ts" setup>
import { usePageContentStore } from '@/stores/admin/page-data'

interface LinkBar {
  name: string
  text: string
  url: string
  chatbotId: string
  pageId: string
}

const usepageContentStore = usePageContentStore()

const props = defineProps<LinkBar>()
</script>

<template>
  <div class="z-30 px-3 py-4 bg-white flex flex-row w-full !space-x-4 border-b">
    <div class="flex flex-col">
      <h6 class="text-sm font-poppins-semi-bold">
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
  </div>
</template>

<style scoped></style>
