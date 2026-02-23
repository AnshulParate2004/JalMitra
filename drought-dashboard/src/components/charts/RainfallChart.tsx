import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Jun', rainfall: 400 },
    { name: 'Jul', rainfall: 300 },
    { name: 'Aug', rainfall: 200 },
    { name: 'Sep', rainfall: 278 },
    { name: 'Oct', rainfall: 189 },
];

const RainfallChart = () => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[300px]">
            <h3 className="text-slate-900 font-semibold mb-4">Rainfall Trends</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="rainfall" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RainfallChart;
