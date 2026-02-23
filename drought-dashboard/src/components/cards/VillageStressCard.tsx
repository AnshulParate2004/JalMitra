const VillageStressCard = () => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 text-sm font-medium">Village Stress Level</h3>
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">High</span>
                <span className="text-red-500 text-xs font-semibold">↑ 12%</span>
            </div>
        </div>
    );
};

export default VillageStressCard;
