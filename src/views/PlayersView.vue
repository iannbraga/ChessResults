<script setup lang="ts">
import { ref } from 'vue';
import { useChessStore } from '@/stores/chessStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { UserPlus, Trash2, Users } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const store = useChessStore();
const newPlayerName = ref('');
const newPlayerRating = ref(1200);
const bulkPlayersText = ref('');

const handleAddPlayer = () => {
  if (!newPlayerName.value.trim()) return;
  store.addPlayer({
    name: newPlayerName.value,
    rating: newPlayerRating.value
  });
  newPlayerName.value = '';
  newPlayerRating.value = 1200;
  toast.success('Jogador adicionado com sucesso!');
};

const handleBulkAdd = () => {
  const lines = bulkPlayersText.value.split('\n');
  let addedCount = 0;

  lines.forEach(line => {
    const parts = line.split(',');
    if (parts.length >= 1) {
      const name = parts[0].trim();
      if (!name) return;
      
      let rating = 1200;
      if (parts.length >= 2) {
        const parsedRating = parseInt(parts[1].trim());
        if (!isNaN(parsedRating)) {
          rating = parsedRating;
        }
      }
      
      store.addPlayer({ name, rating });
      addedCount++;
    }
  });

  if (addedCount > 0) {
    bulkPlayersText.value = '';
    toast.success(`${addedCount} jogadores adicionados com sucesso!`);
  } else {
    toast.error('Nenhum jogador válido encontrado no texto.');
  }
};
</script>

<template>
  <div class="container mx-auto p-6 space-y-8">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Jogadores</h1>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Adicionar Jogadores</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs default-value="single" class="w-full">
          <TabsList class="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="single">Individual</TabsTrigger>
            <TabsTrigger value="bulk">Em Lote (Lista)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single">
            <form @submit.prevent="handleAddPlayer" class="flex gap-4 items-end">
              <div class="flex-1 space-y-2">
                <label class="text-sm font-medium">Nome</label>
                <Input v-model="newPlayerName" placeholder="Nome do jogador" />
              </div>
              <div class="w-32 space-y-2">
                <label class="text-sm font-medium">Rating Inicial</label>
                <Input v-model.number="newPlayerRating" type="number" />
              </div>
              <Button type="submit">
                <UserPlus class="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="bulk" class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Cole a lista (Nome, Rating)</label>
              <Textarea 
                v-model="bulkPlayersText" 
                placeholder="Exemplo:&#10;Iann, 900&#10;Gustavo, 600&#10;João Paulo, 1200" 
                class="min-h-[150px]"
              />
              <p class="text-xs text-muted-foreground">Dica: Um jogador por linha. O rating é opcional (padrão 1200).</p>
            </div>
            <Button @click="handleBulkAdd" class="w-full">
              <Users class="w-4 h-4 mr-2" />
              Adicionar Lista de Jogadores
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead class="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="player in store.players" :key="player.id">
              <TableCell class="font-medium">{{ player.name }}</TableCell>
              <TableCell>{{ player.rating }}</TableCell>
              <TableCell class="text-right">
                <Button variant="ghost" size="icon" @click="store.deletePlayer(player.id)">
                  <Trash2 class="w-4 h-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow v-if="store.players.length === 0">
              <TableCell colspan="3" class="text-center text-muted-foreground py-8">
                Nenhum jogador cadastrado.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>