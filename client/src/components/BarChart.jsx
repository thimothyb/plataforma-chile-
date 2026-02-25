/**
 * BarChart – horizontal stacked bars for all-courses mode.
 * ProgressBars – simple progress bars for single-course mode.
 */

import { useRef, useEffect } from 'react';
import {
    Chart as ChartJS,
    BarController,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(BarController, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function pct(val, total) {
    return total > 0 ? ((val / total) * 100).toFixed(1) : '0';
}

function ProgressBarsView({ course }) {
    const ap = Number(course.approved || 0);
    const na = Number(course.not_approved || 0);
    const ip = Number(course.in_progress || 0);
    const ns = Number(course.not_started || 0);
    const total = ap + na + ip + ns;

    const items = [
        { label: 'Aprobados', value: ap, color: '#28a745' },
        { label: 'No Aprobados', value: na, color: '#dc3545' },
        { label: 'En Progreso', value: ip, color: '#f0ad4e' },
        { label: 'No Iniciado', value: ns, color: '#6c757d' },
    ];

    return (
        <div style={{ padding: '10px 0' }}>
            {items.map(item => (
                <div className="progress-bar-row" key={item.label}>
                    <div className="progress-bar-label">
                        <span>{item.label}</span>
                        <span style={{ color: item.color }}>{item.value} ({pct(item.value, total)}%)</span>
                    </div>
                    <div className="progress-bar-track">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${pct(item.value, total)}%`, background: item.color }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function BarChart({ courses, singleCourse }) {
    const canvasRef = useRef(null);
    const isSingle = !!singleCourse;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (isSingle || !courses || !courses.length || !canvas) return;

        const existing = ChartJS.getChart(canvas);
        if (existing) existing.destroy();

        const labels = courses.map(c => c.coursename);

        // Vertical scaling for long course lists
        const wrapper = canvas.parentElement;
        if (wrapper) wrapper.style.height = Math.max(260, courses.length * 48) + 'px';

        const chart = new ChartJS(canvas, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    { label: 'Completados', data: courses.map(c => Number(c.approved || 0) + Number(c.not_approved || 0)), backgroundColor: '#17a2b8', borderRadius: 2 },
                    { label: 'En Progreso', data: courses.map(c => Number(c.in_progress || 0)), backgroundColor: '#f0ad4e', borderRadius: 2 },
                    { label: 'No Iniciado', data: courses.map(c => Number(c.not_started || 0)), backgroundColor: '#6c757d', borderRadius: 2 },
                ],
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                // Better mouse interaction for labels
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    x: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: { stepSize: 1, precision: 0, color: '#95a0ab' },
                        grid: { color: '#edf0f3' },
                    },
                    y: {
                        stacked: true,
                        ticks: {
                            color: '#2c3e50',
                            font: { size: 11 },
                            // Show full name on hover is handled by tooltip,
                            // but we can ensure labels are not too truncated here
                            autoSkip: false,
                        },
                        grid: { display: false },
                    },
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: '#6c757d', padding: 14, usePointStyle: true, pointStyleWidth: 10 },
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: '#2c3e50',
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: { size: 13, weight: 'bold' },
                        bodyFont: { size: 12 },
                        footerFont: { size: 11, weight: 'normal' },
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            // The title is already the course name (label)
                            label: function (context) {
                                const datasetLabel = context.dataset.label || '';
                                const value = context.parsed.x;
                                const courseIndex = context.dataIndex;
                                const course = courses[courseIndex];

                                const total = Number(course.approved || 0) +
                                    Number(course.not_approved || 0) +
                                    Number(course.in_progress || 0) +
                                    Number(course.not_started || 0);

                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                                return `${datasetLabel}: ${value} (${percentage}%)`;
                            },
                            footer: (tooltipItems) => {
                                const courseIndex = tooltipItems[0].dataIndex;
                                const course = courses[courseIndex];
                                const total = Number(course.approved || 0) +
                                    Number(course.not_approved || 0) +
                                    Number(course.in_progress || 0) +
                                    Number(course.not_started || 0);
                                return `Total de alumnos: ${total}`;
                            }
                        }
                    },
                },
            },
        });

        return () => chart.destroy();
    }, [courses, isSingle]);

    const chartTitle = isSingle ? 'Progreso del Curso' : 'Progreso por Curso';

    return (
        <div className="chart-card fade-in" style={{ animationDelay: '0.35s' }}>
            <h2>{chartTitle}</h2>
            {isSingle ? (
                <ProgressBarsView course={singleCourse} />
            ) : (
                <div className="bars-wrapper" style={{ minHeight: '300px' }}>
                    <canvas ref={canvasRef}></canvas>
                </div>
            )}
        </div>
    );
}
