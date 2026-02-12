<script setup lang="ts">
import { ref } from 'vue';
import { useChessStore } from '@/stores/chessStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { UserPlus, Trash2, Users, Download, Upload, Database } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const store = useChessStore();
const newPlayerName = ref('');
const newPlayerRating = ref(1200);
const bulkPlayersText = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

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

const exportData = () => {
  const data = {
    players: store.players,
    tournaments: store.tournaments,
    exportDate: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chess-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success('Dados exportados com sucesso!');
};

const triggerImport = () => {
  fileInput.value?.click();
};

const importData = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const data = JSON.parse(content);
      
      if (data.players || data.tournaments) {
        store.importAllData(data);
        toast.success('Dados importados com sucesso!');
      } else {
        toast.error('Formato de arquivo inválido.');
      }
    } catch (err) {
      toast.error('Erro ao ler o arquivo JSON.');
    }
  };
  reader.readAsText(file);
  target.value = ''; // Reset input
};
</script>

<template>
  <div class="container mx-auto p-6 space-y-8">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Jogadores</h1>
      <div class="flex gap-2">
        <Button variant="outline" size="sm" @click="exportData">
          <Download class="w-4 h-4 mr-2" />
          Exportar JSON
        </Button>
        <Button variant="outline" size="sm" @click="triggerImport">
          <Upload class="w-4 h-4 mr-2" />
          Importar JSON
        </Button>
        <input type="file" ref="fileInput" class="hidden" accept=".json" @change="importData" />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

      <div class="space-y-6">
        <Card class="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-lg">
              <Database class="w-5 h-5" />
              Backup de Dados
            </CardTitle>
            <CardDescription>
              Como os dados são salvos localmente no navegador, use estas opções para não perder seu progresso ao trocar de dispositivo ou limpar o cache.
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="p-3 bg-background rounded-lg border text-sm space-y-1">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Jogadores:</span>
                <span class="font-bold">{{ store.players.length }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Torneios:</span>
                <span class="font-bold">{{ store.tournaments.length }}</span>
              </div>
            </div>
            <Button variant="default" class="w-full" @click="exportData">
              <Download class="w-4 h-4 mr-2" />
              Baixar Backup (.json)
            </Button>
            <Button variant="outline" class="w-full" @click="triggerImport">
              <Upload class="w-4 h-4 mr-2" />
              Restaurar Backup
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>