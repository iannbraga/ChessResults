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
import { ChevronLeft, Play, CheckCircle2, FastForward } from 'lucide-vue-next';
import { Badge } from '@/components/ui/badge';
import { toast } from 'vue-sonner';

const route = useRoute();
const router = useRouter();
const store = useChessStore();

const tournament = computed(() => store.tournaments.find(t => t.id === route.params.id));
const standings = computed(() => tournament.value ? calculateStandings(tournament.value, store.players) : []);

const getPlayerName = (id: string) => {
  if (id === 'BYE') return 'FOLGA (BYE)';
  return store.players.find(p => p.id === id)?.name || 'Desconhecido';
};

const isRoundFinished = (roundIdx: number) => {
  if (!tournament.value) return false;
  return tournament.value.rounds[roundIdx].matches.every(m => m.result !== null);
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
  if (!tournament.value) return;
  const currentRoundIdx = tournament.value.rounds.length - 1;
  if (!isRoundFinished(currentRoundIdx)) {
    toast.error('Finalize todos os resultados da rodada atual primeiro.');
    return;
  }
  const next = generateNextRound(tournament.value, store.players);
  store.updateTournament({
    ...tournament.value,
    rounds: [...tournament.value.rounds, next]
  });
  toast.success(`Rodada ${next.number} gerada!`);
};

const finishTournament = () => {
  if (!tournament.value) return;
  const currentRoundIdx = tournament.value.rounds.length - 1;
  if (!isRoundFinished(currentRoundIdx)) {
    toast.error('Finalize todos os resultados antes de encerrar.');
    return;
  }
  store.updateTournament({ ...tournament.value, status: 'finished' });
  toast.success('Torneio finalizado com sucesso!');
};
</script>

<template>
  <div v-if="tournament" class="container mx-auto p-6 space-y-8">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="router.push('/tournaments')">
          <ChevronLeft class="w-4 h-4" />
        </Button>
        <div>
          <h1 class="text-3xl font-bold">{{ tournament.name }}</h1>
          <p class="text-sm text-muted-foreground">{{ tournament.date }}</p>
        </div>
      </div>
      <Badge :variant="tournament.status === 'active' ? 'default' : 'secondary'" class="text-sm px-4 py-1">
        {{ tournament.status === 'active' ? 'Em Andamento' : tournament.status === 'finished' ? 'Finalizado' : 'Planejado' }}
      </Badge>
    </div>

    <div v-if="tournament.status === 'planned'" class="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl space-y-6 bg-card/50">
      <div class="bg-primary/10 p-4 rounded-full">
        <Play class="w-12 h-12 text-primary" />
      </div>
      <div class="text-center space-y-2">
        <h2 class="text-xl font-semibold">Pronto para começar?</h2>
        <p class="text-muted-foreground max-w-xs">O sistema irá gerar os pareamentos iniciais baseados no rating dos jogadores.</p>
      </div>
      <Button size="lg" @click="startTournament" class="px-8">
        Iniciar Torneio
      </Button>
    </div>

    <Tabs v-else default-value="rounds" class="w-full">
      <TabsList class="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="rounds">Rodadas e Partidas</TabsTrigger>
        <TabsTrigger value="standings">Classificação Geral</TabsTrigger>
      </TabsList>

      <TabsContent value="rounds" class="space-y-10">
        <div v-for="(round, rIdx) in [...tournament.rounds].reverse()" :key="round.number" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-2xl font-bold">Rodada {{ round.number }}</h3>
            <Badge v-if="isRoundFinished(tournament.rounds.length - 1 - rIdx)" variant="outline" class="bg-green-500/10 text-green-600 border-green-200">
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
                  <TableCell class="font-medium py-4">
                    <div class="flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full bg-white border border-gray-300" title="Brancas"></div>
                      {{ getPlayerName(match.whiteId) }}
                    </div>
                  </TableCell>
                  <TableCell class="text-center">
                    <div v-if="match.isBye" class="text-sm font-bold text-primary">BYE (+1.0)</div>
                    <Select 
                      v-else
                      :model-value="match.result || 'null'" 
                      @update:model-value="(val) => updateResult(tournament.rounds.length - 1 - rIdx, match.id, val === 'null' ? null : val)"
                      :disabled="tournament.status === 'finished'"
                    >
                      <SelectTrigger class="w-28 mx-auto h-9">
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
                  <TableCell class="text-right font-medium py-4">
                    <div class="flex items-center justify-end gap-2">
                      {{ getPlayerName(match.blackId) }}
                      <div class="w-2 h-2 rounded-full bg-black" title="Pretas"></div>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </div>

        <div v-if="tournament.status === 'active'" class="flex flex-col sm:flex-row justify-center gap-4 pt-8 border-t">
          <Button variant="outline" size="lg" @click="nextRound" class="sm:w-48">
            <FastForward class="w-4 h-4 mr-2" />
            Próxima Rodada
          </Button>
          <Button size="lg" @click="finishTournament" class="sm:w-48">
            <CheckCircle2 class="w-4 h-4 mr-2" />
            Finalizar Torneio
          </Button>
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
                <TableHead class="text-center">Buchholz</TableHead>
                <TableHead class="text-center">Partidas</TableHead>
                <TableHead class="text-center">Saldo Cores</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(s, idx) in standings" :key="s.playerId" :class="idx === 0 ? 'bg-yellow-500/5' : ''">
                <TableCell class="text-center">
                  <div v-if="idx === 0" class="flex justify-center"><Trophy class="w-5 h-5 text-yellow-500" /></div>
                  <span v-else class="font-bold text-muted-foreground">{{ idx + 1 }}º</span>
                </TableCell>
                <TableCell class="font-medium">{{ s.playerName }}</TableCell>
                <TableCell class="text-center">
                  <Badge variant="secondary" class="text-base font-bold px-3">{{ s.points }}</Badge>
                </TableCell>
                <TableCell class="text-center font-medium">{{ s.buchholz }}</TableCell>
                <TableCell class="text-center text-muted-foreground">{{ s.gamesPlayed }}</TableCell>
                <TableCell class="text-center">
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