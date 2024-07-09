<script lang="ts" setup>
import { ref } from 'vue'
import { useAdminHomeStore } from '@/stores/admin/home'
import { useChatbotStore } from '@/stores/chatbot'

const homeStore = useAdminHomeStore()

const currentYear = new Date().getFullYear()
const hideSetting = () => {
  setting.value = false
}

const hideNewChat = () => {
  newChat.value = false
}

const newChat = ref(false)
const showNewChat = () => {
  newChat.value = true
}

const reloadChat = () => {
  // const textArea = document.getElementById('user-input')
  // textArea?.focus()
  // window.location.href = '/' + props.cbName
  console.log('reload chat')
}
const chatBotStore = useChatbotStore()
// const collapse = ref<boolean>(false)
const collapseSidebar = () => {
  // const main_container = document.getElementById('main-container')
  if (isMedium.value) {
    const sidebar = document.getElementById('application-sidebar')

    sidebar?.classList.add('hidden')
    isMedium.value = false
    const btn_medium = document.getElementById('btn-medium')
    btn_medium?.classList.remove('hidden')
  } else {
    chatBotStore.collapse = !chatBotStore.collapse
    hideBelow()
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
  // const below = document.querySelector('.hidden')
  // below?.classList.toggle('block')
  const below = document.getElementById('showCollapse')
  below?.classList.remove('hidden')
  below?.classList.add('absolute')
}

const isMedium = ref(false)
const expandMenuMedium = () => {
  hideExpand()
  const sidebar = document.getElementById('application-sidebar')
  sidebar?.classList.remove('hidden')
  const main_container = document.getElementById('main-container')
  main_container?.classList.add('z-[30]')

  isMedium.value = true
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
</script>

<template>
  <div class="chat-page relative flex min-h-full">
    <div
      id="application-sidebar"
      :class="{ 'w-[70px]': chatBotStore.collapse }"
      class="hs-overlay duration-500 inset-y-0 fixed left-0 transform hidden top-0 start-0 bottom-0 z-[60] w-64 bg-white border-e border-gray-200 lg:block lg:end-auto lg:bottom-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-slate-700 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500 dark:bg-slate-900 dark:border-gray-700"
    >
      <nav class="w-full h-full flex flex-col justify-center ml-4">
        <div class="mt-6">
          <button @click="collapseSidebar" @mouseleave="hideBelow" @mouseover="showBelow">
            <span class="material-icons-outlined">menu</span>
          </button>
          <div id="showCollapse" class="hidden px-2 rounded-md bg-gray-600">
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
        <div class="mt-10 relative">
          <button
            :class="{ 'btn-circle px-2': chatBotStore.collapse }"
            class="btn btn-sm btn-ghost rounded-full bg-emerald-100"
            @click="reloadChat"
            @mouseleave="hideNewChat"
            @mouseover="showNewChat"
          >
            <span class="material-icons-outlined text-center"> add </span>
            <span :class="{ hidden: chatBotStore.collapse }">New Chat</span>
          </button>
          <div
            v-if="chatBotStore.collapse"
            :class="[newChat ? 'visible' : 'hidden']"
            class="absolute bg-gray-600 text-white rounded-lg left-1 top-10 px-2"
          >
            <p class="text-xs text-nowrap">New chat</p>
          </div>
        </div>
        <!--      <div class="pt-8 w-56">-->
        <!--        <p class="pb-3">History</p>-->
        <!--        <div v-for="chat in chatHistoryArray" :key="chat.Id" class="">-->
        <!--          <ConversationHistoryPage-->
        <!--            :id="chat.Id"-->
        <!--            :content="chat.Content"-->
        <!--            :conversationId="chat.conversationId"-->
        <!--            :createdAt="chat.createdAt"-->
        <!--            :title="chat.title"-->
        <!--          />-->
        <!--        </div>-->
        <!--        &lt;!&ndash;          <button><span class="material-icons-outlined"> expand_more </span></button>&ndash;&gt;-->
        <!--        &lt;!&ndash;          <button><span class="material-icons-outlined"> expand_less </span></button>&ndash;&gt;-->
        <!--      </div>-->

        <div class="h-full mt-8"></div>

        <div class="w-60 pb-6">
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
                class="material-icons-outlined"
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
          <component :is="Component" :key="route.fullPath" />
        </template>
      </Transition>
    </RouterView>
  </div>
</template>

<style scoped></style>
