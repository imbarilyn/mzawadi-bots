<script lang="ts" setup>
import { useAdminHomeStore } from '@/stores/admin/home'
import { useField } from 'vee-validate'
import { useTabsStore } from '@/stores/admin/tabs'
import { useRouter } from 'vue-router'
import { onBeforeMount, type Ref, ref } from 'vue'
import { usePageContentStore } from '@/stores/admin/page-data'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'
import { useNotificationsStore } from '@/stores/notifications'

const homeStore = useAdminHomeStore()
const notificationsStore = useNotificationsStore()
const pageContentStore = usePageContentStore()
const allPageNames: Ref<string[]> = ref([])
// every word in the reservedWords array will not be allowed as a page name
// they should also be lowercased
const reservedWords = ref(['home', 'settings', 'admin'])
const tabStore = useTabsStore()
const router = useRouter()
const selected = ref()
const chatbotType = [
  {
    name: 'Sacco'
  },
  {
    name: 'Inhouse'
  }
]
const appIsFetching = ref(true)

// interface AddOnList {
//   label: string
//   required: boolean
//   disabled: boolean
//   id: string
// }

// const saccoAddOns: AddOnList[] = [
//   {
//     label: 'Password',
//     required: true,
//     disabled: true,
//     id: '4'
//   },
//   {
//     label: 'Confirm password',
//     required: true,
//     disabled: true,
//     id: '5'
//   },
//   {
//     label: 'County',
//     required: true,
//     disabled: true,
//     id: '3'
//   },
//   {
//     label: 'Username',
//     required: false,
//     disabled: false,
//     id: '1'
//   },
//   {
//     label: 'Email address',
//     required: false,
//     disabled: false,
//     id: '2'
//   },
//
//   {
//     label: 'Phone number',
//     required: false,
//     disabled: false,
//     id: '7'
//   },
//   {
//     label: 'Member No.',
//     required: false,
//     disabled: false,
//     id: '7'
//   }
// ]

// const handleCheckboxChange = (id: string, value: boolean) => {
//   const index = saccoAddOns.findIndex((addOn) => addOn.id === id)
//   saccoAddOns[index].required = value
// }
// const selectedType = JSON.parse(selected.value)
const pageNameValidator = (value: string) => {
  console.log(allPageNames.value)

  if (!value) {
    return 'Chatbot name is required'
  }

  if (value.length < 3) {
    return 'Chatbot name must be at least 3 characters long'
  }

  if (value.length > 50) {
    return 'Chatbot name must not exceed 50 characters'
  }

  const pageNameRegex = /^[a-zA-Z0-9_ ]+$/

  if (pageNameRegex.test(value)) {
    // console.log(value)
  } else {
    return 'Chatbot name must only contain alphanumeric characters'
  }

  if (allPageNames.value.includes(value.toLowerCase())) {
    return 'Chatbot name already exists'
  }
  // if (value.toLowerCase() === 'home' || value.toLowerCase() === 'settings') {
  //   return 'Chatbot name is reserved'
  // }

  if (reservedWords.value.includes(value.toLowerCase())) {
    return 'Chatbot name is reserved'
  }

  return true
}

const {
  value: pageName,
  meta: pageNameMeta,
  errorMessage: pageNameErrorMessage
} = useField('pageName', pageNameValidator)

const createPage = () => {
  // const userInfo: any = []

  // saccoAddOns.map((usrInfo) => {
  //   userInfo.push({ field: usrInfo.label, required: usrInfo.required })
  // })
  // console.log(userInfo)
  // console.log(selected.value)
  if (pageNameMeta.valid) {
    // console.log(userInfo)
    console.log(selected.value)
    console.log('creating page ', pageName.value)
    homeStore
      .createNewPage(pageName.value, selected.value.name)
      .then((page: any) => {
        console.log(page)
        //set active tab as the newly created page
        tabStore.setActiveTabByPageName(pageName.value)
        // pageContentStore.setActivePageContentItem(page.name)

        //close dialogue page
        // homeStore.closeCreateDialog()

        //reset
        pageName.value = ''
        pageNameMeta.valid = false
        pageNameMeta.validated = false
        pageNameMeta.touched = false
        selected.value = ''

        console.log('created page ', page.pageSlug)
        console.log('created page ', page.pageId)
        router.push({
          name: 'DynamicPage',
          params: { pageId: page.pageId }
        })
      })
      .catch((error) => {
        console.log(error)
        notificationsStore.addNotification('An error has occurred while creating page', 'error')
      })
  } else {
    // pageNameMeta.touched = true
    // pageNameMeta.validated = true
    notificationsStore.addNotification('Please fill in all required fields', 'error')
  }
}

onBeforeMount(() => {
  homeStore.fetchPages().then(() => {
    setTimeout(() => {
      appIsFetching.value = false

      console.log('available pages ', homeStore.getPages)

      allPageNames.value = homeStore.getPages.map((page) => page.name.toLowerCase())
    }, 500)
  })
})
</script>

<template>
  <div class="flex items-center justify-center h-full">
    <div class="grid grid-cols-1 gap-3 py-3 px-5">
      <div class="flex flex-col space-y-2">
        <label class="label text-xs font-semibold" for="page-name"> Page Name </label>
        <input
          id="page-name"
          v-model="pageName"
          :class="{
            'input-error': pageNameMeta.validated && !pageNameMeta.valid,
            'input-primary': pageNameMeta.validated && pageNameMeta.valid
          }"
          class="input input-primary input-bordered w-full text-sm"
          placeholder="Page Name"
          type="text"
        />
        <small v-if="pageNameMeta.validated && !pageNameMeta.valid" class="text-xs text-rose-500">
          {{ pageNameErrorMessage }}
        </small>
        <small class="text-xs text-gray-500"
          >This will be used as the bot's name across the application. More configurations will be
          shown after creating the bot.
        </small>
      </div>

      <Listbox v-model="selected">
        <p class="text-xs font-semibold">Chat Bot Type</p>
        <div class="relative mt-1">
          <ListboxButton class="relative w-full input input-bordered input-primary text-start">
            <span class="block truncate text-gray-500 text-sm">
              <span v-if="selected">{{ selected.name }} </span>
              <span v-else>Select Bot Type</span>
            </span>
            <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon aria-hidden="true" class="h-5 w-5 text-gray-400" />
            </span>
          </ListboxButton>

          <transition
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <ListboxOptions
              class="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
            >
              <ListboxOption
                v-for="chatbotype in chatbotType"
                :key="chatbotype.name"
                v-slot="{ active, selected }"
                :value="chatbotype"
                as="template"
              >
                <li
                  :class="[
                    active ? 'bg-sky-100 text-primary' : 'text-gray-900',
                    'relative cursor-default select-none py-2 pl-10 pr-4 h-10 flex items-center'
                  ]"
                >
                  <span
                    :class="[selected ? 'font-medium' : 'font-normal', 'block truncate text-sm']"
                    >{{ chatbotype.name }}</span
                  >
                  <span
                    v-if="selected"
                    class="absolute inset-y-0 left-0 flex items-center pl-3 text-primary"
                  >
                    <CheckIcon aria-hidden="true" class="h-5 w-5" />
                  </span>
                </li>
              </ListboxOption>
            </ListboxOptions>
          </transition>
        </div>
      </Listbox>
      <!--      <div v-if="selected.name === 'Sacco'">-->
      <!--        <div v-for="(saccoAddOn, index) in saccoAddOns" :key="index">-->
      <!--          <SaccoCheckbox-->
      <!--            @on-checkbox-change="handleCheckboxChange"-->
      <!--            :id="saccoAddOn.id"-->
      <!--            :label="saccoAddOn.label"-->
      <!--            :disabled="saccoAddOn.disabled"-->
      <!--            :value="saccoAddOn.required"-->
      <!--          />-->
      <!--        </div>-->
      <!--      </div>-->
      <div class="flex justify-between w-full py-2">
        <div>
          <button
            :disabled="!homeStore.enabledCreateDialogBtn"
            class="grow btn btn-sm md:btn-md btn-primary normal-case"
            @click="createPage"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
