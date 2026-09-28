# Frontend — Sistema de Votação Cooperativa

Interface web do sistema de votação para assembleias cooperativas. Consome a API REST do backend e oferece uma interface para gerenciar pautas, abrir sessões de votação e ver resultados.

---

## Visão Geral

O frontend foi construído como uma **SPA** com React + TypeScript

Funcionalidades:

- Cadastro e identificação de associados via CPF
- Criação e listagem de pautas de votação
- Abertura de sessões com tempo customizável
- Registro de votos (SIM/NÃO) com validação de elegibilidade
- Apuração de resultados com gráficos e percentuais
- Tratamento amigável de todos os estados (loading, erro, vazio)
- Bloqueio inteligente de votos duplicados com persistência local
- Responsividade

---

## 🛠️ Stack de Tecnologias

- **React**
- **TypeScript**
- **Vite**
- **pnpm**
- **React Router**
- **Zustand**
- **TanStack Query**
- **Axios**
- **React Hook Form**
- **Zod** 
- **Tailwind**
- **shadcn/ui**
- **Vitest**
- **Testing Library**
- **ESLint**
- **Prettier**

---

## 🏗️ Arquitetura

### Estrutura de Pastas

```
src/
├── app/                  # Configuração de rotas e providers globais
├── components/           # Componentes React reutilizáveis
│   ├── associado/        # Área do associado (identificação)
│   ├── pauta/            # Componentes de pauta (header, form, modal)
│   ├── sessao/           # Componentes de sessão (card, banner)
│   ├── ui/               # Componentes base (shadcn: button, card, etc.)
│   └── voto/             # Componentes de votação (card, apuração)
├── hooks/                # Hooks customizados (usePautaDetalhe, etc.)
├── lib/                  # Configurações de bibliotecas (axios)
├── pages/                # Páginas (rotas)
│   ├── HomePage.tsx      # Listagem de pautas
│   └── PautaPage.tsx     # Detalhe da pauta + sessão + apuração
├── schemas/              # Schemas Zod (validação)
├── services/             # Camada de acesso à API
├── stores/               # Stores Zustand (auth)
├── test/                 # Setup global de testes
├── types/                # Tipagens TypeScript compartilhadas
└── utils/                # Funções utilitárias puras
```
---

## 🚀 Como Rodar

### Pré-requisitos

- **Node.js** 20+
- **pnpm** (recomendado) ou npm/yarn

### Instalação

```bash
pnpm install
```

### Variaveis de Ambiente

```env
cp .env.example .env
```
Altere a variavel de ambiente:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

> Ajuste a URL conforme o backend estiver rodando.

A aplicação estará disponível em `http://localhost:3000`.

### Execucao local

```bash
pnpm run dev
```

### Via Docker

Caso não queria rodar localmente é possivel rodar pelo docker. O `docker-compose.yml` na raiz já orquestra frontend + backend + banco:

```bash
docker-compose up --build
```

Acesse: `http://localhost:3000`

Não esqueça de fazer o processo da variavel de ambiente

---

## 🧪 Testes

### Comandos

```bash
pnpm test
pnpm test -- --coverage
```

---

## 🧹 Linter

```bash
pnpm lint
```
---

## Fluxo da Aplicação

### 1. Identificação do Associado
- Usuário informa CPF na **Área do Associado**
- `associadoService.cadastrar()` chama `POST /associados`
- Se 409 (já cadastrado), faz login direto
- CPF é persistido no `localStorage` via Zustand

### 2. Listagem de Pautas (`HomePage`)
- `usePautasComSessoes` busca pautas + sessões abertas em paralelo
- Renderiza grid de `VotacaoCard`
- Botão **"Nova Pauta"** aparece apenas se logado

### 3. Votação (nos cards da HomePage)
- Usuário clica em **SIM** ou **NÃO**
- `votoService.registrarVoto()` chama `POST /pautas/{id}/votos`
- **Sucesso** → badge "Você já votou" persistida no localStorage

### 4. Detalhe da Pauta (`PautaPage`)
- `usePautaDetalhe` busca pauta + resultado + sessões
- **PautaHeader**: título, descrição, status da sessão
- **SessaoCard**: abre sessão com tempo customizável
- **ApuracaoCard**: mostra SIM/NÃO com barra de progresso

### 5. Abrir Sessão
- Usuário define minutos e clica em "Abrir Sessão"
- `POST /pautas/{id}/sessoes`

---