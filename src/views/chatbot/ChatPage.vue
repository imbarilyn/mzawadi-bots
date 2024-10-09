<script lang="ts" setup>
import {computed, onMounted, ref} from 'vue'
import {useAdminHomeStore} from '@/stores/admin/home'
import {type ThemePayload, useChatbotStore} from '@/stores/chatbot'
import ConversationHistoryPage from '@/views/chatbot/ConversationHistoryPage.vue'
import {useAuthStore} from '@/stores/auth'
import {useNotificationsStore} from '@/stores/notifications'
import {useRouter} from 'vue-router'
import moment from 'moment'
import CameraModal from '@/views/Admin/toasts/CameraModal.vue'
import LoadingOverlay from "@/components/LoadingOverlay.vue";

export interface CapturedImageItem {
  imgDataUrl: string
  timestamp: number
}


const homeStore = useAdminHomeStore()
const authStore = useAuthStore()
const notificationStore = useNotificationsStore()
const router = useRouter()
const currentYear = new Date().getFullYear()
const hideSetting = () => {
  setting.value = false
}

const hideNewChat = () => {
  newChat.value = false
}

const hoverBtn = ref()
const newChat = ref(false)
const showNewChat = () => {
  console.log('over the add chat button')
  newChat.value = true
}

const DOMAIN_URL = import.meta.env.VITE_APP_DOMAIN_URL
const chatBotStore = useChatbotStore()

const reloadChat = () => {
  const textArea = document.getElementById('user-input')
  textArea?.focus()
  // router.push({
  //   name: 'newChat',
  //   params: {cbName: chatBotStore.pgSlug}
  // })
  location.reload()
}

// const collapse = ref<boolean>(false)
const collapseSidebar = () => {
  // const main_container = document.getElementById('main-container')
  // console.log('Collapse from ChatPage.vue')
  if (chatBotStore.isMedium && !chatBotStore.collapse) {
    const sidebar = document.getElementById('application-sidebar')
    sidebar?.classList.add('hidden')
    // // isMedium.value = false
    // chatBotStore.setIsMedium(false)
    // const btn_medium = document.getElementById('btn-medium')
    // btn_medium?.classList.remove('hidden')
  } else {
    chatBotStore.collapse = !chatBotStore.collapse

    console.log(chatBotStore.collapse)
    // hideBelow()
  }
  // console.log('collapse', collapse.value)
}

const hideBelow = () => {
  // const below = document.querySelector('.block')
  // below?.classList.toggle('hidden')
  const below = document.getElementById('showCollapse')
  below?.classList.remove('absolute')
  below?.classList.add('hidden')
}

const showMenuMedium = ref(false)
const showExpand = () => {
  showMenuMedium.value = true
}

const hideExpand = () => {
  showMenuMedium.value = false
  console.log('medium mouse-over')
}

const showBelow = () => {
  const below = document.getElementById('showCollapse')
  below?.classList.remove('hidden')
  below?.classList.add('absolute')
  console.log('hover on menu button')
}

// const isMedium = ref(false)
const expandMenuMedium = () => {
  hideExpand()
  const sidebar = document.getElementById('application-sidebar')
  sidebar?.classList.remove('hidden')
  const main_container = document.getElementById('main-container')
  main_container?.classList.add('z-[30]')

  // isMedium.value = true
  chatBotStore.setIsMedium(true)
  const btn_medium = document.getElementById('btn-medium')
  btn_medium?.classList.add('hidden')

  console.log('expand menu') // hideExpand()
}

const logout = ref(false)

const showLogout = () => {
  logout.value = true
}

const hideLogout = () => {
  logout.value = false
}

const confirmSignOut = () => {
  homeStore.signOutDialog.isOpen = true
}

const setting = ref(false)
const showSetting = () => {
  setting.value = true
}

const setActiveTabHistory = (id: number) => {
  chatBotStore.setActiveHistory(id)
}

interface ChatHistory {
  Content: string
  Id: number
  conversationId: string
  createdAt: string
  title: string
}

const groupChatbyMonth = () => {
  console.log(chatBotStore.chatHistoryArray)
  const chatHistoryArray: ChatHistory[] = chatBotStore.chatHistoryArray
  console.log('chatHistoryArray', chatHistoryArray)
  const grouped = chatHistoryArray.reduce(
      (acc, chat) => {
        let date = moment(chat.createdAt).toISOString()
        let now = moment()
        if (now.isSame(date, 'day')) {
          date = 'Today'
        } else if (now.subtract(1, 'days').isSame(date, 'day')) {
          date = 'Yesterday'
        } else if (now.subtract(1, 'weeks').isBefore(date)) {
          date = 'Previous 7 Days'
        } else {
          date = moment(chat.createdAt).format('MMMM-YYYY')
        }
        if (!acc[date]) {
          acc[date] = []
        }
        acc[date].push(chat)
        return acc
      },
      {} as Record<string, ChatHistory[]>
  )
  return grouped
}
// const capturedImages = ref<CapturedImageItem[]>([])

const onCapture = (capturedImageItem: CapturedImageItem) => {
  chatBotStore.capturedImages.splice(0, 1)
  if (getImageSize(capturedImageItem) > 20) {
    setTimeout(() => {
      notificationStore.addNotification('Image size should be less than 20MB', 'error')
    }, 500)
    return
  } else {
    console.log('captured before', chatBotStore.capturedImages)
    chatBotStore.capturedImages.push(capturedImageItem)
    console.log('captured after', chatBotStore.capturedImages)
    // console.log(chatBotStore.capturedImages.pop()?.imgDataUrl)
  }
}

function getImageSize(image: CapturedImageItem) {
  const base64String = image.imgDataUrl.replace(/^data:image\/\w+;base64,/, '')
  const binaryString = atob(base64String)
  const bytes = binaryString.length
  console.log(bytes)
  return bytes / (1024 * 1024)
}

const themeContainer = ref<ThemePayload>()
// const getSelectedTheme = () => {
//   try {
//     chatBotStore.getTheme()
//         .then((resp) => {
//           console.log('theme', resp)
//           if (resp.result === 'ok') {
//             notificationStore.addNotification('Theme Successfully fetched', 'success')
//             themeContainer.value = resp.data
//           }
//         })
//   } catch (error) {
//     console.log('error', error)
//     notificationStore.addNotification('An error occurred fetching theme', 'error')
//   }
//
// }
onMounted(() => {
  try {
    chatBotStore.getTheme()
        .then((resp) => {
          console.log('theme', resp)
          if (resp?.result === 'ok') {
            // notificationStore.addNotification('Theme Successfully fetched', 'success')
            themeContainer.value = resp.data
          }
        })
  } catch (error) {
    console.log('error', error)
    notificationStore.addNotification('An error occurred fetching theme', 'error')
  }

  // themeContainer.value = chatBotStore.themes
  // console.log(themeContainer.value)
})

const isNewChat = computed(() => location.href === `${DOMAIN_URL}/${chatBotStore.pgSlug}`)
</script>

<template>
  <div v-if="themeContainer" class="chat-page relative flex min-h-full">
    <CameraModal
        v-if="chatBotStore.cameraModalIsOpen"
        :img-count="chatBotStore.capturedImages.length"
        :is-open="chatBotStore.cameraModalIsOpen"
        @closeModal="chatBotStore.openCameraModal(false)"
        @capture-image="onCapture"
    />
    <div
        v-else
        id="application-sidebar"
        :class="{ 'w-[70px] ': chatBotStore.collapse }"
        class="hs-overlay duration-500 fixed inset-y-0 left-0 transform hidden top-0 start-0 bottom-0 z-[60] w-64 bg-white border-e border-gray-200 lg:block lg:end-auto lg:bottom-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-slate-700 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500 dark:bg-slate-900 dark:border-gray-700"
    >
      <nav class="w-full h-full ps-2 flex flex-col justify-center bg-requested-color">
        <div class="mt-3">
          <button
              class="ps-2"
              @click="collapseSidebar"
              @mouseleave="hideBelow"
              @mouseover="showBelow"
          >
            <span
                class="material-icons-outlined">menu</span>
          </button>
          <div id="showCollapse"
               class="hidden px-2 rounded-md bg-gray-600">
            <p v-if="!chatBotStore.collapse" class="text-xs text-white dark:text-white">
              Collapse menu
            </p>
            <p
                v-if="chatBotStore.collapse"
                class="text-xs text-white dark:text-white text-nowrap flex justify-center"
            >
              Expand menu
            </p>
          </div>
        </div>
        <div class="mt-7 mb-4 relative">
          <button
              :class="[chatBotStore.collapse? 'btn-circle px-2': '', themeContainer.chatBubble]"
              :disabled="isNewChat"
              class="btn btn-sm hover:bg-rose-6 hover:shadow-2xl rounded-full"
              @click="reloadChat"
              @mouseleave="hideNewChat"
              @mouseover="showNewChat"
          >
            <span
                class="material-icons-outlined text-center"> add </span>
            <span
                :class="[
                    chatBotStore.collapse? 'hidden': '',
                     chatBotStore.reloadNeChat ? 'text-normal': ''


                ]"
                class=""
            >New Chat</span
            >
          </button>
          <div
              v-if="chatBotStore.collapse"
              class="absolute bg-gray-600 text-white rounded-lg left-1 top-10 px-2"
          >
            <p class="text-xs text-nowrap text-white">New chat</p>
          </div>
        </div>
        <div
            :class="{ invisible: chatBotStore.collapse }"
            class="relative w-56 overflow-y-auto h-full"
        >
          <div v-for="(chats, date) in groupChatbyMonth()" :key="date">
            <h1
                :class="[themeContainer.name === 'rose' || themeContainer.name === 'red'? 'text-gray-600': `text-${themeContainer.name}-500`]"
                class="backdrop-blur z-10 font-bold text-md sticky top-0 pb-2">
              {{ date }}
            </h1>
            <div v-for="chat in chats" :key="chat.Id" @click="setActiveTabHistory(chat.Id)">
              <ConversationHistoryPage
                  :id="chat.Id"
                  :botBubbleColor="themeContainer.chatBubble"
                  :content="chat.Content"
                  :conversationId="chat.conversationId"
                  :createdAt="chat.createdAt"
                  :title="chat.title"
              />
            </div>
          </div>
        </div>

        <div class="w-60 pt-10">
          <div class="relative">
            <button
                :class="{ 'hover:btn-circle btn-sm  rounded-full ': chatBotStore.collapse }"
                class="flex items-center w-full y-2 cursor-pointer hover:bg-gray-200 rounded-xl p-1"
                @mouseleave="hideSetting"
                @mouseover="showSetting"
            >
              <span
                  :class="{ 'text-sm px-1': chatBotStore.collapse }"
                  class="material-icons-outlined space"
              >settings</span
              >
              <span :class="{ 'opacity-0': chatBotStore.collapse }" class="pl-3 text-sm"
              >Setting</span
              >
            </button>
            <small
                v-if="chatBotStore.collapse"
                :class="[setting ? 'visible transition ease-in duration-500' : 'hidden']"
                class="absolute left-14 top-3 bg-gray-600 text-white rounded-lg px-2"
            >Setting
            </small>
          </div>
          <div class="relative">
            <button
                :class="{ 'hover:btn-circle btn-sm rounded-full': chatBotStore.collapse }"
                class="flex w-full items-center y-2 cursor-pointer hover:bg-gray-200 rounded-xl p-2"
                @click="confirmSignOut"
                @mouseleave="hideLogout"
                @mouseover="showLogout"
            >
              <span
                  :class="{ 'text-sm px-1': chatBotStore.collapse }"
                  class="material-icons-outlined !text-lg"
              >logout</span
              >
              <span :class="{ 'opacity-0': chatBotStore.collapse }" class="pl-3 text-sm"
              >Log out</span
              >
            </button>
            <small
                v-if="chatBotStore.collapse"
                :class="[logout ? 'visible transition ease-in duration-500' : 'hidden']"
                class="absolute left-14 top-3 text-nowrap bg-gray-600 text-white rounded-lg px-2"
            >Log out</small
            >
          </div>
        </div>

        <small v-if="!chatBotStore.collapse" class="text-xs"
        >&copy; 2009-{{ currentYear }} Powered by Mzawadi</small
        >
      </nav>
    </div>
    <RouterView #default="{ Component, route }">
      <Transition>
        <template v-if="Component">
          <component :is="Component" :key="route.fullPath"/>
        </template>
      </Transition>
    </RouterView>
    <!--    <ToastContainer v-if="notificationStore.hasNotifications">-->
    <!--      &lt;!&ndash;        <ToastAlert text="Page name is required" type="error" id=""/>&ndash;&gt;-->
    <!--      <template v-for="notification in notificationStore.getNotifications" :key="notification.id">-->
    <!--        <ToastAlert-->
    <!--            v-if="notification.id && notification.isShown"-->
    <!--            :id="notification.id"-->
    <!--            :is-shown="notification.isShown"-->
    <!--            :message="notification.message"-->
    <!--            :type="notification.type"-->
    <!--        />-->
    <!--      </template>-->
    <!--    </ToastContainer>-->
  </div>
  <div v-else>
    <loading-overlay/>
  </div>
</template>

<style scoped></style>
