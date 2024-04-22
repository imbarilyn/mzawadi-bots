import {defineStore} from "pinia";
import {computed, type Ref, ref} from "vue";
import {useStorage} from "@vueuse/core";
import moment from "moment";
import {jwtDecode} from "jwt-decode";

// import {ResetPasswordPayload} from "../views/auth/ResetPasswordPage.vue";

export interface UserInfo {
    name?: string;
    phone?: string;
    email?: string;
    role?: string;
}

export interface CreateAccountPayload {
    name: string;
    phone: string;
    email?: string;
    newPassword: string;
    confirmPassword: string;
    pageId?: string;
}

export interface LoginPayload {
    email: string;
    password: string;
    pageId?: string
}

export interface LoginResponse {
    result: string;
    token: string;
    exp: string;
    page_ids: { ChatbotId: string }[];
}

// const BASE_URL = import.meta.env.VITE_API_URL as string;
const USERNAME = import.meta.env.VITE_DEFAULT_USERNAME as string;
const PASSWORD = import.meta.env.VITE_DEFAULT_PASSWORD as string;
const PHONE = import.meta.env.VITE_DEFAULT_PHONE as string;
const BASE_URL = import.meta.env.VITE_API_URL as string;

export const useAuthStore = defineStore('auth', () => {

    // state

    const isLoggedIn = ref(false);
    const user: Ref<UserInfo | null> = ref(null);
    const dummyUser = ref({
        username: USERNAME,
        password: PASSWORD,
        phone: PHONE,
    });
    const token = useStorage('token', '');
    const tokenExpiry = useStorage('tokenExpiry', '');
    const hasEverLoggedIn = useStorage('_h_eve_lgg_in_', false);

    const createProfilePhone = ref('');

    // getters

    const getIsLoggedIn = computed(() => isLoggedIn.value);
    const getUser = computed(() => user.value);
    const getDummyUser = computed(() => dummyUser.value);
    const getToken = computed(() => token.value);
    const userIsLoggedIn = computed(() => () => {
        const expiry = moment(tokenExpiry.value);

        const now = moment();

        const isValid = Boolean(token.value) && now.isBefore(expiry);

        setIsLoggedIn(isValid)

        if (!isValid) {
            logout();
        }

        return isValid;
    })

    // actions

    async function createProfile(profileData: UserInfo) {
        const response = await fetch(`${BASE_URL}/create_profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'cors',
            body: JSON.stringify({
                names: profileData.name,
                phone: profileData.phone,
                email: profileData.email,
            }),
        });

        const data = await response.json();

        const {result, message, profile} = data;

        if (result === 'ok' && profile === false) {
            createProfilePhone.value = profileData.phone;

            // if (!profile) {
            //
            // }

            return {
                success: true,
                error: null,
            }
        } else {
            return {
                error: message,
                success: false,
            }
        }
    }

    async function createAccount(createAccountPayload: CreateAccountPayload) {
        try {
            const response = await fetch(`${BASE_URL}/admin/create-account/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
                body: JSON.stringify({
                    name: createAccountPayload.name,
                    phone: createAccountPayload.phone,
                    email: createAccountPayload.email,
                    pageId: createAccountPayload.pageId,
                    password: createAccountPayload.newPassword,
                }),
            });

            const data = await response.json();

            const {result, message} = data;

            if (result === 'ok') {
                const {token, exp} = data;

                setToken(token);

                tokenExpiry.value = exp;

                setUserInfo();

                hasEverLoggedIn.value = true;

                return {
                    success: true,
                    error: null,
                }
            }

            return {
                error: message,
                success: false,
            }
        } catch (e) {
            console.log('error creating profile', e);

            return {
                error: 'Error creating profile',
                success: false,
            }
        }
    }

    async function adminLogin(loginPayload: LoginPayload) {
        try {
            const response = await fetch(`${BASE_URL}/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
                body: JSON.stringify({
                    email: loginPayload.email,
                    password: loginPayload.password,
                    pageId: loginPayload?.pageId
                }),
            });

            const data = await response.json();

            const {result, page_ids} = data as LoginResponse;

            if (result === 'ok') {
                const {token, exp} = data as LoginResponse;

                setToken(token);

                tokenExpiry.value = exp;

                setUserInfo();

                hasEverLoggedIn.value = true;

                return {
                    success: true,
                    error: null,
                    pageIds: page_ids.map(({ChatbotId}) => ChatbotId),
                }
            }

            return {
                error: 'Invalid username or password',
                success: false,
            }
        } catch (e) {
            console.log('error logging in', e);

            return {
                error: 'Error logging in',
                success: false,
            }
        }
    }


    // async function userLogin(loginPayload: UserLoginPayload) {
    //     try {
    //         const response = await fetch(`${BASE_URL}/login/user/`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             mode: 'cors',
    //             body: JSON.stringify(loginPayload),
    //         });
    //
    //         const data = await response.json();
    //
    //         const {result} = data;
    //
    //         if (result === 'ok') {
    //             const {token, exp} = data;
    //
    //             setToken(token);
    //
    //             tokenExpiry.value = exp;
    //
    //             setUserInfo();
    //
    //             hasEverLoggedIn.value = true;
    //
    //             return true;
    //         }
    //
    //         return false;
    //     } catch (e) {
    //         console.log('error logging in', e);
    //
    //         return false;
    //     }
    //
    // }

    async function forgotPassword(phone: string) {
        const response = await fetch(`${BASE_URL}/forgot/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'cors',
            body: JSON.stringify({
                phone,
            }),
        });

        const data = await response.json();

        const {result, data: message} = data;

        if (result === 'ok') {
            createProfilePhone.value = phone;
            return {
                success: true,
                error: null,
            }
        } else {
            return {
                error: message,
                success: false,
            }
        }
    }

    // async function resetPassword(resetPasswordPayload: ResetPasswordPayload) {
    //     const response = await fetch(`${BASE_URL}/change_password`, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         mode: 'cors',
    //         body: JSON.stringify({
    //             phone: createProfilePhone.value,
    //             password: resetPasswordPayload.newPassword,
    //             new_password: resetPasswordPayload.confirmPassword,
    //         }),
    //     });
    //
    //     const data = await response.json();
    //
    //     const {result, message} = data;
    //     if (result === 'ok') {
    //         return {
    //             success: true,
    //             error: null,
    //         }
    //     } else {
    //         return {
    //             error: message,
    //             success: false,
    //         }
    //     }
    // }

    function setUserInfo() {
        const decode = jwtDecode(token.value);

        console.log('decode', decode);

        const {email, name, role, phone} = decode as UserInfo;

        setUser({name: name ?? '', phone, email, role});
    }

    function getUserInfo() {
        if (userIsLoggedIn.value()) {
            const decode = jwtDecode(token.value);

            const {phone, name, email, role} = decode as UserInfo;

            return {name: name ?? '', phone: phone ?? '', email: email ?? '', role: role ?? ''};
        } else {
            return null;
        }
    }

    function getUserRole() {
        if (userIsLoggedIn.value()) {
            const decode = jwtDecode(token.value);

            const {role} = decode as UserInfo;

            return parseInt(role ?? '0') === 0 ? 'admin' : 'user';
        } else {
            return null;
        }
    }

    function userIsAdmin() {
        return getUserRole() === 'admin';
    }

    function setIsLoggedIn(value: boolean) {
        isLoggedIn.value = value;
    }

    function setUser(value: any) {
        user.value = value;
    }

    function logout() {
        isLoggedIn.value = false;
        user.value = null;
        token.value = null;
    }

    function setToken(value: string) {
        token.value = value;
    }

    function resetToken() {
        token.value = null;
    }

    return {
        isLoggedIn,
        user,
        createProfilePhone,
        getIsLoggedIn,
        getUser,
        token,
        getToken,
        getUserRole,
        userIsAdmin,
        setIsLoggedIn,
        setUser,
        logout,
        setToken,
        resetToken,
        dummyUser,
        getDummyUser,
        createProfile,
        createAccount,
        adminLogin,
        userIsLoggedIn,
        hasEverLoggedIn,
        getUserInfo,
        forgotPassword,
        // resetPassword,
    }
});
