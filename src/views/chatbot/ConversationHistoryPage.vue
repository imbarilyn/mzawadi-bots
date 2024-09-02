<script lang="ts" setup>
import {useChatbotStore} from '@/stores/chatbot'
import {useNotificationsStore} from '@/stores/notifications'
import {useRouter} from 'vue-router'

const chatBotStore = useChatbotStore()
const router = useRouter()

interface ConversationHistoryPageProps {
  content: string
  id: number
  conversationId: string
  createdAt: string
  title: string
  botBubbleColor: string
}

const notification = useNotificationsStore()

const props = defineProps<ConversationHistoryPageProps>()
console.log("*************", props)
const viewHistory = (convId: string) => {
  chatBotStore.setNewChatButton(false)
  chatBotStore.displayHistory(convId).then((response) => {
    console.log('response', response)
    if (response.result === 'ok') {
      chatBotStore.chatDisplayArray = response.data
      console.log('chatDisplay', chatBotStore.chatDisplayArray)
      router.push({
        name: 'chatHistory',
        params: {convId: convId, cbName: chatBotStore.pgSlug}
      })
    } else {
      notification.addNotification('error occurred', 'error')
    }
  })
}
</script>

<template>
  <div class="w-52 flex flex-row text-sm pb-2 overflow-hidden">
    <button
        id="histButton"
        :class="[chatBotStore.getActiveHistory === props.id? props.botBubbleColor: '']"
        class="btn btn-ghost btn-sm"
        @click="viewHistory(props.conversationId)"
    >
      <span
          class="material-icons-outlined !text-sm text-neutral-600"> chat_bubble_outline </span>
      <span
          class="text-neutral-600">{{
          props.title
        }}</span>
    </button>
  </div>
</template>

<style scoped></style>
