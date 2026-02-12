# Chess Results - Sistema de Torneios

Aplicação para gerenciar torneios de xadrez com emparceiramento automático e cálculo de ratings.

## Sistema de Emparceiramento

### Primeira Rodada
- **Sistema de Chaves**: Os jogadores são divididos em 2 grupos iguais
- A metade superior é pareada contra a metade inferior (1º vs 5º, 2º vs 6º, etc.)
- As cores (brancas/pretas) são alternadas com base no comprimento do nome do jogador

### Rodadas Seguintes (Sistema Suíço)

1. **Ordenação**: Jogadores são classificados por:
   - Pontuação total
   - Buchholz (soma dos pontos dos oponentes)
   - Sonneborn-Berger (soma dos pontos dos oponentes em confrontos vencidos/empatados)
   - Confronto direto
   - Rating

2. **Pareamento**: 
   - Percorre os jogadores ordenados
   - Tenta parear com o próximo jogador que **ainda não jogou**
   - Se não encontrar, pareça com o próximo disponível mesmo que tenham jogado

3. **Atribuição de Cores** (inteligente):
   - **Quebra de sequências**: Se um jogador teve 2+ rodadas consecutivas com a mesma cor, recebe a oposta
   - **Equilíbrio de cores**: Se um jogador tem mais brancas que pretas (ou vice-versa), recebe a cor menos jogada
   - **Último movimento**: Se tudo estiver empatado, alterna com base na cor anterior

### Caso Especial - BYE
Se o número de jogadores for ímpar, o jogador com maior pontuação que ainda não teve BYE recebe pausa forçada (1 ponto automático).

## Critérios de Desempate

A classificação final segue este critério de desempate (em ordem):

1. **Pontuação**: Número total de pontos (vitória = 1, empate = 0.5, derrota = 0)
2. **Buchholz**: Soma dos pontos obtidos por todos os oponentes enfrentados
3. **Sonneborn-Berger**: Soma dos pontos dos oponentes apenas nos confrontos onde o jogador venceu ou empatou
4. **Confronto Direto**: Resultado do jogo entre os dois jogadores (se aplicável)
5. **Rating**: Força de jogo inicial (rating mais alto vence)

## Guia de Uso - Passo a Passo

### 1. Criar Torneio
- Acesse a seção "Torneios"
- Clique em "Criar Novo Torneio"
- Preencha as informações:
  - **Nome**: Identificação do torneio
  - **Data**: Data de início
  - **Quantidade de Rodadas**: Número pretendido de rodadas
  - **Participantes**: Selecione os jogadores
  - **Ratings Iniciais** (opcional): Defina ratings customizados para este torneio

### 2. Gerar Rodadas
- Abra o torneio criado
- Clique em "Gerar Próxima Rodada"
- O sistema automaticamente:
  - Calcula a classificação atual
  - Evita remeches desnecessários
  - Balanceia cores de forma inteligente
  - Distribui BYE equitativamente
  
### 3. Registrar Resultados
- Na rodada visível, registre o resultado de cada partida:
  - **1-0**: Vitória do jogador de brancas
  - **0-1**: Vitória do jogador de pretas
  - **0.5-0.5**: Empate (ou **½-½**)
  - Deixe em branco se não foi jogada

### 4. Visualizar Classificação
- A classificação atualiza automaticamente após registrar resultados
- Mostra:
  - Posição no torneio
  - Pontos totais
  - Oponentes enfrentados
  - Histórico de cores (para evitar desbalanceamento)
  - Tiebreaks (Buchholz, Sonneborn-Berger)

### 5. Finalizar Torneio
- Clique em "Finalizar Torneio" após a última rodada
- Os ratings dos jogadores são atualizados automaticamente
- Os dados são salvos permanentemente

## Cálculo de Ratings

O sistema utiliza a **Fórmula Elo Padrão FIDE**:

```
Novo Rating = Rating Anterior + K × (Resultado - Expectativa)
```

Onde:
- **K**: Fator de ganho (depende do rating e número de partidas)
- **Resultado**: 1 = vitória, 0.5 = empate, 0 = derrota
- **Expectativa**: Probabilidade esperada de vitória baseada na diferença de ratings

### Fator K
- K = 40 para jogadores com rating < 2400
- K = 20 para jogadores com rating ≥ 2400
- K = 80 para jogadores iniciantes ou com poucas partidas

## Funcionalidades Principais

### Gerenciamento de Jogadores
- Adicionar/Remover jogadores
- Visualizar histórico de ratings
- Importar lista de participantes

### Gerenciamento de Torneios
- Múltiplos torneios simultâneos
- Histórico completo de rodadas
- Relatórios e estatísticas
- Exportar dados
- Restaurar/Backup de dados

### Sistema Inteligente de Emparceiramento
- Prioriza encontros que ainda não ocorreram
- Mantém equilíbrio de cores
- Quebra sequências de mesma cor (2 rodadas+)
- Distribui BYE equitativamente
- Respeita força relativa dos jogadores (Sistema Suíço)

## Participantes

David Gonçalves da Silva Moura, 500
Luiz Henrique Alves, 500
Kauê Bueno Reis, 500
Kaua licurgo, 500
Izaias Meneses Uchôa, 500
Maria Luiza da Silva Costa, 500
Victor da Silva Costa, 500
Parazin, 500
Rangel Cavalcante Costa, 500
André Luis Portuguez Costa, 500
Harthur Cirqueira de Souza, 500
Luyki Lopes, 881
Lucas Giuvannucci Oliveira, 1100
Tiago Andrade, 500
Paulo César Ferreira G., 557
Kellyton Luccas, 585
Kelvin Andrade, 500
Bruno Marcelo, 835 
Bruna Krupinski, 525
Nilson Giuvannucci Rosa, 900
Iann Braga, 1000
Jão, 936
Fábio laércio, 383
Gustavo Parro, 860