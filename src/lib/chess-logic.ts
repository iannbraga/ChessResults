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
      gamesPlayed: 0
    });
  });

  // Calcula pontos
  tournament.rounds.forEach(round => {
    round.matches.forEach(match => {
      if (!match.result) return;

      const white = standingsMap.get(match.whiteId);
      const black = standingsMap.get(match.blackId);

      if (white && black) {
        white.gamesPlayed++;
        black.gamesPlayed++;
        if (match.result === '1-0') {
          white.points += 1;
        } else if (match.result === '0-1') {
          black.points += 1;
        } else {
          white.points += 0.5;
          black.points += 0.5;
        }
      }
    });
  });

  // Calcula Buchholz (soma dos pontos dos oponentes)
  tournament.rounds.forEach(round => {
    round.matches.forEach(match => {
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
    return b.buchholz - a.buchholz;
  });
}

export function generateNextRound(tournament: Tournament, allPlayers: Player[]): Round {
  const standings = calculateStandings(tournament, allPlayers);
  const matches: Match[] = [];
  const pairedIds = new Set<string>();

  // Sistema Suíço Simplificado: Pareia por pontuação atual
  // Evita repetir confrontos se possível
  const playedPairs = new Set<string>();
  tournament.rounds.forEach(r => {
    r.matches.forEach(m => {
      playedPairs.add(`${m.whiteId}-${m.blackId}`);
      playedPairs.add(`${m.blackId}-${m.whiteId}`);
    });
  });

  for (let i = 0; i < standings.length; i++) {
    const playerAId = standings[i].playerId;
    if (pairedIds.has(playerAId)) continue;

    let found = false;
    for (let j = i + 1; j < standings.length; j++) {
      const playerBId = standings[j].playerId;
      if (pairedIds.has(playerBId)) continue;

      if (!playedPairs.has(`${playerAId}-${playerBId}`)) {
        matches.push({
          id: crypto.randomUUID(),
          whiteId: playerAId,
          blackId: playerBId,
          result: null
        });
        pairedIds.add(playerAId);
        pairedIds.add(playerBId);
        found = true;
        break;
      }
    }

    // Se não encontrou ninguém que ainda não jogou, pareia com o próximo disponível
    if (!found) {
      for (let j = i + 1; j < standings.length; j++) {
        const playerBId = standings[j].playerId;
        if (pairedIds.has(playerBId)) continue;
        
        matches.push({
          id: crypto.randomUUID(),
          whiteId: playerAId,
          blackId: playerBId,
          result: null
        });
        pairedIds.add(playerAId);
        pairedIds.add(playerBId);
        break;
      }
    }
  }

  return {
    number: tournament.rounds.length + 1,
    matches
  };
}