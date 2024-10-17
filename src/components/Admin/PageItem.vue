<script lang="ts" setup>
import {useRouter} from 'vue-router'
import {useTabsStore} from '../../stores/admin/tabs'
import {useAdminHomeStore} from '../../stores/admin/home'
import {useColorGenerator} from '../../composables/color-generator'
import {onMounted, ref} from 'vue'
import {useChatbotStore} from "@/stores/chatbot";
import {botImageGenerator} from "@/composables/botimage-generator";

interface PageItem {
  name: string
  path: string
  id: string
  botUrl: string
}

const props = defineProps<{
  page: PageItem
}>()
const botSrc = ref()
const {bgColor, textColor, setColor} = useColorGenerator(props.page.name)
const getBotUrl = () => {
  const botUrlArray = botImageGenerator()
  botSrc.value = botUrlArray[Math.floor(Math.random() * botUrlArray.length)]
}
console.log('bot-url', props.page.botUrl)

const chatbotStore = useChatbotStore()

onMounted(() => {
  chatbotStore.pgSlug = props.page.path
  console.log(chatbotStore.pgSlug)
  setColor()
  getBotUrl()

})

const router = useRouter()

const tabsStore = useTabsStore()
const homeStore = useAdminHomeStore()

const onClick = () => {
  console.log('Clicked card bots')
  setTimeout(async () => {
    try {
      // activate the tab
      await tabsStore.updateActiveTab(props.page.name)

      if (props.page.name === 'Home') {
        console.log('home')
        await router.push({
          name: 'AdminHome',
          params: {page: props.page.path},
          query: {pageId: props.page.id}
        })
        return
      } else if (props.page.name === 'Settings') {
        console.log('settings')
        await router.push({
          name: 'AdminSettingsTab',
          params: {tab: 'general'},
          query: {pageId: props.page.id}
        })
        return
      }

      await router.push({
        name: 'DynamicPage',
        params: {pageId: props.page.id, cbName: props.page.path},
        // query: { pageId: props.page.id }
      })
    } catch (e) {
      console.error(e)
    }
  }, 300)
}

const dropdownItems = [
  {
    name: 'Edit',
    path: '#'
  },
  {
    name: 'Delete',
    path: '#'
  }
]


const onDropdownItemClick = (
    _e: Event,
    item: {
      name: string
      path: string
    }
) => {
  console.log(item)

  if (item.name === 'Edit') {
    handleEditClick()
  } else if (item.name === 'Delete') {
    handleDeleteClick()
  }
}

const handleEditClick = () => {
  console.log('edit')
  console.log(props.page.id, props.page.path)
  router.push({
    name: 'DynamicPage',
    params: {pageId: props.page.id, cbName: props.page.path},
  })
}

const handleDeleteClick = () => {
  homeStore.openDeleteDialog()

  homeStore.setPageToDelete(props.page.id)
}


</script>

<template>
  <div
      class="card shadow min-w-48 rounded-lg hover:shadow-lg hover:scale-110  transition duration-300 ease-in-out h-48 md:h-52 page-item-bg animate-scale-up-center active:scale-95"


  >
    <div class="relative flex items-center justify-center h-28" @click="onClick">
      <div class="flex items-center justify-center">
        <div class="grid grid-cols-3 gap-2">
          <div :class="bgColor" class="absolute col-span-2  right-0 left-0 top-0">
            <img
                :src="botSrc"
                alt="Shoes"
                class="w-36 ms-0"/>
          </div>
          <div class="">
            <div class="absolute">
              <p :class="[textColor]">{{ props.page.name }}</p>
            </div>

          </div>
        </div>
      </div>
    </div>
    <!--    <div class="absolute top-1/3 left-5 flex flex-row w-full justify-between items-center">-->
    <!--      <h6-->
    <!--          :class="[textColor]"-->
    <!--          class="text-lg hover:scale-110 md:text-xl font-poppins-semi-bold leading-tight tracking-wide"-->
    <!--      >-->
    <!--        {{ props.page.name }}-->
    <!--      </h6>-->
    <!--    </div>-->
    <div class="bottom-0  pb-2 left-0 absolute  px-4 flex flex-row w-full justify-between items-center">
      <div class="dropdown dropdown-top dropdown-end">
        <label class="btn btn-circle btn-xs btn-ghost m-1" tabindex="0">
          <span aria-expanded="false" class="material-icons-round text-gray-400"> more_vert </span>
        </label>
        <ul class="absolute z-40 shadow menu dropdown-content bg-base-100 rounded-box w-24" tabindex="0">
          <li v-for="item in dropdownItems" :key="item.name">
            <a class="menu-item text-xs" href="#" @click.stop="onDropdownItemClick($event, item)">
              {{ item.name }}
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-item-bg {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:svgjs='http://svgjs.dev/svgjs' width='560' height='560' preserveAspectRatio='none' viewBox='0 0 560 560'%3e%3cg mask='url(%26quot%3b%23SvgjsMask1022%26quot%3b)' fill='none'%3e%3cpath d='M0 35C5.97 12.21 13.63 5.76 36.67 0C83.63 -11.74 88.34 0 140 0C192.93 0 230.26 -29.69 245.85 0C267.01 40.31 203.18 77.59 213.5 140C220.25 180.84 240.43 204.77 280 206.5C343.68 209.28 351.38 179.76 420 149.03C425.62 146.51 428.48 145.63 428.48 140C428.48 123.62 429.21 120.2 420 105C386.79 50.2 343.64 33.06 343.64 0C343.64 -19.44 381.82 0 420 0C460 0 460.72 -4.98 500 0C530.72 3.9 549.84 -5.95 560 17.75C579.84 64.05 560 78.88 560 140C560 210 560 210 560 280C560 331.64 589.71 360.61 560 383.28C519.71 414.03 484.92 373.11 420 386.84C398.12 391.47 389.51 398.2 386.4 420C377.16 484.78 424.49 521.58 395.29 560C371.29 591.58 337.64 560 280 560C249.38 560 234.57 580.53 218.75 560C180.65 510.53 200.5 487.51 172.16 420C161.13 393.71 158.36 372.4 140 372.4C118.48 372.4 98.5 389.59 92.4 420C79.69 483.39 129.1 519.53 102.39 560C82.9 589.53 21.63 589.57 0 560C-29.57 519.57 0 490 0 420C0 369.78 -12.71 364.52 0 319.57C7.08 294.52 39.57 299.78 39.57 280C39.57 260.22 7.08 265.48 0 240.43C-12.71 195.48 0 190.22 0 140C0 87.5 -12.37 82.21 0 35' stroke='rgba(90%2c 90%2c 90%2c 0.17)' stroke-width='2'%3e%3c/path%3e%3cpath d='M433.13 560C433.13 535.15 519.84 469.78 560 469.78C583.27 469.78 586.36 541.25 560 560C522.93 586.36 433.13 580.26 433.13 560' stroke='rgba(90%2c 90%2c 90%2c 0.17)' stroke-width='2'%3e%3c/path%3e%3cpath d='M0 114.55C36.95 114.55 93.33 127.53 93.33 140C93.33 152.43 37.26 164.35 0 164.35C-9.41 164.35 0 152.18 0 140C0 127.27 -9.72 114.55 0 114.55' stroke='rgba(90%2c 90%2c 90%2c 0.17)' stroke-width='2'%3e%3c/path%3e%3cpath d='M140 84C129.88 84 120 34.1 120 0C120 -7.9 130 0 140 0C150.25 0 160.49 -8.05 160.49 0C160.49 33.95 150.13 84 140 84' stroke='rgba(90%2c 90%2c 90%2c 0.17)' stroke-width='2'%3e%3c/path%3e%3cpath d='M481.52 140C519.6 102.35 536.66 67.04 560 67.04C575.9 67.04 560 103.52 560 140C560 210 560 210 560 280C560 302.95 577.21 318.43 560 325.9C507.21 348.82 481.15 314.67 420 340.79C371.02 361.72 373.63 375.59 339.73 420C303.63 467.29 310.02 524.19 280 524.19C249.88 524.19 219.46 473.21 219.46 420C219.46 358.89 247.29 356.07 280 295.56C285.13 286.07 286.05 285.85 295.14 280C356.05 240.81 362.4 248.75 420 205.48C455.59 178.75 449.6 171.57 481.52 140' stroke='rgba(90%2c 90%2c 90%2c 0.17)' stroke-width='2'%3e%3c/path%3e%3cpath d='M115.65 280C115.65 236.91 115.16 186.67 140 186.67C174 186.67 233.33 246.5 233.33 280C233.33 304.36 183.76 302.4 140 302.4C124.92 302.4 115.65 294.78 115.65 280' stroke='rgba(90%2c 90%2c 90%2c 0.17)' stroke-width='2'%3e%3c/path%3e%3cpath d='M0 395.65C6.45 395.65 17.68 404.54 22.4 420C42.76 486.71 58.44 508.2 50.15 560C47.24 578.2 6.61 578.46 0 560C-18.46 508.46 0 490 0 420C0 407.83 -4.75 395.65 0 395.65' stroke='rgba(90%2c 90%2c 90%2c 0.17)' stroke-width='2'%3e%3c/path%3e%3cpath d='M542.5 560C542.5 556.57 554.46 547.56 560 547.56C563.21 547.56 563.64 557.42 560 560C554.89 563.64 542.5 562.79 542.5 560' stroke='rgba(90%2c 90%2c 90%2c 0.17)' stroke-width='2'%3e%3c/path%3e%3cpath d='M534.55 140C534.55 124.44 552.43 116.34 560 116.34C565.15 116.34 560 128.17 560 140C560 189.41 566.26 238.82 560 238.82C553.54 238.82 534.55 185.68 534.55 140' stroke='rgba(90%2c 90%2c 90%2c 0.17)' stroke-width='2'%3e%3c/path%3e%3cpath d='M389.73 280C389.73 271.61 403.36 261.94 420 261.94C461.57 261.94 506.15 271.77 506.15 280C506.15 288.17 462.02 294.74 420 294.74C403.81 294.74 389.73 288.01 389.73 280' stroke='rgba(90%2c 90%2c 90%2c 0.17)' stroke-width='2'%3e%3c/path%3e%3cpath d='M266.76 420C266.76 406.63 273.41 392.78 280 392.78C286.57 392.78 293.07 406.63 293.07 420C293.07 431.63 286.57 442.79 280 442.79C273.41 442.79 266.76 431.64 266.76 420' stroke='rgba(90%2c 90%2c 90%2c 0.17)' stroke-width='2'%3e%3c/path%3e%3c/g%3e%3cdefs%3e%3cmask id='SvgjsMask1022'%3e%3crect width='560' height='560' fill='white'%3e%3c/rect%3e%3c/mask%3e%3c/defs%3e%3c/svg%3e");
}
</style>
