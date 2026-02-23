const TankerDemandCard = () => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 text-sm font-medium">Tanker Demand</h3>
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">42</span>
                <span className="text-slate-400 text-xs">Tankers Today</span>
            </div>
        </div>
    );
};

export default TankerDemandCard;
