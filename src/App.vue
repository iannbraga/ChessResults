<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import { Trophy, Database, Menu, X } from 'lucide-vue-next';

const mobileMenuOpen = ref(false);
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background">
    <header class="border-b bg-card sticky top-0 z-50">
      <div class="container mx-auto px-6 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2 font-bold text-xl">
          <Trophy class="text-primary" />
          <span class="hidden sm:inline">ChessManager</span>
        </div>
        
        <!-- Desktop Navigation -->
        <nav class="hidden md:flex gap-6">
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

        <!-- Mobile Menu Button -->
        <button 
          @click="mobileMenuOpen = !mobileMenuOpen" 
          class="md:hidden p-2 hover:bg-muted rounded-md transition-colors"
          aria-label="Toggle menu"
        >
          <Menu v-if="!mobileMenuOpen" class="w-5 h-5" />
          <X v-else class="w-5 h-5" />
        </button>
      </div>

      <!-- Mobile Navigation -->
      <div v-if="mobileMenuOpen" class="md:hidden border-t bg-card/50 backdrop-blur-sm">
        <nav class="container mx-auto px-6 py-3 flex flex-col gap-2">
          <RouterLink 
            to="/tournaments" 
            class="text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md hover:bg-muted"
            active-class="text-primary bg-primary/10"
            @click="mobileMenuOpen = false"
          >
            Torneios
          </RouterLink>
          <RouterLink 
            to="/players" 
            class="text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md hover:bg-muted"
            active-class="text-primary bg-primary/10"
            @click="mobileMenuOpen = false"
          >
            Jogadores
          </RouterLink>
          <RouterLink 
            to="/backup" 
            class="text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md hover:bg-muted flex items-center gap-1.5"
            active-class="text-primary bg-primary/10"
            @click="mobileMenuOpen = false"
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