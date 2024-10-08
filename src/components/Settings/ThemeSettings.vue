<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import PreviewSettings from "@/components/Settings/PreviewSettings.vue";
import ThemesSidebar, {type ThemeColors} from "@/components/Settings/ThemesSidebar.vue";
import {useChatbotStore} from "@/stores/chatbot";
import {useNotificationsStore} from "@/stores/notifications";
import LoadingOverlay from "@/components/LoadingOverlay.vue";
import DialogModal from "@/components/DialogModal.vue";


const notificationStore = useNotificationsStore()
const chatbotStore = useChatbotStore()
const rotateBtn = ref<boolean>(false)

// Fetch the preset theme before admin adds a theme
// const getSelectedTheme = () => {
//   try {
//     chatbotStore.getTheme()
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
  rotateBtn.value = true
  themeContainer.value = chatbotStore.themes
  console.log(themeContainer.value)
})


const themeContainer = ref()

const showThemes = ref<boolean>(false)
const selectThemes = () => {
  showThemes.value = !showThemes.value
  console.log(showThemes.value)
}


const selectedTheme = (value: ThemeColors) => {
  console.log('selected theme', value)

  console.log('themePayload', themePayload)
  themeContainer.value = value
}
const themePayload = ref({
  name: '',
  userBubble: '',
  chatBubble: '',
  textAreaColor: ''
})
const openAddThemeModal = ref<boolean>(false)
const addTheme = (value: any) => {
  openAddThemeModal.value = true
  themePayload.value = {...value}
  console.log("adding theme", themePayload.value)
}

const postTheme = () => {
  console.log(themePayload.value)
  closeAddThemeModal()
  chatbotStore.themeSetting(themePayload)
      .then((resp) => {
        console.log(resp)
        if (resp.result === 'ok') {
          notificationStore.addNotification(`${themePayload.value.name} theme Successfully set`, 'success')
          // themeContainer.value = resp.data
        } else {
          notificationStore.addNotification(`An error occurred while setting ${themePayload.value.name} theme try again`, 'error')
        }
      })
  return

}

const closeAddThemeModal = () => {
  openAddThemeModal.value = false
}
</script>

<template>
  <div>
    <div v-if="themeContainer" class="relative w-full overflow-y-hidden flex flex-col space-y-6">
      <div class=" w-full py-3 bg-mzawadi-primary flex justify-between md:flex-row">
        <div class="w-full relative flex md:flex-row flex-col">
          <div class="w-full flex px-3 flex-col lg:justify-center items-center space-y-3 py-3">
            <div class="w-full flex lg:justify-center justify-start">
              <h1 class="font-bold text-xl leading-none text-gray-300">Welcome to Chatbot Themes</h1>
            </div>
            <div class="w-full flex lg:justify-center justify-start ">
              <p class="text-sm text-gray-300">The data entered shall be used to set theme for your chatbot</p>
            </div>
          </div>

          <div class="absolute right-0 top-3 rounded-s-xl bg-mzawadi-secondary ">
            <button
                :class="{'rotate': rotateBtn}"
                class="px-4 flex items-center w-full btn btn-ghost" @click="selectThemes">
              <span class="material-icons-outlined">settings</span>
            </button>
          </div>
        </div>
      </div>
      <div class="absolute  right-0 top-12">
        <ThemesSidebar @selected-theme="selectedTheme" @add-theme="addTheme"/>
      </div>
      <div>
        <PreviewSettings :chatBubble="themeContainer.chatBubble" :name="themeContainer.name"
                         :textAreaColor="themeContainer.textAreaColor" :userBubble="themeContainer.userBubble"/>
      </div>
      <teleport to="body">
        <DialogModal :is-open="openAddThemeModal" @closeModal="closeAddThemeModal">
          <template #title>
            <div class="w-full flex justify-end">
              <button class="btn btn-sm btn-ghost btn-circle" @click="closeAddThemeModal">
                <span class="material-icons-outlined">close</span>
              </button>
            </div>
            <div class="flex justify-center">
              <span class="material-icons-outlined !text-6xl pb-2"> &#128512;</span>
            </div>
          </template>
          <template #body>
            <div class="flex justify-center">
              <p :class="[themePayload]" class="font-xs">Be aware you are about to change
                theme to
                <span :class="[`text-${themePayload.name}-500`, 'font-bold']">{{ themePayload.name }}</span></p>
            </div>
            <div class="flex justify-center">
              <p class="text-lg font-semibold">Kindly click below</p>
            </div>
          </template>
          <template #footer>
            <div class="flex justify-center">
              <button
                  class="btn btn-sm px-6 btn-primary"
                  @click="postTheme">
                <span>Add {{ themePayload.name }}Theme</span>
              </button>
            </div>
          </template>
        </DialogModal>
      </teleport>
    </div>
    <div v-else>
      <loading-overlay/>
    </div>
  </div>

</template>

<style scoped>
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.rotate {
  animation: rotate 2s linear infinite;
}

</style>

