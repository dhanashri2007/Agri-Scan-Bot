#include "esp_camera.h"
#include <WiFi.h>
#include "esp_http_server.h"
#include "img_converters.h"

// ===== Laptop hotspot (robot yala connect hoil) =====
const char *homeSsid = "esp32cam";
const char *homePass = "12345678";

// ===== Robot cha kayam IP (Windows hotspot range 192.168.137.x) =====
IPAddress robotIP(192, 168, 137, 100);
IPAddress gateway(192, 168, 137, 1);
IPAddress subnet(255, 255, 255, 0);
IPAddress dns(192, 168, 137, 1);

// ===== Hotspot nasel tar robot swatacha WiFi banvel =====
const char *apSsid = "RobotCar";
const char *apPass = "12345678";

// ===== Motor pins (tumchya wiring pramane) =====
#define EN_PIN    12   // ENA + ENB donhi
#define R_IN1     13
#define R_IN2     15
#define L_IN1     14
#define L_IN2      2
#define LIGHT_PIN  4

// ===== Camera pins (AI Thinker) =====
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

#define STREAM_QUALITY 50   // video quality (kami = fast)
#define PHOTO_QUALITY  90   // photo quality (jast = changli)

bool cameraOK = false;
volatile bool moving = false;
volatile unsigned long lastMoveCmd = 0;

httpd_handle_t controlServer = NULL;
httpd_handle_t streamServer = NULL;

// ---------- PWM helpers (core 2 ani 3 donhi) ----------
void pwmSetup(int pin) {
#if ESP_ARDUINO_VERSION_MAJOR >= 3
  ledcAttach(pin, 1000, 8);
#else
  static int ch = 2;
  ledcSetup(ch, 1000, 8);
  ledcAttachPin(pin, ch);
  ch++;
#endif
}
void pwmWrite(int pin, int duty) {
#if ESP_ARDUINO_VERSION_MAJOR >= 3
  ledcWrite(pin, duty);
#else
  ledcWrite(pin == EN_PIN ? 2 : 3, duty);
#endif
}

// ---------- Motors ----------
void setMotor(int in1, int in2, int dir) {
  digitalWrite(in1, dir > 0 ? HIGH : LOW);
  digitalWrite(in2, dir < 0 ? HIGH : LOW);
}
// 1=up 2=down 3=left 4=right 0=stop
void moveCar(int cmd) {
  switch (cmd) {
    case 1: setMotor(R_IN1, R_IN2, 1);  setMotor(L_IN1, L_IN2, 1);  break;
    case 2: setMotor(R_IN1, R_IN2, -1); setMotor(L_IN1, L_IN2, -1); break;
    case 3: setMotor(R_IN1, R_IN2, 1);  setMotor(L_IN1, L_IN2, -1); break;
    case 4: setMotor(R_IN1, R_IN2, -1); setMotor(L_IN1, L_IN2, 1);  break;
    default: setMotor(R_IN1, R_IN2, 0); setMotor(L_IN1, L_IN2, 0);  break;
  }
  moving = (cmd != 0);
  lastMoveCmd = millis();
}

// ---------- Web page ----------
const char INDEX_HTML[] PROGMEM = R"rawliteral(
<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
body{font-family:sans-serif;text-align:center;background:#fff;margin:0}
img{width:100%;max-width:400px;background:#eee;min-height:200px}
.pad{display:grid;grid-template-columns:repeat(3,90px);gap:10px;justify-content:center;margin:10px 0}
button{height:70px;font-size:36px;color:red;background:#000;border:0;border-radius:20px;touch-action:none;user-select:none;-webkit-user-select:none}
button:active{background:#333}
.row{display:flex;align-items:center;justify-content:center;gap:10px;margin:8px}
input[type=range]{width:220px}
</style></head><body>
<img id="cam">
<div class="pad">
 <span></span><button id="b1">&#8679;</button><span></span>
 <button id="b3">&#8678;</button><button id="b0">&#9632;</button><button id="b4">&#8680;</button>
 <span></span><button id="b2">&#8681;</button><span></span>
</div>
<div class="row"><b>Speed</b><input type="range" min="0" max="255" value="150" id="sp"></div>
<div class="row"><b>Light</b><input type="range" min="0" max="255" value="0" id="li"></div>
<div class="row"><button id="snap" style="width:200px;height:50px;font-size:20px;color:#fff">Photo</button></div>
<img id="shot" style="display:none;margin-top:8px">
<a id="dl" style="display:none" download="leaf.jpg">Photo save kara</a>
<script>
function send(v,x){fetch('/cmd?var='+v+'&val='+x).catch(function(){});}
var timer=null;
function press(d){send('move',d);clearInterval(timer);timer=setInterval(function(){send('move',d);},200);}
function release(){clearInterval(timer);timer=null;send('move',0);}
[1,2,3,4].forEach(function(d){
 var b=document.getElementById('b'+d);
 b.onpointerdown=function(e){e.preventDefault();press(d);};
 b.onpointerup=release;b.onpointerleave=release;b.onpointercancel=release;
 b.oncontextmenu=function(e){e.preventDefault();};
});
document.getElementById('b0').onclick=function(){send('move',0);};
document.getElementById('sp').oninput=function(){send('speed',this.value);};
document.getElementById('li').oninput=function(){send('light',this.value);};
document.getElementById('snap').onclick=function(){
 fetch('/capture?t='+Date.now()).then(function(r){return r.blob();}).then(function(b){
  var u=URL.createObjectURL(b);
  var s=document.getElementById('shot');s.src=u;s.style.display='block';
  var a=document.getElementById('dl');a.href=u;a.style.display='block';
 }).catch(function(){alert('Photo failed');});
};
window.onload=function(){
 document.getElementById('cam').src='http://'+location.hostname+':81/stream';
 send('speed',document.getElementById('sp').value);
};
</script></body></html>
)rawliteral";

static esp_err_t index_handler(httpd_req_t *req) {
  httpd_resp_set_type(req, "text/html");
  return httpd_resp_send(req, INDEX_HTML, HTTPD_RESP_USE_STRLEN);
}

static esp_err_t cmd_handler(httpd_req_t *req) {
  char query[64], var[16], val[16];
  if (httpd_req_get_url_query_str(req, query, sizeof(query)) != ESP_OK ||
      httpd_query_key_value(query, "var", var, sizeof(var)) != ESP_OK ||
      httpd_query_key_value(query, "val", val, sizeof(val)) != ESP_OK) {
    httpd_resp_send_404(req);
    return ESP_FAIL;
  }
  int v = atoi(val);
  if (!strcmp(var, "move")) moveCar(v);
  else if (!strcmp(var, "speed")) pwmWrite(EN_PIN, constrain(v, 0, 255));
  else if (!strcmp(var, "light")) pwmWrite(LIGHT_PIN, constrain(v, 0, 255));
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");   // app sathi CORS
  httpd_resp_send(req, "OK", 2);
  return ESP_OK;
}

// ---------- Photo capture (RGB565 -> JPEG) ----------
static esp_err_t capture_handler(httpd_req_t *req) {
  if (!cameraOK) {
    httpd_resp_send_500(req);
    return ESP_FAIL;
  }
  camera_fb_t *fb = esp_camera_fb_get();
  if (!fb) {
    httpd_resp_send_500(req);
    return ESP_FAIL;
  }
  uint8_t *jpg = NULL;
  size_t jpgLen = 0;
  bool ok = frame2jpg(fb, PHOTO_QUALITY, &jpg, &jpgLen);
  esp_camera_fb_return(fb);
  if (!ok) {
    httpd_resp_send_500(req);
    return ESP_FAIL;
  }
  httpd_resp_set_type(req, "image/jpeg");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
  httpd_resp_set_hdr(req, "Cache-Control", "no-cache");
  esp_err_t res = httpd_resp_send(req, (const char *)jpg, jpgLen);
  free(jpg);
  return res;
}

// ---------- Camera stream (RGB565 -> JPEG) ----------
static esp_err_t stream_handler(httpd_req_t *req) {
  if (!cameraOK) {
    httpd_resp_send_500(req);
    return ESP_FAIL;
  }
  httpd_resp_set_type(req, "multipart/x-mixed-replace;boundary=frame");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
  esp_err_t res = ESP_OK;
  char hdr[100];
  while (res == ESP_OK) {
    camera_fb_t *fb = esp_camera_fb_get();
    if (!fb) { delay(10); continue; }
    uint8_t *jpg = NULL;
    size_t jpgLen = 0;
    bool ok = frame2jpg(fb, STREAM_QUALITY, &jpg, &jpgLen);
    esp_camera_fb_return(fb);
    if (!ok) { delay(10); continue; }
    int hl = snprintf(hdr, sizeof(hdr),
        "\r\n--frame\r\nContent-Type: image/jpeg\r\nContent-Length: %u\r\n\r\n", (unsigned)jpgLen);
    res = httpd_resp_send_chunk(req, hdr, hl);
    if (res == ESP_OK) res = httpd_resp_send_chunk(req, (const char *)jpg, jpgLen);
    free(jpg);
  }
  return res;
}

void startServers() {
  httpd_config_t config = HTTPD_DEFAULT_CONFIG();
  config.server_port = 80;
  config.stack_size = 8192;          // JPEG convert sathi jast stack
  config.lru_purge_enable = true;

  httpd_uri_t index_uri   = {"/",        HTTP_GET, index_handler,   NULL};
  httpd_uri_t cmd_uri     = {"/cmd",     HTTP_GET, cmd_handler,     NULL};
  httpd_uri_t capture_uri = {"/capture", HTTP_GET, capture_handler, NULL};

  if (httpd_start(&controlServer, &config) == ESP_OK) {
    httpd_register_uri_handler(controlServer, &index_uri);
    httpd_register_uri_handler(controlServer, &cmd_uri);
    httpd_register_uri_handler(controlServer, &capture_uri);
  }

  config.server_port = 81;
  config.ctrl_port += 1;
  httpd_uri_t stream_uri = {"/stream", HTTP_GET, stream_handler, NULL};
  if (httpd_start(&streamServer, &config) == ESP_OK) {
    httpd_register_uri_handler(streamServer, &stream_uri);
  }
}

// ---------- Camera init ----------
bool initCamera() {
  camera_config_t config = {};
  config.ledc_channel = LEDC_CHANNEL_7;   // motor PWM shi clash nako mhanun
  config.ledc_timer = LEDC_TIMER_3;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
#if ESP_ARDUINO_VERSION_MAJOR >= 3
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.sccb_i2c_port = 0;
#else
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
#endif
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_RGB565;   // JPEG nahi (GC2145)
  config.jpeg_quality = 12;
  config.grab_mode = CAMERA_GRAB_LATEST;
  if (psramFound()) {
    config.frame_size = FRAMESIZE_QVGA;     // 320x240
    config.fb_location = CAMERA_FB_IN_PSRAM;
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_QQVGA;    // 160x120
    config.fb_location = CAMERA_FB_IN_DRAM;
    config.fb_count = 1;
  }
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed 0x%x\n", err);
    return false;
  }
  return true;
}

void setup() {
  Serial.begin(115200);
  delay(500);

  // Motor pins
  pinMode(R_IN1, OUTPUT); pinMode(R_IN2, OUTPUT);
  pinMode(L_IN1, OUTPUT); pinMode(L_IN2, OUTPUT);
  moveCar(0);

  // Camera aadhi, mag motor PWM
  cameraOK = initCamera();
  Serial.println(cameraOK ? "CAMERA OK" : "CAMERA FAILED");

  pwmSetup(EN_PIN);
  pwmSetup(LIGHT_PIN);
  pwmWrite(EN_PIN, 150);
  pwmWrite(LIGHT_PIN, 0);

  // WiFi: laptop hotspot la connect (kayam IP 192.168.137.100)
  WiFi.mode(WIFI_STA);
  WiFi.config(robotIP, gateway, subnet, dns);
  WiFi.begin(homeSsid, homePass);
  WiFi.setSleep(false);
  Serial.print("WiFi connecting");
  int tries = 0;
  while (WiFi.status() != WL_CONNECTED && tries < 40) {
    delay(500);
    Serial.print(".");
    tries++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("\nRobot IP: http://");
    Serial.println(WiFi.localIP());
  } else {
    WiFi.mode(WIFI_AP);
    WiFi.softAP(apSsid, apPass);
    Serial.print("\nAP mode: http://");
    Serial.println(WiFi.softAPIP());
  }

  startServers();
}

void loop() {
  // Failsafe: 600ms command nahi aali tar car thamb
  if (moving && millis() - lastMoveCmd > 600) {
    moveCar(0);
  }

  // WiFi tutla tar parat connect kara
  static unsigned long lastCheck = 0;
  if (millis() - lastCheck > 10000) {
    lastCheck = millis();
    if (WiFi.getMode() == WIFI_STA && WiFi.status() != WL_CONNECTED) {
      Serial.println("WiFi tutla, parat connect...");
      WiFi.disconnect();
      WiFi.begin(homeSsid, homePass);
    }
  }
  delay(20);
}