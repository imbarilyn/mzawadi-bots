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

const selectedTheme = ref<ThemeColors>()
const emits = defineEmits<{
  (event: 'selectedTheme', value: ThemeColors): void
  (event: 'addTheme', value: any): void
}>()
const setTheme = (value: any) => {
  selectedTheme.value = {...value}
  // console.log('selected theme', selectedTheme.value)
  emits('selectedTheme', value)
}

const AddTheme = () => {
  // emits('addTheme', selectedTheme.value)
  emits('addTheme', selectedTheme.value)

}

</script>

<template>
  <div class="flex flex-col shadow-md rounded-tr-2x py-1 px-2 bg-white space-y-1">
    <div v-for="color in themeColors" :key="color.name" class="">
      <div class="">
        <button :class="[color.userBubble,]"
                class="btn btn-sm w-full"
                @click="setTheme(color)">
          <span>{{ color.name }}</span>
        </button>
      </div>
    </div>
    <div class="w-full pt-4">
      <button
          :disabled="!selectedTheme" class="btn btn-sm btn-primary w-full"
          @click="AddTheme"><span class="text-xs">Add Theme</span></button>
    </div>

  </div>


</template>