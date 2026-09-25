### Como Executar os Testes de Performance no Docker

Para rodar os testes de carga com o perfil de performance (`perf`) e o banco de dados isolado, siga os passos abaixo

1. **Suba a API e os bancos de dados:**
    Acesse o docker-compose e descomente a seguinte linha:
   ```bash
   # SPRING_PROFILES_ACTIVE: perf
   ```

2. **Bombardear a API com Votos :**

   ```bash
   docker compose --profile performance run --rm -e TOTAL_VOTES=5000 -e VUS=100 k6 run /performance/voto-load-test.js
   ```

   O script do k6 criará automaticamente os associados, a pauta e a sessão de votação no banco de performance.

3. **Bombardear a Leitura de Apuração:**

   ```bash
   docker compose --profile performance run --rm -e VUS=50 -e DURATION=30s k6 run /performance/resultados-load-test.js
   ```
