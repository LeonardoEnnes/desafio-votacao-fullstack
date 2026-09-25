import http from "k6/http";
import { check } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:8080/api/v1";
const PAUTA_ID = __ENV.PAUTA_ID;
const VUS = Number.parseInt(__ENV.VUS || "50", 10);
const DURATION = __ENV.DURATION || "30s";

if (!PAUTA_ID) {
    throw new Error("A variável de ambiente PAUTA_ID é obrigatória!");
}

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

export default function () {
    const response = http.get(
        `${BASE_URL}/pautas/${PAUTA_ID}/resultado`,
        { tags: { endpoint: "resultado" } }
    );

    check(response, {
        "resultado processado com sucesso (200)": (result) => result.status === 200,
    });
}