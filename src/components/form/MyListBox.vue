<script lang="ts" setup>

import {ref, watch} from 'vue'
import {Listbox, ListboxButton, ListboxOption, ListboxOptions,} from '@headlessui/vue'
import {CheckIcon, ChevronUpDownIcon} from '@heroicons/vue/20/solid'

interface Option {
  name: string;
  value: string | boolean | number;
}

interface MyListBoxProps {
  options: Option[];
  selectedValue: any;
}

const props = defineProps<MyListBoxProps>();

const selectedOption = ref(props.options.find(option => option.value === props.selectedValue));

const options = ref(props.options);

const emits = defineEmits<{
  (event: 'change', value: any): void;
}>();

watch(() => props.selectedValue, (newVal) => {
  selectedOption.value = options.value.find(option => option.value === newVal);
});

watch(() => selectedOption.value, (newVal) => {
  emits('change', newVal);
});
</script>

<template>
  <Listbox v-model="selectedOption">
    <div class="relative mt-1">
      <ListboxButton
          class="relative w-full input input-bordered input-primary text-start">
        <span class="block truncate text-sm">{{ selectedOption?.name }}</span>
        <span
            class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
        >
            <ChevronUpDownIcon
                aria-hidden="true"
                class="h-5 w-5 text-gray-400"
            />
          </span>
      </ListboxButton>

      <transition
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
      >
        <ListboxOptions
            class="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
        >
          <ListboxOption
              v-for="option in options"
              :key="option.name"
              v-slot="{ active, selected }"
              :value="option"
              as="template"
          >
            <li
                :class="[
                  active ? 'bg-sky-100 text-primary' : 'text-gray-900',
                  'relative cursor-default select-none py-2 pl-10 pr-4 h-10 flex items-center',
                ]"
            >
                <span
                    :class="[
                    selected ? 'font-medium' : 'font-normal',
                    'block truncate text-sm',
                  ]"
                >{{ option.name }}</span
                >
              <span
                  v-if="selected"
                  class="absolute inset-y-0 left-0 flex items-center pl-3 text-primary"
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

<style scoped>

</style>