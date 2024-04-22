<script lang="ts" setup>
import {useTabsStore} from "../../stores/admin/tabs.ts";
import {computed, onMounted, ref} from "vue";
import LinkBar from "../../components/Admin/LinkBar.vue";
import {onBeforeRouteUpdate, useRoute, useRouter} from "vue-router";
import SidebarData from "../../components/Admin/SidebarData.vue";
import {PageContent, PageOptions, usePageContentStore} from "../../stores/admin/page-data.ts";
import ChatbotBubble from "../../components/Chat/ChatbotBubble.vue";
import UserBubble from "../../components/Chat/UserBubble.vue";
import UserInput from "../../components/Chat/UserInput.vue";
import {Page, useAdminHomeStore} from "../../stores/admin/home.ts";
import LoadingOverlay from "../../components/LoadingOverlay.vue";
import {useNotificationsStore} from "../../stores/notifications.ts";
import DialogModal from "../../components/DialogModal.vue";

interface DynamicPageProps {
  page?: string;
  pageId?: string;
}

const props = defineProps<DynamicPageProps>();

const route = useRoute();
const router = useRouter();
const tabsStore = useTabsStore();
const pageContentStore = usePageContentStore();
const adminHomeStore = useAdminHomeStore();
const notificationsStore = useNotificationsStore();

const appIsFetching = ref(true);

const page = computed(() => props.page ?? route.params.page);
const pageId = computed(() => props.pageId ?? route.query?.pageId as string);

const editPage = ref(route.query?.editPage as string | undefined);
const isSidebarDataOpen = ref(false);

const showEditButton = ref(false);

setTimeout(() => {
  if (editPage.value === "true") {
    isSidebarDataOpen.value = true;
  }
}, 1000);

const currentPage = ref<Page | null>(null);

const pageContent = ref<PageContent | null>(null);
const chatbotName = ref<string | null>(null);
const promptPlaceholder = ref<string | null>(null);
const staticGreeting = ref<string | null>(null);

const tab = ref(null);

const sidebarDataChanged = ref(false);

const url = ref<string | null>(null);

onMounted(() => {
  pageContentStore.fetchPageContentItems().then(() => {
    adminHomeStore.fetchPages().then(() => {
      tabsStore.fetchTabs().then(() => {
        if (typeof page.value === "string") {
          pageContentStore.setActivePageContentItem(page.value);
        }

        if (typeof page.value === "string") {
          tabsStore.setActiveTabByPageName(page.value);
        }

        currentPage.value = adminHomeStore.getPageById(pageId.value);

        console.log('Page Id => ', pageId.value);

        if (!currentPage.value) {
          router.replace({name: "not-found"});
        }

        pageContent.value = pageContentStore.getPageContentByPageId(pageId.value);
        chatbotName.value = pageContent.value?.chatbotName;
        promptPlaceholder.value = pageContent.value?.promptPlaceholder;
        staticGreeting.value = pageContent.value?.staticGreeting;

        tab.value = tabsStore.getTabByTo(page.value as string);

        url.value = `${import.meta.env.VITE_APP_BASE_URL}/chat/${currentPage.value?.path}/${currentPage.value?.id}`;

        if (!pageContent.value) {
          router.replace({name: "not-found"});
        }

        setTimeout(() => {
          appIsFetching.value = false;
        }, 500);
      })
    });
  })
});

onBeforeRouteUpdate(async (_to, _from, next) => {
  if (typeof page.value === "string") {
    await tabsStore.updateActiveTab(page.value);
  }

  // page.value = to.params.page;
  next();
});
const toggleSidebarData = () => {
  isSidebarDataOpen.value = !isSidebarDataOpen.value;
};

const onCloseSidebarData = () => {
  isSidebarDataOpen.value = false;
};
const onMainContainerMouseOver = () => {
  showEditButton.value = true;
};

const onMainContainerMouseLeave = () => {
  showEditButton.value = false;
};

const handleSavePageOptions = async (pageOptions: PageOptions) => {
  const newOption = await adminHomeStore.updatePage(pageOptions as any as Page);
  console.log(newOption)
  await tabsStore.fetchTabs();
  tabsStore.setActiveTabByPageName(newOption.path);
  currentPage.value = newOption;
};

const handleSavePageContent = async (pageContentArg: PageContent) => {
  pageContent.value = await pageContentStore.savePageContent(pageContentArg);
};

const isUploadWaitModalOpen = ref(false);
const isImgUploadWaitingModalOpen = ref(false);
const uploadWaitModalTitle = ref('');
const uploadImgWaitModalTitle = ref('');
const uploadWaitModalDescription = ref('');
const uploadImgWaitModalDescription = ref('');
const fileToUpload = ref<File | null>(null);
const imgToUpload = ref<File | null>(null);
const pageIdUpload = ref('');
const isUploadingFile = ref(false);
const isUploadingImg = ref(false);
const fileUploadBtnEnabled = ref(false);
const imgUploadBtnEnabled = ref(false);

const onOpenUploadWaitModal = (title: string, description: string) => {
  uploadWaitModalTitle.value = title;
  uploadWaitModalDescription.value = description;
  isUploadWaitModalOpen.value = true;
};

const onOpenImgUploadWaitModal = (title: string, description: string) => {
  uploadImgWaitModalTitle.value = title;
  uploadImgWaitModalDescription.value = description;
  isImgUploadWaitingModalOpen.value = true;
};

const onCloseUploadWaitModal = () => {
  isUploadWaitModalOpen.value = false;
};

const onCloseImgUploadWaitModal = () => {
  isImgUploadWaitingModalOpen.value = false;
};

const handleFileUpload = (file: File, pageId: string) => {
  // pageContentStore
  //     .uploadFile(file, pageId)
  //     .then((fileName) => {
  //       notificationsStore.addNotification(`${fileName} uploaded successfully.`, 'success');
  //
  //     })
  // console.log(url);
  fileToUpload.value = file;
  pageIdUpload.value = pageId;
  fileUploadBtnEnabled.value = false;

  onOpenUploadWaitModal('Confirm Upload', `
    <div class="flex flex-col space-y-2">
      <div>Are you sure you want to upload this file?</div>
      <div class="text-sm text-gray-500">File Name: ${file.name}</div>
      <div class="text-sm text-gray-500">File Size: ${file.size} bytes</div>
    </div>
  `);
};

const handleImgUpload = (file: File, pageId: string) => {
  imgToUpload.value = file;
  pageIdUpload.value = pageId;
  imgUploadBtnEnabled.value = false;

  onOpenImgUploadWaitModal('Confirm Image Upload', `
    <div class="flex flex-col space-y-2">
      <div>Are you sure you want to upload this image?</div>
      <div class="text-sm text-gray-500">File Name: ${file.name}</div>
      <div class="text-sm text-gray-500">File Size: ${file.size} bytes</div>
    </div>
  `);
}

const onUploadFileClick = () => {
  onCloseUploadWaitModal();

  if (!fileToUpload.value) {
    return;
  }

  // change the modal title and description

  onOpenUploadWaitModal('Uploading File', `
    <div class="flex flex-col items-center justify-center space-y-3.5">
      <progress class="progress w-56 my-4"></progress>
      <div class="text-sm">Uploading ${fileToUpload.value.name}...</div>
    </div>
  `);

  isUploadingFile.value = true;

  pageContentStore
      .uploadFile(fileToUpload.value, pageIdUpload.value)
      .then((fileName) => {
        notificationsStore.addNotification(`${fileName} uploaded successfully.`, 'success');

        onCloseUploadWaitModal();
      })
      .catch((error) => {
        notificationsStore.addNotification(error, 'error');
        onCloseUploadWaitModal();
      })
      .finally(() => {
        isUploadingFile.value = false;
        // fileUploadBtnEnabled.value = true;
      });
};

const onUploadImgClick = () => {
  onCloseUploadWaitModal();

  if (!imgToUpload.value) {
    return;
  }

  // change the modal title and description

  onOpenImgUploadWaitModal('Uploading Image', `
    <div class="flex flex-col items-center justify-center space-y-3.5">
      <progress class="progress w-56 my-4"></progress>
      <div class="text-sm">Uploading ${imgToUpload.value.name}...</div>
    </div>
  `);

  isUploadingImg.value = true;

  pageContentStore
      .uploadImg(imgToUpload.value, pageIdUpload.value)
      .then((fileName) => {
        notificationsStore.addNotification(`${fileName} uploaded successfully.`, 'success');

        onCloseImgUploadWaitModal();
      })
      .catch((error) => {
        notificationsStore.addNotification(error, 'error');
        onCloseImgUploadWaitModal();
      })
      .finally(() => {
        isUploadingImg.value = false;
        // fileUploadBtnEnabled.value = true;
      });
};

const handleEnableUploadBtn = () => {
  fileUploadBtnEnabled.value = true;
};

const handleEnableImgUploadBtn = () => {
  imgUploadBtnEnabled.value = true;
};

const handleChatbotNameChange = (value) => {
  chatbotName.value = value;
}
const handlePromptPlaceholderChange = (value) => {
  promptPlaceholder.value = value;
}
const handleStaticGreetingChange = (value) => {
  staticGreeting.value = value;
}
const handleSidebarDataChanged = (value: boolean) => {
  sidebarDataChanged.value = value;
}

</script>

<template>
  <Transition mode="out-in" name="slide-in">
    <template v-if="!appIsFetching">
      <div class="flex-1 overflow-hidden">
        <LinkBar :name="currentPage?.name" :text="`/chat/${currentPage?.path}/${currentPage?.id}`" :url="url"/>
        <div class="relative flex flex-col h-full">
          <div class="flex-1 overflow-auto h-screen">
            <SidebarData :current-page="currentPage" :is-open="isSidebarDataOpen" :page-content="pageContent"
                         :file-upload-btn-enabled="fileUploadBtnEnabled"
                         :img-upload-btn-enabled="imgUploadBtnEnabled"
                         @closeSidebarData="onCloseSidebarData" @chatbot-name-change="handleChatbotNameChange"
                         @prompt-placeholder-change="handlePromptPlaceholderChange"
                         @greeting-change="handleStaticGreetingChange" @save-page-options="handleSavePageOptions"
                         @save-page-content="handleSavePageContent"
                         @sidebar-data-changed="handleSidebarDataChanged"
                         @file-upload="handleFileUpload"
                         @enable-upload-btn="handleEnableUploadBtn"
                         @img-upload="handleImgUpload"
                         @enable-img-upload-btn="handleEnableImgUploadBtn"
            />
            <div :class="[showEditButton ? 'cursor-pointer': '']"
                 class="container mx-auto px-10 md:px-18 lg:px-24 py-14 flex flex-col items-center relative"
                 @click="toggleSidebarData" @mouseleave="onMainContainerMouseLeave"
                 @mouseover="onMainContainerMouseOver">
              <!--              <div class="grid grid-cols-1 gap-7 w-9/12 mx-auto">-->
              <ul class="mt-16 space-y-5">
                <ChatbotBubble :key="1" :chatbot-message="staticGreeting" :chatbot-name="chatbotName"
                               :disclosure-message="pageContent?.closureMessage"
                               :has-disclosure-message="pageContent?.displayClosureMessage"
                               :is-typing="false"/>
                <UserBubble :user-message="`What is this?`" user-name="John Doe"/>
                <ChatbotBubble :key="2"
                               :chatbot-message="`Sorry! I can't help you with that at the moment. Please try again later.`"
                               :chatbot-name="chatbotName"
                               :disclosure-message="pageContent?.closureMessage"
                               :has-disclosure-message="pageContent?.displayClosureMessage"
                               :is-typing="false"
                               is-copyable/>

                <UserInput :prompt-placeholder="promptPlaceholder" disabled user-input=""/>
              </ul>
              <!--              </div>-->

              <!-- Toggler -->
              <button v-if="showEditButton"
                      class="absolute top-10 right-5 md:right-36 btn btn-primary btn-sm normal-case text-xs md:text-sm"
                      type="button"
                      @click.stop="toggleSidebarData">
                <span class="material-icons-round text-xs">edit</span> Edit
              </button>
            </div>
          </div>
        </div>

        <Teleport to="body">
          <DialogModal
              :is-open="isUploadWaitModalOpen"
              @closeModal="onCloseUploadWaitModal"
          >
            <template #title>
          <span class="text-lg font-poppins-semi-bold">
            {{ uploadWaitModalTitle }}
          </span>
            </template>
            <template #body>
              <div class="grid grid-cols-1 gap-3">
                <div class="flex flex-col space-y-2">
                  <div v-html="uploadWaitModalDescription"></div>
                </div>
              </div>
            </template>
            <template #footer>
              <div class="flex flex-row items-center space-x-2 w-full">
                <button
                    :disabled="isUploadingFile"
                    class="grow btn btn-sm md:btn-md btn-primary normal-case transition-all duration-500 delay-75"
                    @click="onUploadFileClick"
                >
                  <span v-if="isUploadingFile" class="loading loading-md loading-spinner text-neutral-400"></span>
                  Upload
                </button>
                <button
                    class="grow btn btn-sm md:btn-md btn-ghost normal-case border border-1 border-gray-400"
                    :class="isUploadingFile ? 'hidden' : ''"
                    @click="onCloseUploadWaitModal"
                >
                  Cancel
                </button>
              </div>
            </template>
          </DialogModal>

          <DialogModal
              :is-open="isImgUploadWaitingModalOpen"
              @closeModal="onCloseImgUploadWaitModal"
          >
            <template #title>
          <span class="text-lg font-poppins-semi-bold">
            {{ uploadImgWaitModalTitle }}
          </span>
            </template>
            <template #body>
              <div class="grid grid-cols-1 gap-3">
                <div class="flex flex-col space-y-2">
                  <div v-html="uploadImgWaitModalDescription"></div>
                </div>
              </div>
            </template>
            <template #footer>
              <div class="flex flex-row items-center space-x-2 w-full">
                <button
                    :disabled="isUploadingImg"
                    class="grow btn btn-sm md:btn-md btn-primary normal-case transition-all duration-500 delay-75"
                    @click="onUploadImgClick"
                >
                  <span v-if="isUploadingImg" class="loading loading-md loading-spinner text-neutral-400"></span>
                  Upload
                </button>
                <button
                    class="grow btn btn-sm md:btn-md btn-ghost normal-case border border-1 border-gray-400"
                    :class="isUploadingImg ? 'hidden' : ''"
                    @click="onCloseImgUploadWaitModal"
                >
                  Cancel
                </button>
              </div>
            </template>
          </DialogModal>
        </Teleport>
      </div>

    </template>
    <template v-else-if="appIsFetching">
      <LoadingOverlay :show="appIsFetching"/>
    </template>
  </Transition>
</template>

<style scoped></style>