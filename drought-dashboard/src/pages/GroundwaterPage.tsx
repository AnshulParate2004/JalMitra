import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { Waves, ArrowDownRight, AlertTriangle } from 'lucide-react';

// Mock data for the last 6 months. 
// Note: Depth is typically measured from surface down. Higher value = deeper water (worse condition).
const groundwaterData = [
    { month: 'Aug', depth: 4.2 },
    { month: 'Sep', depth: 4.5 },
    { month: 'Oct', depth: 5.8 },
    { month: 'Nov', depth: 7.1 },
    { month: 'Dec', depth: 8.5 },
    { month: 'Jan', depth: 9.8 },
];

const CRITICAL_DEPTH_THRESHOLD = 8.0;

const GroundwaterPage = () => {
    const currentDepth = groundwaterData[groundwaterData.length - 1].depth;
    const sixMonthsAgoDepth = groundwaterData[0].depth;
    const depthChange = (currentDepth - sixMonthsAgoDepth).toFixed(1);
    const isCritical = currentDepth >= CRITICAL_DEPTH_THRESHOLD;

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 gap-6 transition-colors duration-200">
            <div className="mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Groundwater Levels</h1>
                <p className="text-gray-600 dark:text-gray-400">Monitor the depletion of underground aquifers to assess long-term water sustainability.</p>
            </div>

            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 flex items-center transition-colors duration-200">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mr-4">
                        <Waves className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Depth (Avg)</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{currentDepth} <span className="text-sm font-normal text-gray-500 dark:text-gray-500">meters</span></p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 flex items-center transition-colors duration-200">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 mr-4">
                        <ArrowDownRight className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">6-Month Depletion</p>
                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">+{depthChange} <span className="text-sm font-normal text-gray-500 dark:text-gray-500">meters</span></p>
                    </div>
                </div>

                <div className={`rounded-xl shadow-sm border p-6 flex items-center relative overflow-hidden transition-colors duration-200 ${isCritical ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50' : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800'}`}>
                    {isCritical && <div className="absolute right-0 top-0 bottom-0 w-2 bg-red-600 dark:bg-red-500"></div>}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${isCritical ? 'bg-red-200 dark:bg-red-900/50 text-red-700 dark:text-red-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400'}`}>
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className={`text-sm font-medium ${isCritical ? 'text-red-700 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>Status</p>
                        <p className={`text-2xl font-bold ${isCritical ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                            {isCritical ? 'Critical Level' : 'Stable'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Chart Area */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 flex-1 min-h-[400px] flex flex-col transition-colors duration-200">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Groundwater Trend Analysis</h2>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">Higher values indicate deeper (depleted) water levels.</span>
                    </div>
                    <select className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-3 py-2 outline-none">
                        <option>Last 6 Months</option>
                        <option>Last 12 Months</option>
                        <option>YTD</option>
                    </select>
                </div>

                <div className="w-full relative h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={groundwaterData}
                            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorDepth" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis
                                dataKey="month"
                                tick={{ fill: '#6b7280', fontSize: 13 }}
                                tickLine={false}
                                axisLine={{ stroke: '#e5e7eb' }}
                                dy={10}
                            />
                            <YAxis
                                // We keep depth positive, but we could reverse the axis if we wanted higher water level at top. 
                                // Standard convention for depth often just plots the positive value.
                                domain={[0, 12]}
                                tick={{ fill: '#6b7280', fontSize: 13 }}
                                tickLine={false}
                                axisLine={false}
                                label={{ value: 'Depth (meters)', angle: -90, position: 'insideLeft', fill: '#6b7280', dy: 40, dx: -10 }}
                                dx={-10}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: any) => [`${value} m`, 'Avg Depth']}
                            />

                            {/* Critical threshold line */}
                            <ReferenceLine
                                y={CRITICAL_DEPTH_THRESHOLD}
                                stroke="#ef4444"
                                strokeDasharray="3 3"
                                label={{ position: 'top', value: 'Critical Depth Threshold', fill: '#ef4444', fontSize: 12 }}
                            />

                            <Area
                                type="monotone"
                                dataKey="depth"
                                stroke="#0ea5e9"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorDepth)"
                                activeDot={{ r: 6, fill: '#0284c7', stroke: '#ffffff', strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default GroundwaterPage;
