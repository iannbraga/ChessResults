export interface Player {
  id: string;
  name: string;
  rating: number;
}

export interface Match {
  id: string;
  whiteId: string;
  blackId: string;
  result: '1-0' | '0-1' | '0.5-0.5' | null;
  isBye?: boolean; // Indica se é um ponto automático por falta de par
}

export interface Round {
  number: number;
  matches: Match[];
}

export interface Tournament {
  id: string;
  name: string;
  date: string;
  playerIds: string[];
  rounds: Round[];
  status: 'planned' | 'active' | 'finished';
}

export interface Standing {
  playerId: string;
  playerName: string;
  points: number;
  buchholz: number;
  gamesPlayed: number;
  colorBalance: number; // Brancas - Pretas
  lastColor: 'W' | 'B' | null;
  colorStreak: number;
  hadBye: boolean;
}