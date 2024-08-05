<script lang="ts" setup>
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  type Ref,
  ref,
  type UnwrapRef,
  watch
} from 'vue'
import DOMPurify from 'dompurify'
// import RecordRtc from "recordrtc";
import { useNotificationsStore } from '@/stores/notifications'
import { useChatbotStore } from '@/stores/chatbot'

interface UserInputProps {
  userInput: string
  promptPlaceholder: string
  disabled: boolean
  isGenerating?: boolean
  ringColor?: string
  inputBtnColor?: string
  hasBgImg?: boolean
}

const props = defineProps<UserInputProps>()
const notificationsStore = useNotificationsStore()

const userInput = ref<string>(props.userInput)
const formattedUserInput = computed(() => {
  let purifiedBreak = userInput.value.replace(/\n/g, '<br>')

  purifiedBreak = DOMPurify.sanitize(purifiedBreak, {
    ALLOWED_TAGS: ['br']
  })

  return purifiedBreak
})

const photoRef = ref<HTMLImageElement | null>(null)

// open the file dialog modal
const uploadImg = () => {
  photoRef.value?.click()
}

const chatbotStore = useChatbotStore()

watch(
  () => chatbotStore.isFile,
  (value) => {
    if (value) {
      uploadImg()
      chatbotStore.closePhotoDialog()
      chatbotStore.isFile = false
    } else {
      return
    }
  }
)

const isImage = ref<boolean>(false)
const onPhotoChange = (e: Event) => {
  chatbotStore.capturedImages.splice(0, 1)
  const target = e.target as HTMLInputElement
  const files: any = target.files as FileList
  // console.log(typeof files)
  // console.log(files.item(0))
  const ImgSize = files.item(0).size / (1024 * 1024)
  if (files.length > 0 && ImgSize < 20) {
    isImage.value = true
    const file = files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target) {
        const img = e.target as FileReader
        // console.log(img.result)
        const image_url = img.result as string
        console.log(image_url)
        console.log(typeof file.lastModified)
        // const image_upload: any = document.getElementById('image-upload')
        // image_upload.src = img.result as string
        chatbotStore.capturedImages.push({
          imgDataUrl: image_url,
          timestamp: file.lastModified
        })
        console.log(chatbotStore.capturedImages)
      }
    }
    reader.onerror = (e) => {
      console.log(`Error reading ${file.name}`, e.target?.error)
      setTimeout(() => {
        notificationsStore.addNotification('Error loading image', 'error')
      }, 500)
    }
    reader.readAsDataURL(file)
  } else {
    console.log('file size is too large')
    setTimeout(() => {
      notificationsStore.addNotification('Image size should be less than 20MB', 'error')
    }, 500)
  }
}

const hasText = computed(() => {
  return userInput.value.length > 0 && userInput.value.trim().length > 0
})

const textareaRef = ref<HTMLTextAreaElement | null>(null)

const maxHeight = ref(200)

// const maxHeightReached = computed(() => {
//   return textareaRef.value?.scrollHeight >= maxHeight.value;
// });

watch(userInput, () => {
  nextTick(() => {
    adjustTextareaHeight(textareaRef.value as HTMLTextAreaElement)
  })
})

const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
  textarea.style.height = 'auto'
  textarea.style.height = Math.min(textarea.scrollHeight, maxHeight.value) + 'px'
}

const inputHasFocus = ref<boolean>(false)

const emits = defineEmits<{
  (
    event: 'userInput',
    value: string,
    formatted: string,
    audioData?: {
      audioBlob: Blob
      audioUrl: string
      // audio: Audio,
    }
  ): void
  (event: 'openPhotoModal'): void
}>()

const onTextAreaKeydown = (e: KeyboardEvent) => {
  // if the user presses the shift key and the enter key at the same time
  if (e.key === 'Enter' && e.shiftKey) {
    // check if the user input is empty
    if (hasText.value) {
      // if the user input is empty, do nothing
      return
    }
  }
  // if the enter key is pressed and the user input is not empty
  else if (e.key === 'Enter' && userInput.value.length > 0) {
    // check for empty spaces and newlines
    if (userInput.value.trim().length === 0) {
      // if the user input is empty, do nothing
      return
    }

    // check if a response is being generated
    if (props.isGenerating) {
      // if a response is being generated, do nothing
      return
    }

    // emit the user input
    emits('userInput', userInput.value, formattedUserInput.value)

    // clear the user input
    userInput.value = ''

    // adjust the textarea height
    adjustTextareaHeight(textareaRef.value as HTMLTextAreaElement)

    // prevent the enter key from creating a new line
    e.preventDefault()
  } else if (e.key === 'Enter' && userInput.value.length === 0) {
    // if the enter key is pressed and the user input is empty, do nothing
    e.preventDefault()
  }

  // if the user presses the backspace key and the user input is empty
  if (e.key === 'Backspace' && userInput.value.length === 0) {
    // prevent the backspace key from deleting the last character in the textarea
    e.preventDefault()
  }
}

const sendButtonClicked = (audioData?: {
  audioBlob: Blob
  audioUrl: string
  // audio: Audio,
}) => {
  // check if the user input is empty
  if (userInput.value.length === 0) {
    // if the user input is empty, do nothing
    return
  }

  // console.log('send-btn-clicked -> audioData', audioData);

  // emit the user input
  emits('userInput', userInput.value, formattedUserInput.value, audioData)

  // clear the user input
  userInput.value = ''

  // adjust the textarea height
  adjustTextareaHeight(textareaRef.value as HTMLTextAreaElement)
}

const openPhotoModal = () => {
  emits('openPhotoModal')
}
const addFocus = () => {
  if (inputHasFocus.value || props.disabled) {
    return
  }
  inputHasFocus.value = true
  textareaRef.value?.focus()
}

// handle the mic button

// mic control
const micIsListening = ref(false)
const micIsStopped = ref(false)

const audioIsPlaying = ref(false)

const promptPlaceholderText = computed(() => {
  if (micIsListening.value) {
    return 'Listening...'
  } else {
    return props.promptPlaceholder
  }
})

const onAudioControlClick = (data: string) => {
  if (data === 'play') {
    audioIsPlaying.value = true
    playAudio().then((isEnded) => {
      if (isEnded) {
        audioIsPlaying.value = false
      }
    })
  } else if (data === 'pause') {
    audioIsPlaying.value = false
    pauseAudio()
  }
}

const onRecordAudioControlClick = (data: string) => {
  console.log(data)
  // event.stopPropagation();

  // alert(action);

  // isListening.value = audioControls.value.find(control => control.action === action)?.val;
  if (data === 'start') {
    // startListening();
    micIsListening.value = true
    micIsStopped.value = false
    startAudioRecording()
    // animateMicPulse();
  } else if (data === 'stop') {
    // stopListening();
    micIsListening.value = false
    micIsStopped.value = true
    stopAudioRecording().catch((error) => {
      //Error handling structure
      switch (error.name) {
        case 'InvalidStateError': //error from the MediaRecorder.stop
          console.log('An InvalidStateError has occurred.')
          break
        default:
          console.log('An error occurred with the error name ' + error.name)
      }
    })
    // } else if (data === "paused") {
    //   console.log('Pausing... ');]
    //   micIsStopped.value = true;
    //   pauseAudioRecording();
  } else if (data === 'delete') {
    // delete the audio
    micIsListening.value = false
    micIsStopped.value = false
    deleteAudio()
  } else if (data === 'send') {
    if (micIsListening.value) {
      // send the audio
      micIsListening.value = false
      micIsStopped.value = false
      stopAudioRecording()
        .then((audioAsBlob: Blob) => {
          return transcribeWithOpenAI(audioAsBlob)
        })
        .then(() => {
          // sendButtonClicked({
          //   audioBlob: audioRecorder.audioBlobs[0],
          //   audioUrl: recordedAudioURL.value,
          //   // audio: recordedAudio.value,
          // });
        })
        .catch((error) => {
          //Error handling structure
          switch (error.name) {
            case 'InvalidStateError': //error from the MediaRecorder.stop
              console.log('An InvalidStateError has occurred.')
              break
            default:
              console.log('An error occurred with the error name ', error)
          }
        })
    } else {
      sendButtonClicked()
    }
  }

  audioIsPlaying.value = false
}

// audio context

// const audioCtx = new AudioContext();
// let analyser = null;
// let dataArray = null;
// let micScale = ref(1.0);
// let animationFrameId = null;
const micPulse = ref<HTMLElement | null>(null)

// const audioElement: Ref<HTMLAudioElement | null> = ref(null);
// const audioElementSource: Ref<HTMLSourceElement | null> = ref(null);
// const audioReader = ref(new FileReader());
const seekBar: Ref<HTMLInputElement | null> = ref(null)
const recordedAudio: Ref<HTMLAudioElement | null> = ref(null)
const recordedAudioURL = ref('')
const audioIsLoadingDuration = ref(false)
const audioDuration = ref('00:00')
const hasAudioRecording = ref(false)

//Controller

/** Stores the actual start time when an audio recording begins to take place to ensure elapsed time start time is accurate*/
const audioRecordStartTime = ref<Date>()

/** Stores the maximum recording time in hours to stop recording once maximum recording hour has been reached */
const maximumRecordingTimeInHours = ref(1)

/** Stores the reference of the setInterval function that controls the timer in audio recording*/
const elapsedTimeTimer = ref(0)

const elapsedDuration = ref('')

const audioRecorder = reactive({
  audioBlobs: [] as Blob[],
  mediaRecorder: null,
  recorder: null,
  streamBeingCaptured: null,
  start: async function () {
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      //Feature is not supported in browser
      //return a custom error
      return Promise.reject(
        new Error('mediaDevices API or getUserMedia method is not supported in this browser.')
      )
    } else {
      //Feature is supported in browser

      //create an audio stream
      return (
        navigator.mediaDevices
          .getUserMedia({ audio: true } /*of type MediaStreamConstraints*/)
          //returns a promise that resolves to the audio stream
          .then((stream) /*of type MediaStream*/ => {
            console.log('stream', stream)

            //save the reference of the stream to be able to stop it when necessary
            audioRecorder.streamBeingCaptured = stream

            //create a media recorder instance by passing that stream into the MediaRecorder constructor
            audioRecorder.mediaRecorder = new MediaRecorder(
              stream
            ) /*the MediaRecorder interface of the MediaStream Recording
                    API provides functionality to easily record media*/

            //clear previously saved audio Blobs, if any
            audioRecorder.audioBlobs = []

            // console.log('audioRecorder.mediaRecorder', audioRecorder.mediaRecorder);
            audioRecorder.mediaRecorder.start()

            //add a dataavailable event listener in order to store the audio data Blobs when recording
            audioRecorder.mediaRecorder.addEventListener('dataavailable', (event) => {
              console.log('data available event')
              //store audio Blob object
              audioRecorder.audioBlobs.push(event.data)

              console.log('audioRecorder.audioBlobs', audioRecorder.audioBlobs)
            })

            //start the recording by calling the start method on the media recorder

            // audioRecorder.recorder = new RecordRTCPromisesHandler(stream, {
            //
            // });
          })
          .catch((error) => {
            console.error('Error getting user media:', error)
          })
      )

      /* errors are not handled in the API because if its handled and the promise is chained, the .then after the catch will be executed*/
    }
  },
  pause: function () {
    //pause the recording feature
    return new Promise((resolve: (value: Blob) => void) => {
      // if (!audioRecorder.mediaRecorder) {
      //   reject(new Error('No recording in progress'))
      // }

      if (!audioRecorder.mediaRecorder) {
        return
      }

      //save audio type to pass to set the Blob type
      let mimeType = audioRecorder.mediaRecorder.mimeType

      //listen to the pause event in order to create & return a single Blob object
      audioRecorder.mediaRecorder.addEventListener('pause', () => {
        console.log('pause media event')
        //create a single blob object, as we might have gathered a few Blob objects that needs to be joined as one
        let audioBlob = new Blob(audioRecorder.audioBlobs, { type: mimeType })

        //resolve promise with the single audio blob representing the recorded audio
        resolve(audioBlob)
      })

      audioRecorder.mediaRecorder.pause()
    })
  },
  resume: function () {
    //resume the recording feature
    return new Promise((resolve: (value: null) => void) => {
      if (!audioRecorder.mediaRecorder) {
        return
      }

      //listen to the resume event in order to resume the recording
      audioRecorder.mediaRecorder.addEventListener('resume', () => {
        console.log('resume media event')
        //resolve promise
        resolve(null)
      })
      audioRecorder.mediaRecorder.resume()
    })
  },
  stop: function () {
    //return a promise that would return the blob or URL of the recording
    return new Promise((resolve: (value: UnwrapRef<Blob | null>) => void) => {
      if (audioRecorder.mediaRecorder) {
        //save audio type to pass to set the Blob type
        let mimeType = audioRecorder.mediaRecorder.mimeType
        console.log('mimeType', mimeType)

        //listen to the stop event in order to create & return a single Blob object
        audioRecorder.mediaRecorder.addEventListener('stop', () => {
          console.log('stop media event')
          //create a single blob object, as we might have gathered a few Blob objects that needs to be joined as one
          // let audioBlob = new Blob(audioRecorder.audioBlobs, {type: mimeType});
          let audioBlob = new Blob(audioRecorder.audioBlobs, { type: 'audio/ogg' })

          audioRecorder.tempAudioBlob = audioBlob

          //resolve promise with the single audio blob representing the recorded audio
          resolve(audioBlob)
        })

        audioRecorder.cancel()
      } else {
        resolve(audioRecorder.tempAudioBlob)
      }
    })
  },
  cancel: function () {
    if (!audioRecorder.mediaRecorder) {
      return
    }

    //stop the recording feature
    audioRecorder.mediaRecorder.stop()

    //stop all the tracks on the active stream in order to stop the stream
    audioRecorder.stopStream()

    //reset API properties for next recording
    audioRecorder.resetRecordingProperties()
  },
  stopStream: function () {
    if (!audioRecorder.streamBeingCaptured) {
      return
    }

    //stopping the capturing request by stopping all the tracks on the active stream
    audioRecorder.streamBeingCaptured
      .getTracks() //get all tracks from the stream
      .forEach((track) /*of type MediaStreamTrack*/ => track.stop()) //stop each one
  },
  /** Reset all the recording properties including the media recorder and stream being captured*/
  resetRecordingProperties: function () {
    audioRecorder.mediaRecorder = null
    audioRecorder.streamBeingCaptured = null
  },
  tempAudioBlob: null
} as {
  audioBlobs: Blob[]
  mediaRecorder: MediaRecorder | null
  streamBeingCaptured: MediaStream | null
  start: () => Promise<void>
  pause: () => Promise<Blob>
  // resume: () => Promise<void>
  stop: () => Promise<Blob>
  cancel: () => void
  stopStream: () => void
  resetRecordingProperties: () => void
  tempAudioBlob: Blob | null
})

/** Starts the audio recording*/
function startAudioRecording() {
  // check if there's an existing audio, if so we clear it
  if (hasAudioRecording.value) {
    pauseAudio()
    deleteAudio()
  }

  //start recording using the audio recording API
  audioRecorder
    .start()
    .then(() => {
      //on success

      //store the recording start time to display the elapsed time according to it
      audioRecordStartTime.value = new Date()

      //display control buttons to offer the functionality of stop and cancel
      handleDisplayingRecordingControlButtons()

      hasAudioRecording.value = true
    })
    .catch((error) => {
      //on error
      //No Browser Support Error
      if (
        error.message.includes(
          'mediaDevices API or getUserMedia method is not supported in this browser.'
        )
      ) {
        console.log('To record audio, use browsers like Chrome and Firefox.')
        // displayBrowserNotSupportedOverlay();
      }

      //Error handling structure
      switch (error.name) {
        case 'AbortError': //error from navigator.mediaDevices.getUserMedia
          console.log('An AbortError has occured.')
          break
        case 'NotAllowedError': //error from navigator.mediaDevices.getUserMedia
          console.log('A NotAllowedError has occured. User might have denied permission.')
          break
        case 'NotFoundError': //error from navigator.mediaDevices.getUserMedia
          console.log('A NotFoundError has occured.')
          break
        case 'NotReadableError': //error from navigator.mediaDevices.getUserMedia
          console.log('A NotReadableError has occured.')
          break
        case 'SecurityError': //error from navigator.mediaDevices.getUserMedia or from the MediaRecorder.start
          console.log('A SecurityError has occured.')
          break
        case 'TypeError': //error from navigator.mediaDevices.getUserMedia
          console.log('A TypeError has occured.')
          break
        case 'InvalidStateError': //error from the MediaRecorder.start
          console.log('An InvalidStateError has occured.')
          break
        case 'UnknownError': //error from the MediaRecorder.start
          console.log('An UnknownError has occured.')
          break
        default:
          console.log('An error occured with the error name ' + error.name)
      }
    })
}

/** Displays recording control buttons */
function handleDisplayingRecordingControlButtons() {
  //Handle the displaying of the elapsed recording time
  handleElapsedRecordingTime()
}

function handleElapsedRecordingTime() {
  //display inital time when recording begins
  displayElapsedTimeDuringAudioRecording('00:00')

  //create an interval that compute & displays elapsed time, as well as, animate red dot - every second
  elapsedTimeTimer.value = setInterval(() => {
    if (!audioRecordStartTime.value) {
      return
    }

    //compute the elapsed time every second
    let elapsedTime = computeElapsedTime(audioRecordStartTime.value.getTime()) //pass the actual record start time
    //display the elapsed time
    displayElapsedTimeDuringAudioRecording(elapsedTime)
  }, 1000) as unknown as number //every second
}

function displayElapsedTimeDuringAudioRecording(elapsedTime: string) {
  //1. display the passed elapsed time as the elapsed time in the elapsedTime HTML element
  elapsedDuration.value = elapsedTime

  // console.log(elapsedTime)

  //2. Stop the recording when the max number of hours is reached
  if (elapsedTimeReachedMaximumNumberOfHours(elapsedTime)) {
    stopAudioRecording().catch((error) => {
      //Error handling structure
      switch (error.name) {
        case 'InvalidStateError': //error from the MediaRecorder.stop
          console.log('An InvalidStateError has occurred.')
          break
        default:
          console.log('An error occurred with the error name ' + error.name)
      }
    })
  }
}

/** Hide the displayed recording control buttons */
function handleHidingRecordingControlButtons() {
  //Display the microphone button that starts audio recording

  console.log('elapsedTimeTimer.value', elapsedTimeTimer.value)
  //stop interval that handles both time elapsed and the red dot
  clearInterval(elapsedTimeTimer.value)
}

function elapsedTimeReachedMaximumNumberOfHours(elapsedTime: string) {
  //Split the elapsed time by the symbo :
  let elapsedTimeSplitted = elapsedTime.split(':')

  //Turn the maximum recording time in hours to a string and pad it with zero if less than 10
  let maximumRecordingTimeInHoursAsString =
    maximumRecordingTimeInHours.value < 10
      ? '0' + maximumRecordingTimeInHours.value
      : maximumRecordingTimeInHours.value.toString()

  //if it the elapsed time reach hours and also reach the maximum recording time in hours return true
  return (
    elapsedTimeSplitted.length === 3 &&
    elapsedTimeSplitted[0] === maximumRecordingTimeInHoursAsString
  )
}

function computeElapsedTime(startTime: number) {
  console.log('startTime', startTime)
  //record end time
  let endTime = new Date().getTime()

  //time difference in ms
  let timeDiff = endTime - startTime

  //convert time difference from ms to seconds
  timeDiff = timeDiff / 1000

  //extract integer seconds that dont form a minute using %
  let seconds: number | string = Math.floor(timeDiff % 60) //ignoring uncomplete seconds (floor)

  //pad seconds with a zero if neccessary
  seconds = seconds < 10 ? '0' + seconds : seconds

  //convert time difference from seconds to minutes using %
  timeDiff = Math.floor(timeDiff / 60)

  //extract integer minutes that don't form an hour using %
  let minutes: number | string = timeDiff % 60 //no need to floor possible incomplete minutes, becase they've been handled as seconds
  minutes = minutes < 10 ? '0' + minutes : minutes

  //convert time difference from minutes to hours
  timeDiff = Math.floor(timeDiff / 60)

  //extract integer hours that don't form a day using %
  let hours = timeDiff % 24 //no need to floor possible incomplete hours, becase they've been handled as seconds

  //convert time difference from hours to days
  timeDiff = Math.floor(timeDiff / 24)

  // the rest of timeDiff is number of days
  let days = timeDiff //add days to hours

  let totalHours: number | string = hours + days * 24
  totalHours = totalHours < 10 ? '0' + totalHours : totalHours

  if (totalHours === '00') {
    return minutes + ':' + seconds
  } else {
    return totalHours + ':' + minutes + ':' + seconds
  }
}

/**
 * Update the timer to display the remaining time
 * @returns {void}
 */
function updateTimer() {
  let duration = recordedAudio.value?.duration || 0
  let currentTime = recordedAudio.value?.currentTime || 0
  let remainingTime = duration - currentTime

  audioDuration.value = formatTime(remainingTime)
}

function formatTime(seconds: number) {
  let minutes: string | number = Math.floor(seconds / 60)
  let remainingSeconds: string | number = Math.floor(seconds % 60)

  // Ensure each component has two digits
  minutes = padZero(minutes)
  remainingSeconds = padZero(remainingSeconds)

  return `${minutes}:${remainingSeconds}`
}

function padZero(value: number) {
  return value < 10 ? `0${value}` : value
}

async function stopAudioRecording() {
  audioIsLoadingDuration.value = true

  //stop the recording using the audio recording API
  return audioRecorder
    .stop()
    .then((audioAsBlob: Blob) => {
      //Play recorder audio

      return storeAudio(audioAsBlob)
    })
    .then((audioAsBlob: Blob) => {
      audioIsLoadingDuration.value = false

      handleHidingRecordingControlButtons()

      return audioAsBlob
    })
}

// store the audio

function storeAudio(recorderAudioAsBlob: Blob): Promise<Blob> {
  //read content of files (Blobs) asynchronously
  // let reader = new FileReader();

  return new Promise((resolve) => {
    recordedAudioURL.value = URL.createObjectURL(recorderAudioAsBlob)

    // console.log(recordedAudio);

    recordedAudio.value = new Audio(recordedAudioURL.value)
    recordedAudio.value.volume = 0
    recordedAudio.value.playbackRate = 4.0

    recordedAudio.value.addEventListener('loadedmetadata', function () {
      // Access the duration once the metadata is loaded
      // console.log('Audio duration:', recordedAudio.value.duration)
      // You can now perform any actions that require the duration
      // For example, display it in the UI or use it in your logic
    })

    recordedAudio.value.addEventListener('ended', function () {
      // console.log('Audio playback ended. Duration now available:', recordedAudio.value.duration)
      // You can now use the duration or perform any other actions

      if (!recordedAudio.value || !seekBar.value) {
        return
      }

      seekBar.value.max = recordedAudio.value.duration.toString()
      recordedAudio.value.currentTime = 0
      seekBar.value.value = recordedAudio.value.currentTime.toString()

      resolve(recorderAudioAsBlob)
    })

    recordedAudio.value.play()
  })
}

// playing the audio

function playAudio() {
  //play the audio after successfully setting new src and type that corresponds to the recorded audio

  return new Promise((resolve) => {
    if (!recordedAudio.value) {
      return
    }

    recordedAudio.value.playbackRate = 1.0
    recordedAudio.value.volume = 1.0

    //on seek bar change update the audio current time
    seekBar.value!.onchange = () => {
      if (!recordedAudio.value) {
        return
      }

      // audioElement.value.currentTime = Number(seekBar.value!.value);
      recordedAudio.value.currentTime = Number(seekBar.value!.value)
    }

    //on audio time update, update the seek bar current time
    // audioElement.value!.ontimeupdate = () => {
    recordedAudio.value!.ontimeupdate = () => {
      if (recordedAudio.value) {
        if (
          recordedAudio.value!.currentTime.toString() === recordedAudio.value!.duration.toString()
        ) {
          // audioElement.value!.pause();
          recordedAudio.value!.pause()
          audioIsPlaying.value = false
        }

        seekBar.value!.value = recordedAudio.value!.currentTime.toString()
      }

      updateTimer()
    }

    // audioElement.value.play();
    recordedAudio.value.play()

    recordedAudio.value.addEventListener('ended', function () {
      resolve(true)
    })
  })
}

function pauseAudioRecording() {
  return new Promise((resolve) => {
    if (!recordedAudio.value) {
      return
    }

    recordedAudio.value.addEventListener('pause', function () {
      // pause the audio
      resolve(true)
    })
    recordedAudio.value.pause()
  })
}

function pauseAudio() {
  console.log('Pausing audio...')
  pauseAudioRecording().then(() => {
    audioIsPlaying.value = false
  })
}

function deleteAudio() {
  console.log('Deleting audio...')
  if (!recordedAudio.value) {
    return
  }

  recordedAudio.value.pause()
  recordedAudio.value.currentTime = 0
  recordedAudioURL.value = ''
  recordedAudio.value = null

  if (seekBar.value) {
    seekBar.value.value = '0'
    seekBar.value.max = '0'
  }

  hasAudioRecording.value = false
  audioIsPlaying.value = false
  audioIsLoadingDuration.value = false
  handleHidingRecordingControlButtons()
}

function transcribeWithOpenAI(audioAsBlob: Blob) {
  // send the audio to the OpenAI API
  const formData = new FormData()

  formData.append('file', audioAsBlob)
  formData.append('model', 'whisper-1')
  formData.append('language', 'en')

  fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + import.meta.env.VITE_APP_OPENAI_API_KEY
    },
    body: formData
  })
    .then((response) => {
      return response.json()
    })
    .then((data) => {
      if (data.error) {
        notificationsStore.addNotification(data.error.message, 'error')
        return
      }
      userInput.value = data.text
      sendButtonClicked({
        audioBlob: { ...audioRecorder.audioBlobs[0] },
        audioUrl: recordedAudioURL.value
        // audio: audio,
      })
      deleteAudio()
    })
    .catch((err) => {
      console.log(err)
    })
}

// const animateMicPulse = () => {
//   // Get the analyser data and update micScale based on the audio level
//   analyser = audioCtx.createAnalyser();
//   analyser.fftSize = 256;
//   dataArray = new Uint8Array(analyser.frequencyBinCount);
//
//   const draw = () => {
//     analyser.getByteFrequencyData(dataArray);
//
//     // Calculate the average amplitude of the audio data
//     const averageAmplitude = dataArray.reduce((acc, value) => acc + value, 0) / dataArray.length;
//
//     // Map the average amplitude to a scale factor for mic animation
//     micScale.value = 1.0 + averageAmplitude / 128;
//
//     console.log('micScale', micScale.value);
//
//     // Update the mic pulse visualization
//     micPulse.value.style.transform = `scale(${micScale.value})`;
//
//     // Continue the animation loop
//     animationFrameId = requestAnimationFrame(draw);
//   };
//
//   // Start the animation loop
//   draw();
// };

const isDelete = ref<boolean>(false)
const showPhotoDelete = (value: boolean) => {
  isDelete.value = value
}

const deletePhoto = () => {
  isImage.value = false
}

onMounted(() => {
  // if(!micPulse.value) return
  micPulse.value = document.getElementById('micPulse')
})

onUnmounted(() => {
  // Cleanup logic, e.g., stop audio context, disconnect nodes
  if (micIsListening.value) {
    // Stop the mediaRecorder, disconnect it from audio nodes
    // stopListening();
  }
  undefined
  // Stop the animation loop
  // cancelAnimationFrame(animationFrameId);
})
</script>

<template>
  <div
    :class="[inputHasFocus ? `ring-2 ${ringColor} ring-opacity-50` : '']"
    class="relative text-sm border-2 border-emerald-200 bg-white rounded-xl shadow-lg shadow-slate-300/10 flex flex-row items-center m-0 p-4 pb-14"
    @click.stop="addFocus"
  >
    <div class="w-full">
      <div>
        <textarea
          ref="textareaRef"
          v-model="userInput"
          :disabled="props.disabled || micIsListening"
          :placeholder="promptPlaceholderText"
          class="w-full border-none resize-none focus:outline-none bg-transparent h-6 text-sm grow transition duration-150 my-1.5 bottom-0"
          @blur="inputHasFocus = false"
          @focus="inputHasFocus = true"
          @keydown="onTextAreaKeydown"
        ></textarea>
      </div>

      <div
        v-if="isImage"
        class="flex relative w-20 shadow-2xl pt-4"
        @mouseleave="showPhotoDelete(false)"
        @mouseover="showPhotoDelete(true)"
      >
        <div v-for="image in chatbotStore.capturedImages" :key="image.timestamp">
          <img
            id="image-upload"
            :src="image.imgDataUrl"
            alt="Uploaded image"
            class="h-20 w-20 rounded-lg outline outline-offset-2 outline-4 outline-gray-200"
          />
        </div>
        <button
          v-if="isDelete"
          id="delete-image"
          class="btn btn-sm btn-circle absolute left-6 top-10 bg-gray-400 hover:bg-gray-400"
          @click="deletePhoto"
        >
          <span class="material-icons-outlined text-gray-300"> clear </span>
        </button>
      </div>
    </div>

    <Transition name="slide-fade-y">
      <button
        v-if="micIsListening"
        class="absolute right-1/2 -top-12 py-3 px-4 inline-flex justify-center items-center gap-2 rounded-lg font-medium bg-primary text-white shadow-sm align-middle text-sm"
        type="button"
      >
        <svg class="flex-shrink-0 w-3 h-3" fill="currentColor" viewBox="0 0 12 12">
          <circle cx="6" cy="6" r="6" />
        </svg>
        Listening...
      </button>
    </Transition>

    <div class="absolute bottom-px inset-x-px pt-4 px-4 pb-4 rounded-b-md">
      <div class="flex justify-end items-center">
        <!-- Button Group -->
        <!--        <div class="flex items-center">-->

        <!--          &lt;!&ndash; Attach Button &ndash;&gt;-->
        <!--          <button type="button"-->
        <!--                  class="btn btn-sm btn-circle btn-ghost normal-case flex items-center justify-center" disabled>-->
        <!--            <span class="material-icons-round animate-rotate-45-cw !text-2xl">-->
        <!--              attach_file-->
        <!--            </span>-->
        <!--          </button>-->
        <!--          &lt;!&ndash; End Attach Button &ndash;&gt;-->
        <!--        </div>-->
        <!-- End Button Group -->

        <!-- Button Group -->
        <div class="flex items-center space-x-2">
          <div class="flex items-center space-x-2">
            <div class="flex items-center space-x-2">
              <!-- Delete Button -->
              <button
                v-if="micIsListening || micIsStopped"
                class="btn btn-sm btn-circle btn-ghost normal-case flex items-center justify-center"
                type="button"
                @click.prevent="onRecordAudioControlClick('delete')"
              >
                <span class="material-icons-round !text-2xl"> delete </span>
              </button>
              <!-- End Delete Button -->

              <div v-if="micIsListening" class="flex items-center self-center space-x-2">
                <span
                  class="text-base font-poppins-semi-bold text-neutral-700 dark:text-neutral-300"
                >
                  {{ elapsedDuration }}
                </span>
              </div>

              <div
                v-show="micIsStopped && !audioIsLoadingDuration"
                class="flex items-center space-x-2"
              >
                <!-- Play Button -->
                <button
                  v-if="!audioIsPlaying"
                  class="btn btn-sm btn-circle btn-ghost normal-case flex items-center justify-center"
                  type="button"
                  @click.prevent="onAudioControlClick('play')"
                >
                  <span class="material-icons-round !text-2xl"> play_arrow </span>
                </button>
                <button
                  v-else
                  class="btn btn-sm btn-circle btn-ghost normal-case flex items-center justify-center"
                  type="button"
                  @click.prevent="onAudioControlClick('pause')"
                >
                  <span class="material-icons-round !text-2xl"> pause </span>
                </button>
                <!-- End Play Button -->

                <!-- Audio slider -->
                <div class="space-x-2 p-2 rounded-full bg-neutral-200">
                  <input
                    ref="seekBar"
                    class="w-32 h-2 bg-neutral-200 cursor-pointer rounded-lg"
                    max=""
                    min="0"
                    type="range"
                    value=""
                  />
                </div>

                <!-- End Audio slider -->

                <!-- Elapsed Time -->
                <div class="flex items-center self-center space-x-2">
                  <span
                    class="text-base font-poppins-semi-bold text-neutral-700 dark:text-neutral-300"
                  >
                    {{ audioDuration }}
                  </span>
                </div>
              </div>
              <div v-show="audioIsLoadingDuration" class="flex items-center self-center space-x-2">
                <span class="loading loading-dots loading-sm"></span>
                <span
                  class="text-sm font-poppins-semi-bold text-neutral-700 dark:text-neutral-300 animate-pulse"
                >
                  Processing audio...
                </span>
              </div>
            </div>

            <!-- Mic Button -->
            <button
              v-if="!micIsListening || micIsStopped"
              :disabled="hasText || isGenerating"
              class="relative btn btn-sm btn-circle btn-ghost normal-case flex items-center justify-center"
              type="button"
              @click.prevent="onRecordAudioControlClick('start')"
            >
              <span class="material-icons-round !text-2xl"> mic_none </span>
              <!--                                  <span v-else class="material-icons-round !text-2xl">-->
              <!--                                mic-->
              <!--                              </span>-->
              <!--                                  <span v-show="isListening === 1" ref="micPulse"-->
              <!--                                        class="absolute inset-x-0 -left-4 h-16 w-16 rounded-full bg-neutral-500 opacity-50"-->
              <!--                                        :style="{ transform: `scale(${micScale})` }"></span>-->
            </button>

            <!-- Pause Button -->
            <button
              v-if="micIsListening && !micIsStopped"
              class="btn btn-sm btn-circle btn-ghost normal-case flex items-center justify-center"
              type="button"
              @click.prevent="onRecordAudioControlClick('stop')"
            >
              <span class="material-icons-round !text-2xl text-red-500"> stop </span>
            </button>
            <!-- End Pause Button -->

            <!--            add photo-->

            <input
              id="file-img"
              ref="photoRef"
              accept=".jpeg,.jpg,.png,.gif,.webp"
              class="hidden"
              type="file"
              @change="onPhotoChange"
            />
            <!--            <button-->
            <!--              class="btn btn-sm btn-ghost btn-circle normal-case flex items-center justify-center"-->
            <!--              @click.prevent="uploadImg"-->
            <!--            >-->
            <!--              <span class="material-icons-outlined"> camera_alt </span>-->
            <!--            </button>-->
            <button
              class="btn btn-sm btn-ghost btn-circle normal-case flex items-center justify-center"
              @click="openPhotoModal"
            >
              <span class="material-icons-outlined"> camera_alt </span>
            </button>
            <!-- Send Button -->
            <button
              :disabled="props.isGenerating || (!hasText && !hasAudioRecording)"
              class="btn btn-sm btn-circle btn-ghost normal-case flex items-center justify-center"
              type="button"
              @click.prevent="onRecordAudioControlClick('send')"
            >
              <!--                @click.stop="sendButtonClicked(undefined)">-->
              <span
                :class="
                  props.isGenerating ||
                  (!hasText && !hasAudioRecording ? 'text-neutral-400' : `${inputBtnColor}`)
                "
                class="material-icons-round !text-xl"
              >
                send
              </span>
            </button>

            <!--            <button v-else type="button"-->
            <!--                    class="btn btn-sm btn-circle btn-ghost normal-case flex items-center justify-center text-primary"-->
            <!--                    @click.prevent="onAudioControlClick('stop',$event)">-->
            <!--              <span class="material-icons-round !text-xl">-->
            <!--                send-->
            <!--              </span>-->
            <!--            </button>-->
          </div>

          <!-- End Send Button -->
        </div>
        <!-- End Button Group -->
      </div>
    </div>
  </div>

  <audio ref="audioElement" class="hidden" controls>
    Your browser does not support the audio element.
  </audio>
</template>

<style scoped>
.slide-fade-y-enter-active {
  transition: all 0.5s ease;
}

.slide-fade-y-leave-active {
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.slide-fade-y-enter-from,
.slide-fade-y-leave-to {
  opacity: 0;
  transform: translateY(50px);
}

.chat-area {
  bottom: 0;
  position: fixed;
}
</style>
