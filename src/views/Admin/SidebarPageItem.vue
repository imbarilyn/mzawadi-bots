<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useTabsStore } from '../../stores/admin/tabs'
import { onMounted } from 'vue'

interface SidebarPageItem {
  name: string
  title: string
  to: string
  active: boolean
  pageId: string
}

const props = defineProps<SidebarPageItem>()

const router = useRouter()
const tabsStore = useTabsStore()
const onClick = () => {
  // navigate to the tab

  setTimeout(async () => {
    try {
      // activate the tab
      await tabsStore.updateActiveTab(props.name)

      if (props.name === 'Home') {
        await router.replace({
          name: 'AdminHome',
          params: { page: props.to },
          query: { pageId: props.pageId }
        })
        // router.go(0);
        return
      } else if (props.name === 'Settings') {
        await router.replace({
          name: 'AdminSettingsTab',
          params: { tab: 'General' },
          query: { pageId: props.pageId }
        })
        // router.go(0);
        return
      }

      await router.push({
        name: 'DynamicPage',
        params: { pageId: props.pageId }
        // query: { pageId: props.pageId }
      })
      // router.go(0);
    } catch (e) {
      console.log(e)
    }
  }, 300)
}

onMounted(() => {
  console.log(props)
})

// const onCloseTabClick = async (e: Event) => {
//   e.stopPropagation();
//   await tabsStore.closeTab(props.name);
//
//   // get the new active tab
//   const newActiveTab = tabsStore.getActiveTab;
//
//   // if the new active tab is the home tab, navigate to the home page
//   if (newActiveTab.name === "Home") {
//     await router.replace({name: "AdminHome"});
//     return;
//   } else if (newActiveTab.name === "Settings") {
//     await router.replace({name: "AdminSettings"});
//     return;
//   } else {
//     // otherwise, navigate to the new active tab
//     await router.replace({name: "DynamicPage", params: {page: newActiveTab.to}});
//     return;
//   }
// };
</script>

<template>
  <li
    :class="[active ? 'bg-gray-100' : '', active ? 'text-blue-600' : '']"
    class="flex items-center w-full gap-x-3.5 py-2 px-2.5 text-sm text-slate-700 rounded-lg hover:bg-gray-100 group overflow-x-hidden transition duration-150 ease-in-out cursor-pointer active:scale-95"
    @click="onClick"
  >
    <span v-if="props.name === 'Home'" class="material-icons-outlined">home</span>
    <span v-else-if="props.name === 'Settings'" class="material-icons-outlined">settings</span>
    <span v-else class="material-icons-outlined text-xl block">description</span>
    <div class="relative grow whitespace-nowrap overflow-hidden text-ellipsis">
      {{ name }}

      <!--      <div-->
      <!--        :class="[active ? 'from-gray-100' : 'from-white group-hover:from-gray-100']"-->
      <!--        class="absolute bottom-0 right-0 top-0 w-8 bg-gradient-to-l to-transparent"-->
      <!--      ></div>-->
    </div>
  </li>
</template>

<style scoped></style>
