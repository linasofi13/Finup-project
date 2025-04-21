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
} from "recharts";

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

export default function DashboardPage() {
  const { user } = useAuth();
  const [providersData, setProvidersData] = useState([]);

  useEffect(() => {
    fetchProviders();
  }, []);

  // 1. Obtener proveedores desde el backend
  const fetchProviders = async () => {
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_PROVIDERS_ENDPOINT as string
      );
      setProvidersData(response.data);
    } catch (error) {
      console.error("Error fetching providers:", error);
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
  const costByRoleMap = providersData.reduce((acc, provider) => {
    const role = provider.role || "N/A";
    if (!acc[role]) {
      acc[role] = { total: 0, count: 0 };
    }
    acc[role].total += parseFloat(provider.cost_usd) || 0;
    acc[role].count++;
    return acc;
  }, {});
  const radarDataRole = Object.entries(costByRoleMap).map(
    ([role, { total, count }]) => ({
      role,
      avgCost: count > 0 ? (total / count).toFixed(2) : 0,
    }),
  );

  // 3.2 Proveedores por País (PieChart)
  const providersByCountryMap = providersData.reduce((acc, provider) => {
    const country = provider.country || "Desconocido";
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {});
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
  const categoryMap = providersData.reduce((acc, provider) => {
    const cat = provider.category || "Sin categoría";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const pieDataCategory = Object.entries(categoryMap).map(([cat, count]) => ({
    name: cat,
    value: count,
  }));

  // 3.5 Proveedores por Línea (PieChart)
  const lineMap = providersData.reduce((acc, provider) => {
    const ln = provider.line || "Sin línea";
    acc[ln] = (acc[ln] || 0) + 1;
    return acc;
  }, {});
  const pieDataLine = Object.entries(lineMap).map(([line, count]) => ({
    name: line,
    value: count,
  }));

  // 3.6 Costo promedio por Empresa (ScatterChart)
  const costByCompanyMap = providersData.reduce((acc, provider) => {
    const comp = provider.company || "Desconocido";
    if (!acc[comp]) {
      acc[comp] = { total: 0, count: 0 };
    }
    acc[comp].total += parseFloat(provider.cost_usd) || 0;
    acc[comp].count++;
    return acc;
  }, {});
  const scatterDataCompany = Object.entries(costByCompanyMap).map(
    ([company, { total, count }]) => ({
      company,
      avgCost: count > 0 ? (total / count).toFixed(2) : 0,
    }),
  );

  return (
    <DashboardLayout title="Dashboard - Proveedores">
      <div className="h-6"></div> {/* Espacio extra antes del contenido */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Información General */}
        <Card title="Información General">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-100 rounded-md text-center">
              <p className="text-xl font-bold">{totalProviders}</p>
              <p className="text-sm">Total de Proveedores</p>
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

        {/* 2. Costo Promedio por Rol (RadarChart) */}
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

        {/* 3. Proveedores por Rango de Costo (LineChart) */}
        <Card title="Proveedores por Rango de Costo">
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

        {/* 4. Proveedores por País (PieChart) */}
        <Card title="Proveedores por País">
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

        {/* 5. Proveedores por Categoría (PieChart) */}
        <Card title="Proveedores por Categoría">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieDataCategory}
                cx="50%"
                cy="50%"
                outerRadius={120}
                dataKey="value"
                nameKey="name"
                label
              >
                {pieDataCategory.map((entry, index) => (
                  <Cell
                    key={`cell-cat-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* 6. Proveedores por Línea (PieChart) */}
        <Card title="Proveedores por Línea">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieDataLine}
                cx="50%"
                cy="50%"
                outerRadius={120}
                dataKey="value"
                nameKey="name"
                label
              >
                {pieDataLine.map((entry, index) => (
                  <Cell
                    key={`cell-line-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* 7. Costo Promedio por Empresa (ScatterChart) */}
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

        {/* 8. Acciones Rápidas */}
        <Card title="Acciones Rápidas">
          <div className="space-y-4">
            <Button variant="primary" className="w-full">
              Ir a Proveedores
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
