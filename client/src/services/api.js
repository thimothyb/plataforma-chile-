/**
 * API service – communicates with the Express backend.
 */

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const client = axios.create({
    baseURL: API_BASE,
    timeout: 600000 // 10 minutes for slow production API
});

/**
 * Fetch global consolidated statistics (from cache – fast).
 * @param {number[]} [courseIds] – optional filter
 */
export async function fetchGlobalStats(courseIds = []) {
    const params = courseIds.length > 0 ? { courseIds: courseIds.join(',') } : {};
    const { data } = await client.get('/api/stats/global', { params });
    return data;
}

/**
 * Fetch per-course statistics (from cache – fast).
 * @param {number[]} [courseIds] – optional filter
 */
export async function fetchCourseStats(courseIds = []) {
    const params = courseIds.length > 0 ? { courseIds: courseIds.join(',') } : {};
    const { data } = await client.get('/api/stats/courses', { params });
    return data;
}

/**
 * Force a full refresh from the Moodle API → saves to MongoDB cache.
 * Returns { global, courses, updatedAt }.
 */
export async function refreshAllStats() {
    const { data } = await client.post('/api/stats/refresh');
    return data;
}

/**
 * Get the timestamp of the last cache refresh.
 * Returns { lastUpdated: ISO string | null }.
 */
export async function fetchLastUpdated() {
    const { data } = await client.get('/api/stats/last-updated');
    return data;
}

/**
 * Login with username and password.
 */
export async function loginUser(username, password) {
    const { data } = await client.post('/api/auth/login', { username, password });
    return data;
}
