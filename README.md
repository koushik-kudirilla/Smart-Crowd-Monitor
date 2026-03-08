# Smart-Crowd-Monitor
An **IoT-based Smart Crowd Monitoring System** designed to monitor the number of people in a specific area and evaluate environmental comfort conditions in real time.
The system uses **IR sensors to count entries and exits**, **DHT11 to measure temperature and humidity**, and publishes data to the cloud via **MQTT** for monitoring through a web dashboard.

This project helps authorities manage **crowd density, safety, and environmental comfort** in public spaces such as parks, tourist locations, and campuses.

---

## Project Objective

The goal of this project is to build a **smart monitoring system** that:

* Counts people entering and exiting an area
* Tracks environmental conditions
* Determines safety or comfort levels based on crowd and weather
* Sends real-time data to a cloud dashboard
* Helps prevent overcrowding and improve public safety

---

## Key Features

* Real-time **people counting system**
* **Bidirectional entry and exit detection**
* **Temperature and humidity monitoring**
* **Comfort level calculation based on crowd and environment**
* **OLED display for live status**
* **Cloud monitoring using MQTT**
* **Web dashboard visualization**

---

## System Architecture

Sensor Layer → Microcontroller → MQTT Cloud Broker → Web Dashboard

1. **IR Sensors** detect people entering and exiting.
2. **Arduino** processes the sensor data.
3. **DHT11 Sensor** measures environmental conditions.
4. **OLED Display** shows live information.
5. **WiFi Module** sends data to MQTT broker.
6. **Web Dashboard** visualizes crowd density and environmental comfort.

---

## Hardware Components

* Arduino board (Uno / Nano / WiFi board)
* 2 × IR proximity sensors
* DHT11 temperature and humidity sensor
* OLED display (SSD1306)
* WiFi module (ESP8266 or built-in WiFi)
* Breadboard and jumper wires
* Power supply

---

## Software Technologies

* Arduino IDE
* C/C++ for embedded programming
* MQTT Protocol
* HiveMQ public broker
* HTML / CSS / JavaScript dashboard
* GitHub for project hosting

---

## Working Principle

1. Two **IR sensors are placed at the entrance gate**.
2. When a person crosses **IR1 then IR2**, it is counted as **entry**.
3. When a person crosses **IR2 then IR1**, it is counted as **exit**.
4. The system continuously updates the **current crowd count**.
5. The **DHT11 sensor measures temperature and humidity**.
6. A **comfort level score** is calculated based on crowd density and environmental conditions.
7. Data is displayed locally on the **OLED screen** and published to **MQTT cloud**.
8. The **web dashboard visualizes the data in real time**.

---

## Comfort Level Logic

Comfort level is calculated using:

* Crowd density
* Temperature
* Humidity

Example logic:

* High crowd + high temperature → **Overcrowding Risk**
* Moderate crowd + comfortable weather → **Safe**
* Low crowd + normal temperature → **Comfortable**

---

## Applications

* Smart tourist location monitoring
* Public park crowd management
* Event venue monitoring
* Campus safety systems
* Smart city infrastructure

---

## Future Improvements

* AI-based crowd prediction
* Mobile application integration
* Automatic alerts to authorities
* Integration with surveillance cameras
* Edge AI analytics for crowd behavior

---

## Project Demonstration

Example dashboard shows:

* Live crowd count
* Temperature and humidity
* Comfort level indicator
* Overcrowding alerts

---

## Author

**Koushik Kudirilla**

Software Developer | IoT Enthusiast

---

## License

This project is licensed under the **MIT License**.
You are free to use, modify, and distribute the code with attribution.
