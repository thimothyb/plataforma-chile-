/**
 * Data helper – refactored to use Moodle Web Services API.
 * 
 * High-performance tuning: 
 * - Dual-layer batching (Courses + Users)
 * - Anti-throttle delays
 * - Detailed progress logging
 */

const MoodleWSClient = require('./moodleWsClient');

const MOODLE_URL = process.env.MOODLE_URL;
const MOODLE_TOKEN = process.env.MOODLE_WSTOKEN;

const wsClient = new MoodleWSClient(MOODLE_URL, MOODLE_TOKEN);

/**
 * Utility: Wait for ms
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Helper to process an array in batches of a given size.
 */
async function batchProcess(items, batchSize, fn, label = '') {
    const results = [];
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        if (label) console.log(`[Batch] ${label}: Processing ${i + 1} to ${Math.min(i + batchSize, items.length)} of ${items.length}...`);

        const batchResults = await Promise.all(batch.map(fn));
        results.push(...batchResults);

        // Brief pause between batches to protect the server
        if (i + batchSize < items.length) await sleep(200);
    }
    return results;
}

function isApproved(gradeItem) {
    if (!gradeItem || gradeItem.grade === null) return false;
    const gradepass = parseFloat(gradeItem.gradepass) || 0;
    const finalgrade = parseFloat(gradeItem.grade);
    return finalgrade >= gradepass;
}

async function getFilteredCourses(selectedCourseIds = []) {
    try {
        console.log('--- Fetching courses from Moodle Web Services ---');
        const allCourses = await wsClient.getCourses();
        if (!allCourses || !Array.isArray(allCourses)) return [];

        let courses = allCourses.filter(c => c.id !== 1 && c.visible === 1);

        if (selectedCourseIds.length > 0) {
            const filterSet = new Set(selectedCourseIds.map(Number));
            courses = courses.filter(c => filterSet.has(c.id));
        }
        console.log(`Found ${courses.length} active courses.`);
        return courses;
    } catch (e) {
        console.error('Error fetching courses:', e.message);
        return [];
    }
}

async function getCourseMetrics(courseId, courseName) {
    const stats = { approved: 0, not_approved: 0, in_progress: 0, not_started: 0 };

    try {
        const users = await wsClient.getEnrolledUsers(courseId);
        if (!users || !users.length) {
            console.log(`Course [${courseId}] ${courseName}: No students enrolled.`);
            return stats;
        }

        // Process users in batches of 15
        await batchProcess(users, 15, async (user) => {
            try {
                const completion = await wsClient.getCourseCompletionStatus(courseId, user.id);
                const isCompleted = completion && completion.completionstatus &&
                    completion.completionstatus.completions &&
                    completion.completionstatus.completions.some(c => c.complete);

                if (isCompleted) {
                    const grades = await wsClient.getGradeItems(courseId, user.id);
                    if (grades && grades.usergrades && grades.usergrades[0]) {
                        const courseGrade = grades.usergrades[0].gradeitems.find(gi => gi.itemtype === 'course');
                        if (isApproved(courseGrade)) {
                            stats.approved++;
                        } else {
                            stats.not_approved++;
                        }
                    } else {
                        stats.not_approved++;
                    }
                } else {
                    stats.in_progress++;
                }
            } catch (e) {
                stats.not_started++;
            }
        });

        console.log(`Course [${courseId}] ${courseName}: ${users.length} students processed.`);
    } catch (err) {
        console.error(`Error in course ${courseId}:`, err.message);
    }

    return stats;
}

async function getGlobalStats(selectedCourseIds = []) {
    const courses = await getFilteredCourses(selectedCourseIds);
    const globalStats = { not_started: 0, in_progress: 0, approved: 0, not_approved: 0, total: 0 };

    // Process COURSES in batches of 3 to avoid overwhelming Moodle
    const courseResults = await batchProcess(
        courses,
        3,
        (c) => getCourseMetrics(c.id, c.fullname),
        'Global Courses'
    );

    for (const stats of courseResults) {
        globalStats.approved += stats.approved;
        globalStats.not_approved += stats.not_approved;
        globalStats.in_progress += stats.in_progress;
        globalStats.not_started += stats.not_started;
    }

    globalStats.total = globalStats.approved + globalStats.not_approved + globalStats.in_progress + globalStats.not_started;
    console.log('--- Global stats calculation complete ---');
    console.log(globalStats);
    return globalStats;
}

async function getPerCourseStats(selectedCourseIds = []) {
    const courses = await getFilteredCourses(selectedCourseIds);

    // Process COURSES in batches of 3
    const result = await batchProcess(
        courses,
        3,
        async (course) => {
            const stats = await getCourseMetrics(course.id, course.fullname);
            return {
                courseid: course.id,
                coursename: course.fullname,
                ...stats
            };
        },
        'Per-Course Stats'
    );

    return result.filter(r => (r.approved + r.not_approved + r.in_progress + r.not_started) > 0);
}

module.exports = { getGlobalStats, getPerCourseStats };
