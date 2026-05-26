const http = require('http');

const URL = 'http://localhost:8000/api/components';
const REQUESTS_TO_MAKE = 100;
const DELAY_BETWEEN_REQUESTS_MS = 10;

let successCount = 0;
let tooManyRequestsCount = 0;
let errorCount = 0;

async function sendRequest(i) {
    return new Promise((resolve) => {
        http.get(URL, (res) => {
            if (res.statusCode === 200) {
                successCount++;
                console.log(`[${i}] Success: 200 OK`);
            } else if (res.statusCode === 429) {
                tooManyRequestsCount++;
                console.log(`[${i}] Blocked: 429 Too Many Requests`);
            } else {
                errorCount++;
                console.log(`[${i}] Other Status: ${res.statusCode}`);
            }
            res.resume();
            resolve();
        }).on('error', (e) => {
            errorCount++;
            console.log(`[${i}] Error: ${e.message}`);
            resolve();
        });
    });
}

async function runTest() {
    console.log(`Starting rate limit test: sending ${REQUESTS_TO_MAKE} requests to ${URL}...`);
    
    for (let i = 1; i <= REQUESTS_TO_MAKE; i++) {
        sendRequest(i);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS_MS));
    }

    console.log('\n--- Test Completed ---');
    console.log(`Successful requests (200): ${successCount}`);
    console.log(`Rate limited requests (429): ${tooManyRequestsCount}`);
    console.log(`Other errors: ${errorCount}`);
}

runTest();
