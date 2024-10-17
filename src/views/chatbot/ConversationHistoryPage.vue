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

const props = defineProps<ConversationHistoryPageProps>()
const viewHistory = (convId: string) => {
  router.push({
    name: 'chatHistory',
    params: {convId: convId, cbName: chatBotStore.pgSlug}
  })
}
</script>

<template>
  <div :class="[chatBotStore.getActiveHistory === props.conversationId? props.botBubbleColor: '']"
       class="grid grid-cols-12 btn btn-ghost btn-sm text-sm gap-1"
       @click="viewHistory(props.conversationId)">
    <div class="col-span-2 flex flex-row items-center">
      <span
          class="material-icons-outlined !text-sm text-neutral-600"> chat_bubble_outline </span>
    </div>
    <div class="col-span-10 flex flex-row">
      <p
          class=" line-clamp-1  text-start">{{
          props.title
        }}</p>
    </div>
  </div>
</template>

<style scoped></style>
