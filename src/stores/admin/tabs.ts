import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {useAppHomeStore} from "../home";
import {useNotificationsStore} from "../notifications.ts";
import {useAuthStore} from "../auth.ts";

export interface Tab {
    name: string;
    title: string;
    to: string;
    active: boolean;
    id: string;
    pageId: string;
}

const BASE_URL = import.meta.env.VITE_API_URL as string;

export const useTabsStore = defineStore('tabsStore', () => {

    // state

    const tabs = ref<Tab[]>([
        {
            name: 'Home',
            title: 'Home',
            to: 'home',
            active: false,
            id: '1-home',
            pageId: '1',
        },
        // Settings
        {
            name: 'Settings',
            title: 'Settings',
            to: 'settings',
            active: false,
            id: '2-settings',
            pageId: '2',
        },
    ]);

    const activeTab = ref<Tab | null>(null);

    const openTabs = ref<Tab[]>([
        {
            name: 'Home',
            title: 'Home',
            to: 'home',
            active: false,
            id: '1-home',
            pageId: '1',
        },
        // Settings
        {
            name: 'Settings',
            title: 'Settings',
            to: 'settings',
            active: false,
            id: '2-settings',
            pageId: '2',
        },
    ]);


    // getters


    const getTabs = computed(() => tabs.value);
    const getActiveTab = computed(() => activeTab.value);
    const getOpenTabs = computed(() => openTabs.value);
    // const getTabByTo = (to: string) => tabs.value.find((tab) => tab.to === to);
    const getTabByTo = computed(() => (to: string) => tabs.value.find((tab) => tab.to === to));

    // actions

    async function fetchTabs() {
        const appHomeStore = useAppHomeStore();
        const notificationsStore = useNotificationsStore();
        const authStore = useAuthStore();

        appHomeStore.setIsAppFetching(true);

        try {
            const response = await fetch(`${BASE_URL}/pages/tabs/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${authStore.token}`,
                    'mode': 'cors',
                }
            });

            const res = await response.json();

            const {tabs, openTabs} = res.data;

            await setTabs(tabs);

            await setOpenTabs(tabs, openTabs);
        } catch (error) {
            console.error(error);
            notificationsStore.addNotification('An error occurred while fetching the tabs', 'error');
        } finally {
            // appHomeStore.setIsAppFetching(false);

            setTimeout(() => {
                appHomeStore.setIsAppFetching(false);
            }, 400);
        }
    }

    async function setTabs(tabsArg: Tab[]) {
        const newTabs = tabsArg.map((tab: any) => {
            return {
                name: tab['PageName'],
                title: tab['PageName'],
                to: tab['PageName'].toLowerCase().replace(' ', '-'),
                active: false,
                id: tab['tabId'],
                pageId: tab['PageId'],
            } as Tab;
        });

        // const newUniqueTabs = new Set([...tabs.value, ...newTabs]);

        const newUniqueTabs: Tab[] = [];

        newTabs.forEach((newTab) => {
            if (!tabs.value.some((tab) => tab.id === newTab.id)) {
                newUniqueTabs.push(newTab);
            }
        });

        tabs.value = [...tabs.value, ...newUniqueTabs];
    }

    async function addNewTab(rawTab: any) {
        const newTab = {
            name: rawTab['PageName'],
            title: rawTab['PageName'],
            to: rawTab['PageName'].toLowerCase().replace(' ', '-'),
            active: false,
            id: rawTab['tabId'],
            pageId: rawTab['PageId'],
        } as Tab;

        // add the tab to the tabs
        tabs.value.push(newTab);

        // set the active tab
        return setActiveTab(newTab.name)
            .then(() => {
                return newTab;
            });
    }

    /**
     * Only use this function when the tabs are already set
     * @param rawTabs
     * @param openTabsArg
     */
    async function setOpenTabs(rawTabs: any[], openTabsArg: any[]) {
        // create a new array of tabs from the tabs whose id is in the openTabs array
        let newRawTabs = rawTabs.filter((rawTab: any) => openTabsArg.some((openTab: any) => rawTab['tabId'] === openTab['TabId']));

        // add the Active property to the tabs that is in the openTabs array
        newRawTabs = newRawTabs.map((tab: any) => {
            return {
                ...tab,
                Active: openTabsArg.find((openTab: any) => tab['tabId'] === openTab['TabId'])?.Active,
            }
        });

        console.log('newRawTabs', newRawTabs)

        const newTabs = newRawTabs.map((tab: any) => {
            return {
                name: tab['PageName'],
                title: tab['PageName'],
                to: tab['PageName'].toLowerCase().replace(' ', '-'),
                active: tab.Active === 1,
                id: tab['tabId'],
                pageId: tab['PageId'],
            } as Tab;
        })

        // for each new tab, we'll check if it's already in the openTabs
        // if it is, we'll just replace the tab in the openTabs with the new tab
        // if it's not, we'll just add the new tab to the openTabs
        newTabs.forEach((newTab: Tab) => {
            const openTab = openTabs.value.find((openTab) => openTab.id === newTab.id);

            if (openTab) {
                openTab.active = newTab.active;
            } else {
                openTabs.value.push(newTab);
            }
        });
    }

    // function addNewOpenTab(rawTab: any) {
    //     const newTab = {
    //         name: rawTab['PageName'],
    //         title: rawTab['PageName'],
    //         to: rawTab['PageName'].toLowerCase().replace(' ', '-'),
    //         active: false,
    //         id: rawTab['tabId'],
    //         pageId: rawTab['PageId'],
    //     } as Tab;
    //
    //     // add the tab to the tabs
    //     openTabs.value.push(newTab);
    //
    //     // set the active tab
    //     setActiveTab(newTab.name);
    //
    //     // update the local storage
    //     return newTab;
    // }

    async function setActiveTab(tab_name: string) {
        // get the tab by id
        const tab: Tab | undefined = tabs.value.find((tab) => tab.name === tab_name);

        // set the active tab by first deactivating all tabs
        tabs.value.forEach((tab) => tab.active = false);

        // also deactivate all open tabs
        openTabs.value.forEach((tab) => tab.active = false);

        if (tab) {
            // set the active tab
            tab.active = true;

            // set the active tab
            activeTab.value = tab as Tab | null;

            // add the tab to the open tabs if it is not already there
            if (!openTabs.value.some((openTab: Tab) => openTab.name === tab.name)) {
                openTabs.value.push(tab);
            } else {
                const openTab = openTabs.value.find((openTab: Tab) => openTab.name === tab.name);

                if (openTab) {
                    openTab.active = true;
                }
            }

            // order the active tab first
            openTabs.value = openTabs.value.sort((a, b) => {
                if (a.active) {
                    return -1;
                } else if (b.active) {
                    return 1;
                } else {
                    return 0;
                }
            });
        }
    }

    async function updateActiveTab(tab_name: string) {
        // get the tab by id
        const tab = tabs.value.find((tab) => tab.name === tab_name);

        if (tab) {
            // if it's not the 'home' or 'settings' tab
            if (tab.name !== 'Home' && tab.name !== 'Settings') {
                const appHomeStore = useAppHomeStore();
                // const notificationStore = useNotificationsStore();

                appHomeStore.setIsAppFetching(true);

                await setActiveTab(tab.name);

                // try {
                //     const response = await fetch(`${BASE_URL}/pages/tabs/${tab.id}/`, {
                //         method: 'PATCH',
                //         body: JSON.stringify({
                //             msg: 'hello'
                //         }),
                //         headers: {
                //             'Content-Type': 'application/json'
                //         }
                //     });
                //
                //     const res = await response.json();
                //
                //     if (res.data === 'success') {
                //         // set the active tab
                //         await setActiveTab(tab.name);
                //     }
                // } catch (error) {
                //     console.error(error);
                //
                //     // notificationStore.addNotification('An error occurred while updating the active tab', 'error');
                // } finally {
                //     // appHomeStore.setIsAppFetching(false);
                //
                //     setTimeout(() => {
                //         appHomeStore.setIsAppFetching(false);
                //     }, 400);
                // }
            } else {
                // set the active tab
                setActiveTab(tab.name);
            }
        }
    }

    function setActiveTabByPageName(page_name: string) {
        // we need to get the tab by page name
        const tab = tabs.value.find((tab) => tab.to === page_name);

        if (tab) {
            // set the active tab
            setActiveTab(tab.name);
        }
    }

    async function closeTab(tab_name: string) {
        // get the tab by id
        const tab = tabs.value.find((tab) => tab.name === tab_name);

        // deactivate the tab
        if (tab) {
            // tab.active = false;
            //
            // // remove the tab from the open tabs
            // openTabs.value = openTabs.value.filter((openTab) => openTab.name !== tab.name);
            //
            // // remove the tab from the tabs
            // tabs.value = tabs.value.filter((tab) => tab.name !== tab.name);
            //
            // // check if only the home and settings tabs are left
            // if (openTabs.value.length === 2) {
            //     // set the home tab to active
            //     activeTab.value = openTabs.value[0];
            // } else {
            //     // set the active tab
            //     activeTab.value = openTabs.value[openTabs.value.length - 1];
            // }
            //
            // // set the open tabs to local storage
            // localStorage.setItem('openTabs', JSON.stringify(openTabs.value));
            //
            // // call setActiveTab
            // setActiveTab(activeTab.value?.name as string);

            const appHomeStore = useAppHomeStore();
            const notificationStore = useNotificationsStore();
            const authStore = useAuthStore();

            try {
                const response = await fetch(`${BASE_URL}/pages/tabs/${tab.id}/`, {
                    method: 'DELETE',
                    body: JSON.stringify({
                        msg: 'hello'
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `${authStore.token}`,
                    }
                });

                const res = await response.json();

                const {tabs, openTabs} = res.data;

                await setTabs(tabs);

                await setOpenTabs(tabs, openTabs);
            } catch (error) {
                console.error(error);

                notificationStore.addNotification('An error occurred while closing the tab', 'error');
            } finally {
                // appHomeStore.setIsAppFetching(false);

                setTimeout(() => {
                    appHomeStore.setIsAppFetching(false);
                }, 400);
            }
        }
    }

    return {
        fetchTabs,
        tabs,
        activeTab,
        openTabs,
        getTabs,
        getActiveTab,
        getOpenTabs,
        getTabByTo,
        setTabs,
        setOpenTabs,
        setActiveTab,
        addNewTab,
        updateActiveTab,
        setActiveTabByPageName,
        closeTab,
    }
});