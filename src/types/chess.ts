export interface Player {
  id: string;
  name: string;
  rating: number;
  withdrawn?: boolean;
  withdrawnAtRound?: number;
}

export interface Match {
  id: string;
  whiteId: string;
  blackId: string;
  result: '1-0' | '0-1' | '0.5-0.5' | null;
  isBye?: boolean;
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
  initialPlayerRatings?: Record<string, number>;
  finalPlayerRatings?: Record<string, number>;
}

export interface Standing {
  playerId: string;
  playerName: string;
  points: number;
  buchholz: number;
  sonnebornBerger: number;
  gamesPlayed: number;
  colorBalance: number;
  lastColor: 'W' | 'B' | null;
  colorStreak: number;
  hadBye: boolean;
  opponents: string[]; // Lista de IDs dos oponentes enfrentados
  ratingInitial: number;
  ratingFinal: number;
  ratingChange: number;
}