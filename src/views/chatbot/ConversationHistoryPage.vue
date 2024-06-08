<script lang="ts" setup>
import { onMounted } from 'vue'

interface ConversationHistoryPageProps {
  // all chatbot names are lowercase
  chatbotName: string
}

const props = withDefaults(defineProps<ConversationHistoryPageProps>(), {
  chatbotName: 'Mzawadi'
})

onMounted(() => {
  console.log('ConversationHistoryPage mounted')
  console.log('Chatbot Name:', props.chatbotName)
})
</script>

<template>
  <div>
    <h1>Conversation History Page</h1>
    <p>Chatbot Name: {{ props.chatbotName }}</p>
  </div>
</template>

<style scoped></style>
