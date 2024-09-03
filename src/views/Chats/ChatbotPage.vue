<script lang="ts" setup>
import UserBubble from '../../components/Chat/UserBubble.vue'
import UserInput from '../../components/Chat/UserInput.vue'
import ChatbotBubble from '../../components/Chat/ChatbotBubble.vue'
import {computed, onBeforeMount, onMounted, type Ref, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {type PageContent, usePageContentStore} from '@/stores/admin/page-data'
import {useChatbotStore} from '@/stores/chatbot'
import {marked} from 'marked'
import LoadingOverlay from '../../components/LoadingOverlay.vue'
import _ from 'lodash'
import hljs from 'highlight.js'
import {useNotificationsStore} from '@/stores/notifications'
import {useAuthStore, type UserInfo} from '@/stores/auth'
import {io} from 'socket.io-client'
import {useAdminHomeStore} from '@/stores/admin/home'
import DialogModal from '@/components/DialogModal.vue'

interface ChatbotPageProps {
  chatbotNameprop: string
}

const notificationStore = useNotificationsStore()
const tokenStore = useAuthStore()
const authStore = useAuthStore()
const homeStore = useAdminHomeStore()

const route = useRoute()
const pageContentStore = usePageContentStore()
const chatbotStore = useChatbotStore()
const router = useRouter()
const sesh_id = ref('')
const chatbotImg = ref('')

// mesRes declaration
// step 1

const mesRes = ref('')

//establish connections with socket io
const socket = io('wss://botsockets.mzawadi.com/', {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000
  // timeout: 20000,
})

const props = withDefaults(defineProps<ChatbotPageProps>(), {
  chatbotNameprop: 'Mzawadi'
})
socket.on('disconnect', () => {
  console.log('connection failed-disconnected')
})

//listen to connection error
socket.on('connect_error', (error) => {
  console.log('Connection error', error)
})
//getting session id for established session

socket.on('connected', (sesh) => {
  console.log('connected successfully!!')
  console.log(sesh)
  sesh_id.value = sesh.sessionId
})

const confirmSignOut = () => {
  homeStore.signOutDialog.isOpen = true
}

const logOut = () => {
  if (authStore.userRole === 'user') {
    authStore.chatBotUser = ''
    router.push({name: 'lets-chat'})
    console.log('user is logged out')
  } else {
    authStore.logoutAdmin()
    console.log('Admin logged out')
    router.push({name: 'admin-login'})
  }
}

const appIsFetching = ref(true)

// const page = ref(route.params.chatbotId);
const pageId = ref(route.params.pageId as string)
const pageContent = ref<PageContent | null>(null)

const chatbotName = ref<string>('')
const promptPlaceholder = ref<string>('')
const staticGreeting = ref<string>('')
const currentYear = new Date().getFullYear()
// const iconImg = pageContent.value?.iconName
// const imgUrl = `${import.meta.env.VITE_IMG_BASE_URL}/${iconImg}`

// color customization

// const baseBgColor = ref('bg-requested-color');
// const baseTextColor = ref('text-requested-color');
const chatTextColor = ref('text-neutral-800')
const titleTextColor = ref('text-gray-800')
const inputRingColor = ref('ring-primary')
const inputBtnColor = ref('text-primary')
const inputBg = ref<string>('bg-requested-color')

const bgImg = ref('')

onBeforeMount(() => {
  console.log('Inside the before mount')
  if (authStore.chatBotUser === '') {
    console.log('No user data')
    router.push({name: 'lets-chat'})
  }
  if (authStore.userRole === 'user') {
    console.log(authStore.chatBotUser)
    console.log(JSON.parse(authStore.chatBotUser).iconName)
    const userChatbotImg = JSON.parse(authStore.chatBotUser).iconName
    chatbotImg.value = `${import.meta.env.VITE_IMG_BASE_URL}/${userChatbotImg}`
    // chatbotImg.value = JSON.parse(authStore.chatBotUser)

    // if (authStore.chatBotUser === '') {
    //   console.log('No user data')
    //   router.push({ name: 'lets-chat' })
    // }

    console.log('Hey it user user!')
    try {
      pageContent.value = pageContentStore.getPageContentByPageId(pageId.value)
      console.log('pageContent', pageContent.value)
      console.log('user details', authStore.chatBotUser)
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
    } catch (error: any) {
      console.log(error)
      appIsFetching.value = false

      notificationStore.addNotification(
          error ?? 'Oops! Something went wrong. Please try again.',
          'error'
      )
    }
  } else if (authStore.adminIsLoggedIn) {
    console.log('Hey it admin user!')
    pageContentStore
        .fetchPageContentItems()
        .then(() => {
          pageContent.value = pageContentStore.getPageContentByPageId(pageId.value)
          console.log('admin details -', pageContent.value)
          const chatbotUrl = pageContent.value?.iconName
          console.log(chatbotUrl)
          chatbotImg.value = `${import.meta.env.VITE_IMG_BASE_URL}/${chatbotUrl}`

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
        })
        .catch((error) => {
          console.log(error)
          appIsFetching.value = false

          notificationStore.addNotification(
              error ?? 'Oops! Something went wrong. Please try again.',
              'error'
          )
        })
  }
})

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
    console.log('page id', pageId.value)

    // const userData
    //emit request to the server
    if (authStore.userRole === 'user') {
      const userData = JSON.parse(authStore.chatBotUser) as UserInfo

      socket.emit('message', {
        //sending request to the socket
        message: formatted,
        page_id: pageId.value,
        // token: tokenStore.token,
        conversationId: userData.conversationId
      })
    } else {
      socket.emit('message', {
        //sending request to the socket
        message: formatted,
        page_id: pageId.value,
        // token: tokenStore.token,
        // conversationId: userData.conversationId
        conversationId: null
      })
    }

    console.log('emitted!')
  } catch (error) {
    // socket.on("connect", )
    console.log(error)

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

    notificationStore.addNotification('Oops! Something went wrong. Please try again.', 'error')
  }
}

socket.on('message', (response) => {
  // console.log(response)
  const parsedResponse = JSON.parse(response)
  // console.log(parsedResponse.sessionId)
  console.log('sesh_id: ', sesh_id.value)
  console.log(parsedResponse.message)
  if (parsedResponse.sessionId === sesh_id.value) {
    mesRes.value += parsedResponse.message
    // console.log(mesRes.value)
  } else {
    return
  }
  // mesRes.value += response
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

      console.log(currentMsg)

      if (value.includes('~~~ENDOFSTREAM~~~')) {
        mesRes.value = ''
        isGeneratingResponse.value = false
        currentAiMsg.value.isTyping = false
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

  // if (isScrolling.value) {
  //   return;
  // }

  const conversationCon = document.querySelector('#user-input-placeholder')

  conversationCon?.scrollIntoView({
    behavior: 'smooth',
    block: 'end',
    inline: 'nearest'
  })

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
const theme = ref()
onMounted(async () => {
  try {
    await chatbotStore.getTheme()
        .then((resp) => {
          console.log(resp)
          const {result, data} = resp
          if (result === 'ok') {
            theme.value = {...data}
            console.log(theme.value?.sideNavColor)
            notificationStore.addNotification('Theme Settings fetched successfully', 'success')
          } else {
            notificationStore.addNotification('An error occurred fetching Theme Settings', 'error')
          }
        })
  } catch (error) {
    console.log('error--', error)
  }
})
// onMounted(() => {
// socket.connect()
// socket.on('connect', () => {
//   console.log('connected!')
// })
// // socket.emit('message', formatted)
// socket.on('message', (response) => {
//   console.log(response)
//   // stop generating ressponse if end of string
//   if (response === '~~~ENDOFSTREAM~~~') {
//     isGeneratingResponse.value = false
//   }
//   // else {
//   // isGeneratingResponse.value = true;
//   // }
//   chatbotMessageResponse.value += response
//   // else{
//   aiMessage.value.isTyping = false;
//   socket.disconnect();
//   socket.on("disconnect", ()=>{
//     console.log("disconnect!")
//     aiMessage.value.message += '|| -- last message -- ||';
//   })
//   console.log("**disconnected**!")
// }
// })

// document.querySelector('#main-container')?.addEventListener('scroll', (evt) => {
document.addEventListener('scroll', (_evt) => {
  // console.log(evt)
  // console.log('scrolling')

  currentScrollPosition.value = document.documentElement.scrollTop

  // we know that the user has reached at the bottom if the current scroll position is greater than or equal to the conversation container height minus the viewport height
  // isBottom.value = currentScrollPosition.value >= (conversationContainerHeight.value - viewportHeight.value);
  if (conversationContainerRef.value)
    isBottom.value =
        conversationContainerRef.value?.scrollTop >=
        conversationContainerRef.value?.scrollHeight - conversationContainerRef.value?.clientHeight

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
})

// conversationContainerHeight.value = conversationContainerRef.value?.clientHeight || 0;

// console.log('conversationContainerHeight', conversationContainerHeight.value);

setTimeout(() => {
  scrollToBottom()
}, 800)

// watch over the conversation array
watch(conversation.value, () => {
  // get the height of the conversation container
  conversationContainerHeight.value = conversationContainerRef.value?.clientHeight || 0

  // isBottom.value = conversationContainerRef.value?.scrollTop >= conversationContainerRef.value?.scrollHeight - conversationContainerRef.value?.clientHeight;

  // isBottom

  scrollToBottom()
  // if the conversation container height is greater than the viewport height
  // toggleSticky.value =
})

// const logOut = () => {
//   if (authStore.userRole === 'user') {
//     authStore.chatBotUser = ''
//     router.push({ name: 'lets-chat' })
//     console.log('user is logged out')
//   } else {
//     authStore.logoutAdmin()
//     console.log('Admin logged out')
//     router.push({ name: 'admin-login' })
//   }
// }

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

// const confirmSignOut = () => {
//   homeStore.signOutDialog.isOpen = true
// }
</script>

<template>
  <div v-if="theme" :class="[bgImg ? 'page-bg-color' : 'bg-requested-color']" class="chat-page">
    <!-- Sidebar -->
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

        <small class="text-xs">&copy; 2009-{{ currentYear }} Powered by Mzawadi</small>
      </nav>
    </div>
    <!-- End Sidebar -->

    <div
        id="main-container"
        ref="conversationContainerRef"
        class="relative min-h-screen w-full lg:ps-64"
    >
      <div class="py-10 lg:py-14">
        <!-- Title -->
        <div class="max-w-4xl px-4 sm:px-6 lg:px-8 mx-auto text-center">
          <div class="flex justify-center items-center">
            <img class="h-14 w-14 rounded-full" src="@/assets/imgs/chatbot.png"/>

            <h1 :class="titleTextColor" class="text-3xl font-bold sm:text-4xl ps-2">
              {{ chatbotName }} AI
            </h1>
          </div>

          <p class="mt-3 text-gray-600 dark:text-gray-400">
            <!--            Your AI-powered copilot for the web-->
            Here to help you with your questions
          </p>
        </div>
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
                        :original-message="message.value?.originalMessage"
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
            <button class="btn bg-emerald-100 me-5" @click="logOut">Sign Out</button>
            <button class="btn bg-emerald-400 w-[200px]" @click="homeStore.closeSignOutDialog()">
              Cancel
            </button>
          </div>
        </template>
      </DialogModal>
    </teleport>
  </div>
  <div v-else>
    <loading-overlay/>
  </div>
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
  background-image: v-bind('bgImg');
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
