<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useChessStore } from '@/stores/chessStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Trophy, Calendar, Users, Trash2, UserPlus, UserMinus, Search, Plus, X, ArrowLeft } from 'lucide-vue-next';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const store = useChessStore();
const router = useRouter();

const showForm = ref(false);
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
  showForm.value = false;
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
  <div class="container mx-auto p-3 md:p-6 space-y-8">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
      <h1 class="text-2xl sm:text-3xl font-bold">{{ showForm ? 'Novo Torneio' : 'Torneios' }}</h1>
      <Button @click="showForm = !showForm" :variant="showForm ? 'ghost' : 'default'" class="w-full sm:w-auto">
        <component :is="showForm ? ArrowLeft : Plus" class="w-4 h-4 mr-2" />
        {{ showForm ? 'Voltar' : 'Novo' }}
      </Button>
    </div>

    <!-- Formulário de Criação -->
    <div v-if="showForm" class="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Card class="border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle>Configurações do Torneio</CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="space-y-2">
            <label class="text-sm font-medium">Nome do Torneio</label>
            <Input v-model="newName" placeholder="Ex: Torneio de Verão 2024" />
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Jogadores Disponíveis -->
            <div class="space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <label class="text-sm font-semibold flex items-center gap-2">
                  Disponíveis
                  <Badge variant="secondary">{{ availablePlayers.length }}</Badge>
                </label>
                <div class="relative w-full sm:w-40">
                  <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input v-model="searchQuery" placeholder="Buscar..." class="pl-8 h-8 text-xs" />
                </div>
              </div>
              <Card class="bg-muted/30">
                <ScrollArea class="h-[350px] p-2">
                  <div v-if="availablePlayers.length === 0" class="text-center py-10 text-muted-foreground text-sm">
                    Nenhum disponível.
                  </div>
                  <div v-for="player in availablePlayers" :key="player.id" 
                    class="flex items-center justify-between p-2 hover:bg-background rounded-md transition-colors mb-1 border border-transparent hover:border-border">
                    <div class="flex flex-col min-w-0">
                      <span class="text-sm font-medium truncate">{{ player.name }}</span>
                      <span class="text-xs text-muted-foreground">{{ player.rating }}</span>
                    </div>
                    <Button size="sm" variant="ghost" @click="addPlayer(player.id)" class="h-8 w-8 p-0 text-primary flex-shrink-0">
                      <UserPlus class="h-4 w-4" />
                    </Button>
                  </div>
                </ScrollArea>
              </Card>
            </div>

            <!-- Jogadores Adicionados -->
            <div class="space-y-3">
              <label class="text-sm font-semibold flex items-center gap-2">
                Adicionados
                <Badge variant="default">{{ addedPlayers.length }}</Badge>
              </label>
              <Card class="border-primary/20 bg-primary/5">
                <ScrollArea class="h-[350px] p-2">
                  <div v-if="addedPlayers.length === 0" class="text-center py-10 text-muted-foreground text-sm text-xs">
                    Mínimo 2 jogadores
                  </div>
                  <div v-for="player in addedPlayers" :key="player.id" 
                    class="flex items-center justify-between p-2 bg-background rounded-md shadow-sm mb-1 border border-border">
                    <div class="flex flex-col min-w-0">
                      <span class="text-sm font-medium truncate">{{ player.name }}</span>
                      <span class="text-xs text-muted-foreground">{{ player.rating }}</span>
                    </div>
                    <Button size="sm" variant="ghost" @click="removePlayer(player.id)" class="h-8 w-8 p-0 text-destructive flex-shrink-0">
                      <UserMinus class="h-4 w-4" />
                    </Button>
                  </div>
                </ScrollArea>
              </Card>
            </div>
          </div>
        </CardContent>
        <CardFooter class="border-t pt-6">
          <Button @click="handleCreate" :disabled="!newName || selectedPlayerIds.length < 2" class="w-full">
            <Trophy class="w-4 h-4 mr-2" />
            Criar ({{ selectedPlayerIds.length }} Jogadores)
          </Button>
        </CardFooter>
      </Card>
    </div>

    <!-- Listagem de Torneios -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-in fade-in duration-300">
      <Card v-for="t in store.tournaments" :key="t.id" class="hover:border-primary transition-all cursor-pointer group" @click="router.push(`/tournaments/${t.id}`)">
        <CardHeader class="pb-3">
          <div class="flex justify-between items-start gap-2">
            <CardTitle class="group-hover:text-primary transition-colors text-base truncate">{{ t.name }}</CardTitle>
            <Badge :variant="t.status === 'active' ? 'default' : 'secondary'" class="text-[10px] flex-shrink-0">
              {{ getStatusLabel(t.status) }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-2 text-sm text-muted-foreground py-2">
          <div class="flex items-center gap-2 text-xs">
            <Calendar class="w-4 h-4 flex-shrink-0" />
            {{ t.date }}
          </div>
          <div class="flex items-center gap-2 text-xs">
            <Users class="w-4 h-4 flex-shrink-0" />
            {{ t.playerIds.length }} Jogadores
          </div>
        </CardContent>
        <CardFooter class="justify-end border-t pt-3 px-6 py-3">
          <Button variant="ghost" size="icon" class="h-8 w-8 hover:bg-destructive/10" @click.stop="store.deleteTournament(t.id)">
            <Trash2 class="w-4 h-4 text-destructive" />
          </Button>
        </CardFooter>
      </Card>
      
      <div v-if="store.tournaments.length === 0" class="col-span-full py-16 sm:py-20 text-center border-2 border-dashed rounded-xl bg-muted/20 px-4">
        <Trophy class="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground mb-3" />
        <h3 class="text-base sm:text-lg font-medium">Nenhum torneio</h3>
        <p class="text-xs sm:text-sm text-muted-foreground mb-6">Comece criando seu primeiro.</p>
        <Button @click="showForm = true" size="sm">
          <Plus class="w-4 h-4 mr-2" />
          Criar Torneio
        </Button>
      </div>
    </div>
  </div>
</template>