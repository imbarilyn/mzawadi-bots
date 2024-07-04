<script lang="ts" setup>
import { onMounted } from 'vue'
import type { LinkItem } from '@/stores/admin/page-data'

interface PageDetails {
  pageId: string
  link: LinkItem
}

const props = defineProps<PageDetails>()
onMounted(() => {
  console.log('props', props)
})
</script>

<template>
  <div class="">
    <div class="max-w-[85rem] min-w-sm px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
      <!-- Grid -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          class="group flex flex-col h-full bg-white border border-gray-200 shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70"
        >
          <div class="h-52 flex flex-col justify-center items-center bg-blue-600 rounded-t-xl">
            <div class="bg-white h-20 w-20 rounded-lg flex justify-center items-center">
              <span class="material-icons-round !text-5xl rotate-[135deg]"> link </span>
            </div>
          </div>
          <div class="p-4 md:p-6 text-wrap">
            <h3
              class="text-xl font-semibold text-gray-800 dark:text-neutral-300 dark:hover:text-white"
            >
              {{ props.link.url }}
            </h3>
            <p class="mt-3 text-gray-500 dark:text-neutral-500">{{ props.link.description }}</p>
          </div>
          <div
            class="mt-auto flex border-t border-gray-200 divide-x divide-gray-200 dark:border-neutral-700 dark:divide-neutral-700"
          >
            <button
              class="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-es-xl bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
            >
              <span class="material-icons-round rotate-[135deg]"> link </span>

              Visit Link
            </button>
            <button
              class="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-ee-xl bg-white text-gray-400 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
            >
              <span class="material-icons-round h-6 w-8 text-gray-400">delete</span>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
