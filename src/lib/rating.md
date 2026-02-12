# Rating module

Este módulo implementa um sistema Elo básico usado para atualizar ratings dos jogadores com base nas partidas de um `Tournament`.

Principais funções:

- `expectedScore(rA, rB)` — probabilidade esperada de `A` ganhar contra `B`.
- `eloChange(rA, rB, scoreA, gamesPlayedA?)` — mudança de rating prevista para uma partida.
- `updateRatingsFromTournament(tournament, allPlayers)` — aplica todas as partidas do torneio e retorna um array de `Player` com ratings atualizados.

Integração recomendada:

Use o método `finalizeTournament(tournamentId)` exportado pelo `useChessStore` para marcar o torneio como `finished` e aplicar as mudanças de rating aos jogadores persistidos.
