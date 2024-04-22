<script setup lang="ts">
import {computed, reactive, ref, watch} from "vue";
import {CreateAccountPayload, useAuthStore} from "../../../stores/auth.ts";
import {useField} from "vee-validate";
import {useRouter} from "vue-router";

interface UserSignPageProps {
  pageId: string;
  chatbotId: string
}

const authStore = useAuthStore();
const props = defineProps<UserSignPageProps>();
const router = useRouter();

const signUpData = reactive<CreateAccountPayload>({
  name: '',
  email: '',
  phone: '',
  newPassword: '',
  confirmPassword: '',
  pageId: props.pageId
});

const nameValidator = (value: string) => {

  if (!value) {
    return 'Name is required';
  }

  if (value.length < 3) {
    return 'Name must be at least 3 characters';
  }

  if (value.length > 50) {
    return 'Name must be less than 50 characters';
  }

  return true;
};

const {
  value: name,
  errorMessage: nameErrorMessage,
  meta: nameMeta,
} = useField('name', nameValidator);

watch(() => signUpData.name, (value) => {
  name.value = value;
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

watch(() => signUpData.email, (value) => {
  email.value = value;
});

const phoneValidator = (value: string) => {

  if (!value) {
    return 'Phone is required';
  }

  // use regex to check if phone is valid - Kenya
  const phoneRegex = /^(\+?07|01)?[0-9]\d{7}$/;

  if (!phoneRegex.test(value)) {
    return 'Phone is invalid';
  }

  return true;
};

const {
  value: phone,
  errorMessage: phoneErrorMessage,
  meta: phoneMeta,
} = useField('phone', phoneValidator);

watch(() => signUpData.phone, (value) => {
  phone.value = value;
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

watch(() => signUpData.newPassword, (value) => {
  password.value = value;
});

const confirmPasswordValidator = (value: string) => {
  if (!value) {
    return 'Confirm password is required';
  }

  if (value !== password.value) {
    return 'Confirm password does not match password';
  }

  return true;
};

const {
  value: confirmPassword,
  errorMessage: confirmPasswordErrorMessage,
  meta: confirmPasswordMeta,
} = useField('confirmPassword', confirmPasswordValidator);

watch(() => signUpData.confirmPassword, (value) => {
  confirmPassword.value = value;
});

const everythingIsValid = computed(() => {
  return (nameMeta.validated && nameMeta.valid) && (emailMeta.validated && emailMeta.valid) && (phoneMeta.validated && phoneMeta.valid) && (passwordMeta.validated && passwordMeta.valid) && (confirmPasswordMeta.validated && confirmPasswordMeta.valid);
});

const isLoadingResource = ref(false);

const onSubmit = () => {
  isLoadingResource.value = true;

  if (everythingIsValid.value) {
    authStore.createAccount(signUpData)
        .then((res) => {
          console.log(res);
          if (res.success) {
            router.push({name: 'chatbot-page', params: {pageId: props.pageId, chatbotId: props.chatbotId}});
          }
        })
        .catch((err) => {
          console.error(err);
        })
    // router.push({name: 'HomeAdmin'});
  } else {
    isLoadingResource.value = false;
  }
};
</script>

<template>
  <main class="w-full mx-auto p-6 flex items-center justify-center">
    <div
        class="w-full md:w-6/12 lg:w-5/12 xl:w-4/12 px-4 md:px-2 lg:px-0 mt-7 bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <div class="p-4 sm:p-7">
        <div class="text-center">
          <h1 class="block text-2xl font-bold text-gray-800 dark:text-white">Sign up</h1>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?
            <router-link
                class="text-blue-600 decoration-2 hover:underline font-medium dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                to="login">
              Login here
            </router-link>
          </p>
        </div>

        <div class="mt-5">
          <!-- Form -->
          <form @submit.prevent="onSubmit">
            <div class="grid gap-y-4">

              <!-- Name -->

              <div class="flex flex-col space-y-1">
                <label class="label font-semibold text-sm" for="name">
                  Full Name
                </label>
                <input
                    id="name"
                    v-model="signUpData.name"
                    :class="{'input-error': (nameMeta.validated && !nameMeta.valid), 'input-primary': nameMeta.validated && nameMeta.valid}"
                    class="input input-primary input-bordered text-sm w-full" placeholder="Full Name" type="text"/>
                <small v-if="(nameMeta.validated && !nameMeta.valid)"
                       class="text-sm text-rose-500">
                  {{ nameErrorMessage }}
                </small>
              </div>

              <!-- Email -->

              <div class="flex flex-col space-y-1">
                <label class="label font-semibold text-sm" for="email">
                  Email
                </label>
                <input
                    id="email"
                    v-model="signUpData.email"
                    :class="{'input-error': (emailMeta.validated && !emailMeta.valid), 'input-primary': emailMeta.validated && emailMeta.valid}"
                    class="input input-primary input-bordered text-sm w-full" placeholder="Email" type="text"/>
                <small v-if="(emailMeta.validated && !emailMeta.valid)"
                       class="text-sm text-rose-500">
                  {{ emailErrorMessage }}
                </small>
              </div>

              <!-- Phone -->

              <div class="flex flex-col space-y-1">
                <label class="label font-semibold text-sm" for="phone">
                  Phone
                </label>
                <input
                    id="phone"
                    v-model="signUpData.phone"
                    :class="{'input-error': (phoneMeta.validated && !phoneMeta.valid), 'input-primary': phoneMeta.validated && phoneMeta.valid}"
                    class="input input-primary input-bordered w-full text-sm" placeholder="Phone" type="text"/>
                <small v-if="(phoneMeta.validated && !phoneMeta.valid)"
                       class="text-sm text-rose-500">
                  {{ phoneErrorMessage }}
                </small>
              </div>

              <!-- Password -->

              <div class="flex flex-col space-y-1">
                <label class="label font-semibold text-sm" for="password">
                  Password
                </label>
                <input
                    id="password"
                    v-model="signUpData.newPassword"
                    :class="{'input-error': (passwordMeta.validated && !passwordMeta.valid), 'input-primary': passwordMeta.validated && passwordMeta.valid}"
                    class="input input-primary input-bordered w-full text-sm" placeholder="Password" type="password"/>
                <small v-if="(passwordMeta.validated && !passwordMeta.valid)"
                       class="text-sm text-rose-500">
                  {{ passwordErrorMessage }}
                </small>
              </div>

              <!-- Confirm Password -->

              <div class="flex flex-col space-y-1">
                <label class="label font-semibold text-sm" for="confirmPassword">
                  Confirm Password
                </label>
                <input
                    id="confirmPassword"
                    v-model="signUpData.confirmPassword"
                    :class="{'input-error': (confirmPasswordMeta.validated && !confirmPasswordMeta.valid), 'input-primary': confirmPasswordMeta.validated && confirmPasswordMeta.valid}"
                    class="input input-primary input-bordered w-full text-sm" placeholder="Confirm Password"
                    type="password"/>
                <small v-if="(confirmPasswordMeta.validated && !confirmPasswordMeta.valid)"
                       class="text-sm text-rose-500">
                  {{ confirmPasswordErrorMessage }}
                </small>
              </div>
              <button type="submit"
                      class="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600">
                Sign up
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