<script lang="ts" setup>
import {useRouter} from "vue-router";
import {useTabsStore} from "../../stores/admin/tabs.ts";

interface BarItemProps {
  name: string;
  title: string;
  to: string;
  active: boolean;
  pageId: string;
}

const props = defineProps<BarItemProps>();

const router = useRouter();

const tabsStore = useTabsStore();

const onClick = () => {
  // navigate to the tab

  setTimeout(async () => {
    try {
      // activate the tab
      await tabsStore.updateActiveTab(props.name);

      if (props.name === "Home") {
        await router.replace({name: "AdminHome", params: {page: props.to}, query: {pageId: props.pageId}});
        // router.go(0);
        return;
      } else if (props.name === "Settings") {
        await router.replace({name: "AdminSettingsTab", params: {tab: "General"}, query: {pageId: props.pageId}});
        // router.go(0);
        return;
      }

      await router.replace({name: "DynamicPage", params: {page: props.to}, query: {pageId: props.pageId}});
      // router.go(0);
    } catch (e) {
      console.log(e);
    }
  }, 300);
};

const onCloseTabClick = async (e: Event) => {
  e.stopPropagation();
  await tabsStore.closeTab(props.name);

  // get the new active tab
  const newActiveTab = tabsStore.getActiveTab;

  // if the new active tab is the home tab, navigate to the home page
  if (newActiveTab.name === "Home") {
    await router.replace({name: "AdminHome"});
    return;
  } else if (newActiveTab.name === "Settings") {
    await router.replace({name: "AdminSettings"});
    return;
  } else {
    // otherwise, navigate to the new active tab
    await router.replace({name: "DynamicPage", params: {page: newActiveTab.to}});
    return;
  }
};

</script>

<template>
  <div
      :class="props.active ? 'bg-white text-neutral-800' : 'bg-neutral-100 border-b text-neutral-400' "
      class="p-3 space-x-2 flex flex-row items-center justify-center border-l cursor-pointer group/bar-item"
      @click="onClick">
    <div class="flex items-center justify-center">
      <svg v-if="props.name === 'Home'" class="w-6 h-6 group-hover/bar-item:text-gray-800" fill="none"
           stroke="currentColor"
           stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            stroke-linecap="round"
            stroke-linejoin="round"/>
      </svg>
      <svg v-else-if="props.name === 'Settings'" class="w-6 h-6 group-hover/bar-item:text-gray-800" fill="none"
           stroke="currentColor"
           stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
            stroke-linecap="round"
            stroke-linejoin="round"/>
      </svg>
      <svg v-else :class="props.active ? 'text-primary' : 'text-neutral-400 group-hover/bar-item:text-gray-800'"
           class="w-6 h-6 transition-all duration-300 ease-in-out" fill="currentColor" viewBox="0 0 24 24"
           xmlns="http://www.w3.org/2000/svg">
        <path clip-rule="evenodd"
              d="M2.25 6a3 3 0 013-3h13.5a3 3 0 013 3v12a3 3 0 01-3 3H5.25a3 3 0 01-3-3V6zm3.97.97a.75.75 0 011.06 0l2.25 2.25a.75.75 0 010 1.06l-2.25 2.25a.75.75 0 01-1.06-1.06l1.72-1.72-1.72-1.72a.75.75 0 010-1.06zm4.28 4.28a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z"
              fill-rule="evenodd"/>
      </svg>
    </div>

    <div v-if="props.name !== 'Home'" class="">
      <h6 :class="props.active ? 'text-neutral-800 dark:text-neutral-50' : 'text-neutral-400 dark:text-neutral-300'"
          class="text-xxs md:text-xs font-semibold leading-tight tracking-wide group-hover/bar-item:text-neutral-800 group-hover/bar-item:dark:text-neutral-50 transition-all duration-300 ease-in-out">
        {{ props.title }}
      </h6>
    </div>
    <button v-if="props.name !== 'Home' && props.name !== 'Settings'" class="btn btn-ghost btn-xs btn-square z-30"
            @click.stop="onCloseTabClick">
      <i class="material-icons md-18 text-neutral-400 !text-base">
        close
      </i>
    </button>
  </div>
</template>

<style scoped>

</style>