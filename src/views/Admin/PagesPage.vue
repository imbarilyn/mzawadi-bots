<script lang="ts" setup>
import PageItem from "../../components/Admin/PageItem.vue";
import {useAdminHomeStore} from "../../stores/admin/home.ts";
import {onBeforeMount, ref} from "vue";
import LoadingOverlay from "../../components/LoadingOverlay.vue";

const adminHome = useAdminHomeStore();

const appIsFetching = ref(true);

onBeforeMount(() => {
  adminHome.fetchPages().then(() => {
    setTimeout(() => {
      appIsFetching.value = false;
    }, 500);
  });
});

</script>

<template>
  <Transition mode="out-in" name="slide-fade">
    <template v-if="!appIsFetching">
      <section class="px-5 md:px-8 bg-white flex-1 overflow-hidden">
        <section class="flex-1 overflow-hidden h-full my-5 space-y-4">

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
                  Created bots will appear here
                </p>
              </div>
              <ul v-else class="my-4 p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <PageItem v-for="(page) in adminHome.pages" :key="page.id" :page="page"/>
              </ul>
            </div>
          </div>
        </section>
      </section>
    </template>
    <template v-else-if="appIsFetching">
      <LoadingOverlay/>
    </template>
  </Transition>
</template>

<style scoped>

</style>