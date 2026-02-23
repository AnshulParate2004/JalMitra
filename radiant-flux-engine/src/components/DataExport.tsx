import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Calendar, FileDown, Loader2 } from "lucide-react";
import { startOfMonth, endOfMonth, startOfDay, endOfDay, subDays } from "date-fns";

interface DataExportProps {
  className?: string;
}

const DataExport = ({ className = "" }: DataExportProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [dateRange, setDateRange] = useState<"today" | "week" | "month" | "custom">("month");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [exportType, setExportType] = useState<"readings" | "alerts" | "combined">("readings");
  const [deviceId, setDeviceId] = useState<string>("");

  const getDateRange = () => {
    const now = new Date();
    let start: Date;
    let end: Date = endOfDay(now);

    switch (dateRange) {
      case "today":
        start = startOfDay(now);
        break;
      case "week":
        start = startOfDay(subDays(now, 7));
        break;
      case "month":
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case "custom":
        if (startDate && endDate) {
          start = new Date(startDate);
          end = new Date(endDate);
        } else {
          return null;
        }
        break;
      default:
        start = startOfMonth(now);
        end = endOfMonth(now);
    }

    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    };
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const dates = getDateRange();
      if (!dates) {
        alert("Please select a date range");
        setIsDownloading(false);
        return;
      }

      const params = new URLSearchParams({
        start_date: dates.start,
        end_date: dates.end,
        export_type: exportType,
      });

      if (deviceId) {
        params.append("device_id", deviceId);
      }

      const apiUrl = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/api/export/csv?${params.toString()}`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Failed to download data");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = response.headers.get("Content-Disposition")?.split("filename=")[1] || `water_data_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setIsOpen(false);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download data. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={className}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="nba-card-sm flex items-center gap-2 px-4 py-2 hover:bg-muted/50 transition-colors"
      >
        <Download className="w-4 h-4" />
        <span className="text-sm font-medium">Export Data</span>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full right-0 mt-2 nba-card z-50 min-w-[320px]"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Export Water Quality Data</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>

            {/* Export Type */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Export Type</label>
              <div className="flex gap-2">
                {(["readings", "alerts", "combined"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setExportType(type)}
                    className={`flex-1 px-3 py-2 rounded-lg border-2 border-black text-xs font-medium transition-all ${
                      exportType === type
                        ? "bg-primary text-primary-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-card text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Date Range</label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {(["today", "week", "month", "custom"] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-3 py-2 rounded-lg border-2 border-black text-xs font-medium transition-all ${
                      dateRange === range
                        ? "bg-primary text-primary-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-card text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>

              {dateRange === "custom" && (
                <div className="space-y-2 mt-2">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border-2 border-black bg-card text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border-2 border-black bg-card text-foreground text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Device ID (Optional) */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Device ID (Optional)
              </label>
              <input
                type="text"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                placeholder="Leave empty for all devices"
                className="w-full px-3 py-2 rounded-lg border-2 border-black bg-card text-foreground text-sm placeholder:text-muted-foreground"
              />
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading || (dateRange === "custom" && (!startDate || !endDate))}
              className="w-full px-4 py-2 rounded-lg border-2 border-black bg-primary text-primary-foreground font-semibold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Download CSV</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DataExport;
