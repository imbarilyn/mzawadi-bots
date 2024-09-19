<script lang="ts" setup>
import {ref, watch} from 'vue'
import {RadioGroup, RadioGroupDescription, RadioGroupLabel, RadioGroupOption,} from '@headlessui/vue'
import MyRadioGroup from "@/components/form/MyRadioGroup.vue";

// eslint-disable-next-line no-redeclare
interface MyRadioGroup {
  name: string
  value: boolean
  icon: string
  description: string
}

interface ChatbotUserProps {
  chatbotUserType: MyRadioGroup []
}

const props = defineProps<ChatbotUserProps>()
const selected = ref()

const emits = defineEmits<{
  (event: 'change', value: MyRadioGroup): void;
}>();

watch(() => selected.value, (newVal) => {
  emits('change', newVal)
})
</script>


<template>
  <div class="w-full py-3">
    <div class="mx-auto w-full">
      <RadioGroup v-model="selected">
        <RadioGroupLabel class="sr-only">Server Size</RadioGroupLabel>
        <div class="space-y-2">
          <RadioGroupOption
              v-for="user in props.chatbotUserType"
              :key="user.name"
              v-slot="{ active, checked }"
              :value="user"
              as="template"
          >
            <div
                :class="[
                active
                  ? 'ring-2 ring-white/60 ring-offset-2 ring-offset-sky-300'
                  : '',
                checked ? 'bg-sky-900/75 text-white ' : 'bg-white',
              ]"
                class="relative flex cursor-pointer rounded-lg px-5 py-4 shadow-md focus:outline-none"
            >
              <div class="flex w-full items-center justify-between">
                <div class="flex items-center">
                  <div class="text-sm">
                    <div class="flex flex-row gap-3 items-center">
                      <RadioGroupLabel
                          :class="checked ? 'text-white' : 'text-gray-900'"
                          as="p"
                          class="font-medium col-span-1"
                      >
                        <span :class="[user.value? 'text-amber-600': 'text-fuchsia-600']"
                              class="material-icons ">{{
                            user.icon
                          }}</span>
                      </RadioGroupLabel>
                      <RadioGroupDescription
                          :class="checked ? 'text-sky-100' : 'text-gray-500'"
                          as="span"
                          class="col-span-1"
                      >
                        <p>{{ user.name }}</p>
                        <p>{{ user.description }}</p>

                      </RadioGroupDescription>
                    </div>
                  </div>
                </div>
                <div v-show="checked" class="shrink-0 text-white">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <circle
                        cx="12"
                        cy="12"
                        fill="#fff"
                        fill-opacity="0.2"
                        r="12"
                    />
                    <path
                        :style="{stroke: 'white'}"
                        d="M7 13l3 3 7-7"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </RadioGroupOption>
        </div>
      </RadioGroup>
    </div>
  </div>
</template>

