import { createRouter, createWebHistory } from 'vue-router';
import PlayersView from '@/views/PlayersView.vue';
import TournamentsView from '@/views/TournamentsView.vue';
import TournamentDetailView from '@/views/TournamentDetailView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/tournaments' },
    { path: '/players', name: 'players', component: PlayersView },
    { path: '/tournaments', name: 'tournaments', component: TournamentsView },
    { path: '/tournaments/:id', name: 'tournament-detail', component: TournamentDetailView },
  ],
});

export default router;