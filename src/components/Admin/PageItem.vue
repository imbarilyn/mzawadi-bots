<script lang="ts" setup>
import {useRouter} from "vue-router";
import {useTabsStore} from "../../stores/admin/tabs.ts";
import {useAdminHomeStore} from "../../stores/admin/home.ts";
import {useColorGenerator} from "../../composables/color-generator.ts";
import {onMounted} from "vue";

interface PageItem {
  name: string;
  path: string;
  id: string;
}

const props = defineProps<{
  page: PageItem;
}>();

const {
  bgColor,
  textColor,
  setColor,
} = useColorGenerator(props.page.name);

onMounted(() => {
  setColor();
});

const router = useRouter();

const tabsStore = useTabsStore();
const homeStore = useAdminHomeStore();

const onClick = () => {
  setTimeout(async () => {
    try {

      // activate the tab
      await tabsStore.updateActiveTab(props.page.name);

      if (props.page.name === "Home") {
        await router.push({name: "AdminHome", params: {page: props.page.path}, query: {pageId: props.page.id}});
        return;
      } else if (props.page.name === "Settings") {
        await router.push({name: "AdminSettingsTab", params: {tab: "general"}, query: {pageId: props.page.id}});
        return;
      }

      await router.push({name: "DynamicPage", params: {page: props.page.path}, query: {pageId: props.page.id}});
    } catch (e) {
      console.error(e);
    }
  }, 300);
};

const dropdownItems = [
  {
    name: "Edit",
    path: "#",
  },
  {
    name: "Delete",
    path: "#",
  },
];

const onDropdownItemClick = (_e: Event, item: {
  name: string;
  path: string
}) => {
  console.log(item);

  if (item.name === "Edit") {
    handleEditClick();
  } else if (item.name === "Delete") {
    handleDeleteClick();
  }
};

const handleEditClick = () => {
  router.push({name: "DynamicPage", params: {page: props.page.path}, query: {pageId: props.page.id, editPage: 'true'}});
};

const handleDeleteClick = () => {
  homeStore.openDeleteDialog();

  homeStore.setPageToDelete(props.page.id);
};

</script>

<template>
  <div
      class="card overflow-hidden shadow rounded-lg hover:shadow-lg hover:scale-110 border-primary transition duration-300 ease-in-out h-48 md:h-52 page-item-bg animate-scale-up-center active:scale-95">
    <div
        class="relative flex items-center justify-center h-40" :class="bgColor"
        @click="onClick">
      <div class="absolute inset-y-0 -right-4 flex items-center justify-center">
        <svg class="rounded-t-lg w-28 drop-shadow-lg opacity-20" :class="textColor" xmlns="http://www.w3.org/2000/svg"
             width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
             preserveAspectRatio="xMidYMid meet">
          <metadata>
            Created by potrace 1.16, written by Peter Selinger 2001-2019
          </metadata>
          <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
             fill="currentColor" stroke="none">
            <path d="M3770 5106 c-413 -87 -715 -420 -748 -824 -16 -189 9 -334 87 -497
130 -273 389 -468 685 -515 107 -18 311 -8 404 19 156 45 279 117 395 230 122
117 215 272 252 418 9 37 19 74 21 81 6 21 61 -13 81 -51 17 -30 18 -104 21
-1164 l2 -1133 -2410 0 -2410 0 2 1133 c3 1060 4 1134 21 1164 36 67 -54 63
1334 63 1376 0 1291 -4 1313 56 11 29 -5 81 -30 94 -12 6 -483 10 -1298 10
l-1279 0 -61 -31 c-66 -33 -116 -86 -138 -147 -18 -51 -19 -2750 -1 -2799 22
-60 72 -117 128 -148 l54 -30 653 -3 652 -3 0 -434 0 -435 -140 0 c-82 0 -149
-5 -164 -11 -50 -23 -57 -103 -13 -134 32 -23 2722 -23 2754 0 44 31 37 111
-13 134 -15 6 -82 11 -164 11 l-140 0 0 435 0 434 653 3 652 3 54 30 c56 31
106 88 128 148 8 24 12 379 12 1400 1 1501 5 1396 -59 1477 -28 35 -135 100
-165 100 -8 0 -14 28 -19 79 -12 153 -73 326 -157 447 -119 174 -306 308 -516
370 -109 32 -327 42 -433 20z m332 -161 c412 -87 685 -496 602 -903 -33 -162
-93 -271 -219 -397 -72 -73 -108 -100 -181 -138 -518 -266 -1125 103 -1125
683 0 366 252 677 611 754 85 19 228 19 312 1z m866 -3548 c-5 -123 -18 -161
-68 -191 -26 -15 -218 -16 -2340 -16 -2122 0 -2314 1 -2340 16 -50 30 -63 68
-68 191 l-5 113 2413 0 2413 0 -5 -113z m-1778 -667 l0 -300 -630 0 -630 0 0
184 0 185 -26 20 c-30 24 -52 26 -88 10 -43 -20 -47 -49 -44 -293 3 -226 3
-228 27 -247 22 -18 50 -19 761 -19 711 0 739 1 761 19 l24 19 3 361 3 361 54
0 55 0 0 -435 0 -435 -900 0 -900 0 0 435 0 435 765 0 765 0 0 -300z"/>
            <path d="M3770 4752 c-22 -18 -26 -30 -30 -108 l-5 -88 -33 -7 c-44 -9 -99
-63 -114 -110 l-11 -37 -84 -4 c-75 -3 -87 -6 -104 -27 -26 -32 -25 -82 4
-109 20 -19 35 -22 105 -22 l82 0 0 -50 0 -50 -80 0 c-73 0 -83 -3 -105 -25
-33 -32 -33 -78 0 -110 21 -22 33 -25 103 -25 l79 0 12 -39 c15 -51 61 -97
112 -112 l39 -12 0 -79 c0 -70 3 -82 25 -103 15 -16 36 -25 55 -25 19 0 40 9
55 25 22 22 25 32 25 105 l0 80 50 0 50 0 0 -84 c0 -79 2 -86 26 -105 27 -21
59 -26 89 -15 28 11 45 60 45 133 0 69 1 71 28 77 59 14 122 83 122 134 0 18
6 20 81 20 92 0 111 7 129 50 10 24 10 36 0 60 -18 43 -37 50 -129 50 l-81 0
0 50 0 50 84 0 c95 0 122 13 132 67 5 27 1 37 -24 63 -29 28 -35 30 -111 30
-75 0 -81 2 -81 20 0 50 -46 104 -107 125 l-38 13 -5 82 c-5 74 -9 85 -33 106
-34 29 -66 30 -101 3 -24 -19 -26 -26 -26 -105 l0 -84 -49 0 -49 0 -3 85 c-4
95 -14 112 -70 121 -26 4 -41 1 -59 -14z m380 -562 l0 -210 -205 0 -205 0 0
203 c0 112 3 207 7 210 3 4 96 7 205 7 l198 0 0 -210z"/>
            <path d="M815 3499 c-134 -19 -277 -121 -342 -244 -42 -80 -54 -130 -55 -224
0 -137 37 -232 133 -338 83 -91 89 -110 89 -267 0 -209 19 -226 257 -226 233
0 253 19 253 233 0 152 6 170 86 259 97 106 133 199 134 339 1 295 -255 510
-555 468z m190 -176 c36 -12 67 -33 111 -77 76 -77 99 -135 92 -240 -6 -87
-28 -134 -107 -221 -32 -36 -67 -85 -77 -110 l-19 -45 -110 0 -110 0 -18 43
c-10 24 -49 78 -87 121 -78 88 -102 143 -101 234 0 82 31 159 88 216 98 99
201 124 338 79z m-15 -908 l0 -55 -95 0 -95 0 0 55 0 55 95 0 95 0 0 -55z"/>
            <path d="M1695 3393 c-75 -39 -114 -105 -115 -191 0 -84 20 -116 165 -262
l135 -135 -131 -130 c-72 -72 -139 -147 -150 -167 -28 -54 -26 -142 4 -199 34
-64 93 -102 167 -107 106 -8 120 2 377 261 241 242 253 258 253 342 0 84 -12
100 -248 338 -125 126 -244 237 -264 248 -47 24 -150 25 -193 2z m332 -355
c132 -132 213 -220 213 -232 0 -26 -417 -446 -443 -446 -33 0 -57 20 -57 47 0
22 34 62 165 193 157 159 165 168 165 206 0 37 -7 47 -165 204 -168 168 -186
195 -153 228 34 34 58 16 275 -200z"/>
            <path d="M2737 2617 c-93 -29 -147 -107 -147 -210 0 -56 4 -71 33 -113 19 -29
49 -57 76 -71 l44 -23 899 0 c788 0 903 2 936 15 79 33 124 104 124 194 0 70
-12 99 -58 150 -66 74 -29 71 -1003 70 -633 0 -876 -4 -904 -12z m1781 -163
c24 -17 30 -62 10 -82 -17 -17 -1749 -17 -1766 0 -20 20 -14 65 10 82 20 14
119 16 873 16 754 0 853 -2 873 -16z"/>
          </g>
        </svg>
      </div>
    </div>
    <div class="absolute top-1/3 left-5 flex flex-row w-full justify-between items-center">
      <h6
          class="text-lg hover:scale-110 md:text-xl font-poppins-semi-bold leading-tight tracking-wide" :class="[textColor]">
        {{ props.page.name }}
      </h6>
    </div>
    <div class="py-3 px-4 flex flex-row w-full justify-between items-center">
      <div class="dropdown dropdown-top dropdown-end">
        <label class="btn btn-circle btn-xs btn-ghost m-1" tabindex="0">
        <span
            aria-expanded="false"
            class="material-icons-round text-gray-400">
            more_vert
        </span>
        </label>
        <ul class="z-30 shadow menu dropdown-content bg-base-100 rounded-box w-24" tabindex="0">
          <li v-for="(item) in dropdownItems" :key="item.name">
            <a
                class="menu-item text-xs"
                href="#"
                @click.stop="onDropdownItemClick($event, item)"
            >
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