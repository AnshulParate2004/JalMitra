import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mockVillages } from '../data/mockVillages';
import { Navigation2, Clock, Truck, Play, MapPin } from 'lucide-react';

// Source Reservoir Coordinates (e.g., Jayakwadi Dam point)
const SOURCE_COORDINATE: [number, number] = [19.4890, 75.3200];
const SOURCE_NAME = "Central Reservoir (Jayakwadi)";

// Select high-severity villages for this demo route
const routeDestinations = mockVillages.filter(v => v.severity === 'Severe').slice(0, 3);
const routeCoordinates: [number, number][] = [
    SOURCE_COORDINATE,
    ...routeDestinations.map(v => v.coordinates)
];

// Create standard icons
const sourceIcon = L.divIcon({
    className: 'custom-icon',
    html: `<div class="w-7 h-7 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
});

const destIcon = L.divIcon({
    className: 'custom-icon',
    html: `<div class="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold">!</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

const RouteOptimizationPage = () => {
    return (
        <div className="flex flex-col lg:flex-row h-full gap-6 transition-colors duration-200">
            {/* Map Section */}
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden relative min-h-[500px] lg:min-h-0 transition-colors duration-200">
                <MapContainer bounds={L.latLngBounds(routeCoordinates).pad(0.1)} className="w-full h-full absolute inset-0 z-0">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Polyline Route */}
                    <Polyline
                        positions={routeCoordinates}
                        pathOptions={{ color: '#3b82f6', weight: 4, dashArray: '10, 10', opacity: 0.8 }}
                    />

                    {/* Source Marker */}
                    <Marker position={SOURCE_COORDINATE} icon={sourceIcon}>
                        <Popup>
                            <div className="font-bold text-blue-800">{SOURCE_NAME}</div>
                            <div className="text-sm text-gray-600">Dispatch Center</div>
                        </Popup>
                    </Marker>

                    {/* Destination Markers */}
                    {routeDestinations.map((village, idx) => (
                        <Marker
                            key={village.id}
                            position={village.coordinates}
                            icon={destIcon}
                        >
                            <Popup>
                                <div className="font-bold">{idx + 1}. {village.name}</div>
                                <div className="text-sm">Demand: {village.predictedTankerDemand} Tankers</div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* Panel Section */}
            <div className="w-full lg:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 flex flex-col overflow-hidden transition-colors duration-200">
                <div className="p-5 border-b border-gray-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Route Overview</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Optimal multi-stop delivery route</p>
                </div>

                <div className="p-5 flex-1 flex flex-col gap-6 overflow-y-auto">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                            <div className="flex items-center text-blue-600 mb-1">
                                <Navigation2 className="w-4 h-4 mr-2" />
                                <span className="text-sm font-medium">Est. Distance</span>
                            </div>
                            <span className="text-2xl font-bold text-gray-900">42.5<span className="text-sm font-normal text-gray-500 ml-1">km</span></span>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                            <div className="flex items-center text-orange-600 mb-1">
                                <Clock className="w-4 h-4 mr-2" />
                                <span className="text-sm font-medium">Est. Time</span>
                            </div>
                            <span className="text-2xl font-bold text-gray-900">1<span className="text-sm font-normal text-gray-500 ml-1">h</span> 45<span className="text-sm font-normal text-gray-500 ml-1">m</span></span>
                        </div>
                    </div>

                    {/* Route Steps */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">Sequence</h3>
                        <div className="relative border-l-2 border-gray-200 dark:border-slate-700 ml-3 space-y-6">

                            {/* Source Step */}
                            <div className="relative pl-6">
                                <div className="absolute -left-[9px] top-0.5 w-4 h-4 bg-blue-600 rounded-full border-4 border-white dark:border-slate-900"></div>
                                <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">Start: {SOURCE_NAME}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Scheduled: Immediate</p>
                            </div>

                            {/* Destination Steps */}
                            {routeDestinations.map((village, idx) => (
                                <div key={village.id} className="relative pl-6">
                                    <div className="absolute -left-[9px] top-0.5 w-4 h-4 bg-white dark:bg-slate-900 border-2 border-red-500 rounded-full"></div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{idx + 1}. {village.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Drop: {village.predictedTankerDemand} Tankers</p>
                                        </div>
                                        <div className="flex items-center text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                            <MapPin className="w-3 h-3 mr-1" />
                                            Stop {idx + 1}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* End Step */}
                            <div className="relative pl-6 pt-2">
                                <div className="absolute -left-[9px] top-2.5 w-4 h-4 bg-gray-300 dark:bg-slate-600 rounded-sm border-4 border-white dark:border-slate-900"></div>
                                <p className="font-bold text-gray-500 dark:text-gray-400 text-sm line-through">Return to Source</p>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Action Area */}
                <div className="p-5 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <Truck className="w-4 h-4 mr-2" />
                        Vehicle TNK-4092 is available.
                    </div>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-lg flex items-center justify-center transition-all shadow-md hover:shadow-lg">
                        <Play className="w-5 h-5 mr-2 fill-current" />
                        Dispatch Tanker Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RouteOptimizationPage;

