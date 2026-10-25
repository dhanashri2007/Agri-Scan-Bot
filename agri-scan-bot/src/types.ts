export type Language = 'en' | 'hi' | 'mr';

export type AppTheme = 'dark' | 'light' | 'medium' | 'forest';

export type OperatingState = 'HEALTHY' | 'WARNING' | 'OFFLINE' | 'ERROR' | 'SCANNING' | 'ANALYZING';

export type MovementState = 'Forward' | 'Reverse' | 'Left' | 'Right' | 'Stop' | 'Unknown';

export interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  language: Language;
  location?: string;
  primaryCrop?: string;
  farmName?: string;
  isDemo?: boolean;
  createdAt: string;
}

export interface FarmRecord {
  id: string;
  userId?: string;
  name: string;
  location: string;
  crop: string;
  area: string;
  plantingDate?: string;
  harvestDate?: string;
  robotId?: string;
  createdAt: string;
}

export type Farm = FarmRecord;

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  createdAt: string;
}

export interface GovtScheme {
  id: string;
  title?: string;
  name?: string;
  nameHindi?: string;
  nameMarathi?: string;
  category: string;
  description: string;
  benefit?: string;
  benefits?: string;
  eligibility: string;
  documentsRequired?: string[];
  requiredDocuments?: string[];
  officialLink?: string;
  officialPortalUrl?: string;
}

export type GovernmentScheme = GovtScheme;

export interface Robot {
  id: string;
  robotId: string; // e.g. "ASB-ROBOT-001"
  userId: string;
  status: 'online' | 'offline' | 'connecting';
  firmwareVersion?: string;
  ipAddress?: string;
  lastSeen?: string;
  isSimulated?: boolean;
}

export interface RobotTelemetry {
  id: string;
  robotId: string;
  batteryPercentage?: number | null; // null if sensor not equipped
  voltage?: number | null; // null if sensor not equipped
  isCharging?: boolean | null;
  wifiSignalRssi?: number | null; // null if unavailable
  ipAddress?: string | null;
  temperatureCelsius?: number | null; // null if temp sensor not equipped
  cameraStatus: 'ready' | 'capturing' | 'error' | 'disconnected';
  motorStatus: 'idle' | 'running' | 'error' | 'disconnected';
  movementState: MovementState;
  operatingState: OperatingState;
  errorCode?: string | null;
  timestamp: string;
}

export interface RobotHealthSubsystem {
  name: string;
  status: 'ok' | 'warning' | 'error' | 'offline' | 'unavailable';
  summary: string;
  details?: string;
  lastChecked: string;
}

export interface RobotHealthReport {
  robotId: string;
  overallStatus: OperatingState;
  lastHeartbeat: string | null;
  lastSuccessfulScan: string | null;
  lastCommunication: string | null;
  subsystems: {
    connection: RobotHealthSubsystem;
    battery: RobotHealthSubsystem;
    esp32: RobotHealthSubsystem;
    esp32Cam: RobotHealthSubsystem;
    motorSystem: RobotHealthSubsystem;
    wifi: RobotHealthSubsystem;
    temperature: RobotHealthSubsystem;
  };
  recentErrors: Array<{
    timestamp: string;
    source: 'ESP32' | 'ESP32-CAM' | 'Motor' | 'Backend' | 'AI';
    message: string;
  }>;
}

export interface ScanRecord {
  id: string;
  userId: string;
  farmId?: string;
  robotId?: string;
  crop: string;
  source: 'ROBOT' | 'MANUAL' | 'Robot Camera' | 'Manual Upload' | string;
  imagePath: string; // URL or base64
  status: 'completed' | 'processing' | 'failed';
  healthStatus?: 'Healthy' | 'Diseased' | 'Uncertain';
  disease?: string;
  confidence?: number | null; // Only if calibrated, else null
  severity?: 'Low' | 'Moderate' | 'High' | null;
  affectedAreaPercentage?: number | null; // Only if computed
  symptoms?: string[];
  aiExplanation?: string;
  recommendedAction?: string;
  createdAt: string;
}

export interface AlertRecord {
  id: string;
  userId: string;
  scanId?: string;
  type: 'Critical' | 'Attention' | 'Healthy' | 'System';
  title: string;
  message: string;
  crop?: string;
  disease?: string;
  severity?: 'Low' | 'Moderate' | 'High' | null;
  source: 'ROBOT' | 'MANUAL' | 'SYSTEM' | 'Robot Camera' | 'Manual Upload' | string;
  isRead: boolean;
  createdAt: string;
}

export interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  rainProbability?: number;
  source: string;
  timestamp: string;
  isConnected?: boolean;
}
