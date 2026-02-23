

#include <OneWire.h>
#include <DallasTemperature.h>
#include <WiFi.h>
#include <HTTPClient.h>
// ----- Pins -----
#define DS18B20_PIN    13
#define TURBIDITY_PIN  32
#define WATER_LEVEL_PIN 27
#define PH_PIN         39
#define MQ135_A0_PIN   15
#define MQ135_D0_PIN   2
// TDS: connect TDS sensor analog out to this pin if you add the hardware
#define TDS_PIN        36

// SIM900A: use ESP32 Serial2. Connect SIM900A RX -> GPIO 17 (TX2), SIM900A TX -> GPIO 16 (RX2)
#define SIM900_BAUD 9600
#define SIM900_SERIAL Serial2

// ----- OneWire / Temperature -----
OneWire oneWire(DS18B20_PIN);
DallasTemperature sensors(&oneWire);

// ----- Wi-Fi: use the same network your laptop is on (so ESP32 can reach backend) -----
const char* WIFI_SSID     = "Rcoem.";
const char* WIFI_PASSWORD = "12345678";

// ----- Backend: replace 192.168.1.100 with your laptop's IP (run ipconfig on laptop). ESP32 cannot use "localhost". -----
const char* API_URL       = "http://192.168.1.100:8000/api/readings";

// ----- SMS (SIM900A) -----
const char* ALERT_PHONE_NUMBER = "+918208170566";

// ----- Thresholds (adjust as needed) -----
const float PH_MIN = 6.0, PH_MAX = 9.0;
const float TURBIDITY_MAX_NTU = 100.0;
const float TDS_MAX_PPM = 500.0;   // Used when TDS sensor is connected
const int   ADC_MAX = 4095;
const float VREF = 3.3;

// Set to 1 for extra debug on Serial, 0 to reduce output
#define DEBUG_SERIAL 1

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n[DEBUG] === Water Quality ESP32 boot ===");

  Serial.println("[DEBUG] Init Serial2 for SIM900A (RX=16, TX=17)...");
  SIM900_SERIAL.begin(SIM900_BAUD, SERIAL_8N1, 16, 17);

  Serial.println("[DEBUG] Init sensors...");
  sensors.begin();
  pinMode(TURBIDITY_PIN, INPUT);
  pinMode(WATER_LEVEL_PIN, INPUT);
  pinMode(PH_PIN, INPUT);
  pinMode(MQ135_A0_PIN, INPUT);
  pinMode(MQ135_D0_PIN, INPUT);
  pinMode(TDS_PIN, INPUT);
  Serial.println("[DEBUG] Pins: DS18B20=13 Turb=32 Level=27 pH=39 MQ135=15,2 TDS=36");

  Serial.println("[DEBUG] Starting Wi-Fi...");
  Serial.print("[DEBUG] SSID: ");
  Serial.println(WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("[DEBUG] Connecting");
  for (int i = 0; i < 20 && WiFi.status() != WL_CONNECTED; i++) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("[DEBUG] Wi-Fi OK. IP: ");
    Serial.println(WiFi.localIP().toString());
    Serial.print("[DEBUG] API_URL: ");
    Serial.println(API_URL);
  } else {
    Serial.println("[DEBUG] Wi-Fi FAILED. SMS-only mode. Check SSID/password.");
  }
  Serial.println("[DEBUG] === Setup done, entering loop ===\n");
}

// Convert pH analog (0-4095) to pH 0-14. Calibrate with your probe.
float readPH() {
  int raw = analogRead(PH_PIN);
  float voltage = (raw / (float)ADC_MAX) * VREF;
  // Common approximation: pH = 7 - (voltage - 2.5) / 0.18; adjust for your probe
  float ph = 7.0 - (voltage - 2.5) / 0.18;
  if (ph < 0) ph = 0;
  if (ph > 14) ph = 14;
  return ph;
}

// Convert turbidity analog to NTU-like value (0-300). Calibrate with your sensor.
float readTurbidityNTU() {
  int raw = analogRead(TURBIDITY_PIN);
  float voltage = (raw / (float)ADC_MAX) * VREF;
  // Example mapping: adjust for your sensor datasheet
  float ntu = (2.5 - voltage) * 100.0;
  if (ntu < 0) ntu = 0;
  return ntu;
}

// TDS in ppm (placeholder: use 0 if no TDS sensor; else connect sensor to TDS_PIN)
float readTDS() {
  int raw = analogRead(TDS_PIN);
  float voltage = (raw / (float)ADC_MAX) * VREF;
  // Example: TDS ≈ k * voltage (k depends on sensor, e.g. 500)
  float tds = voltage * 500.0;
  return tds;
}

void sendSMS(const char* msg) {
  SIM900_SERIAL.print("AT+CMGF=1\r");
  delay(200);
  SIM900_SERIAL.print("AT+CMGS=\"");
  SIM900_SERIAL.print(ALERT_PHONE_NUMBER);
  SIM900_SERIAL.print("\"\r");
  delay(200);
  SIM900_SERIAL.print(msg);
  SIM900_SERIAL.print("\r");
  delay(200);
  SIM900_SERIAL.write(26);  // Ctrl+Z
  delay(500);
  Serial.println("SMS sent (or queued).");
}

void postToServer(float temp, float ph, float turbidityNtu, float tds, int waterLevel) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");

  // Match your FastAPI body: ph, turbidity, tds, device_id; optional: temperature
  String body = "{\"ph\":";
  body += ph;
  body += ",\"turbidity\":";
  body += turbidityNtu;
  body += ",\"tds\":";
  body += tds;
  body += ",\"device_id\":\"esp32_1\"";
  body += ",\"temperature\":";
  body += temp;
  body += "}";

  int code = http.POST(body);
  Serial.print("POST ");
  Serial.print(API_URL);
  Serial.print(" -> ");
  Serial.println(code);
  http.end();
}

void loop() {
  sensors.requestTemperatures();
  float temperature = sensors.getTempCByIndex(0);
  float ph = readPH();
  float turbidityNtu = readTurbidityNTU();
  float tds = readTDS();
  int waterLevel = analogRead(WATER_LEVEL_PIN);
  int mq135A0 = analogRead(MQ135_A0_PIN);
  int mq135D0 = digitalRead(MQ135_D0_PIN);

  // Serial print
  Serial.println("---");
  Serial.print("Temperature: "); Serial.print(temperature); Serial.println(" °C");
  Serial.print("pH: ");          Serial.println(ph);
  Serial.print("Turbidity: ");  Serial.print(turbidityNtu); Serial.println(" NTU");
  Serial.print("TDS: ");        Serial.print(tds); Serial.println(" ppm");
  Serial.print("Water Level: "); Serial.println(waterLevel);
  Serial.print("MQ135 A0: ");   Serial.print(mq135A0); Serial.print(" D0: "); Serial.println(mq135D0);

  // Threshold check -> SMS (works offline)
  bool alert = false;
  if (ph < PH_MIN || ph > PH_MAX) alert = true;
  if (turbidityNtu > TURBIDITY_MAX_NTU) alert = true;
  if (tds > TDS_MAX_PPM) alert = true;

  if (alert) {
    char smsBuf[160];
    snprintf(smsBuf, sizeof(smsBuf),
             "Water alert! pH=%.1f Turb=%.0f TDS=%.0f. Check tank/tap.",
             ph, turbidityNtu, tds);
    sendSMS(smsBuf);
  }

  // POST to FastAPI when Wi-Fi available (for website)
  postToServer(temperature, ph, turbidityNtu, tds, waterLevel);

  delay(5000);  // Every 5 seconds
}
