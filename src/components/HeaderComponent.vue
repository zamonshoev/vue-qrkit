<template>
  <header class="py-4">
    <div class="container mx-auto flex flex-wrap justify-between gap-4 px-4 max-sm:justify-center">
      <RouterLink to="/" class="text-xl font-bold transition hover:text-gray-700">
        Vue QR Kit
      </RouterLink>
      <nav>
        <ul class="flex gap-4">
          <li v-for="link in links" :key="link.to">
            <RouterLink
              :to="link.to"
              :active-class="!link.exact ? 'after:scale-x-100' : undefined"
              :class="navLinkClass"
            >
              {{ link.label }}
            </RouterLink>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup>
  const links = [
    { label: 'Home', to: '/' },
    { label: 'Generator', to: '/generator' },
    { label: 'Scanner', to: '/scanner' },
  ]

  const navLinkClass = [
    'relative pb-1',
    'after:absolute after:bottom-0 after:left-0',
    'after:h-0.5 after:w-full after:bg-gray-500',
    'after:scale-x-0 after:transition-transform after:duration-300 after:ease-in-out',
    'hover:after:scale-x-100',
  ]
</script>
