"use client";

import { useState } from "react";
import { FaTrash, FaFilter, FaDownload, FaPlus, FaEye, FaTimes, FaDollarSign, FaExclamationTriangle } from "react-icons/fa";

const initialEvcs = [
    { id: 1, nombre: "EVC1", proyecto: "Proyecto 1", entorno: "Entorno 1", creado: "01/11/2025", actualizado: "01/12/2025", actual: 1, asignado: 80, gastado: 56, progreso: 75, estado: "En curso", color: "bg-purple-600" },
    { id: 2, nombre: "EVC2", proyecto: "Proyecto 2", entorno: "Entorno 2", creado: "01/11/2025", actualizado: "01/12/2025", actual: 1, asignado: 80, gastado: 56, progreso: 75, estado: "En curso", color: "bg-purple-700" },
    { id: 3, nombre: "EVC3", proyecto: "Proyecto 3", entorno: "Entorno 3", creado: "01/11/2025", actualizado: "01/12/2025", actual: 1, asignado: 80, gastado: 56, progreso: 75, estado: "En curso", color: "bg-green-700" },
];

export default function EvcsPage() {
    const [evcs, setEvcs] = useState(initialEvcs);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [nuevoEvc, setNuevoEvc] = useState({ nombre: "", proyecto: "", entorno: "", presupuesto: "", roles: 1, asignacion: "", comentarios: "" });
    const [roles, setRoles] = useState([1]); // Default to 1 role
    const [alerta, setAlerta] = useState("");

    const entornos = ["Entorno 1", "Entorno 2", "Entorno 3"];
    const empresas = ["Epam", "Pragma", "Devlab"];
    const paises = ["México", "Colombia", "Panamá"];

    const manejarCambio = (e) => {
        setNuevoEvc({ ...nuevoEvc, [e.target.name]: e.target.value });
    };

    const handleRolesChange = (e) => {
        const numeroRoles = parseInt(e.target.value, 10);
        setRoles(Array.from({ length: numeroRoles }, (_, index) => index + 1)); // Dynamically add roles
        setNuevoEvc({ ...nuevoEvc, roles: numeroRoles });
    };

    const handleEmpresaChange = (e, rol) => {
        const empresa = e.target.value;
        if (empresa === "Epam") {
            setAlerta("¡La empresa seleccionada ya tiene el 80% de la asignación!");
        } else {
            setAlerta("");
        }
    };

    const agregarEvc = () => {
        if (nuevoEvc.nombre && nuevoEvc.proyecto) {
            setEvcs([...evcs, { ...nuevoEvc, id: evcs.length + 1, color: "bg-blue-600", estado: "En curso" }]);
            setMostrarFormulario(false);
        }
    };

    return (
        <div className="p-6 mt-20 bg-white shadow-md rounded-lg flex flex-col">
            {/* Panel superior de acciones */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">EVCs</h1>
                <div className="flex space-x-2">
                    <button className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
                        <FaTrash className="mr-2" /> Eliminar
                    </button>
                    <button className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
                        <FaFilter className="mr-2" /> Filtrar
                    </button>
                    <button className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
                        <FaDownload className="mr-2" /> Exportar
                    </button>
                    <button onClick={() => setMostrarFormulario(true)} className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
                        <FaPlus className="mr-2" /> Crear EVC
                    </button>
                </div>
            </div>

            {/* Formulario para Crear EVC */}
            {mostrarFormulario && (
                <div className="p-6 bg-gray-100 rounded-lg shadow-md mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Crear EVC</h2>
                        <FaTimes className="text-red-500 cursor-pointer" onClick={() => setMostrarFormulario(false)} />
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" name="nombre" placeholder="Nombre" className="p-2 border rounded" value={nuevoEvc.nombre} onChange={manejarCambio} />
                        <input type="text" name="proyecto" placeholder="Proyecto" className="p-2 border rounded" value={nuevoEvc.proyecto} onChange={manejarCambio} />
                        <select name="entorno" className="p-2 border rounded" value={nuevoEvc.entorno} onChange={manejarCambio}>
                            <option value="">Seleccionar Entorno</option>
                            {entornos.map((entorno, index) => (
                                <option key={index} value={entorno}>{entorno}</option>
                            ))}
                        </select>
                        <div className="flex items-center border rounded">
                            <FaDollarSign className="ml-2" />
                            <input type="number" name="presupuesto" placeholder="Presupuesto" className="p-2 w-full border-none" value={nuevoEvc.presupuesto} onChange={manejarCambio} />
                        </div>
                        <select name="roles" className="p-2 border rounded" value={nuevoEvc.roles} onChange={handleRolesChange}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((roleCount) => (
                                <option key={roleCount} value={roleCount}>{roleCount}</option>
                            ))}
                        </select>
                    </div>

                    {/* Dynamic Role Filters */}
                    {roles.map((rol) => (
                        <div key={rol} className="border p-4 rounded-lg mt-4">
                            <h3 className="font-semibold">Rol {rol}</h3>
                            <div className="flex flex-col space-y-4 mt-2">
                                <div>
                                    <label>Filtrar por:</label>
                                    <select className="p-2 border rounded w-full">
                                        <option value="">Seleccionar</option>
                                        <option value="empresa">Empresa</option>
                                        <option value="pais">País</option>
                                    </select>
                                </div>
                                <div>
                                    <label>Empresa</label>
                                    <select
                                        className="p-2 border rounded w-full"
                                        onChange={(e) => handleEmpresaChange(e, rol)}
                                    >
                                        <option value="">Seleccionar</option>
                                        {empresas.map((empresa) => (
                                            <option key={empresa} value={empresa}>{empresa}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label>País</label>
                                    <select className="p-2 border rounded w-full">
                                        <option value="">Seleccionar</option>
                                        {paises.map((pais) => (
                                            <option key={pais} value={pais}>{pais}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label>Rango de precios</label>
                                    <input type="range" min="0" max="7000" value={nuevoEvc.presupuesto} onChange={manejarCambio} name="presupuesto" className="w-full" />
                                    <div className="flex justify-between">
                                        <span>$0</span>
                                        <span>$7000</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Asignación y Comentarios */}
                    <div className="flex flex-col">
                        <label className="font-semibold">Porcentaje de Asignación</label>
                        <div className="flex items-center space-x-2">
                            <select name="asignacion" value={nuevoEvc.asignacion} onChange={manejarCambio} className="p-2 border rounded">
                                {[10, 20, 30, 40, 50].map((porcentaje) => (
                                    <option key={porcentaje} value={porcentaje}>{porcentaje}%</option>
                                ))}
                                <option value="custom">Personalizado</option>
                            </select>
                            {nuevoEvc.asignacion === "custom" && (
                                <input
                                    type="number"
                                    name="asignacion"
                                    value={nuevoEvc.asignacion}
                                    onChange={manejarCambio}
                                    className="p-2 border rounded"
                                    placeholder="Escribe porcentaje"
                                />
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <label className="font-semibold">Comentarios</label>
                        <textarea name="comentarios" className="p-2 border rounded" value={nuevoEvc.comentarios} onChange={manejarCambio} placeholder="Comentarios adicionales" />
                    </div>

                    {/* Alerta */}
                    {alerta && (
                        <div className="mt-2 bg-yellow-100 text-yellow-800 p-2 rounded-md flex items-center">
                            <FaExclamationTriangle className="mr-2" />
                            {alerta}
                        </div>
                    )}

                    {/* Botones */}
                    <div className="flex justify-end space-x-4 mt-4">
                        <button type="button" className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600" onClick={() => setMostrarFormulario(false)}>
                            Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600" onClick={agregarEvc}>
                            Crear EVC
                        </button>
                    </div>
                </div>
            )}

            {/* Grid de EVCs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {evcs.map((evc) => (
                    <div key={evc.id} className={`p-4 rounded-lg text-white ${evc.color} shadow-md relative flex flex-col`}>
                        <div className="flex justify-between">
                            <div>
                                <h2 className="text-xl font-bold">{evc.nombre}</h2>
                                <p className="text-sm">{evc.proyecto}</p>
                            </div>
                        </div>
                        <div className="mt-2 flex space-x-2 text-sm">
                            <span className="bg-red-500 px-2 py-1 rounded-md">{evc.entorno}</span>
                            <span className="bg-gray-800 px-2 py-1 rounded-md">Creado: {evc.creado}</span>
                            <span className="bg-gray-800 px-2 py-1 rounded-md">Actualizado: {evc.actualizado}</span>
                        </div>
                        <div className="mt-2 text-sm">
                            <p>🔢 Actual: {evc.actual}</p>
                            <p>📊 Asignado: {evc.asignado}%</p>
                            <p>💰 Gastado: {evc.gastado}%</p>
                            <p>📈 Progreso: {evc.progreso}%</p>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <span className="px-3 py-1 bg-green-500 rounded-full text-sm">{evc.estado}</span>
                            <div className="flex space-x-2">
                                <FaEye className="text-white cursor-pointer hover:text-gray-300" />
                                <FaTrash className="text-red-500 cursor-pointer hover:text-red-700" onClick={() => eliminarEvc(evc.id)} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
