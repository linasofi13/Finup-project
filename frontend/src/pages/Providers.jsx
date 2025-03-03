import { useEffect, useState } from "react";
import { getProviders } from "../services/userService";
import Layout from "../components/Layout";

const Providers = () => {
    const [providers, setProviders] = useState([]);

    useEffect(() => {
        getProviders()
            .then(data => setProviders(data))
            .catch(error => console.error("Error loading providers:", error));
    }, []);

    return (
        <Layout>
            <h1 className="text-2xl font-bold mb-4">Lista de Proveedores</h1>
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">Nombre</th>
                        <th className="border p-2">Rol</th>
                        <th className="border p-2">Proveedor</th>
                        <th className="border p-2">País</th>
                        <th className="border p-2">Costo (USD)</th>
                    </tr>
                </thead>
                <tbody>
                    {providers.map((provider) => (
                        <tr key={provider.id}>
                            <td className="border p-2">{provider.name}</td>
                            <td className="border p-2">{provider.role}</td>
                            <td className="border p-2">{provider.company}</td>
                            <td className="border p-2">{provider.country}</td>
                            <td className="border p-2">{provider.cost_usd}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Layout>
    );
};

export default Providers;
