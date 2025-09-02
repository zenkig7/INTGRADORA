/**
 * @file esp32_rover_code.cpp
 * @author Tu Nombre
 * @brief Código para un robot basado en ESP32 que se conecta a Firebase para control remoto.
 * @version 0.1
 * @date 2023-10-27
 *
 * @copyright Copyright (c) 2023
 *
 */

// --- 1. INCLUIR BIBLIOTECAS ---
#include <Arduino.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h" // Para la autenticación
#include "addons/RTDBHelper.h" // Para la Realtime Database

// --- 2. CONFIGURACIÓN DE WIFI Y FIREBASE ---
// Reemplaza con los datos de tu red WiFi
#define WIFI_SSID "TU_NOMBRE_DE_WIFI"
#define WIFI_PASSWORD "TU_CONTRASEÑA_DE_WIFI"

// Reemplaza con los datos de tu proyecto de Firebase
#define API_KEY "AIzaSyDZ3Ha4VyFPfS8pi8DXELFeJ-_ESUgX4CI" // Es la misma que en tu app web
#define DATABASE_URL "https://roverview-bie3m-default-rtdb.firebaseio.com" // Asegúrate que sea la URL de tu Realtime Database

// --- 3. OBJETOS GLOBALES DE FIREBASE ---
FirebaseData fbdo; // Objeto para las operaciones de Firebase
FirebaseAuth auth; // Objeto para la autenticación
FirebaseConfig config; // Objeto para la configuración

// Variable para saber si estamos conectados a Firebase
bool firebase_ready = false;
unsigned long sendDataPrevMillis = 0;

// --- 4. DECLARACIÓN DE FUNCIONES ---
void streamCallback(FirebaseStream data);
void streamTimeoutCallback(bool timeout);
void setupWiFi();
void setupFirebase();
void handleCommand(String command, FirebaseJson &params);

// --- CÓDIGO DE CONTROL DEL ROBOT (Aquí pones tu lógica) ---
void moveForward() { Serial.println("Robot: Moviendo hacia adelante"); }
void moveStop() { Serial.println("Robot: Deteniendo motores"); }
void returnToBase() { Serial.println("Robot: Regresando a la base"); }
void emergencyStop() { Serial.println("Robot: PARADA DE EMERGENCIA"); }
void followPath(FirebaseJsonArray &path) {
    Serial.println("Robot: Siguiendo ruta...");
    for (size_t i = 0; i < path.size(); i++) {
        FirebaseJsonData point;
        path.get(point, i);
        Serial.printf("  - Punto %d: Lat: %s, Lng: %s\n", i + 1, point.to<String>().c_str(), point.to<String>().c_str());
    }
}
void goToDestination(float lat, float lng){
    Serial.printf("Robot: Yendo a destino -> Lat: %f, Lng: %f\n", lat, lng);
}


// --- 5. FUNCIÓN DE CONFIGURACIÓN (SETUP) ---
void setup() {
  Serial.begin(115200);
  Serial.println();
  Serial.println("====================================");
  Serial.println("     INICIANDO ROBOT ROVERVIEW     ");
  Serial.println("====================================");

  setupWiFi();
  setupFirebase();
}

// --- 6. BUCLE PRINCIPAL (LOOP) ---
void loop() {
  // Mantener la conexión con Firebase
  if (firebase_ready && Firebase.ready()) {
    // Escucha por comandos y actualiza el estado
  } else if (!firebase_ready) {
      Serial.println("Firebase no está listo. Reintentando...");
      setupFirebase(); // Intenta reconectar
      delay(5000);
  }

  // Ejemplo: Enviar datos de estado cada 10 segundos
  if (millis() - sendDataPrevMillis > 10000 && firebase_ready) {
      sendDataPrevMillis = millis();
      float fake_battery = random(80, 100);
      Serial.printf("Enviando estado a Firebase: Batería = %f\n", fake_battery);
      // La ruta para actualizar el estado, ej: "robot/status/battery"
      Firebase.RTDB.setFloat(&fbdo, "robot/status/battery", fake_battery);
  }
}

// --- 7. IMPLEMENTACIÓN DE FUNCIONES ---

/**
 * @brief Configura y conecta el ESP32 a la red WiFi.
 */
void setupWiFi() {
  Serial.print("Conectando a WiFi: ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println();
  Serial.print("WiFi Conectado. IP: ");
  Serial.println(WiFi.localIP());
}

/**
 * @brief Configura la conexión con Firebase y establece el listener de comandos.
 */
void setupFirebase() {
  Serial.println("Configurando Firebase...");
  // Asignar la clave de la API
  config.api_key = API_KEY;
  // Asignar la URL de la base de datos
  config.database_url = DATABASE_URL;

  // Asignar los callbacks para el stream de datos
  config.stream_data_changed_callback = streamCallback;
  config.stream_timeout_callback = streamTimeoutCallback;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // Iniciar el "stream" para escuchar cambios en la ruta de comandos
  // Esto es un listener que se ejecuta cada vez que hay un dato nuevo en "robot/commands/latest"
  if (!Firebase.RTDB.beginStream(&fbdo, "robot/commands/latest")) {
    Serial.println("------------------------------------");
    Serial.println("Error al iniciar el stream de Firebase.");
    Serial.println("REASON: " + fbdo.errorReason());
    Serial.println("------------------------------------");
    firebase_ready = false;
  } else {
    Serial.println("------------------------------------");
    Serial.println("Firebase listo. Escuchando comandos...");
    Serial.println("------------------------------------");
    firebase_ready = true;
  }
}

/**
 * @brief Callback que se ejecuta cuando llegan nuevos datos desde Firebase.
 */
void streamCallback(FirebaseStream data) {
  Serial.println("\n¡Nuevo comando recibido!");
  Serial.printf("Ruta del Stream: %s\n", data.streamPath().c_str());
  Serial.printf("Tipo de dato: %s\n", data.dataType().c_str());

  if (data.dataTypeEnum() == fb_esp_rtdb_data_type_json) {
    FirebaseJson *json = data.to<FirebaseJson *>();
    // Serial.println(json->raw()); // Descomenta para ver el JSON crudo

    FirebaseJsonData result;
    String command;
    FirebaseJson params;

    json->get(result, "command");
    if (result.success) {
      command = result.to<String>();
    }

    json->get(result, "params");
    if (result.success) {
      params = result.to<FirebaseJson>();
    }
    
    handleCommand(command, params);
  }
}

/**
 * @brief Callback que se ejecuta si el stream de Firebase se desconecta.
 */
void streamTimeoutCallback(bool timeout) {
  if (timeout) {
    Serial.println("¡Stream de Firebase agotado! Reiniciando...");
    setupFirebase(); // Intenta reconectar
  }
}


/**
 * @brief Procesa el comando recibido y ejecuta la acción correspondiente.
 */
void handleCommand(String command, FirebaseJson &params) {
    Serial.printf("Comando: '%s'\n", command.c_str());
    
    if (command == "start") {
        moveForward();
    } else if (command == "stop") {
        moveStop();
    } else if (command == "emergency_stop") {
        emergencyStop();
    } else if (command == "return_to_base") {
        returnToBase();
    } else if (command == "follow_route") {
        FirebaseJsonData result;
        params.get(result, "path");
        if(result.success){
            FirebaseJsonArray &arr = result.to<FirebaseJsonArray>();
            followPath(arr);
        }
    } else if (command == "go_to_destination") {
        FirebaseJsonData result;
        float lat, lng;
        params.get(result, "lat");
        if(result.success) lat = result.to<float>();
        params.get(result, "lng");
        if(result.success) lng = result.to<float>();

        goToDestination(lat, lng);
    } else {
        Serial.println("Comando no reconocido.");
    }
}
