<script lang="ts" setup>
import { useAdminHomeStore } from '@/stores/admin/home'
import DialogModal from '@/components/DialogModal.vue'
import { reactive, ref, watch } from 'vue'
import { useNotificationsStore } from '@/stores/notifications'
import { useField } from 'vee-validate'
import { usePageContentStore } from '@/stores/admin/page-data'

const homeStore = useAdminHomeStore()
const notificationStore = useNotificationsStore()
const isAddInputField = ref<boolean>(false)
const pageContentStore = usePageContentStore()

interface UrlInput {
  url: string
  description: string
}

interface PageDetails {
  pageId: string
}

const inputPayloadArray = ref<UrlInput[]>([])

const inputPayload = reactive({
  url1: '',
  url2: '',
  description1: '',
  description2: ''
})

const props = defineProps<PageDetails>()

const urlValidation = (value: string) => {
  if (!value) {
    return 'Url is required'
  }
  if (!value.startsWith('https://')) {
    return 'Url must start with https://'
  }
  return true
}

const {
  value: url1,
  meta: url1Meta,
  errorMessage: url1ErrorMessage
} = useField('url1', urlValidation)

watch(
  () => inputPayload.url1,
  (value) => {
    url1.value = value
  }
)

const {
  value: url2,
  meta: url2Meta,
  errorMessage: url2ErrorMessage
} = useField('url2', urlValidation)

watch(
  () => inputPayload.url2,
  (value) => {
    url2.value = value
  }
)
const descriptionValidation = (value: string) => {
  if (!value) {
    return 'Description is required'
  }
  const descriptionRegex = /^[a-zA-Z0-9_ ]*$/
  if (!descriptionRegex.test(value)) {
    return 'Description must be alphanumeric'
  }
  return true
}

const {
  value: description1,
  meta: description1Meta,
  errorMessage: description1ErrorMessage
} = useField('description1', descriptionValidation)

watch(
  () => inputPayload.description1,
  (value) => {
    description1.value = value
  }
)

const {
  value: description2,
  meta: description2Meta,
  errorMessage: description2ErrorMessage
} = useField('description2', descriptionValidation)

watch(
  () => inputPayload.description2,
  (value) => {
    description2.value = value
  }
)

const addLink = () => {
  homeStore.openLinkDialog()
}

const moreUrls = () => {
  if (url1Meta.valid && description1Meta.valid) {
    isAddInputField.value = true
    inputPayloadArray.value.push({
      url: inputPayload?.url1,
      description: inputPayload?.description1
    })
  } else {
    notificationStore.addNotification('Please fill the required fields', 'error')
  }
}
const postUrl = () => {
  if (url1Meta.valid && description1Meta.valid && url2Meta.valid && description2Meta.valid) {
    inputPayloadArray.value.push({
      url: inputPayload?.url1,
      description: inputPayload?.description1
    })
    pageContentStore
      .addUrl(inputPayloadArray)
      .then((res) => {
        if (res) {
          notificationStore.addNotification('Link added successfully', 'success')
        } else {
          notificationStore.addNotification('Failed to add link', 'error')
        }
      })
      .catch((error) => {
        console.log(error)
        notificationStore.addNotification('Failed to add link', 'error')
      })
      .finally(() => {
        setTimeout(() => {
          homeStore.closeLinkDialog()
        }, 500)
      })
  } else {
    notificationStore.addNotification('Please fill the required fields', 'error')
  }
}
</script>

<template>
  <div>
    <div class="absolute right-0 p-3">
      <button class="btn btn-sm btn-ghost font-medium rounded-full md:rounded-md" @click="addLink">
        <span class="material-icons-round">add</span>
        new Link
      </button>
    </div>
    <div class="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
      <!-- Grid -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          class="group flex flex-col h-full bg-white border border-gray-200 shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70"
        >
          <div class="h-52 flex flex-col justify-center items-center bg-blue-600 rounded-t-xl">
            <div class="bg-white h-20 w-20 rounded-lg flex justify-center items-center">
              <span class="material-icons-round !text-5xl rotate-[135deg]"> link </span>
            </div>
          </div>
          <div class="p-4 md:p-6">
            <h3
              class="text-xl font-semibold text-gray-800 dark:text-neutral-300 dark:hover:text-white"
            >
              Link Name
            </h3>
            <p class="mt-3 text-gray-500 dark:text-neutral-500">Description.............</p>
          </div>
          <div
            class="mt-auto flex border-t border-gray-200 divide-x divide-gray-200 dark:border-neutral-700 dark:divide-neutral-700"
          >
            <button
              class="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-es-xl bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
            >
              <span class="material-icons-round rotate-[135deg]"> link </span>

              Visit Link
            </button>
            <button
              class="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-ee-xl bg-white text-gray-400 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
            >
              <span class="material-icons-round h-6 w-8 text-gray-400">delete</span>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
    <teleport to="body">
      <DialogModal :is-open="homeStore.linkDialog.isOpen" @closeModal="homeStore.closeLinkDialog">
        <template #title>
          <h3 class="text-lg font-semibold">Add Link</h3>
        </template>
        <template #body>
          <div class="flex flex-col space-y-2">
            <input
              v-model="inputPayload.url1"
              :class="{
                'input-error': url1Meta.validated && !url1Meta.valid,
                'input-primary': url1Meta.validated && url1Meta.valid
              }"
              class="input input-bordered input-primary w-full text-sm"
              placeholder="Add Url link"
              type="text"
            />
            <small v-if="url1Meta.validated && !url1Meta.valid" class="text-rose-500">{{
              url1ErrorMessage
            }}</small>
            <textarea
              v-model="inputPayload.description1"
              :class="{
                'input-error': description1Meta.validated && !description1Meta.valid,
                'input-primary': description1Meta.validated && description1Meta.valid
              }"
              class="input input-bordered input-primary w-full text-sm"
              placeholder="Description..."
              type="text"
            />
            <small
              v-if="description1Meta.validated && !description1Meta.valid"
              class="text-rose-500"
              >{{ description1ErrorMessage }}
            </small>
          </div>

          <!--          addition field-->
          <div v-show="isAddInputField" class="flex flex-col space-y-2 pt-4">
            <input
              v-model="inputPayload.url2"
              :class="{
                'input-error': url2Meta.validated && !url2Meta.valid,
                'input-primary': url2Meta.validated && url2Meta.valid
              }"
              class="input input-bordered input-primary w-full text-sm"
              placeholder="Add Url link"
              type="text"
            />
            <small v-if="url2Meta.validated && !url2Meta.valid" class="text-rose-500">{{
              url2ErrorMessage
            }}</small>
            <textarea
              v-model="inputPayload.description2"
              :class="{
                'input-error': description2Meta.validated && !description2Meta.valid,
                'input-primary': description2Meta.validated && description2Meta.valid
              }"
              class="input input-bordered input-primary w-full text-sm"
              placeholder="Description..."
              type="text"
            />
            <small
              v-if="description2Meta.validated && !description2Meta.valid"
              class="text-rose-500"
              >{{ description2ErrorMessage }}
            </small>
          </div>
        </template>
        <template #footer>
          <div>
            <button v-if="!isAddInputField" class="btn btn-primary" @click="moreUrls">
              More Url
            </button>
            <button v-else class="btn btn-primary" type="button" @click="postUrl">Add Url</button>
          </div>
        </template>
      </DialogModal>
    </teleport>
  </div>
</template>
