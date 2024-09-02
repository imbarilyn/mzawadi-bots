<script lang="ts" setup>
import {ref} from "vue";

export interface ThemeColors {
  name: string;
  textAreaColor: string;
  userBubble: string;
  chatBubble: string;
}

const themeColors = ref<ThemeColors []>([
  {
    name: "rose",
    userBubble: "bg-rose-300",
    chatBubble: 'bg-rose-100',
    textAreaColor: 'border-rose-200'

  },
  {
    name: "blue",
    userBubble: "bg-blue-300",
    chatBubble: 'bg-blue-100',
    textAreaColor: 'border-blue-200'
  },
  {
    name: "green",
    userBubble: "bg-green-300",
    chatBubble: 'bg-green-100',
    textAreaColor: 'border-green-200'
  }
])

const emits = defineEmits<{
  (event: 'selectedTheme', value: ThemeColors): void
}>()
const addTheme = (value: any) => {
  // console.log('theme added', value)
  emits('selectedTheme', value)
}
</script>

<template>
  <div v-for="color in themeColors" :key="color.name" class="py-1 bg-gray-100 px-2 rounded-s-md shadow-2xl">
    <div class="">
      <button :class="[color.userBubble]" class="btn btn-sm w-full"
              @click="addTheme(color)">
        <span>{{ color.name }}</span>
      </button>
    </div>
  </div>

</template>