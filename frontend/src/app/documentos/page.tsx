"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaDownload,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

export default function DocumentosPage() {
  const [documentos, setDocumentos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [seleccionarTodos, setSeleccionarTodos] = useState(false);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroCampo, setFiltroCampo] = useState("file_name");
  const [pagina, setPagina] = useState(1);
  const porPagina = 10;

  useEffect(() => {
    fetchDocumentos();
  }, []);

  const fetchProveedores = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/providers/");
      setProveedores(res.data);
    } catch (err) {
      console.error("Error al obtener proveedores:", err);
    }
  };

  const fetchDocumentos = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/provider-documents/",
      );
      setDocumentos(response.data);
    } catch (error) {
      console.error("Error al obtener documentos:", error);
    }
  };

  const getProviderName = (id) => {
    const prov = proveedores.find((p) => p.id === id);
    return prov ? prov.name : "Sin nombre";
  };

  const toggleSeleccionado = (id) => {
    const nuevaSeleccion = new Set(seleccionados);
    nuevaSeleccion.has(id) ? nuevaSeleccion.delete(id) : nuevaSeleccion.add(id);
    setSeleccionados(nuevaSeleccion);
    setSeleccionarTodos(nuevaSeleccion.size === documentos.length);
  };

  const toggleSeleccionarTodos = () => {
    if (seleccionarTodos) {
      setSeleccionados(new Set());
    } else {
      setSeleccionados(new Set(documentos.map((doc) => doc.id)));
    }
    setSeleccionarTodos(!seleccionarTodos);
  };

  const eliminarDocumento = async (id) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar este documento?",
    );
    if (!confirmar) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/provider-documents/${id}`);
      setDocumentos(documentos.filter((doc) => doc.id !== id));
      setSeleccionados(
        new Set([...seleccionados].filter((selId) => selId !== id)),
      );
    } catch (error) {
      console.error("Error al eliminar documento:", error);
    }
  };

  const handleFiltroInput = (e) => {
    if (filtroCampo === "uploaded_at" && isNaN(Date.parse(e.target.value)))
      return;
    setFiltroTexto(e.target.value);
  };

  const documentosFiltrados = documentos.filter((doc) => {
    const valor =
      filtroCampo === "uploaded_at"
        ? new Date(doc[filtroCampo]).toLocaleDateString()
        : filtroCampo === "provider_name"
          ? doc.provider?.name?.toLowerCase?.() || ""
          : doc[filtroCampo]?.toLowerCase?.() || "";
    return valor.includes(filtroTexto.toLowerCase());
  });

  const documentosPaginados = documentosFiltrados.slice(
    (pagina - 1) * porPagina,
    pagina * porPagina,
  );
  const totalPaginas = Math.ceil(documentosFiltrados.length / porPagina);

  return (
    <div className="p-6 mt-20 bg-white shadow-md rounded-lg flex flex-col relative">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
        <h1 className="text-3xl font-bold">Documentos</h1>
        <div className="flex items-center gap-2">
          <select
            className="border px-2 py-1 rounded text-sm"
            value={filtroCampo}
            onChange={(e) => setFiltroCampo(e.target.value)}
          >
            <option value="file_name">Nombre del Archivo</option>
            <option value="uploaded_at">Fecha de Carga</option>
            <option value="provider_name">Nombre del Proveedor</option>
          </select>
          <input
            type={filtroCampo === "uploaded_at" ? "date" : "text"}
            placeholder="Buscar..."
            className="border px-3 py-1 rounded text-sm"
            value={filtroTexto}
            onChange={handleFiltroInput}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 text-left border">
                <input
                  type="checkbox"
                  checked={seleccionarTodos}
                  onChange={toggleSeleccionarTodos}
                />
              </th>
              <th className="p-3 text-left border">Nombre del Archivo</th>
              <th className="p-3 text-left border">Proveedor</th>
              <th className="p-3 text-center border">Descargar</th>
              <th className="p-3 text-left border">Fecha de Carga</th>
              <th className="p-3 text-center border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {documentosPaginados.map((doc) => (
              <tr
                key={doc.id}
                className="border text-gray-700 hover:bg-yellow-100"
              >
                <td className="p-3 border">
                  <input
                    type="checkbox"
                    checked={seleccionados.has(doc.id)}
                    onChange={() => toggleSeleccionado(doc.id)}
                  />
                </td>
                <td className="p-3 border">{doc.file_name}</td>
                <td className="p-3 border">
                  {doc.provider?.name || "Sin nombre"}
                </td>
                <td className="p-3 border text-center">
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="text-yellow-500 hover:text-yellow-700 inline-block"
                  >
                    <FaDownload className="mx-auto" />
                  </a>
                </td>
                <td className="p-3 border">
                  {new Date(doc.uploaded_at).toLocaleDateString()}
                </td>
                <td className="p-3 border text-center">
                  <button
                    aria-label="eliminar"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => eliminarDocumento(doc.id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex justify-between items-center mt-4">
        <button
          className="text-sm bg-yellow-500 text-white px-3 py-1 rounded disabled:opacity-50"
          onClick={() => setPagina((prev) => Math.max(prev - 1, 1))}
          disabled={pagina === 1}
        >
          <FaChevronLeft className="inline mr-1" /> Anterior
        </button>
        <span className="text-sm">
          Página {pagina} de {totalPaginas}
        </span>
        <button
          className="text-sm bg-yellow-500 text-white px-3 py-1 rounded disabled:opacity-50"
          onClick={() => setPagina((prev) => Math.min(prev + 1, totalPaginas))}
          disabled={pagina === totalPaginas}
        >
          Siguiente <FaChevronRight className="inline ml-1" />
        </button>
      </div>
    </div>
  );
}
