<script lang="ts" setup>
import {useRouter} from "vue-router";
import {computed} from "vue";

interface SettingsTabProps {
  name: string;
  title: string;
  to: string;
  active: boolean;
}

const props = defineProps<SettingsTabProps>();
const router = useRouter();

const onClick = () => {
  console.log(props.name)
  router.push({name: "AdminSettingsTab", params: {tab: props.name}});
}

const activeClass = computed(() => {
  return props.active ? "text-blue-500 !text-xl" : ""
})
</script>

<template>
  <div
      :class="activeClass"
      class="flex justify-center hover:cursor-pointer"
      @click="onClick">
    <span>{{ props.title }}</span>
  </div>
</template>

<style scoped>

</style>