<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useChessStore } from '@/stores/chessStore';
import { calculateStandings, generateNextRound } from '@/lib/chess-logic';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ChevronLeft, Play, CheckCircle2, FastForward, Trophy, Info, AlertCircle } from 'lucide-vue-next';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'vue-sonner';

const route = useRoute();
const router = useRouter();
const store = useChessStore();

const tournament = computed(() => store.tournaments.find(t => t.id === route.params.id));
const standings = computed(() => tournament.value ? calculateStandings(tournament.value, store.players) : []);

const currentRoundIdx = computed(() => tournament.value ? tournament.value.rounds.length - 1 : -1);

const isRoundFinished = (roundIdx: number) => {
  if (!tournament.value || roundIdx < 0) return false;
  return tournament.value.rounds[roundIdx].matches.every(m => m.result !== null);
};

const canGenerateNext = computed(() => {
  if (!tournament.value || tournament.value.status !== 'active') return false;
  return isRoundFinished(currentRoundIdx.value);
});

const getPlayerName = (id: string) => {
  if (id === 'BYE') return 'FOLGA (BYE)';
  return store.players.find(p => p.id === id)?.name || 'Desconhecido';
};

const startTournament = () => {
  if (!tournament.value) return;
  const firstRound = generateNextRound(tournament.value, store.players);
  store.updateTournament({
    ...tournament.value,
    status: 'active',
    rounds: [firstRound]
  });
  toast.success('Torneio iniciado!');
};

const updateResult = (roundIndex: number, matchId: string, result: any) => {
  if (!tournament.value) return;
  const newRounds = JSON.parse(JSON.stringify(tournament.value.rounds));
  const match = newRounds[roundIndex].matches.find((m: any) => m.id === matchId);
  if (match) {
    match.result = result;
    store.updateTournament({ ...tournament.value, rounds: newRounds });
  }
};

const nextRound = () => {
  if (!canGenerateNext.value) {
    toast.error('Finalize todos os resultados da rodada atual primeiro.');
    return;
  }
  const next = generateNextRound(tournament.value!, store.players);
  store.updateTournament({
    ...tournament.value!,
    rounds: [...tournament.value!.rounds, next]
  });
  toast.success(`Rodada ${next.number} gerada!`);
};

const finishTournament = () => {
  if (!canGenerateNext.value) {
    toast.error('Finalize todos os resultados antes de encerrar.');
    return;
  }
  store.updateTournament({ ...tournament.value!, status: 'finished' });
  toast.success('Torneio finalizado com sucesso!');
};
</script>

<template>
  <div v-if="tournament" class="container mx-auto p-6 space-y-6">
    <!-- Header com Ações -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-xl border shadow-sm sticky top-0 z-10">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="router.push('/tournaments')">
          <ChevronLeft class="w-4 h-4" />
        </Button>
        <div>
          <h1 class="text-xl font-bold leading-tight">{{ tournament.name }}</h1>
          <div class="flex items-center gap-2 mt-1">
            <Badge :variant="tournament.status === 'active' ? 'default' : 'secondary'" class="text-[10px] h-5">
              {{ tournament.status === 'active' ? 'Em Andamento' : tournament.status === 'finished' ? 'Finalizado' : 'Planejado' }}
            </Badge>
            <span class="text-xs text-muted-foreground">{{ tournament.date }}</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <template v-if="tournament.status === 'planned'">
          <Button @click="startTournament" size="sm">
            <Play class="w-4 h-4 mr-2" />
            Iniciar Torneio
          </Button>
        </template>
        
        <template v-if="tournament.status === 'active'">
          <div v-if="!canGenerateNext" class="hidden lg:flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded-md border border-orange-100 mr-2">
            <AlertCircle class="w-3.5 h-3.5" />
            Aguardando resultados da Rodada {{ tournament.rounds.length }}
          </div>
          
          <Button variant="outline" size="sm" @click="nextRound" :disabled="!canGenerateNext">
            <FastForward class="w-4 h-4 mr-2" />
            Próxima Rodada
          </Button>
          <Button size="sm" @click="finishTournament" :disabled="!canGenerateNext">
            <CheckCircle2 class="w-4 h-4 mr-2" />
            Finalizar
          </Button>
        </template>
      </div>
    </div>

    <div v-if="tournament.status === 'planned'" class="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl space-y-6 bg-card/50">
      <div class="bg-primary/10 p-4 rounded-full">
        <Play class="w-12 h-12 text-primary" />
      </div>
      <div class="text-center space-y-2">
        <h2 class="text-xl font-semibold">Pronto para começar?</h2>
        <p class="text-muted-foreground max-w-xs">O sistema irá gerar os pareamentos iniciais (Metade Superior vs Inferior).</p>
      </div>
      <Button size="lg" @click="startTournament" class="px-8">
        Iniciar Torneio Agora
      </Button>
    </div>

    <Tabs v-else default-value="rounds" class="w-full">
      <TabsList class="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="rounds">Rodadas e Partidas</TabsTrigger>
        <TabsTrigger value="standings">Classificação Geral</TabsTrigger>
      </TabsList>

      <TabsContent value="rounds" class="space-y-8">
        <div v-for="(round, rIdx) in [...tournament.rounds].reverse()" :key="round.number" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold">Rodada {{ round.number }}</h3>
            <Badge v-if="isRoundFinished(tournament.rounds.length - 1 - rIdx)" variant="outline" class="bg-green-500/10 text-green-600 border-green-200 text-[10px]">
              Concluída
            </Badge>
          </div>
          
          <Card class="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow class="bg-muted/50">
                  <TableHead class="w-[40%]">Brancas</TableHead>
                  <TableHead class="text-center w-[20%]">Resultado</TableHead>
                  <TableHead class="text-right w-[40%]">Pretas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="match in round.matches" :key="match.id" :class="match.isBye ? 'bg-primary/5' : ''">
                  <TableCell class="font-medium py-3">
                    <div class="flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full bg-white border border-gray-300" title="Brancas"></div>
                      <span class="text-sm">{{ getPlayerName(match.whiteId) }}</span>
                    </div>
                  </TableCell>
                  <TableCell class="text-center">
                    <div v-if="match.isBye" class="text-xs font-bold text-primary">BYE (+1.0)</div>
                    <Select 
                      v-else
                      :model-value="match.result || 'null'" 
                      @update:model-value="(val) => tournament && updateResult(tournament.rounds.length - 1 - rIdx, match.id, val === 'null' ? null : val)"
                      :disabled="tournament.status === 'finished'"
                    >
                      <SelectTrigger class="w-24 mx-auto h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="null">-</SelectItem>
                        <SelectItem value="1-0">1 - 0</SelectItem>
                        <SelectItem value="0.5-0.5">½ - ½</SelectItem>
                        <SelectItem value="0-1">0 - 1</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell class="text-right font-medium py-3">
                    <div class="flex items-center justify-end gap-2">
                      <span class="text-sm">{{ getPlayerName(match.blackId) }}</span>
                      <div class="w-2 h-2 rounded-full bg-black" title="Pretas"></div>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="standings">
        <Card>
          <Table>
            <TableHeader>
              <TableRow class="bg-muted/50">
                <TableHead class="w-16 text-center">Pos</TableHead>
                <TableHead>Jogador</TableHead>
                <TableHead class="text-center">Pontos</TableHead>
                <TableHead class="text-center">
                  <div class="flex items-center justify-center gap-1">
                    BH
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger><Info class="w-3 h-3" /></TooltipTrigger>
                        <TooltipContent>Buchholz: Soma dos pontos dos oponentes</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableHead>
                <TableHead class="text-center">
                  <div class="flex items-center justify-center gap-1">
                    SB
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger><Info class="w-3 h-3" /></TooltipTrigger>
                        <TooltipContent>Sonneborn-Berger: Soma dos pontos dos oponentes derrotados + metade dos empatados</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableHead>
                <TableHead class="text-center">Saldo Cores</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(s, idx) in standings" :key="s.playerId" :class="idx === 0 ? 'bg-yellow-500/5' : ''">
                <TableCell class="text-center">
                  <div v-if="idx === 0" class="flex justify-center"><Trophy class="w-5 h-5 text-yellow-500" /></div>
                  <span v-else class="font-bold text-muted-foreground text-sm">{{ idx + 1 }}º</span>
                </TableCell>
                <TableCell class="font-medium text-sm">{{ s.playerName }}</TableCell>
                <TableCell class="text-center">
                  <Badge variant="secondary" class="text-sm font-bold px-2">{{ s.points }}</Badge>
                </TableCell>
                <TableCell class="text-center font-medium text-sm">{{ s.buchholz }}</TableCell>
                <TableCell class="text-center font-medium text-sm">{{ s.sonnebornBerger }}</TableCell>
                <TableCell class="text-center text-sm">
                  <span :class="s.colorBalance > 0 ? 'text-blue-600' : s.colorBalance < 0 ? 'text-orange-600' : ''">
                    {{ s.colorBalance > 0 ? '+' : '' }}{{ s.colorBalance }}
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>