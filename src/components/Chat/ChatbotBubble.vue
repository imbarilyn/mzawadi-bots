<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useColorGenerator } from '../../composables/color-generator'
// import { inline } from "rules";

//seting the chatbot response div to null for no response at first time

const chatbotMsgRef = ref(null)
const chatbotStore = useChatbotStore()

// const scrollDown = ()=>{
//   const message_available = chatbotMsgRef.value;
//   const conversation_height = window.innerHeigh;

//     message_available.scrollIntoView({behavior: "smooth", block: conversation_height, inline:"nearest"});

// }
interface ChatbotBubble {
  chatbotName: string
  chatbotMessage: string
  isTyping: boolean
  isCopyable?: boolean
  hasDisclosureMessage?: boolean
  disclosureMessage?: string
  hasError?: boolean
  originalMessage?: string
  chatTextColor?: string
  iconName?: string
  // uniqueId:
}

const props = withDefaults(defineProps<ChatbotBubble>(), {
  isTyping: false,
  isCopyable: false,
  hasDisclosureMessage: false
})

// watch(()=>props.chatbotMessage.length, ()=>{
//   if (chatbotMsgRef.value){
//     scrollDown();
//     console.log(chatbotMsgRef.value);
//   }
// },
// {
//   immediate: true,
// })

watch
const { darkBgColor, setColor } = useColorGenerator(props.chatbotName)

onMounted(() => {
  setColor()
})

const hasCopyButton = computed(() => {
  return props.isCopyable && props.chatbotMessage.length > 0
})

const hasText = computed(() => {
  return props.chatbotMessage.length > 0
})

const smallChatbotName = computed(() => {
  if (props.chatbotName.length > 2) {
    // return props.chatbotName.substring(0, 2).toUpperCase();
    if (props.chatbotName.includes(' ')) {
      const split = props.chatbotName.split(' ')
      return split[0].substring(0, 1).toUpperCase() + split[1].substring(0, 1).toUpperCase()
    } else {
      return props.chatbotName.substring(0, 2).toUpperCase()
    }
  } else {
    return props.chatbotName.toUpperCase()
  }
})

// const chatbotMsgRef: Ref<HTMLElement | null> = ref(null);
const chatbotImgUrl = ref('')

onMounted(() => {
  // if (chatbotMsgRef.value) {
  //   cursorLeftOffset.value = chatbotMsgRef.value.offsetWidth;
  // }

  if (props.iconName) {
    console.log('iconName', props.iconName)
    chatbotImgUrl.value = `${import.meta.env.VITE_IMG_BASE_URL}/${props.iconName}`
  }
})

watch(
  () => props.chatbotMessage,
  () => {
    // if (chatbotMsgRef.value) {
    //   cursorLeftOffset.value = chatbotMsgRef.value.offsetWidth;
    // }
  }
)

// const cursorLeftOffset = ref(0);

// const chatbotName = ref(props.chatbotName);
// const chatbotMessage = ref(props.chatbotMessage);

const isTextCopied = ref(false)

const onCopyClick = () => {
  if (isTextCopied.value) {
    return
  }
  if (window.navigator.userAgent.indexOf('Edge') > -1) {
    alert('Your browser does not support this feature. Please use a different browser.')
    return
  }
  if (!navigator.clipboard) {
    alert('Your browser does not support this feature. Please use a different browser.')
    return
  }
  navigator.clipboard.writeText(props?.originalMessage as string)
  isTextCopied.value = true

  setTimeout(() => {
    isTextCopied.value = false
  }, 2000)
}

// const onCopyTextMouseLeave = () => {
//   isTextCopied.value = false;
// };
</script>

<template>
  <li class="max-w-4xl py-2 px-4 sm:px-6 lg:px-8 mx-auto flex gap-x-2 sm:gap-x-4">
    <div
      :class="[!iconName ? darkBgColor : 'border border-gray-200 dark:border-gray-700']"
      class="flex-shrink-0 w-10 h-full p-0.5 rounded-full inline-flex items-center justify-center"
    >
      <img v-if="iconName" :src="chatbotImgUrl" alt="Bot Icon" class="w-10 h-10 rounded-full" />
      <span v-else class="text-lg font-poppins-semi-bold text-white leading-none">{{
        smallChatbotName
      }}</span>
    </div>

    <div class="flex flex-col space-y-3 items-start w-full">
      <div class="flex-shrink-0 h-10 rounded-full flex items-center">
        <div class="text-sm font-poppins-semi-bold mb-2 tracking-wide leading-tight">
          <!--          {{ props.chatbotName }}-->
        </div>
      </div>
      <div class="space-y-3 text-sm bg-emerald-100 rounded-t-2xl rounded-bl-2xl p-3">
        <div class="h-full w-full inline-flex flex-col relative overflow-hidden">
          <template v-if="hasText">
            <div
              ref="chatbotMsgRef"
              class="space-y-1.5 font-medium md:space-y-2 lg:space-y-3 inline overflow-auto"
              v-html="props.chatbotMessage"
            ></div>

            <!--            <span v-if="isTyping" class="loading loading-ring loading-md"></span>-->
          </template>
          <template v-else>
            <span class="loading loading-ball loading-sm"></span>
          </template>
        </div>
      </div>
      <div v-if="hasText && !props.hasError" class="flex w-full">
        <div
          v-if="hasText && hasCopyButton"
          class="flex flex-row items-center justify-between grow"
        >
          <div class="">
            <div
              v-if="false"
              class="inline-flex border border-gray-200 rounded-full p-0.5 space-x-0.5 dark:border-gray-700"
            >
              <button
                class="inline-flex flex-shrink-0 justify-center items-center h-8 w-8 rounded-full text-gray-500 hover:bg-blue-100 hover:text-blue-800 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-blue-900 dark:hover:text-blue-200 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                type="button"
              >
                <span class="sr-only">Like</span>
                <span class="material-icons-outlined !text-base">thumb_up</span>
              </button>
              <button
                class="inline-flex flex-shrink-0 justify-center items-center h-8 w-8 rounded-full text-gray-500 hover:bg-blue-100 hover:text-blue-800 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-blue-900 dark:hover:text-blue-200 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                type="button"
              >
                <span class="sr-only">Dislike</span>
                <span class="material-icons-outlined !text-base">thumb_down</span>
              </button>
            </div>
            <button
              v-if="hasCopyButton"
              class="py-2 px-3 inline-flex items-center gap-x-2 text-sm rounded-full border border-transparent text-gray-500 hover:text-lime-500 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none hover:text-primary active:scale-95 transition duration-300"
              type="button"
              @click="onCopyClick"
            >
              <span v-if="!isTextCopied" class="material-icons-round !text-xl">content_copy</span>
              <span v-else class="material-icons-round !text-xl">check</span>
              <span v-if="!isTextCopied" class="font-poppins-semi-bold text-xs"> Copy </span>
              <span v-else class="font-poppins-semi-bold text-xs"> Copied </span>
            </button>
            <!--            <button type="button"-->
            <!--                    class="py-2 px-3 inline-flex items-center gap-x-2 text-sm rounded-full border border-transparent text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none hover:text-green-500 active:scale-95 transition duration-300">-->
            <!--              <span class="material-icons-round !text-xl">share</span>-->
            <!--              <span class="font-poppins-semi-bold text-xs">-->
            <!--                Share-->
            <!--              </span>-->
            <!--            </button>-->
          </div>

          <div v-if="false" class="mt-1 sm:mt-0 self-end">
            <button
              class="py-2 px-3 inline-flex items-center gap-x-2 text-sm rounded-full border border-transparent text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none hover:text-red-500 active:scale-95 transition duration-300"
              type="button"
            >
              <span class="material-icons-round !text-xl">restart_alt</span>
              <span class="font-poppins-semi-bold text-xs"> New answer </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </li>
</template>

<style scoped>
.chatbot-pop {
  animation: chatbot-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
}

@keyframes slideInFromLeft {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(0);
  }
}

@keyframes chatbot-pop {
  0% {
    transform: scale(0);
  }
  25% {
    transform: scale(1.1);
  }
  50% {
    transform: scale(0.9);
  }
  75% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

#blinking-cursor {
  width: 2px; /* Adjust the width of the cursor */
  height: 24px; /* Adjust the height of the cursor */
  animation: blink 0.65s step-end infinite; /* Blinking animation */
}

.cursor-after::after {
  content: '<span class="material-icons-round">keyboard_arrow_right</span>';
  width: 2px; /* Adjust the width of the cursor */
  height: 24px; /* Adjust the height of the cursor */
  animation: blink 0.65s steps(1) infinite; /* Blinking animation */
}

/* Define the blinking animation */
@keyframes blink {
  0%,
  100% {
    opacity: 1; /* Cursor visible */
  }
  50% {
    opacity: 0; /* Cursor hidden */
  }
}
</style>
