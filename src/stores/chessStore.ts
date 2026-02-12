import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { Player, Tournament } from '@/types/chess';

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
      id: crypto.randomUUID()
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

  const deleteTournament = (id: string) => {
    tournaments.value = tournaments.value.filter(t => t.id !== id);
  };

  return {
    players,
    tournaments,
    addPlayer,
    deletePlayer,
    addTournament,
    updateTournament,
    deleteTournament
  };
});