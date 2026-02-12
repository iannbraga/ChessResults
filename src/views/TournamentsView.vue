<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useChessStore } from '@/stores/chessStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Trophy, Calendar, Users, Trash2 } from 'lucide-vue-next';
import { Badge } from '@/components/ui/badge';

const store = useChessStore();
const router = useRouter();

const newName = ref('');
const selectedPlayers = ref<string[]>([]);

const handleCreate = () => {
  if (!newName.value || selectedPlayers.value.length < 2) return;
  store.addTournament({
    name: newName.value,
    date: new Date().toISOString().split('T')[0],
    playerIds: [...selectedPlayers.value]
  });
  newName.value = '';
  selectedPlayers.value = [];
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
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">Nome do Torneio</label>
          <Input v-model="newName" placeholder="Ex: Torneio de Verão 2024" />
        </div>
        
        <div class="space-y-2">
          <label class="text-sm font-medium">Selecionar Jogadores (Mínimo 2)</label>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 border rounded-md p-4 max-h-48 overflow-y-auto">
            <div v-for="player in store.players" :key="player.id" class="flex items-center space-x-2">
              <Checkbox 
                :id="player.id" 
                :checked="selectedPlayers.includes(player.id)"
                @update:checked="(val) => val ? selectedPlayers.push(player.id) : selectedPlayers = selectedPlayers.filter(id => id !== player.id)"
              />
              <label :for="player.id" class="text-sm cursor-pointer">{{ player.name }}</label>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button @click="handleCreate" :disabled="!newName || selectedPlayers.length < 2">
          <Trophy class="w-4 h-4 mr-2" />
          Criar Torneio
        </Button>
      </CardFooter>
    </Card>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card v-for="t in store.tournaments" :key="t.id" class="hover:border-primary transition-colors cursor-pointer" @click="router.push(`/tournaments/${t.id}`)">
        <CardHeader>
          <div class="flex justify-between items-start">
            <CardTitle>{{ t.name }}</CardTitle>
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
        <CardFooter class="justify-end">
          <Button variant="ghost" size="icon" @click.stop="store.deleteTournament(t.id)">
            <Trash2 class="w-4 h-4 text-destructive" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>