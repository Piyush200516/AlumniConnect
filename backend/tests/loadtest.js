// k6 load test script for AlumniConnect backend
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:5002'; // Backend base URL

// -------------------- Authentication helpers --------------------
function loginStudent() {
    const payload = JSON.stringify({ email: 'student@example.com', password: 'Password123' });
    const params = { headers: { 'Content-Type': 'application/json' } };
    const res = http.post(`${BASE_URL}/api/auth/student/login`, payload, params);
    check(res, { 'student login ok': (r) => r.status === 200 && r.json('token') !== undefined });
    return res.json('token');
}
function loginAlumni() {
    const payload = JSON.stringify({ email: 'alumni@example.com', password: 'Password123' });
    const params = { headers: { 'Content-Type': 'application/json' } };
    const res = http.post(`${BASE_URL}/api/auth/alumni/login`, payload, params);
    check(res, { 'alumni login ok': (r) => r.status === 200 && r.json('token') !== undefined });
    return res.json('token');
}
function loginCdc() {
    const payload = JSON.stringify({ email: 'cdc@example.com', password: 'Password123' });
    const params = { headers: { 'Content-Type': 'application/json' } };
    const res = http.post(`${BASE_URL}/api/auth/cdc/login`, payload, params);
    check(res, { 'cdc login ok': (r) => r.status === 200 && r.json('token') !== undefined });
    return res.json('token');
}

let tokens = { STUDENT: '', ALUMNI: '', CDC: '' };

export const options = {
    stages: [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 10 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],
    },
};

// ------------------------------------------------------------------
// Endpoint catalogue – each entry knows which role token to use (if any)
// ------------------------------------------------------------------
const endpoints = [
    // Health (public)
    { method: 'GET', url: '/health', auth: null },

    // Auth routes (public)
    { method: 'POST', url: '/api/auth/student/signup', payload: { name: 'John Doe', email: 'student@example.com', password: 'Password123' }, auth: null },
    { method: 'POST', url: '/api/auth/alumni/signup', payload: { name: 'Alumni User', email: 'alumni@example.com', password: 'Password123' }, auth: null },
    { method: 'POST', url: '/api/auth/student/login', payload: { email: 'student@example.com', password: 'Password123' }, auth: null },
    { method: 'POST', url: '/api/auth/alumni/login', payload: { email: 'alumni@example.com', password: 'Password123' }, auth: null },
    { method: 'POST', url: '/api/auth/cdc/login', payload: { email: 'cdc@example.com', password: 'Password123' }, auth: null },
    { method: 'POST', url: '/api/auth/login', payload: { email: 'common@example.com', password: 'Password123' }, auth: null },
    { method: 'GET', url: '/api/auth/verify-email/FAKE_TOKEN', auth: null },
    { method: 'POST', url: '/api/auth/forgot-password', payload: { email: 'student@example.com' }, auth: null },
    { method: 'POST', url: '/api/auth/reset-password', payload: { token: 'FAKE_RESET', newPassword: 'NewPass123' }, auth: null },

    // Student protected routes (STUDENT role)
    { method: 'GET', url: '/api/student/profile', auth: 'STUDENT' },
    { method: 'GET', url: '/api/student/dashboard', auth: 'STUDENT' },
    { method: 'PUT', url: '/api/student/profile', payload: { firstName: 'John', lastName: 'Doe' }, multipart: true, auth: 'STUDENT' },

    // Alumni protected routes (ALUMNI role)
    { method: 'GET', url: '/api/alumni/', auth: 'ALUMNI' },
    { method: 'GET', url: '/api/alumni/search?query=engineer', auth: 'ALUMNI' },
    { method: 'GET', url: '/api/alumni/me', auth: 'ALUMNI' },
    { method: 'GET', url: '/api/alumni/123', auth: 'ALUMNI' },
    { method: 'POST', url: '/api/alumni/connections/send', payload: { targetId: '456' }, auth: 'ALUMNI' },
    { method: 'PATCH', url: '/api/alumni/connections/accept', payload: { connectionId: '789' }, auth: 'ALUMNI' },
    { method: 'PATCH', url: '/api/alumni/connections/reject', payload: { connectionId: '789' }, auth: 'ALUMNI' },
    { method: 'GET', url: '/api/alumni/connections/incoming', auth: 'ALUMNI' },
    { method: 'POST', url: '/api/alumni/messages', payload: { toId: '456', message: 'Hello' }, auth: 'ALUMNI' },
    { method: 'POST', url: '/api/alumni/123/follow', auth: 'ALUMNI' },
    { method: 'POST', url: '/api/alumni/123/save', auth: 'ALUMNI' },

    // Application routes (STUDENT & CDC)
    { method: 'GET', url: '/api/applications/my', auth: 'STUDENT' },
    { method: 'POST', url: '/api/applications/save', payload: { programId: '1', data: {} }, auth: 'STUDENT' },
    { method: 'POST', url: '/api/applications/submit', payload: { programId: '1', data: {} }, auth: 'STUDENT' },
    { method: 'PATCH', url: '/api/applications/update-allowed', payload: { allowEdit: true }, auth: 'STUDENT' },
    { method: 'POST', url: '/api/applications/upload', file: 'dummy.pdf', auth: 'STUDENT' },
    { method: 'GET', url: '/api/applications/', auth: 'CDC' },
    { method: 'GET', url: '/api/applications/123', auth: 'CDC' },
    { method: 'POST', url: '/api/applications/123/verify', auth: 'CDC' },

    // Event routes (mixed roles)
    { method: 'GET', url: '/api/events/', auth: 'STUDENT' },
    { method: 'GET', url: '/api/events/admin/all', auth: 'CDC' },
    { method: 'GET', url: '/api/events/my-registrations', auth: 'STUDENT' },
    { method: 'GET', url: '/api/events/my-certificates', auth: 'STUDENT' },
    { method: 'GET', url: '/api/events/456', auth: 'STUDENT' },
    { method: 'POST', url: '/api/events/create', payload: { title: 'Hackathon', date: '2024-12-01' }, auth: 'CDC' },
    { method: 'PUT', url: '/api/events/456', payload: { title: 'Updated Title' }, auth: 'CDC' },
    { method: 'GET', url: '/api/events/456/registrations', auth: 'CDC' },
    { method: 'POST', url: '/api/events/456/mark-attendance', payload: { attendees: ['123'] }, auth: 'CDC' },
    { method: 'POST', url: '/api/events/456/register', auth: 'STUDENT' },
    { method: 'POST', url: '/api/events/456/cancel', auth: 'STUDENT' },
    { method: 'POST', url: '/api/events/456/approve', auth: 'CDC' },
    { method: 'POST', url: '/api/events/456/reject', auth: 'CDC' },

    // Job routes (mixed roles)
    { method: 'GET', url: '/api/jobs/', auth: 'STUDENT' },
    { method: 'GET', url: '/api/jobs/789', auth: 'STUDENT' },
    { method: 'POST', url: '/api/jobs/create', payload: { title: 'Software Engineer', description: '...' }, auth: 'ALUMNI' },
    { method: 'PUT', url: '/api/jobs/789', payload: { title: 'Senior Engineer' }, auth: 'ALUMNI' },
    { method: 'POST', url: '/api/jobs/789/apply', auth: 'STUDENT' },
    { method: 'POST', url: '/api/jobs/789/save', auth: 'STUDENT' },
    { method: 'GET', url: '/api/jobs/789/applications', auth: 'ALUMNI' },
    { method: 'PUT', url: '/api/jobs/applications/456/status', payload: { status: 'INTERVIEW' }, auth: 'ALUMNI' },
    { method: 'POST', url: '/api/jobs/789/approve', auth: 'CDC' },
    { method: 'POST', url: '/api/jobs/789/reject', auth: 'CDC' },

    // CDC routes
    { method: 'GET', url: '/api/cdc/dashboard', auth: 'CDC' },

    // Mentorship routes (mixed)
    { method: 'POST', url: '/api/mentorship/request', payload: { mentorId: '123' }, auth: 'STUDENT' },
    { method: 'PATCH', url: '/api/mentorship/accept', payload: { requestId: '456' }, auth: 'ALUMNI' },
    { method: 'PATCH', url: '/api/mentorship/reject', payload: { requestId: '456' }, auth: 'ALUMNI' },
    { method: 'GET', url: '/api/mentorship/my-mentors', auth: 'STUDENT' },
    { method: 'GET', url: '/api/mentorship/my-mentees', auth: 'ALUMNI' },
    { method: 'GET', url: '/api/mentorship/dashboard', auth: null },
    { method: 'POST', url: '/api/mentorship/meetings', payload: { date: '2024-10-10', topic: 'Career Advice' }, auth: null },
    { method: 'POST', url: '/api/mentorship/resources', payload: { title: 'Resume Tips', link: 'https://example.com' }, auth: null },
    { method: 'PATCH', url: '/api/mentorship/alumni-privacy', payload: { shareEmail: false }, auth: 'ALUMNI' },

    // Message routes (authenticated)
    { method: 'GET', url: '/api/messages/', auth: 'STUDENT' },
    { method: 'POST', url: '/api/messages/send', payload: { toId: '456', message: 'Hi' }, auth: 'STUDENT' },
    { method: 'PATCH', url: '/api/messages/123/read', payload: {}, auth: 'STUDENT' },
    { method: 'GET', url: '/api/messages/456', auth: 'STUDENT' },

    // File upload route (authenticated)
    { method: 'POST', url: '/api/files/upload', file: 'dummy.pdf', auth: 'STUDENT' },
];

function getAuthHeader(role) {
    if (!role) return {};
    if (!tokens[role]) {
        if (role === 'STUDENT') tokens[role] = loginStudent();
        else if (role === 'ALUMNI') tokens[role] = loginAlumni();
        else if (role === 'CDC') tokens[role] = loginCdc();
    }
    return { Authorization: `Bearer ${tokens[role]}` };
}

export default function () {
    endpoints.forEach((ep) => {
        const url = `${BASE_URL}${ep.url}`;
        const headers = Object.assign({ 'Content-Type': 'application/json' }, getAuthHeader(ep.auth));
        let res;
        switch (ep.method) {
            case 'GET':
                res = http.get(url, { headers });
                break;
            case 'POST':
                if (ep.file) {
                    const payload = http.file('dummy content', ep.file);
                    res = http.post(url, payload, { headers: getAuthHeader(ep.auth) });
                } else if (ep.multipart) {
                    const filePayload = http.file('dummy content', 'test.txt');
                    const form = { file: filePayload };
                    res = http.post(url, form, { headers: getAuthHeader(ep.auth) });
                } else {
                    res = http.post(url, JSON.stringify(ep.payload || {}), { headers });
                }
                break;
            case 'PUT':
                res = http.put(url, JSON.stringify(ep.payload || {}), { headers });
                break;
            case 'PATCH':
                res = http.patch(url, JSON.stringify(ep.payload || {}), { headers });
                break;
            case 'DELETE':
                res = http.del(url, null, { headers });
                break;
        }
        // Basic status checks
        check(res, {
            [`${ep.method} ${ep.url} status ok`]: (r) => r.status >= 200 && r.status < 500,
        });
        console.log(`${ep.method} ${ep.url} – ${res.status} – ${res.timings.duration}ms`);
        sleep(0.3);
    });
}
