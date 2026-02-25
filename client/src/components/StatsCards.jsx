/**
 * StatsCards – 5 stat cards in a grid: Total, No Iniciado, En Progreso, Aprobados, No Aprobados.
 * Props: stats = { not_started, in_progress, approved, not_approved, total }
 */

function pct(val, total) {
    return total > 0 ? ((val / total) * 100).toFixed(1) + '%' : '0%';
}

export default function StatsCards({ stats }) {
    const total = Number(stats.total || 0);
    const ns = Number(stats.not_started || 0);
    const ip = Number(stats.in_progress || 0);
    const ap = Number(stats.approved || 0);
    const na = Number(stats.not_approved || 0);

    return (
        <section className="stats-row">
            <div className="stat-card total fade-in" style={{ animationDelay: '0.05s' }}>
                <div className="label">Total Estudiantes</div>
                <div className="value c-tot">{total}</div>
            </div>
            <div className="stat-card not-started fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="label">No Iniciado</div>
                <div className="value c-ns">{ns}</div>
                <div className="pct">{pct(ns, total)}</div>
            </div>
            <div className="stat-card in-progress fade-in" style={{ animationDelay: '0.15s' }}>
                <div className="label">En Progreso</div>
                <div className="value c-ip">{ip}</div>
                <div className="pct">{pct(ip, total)}</div>
            </div>
            <div className="stat-card approved fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="label">Aprobados</div>
                <div className="value c-ap">{ap}</div>
                <div className="pct">{pct(ap, total)}</div>
            </div>
            <div className="stat-card not-approved fade-in" style={{ animationDelay: '0.25s' }}>
                <div className="label">No Aprobados</div>
                <div className="value c-na">{na}</div>
                <div className="pct">{pct(na, total)}</div>
            </div>
        </section>
    );
}
