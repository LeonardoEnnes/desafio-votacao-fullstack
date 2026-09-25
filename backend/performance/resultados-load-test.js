import http from "k6/http";
import { check } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:8080/api/v1";
const VUS = Number.parseInt(__ENV.VUS || "50", 10);
const DURATION = __ENV.DURATION || "30s";

if (!Number.isInteger(VUS) || VUS < 1) {
    throw new Error("VUS deve ser um número inteiro positivo");
}

export const options = {
    scenarios: {
        result: {
            executor: "constant-vus",
            vus: VUS,
            duration: DURATION,
        },
    },
    thresholds: {
        checks: ["rate>0.99"],
        "http_req_failed{endpoint:resultado}": ["rate<0.01"],
        "http_req_duration{endpoint:resultado}": ["p(95)<500"],
    },
};

export const setup = () => {
    const res = http.get(`${BASE_URL}/pautas`);
    if (res.status !== 200) {
        throw new Error(`Não foi possível listar as pautas. Status: ${res.status}`);
    }
    
    const pautas = res.json();
    if (!pautas || pautas.length === 0) {
        throw new Error("Nenhuma pauta encontrada no banco de performance! Execute o teste de votos primeiro.");
    }

    const pautaId = pautas[pautas.length - 1].id;
    console.log(`Pauta identificada: ${pautaId}`);
    
    return { pautaId };
};

export default function (data) {
    const response = http.get(
        `${BASE_URL}/pautas/${data.pautaId}/resultado`,
        { tags: { endpoint: "resultado" } }
    );

    check(response, {
        "resultado processado com sucesso (200)": (result) => result.status === 200,
    });
}