/**
 * Dashboard – top-level page component.
 *
 * On mount: loads cached data from MongoDB (instant).
 * "Actualizar" button: re-fetches from Moodle API and refreshes the cache.
 * Shows a "last updated" timestamp so users know how fresh the data is.
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchGlobalStats, fetchCourseStats, refreshAllStats, fetchLastUpdated } from '../services/api';
import Sidebar from './Sidebar';
import StatsCards from './StatsCards';
import CourseSelector from './CourseSelector';
import DoughnutChart from './DoughnutChart';
import BarChart from './BarChart';
import CourseTable from './CourseTable';

export default function Dashboard({ onLogout }) {
    const [globalData, setGlobalData] = useState(null);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [status, setStatus] = useState({ message: '', type: '' });
    const [connectionState, setConnectionState] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    // ── Load data from cache (fast) ────────────────────────────────────
    const loadData = useCallback(async () => {
        setLoading(true);
        setStatus({ message: 'Cargando datos…', type: 'info' });
        setConnectionState('');
        try {
            const [global, perCourse] = await Promise.all([
                fetchGlobalStats(),
                fetchCourseStats(),
            ]);
            setGlobalData(global);
            setCourses(perCourse);
            setSelectedCourse(null);
            setConnectionState('connected');

            // Get cached timestamp
            const { lastUpdated: ts } = await fetchLastUpdated();
            setLastUpdated(ts);

            setStatus({
                message: `✓ Datos cargados — ${new Date().toLocaleTimeString('es-CL')}`,
                type: 'success',
            });
        } catch (err) {
            setConnectionState('error');
            setStatus({ message: 'Error: ' + (err.response?.data?.error || err.message), type: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Refresh from Moodle API (slow, manual) ─────────────────────────
    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        setStatus({ message: '🔄 Actualizando desde Moodle… Esto puede tardar unos minutos.', type: 'info' });
        try {
            const result = await refreshAllStats();
            setGlobalData(result.global);
            setCourses(result.courses);
            setSelectedCourse(null);
            setLastUpdated(result.updatedAt);
            setConnectionState('connected');
            setStatus({
                message: `✓ Datos actualizados desde Moodle — ${new Date().toLocaleTimeString('es-CL')}`,
                type: 'success',
            });
        } catch (err) {
            setConnectionState('error');
            setStatus({ message: 'Error al actualizar: ' + (err.response?.data?.error || err.message), type: 'error' });
        } finally {
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Compute current stats based on selected course or global
    const currentStats = selectedCourse
        ? {
            not_started: Number(selectedCourse.not_started || 0),
            in_progress: Number(selectedCourse.in_progress || 0),
            approved: Number(selectedCourse.approved || 0),
            not_approved: Number(selectedCourse.not_approved || 0),
            total:
                Number(selectedCourse.not_started || 0) +
                Number(selectedCourse.in_progress || 0) +
                Number(selectedCourse.approved || 0) +
                Number(selectedCourse.not_approved || 0),
        }
        : globalData || { not_started: 0, in_progress: 0, approved: 0, not_approved: 0, total: 0 };

    const donutTitle = selectedCourse
        ? `Distribución — ${selectedCourse.coursename}`
        : 'Distribución de Estudiantes';

    const hasData = globalData !== null;

    // Format last-updated date
    const lastUpdatedText = lastUpdated
        ? new Date(lastUpdated).toLocaleString('es-CL', {
            dateStyle: 'short',
            timeStyle: 'medium',
        })
        : null;

    return (
        <>
            <Sidebar onLogout={onLogout} />

            {/* Mobile overlay */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            <div className="main-content">
                {/* Top bar */}
                <header className="topbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            <span className="material-icons-outlined" style={{ fontSize: 20 }}>menu</span>
                        </button>
                        <h1>Dashboard — Estadísticas de Cursos</h1>
                    </div>
                    <div className="topbar-actions">
                        {lastUpdatedText && (
                            <span style={{
                                fontSize: 12,
                                color: 'var(--text-secondary, #8892a4)',
                                marginRight: 8,
                                whiteSpace: 'nowrap',
                            }}>
                                Última actualización: {lastUpdatedText}
                            </span>
                        )}
                        <div className={`connection-dot ${connectionState}`} title="Estado de conexión" />
                        <button
                            className="btn-refresh"
                            onClick={handleRefresh}
                            disabled={refreshing || loading}
                        >
                            <span
                                className="material-icons-outlined"
                                style={refreshing ? { animation: 'spin 1s linear infinite' } : {}}
                            >
                                refresh
                            </span>
                            {refreshing ? 'Actualizando…' : 'Actualizar'}
                        </button>
                    </div>
                </header>

                <div className="page-content">
                    {/* Status bar */}
                    {status.message && (
                        <div className={`status-bar ${status.type}`}>{status.message}</div>
                    )}

                    {/* Loading spinner */}
                    {loading && !hasData && (
                        <div className="loading-overlay">
                            <div className="loading-spinner" />
                            <span>Cargando estadísticas…</span>
                        </div>
                    )}

                    {/* Dashboard content */}
                    {hasData && (
                        <>
                            {/* Course selector */}
                            <CourseSelector
                                courses={courses}
                                selectedCourse={selectedCourse}
                                onSelect={setSelectedCourse}
                            />

                            {/* Stat cards */}
                            <StatsCards stats={currentStats} />

                            {/* Charts row */}
                            <section className="charts-grid">
                                <DoughnutChart stats={currentStats} title={donutTitle} />
                                <BarChart
                                    courses={courses}
                                    singleCourse={selectedCourse}
                                />
                            </section>

                            {/* Per-course table (only in "all courses" mode) */}
                            {!selectedCourse && (
                                <CourseTable courses={courses} onSelectCourse={setSelectedCourse} />
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
