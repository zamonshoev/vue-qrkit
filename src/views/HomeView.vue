<template>
  <section class="pt-24">
    <div
      class="container mx-auto flex flex-col items-center gap-10 px-4 sm:px-8 lg:flex-row lg:justify-center xl:px-36"
    >
      <div class="flex w-full flex-col items-center lg:w-1/2">
        <h1
          class="mb-6 text-center text-4xl font-bold transition-all duration-700 md:text-5xl"
          :class="visible.title ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
        >
          Generate &amp;
          <span class="text-transparent [-webkit-text-stroke:2px_#000]">Scan QR</span>
          with&nbsp;ease
        </h1>

        <p
          class="mb-4 text-center text-sm transition-all duration-700 md:text-base"
          :class="visible.desc ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
        >
          A fast, lightweight tool for generating and scanning QR codes — right in your browser. No
          sign-up, no limits, no tracking. Just paste a link or text and get your QR in seconds.
          Works offline, exports to SVG and PNG.
        </p>

        <ul
          class="mt-4 flex w-full justify-center divide-x divide-gray-300 border-t border-gray-300 pt-8 transition-all duration-700"
          :class="visible.stats ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
        >
          <li v-for="stat in stats" :key="stat.label" class="px-6 text-center">
            <div class="text-lg font-bold md:text-2xl">{{ stat.value }}</div>
            <div class="text-xs">{{ stat.label }}</div>
          </li>
        </ul>

        <div class="mt-12 flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
          <RouterLink
            to="/generator"
            class="rounded-lg border bg-black px-14 py-4 text-center text-sm text-white transition-all duration-200 hover:bg-gray-800"
            :class="visible.btn ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
          >
            Generate QR
          </RouterLink>
          <RouterLink
            to="/scanner"
            class="rounded-lg border border-gray-300 px-14 py-4 text-center text-sm text-gray-600 transition-all duration-200 hover:border-gray-800 hover:text-gray-900"
            :class="visible.btn ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
          >
            Scan QR
          </RouterLink>
        </div>
      </div>

      <div class="flex w-full items-center justify-center lg:w-1/2">
        <div class="w-full max-w-xs rounded-2xl p-6 shadow-2xl shadow-gray-500 sm:max-w-sm">
          <div class="grid" :style="{ gridTemplateColumns: `repeat(${size}, 1fr)` }">
            <div
              v-for="(cell, i) in cells"
              :key="i"
              class="aspect-square transition duration-300"
              :class="cell.visible && cell.on ? 'bg-gray-900' : 'scale-50 opacity-0'"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import QRCode from 'qrcode'
  import { onBeforeUnmount, onMounted, ref } from 'vue'

  const QR_CONTENT = 'https://vue-qrkit.netlify.app'

  const size = ref(21)
  const cells = ref([])
  const visible = ref({ btn: false, desc: false, stats: false, title: false })

  const stats = [
    { label: 'Free forever', value: '100%' },
    { label: 'Export formats', value: 'SVG / PNG' },
    { label: 'MIT license', value: 'Open Source' },
  ]

  let timer = null
  let interval = null

  function animate() {
    cells.value.forEach(c => (c.visible = false))
    const total = cells.value.length
    let revealed = 0
    const indices = Array.from({ length: total }, (_, i) => i).sort(() => Math.random() - 0.7)

    interval = setInterval(() => {
      for (let b = 0; b < 12 && revealed < total; b++, revealed++) {
        const cell = cells.value[indices[revealed]]
        if (cell) cell.visible = true
      }
      if (revealed >= total) {
        clearInterval(interval)
        timer = setTimeout(() => animate(), 2200)
      }
    }, 18)
  }

  async function buildPattern() {
    const data = QRCode.create(QR_CONTENT, { errorCorrectionLevel: 'M' })
    const s = data.modules.size
    const pattern = []
    for (let y = 0; y < s; y++)
      for (let x = 0; x < s; x++) pattern.push(data.modules.get(x, y) ? 1 : 0)
    return { pattern, size: s }
  }

  function revealContent() {
    const keys = ['title', 'desc', 'stats', 'btn']
    keys.forEach((key, i) => setTimeout(() => (visible.value[key] = true), 100 + i * 200))
  }

  onMounted(async () => {
    revealContent()
    const { pattern, size: s } = await buildPattern()
    size.value = s
    cells.value = pattern.map(on => ({ on: !!on, visible: false }))
    timer = setTimeout(() => animate(), 550)
  })

  onBeforeUnmount(() => {
    clearInterval(interval)
    clearTimeout(timer)
  })
</script>
