import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import RainfallPage from '../pages/RainfallPage';
import GroundwaterPage from '../pages/GroundwaterPage';
import StressMapPage from '../pages/StressMapPage';
import TankerDemandPage from '../pages/TankerDemandPage';
import AllocationPage from '../pages/AllocationPage';
import RouteOptimizationPage from '../pages/RouteOptimizationPage';
import MonitoringPage from '../pages/MonitoringPage';

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />

                <Route path="/" element={<DashboardLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="rainfall" element={<RainfallPage />} />
                    <Route path="groundwater" element={<GroundwaterPage />} />
                    <Route path="stress-map" element={<StressMapPage />} />
                    <Route path="tanker-demand" element={<TankerDemandPage />} />
                    <Route path="allocation" element={<AllocationPage />} />
                    <Route path="route-optimization" element={<RouteOptimizationPage />} />
                    <Route path="monitoring" element={<MonitoringPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;
