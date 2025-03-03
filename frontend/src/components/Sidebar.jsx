import { Link } from "react-router-dom";

const Sidebar = () => {
    return (
        <aside className="w-64 bg-white shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">FinUp</h2>
            <nav>
                <ul className="space-y-4">
                    <li><Link to="/" className="block py-2 px-4 rounded hover:bg-gray-200">Dashboard</Link></li>
                    <li><Link to="/providers" className="block py-2 px-4 rounded hover:bg-gray-200">Proveedores</Link></li>
                    <li><Link to="/evcs" className="block py-2 px-4 rounded hover:bg-gray-200">EVCs</Link></li>
                    <li><Link to="/budget" className="block py-2 px-4 rounded hover:bg-gray-200">Asignación Presupuestal</Link></li>
                    <li><Link to="/settings" className="block py-2 px-4 rounded hover:bg-gray-200">Configuración</Link></li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
