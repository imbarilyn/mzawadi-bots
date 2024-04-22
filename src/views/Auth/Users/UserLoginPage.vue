<script setup lang="ts">
import {useField} from "vee-validate";
import {useRouter} from "vue-router";
import {reactive, watch, ref, onMounted} from "vue";
// import {googleTokenLogin} from "vue3-google-login"
import {useAuthStore} from "../../../stores/auth.ts";

const router = useRouter();
const authStore = useAuthStore();

// const route = useRoute();
// const pageId = ref(route.query.pageId as string)

interface UserLoginPageProps {
  pageId: string;
  chatbotId: string
}

const props = defineProps<UserLoginPageProps>();

const loginData = reactive({
  email: '',
  password: '',
  pageId: '',
});

onMounted(() => {
  loginData.pageId = props.pageId
})

const emailValidator = (value: string) => {
  if (!value) {
    return 'Email is required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(value)) {
    return 'Email must be valid';
  }

  if (value.length > 50) {
    return 'Email must be less than 50 characters';
  }

  return true;
};

const {
  value: email,
  errorMessage: emailErrorMessage,
  meta: emailMeta,
} = useField('email', emailValidator);

watch(() => loginData.email, (value) => {
  email.value = value;
});


const passwordValidator = (value: string) => {
  if (!value) {
    return 'Password is required';
  }

  // if (value.length < 4) {
  //   return 'Password must be at least 4 characters';
  // }

  if (value.length > 50) {
    return 'Password must be less than 50 characters';
  }

  return true;
};

const {
  value: password,
  errorMessage: passwordErrorMessage,
  meta: passwordMeta,
} = useField('password', passwordValidator);

watch(() => loginData.password, (value) => {
  password.value = value;
});

// const BASE_URL = import.meta.env.VITE_API_URL as string;

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

const isLoadingResource = ref(false);
const loginFailed = ref(false);

const onLoginClick = () => {
  if (!emailMeta.valid || !passwordMeta.valid) {
    return;
  }

  loginFailed.value = false;
  isLoadingResource.value = true;


  authStore.adminLogin(loginData)
      .then((response) => {
        if (response.success) {
          if (response.pageIds) {
            // check if the user has access to this chatbot
            if (response.pageIds.includes(props.pageId)) {
              router.push({name: 'chatbot-page', params: {pageId: props.pageId, chatbotId: props.chatbotId}});
            } else {
              // the user may not have access
              router.push({name: 'not-found'});
              // router.push({name: 'chatbot-page', params: {pageId: props.pageId, chatbotId: props.chatbotId}});
            }
          } else {
            // the user may be an admin
            router.push({name: 'HomeAdmin'});
          }
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        isLoadingResource.value = false;
      })
};

</script>

<template>
  <main class="w-full mx-auto p-6 flex items-center justify-center h-screen">
    <div
        class="w-full md:w-6/12 lg:w-5/12 xl:w-4/12 px-4 md:px-2 lg:px-0 mt-7 bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <div class="p-4 sm:p-7">
        <div class="text-center">
          <h1 class="block text-2xl font-bold text-gray-800 dark:text-white">Login</h1>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Don't have an account yet?
            <router-link
                class="text-blue-600 decoration-2 hover:underline font-medium dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                :to="`/auth/users/${chatbotId}/${pageId}/signup`">
              Create account
            </router-link>
          </p>
        </div>

        <div class="mt-5">
          <!-- Form -->
          <form @submit.prevent="onLoginClick" class="my-4">
            <div class="grid gap-y-4">
              <div class="flex flex-col space-y-1">
                <div class="flex justify-between items-center">
                  <label class="label font-semibold text-sm" for="email">
                    Email Address
                  </label>
                  <!--                  <router-link-->
                  <!--                      class="text-sm text-blue-600 decoration-2 hover:underline font-medium dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"-->
                  <!--                      to="forgot-password">Forgot password?-->
                  <!--                  </router-link>-->
                </div>
                <input
                    id="email"
                    v-model="loginData.email"
                    :class="{'input-error': (emailMeta.validated && !emailMeta.valid), 'input-primary': emailMeta.validated && emailMeta.valid}"
                    class="input input-primary input-bordered w-full text-sm" placeholder="Email" type="text"/>
                <small v-if="(emailMeta.validated && !emailMeta.valid)"
                       class="text-sm text-rose-500">
                  {{ emailErrorMessage }}
                </small>
              </div>

              <div class="flex flex-col space-y-1">
                <label class="label font-semibold text-sm" for="password">
                  Password
                </label>
                <input
                    id="password"
                    v-model="loginData.password"
                    :class="{'input-error': (passwordMeta.validated && !passwordMeta.valid), 'input-primary': passwordMeta.validated && passwordMeta.valid}"
                    class="input input-primary input-bordered w-full text-sm" placeholder="Password" type="password"/>
                <small v-if="(passwordMeta.validated && !passwordMeta.valid)"
                       class="text-sm text-rose-500">
                  {{ passwordErrorMessage }}
                </small>
              </div>

              <div class="flex flex-col space-y-1 my-1">
                <button @click="onLoginClick" :disabled="isLoadingResource"
                        type="submit" class="btn btn-primary btn-sm md:btn-md normal-case text-xs md:text-sm w-full">
                  <span v-if="isLoadingResource" class="loading loading-md loading-spinner text-neutral-400"></span>
                  Sign
                  in
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

<style scoped>

</style>