"use client";

import React, { useState, useEffect } from "react";
import {
    FaTrash,
    FaFilter,
    FaDownload,
    FaPlus,
    FaEye,
    FaTimes,
    FaExclamationTriangle,
    FaGlobe,
    FaLink,
    FaClock,
    FaHistory,
} from "react-icons/fa";
import { RiTeamFill } from "react-icons/ri";

import axios from "axios";

// Interfaces

interface Entorno {
    id: number;
    name: string;
    status: boolean;
}

interface TechnicalLeader {
    id: number;
    name: string;
}

interface EVC {
    id: number;
    name: string;
    description: string;
    status: boolean;
    creation_date: string;
    updated_at: string;
    entorno: Entorno | null;
    technical_leader: TechnicalLeader | null;
    functional_leader: any;
    evc_qs: any[];
}

export default function EvcsPage() {
    // Estados principales
    const [evcs, setEvcs] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [alert, setAlert] = useState("");
    const [selectedEvc, setSelectedEvc] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [entornosData, setEntornosData] = useState<{ [key: number]: string }>({});
    const [technicalLeadersData, setTechnicalLeadersData] = useState<{ [key: number]: string }>({});
    const [functionalLeadersData, setFunctionalLeadersData] = useState<{ [key: number]: string }>({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [evcToDelete, setEvcToDelete] = useState<EVC | null>(null);

    //Colores para entornos
    const entornoColors = {
        1: "from-blue-500 to-blue-700",
        2: "from-green-500 to-green-700",
        3: "from-orange-500 to-orange-700",
        4: "from-pink-500 to-pink-700",
        5: "from-purple-500 to-purple-700", // Color por defecto
    };

    //Obtener el color del entorno
    const getEntornoColor = (entorno_id: number | null) => {
        return entorno_id ? entornoColors[entorno_id] : "from-purple-500 to-purple-700";
    };

    //Obtener color de acento
    const getContainerColor = (entorno_id: number | null) => {
        const colorMap = {
            1: "bg-blue-800/50",
            2: "bg-green-800/50",
            3: "bg-orange-800/50",
            4: "bg-pink-800/50",
            5: "bg-purple-800/50"
        };
        return entorno_id ? colorMap[entorno_id] : "bg-purple-800/50";
    };

    // Modelo EVC
    const [newEvc, setNewEvc] = useState({
        name: "",
        description: "",
        technical_leader_id: "",
        functional_leader_id: "",
        entorno_id: "",
        status: true,
    });

    // Modelo EVC_Q
    const [newQuarter, setNewQuarter] = useState({
        year: "",
        q: "",
        allocated_budget: "",
        allocated_percentage: "",
    });

    // Modelo EVC_Financial (por quarter)
    const [financialSelections, setFinancialSelections] = useState({}); // { evc_q_id: provider_id }

    // Listas para selects
    const [availableTechnicalLeaders, setAvailableTechnicalLeaders] = useState([]);
    const [availableFunctionalLeaders, setAvailableFunctionalLeaders] = useState(
        []
    );
    const [availableEntornos, setAvailableEntornos] = useState([]);
    const [availableProviders, setAvailableProviders] = useState([]);

    // Efectos iniciales
    useEffect(() => {
        fetchEvcs();
        fetchAvailableTechnicalLeaders();
        fetchAvailableFunctionalLeaders();
        fetchAvailableEntornos();
        fetchAvailableProviders();
        loadEntornosData();
        loadTechnicalLeadersData();
        loadFunctionalLeadersData();
    }, []);


    //Cargar data de líderes
    const loadTechnicalLeadersData = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/technical-leaders/technical-leaders/");
            const data: { [key: number]: string } = {};
            response.data.forEach((leader: TechnicalLeader) => {
                data[leader.id] = leader.name;
            });
            setTechnicalLeadersData(data);
        } catch (error) {
            console.error("Error cargando líderes técnicos:", error);
        }
    };

    const loadFunctionalLeadersData = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/functional-leaders/functional-leaders");
            const data: { [key: number]: string } = {};
            response.data.forEach((leader: any) => {
                data[leader.id] = leader.name;
            });
            setFunctionalLeadersData(data);
        } catch (error) {
            console.error("Error cargando líderes funcionales:", error);
        }
    };


    // Cargar data de entornos
    const loadEntornosData = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/entornos/entornos/");
            const data: { [key: number]: string } = {};
            response.data.forEach((entorno: Entorno) => {
                data[entorno.id] = entorno.name;
            });
            setEntornosData(data);
            console.log("Entornos cargados:", data);
        } catch (error) {
            console.error("Error cargando entornos:", error);
        }
    };

    // Handlers EVC
    const handleEvcChange = (e) => {
        const { name, value } = e.target;
        setNewEvc((prev) => ({
            ...prev,
            [name]: name === "status" ? value === "true" : value,
        }));
    };

    // Handlers EVC_Q
    const handleQuarterChange = (e) => {
        const { name, value } = e.target;
        setNewQuarter((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handlers EVC_Financial
    const handleFinancialChange = (e, evc_q_id) => {
        const { value } = e.target;
        setFinancialSelections((prev) => ({
            ...prev,
            [evc_q_id]: value,
        }));
    };

    // Fetch data del backend
    const fetchEvcs = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/evcs/evcs/");
            console.log("EVCs recibidos:", response.data);
            console.log("Primer EVC:", response.data[0]);
            setEvcs(response.data);
        } catch (error) {
            console.error("Error al cargar EVCs:", error);
        }
    };

    const fetchAvailableTechnicalLeaders = async () => {
        try {
            const resp = await axios.get(
                "http://127.0.0.1:8000/technical-leaders/technical-leaders/"
            );
            setAvailableTechnicalLeaders(resp.data);
        } catch (error) {
            console.error("Error al cargar líderes técnicos:", error);
        }
    };

    const fetchAvailableFunctionalLeaders = async () => {
        try {
            const resp = await axios.get(
                "http://127.0.0.1:8000/functional-leaders/functional-leaders"
            );
            setAvailableFunctionalLeaders(resp.data);
        } catch (error) {
            console.error("Error al cargar líderes funcionales:", error);
        }
    };

    const fetchAvailableEntornos = async () => {
        try {
            const resp = await axios.get("http://127.0.0.1:8000/entornos/entornos/");
            setAvailableEntornos(resp.data);
        } catch (error) {
            console.error("Error al cargar entornos:", error);
        }
    };

    const fetchAvailableProviders = async () => {
        try {
            const resp = await axios.get("http://127.0.0.1:8000/providers/providers/");
            setAvailableProviders(resp.data);
        } catch (error) {
            console.error("Error al cargar proveedores:", error);
        }
    };

    // Crear EVC
    const createEvc = async () => {
        try {
            const response = await axios.post("http://127.0.0.1:8000/evcs/evcs/", {
                name: newEvc.name,
                description: newEvc.description,
                technical_leader_id: parseInt(newEvc.technical_leader_id, 10) || null,
                functional_leader_id: parseInt(newEvc.functional_leader_id, 10) || null,
                entorno_id: parseInt(newEvc.entorno_id, 10) || null,
                status: newEvc.status,
            });
            console.log("EVC creada:", response.data);
            fetchEvcs();
            setShowForm(false);
            setAlert("");
            setNewEvc({
                name: "",
                description: "",
                technical_leader_id: "",
                functional_leader_id: "",
                entorno_id: "",
                status: true,
            });
        } catch (error) {
            console.error("Error creando EVC:", error);
            setAlert("Error al crear la EVC");
        }
    };

    // Crear EVC_Q
    const createQuarter = async (evcId) => {
        try {
            const response = await axios.post("http://127.0.0.1:8000/evc-qs/evc_qs/", {
                evc_id: evcId,
                year: parseInt(newQuarter.year, 10),
                q: parseInt(newQuarter.q, 10),
                allocated_budget: parseFloat(newQuarter.allocated_budget),
                allocated_percentage: parseFloat(newQuarter.allocated_percentage),
            });
            console.log("Quarter creado:", response.data);
            const updatedEvc = await axios.get(
                `http://127.0.0.1:8000/evcs/evcs/${evcId}`
            );
            setSelectedEvc(updatedEvc.data);
            setNewQuarter({
                year: "",
                q: "",
                allocated_budget: "",
                allocated_percentage: "",
            });
        } catch (error) {
            console.error("Error creando quarter:", error);
            setAlert("Error al crear el quarter");
        }
    };

    // Crear EVC_Financial
    const createFinancial = async (evcId, evc_q_id) => {
        const provider_id = financialSelections[evc_q_id];
        if (!provider_id) {
            setAlert("Seleccione un proveedor");
            return;
        }
        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/evc-financials/evc_financials/",
                {
                    evc_q_id: evc_q_id,
                    provider_id: parseInt(provider_id, 10) || null,
                }
            );
            console.log("Financial creado:", response.data);
            const updatedEvc = await axios.get(
                `http://127.0.0.1:8000/evcs/evcs/${evcId}`
            );
            setSelectedEvc(updatedEvc.data);
            setFinancialSelections((prev) => ({
                ...prev,
                [evc_q_id]: "", // Resetear selección para este quarter
            }));
        } catch (error) {
            console.error("Error creando financial:", error);
            const errorMsg =
                error.response?.data?.detail || "Error al asignar el proveedor";
            setAlert(errorMsg);
        }
    };

    // Eliminar EVC
    const deleteEvc = async (evcId) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/evcs/evcs/${evcId}`);
            setEvcs((prev) => prev.filter((e) => e.id !== evcId));
            setShowDeleteModal(false);
            setEvcToDelete(null);
            setShowDetailModal(false);
        } catch (error) {
            console.error("Error eliminando EVC:", error);
            setAlert("Error al eliminar la EVC");
        }
    };

    const handleDeleteClick = (evc: EVC) => {
        setEvcToDelete(evc);
        setShowDeleteModal(true);
    };

    // Mostrar vista detallada
    const showEvcDetails = (evc) => {
        setSelectedEvc(evc);
        setShowDetailModal(true);
    };

    // Obtener todos los proveedores asignados al EVC
    const getEvcProviders = () => {
        if (!selectedEvc?.evc_qs) return [];
        const providers = new Map(); // Usar Map para evitar duplicados
        selectedEvc.evc_qs.forEach((quarter) => {
            if (quarter.evc_financials) {
                quarter.evc_financials.forEach((financial) => {
                    if (financial.provider) {
                        providers.set(financial.provider.id, financial.provider);
                    }
                });
            }
        });
        return Array.from(providers.values());
    };

    // Render
    return (
        <div className="p-6 mt-20 bg-white shadow-md rounded-lg flex flex-col">
            {/* Panel de acciones */}
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
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                    >
                        <FaPlus className="mr-2" /> Crear EVC
                    </button>
                </div>
            </div>

            {/* Formulario para crear EVC */}
            {showForm && (
                <div className="p-6 bg-gray-100 rounded-lg shadow-md mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Crear EVC</h2>
                        <FaTimes
                            className="text-red-500 cursor-pointer"
                            onClick={() => setShowForm(false)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="name"
                            placeholder="Nombre de la EVC"
                            className="p-2 border rounded"
                            value={newEvc.name}
                            onChange={handleEvcChange}
                        />
                        <input
                            type="text"
                            name="description"
                            placeholder="Descripción"
                            className="p-2 border rounded"
                            value={newEvc.description}
                            onChange={handleEvcChange}
                        />
                        <div>
                            <label className="block font-semibold">Líder Técnico</label>
                            <select
                                name="technical_leader_id"
                                className="p-2 border rounded w-full"
                                value={newEvc.technical_leader_id}
                                onChange={handleEvcChange}
                            >
                                <option value="">-- Seleccionar --</option>
                                {availableTechnicalLeaders.map((leader) => (
                                    <option key={leader.id} value={leader.id}>
                                        {leader.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block font-semibold">Líder Funcional</label>
                            <select
                                name="functional_leader_id"
                                className="p-2 border rounded w-full"
                                value={newEvc.functional_leader_id}
                                onChange={handleEvcChange}
                            >
                                <option value="">-- Seleccionar --</option>
                                {availableFunctionalLeaders.map((leader) => (
                                    <option key={leader.id} value={leader.id}>
                                        {leader.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block font-semibold">Entorno</label>
                            <select
                                name="entorno_id"
                                className="p-2 border rounded w-full"
                                value={newEvc.entorno_id}
                                onChange={handleEvcChange}
                            >
                                <option value="">-- Seleccionar --</option>
                                {availableEntornos.map((ent) => (
                                    <option key={ent.id} value={ent.id}>
                                        {ent.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block font-semibold">Estado</label>
                            <select
                                name="status"
                                className="p-2 border rounded w-full"
                                value={newEvc.status.toString()}
                                onChange={handleEvcChange}
                            >
                                <option value="true">Activo</option>
                                <option value="false">Inactivo</option>
                            </select>
                        </div>
                    </div>
                    {alert && (
                        <div className="mt-2 bg-yellow-100 text-yellow-800 p-2 rounded-md flex items-center">
                            <FaExclamationTriangle className="mr-2" />
                            {alert}
                        </div>
                    )}
                    <div className="flex justify-end space-x-4 mt-4">
                        <button
                            type="button"
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            onClick={() => setShowForm(false)}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                            onClick={createEvc}
                        >
                            Crear EVC
                        </button>
                    </div>
                </div>
            )}



            {/* Modal de eliminación */}
            {showDeleteModal && evcToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Confirmar Eliminación</h2>
                        <p className="mb-4">
                            ¿Está seguro que desea eliminar la EVC "{evcToDelete.name}"?
                            Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setEvcToDelete(null);
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                onClick={() => deleteEvc(evcToDelete.id)}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para vista detallada */}
            {showDetailModal && selectedEvc && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Detalles de {selectedEvc.name}</h2>
                            <FaTimes
                                className="text-red-500 cursor-pointer"
                                onClick={() => setShowDetailModal(false)}
                            />
                        </div>

                        {/* Detalles del EVC */}
                        <div className="mb-6">
                            <p className="flex items-center">
                                <FaLink className="mr-2" />
                                <strong>URL:</strong>{" "}
                                <a
                                    href={`http://127.0.0.1:8000/evcs/evcs/${selectedEvc.id}`}
                                    className="text-blue-500 hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    http://127.0.0.1:8000/evcs/evcs/{selectedEvc.id}
                                </a>
                            </p>
                            <p>
                                <strong>Descripción:</strong> {selectedEvc.description}
                            </p>
                            {selectedEvc.technical_leader_id && (
                                <p className="flex items-center">
                                    <strong className="mr-2">Líder Técnico:</strong>
                                    {technicalLeadersData[selectedEvc.technical_leader_id] || 'Cargando...'}
                                </p>
                            )}
                            {selectedEvc.functional_leader_id && (
                                <p className="flex items-center">
                                    <strong className="mr-2">Líder Funcional:</strong>
                                    {functionalLeadersData[selectedEvc.functional_leader_id] || 'Cargando...'}
                                </p>
                            )}
                            {selectedEvc.entorno_id && (
                                <p className="flex items-center">
                                    <strong className="mr-2">Entorno:</strong>
                                    {entornosData[selectedEvc.entorno_id] || 'Cargando...'}
                                </p>
                            )}
                            <p>
                                <strong>Estado:</strong> {selectedEvc.status ? "Activo" : "Inactivo"}
                            </p>
                            <p>
                                <strong>Creado:</strong>{" "}
                                {new Date(selectedEvc.creation_date).toLocaleDateString()}
                            </p>
                            <p>
                                <strong>Actualizado:</strong>{" "}
                                {new Date(selectedEvc.updated_at).toLocaleDateString()}
                            </p>
                        </div>

                        {/* Lista de proveedores asignados al EVC */}
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">
                                Proveedores Asignados al EVC
                            </h3>
                            {getEvcProviders().length > 0 ? (
                                <ul className="list-disc pl-5">
                                    {getEvcProviders().map((provider) => (
                                        <li key={provider.id}>
                                            {provider.name || "Sin nombre"} ({provider.company || "Sin empresa"},
                                            ${provider.cost_usd || 0})
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No hay proveedores asignados al EVC.</p>
                            )}
                        </div>

                        {/* Formulario para crear quarter */}
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">Crear Quarter</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="number"
                                    name="year"
                                    placeholder="Año (ej. 2025)"
                                    className="p-2 border rounded"
                                    value={newQuarter.year}
                                    onChange={handleQuarterChange}
                                />
                                <select
                                    name="q"
                                    className="p-2 border rounded"
                                    value={newQuarter.q}
                                    onChange={handleQuarterChange}
                                >
                                    <option value="">-- Seleccionar Quarter --</option>
                                    <option value="1">Q1</option>
                                    <option value="2">Q2</option>
                                    <option value="3">Q3</option>
                                    <option value="4">Q4</option>
                                </select>
                                <input
                                    type="number"
                                    name="allocated_budget"
                                    placeholder="Presupuesto asignado"
                                    className="p-2 border rounded"
                                    value={newQuarter.allocated_budget}
                                    onChange={handleQuarterChange}
                                />
                                <input
                                    type="number"
                                    name="allocated_percentage"
                                    placeholder="Porcentaje asignado (%)"
                                    className="p-2 border rounded"
                                    value={newQuarter.allocated_percentage}
                                    onChange={handleQuarterChange}
                                />
                            </div>
                            <button
                                className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                                onClick={() => createQuarter(selectedEvc.id)}
                            >
                                Crear Quarter
                            </button>
                        </div>

                        {/* Lista de quarters */}
                        <div>
                            <h3 className="text-xl font-semibold mb-2">Quarters</h3>
                            {selectedEvc.evc_qs && selectedEvc.evc_qs.length > 0 ? (
                                selectedEvc.evc_qs.map((quarter) => (
                                    <div key={quarter.id} className="border p-4 rounded-lg mb-4">
                                        <p>
                                            <strong>Año:</strong> {quarter.year}
                                        </p>
                                        <p>
                                            <strong>Quarter:</strong> Q{quarter.q}
                                        </p>
                                        <p>
                                            <strong>Presupuesto Asignado:</strong> ${quarter.allocated_budget}
                                        </p>
                                        <p>
                                            <strong>Porcentaje Asignado:</strong> {quarter.allocated_percentage}%
                                        </p>

                                        {/* Formulario para asignar proveedor */}
                                        <div className="mt-4">
                                            <h4 className="font-semibold">Asignar Proveedor</h4>
                                            <select
                                                className="p-2 border rounded w-full"
                                                value={financialSelections[quarter.id] || ""}
                                                onChange={(e) => handleFinancialChange(e, quarter.id)}
                                            >
                                                <option value="">-- Seleccionar Proveedor --</option>
                                                {availableProviders.map((provider) => (
                                                    <option key={provider.id} value={provider.id}>
                                                        {provider.name} ({provider.company}, ${provider.cost_usd})
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                                                onClick={() => createFinancial(selectedEvc.id, quarter.id)}
                                                disabled={!financialSelections[quarter.id]}
                                            >
                                                Asignar Proveedor
                                            </button>
                                        </div>

                                        {/* Lista de proveedores asignados */}
                                        {quarter.evc_financials && quarter.evc_financials.length > 0 && (
                                            <div className="mt-4">
                                                <h4 className="font-semibold">Proveedores Asignados</h4>
                                                <ul className="list-disc pl-5">
                                                    {quarter.evc_financials.map((financial) => (
                                                        <li key={financial.id}>
                                                            {financial.provider?.name || "Sin nombre"} (
                                                            {financial.provider?.company || "Sin empresa"}, $
                                                            {financial.provider?.cost_usd || 0})
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>No hay quarters asignados.</p>
                            )}
                        </div>

                        {alert && (
                            <div className="mt-4 bg-yellow-100 text-yellow-800 p-2 rounded-md flex items-center">
                                <FaExclamationTriangle className="mr-2" />
                                {alert}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Listado de EVCs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {evcs.map((evc: EVC) => (
                    <div
                        key={evc.id}
                        className={`p-6 rounded-xl shadow-md flex flex-col bg-gradient-to-tr ${getEntornoColor(evc.entorno_id)
                            } text-white hover:shadow-xl hover:scale-105 transition-transform duration-300`}
                    >
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-2xl font-bold flex items-center">
                                <RiTeamFill className="mr-2" /> {evc.name}
                            </h2>
                            {evc.entorno_id && (
                                <div className={`${getContainerColor(evc.entorno_id)} rounded-lg px-3 py-1 flex items-center`}>
                                    <FaGlobe className="mr-2 text-white/80" />
                                    <span className="font-medium">
                                        {entornosData[evc.entorno_id] || 'Cargando...'}
                                    </span>
                                </div>
                            )}
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${evc.status ? "bg-green-400" : "bg-red-400"
                                    }`}
                            >
                                {evc.status ? "Activo" : "Inactivo"}
                            </span>
                        </div>
                        <div className="mb-3 text-lg">
                            <p className="flex items-center">

                                <span className="font-semibold mr-1">Descripción:</span>{" "}
                                {evc.description}
                            </p>

                            {evc.evc_qs && evc.evc_qs.length > 0 && (
                                <p className="flex items-center">
                                    <span className="font-semibold mr-1">Quarters:</span>{" "}
                                    {evc.evc_qs.length} asignados
                                </p>
                            )}
                        </div>
                        <div className="mb-3 text-base">
                            <div className={`${getContainerColor(evc.entorno_id)} rounded-lg p-3 flex justify-between items-center`}>
                                <div className="flex items-center">
                                    <FaClock className="mr-2" />
                                    <span>
                                        <span className="text-white/70">Creado:</span>{" "}
                                        {new Date(evc.creation_date).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <FaHistory className="mr-2" />
                                    <span>
                                        <span className="text-white/70">Actualizado:</span>{" "}
                                        {new Date(evc.updated_at).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end items-center mt-auto space-x-4">
                            <FaEye
                                className="cursor-pointer hover:text-white/70 text-xl"
                                onClick={() => showEvcDetails(evc)}
                            />
                            <FaTrash
                                className="cursor-pointer hover:text-red-300 text-xl"
                                onClick={() => handleDeleteClick(evc)}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
