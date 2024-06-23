<script lang="ts" setup>
import { reactive, ref, watch } from 'vue'
import { useAdminHomeStore } from '@/stores/admin/home'
import DialogModal from '@/components/DialogModal.vue'
import { useField } from 'vee-validate'
import { type LinkItem, usePageContentStore } from '@/stores/admin/page-data'
import { useNotificationsStore } from '@/stores/notifications'
import FileItem from '@/views/Admin/FileItem.vue'
import UrlLink from '@/views/Admin/toasts/UrlLink.vue'
import ProductPage from '@/views/Admin/ProductPage.vue'

interface PageDetails {
  pageId: string
}

interface TabStyle {
  name: string
  value: string
}

interface UrlInput {
  url: string
  description: string
}

const inputPayloadArray = ref<UrlInput[]>([])

const inputPayload = reactive({
  url1: '',
  url2: '',
  description1: '',
  description2: ''
})

const homeStore = useAdminHomeStore()
const notificationStore = useNotificationsStore()
const activeTab = ref<string>('Options')

const props = defineProps<PageDetails>()
const pageContentStore = usePageContentStore()
const isAddInputField = ref(false)
const files = ref<any>()
const links = ref<LinkItem[]>([])

const productName = reactive({
  productOne: '',
  productTwo: '',
  productThree: '',
  pageId: ''
})

//color generation for cards

const moreDynamicTabs = ref<TabStyle[]>([
  {
    name: 'Options',
    value: 'options'
  },
  {
    name: 'Content',
    value: 'content'
  },
  {
    name: 'Links',
    value: 'links'
  },
  {
    name: 'Products',
    value: 'products'
  },
  {
    name: 'Files',
    value: 'files'
  }
])

const fetching = ref<boolean>(false)

const toggleDynamicSettings = (tab: string) => {
  console.log(typeof tab)
  console.log(tab)
  // fetching.value = true

  activeTab.value = tab
  if (tab === 'files') {
    pageContentStore.getUploadedPdf(props.pageId).then((resp) => {
      console.log(resp)
      files.value = resp
      // console.log(files.value.documentUrl)

      setTimeout(() => {
        fetching.value = false
      }, 500)
    })
  }

  if (tab === 'links') {
    pageContentStore.getUrlLink(props.pageId).then((resp) => {
      if (resp.result === 'ok') {
        links.value = resp.data as LinkItem[]
        notificationStore.addNotification('Links fetched successfully', 'success')
      } else {
        notificationStore.addNotification('An error occurred while fetching links', 'error')
      }
    })
  }
}

const addProduct = () => {
  homeStore.openProductDialog()
}

const productValidator = (value: string) => {
  if (!value) {
    return 'Product name is required'
  }
  if (value.length < 3) {
    return 'Product name must be at least 3 characters'
  }
  const productRegEx = /^[a-zA-Z0-9_ ]*$/
  if (!productRegEx.test(value)) {
    return 'Product name must be alphanumeric'
  }
  return true
}

const {
  value: productOne,
  meta: productOneMeta,
  errorMessage: productOneErrorMessage
} = useField('productOne', productValidator)

watch(
  () => productName.productOne,
  (value) => {
    console.log(value)
    productOne.value = value
  }
)

const {
  value: productTwo,
  meta: productTwoMeta,
  errorMessage: productTwoErrorMessage
} = useField('productTwo', productValidator)

watch(
  () => productName.productTwo,
  (value) => {
    productTwo.value = value
  }
)

const {
  value: productThree,
  meta: productThreeMeta,
  errorMessage: productThreeErrorMessage
} = useField('productThree', productValidator)

watch(
  () => productName.productThree,
  (value) => {
    productThree.value = value
  }
)

const postProduct = () => {
  const pageId = props.pageId
  productName.pageId = pageId
  console.log(pageId)
  if (productOneMeta.valid && productTwoMeta.valid && productThreeMeta.valid) {
    homeStore
      .addProduct(productName)
      .then((prd) => {
        if (prd) {
          productOne.value = ''
          productOneMeta.valid = false
          productOneMeta.validated = false
          productTwo.value = ''
          productTwoMeta.valid = false
          productTwoMeta.validated = false
          productThree.value = ''
          productThreeMeta.valid = false
          productThreeMeta.validated = false
          console.log('Product added successfully')
        } else {
          console.log('Product not added')
        }
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => {
        homeStore.closeProductDialog()
      })
  }
}

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
  if ((url1Meta.valid && description1Meta.valid) || (url2Meta.valid && description2Meta.valid)) {
    inputPayloadArray.value.push({
      url: inputPayload?.url2,
      description: inputPayload?.description2
    })
    pageContentStore
      .addUrl(inputPayloadArray.value, props.pageId)
      .then((res) => {
        if (res === 'ok') {
          notificationStore.addNotification('Link added successfully', 'success')
        } else {
          notificationStore.addNotification('An error occurred while adding links', 'error')
        }
      })
      .catch((error) => {
        console.log(error)
        notificationStore.addNotification('An error occurred while adding links', 'error')
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
  <div class="m-3">
    <nav
      aria-label="Tabs"
      class="relative w-full z-0 flex border rounded-xl overflow-hidden dark:border-neutral-700"
      role="tablist"
    >
      <div v-for="(tab, index) in moreDynamicTabs" :key="index" class="w-full bg-gray-200">
        <button
          id="bar-with-underline-item-1"
          :class="{ 'text-blue-500': activeTab === tab.name }"
          :disabled="fetching"
          aria-controls="bar-with-underline-1"
          class="bg-gray-200 rounded-md m-1 min-w-0 flex-1 focus:bg-white border-s py-2 px-3 text-gray-500 hover:text-gray-700 hover:text-lg text-sm font-medium text-center overflow-hidden hover:bg-gray-50 focus:z-10 focus:outline-none focus:text-blue-600 focus:shadow-md focus:text-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-l-neutral-700 dark:border-b-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-400 active"
          data-hs-tab="#bar-with-underline-1"
          role="tab"
          type="button"
          @click="toggleDynamicSettings(tab.value)"
        >
          {{ tab.name }}
        </button>
      </div>
    </nav>
    <div v-if="activeTab === 'options'">
      <h1>Options Section</h1>
    </div>
    <div v-if="activeTab === 'content'">
      <h1>Content Section</h1>
    </div>
    <div v-if="activeTab === 'links'">
      <div class="w-full flex justify-end pt-4">
        <button
          class="btn btn-sm bg-sky-300 font-medium rounded-full md:rounded-md"
          @click="addLink"
        >
          <span class="material-icons-round">add</span>
          new Link
        </button>
      </div>
      <div
        v-if="!links"
        class="my-10 bg-neutral-200 rounded-xl p-4 flex items-center justify-center"
      >
        <p class="text-neutral-500 dark:text-neutral-300 text-xs flex items-center justify-center">
          <span class="material-icons-round mr-2">description</span>
          Created links will appear here
        </p>
      </div>
      <UrlLink
        v-for="(link, index) in links"
        :key="index"
        :is-open="homeStore.linkDialog"
        :link="link"
        :pageId="props.pageId"
      />
    </div>
    <transition
      fade-enter="transition 4s ease-out"
      fade-enter-from="opacity-0"
      fade-enter-to="opacity-1"
      fade-leave="transition 2s ease-in"
      fade-leave-from="opacity 1"
      fade-leave-to="opacity-0"
      name="fade"
    >
      <div v-if="activeTab === 'products'">
        <div class="absolute right-0 pe-6">
          <button
            class="btn btn-sm btn-ghost rounded-full md:rounded-md font-medium"
            @click="addProduct"
          >
            <i class="material-icons text-neutral-400 !text-2xl">add_box</i>
            <span class="hidden md:inline-block"> New Product </span>
          </button>
        </div>
        <!--        product cards-->
        <ProductPage />
      </div>
    </transition>

    <!--    Uploaded pdfs-->

    <div v-if="activeTab === 'files'">
      <!-- Card Blog -->
      <div class="max-w-[70rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
        <!-- Grid -->
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Card -->
          <FileItem v-for="(file, index) in files" :key="index" :file="file" />
        </div>
      </div>
      <div class="absolute right-0 bottom-2 pe-3">
        <button class="btn btn-primary" type="button">View More</button>
      </div>
      <!-- End Card Blog -->
    </div>
    <teleport to="body">
      <DialogModal
        :is-open="homeStore.productDialog.isOpen"
        @closeModal="homeStore.closeProductDialog"
      >
        <template #title>
          <h1 class="text-lg font-semibold">Add Products</h1>
        </template>
        <template #body>
          <div class="flex flex-col space-y-2 pb-3">
            <input
              id="app-product"
              v-model="productName.productOne"
              :class="{
                'input-error': productOneMeta.validated && !productOneMeta.valid,
                'input-primary': productOneMeta.validated && productOneMeta.valid
              }"
              class="input input-bordered input-primary w-full text-sm"
              placeholder="Insuarance..."
              type="text"
            />
            <small v-if="productOneMeta.validated && !productOneMeta.valid" class="text-rose-500">{{
              productOneErrorMessage
            }}</small>
          </div>

          <div class="flex flex-col space-y-2 pb-3">
            <input
              id="app-product"
              v-model="productName.productTwo"
              :class="{
                'input-error': productTwoMeta.validated && !productTwoMeta.valid,
                'input-primary': productTwoMeta.validated && productTwoMeta.valid
              }"
              class="input input-bordered input-primary w-full text-sm"
              type="text"
            />
            <small v-if="productTwoMeta.validated && !productTwoMeta.valid" class="text-rose-500">{{
              productTwoErrorMessage
            }}</small>
          </div>
          <div class="flex flex-col space-y-2">
            <input
              id="app-product"
              v-model="productName.productThree"
              :class="{
                'input-error': productThreeMeta.validated && !productThreeMeta.valid,
                'input-primary': productThreeMeta.validated && productThreeMeta.valid
              }"
              class="input input-bordered input-primary w-full text-sm"
              type="text"
            />
            <small
              v-if="productThreeMeta.validated && !productThreeMeta.valid"
              class="text-rose-500"
              >{{ productThreeErrorMessage }}</small
            >
          </div>
        </template>
        <template #footer>
          <div>
            <button
              :disabled="!homeStore.addProductBtnEnabled"
              class="grow btn btn-sm md:btn-md btn-primary bg-blue-500 normal-case text-white"
              @click="postProduct"
            >
              Add Product
            </button>
          </div>
        </template>
      </DialogModal>

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
          <div class="grid grid-cols-2 gap-1">
            <button v-if="!isAddInputField" class="btn btn-primary px-3" @click="moreUrls">
              More Url
            </button>
            <button class="btn btn-primary" @click="postUrl">Add Url</button>
          </div>
        </template>
      </DialogModal>
    </teleport>
  </div>
</template>
