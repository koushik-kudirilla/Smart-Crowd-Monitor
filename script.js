// --- Configuration ---
const MQTT_BROKER_URL = "wss://broker.hivemq.com:8884/mqtt";
const MQTT_TOPICS = [
  "iot/crowd/people",
  "iot/crowd/temp",
  "iot/crowd/humidity",
  "iot/crowd/comfort",
  "iot/crowd/safety",
];

// Spot that receives real data from your product MQTT (iot/crowd/* topics)
const PRODUCT_SPOT_ID = "beach";

// Derive SPOTS from structured data (spots-data.js)
const SPOTS = Object.values(SPOTS_DATA);

// Real data from your product MQTT – only the product spot (e.g. Beach) uses this
const baseData = {
  people: 0,
  temp: 0,
  humidity: 0,
  comfort: 0,
  safety: 0,
  lastUpdated: null,
};

// Simulated base for non-product spots (Park, Temple, Museum)
const simulatedBase = {
  people: 80,
  temp: 26,
  humidity: 55,
  comfort: 6.5,
  safety: 2,
  lastUpdated: null,
};

const elements = {
  mqttStatusDot: document.getElementById("mqtt-status-dot"),
  mqttStatusText: document.getElementById("mqtt-status-text"),
  cityTitle: document.getElementById("city-title"),
  citySubtitle: document.getElementById("city-subtitle"),
  geoStatus: document.getElementById("geo-status"),
  spotsGrid: document.getElementById("spots-grid"),
  spotModal: document.getElementById("spot-modal"),
  modalClose: document.getElementById("modal-close"),
  modalTitle: document.getElementById("modal-title"),
  modalDescription: document.querySelector(".modal-description"),
  modalGallery: document.querySelector(".modal-gallery .gallery-main img"),
  modalGalleryThumbs: document.querySelector(".modal-gallery .gallery-thumbs"),
  modalBestTime: document.querySelector('[data-role="best-time"]'),
  modalLocation: document.querySelector('[data-role="location"]'),
  modalCrowdBar: document.querySelector(".crowd-fill-modal"),
  modalCrowdLabel: document.querySelector(".crowd-label-modal"),
  modalAlert: document.getElementById("modal-alert"),
  modalAlertSpotName: document.querySelector('[data-role="alert-spot-name"]'),
  modalGuideTip: document.querySelector('[data-role="guide-tip"]'),
  navToggle: document.getElementById("nav-toggle"),
  navMenu: document.getElementById("nav-menu"),
};

const uiState = {
  spotWidgets: {},
  map: null,
  markers: {},
  liveSpotData: {},
  modalGalleryIndex: 0,
  modalOpenSpotId: null,
};

// --- Utility functions ---
function setMqttStatus(status, text) {
  elements.mqttStatusDot.classList.remove("offline", "online", "connecting");
  elements.mqttStatusDot.classList.add(status);
  elements.mqttStatusText.textContent = text;
}

function animateNumber(el, to, options = {}) {
  const duration = options.duration ?? 450;
  const decimals = options.decimals ?? 0;
  const from = Number(el.dataset.currentValue ?? 0);
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 2);
    const value = from + (to - from) * eased;
    el.textContent = value.toFixed(decimals);
    el.dataset.currentValue = value.toFixed(decimals);
    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function computeSafetyLabel(level) {
  if (level <= 2) return { label: "Safe", class: "status-safe" };
  if (level <= 5) return { label: "Crowd buildup", class: "status-warning" };
  return { label: "Overcrowding risk", class: "status-danger" };
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

function scaleForSpot(baseValue, spot, variance) {
  const jitter = (Math.random() - 0.5) * variance * 2;
  return baseValue * (spot.offsetFactor + jitter);
}

// --- Tourist spot cards creation ---
function createSpotCard(spot) {
  const card = document.createElement("article");
  card.className = "spot-card";
  card.id = `spot-${spot.id}`;
  card.dataset.spotId = spot.id;
  card.setAttribute("role", "button");
  card.tabIndex = 0;

  const tagLabel = spot.isProductNode ? "Your device" : "Live stream";
  const tagClass = spot.isProductNode ? "spot-tag spot-tag-product" : "spot-tag";
  card.innerHTML = `
    <div class="spot-header">
      <div class="spot-title">
        <h3>${spot.name}</h3>
        <span>${spot.type} · ${spot.isProductNode ? "Product MQTT" : "IoT node"}</span>
      </div>
      <span class="${tagClass}">${tagLabel}</span>
    </div>
    <div class="spot-metrics">
      <div class="metric">
        <span class="metric-label">People count</span>
        <div class="metric-value"><span class="value" data-metric="people">0</span></div>
      </div>
      <div class="metric">
        <span class="metric-label">Temperature</span>
        <div class="metric-value"><span class="value" data-metric="temp">0</span><span class="metric-unit">°C</span></div>
      </div>
      <div class="metric">
        <span class="metric-label">Humidity</span>
        <div class="metric-value"><span class="value" data-metric="humidity">0</span><span class="metric-unit">%</span></div>
      </div>
      <div class="metric">
        <span class="metric-label">Comfort score</span>
        <div class="metric-value"><span class="value" data-metric="comfort">0</span><span class="metric-unit">/ 10</span></div>
      </div>
      <div class="metric">
        <span class="metric-label">Safety level</span>
        <div class="metric-value">
          <span class="value" data-metric="safety">0</span>
          <span class="metric-unit">/ 10</span>
        </div>
      </div>
      <div class="metric">
        <span class="metric-label">Safety status</span>
        <div class="metric-value">
          <span class="status-pill status-safe" data-role="safety-pill">
            <span class="status-dot-inline"></span>
            <span data-role="safety-label">Safe</span>
          </span>
        </div>
      </div>
    </div>
    <div class="spot-footer">
      <div class="crowd-bar-label">
        <span>Crowd level</span>
        <span><span data-role="crowd-percent">0</span>% capacity</span>
      </div>
      <div class="crowd-bar-wrapper">
        <div class="crowd-bar-fill" data-role="crowd-bar"></div>
      </div>
      <div class="spot-meta-row">
        <span><span class="pulse-dot"></span> Live MQTT feed</span>
        <span>Updated <span data-role="updated-label">just now</span></span>
      </div>
    </div>
  `;

  const valueEls = card.querySelectorAll(".value");
  valueEls.forEach((el) => {
    el.dataset.currentValue = "0";
  });

  elements.spotsGrid.appendChild(card);

  card.addEventListener("click", () => openSpotModal(spot.id));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openSpotModal(spot.id);
    }
  });

  uiState.spotWidgets[spot.id] = {
    card,
    values: {
      people: card.querySelector('[data-metric="people"]'),
      temp: card.querySelector('[data-metric="temp"]'),
      humidity: card.querySelector('[data-metric="humidity"]'),
      comfort: card.querySelector('[data-metric="comfort"]'),
      safety: card.querySelector('[data-metric="safety"]'),
    },
    crowdPercent: card.querySelector('[data-role="crowd-percent"]'),
    crowdBar: card.querySelector('[data-role="crowd-bar"]'),
    safetyPill: card.querySelector('[data-role="safety-pill"]'),
    safetyLabel: card.querySelector('[data-role="safety-label"]'),
    updatedLabel: card.querySelector('[data-role="updated-label"]'),
  };
}

function ensureCards() {
  SPOTS.forEach((spot) => {
    if (!uiState.spotWidgets[spot.id]) {
      createSpotCard(spot);
    }
  });
}

// --- Modal & spot details ---
const GUIDE_TIPS = [
  "This place is crowded right now. Try visiting early morning.",
  "Consider visiting during non-peak hours for a better experience.",
  "Weekday mornings are usually less crowded. Plan accordingly.",
];

function openSpotModal(spotId) {
  const spot = SPOTS_DATA[spotId];
  if (!spot) return;

  uiState.modalGalleryIndex = 0;
  uiState.modalOpenSpotId = spotId;
  elements.spotModal.classList.add("modal-visible");
  elements.spotModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  elements.modalTitle.textContent = spot.name;
  elements.modalDescription.textContent = spot.description;
  elements.modalBestTime.textContent = spot.bestVisitingTime;
  elements.modalLocation.textContent = spot.location;

  const live = uiState.liveSpotData[spotId];
  const capacityPercent = live ? live.capacityPercent : 0;
  elements.modalCrowdBar.style.width = `${capacityPercent}%`;
  elements.modalCrowdLabel.textContent = `${capacityPercent}% capacity`;

  const isOvercrowded = live && live.safetyLevel > 5;
  if (isOvercrowded) {
    elements.modalAlert.classList.remove("hidden");
    elements.modalAlertSpotName.textContent = spot.name;
    elements.modalGuideTip.textContent =
      GUIDE_TIPS[Math.floor(Math.random() * GUIDE_TIPS.length)];
  } else {
    elements.modalAlert.classList.add("hidden");
  }

  elements.modalGallery.src = spot.images[0];
  elements.modalGallery.alt = `${spot.name} - view 1`;
  elements.modalGalleryThumbs.innerHTML = spot.images
    .map(
      (src, i) =>
        `<button type="button" class="gallery-thumb ${i === 0 ? "active" : ""}" data-index="${i}" aria-label="View image ${i + 1}">
          <img src="${src}" alt="" loading="lazy" />
        </button>`
    )
    .join("");

  elements.modalGalleryThumbs.querySelectorAll(".gallery-thumb").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.index);
      uiState.modalGalleryIndex = idx;
      elements.modalGallery.src = spot.images[idx];
      elements.modalGallery.alt = `${spot.name} - view ${idx + 1}`;
      elements.modalGalleryThumbs.querySelectorAll(".gallery-thumb").forEach((t) => t.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

function closeSpotModal() {
  elements.spotModal.classList.remove("modal-visible");
  elements.spotModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  uiState.modalOpenSpotId = null;
}

function refreshModalCrowdIfOpen() {
  if (!uiState.modalOpenSpotId || !elements.spotModal.classList.contains("modal-visible")) return;
  const live = uiState.liveSpotData[uiState.modalOpenSpotId];
  if (!live) return;
  elements.modalCrowdBar.style.width = `${live.capacityPercent}%`;
  elements.modalCrowdLabel.textContent = `${live.capacityPercent}% capacity`;
  const spot = SPOTS_DATA[uiState.modalOpenSpotId];
  const isOvercrowded = live.safetyLevel > 5;
  if (isOvercrowded) {
    elements.modalAlert.classList.remove("hidden");
    elements.modalAlertSpotName.textContent = spot.name;
    if (!elements.modalGuideTip.textContent) {
      elements.modalGuideTip.textContent =
        GUIDE_TIPS[Math.floor(Math.random() * GUIDE_TIPS.length)];
    }
  } else {
    elements.modalAlert.classList.add("hidden");
  }
}

function initModal() {
  elements.modalClose.addEventListener("click", closeSpotModal);
  elements.spotModal.querySelector(".modal-backdrop").addEventListener("click", closeSpotModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && elements.spotModal.classList.contains("modal-visible")) {
      closeSpotModal();
    }
  });
}

// --- Data fan-out & UI update ---
function updateProductSpot(widgets, data) {
  const people = Math.round(clamp(data.people || 0, 0, 500));
  const temp = clamp(data.temp || 0, 18, 45);
  const humidity = Math.round(clamp(data.humidity || 0, 20, 100));
  const comfort = clamp(data.comfort || 0, 0, 10);
  const safetyLevel = clamp(data.safety || 0, 0, 10);
  const capacityPercent = Math.round(clamp((people / 500) * 100, 0, 100));

  animateNumber(widgets.values.people, people);
  animateNumber(widgets.values.temp, temp, { decimals: 1 });
  animateNumber(widgets.values.humidity, humidity);
  animateNumber(widgets.values.comfort, comfort, { decimals: 1 });
  animateNumber(widgets.values.safety, safetyLevel, { decimals: 1 });

  widgets.crowdPercent.textContent = capacityPercent.toString();
  widgets.crowdBar.style.width = `${capacityPercent}%`;

  const safetyInfo = computeSafetyLabel(safetyLevel);
  widgets.safetyPill.classList.remove("status-safe", "status-warning", "status-danger");
  widgets.safetyPill.classList.add(safetyInfo.class);
  widgets.safetyLabel.textContent = safetyInfo.label;

  widgets.updatedLabel.textContent = data.lastUpdated ? "from device" : "waiting for device…";
  uiState.liveSpotData[PRODUCT_SPOT_ID] = {
    people, temp, humidity, comfort, safetyLevel, capacityPercent, safetyInfo,
  };
  return safetyLevel > 5;
}

function updateSimulatedSpot(widgets, spot, data) {
  const scaledPeopleRaw = scaleForSpot(data.people || 0, spot, 0.25);
  const scaledPeople = Math.round(clamp(scaledPeopleRaw, 0, 500));
  const scaledTemp = clamp(scaleForSpot(data.temp || 28, spot, 0.08), 18, 45);
  const scaledHumidity = Math.round(
    clamp(scaleForSpot(data.humidity || 60, spot, 0.12), 20, 100)
  );

  const comfortBase =
    10 -
    Math.abs(scaledTemp - 26) * 0.18 -
    Math.abs(scaledHumidity - 55) * 0.045 -
    (scaledPeople / 500) * 3;
  const scaledComfort = clamp(
    ((data.comfort || comfortBase) + comfortBase) / 2,
    0,
    10
  );

  const safetyDerived =
    (data.safety + (scaledPeople / 500) * 10 + (10 - scaledComfort)) / 3;
  const safetyLevel = clamp(safetyDerived, 0, 10);

  const capacityPercent = Math.round(clamp((scaledPeople / 500) * 100, 0, 100));

  animateNumber(widgets.values.people, scaledPeople);
  animateNumber(widgets.values.temp, scaledTemp, { decimals: 1 });
  animateNumber(widgets.values.humidity, scaledHumidity);
  animateNumber(widgets.values.comfort, scaledComfort, { decimals: 1 });
  animateNumber(widgets.values.safety, safetyLevel, { decimals: 1 });

  widgets.crowdPercent.textContent = capacityPercent.toString();
  widgets.crowdBar.style.width = `${capacityPercent}%`;

  const safetyInfo = computeSafetyLabel(safetyLevel);
  widgets.safetyPill.classList.remove("status-safe", "status-warning", "status-danger");
  widgets.safetyPill.classList.add(safetyInfo.class);
  widgets.safetyLabel.textContent = safetyInfo.label;

  widgets.updatedLabel.textContent = "simulated";
  uiState.liveSpotData[spot.id] = {
    people: scaledPeople, temp: scaledTemp, humidity: scaledHumidity,
    comfort: scaledComfort, safetyLevel, capacityPercent, safetyInfo,
  };
  return safetyLevel > 5;
}

function updateSpotsFromBase() {
  SPOTS.forEach((spot) => {
    const widgets = uiState.spotWidgets[spot.id];
    if (!widgets) return;

    if (spot.id === PRODUCT_SPOT_ID) {
      updateProductSpot(widgets, baseData);
    } else {
      updateSimulatedSpot(widgets, spot, simulatedBase);
    }
  });
  refreshModalCrowdIfOpen();
}

// --- MQTT connection & data handling ---
let mqttClient = null;

function connectMqtt() {
  setMqttStatus("connecting", "Connecting to MQTT broker…");

  mqttClient = mqtt.connect(MQTT_BROKER_URL, {
    keepalive: 60,
    reconnectPeriod: 4000,
    clean: true,
  });

  mqttClient.on("connect", () => {
    setMqttStatus("online", "Connected to HiveMQ public broker");
    MQTT_TOPICS.forEach((t) => mqttClient.subscribe(t));
  });

  mqttClient.on("reconnect", () => {
    setMqttStatus("connecting", "Reconnecting to MQTT…");
  });

  mqttClient.on("close", () => {
    setMqttStatus("offline", "Disconnected from MQTT broker");
  });

  mqttClient.on("error", () => {
    setMqttStatus("offline", "MQTT error – using local simulation");
  });

  mqttClient.on("message", (topic, payload) => {
    const raw = payload.toString();
    const value = Number.parseFloat(raw);
    if (Number.isNaN(value)) return;

    if (topic === "iot/crowd/people") baseData.people = value;
    if (topic === "iot/crowd/temp") baseData.temp = value;
    if (topic === "iot/crowd/humidity") baseData.humidity = value;
    if (topic === "iot/crowd/comfort") baseData.comfort = value;
    if (topic === "iot/crowd/safety") baseData.safety = value;

    baseData.lastUpdated = new Date();
    updateSpotsFromBase();
  });
}

// --- Local simulation for non-product spots only (product spot is driven by your MQTT) ---
function startLocalSimulation() {
  setInterval(() => {
    simulatedBase.people = 80 + Math.random() * 350;
    simulatedBase.temp = 24 + Math.random() * 8;
    simulatedBase.humidity = 45 + Math.random() * 30;
    simulatedBase.comfort = 6 + Math.random() * 3;
    simulatedBase.safety = Math.random() * 10;
    simulatedBase.lastUpdated = new Date();
    updateSpotsFromBase();
  }, 3000);
}

// --- Geolocation & map setup ---
function initMap(latitude, longitude) {
  const center = [latitude, longitude];

  uiState.map = L.map("map").setView(center, 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(uiState.map);

  SPOTS.forEach((spot, index) => {
    const [lat, lng] = spot.coordinates || [
      latitude + 0.01 * (index - 1.5),
      longitude + 0.01 * ((index % 2) - 0.5),
    ];
    const marker = L.marker([lat, lng]).addTo(uiState.map);
    marker.bindPopup(`<strong>${spot.name}</strong><br>${spot.type} · IoT node`);
    uiState.markers[spot.id] = marker;
  });
}

function resolveCityName(latitude, longitude) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;

  fetch(url, {
    headers: {
      "Accept": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      const address = data.address || {};
      const cityName =
        address.city ||
        address.town ||
        address.village ||
        address.county ||
        "your area";

      elements.cityTitle.textContent = `Tourist Spots near ${cityName}`;
      elements.citySubtitle.textContent =
        "Live IoT nodes visualised for nearby public attractions.";
      elements.geoStatus.textContent = `Approx. location: ${cityName}`;
      elements.geoStatus.className = "pill pill-success";
    })
    .catch(() => {
      elements.citySubtitle.textContent =
        "Could not resolve exact city name. Showing generic nearby spots.";
      elements.geoStatus.textContent = "Location detected";
      elements.geoStatus.className = "pill pill-warning";
    });
}

function initGeolocationAndMap() {
  if (!navigator.geolocation) {
    elements.citySubtitle.textContent =
      "Geolocation not supported in this browser. Using a generic city view.";
    elements.geoStatus.textContent = "Geolocation unavailable";
    elements.geoStatus.className = "pill pill-error";
    const defaultLat = 20.5937;
    const defaultLng = 78.9629;
    elements.cityTitle.textContent = "Tourist Spots near your area";
    initMap(defaultLat, defaultLng);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      initMap(latitude, longitude);
      resolveCityName(latitude, longitude);
    },
    () => {
      elements.citySubtitle.textContent =
        "Location access denied. Showing a generic city map and sample spots.";
      elements.geoStatus.textContent = "Location blocked";
      elements.geoStatus.className = "pill pill-error";
      const defaultLat = 20.5937;
      const defaultLng = 78.9629;
      initMap(defaultLat, defaultLng);
    },
    {
      enableHighAccuracy: false,
      timeout: 7000,
      maximumAge: 60000,
    }
  );
}

// --- Bootstrap ---
window.addEventListener("DOMContentLoaded", () => {
  ensureCards();
  updateSpotsFromBase();
  initModal();
  initNavToggle();
  initGeolocationAndMap();
  connectMqtt();
  startLocalSimulation();
});

function initNavToggle() {
  if (!elements.navToggle || !elements.navMenu) return;
  elements.navToggle.addEventListener("click", () => {
    const expanded = elements.navToggle.getAttribute("aria-expanded") === "true";
    elements.navToggle.setAttribute("aria-expanded", !expanded);
    elements.navMenu.classList.toggle("nav-open");
  });
  document.querySelectorAll(".nav-menu a").forEach((a) => {
    a.addEventListener("click", () => {
      elements.navMenu.classList.remove("nav-open");
      elements.navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

