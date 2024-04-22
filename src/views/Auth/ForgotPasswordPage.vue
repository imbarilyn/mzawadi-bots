<script setup lang="ts">
import {useField} from "vee-validate";
import {reactive, watch} from "vue";

// const router = useRouter();

const forgotPasswordData = reactive({
  email: '',
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

watch(() => forgotPasswordData.email, (value) => {
  email.value = value;
});

</script>

<template>
  <main class="w-full mx-auto p-6 flex items-center justify-center h-screen">
    <div class="w-full md:w-6/12 lg:w-5/12 xl:w-4/12 px-4 md:px-2 lg:px-0 mt-7 bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <div class="p-4 sm:p-7">
        <div class="text-center">
          <h1 class="block text-2xl font-bold text-gray-800 dark:text-white">Forgot password?</h1>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Remember your password?
            <router-link
                class="text-blue-600 decoration-2 hover:underline font-medium dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                to="login">
              Sign in here
            </router-link>
          </p>
        </div>

        <div class="mt-5 w-full">
          <!-- Form -->
          <form class="w-full">
            <div class="grid gap-y-4 w-full">
              <div class="flex flex-col space-y-1 w-full">
                <div class="flex justify-between items-center">
                  <label class="label font-semibold text-sm" for="email">
                    Email
                  </label>
                </div>
                <input
                    id="email"
                    v-model="forgotPasswordData.email"
                    :class="{'input-error': (emailMeta.validated && !emailMeta.valid), 'input-primary': emailMeta.validated && emailMeta.valid}"
                    class="input input-primary input-bordered w-full text-sm" placeholder="Email" type="text"/>
                <small v-if="(emailMeta.validated && !emailMeta.valid)"
                       class="text-sm text-rose-500">
                  {{ emailErrorMessage }}
                </small>
              </div>

              <button type="submit"
                      class="btn btn-primary btn-sm md:btn-md normal-case text-xs md:text-sm w-full">
                Reset password
              </button>
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