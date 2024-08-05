<script lang="ts" setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import anime from 'animejs'
import MyListBox from '../../components/form/MyListBox.vue'
import { type PageContent, usePageContentStore } from '@/stores/admin/page-data'
import { useField } from 'vee-validate'
import { type dataContext, useAdminHomeStore } from '@/stores/admin/home'
import { useNotificationsStore } from '@/stores/notifications'
import { useRouter } from 'vue-router'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'

const chatbotContext = [{ name: 'Openai & Documents' }, { name: 'Documents' }]
const selectedContext = ref(chatbotContext[0])
const isContextSelected = ref<boolean>(false)
const pageContentStore = usePageContentStore()
const adminHomeStore = useAdminHomeStore()
const homeStore = useAdminHomeStore()
const notification = useNotificationsStore()
const chatbotContextPayload = ref<dataContext[]>([])
const contextIsLoading = ref<boolean>(false)

watch(
  () => selectedContext.value,
  (value) => {
    isContextSelected.value = true
    console.log(selectedContext.value.name, props.currentPage.name)
  }
)

const addContext = () => {
  contextIsLoading.value = true

  if (selectedContext.value.name === 'openai & Documents') {
    chatbotContextPayload.value.push({
      pageSlug: props.currentPage.name,
      dataLimit: false
    })
  } else {
    chatbotContextPayload.value.push({
      pageSlug: props.currentPage.name,
      dataLimit: true
    })
  }
  chatbotContextPayload.value.map((value) => {
    adminHomeStore
      .dataLimit(value)
      .then((resp) => {
        if (resp.result === 'ok') {
          notification.addNotification('chatbot context added suuccesfully', 'success')
        } else {
          notification.addNotification('Failed to add chatbot context', 'error')
        }
      })
      .catch((err: Error) => {
        console.log('error:', err)
        notification.addNotification('Failed to add chatbot context, please try again', 'error')
      })
      .finally(() => {
        setTimeout(() => {
          contextIsLoading.value = false
        }, 1000)
      })
  })
}

// interface PageContent {
//   pageId: string
//   chatbotName: string
//   greetingType: 'static' | 'generated'
//   staticGreeting: string
//   generatedGreeting: string
//   promptPlaceholder: string
//   directive: string
//   model: string
//   maxResponseLength: number
//   creativity: number
//   displayClosureMessage: boolean
//   closureMessage: string
//   scope: string
//   context: string
//   micAccess?: boolean
//   imageUploadAccess?: boolean
//   iconName?: string
// }

interface Page {
  id: string
  name: string
  path: string
  title: string
}

interface SidebarDataProps {
  pageContent: PageContent
  currentPage: Page
  isOpen: boolean
  fileUploadBtnEnabled: boolean
  imgUploadBtnEnabled: boolean
}

interface Option {
  name: string
  value: string | boolean | number
}

const props = defineProps<SidebarDataProps>()

const activePageContentItem = ref<PageContent>(props.pageContent)

const greetingTypes = [
  {
    name: 'Generated',
    value: 'generated'
  },
  {
    name: 'Static',
    value: 'static'
  }
] as Option[]

const closureMsgOptions = [
  {
    name: 'Yes',
    value: true
  },
  {
    name: 'No',
    value: false
  }
] as Option[]

const thisPage = reactive<Page>({
  id: props.currentPage.id,
  name: props.currentPage.name,
  path: props.currentPage.path,
  title: props.currentPage.title
})

const pageOrgClone = reactive<Page>({
  id: props.currentPage.id,
  name: props.currentPage.name,
  path: props.currentPage.path,
  title: props.currentPage.title
})

const savePageBtnIsActive = ref(false)

// watch for changes in the page data item and activate save button
watch(
  () => thisPage,
  (newVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(pageOrgClone)) {
      // activate save button
      savePageBtnIsActive.value = true
      // not only that but also check if the rest of the fields are valid
      // savePageBtnIsActive.value = pageOptionsAreValid.value;

      emit('sidebar-data-changed', true)
    } else {
      // deactivate save button
      savePageBtnIsActive.value = false

      emit('sidebar-data-changed', false)
    }
  },
  { deep: true }
)

const thisPageContentItem = reactive<PageContent>(<PageContent>{
  pageId: activePageContentItem.value.pageId,
  chatbotName: activePageContentItem.value.chatbotName,
  greetingType: activePageContentItem.value.greetingType,
  staticGreeting: activePageContentItem.value.staticGreeting,
  generatedGreeting: activePageContentItem.value.generatedGreeting,
  promptPlaceholder: activePageContentItem.value.promptPlaceholder,
  directive: activePageContentItem.value.directive,
  model: activePageContentItem.value.model,
  maxResponseLength: activePageContentItem.value.maxResponseLength,
  creativity: activePageContentItem.value.creativity,
  displayClosureMessage: activePageContentItem.value.displayClosureMessage,
  closureMessage: activePageContentItem.value.closureMessage,
  scope: activePageContentItem.value.scope,
  context: activePageContentItem.value.context,
  micAccess: activePageContentItem.value.micAccess,
  imageUploadAccess: activePageContentItem.value.imageUploadAccess
})

const pageContentItemOrgClone = reactive<PageContent>(<PageContent>{
  pageId: activePageContentItem.value.pageId,
  chatbotName: activePageContentItem.value.chatbotName,
  greetingType: activePageContentItem.value.greetingType,
  staticGreeting: activePageContentItem.value.staticGreeting,
  generatedGreeting: activePageContentItem.value.generatedGreeting,
  promptPlaceholder: activePageContentItem.value.promptPlaceholder,
  directive: activePageContentItem.value.directive,
  model: activePageContentItem.value.model,
  maxResponseLength: activePageContentItem.value.maxResponseLength,
  creativity: activePageContentItem.value.creativity,
  displayClosureMessage: activePageContentItem.value.displayClosureMessage,
  closureMessage: activePageContentItem.value.closureMessage,
  scope: activePageContentItem.value.scope,
  context: activePageContentItem.value.context,
  micAccess: activePageContentItem.value.micAccess,
  imageUploadAccess: activePageContentItem.value.imageUploadAccess
})

const savePageContentBtnIsActive = ref(false)

// watch for changes in the page data item and activate save button
watch(
  () => thisPageContentItem,
  (newVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(pageContentItemOrgClone)) {
      // activate save button
      savePageContentBtnIsActive.value = true
      // not only that but also check if the rest of the fields are valid
      // savePageContentBtnIsActive.value = pageContentsAreValid.value;

      emit('sidebar-data-changed', true)
    } else {
      // deactivate save button
      savePageContentBtnIsActive.value = false

      emit('sidebar-data-changed', false)
    }
  },
  { deep: true }
)

onMounted(() => {
  thisPageContentItem.pageId = activePageContentItem.value.pageId
  thisPageContentItem.chatbotName = activePageContentItem.value.chatbotName
  thisPageContentItem.greetingType = activePageContentItem.value.greetingType
  thisPageContentItem.staticGreeting = activePageContentItem.value.staticGreeting
  thisPageContentItem.generatedGreeting = activePageContentItem.value.generatedGreeting
  thisPageContentItem.promptPlaceholder = activePageContentItem.value.promptPlaceholder
  thisPageContentItem.directive = activePageContentItem.value.directive
  thisPageContentItem.model = activePageContentItem.value.model
  thisPageContentItem.maxResponseLength = activePageContentItem.value.maxResponseLength
  thisPageContentItem.creativity = activePageContentItem.value.creativity
  thisPageContentItem.displayClosureMessage = activePageContentItem.value.displayClosureMessage
  thisPageContentItem.closureMessage = activePageContentItem.value.closureMessage
  thisPageContentItem.scope = activePageContentItem.value.scope
  thisPageContentItem.context = activePageContentItem.value.context
  thisPageContentItem.micAccess = activePageContentItem.value.micAccess
  thisPageContentItem.imageUploadAccess = activePageContentItem.value.imageUploadAccess

  if (activePageContentItem.value.greetingType === 'static') {
    newGreetingTextAreaText.value = activePageContentItem.value.staticGreeting
  } else {
    const newName =
      activePageContentItem.value.chatbotName[0].toUpperCase() +
      activePageContentItem.value.chatbotName.slice(1)
    newGreetingTextAreaText.value = `Say I am ${newName}, how can I help you today?`
  }

  const foundType = greetingTypes.find(
    (item) => item.value === activePageContentItem.value.greetingType
  )

  if (foundType) {
    newGreetingType.value = foundType
  }
})

const newGreetingTextAreaText = ref('')
const newGreetingType = ref<Option | null>(greetingTypes[0])

// let's also subscribe to page data store changes
watch(
  () => pageContentStore.activePageContentItem,
  (newVal) => {
    if (!newVal) return

    activePageContentItem.value = newVal

    thisPageContentItem.pageId = activePageContentItem.value.pageId
    thisPageContentItem.chatbotName = activePageContentItem.value.chatbotName
    thisPageContentItem.greetingType = activePageContentItem.value.greetingType
    thisPageContentItem.staticGreeting = activePageContentItem.value.staticGreeting
    thisPageContentItem.generatedGreeting = activePageContentItem.value.generatedGreeting
    thisPageContentItem.promptPlaceholder = activePageContentItem.value.promptPlaceholder
    thisPageContentItem.directive = activePageContentItem.value.directive
    thisPageContentItem.model = activePageContentItem.value.model
    thisPageContentItem.maxResponseLength = activePageContentItem.value.maxResponseLength
    thisPageContentItem.creativity = activePageContentItem.value.creativity
    thisPageContentItem.displayClosureMessage = activePageContentItem.value.displayClosureMessage
    thisPageContentItem.scope = activePageContentItem.value.scope
    thisPageContentItem.context = activePageContentItem.value.context
    thisPageContentItem.micAccess = activePageContentItem.value.micAccess
    thisPageContentItem.imageUploadAccess = activePageContentItem.value.imageUploadAccess

    if (activePageContentItem.value.greetingType === 'static') {
      newGreetingTextAreaText.value = activePageContentItem.value.staticGreeting
    } else {
      const newName =
        activePageContentItem.value.chatbotName[0].toUpperCase() +
        activePageContentItem.value.chatbotName.slice(1)
      newGreetingTextAreaText.value = `Say I am ${newName}, how can I help you today?`
    }
  }
)

const isInitialized = ref(false)

onMounted(() => {
  isInitialized.value = true
})

const emit = defineEmits<{
  (event: 'close-sidebar-data'): void
  (event: 'save-page-options', value: Page): void
  (event: 'save-page-content', value: PageContent): void
  (event: 'chatbot-name-change', value: string): void
  (event: 'greeting-change', value: string): void
  (event: 'prompt-placeholder-change', value: string): void
  (event: 'sidebar-data-changed', value: boolean): void
  (event: 'enable-upload-btn', value: boolean): void
  (event: 'file-upload', value: File, pageId: string): void
  (event: 'enable-img-upload-btn', value: boolean): void
  (event: 'img-upload', value: File, pageId: string): void
}>()

const sidebarTabs = ref([
  {
    name: 'Options',
    value: 'options'
  },
  {
    name: 'Content',
    value: 'content'
  },
  {
    name: 'Data',
    value: 'data'
  }
] as Option[])

const activeSidebarDataTab = ref('options')

function toggleTab(tab: string) {
  if (activeSidebarDataTab.value !== tab) {
    const tabIn = `#${tab}-tab`
    const tabOut = `#${activeSidebarDataTab.value}-tab`

    console.log('tabIn', tabIn)
    console.log('You clicked ' + tab)

    anime({
      targets: tabOut,
      opacity: 0,
      duration: 300,
      easing: 'easeInOutQuad',
      complete: () => {
        activeSidebarDataTab.value = tab

        anime({
          targets: tabIn,
          opacity: 1,
          duration: 300,

          easing: 'easeInOutQuad'
        })
      }
    })
  }
}

const onGreetingTypeChange = (option: Option) => {
  // newGreetingType.value = greetingTypes.find((item) => item.value === option);
  thisPageContentItem.greetingType = option.value as 'static' | 'generated'

  if (option.value === 'static') {
    newGreetingTextAreaText.value = thisPageContentItem.staticGreeting
  }

  if (option.value === 'generated') {
    const newName =
      thisPageContentItem.chatbotName[0].toUpperCase() + thisPageContentItem.chatbotName.slice(1)
    newGreetingTextAreaText.value = `Say I am ${newName}, how can I help you today?`
  }
}

const onClosureMsgChange = (option: Option) => {
  thisPageContentItem.displayClosureMessage = option.value as boolean
}

watch(
  () => newGreetingTextAreaText.value,
  (newVal) => {
    if (thisPageContentItem.greetingType === 'static') {
      thisPageContentItem.staticGreeting = newVal
    }
  }
)

const pageUrlInputHasFocus = ref(false)

const onSavePageContent = () => {
  emit('save-page-content', thisPageContentItem)
}

const onSavePageOptions = () => {
  emit('save-page-options', thisPage)
}

// watch(() => newGreetingTextAreaText.value, (newVal) => {
//   emit('greeting-change', newVal);
// });

const baseUrl = ref(import.meta.env.VITE_APP_BASE_URL)

// page options validation

// validation for page name

const allPageNames = adminHomeStore.getPages.map((page: Page) => page.name.toLowerCase())

const pageNameValidator = (value: string) => {
  if (!value) {
    return 'Page name is required'
  }

  if (value.length < 3) {
    return 'Page name must be at least 3 characters long'
  }

  if (value.length > 50) {
    return 'Page name must not exceed 50 characters'
  }

  if (
    allPageNames
      .filter((item: string) => item !== pageOrgClone.name.toLowerCase())
      .includes(value.toLowerCase())
  ) {
    return 'Page name already exists'
  }

  if (value.toLowerCase() === 'home' || value.toLowerCase() === 'settings') {
    return 'Page name is reserved'
  }

  return true
}

const {
  value: pageName,
  errorMessage: pageNameErrorMessage,
  meta: pageNameMeta
} = useField('pageName', pageNameValidator)

watch(
  () => thisPage.name,
  (newVal) => {
    pageName.value = newVal
  }
)

// validation for page url

const allPageUrls = adminHomeStore.getPages.map((page: Page) => page.path.toLowerCase())

const pageUrlValidator = (value: string) => {
  if (!value) {
    return 'Page url is required'
  }

  if (value.length < 3) {
    return 'Page url must be at least 3 characters long'
  }

  if (value.length > 50) {
    return 'Page url must not exceed 50 characters'
  }

  if (
    allPageUrls
      .filter((item: string) => item !== pageOrgClone.path.toLowerCase())
      .includes(value.toLowerCase())
  ) {
    return 'Page url already exists'
  }

  if (value.toLowerCase() === 'home' || value.toLowerCase() === 'settings') {
    return 'Page url is reserved'
  }

  return true
}

const {
  value: pageUrl,
  errorMessage: pageUrlErrorMessage,
  meta: pageUrlMeta
} = useField('pageUrl', pageUrlValidator)

const primaryRing = 'ring-2 ring-primary ring-offset-2'
const errorRing = 'ring-2 ring-rose-500 ring-offset-2 border-rose-500'

const pageUrlInputClass = computed(() => {
  if (pageUrlMeta.validated && !pageUrlMeta.valid) {
    return errorRing
  }

  if (pageUrlInputHasFocus.value) {
    return primaryRing
  }

  return ''
})

// validation for page title

const pageTitleValidator = (value: string) => {
  if (!value) {
    return 'Page title is required'
  }

  if (value.length < 3) {
    return 'Page title must be at least 3 characters long'
  }

  if (value.length > 50) {
    return 'Page title must not exceed 50 characters'
  }

  return true
}

const {
  value: pageTitle,
  errorMessage: pageTitleErrorMessage,
  meta: pageTitleMeta
} = useField('pageTitle', pageTitleValidator)

watch(
  () => thisPage.title,
  (newVal) => {
    pageTitle.value = newVal
  }
)

watch(
  () => thisPage.path,
  (newVal) => {
    pageUrl.value = newVal
  }
)

// ----------------------------- end of page options validation -----------------------------

// page content validation

// validation for chatbot name

const chatbotNameValidator = (value: string) => {
  if (!value) {
    return 'Chatbot name is required'
  }

  if (value.length < 3) {
    return 'Chatbot name must be at least 3 characters long'
  }

  if (value.length > 50) {
    return 'Chatbot name must not exceed 50 characters'
  }

  return true
}

const {
  value: chatbotName,
  errorMessage: chatbotNameErrorMessage,
  meta: chatbotNameMeta
} = useField('chatbotName', chatbotNameValidator)

watch(
  () => thisPageContentItem.chatbotName,
  (newVal) => {
    chatbotName.value = newVal

    emit('chatbot-name-change', newVal)

    if (thisPageContentItem.greetingType === 'generated') {
      // const newName = newVal[0].toUpperCase() + activePageContentItem.value.chatbotName.slice(1);
      newGreetingTextAreaText.value = `Say I am ${newVal}, how can I help you today?`
    }
  }
)

// validation for prompt placeholder

const promptPlaceholderValidator = (value: string) => {
  if (!value) {
    return 'Prompt placeholder is required'
  }

  if (value.length < 3) {
    return 'Prompt placeholder must be at least 3 characters long'
  }

  if (value.length > 50) {
    return 'Prompt placeholder must not exceed 50 characters'
  }

  return true
}

const {
  value: promptPlaceholder,
  errorMessage: promptPlaceholderErrorMessage,
  meta: promptPlaceholderMeta
} = useField('promptPlaceholder', promptPlaceholderValidator)

watch(
  () => thisPageContentItem.promptPlaceholder,
  (newVal) => {
    promptPlaceholder.value = newVal

    emit('prompt-placeholder-change', newVal)
  }
)

// validation for static greeting

const staticGreetingValidator = (value: string) => {
  if (!value) {
    return 'Static greeting is required'
  }

  if (value.length < 3) {
    return 'Static greeting must be at least 3 characters long'
  }

  if (value.length > 50) {
    return 'Static greeting must not exceed 50 characters'
  }

  return true
}

const {
  value: staticGreeting,
  errorMessage: staticGreetingErrorMessage,
  meta: staticGreetingMeta
} = useField('staticGreeting', staticGreetingValidator)

watch(
  () => thisPageContentItem.staticGreeting,
  (newVal) => {
    staticGreeting.value = newVal

    emit('greeting-change', newVal)
  }
)

// validation for directive

const directiveValidator = (value: string) => {
  if (!value) {
    return 'Directive is required'
  }

  if (value.length < 15) {
    return 'Directive must be at least 12 characters long'
  }

  if (value.length > 2000) {
    return 'Directive must not exceed 2000 characters'
  }

  return true
}

const {
  value: directive,
  errorMessage: directiveErrorMessage,
  meta: directiveMeta
} = useField('directive', directiveValidator)

watch(
  () => thisPageContentItem.directive,
  (newVal) => {
    directive.value = newVal
  }
)

// validation for model

const modelValidator = (value: string) => {
  if (!value) {
    return 'Model is required'
  }

  if (value.length < 3) {
    return 'Model must be at least 3 characters long'
  }

  if (value.length > 20) {
    return 'Model must not exceed 20 characters'
  }

  return true
}

const {
  value: model,
  errorMessage: modelErrorMessage,
  meta: modelMeta
} = useField('model', modelValidator)

watch(
  () => thisPageContentItem.model,
  (newVal) => {
    model.value = newVal
  }
)

// validation for closure message

const closureMessageValidator = (value: string) => {
  if (!value) {
    return 'Closure message is required'
  }

  if (value.length < 3) {
    return 'Closure message must be at least 3 characters long'
  }

  if (value.length > 50) {
    return 'Closure message must not exceed 50 characters'
  }

  return true
}

const {
  value: closureMessage,
  errorMessage: closureMessageErrorMessage,
  meta: closureMessageMeta
} = useField('closureMessage', closureMessageValidator)

watch(
  () => thisPageContentItem.closureMessage,
  (newVal) => {
    closureMessage.value = newVal
  }
)

// validation for scope

const scopeValidator = (value: string) => {
  if (!value) {
    return 'Scope is required'
  }

  if (value.length < 3) {
    return 'Scope must be at least 3 characters long'
  }

  if (value.length > 350) {
    return 'Scope must not exceed 350 characters'
  }

  return true
}

const {
  value: scope,
  errorMessage: scopeErrorMessage,
  meta: scopeMeta
} = useField('scope', scopeValidator)

watch(
  () => thisPageContentItem.scope,
  (newVal) => {
    scope.value = newVal
  }
)

// validation for context

const contextValidator = (value: string) => {
  if (!value) {
    return 'Context is required'
  }

  if (value.length < 3) {
    return 'Context must be at least 3 characters long'
  }

  if (value.length > 350) {
    return 'Context must not exceed 350 characters'
  }

  return true
}

const {
  value: context,
  errorMessage: contextErrorMessage,
  meta: contextMeta
} = useField('context', contextValidator)

watch(
  () => thisPageContentItem.context,
  (newVal) => {
    context.value = newVal
  }
)

// ----------------------------- end of page content validation -----------------------------
//
// const pageContentsAreValid = computed(() => {
//   return chatbotNameMeta.valid
//       && promptPlaceholderMeta.valid
//       && staticGreetingMeta.valid
//       && directiveMeta.valid
//       && modelMeta.valid
//       && closureMessageMeta.valid && closureMessageMeta.validated;
// });
//
// const pageOptionsAreValid = computed(() => {
//   return pageNameMeta.valid && pageNameMeta.validated
//       && pageUrlMeta.valid && pageUrlMeta.validated
//       && pageTitleMeta.valid && pageTitleMeta.validated;
// });

// Handle the data tab

// const uploadDataBtnIsActive = ref(false);

const uploadedFile = ref<File | null>(null)
const uploadedImg = ref<File | null>(null)
const dataFileEl = ref<HTMLInputElement | null>(null)
const imgFileEl = ref<HTMLInputElement | null>(null)

watch(
  () => props.fileUploadBtnEnabled,
  (newVal) => {
    if (!newVal) {
      // clear the file input
      if (dataFileEl.value) {
        dataFileEl.value.value = ''
      }
    }
  }
)

watch(
  () => props.imgUploadBtnEnabled,
  (newVal) => {
    if (!newVal) {
      // clear the file input
      if (imgFileEl.value) {
        imgFileEl.value.value = ''
      }
    }
  }
)

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files as FileList

  if (files.length > 0) {
    uploadedFile.value = files[0]
    // uploadDataBtnIsActive.value = true;
    emit('enable-upload-btn', true)

    // TODO: validate the file type
  }
}

const onImageChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files as FileList

  if (files.length > 0) {
    uploadedImg.value = files[0]
    // uploadDataBtnIsActive.value = true;
    emit('enable-img-upload-btn', true)
  }
}

const onUploadData = () => {
  // uploadDataBtnIsActive.value = false;

  emit('file-upload', uploadedFile.value as File, thisPage.id)
}

const onUploadImg = () => {
  // uploadDataBtnIsActive.value = false;

  emit('img-upload', uploadedImg.value as File, thisPage.id)
}

const onAddUrl = () => {
  // add url links to the chatbot
}

const router = useRouter()

const moreSetting = () => {
  router.push({
    name: 'DynamicPageSettings'
  })
}
</script>

<template>
  <!-- Sidenav -->
  <!-- Let's create an overlay that will cover the entire screen when the sidebar is open -->
  <div
    v-if="props.isOpen"
    aria-hidden="true"
    class="absolute inset-0 z-30 bg-black bg-opacity-10 cursor-pointer"
    @click="emit('close-sidebar-data')"
    @keyup.esc="emit('close-sidebar-data')"
  ></div>
  <nav
    id="sidebar-data"
    :class="props.isOpen ? 'translate-x-0' : 'translate-x-full'"
    class="absolute right-0 top-0 z-40 h-full w-10/12 sm:w-8/12 md:w-6/12 lg:w-5/12 overflow-hidden bg-white dark:bg-neutral-900 shadow-lg transition duration-300 ease-in-out transform-gpu"
  >
    <div class="flex flex-col overflow-auto flex-1 sidebar-con">
      <!--Tabs navigation-->
      <ul class="tabs flex flex-row font-semibold sticky top-0 z-10 bg-white" role="tablist">
        <li
          v-for="tab in sidebarTabs"
          :key="tab.name"
          :class="activeSidebarDataTab === tab.value ? 'tab-active border-primary' : ''"
          class="tab tab-bordered grow h-8 sm:h-10 md:h-12 lg:h-14"
          role="presentation"
          @click="toggleTab(<string>tab.value)"
        >
          <p :class="{ 'text-blue-500': activeSidebarDataTab === tab.value }">{{ tab.name }}</p>
        </li>
      </ul>

      <!--Tabs content-->
      <div class="pt-5 pb-10">
        <Transition mode="out-in" name="slide">
          <div
            v-if="activeSidebarDataTab === 'options'"
            id="data-tab"
            ref="dataRef"
            aria-labelledby="tabs-profile-tab02"
            class="tab-options px-5 grow h-full"
            role="tabpanel"
          >
            <div class="grid grid-cols-1 gap-3 py-3">
              <div class="flex flex-col space-y-2">
                <label class="label text-xs font-semibold" for="page-name"> Page Name </label>
                <input
                  id="page-name"
                  v-model="thisPage.name"
                  :class="{
                    'input-error': pageNameMeta.validated && !pageNameMeta.valid,
                    'input-primary': pageNameMeta.validated && pageNameMeta.valid
                  }"
                  class="input input-primary input-bordered w-full text-sm"
                  placeholder="Page Name"
                  type="text"
                />
                <small
                  v-if="pageNameMeta.validated && !pageNameMeta.valid"
                  class="text-xs text-rose-500"
                >
                  {{ pageNameErrorMessage }}
                </small>
                <small class="text-xs text-gray-500"
                  >This is the name that will appear on the sidebar, and on the navigation bar. It
                  should be short and descriptive.
                </small>
              </div>
              <!--              <ChatBotMeasurement />-->

              <div class="flex flex-col space-y-2">
                <label class="label text-xs font-semibold" for="meta-title"> Meta Title </label>
                <input
                  id="meta-title"
                  v-model="thisPage.title"
                  :class="{
                    'input-error': pageTitleMeta.validated && !pageTitleMeta.valid,
                    'input-primary': pageTitleMeta.validated && pageTitleMeta.valid
                  }"
                  class="input input-bordered input-primary w-full text-sm"
                  placeholder="Meta Title"
                  type="text"
                />
                <small
                  v-if="pageTitleMeta.validated && !pageTitleMeta.valid"
                  class="text-xs text-rose-500"
                >
                  {{ pageTitleErrorMessage }}
                </small>
                <small class="text-xs text-gray-500"
                  >This is the title that will appear on the browser tab.</small
                >
              </div>
              <div class="flex flex-col space-y-2">
                <label class="label text-xs font-semibold" for="page-url"> Page Url </label>
                <div
                  :class="[pageUrlInputHasFocus ? pageUrlInputClass : '']"
                  class="rounded-md border border-primary flex flex-col"
                >
                  <div class="bg-stone-200 text-black px-2 py-1 rounded-t-md">
                    <span class="text-xs"> {{ baseUrl }}/chat/ </span>
                  </div>
                  <input
                    id="page-url"
                    v-model="thisPage.path"
                    class="bg-transparent focus:outline-none input w-full text-sm"
                    placeholder="page-url"
                    type="text"
                    @blur="pageUrlInputHasFocus = false"
                    @focus="pageUrlInputHasFocus = true"
                  />
                </div>
                <small
                  v-if="pageUrlMeta.validated && !pageUrlMeta.valid"
                  class="text-xs text-rose-500"
                >
                  {{ pageUrlErrorMessage }}
                </small>
                <small class="text-xs text-gray-500">
                  This is the url that will be used to access the chatbot page. For example, if you
                  enter "about" here, the chatbot page will be accessible at
                  https://mydomain.com/about
                </small>
              </div>

              <div
                class="sticky bottom-0 z-30 h-24 flex flex-col justify-between items-center w-full"
              >
                <div class="py-3 bg-gradient-to-t from-white block basis-2/12 w-full"></div>
                <div
                  class="bg-white w-full px-4 md:px-6 basis-10/12 flex flex-row justify-between items-center space-x-4"
                >
                  <button
                    :disabled="!savePageBtnIsActive"
                    class="btn btn-primary btn-sm md:btn-md normal-case text-xs md:text-sm basis-1/2"
                    @click="onSavePageOptions"
                  >
                    Save Changes
                  </button>

                  <button
                    class="btn btn-outline btn-sm md:btn-md normal-case text-xs md:text-sm basis-1/2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div
            v-else-if="activeSidebarDataTab === 'content'"
            id="content-tab"
            ref="contentRef"
            aria-labelledby="tabs-profile-tab02"
            class="px-5 grow h-full"
            role="tabpanel"
          >
            <!--          <div-->
            <!--            v-else-if="activeSidebarDataTab === 'content'"-->
            <!--            id="content-tab"-->
            <!--            ref="contentRef"-->
            <!--            aria-labelledby="tabs-profile-tab02"-->
            <!--                        class="tab-content px-5 grow h-full"-->
            <!--            role="tabpanel"-->
            <!--          >-->
            <div class="grid grid-cols-1 gap-3 py-3">
              <div class="flex flex-col space-y-2">
                <label class="label text-xs font-semibold" for="chatbot-name"> Chatbot name </label>
                <input
                  id="chatbot-name"
                  v-model="thisPageContentItem.chatbotName"
                  :class="{
                    'input-error': chatbotNameMeta.validated && !chatbotNameMeta.valid,
                    'input-primary': chatbotNameMeta.validated && chatbotNameMeta.valid
                  }"
                  class="input input-bordered input-primary w-full text-sm"
                  placeholder="Chatbot Name"
                  type="text"
                />
                <small
                  v-if="chatbotNameMeta.validated && !chatbotNameMeta.valid"
                  class="text-xs text-rose-500"
                >
                  {{ chatbotNameErrorMessage }}
                </small>
                <small class="text-xs text-gray-500"
                  >This is the name that will appear on the chatbot bubble.</small
                >
                <div></div>
              </div>
              <div>
                <label class="label text-xs font-semibold"> Greeting </label>
                <MyListBox
                  :options="greetingTypes"
                  :selected-value="thisPageContentItem.greetingType"
                  @change="onGreetingTypeChange"
                />
                <small class="text-xs text-gray-500"
                  >This is the greeting that will appear on the chatbot bubble.</small
                >
              </div>
              <div
                v-if="thisPageContentItem.greetingType === 'static'"
                class="flex flex-col space-y-2"
              >
                <textarea
                  v-model="newGreetingTextAreaText"
                  :class="{
                    'textarea-error': staticGreetingMeta.validated && !staticGreetingMeta.valid,
                    'textarea-primary': staticGreetingMeta.validated && staticGreetingMeta.valid
                  }"
                  class="textarea textarea-primary w-full resize-y"
                  placeholder="Bio"
                ></textarea>
                <small
                  v-if="staticGreetingMeta.validated && !staticGreetingMeta.valid"
                  class="text-xs text-rose-500"
                >
                  {{ staticGreetingErrorMessage }}
                </small>
                <small class="text-xs text-gray-500">
                  This is the greeting that will appear on the chatbot bubble.
                </small>
              </div>
              <div class="flex flex-col space-y-2">
                <label class="label text-xs font-semibold" for="prompt-placeholder">
                  Prompt placeholder
                </label>
                <input
                  id="chatbot-name"
                  v-model="thisPageContentItem.promptPlaceholder"
                  :class="{
                    'input-error': promptPlaceholderMeta.validated && !promptPlaceholderMeta.valid,
                    'input-primary': promptPlaceholderMeta.validated && promptPlaceholderMeta.valid
                  }"
                  class="input input-bordered input-primary w-full text-sm"
                  placeholder="Chatbot Name"
                  type="text"
                />
                <small
                  v-if="promptPlaceholderMeta.validated && !promptPlaceholderMeta.valid"
                  class="text-xs text-rose-500"
                >
                  {{ promptPlaceholderErrorMessage }}
                </small>
                <small class="text-xs text-gray-500"
                  >This is the placeholder that will appear on the user input.</small
                >
              </div>
              <hr class="my-3 h-0.5" />
              <div class="flex flex-col space-y-2">
                <label class="label text-xs font-semibold" for="directive"> Directive </label>
                <textarea
                  v-model="thisPageContentItem.directive"
                  :class="{
                    'textarea-error': directiveMeta.validated && !directiveMeta.valid,
                    'textarea-primary': directiveMeta.validated && directiveMeta.valid
                  }"
                  class="textarea textarea-primary w-full resize-y"
                  placeholder="Add new directive..."
                ></textarea>
                <small
                  v-if="directiveMeta.validated && !directiveMeta.valid"
                  class="text-xs text-rose-500"
                >
                  {{ directiveErrorMessage }}
                </small>
                <small class="text-xs text-gray-500">
                  This is the directive that will be used to generate the chatbot's response.
                </small>
              </div>
              <div class="flex flex-col space-y-2">
                <label class="label text-xs font-semibold" for="directive"> Scope </label>
                <textarea
                  v-model="thisPageContentItem.scope"
                  :class="{
                    'textarea-error': scopeMeta.validated && !scopeMeta.valid,
                    'textarea-primary': scopeMeta.validated && scopeMeta.valid
                  }"
                  class="textarea textarea-primary w-full resize-y"
                  placeholder="Add new scope..."
                ></textarea>
                <small v-if="scopeMeta.validated && !scopeMeta.valid" class="text-xs text-rose-500">
                  {{ scopeErrorMessage }}
                </small>
                <small class="text-xs text-gray-500">
                  This is the scope that will be used to generate the chatbot's response.
                </small>
              </div>

              <div class="flex flex-col space-y-2">
                <label class="label text-xs font-semibold" for="directive"> Context </label>
                <textarea
                  v-model="thisPageContentItem.context"
                  :class="{
                    'textarea-error': contextMeta.validated && !contextMeta.valid,
                    'textarea-primary': contextMeta.validated && contextMeta.valid
                  }"
                  class="textarea textarea-primary w-full resize-y"
                  placeholder="Add new context..."
                ></textarea>
                <small
                  v-if="contextMeta.validated && !contextMeta.valid"
                  class="text-xs text-rose-500"
                >
                  {{ contextErrorMessage }}
                </small>
                <small class="text-xs text-gray-500">
                  This is the context that will be used to generate the chatbot's response.
                </small>
              </div>
              <hr class="my-3 h-0.5" />
              <div>
                <label class="label text-xs font-semibold" for="creativity"> Creativity </label>
                <input
                  id="creativity"
                  v-model="thisPageContentItem.creativity"
                  class="range range-xs"
                  max="10"
                  min="1"
                  step="1"
                  type="range"
                />
                <div class="w-full flex justify-between text-xs px-2">
                  <span>0</span>
                  <span class="text-sm font-semibold">
                    {{ thisPageContentItem.creativity / 10 }}
                  </span>
                  <span>1</span>
                </div>
                <div class="w-full flex justify-between text-xs px-2">
                  <span> Predictable </span>
                  <span> Creative </span>
                </div>
                <small class="text-xs text-gray-500">
                  This is the creativity level that will be used to generate the chatbot's response.
                </small>
              </div>
              <div class="flex flex-col space-y-2">
                <label class="label text-xs font-semibold"> Display closure message </label>
                <MyListBox
                  :options="closureMsgOptions"
                  :selected-value="thisPageContentItem.displayClosureMessage"
                  @change="onClosureMsgChange"
                />
                <small class="text-xs text-gray-500">
                  This is will determine whether the closure message will be displayed at the bottom
                  of the chatbot response.
                </small>
              </div>
              <div v-if="thisPageContentItem.displayClosureMessage" class="flex flex-col space-y-2">
                <label class="label text-xs font-semibold" for="closure-msg">
                  Closure message
                </label>
                <textarea
                  v-model="thisPageContentItem.closureMessage"
                  :class="{
                    'textarea-error': closureMessageMeta.validated && !closureMessageMeta.valid,
                    'textarea-primary': closureMessageMeta.validated && closureMessageMeta.valid
                  }"
                  class="textarea textarea-primary w-full resize-y"
                  placeholder="Add new closure messsage..."
                ></textarea>
                <small
                  v-if="closureMessageMeta.validated && !closureMessageMeta.valid"
                  class="text-xs text-rose-500"
                >
                  {{ closureMessageErrorMessage }}
                </small>
                <small class="text-xs text-gray-500">
                  This is the message that will be displayed at the bottom of the chatbot response.
                </small>
              </div>
              <div class="flex flex-col space-y-2">
                <label class="label text-xs font-semibold" for="model"> Model </label>
                <input
                  id="model"
                  v-model="thisPageContentItem.model"
                  :class="{
                    'input-error': modelMeta.validated && !modelMeta.valid,
                    'input-primary': modelMeta.validated && modelMeta.valid
                  }"
                  class="input input-bordered input-primary w-full text-sm"
                  placeholder="Model"
                  type="text"
                />
                <small v-if="modelMeta.validated && !modelMeta.valid" class="text-xs text-rose-500">
                  {{ modelErrorMessage }}
                </small>
                <small class="text-xs text-gray-500">
                  This is the model that will be used to generate the chatbot's response.
                </small>
              </div>
              <div
                class="sticky bottom-0 z-30 h-24 flex flex-col justify-between items-center w-full"
              >
                <div class="py-3 bg-gradient-to-t from-white block basis-2/12 w-full"></div>
                <div class="bg-white w-full px-4 md:px-6 basis-10/12">
                  <button
                    :disabled="!savePageContentBtnIsActive"
                    class="btn btn-primary btn-outline btn-sm md:btn-md normal-case text-xs md:text-sm w-full"
                    @click="onSavePageContent"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            v-else-if="activeSidebarDataTab === 'data'"
            id="data-tab"
            ref="dataRef"
            aria-labelledby="tabs-profile-tab02"
            class="tab-data px-5 grow h-full"
            role="tabpanel"
          >
            <div class="grid grid-cols-1 gap-3 py-3">
              <!-- This part if for uploading data files -->

              <div class="flex flex-col rounded bg-slate-200 p-3 w-full">
                <label class="label text-sm font-semibold text-center" for="data-file">
                  Connect a custom data source
                </label>
                <!-- Accept .txt, .pdf, .docx, .csv -->
                <input
                  id="data-file"
                  ref="dataFileEl"
                  accept=".pdf"
                  class="file-input file-input-ghost w-full max-w-xs"
                  type="file"
                  @change="onFileChange"
                />
                <small class="text-xs text-gray-500"
                  >This is the data file that will be used to train the chatbot.</small
                >
              </div>
              <div class="bg-white w-full px-4 md:px-6 basis-10/12">
                <!--                :disabled="!uploadDataBtnIsActive"-->
                <button
                  :disabled="!fileUploadBtnEnabled"
                  class="btn btn-primary btn-outline btn-sm md:btn-md normal-case text-xs md:text-sm w-full"
                  @click="onUploadData"
                >
                  Upload Data
                </button>
              </div>
              <hr class="my-3 h-0.5" />

              <div class="flex flex-col rounded bg-slate-200 p-3 w-full">
                <label class="label text-sm font-semibold text-center" for="data-file">
                  Chatbot Image Icon
                </label>

                <!-- Accept .png, .jpg, .jpeg, .webp -->
                <input
                  id="data-file"
                  ref="dataFileEl"
                  accept=".png, .jpg, .jpeg, .webp"
                  class="file-input file-input-ghost w-full max-w-xs"
                  type="file"
                  @change="onImageChange"
                />
                <small class="text-xs text-gray-500"
                  >This is the image that will be used as the chatbot icon.</small
                >
              </div>
              <div class="bg-white w-full px-4 md:px-6 basis-10/12">
                <button
                  :disabled="!imgUploadBtnEnabled"
                  class="btn btn-primary btn-outline btn-sm md:btn-md normal-case text-xs md:text-sm w-full"
                  @click="onUploadImg"
                >
                  Upload Image
                </button>
              </div>
              <hr class="my-3 h-0.5" />
              <!--              <div class="flex flex-col rounded bg-slate-200 p-3">-->
              <!--                <p class="text-sm">-->
              <!--                  Click on the below link to add url for your chatbot to add on the data, it can be-->
              <!--                  link to your website for example-->
              <!--                </p>-->
              <!--                <button-->
              <!--                  :disabled="!imgUploadBtnEnabled"-->
              <!--                  class="btn btn-primary btn-outline btn-sm md:btn-md normal-case text-xs md:text-sm w-full"-->
              <!--                  @click="onAddUrl"-->
              <!--                >-->
              <!--                  Add Url-->
              <!--                </button>-->
              <!--              </div>-->

              <div class="w-72">
                <span class="text-sm mb-4">Select the span of chatbot context</span>
                <Listbox v-model="selectedContext">
                  <div class="relative">
                    <ListboxButton
                      class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm"
                    >
                      <span class="block truncate">{{ selectedContext.name }}</span>
                      <span
                        class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
                      >
                        <ChevronUpDownIcon aria-hidden="true" class="h-5 w-5 text-gray-400" />
                      </span>
                    </ListboxButton>

                    <transition
                      leave-active-class="transition duration-100 ease-in"
                      leave-from-class="opacity-100"
                      leave-to-class="opacity-0"
                    >
                      <ListboxOptions
                        class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
                      >
                        <ListboxOption
                          v-for="context in chatbotContext"
                          :key="context.name"
                          v-slot="{ active, selected }"
                          :value="context"
                          as="template"
                        >
                          <li
                            :class="[
                              active ? 'bg-sky-100 text-sky-900' : 'text-gray-900',
                              'relative cursor-default select-none py-2 pl-10 pr-4'
                            ]"
                          >
                            <span
                              :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']"
                              >{{ context.name }}</span
                            >
                            <span
                              v-if="selected"
                              class="absolute inset-y-0 left-0 flex items-center pl-3 text-sky-600"
                            >
                              <CheckIcon aria-hidden="true" class="h-5 w-5" />
                            </span>
                          </li>
                        </ListboxOption>
                      </ListboxOptions>
                    </transition>
                  </div>
                </Listbox>
                <button
                  :disabled="!isContextSelected"
                  class="btn btn-sm mt-3 bg-blue-200 text-sm font-normal"
                  @click="addContext"
                >
                  <span
                    v-if="contextIsLoading"
                    className="loading loading-spinner loading-md"
                  ></span>
                  <span v-else>Add context</span>
                </button>
              </div>
              <hr class="my-3 h-0.5" />
              <button
                class="btn btn-sm bg-blue-200 hover:bg-blue-400"
                type="button"
                @click="moreSetting"
              >
                more
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </nav>
  <!-- Sidenav -->
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.2s;
}

.slide-enter, .slide-leave-to /* .slide-leave-active in <2.1.8 */ {
  transform: translateX(0);
}

.sidebar-con {
  height: calc(100% - 3.5rem);
}
.underline{
  border-bottom: 2px solid #3B82F6;
}
</style>
