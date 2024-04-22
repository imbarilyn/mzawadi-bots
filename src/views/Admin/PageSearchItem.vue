<script setup lang="ts">
import {useAdminHomeStore} from "../../stores/admin/home.ts";
import {useTabsStore} from "../../stores/admin/tabs.ts";
import {useRouter} from "vue-router";
import {useColorGenerator} from "../../composables/color-generator.ts";
import {onMounted} from "vue";

interface PageItem {
  name: string;
  path: string;
  id: string;
}

const props = defineProps<{
  page: PageItem;
}>();

const {
  bgColor,
  bgHoverColor,
  textColor,
  setColor,
} = useColorGenerator(props.page.name);

onMounted(() => {
  setColor();
});

const homeStore = useAdminHomeStore();
const tabsStore = useTabsStore();
const router = useRouter();

const visitClick = () => {
  homeStore.closeSearchDialog();

  setTimeout(async () => {
    try {

      // activate the tab
      await tabsStore.updateActiveTab(props.page.name);

      if (props.page.name === "Home") {
        await router.push({name: "AdminHome", params: {page: props.page.path}, query: {pageId: props.page.id}});
        return;
      } else if (props.page.name === "Settings") {
        await router.push({name: "AdminSettingsTab", params: {tab: "general"}, query: {pageId: props.page.id}});
        return;
      }

      await router.push({name: "DynamicPage", params: {page: props.page.path}, query: {pageId: props.page.id}});
    } catch (e) {
      console.error(e);
    }
  }, 300);
};

const deleteClick = (e) => {
  e.stopPropagation();

  homeStore.closeSearchDialog();

  homeStore.openDeleteDialog();

  homeStore.setPageToDelete(props.page.id);
}
</script>

<template>
  <div
      class="flex flex-row items-center space-x-2 p-2 rounded-md cursor-pointer transition duration-300 active:scale-95"
      :class="[bgHoverColor]"
      @click="visitClick">
    <div class="flex flex-row w-full justify-between">
      <div class="flex flex-row space-x-2">
        <div class="h-10 w-10 p-1 rounded-md" :class="[bgColor]">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-full h-full" :class="[textColor]"
               width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
               preserveAspectRatio="xMidYMid meet">
            <metadata>
              Created by potrace 1.16, written by Peter Selinger 2001-2019
            </metadata>
            <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
               fill="currentColor" stroke="none">
              <path d="M1120 4944 c-212 -45 -390 -225 -435 -439 -22 -105 -22 -3795 0
-3900 34 -164 148 -314 295 -388 141 -71 68 -68 1573 -65 l1352 3 66 22 c170
58 304 191 367 364 l27 74 3 1500 c1 825 0 1511 -3 1525 -7 28 -1252 1282
-1297 1306 -40 21 -1850 20 -1948 -2z m1772 -601 c4 -377 5 -378 31 -459 48
-146 152 -266 289 -335 108 -54 148 -59 551 -59 l367 0 -2 -1422 -3 -1423 -22
-47 c-30 -66 -105 -143 -172 -175 l-56 -28 -1355 0 -1355 0 -56 28 c-67 32
-142 109 -172 175 l-22 47 -3 1890 c-2 2075 -6 1940 58 2037 38 57 86 94 159
125 l56 23 852 0 851 0 4 -377z m841 -621 c-126 -1 -259 2 -296 8 -110 17
-186 62 -242 144 -57 84 -65 136 -65 426 l0 255 415 -415 415 -415 -227 -3z"/>
              <path d="M1328 2951 c-30 -27 -33 -35 -33 -86 0 -51 3 -59 33 -86 l32 -29 666
0 666 0 34 34 c29 29 34 41 34 81 0 40 -5 52 -34 81 l-34 34 -666 0 -666 0
-32 -29z"/>
              <path d="M1348 2104 c-79 -42 -76 -169 6 -208 31 -14 139 -16 1166 -16 1027 0
1135 2 1166 16 59 28 81 102 49 164 -33 64 38 60 -1217 60 -992 -1 -1147 -3
-1170 -16z"/>
              <path d="M1328 1221 c-30 -27 -33 -35 -33 -86 0 -51 3 -59 33 -86 l32 -29
1160 0 1160 0 32 29 c30 27 33 35 33 86 0 51 -3 59 -33 86 l-32 29 -1160 0
-1160 0 -32 -29z"/>
            </g>
          </svg>
          <!--          <img src="/page.svg" class="w-full h-full object-cover" alt="Page Image">-->
        </div>
        <div class="flex flex-col">
          <p class="text-sm" :class="[textColor]">
            {{ page.name }}
          </p>
          <p class="text-xs text-neutral-400">
            {{ page.name }}
          </p>
        </div>
      </div>
      <div class="flex flex-row items-center space-x-2">
        <button class="btn btn-sm btn-square btn-ghost" @click.prevent="visitClick">
          <i class="material-icons text-neutral-400 !text-xl">open_in_new</i>
        </button>
        <button class="btn btn-sm btn-square btn-ghost" @click.prevent="deleteClick($event)">
          <i class="material-icons-outlined text-red-500 !text-xl">delete</i>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>