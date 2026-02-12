import type { Player, Tournament, Match, Standing, Round } from '@/types/chess';

export function calculateStandings(tournament: Tournament, allPlayers: Player[]): Standing[] {
  const standingsMap = new Map<string, Standing>();

  // Inicializa jogadores
  tournament.playerIds.forEach(id => {
    const player = allPlayers.find(p => p.id === id);
    standingsMap.set(id, {
      playerId: id,
      playerName: player?.name || 'Desconhecido',
      points: 0,
      buchholz: 0,
      sonnebornBerger: 0,
      gamesPlayed: 0,
      colorBalance: 0,
      lastColor: null,
      colorStreak: 0,
      hadBye: false,
      opponents: []
    });
  });

  // 1. Pontos, Cores e Oponentes
  tournament.rounds.forEach(round => {
    round.matches.forEach(match => {
      const white = standingsMap.get(match.whiteId);
      const black = standingsMap.get(match.blackId);

      if (match.isBye && white) {
        white.points += 1;
        white.hadBye = true;
        return;
      }

      if (white && black) {
        white.opponents.push(black.playerId);
        black.opponents.push(white.playerId);

        // Histórico de cores
        white.colorBalance++;
        white.colorStreak = white.lastColor === 'W' ? white.colorStreak + 1 : 1;
        white.lastColor = 'W';

        black.colorBalance--;
        black.colorStreak = black.lastColor === 'B' ? black.colorStreak + 1 : 1;
        black.lastColor = 'B';

        if (match.result) {
          white.gamesPlayed++;
          black.gamesPlayed++;
          if (match.result === '1-0') white.points += 1;
          else if (match.result === '0-1') black.points += 1;
          else {
            white.points += 0.5;
            black.points += 0.5;
          }
        }
      }
    });
  });

  // 2. Buchholz e Sonneborn-Berger
  standingsMap.forEach((s, id) => {
    tournament.rounds.forEach(round => {
      round.matches.forEach(match => {
        if (match.isBye) return;
        
        const isWhite = match.whiteId === id;
        const isBlack = match.blackId === id;
        if (!isWhite && !isBlack) return;

        const opponentId = isWhite ? match.blackId : match.whiteId;
        const opponent = standingsMap.get(opponentId);
        if (!opponent) return;

        // Buchholz: Soma dos pontos dos oponentes
        s.buchholz += opponent.points;

        // Sonneborn-Berger
        if (match.result) {
          const won = (isWhite && match.result === '1-0') || (isBlack && match.result === '0-1');
          const draw = match.result === '0.5-0.5';
          if (won) s.sonnebornBerger += opponent.points;
          else if (draw) s.sonnebornBerger += (opponent.points * 0.5);
        }
      });
    });
  });

  // 3. Ordenação com Desempates
  return Array.from(standingsMap.values()).sort((a, b) => {
    // 1. Pontos
    if (b.points !== a.points) return b.points - a.points;
    // 2. Buchholz
    if (b.buchholz !== a.buchholz) return b.buchholz - a.buchholz;
    // 3. Sonneborn-Berger
    if (b.sonnebornBerger !== a.sonnebornBerger) return b.sonnebornBerger - a.sonnebornBerger;
    
    // 4. Confronto Direto (se houver)
    const match = findMatchBetween(tournament, a.playerId, b.playerId);
    if (match && match.result) {
      const aWon = (match.whiteId === a.playerId && match.result === '1-0') || (match.blackId === a.playerId && match.result === '0-1');
      const bWon = (match.whiteId === b.playerId && match.result === '1-0') || (match.blackId === b.playerId && match.result === '0-1');
      if (aWon) return -1;
      if (bWon) return 1;
    }

    // 5. Rating
    const pA = allPlayers.find(p => p.id === a.playerId);
    const pB = allPlayers.find(p => p.id === b.playerId);
    return (pB?.rating || 0) - (pA?.rating || 0);
  });
}

function findMatchBetween(tournament: Tournament, id1: string, id2: string): Match | null {
  for (const round of tournament.rounds) {
    for (const match of round.matches) {
      if ((match.whiteId === id1 && match.blackId === id2) || (match.whiteId === id2 && match.blackId === id1)) {
        return match;
      }
    }
  }
  return null;
}

export function generateNextRound(tournament: Tournament, allPlayers: Player[]): Round {
  const standings = calculateStandings(tournament, allPlayers);
  const isFirstRound = tournament.rounds.length === 0;
  
  let playersToPair = [...standings];
  const matches: Match[] = [];

  // 1. Lógica de BYE
  if (playersToPair.length % 2 !== 0) {
    for (let i = playersToPair.length - 1; i >= 0; i--) {
      if (!playersToPair[i].hadBye) {
        const byePlayer = playersToPair.splice(i, 1)[0];
        matches.push({
          id: crypto.randomUUID(),
          whiteId: byePlayer.playerId,
          blackId: 'BYE',
          result: '1-0',
          isBye: true
        });
        break;
      }
    }
  }

  // 2. Pareamento
  if (isFirstRound) {
    // Metade superior vs Metade inferior (1 vs 5, 2 vs 6...)
    const half = playersToPair.length / 2;
    for (let i = 0; i < half; i++) {
      const p1 = playersToPair[i];
      const p2 = playersToPair[i + half];
      const { white, black } = decideColors(p1, p2, true);
      matches.push({
        id: crypto.randomUUID(),
        whiteId: white.playerId,
        blackId: black.playerId,
        result: null
      });
    }
  } else {
    // Sistema Suíço Padrão
    const pairedIds = new Set<string>();
    const playedPairs = new Set<string>();
    tournament.rounds.forEach(r => r.matches.forEach(m => {
      if (!m.isBye) {
        playedPairs.add(`${m.whiteId}-${m.blackId}`);
        playedPairs.add(`${m.blackId}-${m.whiteId}`);
      }
    }));

    for (let i = 0; i < playersToPair.length; i++) {
      const p1 = playersToPair[i];
      if (pairedIds.has(p1.playerId)) continue;

      let found = false;
      for (let j = i + 1; j < playersToPair.length; j++) {
        const p2 = playersToPair[j];
        if (pairedIds.has(p2.playerId)) continue;

        if (!playedPairs.has(`${p1.playerId}-${p2.playerId}`)) {
          const { white, black } = decideColors(p1, p2, false);
          matches.push({ id: crypto.randomUUID(), whiteId: white.playerId, blackId: black.playerId, result: null });
          pairedIds.add(p1.playerId);
          pairedIds.add(p2.playerId);
          found = true;
          break;
        }
      }

      if (!found) {
        for (let j = i + 1; j < playersToPair.length; j++) {
          const p2 = playersToPair[j];
          if (pairedIds.has(p2.playerId)) continue;
          const { white, black } = decideColors(p1, p2, false);
          matches.push({ id: crypto.randomUUID(), whiteId: white.playerId, blackId: black.playerId, result: null });
          pairedIds.add(p1.playerId);
          pairedIds.add(p2.playerId);
          break;
        }
      }
    }
  }

  return { number: tournament.rounds.length + 1, matches };
}

function decideColors(p1: Standing, p2: Standing, isFirstRound: boolean): { white: Standing, black: Standing } {
  if (isFirstRound) {
    // Alterna brancas/pretas na primeira rodada baseado na posição
    return (p1.playerName.length % 2 === 0) ? { white: p1, black: p2 } : { white: p2, black: p1 };
  }

  if (p1.lastColor === 'W' && p1.colorStreak >= 2) return { white: p2, black: p1 };
  if (p1.lastColor === 'B' && p1.colorStreak >= 2) return { white: p1, black: p2 };
  if (p2.lastColor === 'W' && p2.colorStreak >= 2) return { white: p1, black: p2 };
  if (p2.lastColor === 'B' && p2.colorStreak >= 2) return { white: p2, black: p1 };

  if (p1.colorBalance > p2.colorBalance) return { white: p2, black: p1 };
  if (p1.colorBalance < p2.colorBalance) return { white: p1, black: p2 };

  return p1.lastColor === 'W' ? { white: p2, black: p1 } : { white: p1, black: p2 };
}