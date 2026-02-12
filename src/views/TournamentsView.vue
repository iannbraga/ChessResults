<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useChessStore } from '@/stores/chessStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Trophy, Calendar, Users, Trash2, UserPlus, UserMinus, Search } from 'lucide-vue-next';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const store = useChessStore();
const router = useRouter();

const newName = ref('');
const selectedPlayerIds = ref<string[]>([]);
const searchQuery = ref('');

const availablePlayers = computed(() => {
  return store.players.filter(p => 
    !selectedPlayerIds.value.includes(p.id) && 
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const addedPlayers = computed(() => {
  return store.players.filter(p => selectedPlayerIds.value.includes(p.id));
});

const addPlayer = (id: string) => {
  if (!selectedPlayerIds.value.includes(id)) {
    selectedPlayerIds.value.push(id);
  }
};

const removePlayer = (id: string) => {
  selectedPlayerIds.value = selectedPlayerIds.value.filter(playerId => playerId !== id);
};

const handleCreate = () => {
  if (!newName.value || selectedPlayerIds.value.length < 2) return;
  store.addTournament({
    name: newName.value,
    date: new Date().toISOString().split('T')[0],
    playerIds: [...selectedPlayerIds.value]
  });
  newName.value = '';
  selectedPlayerIds.value = [];
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    planned: 'Planejado',
    active: 'Em Andamento',
    finished: 'Finalizado'
  };
  return labels[status] || status;
};
</script>

<template>
  <div class="container mx-auto p-6 space-y-8">
    <h1 class="text-3xl font-bold">Torneios</h1>

    <Card>
      <CardHeader>
        <CardTitle>Criar Novo Torneio</CardTitle>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="space-y-2">
          <label class="text-sm font-medium">Nome do Torneio</label>
          <Input v-model="newName" placeholder="Ex: Torneio de Verão 2024" />
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Jogadores Disponíveis -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="text-sm font-semibold flex items-center gap-2">
                Jogadores Disponíveis
                <Badge variant="secondary">{{ availablePlayers.length }}</Badge>
              </label>
              <div class="relative w-40">
                <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input v-model="searchQuery" placeholder="Buscar..." class="pl-8 h-8 text-xs" />
              </div>
            </div>
            <Card class="bg-muted/30">
              <ScrollArea class="h-[300px] p-2">
                <div v-if="availablePlayers.length === 0" class="text-center py-10 text-muted-foreground text-sm">
                  Nenhum jogador disponível.
                </div>
                <div v-for="player in availablePlayers" :key="player.id" 
                  class="flex items-center justify-between p-2 hover:bg-background rounded-md transition-colors mb-1 border border-transparent hover:border-border">
                  <div class="flex flex-col">
                    <span class="text-sm font-medium">{{ player.name }}</span>
                    <span class="text-xs text-muted-foreground">Rating: {{ player.rating }}</span>
                  </div>
                  <Button size="sm" variant="ghost" @click="addPlayer(player.id)" class="h-8 w-8 p-0 text-primary">
                    <UserPlus class="h-4 w-4" />
                  </Button>
                </div>
              </ScrollArea>
            </Card>
          </div>

          <!-- Jogadores Adicionados -->
          <div class="space-y-3">
            <label class="text-sm font-semibold flex items-center gap-2">
              Jogadores Adicionados
              <Badge variant="default">{{ addedPlayers.length }}</Badge>
            </label>
            <Card class="border-primary/20 bg-primary/5">
              <ScrollArea class="h-[300px] p-2">
                <div v-if="addedPlayers.length === 0" class="text-center py-10 text-muted-foreground text-sm">
                  Adicione pelo menos 2 jogadores.
                </div>
                <div v-for="player in addedPlayers" :key="player.id" 
                  class="flex items-center justify-between p-2 bg-background rounded-md shadow-sm mb-1 border border-border">
                  <div class="flex flex-col">
                    <span class="text-sm font-medium">{{ player.name }}</span>
                    <span class="text-xs text-muted-foreground">Rating: {{ player.rating }}</span>
                  </div>
                  <Button size="sm" variant="ghost" @click="removePlayer(player.id)" class="h-8 w-8 p-0 text-destructive">
                    <UserMinus class="h-4 w-4" />
                  </Button>
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </CardContent>
      <CardFooter class="border-t pt-6">
        <Button @click="handleCreate" :disabled="!newName || selectedPlayerIds.length < 2" class="w-full md:w-auto">
          <Trophy class="w-4 h-4 mr-2" />
          Criar Torneio com {{ selectedPlayerIds.length }} Jogadores
        </Button>
      </CardFooter>
    </Card>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card v-for="t in store.tournaments" :key="t.id" class="hover:border-primary transition-all cursor-pointer group" @click="router.push(`/tournaments/${t.id}`)">
        <CardHeader>
          <div class="flex justify-between items-start">
            <CardTitle class="group-hover:text-primary transition-colors">{{ t.name }}</CardTitle>
            <Badge :variant="t.status === 'active' ? 'default' : 'secondary'">
              {{ getStatusLabel(t.status) }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-2 text-sm text-muted-foreground">
          <div class="flex items-center">
            <Calendar class="w-4 h-4 mr-2" />
            {{ t.date }}
          </div>
          <div class="flex items-center">
            <Users class="w-4 h-4 mr-2" />
            {{ t.playerIds.length }} Jogadores
          </div>
        </CardContent>
        <CardFooter class="justify-end border-t pt-4">
          <Button variant="ghost" size="icon" @click.stop="store.deleteTournament(t.id)" class="hover:bg-destructive/10">
            <Trash2 class="w-4 h-4 text-destructive" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>