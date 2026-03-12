<template>
  <div class="container mx-auto px-4 py-16 sm:px-8 xl:px-64">
    <h1
      class="mb-10 text-center text-4xl font-bold transition-all duration-700 sm:text-5xl"
      :class="visible.title ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'"
    >
      Scan QR-code
    </h1>

    <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
      <div
        class="w-full flex-col gap-5 transition-all duration-700 lg:max-w-lg"
        :class="visible.left ? 'translate-x-0 opacity-100' : '-translate-x-6 opacity-0'"
      >
        <div class="rounded-xl border border-gray-300 p-6 shadow-xl">
          <p class="mb-4 text-sm text-gray-700">Scanner Source</p>

          <div class="mb-5 flex gap-2">
            <button
              v-for="tab in TABS"
              :key="tab"
              @click="handleTabChange(tab)"
              :class="[
                'rounded-md border px-4 py-1.5 text-sm transition-colors duration-200',
                activeTab === tab
                  ? 'border-black bg-black text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-black hover:text-black',
              ]"
            >
              {{ tab }}
            </button>
          </div>

          <div
            class="overflow-hidden transition-all duration-300"
            :class="transitioning ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'"
          >
            <div
              v-if="activeTab === 'Camera'"
              class="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-gray-100"
            >
              <video
                ref="videoRef"
                class="h-full w-full rounded-xl object-cover"
                :class="scanning ? 'block' : 'hidden'"
                muted
                playsinline
              />
              <div v-if="!scanning" class="flex flex-col items-center gap-3 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-14 w-14"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="1.2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3 7V5a2 2 0 012-2h2M3 17v2a2 2 0 002 2h2m10-16h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2"
                  />
                  <rect x="7" y="7" width="4" height="4" rx="0.5" stroke-width="1.3" />
                  <rect x="13" y="7" width="4" height="4" rx="0.5" stroke-width="1.3" />
                  <rect x="7" y="13" width="4" height="4" rx="0.5" stroke-width="1.3" />
                  <path stroke-linecap="round" stroke-width="1.3" d="M13 15h4" />
                </svg>
                <span class="text-sm">Allow Access</span>
              </div>
            </div>

            <div v-else-if="activeTab === 'Upload Image File'">
              <div
                class="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-12 transition hover:border-gray-500"
                @click="fileInputRef?.click()"
                @dragover.prevent
                @drop.prevent="handleDrop"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-10 w-10 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="1.4"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0L8 8m4-4l4 4"
                  />
                </svg>
                <p class="text-sm text-gray-500">Click or drag & drop an image with QR code</p>
                <p class="text-xs text-gray-400">PNG, JPG, GIF, WEBP</p>
              </div>
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleFileUpload"
              />
            </div>
          </div>

          <p v-if="error" class="mt-3 text-sm text-red-500">{{ error }}</p>
        </div>

        <button
          v-if="!result"
          @click="handleStartScan"
          :disabled="scanning || activeTab === 'Upload Image File'"
          class="mt-5 w-full rounded-lg bg-black py-4 text-sm text-white transition hover:bg-gray-800 active:scale-[0.99] disabled:opacity-50"
        >
          <span v-if="scanning" class="flex items-center justify-center gap-2">
            <svg
              class="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Scanning...
          </span>
          <span v-else>{{ activeTab === 'Camera' ? 'Start Scanning' : 'Upload Image' }}</span>
        </button>
      </div>

      <div
        class="w-full flex-col gap-4 transition-all duration-700 lg:max-w-sm"
        :class="visible.right ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'"
      >
        <div
          v-if="!result"
          class="flex min-h-56 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 p-10 text-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-10 w-10 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p class="text-sm text-gray-400">Result will appear here</p>
        </div>

        <div v-else class="flex flex-col gap-3">
          <div class="rounded-2xl border border-gray-300 bg-white p-6 shadow-xl">
            <p class="mb-3 text-xs tracking-widest text-gray-400 uppercase">Decoded result</p>
            <p class="font-mono text-sm leading-relaxed break-all text-gray-900">{{ result }}</p>
            <div v-if="result.startsWith('http')" class="mt-4 border-t border-gray-100 pt-4">
              <a
                :href="result"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-xs text-gray-700 transition hover:border-gray-800 hover:text-gray-900"
              >
                Open link
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M18 13v6a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h6M15 3h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>

          <button
            @click="copyResult"
            class="rounded-lg bg-black py-3 text-sm text-white transition hover:bg-gray-800 active:scale-[0.99]"
          >
            {{ copied ? 'Copied' : 'Copy to Clipboard' }}
          </button>
          <button
            @click="scanAnother"
            class="rounded-lg border border-gray-300 py-3 text-sm text-gray-700 transition hover:border-gray-800 hover:text-gray-900 active:scale-[0.99]"
          >
            Scan Another
          </button>
          <button
            @click="router.push('/generator')"
            class="rounded-lg border border-gray-300 py-3 text-sm text-gray-700 transition hover:border-gray-800 hover:text-gray-900 active:scale-[0.99]"
          >
            Generate New QR
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { BrowserMultiFormatReader } from '@zxing/browser'
  import { onMounted, onUnmounted, ref } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()

  const activeTab = ref('Camera')
  const transitioning = ref(false)
  const scanning = ref(false)
  const result = ref('')
  const error = ref('')
  const videoRef = ref(null)
  const fileInputRef = ref(null)
  const copied = ref(false)
  const visible = ref({ left: false, right: false, title: false })

  let codeReader = null
  let streamRef = null
  let scanActive = false

  const TABS = ['Camera', 'Upload Image File']

  onMounted(() => {
    const keys = ['title', 'left', 'right']
    keys.forEach((key, i) => setTimeout(() => (visible.value[key] = true), 100 + i * 150))
  })

  async function copyResult() {
    if (!result.value) return
    await navigator.clipboard.writeText(result.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  }

  async function decodeFile(file) {
    if (!file) return
    error.value = ''
    result.value = ''
    scanning.value = true
    try {
      const imgUrl = URL.createObjectURL(file)
      const res = await new BrowserMultiFormatReader().decodeFromImageUrl(imgUrl)
      result.value = res.getText()
      URL.revokeObjectURL(imgUrl)
    } catch {
      error.value = 'No QR code found in the image.'
    } finally {
      scanning.value = false
    }
  }

  function handleDrop(event) {
    decodeFile(event.dataTransfer.files?.[0])
  }

  function handleFileUpload(event) {
    decodeFile(event.target.files?.[0])
    event.target.value = ''
  }

  function handleStartScan() {
    if (activeTab.value === 'Camera') startCamera()
    else fileInputRef.value?.click()
  }

  function handleTabChange(tab) {
    if (tab === activeTab.value || transitioning.value) return
    stopCamera()
    result.value = ''
    error.value = ''
    transitioning.value = true
    setTimeout(() => {
      activeTab.value = tab
      transitioning.value = false
    }, 260)
  }

  function scanAnother() {
    stopCamera()
    result.value = ''
    error.value = ''
    copied.value = false
  }

  async function startCamera() {
    error.value = ''
    result.value = ''
    scanning.value = true
    scanActive = true
    try {
      codeReader = new BrowserMultiFormatReader()
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef = stream
      if (videoRef.value) {
        videoRef.value.srcObject = stream
        videoRef.value.play()
      }
      codeReader.decodeFromStream(stream, videoRef.value, res => {
        if (res && scanActive) {
          result.value = res.getText()
          stopCamera()
        }
      })
    } catch {
      error.value = 'Camera access denied or not available.'
      scanning.value = false
    }
  }

  function stopCamera() {
    scanActive = false
    streamRef?.getTracks().forEach(t => t.stop())
    streamRef = null
    codeReader?.reset?.()
    codeReader = null
    scanning.value = false
  }

  onUnmounted(() => stopCamera())
</script>
