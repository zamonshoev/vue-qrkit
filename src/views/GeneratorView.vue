<template>
  <div class="container mx-auto px-4 pt-12 pb-12 sm:px-6 lg:px-8 lg:pt-24">
    <div class="flex flex-col gap-6 lg:flex-row lg:justify-center lg:gap-10">
      <div class="flex w-full flex-col gap-5 lg:max-w-lg">
        <h1
          class="text-center text-3xl font-bold transition-all duration-700"
          :class="visible.title ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
        >
          Generate QR-code
        </h1>

        <div
          class="rounded-xl border border-gray-300 p-4 shadow-xl transition-all duration-700 sm:p-6"
          :class="visible.panel ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
        >
          <p class="mb-4 text-sm">QR Data Type</p>

          <div class="mb-5 flex flex-wrap gap-2">
            <button
              v-for="tab in DATA_TYPES"
              :key="tab"
              @click="activeTab = tab"
              :class="[
                'rounded-md border px-3 py-2 text-sm transition-all duration-700 sm:px-4',
                activeTab === tab
                  ? 'bg-black text-white shadow-md'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-black hover:text-black',
              ]"
            >
              {{ tab }}
            </button>
          </div>

          <label class="mb-2 block text-sm" for="enterURL">{{ LABELS[activeTab] }}</label>

          <textarea
            v-model="inputValue"
            :placeholder="PLACEHOLDERS[activeTab]"
            rows="3"
            id="enterURL"
            class="mb-6 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />

          <div class="mx-auto mb-5 flex justify-center gap-4 sm:gap-6">
            <div
              v-for="picker in colorPickers"
              :key="picker.id"
              class="flex items-center gap-2 sm:gap-3"
            >
              <label :for="picker.id" class="text-sm text-gray-700 hover:text-black">{{
                picker.label
              }}</label>
              <label
                class="h-8 w-8 rounded-md border border-gray-700"
                :style="{ background: picker.color.value }"
              >
                <input :id="picker.id" type="color" v-model="picker.color.value" class="h-0 w-0" />
              </label>
            </div>
          </div>

          <div class="mb-5">
            <div class="mb-2 flex justify-between">
              <span class="text-sm">Size when downloading</span>
              <span class="text-xs">{{ size }}px</span>
            </div>
            <input
              type="range"
              min="128"
              max="512"
              step="32"
              v-model.number="size"
              class="w-full cursor-pointer accent-black"
            />
            <div class="mt-1 flex justify-between text-xs text-gray-400">
              <span>Small</span><span>Large</span>
            </div>
          </div>
        </div>

        <RouterLink
          to="/scanner"
          class="rounded-lg border bg-black py-4 text-center text-sm text-white transition-all duration-700 hover:bg-gray-700"
          :class="visible.btn ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
        >
          Scan Existing QR
        </RouterLink>
      </div>

      <div
        class="flex flex-col gap-4 pt-24 transition-all duration-700 max-lg:pt-0 lg:max-w-xs"
        :class="visible.qr ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
      >
        <div
          class="flex flex-col items-center gap-4 rounded-2xl border border-gray-300 p-6 shadow-xl"
        >
          <div class="relative justify-center overflow-hidden rounded-lg sm:h-64 sm:w-64">
            <Transition
              enter-active-class="transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              leave-active-class="transition-[opacity,transform] duration-150"
              enter-from-class="opacity-0 scale-[0.88]"
              leave-to-class="opacity-0 scale-95"
            >
              <img
                v-if="qrDataUrl && qrVisible"
                :src="qrDataUrl"
                alt="QR Code"
                class="h-full w-full [image-rendering:pixelated]"
              />
            </Transition>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            v-for="btn in downloadButtons"
            :key="btn.idle"
            @click="btn.handler()"
            :disabled="!qrDataUrl"
            class="flex-1 overflow-hidden rounded-lg bg-black px-4 py-3 text-sm text-white transition-all duration-200 hover:bg-gray-700"
          >
            <span :key="String(btn.flag.value)">{{ btn.flag.value ? btn.done : btn.idle }}</span>
          </button>
        </div>

        <button
          @click="copySVG"
          :disabled="!qrDataUrl"
          class="w-full overflow-hidden rounded-lg border border-inherit px-4 py-3 text-sm text-gray-700 transition-all duration-300 hover:text-black"
        >
          <span :key="String(justCopied)">{{
            justCopied ? 'Copied' : 'Copy SVG to Clipboard'
          }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import QRCode from 'qrcode'
  import { computed, onMounted, ref, watch } from 'vue'

  const DATA_TYPES = ['URL', 'Text', 'Phone', 'Email', 'Wi-Fi']

  const PLACEHOLDERS = {
    Email: 'hello@example.com',
    Phone: '+996 (555) 00-0-0-00',
    Text: 'Enter your text here...',
    URL: 'https://example.com',
    'Wi-Fi': 'WIFI:S:MyNetwork;T:WPA;P:password;;',
  }

  const LABELS = {
    Email: 'Enter email address:',
    Phone: 'Enter phone number:',
    Text: 'Enter text:',
    URL: 'Enter URL:',
    'Wi-Fi': 'Enter Wi-Fi credentials:',
  }

  const activeTab = ref('URL')
  const inputValue = ref('')
  const qrColor = ref('#000000')
  const bgColor = ref('#ffffff')
  const size = ref(256)
  const qrDataUrl = ref('')
  const qrVisible = ref(false)
  const justCopied = ref(false)
  const justDownloadedSVG = ref(false)
  const justDownloadedPNG = ref(false)
  const debounceTimer = ref(null)
  const visible = ref({ btn: false, panel: false, qr: false, title: false })

  onMounted(() => {
    const keys = ['title', 'panel', 'qr', 'btn']
    keys.forEach((key, i) => setTimeout(() => (visible.value[key] = true), 100 + i * 150))
  })

  const qrText = computed(() => inputValue.value.trim() || PLACEHOLDERS[activeTab.value])

  function generateQR() {
    qrVisible.value = false
    QRCode.toDataURL(qrText.value, {
      color: { dark: qrColor.value, light: bgColor.value },
      errorCorrectionLevel: 'H',
      margin: 2,
      width: size.value,
    })
      .then(dataUrl => {
        qrDataUrl.value = dataUrl
        setTimeout(() => (qrVisible.value = true), 120)
      })
      .catch(console.error)
  }

  function makeSVG() {
    const data = QRCode.create(qrText.value, { errorCorrectionLevel: 'H' })
    const s = data.modules.size
    const margin = 2
    const total = s + margin * 2
    const rects = []

    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        if (data.modules.get(x, y)) {
          rects.push(
            `<rect x="${x + margin}" y="${y + margin}" width="1" height="1" fill="${qrColor.value}"/>`
          )
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges">
      <rect width="${total}" height="${total}" fill="${bgColor.value}"/>
        ${rects.join('\n  ')}
    </svg>`
  }

  function scheduleGenerate(delay = 0) {
    clearTimeout(debounceTimer.value)
    debounceTimer.value = setTimeout(generateQR, delay)
  }

  watch(inputValue, () => scheduleGenerate(400))
  watch(activeTab, () => {
    inputValue.value = ''
    scheduleGenerate()
  })
  watch([qrColor, bgColor, size], () => scheduleGenerate(), { immediate: true })

  function downloadFile(content, filename, isBlob = false) {
    const a = document.createElement('a')
    a.href = isBlob ? URL.createObjectURL(new Blob([content], { type: 'image/svg+xml' })) : content
    a.download = filename
    a.click()
    if (isBlob) URL.revokeObjectURL(a.href)
  }

  function withFeedback(flagRef, fn) {
    fn()
    flagRef.value = true
    setTimeout(() => (flagRef.value = false), 2000)
  }

  const downloadPNG = () =>
    qrDataUrl.value &&
    withFeedback(justDownloadedPNG, () => downloadFile(qrDataUrl.value, 'qrcode.png'))
  const downloadSVG = () =>
    qrDataUrl.value &&
    withFeedback(justDownloadedSVG, () => downloadFile(makeSVG(), 'qrcode.svg', true))
  const copySVG = () =>
    qrDataUrl.value && withFeedback(justCopied, () => navigator.clipboard.writeText(makeSVG()))

  const downloadButtons = [
    { done: 'Saved', flag: justDownloadedSVG, handler: downloadSVG, idle: 'Download SVG' },
    { done: 'Saved', flag: justDownloadedPNG, handler: downloadPNG, idle: 'Download PNG' },
  ]

  const colorPickers = [
    { color: qrColor, id: 'qrColor', label: 'QR Color' },
    { color: bgColor, id: 'bgColor', label: 'Background' },
  ]
</script>
