<script lang="ts" setup>
import { reactive, ref, watch } from 'vue'
import { useAdminHomeStore } from '@/stores/admin/home'
import DialogModal from '@/components/DialogModal.vue'
import { useField } from 'vee-validate'
import { usePageContentStore } from '@/stores/admin/page-data'
import FileItem from '@/views/Admin/FileItem.vue'
import UrlLink from '@/views/Admin/toasts/UrlLink.vue'

interface PageDetails {
  pageId: string
}

interface TabStyle {
  name: string
  value: string
}

const homeStore = useAdminHomeStore()
const activeTab = ref<string>('Options')

const props = defineProps<PageDetails>()
const pageContentStore = usePageContentStore()
const files = ref<any>()

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

const toggleDynamicSettings = (tab:string)=>{
  console.log(typeof(tab))
  console.log(tab)
  // fetching.value = true

  activeTab.value = tab
  if (tab === 'files') {
    pageContentStore.getUploadedPdf(props.pageId).then((resp) => {
      console.log(resp)
      files.value = resp
      // console.log(files.value.documentUrl)

      setTimeout(() => {}, 500)
    })
  }
}

const addProduct = () => {
  homeStore.openProductDialog()
}

const productValidator = (value: string)=>{
 if(!value){
   return 'Product name is required'
 }
 if(value.length < 3) {
   return 'Product name must be at least 3 characters'
 }
 const productRegEx = /^[a-zA-Z0-9_ ]*$/
  if(!productRegEx.test(value)) {
    return 'Product name must be alphanumeric'
  }
  return true
}

const {
  value: productOne,
    meta: productOneMeta,
    errorMessage: productOneErrorMessage
} = useField('productOne', productValidator)

watch(()=>productName.productOne, (value)=>{
  console.log(value);
  productOne.value = value;
})




const{
  value: productTwo,
    meta: productTwoMeta,
    errorMessage: productTwoErrorMessage
} = useField('productTwo', productValidator)

watch(()=>productName.productTwo, (value)=>{
  productTwo.value= value;
})


const{
  value: productThree,
    meta: productThreeMeta,
    errorMessage: productThreeErrorMessage
} = useField('productThree', productValidator)

watch(()=>productName.productThree, (value)=>{
  productThree.value = value;
}
)


const postProduct = ()=>{
  const pageId = props.pageId
  productName.pageId = pageId
  console.log(pageId)
  if(productOneMeta.valid && productTwoMeta.valid && productThreeMeta.valid){

    homeStore.addProduct(productName)
        .then(prd=>{
          if(prd){
            console.log('Product added successfully')
          }
          else{
            console.log('Product not added')
          }
        })
        .catch((err)=>{
          console.log(err)
        })
        .finally(()=>{
          homeStore.closeProductDialog()
        })
  }

}















</script>

<template>
  <div class="m-3">
    <nav class="relative w-full z-0  flex border rounded-xl overflow-hidden dark:border-neutral-700" aria-label="Tabs" role="tablist">
      <div class="w-full bg-gray-200" v-for="(tab, index) in moreDynamicTabs" :key="index">
        <button :class="{'text-blue-500': activeTab === tab.name}"  @click='toggleDynamicSettings (tab.value)' type="button" class="bg-gray-200 rounded-md m-1 min-w-0 flex-1 focus:bg-white border-s py-2 px-3 text-gray-500 hover:text-gray-700  hover:text-lg text-sm font-medium text-center overflow-hidden hover:bg-gray-50 focus:z-10 focus:outline-none focus:text-blue-600 focus:shadow-md focus:text-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-l-neutral-700 dark:border-b-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-400 active" id="bar-with-underline-item-1" data-hs-tab="#bar-with-underline-1" aria-controls="bar-with-underline-1" role="tab">
          {{tab.name}}
        </button>
      </div>
    </nav>
    <div v-if="activeTab === 'options'">
      <h1>Options Section</h1>

    </div>
    <div v-if="activeTab === 'content'">
      <h1>Content Section</h1>

    </div>
    <div v-if="activeTab === 'data'">
      <h1>Data Section</h1>

    </div>
    <transition
        name="fade"
        fade-enter-from="opacity-0"
        fade-enter-to="opacity-1"
        fade-enter="transition 4s ease-out"
        fade-leave-from="opacity 1"
        fade-leave-to="opacity-0"
        fade-leave="transition 2s ease-in"

    >
      <div v-if="activeTab === 'products'">
        <div class="absolute right-0 pe-6">
          <button @click="addProduct" class="btn btn-sm btn-ghost rounded-full md:rounded-md font-medium ">
            <i class="material-icons text-neutral-400 !text-2xl">add_box</i>
            <span class="hidden md:inline-block"> New Product </span>
          </button>
        </div>
              <!-- Card Blog -->
        <div class="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">

          <!-- Grid -->
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Card -->
            <div class="group flex flex-col h-full bg-white border border-gray-200 shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70">
              <div class="h-52 flex flex-col justify-center items-center bg-blue-600 rounded-t-xl">
                <svg class="size-28" width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="56" height="56" rx="10" fill="white"/>
                  <path d="M20.2819 26.7478C20.1304 26.5495 19.9068 26.4194 19.6599 26.386C19.4131 26.3527 19.1631 26.4188 18.9647 26.5698C18.848 26.6622 18.7538 26.78 18.6894 26.9144L10.6019 43.1439C10.4874 43.3739 10.4686 43.6401 10.5496 43.884C10.6307 44.1279 10.805 44.3295 11.0342 44.4446C11.1681 44.5126 11.3163 44.5478 11.4664 44.5473H22.7343C22.9148 44.5519 23.0927 44.5037 23.2462 44.4084C23.3998 44.3132 23.5223 44.1751 23.5988 44.011C26.0307 38.9724 24.5566 31.3118 20.2819 26.7478Z" fill="url(#paint0_linear_2204_541)"/>
                  <path d="M28.2171 11.9791C26.201 15.0912 25.026 18.6755 24.8074 22.3805C24.5889 26.0854 25.3342 29.7837 26.9704 33.1126L32.403 44.0113C32.4833 44.1724 32.6067 44.3079 32.7593 44.4026C32.912 44.4973 33.088 44.5475 33.2675 44.5476H44.5331C44.6602 44.5479 44.7861 44.523 44.9035 44.4743C45.0209 44.4257 45.1276 44.3543 45.2175 44.2642C45.3073 44.1741 45.3785 44.067 45.427 43.9492C45.4755 43.8314 45.5003 43.7052 45.5 43.5777C45.5001 43.4274 45.4659 43.2791 45.3999 43.1441L29.8619 11.9746C29.7881 11.8184 29.6717 11.6864 29.5261 11.594C29.3805 11.5016 29.2118 11.4525 29.0395 11.4525C28.8672 11.4525 28.6984 11.5016 28.5529 11.594C28.4073 11.6864 28.2908 11.8184 28.2171 11.9746V11.9791Z" fill="#2684FF"/>
                  <defs>
                    <linearGradient id="paint0_linear_2204_541" x1="24.734" y1="29.2284" x2="16.1543" y2="44.0429" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stop-color="#0052CC"/>
                      <stop offset="0.92" stop-color="#2684FF"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div class="p-4 md:p-6">
              <span class="block mb-1 text-xs font-semibold uppercase text-blue-600 dark:text-blue-500">
              Atlassian API
              </span>
                <h3 class="text-xl font-semibold text-gray-800 dark:text-neutral-300 dark:hover:text-white">
                  Atlassian
                </h3>
                <p class="mt-3 text-gray-500 dark:text-neutral-500">
                  A software that develops products for software developers and developments.
                </p>
              </div>
              <div class="mt-auto flex border-t border-gray-200 divide-x divide-gray-200 dark:border-neutral-700 dark:divide-neutral-700">
                <a class="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-es-xl bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800" href="#">
                  View sample
                </a>
                <a class="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-ee-xl bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800" href="#">
                  View API
                </a>
              </div>
            </div>
            <!-- End Card -->

            <!-- Card -->
            <div class="group flex flex-col h-full bg-white border border-gray-200 shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70">
              <div class="h-52 flex flex-col justify-center items-center bg-rose-500 rounded-t-xl">
                <svg class="size-28" width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="56" height="56" rx="10" fill="white"/>
                  <g clip-path="url(#clip0_2204_541)">
                    <path d="M37.0409 28.8697C33.1968 28.8697 30.0811 31.9854 30.0811 35.8288C30.0811 39.6726 33.1968 42.789 37.0409 42.789C40.8843 42.789 44 39.6726 44 35.8288C44 31.9854 40.8843 28.8697 37.0409 28.8697ZM18.9594 28.8701C15.116 28.8704 12 31.9854 12 35.8292C12 39.6726 15.116 42.7886 18.9594 42.7886C22.8032 42.7886 25.9192 39.6726 25.9192 35.8292C25.9192 31.9854 22.8032 28.8701 18.9591 28.8701H18.9594ZM34.9595 20.1704C34.9595 24.0138 31.8438 27.1305 28.0004 27.1305C24.1563 27.1305 21.0406 24.0138 21.0406 20.1704C21.0406 16.3269 24.1563 13.2109 28.0003 13.2109C31.8438 13.2109 34.9591 16.3269 34.9591 20.1704H34.9595Z" fill="url(#paint0_radial_2204_541)"/>
                  </g>
                  <defs>
                    <radialGradient id="paint0_radial_2204_541" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(28.0043 29.3944) scale(21.216 19.6102)">
                      <stop offset="0%" stop-color="#FFB900"/>
                      <stop offset="0.6" stop-color="#F95D8F"/>
                      <stop offset="0.999" stop-color="#F95353"/>
                    </radialGradient>
                    <clipPath id="clip0_2204_541">
                      <rect width="32" height="29.5808" fill="white" transform="translate(12 13.2096)"/>
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <div class="p-4 md:p-6">
        <span class="block mb-1 text-xs font-semibold uppercase text-rose-600 dark:text-rose-500">
          Asana API
        </span>
                <h3 class="text-xl font-semibold text-gray-800 dark:text-neutral-300 dark:hover:text-white">
                  Asana
                </h3>
                <p class="mt-3 text-gray-500 dark:text-neutral-500">
                  Track tasks and projects, use agile boards, measure progress.
                </p>
              </div>
              <div class="mt-auto flex border-t border-gray-200 divide-x divide-gray-200 dark:border-neutral-700 dark:divide-neutral-700">
                <a class="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-es-xl bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800" href="#">
                  View sample
                </a>
                <a class="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-ee-xl bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800" href="#">
                  View API
                </a>
              </div>
            </div>
            <!-- End Card -->

            <!-- Card -->
            <div class="group flex flex-col h-full bg-white border border-gray-200 shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70">
              <div class="h-52 flex flex-col justify-center items-center bg-amber-500 rounded-t-xl">
                <svg class="size-28" width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="56" height="56" rx="10" fill="white"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M23.7326 11.968C21.9637 11.9693 20.5321 13.4049 20.5334 15.1738C20.5321 16.9427 21.965 18.3782 23.7339 18.3795H26.9345V15.1751C26.9358 13.4062 25.5029 11.9706 23.7326 11.968C23.7339 11.968 23.7339 11.968 23.7326 11.968M23.7326 20.5184H15.2005C13.4316 20.5197 11.9987 21.9553 12 23.7242C11.9974 25.4931 13.4303 26.9286 15.1992 26.9312H23.7326C25.5016 26.9299 26.9345 25.4944 26.9332 23.7255C26.9345 21.9553 25.5016 20.5197 23.7326 20.5184V20.5184Z" fill="#36C5F0"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M44.0001 23.7242C44.0014 21.9553 42.5684 20.5197 40.7995 20.5184C39.0306 20.5197 37.5977 21.9553 37.599 23.7242V26.9312H40.7995C42.5684 26.9299 44.0014 25.4944 44.0001 23.7242ZM35.4666 23.7242V15.1738C35.4679 13.4062 34.0363 11.9706 32.2674 11.968C30.4985 11.9693 29.0656 13.4049 29.0669 15.1738V23.7242C29.0643 25.4931 30.4972 26.9286 32.2661 26.9312C34.035 26.9299 35.4679 25.4944 35.4666 23.7242Z" fill="#2EB67D"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M32.2661 44.0322C34.035 44.0309 35.4679 42.5953 35.4666 40.8264C35.4679 39.0575 34.035 37.622 32.2661 37.6207H29.0656V40.8264C29.0642 42.594 30.4972 44.0295 32.2661 44.0322ZM32.2661 35.4804H40.7995C42.5684 35.4791 44.0013 34.0436 44 32.2747C44.0026 30.5058 42.5697 29.0702 40.8008 29.0676H32.2674C30.4985 29.0689 29.0656 30.5045 29.0669 32.2734C29.0656 34.0436 30.4972 35.4791 32.2661 35.4804V35.4804Z" fill="#ECB22E"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M12 32.2746C11.9987 34.0435 13.4316 35.479 15.2005 35.4804C16.9694 35.479 18.4024 34.0435 18.401 32.2746V29.0688H15.2005C13.4316 29.0702 11.9987 30.5057 12 32.2746ZM20.5334 32.2746V40.825C20.5308 42.5939 21.9637 44.0295 23.7326 44.0321C25.5016 44.0308 26.9345 42.5952 26.9332 40.8263V32.2772C26.9358 30.5083 25.5029 29.0728 23.7339 29.0702C21.9637 29.0702 20.5321 30.5057 20.5334 32.2746C20.5334 32.2759 20.5334 32.2746 20.5334 32.2746Z" fill="#E01E5A"/>
                </svg>
              </div>
              <div class="p-4 md:p-6">
        <span class="block mb-1 text-xs font-semibold uppercase text-amber-500">
          Slack API
        </span>
                <h3 class="text-xl font-semibold text-gray-800 dark:text-neutral-300 dark:hover:text-white">
                  Slack
                </h3>
                <p class="mt-3 text-gray-500 dark:text-neutral-500">
                  Email collaboration and email service desk made easy.
                </p>
              </div>
              <div class="mt-auto flex border-t border-gray-200 divide-x divide-gray-200 dark:border-neutral-700 dark:divide-neutral-700">
                <a class="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-es-xl bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800" href="#">
                  View sample
                </a>
                <a class="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-ee-xl bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800" href="#">
                  View API
                </a>
              </div>

            </div>
            <button type="button" class="btn btn-primary bottom-0">
              View More
            </button>
            <!-- End Card -->
          </div>
        </div>      <!-- End Card Blog -->
      </div>

    </transition>

<!--    Uploaded pdfs-->

    <div v-if="activeTab === 'files'">
      <!-- Card Blog -->
      <div class="max-w-[70rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
        <!-- Grid -->
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Card -->
          <div class="group flex flex-col bg-white border border-gray-200 shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70" v-for="(file, index) in files" :key="index">
            <div class="h-40 flex flex-col justify-center items-center bg-blue-600 rounded-t-xl">
              <div class="bg-white h-20 w-20 rounded-lg flex justify-center items-center">
                <span class="material-icons-round !text-6xl ">picture_as_pdf</span>

              </div>


            </div>
            <div class="h-35 p-4 md:p-6" >
             <h3 class="text-xl font-semibold text-gray-800 dark:text-neutral-300 dark:hover:text-white">
                {{file.documentName}}
              </h3>
              <p class="mt-3 text-gray-500 dark:text-neutral-500">
                {{file.documentUrl}}
              </p>
              <p>
                {{file.createdAt}}
              </p>
            </div>
            <div class="mt-auto flex border-t border-gray-200 divide-x divide-gray-200 dark:border-neutral-700 dark:divide-neutral-700">
              <button class="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-es-xl bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800" href="#">
                <span class="material-icons-round h-6 w-8">delete</span>
              </button>
              <button class="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-ee-xl bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800" href="#">
               <span class="material-icons-round">file_download</span>
              </button>
            </div>
          </div>
          <!-- End Card -->

          <!-- Card -->


          <!-- Card -->


          <!-- End Card -->
        </div>
      </div>
      <div class="absolute right-0 bottom-2 pe-3">
        <button type="button" class="btn btn-primary ">
          View More
        </button>

      </div>
      <!-- End Card Blog -->
    </div>
    <teleport to="body">
      <DialogModal
          :is-open="homeStore.productDialog.isOpen"
          @closeModal = "homeStore.closeProductDialog"
      >
        <template #title>
          <h1 class="text-lg font-semibold">Add Products</h1>

        </template>
        <template #body>
          <div class="flex flex-col space-y-2 pb-3">
            <input
                :class="{
                  'input-error': productOneMeta.validated && !productOneMeta.valid,
                   'input-primary': productOneMeta.validated && productOneMeta.valid
                }"

                id="app-product"
                class="input input-bordered input-primary w-full text-sm"
                placeholder="Insuarance..."
                type="text"
                v-model="productName.productOne"

            />
            <small v-if="productOneMeta.validated && !productOneMeta.valid" class="text-rose-500">{{productOneErrorMessage}}</small>
          </div>

          <div class="flex flex-col space-y-2 pb-3">
            <input
                :class="{
                  'input-error': productTwoMeta.validated && !productTwoMeta.valid,
                   'input-primary': productTwoMeta.validated && productTwoMeta.valid
                }"
                id="app-product"
                class="input input-bordered input-primary w-full text-sm"
                type="text"
                v-model="productName.productTwo"
            />
            <small class="text-rose-500" v-if="productTwoMeta.validated && !productTwoMeta.valid">{{productTwoErrorMessage}}</small>

          </div>
          <div class="flex flex-col space-y-2">
            <input
                :class="{
                  'input-error': productThreeMeta.validated && !productThreeMeta.valid,
                   'input-primary': productThreeMeta.validated && productThreeMeta.valid
                }"

                id="app-product"
                class="input input-bordered input-primary w-full text-sm"
                type="text"
                v-model="productName.productThree"
            />
            <small class="text-rose-500" v-if="productThreeMeta.validated && !productThreeMeta.valid">{{productThreeErrorMessage}}</small>

          </div>
<!--          <div class="flex flex-col space-y-2">-->
<!--            <input-->

<!--                id="app-product"-->
<!--                class="input input-bordered input-primary w-full text-sm"-->
<!--                placeholder="Insuarance..."-->
<!--                type="text"-->
<!--                v-model="product4"-->

<!--            />-->
<!--            <small v-if="productMeta.valid && !productMeta.validated" class="text-rose-500">{{productErrorMessage}}</small>-->
<!--          </div>-->
<!--          <div class="flex flex-col space-y-2">-->
<!--            <input-->

<!--                id="app-product"-->
<!--                class="input input-bordered input-primary w-full text-sm"-->
<!--                placeholder="Insuarance..."-->
<!--                type="text"-->
<!--                v-model="product5"-->

<!--            />-->
<!--            <small v-if="productMeta.valid && !productMeta.validated" class="text-rose-500">{{productErrorMessage}}</small>-->
<!--          </div>-->
<!--&lt;!&ndash;          dynamic form&ndash;&gt;-->
<!--          <div class="flex flex-col space-y-2">-->
<!--            <input-->

<!--                id="app-product"-->
<!--                class="input input-bordered input-primary w-full text-sm"-->
<!--                placeholder="Insuarance..."-->
<!--                type="text"-->
<!--                v-model="product"-->

<!--            />-->
<!--            <small v-if="productMeta.valid && !productMeta.validated" class="text-rose-500">{{productErrorMessage}}</small>-->
<!--          </div>-->
        </template>
        <template #footer>

          <div>
<!--            <button-->
<!--                class="grow btn btn-sm md:btn-md btn-ghost normal-case border border-1 border-gray-400"-->
<!--                @click="addField"-->

<!--            >-->
<!--              More-->
<!--            </button>-->
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

    </teleport>

  </div>


</template>