import { useState, useMemo } from 'react';
import { mockVillages, type Village } from '../data/mockVillages';
import { Search, Filter, Truck } from 'lucide-react';

const severityOrder = { Severe: 1, Moderate: 2, Normal: 3 };

const AllocationPage = () => {
    const [searchQuery, setSearchQuery] = useState('');

    // Sort villages by severity (Severe first), then by Tanker Demand (Highest first)
    const sortedVillages = useMemo(() => {
        return [...mockVillages]
            .filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => {
                if (severityOrder[a.severity] !== severityOrder[b.severity]) {
                    return severityOrder[a.severity] - severityOrder[b.severity];
                }
                return b.predictedTankerDemand - a.predictedTankerDemand;
            });
    }, [searchQuery]);

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Priority Water Allocation</h1>
                <p className="text-gray-600 dark:text-gray-400">Review severity-sorted villages and allocate resources based on predicted tanker demand.</p>
            </div>

            <div className="flex items-center justify-between mb-6 gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search villages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 transition-colors duration-200"
                    />
                </div>
                <button className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors duration-200">
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
                {sortedVillages.map((village) => (
                    <VillageCard key={village.id} village={village} />
                ))}
            </div>
        </div>
    );
};

const VillageCard = ({ village }: { village: Village }) => {
    return (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-gray-100 rounded-xl overflow-hidden hover:shadow-lg dark:hover:shadow-black/40 transition-shadow flex flex-col h-full shadow-sm relative group">
            {/* Top color bar indicator */}
            <div className={`h-1.5 w-full ${village.severity === 'Severe' ? 'bg-red-500' :
                village.severity === 'Moderate' ? 'bg-orange-500' : 'bg-green-500'
                }`}></div>

            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{village.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pop: {village.population.toLocaleString()}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${village.severity === 'Severe' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50' :
                        village.severity === 'Moderate' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/50' : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50'
                        }`}>
                        {village.severity}
                    </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 mb-4 border border-slate-100 dark:border-slate-800 mt-auto transition-colors duration-200">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Stress Index</span>
                        <span className="text-sm font-bold dark:text-gray-100">{village.stressIndex}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
                        <div
                            className={`h-1.5 rounded-full ${village.stressIndex > 75 ? 'bg-red-500' : village.stressIndex > 50 ? 'bg-orange-500' : 'bg-green-500'}`}
                            style={{ width: `${village.stressIndex}%` }}
                        ></div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <Truck className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Est. Demand:</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{village.predictedTankerDemand}</span>
                </div>

                <button
                    disabled={village.predictedTankerDemand === 0}
                    className={`w-full py-2.5 rounded-lg flex items-center justify-center font-semibold text-sm transition-all focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-900 ${village.predictedTankerDemand === 0
                        ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md focus:ring-blue-600'
                        }`}>
                    {village.predictedTankerDemand === 0 ? 'No Allocation Needed' : 'Allocate Tanker'}
                </button>
            </div>
        </div>
    );
};

export default AllocationPage;

