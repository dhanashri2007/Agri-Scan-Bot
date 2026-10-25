import {
  User,
  Farm,
  Robot,
  RobotTelemetry,
  RobotHealthReport,
  ScanRecord,
  AlertRecord,
  OperatingState,
  MovementState
} from '../src/types';

// In-Memory Database adhering to PostgreSQL schema
class Database {
  private users: Map<string, User> = new Map();
  private userPasswords: Map<string, string> = new Map();
  private farms: Map<string, Farm> = new Map();
  private robots: Map<string, Robot> = new Map();
  private telemetry: RobotTelemetry[] = [];
  private scans: Map<string, ScanRecord> = new Map();
  private alerts: Map<string, AlertRecord> = new Map();

  // Active Robot State
  public activeRobotId: string = 'ASB-ROBOT-001';
  public isRobotConnected: boolean = false;
  public currentMovementState: MovementState = 'Stop';
  public currentOperatingState: OperatingState = 'OFFLINE';
  public lastHeartbeatTime: string | null = null;
  public lastSuccessfulScanTime: string | null = null;

  // Real Hardware Telemetry (null when physical sensor telemetry has not been received)
  public liveBatteryPercentage: number | null = null;
  public liveVoltage: number | null = null;
  public liveWifiRssi: number | null = null;
  public liveTemperature: number | null = null; // null if no sensor equipped
  public liveCameraStatus: 'ready' | 'capturing' | 'error' | 'disconnected' = 'disconnected';
  public liveMotorStatus: 'idle' | 'running' | 'error' | 'disconnected' = 'disconnected';
  public recentErrors: Array<{ timestamp: string; source: 'ESP32' | 'ESP32-CAM' | 'Motor' | 'Backend' | 'AI'; message: string }> = [];

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    // Default farmer user
    const defaultUser: User = {
      id: 'usr-farmer-01',
      name: 'Ramesh Patil (रमेश पाटील)',
      mobile: '+91 98765 43210',
      email: 'ramesh.patil@agriscan.in',
      language: 'en',
      location: 'Nashik, Maharashtra',
      primaryCrop: 'Tomato',
      farmName: 'Sahyadri Agri Farm',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    };
    this.users.set(defaultUser.id, defaultUser);
    this.userPasswords.set(defaultUser.id, 'farmer123');

    // Default farms
    const farm1: Farm = {
      id: 'farm-01',
      userId: defaultUser.id,
      name: 'Sahyadri Agri Farm - Plot A (Tomato)',
      location: 'Nashik, Maharashtra',
      area: '3.5 Acres',
      crop: 'Tomato',
      plantingDate: '2026-06-15',
      harvestDate: '2026-10-20',
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    };
    const farm2: Farm = {
      id: 'farm-02',
      userId: defaultUser.id,
      name: 'Godavari Green Fields - Plot B (Cotton)',
      location: 'Aurangabad, Maharashtra',
      area: '5.0 Acres',
      crop: 'Cotton',
      plantingDate: '2026-05-20',
      harvestDate: '2026-11-10',
      createdAt: new Date(Date.now() - 50 * 86400000).toISOString(),
    };
    this.farms.set(farm1.id, farm1);
    this.farms.set(farm2.id, farm2);

    // Default robot registration
    const defaultRobot: Robot = {
      id: 'rob-001',
      robotId: 'ASB-ROBOT-001',
      userId: defaultUser.id,
      status: 'offline',
      firmwareVersion: 'ESP32-AGRI-v2.4.1-CAM',
      ipAddress: '192.168.1.145',
      lastSeen: new Date(Date.now() - 3600000).toISOString(),
      isSimulated: false,
    };
    this.robots.set(defaultRobot.robotId, defaultRobot);

    // Initial Scan Records (Realistic agronomic historical data)
    const scan1: ScanRecord = {
      id: 'SCN-20260908-001',
      userId: defaultUser.id,
      farmId: farm1.id,
      robotId: 'ASB-ROBOT-001',
      crop: 'Tomato',
      source: 'ROBOT',
      imagePath: 'https://images.unsplash.com/photo-1592417817098-8f3d69106093?auto=format&fit=crop&w=600&q=80',
      status: 'completed',
      healthStatus: 'Diseased',
      disease: 'Tomato Early Blight (Alternaria solani)',
      confidence: 0.91,
      severity: 'Moderate',
      affectedAreaPercentage: 14.5,
      symptoms: [
        'Concentric ring lesions (target spots) on mature leaves',
        'Chlorotic yellow halos surrounding necrotic brown patches',
        'Lower foliage wilting near stem nodes'
      ],
      aiExplanation: 'The leaf exhibiting concentric dark-brown rings characteristic of Alternaria solani fungus. Primary symptoms concentrated on mature lower leaves under humid conditions.',
      recommendedAction: 'Inspect the plant/field and verify the condition before treatment. Remove affected lower foliage to prevent spore dispersal. Avoid overhead sprinkler irrigation.',
      createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    };

    const scan2: ScanRecord = {
      id: 'SCN-20260909-002',
      userId: defaultUser.id,
      farmId: farm2.id,
      crop: 'Cotton',
      source: 'MANUAL',
      imagePath: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80',
      status: 'completed',
      healthStatus: 'Healthy',
      disease: 'None detected (Healthy Foliage)',
      confidence: 0.95,
      severity: 'Low',
      affectedAreaPercentage: 0,
      symptoms: [
        'Vibrant uniform green coloration',
        'Smooth leaf venation without chlorosis or necrosis',
        'No visible fungal or pest damage'
      ],
      aiExplanation: 'The foliage demonstrates optimal chlorophyll distribution, intact cuticle, and complete absence of pathogenic lesions or leaf curl vector infestation.',
      recommendedAction: 'Continue current scheduled irrigation and regular scouting. No remedial intervention needed.',
      createdAt: new Date(Date.now() - 18 * 3600000).toISOString(),
    };

    const scan3: ScanRecord = {
      id: 'SCN-20260910-003',
      userId: defaultUser.id,
      farmId: farm1.id,
      crop: 'Tomato',
      source: 'MANUAL',
      imagePath: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
      status: 'completed',
      healthStatus: 'Healthy',
      disease: 'None detected (Healthy Foliage)',
      confidence: 0.94,
      severity: 'Low',
      affectedAreaPercentage: 0,
      symptoms: [
        'Intact leaf margin and healthy green pigmentation',
        'Strong turgidity and leaf structure'
      ],
      aiExplanation: 'Normal healthy foliage structure. Leaf stomata and margins are intact.',
      recommendedAction: 'Maintain current agronomic practices and monitor soil moisture.',
      createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    };

    this.scans.set(scan1.id, scan1);
    this.scans.set(scan2.id, scan2);
    this.scans.set(scan3.id, scan3);
    this.lastSuccessfulScanTime = scan1.createdAt;

    // Initial Alerts
    const alert1: AlertRecord = {
      id: 'ALT-001',
      userId: defaultUser.id,
      scanId: scan1.id,
      type: 'Attention',
      title: 'Early Blight Detected in Tomato Plot A',
      message: 'Scan SCN-20260908-001 identified Moderate Early Blight. Field inspection recommended before disease spreads to adjacent rows.',
      crop: 'Tomato',
      disease: 'Tomato Early Blight',
      severity: 'Moderate',
      source: 'ROBOT',
      isRead: false,
      createdAt: scan1.createdAt,
    };
    this.alerts.set(alert1.id, alert1);
  }

  // Users
  getUser(id: string): User | undefined {
    return this.users.get(id);
  }
  findUserByMobileOrEmail(identifier: string): User | undefined {
    const clean = identifier.trim().toLowerCase().replace(/\s+/g, '');
    for (const user of this.users.values()) {
      const userMobileClean = user.mobile.replace(/\s+/g, '').toLowerCase();
      const userEmailClean = (user.email || '').trim().toLowerCase();
      if (
        userMobileClean === clean ||
        userMobileClean.endsWith(clean) ||
        clean.endsWith(userMobileClean) ||
        (userEmailClean && userEmailClean === clean)
      ) {
        return user;
      }
    }
    return undefined;
  }
  setPassword(userId: string, password: string): void {
    this.userPasswords.set(userId, password);
  }
  verifyPassword(userId: string, password: string): boolean {
    const stored = this.userPasswords.get(userId);
    if (!stored) return true;
    return stored === password;
  }
  saveUser(user: User): User {
    this.users.set(user.id, user);
    return user;
  }
  updateUser(id: string, updates: Partial<User>): User | undefined {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    const updated: User = { ...existing, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  // Farms
  getFarms(userId: string): Farm[] {
    return Array.from(this.farms.values()).filter((f) => f.userId === userId);
  }
  getFarm(id: string): Farm | undefined {
    return this.farms.get(id);
  }
  addFarm(farm: Farm): Farm {
    this.farms.set(farm.id, farm);
    return farm;
  }
  deleteFarm(id: string): boolean {
    return this.farms.delete(id);
  }

  // Robot
  getRobot(robotId: string): Robot | undefined {
    return this.robots.get(robotId);
  }
  updateRobotStatus(robotId: string, status: 'online' | 'offline' | 'connecting'): void {
    const rob = this.robots.get(robotId);
    if (rob) {
      rob.status = status;
      rob.lastSeen = new Date().toISOString();
      this.robots.set(robotId, rob);
    }
  }

  // Heartbeat & Telemetry
  recordHeartbeat(data: Partial<RobotTelemetry> & { robotId: string }): void {
    this.isRobotConnected = true;
    this.lastHeartbeatTime = new Date().toISOString();
    this.activeRobotId = data.robotId || this.activeRobotId;
    this.updateRobotStatus(this.activeRobotId, 'online');

    if (data.batteryPercentage !== undefined) this.liveBatteryPercentage = data.batteryPercentage;
    if (data.voltage !== undefined) this.liveVoltage = data.voltage;
    if (data.wifiSignalRssi !== undefined) this.liveWifiRssi = data.wifiSignalRssi;
    if (data.temperatureCelsius !== undefined) this.liveTemperature = data.temperatureCelsius;
    if (data.cameraStatus) this.liveCameraStatus = data.cameraStatus;
    if (data.motorStatus) this.liveMotorStatus = data.motorStatus;
    if (data.movementState) this.currentMovementState = data.movementState;
    if (data.operatingState) this.currentOperatingState = data.operatingState;
    else this.currentOperatingState = 'HEALTHY';

    const tel: RobotTelemetry = {
      id: 'tel-' + Date.now(),
      robotId: this.activeRobotId,
      batteryPercentage: this.liveBatteryPercentage,
      voltage: this.liveVoltage,
      wifiSignalRssi: this.liveWifiRssi,
      temperatureCelsius: this.liveTemperature,
      cameraStatus: this.liveCameraStatus,
      motorStatus: this.liveMotorStatus,
      movementState: this.currentMovementState,
      operatingState: this.currentOperatingState,
      errorCode: data.errorCode || null,
      timestamp: new Date().toISOString(),
    };
    this.telemetry.unshift(tel);
    if (this.telemetry.length > 50) this.telemetry.pop();
  }

  disconnectRobot(): void {
    this.isRobotConnected = false;
    this.currentOperatingState = 'OFFLINE';
    this.currentMovementState = 'Stop';
    this.liveCameraStatus = 'disconnected';
    this.liveMotorStatus = 'disconnected';
    this.updateRobotStatus(this.activeRobotId, 'offline');
  }

  getHealthReport(): RobotHealthReport {
    const isOnline = this.isRobotConnected;

    return {
      robotId: this.activeRobotId,
      overallStatus: isOnline ? this.currentOperatingState : 'OFFLINE',
      lastHeartbeat: this.lastHeartbeatTime,
      lastSuccessfulScan: this.lastSuccessfulScanTime,
      lastCommunication: this.lastHeartbeatTime || (this.robots.get(this.activeRobotId)?.lastSeen ?? null),
      subsystems: {
        connection: {
          name: 'Wi-Fi & Backend Communication',
          status: isOnline ? 'ok' : 'offline',
          summary: isOnline ? 'Online — ESP32 Connected via Wi-Fi' : 'Offline — Robot not communicating',
          details: isOnline
            ? `IP: ${this.robots.get(this.activeRobotId)?.ipAddress || '192.168.1.145'} | RSSI: ${this.liveWifiRssi ? this.liveWifiRssi + ' dBm' : 'Telemetry unavailable'}`
            : 'Check power switch and Wi-Fi hotspot credentials.',
          lastChecked: new Date().toISOString(),
        },
        battery: {
          name: 'Battery & Power System',
          status: isOnline
            ? this.liveBatteryPercentage !== null
              ? this.liveBatteryPercentage < 20
                ? 'warning'
                : 'ok'
              : 'unavailable'
            : 'offline',
          summary: isOnline
            ? this.liveBatteryPercentage !== null
              ? `${this.liveBatteryPercentage}% (${this.liveVoltage ? this.liveVoltage + 'V' : ''})`
              : 'Battery telemetry unavailable'
            : 'Offline',
          details:
            this.liveBatteryPercentage !== null
              ? `Voltage: ${this.liveVoltage ? this.liveVoltage + 'V' : 'N/A'}`
              : 'Dedicated voltage divider / ADC sensor not transmitting.',
          lastChecked: new Date().toISOString(),
        },
        esp32: {
          name: 'ESP32 Main MCU Controller',
          status: isOnline ? 'ok' : 'offline',
          summary: isOnline ? 'Connected — MCU Heartbeat Active' : 'Disconnected',
          details: `Firmware: ${this.robots.get(this.activeRobotId)?.firmwareVersion || 'ESP32-AGRI-v2.4.1'}`,
          lastChecked: new Date().toISOString(),
        },
        esp32Cam: {
          name: 'ESP32-CAM Vision Module',
          status: isOnline
            ? this.liveCameraStatus === 'ready'
              ? 'ok'
              : this.liveCameraStatus === 'error'
              ? 'error'
              : 'warning'
            : 'offline',
          summary: isOnline ? `Camera ${this.liveCameraStatus}` : 'Camera Disconnected',
          details: isOnline ? 'OV2640 Sensor Ready for Leaf Capture' : 'Waiting for camera stream handshake.',
          lastChecked: new Date().toISOString(),
        },
        motorSystem: {
          name: '4WD Motor System & Driver (L298N)',
          status: isOnline ? 'ok' : 'offline',
          summary: isOnline ? `Driver Active — State: ${this.currentMovementState}` : 'Motors Offline',
          details: isOnline ? '4 x DC Geared Motors responding to PWM command bus.' : 'H-Bridge driver de-energized.',
          lastChecked: new Date().toISOString(),
        },
        wifi: {
          name: 'Field Wireless Signal',
          status: isOnline ? (this.liveWifiRssi && this.liveWifiRssi < -80 ? 'warning' : 'ok') : 'offline',
          summary: isOnline
            ? this.liveWifiRssi !== null
              ? `${this.liveWifiRssi} dBm (RSSI)`
              : 'Connected (RSSI telemetry unavailable)'
            : 'Disconnected',
          details: isOnline ? 'Connected to agricultural field hotspot.' : 'No carrier signal.',
          lastChecked: new Date().toISOString(),
        },
        temperature: {
          name: 'Chassis Temperature Sensor',
          status: 'unavailable',
          summary: 'Temperature sensor not available',
          details: 'DS18B20 / DHT sensor not installed on this hardware chassis.',
          lastChecked: new Date().toISOString(),
        },
      },
      recentErrors: this.recentErrors,
    };
  }

  // Scans
  getAllScans(userId: string): ScanRecord[] {
    return Array.from(this.scans.values())
      .filter((s) => s.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  getScan(id: string): ScanRecord | undefined {
    return this.scans.get(id);
  }
  saveScan(scan: ScanRecord): ScanRecord {
    this.scans.set(scan.id, scan);
    if (scan.status === 'completed') {
      this.lastSuccessfulScanTime = scan.createdAt;
    }
    return scan;
  }
  deleteScan(id: string): boolean {
    return this.scans.delete(id);
  }

  // Alerts
  getAllAlerts(userId: string): AlertRecord[] {
    return Array.from(this.alerts.values())
      .filter((a) => a.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  saveAlert(alert: AlertRecord): AlertRecord {
    this.alerts.set(alert.id, alert);
    return alert;
  }
  markAlertAsRead(id: string): boolean {
    const al = this.alerts.get(id);
    if (al) {
      al.isRead = true;
      this.alerts.set(id, al);
      return true;
    }
    return false;
  }
  deleteAlert(id: string): boolean {
    return this.alerts.delete(id);
  }
}

export const db = new Database();
