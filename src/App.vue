<script setup lang="ts">
import MadeWithDyad from './components/MadeWithDyad.vue';
</script>

<template>
  <div class="app-layout">
    <main class="main-content">
      <h1>Starting Page</h1>
    </main>
    <MadeWithDyad />
  </div>
</template>

<style scoped>
main {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  padding: 2rem;
  text-align: center;
}

h1 {
  font-weight: 500;
  margin: 0;
  font-size: 2rem;
}

.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
}

.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}
</style>
