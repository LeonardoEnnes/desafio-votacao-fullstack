# API de Votação Cooperativa

API para cadastrar pautas, abrir sessões de votação, registrar votos de associados e consultar a apuração.

---
## Funcionalidades

A aplicação atende a todos os requisitos fundamentais do domínio de assembleias cooperativas:

* **Cadastro de Associados:** Identificação e registro por CPF.
* **Criação de Pautas:** Cadastro de novos tópicos para votação.
* **Sessão de Votação:** Abertura de prazos para votação (configurável ou 1 min por padrão).
* **Registro de Votos:** Votos em "Sim" ou "Não", com garantia de unicidade (1 voto por associado/pauta).
* **Apuração de Resultados:** Contagem e consolidação em tempo real dos votos computados.


### Rotas Disponíveis

A API foi versionada utilizando o padrão `/api/v1`

| **Método** | **Rota** | **Descrição** |
| --- | --- | --- |
| `POST` | `/api/v1/associados` | Cadastra um novo associado no sistema. |
| `POST` | `/api/v1/pautas` | Cria uma nova pauta de votação. |
| `POST` | `/api/v1/pautas/{id}/sessoes` | Abre uma sessão de votação (duração customizável ou padrão de 1 minuto). |
| `POST` | `/api/v1/pautas/{id}/votos` | Registra um voto (`SIM`/`NAO`). Valida CPF externo e bloqueia duplicidade. |
| `GET` | `/api/v1/pautas/{id}/resultado` | Retorna a apuração consolidada da votação. |

## Arquitetura
O projeto é estruturado com base em **Clean Architecture**, dividindo responsabilidades em camadas claras:
* **Controller:** Camada de entrada REST (`/api/v1`), validação de payloads e mapeamento de status HTTP.
* **Service:** Centralização das regras de negócio (prazos, elegibilidade e validações).
* **Repository:** Persistência de dados utilizando Spring Data JPA.
* **Domain:** Modelos de entidades e regras de domínio puras.
* **Client:** Integração com o serviço externo simulado de verificação de CPF.
* **Exception:** Tratamento global de erros para padronizar as respostas de falha (`@RestControllerAdvice`).

## Decisões Técnicas

* O Flyway versiona o esquema do PostgreSQL e os volumes Docker preservam os dados entre reinicializações.
* Uma restrição única composta (`UniqueConstraint`) impede que o mesmo associado vote mais de uma vez na mesma pauta.
* A apuração utiliza consultas agregadas no banco (`COUNT`), sem carregar todos os votos em memória (*Heap*).
* A elegibilidade valida o CPF por Módulo 11 via *client* simulado, retornando erros adequados (404/409) em caso de falha.
* Testes E2E com Testcontainers validam o fluxo em um PostgreSQL real, complementados por testes de carga (k6) e cobertura (JaCoCo).
* Versionamento `/api/v1`, contratos via DTOs e logs estruturados.

---

## Tecnologias

* Java 21
* Spring Boot 3.4.x (Lombok, WebMVC, Data JPA, Validation)
* PostgreSQL e H2
* Flyway
* JUnit 5 / MockMvc: Testes unitários e de integração
* Testcontainers: Testes E2E rodando contra uma instância Docker real de PostgreSQL
* JaCoCo: Relatórios de cobertura de código (~90%+)
* k6: Testes de carga, stress e validação de concorrência
* Swagger
* Docker & Docker Compose
* Maven

---

## Como Executar o Projeto

### Pré-requisitos
* **Docker** instalado.
* *Opcional:* Java 21 e Maven (se preferir rodar localmente fora do Docker).

### 1. Rodando com Docker Compose (Recomendado)
A maneira mais fácil e segura de iniciar a aplicação junto com o banco de dados PostgreSQL.

```bash
# Clone o repo
git clone https://github.com/LeonardoEnnes/desafio-votacao-fullstack.git

cd backend

# Suba a aplicacao
docker compose up --build -d
```
A API estará acessível em http://localhost:8080.

## Documentação da API (Swagger)
A API possui documentação interativa gerada pelo SpringDoc OpenAPI. Após iniciar a aplicação, acesse no navegador:

Interface UI: http://localhost:8080/swagger-ui/index.html

## Qualidade e Testes

### Cobertura de Código (JaCoCo)

A aplicação foi auditada pelo JaCoCo.

Para gerar e visualizar o relatório HTML:

```bash
mvn clean test
```
O relatório interativo estará em: target/site/jacoco/index.html

### Teste de Carga e Estresse (k6)

a raiz do repositório inclui o script `load-test.js`, escrito em **k6**.

O teste simula o estresse de concorrência com **50 usuários virtuais concorrentes**, gerando CPFs válidos e bombardeando a API com requisições

Para executar o teste de estresse, com a aplicação iniciada:

```bash
# Necessário ter o k6 instalado na máquina
sudo apt install k6

# Executar o teste
k6 run load-test.js
```