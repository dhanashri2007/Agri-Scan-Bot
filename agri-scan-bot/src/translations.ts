import { Language } from './types';

export interface Translations {
  appName: string;
  appSubtitle: string;
  nav: {
    dashboard: string;
    scan: string;
    robotControl: string;
    robotHealth: string;
    history: string;
    alerts: string;
    crops: string;
    farm: string;
    assistant: string;
    schemes: string;
    help: string;
    settings: string;
  };
  common: {
    online: string;
    offline: string;
    connecting: string;
    connected: string;
    disconnected: string;
    healthy: string;
    warning: string;
    error: string;
    scanning: string;
    analyzing: string;
    notAvailable: string;
    waitingForData: string;
    serviceNotConnected: string;
    insufficientData: string;
    emergencyStop: string;
    forward: string;
    reverse: string;
    left: string;
    right: string;
    stop: string;
    save: string;
    cancel: string;
    close: string;
    retry: string;
    viewDetails: string;
    installApp: string;
    installOnIOS: string;
    demoMode: string;
    logout: string;
    lastSeen: string;
    refresh: string;
    speed: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    farmOverview: string;
    totalScans: string;
    healthyScans: string;
    diseasedScans: string;
    recentAlerts: string;
    activeRobot: string;
    lastScanTime: string;
    robotQuickStatus: string;
    quickActions: string;
    startScan: string;
    connectRobot: string;
    uploadLeaf: string;
    viewHistory: string;
    checkHealth: string;
    weatherWidget: string;
  };
  robot: {
    controlTitle: string;
    controlSubtitle: string;
    healthTitle: string;
    healthSubtitle: string;
    connectionStatus: string;
    batteryStatus: string;
    esp32Status: string;
    esp32CamStatus: string;
    motorStatus: string;
    wifiStatus: string;
    tempStatus: string;
    errorMonitor: string;
    lastHealthCheck: string;
    offlineCommandWarning: string;
    emergencyStopConfirmed: string;
    connectRobotBtn: string;
    disconnectRobotBtn: string;
    robotIdLabel: string;
    simulateConnect: string;
    simulateDisconnect: string;
    speedLabel: string;
    captureBtn: string;
    capturing: string;
    recheck5s: string;
    hotspotWarning: string;
    streamWaiting: string;
    streamError: string;
    lightLabel: string;
    lightOn: string;
    lightOff: string;
    lightBrightness: string;
    dualView: string;
    stackedView: string;
  };
  scan: {
    title: string;
    subtitle: string;
    modeRobotTitle: string;
    modeRobotDesc: string;
    modeManualTitle: string;
    modeManualDesc: string;
    manualBanner: string;
    dropzoneTitle: string;
    dropzoneSubtitle: string;
    uploadBtn: string;
    takePhotoBtn: string;
    captureFromRobotBtn: string;
    cropSelectLabel: string;
    farmSelectLabel: string;
    selectCropPrompt: string;
    startAnalysisBtn: string;
    analyzingStep1: string;
    analyzingStep2: string;
    analyzingStep3: string;
    analyzingStep4: string;
    resultReady: string;
    invalidImageWarning: string;
    resolutionWarning: string;
    robotCameraSource: string;
    manualUploadSource: string;
    retryBtn: string;
    autoDetectCrop: string;
  };
  result: {
    assessmentTitle: string;
    disclaimer: string;
    scanId: string;
    cropName: string;
    healthStatus: string;
    diseaseDetected: string;
    confidence: string;
    severity: string;
    affectedArea: string;
    symptomsObserved: string;
    explanation: string;
    recommendedAction: string;
    sourceType: string;
    scanTimestamp: string;
  };
  onboarding: {
    title: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
    step5Title: string;
    step5Desc: string;
    step6Title: string;
    step6Desc: string;
    gotItBtn: string;
  };
  assistant: {
    title: string;
    subtitle: string;
    placeholder: string;
    sendBtn: string;
    disclaimer: string;
    suggested1: string;
    suggested2: string;
    suggested3: string;
    greeting: string;
    micStart: string;
    micListening: string;
    readAloud: string;
    stopSpeech: string;
    scanContextNotice: string;
  };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    registerTitle: string;
    registerSubtitle: string;
    mobileOrEmail: string;
    mobilePlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    fullName: string;
    fullNamePlaceholder: string;
    mobileNumber: string;
    emailOptional: string;
    emailPlaceholder: string;
    location: string;
    locationPlaceholder: string;
    primaryCrop: string;
    farmName: string;
    farmNamePlaceholder: string;
    loginBtn: string;
    registerBtn: string;
    demoLoginBtn: string;
    otpLoginBtn: string;
    dontHaveAccount: string;
    alreadyHaveAccount: string;
    registerNow: string;
    loginNow: string;
    orDivider: string;
    welcomeBack: string;
    profileTitle: string;
    guestMode: string;
    logout: string;
    myAccount: string;
  };
  theme: {
    title: string;
    subtitle: string;
    dark: string;
    darkDesc: string;
    light: string;
    lightDesc: string;
    medium: string;
    mediumDesc: string;
    forest: string;
    forestDesc: string;
    switchTheme: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'AGRI-SCAN BOT',
    appSubtitle: 'AI-Based Mobile Robot for Plant Leaf Disease Detection',
    nav: {
      dashboard: 'Dashboard',
      scan: 'Leaf Scan',
      robotControl: 'Robot Control',
      robotHealth: 'Robot Health',
      history: 'Scan History',
      alerts: 'Alerts',
      crops: 'Crop Monitor',
      farm: 'My Farm',
      assistant: 'AI Assistant',
      schemes: 'Govt Schemes',
      help: 'Help Guide',
      settings: 'Settings',
    },
    common: {
      online: 'Online',
      offline: 'Offline',
      connecting: 'Connecting...',
      connected: 'Connected',
      disconnected: 'Disconnected',
      healthy: 'Healthy',
      warning: 'Warning',
      error: 'Error',
      scanning: 'Scanning',
      analyzing: 'Analyzing',
      notAvailable: 'Not available',
      waitingForData: 'Waiting for robot data',
      serviceNotConnected: 'Service not connected',
      insufficientData: 'Not enough scan data yet',
      emergencyStop: 'EMERGENCY STOP',
      forward: 'Forward',
      reverse: 'Reverse',
      left: 'Left',
      right: 'Right',
      stop: 'Stop',
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      retry: 'Retry',
      viewDetails: 'View Details',
      installApp: 'Install AGRI-SCAN BOT',
      installOnIOS: 'Install on iOS',
      demoMode: 'Demo / Manual Mode',
      logout: 'Logout',
      lastSeen: 'Last seen',
      refresh: 'Refresh',
      speed: 'Speed',
    },
    dashboard: {
      title: 'Farm Operation Center',
      subtitle: 'Real-time telemetry and field health intelligence',
      farmOverview: 'Field Overview',
      totalScans: 'Total Leaf Scans',
      healthyScans: 'Healthy Plants',
      diseasedScans: 'Disease Detected',
      recentAlerts: 'Active Alerts',
      activeRobot: 'Assigned Robot',
      lastScanTime: 'Last Scan',
      robotQuickStatus: 'Robot Telemetry & Link',
      quickActions: 'Quick Operations',
      startScan: 'Start Leaf Scan',
      connectRobot: 'Manage Robot',
      uploadLeaf: 'Upload Image',
      viewHistory: 'Past Reports',
      checkHealth: 'Hardware Health',
      weatherWidget: 'Field Weather',
    },
    robot: {
      controlTitle: '4WD Robot Directional Control',
      controlSubtitle: 'Direct kinematic commands to ESP32 motor driver',
      healthTitle: 'Robot Subsystem Health',
      healthSubtitle: 'Hardware telemetry, camera pipeline, and diagnostic checks',
      connectionStatus: 'Connection & Link',
      batteryStatus: 'Power Subsystem',
      esp32Status: 'ESP32 Main MCU',
      esp32CamStatus: 'ESP32-CAM Vision Module',
      motorStatus: '4WD Motor System',
      wifiStatus: 'Wi-Fi Field RSSI',
      tempStatus: 'Chassis Temperature',
      errorMonitor: 'Diagnostic Error Log',
      lastHealthCheck: 'Heartbeat Check',
      offlineCommandWarning: 'Robot Offline — Command not sent',
      emergencyStopConfirmed: 'Emergency Stop command executed immediately.',
      connectRobotBtn: 'Connect Robot',
      disconnectRobotBtn: 'Disconnect Robot',
      robotIdLabel: 'Target Robot ID',
      simulateConnect: 'Simulate Hardware Link',
      simulateDisconnect: 'Simulate Disconnect',
      speedLabel: 'Motor Speed (PWM)',
      captureBtn: 'Capture Photo',
      capturing: 'Capturing...',
      recheck5s: 'Auto-checks link every 5 seconds',
      hotspotWarning:
        'Could not reach the robot. Check that the ESP32 is powered, and that the laptop hotspot is ON.',
      streamWaiting: 'Live video stream waiting for ESP32 connection...',
      streamError: 'Could not load camera stream. Verify ESP32-CAM is powered and on port 81.',
      lightLabel: 'ESP32 LED Flashlight / Work Light',
      lightOn: 'Light ON',
      lightOff: 'Light OFF',
      lightBrightness: 'Light Brightness',
      dualView: 'Split Screen (Live Feed + Controls)',
      stackedView: 'Single Column View',
    },
    scan: {
      title: 'Plant Leaf Health Analysis',
      subtitle: 'ESP32-CAM Robot Capture or High-Resolution Field Upload',
      modeRobotTitle: 'Mode A: Robot Live Scan',
      modeRobotDesc: 'Trigger 4WD Robot camera positioning and direct Wi-Fi upload',
      modeManualTitle: 'Mode B: Manual Field Photo',
      modeManualDesc: 'Upload a clear leaf photograph directly from mobile gallery or camera',
      manualBanner: 'MANUAL IMAGE MODE — Robot is not being used for this scan.',
      dropzoneTitle: 'Select or Capture Leaf Image',
      dropzoneSubtitle: 'Supports JPG, PNG, WebP up to 10MB',
      uploadBtn: 'Choose File',
      takePhotoBtn: 'Open Camera',
      captureFromRobotBtn: 'Capture from Robot',
      cropSelectLabel: 'Crop Type',
      farmSelectLabel: 'Associated Field / Farm',
      selectCropPrompt: '-- Select Crop --',
      startAnalysisBtn: 'Analyze Plant Leaf',
      analyzingStep1: 'Validating image resolution and leaf presence...',
      analyzingStep2: 'Resizing and normalising color spectrum...',
      analyzingStep3: 'Running botanical AI classification...',
      analyzingStep4: 'Generating diagnostic report...',
      resultReady: 'Analysis completed successfully',
      invalidImageWarning: 'Please upload or capture a clearer leaf image.',
      resolutionWarning: 'Image resolution too low for reliable botanical analysis.',
      robotCameraSource: 'Robot Camera',
      manualUploadSource: 'Manual Upload',
      retryBtn: 'Retry Capture',
      autoDetectCrop: 'Autonomous Plant Recognition (Identifies any leaf directly)',
    },
    result: {
      assessmentTitle: 'AI-Assisted Crop Health Assessment',
      disclaimer:
        'This assessment is AI-assisted decision support. Please inspect the plant and field before applying chemical or cultural treatments.',
      scanId: 'Scan Record ID',
      cropName: 'Target Crop',
      healthStatus: 'Health Status',
      diseaseDetected: 'Identified Condition',
      confidence: 'Calibrated Confidence',
      severity: 'Estimated Severity',
      affectedArea: 'Affected Foliage Area',
      symptomsObserved: 'Visible Symptoms',
      explanation: 'Botanical Assessment',
      recommendedAction: 'Recommended Action',
      sourceType: 'Scan Origin',
      scanTimestamp: 'Analysis Timestamp',
    },
    onboarding: {
      title: 'Farmer Quick-Start Guide',
      step1Title: 'Step 1: Power On Robot',
      step1Desc: 'Flip the main power switch on the 4WD AGRI-SCAN chassis.',
      step2Title: 'Step 2: Connect to Wi-Fi',
      step2Desc: 'Ensure your mobile hotspot or farm router matches the robot credentials.',
      step3Title: 'Step 3: Position Near Plant',
      step3Desc: 'Use the Directional Controls to drive the robot within 15-30 cm of target leaf.',
      step4Title: 'Step 4: Capture Clear Leaf',
      step4Desc: 'Ensure good daylight and sharp focus on the suspect leaf surface.',
      step5Title: 'Step 5: Send for AI Analysis',
      step5Desc: 'Hit Start Scan to transfer the image directly to the diagnostic engine.',
      step6Title: 'Step 6: Review Health Result',
      step6Desc: 'Inspect symptoms, severity level, and agronomic recommendations.',
      gotItBtn: 'I Understand — Start Farming',
    },
    assistant: {
      title: 'Kisan AI Agro-Advisor',
      subtitle: 'Multilingual plant pathology and 4WD robot scouting companion',
      placeholder: 'Ask about leaf symptoms, organic treatment, or robot scouting...',
      sendBtn: 'Send Query',
      disclaimer: 'Decision Support Only: Confirm treatments with local Krishi Vigyan Kendra.',
      suggested1: 'What are the symptoms and organic management of Early Blight in tomato?',
      suggested2: 'How to scout and manage Leaf Curl in Cotton using robot cameras?',
      suggested3: 'What are recommended scouting intervals for potato fields after rain?',
      greeting:
        'Welcome! I am Kisan AI, your agricultural companion. I can help diagnose leaf diseases, suggest organic remedies, and guide robot scouting. How can I help your farm today?',
      micStart: 'Speak your question',
      micListening: 'Listening... speak now',
      readAloud: 'Read aloud',
      stopSpeech: 'Stop speech',
      scanContextNotice: 'Latest leaf scan attached as diagnostic context',
    },
    auth: {
      loginTitle: 'Farmer Sign In',
      loginSubtitle: 'Access field health history, active robots, and alerts',
      registerTitle: 'Create Farmer Account',
      registerSubtitle: 'Register your farm plot and link 4WD scouting robots',
      mobileOrEmail: 'Mobile Number or Email',
      mobilePlaceholder: 'e.g. 9876543210 or ramesh@farm.in',
      password: 'Password',
      passwordPlaceholder: 'Enter your secure password',
      fullName: 'Full Name',
      fullNamePlaceholder: 'e.g. Ramesh Patil',
      mobileNumber: 'Mobile Number (10 Digits)',
      emailOptional: 'Email Address (Optional)',
      emailPlaceholder: 'e.g. farmer@agri.in',
      location: 'District / State',
      locationPlaceholder: 'e.g. Nashik, Maharashtra',
      primaryCrop: 'Primary Crop Grown',
      farmName: 'Farm / Plot Name',
      farmNamePlaceholder: 'e.g. Patil Organic Farms (Plot 1)',
      loginBtn: 'Sign In to Dashboard',
      registerBtn: 'Create Account & Register Farm',
      demoLoginBtn: 'One-Tap Demo Login (Ramesh Patil)',
      otpLoginBtn: 'Instant Mobile OTP Login',
      dontHaveAccount: "Don't have a farmer account?",
      alreadyHaveAccount: 'Already have an account?',
      registerNow: 'Register Here',
      loginNow: 'Sign In',
      orDivider: 'or continue with',
      welcomeBack: 'Welcome back',
      profileTitle: 'Farmer Profile & Account',
      guestMode: 'Continue as Guest',
      logout: 'Log Out',
      myAccount: 'My Account',
    },
    theme: {
      title: 'Display Theme',
      subtitle: 'Select visual mode for direct field sunlight, night scouting, or eye comfort',
      dark: 'High-Tech Dark (Night)',
      darkDesc: 'Deep slate & emerald contrast for low-light & OLED tablets',
      light: 'Daylight Clean (Light)',
      lightDesc: 'Crisp sunlight-optimized high legibility for direct field sun',
      medium: 'Warm Earth (Medium)',
      mediumDesc: 'Soothing warm sand & amber neutral tone to reduce eye strain',
      forest: 'Forest Meadow (Deep Agro)',
      forestDesc: 'Rich botanical green & moss tone for agricultural robotics',
      switchTheme: 'Theme',
    },
  },
  mr: {
    appName: 'ॲग्री-स्कॅन बॉट',
    appSubtitle: 'रोगांच्या निदानासाठी कृत्रिम बुद्धिमत्ता (AI) 4WD शेतकरी रोबोट',
    nav: {
      dashboard: 'डॅशबोर्ड',
      scan: 'पान स्कॅन',
      robotControl: 'रोबोट नियंत्रण',
      robotHealth: 'रोबोट आरोग्य',
      history: 'स्कॅन इतिहास',
      alerts: 'इशारे (Alerts)',
      crops: 'पीक देखरेख',
      farm: 'माझे शेत',
      assistant: 'AI सल्लागार',
      schemes: 'शासकीय योजना',
      help: 'मदत व माहिती',
      settings: 'सेटिंग्ज',
    },
    common: {
      online: 'ऑनलाइन',
      offline: 'ऑफलाइन',
      connecting: 'जोडणी सुरू आहे...',
      connected: 'जोडले आहे (Connected)',
      disconnected: 'संपर्क तुटला (Disconnected)',
      healthy: 'निरोगी',
      warning: 'सावधानता',
      error: 'त्रुटी',
      scanning: 'स्कॅनिंग सुरू आहे',
      analyzing: 'विश्लेषण सुरू आहे',
      notAvailable: 'माहिती उपलब्ध नाही',
      waitingForData: 'रोबोट डेटाची प्रतीक्षा आहे',
      serviceNotConnected: 'सेवा जोडलेली नाही',
      insufficientData: 'अद्याप पुरेसा स्कॅन डेटा नाही',
      emergencyStop: 'तातडीने थांबवा (EMERGENCY STOP)',
      forward: 'पुढे',
      reverse: 'मागे',
      left: 'डावीकडे',
      right: 'उजवीकडे',
      stop: 'थांबा',
      save: 'जतन करा',
      cancel: 'रद्द करा',
      close: 'बंद करा',
      retry: 'पुन्हा प्रयत्न करा',
      viewDetails: 'तपशील पहा',
      installApp: 'ॲग्री-स्कॅन बॉट ॲप इन्स्टॉल करा',
      installOnIOS: 'iOS वर इन्स्टॉल करा',
      demoMode: 'डेमो / मॅन्युअल मोड',
      logout: 'लॉगआउट',
      lastSeen: 'शेवटची वेळ',
      refresh: 'रिफ्रेश',
      speed: 'गती (Speed)',
    },
    dashboard: {
      title: 'शेतकरी नियंत्रण कक्ष',
      subtitle: 'रिअल-टाइम रोबोट स्थिती आणि पिकांचे आरोग्य विश्लेषण',
      farmOverview: 'शेती सारांश',
      totalScans: 'एकूण स्कॅन',
      healthyScans: 'निरोगी पिके',
      diseasedScans: 'रोग आढळलेली पाने',
      recentAlerts: 'सक्रिय इशारे',
      activeRobot: 'कार्यरत रोबोट',
      lastScanTime: 'शेवटचा स्कॅन',
      robotQuickStatus: 'रोबोट स्थिती व जोडणी',
      quickActions: 'त्वरित कृती',
      startScan: 'पान स्कॅन सुरू करा',
      connectRobot: 'रोबोट नियंत्रण',
      uploadLeaf: 'फोटो अपलोड करा',
      viewHistory: 'मागील अहवाल',
      checkHealth: 'हार्डवेअर आरोग्य',
      weatherWidget: 'हवामान अंदाज',
    },
    robot: {
      controlTitle: '4WD रोबोट दिशा नियंत्रण',
      controlSubtitle: 'ESP32 मोटर ड्राइव्हरला थेट दिशानिर्देश पाठवा',
      healthTitle: 'रोबोट उपप्रणाली आरोग्य',
      healthSubtitle: 'हार्डवेअर सेन्सर्स, कॅमेरा व बॅटरी स्थिती',
      connectionStatus: 'जोडणी स्थिती',
      batteryStatus: 'बॅटरी व पॉवर',
      esp32Status: 'ESP32 मुख्य बोर्ड',
      esp32CamStatus: 'ESP32-CAM कॅमेरा',
      motorStatus: '4WD मोटर सिस्टीम',
      wifiStatus: 'वाय-फाय सिग्नल',
      tempStatus: 'रोबोट तापमान',
      errorMonitor: 'त्रुटी नोंदवही',
      lastHealthCheck: 'आरोग्य तपासणी',
      offlineCommandWarning: 'रोबोट ऑफलाइन आहे — आदेश पाठवता आला नाही',
      emergencyStopConfirmed: 'तातडीने थांबवण्याचा आदेश अंमलात आणला.',
      connectRobotBtn: 'रोबोट जोडा',
      disconnectRobotBtn: 'रोबोट विलग करा',
      robotIdLabel: 'रोबोट क्रमांक',
      simulateConnect: 'जोडणी तपासा',
      simulateDisconnect: 'विलग करा',
      speedLabel: 'मोटर गती (PWM Speed)',
      captureBtn: 'फोटो काढा (Capture)',
      capturing: 'फोटो घेत आहे...',
      recheck5s: 'दर ५ सेकंदांनी संपर्क तपासला जातो',
      hotspotWarning:
        'Could not reach the robot. Check that the ESP32 is powered, and that the laptop hotspot is ON.',
      streamWaiting: 'ESP32 कॅमेरा प्रवाहाची प्रतीक्षा करत आहे...',
      streamError: 'कॅमेरा प्रवाह सुरू होऊ शकला नाही. ESP32-CAM चालू आणि पोर्ट ८१ वर असल्याची खात्री करा.',
      lightLabel: 'ESP32 फ्लॅशलाईट / दिवा (Light Control)',
      lightOn: 'लाईट चालू (ON)',
      lightOff: 'लाईट बंद (OFF)',
      lightBrightness: 'प्रकाशाची तीव्रता',
      dualView: 'कॅमेरा व कंट्रोल्स एकत्र (Split Screen)',
      stackedView: 'साधा व्ह्यू',
    },
    scan: {
      title: 'वनस्पती पान रोग विश्लेषण',
      subtitle: 'ESP32-CAM रोबोट कॅमेरा किंवा मोबाइल फोटोवरून तपासणी',
      modeRobotTitle: 'मोड १: रोबोट कॅमेरा स्कॅन',
      modeRobotDesc: '4WD रोबोट कॅमेरा वापरून थेट पानाचा फोटो घ्या',
      modeManualTitle: 'मोड २: थेट मोबाइल फोटो',
      modeManualDesc: 'गॅलरीतून किंवा थेट कॅमेऱ्याने पानाच्या रोगाचा फोटो अपलोड करा',
      manualBanner: 'मॅन्युअल फोटो मोड — या तपासणीसाठी रोबोट वापरलेला नाही.',
      dropzoneTitle: 'पानाचा फोटो निवडा किंवा काढा',
      dropzoneSubtitle: 'JPG, PNG, WebP फाइल्स (१० MB पर्यंत)',
      uploadBtn: 'फाइल निवडा',
      takePhotoBtn: 'कॅमेरा उघडा',
      captureFromRobotBtn: 'रोबोटवरून फोटो काढा (Capture from Robot)',
      cropSelectLabel: 'पीक निवडा',
      farmSelectLabel: 'शेत / प्लॉट',
      selectCropPrompt: '-- पीक निवडा --',
      startAnalysisBtn: 'पानाचे AI विश्लेषण करा',
      analyzingStep1: 'पानाची प्रतिमा तपासली जात आहे...',
      analyzingStep2: 'रंग आणि पोत विश्लेषण सुरू आहे...',
      analyzingStep3: 'कृत्रिम बुद्धिमत्ता वनस्पती रोग तपासत आहे...',
      analyzingStep4: 'सल्लागार अहवाल तयार करत आहे...',
      resultReady: 'विश्लेषण यशस्वीरीत्या पूर्ण झाले',
      invalidImageWarning: 'कृपया स्पष्ट आणि स्वच्छ पानाचा फोटो अपलोड करा.',
      resolutionWarning: 'प्रतिमेचा दर्जा कमी असल्याने रोग ओळखण्यात अडचण येऊ शकते.',
      robotCameraSource: 'रोबोट कॅमेरा (Robot Camera)',
      manualUploadSource: 'मॅन्युअल फोटो (Manual Upload)',
      retryBtn: 'पुन्हा फोटो काढा (Retry)',
      autoDetectCrop: 'स्वयंचलित पीक ओळख (कोणतेही पान थेट ओळखा)',
    },
    result: {
      assessmentTitle: 'AI कृषी रोग निदान व सल्ला अहवाल',
      disclaimer:
        'हा अहवाल AI आधारित निर्णय साहाय्यासाठी आहे. औषध फवारणी किंवा खतांचा वापर करण्यापूर्वी प्रत्यक्ष शेतात पाहणी करा.',
      scanId: 'स्कॅन नोंद क्रमांक',
      cropName: 'तपासलेले पीक',
      healthStatus: 'आरोग्य स्थिती',
      diseaseDetected: 'आढळलेला रोग / स्थिती',
      confidence: 'अचूकता विश्वासार्हता',
      severity: 'तीव्रता पातळी',
      affectedArea: 'बाधित पानाचा भाग',
      symptomsObserved: 'दिसून आलेली लक्षणे',
      explanation: 'रोग निदान व माहिती',
      recommendedAction: 'शिफारस केलेले उपाय',
      sourceType: 'स्कॅन माध्यम',
      scanTimestamp: 'स्कॅन वेळ',
    },
    onboarding: {
      title: 'शेतकरी मार्गदर्शक माहिती',
      step1Title: 'पायरी १: रोबोट सुरू करा',
      step1Desc: '4WD ॲग्री-स्कॅन रोबोटचा मुख्य पॉवर स्विच चालू करा.',
      step2Title: 'पायरी २: वाय-फाय जोडा',
      step2Desc: 'लॅपटॉप किंवा मोबाइल हॉटस्पॉट रोबोटशी जोडलेला असल्याची खात्री करा.',
      step3Title: 'पायरी ३: पानाजवळ रोबोट न्या',
      step3Desc: 'दिशानिर्देश बटनांचा वापर करून संशयित पानाजवळ १५ ते ३० सेमी अंतरावर रोबोट न्या.',
      step4Title: 'पायरी ४: स्पष्ट फोटो घ्या',
      step4Desc: 'पानावर पुरेसा प्रकाश आणि स्पष्ट फोकस असल्याची खात्री करा.',
      step5Title: 'पायरी ५: AI विश्लेषण करा',
      step5Desc: 'स्कॅन बटण दाबा; प्रतिमा थेट तपासणीसाठी पाठवली जाईल.',
      step6Title: 'पायरी ६: उपाय व अहवाल पहा',
      step6Desc: 'रोगाचे नाव, तीव्रता आणि सेंद्रिय व्यवस्थापन उपाय जाणून घ्या.',
      gotItBtn: 'समजले — शेती सुरू करा',
    },
    assistant: {
      title: 'किसान AI कृषी सल्लागार',
      subtitle: 'मराठी व हिंदी भाषेत मार्गदर्शन करणारा आपला शेती मित्र',
      placeholder: 'पानावरील लक्षणे, सेंद्रिय उपाय किंवा रोबोट वापराबाबत विचारा...',
      sendBtn: 'प्रश्न विचारा',
      disclaimer: 'निर्णय साहाय्य: रासायनिक उपचारांपूर्वी कृषी विज्ञान केंद्राचा (KVK) सल्ला घ्या.',
      suggested1: 'टोमॅटोवरील अर्ली ब्लाईट (करपा) कसा ओळखावा आणि सेंद्रिय उपाय काय आहेत?',
      suggested2: 'कपाशीवरील बोंडअळी व पानांचा चुरमुरडा थांबवण्यासाठी रोबोट कॅमेऱ्याने काय पहावे?',
      suggested3: 'बटाट्यावरील लेट ब्लाईट आणि पावसाळ्यानंतर शेतीची काळजी कशी घ्यावी?',
      greeting:
        'नमस्कार शेतकरी बंधूंनो! मी किसान AI आपला शेती सल्लागार आहे. वनस्पतींचे रोग, पानांवरील लक्षणे, सेंद्रिय उपाय आणि 4WD रोबोट वापरासंबंधी मला कोणताही प्रश्न विचारा. मी आपल्या सेवेत आहे!',
      micStart: 'बोला (मायक्रोफोन)',
      micListening: 'ऐकत आहे... बोला',
      readAloud: 'वाचून दाखवा (Audio)',
      stopSpeech: 'आवाज थांबवा',
      scanContextNotice: 'सध्याच्या पानाचा स्कॅन अहवाल चर्चेत समाविष्ट केला आहे',
    },
    auth: {
      loginTitle: 'शेतकरी लॉगिन',
      loginSubtitle: 'आपल्या शेतीचे अहवाल आणि रोबोट नियंत्रणात प्रवेश करा',
      registerTitle: 'शेतकरी नोंदणी करा',
      registerSubtitle: 'आपले शेत नोंदवा आणि 4WD रोबोट जोडा',
      mobileOrEmail: 'मोबाइल नंबर किंवा ईमेल',
      mobilePlaceholder: 'उदा. 9876543210 किंवा ramesh@farm.in',
      password: 'पासवर्ड',
      passwordPlaceholder: 'आपला गुप्त पासवर्ड टाका',
      fullName: 'पूर्ण नाव',
      fullNamePlaceholder: 'उदा. रमेश ज्ञानोबा पाटील',
      mobileNumber: 'मोबाइल नंबर (१० अंक)',
      emailOptional: 'ईमेल (ऐच्छिक)',
      emailPlaceholder: 'उदा. farmer@agri.in',
      location: 'जिल्हा / राज्य',
      locationPlaceholder: 'उदा. नाशिक, महाराष्ट्र',
      primaryCrop: 'मुख्य पीक',
      farmName: 'शेताचे नाव',
      farmNamePlaceholder: 'उदा. पाटील ऑरगॅनिक फार्म (प्लॉट १)',
      loginBtn: 'डॅशबोर्डमध्ये प्रवेश करा',
      registerBtn: 'खाते तयार करा व शेत नोंदवा',
      demoLoginBtn: 'डेमो लॉगिन (रमेश पाटील)',
      otpLoginBtn: 'त्वरित मोबाइल OTP लॉगिन',
      dontHaveAccount: 'शेतकरी खाते नाही का?',
      alreadyHaveAccount: 'आधीच नोंदणी केली आहे का?',
      registerNow: 'येथे नोंदणी करा',
      loginNow: 'लॉगिन करा',
      orDivider: 'किंवा याद्वारे सुरू करा',
      welcomeBack: 'पुन्हा स्वागत आहे',
      profileTitle: 'शेतकरी प्रोफाइल व खाते',
      guestMode: 'अतिथी म्हणून सुरू ठेवा',
      logout: 'लॉगआउट करा',
      myAccount: 'माझे खाते',
    },
    theme: {
      title: 'डिस्प्ले थीम',
      subtitle: 'खताच्या उन्हात, रात्रीच्या वेळी किंवा डोळ्यांच्या सोयीसाठी योग्य रंग निवडा',
      dark: 'हाय-टेक डार्क (रात्र)',
      darkDesc: 'कमी प्रकाशात व रात्री शेतात वापरण्यासाठी गडद स्लेट थीम',
      light: 'डेलाइट क्लीन (उजेड)',
      lightDesc: 'खेत में तेज धूप में स्पष्ट वाचण्यासाठी पांढरी शुभ्र थीम',
      medium: 'वॉर्म अर्थ (मध्यम)',
      mediumDesc: 'डोळ्यांना ताण पडू नये म्हणून वाळू व मातीचा उबदार रंग',
      forest: 'फॉरेस्ट मीडो (शेत हिरवेगार)',
      forestDesc: 'कृषी तंत्रज्ञान व निसर्गाचा समृद्ध हिरवा रंग',
      switchTheme: 'थीम',
    },
  },
  hi: {
    appName: 'एग्री-स्कैन बॉट',
    appSubtitle: 'पौधों के पत्तों के रोग पहचान के लिए एआई रोबोट प्रणाली',
    nav: {
      dashboard: 'डैशबोर्ड',
      scan: 'पत्ती स्कैन',
      robotControl: 'रोबोट नियंत्रण',
      robotHealth: 'रोबोट स्वास्थ्य',
      history: 'स्कैन इतिहास',
      alerts: 'अलर्ट',
      crops: 'फसल निगरानी',
      farm: 'मेरा खेत',
      assistant: 'एआई सहायक',
      schemes: 'सरकारी योजनाएं',
      help: 'सहायता निर्देशिका',
      settings: 'सेटिंग्स',
    },
    common: {
      online: 'ऑनलाइन',
      offline: 'ऑफलाइन',
      connecting: 'कनेक्ट हो रहा है...',
      connected: 'जुड़ा हुआ (Connected)',
      disconnected: 'डिस्कनेक्ट (Disconnected)',
      healthy: 'स्वस्थ',
      warning: 'चेतावनी',
      error: 'त्रुटि',
      scanning: 'स्कैन जारी',
      analyzing: 'विश्लेषण हो रहा है',
      notAvailable: 'उपलब्ध नहीं है',
      waitingForData: 'रोबोट डेटा की प्रतीक्षा है',
      serviceNotConnected: 'सेवा जुड़ी नहीं है',
      insufficientData: 'पर्याप्त स्कैन डेटा उपलब्ध नहीं है',
      emergencyStop: 'आपातकालीन रोक (STOP)',
      forward: 'आगे',
      reverse: 'पीछे',
      left: 'बाएं',
      right: 'दाएं',
      stop: 'रोकें',
      save: 'सुरक्षित करें',
      cancel: 'रद्द करें',
      close: 'बंद करें',
      retry: 'पुनः प्रयास करें',
      viewDetails: 'विवरण देखें',
      installApp: 'एग्री-स्कैन बॉट इंस्टॉल करें',
      installOnIOS: 'iOS पर इंस्टॉल करें',
      demoMode: 'डेमो / मैनुअल मोड',
      logout: 'लॉग आउट',
      lastSeen: 'अंतिम समय',
      refresh: 'रिफ्रेश',
      speed: 'गति (Speed)',
    },
    dashboard: {
      title: 'किसान नियंत्रण केंद्र',
      subtitle: 'रियल-टाइम रोबोट स्थिति और फसल स्वास्थ्य विश्लेषण',
      farmOverview: 'खेत का विवरण',
      totalScans: 'कुल पत्ती स्कैन',
      healthyScans: 'स्वस्थ पौधे',
      diseasedScans: 'रोग ग्रसित पत्तियां',
      recentAlerts: 'सक्रिय चेतावनियां',
      activeRobot: 'नियुक्त रोबोट',
      lastScanTime: 'पिछला स्कैन',
      robotQuickStatus: 'रोबोट स्थिति व लिंक',
      quickActions: 'त्वरित कार्य',
      startScan: 'पत्ती स्कैन शुरू करें',
      connectRobot: 'रोबोट प्रबंधित करें',
      uploadLeaf: 'फोटो अपलोड करें',
      viewHistory: 'पिछली रिपोर्ट',
      checkHealth: 'हार्डवेयर स्वास्थ्य',
      weatherWidget: 'खेत का मौसम',
    },
    robot: {
      controlTitle: '4WD रोबोट दिशा नियंत्रण',
      controlSubtitle: 'ESP32 मोटर ड्राइवर को सीधे दिशात्मक निर्देश भेजें',
      healthTitle: 'रोबोट उपप्रणाली स्वास्थ्य',
      healthSubtitle: 'हार्डवेयर टेलीमेट्री, कैमरा स्थिति और नैदानिक जांच',
      connectionStatus: 'कनेक्शन व स्थिति',
      batteryStatus: 'पावर व बैटरी',
      esp32Status: 'ESP32 मुख्य बोर्ड',
      esp32CamStatus: 'ESP32-CAM कैमरा',
      motorStatus: '4WD मोटर सिस्टम',
      wifiStatus: 'वाई-फाई सिग्नल',
      tempStatus: 'रोबोट तापमान',
      errorMonitor: 'त्रुटि लॉग',
      lastHealthCheck: 'स्वास्थ्य जांच',
      offlineCommandWarning: 'रोबोट ऑफलाइन है — आदेश नहीं भेजा गया',
      emergencyStopConfirmed: 'इमरजेंसी स्टॉप आदेश तुरंत निष्पादित किया गया।',
      connectRobotBtn: 'रोबोट कनेक्ट करें',
      disconnectRobotBtn: 'रोबोट डिस्कनेक्ट करें',
      robotIdLabel: 'रोबोट आईडी',
      simulateConnect: 'कनेक्शन जांचें',
      simulateDisconnect: 'डिस्कनेक्ट करें',
      speedLabel: 'मोटर गति (PWM Speed)',
      captureBtn: 'फोटो लें (Capture)',
      capturing: 'फोटो ले रहे हैं...',
      recheck5s: 'हर 5 सेकंड में कनेक्शन जांचता है',
      hotspotWarning:
        'Could not reach the robot. Check that the ESP32 is powered, and that the laptop hotspot is ON.',
      streamWaiting: 'ESP32 लाइव वीडियो स्ट्रीम की प्रतीक्षा है...',
      streamError: 'कैमरा स्ट्रीम लोड नहीं हो सका। सुनिश्चित करें कि ESP32-CAM चालू है और पोर्ट 81 पर है।',
      lightLabel: 'ESP32 फ्लैशलाइट / लाइट (Light Control)',
      lightOn: 'लाइट चालू (ON)',
      lightOff: 'लाइट बंद (OFF)',
      lightBrightness: 'रोशनी की तीव्रता',
      dualView: 'कैमरा व कंट्रोल्स एक साथ (Split Screen)',
      stackedView: 'साधारण व्यू',
    },
    scan: {
      title: 'पौधों के पत्तों का रोग विश्लेषण',
      subtitle: 'ESP32-CAM रोबोट कैप्चर या मोबाइल द्वारा पत्ती की जांच',
      modeRobotTitle: 'मोड १: रोबोट लाइव स्कैन',
      modeRobotDesc: '4WD रोबोट कैमरा स्थिति से सीधा वाई-फाई अपलोड करें',
      modeManualTitle: 'मोड २: सीधे मोबाइल फोटो',
      modeManualDesc: 'मोबाइल गैलरी या कैमरे से सीधे साफ पत्ती का फोटो अपलोड करें',
      manualBanner: 'मैनुअल फोटो मोड — इस स्कैन के लिए रोबोट का उपयोग नहीं हो रहा है।',
      dropzoneTitle: 'पत्ती की तस्वीर चुनें या खींचें',
      dropzoneSubtitle: 'JPG, PNG, WebP फाइलें (10MB तक)',
      uploadBtn: 'फाइल चुनें',
      takePhotoBtn: 'कैमरा खोलें',
      captureFromRobotBtn: 'रोबोट से फोटो लें (Capture from Robot)',
      cropSelectLabel: 'फसल का प्रकार',
      farmSelectLabel: 'संबंधित खेत / प्लॉट',
      selectCropPrompt: '-- फसल चुनें --',
      startAnalysisBtn: 'पत्ती का AI विश्लेषण करें',
      analyzingStep1: 'फोटो की स्पष्टता जांची जा रही है...',
      analyzingStep2: 'रंग और बनावट का विश्लेषण जारी है...',
      analyzingStep3: 'एआई वनस्पति रोग पहचान मॉडल चल रहा है...',
      analyzingStep4: 'निदान रिपोर्ट तैयार की जा रही है...',
      resultReady: 'विश्लेषण सफलतापूर्वक पूर्ण हुआ',
      invalidImageWarning: 'कृपया स्पष्ट और साफ पत्ती की तस्वीर अपलोड करें।',
      resolutionWarning: 'तस्वीर की गुणवत्ता कम होने से रोग पहचान में समस्या आ सकती है।',
      robotCameraSource: 'रोबोट कैमरा (Robot Camera)',
      manualUploadSource: 'मैनुअल फोटो (Manual Upload)',
      retryBtn: 'पुनः फोटो लें (Retry)',
      autoDetectCrop: 'स्वचालित फसल पहचान (किसी भी पत्ती की अपने आप पहचान होगी)',
    },
    result: {
      assessmentTitle: 'एआई फसल रोग निदान एवं सलाह रिपोर्ट',
      disclaimer:
        'यह मूल्यांकन एआई-सहायता प्राप्त निर्णय समर्थन है। रासायनिक या जैविक उपचार करने से पहले कृपया पौधे और खेत की भौतिक जांच करें।',
      scanId: 'स्कैन रिकॉर्ड आईडी',
      cropName: 'लक्षित फसल',
      healthStatus: 'स्वास्थ्य स्थिति',
      diseaseDetected: 'पहचाना गया रोग / स्थिति',
      confidence: 'विश्वसनीयता स्तर',
      severity: 'अनुमानित गंभीरता',
      affectedArea: 'प्रभावित पत्ती क्षेत्र',
      symptomsObserved: 'देखे गए लक्षण',
      explanation: 'वानस्पतिक मूल्यांकन',
      recommendedAction: 'अनुशंसित कदम',
      sourceType: 'स्कैन स्रोत',
      scanTimestamp: 'विश्लेषण समय',
    },
    onboarding: {
      title: 'किसान मार्गदर्शिका',
      step1Title: 'चरण १: रोबोट चालू करें',
      step1Desc: '4WD एग्री-स्कैन रोबोट का मुख्य पावर स्विच ऑन करें।',
      step2Title: 'चरण २: वाई-फाई से जोड़ें',
      step2Desc: 'सुनिश्चित करें कि आपका मोबाइल हॉटस्पॉट रोबोट से जुड़ा है।',
      step3Title: 'चरण ३: पौधे के पास ले जाएं',
      step3Desc: 'दिशा बटनों का उपयोग करके रोबोट को संदिग्ध पत्ती से 15-30 सेमी पास ले जाएं।',
      step4Title: 'चरण ४: साफ फोटो खींचें',
      step4Desc: 'पत्ती पर उचित रोशनी और स्पष्ट फोकस सुनिश्चित करें।',
      step5Title: 'चरण ५: एआई विश्लेषण करें',
      step5Desc: 'स्कैन बटन दबाएं; फोटो सीधे एआई डायग्नोस्टिक इंजन में जाएगा।',
      step6Title: 'चरण ६: रिपोर्ट व उपाय देखें',
      step6Desc: 'रोग का नाम, गंभीरता और जैविक उपचार के उपाय देखें।',
      gotItBtn: 'समझ गया — खेती शुरू करें',
    },
    assistant: {
      title: 'किसान एआई कृषि सलाहकार',
      subtitle: 'हिंदी और मराठी में सलाह देने वाला आपका किसान मित्र',
      placeholder: 'पत्ती के लक्षण, जैविक उपचार या रोबोट संचालन के बारे में पूछें...',
      sendBtn: 'सवाल पूछें',
      disclaimer: 'निर्णय समर्थन: रासायनिक उपचार से पूर्व स्थानीय कृषि विज्ञान केंद्र से परामर्श लें।',
      suggested1: 'टमाटर में अगेती झुलसा (Early Blight) के लक्षण और जैविक उपचार क्या हैं?',
      suggested2: 'कपास में पत्ती मरोड़ और कीट नियंत्रण के लिए रोबोट कैमरे से क्या देखें?',
      suggested3: 'आलू में पछेती झुलसा रोकने और बारिश के बाद खेत की देखभाल के उपाय बताइए।',
      greeting:
        'नमस्ते किसान भाई! मैं किसान एआई, आपका कृषि सलाहकार हूँ। पौधों के रोग, जैविक उपचार, सिंचाई और रोबोट संचालन पर आपकी सहायता कर सकता हूँ। अपना प्रश्न पूछें!',
      micStart: 'बोलकर पूछें (माइक)',
      micListening: 'सुन रहे हैं... बोलिए',
      readAloud: 'सुनें (Audio)',
      stopSpeech: 'आवाज रोकें',
      scanContextNotice: 'नवीनतम पत्ती स्कैन का डेटा संदर्भ के रूप में जोड़ा गया है',
    },
    auth: {
      loginTitle: 'किसान साइन इन',
      loginSubtitle: 'अपने खेत की रिपोर्ट और सक्रिय रोबोट तक पहुंचें',
      registerTitle: 'किसान खाता बनाएं',
      registerSubtitle: 'अपना खेत पंजीकृत करें और 4WD रोबोट लिंक करें',
      mobileOrEmail: 'मोबाइल नंबर या ईमेल',
      mobilePlaceholder: 'उदा. 9876543210 या ramesh@farm.in',
      password: 'पासवर्ड',
      passwordPlaceholder: 'अपना सुरक्षित पासवर्ड दर्ज करें',
      fullName: 'पूरा नाम',
      fullNamePlaceholder: 'उदा. रमेश ज्ञानोबा पाटिल',
      mobileNumber: 'मोबाइल नंबर (10 अंक)',
      emailOptional: 'ईमेल पता (वैकल्पिक)',
      emailPlaceholder: 'उदा. farmer@agri.in',
      location: 'जिला / राज्य',
      locationPlaceholder: 'उदा. नासिक, महाराष्ट्र',
      primaryCrop: 'मुख्य उगाई जाने वाली फसल',
      farmName: 'खेत / प्लॉट का नाम',
      farmNamePlaceholder: 'उदा. पाटिल ऑर्गेनिक फार्म (प्लॉट 1)',
      loginBtn: 'डैशबोर्ड में प्रवेश करें',
      registerBtn: 'खाता बनाएं और खेत जोड़ें',
      demoLoginBtn: 'डेमो लॉगिन (रमेश पाटिल)',
      otpLoginBtn: 'तुरंत मोबाइल OTP लॉगिन',
      dontHaveAccount: 'क्या किसान खाता नहीं है?',
      alreadyHaveAccount: 'क्या पहले से खाता है?',
      registerNow: 'यहाँ पंजीकरण करें',
      loginNow: 'लॉगिन करें',
      orDivider: 'या अन्य विकल्प चुनें',
      welcomeBack: 'स्वागत है',
      profileTitle: 'किसान प्रोफ़ाइल व खाता',
      guestMode: 'अतिथि के रूप में जारी रखें',
      logout: 'लॉग आउट',
      myAccount: 'मेरा खाता',
    },
    theme: {
      title: 'डिस्प्ले थीम',
      subtitle: 'खेत में तेज धूप, रात की निगरानी या आंखों के आराम के अनुसार रंग थीम चुनें',
      dark: 'हाई-टेक डार्क (रात)',
      darkDesc: 'कम रोशनी और टैबलेट के लिए गहरा स्लेट व हरा रंग',
      light: 'डे-लाइट क्लीन (हल्का/लाइट)',
      lightDesc: 'कड़ी धूप में स्पष्ट देखने के लिए उज्ज्वल व साफ सफेद रंग',
      medium: 'वॉर्म अर्थ (मध्यम/मीडियम)',
      mediumDesc: 'आंखों के आराम के लिए प्राकृतिक मिट्टी व रेत जैसा मध्यम रंग',
      forest: 'फॉरेस्ट मीडो (गहरा हरा)',
      forestDesc: 'कृषि व पौधों के अनुकूल समृद्ध प्राकृतिक हरा रंग',
      switchTheme: 'थीम',
    },
  },
};

/**
 * Multilingual Crop Name Formatter:
 * Returns the name in the selected language, with the English name in brackets.
 * Requirement 4: "Disease/crop names should be shown in the selected language, with the English name in brackets."
 */
const CROP_TRANSLATIONS: Record<string, { en: string; mr: string; hi: string }> = {
  tomato: { en: 'Tomato', mr: 'टोमॅटो', hi: 'टमाटर' },
  cotton: { en: 'Cotton', mr: 'कापूस', hi: 'कपास' },
  potato: { en: 'Potato', mr: 'बटाटा', hi: 'आलू' },
  soybean: { en: 'Soybean', mr: 'सोयाबीन', hi: 'सोयाबीन' },
  maize: { en: 'Maize', mr: 'मका', hi: 'मक्का' },
  corn: { en: 'Corn', mr: 'मका', hi: 'मक्का' },
  onion: { en: 'Onion', mr: 'कांदा', hi: 'प्याज' },
  grape: { en: 'Grape', mr: 'द्राक्षे', hi: 'अंगूर' },
  grapes: { en: 'Grapes', mr: 'द्राक्षे', hi: 'अंगूर' },
  sugarcane: { en: 'Sugarcane', mr: 'ऊस', hi: 'गन्ना' },
  wheat: { en: 'Wheat', mr: 'गहू', hi: 'गेहूं' },
  chilli: { en: 'Chilli', mr: 'मिरची', hi: 'मिर्च' },
  chili: { en: 'Chili', mr: 'मिरची', hi: 'मिर्च' },
  pepper: { en: 'Pepper / Chilli', mr: 'मिरची', hi: 'मिर्च' },
  rice: { en: 'Rice / Paddy', mr: 'भात / तांदूळ', hi: 'धान / चावल' },
  paddy: { en: 'Paddy', mr: 'भात (धान)', hi: 'धान' },
  brinjal: { en: 'Brinjal / Eggplant', mr: 'वांगी', hi: 'बैंगन' },
  eggplant: { en: 'Eggplant', mr: 'वांगी', hi: 'बैंगन' },
  papaya: { en: 'Papaya', mr: 'पपई', hi: 'पपीता' },
  mango: { en: 'Mango', mr: 'आंबा', hi: 'आम' },
  banana: { en: 'Banana', mr: 'केळी', hi: 'केला' },
  rose: { en: 'Rose', mr: 'गुलाब', hi: 'गुलाब' },
  cucumber: { en: 'Cucumber', mr: 'काकडी', hi: 'खीरा' },
  okra: { en: 'Okra / Bhendi', mr: 'भेंडी', hi: 'भिंडी' },
  bhendi: { en: 'Bhendi', mr: 'भेंडी', hi: 'भिंडी' },
  pomegranate: { en: 'Pomegranate', mr: 'डाळिंब', hi: 'अनार' },
  guava: { en: 'Guava', mr: 'पेरू', hi: 'अमरूद' },
  citrus: { en: 'Citrus / Lemon', mr: 'लिंबू', hi: 'नींबू' },
  lemon: { en: 'Lemon', mr: 'लिंबू', hi: 'नींबू' },
  turmeric: { en: 'Turmeric', mr: 'हळद', hi: 'हल्दी' },
  ginger: { en: 'Ginger', mr: 'आले', hi: 'अदरक' },
  garlic: { en: 'Garlic', mr: 'लसूण', hi: 'लहसुन' },
  mustard: { en: 'Mustard', mr: 'मोहरी', hi: 'सरसों' },
  chickpea: { en: 'Chickpea / Gram', mr: 'हरभरा', hi: 'चना' },
};

function extractKey(str: string): string {
  // If string contains English name in brackets e.g. "टोमॅटो (Tomato)", extract "Tomato"
  const bracketMatch = str.match(/\(([^)]+)\)/);
  if (bracketMatch && bracketMatch[1]) {
    return bracketMatch[1].toLowerCase().trim();
  }
  return str.toLowerCase().trim();
}

export function getCropDisplayName(rawCrop: string, lang: Language): string {
  if (!rawCrop) return lang === 'mr' ? 'पीक (Crop)' : lang === 'hi' ? 'फसल (Crop)' : 'Crop';
  const clean = rawCrop.toLowerCase().trim();

  // Try direct match or extracted bracket match
  const key = extractKey(clean);
  for (const [k, v] of Object.entries(CROP_TRANSLATIONS)) {
    if (
      clean.includes(k) ||
      key.includes(k) ||
      clean.includes(v.en.toLowerCase()) ||
      clean.includes(v.mr.toLowerCase()) ||
      clean.includes(v.hi.toLowerCase())
    ) {
      if (lang === 'mr') return `${v.mr} (${v.en})`;
      if (lang === 'hi') return `${v.hi} (${v.en})`;
      return v.en;
    }
  }

  // If already contains brackets
  const bracketMatch = rawCrop.match(/\(([^)]+)\)/);
  if (bracketMatch && bracketMatch[1]) {
    const enName = bracketMatch[1].trim();
    if (lang === 'en') return enName;
  }

  if (lang === 'mr') return `${rawCrop} (${rawCrop})`;
  if (lang === 'hi') return `${rawCrop} (${rawCrop})`;
  return rawCrop;
}

/**
 * Multilingual Disease Name Formatter:
 * Returns the disease in the selected language, with the English name in brackets.
 */
const DISEASE_TRANSLATIONS: Record<string, { en: string; mr: string; hi: string }> = {
  'early blight': { en: 'Early Blight', mr: 'करपा / अर्ली ब्लाईट', hi: 'अगेती झुलसा' },
  'late blight': { en: 'Late Blight', mr: 'लेट ब्लाईट', hi: 'पछेती झुलसा' },
  'leaf curl': { en: 'Leaf Curl Virus', mr: 'चुरमुरडा / पर्ण गुच्छ', hi: 'पत्ती मरोड़ रोग' },
  'bacterial spot': { en: 'Bacterial Spot', mr: 'जिवाणूजन्य ठिपके', hi: 'जीवाणु धब्बा रोग' },
  'bacterial blight': { en: 'Bacterial Blight', mr: 'जिवाणू करपा', hi: 'जीवाणु झुलसा' },
  'powdery mildew': { en: 'Powdery Mildew', mr: 'भुरी रोग', hi: 'चूर्णिल आसिता' },
  'downy mildew': { en: 'Downy Mildew', mr: 'केवडा / डाउनी मिल्ड्यू', hi: 'मृदुरोमिल आसिता' },
  rust: { en: 'Rust', mr: 'तांबेरा रोग', hi: 'गेरुआ / रतुआ' },
  anthracnose: { en: 'Anthracnose', mr: 'अँथ्रॅकनोज / काळे ठिपके', hi: 'एन्थ्रेक्नोज रोग' },
  mosaic: { en: 'Mosaic Virus', mr: 'मोझॅक व्हायरस', hi: 'मोज़ेक वायरस' },
  'yellow vein': { en: 'Yellow Vein Mosaic', mr: 'पिवळा शिरा रोग', hi: 'पीत शिरा रोग' },
  cercospora: { en: 'Cercospora Leaf Spot', mr: 'टिक्का / सर्कोस्पोरा ठिपके', hi: 'टिक्का / सर्कोस्पोरा धब्बा' },
  septoria: { en: 'Septoria Leaf Spot', mr: 'सेप्टोरिया ठिपके', hi: 'सेप्टोरिया पत्ती धब्बा' },
  wilt: { en: 'Fusarium Wilt', mr: 'मर रोग (विल्ट)', hi: 'उकठा / म्लानि रोग' },
  healthy: { en: 'Healthy Foliage', mr: 'निरोगी वनस्पती', hi: 'स्वस्थ पौधा' },
  'none detected': { en: 'Healthy Foliage', mr: 'निरोगी वनस्पती', hi: 'स्वस्थ पौधा' },
};

export function getDiseaseDisplayName(rawDisease: string, lang: Language): string {
  if (!rawDisease) return lang === 'mr' ? 'अनिर्धारित (Undetermined)' : lang === 'hi' ? 'अनिर्धारित (Undetermined)' : 'Undetermined';
  const clean = rawDisease.toLowerCase().trim();
  const key = extractKey(clean);

  for (const [k, val] of Object.entries(DISEASE_TRANSLATIONS)) {
    if (
      clean.includes(k) ||
      key.includes(k) ||
      clean.includes(val.en.toLowerCase()) ||
      clean.includes(val.mr.toLowerCase()) ||
      clean.includes(val.hi.toLowerCase())
    ) {
      if (lang === 'mr') return `${val.mr} (${val.en})`;
      if (lang === 'hi') return `${val.hi} (${val.en})`;
      return val.en;
    }
  }

  const bracketMatch = rawDisease.match(/\(([^)]+)\)/);
  if (bracketMatch && bracketMatch[1]) {
    const enName = bracketMatch[1].trim();
    if (lang === 'en') return enName;
  }

  if (lang === 'mr') return `${rawDisease} (${rawDisease})`;
  if (lang === 'hi') return `${rawDisease} (${rawDisease})`;
  return rawDisease;
}
