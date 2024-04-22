<script lang="ts" setup>
import UserBubble from '../../components/Chat/UserBubble.vue'
import UserInput from '../../components/Chat/UserInput.vue'
import ChatbotBubble from '../../components/Chat/ChatbotBubble.vue'
import { computed, onBeforeMount, onMounted, type Ref, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PageContent, usePageContentStore } from '../../stores/admin/page-data'
import { useChatbotStore } from '../../stores/chatbot'
import { marked } from 'marked'
import LoadingOverlay from '../../components/LoadingOverlay.vue'
import _ from 'lodash'
import hljs from 'highlight.js'
import { useNotificationsStore } from '../../stores/notifications'
import { io } from 'socket.io-client'

const notificationsStore = useNotificationsStore()

const route = useRoute()
const pageContentStore = usePageContentStore()
const chatbot = useChatbotStore()
const router = useRouter()
//establish connections with socket io
const socket = io('ws://3.11.13.199')
// socket.disconnect();
// socket.connect();
// socket.on('connect', () => {
//   console.log('connected successfully!')
// })

//incase of a disconnection
// socket.on('disconnect', () => {
//   console.log('disconnected')
// })

const appIsFetching = ref(true)

// const page = ref(route.params.chatbotId);
const pageId = ref(route.params.pageId as string)
const pageContent = ref<PageContent | null>(null)

const chatbotName = ref<string | null>(null)
const promptPlaceholder = ref<string | null>(null)
const staticGreeting = ref<string | null>(null)

// color customization

// const baseBgColor = ref('bg-requested-color');
// const baseTextColor = ref('text-requested-color');
const chatTextColor = ref('text-neutral-800')
const titleTextColor = ref('text-gray-800')
const inputRingColor = ref('ring-primary')
const inputBtnColor = ref('text-primary')
const inputBg = ref('bg-requested-color')

const bgImg = ref(null)

const chatbotMessageResponse = ref('')

onBeforeMount(() => {
  pageContentStore.fetchPageContentItems().then(() => {
    pageContent.value = pageContentStore.getPageContentByPageId(pageId.value)
    console.log('pageContent', pageContent.value)
    if (!pageContent.value) {
      router.replace({ name: 'not-found' })
    }

    chatbotName.value = pageContent.value.chatbotName
    promptPlaceholder.value = pageContent.value.promptPlaceholder
    staticGreeting.value = pageContent.value.staticGreeting

    window.document.title = pageContent.value.chatbotName

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
})

interface Conversation {
  message: string
  originalMessage?: string
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

 

  isGeneratingResponse.value = true

  setTimeout(() => {
    conversation.value.push(aiMessage)
    console.log(conversation.value)
  }, 500)

  // try {
  //   // send the user's response to the server
  //   // and wait for the server to send the AI's response
  //   chatbot.establishConnection(pageId.value, formatted)
  //       .then((responseStream: Response) => {

  //         // create a new reader
  //         const reader2 = responseStream.body?.getReader();

  //         // read the stream
  //         return reader2?.read().then((result) => {

  //           // convert the stream to a string
  //           const decoder = new TextDecoder();

  //           let newMessage = decoder.decode(result.value);

  //           // console.log(newMessage);
  //           console.log('Start');

  //           const lastKnownTextTokens = lastKnownText.value.split('~~~NEWLINE~~~');
  //           // const currentTextTokens = currentText.value.split('~~~NEWLINE~~~');
  //           const newMessageTokens = newMessage.split('~~~NEWLINE~~~');
  //           // console.log(newMessageTokens);

  //           const newTokens = newMessageTokens.filter((token) => {
  //             return !lastKnownTextTokens.includes(token);
  //           });

  //           // for each token in the new message
  //           newTokens.forEach((token) => {

  //             // console.log(token)
  //             // if the token is not in the last known text
  //             if (!lastKnownTextTokens.includes(token)) {

  //               const previousToken = currentText.value;

  //               if (previousToken.length <= token.length) {
  //                 // add the token to the AI message
  //                 aiMessage.value.message = marked.parse(token);
  //                 // add the original message to the AI message
  //                 aiMessage.value.originalMessage = token;
  //                 // + blinkingCursor.value;
  //                 currentText.value = token;

  //                 // add the token to the last known text
  //                 lastKnownTextTokens.push(token);
  //               }
  //             } else {
  //               // add the token to the last known text
  //               lastKnownTextTokens.push(token);

  //               // console.log(lastKnownTextTokens)
  //               // console.log(lastKnownTextTokens[lastKnownTextTokens.length - 1])
  //             }
  //           });

  //           aiResponses.value.push(newMessage);

  //           // listen for new data
  //           return reader2.read().then(function processText({done, value}) {
  //             // Result objects contain two properties:
  //             // done  - true if the stream has already given you all its data.
  //             // value - some data. Always undefined when done is true.
  //             if (done) {
  //               console.log("Stream complete");

  //               console.log(aiResponses.value)

  //               isGeneratingResponse.value = false;

  //               aiMessage.value.isTyping = false;

  //               lastKnownText.value = '';

  //               currentText.value = '';
  //               return;
  //             }

  //             newMessage = decoder.decode(value);

  //             // value for fetch streams is a Uint8Array

  //             const lastKnownTextTokens = lastKnownText.value.split('~~~NEWLINE~~~');
  //             const newMessageTokens = newMessage.split('~~~NEWLINE~~~');

  //             const newTokens = newMessageTokens.filter((token) => {
  //               return !lastKnownTextTokens.includes(token);
  //             });

  //             newTokens.forEach((token) => {

  //               // console.log(token)
  //               // if the token is not in the last known text
  //               if (!lastKnownTextTokens.includes(token)) {
  //                 // add the token to the ai message
  //                 // const previousToken = aiMessage.value.message;
  //                 const previousToken = currentText.value;

  //                 if (previousToken.length <= token.length) {
  //                   // add the token to the ai message
  //                   aiMessage.value.message = marked.parse(token);
  //                   // add the original message to the ai message
  //                   aiMessage.value.originalMessage = token;
  //                   // + blinkingCursor.value;
  //                   currentText.value = token;

  //                   // add the token to the last known text
  //                   lastKnownTextTokens.push(token);
  //                 }
  //               } else {
  //                 // add the token to the last known text
  //                 lastKnownTextTokens.push(token);

  //                 // console.log(lastKnownTextTokens)
  //               }
  //             });

  //             // debouncedUpdateResponse(newMessage);
  //             // console.log(aiMessage.value.message)

  //             scrollToBottom();
  //             // Read some more, and call this function again
  //             return reader2.read().then(processText);
  //           });
  //         })
  //       }).catch((error: Error) => {
  //     console.log(error);

  //     scrollToBottom();

  //     aiMessage.value.hasError = true;
  //     aiMessage.value.message += `
  //       <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-sm" role="alert">
  //           <strong class="font-bold">Oops!</strong>
  //           <span class="block sm:inline">Something went wrong. Please try again.</span>
  //       </div>
  //   `;
  //     aiMessage.value.isTyping = false;

  //     isGeneratingResponse.value = false;

  //     notificationsStore.addNotification('Oops! Something went wrong. Please try again.', 'error');

  //   }).finally(() => {
  //     // console.log('finally')
  //     aiMessage.value.isTyping = false;

  //     isGeneratingResponse.value = false;
  //   });}

  // ****************************

  try {  

    //set connection
    socket.on("connect", ()=>{
      console.log("Connected successfully!!")
    })
    //emit request to the server
    socket.emit('message', formatted);
    console.log("emitted!");

    //wait for response from sserver
    socket.on("message",(response)=>{
      console.log(response);
      //check if the ENDOFSTREAM
      watch(response, (value)=>{
        const newString =  value.split("ENDOFSTREAM");
        if(newString.includes("ENDOFSTREAM")){
          aiMessage.value.isTyping = false;
          isGeneratingResponse.value = false;
          socket.disconnect();
        }
        //if not ENDOFSTREAM get the response and assign message
        else{
          const newResponse = newString[newString.length - 1];
          aiMessage.value = newResponse;
        }
      })      
    })    
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

    notificationsStore.addNotification('Oops! Something went wrong. Please try again.', 'error')
  }
}

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

onMounted(() => {
  
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
  })

  // document.querySelector('#main-container')?.addEventListener('scroll', (evt) => {
  document.addEventListener('scroll', (_evt) => {
    // console.log(evt)
    // console.log('scrolling')

    currentScrollPosition.value = document.documentElement.scrollTop

    // we know that the user has reached at the bottom if the current scroll position is greater than or equal to the conversation container height minus the viewport height
    // isBottom.value = currentScrollPosition.value >= (conversationContainerHeight.value - viewportHeight.value);
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
</script>

<template>
  <div :class="[bgImg ? 'page-bg-color' : 'bg-requested-color']" class="chat-page">
    <!-- Sidebar -->
    <div
      id="application-sidebar"
      class="hs-overlay hs-overlay-open:translate-x-0 -translate-x-full duration-300 transform hidden fixed top-0 start-0 bottom-0 z-[60] w-64 bg-white border-e border-gray-200 overflow-y-auto lg:block lg:translate-x-0 lg:end-auto lg:bottom-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-slate-700 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500 dark:bg-slate-900 dark:border-gray-700"
    >
      <nav class="hs-accordion-group w-full h-full flex flex-col" data-hs-accordion-always-open>
        <div class="flex items-center justify-center pt-4 pe-4 ps-7">
          <div class="h-10 sm:h-14 p-2 sm:p-3">
            <img src="/icon.png" class="w-full h-full object-center" alt="Bot Icon Img" />
          </div>
          <!-- Logo -->
        </div>

        <div class="h-full">
          <!-- List -->
          <ul v-if="false" class="space-y-1.5 p-4">
            <li>
              <a
                class="flex items-center gap-x-3 py-2 px-3 text-sm text-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 dark:text-slate-400 dark:hover:text-slate-300 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                href="#"
              >
                <svg
                  class="flex-shrink-0 w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                New chat
              </a>
            </li>
          </ul>
          <!-- End List -->
        </div>

        <!-- Footer -->
        <!-- <div class="mt-auto"> -->
        <!--          <div class="py-2.5 px-7">-->
        <!--            <p class="inline-flex items-center gap-x-2 text-xs text-green-600">-->
        <!--              <span class="block w-1.5 h-1.5 rounded-full bg-green-600"></span>-->
        <!--              Active 12,320 people-->
        <!--            </p>-->
        <!--          </div>-->

        <!--          <div class="p-4 border-t border-gray-200 dark:border-gray-700">-->
        <!--            <a class="flex justify-between items-center gap-x-3 py-2 px-3 text-sm text-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 dark:text-slate-400 dark:hover:text-slate-300 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"-->
        <!--               href="#">-->
        <!--              Sign in-->
        <!--              <svg class="flex-shrink-0 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24"-->
        <!--                   viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"-->
        <!--                   stroke-linejoin="round">-->
        <!--                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>-->
        <!--                <polyline points="10 17 15 12 10 7"/>-->
        <!--                <line x1="15" x2="3" y1="12" y2="12"/>-->
        <!--              </svg>-->
        <!--            </a>-->
        <!--          </div>-->
        <!--        </div> -->
        <!-- End Footer -->
      </nav>
    </div>
    <!-- End Sidebar -->

    <div
      ref="conversationContainerRef"
      id="main-container"
      class="relative min-h-screen w-full lg:ps-64"
    >
      <div class="py-10 lg:py-14">
        <!-- Title -->
        <div class="max-w-4xl px-4 sm:px-6 lg:px-8 mx-auto text-center">
          <h1 class="text-3xl font-bold sm:text-4xl" :class="titleTextColor">
            {{ chatbotName }} AI
          </h1>
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
                  :icon-name="pageContent?.iconName"
                  :key="1"
                  :chatbot-message="staticGreeting"
                  :chatbot-name="chatbotName"
                  :chat-text-color="chatTextColor"
                  :is-typing="false"
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
                      :user-message="message.value.message"
                      :audio-data="message.value?.audioData"
                      :chat-text-color="chatTextColor"
                      user-name="John Doe"
                    />
                    <!-- <div class="ai-respose"> -->
                    <!-- :key="message.value.uniqueId" -->
                    <ChatbotBubble
                      v-else-if="!message.value.isUser"
                      :key="message.value.uniqueId"
                      :icon-name="pageContent?.iconName"
                      :chatbot-message="marked.parse(message.value.message)"
                      :chatbot-name="chatbotName"
                      :disclosure-message="pageContent?.closureMessage"
                      :has-disclosure-message="pageContent?.displayClosureMessage"
                      :has-error="message.value?.hasError"
                      :is-copyable="index !== 0"
                      :original-message="message.value?.originalMessage"
                      :chat-text-color="chatTextColor"
                      :is-typing="message.value?.isTyping"
                    />
                    <!-- </div> -->
                  </template>
                </ul>
              </div>
            </template>
            <template v-else-if="appIsFetching">
              <LoadingOverlay :show="appIsFetching" />
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
                :is-generating="isGeneratingResponse"
                :prompt-placeholder="promptPlaceholder"
                user-input=""
                :ring-color="inputRingColor"
                :input-btn-color="inputBtnColor"
                @userInput="handleUserInput"
              />
            </div>
          </div>
        </div>
      </div>
      <div id="user-input-placeholder"></div>
    </div>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.5s,
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
