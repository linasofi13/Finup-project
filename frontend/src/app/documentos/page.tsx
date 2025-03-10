"use client";

import { useState } from "react";
import { FaDownload, FaEye, FaTrash, FaFileUpload, FaFilter } from "react-icons/fa";

export default function DocumentosPage() {
    const [documentos, setDocumentos] = useState([
        { id: 1, nombre: "PLANTILLA_FINANCIERA.docx", tipo: "docx", tamano: "28.50 KB", fecha: "16/11/2022", url: "/files/PLANTILLA_FINANCIERA.docx" },
        { id: 2, nombre: "REPORTE_FINANZAS_2025.xls", tipo: "xls", tamano: "28.50 KB", fecha: "16/11/2022", url: "/files/REPORTE_FINANZAS_2025.xls" },
        { id: 3, nombre: "EVCS_2024.zip", tipo: "zip", tamano: "28.50 KB", fecha: "16/11/2022", url: "/files/EVCS_2024.zip" },
        { id: 4, nombre: "INFORME_FINANZAS.pdf", tipo: "pdf", tamano: "28.50 KB", fecha: "16/11/2022", url: "/files/INFORME_FINANZAS.pdf" },
    ]);
    
    const [seleccionados, setSeleccionados] = useState(new Set());
    const [archivoCargado, setArchivoCargado] = useState(null);
    const [seleccionarTodos, setSeleccionarTodos] = useState(false);

    const toggleSeleccionado = (id) => {
        const nuevaSeleccion = new Set(seleccionados);
        if (nuevaSeleccion.has(id)) {
            nuevaSeleccion.delete(id);
        } else {
            nuevaSeleccion.add(id);
        }
        setSeleccionados(nuevaSeleccion);
        setSeleccionarTodos(nuevaSeleccion.size === documentos.length);
    };

    const toggleSeleccionarTodos = () => {
        if (seleccionarTodos) {
            setSeleccionados(new Set());
        } else {
            setSeleccionados(new Set(documentos.map(doc => doc.id)));
        }
        setSeleccionarTodos(!seleccionarTodos);
    };

    const manejarCargaArchivo = (e) => {
        const file = e.target.files[0];
        if (file) {
            setArchivoCargado(file);
        }
    };

    const guardarArchivo = () => {
        if (archivoCargado) {
            const nuevoDocumento = {
                id: documentos.length + 1,
                nombre: archivoCargado.name,
                tipo: archivoCargado.type.split("/")[1] || "archivo",
                tamano: (archivoCargado.size / 1024).toFixed(2) + " KB",
                fecha: new Date().toLocaleDateString(),
                url: `/files/${archivoCargado.name}`,
            };
            setDocumentos([...documentos, nuevoDocumento]);
            setArchivoCargado(null);
        }
    };

    const eliminarDocumento = (id) => {
        const confirmar = window.confirm("¿Estás seguro de que deseas eliminar este documento?");
        if (confirmar) {
            const nuevosDocumentos = documentos.filter((documento) => documento.id !== id);
            setDocumentos(nuevosDocumentos);
            setSeleccionados(new Set([...seleccionados].filter(selId => selId !== id)));
        }
    };

    return (
        <div className="p-6 mt-20 bg-white shadow-md rounded-lg flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">Documentos</h1>
                <div className="flex space-x-2">
                    <button className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
                        <FaFilter className="mr-2" /> Filtrar
                    </button>
                    <button className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
                        <FaDownload className="mr-2" /> Descarga Masiva
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300 rounded-lg">
                    <thead>
                        <tr className="bg-gray-100 text-gray-700">
                            <th className="p-3 text-left border">
                                <input type="checkbox" checked={seleccionarTodos} onChange={toggleSeleccionarTodos} />
                            </th>
                            <th className="p-3 text-left border">Nombre del Archivo</th>
                            <th className="p-3 text-left border">Descargar</th>
                            <th className="p-3 text-left border">Tamaño</th>
                            <th className="p-3 text-left border">Fecha de Creación</th>
                            <th className="p-3 text-left border">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documentos.map((documento) => (
                            <tr key={documento.id} className="border text-gray-700 hover:bg-yellow-100 cursor-pointer">
                                <td className="p-3 border">
                                    <input type="checkbox" checked={seleccionados.has(documento.id)} onChange={() => toggleSeleccionado(documento.id)} />
                                </td>
                                <td className="p-3 border">{documento.nombre}</td>
                                <td className="p-3 border text-center">
                                    <a href={documento.url} download className="text-yellow-500 cursor-pointer hover:text-yellow-700">
                                        <FaDownload />
                                    </a>
                                </td>
                                <td className="p-3 border">{documento.tamano}</td>
                                <td className="p-3 border">{documento.fecha}</td>
                                <td className="p-3 border text-center flex space-x-3">
                                    <FaEye className="text-yellow-500 cursor-pointer hover:text-yellow-700" />
                                    <FaTrash className="text-red-500 cursor-pointer hover:text-red-700" onClick={() => eliminarDocumento(documento.id)} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 p-6 bg-gray-50 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold">Cargar Documento</h2>
                <p className="text-gray-600 mt-2">Los archivos cargados serán procesados automáticamente por el sistema.</p>
                <div className="mt-4 border-dashed border-2 border-gray-300 p-6 text-center">
                    <p className="text-gray-600">Arrastra y suelta archivos aquí o</p>
                    <input type="file" className="hidden" id="fileInput" onChange={manejarCargaArchivo} />
                    <label htmlFor="fileInput" className="mt-2 flex items-center justify-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 cursor-pointer">
                        <FaFileUpload className="mr-2" /> Explorar Archivos
                    </label>
                </div>
                {archivoCargado && (
                    <div className="mt-4 p-4 bg-white shadow-md rounded-md flex justify-between items-center">
                        <span className="text-gray-700">{archivoCargado.name}</span>
                        <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600" onClick={guardarArchivo}>
                            Guardar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
