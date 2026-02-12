<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { Trophy, Database } from 'lucide-vue-next';
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background">
    <header class="border-b bg-card sticky top-0 z-50">
      <div class="container mx-auto px-6 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2 font-bold text-xl">
          <Trophy class="text-primary" />
          <span>ChessManager</span>
        </div>
        <nav class="flex gap-6">
          <RouterLink 
            to="/tournaments" 
            class="text-sm font-medium transition-colors hover:text-primary"
            active-class="text-primary"
          >
            Torneios
          </RouterLink>
          <RouterLink 
            to="/players" 
            class="text-sm font-medium transition-colors hover:text-primary"
            active-class="text-primary"
          >
            Jogadores
          </RouterLink>
          <RouterLink 
            to="/backup" 
            class="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1.5"
            active-class="text-primary"
          >
            <Database class="w-3.5 h-3.5" />
            Dados
          </RouterLink>
        </nav>
      </div>
    </header>

    <main class="flex-1">
      <RouterView />
    </main>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
</style>