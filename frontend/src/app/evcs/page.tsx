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
    FaCalendar
} from "react-icons/fa";
import { RiTeamFill } from "react-icons/ri";
import * as XLSX from "xlsx";

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
    const [showQuartersModal, setShowQuartersModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filters, setFilters] = useState({
        entorno_id: '',
    });
    const [filteredEvcs, setFilteredEvcs] = useState([]);
    const [showExportModal, setShowExportModal] = useState(false);
    const [selectedEvcsForExport, setSelectedEvcsForExport] = useState<number[]>([]);


    //Colores para entornos
    const entornoColors = {
        1: "bg-[#faa0c5]",  // Rosa claro
        2: "bg-[#00c389]",  // Verde
        3: "bg-[#fdda24]",  // Amarillo
        4: "bg-[#ff7f41]",  // Naranja
        5: "bg-[#59CBE8]",  // Azul claro
    };

    //Obtener el color del entorno
    const getEntornoColor = (entorno_id: number | null) => {
        return entorno_id ? entornoColors[entorno_id] : "bg-[#59CBE8]";
    };

    //Obtener color de acento
    const getContainerColor = (entorno_id: number | null) => {
        const colorMap = {
            1: "bg-[#e497b1]",
            2: "bg-[#00a974]",
            3: "bg-[#e3c31f]",
            4: "bg-[#e66a2d]",
            5: "bg-[#41b3d3]"
        };
        return entorno_id ? colorMap[entorno_id] : "bg-[#59CBE8]/50";
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

    //Funciones para manejar filtrado
    const applyFilters = () => {
        let result = [...evcs];

        if (filters.entorno_id !== '') {
            const entornoIdNumber = parseInt(filters.entorno_id);
            result = result.filter((evc) => {
                console.log('Comparing:', {
                    evc_entorno: evc.entorno_id,
                    filter_entorno: entornoIdNumber,
                    equals: evc.entorno_id === entornoIdNumber
                });
                return evc.entorno_id === entornoIdNumber;
            });
        }
        console.log('Filtered results:', result)
        setFilteredEvcs(result);
        setShowFilterModal(false);
    }

    const clearFilters = () => {
        setFilters({
            entorno_id: '',
        });
        setFilteredEvcs([]);
        setShowFilterModal(false);
    }

    //Función para exportar a Excel
    const exportToExcel = () => {
        const selectedEvcsData = evcs.filter(evc => selectedEvcsForExport.includes(evc.id));

        // Crear hoja principal de EVCs
        const evcsData = selectedEvcsData.map(evc => ({
            'Nombre': evc.name,
            'Descripción': evc.description,
            'Estado': evc.status ? 'Activo' : 'Inactivo',
            'Entorno': evc.entorno_id ? entornosData[evc.entorno_id] : '',
            'Líder Técnico': evc.technical_leader_id ? technicalLeadersData[evc.technical_leader_id] : '',
            'Líder Funcional': evc.functional_leader_id ? functionalLeadersData[evc.functional_leader_id] : '',
            'Quarters Asignados': evc.evc_qs ? evc.evc_qs.length : 0,
            'Fecha Creación': new Date(evc.creation_date).toLocaleDateString(),
            'Última Actualización': new Date(evc.updated_at).toLocaleDateString()
        }));

        // Crear hoja de quarters
        const quartersData = selectedEvcsData.flatMap(evc =>
            evc.evc_qs.map(quarter => ({
                'EVC': evc.name,
                'Año': quarter.year,
                'Quarter': `Q${quarter.q}`,
                'Presupuesto': quarter.allocated_budget,
                'Porcentaje': quarter.allocated_percentage,
                'Proveedores': quarter.evc_financials?.map(f => f.provider.name).join(', ') || ''
            }))
        );

        const wb = XLSX.utils.book_new();

        // Agregar hoja de EVCs
        const wsEvcs = XLSX.utils.json_to_sheet(evcsData);
        XLSX.utils.book_append_sheet(wb, wsEvcs, "EVCs");

        // Agregar hoja de Quarters
        const wsQuarters = XLSX.utils.json_to_sheet(quartersData);
        XLSX.utils.book_append_sheet(wb, wsQuarters, "Quarters");

        XLSX.writeFile(wb, "evcs_con_quarters.xlsx");
        setShowExportModal(false);
        setSelectedEvcsForExport([]);
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
                    <button className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600" onClick={() => setShowFilterModal(true)}>
                        <FaFilter className="mr-2" />
                        {filteredEvcs.length > 0 ? `Filtrado (${filteredEvcs.length})` : 'Filtrar'}
                    </button>
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                    >
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




            {/* Modal de selección para exportación */}
            {showExportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Seleccionar EVCs para exportar</h2>
                            <FaTimes
                                className="text-red-500 cursor-pointer"
                                onClick={() => setShowExportModal(false)}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    className="mr-2"
                                    checked={selectedEvcsForExport.length === evcs.length}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedEvcsForExport(evcs.map(evc => evc.id));
                                        } else {
                                            setSelectedEvcsForExport([]);
                                        }
                                    }}
                                />
                                Seleccionar todas
                            </label>
                        </div>

                        <div className="space-y-2 mb-6">
                            {evcs.map(evc => (
                                <label key={evc.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                                    <input
                                        type="checkbox"
                                        className="mr-2"
                                        checked={selectedEvcsForExport.includes(evc.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedEvcsForExport([...selectedEvcsForExport, evc.id]);
                                            } else {
                                                setSelectedEvcsForExport(selectedEvcsForExport.filter(id => id !== evc.id));
                                            }
                                        }}
                                    />
                                    <span>{evc.name}</span>
                                    <span className="ml-2 text-sm text-gray-500">
                                        ({evc.evc_qs?.length || 0} quarters)
                                    </span>
                                </label>
                            ))}
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                onClick={() => setShowExportModal(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                                onClick={exportToExcel}
                                disabled={selectedEvcsForExport.length === 0}
                            >
                                Exportar Seleccionadas
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Modal de filtrado */}
            {showFilterModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Filtrar EVCs</h2>

                        <div className="mb-4">
                            <label className="block font-semibold mb-2">Entorno</label>
                            <select
                                className="p-2 border rounded w-full"
                                value={filters.entorno_id}
                                onChange={(e) => setFilters(prev => ({ ...prev, entorno_id: e.target.value }))}
                            >

                                <option value="">Todos los entornos</option>
                                {availableEntornos.map((entorno) => (
                                    <option key={entorno.id} value={entorno.id}>
                                        {entorno.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                onClick={clearFilters}
                            >
                                Limpiar filtros
                            </button>
                            <button
                                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                                onClick={applyFilters}
                            >
                                Aplicar filtros
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* Modal para gestión de quarters */}
            {showQuartersModal && selectedEvc && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Gestión de Quarters - {selectedEvc.name}</h2>
                            <FaTimes
                                className="text-red-500 cursor-pointer"
                                onClick={() => setShowQuartersModal(false)}
                            />
                        </div>

                        {/* Formulario para crear quarter */}
                        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-4">Agregar Nuevo Quarter</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Año</label>
                                    <input
                                        type="number"
                                        name="year"
                                        className="p-2 border rounded w-full"
                                        value={newQuarter.year}
                                        onChange={handleQuarterChange}
                                        placeholder="YYYY"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Quarter</label>
                                    <select
                                        name="q"
                                        className="p-2 border rounded w-full"
                                        value={newQuarter.q}
                                        onChange={handleQuarterChange}
                                    >
                                        <option value="">Seleccionar Q</option>
                                        <option value="1">Q1</option>
                                        <option value="2">Q2</option>
                                        <option value="3">Q3</option>
                                        <option value="4">Q4</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Presupuesto Asignado</label>
                                    <input
                                        type="number"
                                        name="allocated_budget"
                                        className="p-2 border rounded w-full"
                                        value={newQuarter.allocated_budget}
                                        onChange={handleQuarterChange}
                                        placeholder="$"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Porcentaje</label>
                                    <input
                                        type="number"
                                        name="allocated_percentage"
                                        className="p-2 border rounded w-full"
                                        value={newQuarter.allocated_percentage}
                                        onChange={handleQuarterChange}
                                        placeholder="%"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end mt-4">
                                <button
                                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                                    onClick={() => createQuarter(selectedEvc.id)}
                                >
                                    Agregar Quarter
                                </button>
                            </div>
                        </div>

                        {/* Lista de quarters con gestión de proveedores */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold mb-4">Quarters Existentes</h3>
                            {selectedEvc.evc_qs && selectedEvc.evc_qs.length > 0 ? (
                                selectedEvc.evc_qs.map((quarter) => (
                                    <div key={quarter.id} className="border p-4 rounded-lg">
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <p><strong>Año:</strong> {quarter.year}</p>
                                            <p><strong>Quarter:</strong> Q{quarter.q}</p>
                                            <p><strong>Presupuesto:</strong> ${quarter.allocated_budget}</p>
                                            <p><strong>Porcentaje:</strong> {quarter.allocated_percentage}%</p>
                                        </div>

                                        {/* Sección de asignación de proveedor */}
                                        <div className="mt-4 pt-4 border-t">
                                            <h4 className="font-medium mb-2">Asignar Proveedor</h4>
                                            <div className="flex gap-4">
                                                <select
                                                    className="p-2 border rounded flex-1"
                                                    value={financialSelections[quarter.id] || ""}
                                                    onChange={(e) => handleFinancialChange(e, quarter.id)}
                                                >
                                                    <option value="">Seleccionar Proveedor</option>
                                                    {availableProviders.map((provider) => (
                                                        <option key={provider.id} value={provider.id}>
                                                            {provider.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                                                    onClick={() => createFinancial(selectedEvc.id, quarter.id)}
                                                >
                                                    Asignar
                                                </button>
                                            </div>

                                            {/* Lista de proveedores asignados */}
                                            {quarter.evc_financials && quarter.evc_financials.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-sm font-medium">Proveedores asignados:</p>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {quarter.evc_financials.map((financial) => (
                                                            <span
                                                                key={financial.id}
                                                                className="px-2 py-1 bg-gray-100 rounded text-sm"
                                                            >
                                                                {financial.provider.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No hay quarters asignados.</p>
                            )}
                        </div>
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

                        {/* Lista de quarters (solo visualización) */}
                        <div className="mt-6">
                            <h3 className="text-xl font-semibold mb-2">Quarters Asignados</h3>
                            {selectedEvc.evc_qs && selectedEvc.evc_qs.length > 0 ? (
                                <div className="space-y-4">
                                    {selectedEvc.evc_qs.map((quarter) => (
                                        <div key={quarter.id} className="border p-4 rounded-lg">
                                            <p><strong>Año:</strong> {quarter.year}</p>
                                            <p><strong>Quarter:</strong> Q{quarter.q}</p>
                                            <p><strong>Presupuesto:</strong> ${quarter.allocated_budget}</p>
                                            <p><strong>Porcentaje:</strong> {quarter.allocated_percentage}%</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No hay quarters asignados.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Listado de EVCs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(filteredEvcs.length > 0 ? filteredEvcs : evcs).map((evc: EVC) => (
                    <div
                        key={evc.id}
                        className={`p-6 rounded-xl shadow-md flex flex-col ${getEntornoColor(evc.entorno_id)} 
        text-white hover:shadow-xl hover:scale-105 transition-transform duration-300`}
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
                            <button
                                className="flex items-center cursor-pointer hover:text-white/70 text-base"
                                onClick={() => showEvcDetails(evc)}
                            >
                                <FaEye className="mr-2 text-xl" />
                                Ver detalles
                            </button>

                            <button
                                className="flex items-center cursor-pointer hover:text-white/70 text-base"
                                onClick={() => {
                                    setSelectedEvc(evc);
                                    setShowQuartersModal(true);
                                }}
                            >
                                <FaCalendar className="mr-2 text-xl" />
                                Gestionar Quarters
                            </button>

                            <FaTrash
                                className="cursor-pointer hover:text-red-300 text-xl"
                                onClick={() => handleDeleteClick(evc)}
                            />
                        </div>
                    </div>
                ))}
                {filteredEvcs.length === 0 && filters.entorno_id && (
                    <div className="col-span-3 text-center py-8 text-gray-500">
                        No hay EVCs en el entorno seleccionado.
                    </div>
                )}
            </div>
        </div>
    );
}
