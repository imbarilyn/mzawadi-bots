<script lang="ts" setup>
import { onMounted } from 'vue'
import { useColorGenerator } from '@/composables/color-generator'

interface FileItemProps {
  file: {
    documentName: string
    documentUrl: string
    createdAt: string
  }
}

const props = defineProps<FileItemProps>()

const { darkBgColor, setColor } = useColorGenerator(props.file.documentName)

onMounted(() => {
  console.log(props.file.documentUrl)
  setColor()
})
</script>
<template>
  <div
    class="group flex flex-col bg-white border border-gray-200 shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70"
  >
    <div :class="darkBgColor" class="h-40 flex flex-col justify-center items-center rounded-t-xl">
      <div class="bg-white h-20 w-20 rounded-lg flex justify-center items-center">
        <span class="material-icons-round !text-6xl">picture_as_pdf</span>
      </div>
    </div>
    <div class="h-35 p-4 md:p-6">
      <h3 class="text-xl font-semibold text-gray-800 dark:text-neutral-300 dark:hover:text-white">
        {{ props.file.documentName }}
      </h3>
      <p>
        {{ file.createdAt }}
      </p>
    </div>
    <div
      class="mt-auto flex border-t border-gray-200 divide-x divide-gray-200 dark:border-neutral-700 dark:divide-neutral-700"
    >
      <button
        class="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-es-xl bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
        href="#"
      >
        <span class="material-icons-round h-6 w-8">delete</span>
      </button>
      <a
        :href="file.documentUrl"
        class="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-ee-xl bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
        download="file"
        target="_blank"
      >
        <span class="material-icons-round">file_download</span>
      </a>
    </div>
  </div>
</template>
