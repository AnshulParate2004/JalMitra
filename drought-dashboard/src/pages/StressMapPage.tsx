import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mockVillages, type SeverityLevel } from '../data/mockVillages';

// Fix for leaflet default icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getMarkerColor = (severity: SeverityLevel) => {
    switch (severity) {
        case 'Severe': return 'bg-red-500 border-red-700';
        case 'Moderate': return 'bg-orange-500 border-orange-700';
        case 'Normal': return 'bg-green-500 border-green-700';
        default: return 'bg-blue-500 border-blue-700';
    }
};

const createCustomIcon = (severity: SeverityLevel) => {
    return L.divIcon({
        className: 'custom-icon',
        html: `<div class="w-6 h-6 rounded-full border-2 shadow-md ${getMarkerColor(severity)}"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
};

const StressMapPage = () => {
    // Center map around Aurangabad region based on mock data
    const mapCenter: [number, number] = [19.8762, 75.3433];

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Village Water Stress Map</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Geospatial visualization of water stress index and tanker demand</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-sm dark:text-gray-300">Severe</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div><span className="text-sm dark:text-gray-300">Moderate</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-sm dark:text-gray-300">Normal</span></div>
                </div>
            </div>

            <div className="flex-1 w-full relative z-0">
                <MapContainer center={mapCenter} zoom={9} className="w-full h-[600px] min-h-full">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {mockVillages.map((village) => (
                        <Marker
                            key={village.id}
                            position={village.coordinates}
                            icon={createCustomIcon(village.severity)}
                        >
                            <Popup className="custom-popup dark:text-gray-900">
                                <div className="p-1 min-w-[200px]">
                                    <h3 className="font-bold text-lg mb-2 border-b pb-1 text-gray-900">{village.name}</h3>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Population:</span>
                                            <span className="font-medium">{village.population.toLocaleString()}</span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Stress Severity:</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${village.severity === 'Severe' ? 'bg-red-500' :
                                                village.severity === 'Moderate' ? 'bg-orange-500' : 'bg-green-500'
                                                }`}>
                                                {village.severity}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Stress Index:</span>
                                            <span className="font-medium">{village.stressIndex}/100</span>
                                        </div>

                                        <div className="flex justify-between pt-2 border-t font-semibold">
                                            <span className="text-gray-800">Predicted Demand:</span>
                                            <span className="text-blue-600">{village.predictedTankerDemand} Tankers</span>
                                        </div>
                                    </div>

                                    <button className="w-full mt-3 bg-blue-600 text-white rounded py-1.5 text-sm font-medium hover:bg-blue-700 transition">
                                        View Full Report
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default StressMapPage;

