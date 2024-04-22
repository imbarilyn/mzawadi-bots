<script lang="ts" setup>
import {onBeforeRouteUpdate, useRoute} from "vue-router";
import {markRaw, onMounted, ref} from "vue";
import {useSettingsTabStore} from "../../stores/settings";
import GeneralSettings from "../../components/Settings/GeneralSettings.vue";
import ThemeSettings from "../../components/Settings/ThemeSettings.vue";
import BrandingSettings from "../../components/Settings/BrandingSettings.vue";

const componentsArray = [
  {
    name: "General",
    component: GeneralSettings,
    to: "general"
  },
  {
    name: "Theme",
    component: ThemeSettings,
    to: "theme"
  },
  {
    name: "Branding",
    component: BrandingSettings,
    to: "branding"
  }
];

const route = useRoute();
const settingsTabStore = useSettingsTabStore();

onMounted(async () => {
  settingsTabStore.setActiveTab(<string>route.params.tab);
});

const settingsTabName = ref(route.params.tab);

const settingsTab = ref(settingsTabStore.getActiveTab);

// const activeComponent = markRaw(componentsArray.find((c) => c.name.toLowerCase() === settingsTab.value.name.toLowerCase()));
const activeComponent = ref(markRaw(componentsArray.find((c) => c.name.toLowerCase() === settingsTab.value.name.toLowerCase())));

onBeforeRouteUpdate((to, _from, next) => {
  settingsTabName.value = to.params.tab;

  settingsTabStore.setActiveTab(<string>to.params.tab);
  settingsTab.value = settingsTabStore.getActiveTab;
  activeComponent.value = markRaw(componentsArray.find((c) => c.name.toLowerCase() === settingsTab.value.name.toLowerCase()));

  next();
});
</script>

<template>
  <div class="flex flex-col flex-1">
    <Component :is="activeComponent.component" :key="activeComponent.name"/>
  </div>
</template>

<style scoped>

</style>