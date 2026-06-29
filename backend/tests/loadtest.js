import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
    vus: 10,
    duration: '30s',
};

const BASE_URL = 'http://localhost:5002';

export default function () {
    const urls = [
        `${BASE_URL}/health`,
        `${BASE_URL}/`,
        `${BASE_URL}/api/auth`,
        `${BASE_URL}/api/student`,
        `${BASE_URL}/api/applications`,
        `${BASE_URL}/api/events`,
        `${BASE_URL}/api/jobs`,
        `${BASE_URL}/api/alumni`,
        `${BASE_URL}/api/cdc`,
        `${BASE_URL}/api/mentorship`,
        `${BASE_URL}/api/messages`,
        `${BASE_URL}/api/files`,
    ];

    urls.forEach((url) => {
        const res = http.get(url);

        if (res.status === 200) {
            console.log(`✅ ${url} -> 200 OK`);
        } else if (res.status === 404) {
            console.log(`❌ ${url} -> 404 Not Found`);
        } else {
            console.log(`⚠️ ${url} -> ${res.status}`);
        }
    });

    sleep(1);
}