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
import { ChevronLeft, Play, CheckCircle2, FastForward, Trophy, Info, AlertCircle, Repeat } from 'lucide-vue-next';
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
  
  // Capture initial ratings
  const initialPlayerRatings: Record<string, number> = {};
  tournament.value.playerIds.forEach(id => {
    const player = store.players.find(p => p.id === id);
    initialPlayerRatings[id] = player?.rating ?? 1200;
  });
  
  store.updateTournament({
    ...tournament.value,
    status: 'active',
    rounds: [firstRound],
    initialPlayerRatings
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

const swapColors = (roundIndex: number, matchId: string) => {
  if (!tournament.value) return;
  const idx = roundIndex;
  const newRounds = JSON.parse(JSON.stringify(tournament.value.rounds));
  const match = newRounds[idx].matches.find((m: any) => m.id === matchId);
  if (!match) return;

  // swap players
  const tmp = match.whiteId;
  match.whiteId = match.blackId;
  match.blackId = tmp;

  // invert result if already set
  if (match.result === '1-0') match.result = '0-1';
  else if (match.result === '0-1') match.result = '1-0';

  store.updateTournament({ ...tournament.value, rounds: newRounds });
  toast.success('Cores trocadas com sucesso');
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
  // aplica ratings e marca o torneio como finalizado
  store.finalizeTournament(tournament.value!.id);
  toast.success('Torneio finalizado e ratings atualizados!');
};
</script>

<template>
  <div v-if="tournament" class="container mx-auto p-3 md:p-6 space-y-6">
    <!-- Header com Ações -->
    <div class="flex flex-col gap-4 bg-card p-3 md:p-4 rounded-xl border shadow-sm sticky top-16 z-10">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <Button variant="ghost" size="icon" class="h-8 w-8" @click="router.push('/tournaments')">
            <ChevronLeft class="w-4 h-4" />
          </Button>
          <div>
            <h1 class="text-lg sm:text-xl font-bold leading-tight break-words">{{ tournament.name }}</h1>
            <div class="flex items-center gap-2 mt-1 flex-wrap">
              <Badge :variant="tournament.status === 'active' ? 'default' : 'secondary'" class="text-[10px] h-5">
                {{ tournament.status === 'active' ? 'Em Andamento' : tournament.status === 'finished' ? 'Finalizado' : 'Planejado' }}
              </Badge>
              <span class="text-xs text-muted-foreground">{{ tournament.date }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <template v-if="tournament.status === 'planned'">
            <Button @click="startTournament" size="sm" class="w-full sm:w-auto">
              <Play class="w-4 h-4 mr-2" />
              Iniciar
            </Button>
          </template>
          
          <template v-if="tournament.status === 'active'">
            <Button variant="outline" size="sm" @click="nextRound" :disabled="!canGenerateNext" class="w-full sm:w-auto">
              <FastForward class="w-4 h-4 mr-2" />
              Próxima
            </Button>
            <Button size="sm" @click="finishTournament" :disabled="!canGenerateNext" class="w-full sm:w-auto">
              <CheckCircle2 class="w-4 h-4 mr-2" />
              Finalizar
            </Button>
          </template>
        </div>
      </div>

      <!-- Aviso de resultados pendentes -->
      <div v-if="tournament.status === 'active' && !canGenerateNext" class="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-md border border-orange-100">
        <AlertCircle class="w-3.5 h-3.5 flex-shrink-0" />
        <span>Aguardando resultados da Rodada {{ tournament.rounds.length }}</span>
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
          
          <Card class="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow class="bg-muted/50">
                  <TableHead class="w-[40%] min-w-[140px]">Brancas</TableHead>
                  <TableHead class="text-center w-[20%] min-w-[120px]">Resultado</TableHead>
                  <TableHead class="text-right w-[40%] min-w-[140px]">Pretas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="match in round.matches" :key="match.id" :class="match.isBye ? 'bg-primary/5' : ''">
                  <TableCell class="font-medium py-3 text-sm">
                    <div class="flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full bg-white border border-gray-300 flex-shrink-0" title="Brancas"></div>
                      <span class="truncate">{{ getPlayerName(match.whiteId) }}</span>
                    </div>
                  </TableCell>
                  <TableCell class="text-center py-3">
                    <div v-if="match.isBye" class="text-xs font-bold text-primary">BYE (+1.0)</div>
                    <div v-else class="flex items-center justify-center gap-1 flex-wrap">
                      <Select
                        :model-value="match.result || 'null'"
                        @update:model-value="(val) => tournament && updateResult(tournament.rounds.length - 1 - rIdx, match.id, val === 'null' ? null : val)"
                        :disabled="tournament.status === 'finished'"
                      >
                        <SelectTrigger class="w-20 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="null">-</SelectItem>
                          <SelectItem value="1-0">1 - 0</SelectItem>
                          <SelectItem value="0.5-0.5">½ - ½</SelectItem>
                          <SelectItem value="0-1">0 - 1</SelectItem>
                        </SelectContent>
                      </Select>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Button variant="ghost" size="icon" class="h-8 w-8" :disabled="tournament.status === 'finished'" @click="tournament && swapColors(tournament.rounds.length - 1 - rIdx, match.id)">
                              <Repeat class="w-3 h-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Trocar</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                  <TableCell class="text-right font-medium py-3 text-sm">
                    <div class="flex items-center justify-end gap-2">
                      <span class="truncate">{{ getPlayerName(match.blackId) }}</span>
                      <div class="w-2 h-2 rounded-full bg-black flex-shrink-0" title="Pretas"></div>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="standings">
        <Card class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow class="bg-muted/50">
                <TableHead class="w-12 text-center min-w-[48px]">Pos</TableHead>
                <TableHead class="min-w-[140px]">Jogador</TableHead>
                <TableHead class="text-center min-w-[60px]">Pts</TableHead>
                <TableHead class="text-center min-w-[50px]">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger class="flex items-center justify-center gap-1">
                        BH
                        <Info class="w-3 h-3" />
                      </TooltipTrigger>
                      <TooltipContent>Buchholz</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead class="text-center min-w-[50px]">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger class="flex items-center justify-center gap-1">
                        SB
                        <Info class="w-3 h-3" />
                      </TooltipTrigger>
                      <TooltipContent>Sonneborn-Berger</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead class="text-center min-w-[60px] text-xs">Cores</TableHead>
                <TableHead class="text-center min-w-[70px] text-xs">Rt Ini</TableHead>
                <TableHead class="text-center min-w-[70px] text-xs">Rt Fim</TableHead>
                <TableHead class="text-center min-w-[50px] text-xs">Δ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(s, idx) in standings" :key="s.playerId" :class="idx === 0 ? 'bg-yellow-500/5' : ''">
                <TableCell class="text-center text-sm">
                  <div v-if="idx === 0" class="flex justify-center"><Trophy class="w-4 h-4 text-yellow-500" /></div>
                  <span v-else class="font-bold text-muted-foreground">{{ idx + 1 }}</span>
                </TableCell>
                <TableCell class="font-medium text-sm truncate">{{ s.playerName }}</TableCell>
                <TableCell class="text-center">
                  <Badge variant="secondary" class="text-xs font-bold">{{ s.points }}</Badge>
                </TableCell>
                <TableCell class="text-center font-medium text-xs">{{ s.buchholz }}</TableCell>
                <TableCell class="text-center font-medium text-xs">{{ s.sonnebornBerger }}</TableCell>
                <TableCell class="text-center text-xs">
                  <span :class="s.colorBalance > 0 ? 'text-blue-600' : s.colorBalance < 0 ? 'text-orange-600' : ''">
                    {{ s.colorBalance > 0 ? '+' : '' }}{{ s.colorBalance }}
                  </span>
                </TableCell>
                <TableCell class="text-center font-medium text-xs">{{ s.ratingInitial }}</TableCell>
                <TableCell class="text-center font-medium text-xs">{{ s.ratingFinal }}</TableCell>
                <TableCell class="text-center text-xs">
                  <span :class="s.ratingChange > 0 ? 'text-green-600' : s.ratingChange < 0 ? 'text-red-600' : ''">
                    {{ s.ratingChange > 0 ? '+' : '' }}{{ s.ratingChange }}
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