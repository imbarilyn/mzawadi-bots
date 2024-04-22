<script lang="ts" setup>
import TopBar from "../components/Admin/TopBar.vue";
import {useAdminHomeStore} from "../stores/admin/home.ts";
import DialogModal from "../components/DialogModal.vue";
import {useRouter} from "vue-router";
import {useTabsStore} from "../stores/admin/tabs.ts";
import {usePageContentStore} from "../stores/admin/page-data.ts";
import {useField} from "vee-validate";
import ToastContainer from "../views/Admin/toasts/ToastContainer.vue";
import ToastAlert from "../views/Admin/toasts/ToastAlert.vue";
import {useNotificationsStore} from "../stores/notifications.ts";
import PagesSidebar from "./Admin/PagesSidebar.vue";
import {computed, ref} from "vue";
import PageSearchItem from "./Admin/PageSearchItem.vue";
import {gsap} from "gsap";

const router = useRouter();
const tabsStore = useTabsStore();
const pageContentStore = usePageContentStore();
const homeStore = useAdminHomeStore();
const notificationsStore = useNotificationsStore();

// by grace before we get here, the pages have already been fetched

const allPageNames = homeStore.getPages.map((page) => page.name.toLowerCase());

const pageNameValidator = (value: string) => {
  if (!value) {
    return "Page name is required";
  }

  if (value.length < 3) {
    return "Page name must be at least 3 characters long";
  }

  if (value.length > 50) {
    return "Page name must not exceed 50 characters";
  }

  // allow only alphanumeric characters
  const pageNameRegex = /^[a-zA-Z0-9]+$/;

  if (!pageNameRegex.test(value)) {
    return "Page name must only contain alphanumeric characters";
  }

  if (allPageNames.includes(value.toLowerCase())) {
    return "Page name already exists";
  }

  if (value.toLowerCase() === "home" || value.toLowerCase() === "settings") {
    return "Page name is reserved";
  }

  return true;
}

const {
  value: pageName,
  errorMessage: pageNameErrorMessage,
  meta: pageNameMeta,
} = useField("pageName", pageNameValidator);

const closeCreateModal = () => {
  homeStore.closeCreateDialog();
}

const closeDeleteModal = () => {
  homeStore.closeDeleteDialog();
}

const closeSearchModal = () => {
  homeStore.closeSearchDialog();
}

const createPage = async () => {
  if (pageNameMeta.valid) {

    const page = await homeStore.createNewPage(pageName.value) as any;

    console.log(page);

    if (page) {

      tabsStore.setActiveTabByPageName(page.name);

      pageContentStore.setActivePageContentItem(page.name);

      homeStore.closeCreateDialog();

      // reset the page name field
      pageName.value = "";
      pageNameMeta.valid = false;
      pageNameMeta.validated = false;
      pageNameMeta.touched = false;

      await router.push({name: "DynamicPage", params: {page: page.pageSlug}, query: {pageId: page.pageId}});
    }
  }
}

const deletePage = async () => {
  const page = await homeStore.deletePage() as any;

  if (page) {
    homeStore.closeDeleteDialog();

    await router.push({name: "AdminHome", params: {page: "home"}, query: {pageId: page.pageId}});
  }
}

// let's implement searching for the pages

const pagesToDisplay = ref([]);

if (homeStore.getPages.length > 0) {
  pagesToDisplay.value = homeStore.getPages.slice(0, 5);
} else {
  pagesToDisplay.value = [];
}

const searchQueryText = ref("");

const searchPages = (e: Event) => {
  hasInput.value = true;

  const target = e.target as HTMLInputElement;

  const searchQuery = target.value;

  searchQueryText.value = searchQuery;

  if (searchQuery.length > 0) {
    pagesToDisplay.value = homeStore.getPages.filter((page) => {
      return page.name.toLowerCase().includes(searchQuery.toLowerCase());
    }).slice(0, 5);
  } else {
    pagesToDisplay.value = homeStore.getPages.slice(0, 5);
  }
}

const hasInput = ref(false);

const pagesToDisplayLength = computed(() => {
  return pagesToDisplay.value.length;
});

function onEnter(el, done) {
  gsap.to(el, {
    opacity: 1,
    height: '1.6em',
    delay: el.dataset.index * 0.1,
    onComplete: done
  })
}

function onLeave(el, done) {
  gsap.to(el, {
    opacity: 0,
    height: 0,
    delay: el.dataset.index * 0.1,
    onComplete: done
  })
}

</script>

<template>

  <div class="flex flex-col min-h-screen">
    <!-- Page Heading -->
    <TopBar/>
    <!-- End Page Heading -->
    <div class="bg-gray-50 dark:bg-slate-900 relative flex-1 grow">
      <!-- ========== MAIN CONTENT ========== -->

      <PagesSidebar/>

      <div class="md:ml-64 flex flex-col flex-1 grow">
        <RouterView #default="{ Component, route }">
          <Transition name="route" mode="out-in" appear>
            <template v-if="Component">
              <component :is="Component" :key="route.fullPath"/>
            </template>
          </Transition>
        </RouterView>
      </div>

    </div>

    <Teleport to="body">
      <DialogModal :is-open="homeStore.createDialog.isOpen" @closeModal="closeCreateModal">
        <template #title>
          <span class="text-lg font-semibold">
            Create a new bot
          </span>
        </template>

        <template #body>
          <form class="grid grid-cols-1 gap-3" @submit.prevent="createPage">
            <div class="flex flex-col space-y-2">
              <label class="label text-xs font-semibold" for="chatbot-name">
                Bot Name
              </label>
              <input
                  id="page-name"
                  v-model="pageName"
                  :class="{'input-error': pageNameMeta.validated && !pageNameMeta.valid, 'input-primary': pageNameMeta.validated && pageNameMeta.valid}"
                  class="input input-bordered input-primary w-full text-sm" placeholder="Bot Name"
                  type="text"
              />
              <small v-if="pageNameMeta.validated && !pageNameMeta.valid"
                     class="text-xs text-rose-500">
                {{ pageNameErrorMessage }}
              </small>
              <small class="text-xs text-gray-500">
                This will be used as the bot's name across the application. More configurations will be shown after creating the bot.
              </small>
            </div>
          </form>
        </template>

        <template #footer>
          <div class="flex flex-row items-center space-x-2 w-full">
            <button class="grow btn btn-sm md:btn-md btn-ghost normal-case border border-1 border-gray-400"
                    @click="closeCreateModal">
              Cancel
            </button>
            <button :disabled="!homeStore.enabledCreateDialogBtn"
                    class="grow btn btn-sm md:btn-md btn-primary normal-case"
                    @click="createPage">
              Create
            </button>
          </div>
        </template>
      </DialogModal>

      <DialogModal :is-open="homeStore.deleteDialog.isOpen" @closeModal="closeDeleteModal">
        <template #title>
          <span class="text-lg font-semibold">
            Delete bot
          </span>
        </template>

        <template #body>
          <div class="grid grid-cols-1 gap-3">
            <div class="flex flex-col space-y-2">
              <p class="text-sm">
                Are you sure you want to delete this page?
              </p>
            </div>
          </div>
        </template>

        <template #footer>
          <div class="flex flex-row items-center space-x-2 w-full">
            <button class="grow btn btn-sm md:btn-md btn-ghost normal-case border border-1 border-gray-400"
                    @click="closeDeleteModal">
              Cancel
            </button>
            <button :disabled="!homeStore.enabledDeleteDialogBtn"
                    class="grow btn btn-sm md:btn-md btn-error normal-case text-white"
                    @click="deletePage">
              Delete
            </button>
          </div>
        </template>
      </DialogModal>

      <DialogModal :is-open="homeStore.searchDialog.isOpen" @closeModal="closeSearchModal" max-width="w-9/12 sm:w-6/12 md:w-5/12">
        <template #title>
          <span class="text-lg font-semibold">
            Search bots
          </span>
        </template>

        <template #body>
          <div class="grid grid-cols-1 gap-3 mt-3">
            <div class="flex flex-col space-y-2">
              <input
                  id="search-pages"
                  @input="searchPages"
                  class="input input-bordered input-primary w-full text-sm" placeholder="Search bots"
                  type="text"
              />
            </div>
            <div class="flex flex-col space-y-2">
              <div v-if="pagesToDisplayLength === 0" class="flex flex-col space-y-2">
                <!--                <p class="text-sm text-gray-500">-->
                <!--                  No pages found-->
                <!--                </p>-->

                <div class="flex flex-col space-y-2 pt-4">
                  <div class="flex flex-row justify-center items-center">
                    <div class="bg-neutral-100 rounded-full w-12 h-12 flex items-center justify-center">
                      <div class="material-icons-round !text-3xl text-neutral-500">
                        <span v-if="!hasInput">search</span>
                        <span v-else>search_off</span>
                      </div>
                    </div>
                  </div>

                  <div class="flex flex-col items-center justify-center space-y-3">
                    <p v-if="!hasInput" class="text-xs text-gray-600 font-poppins-bold">
                      Search for bots
                    </p>
                    <p v-else class="text-xs text-gray-600 font-poppins-bold">
                      No results found for "{{ searchQueryText }}"
                    </p>

                    <p class="text-sm text-gray-400">
                      Try searching for something else
                    </p>
                  </div>
                </div>
              </div>
              <div v-else class="flex flex-col space-y-2">
                <TransitionGroup :css="false" @enter="onEnter" @leave="onLeave" name="fade" tag="div" class="flex flex-col space-y-2">
                  <PageSearchItem v-for="(page, index) in pagesToDisplay" :key="page.pageId" :page="page"
                                  :data-index="index"/>
                </TransitionGroup>
              </div>
            </div>
          </div>
        </template>
      </DialogModal>

      <ToastContainer v-if="notificationsStore.hasNotifications">
        <!--        <ToastAlert text="Page name is required" type="error" id=""/>-->
        <ToastAlert v-for="(notification) in notificationsStore.getNotifications" :id="notification.id"
                    :key="notification.id" :is-shown="notification.isShown" :message="notification.message"
                    :type="notification.type"/>
      </ToastContainer>
    </Teleport>
  </div>
</template>

<style scoped>

.route-enter-from {
  opacity: 0;
  transform: translateY(50%)
}

.route-enter-active,
.route-leave-active {
  transition: all .35s ease-out
}

.route-leave-to {
  opacity: 0;
  transform: translateY(50%)
}
</style>
