"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import axios from "axios";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  RadialBarChart,
  RadialBar,
} from "recharts";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

// Paletas de colores para los gráficos
const PIE_COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AA336A",
  "#FF66C4",
];
const BAR_COLORS = [
  "#0088FE",
  "#FF8042",
  "#00C49F",
  "#FFBB28",
  "#AA336A",
  "#FF66C4",
];

// Define Provider type for type safety
interface Provider {
  id: number;
  name?: string;
  company?: string;
  cost_usd: string;
  country?: string;
  role?: string;
  category?: string;
  line?: string;
  creation_date?: string;
}

// Define EVC and EVC_Q types for type safety
interface EVC {
  id: number;
  name: string;
  status: boolean;
  entorno_id?: number;
}

interface EVC_Q {
  id: number;
  evc_id: number;
  year: number;
  q: number;
  allocated_budget: number;
  allocated_percentage: number;
}

interface DistributionItem {
  name: string;
  count: number;
  avgCost: number;
  totalCost: number;
}

interface DistributionAccumulator {
  [key: string]: DistributionItem;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [providersData, setProvidersData] = useState<Provider[]>([]);
  const [evcsData, setEvcsData] = useState<EVC[]>([]);
  const [evcQsData, setEvcQsData] = useState<EVC_Q[]>([]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetchProviders();
    fetchEvcs();
    fetchEvcQs();
    fetchEvcFinancials();
  }, []);

  // 1. Obtener proveedores desde el backend
  const fetchProviders = async () => {
    try {
      const response = await axios.get(`${apiUrl}/providers/providers`);
      setProvidersData(response.data);
    } catch (error) {
      console.error("Error fetching providers:", error);
    }
  };

  // evs
  const [seccionSeleccionada, setSeccionSeleccionada] = useState<
    "proveedores" | "evcs"
  >("proveedores");
  const [evcFinancialsData, setEvcFinancialsData] = useState([]);

  const fetchEvcs = async () => {
    const token = Cookies.get("auth_token");

    if (!apiUrl) throw new Error("API URL is not configured");
    if (!token) throw new Error("No authentication token found");

    try {
      const response = await axios.get(`${apiUrl}/evcs/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEvcsData(response.data);
    } catch (error) {
      console.error("Error fetching evcs:", error);
    }
  };

  const fetchEvcQs = async () => {
    try {
      const res = await axios.get(`${apiUrl}/evc-qs/evc_qs/`);
      setEvcQsData(res.data);
    } catch (err) {
      console.error("Error fetching EVC_Qs:", err);
    }
  };

  const fetchEvcFinancials = async () => {
    try {
      const res = await axios.get(`${apiUrl}/evc-financials/evc_financials/`);
      setEvcFinancialsData(res.data);
    } catch (err) {
      console.error("Error fetching EVC Financials:", err);
    }
  };

  // 2. Cálculos de Información General
  const totalProviders = providersData.length;
  const uniqueCountries = new Set(
    providersData.map((p) => p.country || "Desconocido"),
  ).size;
  const totalCost = providersData.reduce(
    (sum, p) => sum + (parseFloat(p.cost_usd) || 0),
    0,
  );
  const avgCost =
    totalProviders > 0 ? (totalCost / totalProviders).toFixed(2) : 0;

  // 3. Gráficos

  // 3.1 Costo promedio por Rol (RadarChart)
  const costByRoleMap: Record<string, { total: number; count: number }> =
    providersData.reduce(
      (acc, provider) => {
        const role = provider.role || "N/A";
        if (!acc[role]) {
          acc[role] = { total: 0, count: 0 };
        }
        acc[role].total += parseFloat(provider.cost_usd) || 0;
        acc[role].count++;
        return acc;
      },
      {} as Record<string, { total: number; count: number }>,
    );
  const radarDataRole = Object.entries(costByRoleMap).map(
    ([role, { total, count }]) => ({
      role,
      avgCost: count > 0 ? (total / count).toFixed(2) : 0,
    }),
  );

  // 3.2 Proveedores por País (PieChart)
  const providersByCountryMap: Record<string, number> = providersData.reduce(
    (acc, provider) => {
      const country = provider.country || "Desconocido";
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const pieDataCountry = Object.entries(providersByCountryMap).map(
    ([country, count]) => ({ name: country, value: count }),
  );

  // 3.3 Proveedores por Rango de Costo (LineChart)
  const costRanges = [
    { label: "0-100", min: 0, max: 100 },
    { label: "101-500", min: 101, max: 500 },
    { label: "501-1000", min: 501, max: 1000 },
    { label: "1001-5000", min: 1001, max: 5000 },
    { label: "5001+", min: 5001, max: Infinity },
  ];
  const lineDataCostRanges = costRanges.map((range) => {
    const count = providersData.filter((provider) => {
      const cost = parseFloat(provider.cost_usd) || 0;
      return cost >= range.min && cost <= range.max;
    }).length;
    return { range: range.label, count };
  });

  // 3.4 Proveedores por Categoría (PieChart)
  const categoryMap: Record<string, number> = providersData.reduce(
    (acc, provider) => {
      const cat = provider.category || "Sin categoría";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const pieDataCategory = Object.entries(categoryMap).map(([cat, count]) => ({
    name: cat,
    value: count,
  }));

  // 3.5 Proveedores por Línea (PieChart)
  const lineMap: Record<string, number> = providersData.reduce(
    (acc, provider) => {
      const ln = provider.line || "Sin línea";
      acc[ln] = (acc[ln] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const pieDataLine = Object.entries(lineMap).map(([line, count]) => ({
    name: line,
    value: count,
  }));

  // 3.6 Costo promedio por Empresa (ScatterChart)
  const costByCompanyMap: Record<string, { total: number; count: number }> =
    providersData.reduce(
      (acc, provider) => {
        const comp = provider.company || "Desconocido";
        if (!acc[comp]) {
          acc[comp] = { total: 0, count: 0 };
        }
        acc[comp].total += parseFloat(provider.cost_usd) || 0;
        acc[comp].count++;
        return acc;
      },
      {} as Record<string, { total: number; count: number }>,
    );
  const scatterDataCompany = Object.entries(costByCompanyMap).map(
    ([company, { total, count }]) => ({
      company,
      avgCost: count > 0 ? (total / count).toFixed(2) : 0,
    }),
  );

  // 3.7 Top 5 Talentos por Costo (BarChart)
  const top5Talentos = [...providersData]
    .sort((a, b) => parseFloat(b.cost_usd) - parseFloat(a.cost_usd))
    .slice(0, 5)
    .map((p) => ({
      name: p.company || p.name || "Talento",
      cost: parseFloat(p.cost_usd) || 0,
    }));

  // 3.8 Trend Analysis Data (Last 6 months)
  const trendData = Array.from({ length: 6 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - i);
    const monthProviders = providersData.filter((p) => {
      const providerDate = new Date(p.creation_date || new Date());
      return (
        providerDate.getMonth() === month.getMonth() &&
        providerDate.getFullYear() === month.getFullYear()
      );
    });
    return {
      month: month.toLocaleString("default", { month: "short" }),
      providers: monthProviders.length,
      avgCost:
        monthProviders.length > 0
          ? monthProviders.reduce(
              (sum, p) => sum + (parseFloat(p.cost_usd) || 0),
              0,
            ) / monthProviders.length
          : 0,
    };
  }).reverse();

  // 3.9 Budget Utilization by Category
  const budgetUtilization = Object.entries(categoryMap).map(
    ([category, count]) => {
      const categoryProviders = providersData.filter(
        (p) => p.category === category,
      );
      const totalBudget = categoryProviders.reduce(
        (sum, p) => sum + (parseFloat(p.cost_usd) || 0),
        0,
      );
      const plannedBudget = totalBudget * 1.2; // Example: 20% more than current utilization
      return {
        category,
        utilized: totalBudget,
        planned: plannedBudget,
        utilization: (totalBudget / plannedBudget) * 100,
      };
    },
  );

  // 3.10 Distribution by Category and Line (replacing performance distribution)
  const categoryLineDistribution =
    providersData.reduce<DistributionAccumulator>((acc, provider) => {
      const category = provider.category || "Sin categoría";
      const line = provider.line || "Sin línea";
      const key = `${category} - ${line}`;

      if (!acc[key]) {
        acc[key] = {
          name: key,
          count: 0,
          avgCost: 0,
          totalCost: 0,
        };
      }

      acc[key].count += 1;
      acc[key].totalCost += parseFloat(provider.cost_usd) || 0;
      acc[key].avgCost = acc[key].totalCost / acc[key].count;

      return acc;
    }, {} as DistributionAccumulator);

  interface DistributionDataItem extends DistributionItem {
    percentage: number;
  }

  const distributionData = Object.values(categoryLineDistribution)
    .sort((a: DistributionItem, b: DistributionItem) => b.count - a.count)
    .map(
      (item: DistributionItem): DistributionDataItem => ({
        name: item.name,
        count: item.count,
        percentage: (item.count / providersData.length) * 100,
        avgCost: item.avgCost,
        totalCost: item.totalCost,
      }),
    );

  return (
    <DashboardLayout title="Dashboard">
      <div className="h-6"></div>

      {/* Selector de sección mejorado */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-gray-100 rounded-lg shadow-md overflow-hidden">
          <button
            className={`px-6 py-2 font-semibold transition-all duration-200 ${
              seccionSeleccionada === "proveedores"
                ? "bg-yellow-400 text-white"
                : "text-gray-700 hover:bg-yellow-200"
            }`}
            onClick={() => setSeccionSeleccionada("proveedores")}
          >
            Talentos
          </button>
          <button
            className={`px-6 py-2 font-semibold transition-all duration-200 ${
              seccionSeleccionada === "evcs"
                ? "bg-yellow-400 text-white"
                : "text-gray-700 hover:bg-yellow-200"
            }`}
            onClick={() => setSeccionSeleccionada("evcs")}
          >
            EVCs
          </button>
        </div>
      </div>

      {/* Contenido dinámico según la sección seleccionada */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {seccionSeleccionada === "proveedores" && (
          <>
            {/* 1. Información General */}
            <Card title="Información General">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-red-100 rounded-md text-center">
                  <p className="text-xl font-bold">{totalProviders}</p>
                  <p className="text-sm">Total de Talentos</p>
                </div>
                <div className="p-4 bg-blue-100 rounded-md text-center">
                  <p className="text-xl font-bold">{uniqueCountries}</p>
                  <p className="text-sm">Países</p>
                </div>
                <div className="p-4 bg-green-100 rounded-md text-center">
                  <p className="text-xl font-bold">${totalCost.toFixed(2)}</p>
                  <p className="text-sm">Costo Total</p>
                </div>
                <div className="p-4 bg-purple-100 rounded-md text-center">
                  <p className="text-xl font-bold">${avgCost}</p>
                  <p className="text-sm">Costo Promedio</p>
                </div>
              </div>
            </Card>

            {/* 2. Costo Promedio por Rol */}
            <Card title="Costo Promedio por Rol">
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  data={radarDataRole}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="role" />
                  <PolarRadiusAxis />
                  <Radar
                    name="Costo Promedio"
                    dataKey="avgCost"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </Card>

            {/* 3. Talentos por Rango de Costo */}
            <Card title="Talentos por Rango de Costo">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={lineDataCostRanges}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Cantidad"
                    stroke="#00C49F"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* 4. Talentos por País */}
            <Card title="Talentos por País">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={pieDataCountry}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    dataKey="value"
                    nameKey="name"
                    label
                  >
                    {pieDataCountry.map((entry, index) => (
                      <Cell
                        key={`cell-country-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* 5. Talentos por Categoría */}
            <Card title="Talentos por Categoría">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  layout="vertical"
                  data={pieDataCategory}
                  margin={{ top: 20, right: 40, left: 80, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip
                    formatter={(value) => [`${value} talento(s)`, "Cantidad"]}
                  />
                  <Legend />
                  <Bar dataKey="value" fill="#00C49F" name="Cantidad">
                    {pieDataCategory.map((_, index) => (
                      <Cell
                        key={`cat-bar-${index}`}
                        fill={BAR_COLORS[index % BAR_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* 6. Talentos por Línea */}
            <Card title="Talentos por Línea">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={pieDataLine}
                  margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`${value} talento(s)`, "Cantidad"]}
                  />
                  <Legend />
                  <Bar dataKey="value" fill="#FFBB28" name="Cantidad">
                    {pieDataLine.map((_, index) => (
                      <Cell
                        key={`line-bar-${index}`}
                        fill={BAR_COLORS[index % BAR_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* 7. Costo Promedio por Empresa */}
            <Card title="Costo Promedio por Empresa">
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid />
                  <XAxis type="category" dataKey="company" name="Empresa" />
                  <YAxis dataKey="avgCost" name="Costo Promedio" />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Legend />
                  <Scatter
                    data={scatterDataCompany}
                    fill="#FF8042"
                    name="Costo Promedio"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </Card>

            {/* 8. Top 5 Talentos por Costo */}
            <Card title="Top 5 Talentos por Costo">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={top5Talentos}
                  layout="vertical"
                  margin={{ top: 20, right: 40, left: 80, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="cost" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip formatter={(value) => [`$${value}`, "Costo"]} />
                  <Legend />
                  <Bar dataKey="cost" fill="#FF8042" name="Costo">
                    {top5Talentos.map((_, index) => (
                      <Cell
                        key={`top5-bar-${index}`}
                        fill={BAR_COLORS[index % BAR_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* 9. Trend Analysis */}
            <Card title="Tendencia de Talentos y Costos (6 meses)">
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="providers"
                    fill="#8884d8"
                    name="Talentos"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgCost"
                    stroke="#82ca9d"
                    name="Costo Promedio"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>

            {/* 10. Budget Utilization */}
            <Card title="Utilización de Presupuesto por Categoría">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={budgetUtilization}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="utilized"
                    stackId="a"
                    fill="#8884d8"
                    name="Utilizado"
                  />
                  <Bar
                    dataKey="planned"
                    stackId="a"
                    fill="#82ca9d"
                    name="Planificado"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* 11. Distribution by Category and Line */}
            <Card title="Distribución por Categoría y Línea">
              <div className="flex justify-center items-center w-full h-full">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={distributionData}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 120, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={110}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value: number, name, props) => [
                        name === "count"
                          ? `${value} talentos (${props.payload.percentage.toFixed(1)}%)`
                          : `$${value.toFixed(2)}`,
                        name === "count" ? "Cantidad" : "Costo Promedio",
                      ]}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Bar dataKey="count" fill="#8884d8" name="Cantidad" />
                    <Bar
                      dataKey="avgCost"
                      fill="#82ca9d"
                      name="Costo Promedio"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* 13. Acciones Rápidas */}
            <Card title="Acciones Rápidas">
              <div className="space-y-4">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => router.push("/proveedores")}
                >
                  Ir a Talentos
                </Button>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => router.push("/documentos")}
                >
                  Ir a Documentos
                </Button>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => router.push("/evcs")}
                >
                  Ir a EVCs
                </Button>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => router.push("/asignacion-presupuestal")}
                >
                  Ir a Asignación Presupuestal
                </Button>
              </div>
            </Card>
          </>
        )}

        {/* BLOQUE VACÍO PARA EVCS - Lo llenaremos en el siguiente paso */}
        {seccionSeleccionada === "evcs" && (
          <>
            {/* 1. EVCs por Estado */}
            <Card title="EVCs por Estado">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={Object.entries(
                      evcsData.reduce(
                        (acc, evc) => {
                          const key = evc.status ? "Activos" : "Inactivos";
                          acc[key] = (acc[key] || 0) + 1;
                          return acc;
                        },
                        {} as Record<string, number>,
                      ),
                    ).map(([name, value]) => ({ name, value }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label
                  >
                    {Object.entries(
                      evcsData.reduce(
                        (acc, evc) => {
                          const key = evc.status ? "Activos" : "Inactivos";
                          acc[key] = (acc[key] || 0) + 1;
                          return acc;
                        },
                        {} as Record<string, number>,
                      ),
                    ).map(([_, __], index) => (
                      <Cell
                        key={`cell-status-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* 2. Distribución de EVCs por Entorno */}
            <Card title="Distribución de EVCs por Entorno">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={Object.entries(
                    evcsData.reduce(
                      (acc, evc) => {
                        const key = `Entorno ${evc.entorno_id}`;
                        acc[key] = (acc[key] || 0) + 1;
                        return acc;
                      },
                      {} as Record<string, number>,
                    ),
                  ).map(([name, value]) => ({ name, value }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#00C49F" name="EVCs" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* 3. Presupuesto Total por Año (AreaChart) */}
            <Card title="Presupuesto Total por Año">
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart
                  data={Object.entries(
                    evcQsData.reduce(
                      (acc, q) => {
                        acc[q.year] = (acc[q.year] || 0) + q.allocated_budget;
                        return acc;
                      },
                      {} as Record<number, number>,
                    ),
                  ).map(([year, total]) => ({
                    year,
                    total,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#0088FE"
                    fill="#0088FE"
                    name="Presupuesto Total"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* 4. % Promedio de Uso por Año (LineChart) */}
            <Card title="% Promedio de Uso por Año">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={Object.entries(
                    evcQsData.reduce(
                      (acc, q) => {
                        const year = q.year;
                        if (!acc[year]) acc[year] = { total: 0, count: 0 };
                        acc[year].total += q.allocated_percentage;
                        acc[year].count += 1;
                        return acc;
                      },
                      {} as Record<number, { total: number; count: number }>,
                    ),
                  ).map(([year, { total, count }]) => ({
                    year,
                    avgPercentage: count > 0 ? total / count : 0,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="avgPercentage"
                    stroke="#FF8042"
                    dot={{ r: 4 }}
                    name="% Promedio"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* 5. Presupuesto vs % Uso (ScatterChart) */}
            <Card title="Presupuesto vs % Uso">
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid />
                  <XAxis
                    type="number"
                    dataKey="budget"
                    name="Presupuesto"
                    unit=" USD"
                  />
                  <YAxis
                    type="number"
                    dataKey="percentage"
                    name="% Uso"
                    unit="%"
                    domain={[0, 100]}
                  />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Scatter
                    name="EVCs"
                    data={evcQsData.map((q) => ({
                      budget: q.allocated_budget,
                      percentage: q.allocated_percentage,
                    }))}
                    fill="#AA336A"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </Card>

            {/* 6. Distribución por Año y Quarter (RadarChart) */}
            <Card title="Presupuesto por Quarter/Año (Radar)">
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart
                  outerRadius="80%"
                  data={(() => {
                    const quarterMap: Record<
                      string,
                      Record<string, number>
                    > = {};
                    evcQsData.forEach((q) => {
                      const quarterLabel = `Q${q.q}`;
                      const yearKey = `${q.year}`;
                      if (!quarterMap[quarterLabel]) {
                        quarterMap[quarterLabel] = {};
                      }
                      quarterMap[quarterLabel][yearKey] =
                        (quarterMap[quarterLabel][yearKey] || 0) +
                        q.allocated_budget;
                    });
                    const allYears = new Set<string>();
                    Object.values(quarterMap).forEach((v) =>
                      Object.keys(v).forEach((y) => allYears.add(y)),
                    );
                    return Object.entries(quarterMap).map(
                      ([quarter, values]) => {
                        const dataPoint: Record<string, any> = { quarter };
                        allYears.forEach((year) => {
                          dataPoint[year] = values[year] || 0;
                        });
                        return dataPoint;
                      },
                    );
                  })()}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="quarter" />
                  <PolarRadiusAxis />
                  {[...new Set(evcQsData.map((q) => `${q.year}`))].map(
                    (year, index) => (
                      <Radar
                        key={year}
                        name={year}
                        dataKey={year}
                        stroke={PIE_COLORS[index % PIE_COLORS.length]}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                        fillOpacity={0.4}
                      />
                    ),
                  )}
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
