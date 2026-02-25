/**
 * CourseTable – per-course data table with search, pagination, and clickable rows.
 * Props:
 *   courses: [{courseid, coursename, approved, not_approved, in_progress, not_started}]
 *   onSelectCourse: (course) => void
 */

import { useState, useMemo } from 'react';

export default function CourseTable({ courses, onSelectCourse }) {
    const [search, setSearch] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return q ? courses.filter(c => c.coursename.toLowerCase().includes(q)) : courses;
    }, [courses, search]);

    const totalPages = Math.ceil(filtered.length / pageSize);
    const safePage = Math.min(currentPage, totalPages || 1);
    const pageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    const handlePageSizeChange = (e) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(1);
    };

    // Generate pagination buttons
    const paginationButtons = () => {
        if (totalPages <= 1) return null;
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            const s = Math.max(2, safePage - 1);
            const e = Math.min(totalPages - 1, safePage + 1);
            if (s > 2) pages.push('...');
            for (let i = s; i <= e; i++) pages.push(i);
            if (e < totalPages - 1) pages.push('...');
            pages.push(totalPages);
        }
        return (
            <div className="pagination">
                <button disabled={safePage === 1} onClick={() => setCurrentPage(safePage - 1)}>‹</button>
                {pages.map((p, i) =>
                    p === '...' ? (
                        <button key={`ellipsis-${i}`} disabled style={{ border: 'none' }}>…</button>
                    ) : (
                        <button
                            key={p}
                            className={p === safePage ? 'active' : ''}
                            onClick={() => setCurrentPage(p)}
                        >
                            {p}
                        </button>
                    )
                )}
                <button disabled={safePage === totalPages} onClick={() => setCurrentPage(safePage + 1)}>›</button>
            </div>
        );
    };

    return (
        <section className="chart-card fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="table-toolbar">
                <h2 style={{ textAlign: 'left' }}>Detalle por Curso</h2>
                <div className="table-toolbar-right">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Buscar curso…"
                        value={search}
                        onChange={handleSearchChange}
                    />
                    <select className="page-size-select" value={pageSize} onChange={handlePageSizeChange}>
                        <option value={10}>10 por página</option>
                        <option value={50}>50 por página</option>
                        <option value={100}>100 por página</option>
                    </select>
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Curso</th>
                            <th>Completados</th>
                            <th>En Progreso</th>
                            <th>No Iniciado</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageItems.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: 16, textAlign: 'center', color: 'var(--text-light)' }}>
                                    No se encontraron cursos
                                </td>
                            </tr>
                        ) : (
                            pageItems.map((c) => {
                                const ap = Number(c.approved || 0);
                                const na = Number(c.not_approved || 0);
                                const ip = Number(c.in_progress || 0);
                                const ns = Number(c.not_started || 0);
                                const rowTotal = ap + na + ip + ns;
                                const completed = ap + na; // completed = approved + not_approved
                                return (
                                    <tr key={c.courseid}>
                                        <td>
                                            <a className="course-link" onClick={(e) => { e.preventDefault(); onSelectCourse(c); }}>
                                                {c.coursename}
                                            </a>
                                        </td>
                                        <td><span style={{ color: '#17a2b8', fontWeight: 600 }}>{completed}</span></td>
                                        <td><span style={{ color: '#f0ad4e', fontWeight: 600 }}>{ip}</span></td>
                                        <td><span style={{ color: '#6c757d', fontWeight: 600 }}>{ns}</span></td>
                                        <td style={{ fontWeight: 700 }}>{rowTotal}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {paginationButtons()}
        </section>
    );
}
