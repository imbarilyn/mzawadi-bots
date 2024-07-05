<script lang="ts" setup>
import { useAdminHomeStore } from '@/stores/admin/home'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import DialogModal from '@/components/DialogModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const homeStore = useAdminHomeStore()
const currentYear = new Date().getFullYear()

const logOut = () => {
  if (authStore.userRole === 'user') {
    authStore.chatBotUser = ''
    router.push({ name: 'lets-chat' })
    console.log('user is logged out')
  } else {
    authStore.logoutAdmin()
    console.log('Admin logged out')
    router.push({ name: 'admin-login' })
  }
}

const collapseSidebar = () => {
  const sidebar = document.getElementById('application-sidebar')
  sidebar?.classList.toggle('-translate-x-full')
  console.log('clicked menu button')
}

const showBelow = () => {
  // const below = document.querySelector('.hidden')
  // below?.classList.toggle('block')
  const below = document.getElementById('showCollapse')
  below?.classList.remove('hidden')
  below?.classList.add('absolute')
}

const hideBelow = () => {
  // const below = document.querySelector('.block')
  // below?.classList.toggle('hidden')
  const below = document.getElementById('showCollapse')
  below?.classList.remove('absolute')
  below?.classList.add('hidden')
}
const activateTextarea = () => {
  const textArea = document.getElementById('user-input')
  textArea?.focus()
}

const confirmSignOut = () => {
  homeStore.signOutDialog.isOpen = true
}
</script>

<template>
  <div>
    <div
      id="application-sidebar"
      class="hs-overlay hs-overlay-open:translate-x-0 -translate-x-full duration-300 transform hidden fixed top-0 start-0 bottom-0 z-[60] w-64 bg-white border-e border-gray-200 overflow-y-auto lg:block lg:translate-x-0 lg:end-auto lg:bottom-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-slate-700 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500 dark:bg-slate-900 dark:border-gray-700"
    >
      <nav
        class="hs-accordion-group w-full h-full flex flex-col justify-center ml-4"
        data-hs-accordion-always-open
      >
        <!--        <div class="flex items-center justify-center pt-4 pe-4 ps-7">-->
        <!--          <div class="h-10 sm:h-14 p-2 sm:p-3 flex flex-row">-->
        <!--                        <div class="justify-center items-center">-->
        <!--                          <p class="font-semibold">{{ chatbotName.split(' ')[0] }} Bot</p>-->
        <!--                        </div>-->
        <!--&lt;!&ndash;&ndash;&gt;-->
        <!--                        <img alt="Bot Icon Img" class="w-full h-full object-center" src="/icon.png" />-->
        <!--          </div>-->
        <!--          &lt;!&ndash; Logo &ndash;&gt;-->
        <!--        </div>-->
        <div class="mt-6 relative">
          <button @click="collapseSidebar" @mouseleave="hideBelow" @mouseover="showBelow">
            <span class="material-icons-outlined">menu</span>
          </button>
          <div id="showCollapse" class="hidden px-2 rounded-md bg-gray-600">
            <span class="text-xs text-white dark:text-white">Collapse menu</span>
          </div>
        </div>
        <div class="mt-10">
          <button
            class="btn btn-sm btn-ghost rounded-full bg-emerald-100"
            @click="activateTextarea"
          >
            <span class="material-icons-outlined"> add </span>
            <span>New Chat</span>
          </button>
        </div>

        <div class="h-full mt-8">
          <p>History</p>
          <!-- List -->
          <!--          <ul v-if="false" class="space-y-1.5 p-4">-->
          <!--            <li>-->
          <!--              <a-->
          <!--                class="flex items-center gap-x-3 py-2 px-3 text-sm text-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 dark:text-slate-400 dark:hover:text-slate-300 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"-->
          <!--                href="#"-->
          <!--              >-->
          <!--                <svg-->
          <!--                  class="flex-shrink-0 w-4 h-4"-->
          <!--                  fill="none"-->
          <!--                  height="24"-->
          <!--                  stroke="currentColor"-->
          <!--                  stroke-linecap="round"-->
          <!--                  stroke-linejoin="round"-->
          <!--                  stroke-width="2"-->
          <!--                  viewBox="0 0 24 24"-->
          <!--                  width="24"-->
          <!--                  xmlns="http://www.w3.org/2000/svg"-->
          <!--                >-->
          <!--                  <path d="M5 12h14" />-->
          <!--                  <path d="M12 5v14" />-->
          <!--                </svg>-->
          <!--                New chat-->
          <!--              </a>-->
          <!--            </li>-->
          <!--          </ul>-->
          <!-- End List -->
        </div>

        <div class="w-full">
          <div class="border-t border-gray-200 dark:border-gray-700">
            <ul class="w-56 my-3">
              <li
                class="relative flex items-center y-2 cursor-pointer hover:bg-gray-200 rounded-lg p-2"
              >
                <span class="material-icons-outlined S">settings</span>
                <span class="pl-3">Setting</span>
              </li>

              <li
                class="flex items-center py-2 cursor-pointer hover:bg-gray-200 rounded-lg p-2"
                @click="confirmSignOut"
              >
                <span class="material-icons-outlined"> logout </span>
                <span class="pl-3">Sign Out</span>
              </li>
            </ul>
          </div>
        </div>
        <div></div>

        <small class="text-xs">&copy 2009-{{ currentYear }} Powered by Mzawadi</small>
      </nav>

      <RouterView #default="{ Component, route }">
        <template v-if="Component">
          <component :is="Component" :route="route" />
        </template>
      </RouterView>

      <teleport to="body">
        <DialogModal
          :is-open="homeStore.signOutDialog.isOpen"
          @closeModal="homeStore.closeSignOutDialog"
        >
          <template #title>
            <div class="flex justify-center">
              <span class="material-icons-outlined !text-6xl"> logout </span>
            </div>
          </template>
          <template #body>
            <div class="flex justify-center">
              <h1 class="text-xl font-bold">Oh no! You're leaving...</h1>
            </div>
            <div class="flex justify-center">
              <p class="text-lg font-semibold">Are you sure?</p>
            </div>
          </template>
          <template #footer>
            <div class="flex justify-center">
              <button class="btn bg-emerald-100 me-5" @click="logOut">Sign Out</button>
              <button class="btn bg-emerald-400 w-[200px]" @click="homeStore.closeSignOutDialog()">
                Cancel
              </button>
            </div>
          </template>
        </DialogModal>
      </teleport>
    </div>
  </div>
</template>
