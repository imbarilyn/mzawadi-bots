<script lang="ts" setup>
import {computed, onMounted, type Ref, ref, watch} from 'vue'
import {useRouter} from 'vue-router'
import {type PageContent, usePageContentStore} from '@/stores/admin/page-data'
import {useNotificationsStore} from '@/stores/notifications'
import {useAuthStore} from '@/stores/auth'
import {io} from 'socket.io-client'
import {useAdminHomeStore} from '@/stores/admin/home'
import {marked} from 'marked'
import _ from 'lodash'
import hljs from 'highlight.js'
import UserBubble from '../../components/Chat/UserBubble.vue'
import UserInput from '../../components/Chat/UserInput.vue'
import ChatbotBubble from '../../components/Chat/ChatbotBubble.vue'
import LoadingOverlay from '../../components/LoadingOverlay.vue'
import DialogModal from '@/components/DialogModal.vue'
import {type ThemePayload, useChatbotStore} from '@/stores/chatbot'

interface ChatbotPageProps {
  cbName: string
}

const notificationsStore = useNotificationsStore()
const authStore = useAuthStore()
const homeStore = useAdminHomeStore()
const pageContentStore = usePageContentStore()
const chatBotStore = useChatbotStore()
const router = useRouter()
const sesh_id = ref('')
const chatbotImg = ref('')

// mesRes declaration
// step 1

const mesRes = ref('')

//establish connections with socket io
// bots socket =wss://botsockets.mzawadi.com/

const socket = io('wss://towersaccosocket.mzawadi.com/', {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000
  // timeout: 20000,
})

const props = withDefaults(defineProps<ChatbotPageProps>(), {
  cbName: 'Mzawadi'
})

const emits = defineEmits<{
  (event: 'pgSlug', value: string): void
}>()

socket.on('disconnect', () => {
  console.log('connection failed-disconnected')
})

//listen to connection error
socket.on('connect_error', (error) => {
  console.log('Connection error', error)
})

// establish connection
socket.on('connect', () => {
  console.log('connected!')
})
console.log("There is a connection")
chatBotStore
    .getConversationHistory(props.cbName, authStore.getMemberData.phoneNo)
    .then((response) => {
      if (response.result === 'ok') {
        chatBotStore.chatHistoryArray = response.data
        // console.log(typeof chatBotStore.chatHistoryArray[0].Id)
        console.log(chatBotStore.chatHistoryArray)
      }
    })
// on refreshing
const chatUser: any = authStore.getUserDetails()
console.log(chatUser)

// trying to get conversationId guess what for chatting to happen
const conversationIdTrigger = ref<boolean>(false)
// console.log(authStore.getUserDetails())
chatBotStore
    .getConvId({
      userName: chatUser.fullNames,
      phoneNo: chatUser.phoneNo,
      memberNo: chatUser.memberNo,
      pageSlug: chatUser.pageSlug
    })
    .then((response) => {
      if (response.conversationId) {
        sesh_id.value = response.conversationId
        console.log('Conversation-Id', response.conversationId)
        console.log(sesh_id.value)
        notificationsStore.addNotification('The chat bot is ready', 'success')
      } else {
        notificationsStore.addNotification('The chat bot is not ready, kindly reload', 'error')
        setTimeout(() => {
          conversationIdTrigger.value = true
        }, 1000)
      }
    })
    .catch((err) => {
      console.log(err)
      return
    })
    .finally(() => {
      conversationIdTrigger.value = false
    })

const logOut = () => {

  localStorage.clear()
  router.push({name: 'chat-login'})
  homeStore.signOutDialog.isOpen = false
}

const appIsFetching = ref(true)

// const page = ref(route.params.chatbotId);
// const pageId = ref(route.params.pageId as string)
const pageId = ref('')
const pageContent = ref<PageContent | null>(null)

const chatbotName = ref<string>('')
const promptPlaceholder = ref<string>('')
const staticGreeting = ref<string>('')
// const iconImg = pageContent.value?.iconName
// const imgUrl = `${import.meta.env.VITE_IMG_BASE_URL}/${iconImg}`

// color customization

// const baseBgColor = ref('bg-requested-color');
// const baseTextColor = ref('text-requested-color');
const chatTextColor = ref('text-neutral-800')
const titleTextColor = ref('text-gray-800')
const inputRingColor = ref('ring-emerald-200')
const inputBtnColor = ref('text-primary')
const inputBg = ref<string>('bg-requested-color')

const bgImg = ref('')
const theme = ref<ThemePayload>()
chatBotStore.getTheme()
    .then((resp) => {
      console.log(resp)
      const {result, data} = resp as { result: string; data: ThemePayload }
      if (result === 'ok') {
        theme.value = {...data}
        console.log("****theme-new-chat***", theme.value)
        // notificationsStore.addNotification('Theme Settings fetched successfully', 'success')
      } else {
        // notificationsStore.addNotification('An error occurred fetching Theme Settings', 'error')
      }
    })
onMounted(() => {
  if (authStore.memberData !== '') {
    authStore
        .createAccount({
          ...authStore.getMemberData,
          pageSlug: props.cbName
        })
        .then((response) => {
          console.log(response)
          pageContent.value = pageContentStore.getPageContentByChatbotName(props.cbName)
          // console.log(authStore.chatBotUser)
          console.log(JSON.parse(authStore.chatBotUser).iconName)
          const userChatbotImg = JSON.parse(authStore.chatBotUser).iconName
          console.log(userChatbotImg)
          chatbotImg.value = `${import.meta.env.VITE_IMG_BASE_URL}/${userChatbotImg}`
          console.log(chatbotImg.value)

          console.log('Hey it user user!')
          try {
            if (!pageContent.value) return
            chatbotName.value = pageContent.value.chatbotName
            promptPlaceholder.value = pageContent.value.promptPlaceholder
            staticGreeting.value = pageContent.value.staticGreeting

            window.document.title = pageContent.value.chatbotName

            if (pageContent.value)
              if (pageContent.value.pageSlug === 'gilbert') {
                titleTextColor.value = 'text-[#A42035]'
                chatTextColor.value = 'text-[#650B10]'
                inputRingColor.value = 'ring-[#B61D3A]'
                inputBtnColor.value = 'text-[#B61D3A]'

                // bgImg.value = '/Homepage_Grouse_Hero.png';

                bgImg.value = 'url("/Homepage_Grouse_Hero.png")'
                inputBg.value = 'bg-transparent'
              }

            setTimeout(() => {
              appIsFetching.value = false
            }, 500)
          } catch (error: any) {
            console.log(error)
            appIsFetching.value = false

            notificationsStore.addNotification(
                error ?? 'Oops! Something went wrong. Please try again.',
                'error'
            )
          }
        })
  } else {
    window.location.href = '/' + props.cbName + '/login'
  }
  // }
  if (authStore.adminIsLoggedIn) {
    console.log('Hey it admin user!')
    pageContentStore
        .fetchPageContentItems()
        .then(() => {
          // pageContent.value = pageContentStore.getPageContentByPageId(pageId.value)
          pageContent.value = pageContentStore.getPageContentByChatbotName(props.cbName)
          // console.log(pageContent.value)

          if (!pageContent.value) {
            router.replace({name: 'not-found'})
          } else {
            pageId.value = pageContent.value.pageId
            console.log('admin details -', pageContent.value)
            const chatbotUrl = pageContent.value?.iconName
            console.log(chatbotUrl)
            chatbotImg.value = `${import.meta.env.VITE_IMG_BASE_URL}/${chatbotUrl}`
            console.log("chatbot image**", chatbotImg.value)

            console.log('pageContent', pageContent.value)
            // if (!pageContent.value) {
            //   router.replace({ name: 'not-found' })
            // }

            if (!pageContent.value) return

            chatbotName.value = pageContent.value.chatbotName
            promptPlaceholder.value = pageContent.value.promptPlaceholder
            staticGreeting.value = pageContent.value.staticGreeting

            window.document.title = pageContent.value.chatbotName

            if (pageContent.value)
              if (pageContent.value.pageSlug === 'gilbert') {
                titleTextColor.value = 'text-[#A42035]'
                chatTextColor.value = 'text-[#650B10]'
                inputRingColor.value = 'ring-[#B61D3A]'
                inputBtnColor.value = 'text-[#B61D3A]'

                // bgImg.value = '/Homepage_Grouse_Hero.png';

                bgImg.value = 'url("/Homepage_Grouse_Hero.png")'
                inputBg.value = 'bg-transparent'
              }

            setTimeout(() => {
              appIsFetching.value = false
            }, 500)
          }
        })
        .catch((error) => {
          console.log(error)
          appIsFetching.value = false

          notificationsStore.addNotification(
              error ?? 'Oops! Something went wrong. Please try again.',
              'error'
          )
        })
  }

  console.log('Finished before mount')
})

console.log(theme.value)

interface Conversation {
  originalMessage?: string
  message: string
  isUser: boolean
  isTyping?: boolean
  hasError?: boolean
  uniqueId: string | number
  audioData?: {
    audioBlob: Blob
    // audioDuration: number;
    audioUrl: string
  }
}

const conversationContainerRef = ref<HTMLDivElement | null>()
// const conversationContainerHeight = computed(() => {
//   return conversationContainerRef.value?.clientHeight || 0;
// });
const userInputContainerHeight = computed(() => {
  return userInputContainerHeightRef.value?.clientHeight || 0
})
const userInputContainerHeightRef = ref<HTMLDivElement | null>()
const conversation = ref<Ref<Conversation>[]>([])
const aiResponses = ref<string[]>([])
const isGeneratingResponse = ref(false)
const openPhotoDialog = ref(false)

// create sample conversations from the sample data

const renderer: any = {
  link(href: string, title: string, text: string) {
    return `<a target="_blank" class="link link-primary" href="${href}" title="${title}">${text}</a>`
  },
  table(header: string, body: string) {
    return `
   <div class="bg-white p-2.5 rounded-xl shadow-lg shadow-slate-300/10 my-3">
    <div class="overflow-x-auto py-4">
        <table class="table table-zebra border">
        <thead>
            ${header}
        </thead>
        <tbody>
            ${body}
        </tbody>
    </table>
    </div>
    </div>
  `
  },
  tablerow(content: string) {
    return `
    <tr class="hover">${content}</tr>
  `
  },
  tablecell(content: string) {
    return `
    <td>${content}</td>
  `
  },
  code(code: string, language: string) {
    // return `
    //   <pre><div class="mockup-code my-3"><div class="px-4"><code>${code}</code></div></div></pre>
    // `;

    if (language) {
      const ignoreIllegals = true
      return `
  <div class="p-2 flex w-full">
       <pre class="w-full"><div class="mockup-code bg-neutral-800 my-3 relative shadow-xl w-full overflow-auto"><div class="px-4 flex-1 overflow-auto h-full w-full"><code class="language-${language}">${
          hljs.highlight(code, {
            language,
            ignoreIllegals
          }).value
      }</code></div></div></pre>
  </div>
    `
    } else {
      return `
  <div class="p-3 flex w-full">
    <pre class="w-full"><div class="mockup-code bg-neutral-800 my-2.5 w-full overflow-auto"><div class="px-4 flex-1 overflow-auto h-full w-full"><code>${code}</code></div></div></pre>
  </div>
  `
    }
  },
  list(body: string, ordered: boolean, start: number | undefined) {
    if (ordered) {
      if (start) {
        return `
         <div class="my-2 py-2 mx-3">
            <ol start="${start}" class="list-decimal list-outside mx-5 space-y-0.5 md:space-y-1 lg:space-y-1.5">${body}</ol>
         </div>
      `
      }
      return `
         <div class="my-2 py-2 mx-3">
            <ol class="list-decimal mx-5 list-outside space-y-0.5 md:space-y-1 lg:space-y-1.5">${body}</ol>
         </div>
    `
    } else {
      return `
         <div class="my-2 py-2 mx-3">
            <ul class="list-disc list-outside mx-5 space-y-0.5 md:space-y-1 lg:space-y-1.5">${body}</ul>
         </div>
    `
    }
  },
  listitem(text: string) {
    return `
    <li class="${chatTextColor.value}">${text}</li>
  `
  },
  paragraph(text: string) {
    return `
    <p class="${chatTextColor.value} leading-relaxed">${text}</p>
  `
  },
  heading(text: string, level: string) {
    return `
    <h${level} class="text-2xl font-poppins-bold ${chatTextColor.value} dark:text-neutral-50">${text}</h${level}>
  `
  },
  hr() {
    return `
    <hr class="my-4 border-neutral-200 dark:border-neutral-700"/>
  `
  },
  blockquote(quote: string) {
    return `
    <blockquote class="my-4 border-l-4 border-neutral-200 dark:border-neutral-700 pl-4">${quote}</blockquote>
  `
  },
  image(href: string, title: string, text: string) {
    return `
    <img src="${href}" alt="${text}" title="${title}" class="w-full"/>
  `
  },
  strong(text: string) {
    return `
    <strong class="font-poppins-semi-bold my-1 text-base">${text}</strong>
  `
  },
  codespan(code: string) {
    // return `
    //   <pre><div class="mockup-code"><div class="px-4"><code>${code}</code></div></div></pre>
    // `;

    // we'll rather render this like in chatGPT
    return `
    <code class="font-poppins-semi-bold my-1">&acute;${code}&acute;</code>
  `
  },
  descriptionList(body: string) {
    return `
    <dl>${body}</dl>
  `
  },
  description(dt: string, dd: string) {
    return `
    <dt>${dt}</dt>
    <dd>${dd}</dd>
  `
  }
}

// create a custom description list renderer

marked.use({
  renderer,
  breaks: true,
  gfm: true
})

// Function to find the difference between two strings
const lastKnownText = ref('')
const currentText = ref('')
// const blinkingCursor = ref(`
//     <div id="blinking-cursor" class="text-blue-950 text-xs">
// `)

const handleUserInput = (
    _value: string,
    formatted: string,
    audioData?: {
      audioBlob: Blob
      // audioDuration: number;
      audioUrl: string
    }
) => {
  // add the user's response to the conversation
  // scroll to the bottom of the conversation
  scrollToBottom()

  // console.log('handle-user-input -> audioData', audioData);

  const userMessage = ref<Conversation>({
    message: formatted,
    isUser: true,
    uniqueId: _.uniqueId('user-'),
    audioData
  })

  conversation.value.push(userMessage)

  // ai message

  const aiMessage = ref<Conversation>({
    message: '',
    isUser: false,
    isTyping: true,
    uniqueId: _.uniqueId('ai-')
  })

  setTimeout(() => {
    conversation.value.push(aiMessage)
    console.log(conversation.value)
  }, 500)

  // ****************************

  try {
    // console.log('page id', pageId.value)

    // const userData
    //emit request to the server
    if (authStore.userRole === 'user') {
      // const userData = JSON.parse(authStore.chatBotUser) as UserInfo
      console.log(sesh_id.value)
      socket.emit('message', {
        //sending request to the socket
        message: formatted,
        pageSlug: props.cbName,
        conversationId: sesh_id.value
      })
    } else {
      socket.emit('message', {
        //sending request to the socket
        message: formatted,
        pageSlug: props.cbName,
        conversationId: sesh_id.value
      })
    }

    console.log('emitted!')
  } catch (error) {
    scrollToBottom()

    aiMessage.value.hasError = true
    aiMessage.value.message += `
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-sm" role="alert">
            <strong class="font-bold">Oops!</strong>
            <span class="block sm:inline">Something went wrong. Please try again.</span>
        </div>
    `
    aiMessage.value.isTyping = false

    isGeneratingResponse.value = false

    notificationsStore.addNotification('Oops! Something went wrong. Please try again.', 'error')
  }
}

socket.on('message', (response) => {
  console.log("ai-stream***", response)
  const parsedResponse = JSON.parse(response)
  console.log(parsedResponse.message)
  mesRes.value += parsedResponse.message
})

watch(
    () => mesRes.value,
    (value) => {
      // console.log(value)
      if (!value) return

      const responsesArr = value.split('~~~ENDOFSTREAM~~~')

      console.log('responseArr: ', responsesArr)

      const currentMsg = responsesArr[0]

      const aiResponses = conversation.value.filter((convo) => !convo.value.isUser)

      const currentAiMsg = aiResponses[aiResponses.length - 1]
      console.log(aiResponses)

      currentAiMsg.value.message = currentMsg

      if (value.includes('~~~ENDOFSTREAM~~~')) {
        mesRes.value = ''
        isGeneratingResponse.value = false
        currentAiMsg.value.isTyping = false
        chatBotStore
            .getConversationHistory(props.cbName, authStore.getMemberData.phoneNo)
            .then((response) => {
              if (response.result === 'ok') {
                chatBotStore.chatHistoryArray = response.data
                console.log(chatBotStore.chatHistoryArray)
                console.log('trying to fetch history in chatHistory')
                notificationsStore.addNotification('Recent chat added successfully', 'success')
              } else {
                notificationsStore.addNotification('Unable to add recent chat', 'error')
              }
            })
        // console.log(mesRes.value);
      }
    }
)

const isScrollable = ref(false)
const isScrolling = ref(false)
const isBottom = ref(false)

const scrollToBottom = () => {
  // isBottom.value = currentScrollPosition.value >= (conversationContainerHeight.value - viewportHeight.value);

  console.log('isBottom', isBottom.value)

  if (currentScrollPosition.value > 0) {
    isScrollable.value = true
  }
  const conversationCon = document.querySelector('#user-input-placeholder')
  conversationCon?.scrollIntoView({
    behavior: 'smooth',
    block: 'end',
    inline: 'nearest'
  })

  // if (isScrolling.value) {
  //   return;
  // }


  // console.log('conversationContainerHeight', conversationContainerHeight.value);
  // console.log('userInputContainerHeight', userInputContainerHeight.value);
  // console.log('currentScrollPosition', currentScrollPosition.value);

  // console.log('conversationCon', conversationCon?.

  // conversationContainerRef.value?.scrollTo({
  // top: conversationCon.scrollHeight,
  // top: conversationContainerHeight.value,
  // behavior: 'smooth'
  // });
  // conversationContainerRef.value.scrollTop = conversationContainerHeight.value + (userInputContainerHeight.value * 2) + 100;
}

// Create a variable for toggling the relative and the sticky position
// const toggleSticky = computed(() => {
//   return (conversationContainerHeight.value + (userInputContainerHeight.value * 2)) > viewportHeight.value;
// });

const showScrollToBottomButton = computed(() => {
  // calculate the current scroll position by adding twice the height of the user input container and 100
  const val = currentScrollPosition.value + userInputContainerHeight.value * 2 + 100
  console.log('conversationContainerHeight', conversationContainerHeight.value)
  return isScrollable.value && !isBottom.value && val > conversationContainerHeight.value
})

// We'll calculate the viewport height and the height of the conversation container
// to determine when to toggle the sticky position
// const viewportHeight = computed(() => {
//   console.log('window.innerHeight', window.innerHeight)
//   return window.innerHeight;
// });

const currentScrollPosition = ref(0)

// We'll also create a variable for the height of the conversation container
const conversationContainerHeight = ref(0)

// document.querySelector('#main-container')?.addEventListener('scroll', (evt) => {
document.addEventListener('scroll', (_evt) => {
  // console.log(evt)
  // console.log('scrolling')

  currentScrollPosition.value = document.documentElement.scrollTop

  // we know that the user has reached at the bottom if the current scroll position is greater than or equal to the conversation container height minus the viewport height
  // isBottom.value = currentScrollPosition.value >= (conversationContainerHeight.value - viewportHeight.value);
  if (conversationContainerRef.value) {
    isBottom.value = conversationContainerRef.value?.scrollTop >= conversationContainerRef.value?.scrollHeight - conversationContainerRef.value?.clientHeight
    // isBottom.value = conversationContainerRef.value?.scrollTop - (conversationContainerRef.value?.scrollHeight - conversationContainerRef.value?.clientHeight) === 0

    // console.log({
    //   'scrollHeight': document.documentElement.scrollHeight,
    //   'clientHeight': document.documentElement.clientHeight,
    //   'scrollTop': document.documentElement.scrollTop,
    // });

    // isBottom.value = currentScrollPosition.value >= (conversationContainerHeight.value - viewportHeight.value);
    // isScrolling.value = true;

    // set is scrolling to true if the user is scrolling to the top and has not reached 0
    isScrolling.value = currentScrollPosition.value > 0 && !isBottom.value

    // console.log('isBottom', isBottom.value);
    // console.log('isScrolling', isScrolling.value);
    // console.log('conversationContainerHeight', conversationContainerHeight.value);
    // console.log('userInputContainerHeight', userInputContainerHeight.value);
    // console.log('currentScrollPosition', currentScrollPosition.value)
  }
})

// conversationContainerHeight.value = conversationContainerRef.value?.clientHeight || 0;

// console.log('conversationContainerHeight', conversationContainerHeight.value);


// watch over the conversation array
watch(conversation.value, () => {
  // get the height of the conversation container
  if (conversationContainerRef.value) {
    conversationContainerHeight.value = conversationContainerRef.value.clientHeight || 0
  }


  // isBottom.value = conversationContainerRef.value?.scrollTop >= conversationContainerRef.value?.scrollHeight - conversationContainerRef.value?.clientHeight;

  // isBottom
  console.log(conversationContainerHeight.value)
  scrollToBottom()
  // if the conversation container height is greater than the viewport height
  // toggleSticky.value =
})

setTimeout(() => {
  scrollToBottom()
  console.log('timeout for scroll to Bottom')
}, 1000)

// const chatBotStore = useChatbotStore()

const showMenuMedium = ref(false)
const showExpand = () => {
  showMenuMedium.value = true
}
const hideExpand = () => {
  showMenuMedium.value = false
  console.log('medium mouse-over')
}
const expandMenuMedium = () => {
  //   hideExpand()
  const sidebar = document.getElementById('application-sidebar')
  sidebar?.classList.remove('hidden')
  chatBotStore.setIsMedium(true)
  //   const main_container = document.getElementById('main-container')
  //   main_container?.classList.add('z-[30]')
  //
  //   isMedium.value = true
  //   const btn_medium = document.getElementById('btn-medium')
  //   btn_medium?.classList.add('hidden')
  //
  //   console.log('expand menu') // hideExpand()
}

const openPhotoModal = () => {
  console.log('Open Photo Dialog')
  chatBotStore.openPhotoDialog()
}

const openFileDialog = () => {
  console.log('upload File', chatBotStore.isFile)
  chatBotStore.openFileDialog()
}

const closePhotoDialog = () => {
  chatBotStore.closePhotoDialog()
  chatBotStore.isFile = false
}

const closeConversationIdDialog = () => {
  conversationIdTrigger.value = false
}


const reloadPage = () => {
  chatBotStore.reloadForConvesationId()
  closeConversationIdDialog()
}
</script>

<template>
  <div
      v-if="theme"
      :class="[bgImg ? 'page-bg-color' : 'bg-requested-color']"
      class="chat-page relative flex min-h-full w-full"
  >
    <div
        id="main-container"
        ref="conversationContainerRef"
        :class="[chatBotStore.collapse ? '' : 'lg:ps-64']"
        class="relative min-h-screen flex-1 "

    >
      <div class="sticky top-0  z-20 bg-white lg:flex-row">
        <div id="btn-medium" class="lg:hidden block ps-2 pt-2 lg:pt-6">
          <button @click="expandMenuMedium" @mouseleave="hideExpand" @mouseover="showExpand">
            <span class="material-icons-outlined">menu</span>
          </button>
          <small
              v-if="showMenuMedium"
              class="absolute rounded-md left-6 top-12 p-0.5 bg-gray-700 text-white transition ease-in-out duration-300"
          >expand menu
          </small>
        </div>
        <div
            class="flex gap-4 md:flex-row flex-col justify-center items-center lg:py-10 bg-white z-10 max-w-4xl mx-auto text-center"
        >
          <div class="pb-8 md:col-span-1 col-span-2 flex justify-center items-center w-36">
            <img v-if="chatbotImg" :src="chatbotImg" alt="chatbot-icon" class="h-full w-full">
            <img v-else alt="chatbot-icon" class="h-full w-full rounded-full" src="@/assets/imgs/chatbot.png"/>
          </div>
          <div class="md:col-span-1 col-span-2">
            <h1 :class="titleTextColor" class="text-2xl font-bold lg:text-4xl">
              {{ chatbotName }} AI
            </h1>
            <p class="mt-3 text-gray-600 dark:text-gray-400">
              <!--            Your AI-powered copilot for the web-->
              Here to help you with your questions
            </p>
          </div>


        </div>

      </div>

      <div>
        <div class="lg:py-10">
          <!-- Title -->

          <div class="grow mt-14">
            <!-- End Title -->
            <Transition mode="out-in" name="slide-in">
              <template v-if="!appIsFetching">
                <div class="">
                  <ChatbotBubble
                      :key="1"
                      :chat-text-color="chatTextColor"
                      :chatBubbleBg="theme.chatBubble"
                      :chatbot-message="
                      staticGreeting
                        ? marked.parse(staticGreeting)
                        : 'Hello there! How can I help you today?'
                    "
                      :chatbot-name="chatbotName"
                      :icon-name="pageContent?.iconName"
                      :is-typing="false"
                      :themeName="theme.name"
                  />

                  <ul class="space-y-5">
                    <template v-for="(message, index) in conversation" :key="index">
                      <UserBubble
                          v-if="
                          message.value.isUser &&
                          message.value.message &&
                          message.value.message.length > 0
                        "
                          :key="message.value.uniqueId"
                          :audio-data="message.value?.audioData"
                          :chat-text-color="chatTextColor"
                          :themeName="theme.name"
                          :user-message="message.value.message"
                          :userBubbleBg="theme.userBubble"
                          user-name="John Doe"
                      />
                      <!-- <div class="ai-respose"> -->
                      <!-- :key="message.value.uniqueId" -->

                      <ChatbotBubble
                          v-else-if="!message.value.isUser"
                          :key="index"
                          :chat-text-color="chatTextColor"
                          :chatBubbleBg="theme.chatBubble"
                          :chatbot-message="marked.parse(message.value.message)"
                          :chatbot-name="chatbotName"
                          :disclosure-message="pageContent?.closureMessage"
                          :has-disclosure-message="pageContent?.displayClosureMessage"
                          :has-error="message.value?.hasError"
                          :icon-name="pageContent?.iconName"
                          :is-copyable="index !== 0"
                          :is-typing="message.value?.isTyping"
                          :original-message="message.value.message"
                          :themeName="theme.name"
                      />

                      <!-- </div> -->
                    </template>
                  </ul>
                </div>
              </template>
              <template v-else-if="appIsFetching">
                <LoadingOverlay :show="appIsFetching"/>
              </template>
            </Transition>
          </div>
        </div>
        <div ref="userInputContainerHeightRef" class="sticky w-full bottom-0">
          <div class="relative">
            <button
                v-if="showScrollToBottomButton"
                class="absolute -top-4 right-1/2 rounded-full bg-neutral-500 shadow-lg shadow-slate-300/10 p-2 opacity-30 hover:opacity-100 transition-opacity duration-300 active:scale-95 focus:outline-none"
                @click="scrollToBottom"
            >
              <svg
                  class="h-5 w-5 text-slate-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
              >
                <path
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                />
              </svg>
            </button>
            <div v-if="isBottom" class="py-4 bg-gradient-to-t from-requested-color block"></div>
            <div
                :class="!isBottom ? inputBg : 'bg-requested-color'"
                class="w-full px-4 md:px-6 pb-8 flex-1"
            >
              <div class="grid grid-cols-1 w-11/12 md:w-10/12 mx-auto">
                <UserInput
                    :disabled="false"
                    :input-btn-color="inputBtnColor"
                    :is-generating="isGeneratingResponse"
                    :prompt-placeholder="promptPlaceholder"
                    :ring-color="inputRingColor"
                    :textareaColor="theme.textAreaColor"
                    :themeName="theme.name"
                    user-input=""
                    @openPhotoModal="openPhotoModal"
                    @userInput="handleUserInput"
                />
              </div>
            </div>
          </div>
        </div>
        <div id="user-input-placeholder"></div>
      </div>
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
              <button
                  :class="[`bg-${theme.name}-100`]"
                  class="btn  me-5" @click="logOut">Sign Out
              </button>
              <button
                  :class="[`bg-${theme.name}-300`]"
                  class="btn   w-[200px]" @click="homeStore.closeSignOutDialog()">
                Cancel
              </button>
            </div>
          </template>
        </DialogModal>
        <DialogModal
            :is-open="chatBotStore.openPhoto.isOpen"
            @closeModal="chatBotStore.closePhotoDialog()"
        >
          <template #title>
            <div class="w-full flex justify-end">
              <button class="btn btn-sm btn-circle" @click="closePhotoDialog">
                <span class="material-icons-outlined"> clear </span>
              </button>
            </div>
          </template>
          <template #body>
            <h1 class="font-semibold text-normal text-center">Upload a file or take a photo</h1>
          </template>

          <template #footer>
            <div class="flex justify-center">
              <button
                  :class="[`bg-${theme.name}-100`]"
                  class="btn btn-sm" @click="openFileDialog">Upload
              </button>
              <button
                  :class="[`bg-${theme.name}-300`]"
                  class="btn btn-sm ms-2"
                  @click="chatBotStore.openCameraModal(true)"
              >
                Take Photo
              </button>
            </div>
          </template>
        </DialogModal>
        <DialogModal :is-open="conversationIdTrigger" @closeModal="closeConversationIdDialog">
          <template #title>
            <div class="w-full flex justify-end">
              <button class="btn btn-sm btn-ghost btn-circle" @click="closeConversationIdDialog">
                <span class="material-icons-outlined">close</span>
              </button>
            </div>
            <div class="flex justify-center">
              <span class="material-icons-outlined !text-6xl pb-2">&#x1F622;</span>
            </div>
          </template>
          <template #body>
            <div class="flex justify-center">
              <h1 class="text-xl font-bold">Oh no! The chatbot is not ready</h1>
            </div>
            <div class="flex justify-center">
              <p class="text-lg font-semibold">Kindly refresh</p>
            </div>
          </template>
          <template #footer>
            <div class="flex justify-center">
              <button :class="[`bg-${theme.name}-300`]"
                      class="btn btn-sm px-6"
                      @click="reloadPage">
                <span class="material-icons-outlined text-white">refresh</span>
              </button>
            </div>
          </template>
        </DialogModal>
      </teleport>
    </div>
  </div>
  <!--  <div v-else>-->
  <!--    <loading-overlay/>-->
  <!--  </div>-->
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.5s,
  transform 0.5s;
}

.fade-slide-enter,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/** let's have the animation run on the same element as the transition */
.message-enter-active,
.message-leave-active {
  transition: all 0.5s ease-in;
}

/** this is the starting state of the enter animation */
.message-enter {
  opacity: 0;
  transform: translateX(-20px);
}

/** this is the ending state of the enter animation */
.message-enter-to {
  opacity: 1;
  transform: translateX(0);
}

/** this is the starting state of the leave animation */
.message-leave {
  opacity: 1;
  transform: translateX(0);
}

/** this is the ending state of the leave animation */
.message-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

#blinking-cursor {
  width: 2px; /* Adjust the width of the cursor */
  height: 24px; /* Adjust the height of the cursor */
  background-color: black; /* Cursor color */
  animation: blink 0.65s step-end infinite; /* Blinking animation */
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

.page-bg-color {
  /*background-image: v-bind('bgImg');*/
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

.page-bg-color::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
}
</style>
