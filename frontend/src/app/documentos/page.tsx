"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import {
  FaDownload,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaUpload,
  FaFile,
} from "react-icons/fa";

interface Provider {
  id: number;
  name: string;
}

interface Document {
  id: number;
  file_name: string;
  file_url: string;
  uploaded_at: string;
  provider?: Provider;
}

interface PendingUpload {
  file: File;
  provider_id?: number;
}

export default function DocumentosPage() {
  const [documentos, setDocumentos] = useState<Document[]>([]);
  const [proveedores, setProveedores] = useState<Provider[]>([]);
  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set());
  const [seleccionarTodos, setSeleccionarTodos] = useState(false);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroCampo, setFiltroCampo] = useState("file_name");
  const [pagina, setPagina] = useState(1);
  const [dragActive, setDragActive] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const porPagina = 10;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    addFilesToPending(files);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    addFilesToPending(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addFilesToPending = (files: File[]) => {
    const newUploads = files.map((file) => ({ file }));
    setPendingUploads((prev) => [...prev, ...newUploads]);
  };

  const removePendingUpload = (index: number) => {
    setPendingUploads((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async (pendingUpload: PendingUpload) => {
    setUploading(true);
    const formData = new FormData();

    // Ensure we're sending the file with the correct field name and filename
    const file = pendingUpload.file;
    formData.append("file", file);

    try {
      let endpoint;
      if (pendingUpload.provider_id) {
        // If there's a provider, use provider-documents endpoint and include provider_id
        endpoint = `${apiUrl}/provider-documents/`;
        formData.append("provider_id", pendingUpload.provider_id.toString());
        formData.append("file_name", file.name);
        formData.append("file_url", ""); // This will be set by the backend
      } else {
        // If no provider, use the documents upload endpoint
        endpoint = `${apiUrl}/documents/upload`;
      }

      const response = await axios.post(endpoint, formData, {
        headers: {
          Accept: "application/json",
          // Let the browser set the Content-Type with boundary
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data) {
        setDocumentos((prev) => [...prev, response.data]);
        setPendingUploads((prev) =>
          prev.filter((upload) => upload.file !== pendingUpload.file),
        );
        alert("Archivo subido exitosamente");
      }
    } catch (error: any) {
      console.error("Error al subir el archivo:", error);
      let errorMessage = "Error al subir el archivo";
      if (error.response) {
        errorMessage += `: ${error.response.data?.detail || error.response.statusText}`;
      }
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const uploadAll = async () => {
    for (const upload of pendingUploads) {
      await handleUpload(upload);
    }
  };

  useEffect(() => {
    fetchProveedores();
    fetchDocumentos();
  }, []);

  const fetchProveedores = async () => {
    try {
      const res = await axios.get(`${apiUrl}/providers/providers/`);
      setProveedores(res.data);
    } catch (err) {
      console.error("Error al obtener proveedores:", err);
    }
  };

  const fetchDocumentos = async () => {
    try {
      // Fetch from both endpoints
      const [providerDocsResponse, generalDocsResponse] = await Promise.all([
        axios.get(`${apiUrl}/provider-documents/`),
        axios.get(`${apiUrl}/documents/`),
      ]);

      // Combine both results
      const allDocuments = [
        ...providerDocsResponse.data,
        ...generalDocsResponse.data,
      ];

      setDocumentos(allDocuments);
    } catch (error) {
      console.error("Error al obtener documentos:", error);
    }
  };

  const getProviderName = (id: number) => {
    const prov = proveedores.find((p) => p.id === id);
    return prov ? prov.name : "Sin nombre";
  };

  const toggleSeleccionado = (id: number) => {
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

  const eliminarDocumento = async (id: number, hasProvider: boolean) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar este documento?",
    );
    if (!confirmar) return;
    try {
      // Choose the endpoint based on whether the document has a provider
      const endpoint = hasProvider ? "provider-documents" : "documents";
      await axios.delete(`${apiUrl}/${endpoint}/${id}`);

      setDocumentos(documentos.filter((doc) => doc.id !== id));
      setSeleccionados(
        new Set([...seleccionados].filter((selId) => selId !== id)),
      );
    } catch (error) {
      console.error("Error al eliminar documento:", error);
    }
  };

  const handleFiltroInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (filtroCampo === "uploaded_at" && isNaN(Date.parse(e.target.value)))
      return;
    setFiltroTexto(e.target.value);
  };

  const documentosFiltrados = documentos.filter((doc) => {
    const valor = (() => {
      if (filtroCampo === "uploaded_at") {
        return new Date(doc.uploaded_at).toLocaleDateString();
      }
      if (filtroCampo === "provider_name") {
        return doc.provider?.name?.toLowerCase() || "";
      }
      if (filtroCampo === "file_name") {
        return doc.file_name?.toLowerCase() || "";
      }
      return "";
    })();
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
            <option value="provider_name">Nombre del Talento</option>
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

      {/* Upload Section */}
      <div className="mb-6">
        <div
          className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors mb-4
            ${dragActive ? "border-yellow-500 bg-yellow-50" : "border-gray-300 hover:border-yellow-500"}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileInput}
            multiple
          />
          <FaUpload className="mx-auto text-4xl mb-4 text-gray-400" />
          {uploading ? (
            <p className="text-gray-600">Subiendo archivo...</p>
          ) : dragActive ? (
            <p className="text-gray-600">Suelta los archivos aquí...</p>
          ) : (
            <div>
              <p className="text-gray-600">
                Arrastra y suelta archivos aquí, o
              </p>
              <button className="mt-2 text-yellow-500 hover:text-yellow-600">
                haz clic para seleccionar
              </button>
            </div>
          )}
        </div>

        {/* Pending Uploads List */}
        {pendingUploads.length > 0 && (
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">
                Archivos para subir ({pendingUploads.length})
              </h3>
              <button
                onClick={uploadAll}
                disabled={uploading}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
              >
                Subir todos
              </button>
            </div>
            <div className="space-y-2">
              {pendingUploads.map((upload, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div className="flex items-center gap-2">
                    <FaFile className="text-gray-400" />
                    <span className="text-sm">{upload.file.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={upload.provider_id || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setPendingUploads((prev) =>
                          prev.map((u, i) =>
                            i === index
                              ? {
                                  ...u,
                                  provider_id: value
                                    ? Number(value)
                                    : undefined,
                                }
                              : u,
                          ),
                        );
                      }}
                    >
                      <option value="">Sin talento</option>
                      {proveedores.map((prov) => (
                        <option key={prov.id} value={prov.id}>
                          {prov.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleUpload(upload)}
                      disabled={uploading}
                      className="text-yellow-500 hover:text-yellow-600 px-2"
                    >
                      <FaUpload />
                    </button>
                    <button
                      onClick={() => removePendingUpload(index)}
                      className="text-red-500 hover:text-red-600 px-2"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
              <th className="p-3 text-left border">Talento</th>
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
                  {doc.provider?.name || "Sin talento"}
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
                    onClick={() =>
                      eliminarDocumento(doc.id, doc.provider ? true : false)
                    }
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
