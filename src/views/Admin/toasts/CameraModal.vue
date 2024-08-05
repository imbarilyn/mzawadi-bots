<script lang="ts" setup>
import { ref, type Ref, watch } from 'vue'
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { Camera, SwitchCamera, X } from 'lucide-vue-next'
import { useNotificationsStore } from '@/stores/notifications'
import type { CapturedImageItem } from '@/views/chatbot/ChatPage.vue'

interface CameraModalProps {
  isOpen: boolean
  imgCount: number
}

const props = defineProps<CameraModalProps>()

const emits = defineEmits<{
  (event: 'closeModal'): void
  (event: 'captureImage', capturedImageItem: CapturedImageItem): void
}>()
//
const notificationsStore = useNotificationsStore()

const videoStream: Ref<MediaStream | null> = ref(null)
const cameraFeed: Ref<HTMLVideoElement | null> = ref(null)
const activeCamera = ref('environment')
const cameraStreamIsLoading = ref(false)
const isCameraModalOpen = ref(false)
const shutterAnimationIsPlaying = ref(false)

function closeModal() {
  isCameraModalOpen.value = false
  emits('closeModal')
}

async function startCamera(stream: MediaStream) {
  try {
    videoStream.value = stream

    if (cameraFeed.value) {
      // Set the video source to the camera
      cameraFeed.value.srcObject = stream

      // Play the video
      await cameraFeed.value.play()
    }

    return true
  } catch (e) {
    console.error(e)

    return false
  }
}

async function stopCamera() {
  try {
    if (!cameraFeed.value) return
    // Pause the video
    cameraFeed.value.pause()

    if (!videoStream.value) return
    // Stop the video stream
    videoStream.value.getTracks().forEach((track) => track.stop())

    // Set the video source to null
    cameraFeed.value.srcObject = null
  } catch (e) {
    console.error(e)
  }
}

async function switchCamera() {
  try {
    cameraStreamIsLoading.value = true

    // Stop the camera
    await stopCamera()

    // Switch the active camera
    activeCamera.value = activeCamera.value === 'user' ? 'environment' : 'user'

    const constraints = {
      video: {
        facingMode: activeCamera.value
      }
    }

    // Request camera access
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        // Start the camera
        startCamera(stream)
          .then(() => {
            setTimeout(() => {
              cameraStreamIsLoading.value = false
            }, 300)
          })
          .catch((err) => {
            cameraStreamIsLoading.value = false

            notificationsStore.addNotification(err, 'error')
          })
      })
      .catch((reason) => {
        console.error(reason)
        cameraStreamIsLoading.value = false

        notificationsStore.addNotification(reason, 'error')

        emits('closeModal')
      })
  } catch (e) {
    console.error(e)
  }
}

async function captureImage() {
  emits('closeModal')
  try {
    if (!cameraFeed.value) return

    shutterAnimationIsPlaying.value = true

    // Create a canvas element to render the captured image
    const canvas = document.createElement('canvas')

    // Set the canvas dimensions to the video dimensions
    canvas.width = cameraFeed.value.videoWidth
    canvas.height = cameraFeed.value.videoHeight

    // Get the canvas context
    const context = canvas.getContext('2d')

    // Draw the video frame to the canvas
    context?.drawImage(cameraFeed.value, 0, 0, canvas.width, canvas.height)

    // Get the image data URL from the canvas
    const imageDataUrl = canvas.toDataURL('image/png')

    emits('captureImage', {
      imgDataUrl: imageDataUrl,
      timestamp: Date.now()
    })
    // notificationsStore.addNotification('Image captured successfully close camera', 'success')

    setTimeout(() => {
      shutterAnimationIsPlaying.value = false
    }, 100)
    // shutterAnimationIsPlaying.value = false

    // Close the camera modal
    // closeModal()

    // Render the captured image
    // await renderCapturedImage(imageDataUrl);

    // Increment the image count
    // this.imageCount++;

    // imageCount.value = this.imageCount;

    // Enable the upload button
    // this.uploadBtn.prop('disabled', false);
  } catch (e) {
    console.error(e)
  }
}

watch(
  () => props.isOpen,
  (value) => {
    if (value) {
      cameraStreamIsLoading.value = true

      const constraints = {
        video: {
          // {
          //   path: '/',
          //   name: 'home',
          //   component: HomeView
          // },
          facingMode: activeCamera.value
        }
      }

      // Request camera access
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          cameraStreamIsLoading.value = false

          startCamera(stream)
            .then(() => {
              setTimeout(() => {
                cameraStreamIsLoading.value = false
              }, 300)
            })
            .catch((err) => {
              cameraStreamIsLoading.value = false

              notificationsStore.addNotification(err, 'error')
            })
        })
        .catch((reason) => {
          console.error(reason)
          cameraStreamIsLoading.value = false

          notificationsStore.addNotification(reason, 'error')

          emits('closeModal')
        })
    } else {
      stopCamera()
    }
  }
)
</script>

<template>
  <TransitionRoot :show="props.isOpen" appear as="template">
    <Dialog as="div" class="relative z-40" @close="closeModal">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black" />
      </TransitionChild>
      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full py-4">
          <TransitionChild
            as="template"
            enter="duration-400 ease-out"
            enter-from="opacity-0 scale-90"
            enter-to="opacity-100 scale-100"
            leave="duration-400 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-90"
          >
            <DialogPanel
              class="w-80 flex-1 flex items-center justify-center relative transform overflow-hidden transition-all duration-300"
            >
              <!-- capture image animation to play after the capture image is clicked -->
              <div
                v-show="shutterAnimationIsPlaying"
                class="absolute inset-0 bg-black opacity-50 z-20 flex items-center justify-center"
              >
                <div class="w-full h-full bg-white" />
              </div>

              <video
                v-show="!cameraStreamIsLoading"
                ref="cameraFeed"
                autoplay
                class="w-full h-auto"
                playsinline
              ></video>
              <div
                v-show="cameraStreamIsLoading"
                class="loading loading-spinner loading-lg text-white"
              />

              <div
                v-if="!cameraStreamIsLoading"
                class="absolute inset-x-0 bottom-5 flex justify-center items-center w-full animate-slide-top"
              >
                <div class="flex items-center justify-between z-10 px-4 w-full">
                  <button
                    class="btn btn-circle btn-outline !border-white normal-case text-white"
                    @click="closeModal"
                  >
                    <!-- show the image count here -->
                    <span class="text-white text-base font-montserrat-medium">{{
                      props.imgCount
                    }}</span>
                  </button>
                  <button
                    class="btn btn-circle btn-outline !border-white normal-case text-white"
                    @click="captureImage"
                  >
                    <Camera :size="24" class="text-white" />
                  </button>
                  <button
                    class="btn btn-circle btn-outline !border-white normal-case text-white"
                    @click="switchCamera"
                  >
                    <SwitchCamera :size="24" class="text-white" />
                  </button>
                </div>
              </div>

              <div class="absolute top-0 left-0 flex justify-center items-center p-4">
                <button
                  id="stopCameraBtn"
                  class="btn btn-circle btn-outline !border-none normal-case text-white"
                  @click="closeModal"
                >
                  <X :size="24" class="text-white" />
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
