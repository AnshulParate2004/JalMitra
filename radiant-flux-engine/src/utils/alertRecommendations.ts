/**
 * Generate recommendations based on alert type and parameters
 */
export interface AlertRecommendation {
  title: string;
  steps: string[];
  priority: "high" | "medium" | "low";
}

export const getAlertRecommendations = (alert: { message: string; readings?: { ph?: number; turbidity?: number; tds?: number } }): AlertRecommendation | null => {
  const message = alert.message.toLowerCase();
  const readings = alert.readings || {};

  // pH Level Issues
  if (message.includes("ph") && (message.includes("out of range") || message.includes("too") || message.includes("low") || message.includes("high"))) {
    const ph = readings.ph;
    if (ph !== undefined) {
      if (ph < 6.0) {
        return {
          title: "Acidic Water Detected",
          priority: "high",
          steps: [
            "Add alkaline substances like baking soda (1 tsp per gallon) or lime",
            "Install pH correction filters or neutralization systems",
            "Check for industrial contamination sources nearby",
            "Test water source for chemical pollutants",
            "Consider installing reverse osmosis system with pH adjustment",
            "Contact local water authority if pH is extremely low (<4.0)"
          ]
        };
      } else if (ph > 9.0) {
        return {
          title: "Alkaline Water Detected",
          priority: "high",
          steps: [
            "Add acidic substances like citric acid or white vinegar (1 tbsp per gallon)",
            "Install reverse osmosis system with pH correction",
            "Check for soap or detergent contamination",
            "Test for high mineral content (hard water)",
            "Consider installing acid injection system for continuous treatment",
            "Avoid direct consumption until pH is corrected"
          ]
        };
      }
    }
  }

  // High Turbidity
  if (message.includes("turbidity") && (message.includes("above") || message.includes("high"))) {
    return {
      title: "High Turbidity - Cloudy Water",
      priority: "high",
      steps: [
        "Install sediment filters (5-10 micron) immediately",
        "Use coagulation and flocculation treatment (alum or ferric chloride)",
        "Consider sand filtration systems for large volumes",
        "Check for source contamination (runoff, sediment)",
        "Regular cleaning of storage tanks and pipes",
        "Boil water before consumption if turbidity is very high (>100 NTU)",
        "Consider UV sterilization after filtration"
      ]
    };
  }

  // High TDS
  if (message.includes("tds") && (message.includes("above") || message.includes("high"))) {
    return {
      title: "High Total Dissolved Solids",
      priority: "medium",
      steps: [
        "Install reverse osmosis (RO) system for effective TDS reduction",
        "Use activated carbon filters to remove organic compounds",
        "Consider distillation for very high TDS (>1000 ppm)",
        "Check for salt intrusion or mineral contamination",
        "Regular filter maintenance and replacement (every 3-6 months)",
        "Test for specific contaminants (heavy metals, salts)",
        "Consider water softening if high calcium/magnesium"
      ]
    };
  }

  // Temperature issues (if any)
  if (message.includes("temperature")) {
    return {
      title: "Temperature Alert",
      priority: "low",
      steps: [
        "Check sensor calibration",
        "Verify water source temperature",
        "Monitor for bacterial growth in warm water",
        "Consider cooling systems if temperature is consistently high"
      ]
    };
  }

  return null;
};
