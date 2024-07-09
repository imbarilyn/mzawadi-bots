<script lang="ts" setup>
interface ConversationHistoryPageProps {
  content: string
  id: number
  conversationId: string
  createdAt: string
  title: string
}

const props = defineProps<ConversationHistoryPageProps>()

const viewHistory = (id: number) => {
  console.log('Viewing history', id)
}
</script>

<template>
  <div class="w-52 flex flex-row text-sm pb-2 overflow-hidden">
    <button class="btn btn-ghost btn-sm" @click="viewHistory(props.id)">
      <span class="material-icons-outlined"> chat_bubble_outline </span>
      <span class="">Chats {{ props.title }}</span>
    </button>
  </div>
</template>

<style scoped></style>
