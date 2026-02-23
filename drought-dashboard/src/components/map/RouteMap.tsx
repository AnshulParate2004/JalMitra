const RouteMap = () => {
    return (
        <div className="bg-slate-50 w-full h-[400px] rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center">
            <div className="text-slate-400 flex flex-col items-center">
                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A2 2 0 013 15.382V6.418a2 2 0 011.106-1.789L9 2m0 18l6-3m-6 3V2m6 15l4.553 2.276A2 2 0 0021 17.582V8.618a2 2 0 00-1.106-1.789L15 4m0 13V4m0 0L9 2" />
                </svg>
                <span className="font-medium">Interactive Route Map Placeholder</span>
                <span className="text-sm italic">(Leaflet integration pending)</span>
            </div>
        </div>
    );
};

export default RouteMap;
