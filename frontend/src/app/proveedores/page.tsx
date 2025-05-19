"use client";

import { useState, useEffect, useRef } from "react";
import {
  FaCheck,
  FaPlus,
  FaTrash,
  FaEdit,
  FaTimes,
  FaFileUpload,
  FaCloudUploadAlt,
} from "react-icons/fa";
import axios from "axios";
import * as XLSX from "xlsx";
import ProtectedContent from "@/components/ui/ProtectedContent";

// Define interfaces for our data types
interface Provider {
  id: string;
  name: string;
  role: string;
  company: string;
  country: string;
  cost_usd: string;
  category: string;
  line: string;
  email: string;
}

interface NewProvider extends Omit<Provider, "id"> {
  tempId: number;
}

interface FilterState {
  name: string;
  role: string;
  company: string;
  country: string;
  costUsdMin: string;
  costUsdMax: string;
  category: string;
  line: string;
  email: string;
}

interface ProviderDocument {
  id: string;
  provider_id: string;
  filename: string;
  file_name?: string;
  uploaded_at: string;
  file_url: string;
}

// Endpoints (ajusta según tu backend)
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_URL = `${apiUrl}/providers/providers/`;
const BULK_UPLOAD_URL = `${apiUrl}/providers/providers/bulk-upload`;

// inicio de codigo para cargar el archivo a supabase
import { finupBucket } from "@/services/supabaseClient";

//fin de codigo para cargar el archivo a supabase
// Ajusta la ruta si es necesario

export default function TalentosPage() {
  const [proveedores, setProveedores] = useState<Provider[]>([]);
  const [editingProveedor, setEditingProveedor] = useState<Provider | null>(
    null,
  );
  const [newRows, setNewRows] = useState<NewProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [filePreview, setFilePreview] = useState<any[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filtros para cada campo
  const [filters, setFilters] = useState<FilterState>({
    name: "",
    role: "",
    company: "",
    country: "",
    costUsdMin: "",
    costUsdMax: "",
    category: "",
    line: "",
    email: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado para Documentos
  const [selectedProviderId, setSelectedProviderId] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docList, setDocList] = useState<ProviderDocument[]>([]);

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

  const [uploadMessage, setUploadMessage] = useState("");
  const docFileInputRef = useRef<HTMLInputElement>(null);
  const [filterProviderId, setFilterProviderId] = useState("");

  useEffect(() => {
    const providerIdToUse = filterProviderId || selectedProviderId;
    if (providerIdToUse) {
      fetchProviderDocuments(providerIdToUse);
    } else {
      setDocList([]); // Si no hay selección, limpiamos
    }
  }, [filterProviderId, selectedProviderId]);

  const fetchProviderDocuments = async (providerId: string) => {
    try {
      const response = await axios.get(
        `${apiUrl}/provider-documents/by-provider/${providerId}`,
      );
      setDocList(response.data);
    } catch (error) {
      console.error("Error obteniendo documentos del talento:", error);
    }
  };

  // Función para exportar a Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(proveedores);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Talentos");
    XLSX.writeFile(wb, "talentos.xlsx");
  };

  // Manejo de filtros
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredProviders = proveedores.filter((prov: Provider) => {
    if (!prov.name.toLowerCase().includes(filters.name.toLowerCase()))
      return false;
    if (!prov.role.toLowerCase().includes(filters.role.toLowerCase()))
      return false;
    if (!prov.company.toLowerCase().includes(filters.company.toLowerCase()))
      return false;
    if (!prov.country.toLowerCase().includes(filters.country.toLowerCase()))
      return false;
    if (!prov.category.toLowerCase().includes(filters.category.toLowerCase()))
      return false;
    if (!prov.line.toLowerCase().includes(filters.line.toLowerCase()))
      return false;
    if (!prov.email.toLowerCase().includes(filters.email.toLowerCase()))
      return false;

    const cost = parseFloat(prov.cost_usd);
    if (filters.costUsdMin) {
      const minVal = parseFloat(filters.costUsdMin);
      if (!isNaN(minVal) && cost < minVal) return false;
    }
    if (filters.costUsdMax) {
      const maxVal = parseFloat(filters.costUsdMax);
      if (!isNaN(maxVal) && cost > maxVal) return false;
    }
    return true;
  });

  // Selección múltiple
  const handleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredProviders.map((prov) => prov.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (
      !window.confirm("¿Confirma la eliminación de los talentos seleccionados?")
    )
      return;
    try {
      for (const id of selectedIds) {
        await axios.delete(`${apiUrl}/providers/providers/${id}`);
      }
      setSelectedIds([]);
      fetchProveedores();
    } catch (error) {
      console.error("Error eliminando registros seleccionados:", error);
    }
  };

  // Agregar nueva fila
  const handleAddNewRow = () => {
    const newRow = {
      tempId: Date.now(),
      name: "",
      role: "",
      company: "",
      country: "",
      cost_usd: "",
      category: "",
      line: "",
      email: "",
    };
    setNewRows([...newRows, newRow]);
  };

  const handleNewRowInputChange = (
    tempId: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setNewRows(
      newRows.map((row) => {
        if (row.tempId === tempId) {
          return { ...row, [e.target.name]: e.target.value };
        }
        return row;
      }),
    );
  };

  const addNewRow = async (tempId: number) => {
    const newRow = newRows.find((row) => row.tempId === tempId);
    if (!newRow) return;
    try {
      const response = await axios.post(API_URL, newRow);
      setProveedores([...proveedores, response.data]);
      setNewRows(newRows.filter((row) => row.tempId !== tempId));
    } catch (error) {
      console.error("Error adding provider:", error);
    }
  };

  const cancelNewRow = (tempId: number) => {
    setNewRows(newRows.filter((row) => row.tempId !== tempId));
  };

  // Edición inline
  const iniciarEdicion = (proveedor: Provider) => {
    setEditingProveedor({ ...proveedor });
  };

  const cancelarEdicion = () => {
    setEditingProveedor(null);
  };

  const actualizarProveedor = async () => {
    try {
      if (!editingProveedor) return;

      const url = `${apiUrl}/providers/providers/${editingProveedor.id}`;
      await axios.put(url, editingProveedor);
      setProveedores(
        proveedores.map((prov) =>
          prov.id === editingProveedor.id ? editingProveedor : prov,
        ),
      );
      setEditingProveedor(null);
    } catch (error) {
      console.error("Error updating provider:", error);
    }
  };

  const eliminarProveedor = async (id: string) => {
    if (!window.confirm("¿Confirmas la eliminación de este talento?")) return;
    try {
      await axios.delete(`${API_URL}${id}`);
      setProveedores(proveedores.filter((prov) => prov.id !== id));
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } catch (error) {
      console.error("Error deleting provider:", error);
    }
  };

  // Carga Masiva de Excel
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      alert(
        "Formato de archivo no soportado. Solo se aceptan archivos .xlsx o .xls",
      );
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onerror = (e) => {
      console.error("Error al leer el archivo", e);
      setLoading(false);
    };
    reader.onload = async (e: ProgressEvent<FileReader>) => {
      try {
        if (!e.target?.result) {
          throw new Error("Failed to read file");
        }
        const data = new Uint8Array(e.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        let jsonData = XLSX.utils.sheet_to_json(sheet) as Record<string, any>[];
        const requiredColumns = [
          "Nombre",
          "Rol",
          "Proveedor",
          "País",
          "Costo USD",
          "Categoría",
          "Línea",
          "Correo",
        ];
        const sheetColumns = Object.keys(jsonData[0]);
        const missingColumns = requiredColumns.filter(
          (col) => !sheetColumns.includes(col),
        );
        if (missingColumns.length > 0) {
          alert(
            `El archivo Excel no tiene las siguientes columnas requeridas: ${missingColumns.join(", ")}`,
          );
          throw new Error("El archivo Excel tiene columnas faltantes.");
        }
        jsonData = jsonData.map((item) => ({
          name: item["Nombre"] || "",
          role: item["Rol"] || "",
          company: item["Proveedor"] || "",
          country: item["País"] || "",
          cost_usd: item["Costo USD"] || 0,
          category: item["Categoría"] || "",
          line: item["Línea"] || "",
          email: item["Correo"] || "",
        }));
        setFilePreview(jsonData);
        setShowPreviewModal(true);
      } catch (error) {
        console.error("Error al procesar el archivo Excel:", error);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const confirmFileUpload = async () => {
    setLoading(true);
    setShowPreviewModal(false);
    try {
      await axios.post(BULK_UPLOAD_URL, filePreview);
      alert("Talentos subidos con éxito");
      fetchProveedores();
    } catch (error) {
      console.error("Error al subir talentos:", error);
      alert("Error al procesar la carga. Verifica el formato.");
    } finally {
      setLoading(false);
      setFilePreview([]);
    }
  };

  // Manejo de Documentación (subir archivos)
  const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setDocFile(e.target.files[0]);
  };

  const handleUploadDocument = async () => {
    if (!docFile || !selectedProviderId) {
      setUploadMessage("Seleccione un archivo y un talento");
      return;
    }

    setLoading(true);
    setUploadMessage("Subiendo archivo...");

    try {
      const fileExt = docFile.name.split(".").pop();
      const fileName = `${Date.now()}_${docFile.name}`;
      const { data, error } = await finupBucket.upload(
        `provider_docs/${fileName}`,
        docFile,
        {
          cacheControl: "3600",
          upsert: false,
        },
      );

      if (error) {
        throw error;
      }

      const { data: urlData } = finupBucket.getPublicUrl(
        `provider_docs/${fileName}`,
      );

      // Guardar referencia a la BD
      const docInfo = {
        provider_id: selectedProviderId,
        file_name: docFile.name,
        file_url: urlData.publicUrl,
        file_type: fileExt,
        date_uploaded: new Date().toISOString(),
      };

      await axios.post(`${apiUrl}/provider-documents/`, docInfo);

      // Limpiar estado
      setDocFile(null);
      if (docFileInputRef.current) {
        docFileInputRef.current.value = "";
      }
      fetchProviderDocuments(selectedProviderId);
      setUploadMessage("Archivo subido exitosamente");
    } catch (error) {
      console.error("Error uploading document:", error);
      setUploadMessage("Error al subir el archivo");
    } finally {
      setLoading(false);
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [docToDelete, setDocToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const paginatedDocs = docList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(docList.length / itemsPerPage);

  const confirmDelete = (id: string) => {
    setDocToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmedDelete = () => {
    if (!docToDelete) return;

    handleDeleteDocument(docToDelete);
    setDocToDelete(null);
    setShowDeleteModal(false);
  };

  const handleDeleteDocument = (docId: string) => {
    if (!window.confirm("¿Confirmas la eliminación de este documento?")) return;
    setDocList(docList.filter((d) => d.id !== docId));
  };

  return (
    <div className="p-6 mt-20 bg-white shadow-md rounded-lg flex flex-col space-y-8">
      {/* Sección: Tabla de Talentos y Acciones */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <ProtectedContent requiredPermission="modify">
              <button
                onClick={handleAddNewRow}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center"
              >
                <FaPlus className="mr-2" /> Añadir Talento
              </button>
            </ProtectedContent>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 text-white rounded-md flex items-center transition-colors duration-200 bg-[#66ccff] hover:bg-[#56bceb]"
            >
              <FaFileUpload className="mr-2" /> Exportar a Excel
            </button>
          </div>
          <ProtectedContent requiredPermission="modify">
            {selectedIds.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
              >
                <FaTrash className="mr-2" /> Eliminar talentos seleccionados
              </button>
            )}
          </ProtectedContent>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-3 border">
                  <input
                    type="checkbox"
                    checked={
                      filteredProviders.length > 0 &&
                      selectedIds.length === filteredProviders.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="p-3 text-left border">Nombre</th>
                <th className="p-3 text-left border">Rol</th>
                <th className="p-3 text-left border">Empresa</th>
                <th className="p-3 text-left border">País</th>
                <th className="p-3 text-left border">Costo USD</th>
                <th className="p-3 text-left border">Categoría</th>
                <th className="p-3 text-left border">Línea</th>
                <th className="p-3 text-left border">Correo</th>
                <th className="p-3 text-left border">Acciones</th>
              </tr>
              <tr className="bg-gray-50">
                <th className="p-2 border"></th>
                <th className="p-2 border">
                  <input
                    type="text"
                    name="name"
                    value={filters.name}
                    onChange={handleFilterChange}
                    className="w-full border p-1 rounded"
                    placeholder="Filtrar..."
                  />
                </th>
                <th className="p-2 border">
                  <input
                    type="text"
                    name="role"
                    value={filters.role}
                    onChange={handleFilterChange}
                    className="w-full border p-1 rounded"
                    placeholder="Filtrar..."
                    data-testid="role-filter"
                  />
                </th>
                <th className="p-2 border">
                  <input
                    type="text"
                    name="company"
                    value={filters.company}
                    onChange={handleFilterChange}
                    className="w-full border p-1 rounded"
                    placeholder="Filtrar..."
                  />
                </th>
                <th className="p-2 border">
                  <input
                    type="text"
                    name="country"
                    value={filters.country}
                    onChange={handleFilterChange}
                    className="w-full border p-1 rounded"
                    placeholder="Filtrar..."
                  />
                </th>
                <th className="p-2 border">
                  <div className="flex space-x-1">
                    <input
                      type="number"
                      name="costUsdMin"
                      value={filters.costUsdMin}
                      onChange={handleFilterChange}
                      placeholder="Mín"
                      className="w-1/2 border p-1 rounded"
                    />
                    <input
                      type="number"
                      name="costUsdMax"
                      value={filters.costUsdMax}
                      onChange={handleFilterChange}
                      placeholder="Máx"
                      className="w-1/2 border p-1 rounded"
                    />
                  </div>
                </th>
                <th className="p-2 border">
                  <input
                    type="text"
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="w-full border p-1 rounded"
                    placeholder="Filtrar..."
                  />
                </th>
                <th className="p-2 border">
                  <input
                    type="text"
                    name="line"
                    value={filters.line}
                    onChange={handleFilterChange}
                    className="w-full border p-1 rounded"
                    placeholder="Filtrar..."
                  />
                </th>
                <th className="p-2 border">
                  <input
                    type="text"
                    name="email"
                    value={filters.email}
                    onChange={handleFilterChange}
                    className="w-full border p-1 rounded"
                    placeholder="Filtrar..."
                  />
                </th>
                <th className="p-2 border"></th>
              </tr>
            </thead>
            <tbody>
              {filteredProviders.map((proveedor) =>
                proveedor.id === editingProveedor?.id ? (
                  <tr key={proveedor.id} className="border bg-yellow-50">
                    <td className="p-3 border"></td>
                    <td className="p-3 border">
                      <input
                        type="text"
                        name="name"
                        value={editingProveedor.name}
                        onChange={(e) =>
                          setEditingProveedor({
                            ...editingProveedor,
                            name: e.target.value,
                          })
                        }
                        className="w-full border p-1 rounded"
                      />
                    </td>
                    <td className="p-3 border">
                      <input
                        type="text"
                        name="role"
                        value={editingProveedor.role}
                        onChange={(e) =>
                          setEditingProveedor({
                            ...editingProveedor,
                            role: e.target.value,
                          })
                        }
                        className="w-full border p-1 rounded"
                      />
                    </td>
                    <td className="p-3 border">
                      <input
                        type="text"
                        name="company"
                        value={editingProveedor.company}
                        onChange={(e) =>
                          setEditingProveedor({
                            ...editingProveedor,
                            company: e.target.value,
                          })
                        }
                        className="w-full border p-1 rounded"
                      />
                    </td>
                    <td className="p-3 border">
                      <input
                        type="text"
                        name="country"
                        value={editingProveedor.country}
                        onChange={(e) =>
                          setEditingProveedor({
                            ...editingProveedor,
                            country: e.target.value,
                          })
                        }
                        className="w-full border p-1 rounded"
                      />
                    </td>
                    <td className="p-3 border">
                      <input
                        type="number"
                        name="cost_usd"
                        value={editingProveedor.cost_usd}
                        onChange={(e) =>
                          setEditingProveedor({
                            ...editingProveedor,
                            cost_usd: e.target.value,
                          })
                        }
                        className="w-full border p-1 rounded"
                      />
                    </td>
                    <td className="p-3 border">
                      <input
                        type="text"
                        name="category"
                        value={editingProveedor.category}
                        onChange={(e) =>
                          setEditingProveedor({
                            ...editingProveedor,
                            category: e.target.value,
                          })
                        }
                        className="w-full border p-1 rounded"
                      />
                    </td>
                    <td className="p-3 border">
                      <input
                        type="text"
                        name="line"
                        value={editingProveedor.line}
                        onChange={(e) =>
                          setEditingProveedor({
                            ...editingProveedor,
                            line: e.target.value,
                          })
                        }
                        className="w-full border p-1 rounded"
                      />
                    </td>
                    <td className="p-3 border">
                      <input
                        type="email"
                        name="email"
                        value={editingProveedor.email}
                        onChange={(e) =>
                          setEditingProveedor({
                            ...editingProveedor,
                            email: e.target.value,
                          })
                        }
                        className="w-full border p-1 rounded"
                      />
                    </td>
                    <td className="p-3 border text-center">
                      <div className="flex justify-center items-center space-x-2">
                        <FaCheck
                          className="text-green-500 cursor-pointer hover:text-green-700"
                          onClick={actualizarProveedor}
                        />
                        <FaTimes
                          className="text-red-500 cursor-pointer hover:text-red-700"
                          onClick={cancelarEdicion}
                        />
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr
                    key={proveedor.id}
                    className="border text-gray-700 hover:bg-yellow-100"
                  >
                    <td className="p-3 border">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(proveedor.id)}
                        onChange={() => handleSelectRow(proveedor.id)}
                      />
                    </td>
                    <td className="p-3 border">{proveedor.name}</td>
                    <td className="p-3 border">{proveedor.role}</td>
                    <td className="p-3 border">{proveedor.company}</td>
                    <td className="p-3 border">{proveedor.country}</td>
                    <td className="p-3 border">${proveedor.cost_usd}</td>
                    <td className="p-3 border">{proveedor.category}</td>
                    <td className="p-3 border">{proveedor.line}</td>
                    <td className="p-3 border">{proveedor.email}</td>
                    <td className="p-3 border text-center">
                      <div className="flex space-x-2 justify-center">
                        <ProtectedContent requiredPermission="modify">
                          <>
                            <button
                              onClick={() => iniciarEdicion(proveedor)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => eliminarProveedor(proveedor.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FaTrash />
                            </button>
                          </>
                        </ProtectedContent>
                      </div>
                    </td>
                  </tr>
                ),
              )}
              {newRows.map((row) => (
                <tr key={row.tempId} className="border bg-green-50">
                  <td className="p-3 border"></td>
                  <td className="p-3 border">
                    <input
                      type="text"
                      name="name"
                      value={row.name}
                      onChange={(e) => handleNewRowInputChange(row.tempId, e)}
                      className="w-full border p-1 rounded"
                      placeholder="Nombre"
                    />
                  </td>
                  <td className="p-3 border">
                    <input
                      type="text"
                      name="role"
                      value={row.role}
                      onChange={(e) => handleNewRowInputChange(row.tempId, e)}
                      className="w-full border p-1 rounded"
                      placeholder="Rol"
                    />
                  </td>
                  <td className="p-3 border">
                    <input
                      type="text"
                      name="company"
                      value={row.company}
                      onChange={(e) => handleNewRowInputChange(row.tempId, e)}
                      className="w-full border p-1 rounded"
                      placeholder="Empresa"
                    />
                  </td>
                  <td className="p-3 border">
                    <input
                      type="text"
                      name="country"
                      value={row.country}
                      onChange={(e) => handleNewRowInputChange(row.tempId, e)}
                      className="w-full border p-1 rounded"
                      placeholder="País"
                    />
                  </td>
                  <td className="p-3 border">
                    <input
                      type="number"
                      name="cost_usd"
                      value={row.cost_usd}
                      onChange={(e) => handleNewRowInputChange(row.tempId, e)}
                      className="w-full border p-1 rounded"
                      placeholder="Costo USD"
                    />
                  </td>
                  <td className="p-3 border">
                    <input
                      type="text"
                      name="category"
                      value={row.category}
                      onChange={(e) => handleNewRowInputChange(row.tempId, e)}
                      className="w-full border p-1 rounded"
                      placeholder="Categoría"
                    />
                  </td>
                  <td className="p-3 border">
                    <input
                      type="text"
                      name="line"
                      value={row.line}
                      onChange={(e) => handleNewRowInputChange(row.tempId, e)}
                      className="w-full border p-1 rounded"
                      placeholder="Línea"
                    />
                  </td>
                  <td className="p-3 border">
                    <input
                      type="email"
                      name="email"
                      value={row.email}
                      onChange={(e) => handleNewRowInputChange(row.tempId, e)}
                      className="w-full border p-1 rounded"
                      placeholder="Correo"
                    />
                  </td>
                  <td className="p-3 border text-center">
                    <div className="flex justify-center items-center space-x-2">
                      <FaCheck
                        data-testid="save-provider-button"
                        className="text-green-500 cursor-pointer hover:text-green-700"
                        onClick={() => addNewRow(row.tempId)}
                      />
                      <FaTimes
                        className="text-red-500 cursor-pointer hover:text-red-700"
                        onClick={() => cancelNewRow(row.tempId)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Carga Masiva */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg shadow-md w-full">
          <h2 className="text-lg font-semibold">Carga Masiva de Talentos</h2>
          <p className="text-sm text-gray-600 mb-2">
            Formatos soportados: .xlsx, .xls
          </p>
          <input
            type="file"
            data-testid="file-input"
            ref={fileInputRef}
            className="hidden"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
          />
          <ProtectedContent requiredPermission="modify">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              <FaFileUpload className="mr-2" />{" "}
              {loading ? "Cargando..." : "Subir Archivo"}
            </button>
          </ProtectedContent>
        </div>
      </div>

      {/* Sección de Documentación unificada con mejor UX */}
      <div className="mt-8 space-y-6 bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Documentación del Talento</h2>
          <p className="text-sm text-gray-600">
            Selecciona un talento para ver y subir documentos asociados.
          </p>
        </div>

        {/* Notificación personalizada */}
        {uploadMessage && (
          <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-2 rounded text-sm">
            {uploadMessage}
          </div>
        )}

        {/* Selector único para subir y filtrar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Talento
          </label>
          <select
            className="w-full border p-2 rounded"
            value={selectedProviderId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedProviderId(id);
              setFilterProviderId(id); // sincroniza filtro con selección
            }}
          >
            <option value="">-- Selecciona un talento --</option>
            {proveedores.map((prov) => (
              <option key={prov.id} value={prov.id}>
                {prov.name} ({prov.company})
              </option>
            ))}
          </select>
        </div>

        {/* Subida de archivo - solo para administradores */}
        <ProtectedContent requiredPermission="modify">
          {selectedProviderId && (
            <div className="grid md:grid-cols-3 gap-4 items-end mt-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Archivo
                </label>
                <input
                  type="file"
                  ref={docFileInputRef}
                  onChange={handleDocFileChange}
                  className="border rounded p-2 w-full"
                />
              </div>
              <button
                disabled={!docFile}
                onClick={handleUploadDocument}
                className={`h-full px-4 py-2 rounded text-white transition ${
                  !docFile
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#a767d0] hover:bg-[#955bb8]"
                }`}
              >
                <FaCloudUploadAlt className="inline mr-2" />
                Subir Documento
              </button>
            </div>
          )}
        </ProtectedContent>

        {/* Lista de documentos */}
        <div>
          <h3 className="text-md font-semibold mt-6 mb-2">
            Documentos Cargados
          </h3>
          {docList.filter(
            (doc) => !filterProviderId || doc.provider_id === filterProviderId,
          ).length === 0 ? (
            <p className="text-sm italic text-gray-500">
              No hay documentos registrados para el talento seleccionado.
            </p>
          ) : (
            <ul className="space-y-2 animate-fade-in">
              {docList
                .filter(
                  (doc) =>
                    !filterProviderId || doc.provider_id === filterProviderId,
                )
                .map((doc) => {
                  const prov = proveedores.find(
                    (p) => p.id === doc.provider_id,
                  );
                  return (
                    <li
                      key={doc.id}
                      className="flex justify-between items-center bg-gray-50 p-2 rounded border"
                    >
                      <div>
                        <p className="text-sm font-medium">{doc.file_name}</p>
                        <p className="text-xs text-gray-500">
                          {prov
                            ? `${prov.name} - ${prov.company}`
                            : "Talento no encontrado"}
                        </p>
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 text-sm underline hover:text-blue-800"
                        >
                          Descargar
                        </a>
                      </div>
                      <FaTrash
                        className="text-red-500 cursor-pointer hover:text-red-700"
                        onClick={() => {
                          const confirmDelete = confirm(
                            `¿Estás seguro de eliminar "${doc.file_name}"?`,
                          );
                          if (confirmDelete) handleDeleteDocument(doc.id);
                        }}
                      />
                    </li>
                  );
                })}
            </ul>
          )}
        </div>
      </div>

      {/* Modal de Previsualización para Carga Masiva */}
      {showPreviewModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm z-50">
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-6xl"
            style={{ transform: "translateX(50px)" }}
          >
            <h2
              data-testid="preview-modal-title"
              className="text-xl font-bold mb-4"
            >
              Previsualizar Carga Masiva de Talentos
            </h2>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-gray-300 rounded-lg">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    {[
                      "Nombre",
                      "Rol",
                      "Empresa",
                      "País",
                      "Costo USD",
                      "Categoría",
                      "Línea",
                      "Correo",
                    ].map((header) => (
                      <th key={header} className="p-2 border">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filePreview.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border text-gray-700 hover:bg-yellow-100"
                    >
                      <td className="p-2 border">{item.name}</td>
                      <td className="p-2 border">{item.role}</td>
                      <td className="p-2 border">{item.company}</td>
                      <td className="p-2 border">{item.country}</td>
                      <td className="p-2 border">${item.cost_usd}</td>
                      <td className="p-2 border">{item.category}</td>
                      <td className="p-2 border">{item.line}</td>
                      <td className="p-2 border">{item.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={confirmFileUpload}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
              >
                <FaCheck className="mr-2" /> Confirmar
              </button>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                <FaTimes className="mr-2" /> Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
