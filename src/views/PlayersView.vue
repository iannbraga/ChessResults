<script setup lang="ts">
import { ref } from 'vue';
import { useChessStore } from '@/stores/chessStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { UserPlus, Trash2, Users, Download, Upload, Database, Pencil } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const store = useChessStore();
const newPlayerName = ref('');
const newPlayerRating = ref(1200);
const bulkPlayersText = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

// Edit player state
const editingPlayerId = ref<string | null>(null);
const editingName = ref('');
const editingRating = ref(0);

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
  }
};

const openEditDialog = (playerId: string) => {
  const player = store.players.find(p => p.id === playerId);
  if (player) {
    editingPlayerId.value = playerId;
    editingName.value = player.name;
    editingRating.value = player.rating;
  }
};

const handleSaveEdit = () => {
  if (!editingName.value.trim()) {
    toast.error('Nome não pode ser vazio');
    return;
  }

  if (editingPlayerId.value) {
    store.editPlayer(editingPlayerId.value, {
      name: editingName.value,
      rating: editingRating.value
    });
    editingPlayerId.value = null;
    toast.success('Jogador atualizado com sucesso!');
  }
};

const handleCancelEdit = () => {
  editingPlayerId.value = null;
};
</script>

<template>
  <div class="container mx-auto p-6 space-y-8">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Jogadores</h1>
    </div>

    <div class="grid gap-8">
      <div class="lg:col-span-2 space-y-8">
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
                    <label class="text-sm font-medium">Rating</label>
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
                    placeholder="Exemplo:&#10;Iann, 900&#10;Gustavo, 600" 
                    class="min-h-[150px]"
                  />
                </div>
                <Button @click="handleBulkAdd" class="w-full">
                  <Users class="w-4 h-4 mr-2" />
                  Adicionar Lista
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
                  <TableCell class="text-right space-x-2">
                    <Button variant="ghost" size="icon" @click="openEditDialog(player.id)">
                      <Pencil class="w-4 h-4 text-primary" />
                    </Button>
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
    </div>

    <!-- Edit Player Dialog -->
    <Dialog :open="editingPlayerId !== null" @update:open="(open) => !open && handleCancelEdit()">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Jogador</DialogTitle>
        </DialogHeader>
        
        <div class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">Nome</label>
            <Input v-model="editingName" placeholder="Nome do jogador" />
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-medium">Rating</label>
            <Input v-model.number="editingRating" type="number" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="handleCancelEdit">Cancelar</Button>
          <Button @click="handleSaveEdit">Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>