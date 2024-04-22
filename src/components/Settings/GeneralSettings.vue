<script lang="ts" setup>
import {reactive} from "vue";

const settingsData = reactive({
  name: "General Settings",
  subdomain: "https://",
  homepage: "https://",
});
</script>

<template>
  <div class="flex flex-col py-5">
    <div class="flex flex-col rounded-lg bg-white">
      <div class="flex flex-row items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <div>
          <label class="label text-xs font-semibold" for="page-name">
            Name
          </label>
          <input
              id="name"
              v-model="settingsData.name"
              class="input input-bordered input-primary w-full text-sm" placeholder="Name" type="text"/>
          <small class="text-xs text-gray-500">
            The name of your website
          </small>
        </div>
      </div>

      <div class="flex flex-row items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <div>
          <label class="label text-xs font-semibold" for="subdomain">
            Subdomain
          </label>
          <input
              id="subdomain"
              v-model="settingsData.subdomain"
              class="input input-bordered input-primary w-full text-sm" placeholder="Subdomain" type="text"/>
          <small class="text-xs text-gray-500">
            The subdomain of your website
          </small>
        </div>
      </div>

      <div class="flex flex-row items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <div>
          <label class="label text-xs font-semibold" for="homepage">
            Homepage
          </label>
          <input
              id="homepage"
              v-model="settingsData.homepage"
              class="input input-bordered input-primary w-full text-sm" placeholder="Homepage" type="text"/>
          <small class="text-xs text-gray-500">
            The homepage of your website
          </small>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>