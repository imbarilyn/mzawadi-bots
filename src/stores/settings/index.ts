import {defineStore} from "pinia";

export interface SettingsTab {
    name: string;
    title: string;
    to: string;
    active: boolean;
    component: string;
}

export const useSettingsTabStore = defineStore({
    id: 'settingsTab',
    state: () => ({
        settingsTabs: [
            {
                name: 'general',
                title: 'General',
                to: 'general',
                active: true,
                component: 'GeneralSettings',
            },
            {
                name: 'theme',
                title: 'Theme',
                to: 'theme',
                active: false,
                component: 'ThemeSettings',
            },
            {
                name: 'branding',
                title: 'Branding',
                to: 'branding',
                active: false,
                component: 'BrandingSettings',
            }
        ] as SettingsTab[],
        activeTab: 'general',
    }),
    getters: {
        getActiveTab: (state) => {
            return state.settingsTabs.find((tab) => tab.active);
        },
        getSettingsTabs: (state) => state.settingsTabs,
    },
    actions: {
        setActiveTab(tabName: string) {
            tabName = tabName.toLowerCase();
            this.activeTab = tabName;

            // deactivate all tabs
            this.settingsTabs.forEach((tab) => {
                tab.active = false;
            });

            // activate the tab
            const tab = this.settingsTabs.find((tab) => tab.name === tabName);

            if (tab) {
                tab.active = true;
            }

            // console.log('setActiveTab', tabName);
        },
    }
});