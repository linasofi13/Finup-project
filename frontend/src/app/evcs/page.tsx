"use client";

import React, { useState, useEffect } from "react";
import {
  FaTrash,
  FaFilter,
  FaDownload,
  FaPlus,
  FaEye,
  FaTimes,
  FaDollarSign,
  FaExclamationTriangle,
  FaProjectDiagram,
  FaGlobe,
  FaFileAlt,
} from "react-icons/fa";
import axios from "axios";

export default function EvcsPage() {
  const [evcs, setEvcs] = useState([]); // Se cargarán desde el backend
  const [showForm, setShowForm] = useState(false);

  // Datos del formulario de creación de EVC
  const [newEvc, setNewEvc] = useState({
    name: "",
    project: "",
    environment: "",
    q1_budget: 0,
    q2_budget: 0,
    q3_budget: 0,
    q4_budget: 0,
    description: "",
  });

  // Número de roles a asignar y su información
  const [roleCount, setRoleCount] = useState(1);
  const [roles, setRoles] = useState([
    {
      id: 1,
      roleName: "",
      providerId: null,
      companyFilter: "",
      countryFilter: "",
      costMax: 7000,
      filteredProviders: [],
    },
  ]);

  // Estados para las listas de empresas y países disponibles (se obtienen del backend)
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [availableCountries, setAvailableCountries] = useState([]);

  const [alert, setAlert] = useState("");

  // Manejo de campos principales de la EVC
  const handleEvcChange = (e) => {
    const { name, value } = e.target;
    setNewEvc((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBudgetChange = (e, quarter) => {
    const value = e.target.value === "" ? "" : parseFloat(e.target.value);
    setNewEvc((prev) => ({
      ...prev,
      [quarter]: value,
    }));
  };

  // Al hacer foco, si el valor es 0 se limpia
  const handleBudgetFocus = (e, quarter) => {
    if (e.target.value === "0" || e.target.value === 0) {
      e.target.value = "";
    }
  };

  // Si se queda vacío, restaura 0 al perder el foco
  const handleBudgetBlur = (e, quarter) => {
    if (e.target.value === "") {
      e.target.value = "0";
    }
  };

  // Ajusta el número de roles y el array de roles dinámicos
  const handleRoleCountChange = (e) => {
    const count = parseInt(e.target.value, 10);
    setRoleCount(count);
    const newRolesArray = [];
    for (let i = 1; i <= count; i++) {
      if (roles[i - 1]) {
        newRolesArray.push(roles[i - 1]);
      } else {
        newRolesArray.push({
          id: i,
          roleName: "",
          providerId: null,
          companyFilter: "",
          countryFilter: "",
          costMax: 7000,
          filteredProviders: [],
        });
      }
    }
    setRoles(newRolesArray);
  };

  // Actualiza un campo de un rol específico
  const handleRoleFieldChange = (roleId, field, value) => {
    setRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, [field]: value } : r))
    );
  };

  // Función para filtrar proveedores para un rol dado
  const fetchFilteredProviders = async (roleId) => {
    const targetRole = roles.find((r) => r.id === roleId);
    if (!targetRole) return;
    try {
      const resp = await axios.get("http://127.0.0.1:8000/providers/providers/filter", {
        params: {
          company: targetRole.companyFilter || undefined,
          country: targetRole.countryFilter || undefined,
          cost_min: 0,
          cost_max: targetRole.costMax,
        },
      });
      const providers = resp.data;
      setRoles((prev) =>
        prev.map((r) =>
          r.id === roleId ? { ...r, filteredProviders: providers } : r
        )
      );
    } catch (error) {
      console.error("Error al filtrar proveedores:", error);
    }
  };

  // Cargar las EVCs desde el backend
  const fetchEvcs = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/evcs/evcs/");
      setEvcs(response.data);
    } catch (error) {
      console.error("Error al cargar EVCs:", error);
    }
  };

  // Cargar las empresas disponibles desde el backend
  const fetchAvailableCompanies = async () => {
    try {
      const resp = await axios.get("http://127.0.0.1:8000/providers/providers/distinct-companies");
      setAvailableCompanies(resp.data);
    } catch (error) {
      console.error("Error al cargar empresas:", error);
    }
  };

  // Cargar los países disponibles desde el backend
  const fetchAvailableCountries = async () => {
    try {
      const resp = await axios.get("http://127.0.0.1:8000/providers/providers/distinct-countries");
      setAvailableCountries(resp.data);
    } catch (error) {
      console.error("Error al cargar países:", error);
    }
  };

  useEffect(() => {
    fetchEvcs();
    fetchAvailableCompanies();
    fetchAvailableCountries();
  }, []);

  // Crear EVC enviando todos los datos, incluyendo el array "providers"
  const createEvc = async () => {
    const providersArray = roles
      .filter((r) => r.providerId)
      .map((r) => ({
        provider_id: r.providerId,
        role_name: r.roleName || "Sin nombre de rol",
      }));
    try {
      const response = await axios.post("http://127.0.0.1:8000/evcs/evcs/", {
        name: newEvc.name,
        project: newEvc.project,
        environment: newEvc.environment,
        q1_budget: parseFloat(newEvc.q1_budget) || 0,
        q2_budget: parseFloat(newEvc.q2_budget) || 0,
        q3_budget: parseFloat(newEvc.q3_budget) || 0,
        q4_budget: parseFloat(newEvc.q4_budget) || 0,
        description: newEvc.description,
        providers: providersArray,
      });
      const createdEvc = response.data;
      console.log("EVC creada:", createdEvc);
      fetchEvcs();
      setShowForm(false);
      setNewEvc({
        name: "",
        project: "",
        environment: "",
        q1_budget: 0,
        q2_budget: 0,
        q3_budget: 0,
        q4_budget: 0,
        description: "",
      });
      setRoleCount(1);
      setRoles([
        {
          id: 1,
          roleName: "",
          providerId: null,
          companyFilter: "",
          countryFilter: "",
          costMax: 7000,
          filteredProviders: [],
        },
      ]);
    } catch (error) {
      console.error("Error creando EVC:", error);
      setAlert("Error al crear la EVC");
    }
  };

  const deleteEvc = async (evcId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/evcs/evcs/${evcId}`);
      setEvcs((prev) => prev.filter((e) => e.id !== evcId));
    } catch (error) {
      console.error("Error eliminando EVC:", error);
    }
  };

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

          {/* Campos principales */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Nombre"
              className="p-2 border rounded"
              value={newEvc.name}
              onChange={handleEvcChange}
            />
            <input
              type="text"
              name="project"
              placeholder="Proyecto"
              className="p-2 border rounded"
              value={newEvc.project}
              onChange={handleEvcChange}
            />
            <select
              name="environment"
              className="p-2 border rounded"
              value={newEvc.environment}
              onChange={handleEvcChange}
            >
              <option value="">Seleccionar Entorno</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>

          {/* Presupuestos */}
          <div className="mt-4">
            <label className="font-semibold block">Presupuestos</label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <label className="block">Presupuesto Q1</label>
                <div className="flex items-center border rounded px-2">
                  <FaDollarSign className="mr-1" />
                  <input
                    type="number"
                    name="q1_budget"
                    placeholder="Presupuesto Q1"
                    className="p-1 w-full border-none"
                    value={newEvc.q1_budget}
                    onFocus={(e) => handleBudgetFocus(e, "q1_budget")}
                    onBlur={(e) => handleBudgetBlur(e, "q1_budget")}
                    onChange={(e) => handleBudgetChange(e, "q1_budget")}
                  />
                </div>
              </div>
              <div>
                <label className="block">Presupuesto Q2</label>
                <div className="flex items-center border rounded px-2">
                  <FaDollarSign className="mr-1" />
                  <input
                    type="number"
                    name="q2_budget"
                    placeholder="Presupuesto Q2"
                    className="p-1 w-full border-none"
                    value={newEvc.q2_budget}
                    onFocus={(e) => handleBudgetFocus(e, "q2_budget")}
                    onBlur={(e) => handleBudgetBlur(e, "q2_budget")}
                    onChange={(e) => handleBudgetChange(e, "q2_budget")}
                  />
                </div>
              </div>
              <div>
                <label className="block">Presupuesto Q3</label>
                <div className="flex items-center border rounded px-2">
                  <FaDollarSign className="mr-1" />
                  <input
                    type="number"
                    name="q3_budget"
                    placeholder="Presupuesto Q3"
                    className="p-1 w-full border-none"
                    value={newEvc.q3_budget}
                    onFocus={(e) => handleBudgetFocus(e, "q3_budget")}
                    onBlur={(e) => handleBudgetBlur(e, "q3_budget")}
                    onChange={(e) => handleBudgetChange(e, "q3_budget")}
                  />
                </div>
              </div>
              <div>
                <label className="block">Presupuesto Q4</label>
                <div className="flex items-center border rounded px-2">
                  <FaDollarSign className="mr-1" />
                  <input
                    type="number"
                    name="q4_budget"
                    placeholder="Presupuesto Q4"
                    className="p-1 w-full border-none"
                    value={newEvc.q4_budget}
                    onFocus={(e) => handleBudgetFocus(e, "q4_budget")}
                    onBlur={(e) => handleBudgetBlur(e, "q4_budget")}
                    onChange={(e) => handleBudgetChange(e, "q4_budget")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="mt-2">
            <label className="font-semibold block">Descripción</label>
            <textarea
              name="description"
              className="p-2 border rounded w-full"
              value={newEvc.description}
              onChange={handleEvcChange}
              placeholder="Comentarios o detalles adicionales"
            />
          </div>

          {/* Número de roles */}
          <div className="mt-4">
            <label className="font-semibold">Número de Roles</label>
            <select
              value={roleCount}
              onChange={handleRoleCountChange}
              className="p-2 border rounded ml-2"
            >
              {[1, 2, 3, 4, 5].map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </div>

          {/* Roles dinámicos */}
          {roles.map((r) => (
            <div key={r.id} className="border p-4 rounded-lg mt-4 bg-white">
              <h3 className="font-semibold">Rol #{r.id}</h3>
              <div className="mt-2">
                <label>Nombre del Rol</label>
                <input
                  type="text"
                  className="p-2 border rounded w-full"
                  placeholder="Ej: Desarrollador"
                  value={r.roleName}
                  onChange={(e) =>
                    handleRoleFieldChange(r.id, "roleName", e.target.value)
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <label>Empresa</label>
                  <select
                    className="p-2 border rounded w-full"
                    value={r.companyFilter}
                    onChange={(e) =>
                      handleRoleFieldChange(r.id, "companyFilter", e.target.value)
                    }
                  >
                    <option value="">Cualquiera</option>
                    {availableCompanies.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>País</label>
                  <select
                    className="p-2 border rounded w-full"
                    value={r.countryFilter}
                    onChange={(e) =>
                      handleRoleFieldChange(r.id, "countryFilter", e.target.value)
                    }
                  >
                    <option value="">Cualquiera</option>
                    {availableCountries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Costo Máx (USD)</label>
                  <input
                    type="number"
                    className="p-2 border rounded w-full"
                    value={r.costMax}
                    onChange={(e) =>
                      handleRoleFieldChange(r.id, "costMax", e.target.value)
                    }
                  />
                </div>
              </div>
              <button
                className="px-4 py-2 bg-yellow-500 text-white rounded-md mt-2 hover:bg-yellow-600"
                onClick={() => fetchFilteredProviders(r.id)}
              >
                Filtrar proveedores
              </button>
              {r.filteredProviders.length > 0 && (
                <div className="mt-2">
                  <label>Escoger proveedor</label>
                  <select
                    className="p-2 border rounded w-full"
                    onChange={(e) =>
                      handleRoleFieldChange(r.id, "providerId", parseInt(e.target.value, 10))
                    }
                  >
                    <option value="">--Seleccione--</option>
                    {r.filteredProviders.map((prov) => (
                      <option key={prov.id} value={prov.id}>
                        {prov.name} ({prov.company}, ${prov.cost_usd})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}

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

      {/* Listado de EVCs (obtenidas del backend) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {evcs.map((evc) => (
          <div
            key={evc.id}
            className="p-4 rounded-lg bg-blue-200 text-gray-800 shadow-md flex flex-col hover:shadow-xl hover:scale-105 transition transform duration-300"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold flex items-center">
                <FaProjectDiagram className="mr-2" /> {evc.name}
              </h2>
              <span className="px-2 py-1 bg-green-500 rounded-full text-sm">
                {evc.status}
              </span>
            </div>
            <div className="mb-2">
              <p className="flex items-center text-sm">
                <FaGlobe className="mr-1" />{" "}
                <span className="font-semibold mr-1">Proyecto:</span> {evc.project}
              </p>
              <p className="flex items-center text-sm">
                <FaGlobe className="mr-1" />{" "}
                <span className="font-semibold mr-1">Entorno:</span> {evc.environment}
              </p>
            </div>
            <div className="mb-2">
              <h3 className="font-semibold text-sm mb-1">Presupuestos</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>
                  <span className="font-semibold">Q1:</span> ${evc.q1_budget}
                </p>
                <p>
                  <span className="font-semibold">Q2:</span> ${evc.q2_budget}
                </p>
                <p>
                  <span className="font-semibold">Q3:</span> ${evc.q3_budget}
                </p>
                <p>
                  <span className="font-semibold">Q4:</span> ${evc.q4_budget}
                </p>
              </div>
            </div>
            <div className="mb-2">
              <h3 className="font-semibold text-sm mb-1">
                <FaFileAlt className="inline mr-1" /> Descripción
              </h3>
              <p className="text-sm">{evc.description}</p>
            </div>
            <div className="flex justify-end items-center mt-auto space-x-2">
              <FaEye className="text-gray-800 cursor-pointer hover:text-gray-600" />
              <FaTrash
                className="text-red-500 cursor-pointer hover:text-red-700"
                onClick={() => deleteEvc(evc.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Manejadores para limpiar o restaurar los presupuestos al hacer foco y al salir
const handleBudgetFocus = (e, quarter) => {
  if (e.target.value === "0" || e.target.value === 0) {
    e.target.value = "";
  }
};

const handleBudgetBlur = (e, quarter) => {
  if (e.target.value === "") {
    e.target.value = "0";
  }
};
