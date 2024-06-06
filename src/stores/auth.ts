import { defineStore } from 'pinia'
import { computed, type Ref, ref } from 'vue'
import { useStorage } from '@vueuse/core'
import moment from 'moment'
import { jwtDecode } from 'jwt-decode'
import { usePageContentStore } from '@/stores/admin/page-data'

// import {ResetPasswordPayload} from "../views/
// auth/ResetPasswordPage.vue";

export interface UserInfo {
  fullNames?: string
  phoneNo?: string
  memberNo?: string
  role?: string
  userId?: string
  conversationId?: string
  iconName?: string
}

export interface CreateAccountPayload {
  fullNames: string
  phoneNo: string
  memberNo: string
  pageId?: string
  pageSlug: string
}

export interface LoginPayload {
  email: string
  password: string
  pageId?: string
}

export interface LoginResponse {
  result: string
  token: string
  exp: string
  page_ids: { ChatbotId: string }[]
}

// const BASE_URL = import.meta.env.VITE_API_URL as string;
const USERNAME = import.meta.env.VITE_DEFAULT_USERNAME as string
const PASSWORD = import.meta.env.VITE_DEFAULT_PASSWORD as string
const PHONE = import.meta.env.VITE_DEFAULT_PHONE as string
const BASE_URL = import.meta.env.VITE_API_URL as string

export const useAuthStore = defineStore('auth', () => {
  // state

  const isLoggedIn = ref(false)
  const user: Ref<UserInfo | null> = ref(null)
  // const chatBotUser: Ref<UserInfo | null> = ref(null)
  const chatBotUser = useStorage('chatBotUser', '')
  // const chatBotUser = ref('')
  const dummyUser = ref({
    username: USERNAME,
    password: PASSWORD,
    phone: PHONE
  })
  const token = useStorage('token', '')
  const tokenExpiry = useStorage('tokenExpiry', '')
  const hasEverLoggedIn = useStorage('_h_eve_lgg_in_', false)
  const userRole = useStorage('userRole', '')
  const memberData = useStorage('memberData', '')

  const createProfilePhone = ref('')
  const conversationId = ref('')

  // getters

  const getIsLoggedIn = computed(() => isLoggedIn.value)
  const getUser = computed(() => user.value)
  const getDummyUser = computed(() => dummyUser.value)
  const getToken = computed(() => token.value)
  const getMemberData = computed(() => {
    if (memberData.value) {
      return JSON.parse(memberData.value) as CreateAccountPayload
    } else {
      return {} as CreateAccountPayload
    }
  })
  const adminIsLoggedIn = computed(() => {
    const expiry = moment(tokenExpiry.value)

    const now = moment()

    const isValid = Boolean(token.value) && now.isBefore(expiry)

    setIsLoggedIn(isValid)

    if (!isValid) {
      logout()
    }

    return isValid
  })

  // actions

  async function createProfile(profileData: any) {
    const response = await fetch(`${BASE_URL}/create_profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      body: JSON.stringify({
        names: profileData.fullNames,
        phone: profileData.phoneNo,
        email: profileData.memberNo
      })
    })

    const data = await response.json()

    const { result, message, profile } = data

    if (result === 'ok' && profile === false) {
      if (profileData.phoneNo) createProfilePhone.value = profileData.phoneNo

      // if (!profile) {
      //
      // }

      return {
        success: true,
        error: null
      }
    } else {
      return {
        error: message,
        success: false
      }
    }
  }

  async function createAccount(createAccountPayload: CreateAccountPayload) {
    try {
      const response = await fetch(`${BASE_URL}/pages/user-data/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({
          fullNames: createAccountPayload.fullNames,
          phoneNo: createAccountPayload.phoneNo,
          memberNo: createAccountPayload.memberNo,
          pageSlug: createAccountPayload.pageSlug
        })
      })

      const resp = await response.json()
      console.log('login data', resp)

      const { result, data, conversationId, pageContent, pageOptions, iconName } = resp
      // conversationId.value = resp.conversationId

      if (result === 'ok') {
        // const { token, exp } = resp
        // console.log(result)
        //
        // setToken(token)
        //
        // tokenExpiry.value = exp

        // setUserInfo()
        // conversationId.value = conversationId

        const pageContentStore = usePageContentStore()
        pageContentStore.setPageContentItems([pageOptions], pageContent)

        setUserDetails({
          fullNames: createAccountPayload.fullNames,
          phoneNo: createAccountPayload.phoneNo,
          memberNo: createAccountPayload.memberNo,
          role: 'user',
          conversationId: conversationId,
          iconName: iconName
        } as UserInfo)
        console.log(user.value)

        hasEverLoggedIn.value = true

        userRole.value = 'user'

        return {
          success: true,
          error: null,
          response: { pageContent, pageOptions }
        }
      } else {
        console.log('error in accessing chat bot')
        return {
          error: data,
          success: false
        }
      }
    } catch (e) {
      console.log('error creating profile', e)

      return {
        error: 'Error creating profile',
        success: false
      }
    }
  }

  async function adminLogin(loginPayload: LoginPayload) {
    try {
      const response = await fetch(`${BASE_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({
          email: loginPayload.email,
          password: loginPayload.password,
          pageId: loginPayload?.pageId
        })
      })

      const data = await response.json()
      console.log(data)

      const { result, page_ids } = data as LoginResponse

      if (result === 'ok') {
        const { token, exp } = data as LoginResponse

        setToken(token)

        tokenExpiry.value = exp

        setUserInfo()

        hasEverLoggedIn.value = true

        userRole.value = 'admin'

        return {
          success: true,
          error: null,
          pageIds: page_ids.map(({ ChatbotId }) => ChatbotId)
        }
      } else {
        return {
          error: 'Invalid credentials',
          success: false
        }
      }
    } catch (e) {
      console.log('error logging in', e)

      return {
        error: 'Error logging in',
        success: false
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
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      body: JSON.stringify({
        phone
      })
    })

    const data = await response.json()

    const { result, data: message } = data

    if (result === 'ok') {
      createProfilePhone.value = phone
      return {
        success: true,
        error: null
      }
    } else {
      return {
        error: message,
        success: false
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
    const decode = jwtDecode(token.value)

    console.log('decode', decode)

    const { fullNames, memberNo, phoneNo, role, userId } = decode as UserInfo

    setUser({ fullNames: fullNames ?? '', phoneNo, memberNo, role, userId })
  }

  function setUserDetails(usr: UserInfo) {
    chatBotUser.value = JSON.stringify({
      fullNames: usr.fullNames ?? '',
      phoneNo: usr.phoneNo ?? '',
      memberNo: usr.memberNo ?? '',
      role: usr.role ?? '',
      conversationId: usr.conversationId ?? '',
      iconName: usr.iconName ?? ''
      // userId: userId ?? ''
    })
  }

  function getUserInfo() {
    if (adminIsLoggedIn.value) {
      const decode = jwtDecode(token.value)

      const { fullNames, memberNo, phoneNo, role, userId } = decode as UserInfo

      return {
        fullNames: fullNames ?? '',
        phoneNo: phoneNo ?? '',
        memberNo: memberNo ?? '',
        role: role ?? '',
        userId: userId ?? ''
      }
    } else {
      return null
    }
  }

  function getUserRole() {
    if (adminIsLoggedIn.value) {
      const decode = jwtDecode(token.value)

      const { role } = decode as UserInfo

      return parseInt(role ?? '0') === 0 ? 'admin' : 'user'
    } else {
      return null
    }
  }

  function userIsAdmin() {
    return getUserRole() === 'admin'
  }

  function setIsLoggedIn(value: boolean) {
    isLoggedIn.value = value
  }

  function setUser(value: any) {
    user.value = value
    console.log(user.value)
  }

  function logout() {
    isLoggedIn.value = false
    user.value = null
  }

  function logoutAdmin() {
    isLoggedIn.value = false
    token.value = null
  }

  function setToken(value: string) {
    token.value = value
  }

  function resetToken() {
    token.value = null
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
    adminIsLoggedIn: adminIsLoggedIn,
    hasEverLoggedIn,
    getUserInfo,
    forgotPassword,
    chatBotUser,
    userRole,
    conversationId,
    logoutAdmin
    // resetPassword,
  }
})
