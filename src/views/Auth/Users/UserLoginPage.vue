<script lang="ts" setup>
import { useField } from 'vee-validate'
import { useRoute, useRouter } from 'vue-router'
import { onMounted, reactive, ref, watch } from 'vue'
import { googleTokenLogin } from 'vue3-google-login'
import { useAuthStore } from '../../../stores/auth'
import { useAdminHomeStore } from '../../../stores/admin/home'

const router = useRouter()
const authStore = useAuthStore()
const homeStore = useAdminHomeStore()

const route = useRoute()
const page = ref(route.query.pageId as string)

interface UserLoginPageProps {
  pageId: string
  chatbotId: string
}

const props = defineProps<UserLoginPageProps>()

const loginData = reactive({
  fullNames: '',
  phoneNo: '',
  memberNo: '',
  pageId: ''
})

onMounted(() => {
  loginData.pageId = props.pageId
})

const phoneNoValidator = (value: string) => {
  if (!value) {
    return 'Phone NUmber required'
  }

  // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phoneNoRegex = /^[0-9]{10}$/

  if (!phoneNoRegex.test(value)) {
    return 'Phone number must be valid'
  }

  if (value.length > 10 && value.length < 10) {
    return 'Phone number must be 10 digits'
  }

  return true
}

const {
  value: phoneNo,
  errorMessage: phoneNoErrorMessage,
  meta: phoneNoMeta
} = useField('phoneNo', phoneNoValidator)

watch(
  () => loginData.phoneNo,
  (value) => {
    phoneNo.value = value
  }
)

const fullNamesValidator = (value: string) => {
  if (!value) {
    return 'Full names required'
  }

  // if (value.length < 4) {
  //   return 'Password must be at least 4 characters';
  // }

  if (value.length < 3) {
    return 'Full names too short'
  }

  return true
}

const {
  value: fullNames,
  errorMessage: fullNamesErrorMessage,
  meta: fullNamesMeta
} = useField('fullName', fullNamesValidator)

watch(
  () => loginData.fullNames,
  (value) => {
    fullNames.value = value
  }
)

const memberNumberValidator = (value: string) => {
  if (!value) {
    return 'Member number is required'
  }
  return true
}

const {
  value: memberNumber,
  errorMessage: memberNumberErrorMessage,
  meta: memberNumberMeta
} = useField('memberNo', memberNumberValidator)

watch(
  () => loginData.memberNo,
  (value) => {
    memberNumber.value = value
  }
)

const BASE_URL = import.meta.env.VITE_API_URL as string

const loginWithGoogle = () => {
  googleTokenLogin()
    .then((response) => {
      console.log('Handle the response', response)

// const loginWithGoogle = () => {
//   googleTokenLogin()
//       .then((response) => {
//         console.log("Handle the response", response);
//
//         fetch(`${BASE_URL}/register/google`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             mode: "cors",
//           },
//           body: JSON.stringify({
//             ...response,
//           }),
//         })
//             .then(console.log)
//             .catch(console.error);
//
//         // get user info from response
//         return fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${response.access_token}`,
//           },
//           // body: JSON.stringify({
//           // get the user phone number
//           // 'scope': 'email profile openid https://www.googleapis.com/auth/user.phonenumbers.read',
//           // }),
//         });
//       })
//       .then((response) => {
//         console.log("Handle the response", response)
//         return response.json();
//       })
//       .then((userInfo) => {
//         console.log("User info", userInfo)
//         // use userInfo in your project
//       })
// }
//

const isLoadingResource = ref(false)
const loginFailed = ref(false)

const onLoginClick = () => {
  if (!fullNamesMeta.valid || !phoneNoMeta.valid) {
    return
  }

  loginFailed.value = false
  isLoadingResource.value = true
  // console.log(loginData)

  loginData.pageId = props.pageId as string
  console.log(loginData)

  //let's create account and post payload for user to use chatbot
  authStore
    .createAccount(loginData)

    .then((resp) => {
      console.log('resp- ', resp)
      if (resp.success) {
        console.log(resp.response?.pageOptions)
        router.push({
          name: 'chatbot-page',
          params: { pageId: props.pageId, chatbotId: props.chatbotId }
        })
      }
    })
    .catch((error) => {
      console.log(error)
    })
    .finally(() => {
      isLoadingResource.value = false
    })

  // authStore
  //   .adminLogin(loginData)
  //   .then((response) => {
  //     if (response.success) {
  //       if (response.pageIds) {
  //         // check if the user has access to this chatbot
  //         if (response.pageIds.includes(props.pageId)) {
  //           router.push({
  //             name: 'chatbot-page',
  //             params: { pageId: props.pageId, chatbotId: props.chatbotId }
  //           })
  //         } else {
  //           // the user may not have access
  //           router.push({ name: 'not-found' })
  //           // router.push({name: 'chatbot-page', params: {pageId: props.pageId, chatbotId: props.chatbotId}});
  //         }
  //       } else {
  //         // the user may be an admin
  //         router.push({ name: 'HomeAdmin' })
  //       }
  //     }
  //   })
  //   .catch((error) => {
  //     console.log(error)
  //   })
  //   .finally(() => {
  //     isLoadingResource.value = false
  //   })
}
</script>

<template>
  <main class="w-full mx-auto p-6 flex items-center justify-center h-screen">
    <div
      class="w-full md:w-6/12 lg:w-5/12 xl:w-4/12 px-4 md:px-2 lg:px-0 mt-7 bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700"
    >
      <div class="p-4 sm:p-7">
        <div class="text-center">
          <h1 class="block text-2xl font-bold text-gray-800 dark:text-white">Let's Chat</h1>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Fill in the form to access chatbot
            <!--            <router-link-->
            <!--              class="text-blue-600 decoration-2 hover:underline font-medium dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"-->
            <!--              :to="`/auth/users/${chatbotId}/${pageId}/signup`"-->
            <!--            >-->
            <!--              Create account-->
            <!--            </router-link>-->
          </p>
        </div>

        <div class="mt-5">
          <!-- Form -->
          <form class="my-4" @submit.prevent="onLoginClick">
            <div class="grid gap-y-4">
              <div class="flex flex-col space-y-1">
                <div class="flex justify-between items-center">
                  <label class="label font-semibold text-sm" for="email"> Full Names </label>
                  <!--                  <router-link-->
                  <!--                      class="text-sm text-blue-600 decoration-2 hover:underline font-medium dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"-->
                  <!--                      to="forgot-password">Forgot password?-->
                  <!--                  </router-link>-->
                </div>
                <input
                  id="email"
                  v-model="loginData.fullNames"
                  :class="{
                    'input-error': fullNamesMeta.validated && !fullNamesMeta.valid,
                    'input-primary': fullNamesMeta.validated && fullNamesMeta.valid
                  }"
                  class="input input-primary input-bordered w-full text-sm"
                  placeholder="John Doe"
                  type="text"
                />
                <small
                  v-if="fullNamesMeta.validated && !fullNamesMeta.valid"
                  class="text-sm text-rose-500"
                >
                  {{ fullNamesErrorMessage }}
                </small>
              </div>

              <div class="flex flex-col space-y-1">
                <label class="label font-semibold text-sm" for="password">Phone Number</label>
                <input
                  id="phoneNumber"
                  v-model="loginData.phoneNo"
                  :class="{
                    'input-error': phoneNoMeta.validated && !phoneNoMeta.valid,
                    'input-primary': phoneNoMeta.validated && phoneNoMeta.valid
                  }"
                  class="input input-primary input-bordered w-full text-sm"
                  placeholder="Phone Number"
                  type="text"
                />
                <small
                  v-if="phoneNoMeta.validated && !phoneNoMeta.valid"
                  class="text-sm text-rose-500"
                >
                  {{ phoneNoErrorMessage }}
                </small>
              </div>

              <div class="flex flex-col space-y-1">
                <label class="label font-semibold text-sm" for="password">Member Number</label>
                <input
                  id="text"
                  v-model="loginData.memberNo"
                  :class="{
                    'input-error': memberNumberMeta.validated && !memberNumberMeta.valid,
                    'input-primary': memberNumberMeta.validated && memberNumberMeta.valid
                  }"
                  class="input input-primary input-bordered w-full text-sm"
                  placeholder="Member Number"
                  type="text"
                />
                <small
                  v-if="memberNumberMeta.validated && !memberNumberMeta.valid"
                  class="text-sm text-rose-500"
                >
                  {{ memberNumberErrorMessage }}
                </small>
              </div>

              <div class="flex flex-col space-y-1 my-1">
                <button
                  :disabled="isLoadingResource"
                  class="btn btn-primary btn-sm md:btn-md normal-case text-xs md:text-sm w-full"
                  type="submit"
                  @click="onLoginClick"
                >
                  <span
                    v-if="isLoadingResource"
                    class="loading loading-md loading-spinner text-neutral-400"
                  ></span>
                  Get Started
                </button>
              </div>
            </div>
          </form>
          <!-- End Form -->
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped></style>
