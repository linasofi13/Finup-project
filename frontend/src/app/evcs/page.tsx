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
  FaProjectDiagram,
  FaGlobe,
} from "react-icons/fa";
import axios from "axios";

export default function EvcsPage() {
  // ======================
  // Estados principales
  // ======================
  const [evcs, setEvcs] = useState([]); // Lista de EVCs obtenidas del backend
  const [showForm, setShowForm] = useState(false);
  const [alert, setAlert] = useState("");

  // ======================
  // Modelo EVC actualizado
  // ======================
  const [newEvc, setNewEvc] = useState({
    name: "", // EVC.name
    project: "", // EVC.project
    technical_leader_id: "", // EVC.technical_leader_id (FK)
    functional_leader_id: "", // EVC.functional_leader_id (FK)
    entorno_id: "", // EVC.entorno_id (FK)
  });

  // Roles y proveedores (sigue la misma lógica si aún la necesitas)
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

  // ======================
  // Listas para selects
  // ======================
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [availableCountries, setAvailableCountries] = useState([]);

  // Nuevos: líderes y entornos
  const [availableTechnicalLeaders, setAvailableTechnicalLeaders] = useState(
    [],
  );
  const [availableFunctionalLeaders, setAvailableFunctionalLeaders] = useState(
    [],
  );
  const [availableEntornos, setAvailableEntornos] = useState([]);

  // ======================
  // Efectos iniciales
  // ======================
  useEffect(() => {
    fetchEvcs();
    fetchAvailableCompanies();
    fetchAvailableCountries();
    fetchAvailableTechnicalLeaders();
    fetchAvailableFunctionalLeaders();
    fetchAvailableEntornos();
  }, []);

  // ======================
  // Handlers EVC
  // ======================
  const handleEvcChange = (e) => {
    const { name, value } = e.target;
    setNewEvc((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ======================
  // Handlers Roles
  // ======================
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

  const handleRoleFieldChange = (roleId, field, value) => {
    setRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, [field]: value } : r)),
    );
  };

  // ======================
  // Fetch data del backend
  // ======================
  const fetchEvcs = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/evcs/evcs/");
      setEvcs(response.data);
    } catch (error) {
      console.error("Error al cargar EVCs:", error);
    }
  };

  const fetchAvailableCompanies = async () => {
    try {
      const resp = await axios.get(
        "http://127.0.0.1:8000/providers/providers/distinct-companies",
      );
      setAvailableCompanies(resp.data);
    } catch (error) {
      console.error("Error al cargar empresas:", error);
    }
  };

  const fetchAvailableCountries = async () => {
    try {
      const resp = await axios.get(
        "http://127.0.0.1:8000/providers/providers/distinct-countries",
      );
      setAvailableCountries(resp.data);
    } catch (error) {
      console.error("Error al cargar países:", error);
    }
  };

  // Nuevos: fetch de líderes y entornos
  const fetchAvailableTechnicalLeaders = async () => {
    try {
      const resp = await axios.get(
        "http://127.0.0.1:8000/users/technical-leaders",
      );
      setAvailableTechnicalLeaders(resp.data);
    } catch (error) {
      console.error("Error al cargar líderes técnicos:", error);
    }
  };

  const fetchAvailableFunctionalLeaders = async () => {
    try {
      const resp = await axios.get(
        "http://127.0.0.1:8000/users/functional-leaders",
      );
      setAvailableFunctionalLeaders(resp.data);
    } catch (error) {
      console.error("Error al cargar líderes funcionales:", error);
    }
  };

  const fetchAvailableEntornos = async () => {
    try {
      const resp = await axios.get("http://127.0.0.1:8000/entornos/");
      setAvailableEntornos(resp.data);
    } catch (error) {
      console.error("Error al cargar entornos:", error);
    }
  };

  // Filtrar proveedores para un rol dado
  const fetchFilteredProviders = async (roleId) => {
    const targetRole = roles.find((r) => r.id === roleId);
    if (!targetRole) return;
    try {
      const resp = await axios.get(
        "http://127.0.0.1:8000/providers/providers/filter",
        {
          params: {
            company: targetRole.companyFilter || undefined,
            country: targetRole.countryFilter || undefined,
            cost_min: 0,
            cost_max: targetRole.costMax,
          },
        },
      );
      const providers = resp.data;
      setRoles((prev) =>
        prev.map((r) =>
          r.id === roleId ? { ...r, filteredProviders: providers } : r,
        ),
      );
    } catch (error) {
      console.error("Error al filtrar proveedores:", error);
    }
  };

  // ======================
  // Crear EVC
  // ======================
  const createEvc = async () => {
    // Roles -> providers
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
        technical_leader_id: parseInt(newEvc.technical_leader_id, 10) || null,
        functional_leader_id: parseInt(newEvc.functional_leader_id, 10) || null,
        entorno_id: parseInt(newEvc.entorno_id, 10) || null,
        providers: providersArray, // Relación con EVCProvider
      });

      const createdEvc = response.data;
      console.log("EVC creada:", createdEvc);
      fetchEvcs();
      setShowForm(false);
      setAlert("");
      setNewEvc({
        name: "",
        project: "",
        technical_leader_id: "",
        functional_leader_id: "",
        entorno_id: "",
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

  // ======================
  // Eliminar EVC
  // ======================
  const deleteEvc = async (evcId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/evcs/evcs/${evcId}`);
      setEvcs((prev) => prev.filter((e) => e.id !== evcId));
    } catch (error) {
      console.error("Error eliminando EVC:", error);
    }
  };

  // ======================
  // Render
  // ======================
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
            {/* name */}
            <input
              type="text"
              name="name"
              placeholder="Nombre de la EVC"
              className="p-2 border rounded"
              value={newEvc.name}
              onChange={handleEvcChange}
            />

            {/* project */}
            <input
              type="text"
              name="project"
              placeholder="Proyecto asociado"
              className="p-2 border rounded"
              value={newEvc.project}
              onChange={handleEvcChange}
            />

            {/* technical_leader_id */}
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

            {/* functional_leader_id */}
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

            {/* entorno_id */}
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
                    {ent.nombre}
                  </option>
                ))}
              </select>
            </div>
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
              <h3 className="font-semibold mb-2">Rol #{r.id}</h3>

              {/* roleName */}
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

              {/* Filtros para empresa, país y costo */}
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <label>Empresa</label>
                  <select
                    className="p-2 border rounded w-full"
                    value={r.companyFilter}
                    onChange={(e) =>
                      handleRoleFieldChange(
                        r.id,
                        "companyFilter",
                        e.target.value,
                      )
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
                      handleRoleFieldChange(
                        r.id,
                        "countryFilter",
                        e.target.value,
                      )
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

              {/* Botón para filtrar proveedores */}
              <button
                className="px-4 py-2 bg-yellow-500 text-white rounded-md mt-2 hover:bg-yellow-600"
                onClick={() => fetchFilteredProviders(r.id)}
              >
                Filtrar proveedores
              </button>

              {/* Lista de proveedores filtrados */}
              {r.filteredProviders.length > 0 && (
                <div className="mt-2">
                  <label>Escoger proveedor</label>
                  <select
                    className="p-2 border rounded w-full"
                    onChange={(e) =>
                      handleRoleFieldChange(
                        r.id,
                        "providerId",
                        parseInt(e.target.value, 10),
                      )
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

          {/* Alertas de error */}
          {alert && (
            <div className="mt-2 bg-yellow-100 text-yellow-800 p-2 rounded-md flex items-center">
              <FaExclamationTriangle className="mr-2" />
              {alert}
            </div>
          )}

          {/* Botones de acción */}
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
            className="p-6 rounded-xl shadow-md flex flex-col bg-gradient-to-tr from-purple-500 to-purple-700 text-white hover:shadow-xl hover:scale-105 transition-transform duration-300"
          >
            {/* Encabezado */}
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-2xl font-bold flex items-center">
                <FaProjectDiagram className="mr-2" /> {evc.name}
              </h2>
              <span className="px-3 py-1 bg-green-400 rounded-full text-sm font-semibold">
                {/* Ajusta si tienes un campo status, si no, remueve */}
                {evc.status || "En curso"}
              </span>
            </div>

            {/* Datos principales */}
            <div className="mb-3 text-lg">
              <p className="flex items-center">
                <FaGlobe className="mr-2 text-white/80" />
                <span className="font-semibold mr-1">Proyecto:</span>{" "}
                {evc.project}
              </p>
              {/* Si deseas mostrar el líder técnico o funcional */}
              {evc.technical_leader && (
                <p className="flex items-center">
                  <span className="font-semibold mr-1">Líder Técnico:</span>{" "}
                  {evc.technical_leader.name}
                </p>
              )}
              {evc.functional_leader && (
                <p className="flex items-center">
                  <span className="font-semibold mr-1">Líder Funcional:</span>{" "}
                  {evc.functional_leader.name}
                </p>
              )}
              {evc.entorno && (
                <p className="flex items-center">
                  <span className="font-semibold mr-1">Entorno:</span>{" "}
                  {evc.entorno.nombre}
                </p>
              )}
            </div>

            {/* Fechas de creación y actualización */}
            <div className="mb-3 text-base">
              <p>
                <span className="font-semibold">Creado:</span>{" "}
                {new Date(evc.creation_date).toLocaleDateString()}
              </p>
              <p>
                <span className="font-semibold">Actualizado:</span>{" "}
                {new Date(evc.updated_at).toLocaleDateString()}
              </p>
            </div>

            {/* Acciones */}
            <div className="flex justify-end items-center mt-auto space-x-4">
              <FaEye className="cursor-pointer hover:text-white/70 text-xl" />
              <FaTrash
                className="cursor-pointer hover:text-red-300 text-xl"
                onClick={() => deleteEvc(evc.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
