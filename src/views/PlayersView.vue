<script setup lang="ts">
import { ref } from 'vue';
import { useChessStore } from '@/stores/chessStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { UserPlus, Trash2 } from 'lucide-vue-next';

const store = useChessStore();
const newPlayerName = ref('');
const newPlayerRating = ref(1200);

const handleAddPlayer = () => {
  if (!newPlayerName.value.trim()) return;
  store.addPlayer({
    name: newPlayerName.value,
    rating: newPlayerRating.value
  });
  newPlayerName.value = '';
  newPlayerRating.value = 1200;
};
</script>

<template>
  <div class="container mx-auto p-6 space-y-8">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Jogadores</h1>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Novo Jogador</CardTitle>
      </CardHeader>
      <CardContent>
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