/**
 * CourseSelector – custom dropdown with search to pick a course or "all courses".
 * Props:
 *   courses: [{courseid, coursename, ...}]
 *   selectedCourse: object|null (null = all courses)
 *   onSelect: (course|null) => void
 */

import { useState, useRef, useEffect } from 'react';

export default function CourseSelector({ courses, selectedCourse, onSelect }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef(null);
    const searchRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    // Focus search input when opening
    useEffect(() => {
        if (open && searchRef.current) {
            setTimeout(() => searchRef.current.focus(), 50);
        }
    }, [open]);

    const toggle = () => {
        setOpen(!open);
        setSearch('');
    };

    const handleSelect = (course) => {
        onSelect(course);
        setOpen(false);
    };

    const query = search.trim().toLowerCase();
    const filtered = query
        ? courses.filter(c => c.coursename.toLowerCase().includes(query))
        : courses;

    const showAllOption = !query || 'ver todos los cursos'.includes(query);

    return (
        <div className={`cs-selector ${open ? 'open' : ''}`} ref={ref}>
            <div className="cs-selector-trigger" onClick={toggle}>
                <div className="cs-sel-icon">
                    <span className="material-icons-outlined">
                        {selectedCourse ? 'school' : 'public'}
                    </span>
                </div>
                <div className="cs-sel-label">
                    <div className="cs-sel-hint">Vista actual</div>
                    <div className="cs-sel-value">
                        {selectedCourse ? selectedCourse.coursename : 'Ver todos los cursos'}
                    </div>
                </div>
                <span className="material-icons-outlined cs-sel-chevron">expand_more</span>
            </div>

            <div className="cs-selector-panel">
                <div className="cs-selector-search">
                    <input
                        ref={searchRef}
                        type="text"
                        placeholder="Buscar curso…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
                        autoComplete="off"
                    />
                </div>
                <div className="cs-selector-list">
                    {/* "All courses" option */}
                    {showAllOption && (
                        <div
                            className={`cs-selector-item ${!selectedCourse ? 'active' : ''}`}
                            onClick={() => handleSelect(null)}
                        >
                            <span className="cs-item-check">
                                {!selectedCourse && <span className="material-icons-outlined">check</span>}
                            </span>
                            <span className="material-icons-outlined" style={{ fontSize: 16, color: 'var(--text-muted)' }}>
                                public
                            </span>
                            <span className="cs-item-name" style={{ fontWeight: 500 }}>Ver todos los cursos</span>
                        </div>
                    )}

                    {/* Course items */}
                    {filtered.length === 0 && !showAllOption && (
                        <div className="cs-selector-empty">No se encontraron cursos</div>
                    )}
                    {filtered.slice(0, 50).map(c => {
                        const isActive = selectedCourse && selectedCourse.courseid === c.courseid;
                        return (
                            <div
                                key={c.courseid}
                                className={`cs-selector-item ${isActive ? 'active' : ''}`}
                                onClick={() => handleSelect(c)}
                            >
                                <span className="cs-item-check">
                                    {isActive && <span className="material-icons-outlined">check</span>}
                                </span>
                                <span className="cs-item-name">{c.coursename}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
