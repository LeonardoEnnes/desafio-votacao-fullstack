import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 20 },
    { duration: '30s', target: 50 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
      http_req_duration: ['p(95)<500'],
      http_req_failed: ['rate<0.30'],
    },
};

const BASE_URL = 'http://localhost:8080/api/v1';

// função auxiliar para gerar um CPF valido
function gerarCpfValido() {
  let n = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));

  let d1 = 11 - (n.reduce((acc, val, idx) => acc + val * (10 - idx), 0) % 11);
  if (d1 >= 10) d1 = 0;
  n.push(d1);

  let d2 = 11 - (n.reduce((acc, val, idx) => acc + val * (11 - idx), 0) % 11);
  if (d2 >= 10) d2 = 0;
  n.push(d2);

  return n.join('');
}

export default function () {
  // cole o UUID de uma pauta com sessao aberta
  const pautaId = '281055ab-7f58-41a5-bd0a-e2a09e2377cf';

  const cpfDinamico = gerarCpfValido();

  const payloadAssociado = JSON.stringify({ cpf: cpfDinamico });
  const params = { headers: { 'Content-Type': 'application/json' } };

  http.post(`${BASE_URL}/associados`, payloadAssociado, params);

  const payloadVoto = JSON.stringify({
    associadoCpf: cpfDinamico,
    valor: Math.random() > 0.5 ? 'SIM' : 'NAO' // alterna aleatoriamente entre SIM e NÃO
  });

  let res = http.post(`${BASE_URL}/pautas/${pautaId}/votos`, payloadVoto, params);

  check(res, {
    'status é 201 ou 409': (r) => r.status === 201 || r.status === 409,
  });

  sleep(0.5);
}