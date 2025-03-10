"use client";

import { useState, useEffect, useRef } from "react";
import {
  FaCheck,
  FaPlus,
  FaTrash,
  FaFileUpload,
  FaTimes,
} from "react-icons/fa";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/providers"; // Asegúrate de usar la URL correcta

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState([]);
  const [nuevosProveedores, setNuevosProveedores] = useState([]);
  const tableRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    try {
      const response = await axios.get(API_URL);
      setProveedores(response.data);
    } catch (error) {
      console.error("Error fetching providers:", error);
    }
  };

  const agregarRegistro = () => {
    setNuevosProveedores((prev) => [
      ...prev,
      {
        name: "",
        role: "",
        company: "",
        country: "",
        cost_usd: "",
        category: "",
        line: "",
        email: "",
      },
    ]);
  };

  const guardarNuevoProveedor = async (index) => {
    const nuevo = nuevosProveedores[index];
    if (!nuevo.name.trim()) return;

    try {
      const response = await axios.post(API_URL, nuevo);
      setProveedores([...proveedores, response.data]);
      setNuevosProveedores(nuevosProveedores.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error adding provider:", error);
    }
  };

  const eliminarProveedor = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setProveedores(proveedores.filter((prov) => prov.id !== id));
    } catch (error) {
      console.error("Error deleting provider:", error);
    }
  };

  return (
    <div className="p-6 mt-20 bg-white shadow-md rounded-lg flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={agregarRegistro}
          className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center"
        >
          <FaPlus className="mr-2" /> Añadir Registro
        </button>
      </div>

      <div className="overflow-x-auto">
        <table
          ref={tableRef}
          className="min-w-full bg-white border border-gray-300 rounded-lg"
        >
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 text-left border">Nombre</th>
              <th className="p-3 text-left border">Rol</th>
              <th className="p-3 text-left border">Proveedor</th>
              <th className="p-3 text-left border">País</th>
              <th className="p-3 text-left border">Costo</th>
              <th className="p-3 text-left border">Categoría</th>
              <th className="p-3 text-left border">Línea</th>
              <th className="p-3 text-left border">Correo</th>
              <th className="p-3 text-left border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map((proveedor) => (
              <tr
                key={proveedor.id}
                className="border text-gray-700 hover:bg-yellow-100"
              >
                <td className="p-3 border">{proveedor.name}</td>
                <td className="p-3 border">{proveedor.role}</td>
                <td className="p-3 border">{proveedor.company}</td>
                <td className="p-3 border">{proveedor.country}</td>
                <td className="p-3 border">${proveedor.cost_usd}</td>
                <td className="p-3 border">{proveedor.category}</td>
                <td className="p-3 border">{proveedor.line}</td>
                <td className="p-3 border">{proveedor.email}</td>
                <td className="p-3 border">
                  <button
                    onClick={() => eliminarProveedor(proveedor.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}

            {nuevosProveedores.map((nuevo, index) => (
              <tr
                key={`nuevo-${index}`}
                className="border text-gray-700 bg-yellow-50"
              >
                {Object.keys(nuevo).map((key) => (
                  <td key={key} className="p-3 border">
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded"
                      value={nuevo[key]}
                      onChange={(e) => {
                        const nuevos = [...nuevosProveedores];
                        nuevos[index][key] = e.target.value;
                        setNuevosProveedores(nuevos);
                      }}
                    />
                  </td>
                ))}
                <td className="p-3 border flex space-x-2">
                  <FaCheck
                    className="text-green-500 cursor-pointer"
                    onClick={() => guardarNuevoProveedor(index)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sección de carga masiva */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold">Carga Masiva</h2>
        <p className="text-gray-600 mt-2">
          Los archivos cargados serán procesados automáticamente por el sistema.
        </p>
        <div className="mt-4 border-dashed border-2 border-gray-300 p-6 text-center">
          <p className="text-gray-600">Arrastra y suelta archivos aquí o</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
          >
            <FaFileUpload className="mr-2" /> Explorar Archivos
          </button>
          <input type="file" multiple className="hidden" ref={fileInputRef} />
        </div>
      </div>
    </div>
  );
}
