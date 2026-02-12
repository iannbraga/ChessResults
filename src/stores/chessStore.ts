import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { Player, Tournament } from '@/types/chess';
import { updateRatingsFromTournament } from '@/lib/rating';

export const useChessStore = defineStore('chess', () => {
  const players = ref<Player[]>(JSON.parse(localStorage.getItem('chess_players') || '[]'));
  const tournaments = ref<Tournament[]>(JSON.parse(localStorage.getItem('chess_tournaments') || '[]'));

  watch(players, (newPlayers) => {
    localStorage.setItem('chess_players', JSON.stringify(newPlayers));
  }, { deep: true });

  watch(tournaments, (newTournaments) => {
    localStorage.setItem('chess_tournaments', JSON.stringify(newTournaments));
  }, { deep: true });

  const addPlayer = (player: Omit<Player, 'id'>) => {
    players.value.push({
      ...player,
      id: crypto.randomUUID(),
      rating: typeof player.rating === 'number' && Number.isFinite(player.rating) ? player.rating : 1200
    });
  };

  const deletePlayer = (id: string) => {
    players.value = players.value.filter(p => p.id !== id);
  };

  const addTournament = (tournament: Omit<Tournament, 'id' | 'rounds' | 'status'>) => {
    tournaments.value.push({
      ...tournament,
      id: crypto.randomUUID(),
      rounds: [],
      status: 'planned'
    });
  };

  const updateTournament = (updated: Tournament) => {
    const index = tournaments.value.findIndex(t => t.id === updated.id);
    if (index !== -1) {
      tournaments.value[index] = updated;
    }
  };

  const finalizeTournament = (tournamentId: string) => {
    const t = tournaments.value.find(tt => tt.id === tournamentId);
    if (!t) return;
    if (t.status === 'finished') return;

    // Only update ratings if tournament has finished matches
    t.status = 'finished';
    const updatedPlayers = updateRatingsFromTournament(t, players.value);
    players.value = updatedPlayers;
    updateTournament(t);
  };

  const deleteTournament = (id: string) => {
    tournaments.value = tournaments.value.filter(t => t.id !== id);
  };

  const importAllData = (data: { players: Player[], tournaments: Tournament[] }) => {
    if (Array.isArray(data.players)) players.value = data.players;
    if (Array.isArray(data.tournaments)) tournaments.value = data.tournaments;
  };

  return {
    players,
    tournaments,
    addPlayer,
    deletePlayer,
    addTournament,
    updateTournament,
    deleteTournament,
    importAllData
    , finalizeTournament
  };
});