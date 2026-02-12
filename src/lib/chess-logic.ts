import type { Player, Tournament, Match, Standing, Round } from '@/types/chess';

export function calculateStandings(tournament: Tournament, allPlayers: Player[]): Standing[] {
  const standingsMap = new Map<string, Standing>();

  // Inicializa todos os jogadores do torneio
  tournament.playerIds.forEach(id => {
    const player = allPlayers.find(p => p.id === id);
    standingsMap.set(id, {
      playerId: id,
      playerName: player?.name || 'Desconhecido',
      points: 0,
      buchholz: 0,
      gamesPlayed: 0,
      colorBalance: 0,
      lastColor: null,
      colorStreak: 0,
      hadBye: false
    });
  });

  // Primeiro passo: Calcular pontos e histórico de cores
  tournament.rounds.forEach(round => {
    round.matches.forEach(match => {
      const white = standingsMap.get(match.whiteId);
      const black = standingsMap.get(match.blackId);

      if (match.isBye) {
        if (white) {
          white.points += 1;
          white.hadBye = true;
        }
        return;
      }

      if (white && black) {
        // Histórico de cores
        white.colorBalance++;
        if (white.lastColor === 'W') white.colorStreak++;
        else white.colorStreak = 1;
        white.lastColor = 'W';

        black.colorBalance--;
        if (black.lastColor === 'B') black.colorStreak++;
        else black.colorStreak = 1;
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

  // Segundo passo: Calcular Buchholz (soma dos pontos atuais dos oponentes)
  tournament.rounds.forEach(round => {
    round.matches.forEach(match => {
      if (match.isBye) return;
      const white = standingsMap.get(match.whiteId);
      const black = standingsMap.get(match.blackId);
      if (white && black) {
        white.buchholz += black.points;
        black.buchholz += white.points;
      }
    });
  });

  return Array.from(standingsMap.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.buchholz !== a.buchholz) return b.buchholz - a.buchholz;
    // Critério de desempate final: Rating (se disponível)
    const pA = allPlayers.find(p => p.id === a.playerId);
    const pB = allPlayers.find(p => p.id === b.playerId);
    return (pB?.rating || 0) - (pA?.rating || 0);
  });
}

export function generateNextRound(tournament: Tournament, allPlayers: Player[]): Round {
  const standings = calculateStandings(tournament, allPlayers);
  const playedPairs = new Set<string>();
  tournament.rounds.forEach(r => {
    r.matches.forEach(m => {
      if (!m.isBye) {
        playedPairs.add(`${m.whiteId}-${m.blackId}`);
        playedPairs.add(`${m.blackId}-${m.whiteId}`);
      }
    });
  });

  let playersToPair = [...standings];
  const matches: Match[] = [];

  // 1. Lógica de BYE (se número ímpar)
  if (playersToPair.length % 2 !== 0) {
    // Encontra o jogador com menos pontos que ainda não teve BYE
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

  // 2. Pareamento Suíço
  const pairedIds = new Set<string>();
  
  for (let i = 0; i < playersToPair.length; i++) {
    const p1 = playersToPair[i];
    if (pairedIds.has(p1.playerId)) continue;

    let found = false;
    // Tenta encontrar o melhor par (próximo na classificação que não jogou contra)
    for (let j = i + 1; j < playersToPair.length; j++) {
      const p2 = playersToPair[j];
      if (pairedIds.has(p2.playerId)) continue;

      if (!playedPairs.has(`${p1.playerId}-${p2.playerId}`)) {
        // Define cores
        const { white, black } = decideColors(p1, p2);
        matches.push({
          id: crypto.randomUUID(),
          whiteId: white.playerId,
          blackId: black.playerId,
          result: null
        });
        pairedIds.add(p1.playerId);
        pairedIds.add(p2.playerId);
        found = true;
        break;
      }
    }

    // Fallback: Se não encontrou ninguém que não jogou, pareia com o primeiro disponível
    if (!found) {
      for (let j = i + 1; j < playersToPair.length; j++) {
        const p2 = playersToPair[j];
        if (pairedIds.has(p2.playerId)) continue;
        
        const { white, black } = decideColors(p1, p2);
        matches.push({
          id: crypto.randomUUID(),
          whiteId: white.playerId,
          blackId: black.playerId,
          result: null
        });
        pairedIds.add(p1.playerId);
        pairedIds.add(p2.playerId);
        break;
      }
    }
  }

  return {
    number: tournament.rounds.length + 1,
    matches
  };
}

function decideColors(p1: Standing, p2: Standing): { white: Standing, black: Standing } {
  // Regra 1: Evitar 3 cores iguais seguidas
  if (p1.lastColor === 'W' && p1.colorStreak >= 2) return { white: p2, black: p1 };
  if (p1.lastColor === 'B' && p1.colorStreak >= 2) return { white: p1, black: p2 };
  if (p2.lastColor === 'W' && p2.colorStreak >= 2) return { white: p1, black: p2 };
  if (p2.lastColor === 'B' && p2.colorStreak >= 2) return { white: p2, black: p1 };

  // Regra 2: Balanceamento total
  if (p1.colorBalance > p2.colorBalance) return { white: p2, black: p1 };
  if (p1.colorBalance < p2.colorBalance) return { white: p1, black: p2 };

  // Regra 3: Alternância simples baseada na última cor
  if (p1.lastColor === 'W') return { white: p2, black: p1 };
  
  // Sorteio/Padrão
  return { white: p1, black: p2 };
}