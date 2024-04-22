<script lang="ts" setup>
import {computed, onMounted, ref} from "vue";

interface UserBubbleProps {
  userName: string;
  userMessage: string;
  audioData?: {
    audioUrl: string;
    audioBlob: Blob;
  };
  chatTextColor?: string;
}

const props = defineProps<UserBubbleProps>();

const hasAudio = computed(() => {
  return props.audioData !== undefined;
});

const audio = ref<HTMLAudioElement | null>(null);
const audioDuration = ref(0);
const isPlaying = ref(false);

onMounted(() => {
  audio.value = new Audio(props.audioData?.audioUrl);

  audio.value.onloadedmetadata = () => {
    audioDuration.value = audio.value?.duration;
  };

  audioDuration.value = audio.value?.duration;

  audio.value.onended = () => {
    isPlaying.value = false;
  };
});

const onPlayAudioClick = (data) => {
  if (data === 'play') {
    playAudio();
  } else if (data === 'pause') {
    pauseAudio();
  }
};

const playAudio = () => {
  isPlaying.value = true;

  audio.value?.play();
};

const pauseAudio = () => {
  isPlaying.value = false;

  audio.value?.pause();
};

// const userName = props.userName;

</script>

<template>
  <li class="py-2 sm:py-4 list-none">
    <div class="max-w-4xl px-4 sm:px-6 lg:px-8 mx-auto">
      <div class="max-w-2xl flex gap-x-2 sm:gap-x-4">
        <div class="flex-shrink-0 w-10 h-10 rounded-full bg-secondary inline-flex items-center justify-center">
          <span class="text-lg font-poppins-semi-bold text-white leading-none">ME</span>
        </div>

        <div class="flex flex-col space-y-3 items-start w-full">
          <div class="flex-shrink-0 h-10 rounded-full flex items-center">
            <div class="text-sm font-poppins-semi-bold mb-2 tracking-wide leading-tight">
              You
            </div>
          </div>
          <div class="space-y-3 text-sm">
            <div class="text-sm" :class="chatTextColor" v-html="props.userMessage">
            </div>
            <div class="mt-3">
              <template v-if="hasAudio">
                <button type="button" @click="onPlayAudioClick(isPlaying ? 'pause' : 'play')"
                        class="btn btn-primary btn-outline btn-sm normal-case group">
                  <i v-if="!isPlaying" class="material-icons !text-2xl">play_arrow</i>
                  <i v-else class="material-icons !text-2xl">pause</i>
                  <span class="text-xs font-poppins-semi-bold text-black group-hover:text-white">
                Your message
                </span>
                </button>

                <!-- show the audio player if the user has sent an audio message -->
<!--                <audio controls class="w-full mt-2">-->
<!--                  <source :src="props.audioData?.audioUrl" type="audio/mpeg">-->
<!--                </audio>-->
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </li>
</template>

<style scoped>

.chatbot-pop {
  animation: chatbot-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
}

@keyframes slideInFromRight {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(0);
  }
}

@keyframes chatbot-pop {
  0% {
    transform: scale(0);
  }
  25% {
    transform: scale(1.1);
  }
  50% {
    transform: scale(0.9);
  }
  75% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

</style>