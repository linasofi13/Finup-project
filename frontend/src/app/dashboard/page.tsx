"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const barData = [
  { name: "Enero", asignado: 12000, gastado: 10000 },
  { name: "Febrero", asignado: 15000, gastado: 12000 },
  { name: "Marzo", asignado: 18000, gastado: 16000 },
  { name: "Abril", asignado: 20000, gastado: 17000 },
  { name: "Mayo", asignado: 22000, gastado: 20000 },
  { name: "Junio", asignado: 24000, gastado: 21000 },
];

const lineData = [
  { name: "Enero", esteMes: 3000, mesAnterior: 2800 },
  { name: "Febrero", esteMes: 3500, mesAnterior: 3300 },
  { name: "Marzo", esteMes: 4000, mesAnterior: 3900 },
  { name: "Abril", esteMes: 4500, mesAnterior: 4200 },
  { name: "Mayo", esteMes: 4800, mesAnterior: 4600 },
  { name: "Junio", esteMes: 5000, mesAnterior: 4900 },
];

const pieData = [
  { name: "Pragma", value: 52.1 },
  { name: "Foonkie", value: 22.8 },
  { name: "MAS Global Consulting", value: 13.9 },
  { name: "TEAM International", value: 11.2 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Dashboard">
      {/* 🔥 Se añadió `mt-6` para bajar el título */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Información General */}
        <Card title="Información General">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-100 rounded-md text-center">
              <p className="text-xl font-bold">$33,500</p>
              <p className="text-sm">Presupuesto Asignado</p>
            </div>
            <div className="p-4 bg-blue-100 rounded-md text-center">
              <p className="text-xl font-bold">310</p>
              <p className="text-sm">Asignaciones</p>
            </div>
            <div className="p-4 bg-green-100 rounded-md text-center">
              <p className="text-xl font-bold">$155,634</p>
              <p className="text-sm">Saldo Disponible</p>
            </div>
            <div className="p-4 bg-purple-100 rounded-md text-center">
              <p className="text-xl font-bold">27</p>
              <p className="text-sm">EVC’s activos</p>
            </div>
          </div>
        </Card>

        {/* Gráficos */}
        <Card title="Asignado vs Gastado">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="asignado" fill="#0088FE" />
              <Bar dataKey="gastado" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Asignación Presupuestal">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="esteMes" stroke="#00C49F" />
              <Line type="monotone" dataKey="mesAnterior" stroke="#FFBB28" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Presupuesto Asignado por Proveedor">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Acciones rápidas">
          <div className="space-y-4">
            <Button variant="primary" className="w-full">
              Ver gráficos
            </Button>
            <Button variant="secondary" className="w-full">
              Configurar alertas
            </Button>
            <Button variant="secondary" className="w-full">
              Soporte
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
