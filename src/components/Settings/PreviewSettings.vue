<script lang="ts" setup>
import {onMounted, ref} from "vue";
import {type PageContent, usePageContentStore} from "@/stores/admin/page-data";
import {useChatbotStore} from "@/stores/chatbot";
import {useNotificationsStore} from "@/stores/notifications";
import UserBubble from "@/components/Chat/UserBubble.vue";
import UserInput from "@/components/Chat/UserInput.vue";
import ChatbotBubble from "@/components/Chat/ChatbotBubble.vue";
import LoadingOverlay from "@/components/LoadingOverlay.vue";
import type {ThemeColors} from "@/components/Settings/ThemesSidebar.vue";


const pageContentStore = usePageContentStore()
const chatbotStore = useChatbotStore()
const notificationStore = useNotificationsStore()
const pageContent = ref<PageContent | null>(null)
onMounted(async () => {
  // const pageSlug = chatbotStore.pgSlug.replace(/^\//, '')
  try {
    await pageContentStore.fetchPageContentItems()
    setTimeout(() => {
      pageContent.value = pageContentStore.getPageContentByPageSlug(chatbotStore.pageSlug)
      // console.log('pageContent', pageContent.value)
      // console.log(pageContent.value?.chatbotName.length)
    }, 1000)
  } catch (error) {
    console.log('error', error)
    notificationStore.addNotification('An error occurred fetching Page Content', 'error')
  }
})

const props = defineProps<ThemeColors>()
console.log(props)


</script>

<template>
  <template v-if="pageContent">
    <div class="grid lg:grid-cols-3  grid-cols-2">
      <div
          class="relative col-span-1 w-44 inset-y-0 pt-4 left-0 border-e ">
        <div class="flex flex-col justify-start space-y-3">
          <div>
            <button class="btn btn-sm btn-ghost">
              <span
                  class="material-icons-outlined">menu</span>
            </button>
          </div>
          <div>
            <button
                :class="[props.chatBubble]"
                class="btn btn-sm rounded-2xl  btn-ghost">
              <span
                  class="material-icons-outlined">add</span>
              <span>New</span>
            </button>
          </div>
        </div>
        <div class="absolute bottom-0 pb-4 w-44">
          <div class="w-64">
            <button class="btn btn-sm btn-ghost">
              <span class="material-icons-outlined">settings</span>
              <span>Setting</span>
            </button>
          </div>
          <div>
            <button class="btn btn-sm btn-ghost">
              <span class="material-icons-outlined">logout</span>
              <span>Log out</span>
            </button>
          </div>
        </div>
      </div>
      <div class="lg:col-span-2 col-span-1">
        <div class="flex flex-row gap-4">
          <div>
            <img alt="chatbot" class="h-14 w-14" src="@/assets/imgs/chatbot.png">
          </div>
          <div class="flex flex-col justify-center">
            <h1 class="font-bold text-3xl pt-3">
              {{ pageContent?.chatbotName }}
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mx-auto ">
              <!--            Your AI-powered copilot for the web-->
              Here to help you with your questions
            </p>
          </div>

        </div>

        <ul v-if="pageContent">
          <ChatbotBubble
              :key="1"
              :chatBubbleBg="props.chatBubble"
              :chatbot-message="pageContent?.staticGreeting as string"
              :chatbot-name="pageContent?.chatbotName as string"
              :disclosure-message="pageContent?.closureMessage"
              :has-disclosure-message="pageContent?.displayClosureMessage"
              :is-typing="false"
              themeName="props.name"
          />

          <UserBubble
              :themeName="props.name"
              :user-message="`What is this?`"
              :userBubbleBg="props.userBubble"
              user-name="John Doe"
          />
          <ChatbotBubble
              :key="2"
              :chatBubbleBg="props.chatBubble"
              :chatbot-message="`Sorry! I can't help you with that at the moment. Please try again later.`"
              :chatbot-name="pageContent?.chatbotName as string"
              :disclosure-message="pageContent?.closureMessage"
              :has-disclosure-message="pageContent?.displayClosureMessage"
              :icon-name="pageContent?.iconName"
              :is-typing="false"
              :themeName="props.name"
          />
          <UserInput
              :prompt-placeholder="pageContent?.promptPlaceholder as string"
              :textareaColor="props.textAreaColor" :themeName="props.name" disabled user-input=""/>
        </ul>
      </div>
    </div>
  </template>
  <template v-else>
    <loading-overlay/>
  </template>
</template>