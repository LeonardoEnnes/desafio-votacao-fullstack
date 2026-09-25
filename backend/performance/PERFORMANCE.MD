
Como Executar usando o seu Novo Docker Compose:
Para bombardear a API com Votos:
(O script se encarregará de criar tudo o que precisa sozinho no banco de performance 5433).

Bash
docker compose --profile performance run --rm -e TOTAL_VOTES=1000 -e VUS=100 k6 run /performance/voto-load-test.js
Para bombardear a Leitura de Apuração:
(Pegue o ID da pauta que apareceu no console no passo anterior)

Bash
docker compose --profile performance run --rm -e PAUTA_ID=cole-o-uuid-aqui -e VUS=50 -e DURATION=30s k6 run /performance/resultados-load-test.js