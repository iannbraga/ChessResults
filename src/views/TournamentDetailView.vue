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
import { ChevronLeft, Play, CheckCircle2 } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const store = useChessStore();

const tournament = computed(() => store.tournaments.find(t => t.id === route.params.id));
const standings = computed(() => tournament.value ? calculateStandings(tournament.value, store.players) : []);

const getPlayerName = (id: string) => store.players.find(p => p.id === id)?.name || 'Desconhecido';

const startTournament = () => {
  if (!tournament.value) return;
  const firstRound = generateNextRound(tournament.value, store.players);
  store.updateTournament({
    ...tournament.value,
    status: 'active',
    rounds: [firstRound]
  });
};

const updateResult = (roundIndex: number, matchId: string, result: any) => {
  if (!tournament.value) return;
  const newRounds = [...tournament.value.rounds];
  const match = newRounds[roundIndex].matches.find(m => m.id === matchId);
  if (match) {
    match.result = result;
    store.updateTournament({ ...tournament.value, rounds: newRounds });
  }
};

const nextRound = () => {
  if (!tournament.value) return;
  const next = generateNextRound(tournament.value, store.players);
  store.updateTournament({
    ...tournament.value,
    rounds: [...tournament.value.rounds, next]
  });
};

const finishTournament = () => {
  if (!tournament.value) return;
  store.updateTournament({ ...tournament.value, status: 'finished' });
};
</script>

<template>
  <div v-if="tournament" class="container mx-auto p-6 space-y-8">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="router.push('/tournaments')">
        <ChevronLeft class="w-4 h-4" />
      </Button>
      <h1 class="text-3xl font-bold">{{ tournament.name }}</h1>
    </div>

    <div v-if="tournament.status === 'planned'" class="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg space-y-4">
      <p class="text-muted-foreground">O torneio ainda não começou.</p>
      <Button size="lg" @click="startTournament">
        <Play class="w-4 h-4 mr-2" />
        Iniciar Torneio
      </Button>
    </div>

    <Tabs v-else default-value="rounds" class="w-full">
      <TabsList class="grid w-full grid-cols-2">
        <TabsTrigger value="rounds">Rodadas</TabsTrigger>
        <TabsTrigger value="standings">Classificação</TabsTrigger>
      </TabsList>

      <TabsContent value="rounds" class="space-y-6 pt-4">
        <div v-for="(round, rIdx) in tournament.rounds" :key="round.number" class="space-y-4">
          <h3 class="text-xl font-semibold">Rodada {{ round.number }}</h3>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brancas</TableHead>
                  <TableHead class="text-center">Resultado</TableHead>
                  <TableHead class="text-right">Pretas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="match in round.matches" :key="match.id">
                  <TableCell class="font-medium">{{ getPlayerName(match.whiteId) }}</TableCell>
                  <TableCell class="text-center">
                    <Select 
                      :model-value="match.result || 'null'" 
                      @update:model-value="(val) => updateResult(rIdx, match.id, val === 'null' ? null : val)"
                      :disabled="tournament.status === 'finished'"
                    >
                      <SelectTrigger class="w-32 mx-auto">
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
                  <TableCell class="text-right font-medium">{{ getPlayerName(match.blackId) }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </div>

        <div v-if="tournament.status === 'active'" class="flex justify-center gap-4 pt-4">
          <Button variant="outline" @click="nextRound">Próxima Rodada</Button>
          <Button @click="finishTournament">
            <CheckCircle2 class="w-4 h-4 mr-2" />
            Finalizar Torneio
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="standings" class="pt-4">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-12">Pos</TableHead>
                <TableHead>Jogador</TableHead>
                <TableHead class="text-center">Pontos</TableHead>
                <TableHead class="text-center">Buchholz</TableHead>
                <TableHead class="text-center">Partidas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(s, idx) in standings" :key="s.playerId">
                <TableCell class="font-bold">{{ idx + 1 }}º</TableCell>
                <TableCell>{{ s.playerName }}</TableCell>
                <TableCell class="text-center font-bold">{{ s.points }}</TableCell>
                <TableCell class="text-center">{{ s.buchholz }}</TableCell>
                <TableCell class="text-center">{{ s.gamesPlayed }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>