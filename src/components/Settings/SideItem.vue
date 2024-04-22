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
  router.push({name: "AdminSettingsTab", params: {tab: props.name}});
}

const activeClass = computed(() => {
  return props.active ? "btn-active" : ""
})
</script>

<template>
  <button
      :class="activeClass"
      class="btn btn-ghost btn-md normal-case w-full justify-start"
      @click="onClick">
    <span>{{ props.title }}</span>
  </button>
</template>

<style scoped>

</style>