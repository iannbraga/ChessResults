import type { Player, Tournament, Match } from '@/types/chess';

// Basic Elo implementation inspired by chess.com / lichess conventions.
// - expected score: 1 / (1 + 10^{(Rb-Ra)/400})
// - K-factor varies by rating / provisional status

export function expectedScore(rA: number, rB: number) {
  return 1 / (1 + Math.pow(10, (rB - rA) / 400));
}

export function kFactor(rating: number, gamesPlayed = Infinity) {
  // provisional players (few games) get higher K
  if (gamesPlayed < 30) return 40;
  if (rating < 2100) return 32;
  if (rating < 2400) return 24;
  return 16;
}

export function eloChange(rA: number, rB: number, scoreA: number, gamesPlayedA = Infinity) {
  const exp = expectedScore(rA, rB);
  const k = kFactor(rA, gamesPlayedA);
  return Math.round(k * (scoreA - exp));
}

// Process a single match updating deltas map
function processMatch(match: Match, playersMap: Map<string, Player>, deltas: Map<string, number>, gamesCount: Map<string, number>) {
  if (match.isBye) return;

  const white = playersMap.get(match.whiteId);
  const black = playersMap.get(match.blackId);
  if (!white || !black) return;

  let scoreW = 0;
  let scoreB = 0;
  if (match.result === '1-0') { scoreW = 1; scoreB = 0; }
  else if (match.result === '0-1') { scoreW = 0; scoreB = 1; }
  else if (match.result === '0.5-0.5') { scoreW = 0.5; scoreB = 0.5; }
  else return; // unfinished

  const gW = gamesCount.get(white.id) ?? 0;
  const gB = gamesCount.get(black.id) ?? 0;

  const changeW = eloChange(white.rating, black.rating, scoreW, gW);
  const changeB = eloChange(black.rating, white.rating, scoreB, gB);

  deltas.set(white.id, (deltas.get(white.id) || 0) + changeW);
  deltas.set(black.id, (deltas.get(black.id) || 0) + changeB);

  gamesCount.set(white.id, gW + 1);
  gamesCount.set(black.id, gB + 1);
}

export function updateRatingsFromTournament(tournament: Tournament, allPlayers: Player[]) {
  const playersMap = new Map<string, Player>();
  allPlayers.forEach(p => {
    // Use initialPlayerRatings if available (preserves correct history when reimporting)
    const ratingAtStart = tournament.initialPlayerRatings?.[p.id];
    const safeRating = (typeof ratingAtStart === 'number' && Number.isFinite(ratingAtStart)) 
      ? ratingAtStart 
      : (typeof p.rating === 'number' && Number.isFinite(p.rating)) ? p.rating : 1200;
    playersMap.set(p.id, { ...p, rating: safeRating });
  });

  const deltas = new Map<string, number>();
  const gamesCount = new Map<string, number>();

  tournament.rounds.forEach(r => r.matches.forEach(m => processMatch(m, playersMap, deltas, gamesCount)));

  // Apply deltas (ensure final ratings are numeric)
  const updated: Player[] = allPlayers.map(p => {
    const original = playersMap.get(p.id) || p;
    const base = (typeof original.rating === 'number' && Number.isFinite(original.rating)) ? original.rating : 1200;
    const delta = deltas.get(p.id) || 0;
    const newRating = base + delta;
    return { ...p, rating: Math.max(100, Math.round(newRating)) };
  });

  return updated;
}

export default {
  expectedScore,
  eloChange,
  updateRatingsFromTournament
};
