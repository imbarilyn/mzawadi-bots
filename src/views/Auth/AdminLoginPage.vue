<script setup lang="ts">
import {useField} from "vee-validate";
import {useRouter} from "vue-router";
import {reactive, watch, ref} from "vue";
import {useAuthStore} from "../../stores/auth.ts";

const router = useRouter();
const authStore = useAuthStore();

const loginData = reactive({
  email: '',
  password: '',
});

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
        isLoadingResource.value = false;
        console.log(response);
        router.push({name: 'AdminHome'});
      })
      .catch((error) => {
        console.log(error);
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
        </div>

        <div class="mt-5">
          <form @submit.prevent="onLoginClick" class="my-4">
            <div class="grid gap-y-4">
              <div class="flex flex-col space-y-1">
                <div class="flex justify-between items-center">
                  <label class="label font-semibold text-sm" for="email">
                    Email
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