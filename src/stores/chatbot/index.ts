// listen for a serverside event

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useNotificationsStore } from '../notifications'

// const BASE_URL = import.meta.env.VITE_API_URL as string;

// const BASE_URL = 'http://35.179.94.88/api';
// const BASE_URL = 'http://192.168.1.7:5000/api';
const BASE_URL = 'http://192.168.100.12:5001'
const BOT_URL = import.meta.env.VITE_API_URL as string
const pgSlug = ref('')

export const useChatbotStore = defineStore('chatbot', () => {
  // state

  // create the variables to store the connection and the stream

  interface ChatHistory {
    Content: string
    Id: number
    conversationId: string
    createdAt: string
    title: string
  }

  interface ChatDisplay {
    content: string
    conversationId: string
    createdAt: string
    isUser: string
    chatId: number
  }

  const stringArray = ref<string[]>([])
  const oldString = ref<string>('')
  const newString = ref<string>('')
  const responseString = ref<string>('')
  const notifications = useNotificationsStore()
  const collapse = ref<boolean>(false)
  const chatHistoryArray = ref<ChatHistory[]>([])
  const chatDisplayArray = ref<ChatDisplay[]>([])
  const activeHistory = ref<number>()
  const reloadNeChat = ref<boolean>(false)

  // getters

  const getChatbot = computed(() => {
    return stringArray.value.join('')
  })
  const getOldString = computed(() => {
    return oldString.value
  })
  const getNewString = computed(() => {
    return newString.value
  })
  const getLastString = computed(() => {
    return stringArray.value[stringArray.value.length - 1]
  })

  const getActiveHistory = computed(() => {
    return activeHistory.value
  })

  const setActiveHistory = (id: number) => {
    activeHistory.value = id
  }

  const setNewChatButton = (value: boolean) => {
    return (reloadNeChat.value = value)
  }

  // actions

  async function establishConnection(pageId: string, userQuery: string) {
    // console.log('establishConnection', pageId);

    // establish connection with the server

    // const websocket =  new WebSocket("ws://192.168.100.38:5000")
    // websocket.onopen(event =>{
    //     // console.log('established connection');
    //     console.log(event)
    //     websocket.send(JSON.stringify({
    //         pageId,
    //         userQuery,
    //     }));
    // })

    // //receive message from a server

    // websocket.onmessage(event=>{
    //     console.log('received message', event.data);
    //     const data = JSON.parse(event.data);
    //     // console.log('data', data);
    //     if (data.response.ok) {
    //         responseString.value = data.response;
    //     } else {
    //         notifications.addNotification("There is an error with the response", "error")
    //     }
    // })

    // //closing connection with the websocket connection
    // websocket.onclose =(event)=>{
    //     //closeconnection console
    //     console.log(event.code)
    //     websocket.close();
    // }

    //establish connection with socket io
    console.log(userQuery)

    //    const socket = io("ws://192.168.100.12:5001");
    //    socket.on("connect",()=>{
    //     console.log("Connected successfully!!!");
    //    })
    //    //disconnection of socket

    //    socket.on("disconect", ()=>{
    //     console.log("Disconnected successfully!");
    //    })
    //emmit request to server

    //    response from server

    const notificationsStore = useNotificationsStore()

    // try {

    //     socket.emit("messsage", userQuery);
    //     socket.on("message", (response)=>{
    //         console.log(response);
    //        stringArray.value.push(response);
    //     })
    //     // console.log(stringArray.value);
    //     return stringArray.value;

    // } catch (error) {
    //     console.log(error);
    //     notificationsStore.addNotification("There is an error with the response", "error")
    // }

    // const response = await fetch(`${BASE_URL}/`, {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //         pageId,
    //         userQuery,

    //     }),
    // });

    // const reader = response.body?.getReader();

    // const chunck = reader?.read();

    // ***************************************

    // handle the streamable response
    // const stream = new ReadableStream({
    //     start(controller) {
    //         // The following function handles each data chunk
    //         function push() {
    //             // "done" is a Boolean and value a "Uint8Array"
    //             reader?.read()
    //                 .then(({done, value}) => {
    //                     // Is there no more data to read?
    //                     if (done) {
    //                         // Tell the browser that we have finished sending data
    //                         controller.close();
    //                         return;
    //                     }
    //                     // Get the data and send it to the browser via the controller
    //                     controller.enqueue(value);
    //                     push();
    //                 });
    //         }

    //         push();
    //     }
    // });

    // // Respond with our stream
    // return new Response(stream, {headers: {"Content-Type": "text/html"}});

    // create a new reader
    //     const reader2 = responseStream.body.getReader();

    //     // read the stream
    //     const result = await reader2.read();

    //     // convert the stream to a string
    //     const decoder = new TextDecoder();

    //     // push the result to the string array
    //     stringArray.value.push(decoder.decode(result.value));

    //     // listen for new data
    //     reader2.read().then(function processText({done, value}) {
    //         // Result objects contain two properties:
    //         // done  - true if the stream has already given you all its data.
    //         // value - some data. Always undefined when done is true.
    //         if (done) {
    //             console.log("Stream complete");
    //             return;
    //         }
    //         // value for fetch streams is a Uint8Array
    //         console.log("Received", decoder.decode(value));
    //         responseString.value = decoder.decode(value);
    //         stringArray.value.push(decoder.decode(value));
    //         // Read some more, and call this function again
    //         return reader2.read().then(processText);
    //     });

    //     return stringArray.value.join('');
    // } catch (e) {
    //     console.error(e);

    //     notificationsStore.addNotification('An error occurred while fetching the chatbot response', 'error');

    //     throw e;
    // }
  }

  async function getConversationHistory(pageSlug: string, phoneNo: string) {
    const notification = useNotificationsStore()
    console.log(pageSlug, phoneNo)
    pgSlug.value = pageSlug
    try {
      const response = await fetch(`${BOT_URL}/chat-history/${pageSlug}/titles/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({
          phoneNo: phoneNo
        })
      })
      const resp = await response.json()
      console.log(resp)
      return resp
    } catch (error) {
      console.log(error)
      // notification.addNotification('There is an error fetching chat history', 'error')
    }
  }

  async function displayHistory(convId: string) {
    const notification = useNotificationsStore()
    console.log(pgSlug.value)
    try {
      const response = await fetch(`${BOT_URL}/chat-history/${pgSlug.value}/chats/${convId}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      })
      const resp = await response.json()
      // chatDisplay.value.splice(0, chatDisplay.value.length)
      console.log(resp)
      const { data, result } = resp
      chatDisplayArray.value = data
      return resp
    } catch (error) {
      console.log(error)
      notification.addNotification('There is an error fetching chat history', 'error')
    } finally {
      console.log('finally')
    }
  }

  return {
    stringArray,
    responseString,
    oldString,
    newString,
    getChatbot,
    getOldString,
    getNewString,
    getLastString,
    establishConnection,
    getConversationHistory,
    collapse,
    chatHistoryArray,
    chatDisplayArray,
    displayHistory,
    pgSlug,
    setActiveHistory,
    getActiveHistory,
    setNewChatButton,
    reloadNeChat
  }
})
