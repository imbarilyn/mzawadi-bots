<script lang="ts" setup>
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from '@headlessui/vue'
import {CheckIcon, ChevronUpDownIcon} from '@heroicons/vue/20/solid'
import {ref, watch} from "vue";
import type {ListOption} from "@/components/Admin/SidebarData.vue";

const props = defineProps<{ option: ListOption [] }>()

const emits = defineEmits<{
  (event: 'change', value: string): void
}>()

const selectedContext = ref(props.option[0])

watch(() => selectedContext.value, (newValue) => {
  console.log(newValue.value)
  emits('change', newValue.value as string)
})
</script>


<template>
  <Listbox v-model="selectedContext">
    <div class="relative">
      <ListboxButton
          class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm"
      >
        <span class="block truncate">{{ selectedContext.name }}</span>
        <span
            class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
        >
                        <ChevronUpDownIcon aria-hidden="true" class="h-5 w-5 text-gray-400"/>
                      </span>
      </ListboxButton>

      <transition
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
      >
        <ListboxOptions
            class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
        >
          <ListboxOption
              v-for="context in props.option"
              :key="context.name"
              v-slot="{ active, selected }"
              :value="context"
              as="template"
          >
            <li
                :class="[
                              active ? 'bg-sky-100 text-sky-900' : 'text-gray-900',
                              'relative cursor-default select-none py-2 pl-10 pr-4'
                            ]"
            >
                            <span
                                :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']"
                            >{{ context.name }}</span
                            >
              <span
                  v-if="selected"
                  class="absolute inset-y-0 left-0 flex items-center pl-3 text-sky-600"
              >
                              <CheckIcon aria-hidden="true" class="h-5 w-5"/>
                            </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>
