import http from "k6/http";
import exec from "k6/execution";
import { check } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:8080/api/v1";
const TOTAL_VOTES = Number.parseInt(__ENV.TOTAL_VOTES || "1000", 10);
const VUS = Number.parseInt(__ENV.VUS || "100", 10);

if (!Number.isInteger(TOTAL_VOTES) || TOTAL_VOTES < 1) {
    throw new Error("TOTAL_VOTES deve ser um nmero inteiro positivo");
}

if (!Number.isInteger(VUS) || VUS < 1) {
    throw new Error("VUS deve ser um número inteiro positivo");
}

export const options = {
    scenarios: {
        votes: {
            executor: "shared-iterations",
            vus: VUS,
            iterations: TOTAL_VOTES,
            maxDuration: "30m",
        },
    },
    thresholds: {
        checks: ["rate>0.99"],
        "http_req_failed{endpoint:vote}": ["rate<0.01"],
        "http_req_duration{endpoint:vote}": ["p(95)<1000"],
    },
};

const jsonHeaders = {
    headers: { "Content-Type": "application/json" },
};

// Gerador de CPF valido
const calculateCpfDigit = (digits) => {
    let sum = 0;
    let weight = digits.length + 1;
    for (const digit of digits) {
        sum += Number(digit) * weight;
        weight -= 1;
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
};

const generateCpf = (index) => {
    const baseNumber = 100000000 + index;
    const base = String(baseNumber);
    const firstDigit = calculateCpfDigit(base);
    const secondDigit = calculateCpfDigit(`${base}${firstDigit}`);
    return `${base}${firstDigit}${secondDigit}`;
};

export const setup = () => {
    const cpfsValidos = [];

    for (let index = 0; index < TOTAL_VOTES; index += 1) {
        const cpf = generateCpf(index);
        http.post(`${BASE_URL}/associados`, JSON.stringify({ cpf }), {
            ...jsonHeaders, tags: { endpoint: "setup" }
        });
        cpfsValidos.push(cpf);
    }

    const pautaRes = http.post(`${BASE_URL}/pautas`, JSON.stringify({
            titulo: `Pauta de Teste de Performance ${Date.now()}`,
            descricao: "Pauta gerada automaticamente pelo k6",
        }), { ...jsonHeaders, tags: { endpoint: "setup" } }
    );

    if (pautaRes.status !== 201 && pautaRes.status !== 200) {
        throw new Error(`falha ao criar pauta no setup. Status: ${pautaRes.status}`);
    }
    const pautaId = pautaRes.json().id;

    http.post(`${BASE_URL}/pautas/${pautaId}/sessoes`, JSON.stringify({
            tempoEmMinutos: 30
        }), { ...jsonHeaders, tags: { endpoint: "setup" } }
    );

    console.log(`setup pronto, Utilize o ID da Pauta para consultar resultados: ${pautaId}`); // dps remover consoles

    return { cpfsValidos, pautaId };
};

export default function (data) {
    const iteration = exec.scenario.iterationInTest;

    const response = http.post(
        `${BASE_URL}/pautas/${data.pautaId}/votos`,
        JSON.stringify({
            associadoCpf: data.cpfsValidos[iteration],
            valor: iteration % 2 === 0 ? "SIM" : "NAO",
        }),
        { ...jsonHeaders, tags: { endpoint: "vote" } }
    );

    check(response, {
        "voto registrado com sucesso (201)": (result) => {
            if (result.status !== 201) {
                console.log(`Erro inesperado! Status: ${result.status}, Body: ${result.body}`);
            }
            return result.status === 201;
        },
    });
}