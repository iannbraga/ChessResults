<script setup lang="ts">
import { ref } from 'vue';
import { useChessStore } from '@/stores/chessStore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Download, Upload, Database, AlertTriangle, Info } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const store = useChessStore();
const fileInput = ref<HTMLInputElement | null>(null);

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
  target.value = '';
};
</script>

<template>
  <div class="container max-w-2xl mx-auto p-6 space-y-8">
    <div class="space-y-2">
      <h1 class="text-3xl font-bold">Gestão de Dados</h1>
      <p class="text-muted-foreground">Exporte ou restaure seus dados do ChessManager.</p>
    </div>

    <div class="grid gap-6">
      <Card class="border-primary/20 shadow-sm">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Database class="w-5 h-5 text-primary" />
            Backup Local
          </CardTitle>
          <CardDescription>
            Seus dados são armazenados apenas no seu navegador. Recomendamos exportar um backup regularmente.
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg border">
            <div class="text-center">
              <div class="text-2xl font-bold">{{ store.players.length }}</div>
              <div class="text-xs text-muted-foreground uppercase tracking-wider">Jogadores</div>
            </div>
            <div class="text-center border-l">
              <div class="text-2xl font-bold">{{ store.tournaments.length }}</div>
              <div class="text-xs text-muted-foreground uppercase tracking-wider">Torneios</div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <Button class="flex-1" @click="exportData">
              <Download class="w-4 h-4 mr-2" />
              Exportar Backup (.json)
            </Button>
            <Button variant="outline" class="flex-1" @click="triggerImport">
              <Upload class="w-4 h-4 mr-2" />
              Restaurar Backup
            </Button>
            <input type="file" ref="fileInput" class="hidden" accept=".json" @change="importData" />
          </div>
        </CardContent>
      </Card>

      <Card class="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900">
        <CardHeader class="pb-2">
          <CardTitle class="text-amber-800 dark:text-amber-400 flex items-center gap-2 text-base">
            <AlertTriangle class="w-4 h-4" />
            Atenção ao Restaurar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-sm text-amber-700 dark:text-amber-500">
            Ao importar um arquivo de backup, os dados atuais do seu navegador serão **substituídos** pelos dados do arquivo. Certifique-se de que o arquivo é válido.
          </p>
        </CardContent>
      </Card>

      <div class="flex items-start gap-3 p-4 text-sm text-muted-foreground bg-muted/30 rounded-lg">
        <Info class="w-4 h-4 mt-0.5 shrink-0" />
        <p>
          O ChessManager não utiliza servidores para salvar seus dados por padrão. Isso garante sua privacidade, mas exige que você cuide dos seus próprios backups.
        </p>
      </div>
    </div>
  </div>
</template>