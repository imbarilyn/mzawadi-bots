<script lang="ts" setup>
import {computed, onBeforeMount, onMounted, ref} from "vue";
import {useAdminHomeStore} from "../../stores/admin/home.ts";
import PageItem from "../../components/Admin/PageItem.vue";
import {useTabsStore} from "../../stores/admin/tabs.ts";
import {useRouter} from "vue-router";
import LoadingOverlay from "../../components/LoadingOverlay.vue";

onMounted(() => {
  tabsStore.setActiveTabByPageName('home');
  console.log(tabsStore.getActiveTab);
});

const tabsStore = useTabsStore();
const adminHome = useAdminHomeStore();
const router = useRouter();

// page items to render, first 5
const pageItems = computed(() => {
  return adminHome.pages.slice(0, 5);
});

// await adminHome.fetchPages();
// await tabsStore.fetchTabs();

// adminHome.fetchPages();
// tabsStore.fetchTabs();

const appIsFetching = ref(true);

onBeforeMount(() => {
  adminHome.fetchPages().then(() => {
    tabsStore.fetchTabs().then(() => {
      setTimeout(() => {
        appIsFetching.value = false;
      }, 500);
    });
  });
});

const openModal = () => {
  adminHome.openCreateDialog();
}

const onViewAllPagesClick = () => {
  router.push({name: 'AdminPages'});
}

</script>

<template>
  <Transition mode="out-in" name="fade-away">
    <template v-if="!appIsFetching">
      <section class="px-5 md:px-8 bg-white flex-1 overflow-hidden">
        <header class="py-3 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700">
          <div class="flex items-center space-x-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"
                 xmlns="http://www.w3.org/2000/svg">
              <path
                  d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  stroke-linecap="round"
                  stroke-linejoin="round"/>
            </svg>
            <h4 class="text-lg font-semibold">
              Home
            </h4>
          </div>

          <button
              class="btn btn-sm md:btn-md normal-case text-xs md:text-sm btn-primary btn-outline"
              type="button"
              @click="openModal"
          >
            <span class="material-icons-round text-5xl">add</span> Create Page
          </button>
        </header>
        <section class="flex-1 overflow-hidden h-full mt-5 space-y-4">
          <div class="flex-1 overflow-auto h-full">
            <div aria-labelledby="pages" class="my-3 bg-stone-50 rounded-xl py-5 px-6">
              <h1 id="pages" class="text-2xl font-extrabold text-neutral-800 dark:text-neutral-300">
                Bots
              </h1>

              <div
                  v-if="!adminHome.pages.length"
                  class="my-4 bg-neutral-200 rounded-xl p-4 flex items-center justify-center">
                <p class="text-neutral-500 dark:text-neutral-300 text-xs flex items-center justify-center">
                  <span class="material-icons-round mr-2">description</span>
                  Created pages will appear here
                </p>
              </div>
              <ul v-else class="my-4 p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <PageItem v-for="(page) in pageItems" :key="page.id" :page="page"/>
              </ul>

              <div class="flex items-center justify-end">
                <!-- Let's have the view all button -->
                <button
                    class="btn btn-sm md:btn-md normal-case text-xs md:text-sm btn-primary btn-outline"
                    type="button"
                    @click="onViewAllPagesClick"
                >
                  View All
                  <i class="material-icons-round ml-2">east</i>
                </button>
              </div>
            </div>
          </div>
        </section>
      </section>
    </template>
    <template v-else-if="appIsFetching">
      <LoadingOverlay :show="appIsFetching"/>
    </template>
  </Transition>
</template>

<style scoped>

</style>