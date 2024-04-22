<script setup lang="ts">
interface LinkBar {
  name: string;
  text: string;
  url: string;
}

const props = defineProps<LinkBar>();
</script>

<template>
  <div class="z-30 px-3 py-4 bg-white flex flex-row w-full !space-x-4 border-b">
    <div class="flex flex-col">
      <h6 class="text-sm font-poppins-semi-bold">
        Click the link below to start using {{ props.name }} Chatbot!
      </h6>

      <div class="text-sm text-neutral-400 ml-2 flex flex-row items-center gap-1.5">
        <i class="material-icons !text-sm transition transform rotate-[135deg]">link</i>

        <a :href="props.url" target="_blank"
           class="text-xs text-neutral-400 ml-2 hover:text-neutral-600 underline">
          {{ props.text }}
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>