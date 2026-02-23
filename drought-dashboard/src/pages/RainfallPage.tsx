import {
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    ComposedChart
} from 'recharts';
import { CloudRain, Droplets, TrendingDown } from 'lucide-react';

// Mock data for the last 6 months
const rainfallData = [
    { month: 'Aug', actual: 120, expected: 150, deviation: -30 },
    { month: 'Sep', actual: 95, expected: 140, deviation: -45 },
    { month: 'Oct', actual: 45, expected: 85, deviation: -40 },
    { month: 'Nov', actual: 15, expected: 25, deviation: -10 },
    { month: 'Dec', actual: 5, expected: 10, deviation: -5 },
    { month: 'Jan', actual: 0, expected: 5, deviation: -5 },
];

const RainfallPage = () => {
    // Current total deviation for summary
    const totalActual = rainfallData.reduce((sum, item) => sum + item.actual, 0);
    const totalExpected = rainfallData.reduce((sum, item) => sum + item.expected, 0);
    const deficitPercentage = Math.round(((totalExpected - totalActual) / totalExpected) * 100);

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 gap-6 transition-colors duration-200">
            <div className="mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Rainfall Analysis</h1>
                <p className="text-gray-600 dark:text-gray-400">Track historical rainfall data and identify deviation patterns to forecast water stress.</p>
            </div>

            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
                        <CloudRain className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">6-Month Actual</p>
                        <p className="text-2xl font-bold text-gray-900">{totalActual} <span className="text-sm font-normal text-gray-500">mm</span></p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-4">
                        <Droplets className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">6-Month Expected</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalExpected} <span className="text-sm font-normal text-gray-500 dark:text-gray-500">mm</span></p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-red-200 dark:border-red-900/50 p-6 flex items-center relative overflow-hidden transition-colors duration-200">
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-red-500 dark:bg-red-600"></div>
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mr-4">
                        <TrendingDown className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Deficit</p>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{deficitPercentage}% <span className="text-sm font-normal text-gray-500 dark:text-gray-500">below avg</span></p>
                    </div>
                </div>
            </div>

            {/* Chart Area */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 flex-1 flex flex-col transition-colors duration-200">
                <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Rainfall Deviation Analysis</h2>
                    <select className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-3 py-2 outline-none">
                        <option>Last 6 Months</option>
                        <option>Last 12 Months</option>
                        <option>YTD</option>
                    </select>
                </div>

                <div className="w-full relative h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={rainfallData}
                            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                                hide={false}
                                tick={{ fill: '#6b7280', fontSize: 13 }}
                                tickLine={false}
                                axisLine={false}
                                label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', fill: '#6b7280', dy: 40, dx: -10 }}
                                dx={-10}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: any) => [`${value} mm`, undefined]}
                            />
                            <Legend
                                verticalAlign="top"
                                height={36}
                                iconType="circle"
                                wrapperStyle={{ paddingBottom: '20px' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="actual"
                                fill="url(#colorActual)"
                                stroke="none"
                            />
                            <Line
                                type="monotone"
                                dataKey="expected"
                                name="Expected Rainfall (Historical Avg)"
                                stroke="#9ca3af"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                                activeDot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="actual"
                                name="Actual Rainfall"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#ffffff' }}
                                activeDot={{ r: 6, fill: '#1d4ed8', stroke: '#ffffff', strokeWidth: 2 }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default RainfallPage;

