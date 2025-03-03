import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Providers from "./pages/Providers";
import EVCs from "./pages/EVCs";
import Login from "./pages/Login";

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Layout><Providers /></Layout>} />
                <Route path="/providers" element={<Layout><Providers /></Layout>} />
                <Route path="/evcs" element={<Layout><EVCs /></Layout>} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
