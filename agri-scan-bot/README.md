# AGRI-SCAN BOT
AI-based mobile robot for plant leaf disease detection.

A 4-wheel ESP32-CAM robot drives into the field, captures a leaf photo, and the app uses Google Gemini vision AI to identify the crop, tell if the leaf is healthy or diseased, and suggest what to do next. Results are shown in English, Marathi and Hindi.

## Photos
![Robot](images/robot.jpg)
![App result](images/app-result.png)

## Features
- Drive the robot from a web app (PWA) with a live camera stream
- One-tap leaf capture from the robot camera, or manual photo upload
- AI result: crop name, healthy/diseased, disease, severity, confidence, symptoms, advice
- Scan history and alerts
- Kisan AI assistant (ask farming questions)
- English, Marathi and Hindi

## Hardware
ESP32-CAM (AI Thinker), L298N motor driver, 4 DC geared motors, chassis, 2 x 3.7V Li-ion battery, jumper wires

## Wiring (ESP32-CAM to L298N)
| ESP32-CAM GPIO | L298N |
|---|---|
| 13 | IN1 (right motors) |
| 15 | IN2 (right motors) |
| 14 | IN3 (left motors) |
| 2 | IN4 (left motors) |
| 12 | ENA + ENB (speed) |
| GND | GND (common with battery) |

Battery 7.4V to L298N 12V and GND. Right motors on OUT1/OUT2, left motors on OUT3/OUT4.

## Tech stack
- Robot: ESP32-CAM, Arduino C++
- App: React, TypeScript, Vite, Tailwind CSS
- Server: Node.js, Express
- AI: Google Gemini API

## Project structure
- robot_car/robot_car.ino : ESP32-CAM robot code
- server/ : backend and AI code
- src/ : React app

## Robot setup
1. Open robot_car/robot_car.ino in Arduino IDE (ESP32 core 3.x).
2. Board: AI Thinker ESP32-CAM, Partition Scheme: Huge APP.
3. Set your WiFi name and password (homeSsid, homePass) in the code.
4. Upload, then open the Serial Monitor to see the robot IP.

## App setup
1. npm install
2. Copy .env.example to .env and add your GEMINI_API_KEY
3. npm run dev
4. Open http://localhost:3000
5. In the app, set the Robot URL to the robot IP.

## Notes
- This is a prototype. The AI gives decision support, not a final diagnosis. Always inspect the plant and field.
- The camera sensor (GC2145) does not output JPEG, so the firmware converts RGB565 to JPEG.
- The free Gemini API has daily limits.
- Built with help of AI tools and tested on real hardware.

## Future work
Offline model trained on PlantVillage, better camera (OV2640), buck converter for stable power, sensors and auto-navigation.