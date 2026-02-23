import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Week 1', level: 45 },
    { name: 'Week 2', level: 42 },
    { name: 'Week 3', level: 38 },
    { name: 'Week 4', level: 35 },
    { name: 'Week 5', level: 30 },
];

const GroundwaterChart = () => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[300px]">
            <h3 className="text-slate-900 font-semibold mb-4">Groundwater Levels (Depth)</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="level" stroke="#10b981" fillOpacity={1} fill="url(#colorLevel)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default GroundwaterChart;
