<script lang="ts" setup>
import {RouterView} from "vue-router";
import {useAppHomeStore} from "./stores/home";
import ToastAlert from "@/views/Admin/toasts/ToastAlert.vue";
import ToastContainer from "@/views/Admin/toasts/ToastContainer.vue";
import {useNotificationsStore} from "@/stores/notifications";

const appHomeStore = useAppHomeStore();
const notificationStore = useNotificationsStore()

</script>

<template>
  <RouterView #default="{ Component, route }">
    <!--    <template v-if="!appHomeStore.isAppFetching">-->
    <template v-if="Component">
      <component :is="Component" :key="route.fullPath"/>
    </template>
    <!--    </template>-->
    <template v-else-if="appHomeStore.isAppFetching">
      <div class="flex flex-col items-center justify-center h-screen">
        <div class="flex flex-col items-center justify-center mx-auto space-y-2">
          <span class="loading loading-ball loading-lg"></span>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            Loading...
          </p>
        </div>
      </div>
    </template>
  </RouterView>
  <ToastContainer v-if="notificationStore.hasNotifications">
    <!--        <ToastAlert text="Page name is required" type="error" id=""/>-->
    <template v-for="notification in notificationStore.getNotifications" :key="notification.id">
      <ToastAlert
          v-if="notification.id && notification.isShown"
          :id="notification.id"
          :is-shown="notification.isShown"
          :message="notification.message"
          :type="notification.type"
      />
    </template>
  </ToastContainer>
</template>

<style scoped></style>
