<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import PreviewSettings from "@/components/Settings/PreviewSettings.vue";
import ThemesSidebar, {type ThemeColors} from "@/components/Settings/ThemesSidebar.vue";
import {useChatbotStore} from "@/stores/chatbot";
import {useNotificationsStore} from "@/stores/notifications";
import LoadingOverlay from "@/components/LoadingOverlay.vue";


const notificationStore = useNotificationsStore()
const chatbotStore = useChatbotStore()
const rotateBtn = ref<boolean>(false)

onMounted(() => {
  rotateBtn.value = true
  getSelectedTheme()
  themeContainer.value = chatbotStore.themes
  console.log('themeContainer', themeContainer.value)
})


const themeContainer = ref()

const showThemes = ref<boolean>(false)
const selectThemes = () => {
  showThemes.value = !showThemes.value
  console.log(showThemes.value)
}

const getSelectedTheme = () => {
  try {
    chatbotStore.getTheme()
        .then((resp) => {
          console.log('theme', resp)
          if (resp.result === 'ok') {
            notificationStore.addNotification('Theme Successfully fetched', 'success')
            themeContainer.value = resp.data
          }
        })
  } catch (error) {
    console.log('error', error)
    notificationStore.addNotification('An error occurred fetching theme', 'error')
  }

}


const selectedTheme = (value: ThemeColors) => {
  console.log('selected theme', value)
  const themePayload = {...value}
  chatbotStore.themeSetting(themePayload)
      .then((resp) => {
        console.log(resp)
        if (resp.result === 'ok') {
          notificationStore.addNotification('Theme Successfully set', 'success')
          getSelectedTheme()


        } else {
          notificationStore.addNotification('An error occurred while setting theme try again', 'error')
        }
      })
  return
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
        <ThemesSidebar @selected-theme="selectedTheme"/>
      </div>
      <div>
        <PreviewSettings :chatBubble="themeContainer.chatBubble" :name="themeContainer.name"
                         :textAreaColor="themeContainer.textAreaColor" :userBubble="themeContainer.userBubble"/>
      </div>
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

