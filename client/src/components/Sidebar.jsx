export default function Sidebar({ onLogout }) {
    return (
        <aside className="sidebar" id="sidebar">
            <div className="sidebar-brand">
                <div className="brand-icon">EC</div>
                <div className="brand-text">
                    <h2>Estadísticas</h2>
                    <small>Gestión de Cursos</small>
                </div>
            </div>
            <nav className="sidebar-nav">
                <button className="nav-item active">
                    <span className="material-icons-outlined">home</span>
                    Inicio
                </button>
                <div className="nav-divider" />
                <button className="nav-item">
                    <span className="material-icons-outlined">settings</span>
                    Configuración
                </button>
                {onLogout && (
                    <button className="nav-item logout" onClick={onLogout}>
                        <span className="material-icons-outlined">logout</span>
                        Cerrar sesión
                    </button>
                )}
            </nav>
        </aside>
    );
}
