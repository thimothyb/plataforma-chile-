/**
 * MoodleWSClient – handles REST API communication with Moodle.
 * 
 * Uses 'webservice/rest/server.php' endpoint with 'json' response format.
 */

const axios = require('axios');

class MoodleWSClient {
    constructor(baseUrl, token) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.token = token;
        this.endpoint = `${this.baseUrl}/webservice/rest/server.php`;
    }

    /**
     * Call a Moodle Web Service function.
     */
    async call(wsfunction, params = {}) {
        const fullParams = {
            wstoken: this.token,
            wsfunction: wsfunction,
            moodlewsrestformat: 'json',
            ...params
        };

        try {
            const { data } = await axios.get(this.endpoint, { params: fullParams });

            if (data && data.exception) {
                throw new Error(`${data.exception}: ${data.message}`);
            }

            return data;
        } catch (error) {
            // Rethrow and let the higher-level dataHelper handle logging or silence
            throw error;
        }
    }

    /**
     * Get list of courses.
     */
    async getCourses() {
        return await this.call('core_course_get_courses');
    }

    /**
     * Get enrolled users in a course.
     */
    async getEnrolledUsers(courseId) {
        return await this.call('core_enrol_get_enrolled_users', { courseid: courseId });
    }

    /**
     * Get course completion status for a user.
     */
    async getCourseCompletionStatus(courseId, userId) {
        return await this.call('core_completion_get_course_completion_status', {
            courseid: courseId,
            userid: userId
        });
    }

    /**
     * Get grade items for a course and user.
     */
    async getGradeItems(courseId, userId) {
        return await this.call('gradereport_user_get_grade_items', {
            courseid: courseId,
            userid: userId
        });
    }
}

module.exports = MoodleWSClient;
