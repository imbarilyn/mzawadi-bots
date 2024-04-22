<script lang="ts" setup>
// import {
//   Ripple,
//   Input,
//   initTE,
// } from "tw-elements";
import {useField} from "vee-validate";
import {useRouter} from "vue-router";

// onMounted(() => {
//   initTE({Ripple, Input});
// });
//
const router = useRouter();

const phoneValidator = (value: string) => {
  if (!value) {
    return "Phone number is required";
  }

  const phoneRegex = /^(\+254|0)[1-9]\d{8}$/;

  if (!phoneRegex.test(value)) {
    return "Phone number is invalid";
  }

  return true;
};

const {
  value: phone,
  errorMessage: phoneErrorMessage,
  meta: phoneMeta,
} = useField("phone", phoneValidator);


// when the user clicks the login button
const login = async () => {
  // if the phone number is valid
  if (phoneMeta.valid) {
    // send the phone number to the server
    // and wait for the server to send the OTP
    // to the user's phone number

    // but for now we'll just put the phone number in local storage
    localStorage.setItem("phone", phone.value);

    await router.push({name: "HomeAdmin"});
  }
};

</script>

<template>
  <div class="h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">

    <div
        class="block max-w-sm rounded-lg bg-white p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:bg-neutral-700 space-y-2">

      <h1 class="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
        Login to your account
      </h1>

      <form
          class="space-y-4 grid grid-cols-1 gap-y-4"
          @submit.prevent="login">
        <div class="space-y-1 flex flex-col">
          <!-- Phone Number input -->
          <div class="relative" data-te-input-wrapper-init>
            <input
                id="exampleInputPhoneNumber2"
                v-model="phone"
                autocomplete="off"
                class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200 dark:placeholder:text-neutral-200 [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
                placeholder="Phone Number"
                type="tel"/>
            <label
                class="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
                for="exampleInputPhoneNumber2"
            >Phone Number</label
            >
          </div>
          <!-- Phone Number error message -->
          <div
              v-if="phoneMeta.validated && phoneErrorMessage"
              class="text-xs text-red-500 mt-1">
            {{ phoneErrorMessage }}
          </div>
        </div>

        <!--Sign in button-->
        <button
            class="dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]] inline-block w-full rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
            data-te-ripple-color="light"
            data-te-ripple-init
            type="submit">
          Log in
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>

</style>