const SeverityCard = () => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 text-sm font-medium">Drought Severity</h3>
            <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full w-3/4"></div>
            </div>
            <p className="mt-2 text-xs text-slate-500">75% Critical Threshold</p>
        </div>
    );
};

export default SeverityCard;
