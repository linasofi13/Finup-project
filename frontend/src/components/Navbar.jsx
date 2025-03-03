const Navbar = () => {
    return (
        <nav className="bg-white shadow-md p-4 flex justify-between">
            <input
                type="text"
                placeholder="Buscar..."
                className="border rounded-lg px-4 py-2 w-1/3"
            />
            <div className="flex items-center space-x-4">
                <button className="bg-blue-500 text-white px-4 py-2 rounded">Notificaciones</button>
                <div className="font-semibold">Juan (Admin)</div>
            </div>
        </nav>
    );
};

export default Navbar;
