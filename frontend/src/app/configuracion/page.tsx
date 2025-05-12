"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaSave,
  FaPowerOff,
  FaPlus,
  FaInfoCircle,
  FaTrash,
  FaEdit,
  FaTimes,
  FaCheck,
  FaEye,
} from "react-icons/fa";

interface NotificationRule {
  id?: number;
  name: string;
  target_table: string;
  condition_field: string;
  threshold: number;
  comparison: string;
  message: string;
  type: string;
  active: boolean;
  created_at?: string;
}

const tableOptions = [
  { label: "Talentos", value: "provider" },
  { label: "Equipos de Evaluación (EVC)", value: "evc" },
  { label: "Entornos", value: "entorno" },
  { label: "Cuatrimestre de EVC", value: "evc_q" },
];

const fieldOptions: Record<string, { label: string; value: string }[]> = {
  provider: [
    { label: "Costo (USD)", value: "cost_usd" },
    { label: "Categoría", value: "category" },
    { label: "País", value: "country" },
  ],
  evc: [
    { label: "Estado", value: "status" },
    { label: "Presupuesto Asignado", value: "allocated_budget" },
  ],
  entorno: [{ label: "Estado", value: "status" }],
  evc_q: [
    { label: "Porcentaje asignado", value: "allocated_percentage" },
    { label: "Presupuesto asignado", value: "allocated_budget" },
  ],
};

const comparisonOptions = [
  { label: "Mayor que", value: ">" },
  { label: "Menor que", value: "<" },
  { label: "Igual a", value: "==" },
  { label: "Mayor o igual que", value: ">=" },
  { label: "Menor o igual que", value: "<=" },
];

const typeOptions = [
  { label: "Alerta", value: "alert" },
  { label: "Advertencia", value: "warning" },
  { label: "Información", value: "info" },
];

export default function ConfiguracionPage() {
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  const [editedRules, setEditedRules] = useState<
    Record<number, NotificationRule>
  >({});
  const [selectedRules, setSelectedRules] = useState<number[]>([]);
  const [newRule, setNewRule] = useState<NotificationRule>({
    name: "",
    target_table: "provider",
    condition_field: "cost_usd",
    threshold: 0,
    comparison: ">",
    message: "",
    type: "alert",
    active: true,
  });

  // Default EVC notification rules
  const defaultEVCRules: NotificationRule[] = [
    {
      name: "Alto uso de presupuesto EVC",
      target_table: "evc_q",
      condition_field: "allocated_percentage",
      threshold: 70,
      comparison: "custom:evc_high_usage",
      message: "Hay EVCs con uso de presupuesto superior al 70%",
      type: "warning",
      active: true,
    },
    {
      name: "Uso crítico de presupuesto EVC",
      target_table: "evc_q",
      condition_field: "allocated_percentage",
      threshold: 90,
      comparison: "custom:evc_critical_usage",
      message: "¡ALERTA! Hay EVCs con uso de presupuesto superior al 90%",
      type: "alert",
      active: true,
    },
    {
      name: "Bajo uso de presupuesto EVC",
      target_table: "evc_q",
      condition_field: "allocated_percentage",
      threshold: 30,
      comparison: "custom:evc_low_usage",
      message: "Hay EVCs con uso de presupuesto inferior al 30%",
      type: "warning",
      active: true,
    },
    {
      name: "Aumento significativo de presupuesto",
      target_table: "evc_q",
      condition_field: "allocated_budget",
      threshold: 0,
      comparison: "custom:evc_budget_increase",
      message: "Se detectó un aumento significativo en el presupuesto de algunos EVCs",
      type: "warning",
      active: true,
    },
    {
      name: "Disminución significativa de presupuesto",
      target_table: "evc_q",
      condition_field: "allocated_budget",
      threshold: 0,
      comparison: "custom:evc_budget_decrease",
      message: "Se detectó una disminución significativa en el presupuesto de algunos EVCs",
      type: "warning",
      active: true,
    },
    {
      name: "EVC sin líder técnico",
      target_table: "evc",
      condition_field: "technical_leader_id",
      threshold: 0,
      comparison: "custom:evc_no_technical",
      message: "Hay EVCs sin líder técnico asignado",
      type: "warning",
      active: true,
    },
    {
      name: "EVC sin líder funcional",
      target_table: "evc",
      condition_field: "functional_leader_id",
      threshold: 0,
      comparison: "custom:evc_no_functional",
      message: "Hay EVCs sin líder funcional asignado",
      type: "warning",
      active: true,
    },
    {
      name: "EVC sin entorno",
      target_table: "evc",
      condition_field: "entorno_id",
      threshold: 0,
      comparison: "custom:evc_no_entorno",
      message: "Hay EVCs sin entorno asignado",
      type: "warning",
      active: true,
    },
    {
      name: "Alerta de costo alto de Talento",
      target_table: "provider",
      condition_field: "cost_usd",
      threshold: 3000,
      comparison: ">",
      message: "El talento tiene un costo superior a $3000.",
      type: "alert",
      active: true,
    },
  ];

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/notification-rules/notification-rules/",
      );
      setRules(res.data);
    } catch (err) {
      console.error("Error al cargar reglas", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to create default rules if they don't exist
  const createDefaultRules = async () => {
    try {
      for (const rule of defaultEVCRules) {
        await axios.post(
          "http://localhost:8000/notification-rules/notification-rules/",
          rule,
        );
      }
      fetchRules();
    } catch (err) {
      console.error("Error al crear reglas por defecto", err);
    }
  };

  // Add button to create default rules
  const renderDefaultRulesButton = () => {
    return (
      <button
        onClick={createDefaultRules}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
      >
        Crear Reglas EVC por Defecto
      </button>
    );
  };

  const updateRule = async (rule: NotificationRule) => {
    try {
      await axios.patch(
        `http://localhost:8000/notification-rules/notification-rules/${rule.id}`,
        rule,
      );
      setEditingRuleId(null);
      fetchRules();
    } catch (err) {
      console.error("Error al actualizar la regla", err);
    }
  };

  const toggleActive = async (rule: NotificationRule) => {
    try {
      await axios.patch(
        `http://localhost:8000/notification-rules/notification-rules/${rule.id}`,
        {
          ...rule,
          active: !rule.active,
        },
      );
      setRules((prev) =>
        prev.map((r) => (r.id === rule.id ? { ...r, active: !r.active } : r)),
      );
    } catch (err) {
      console.error("Error al cambiar estado activo", err);
    }
  };

  const handleFieldChange = (
    id: number,
    field: keyof NotificationRule,
    value: any,
  ) => {
    setEditedRules((prev) => ({
      ...prev,
      [id]: {
        ...rules.find((r) => r.id === id)!,
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const deleteRule = async (id: number) => {
    const confirm = window.confirm(
      "¿Estás seguro que deseas eliminar esta regla?",
    );
    if (!confirm) return;
    try {
      await axios.delete(
        `http://localhost:8000/notification-rules/notification-rules/${id}`,
      );
      setRules(rules.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error al eliminar la regla", err);
    }
  };

  const deleteSelectedRules = async () => {
    if (selectedRules.length === 0) return;
    
    const confirm = window.confirm(
      `¿Estás seguro que deseas eliminar ${selectedRules.length} reglas?`,
    );
    if (!confirm) return;

    try {
      await axios.delete(
        "http://localhost:8000/notification-rules/notification-rules/bulk",
        { data: { rule_ids: selectedRules } }
      );
      setRules(rules.filter((r) => !selectedRules.includes(r.id!)));
      setSelectedRules([]);
    } catch (err) {
      console.error("Error al eliminar las reglas", err);
      alert("Error al eliminar las reglas. Por favor, intente nuevamente.");
    }
  };

  const toggleRuleSelection = (id: number) => {
    setSelectedRules(prev => 
      prev.includes(id) 
        ? prev.filter(ruleId => ruleId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRules.length === rules.length) {
      setSelectedRules([]);
    } else {
      setSelectedRules(rules.map(r => r.id!));
    }
  };

  const handleNewRuleChange = (field: keyof NotificationRule, value: any) => {
    setNewRule((prev) => ({ ...prev, [field]: value }));
  };

  const createRule = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8000/notification-rules/notification-rules/",
        newRule,
      );
      setRules([...rules, res.data]);
      setNewRule({
        name: "",
        target_table: "provider",
        condition_field: "cost_usd",
        threshold: 0,
        comparison: ">",
        message: "",
        type: "alert",
        active: true,
      });
    } catch (err) {
      console.error("Error al crear la regla", err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-2xl font-bold mb-6">Configuración de Notificaciones</h1>
      
      {/* Add default rules button and bulk delete button */}
      <div className="mb-6 flex justify-between items-center">
        {renderDefaultRulesButton()}
        {selectedRules.length > 0 && (
          <button
            onClick={deleteSelectedRules}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors flex items-center"
          >
            <FaTrash className="mr-2" />
            Eliminar {selectedRules.length} reglas seleccionadas
          </button>
        )}
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[1400px] border border-gray-300 text-sm mb-10">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border">
                  <input
                    type="checkbox"
                    checked={selectedRules.length === rules.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4"
                  />
                </th>
                <th className="p-3 border">Nombre</th>
                <th className="p-3 border">Tabla</th>
                <th className="p-3 border">Campo</th>
                <th className="p-3 border">Condición</th>
                <th className="p-3 border">Umbral</th>
                <th className="p-3 border">Mensaje</th>
                <th className="p-3 border">Tipo</th>
                <th className="p-3 border">Estado</th>
                <th className="p-3 border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => {
                const isEditing = editingRuleId === rule.id;
                const current = isEditing ? editedRules[rule.id!] : rule;

                return (
                  <tr key={rule.id} className="align-top">
                    <td className="border p-2">
                      <input
                        type="checkbox"
                        checked={selectedRules.includes(rule.id!)}
                        onChange={() => toggleRuleSelection(rule.id!)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="border p-2 whitespace-normal break-words">
                      <input
                        disabled={!isEditing}
                        value={current.name}
                        onChange={(e) =>
                          handleFieldChange(rule.id!, "name", e.target.value)
                        }
                        className="w-full border px-2 py-2 rounded"
                      />
                    </td>
                    <td className="border p-2">
                      <select
                        disabled={!isEditing}
                        value={current.target_table}
                        onChange={(e) =>
                          handleFieldChange(
                            rule.id!,
                            "target_table",
                            e.target.value,
                          )
                        }
                        className="w-full border px-2 py-2 rounded"
                      >
                        {tableOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border p-2">
                      <select
                        disabled={!isEditing}
                        value={current.condition_field}
                        onChange={(e) =>
                          handleFieldChange(
                            rule.id!,
                            "condition_field",
                            e.target.value,
                          )
                        }
                        className="w-full border px-2 py-2 rounded"
                      >
                        {fieldOptions[current.target_table]?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border p-2">
                      <select
                        disabled={!isEditing}
                        value={current.comparison}
                        onChange={(e) =>
                          handleFieldChange(
                            rule.id!,
                            "comparison",
                            e.target.value,
                          )
                        }
                        className="w-full border px-2 py-2 rounded"
                      >
                        {comparisonOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border p-2 w-32">
                      <input
                        disabled={!isEditing}
                        type="number"
                        value={current.threshold}
                        onChange={(e) =>
                          handleFieldChange(
                            rule.id!,
                            "threshold",
                            parseFloat(e.target.value),
                          )
                        }
                        className="w-full border px-2 py-2 rounded"
                      />
                    </td>
                    <td className="border p-2 whitespace-normal break-words">
                      <input
                        disabled={!isEditing}
                        value={current.message}
                        onChange={(e) =>
                          handleFieldChange(rule.id!, "message", e.target.value)
                        }
                        className="w-full border px-2 py-2 rounded"
                      />
                    </td>
                    <td className="border p-2">
                      <select
                        disabled={!isEditing}
                        value={current.type}
                        onChange={(e) =>
                          handleFieldChange(rule.id!, "type", e.target.value)
                        }
                        className="w-full border px-2 py-2 rounded"
                      >
                        {typeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border">
                      <div className="flex justify-center items-start mt-4 h-full">
                        <button
                          onClick={() => toggleActive(rule)}
                          className={`text-white px-3 py-1 rounded-full text-xs ${rule.active ? "bg-green-500" : "bg-gray-400"}`}
                        >
                          {rule.active ? "ON" : "OFF"}
                        </button>
                      </div>
                    </td>
                    <td className="border">
                      <div className="flex justify-center items-start mt-4 space-x-3 h-full">
                        <FaEye
                          className="text-gray-500 cursor-pointer hover:text-gray-700"
                          title="Ver Detalle"
                          onClick={() =>
                            alert(
                              `\nNombre: ${rule.name}\nTabla: ${rule.target_table}\nCampo: ${rule.condition_field}\nCondición: ${rule.comparison} ${rule.threshold}\nMensaje: ${rule.message}\nTipo: ${rule.type}`,
                            )
                          }
                        />
                        {isEditing ? (
                          <>
                            <FaCheck
                              className="text-green-500 cursor-pointer hover:text-green-700"
                              onClick={() => updateRule(current)}
                            />
                            <FaTimes
                              className="text-red-500 cursor-pointer hover:text-red-700"
                              onClick={() => {
                                setEditingRuleId(null);
                                setEditedRules((prev) => {
                                  const updated = { ...prev };
                                  delete updated[rule.id!];
                                  return updated;
                                });
                              }}
                            />
                          </>
                        ) : (
                          <FaEdit
                            className="text-blue-500 cursor-pointer hover:text-blue-700"
                            onClick={() => {
                              setEditingRuleId(rule.id!);
                              setEditedRules((prev) => ({
                                ...prev,
                                [rule.id!]: { ...rule },
                              }));
                            }}
                          />
                        )}
                        <FaTrash
                          className="text-red-500 cursor-pointer hover:text-red-700"
                          onClick={() => deleteRule(rule.id!)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Crear nueva regla */}
      <h2 className="text-xl font-semibold mb-4">Crear Nueva Regla</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium">Nombre</label>
          <input
            placeholder="Ej. Costo Elevado"
            className="w-full border px-2 py-2 rounded"
            value={newRule.name}
            onChange={(e) => handleNewRuleChange("name", e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Tabla</label>
          <select
            className="w-full border px-2 py-2 rounded"
            value={newRule.target_table}
            onChange={(e) => {
              handleNewRuleChange("target_table", e.target.value);
              handleNewRuleChange(
                "condition_field",
                fieldOptions[e.target.value][0].value,
              );
            }}
          >
            {tableOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Campo</label>
          <select
            className="w-full border px-2 py-2 rounded"
            value={newRule.condition_field}
            onChange={(e) =>
              handleNewRuleChange("condition_field", e.target.value)
            }
          >
            {fieldOptions[newRule.target_table]?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Condición</label>
          <select
            className="w-full border px-2 py-2 rounded"
            value={newRule.comparison}
            onChange={(e) => handleNewRuleChange("comparison", e.target.value)}
          >
            {comparisonOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Umbral</label>
          <input
            type="number"
            className="w-full border px-2 py-2 rounded"
            value={newRule.threshold}
            onChange={(e) =>
              handleNewRuleChange("threshold", parseFloat(e.target.value))
            }
          />
        </div>
        <div>
          <label className="text-sm font-medium">Mensaje de alerta</label>
          <input
            placeholder="Ej. El costo superó el límite"
            className="w-full border px-2 py-2 rounded"
            value={newRule.message}
            onChange={(e) => handleNewRuleChange("message", e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Tipo</label>
          <select
            className="w-full border px-2 py-2 rounded"
            value={newRule.type}
            onChange={(e) => handleNewRuleChange("type", e.target.value)}
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={createRule}
        className="flex items-center bg-[#a767d0] hover:bg-[#944cc4] text-white px-4 py-2 rounded"
      >
        <FaPlus className="mr-2" /> Crear Regla
      </button>
    </div>
  );
}
