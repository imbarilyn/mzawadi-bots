import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { type Page, useAdminHomeStore } from './home'
import { useAppHomeStore } from '../home'
import { useNotificationsStore } from '../notifications'
import { useAuthStore } from '../auth'

export interface PageContent {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  chatbotId?: any
  pageId: string
  chatbotName: string
  pageSlug: string
  greetingType: 'static' | 'generated'
  staticGreeting: string
  generatedGreeting: string
  promptPlaceholder: string
  directive: string
  model: string
  maxResponseLength: number
  creativity: number
  displayClosureMessage: boolean
  closureMessage: string
  scope: string
  context: string
  iconName?: string
  micAccess?: boolean
  imageUploadAccess?: boolean
}

export interface PageOptions {
  pageId: string
  pageName: string
  pageTitle: string
  pageUrl: string
}

export interface LinkItem {
  description: string
  url: string
}

const BASE_URL = import.meta.env.VITE_API_URL as string

export const usePageContentStore = defineStore('pageContentStore', () => {
  const newItem = ref<PageContent>({
    pageId: 'new',
    chatbotName: 'New Page',
    pageSlug: 'new-page',
    greetingType: 'static',
    staticGreeting: 'Hello, how can I help you?',
    generatedGreeting: 'Hello New Page! How can I help you?',
    promptPlaceholder: 'Type your message here...',
    directive: 'You are now chatting with New Page. Type your message here...',
    model: 'gpt2',
    maxResponseLength: 0,
    creativity: 0,
    displayClosureMessage: false,
    closureMessage:
      'This is an AI generated response. The response may not be accurate. Please consult a professional for advice.',
    scope: 'global',
    context: 'global',
    iconName: 'chat'
  })

  const pageContentItems = ref<PageContent[]>([])
  const activePageContentItem = ref<PageContent | null>(null)

  const adminHomeStore = useAdminHomeStore()

  // getters

  const getNewItem = computed(() => newItem.value)
  const getPageContentItems = computed(() => pageContentItems.value)
  const getPageContentByPageSlug = computed(() => (pageSlug: string) => {
    const foundItem = pageContentItems.value.find(
      (pageContentItem) => pageContentItem.pageSlug === pageSlug
    )

    if (!foundItem) {
      return null
    }

    return foundItem
  })
  const getActivePageContentItem = computed(() => activePageContentItem.value)
  const getPageContentByPageId = computed(() => (pageId: string) => {
    const foundItem = pageContentItems.value.find(
      (pageContentItem) => pageContentItem.pageId === pageId
    )

    if (!foundItem) {
      return null
    }

    return foundItem
  })
  const getPageContentByChatbotName = computed(() => (chatbotName: string) => {
    const foundItem = pageContentItems.value.find(
      (pageContentItem) => pageContentItem.pageSlug.toLowerCase() === chatbotName
    )

    if (!foundItem) {
      return null
    }

    return foundItem
  })

  // actions

  async function fetchPageContentItems() {
    const appHomeStore = useAppHomeStore()
    const notificationStore = useNotificationsStore()
    const authStore = useAuthStore()

    appHomeStore.setIsAppFetching(true)

    try {
      const response = await fetch(`${BASE_URL}/pages/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authStore.token}`
        }
      })

      const res = await response.json()
      console.log(res)

      const { options: pageOptions, content: pageContent } = res.data

      setPageContentItems(pageOptions, pageContent)
    } catch (error) {
      console.error(error)

      notificationStore.addNotification(
        'An error occurred while fetching the page content items.',
        'error'
      )
    } finally {
      setTimeout(() => {
        appHomeStore.setIsAppFetching(false)
      }, 500)
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  function setPageContentItems(rawPageOptions: any[], rawPageContentItems: object[]) {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    pageContentItems.value = rawPageContentItems.map((rawPageContentItem: any, index: number) => {
      // console.log(pageContentItems.value)
      return {
        pageId: rawPageOptions[index]['pageId'] as string,
        chatbotName: rawPageContentItem['chatbotName'] as string,
        pageSlug: rawPageContentItem['pageSlug'] as string,
        greetingType: rawPageContentItem['greetingType'] === 0 ? 'static' : 'generated',
        generatedGreeting: 'Hello, how can I help you?',
        staticGreeting: rawPageContentItem['staticGreeting'] as string,
        promptPlaceholder: rawPageContentItem['placeholderContent'] as string,
        directive: rawPageContentItem['chatbotDirective'] as string,
        model: rawPageContentItem['gptModel'] as string,
        maxResponseLength: 200 as number,
        creativity: rawPageContentItem['chatbotCreativity'] * 10,
        displayClosureMessage: rawPageContentItem['displayClosureMessage'] === 1,
        closureMessage: rawPageContentItem['closureMessage'] as string,
        scope: rawPageContentItem['scope'] as string,
        context: rawPageContentItem['context'] as string,
        iconName: rawPageContentItem['iconName'] as string
      } as PageContent
    })
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  function addNewPageContentItem(rawPageOptions: any, rawPageContentItem: any) {
    const newPageContent = {
      pageId: rawPageOptions['pageId'] as string,
      chatbotName: rawPageContentItem['chatbotName'] as string,
      pageSlug: rawPageContentItem['pageSlug'] as string,
      greetingType: rawPageContentItem['greetingType'] === 0 ? 'static' : 'generated',
      generatedGreeting: 'Hello, how can I help you?',
      staticGreeting: rawPageContentItem['staticGreeting'] as string,
      promptPlaceholder: rawPageContentItem['placeholderContent'] as string,
      directive: rawPageContentItem['chatbotDirective'] as string,
      model: rawPageContentItem['gptModel'] as string,
      maxResponseLength: 200 as number,
      creativity: rawPageContentItem['chatbotCreativity'] * 10,
      displayClosureMessage: rawPageContentItem['displayClosureMessage'] === 1,
      closureMessage: rawPageContentItem['closureMessage'] as string,
      scope: rawPageContentItem['scope'] as string,
      context: rawPageContentItem['context'] as string
    } as PageContent
    pageContentItems.value.push(newPageContent)

    return newPageContent
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  function updatePageContentItem(rawPageOptions: any, rawPageContentItem: any) {
    // we'll find and replace the page content item
    const pageContentItem = pageContentItems.value.find(
      (pageContentItem) => pageContentItem.pageId === rawPageOptions['pageId']
    )

    if (pageContentItem) {
      pageContentItem.chatbotName = rawPageContentItem['chatbotName'] as string
      pageContentItem.pageSlug = rawPageContentItem['pageSlug'] as string
      pageContentItem.greetingType =
        rawPageContentItem['greetingType'] === 0 ? 'static' : 'generated'
      pageContentItem.staticGreeting = rawPageContentItem['staticGreeting'] as string
      pageContentItem.promptPlaceholder = rawPageContentItem['placeholderContent'] as string
      pageContentItem.directive = rawPageContentItem['chatbotDirective'] as string
      pageContentItem.model = rawPageContentItem['gptModel'] as string
      pageContentItem.maxResponseLength = 200 as number
      pageContentItem.creativity = rawPageContentItem['chatbotCreativity'] * 10
      pageContentItem.displayClosureMessage = rawPageContentItem['displayClosureMessage'] === 1
      pageContentItem.closureMessage = rawPageContentItem['closureMessage'] as string
      pageContentItem.scope = rawPageContentItem['scope'] as string
      pageContentItem.context = rawPageContentItem['context'] as string
    }

    return pageContentItem
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  function updatePageOptions(rawPageOptions: any) {
    // we'll find and replace the page content item
    const pageContentItem = pageContentItems.value.find(
      (pageContentItem) => pageContentItem.pageId === rawPageOptions['pageId']
    )

    if (pageContentItem) {
      pageContentItem.chatbotName = rawPageOptions['pageName'] as string
      pageContentItem.pageSlug = rawPageOptions['pageUrl'] as string
    }

    return pageContentItem
  }

  //POST URL links

  async function addUrl(linkPayload: any, pageId: string) {
    const authStore = useAuthStore()
    const notificationStore = useNotificationsStore()
    const appHomeStore = useAppHomeStore()
    appHomeStore.setIsAppFetching(true)
    console.log(linkPayload)
    console.log(pageId)
    try {
      const response = await fetch(`${BASE_URL}/pages/${pageId}/data/links/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authStore.token}`,
          mode: 'cors'
        },
        body: JSON.stringify({ siteUrls: linkPayload })
      })
      const res = await response.json()
      const { result } = res
      console.log(result)
      return result
    } catch (e) {
      console.log('error--', e)
      // notificationStore.addNotification('An error occurred while adding links', 'error')
    } finally {
      setTimeout(() => {
        appHomeStore.setIsAppFetching(false)
      }, 500)
    }
  }

  async function getUrlLink(pageId: string) {
    const authStore = useAuthStore()
    // const notificationStore = useNotificationsStore()
    const appHomeStore = useAppHomeStore()
    try {
      const response: any = await fetch(`${BASE_URL}/pages/${pageId}/data/links/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authStore.token}`,
          mode: 'cors'
        }
      })
      const resp = await response.json()
      console.log(resp)
      return resp
    } catch (error) {
      console.log('error--', error)
      // notificationStore.addNotification('An error occurred while fetching links', 'error')
    } finally {
      setTimeout(() => {
        appHomeStore.setIsAppFetching(false)
      }, 500)
    }
  }

  async function savePageOptions(pageOptions: Page) {
    const newPageOptions: PageOptions = {
      pageId: pageOptions.id.toString(),
      pageName: pageOptions.name,
      pageTitle: pageOptions.title,
      pageUrl: pageOptions.path
    }

    const appHomeStore = useAppHomeStore()
    const notificationStore = useNotificationsStore()
    const authStore = useAuthStore()

    appHomeStore.setIsAppFetching(true)

    try {
      const response = await fetch(`${BASE_URL}/pages/${newPageOptions.pageId}/options/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authStore.token}`,
          mode: 'cors'
        },
        body: JSON.stringify(newPageOptions)
      })

      const { data } = await response.json()

      const { options } = data

      const [pageOption] = options

      await adminHomeStore.fetchPages()

      notificationStore.addNotification('Page options saved successfully.', 'success')

      return updatePageOptions(pageOption)
    } catch (error) {
      console.error(error)

      notificationStore.addNotification('An error occurred while saving the page options.', 'error')
    } finally {
      // appHomeStore.setIsAppFetching(false);

      setTimeout(() => {
        appHomeStore.setIsAppFetching(false)
      }, 500)
    }
  }

  async function savePageContent(pageContent: PageContent) {
    // pageContent.displayClosureMessage = pageContent.displayClosureMessage ? 1 : 0;
    const pageContentBody = {
      ...pageContent,
      greetingType: pageContent.greetingType === 'static' ? 0 : 1,
      displayClosureMessage: pageContent.displayClosureMessage ? 1 : 0
    }

    const appHomeStore = useAppHomeStore()
    const notificationStore = useNotificationsStore()
    const authStore = useAuthStore()

    appHomeStore.setIsAppFetching(true)

    try {
      const response = await fetch(`${BASE_URL}/pages/${pageContentBody.pageId}/content/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authStore.token}`,
          mode: 'cors'
        },
        body: JSON.stringify(pageContentBody)
      })

      const { data } = await response.json()

      const { content, options } = data

      const [pageContent] = content

      const [pageOption] = options

      await adminHomeStore.fetchPages()

      notificationStore.addNotification('Page content saved successfully.', 'success')

      return updatePageContentItem(pageOption, pageContent)
    } catch (error) {
      console.error(error)

      notificationStore.addNotification('An error occurred while saving the page content.', 'error')
    } finally {
      // appHomeStore.setIsAppFetching(false);

      setTimeout(() => {
        appHomeStore.setIsAppFetching(false)
      }, 500)
    }
  }

  function createNewPageContentItem(pageName: string) {
    // let's check first if the page name is already taken
    const pageContentItem = pageContentItems.value.find(
      (pageContentItem) => pageContentItem.chatbotName === pageName
    )

    if (pageContentItem) {
      // if the page name is already taken, we'll create a new chatbot id
      // by adding the word "copy" to the page name
      pageName = `${pageName} copy`
    }

    // create a new page data item
    const newPageContentItem = {
      ...newItem.value,
      chatbotName: pageName,
      chatbotId: pageName.toLowerCase().replace(' ', '-')
    } as PageContent

    // add the new page data item to the list
    addPageContentItem(newPageContentItem)

    return newPageContentItem

    // set the active page data item
    // setActivePageContentItem(newPageContentItem.chatbotId);
  }

  function addPageContentItem(pageContentItem: PageContent) {
    pageContentItems.value.push(pageContentItem)
  }

  function removePageContentItem(pageContentItem: PageContent) {
    pageContentItems.value.splice(pageContentItems.value.indexOf(pageContentItem), 1)
  }

  // function updatePageContentItem(pageContentItem: PageContent) {
  //     pageContentItems.value[pageContentItems.value.indexOf(pageContentItem)] = pageContentItem;
  // }

  function setActivePageContentItem(pageContentName: string) {
    // find the page data item by id
    // set the active page data item
    const pageContentItem = pageContentItems.value.find(
      (pageContentItem) => pageContentItem['chatbotName'] === pageContentName
    )

    if (pageContentItem) {
      activePageContentItem.value = pageContentItem
    }
  }

  async function getUploadedPdf(pageId: any) {
    const authStore = useAuthStore()
    const notificationStore = useNotificationsStore()
    const homeStore = useAppHomeStore()

    homeStore.setIsAppFetching(true)
    try {
      const response = await fetch(`${BASE_URL}/pages/data/get-documents/${pageId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authStore.token}`,
          mode: 'cors'
        }
      })
      const res = await response.json()
      console.log(res)
      const { result, data } = res
      console.log(data)
      return data
    } catch (e) {
      console.log('error--', e)
      notificationStore.addNotification('An error occurred while fetching uploaded files', 'error')
    } finally {
      setTimeout(() => {
        homeStore.setIsAppFetching(false)
      }, 500)
    }
  }

  async function uploadFile(file: File, pageId: string) {
    const formData = new FormData()
    formData.append('file', file)
    console.log(formData)

    const appHomeStore = useAppHomeStore()
    const notificationStore = useNotificationsStore()
    const authStore = useAuthStore()

    appHomeStore.setIsAppFetching(true)

    try {
      const response = await fetch(`${BASE_URL}/pages/${pageId}/data/`, {
        method: 'POST',
        headers: {
          Authorization: `${authStore.token}`
        },
        body: formData
      })

      const data = await response.json()

      const { file } = data

      return file
    } catch (error) {
      console.error(error)

      notificationStore.addNotification('An error occurred while uploading the file.', 'error')
    } finally {
      // appHomeStore.setIsAppFetching(false);

      setTimeout(() => {
        appHomeStore.setIsAppFetching(false)
      }, 500)
    }
  }

  async function uploadImg(file: File, pageId: string) {
    const formData = new FormData()
    formData.append('file', file)
    console.log(formData)

    const appHomeStore = useAppHomeStore()
    const notificationStore = useNotificationsStore()
    const authStore = useAuthStore()

    appHomeStore.setIsAppFetching(true)

    try {
      const response = await fetch(`${BASE_URL}/pages/${pageId}/icon/`, {
        method: 'POST',
        headers: {
          Authorization: `${authStore.token}`
        },
        body: formData
      })

      const data = await response.json()

      const { file } = data
      console.log(file)

      return file
    } catch (error) {
      console.error(error)

      notificationStore.addNotification('An error occurred while uploading the file.', 'error')
    } finally {
      // appHomeStore.setIsAppFetching(false);

      setTimeout(() => {
        appHomeStore.setIsAppFetching(false)
      }, 500)
    }
  }

  return {
    newItem,
    pageContentItems,
    activePageContentItem,
    getNewItem,
    getPageContentItems,
    getPageContentByPageSlug,
    getActivePageContentItem,
    getPageContentByPageId,
    getPageContentByChatbotName,
    fetchPageContentItems,
    addNewPageContentItem,
    savePageOptions,
    savePageContent,
    setPageContentItems,
    createNewPageContentItem,
    addPageContentItem,
    removePageContentItem,
    updatePageContentItem,
    setActivePageContentItem,
    uploadFile,
    uploadImg,
    getUploadedPdf,
    addUrl,
    getUrlLink
  }
})
