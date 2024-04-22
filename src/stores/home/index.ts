import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {useMediaQuery} from "@vueuse/core";

export const useAppHomeStore = defineStore('app-home', () => {

    // state

    const isAppFetching = ref<boolean>(false);
    const isSmallScreen = useMediaQuery("(max-width: 768px)");
    const isMediumScreen = useMediaQuery("(max-width: 1024px)");
    const isLargeScreen = useMediaQuery("(max-width: 1280px)");
    const isXLargeScreen = useMediaQuery("(max-width: 1536px)");

    // getters
    const getIsAppFetching = computed(() => isAppFetching.value);


    // actions
    async function fetchHome() {
        isAppFetching.value = true;
        isAppFetching.value = false;
    }

    /**
     * Set the value of isAppFetching
     * @param value
     */
    function setIsAppFetching(value: boolean) {
        isAppFetching.value = value;
    }

    return {
        isAppFetching,
        isSmallScreen,
        isMediumScreen,
        isLargeScreen,
        isXLargeScreen,
        getIsAppFetching,
        fetchHome,
        setIsAppFetching,
    }
});
