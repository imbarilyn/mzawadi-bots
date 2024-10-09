<script lang="ts" setup>
import {useField} from 'vee-validate'
import {useRoute, useRouter} from 'vue-router'
import {computed, onMounted, reactive, ref, watch} from 'vue'
import {useAuthStore} from '../../../stores/auth'
import {useAdminHomeStore} from '../../../stores/admin/home'
import DialogModal from "@/components/DialogModal.vue";
import {useNotificationsStore} from "@/stores/notifications";
import {useChatbotStore} from "@/stores/chatbot";
import MyRadioGroup from "@/components/form/MyRadioGroup.vue";

const router = useRouter()
const authStore = useAuthStore()
const homeStore = useAdminHomeStore()
const notificationStore = useNotificationsStore()
const chatbotStore = useChatbotStore()

const route = useRoute()
const page = ref(route.query.pageId as string)

interface UserLoginPageProps {
  // pageId: string
  // chatbotId: string
  cbName: string
}

const props = defineProps<UserLoginPageProps>()

const loginData = reactive({
  fullNames: '',
  phoneNo: '',
  memberNo: '',
  pageSlug: ''
})

onMounted(() => {
  loginData.pageSlug = props.cbName
})

const phoneNoValidator = (value: string) => {
  if (!value) {
    return 'Phone number required'
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
  const specialCharacterRegExp = /[!@#$%^&*(),.?":{}|<>]/
  const emailRegExp = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
  if (!value) {
    return 'Full names required'
  }

  if (emailRegExp.test(value)) {
    return 'Full names should not be an email'
  }

  if (specialCharacterRegExp.test(value)) {
    return 'Full names should not contain special characters'
  }


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
  if (isMember.value) {
    if (!value) {
      return 'Member number is required'
    }
    if (value.length < 3) {
      return 'Member number too short'
    }
    return true

  }
  return false
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

// const loginWithGoogle = () => {
//   googleTokenLogin()
//       .then((response) => {
//         console.log('Handle the response', response)
//
//         fetch(`${BASE_URL}/register/google`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             mode: 'cors'
//           },
//           body: JSON.stringify({
//             ...response
//           })
//         })
//             .then(console.log)
//             .catch(console.error)
//
//         // get user info from response
//         return fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
//           method: 'POST',
//           headers: {
//             Authorization: `Bearer ${response.access_token}`
//           }
//           // body: JSON.stringify({
//           // get the user phone number
//           // 'scope': 'email profile openid https://www.googleapis.com/auth/user.phonenumbers.read',
//           // }),
//         })
//       })
//       .then((response) => {
//         console.log('Handle the response', response)
//         return response.json()
//       })
//       .then((userInfo) => {
//         console.log('User info', userInfo)
//         // use userInfo in your project
//       })
// }

const isLoadingResource = ref(false)
const loginFailed = ref(false)

const everythingOkay = computed(() => {
      // if everything is okay and the user is a member they must provide their member number for validation
      if (isMembershipSelected.value && isMember.value) {
        return fullNamesMeta.valid && fullNamesMeta.validated
            && phoneNoMeta.valid && phoneNoMeta.validated
            && memberNumberMeta.valid && memberNumberMeta.validated
      }
      // if everything is okay but the user has not selected membership type
      else if (isMembershipSelected.value && !isMember.value) {
        return fullNamesMeta.valid && fullNamesMeta.validated
            && phoneNoMeta.valid && phoneNoMeta.validated
      }
      notificationStore.addNotification('Please select membership type', 'error')
      return false
    }
)
const onLoginClick = () => {


  if (!everythingOkay.value) {
    console.log(loginData)
    console.log('something is wrong')

    return
  } else {
    loginFailed.value = false
    isLoadingResource.value = true
    loginData.pageSlug = props.cbName as string
    console.log(loginData)

    //let's create account and post payload for user to use chatbot
    authStore
        .createAccount(loginData)
        .then((resp) => {
          console.log('resp- ', resp)
          if (resp?.success) {
            // chatbotStore.pgSlug = resp.response.pageContent.pageSlug
            console.log(authStore.token)
            console.log(resp.response?.pageOptions)
            router.push({
              name: 'newChat',
              params: {cbName: props.cbName}
            })
          } else {
            notificationStore.addNotification('An error has occurred kindly try again', 'error')
          }
        })
        .catch((error) => {
          console.log(error)
          notificationStore.addNotification('An error occurred has kindly try again', 'error')
        })
        .finally(() => {
          isLoadingResource.value = false
        })
  }
}

const chatbotUserType = [
  {
    name: "I'm not a member",
    icon: 'no_accounts',
    value: false,
    description: "I want access to chat"
  },
  {
    name: "I'm a member",
    icon: 'account_circle',
    value: true,
    description: 'I want access to chat'
  }
]
// a chatbot user must select the membership type
const isMembershipSelected = ref<boolean>(false)
// if a chatbot user is a member of sacco they then should put in their member number
const isMember = ref(false)
const selectChatbotUser = (val: any) => {
  if (val) {
    isMembershipSelected.value = true
    isMember.value = val.value
  }

  console.log('The user is --', val.value)

}

// if user is a member of sacco they should/must put in their member number


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
                  <label class="label font-semibold text-sm" for="fullName"> Full Names </label>
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
                    required
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
                    required
                    type="text"
                />
                <small
                    v-if="phoneNoMeta.validated && !phoneNoMeta.valid"
                    class="text-sm text-rose-500"
                >
                  {{ phoneNoErrorMessage }}
                </small>
              </div>
              <div>
                <MyRadioGroup
                    :chatbot-user-type="chatbotUserType"
                    @change="selectChatbotUser"/>
              </div>

              <Transition name="bounce">
                <div v-if="isMember" class="flex flex-col space-y-1">
                  <label class="label font-semibold text-sm" for="password">Member Number</label>
                  <input
                      id="text"
                      v-model="loginData.memberNo"
                      :class="{
                                  'input-error': memberNumberMeta.validated && !memberNumberMeta.valid,
                                  'input-primary': memberNumberMeta.validated && memberNumberMeta.valid
                                }"
                      :required="isMember"
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

              </Transition>


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

                <!--                <button-->
                <!--                  :disabled="isLoadingResource"-->
                <!--                  class="btn btn-primary btn-sm md:btn-md normal-case text-xs md:text-sm w-full"-->
                <!--                  type="submit"-->
                <!--                  @click="loginWithGoogle"-->
                <!--                >-->
                <!--                  <span-->
                <!--                    v-if="isLoadingResource"-->
                <!--                    class="loading loading-md loading-spinner text-neutral-400"-->
                <!--                  ></span>-->
                <!--                  Login with Google-->
                <!--                </button>-->
              </div>
            </div>
          </form>
          <!-- End Form -->
        </div>
      </div>
    </div>
  </main>
  <teleport to="body">
    <DialogModal>

    </DialogModal>
  </teleport>
</template>

<style scoped>
.bounce-enter-active {
  animation: bounce-in 0.5s
}

.bounce-leave-active {
  animation: bounce-in 0.5s reverse
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.05);

  }
  100% {
    transform: scale(1);
  }

}
</style>
