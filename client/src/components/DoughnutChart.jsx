/**
 * DoughnutChart – with side legend, matching dashboard/index.html exactly.
 */

import { useRef, useEffect } from 'react';
import {
    Chart as ChartJS,
    DoughnutController,
    ArcElement,
    Tooltip,
} from 'chart.js';

ChartJS.register(DoughnutController, ArcElement, Tooltip);

const LABELS = ['No Iniciado', 'En Progreso', 'Aprobados', 'No Aprobados'];
const COLORS = ['#6c757d', '#f0ad4e', '#28a745', '#dc3545'];

export default function DoughnutChart({ stats, title }) {
    const canvasRef = useRef(null);

    const ns = Number(stats.not_started || 0);
    const ip = Number(stats.in_progress || 0);
    const ap = Number(stats.approved || 0);
    const na = Number(stats.not_approved || 0);
    const total = ns + ip + ap + na;
    const values = [ns, ip, ap, na];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Force-destroy any existing chart on this canvas
        const existing = ChartJS.getChart(canvas);
        if (existing) existing.destroy();

        const centerPlugin = {
            id: 'centerText',
            afterDraw(chart) {
                const { ctx, width, height } = chart;
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = '700 24px Inter, sans-serif';
                ctx.fillStyle = '#2c3e50';
                ctx.fillText(String(total), width / 2, height / 2 - 4);
                ctx.font = '400 10px Inter, sans-serif';
                ctx.fillStyle = '#95a0ab';
                ctx.fillText('Total', width / 2, height / 2 + 14);
                ctx.restore();
            },
        };

        const chart = new ChartJS(canvas, {
            type: 'doughnut',
            data: {
                labels: LABELS,
                datasets: [{
                    data: values,
                    backgroundColor: COLORS,
                    borderWidth: 2,
                    borderColor: '#fff',
                    hoverOffset: 6,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '65%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#2c3e50',
                        padding: 10,
                        cornerRadius: 6,
                        callbacks: {
                            label(context) {
                                const v = context.parsed || 0;
                                const p = total > 0 ? ((v / total) * 100).toFixed(1) : '0.0';
                                return ` ${context.label}: ${v} (${p}%)`;
                            },
                        },
                    },
                },
            },
            plugins: [centerPlugin],
        });

        return () => chart.destroy();
    }, [ns, ip, ap, na, total]);

    return (
        <div className="chart-card fade-in" style={{ animationDelay: '0.3s' }}>
            <h2>{title || 'Distribución de Estudiantes'}</h2>
            <div className="donut-container">
                <div className="donut-canvas-wrap">
                    <canvas ref={canvasRef}></canvas>
                </div>
                <div className="donut-legend">
                    {LABELS.map((label, i) => (
                        <div className="donut-legend-item" key={label}>
                            <span className="dot" style={{ background: COLORS[i] }} />
                            {label}: <span className="legend-value">{values[i]}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
