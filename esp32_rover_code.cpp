/**
 * ===============================================
 * ESP32 - ROBOT TRANSPORTADOR UNIVERSITARIO v3.2 (Firebase Edition)
 * ===============================================
 * Conecta el robot a Firebase para ser controlado por la aplicación web RoverView.
 * ===============================================
 * Autor: zenkig7 (Modificado por Firebase Studio AI)
 * Fecha: 2025-09-02
 * Universidad Autónoma - Proyecto Integrador
 * ===============================================
 */

// --- 1. INCLUIR BIBLIOTECAS ---
#include <WiFi.h>
#include <HardwareSerial.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// --- 2. CONFIGURACIÓN DE FIREBASE Y WIFI ---
// Reemplaza con los datos de tu red WiFi
#define WIFI_SSID "MINA_wifi_2.4G"
#define WIFI_PASSWORD "Lacapital.12"

// Datos del proyecto de Firebase (de la app RoverView)
#define API_KEY "AIzaSyDZ3Ha4VyFPfS8pi8DXELFeJ-_ESUgX4CI"
#define DATABASE_URL "https://roverview-bie3m-default-rtdb.firebaseio.com" 

// --- 3. CONFIGURACIÓN DE PINES ---
#define GPS_RX_PIN      16
#define GPS_TX_PIN      17
#define GPS_BAUD_RATE   9600

#define ARDUINO_RX_PIN  2
#define ARDUINO_TX_PIN  4
#define ARDUINO_BAUD    9600

#define LED_PIN         2
#define SERIAL_BAUD     115200

// --- 4. OBJETOS GLOBALES ---
HardwareSerial gpsSerial(1);
HardwareSerial arduinoSerial(2);

// Objetos de Firebase
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Timers y Banderas
unsigned long lastStatusUpdateMillis = 0;
unsigned long lastGPSUpdate = 0;
bool firebase_ready = false;
String currentIP = "";

// --- 5. ESTRUCTURAS DE DATOS ---
struct SystemStatus {
    float batteryVoltage = 12.1;
    int batteryPercentage = 85;
    double latitude = 25.9231526; // Coordenadas Base
    double longitude = -97.5892535;
    float altitude = 10.0;
    bool gpsValid = false;
    int gpsSatellites = 0;
    bool arduinoConnected = false;
    bool emergencyStop = false;
} robotStatus;

// --- 6. DECLARACIÓN DE FUNCIONES ---
// Inicialización
void printSystemHeader();
void setupWiFi();
void setupFirebase();
void initializeHardware();
void testCommunications();

// Tareas del Loop
void processGPSData();
void processArduinoComm();
void sendStatusToFirebase();

// Callbacks de Firebase
void streamCallback(FirebaseStream data);
void streamTimeoutCallback(bool timeout);

// Control del Robot
void handleCommand(String command, FirebaseJson &params);
void sendArduinoCommand(String command);

// GPS
void parseGPGGA(String sentence);
double convertToDecimalDegrees(String coordinate, String direction);


// ======================= 7. FUNCIÓN DE CONFIGURACIÓN (SETUP) =======================
void setup() {
    Serial.begin(SERIAL_BAUD);
    delay(2000);

    printSystemHeader();
    initializeHardware();
    setupWiFi();
    setupFirebase();
    
    Serial.println("\n🚀 SISTEMA COMPLETAMENTE INICIALIZADO");
    Serial.println(String('=').substring(0, 70));
}

// ======================= 8. BUCLE PRINCIPAL (LOOP) =======================
void loop() {
    if (Firebase.ready()) {
        processGPSData();
        processArduinoComm();

        // Enviar estado a Firebase cada 5 segundos
        if (millis() - lastStatusUpdateMillis > 5000) {
            sendStatusToFirebase();
            lastStatusUpdateMillis = millis();
        }
    } else {
        if (!firebase_ready) {
            Serial.println("Firebase no está listo. Reintentando...");
            setupFirebase(); // Intenta reconectar
            delay(5000);
        }
    }
    delay(50);
}


// ======================= 9. IMPLEMENTACIÓN DE FUNCIONES =======================

// --- INICIALIZACIÓN ---

void printSystemHeader() {
    Serial.println("\n" + String('=').substring(0, 70));
    Serial.println("🤖 ROBOT TRANSPORTADOR UNIVERSITARIO v3.2 - Firebase Edition");
    Serial.println("👨‍💻 Desarrollado por: zenkig7 (Modificado por Firebase Studio)");
    Serial.println("🔗 Conectado a la aplicación web RoverView");
    Serial.println(String('=').substring(0, 70));
}

void initializeHardware() {
    Serial.println("🔌 Inicializando hardware de comunicación...");
    gpsSerial.begin(GPS_BAUD_RATE, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
    Serial.println("✅ GPS UART1 - RX:" + String(GPS_RX_PIN) + ", TX:" + String(GPS_TX_PIN));
    
    arduinoSerial.begin(ARDUINO_BAUD, SERIAL_8N1, ARDUINO_RX_PIN, ARDUINO_TX_PIN);
    Serial.println("✅ Arduino UART2 - RX:" + String(ARDUINO_RX_PIN) + ", TX:" + String(ARDUINO_TX_PIN));
    
    delay(1000);
    testCommunications();
    Serial.println("🚀 Hardware de comunicación inicializado");
}

void testCommunications() {
    Serial.println("\n🧪 Probando comunicación con Arduino...");
    sendArduinoCommand("PING:ESP32_INIT");
    delay(2000);
    if (arduinoSerial.available()) {
        String response = arduinoSerial.readStringUntil('\n');
        response.trim();
        Serial.println("✅ Arduino respondió: " + response);
        robotStatus.arduinoConnected = true;
    } else {
        Serial.println("❌ Arduino no respondió. Verifica la conexión.");
        robotStatus.arduinoConnected = false;
    }
    Serial.println("🏁 Tests de comunicación completados\n");
}


void setupWiFi() {
    Serial.println("🌐 Inicializando conectividad WiFi...");
    Serial.println("📡 Red objetivo: " + String(WIFI_SSID));

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.print("🔄 Conectando");

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        Serial.print(".");
        delay(500);
        attempts++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        currentIP = WiFi.localIP().toString();
        Serial.println("\n✅ WiFi CONECTADO!");
        Serial.println("   IP Address: " + currentIP);
    } else {
        Serial.println("\n❌ No se pudo conectar al WiFi. Reiniciando en 10s...");
        delay(10000);
        ESP.restart();
    }
}

void setupFirebase() {
    Serial.println("🔥 Configurando Firebase...");
    config.api_key = API_KEY;
    config.database_url = DATABASE_URL;

    // Asignar los callbacks para el stream de datos de comandos
    fbdo.setResponseSize(1024);
    config.timeout.serverResponse = 10 * 1000;

    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);

    // Iniciar el listener de comandos
    if (!Firebase.RTDB.beginStream(&fbdo, "robot/commands/latest")) {
        Serial.println("   ------------------------------------");
        Serial.println("   Error al iniciar el stream de Firebase.");
        Serial.println("   REASON: " + fbdo.errorReason());
        Serial.println("   ------------------------------------");
        firebase_ready = false;
    } else {
        Serial.println("   ------------------------------------");
        Serial.println("   Firebase listo. Escuchando comandos en 'robot/commands/latest'");
        Serial.println("   ------------------------------------");
        firebase_ready = true;
        Firebase.RTDB.setStreamCallback(&fbdo, streamCallback, streamTimeoutCallback);
    }
}


// --- TAREAS DEL LOOP ---

void sendStatusToFirebase() {
    if (!firebase_ready) return;
    
    FirebaseJson statusJson;
    statusJson.set("battery", robotStatus.batteryPercentage);
    statusJson.set("signal", WiFi.RSSI()); // Usamos la señal WiFi como indicador
    statusJson.set("gps/lat", robotStatus.latitude);
    statusJson.set("gps/lng", robotStatus.longitude);
    statusJson.set("gps/valid", robotStatus.gpsValid);
    statusJson.set("arduinoConnected", robotStatus.arduinoConnected);
    statusJson.set("emergencyStop", robotStatus.emergencyStop);
    statusJson.set("lastUpdate/.sv", "timestamp"); // Timestamp del servidor

    // Serial.println("📤 Enviando estado a Firebase...");
    if (!Firebase.RTDB.setJSON(&fbdo, "robot/status", &statusJson)) {
        Serial.println("   ❌ Error al enviar estado a Firebase: " + fbdo.errorReason());
    }
}


void processGPSData() {
    while (gpsSerial.available()) {
        String sentence = gpsSerial.readStringUntil('\n');
        sentence.trim();
        if (sentence.startsWith("$GPGGA") || sentence.startsWith("$GNGGA")) {
            parseGPGGA(sentence);
            lastGPSUpdate = millis();
        }
    }
    if (millis() - lastGPSUpdate > 15000 && lastGPSUpdate > 0) {
        robotStatus.gpsValid = false;
    }
}

void processArduinoComm() {
    while (arduinoSerial.available()) {
        String message = arduinoSerial.readStringUntil('\n');
        message.trim();
        if (message.length() > 0) {
            Serial.println("📨 Arduino: " + message);
            if (message.startsWith("STATUS:BATTERY:")) {
                robotStatus.batteryPercentage = message.substring(15).toInt();
            } else if (message.startsWith("PONG:")) {
                robotStatus.arduinoConnected = true;
            }
        }
    }
}


// --- CALLBACKS DE FIREBASE ---

void streamCallback(FirebaseStream data) {
    Serial.println("\n⬇️ ¡Nuevo comando recibido de Firebase!");

    if (data.dataTypeEnum() == fb_esp_rtdb_data_type_json) {
        FirebaseJson *json = data.to<FirebaseJson *>();
        
        FirebaseJsonData result;
        String command;
        FirebaseJson params;

        json->get(result, "command");
        if (result.success) {
            command = result.to<String>();
        }

        json->get(result, "params");
        if (result.success) {
            result.get<FirebaseJson>(params);
        }
        
        handleCommand(command, params);

    } else {
        Serial.println("   Tipo de dato no esperado: " + data.dataType());
    }
}

void streamTimeoutCallback(bool timeout) {
    if (timeout) {
        Serial.println("❗️ Stream de Firebase agotado! Intentando reconectar...");
        // La biblioteca intentará reconectar automáticamente. 
        // Si falla, se podría forzar un reinicio.
        firebase_ready = false;
    }
}


// --- CONTROL DEL ROBOT ---

void handleCommand(String command, FirebaseJson &params) {
    Serial.printf("   Procesando comando: '%s'\n", command.c_str());
    robotStatus.emergencyStop = false;

    if (command == "start") {
        sendArduinoCommand("MOVE:FORWARD:150");
    } else if (command == "stop") {
        sendArduinoCommand("STOP");
    } else if (command == "emergency_stop") {
        robotStatus.emergencyStop = true;
        sendArduinoCommand("STOP");
    } else if (command == "return_to_base") {
        // Lógica para volver a la base (se puede implementar con waypoints)
        // Por ahora, solo se detiene
        sendArduinoCommand("STOP"); 
    } else if (command == "follow_route") {
        FirebaseJsonData result;
        params.get(result, "path");
        if(result.success){
            Serial.println("   Recibida una ruta. La lógica de seguimiento de ruta aún no está implementada.");
            // Aquí iría la lógica para seguir una secuencia de puntos de la ruta
            // Por ejemplo, guardar el array de puntos y navegar uno por uno.
            sendArduinoCommand("MOVE:FORWARD:120"); // Inicia movimiento como demostración
        }
    } else if (command == "go_to_destination") {
        FirebaseJsonData result;
        float lat, lng;
        params.get(result, "lat");
        if(result.success) lat = result.to<float>();
        params.get(result, "lng");
        if(result.success) lng = result.to<float>();
        
        Serial.printf("   Navegando a destino -> Lat: %f, Lng: %f\n", lat, lng);
        Serial.println("   La navegación autónoma aún no está implementada.");
        // Aquí iría la lógica para la navegación autónoma hacia el punto (lat, lng)
        sendArduinoCommand("MOVE:FORWARD:120"); // Inicia movimiento como demostración
    } else {
        Serial.println("   Comando no reconocido.");
    }
}

void sendArduinoCommand(String command) {
    arduinoSerial.println(command);
    Serial.println("   📤 → Arduino: " + command);
}


// --- GPS ---

void parseGPGGA(String sentence) {
    int indices[15];
    int count = 0;
    for (int i = 0; i < sentence.length() && count < 15; i++) {
        if (sentence.charAt(i) == ',') indices[count++] = i;
    }

    if (count >= 7) {
        String latStr = sentence.substring(indices[1] + 1, indices[2]);
        String latDir = sentence.substring(indices[2] + 1, indices[3]);
        String lonStr = sentence.substring(indices[3] + 1, indices[4]);
        String lonDir = sentence.substring(indices[4] + 1, indices[5]);
        int fixQuality = sentence.substring(indices[5] + 1, indices[6]).toInt();
        
        robotStatus.gpsSatellites = sentence.substring(indices[6] + 1, indices[7]).toInt();
        
        if (fixQuality > 0 && latStr.length() > 0 && lonStr.length() > 0) {
            robotStatus.latitude = convertToDecimalDegrees(latStr, latDir);
            robotStatus.longitude = convertToDecimalDegrees(lonStr, lonDir);
            robotStatus.gpsValid = true;
        } else {
            robotStatus.gpsValid = false;
        }
    }
}

double convertToDecimalDegrees(String coordinate, String direction) {
    if (coordinate.length() < 4) return 0.0;
    int dotIndex = coordinate.indexOf('.');
    if (dotIndex < 0) return 0.0;
    
    double degrees = coordinate.substring(0, dotIndex - 2).toDouble();
    double minutes = coordinate.substring(dotIndex - 2).toDouble();
    double decimal = degrees + (minutes / 60.0);
    
    if (direction == "S" || direction == "W") {
        decimal = -decimal;
    }
    return decimal;
}
