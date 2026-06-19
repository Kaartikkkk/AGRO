
---

<p align="center" style="font-size: 28px; font-weight: bold;">
AgroSmart — AI-Powered Smart Farming Platform for Indian Farmers
</p>

<p align="center" style="font-size: 16px;">
A Full-Stack Precision Agriculture System with Deep Learning Disease Detection,<br/>
Explainable AI, Real-Time Weather Integration, and Gemini-Powered Advisory
</p>

<p align="center">

| Field | Details |
|:---|:---|
| **Project Title** | AgroSmart — AI-Powered Smart Farming Platform for Indian Farmers |
| **Version** | 1.2 (Multi-Land Architecture) |
| **Date** | June 2026 |
| **Author** | Kartik |
| **Institution** | Independent Full-Stack Development Project |
| **Domain** | Precision Agriculture, Deep Learning, Full-Stack Web Development |

</p>

---

# Table of Contents

1. [Abstract](#1-abstract)
2. [Introduction](#2-introduction)
   - 2.1 [Background](#21-background)
   - 2.2 [Problem Statement](#22-problem-statement)
   - 2.3 [Motivation](#23-motivation)
   - 2.4 [Objectives](#24-objectives)
   - 2.5 [Scope](#25-scope)
   - 2.6 [Assumptions and Constraints](#26-assumptions-and-constraints)
3. [Literature Review / Related Work](#3-literature-review--related-work)
4. [System Overview](#4-system-overview)
5. [Tech Stack — Complete & Detailed](#5-tech-stack--complete--detailed)
   - 5.1 [Frontend](#51-frontend)
   - 5.2 [Backend (Node.js Server)](#52-backend-nodejs-server)
   - 5.3 [AI Server (Flask)](#53-ai-server-flask)
   - 5.4 [Database Schema](#54-database-schema)
   - 5.5 [DevOps / Tools](#55-devops--tools)
6. [System Architecture (Detailed)](#6-system-architecture-detailed)
   - 6.1 [Frontend Architecture](#61-frontend-architecture)
   - 6.2 [Backend Architecture](#62-backend-architecture)
   - 6.3 [AI Server Architecture](#63-ai-server-architecture)
7. [Modules & Features (Detailed)](#7-modules--features-detailed)
   - 7.1 [User Authentication Module](#71-user-authentication-module)
   - 7.2 [Plant Disease Detection Module](#72-plant-disease-detection-module)
   - 7.3 [AI Recommendations Module](#73-ai-recommendations-module)
   - 7.4 [AgroBot Chatbot Module](#74-agrobot-chatbot-module)
   - 7.5 [Land Management Module](#75-land-management-module)
   - 7.6 [Weather Forecast Module](#76-weather-forecast-module)
   - 7.7 [Mandi Prices Module](#77-mandi-prices-module)
   - 7.8 [Reminders Module](#78-reminders-module)
   - 7.9 [Fertilizer Hub Module](#79-fertilizer-hub-module)
   - 7.10 [Profile & Onboarding Module](#710-profile--onboarding-module)
   - 7.11 [Dashboard Module](#711-dashboard-module)
   - 7.12 [Location System Module](#712-location-system-module)
   - 7.13 [Landing Page Module](#713-landing-page-module)
8. [Database Design](#8-database-design)
9. [API Documentation](#9-api-documentation)
10. [ML Model Documentation](#10-ml-model-documentation)
    - 10.1 [Dataset](#101-dataset)
    - 10.2 [Model Architecture](#102-model-architecture)
    - 10.3 [Training](#103-training)
    - 10.4 [Evaluation](#104-evaluation)
    - 10.5 [Grad-CAM Explainability](#105-grad-cam-explainability)
    - 10.6 [SHAP Explainability](#106-shap-explainability)
    - 10.7 [TFLite Conversion](#107-tflite-conversion)
    - 10.8 [Hyperparameter Tuning (Optuna)](#108-hyperparameter-tuning-optuna)
11. [Security](#11-security)
12. [Performance & Optimization](#12-performance--optimization)
13. [Challenges & Solutions](#13-challenges--solutions)
14. [Testing](#14-testing)
15. [Future Scope](#15-future-scope)
16. [Conclusion](#16-conclusion)
17. [References](#17-references)
18. [Appendix](#18-appendix)

---

# 1. Abstract

**AgroSmart** is a comprehensive, AI-powered smart farming platform purpose-built for Indian farmers. It addresses the critical gap between advanced agricultural technology and the practical needs of India's 150+ million farming households by providing an accessible, web-based platform that integrates deep learning plant disease detection, explainable AI diagnostics, real-time weather monitoring, government mandi price tracking, intelligent farm management, and a Gemini-powered agricultural chatbot — all unified under a single, modern interface.

At its core, AgroSmart employs a **multimodal deep learning architecture** combining EfficientNetB3 (a state-of-the-art convolutional neural network) as the image feature extractor with a Bidirectional LSTM (BiLSTM) text branch for symptom-guided disease classification. The system classifies **38 plant disease categories** across **14 crop species** using a rigorous **3-phase training pipeline**: frozen-base pre-training on PlantVillage, fine-tuning of the top 30 EfficientNet layers, and domain adaptation on PlantDoc for real-world robustness. Grad-CAM and SHAP explainability modules generate visual heatmaps that highlight the exact leaf regions influencing the model's diagnosis, fostering farmer trust in AI-driven decisions.

The platform is architected as a **3-tier distributed system**: a React 19 + Vite + Tailwind CSS v4 frontend delivering a responsive, animation-rich UI with Framer Motion; an Express.js 5 + Sequelize ORM + PostgreSQL/PostGIS backend providing RESTful APIs, JWT authentication, and spatial data management; and a Python Flask AI microservice running TensorFlow/Keras inference with Gunicorn for production-grade serving. Inter-service communication is handled via Axios/REST with multipart form-data proxying for image uploads.

The **Google Gemini 2.5 Flash API** powers two intelligent modules: (1) a context-aware farm recommendation engine that ingests plot metadata, crop rotation history, live weather data, and recent disease scan results to generate actionable agricultural advice in structured JSON format; and (2) **AgroBot**, a conversational farming assistant with bilingual (English/Hindi) support, farming-specific system prompts, and graceful offline fallback via a curated rule-based dictionary covering irrigation, pest control, fertilizers, and crop rotation.

Additional modules include **real-time weather forecasting** (OpenWeatherMap API with 10-minute caching), **government mandi price tracking** (data.gov.in API with intelligent fallback), **multi-plot land management** with PostGIS spatial boundaries, **agricultural task reminders** with priority categorization, and a **crop rotation history** tracker. The system supports **10 Sequelize data models** with comprehensive relational associations (one-to-many, cascade deletes) and uses UUID primary keys for security.

AgroSmart represents a significant contribution to precision agriculture for Indian farming, combining modern web technologies with production-grade deep learning to democratize access to agricultural AI tools.

---

# 2. Introduction

## 2.1 Background

India is fundamentally an agrarian nation. Agriculture employs approximately **42% of the country's workforce** and contributes around **18% to GDP** (Economic Survey of India, 2024). Despite this massive footprint, Indian agriculture faces systemic challenges that threaten food security, farmer livelihoods, and rural economic stability:

- **Crop Disease Losses**: Plant diseases cause an estimated **15–25% annual crop loss** in India, translating to billions of dollars in economic damage. Farmers in remote areas often lack access to plant pathologists and rely on visual guessing, leading to misdiagnosis and inappropriate chemical treatments.
- **Information Asymmetry**: Smallholder farmers (owning <2 hectares, representing ~86% of Indian farmers) have limited access to timely weather forecasts, market prices, and expert agricultural advice. They depend on intermediaries who extract value from the supply chain.
- **Climate Vulnerability**: Erratic monsoons, rising temperatures, and extreme weather events disproportionately impact Indian agriculture. Without real-time weather data and adaptive recommendations, farmers cannot make informed decisions about irrigation, sowing, and harvesting.
- **Digital Divide**: While India has seen rapid smartphone adoption, existing agricultural apps are often fragmented — one app for weather, another for market prices, a separate tool for disease detection — creating cognitive overload and reducing adoption rates.
- **Language Barriers**: Most agricultural technology platforms operate exclusively in English, excluding the vast majority of Indian farmers who communicate in Hindi and regional languages.

## 2.2 Problem Statement

Existing smart farming tools in India suffer from critical limitations:

1. **Fragmentation**: Farmers must juggle multiple disconnected applications for weather, disease detection, market prices, and farm management.
2. **Low Accuracy**: Many disease detection apps use simplistic CNN architectures (basic ResNet or VGG) without explainability, producing "black-box" diagnoses that farmers distrust.
3. **No Contextual Intelligence**: Standalone disease detection apps identify diseases but fail to provide context-aware treatment recommendations that account for the farmer's location, crop rotation history, soil type, and current weather conditions.
4. **Poor Offline Resilience**: Apps that depend entirely on cloud APIs become useless in low-connectivity rural areas — precisely where they are needed most.
5. **Generic Advice**: AI-powered advisory tools provide generic farming advice without considering individual farm parameters (plot size, irrigation source, previous crops, growth stage).

**AgroSmart addresses all five of these limitations** by providing a unified, intelligent platform that combines disease detection, explainability, context-aware AI recommendations, weather monitoring, market prices, and comprehensive farm management in a single application — with bilingual support and offline fallback mechanisms.

## 2.3 Motivation

The motivation for building AgroSmart stems from a fundamental belief that **artificial intelligence should serve those who need it most**. Indian smallholder farmers — who feed 1.4 billion people — deserve access to the same caliber of precision agriculture technology available to commercial farms in developed nations.

Key motivational drivers:

- **Social Impact**: A single accurate disease diagnosis can save an entire crop season for a marginal farmer. AgroSmart's Grad-CAM explainability shows farmers *why* the AI made its diagnosis, building trust and encouraging adoption.
- **Economic Empowerment**: Real-time mandi prices help farmers identify the best market for their produce, potentially increasing income by 10–15%.
- **Technological Challenge**: Building a multimodal deep learning system (image + text fusion), integrating it into a 3-tier web architecture with real-time APIs, and making it accessible to non-technical users is a significant engineering challenge.
- **India-Specific Design**: Unlike global agricultural platforms, AgroSmart is designed from the ground up for Indian agriculture — supporting Indian crop varieties, Kharif/Rabi seasons, local mandi markets, KVK referrals, and Hindi language support.

## 2.4 Objectives

The project objectives are:

1. **Build a multimodal deep learning model** (EfficientNetB3 + BiLSTM) capable of classifying 38 plant diseases across 14 crop species with >90% accuracy on controlled datasets and robust performance on real-world PlantDoc images.
2. **Implement Grad-CAM and SHAP explainability** to generate visual heatmaps highlighting disease-affected leaf regions, enabling farmers to verify AI diagnoses against their own observations.
3. **Develop a 3-tier web application** with a responsive React 19 frontend, Express.js REST API backend with PostgreSQL/PostGIS, and a Flask AI microservice — all communicating via RESTful APIs.
4. **Integrate Google Gemini 2.5 Flash** for context-aware farm recommendations and a bilingual conversational chatbot (AgroBot) with offline fallback capabilities.
5. **Provide real-time weather monitoring** via OpenWeatherMap API with agricultural alert generation (frost risk, heat stress, fungal disease risk, spray conditions).
6. **Track government mandi prices** via the data.gov.in API with intelligent fallback data for states and crops.
7. **Implement comprehensive farm management** with multi-plot support, crop rotation tracking, soil data, PostGIS polygon boundaries, and agricultural reminders.
8. **Ensure security** through JWT authentication, bcrypt password hashing, input validation, CORS policies, and Sequelize-based SQL injection prevention.
9. **Optimize for production deployment** with Gunicorn WSGI serving, TFLite model conversion (float32 + INT8 quantization), and in-memory caching strategies.
10. **Support future extensibility** for mobile apps (React Native), IoT sensor integration, multilingual expansion, and satellite imagery integration.

## 2.5 Scope

The scope of AgroSmart v1.2 encompasses:

**In Scope:**
- Web-based platform (desktop and mobile-responsive)
- Plant disease detection for 38 classes across 14 crops
- Multimodal (image + text) and unimodal (image-only) model architectures
- Grad-CAM and SHAP/Saliency map explainability
- Google Gemini-powered recommendations and chatbot
- Real-time weather (OpenWeatherMap), mandi prices (data.gov.in)
- Multi-plot farm management with PostGIS spatial data
- JWT-based authentication and user management
- Bilingual support (English and Hindi)
- TFLite model export for future mobile deployment

**Out of Scope (v1.2):**
- Native mobile application (planned for future)
- IoT sensor integration (soil moisture, temperature probes)
- Satellite/drone imagery processing
- Crop price prediction / forecasting models
- Government scheme eligibility engine
- Multilingual support beyond English/Hindi

## 2.6 Assumptions and Constraints

**Assumptions:**
- Users have access to a smartphone or computer with a modern web browser and an internet connection (at least intermittent connectivity for API calls).
- Farmers can capture leaf images using their device camera at reasonable quality (minimum 224×224 pixels after resize).
- The PlantVillage and PlantDoc datasets are representative of disease manifestations common to Indian crops.

**Constraints:**
- The AI model is trained on 38 specific disease classes; diseases outside this taxonomy will produce unreliable predictions.
- Gemini API has rate limits and quota restrictions that may affect AI recommendation and chatbot availability during high-usage periods — mitigated by fallback mechanisms.
- PostgreSQL with PostGIS extension is required, which may add setup complexity compared to simpler databases.
- The multimodal text branch relies on synthetic symptom data generated from templates, as no large-scale curated dataset of farmer-described symptoms exists in English/Hindi.

---

# 3. Literature Review / Related Work

## 3.1 Existing Smart Farming Tools and Their Limitations

| Tool / Platform | Disease Detection | Weather | Market Prices | Farm Mgmt | AI Chatbot | Explainability | Limitation |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **Plantix** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | Single-purpose; no farm management or advisory |
| **Kisan Suvidha** | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | Government app; no AI, poor UX, limited adoption |
| **AgriApp** | ❌ | ✅ | ❌ | Partial | ❌ | ❌ | Advisory is human-written, not personalized |
| **CropIn** | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | Enterprise-focused; expensive, not for smallholders |
| **FarmBee** | ❌ | ✅ | Partial | ❌ | ❌ | ❌ | SMS-based; outdated interface |
| **AgroSmart** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Unified platform with full feature coverage** |

## 3.2 Research in Plant Disease Detection

**CNNs for Plant Disease Classification:**
- Mohanty et al. (2016) demonstrated that deep CNNs (AlexNet, GoogLeNet) can classify 26 diseases across 14 crops using the PlantVillage dataset, achieving up to 99.35% accuracy on held-out test sets. However, performance degraded significantly on real-world images due to the controlled lab conditions of PlantVillage.
- Ferentinos (2018) extended this work using VGG, ResNet, and Inception architectures, confirming high accuracy on PlantVillage but noting the "domain gap" problem when deploying to field conditions.

**EfficientNet for Image Classification:**
- Tan & Le (2019) introduced the EfficientNet family, which uses compound scaling (depth, width, resolution) to achieve state-of-the-art accuracy with significantly fewer parameters than ResNet and VGG. EfficientNetB3 (12M parameters, 300×300 default resolution) provides an optimal balance between accuracy and computational cost for edge deployment.

**Transfer Learning and Domain Adaptation:**
- Singh et al. (2020) showed that fine-tuning ImageNet-pretrained models on PlantVillage followed by domain adaptation on PlantDoc (a dataset of real-world leaf images) significantly improves generalization to field conditions. This is the exact 3-phase strategy adopted by AgroSmart.

**Explainable AI (XAI) in Agriculture:**
- Selvaraju et al. (2017) introduced Grad-CAM (Gradient-weighted Class Activation Mapping), which produces visual explanations by highlighting image regions that most influence a CNN's prediction. In agricultural contexts, Grad-CAM heatmaps show farmers *which part of the leaf* exhibits disease symptoms, transforming the model from a "black box" into a transparent diagnostic tool.
- Lundberg & Lee (2017) introduced SHAP (SHapley Additive exPlanations), which provides a unified measure of feature importance grounded in game theory. AgroSmart uses SHAP DeepExplainer for detailed per-pixel attribution analysis.

**Multimodal Approaches:**
- Recent work by Karthik et al. (2022) explored combining visual features with textual metadata (symptoms, environmental conditions) for improved disease classification. AgroSmart's EfficientNetB3 + BiLSTM multimodal architecture extends this idea by fusing image embeddings with tokenized symptom descriptions via a dense fusion layer.

## 3.3 Gap Analysis: What AgroSmart Improves Upon

1. **Unified Platform**: Unlike Plantix (disease only) or Kisan Suvidha (weather/prices only), AgroSmart integrates all essential farming tools into one application.
2. **Explainability**: No existing Indian farming app provides Grad-CAM or SHAP visual explanations for disease diagnoses.
3. **Context-Aware AI**: AgroSmart's Gemini-powered recommendation engine considers plot metadata, weather, crop rotation history, and disease scan results — not generic advice.
4. **Multimodal Architecture**: The EfficientNetB3 + BiLSTM fusion allows the model to incorporate farmer-described symptoms alongside leaf images.
5. **3-Phase Training Pipeline**: Domain adaptation from PlantVillage to PlantDoc improves real-world robustness beyond what single-dataset training can achieve.
6. **Bilingual Chatbot**: AgroBot supports both English and Hindi with farming-specific system prompts and offline fallback.
7. **TFLite Export**: The INT8 quantized TFLite model enables future mobile deployment for offline inference.

---

# 4. System Overview

## 4.1 High-Level Architecture

AgroSmart follows a **3-tier distributed microservice architecture**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         TIER 1: FRONTEND                                │
│                    React 19 + Vite + Tailwind v4                        │
│                        Port: 5173 (dev)                                 │
│                                                                         │
│   ┌──────┐ ┌──────────┐ ┌────────┐ ┌─────────┐ ┌──────────┐           │
│   │ Auth │ │ Disease  │ │Weather │ │  Mandi  │ │ AgroBot  │  ...       │
│   │Pages │ │Detection │ │Forecast│ │ Prices  │ │ Chatbot  │           │
│   └──┬───┘ └────┬─────┘ └───┬────┘ └────┬────┘ └────┬─────┘           │
│      │          │            │           │           │                   │
│      └──────────┴────────────┴───────────┴───────────┘                  │
│                         Axios HTTP Client                               │
└────────────────────────────┬────────────────────────────────────────────┘
                             │ REST API (JSON + Multipart)
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         TIER 2: BACKEND                                 │
│                   Node.js + Express.js 5                                │
│                        Port: 5000                                       │
│                                                                         │
│   ┌────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐                │
│   │  Auth  │ │  Disease  │ │  Weather  │ │   Mandi   │                │
│   │ Routes │ │  Routes   │ │  Routes   │ │  Routes   │   ...          │
│   └────┬───┘ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘                │
│        │           │             │              │                       │
│   ┌────┴───────────┴─────────────┴──────────────┴─────┐                │
│   │              Middleware Chain                       │                │
│   │   (CORS → JSON Parser → JWT Auth → Multer)        │                │
│   └────────────────────┬──────────────────────────────┘                │
│                        │                                                │
│   ┌────────────────────┴──────────────────────────────┐                │
│   │           Sequelize ORM + PostgreSQL/PostGIS       │                │
│   │   (Users, Farms, DiseaseScans, Reminders, etc.)   │                │
│   └───────────────────────────────────────────────────┘                │
│                                                                         │
│   ┌───────────────────────────────────────────────────┐                │
│   │        External API Integrations                   │                │
│   │  • Google Gemini 2.5 Flash (Recommendations/Chat) │                │
│   │  • OpenWeatherMap (Weather + Geocoding)            │                │
│   │  • data.gov.in (Mandi Prices)                     │                │
│   │  • Nominatim/OSM (Reverse Geocoding)              │                │
│   └───────────────────────────────────────────────────┘                │
└────────────────────────────┬────────────────────────────────────────────┘
                             │ REST API (Multipart → Flask)
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       TIER 3: AI SERVER                                 │
│                    Python + Flask + Gunicorn                             │
│                        Port: 5001                                       │
│                                                                         │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │
│   │   /predict   │  │   /health    │  │  /classes    │                │
│   │  (Inference) │  │  (Monitor)   │  │  (Metadata)  │                │
│   └──────┬───────┘  └──────────────┘  └──────────────┘                │
│          │                                                              │
│   ┌──────┴──────────────────────────────────────────┐                  │
│   │        TensorFlow/Keras Inference Engine         │                  │
│   │   EfficientNetB3 + BiLSTM (Multimodal)          │                  │
│   │   or EfficientNetB3 (Unimodal)                  │                  │
│   └──────┬──────────────────────────────────────────┘                  │
│          │                                                              │
│   ┌──────┴─────────┐  ┌─────────────────┐                             │
│   │  Grad-CAM      │  │  Treatment DB   │                             │
│   │  Heatmap Gen   │  │  (JSON Lookup)  │                             │
│   └────────────────┘  └─────────────────┘                             │
└─────────────────────────────────────────────────────────────────────────┘
```

## 4.2 Data Flow: User → UI → Backend → AI Server → Response

1. **User Interaction**: The farmer opens the Disease Detection page, captures or uploads a leaf image, optionally enters symptom text and selects a crop type.
2. **Frontend Processing**: React collects the image file, symptoms, crop type, and selected farm ID. Axios sends a `POST /api/disease/predict` request with `multipart/form-data`.
3. **Backend Proxying**: Express.js receives the request, validates the JWT token, extracts the image buffer via Multer (memory storage), creates a `FormData` object, and proxies the request to the Flask AI server at `http://localhost:5001/predict`.
4. **AI Inference**: Flask receives the image, preprocesses it (resize to 224×224, normalize), prepares text input (tokenize + pad symptoms), runs EfficientNetB3 inference, applies crop-type prior masking, generates Grad-CAM heatmap, looks up treatment data, and returns a JSON response with prediction, top-3 alternatives, treatment, Grad-CAM base64 image, and processing time.
5. **Backend Persistence**: Express.js receives the Flask response, saves the original image and Grad-CAM image to disk, persists the scan record in PostgreSQL (DiseaseScan table), and returns the enriched response to the frontend.
6. **Frontend Display**: React renders the disease name, confidence score, severity level, treatment protocol, Grad-CAM overlay, and top-3 differential diagnosis.

## 4.3 Deployment Overview

| Component | Local Port | Production Server | Process Manager |
|:---|:---:|:---|:---|
| Frontend (React/Vite) | 5173 | Vite Preview / Nginx | `npm run dev` |
| Backend (Express.js) | 5000 | Node.js direct / PM2 | `npm start` / `nodemon` |
| AI Server (Flask) | 5001 | Gunicorn (2 workers, 120s timeout) | `gunicorn -c gunicorn_config.py api.app:app` |
| PostgreSQL + PostGIS | 5432 | PostgreSQL 18+ | System service |

A unified launcher script ([app.py](file:///Users/kartik/Documents/Projects/AGRO/app.py)) starts all three servers simultaneously using `subprocess.Popen` with health monitoring and graceful shutdown on `Ctrl+C`.

---

# 5. Tech Stack — Complete & Detailed

## 5.1 Frontend

| Technology | Category | Version | Role in AgroSmart | Why Chosen Over Alternatives |
|:---|:---|:---:|:---|:---|
| **React** | UI Library | 19.2.4 | Core component rendering, state management, and SPA routing | React 19 introduces concurrent rendering features and improved Suspense boundaries. Chosen over Vue for its larger ecosystem and over Angular for faster prototyping. |
| **Vite** | Build Tool | 8.0.4 | Development server (HMR), production bundling, and module resolution | 10-100× faster cold start than Create React App (CRA). Native ESM support eliminates bundling during development. Chosen over CRA (deprecated) and Next.js (SSR overhead unnecessary for this SPA). |
| **Tailwind CSS** | CSS Framework | 4.2.2 | Utility-first styling for all UI components | v4 uses a Vite plugin for zero-config integration and CSS-first configuration. Chosen over Bootstrap (less flexible, opinionated components) and styled-components (runtime CSS-in-JS overhead). |
| **Framer Motion** | Animation Library | 12.38.0 | Page transitions, component animations, hover effects, loading skeletons | Declarative animation API that integrates naturally with React's component model. Chosen over GSAP (imperative API, larger bundle) and CSS animations (limited orchestration capabilities). |
| **React Router DOM** | Routing | 7.14.0 | Client-side routing, protected routes, dynamic URL parameters | De facto standard for React SPA routing. v7 provides type-safe route definitions and improved data loading patterns. |
| **Axios** | HTTP Client | 1.14.0 | All API communication with the Express.js backend | Automatic JSON parsing, interceptors for auth token injection, request/response transformation, and timeout configuration. Chosen over native fetch (lacks interceptors, requires manual error handling for non-2xx responses). |
| **Leaflet** | Map Library | 1.9.4 | Interactive maps for farm boundary visualization and plot location | Lightweight (42KB), open-source alternative to Google Maps. No API key required for basic usage. |
| **React-Leaflet** | React Map Binding | 5.0.0 | React wrapper components for Leaflet maps | Provides declarative React components (`<MapContainer>`, `<TileLayer>`, `<Polygon>`) for Leaflet integration. |
| **@geoman-io/leaflet-geoman-free** | Map Drawing | 2.19.2 | Drawing and editing farm boundary polygons on Leaflet maps | Enables farmers to draw polygon boundaries around their plots directly on the map interface. |
| **@turf/area** | Geospatial | 7.3.4 | Calculating farm plot area from GeoJSON polygon coordinates | Lightweight module from the Turf.js geospatial library for precise area calculations in acres/hectares/bigha. |
| **Lucide React** | Icon Library | 1.7.0 | UI icons throughout the application | Tree-shakeable, consistent icon set. Lighter than FontAwesome. |
| **clsx** | Utility | 2.1.1 | Conditional className merging | Tiny utility for conditionally joining CSS class names. |
| **tailwind-merge** | Utility | 3.5.0 | Intelligent Tailwind class merging to resolve conflicts | Prevents conflicting Tailwind classes (e.g., `p-2` and `p-4`) from both being applied. |
| **ESLint** | Linting | 9.39.4 | Code quality enforcement with React-specific rules | Catches common React bugs (missing dependency arrays, unused state variables, invalid hook calls). |

### Frontend File Structure

```
client/src/
├── App.jsx                          # Root component with providers
├── main.jsx                         # Vite entry point
├── index.css                        # Global Tailwind CSS imports
├── assets/                          # Static assets (images, fonts)
├── components/
│   ├── auth/                        # ProtectedRoute, PublicRoute
│   ├── common/                      # Toast, shared UI components
│   ├── farm/                        # Farm-specific components
│   ├── landing/                     # Landing page sections
│   ├── layout/                      # Navigation, Sidebar, Layout
│   └── ui/                          # Buttons, Cards, Modals, Inputs
├── context/
│   ├── AuthContext.jsx              # Authentication state (user, token)
│   ├── FarmContext.jsx              # Active farm selection state
│   └── LocationContext.jsx          # GPS/manual location management
├── data/                            # Static data (crop lists, soil types)
├── hooks/                           # Custom React hooks
├── layouts/                         # Page layout wrappers
├── pages/
│   ├── AIRecommendations/           # Gemini-powered farm advisor
│   ├── Auth/                        # Login, Register
│   ├── CompleteProfile/             # Onboarding wizard
│   ├── Dashboard/                   # Main dashboard
│   ├── DiseaseDetection/            # Disease scanner page
│   ├── FertilizerHub/               # Fertilizer calculator
│   ├── Home/                        # Home redirect
│   ├── LandManagement/              # Plot list + PlotDetail
│   ├── Landing/                     # Public landing page
│   ├── MandiPrices/                 # Market price tracker
│   ├── Profile/                     # User profile editor
│   ├── Reminders/                   # Agricultural task reminders
│   └── WeatherForecast/             # Weather dashboard
├── routes/
│   └── AppRoutes.jsx                # Centralized route definitions
├── services/
│   ├── api.service.js               # Axios instance with interceptors
│   ├── ai.service.js                # AI recommendation API calls
│   ├── disease.service.js           # Disease detection API calls
│   ├── weather.service.js           # Weather API calls
│   ├── mandiService.js              # Mandi price API calls
│   └── advisorEngine.js             # Client-side advisory logic
└── utils/                           # Utility functions
```

---

## 5.2 Backend (Node.js Server)

| Technology | Category | Version | Role in AgroSmart | Why Chosen Over Alternatives |
|:---|:---|:---:|:---|:---|
| **Node.js** | Runtime | 18+ | JavaScript server runtime for the REST API | Non-blocking I/O is ideal for proxying requests to the Flask AI server and external APIs. Same language (JS) as the frontend reduces context switching. |
| **Express.js** | Web Framework | 5.2.1 | HTTP routing, middleware chain, static file serving | Express 5 offers improved error handling via async route handlers. Chosen over Django/FastAPI because the backend is primarily an API gateway — Python frameworks are reserved for the AI server where TensorFlow runs natively. |
| **Sequelize** | ORM | 6.37.8 | Database modeling, migrations, query building, and associations | Full-featured ORM with model definition, validation, hooks (beforeCreate for password hashing), and eager loading. Chosen over Prisma (less mature PostgreSQL GEOMETRY support) and raw SQL (error-prone, no migration system). |
| **PostgreSQL** | Database | 18+ | Relational data storage with PostGIS spatial extension | Supports UUID primary keys, JSONB columns, GEOMETRY types (PostGIS), and ENUM types natively. Chosen over MySQL (inferior spatial support) and MongoDB (disease scans, farms, and users have clear relational structures). |
| **PostGIS** | Spatial Extension | Latest | Storing and querying farm boundary polygons as `GEOMETRY('POLYGON')` | Industry-standard geospatial extension enabling spatial queries, area calculations, and proximity searches. |
| **JSON Web Token (JWT)** | Authentication | 9.0.3 | Stateless user authentication with 30-day expiry | Tokens are self-contained and don't require server-side session storage. Chosen over cookie sessions (CORS complexity with separate frontend) and OAuth (unnecessary complexity for a self-hosted system). |
| **bcryptjs** | Security | 3.0.3 | Password hashing with salt rounds (10) | Pure JavaScript implementation of bcrypt. Passwords are hashed in a Sequelize `beforeCreate` hook before database insertion. |
| **@google/generative-ai** | AI SDK | 0.24.1 | Official Google Gemini API client for recommendation and chatbot generation | Provides `getGenerativeModel()`, `startChat()`, and structured JSON output via `responseMimeType: 'application/json'`. |
| **Axios** | HTTP Client | 1.17.0 | Backend-to-Flask proxying, external API calls (OpenWeatherMap, data.gov.in) | Same library as frontend, ensuring consistent HTTP behavior. Used to proxy multipart/form-data to Flask. |
| **Multer** | File Upload | 2.1.1 | Multipart file parsing for disease scan image uploads and avatar uploads | Memory storage strategy keeps file buffers in RAM for fast proxying to Flask, then writes to disk after successful prediction. |
| **form-data** | Multipart Builder | 4.0.5 | Constructing multipart/form-data requests from Node.js buffers for Flask proxy | Required because Axios doesn't automatically convert Node.js Buffers into multipart form fields. |
| **express-validator** | Validation | 7.3.2 | Input validation and sanitization for API request bodies | Declarative validation middleware chain that prevents malformed data from reaching controllers. |
| **cors** | Security Middleware | 2.8.6 | Cross-Origin Resource Sharing headers for frontend ↔ backend communication | Allows the Vite dev server (port 5173) to make API calls to Express (port 5000). |
| **dotenv** | Configuration | 17.4.1 | Loading environment variables from `.env` files | Keeps secrets (JWT_SECRET, DB credentials, API keys) out of source code. |
| **pg** | DB Driver | 8.20.0 | Low-level PostgreSQL connection driver used by Sequelize | Required peer dependency for Sequelize's PostgreSQL dialect. |
| **pg-hstore** | Serialization | 2.3.4 | Serializing/deserializing PostgreSQL hstore (key-value) data | Required by Sequelize for certain PostgreSQL data type handling. |
| **nodemon** | Dev Tool | 3.1.14 | Auto-restart Express server on file changes during development | Watches `.js` files and restarts the server on save, enabling rapid iteration. |

### Backend File Structure

```
server/
├── index.js                         # Entry point (requires config/server.js)
├── package.json
├── .env / .env.example              # Environment variables
├── migrations/                      # Sequelize migration files
├── public/
│   └── uploads/                     # Disease scan images, avatars, Grad-CAMs
└── src/
    ├── config/
    │   ├── database.js              # Sequelize connection (pool, dialect)
    │   └── server.js                # Express app setup, middleware, DB sync
    ├── controllers/
    │   ├── auth.controller.js       # register, login, updateProfile, uploadAvatar
    │   ├── farms.controller.js      # Full CRUD for FarmNew + CropRotation
    │   └── reminders.controller.js  # CRUD for agricultural reminders
    ├── middleware/
    │   ├── auth.middleware.js        # JWT verification + user injection
    │   └── multer.middleware.js      # File upload configuration
    ├── models/
    │   ├── index.js                 # Model registry + associations
    │   ├── User.model.js            # User (UUID, bcrypt hooks)
    │   ├── Farm.model.js            # Legacy farm model (PostGIS boundary)
    │   ├── FarmNew.model.js         # New multi-plot farm model
    │   ├── CropRotation.model.js    # Crop rotation history per farm
    │   ├── CropRecord.model.js      # Active crop growth stage
    │   ├── SoilData.model.js        # NPK + pH per farm
    │   ├── Reminder.model.js        # Agricultural task reminders
    │   ├── DiseaseScan.model.js     # Disease detection scan history
    │   ├── AIRecommendation.model.js # Cached Gemini recommendations
    │   └── ChatHistory.model.js     # AgroBot conversation history
    ├── prompts/
    │   ├── chatbotPrompt.js         # AgroBot system instruction builder
    │   └── recommendationPrompt.js  # Farm recommendation prompt builder
    ├── routes/
    │   ├── index.js                 # Route aggregator
    │   ├── auth.routes.js           # /api/auth/*
    │   ├── farms.routes.js          # /api/farms/*
    │   ├── farms-legacy.routes.js   # /api/farm/* (legacy)
    │   ├── disease.routes.js        # /api/disease/*
    │   ├── aiRecommendations.routes.js  # /api/ai/*
    │   ├── weather.routes.js        # /api/weather/*
    │   ├── mandi.routes.js          # /api/mandi/*
    │   ├── reminders.routes.js      # /api/reminders/*
    │   └── user.routes.js           # /api/user/*
    └── services/
        ├── gemini.service.js        # Gemini API integration (chat + recommendations)
        └── recommendation.service.js # Recommendation business logic
```

---

## 5.3 AI Server (Flask)

| Technology | Category | Version | Role in AgroSmart | Why Chosen Over Alternatives |
|:---|:---|:---:|:---|:---|
| **Python** | Language | 3.10+ | AI/ML development language | De facto standard for deep learning. TensorFlow, Keras, NumPy, and scikit-learn are Python-native. |
| **Flask** | Web Framework | 3.0+ | Lightweight HTTP server for model inference endpoints | Minimal boilerplate for serving prediction endpoints. Chosen over FastAPI (Flask's simplicity is sufficient for 4 endpoints; FastAPI's async benefits are marginal when TensorFlow inference is the bottleneck) and Django (excessive for a microservice). |
| **Flask-CORS** | Middleware | 4.0+ | Cross-origin request handling for direct browser access during development | Enables the Flask server to accept requests from both the Express backend and direct browser testing. |
| **Gunicorn** | WSGI Server | 21.0+ | Production-grade multi-worker process manager | Runs 2 workers with 120s timeout for model loading and inference. Pre-loads the application to share model weights across workers. |
| **TensorFlow** | DL Framework | 2.20+ | Model loading, inference, and Grad-CAM computation | Industry-standard framework with Keras high-level API. Chosen over PyTorch because: (1) Keras' `Model.inputs/outputs` API simplifies Grad-CAM sub-model construction, (2) TFLite provides a clear mobile deployment path, and (3) TensorFlow Serving is production-ready. |
| **Keras** | DL API | 3.0+ | Model architecture definition, training callbacks, and metrics | High-level API for building the EfficientNetB3 + BiLSTM multimodal model. Keras 3 supports multiple backends but is used with TensorFlow here. |
| **EfficientNetB3** | CNN Backbone | — | Image feature extraction (pre-trained on ImageNet) | Achieves 84.1% top-1 accuracy on ImageNet with only 12M parameters. Chosen over ResNet-50 (larger, lower accuracy), VGG-16 (138M parameters, impractical for edge deployment), and MobileNetV2 (lower accuracy on fine-grained disease classification). |
| **BiLSTM** | Sequential Model | — | Text feature extraction from symptom descriptions | Bidirectional LSTM captures forward and backward context in symptom text. Chosen for its proven effectiveness on short text classification tasks. |
| **Optuna** | HPO Framework | 3.5+ | Automated hyperparameter tuning (30 trials) | Bayesian optimization with TPE sampler for efficient search. Tunes learning rate, dropout, dense units, batch size, and LSTM units. |
| **SHAP** | Explainability | 0.45+ | DeepExplainer-based pixel attribution for model interpretability | Provides theoretically grounded (Shapley values) per-pixel importance scores. Complementary to Grad-CAM. |
| **OpenCV** | Image Processing | 4.8+ | Image resizing, color conversion, heatmap overlay for Grad-CAM | Fast C++-backed image operations. Used for `cv2.applyColorMap` (JET heatmap) and `cv2.addWeighted` (overlay blending). |
| **Pillow (PIL)** | Image I/O | 10.0+ | Image loading, format conversion, and resizing in the Flask endpoint | Pure Python image library for reading uploaded file bytes as RGB arrays. |
| **NumPy** | Numerical | 1.26+ | Array manipulation for image preprocessing and prediction post-processing | Foundation library for TensorFlow tensor ↔ NumPy array conversions. |
| **Pandas** | Data Analysis | 2.0+ | Reading metadata CSVs, stratified subset sampling | Used in training, evaluation, and preprocessing pipelines for DataFrame operations. |
| **Matplotlib** | Visualization | 3.8+ | Training loss/accuracy curves, confusion matrices | Generates publication-quality plots for model evaluation. |
| **Seaborn** | Visualization | 0.13+ | Confusion matrix heatmaps with custom color palettes | Built on Matplotlib with enhanced statistical visualization defaults. |
| **scikit-learn** | ML Utilities | 1.3+ | Stratified train/test splits, classification reports, confusion matrices, ROC curves, AUC, class weight computation | Provides `train_test_split`, `classification_report`, `confusion_matrix`, `roc_auc_score`, and `compute_class_weight`. |
| **NLTK** | NLP | 3.8+ | Natural language processing utilities (available for future text preprocessing enhancements) | Included for potential symptom text normalization and tokenization improvements. |
| **Kaggle** | Dataset CLI | 1.6+ | Downloading PlantVillage and PlantDoc datasets from Kaggle | Command-line tool for authenticated dataset downloads. |

### AI Server File Structure

```
ai/
├── api/
│   ├── app.py                       # Flask application (predict, health, classes, model-info)
│   └── config.py                    # Paths, model names, port, limits
├── data/
│   ├── plantvillage/                # Raw PlantVillage dataset
│   ├── plantdoc/                    # Raw PlantDoc dataset
│   ├── merged/                      # Merged evaluation dataset
│   ├── processed/                   # Preprocessed 224×224 images + metadata CSVs
│   │   ├── train_metadata.csv
│   │   ├── val_metadata.csv
│   │   ├── test_metadata.csv
│   │   └── fine_tune/               # PlantDoc processed data
│   ├── class_names.json             # 38 class name list
│   ├── class_display_names.json     # Human-readable display names
│   ├── treatment_db.json            # Treatment lookup database
│   └── tokenizer.pkl                # Fitted Keras tokenizer
├── models/
│   ├── plant_disease_model_final.keras   # Primary model
│   ├── agro_disease_model.h5             # Fallback model
│   ├── agro_disease_model.keras          # Keras format
│   ├── best_model_phase1_unimodal.keras  # Phase 1 checkpoint
│   ├── best_model_phase2_unimodal.keras  # Phase 2 checkpoint
│   ├── best_model_phase3_unimodal.keras  # Phase 3 checkpoint
│   ├── agro_model_float32.tflite         # TFLite float32
│   └── agro_model_int8.tflite            # TFLite INT8 quantized
├── notebooks/                       # Jupyter notebooks for exploration
├── outputs/
│   ├── evaluation/                  # Per-dataset reports, confusion matrices, ROC curves
│   ├── logs/                        # TensorBoard logs (phase1, phase2, phase3)
│   ├── best_params.json             # Optuna best hyperparameters
│   ├── class_weights.json           # Computed class weights for imbalance
│   ├── combined_training_curves.png # Training loss/accuracy plots
│   └── optuna_history.png           # Optimization history
├── utils/
│   ├── data_loader.py               # tf.data pipeline builders + augmentations
│   ├── preprocess.py                # Dataset preprocessing + tokenizer fitting
│   ├── gradcam.py                   # Grad-CAM heatmap generation
│   ├── severity_rules.py            # Confidence → severity mapping
│   └── shap_explainer.py            # SHAP DeepExplainer + gradient saliency fallback
├── model.py                         # Model architecture definitions
├── train.py                         # 3-phase training pipeline
├── evaluate.py                      # Multi-split evaluation pipeline
├── optuna_tuning.py                 # Hyperparameter optimization
├── convert_tflite.py                # TFLite export + quantization + comparison
├── test_flask_predict.py            # Integration test for Flask endpoint
├── gunicorn_config.py               # Gunicorn production config
├── requirements.txt                 # Python dependencies
└── start.sh                         # Production startup script
```

---

## 5.4 Database Schema

See [Section 8: Database Design](#8-database-design) for the complete entity-relationship diagram and table definitions.

## 5.5 DevOps / Tools

| Tool | Category | Purpose |
|:---|:---|:---|
| **Git** | Version Control | Source code tracking with branching workflow |
| **GitHub** | Repository Hosting | Remote repository, issue tracking, collaboration |
| **Cursor IDE** | AI-Assisted Development | AI pair-programming for rapid prototyping and debugging |
| **Postman** | API Testing | Manual testing of all REST endpoints with saved collections |
| **TensorBoard** | ML Monitoring | Real-time training loss/accuracy visualization across 3 phases |
| **Optuna Dashboard** | HPO Visualization | Optimization history and parameter importance plots |

---

# 6. System Architecture (Detailed)

## 6.1 Frontend Architecture

### Component Hierarchy

```
<App>
  <BrowserRouter>
    <ToastProvider>                    # Global notification system
      <AuthProvider>                   # JWT token + user state
        <LocationProvider>             # GPS/manual location state
          <FarmProvider>               # Active farm selection
            <ErrorBoundary>            # Crash recovery UI
              <AppRoutes>              # Route definitions
                <Landing />            # Public landing page
                <Login /> / <Register /> # Auth pages (PublicRoute)
                <ProtectedRoute>       # JWT guard wrapper
                  <Dashboard />        # Main dashboard
                  <DiseaseDetection /> # Disease scanner
                  <AIRecommendations /> # Farm advisor
                  <WeatherForecast />  # Weather dashboard
                  <MandiPrices />      # Market prices
                  <LandManagement />   # Plot list
                  <PlotDetail />       # Individual plot view
                  <Reminders />        # Task reminders
                  <FertilizerHub />    # Fertilizer calculator
                  <Profile />          # User settings
                  <CompleteProfile />  # Onboarding / plot editor
                </ProtectedRoute>
              </AppRoutes>
            </ErrorBoundary>
          </FarmProvider>
        </LocationProvider>
      </AuthProvider>
    </ToastProvider>
  </BrowserRouter>
</App>
```

### State Management Approach

AgroSmart uses **React Context API** for global state management, avoiding the complexity of Redux for a medium-scale application:

1. **AuthContext**: Manages `user` object, JWT `token`, `login()`, `logout()`, and `register()` functions. Persists token in `localStorage` for session continuity.
2. **FarmContext**: Manages the currently selected farm (`activeFarm`), farm list, and provides `setActiveFarm()`, `refreshFarms()` functions. Farm selection propagates to weather, recommendations, and disease detection modules.
3. **LocationContext**: Manages GPS coordinates (`latitude`, `longitude`), resolved location details (`city`, `state`, `district`, `pincode`), and provides `detectLocation()` (GPS API) and `setManualLocation()` functions.

### Routing Structure

All routes are defined in [AppRoutes.jsx](file:///Users/kartik/Documents/Projects/AGRO/client/src/routes/AppRoutes.jsx):

| Route | Component | Auth Required | Description |
|:---|:---|:---:|:---|
| `/` | `Landing` | No | Public marketing page |
| `/login` | `Login` | No (PublicRoute) | Login form |
| `/register`, `/signup` | `Register` | No (PublicRoute) | Registration form |
| `/dashboard` | `Dashboard` | Yes | Main dashboard |
| `/farms` | `LandManagement` | Yes | Farm plot list |
| `/farms/:id` | `PlotDetail` | Yes | Individual plot details |
| `/profile` | `Profile` | Yes | User profile editor |
| `/complete-profile` | `CompleteProfile` | Yes | Onboarding wizard |
| `/add-plot` | `CompleteProfile` | Yes | New plot creation |
| `/edit-plot/:id` | `CompleteProfile` | Yes | Edit existing plot |
| `/fertilizer` | `FertilizerHub` | Yes | Fertilizer calculator |
| `/weather` | `WeatherForecast` | Yes | Weather dashboard |
| `/mandi` | `MandiPrices` | Yes | Market price tracker |
| `/reminders` | `Reminders` | Yes | Task reminder CRUD |
| `/ai` | `AIRecommendations` | Yes | AI farm advisor |
| `/disease` | `DiseaseDetection` | Yes | Disease scanner |
| `*` | Redirect → `/` | — | Catch-all redirect |

### API Communication Layer

The frontend communicates with the backend through a centralized Axios instance configured in [api.service.js](file:///Users/kartik/Documents/Projects/AGRO/client/src/services/api.service.js). This instance:

- Sets `baseURL` to `http://localhost:5000/api`
- Injects the JWT `Bearer` token via a request interceptor
- Handles 401 responses by logging the user out
- Provides typed service modules (`disease.service.js`, `weather.service.js`, `ai.service.js`, `mandiService.js`)

---

## 6.2 Backend Architecture

### Layered Structure

The Express.js backend follows a **Routes → Controllers → Services → Models** layered architecture:

```
HTTP Request
    │
    ▼
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Routes  │ →  │ Controllers  │ →  │   Services   │ →  │    Models    │
│ (URL def)│    │ (Req/Res)    │    │ (Logic)      │    │ (Sequelize)  │
└──────────┘    └──────────────┘    └──────────────┘    └──────────────┘
    │
    ▼
┌──────────────────────────────────────────────────┐
│              Middleware Chain                      │
│  1. cors() — CORS headers                        │
│  2. express.json() — Body parsing                │
│  3. express.static('/uploads') — Static files    │
│  4. protect (auth.middleware) — JWT verification  │
│  5. multer (memory/disk) — File uploads          │
└──────────────────────────────────────────────────┘
```

### Authentication Flow (JWT Lifecycle)

```
1. REGISTER: POST /api/auth/register
   Client → { fullName, email, password, phoneNumber, dob }
   Server → User.create() (bcrypt beforeCreate hook hashes password)
         → jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30d' })
         → Return { user data, token }

2. LOGIN: POST /api/auth/login
   Client → { email, password }
   Server → User.findOne({ email })
         → user.validPassword(password) (bcrypt.compare)
         → jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' })
         → Return { user data, token }

3. PROTECTED REQUEST: (any authenticated endpoint)
   Client → Authorization: Bearer <token>
   Server → auth.middleware.js:
         → Extract token from header
         → jwt.verify(token, JWT_SECRET) → decoded.id
         → User.findByPk(decoded.id, { exclude: ['password'] })
         → Attach req.user → next()
```

### Error Handling Strategy

- **Controller-level try/catch**: Every controller function wraps its logic in `try/catch`, returning `500` with `error.message` on unexpected failures.
- **Validation middleware**: `express-validator` chains validate request parameters before controller logic executes.
- **Flask proxy errors**: The disease route catches Flask connection failures separately, returning `503 AI service temporarily unavailable`.
- **Gemini API failures**: The `gemini.service.js` implements a 3-tier fallback: Primary model (Gemini 2.5 Flash) → Fallback model (Gemini 2.5 Flash Lite) → Hardcoded offline responses.

---

## 6.3 AI Server Architecture

### Model Input Pipeline

```
Image Upload (JPEG/PNG/WEBP, max 10MB)
    │
    ▼
┌──────────────────────────────────────┐
│  1. PIL.Image.open() → RGB convert  │
│  2. Resize to model input shape     │
│     (dynamically read from model)   │
│  3. NumPy array (float32)           │
│  4. Rescaling check:                │
│     - If model has Rescaling layer  │
│       → keep [0, 255]              │
│     - Else → divide by 255.0       │
│  5. np.expand_dims → (1, H, W, 3)  │
└──────────────────────────────────────┘

Symptom Text (optional)
    │
    ▼
┌──────────────────────────────────────┐
│  1. Combine crop_type + symptoms    │
│     e.g., "Tomato leaf. Yellow spots"│
│  2. tokenizer.texts_to_sequences()  │
│  3. pad_sequences(maxlen=50)        │
│  4. Shape: (1, 50) int32            │
└──────────────────────────────────────┘
```

### Inference Flow

```
Preprocessed Image + Text
    │
    ▼
┌──────────────────────────────────────┐
│  Model.predict()                     │
│  - Multimodal: {image_input, text}  │
│  - Unimodal:   image_input only     │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│  Crop Prior Masking (optional)       │
│  - If crop_type provided:           │
│    mask = [1 if class matches crop]  │
│    predictions *= mask               │
│    predictions /= sum(predictions)   │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│  Post-Processing                     │
│  - argmax → predicted class index    │
│  - Top-3 classes with confidences   │
│  - Display name lookup              │
│  - Severity mapping (>85%=High,     │
│    60-85%=Medium, <60%=Low)         │
│  - Treatment DB lookup              │
│  - Grad-CAM heatmap generation      │
└──────────────────────────────────────┘
```

### Grad-CAM Visualization Pipeline

```
Model + Image Array + Predicted Class Index
    │
    ▼
┌──────────────────────────────────────┐
│  1. Find last Conv2D layer name     │
│     (walk backward through layers)   │
│  2. Build sub-model:                │
│     inputs → [conv_output, preds]   │
│  3. GradientTape:                   │
│     loss = predictions[class_idx]   │
│     grads = ∂loss / ∂conv_output    │
│  4. Global Average Pool gradients   │
│     → channel importance weights    │
│  5. Weighted sum of feature maps    │
│     heatmap = conv_output @ weights │
│  6. ReLU + normalize to [0, 1]     │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│  Overlay:                            │
│  1. Resize heatmap to 224×224       │
│  2. Apply JET colormap              │
│  3. cv2.addWeighted(img, 0.6,       │
│     heatmap, 0.4, 0)               │
│  4. cv2.imencode('.jpg')            │
│  5. base64 encode                   │
│  6. Return data:image/jpeg;base64   │
└──────────────────────────────────────┘
```

### Gemini API Integration Flow

```
Farm Context (plot, weather, rotation, scans)
    │
    ▼
┌──────────────────────────────────────┐
│  buildRecommendationPrompt()         │
│  - Farm details (size, location)     │
│  - Current weather + 5-day forecast │
│  - Crop rotation history summary    │
│  - Recent disease scan summary      │
│  - Structured JSON output format    │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│  Gemini 2.5 Flash API Call           │
│  - responseMimeType: 'application/  │
│    json'                            │
│  - 15-second timeout                │
│  - On 429/quota → retry with        │
│    Gemini 2.5 Flash Lite            │
│  - On parse error → retry with      │
│    stricter prompt                  │
│  - On total failure → fallback      │
│    recommendations (hardcoded)      │
└──────────────────────────────────────┘
```

---

# 7. Modules & Features (Detailed)

## 7.1 User Authentication Module

**Purpose**: Secure user registration, login, profile management, and route protection.

**Technical Implementation**:
- **Registration**: `POST /api/auth/register` accepts `fullName`, `email`, `password`, `phoneNumber`, and `dob`. Checks for existing email, creates User record (bcrypt hashes password in `beforeCreate` hook with 10 salt rounds), and returns JWT token.
- **Login**: `POST /api/auth/login` validates email/password via `bcrypt.compare()`, generates a 30-day JWT token.
- **Profile Update**: `PUT /api/auth/profile` (protected) updates `fullName`, `phoneNumber`, `dob`.
- **Avatar Upload**: `POST /api/auth/upload-avatar` (protected) uses Multer disk storage to save avatar images to `/public/uploads/`.
- **Protected Routes**: `ProtectedRoute` React component checks `AuthContext` for a valid user; redirects to `/login` if unauthenticated. `PublicRoute` redirects authenticated users to `/dashboard`.

**APIs Involved**: `/api/auth/register`, `/api/auth/login`, `/api/auth/profile`, `/api/auth/upload-avatar`

**Edge Cases Handled**:
- Duplicate email registration (400 error)
- Invalid/expired JWT tokens (401 error with auto-logout)
- Missing authorization header (401 error)
- Password is never returned in any API response (excluded via Sequelize `attributes`)

---

## 7.2 Plant Disease Detection Module

**Purpose**: Upload a leaf image, receive an AI-powered disease diagnosis with confidence score, severity, treatment plan, and Grad-CAM visual explanation.

**Technical Implementation**:
1. **Image Upload**: Frontend sends `multipart/form-data` with `image` file, optional `symptoms` text, `cropType`, and `farmId`.
2. **Backend Proxy**: Express receives the upload via Multer (memory storage), validates file type (JPG/PNG/WEBP) and size (<10MB), constructs a new `FormData`, and proxies to Flask at `http://localhost:5001/predict` with 30s timeout.
3. **Flask Inference**: Preprocesses image (resize, normalize), tokenizes symptoms, runs model inference, applies crop prior mask, generates Grad-CAM, looks up treatment database.
4. **Persistence**: Backend saves the original image and Grad-CAM to disk, creates a `DiseaseScan` record in PostgreSQL linking to the user and optionally a farm.
5. **Response**: Returns prediction (disease, confidence, severity, is_healthy), top-3 alternatives, treatment protocol (fungicide, dosage, frequency, prevention), Grad-CAM base64 image, and processing time.

**Supported Crops and Diseases (38 classes, 14 crops)**:

| Crop | Diseases |
|:---|:---|
| Apple | Apple Scab, Black Rot, Cedar Apple Rust, Healthy |
| Blueberry | Healthy |
| Cherry | Powdery Mildew, Healthy |
| Corn (Maize) | Cercospora Leaf Spot / Gray Leaf Spot, Common Rust, Northern Leaf Blight, Healthy |
| Grape | Black Rot, Esca (Black Measles), Leaf Blight (Isariopsis), Healthy |
| Orange | Huanglongbing (Citrus Greening) |
| Peach | Bacterial Spot, Healthy |
| Pepper (Bell) | Bacterial Spot, Healthy |
| Potato | Early Blight, Late Blight, Healthy |
| Raspberry | Healthy |
| Soybean | Healthy |
| Squash | Powdery Mildew |
| Strawberry | Leaf Scorch, Healthy |
| Tomato | Bacterial Spot, Early Blight, Late Blight, Leaf Mold, Septoria Leaf Spot, Spider Mites, Target Spot, Yellow Leaf Curl Virus, Mosaic Virus, Healthy |

**APIs Involved**: `POST /api/disease/predict`, `POST /api/disease/save`, `GET /api/disease/history`, `GET /api/disease/health`

---

## 7.3 AI Recommendations Module

**Purpose**: Generate personalized, context-aware farming recommendations using Google Gemini 2.5 Flash based on the farmer's specific plot data, weather conditions, crop rotation history, and recent disease issues.

**Technical Implementation**:
- The [recommendationPrompt.js](file:///Users/kartik/Documents/Projects/AGRO/server/src/prompts/recommendationPrompt.js) constructs a detailed prompt including: plot name, size, location, soil type, land type, current crop, growth stage, days since sowing, days until harvest, previous crop, irrigation source, current weather (temp, humidity, wind), 5-day forecast, crop rotation history, and recent disease scans.
- The prompt instructs Gemini to output a **strict JSON structure** with: `summary`, `priority`, 4–6 `recommendations` (each with category, title, description, urgency, icon), `next_crop_suggestion`, and `weather_impact`.
- **Fallback chain**: Gemini 2.5 Flash → Gemini 2.5 Flash Lite (on 429/quota) → Retry with stricter prompt → Hardcoded fallback recommendations.
- Recommendations are persisted in the `AIRecommendation` model with `expires_at`, `is_dismissed`, `dismissed_indices`, and `refresh_timestamps` fields for caching and UX.

**Input Context Sent to Gemini**:
- Plot metadata (name, size, soil type, land type, irrigation source)
- Crop lifecycle (current crop, growth stage, sowing date, harvest date, previous crop)
- Live weather (temperature, humidity, wind, 5-day forecast with rain probabilities)
- Crop rotation history (season, crop, yield, notes)
- Recent disease scans (crop, disease, severity, date)

---

## 7.4 AgroBot Chatbot Module

**Purpose**: An AI-powered conversational farming assistant that answers questions about irrigation, pest control, fertilizers, crop rotation, weather, and general agriculture — with bilingual (English/Hindi) support.

**Technical Implementation**:
- The [chatbotPrompt.js](file:///Users/kartik/Documents/Projects/AGRO/server/src/prompts/chatbotPrompt.js) builds a system instruction including: user location, active crop, growth stage, current weather, soil type, and language preference.
- The system prompt instructs AgroBot to: give practical actionable advice for Indian farming, use simple language, reference local conditions, suggest using Disease Detection/Mandi Prices features when relevant, keep responses concise (3–5 sentences), and recommend local KVK contact for uncertain queries.
- **Suggestion parsing**: The prompt appends a directive asking Gemini to include `[[Suggestions: suggestion 1 | suggestion 2]]` at the end. The backend parses this with regex and returns both the reply and two contextual follow-up suggestions.
- **Chat history**: The `ChatHistory` model stores all user and model messages per user, per farm. History is sent to Gemini as conversation context for multi-turn coherence.
- **Offline fallback**: If Gemini fails, [gemini.service.js](file:///Users/kartik/Documents/Projects/AGRO/server/src/services/gemini.service.js) contains a comprehensive `getOfflineChatbotResponse()` function with pattern-matched responses for: crops/rotation, water/irrigation, pests/diseases, fertilizers, and weather — in both English and Hindi.

---

## 7.5 Land Management Module

**Purpose**: Manage multiple farm plots with detailed metadata, crop rotation history, and PostGIS polygon boundaries.

**Technical Implementation**:
- **Multi-plot support**: Each user can create multiple `FarmNew` records, each with: plotName, size (acres/bigha/hectare), landType (irrigated/rain-fed/mixed), ownership (owned/leased/shared), location (village, city, district, state, pincode, lat/lon), currentCrop, sowingDate, harvestDate, previousCrop, irrigationSource.
- **Crop Rotation History**: Each farm has many `CropRotation` records tracking: cropName, season, sowingDate, harvestDate, yieldAmount, yieldUnit, notes.
- **PostGIS Boundaries**: The legacy `Farm` model supports `GEOMETRY('POLYGON')` boundaries drawn via Leaflet Geoman on interactive maps.
- **CRUD Operations**: Full create, read, update, delete for plots and crop rotations.

---

## 7.6 Weather Forecast Module

**Purpose**: Real-time weather monitoring with 5-day forecasts, hourly predictions, and agricultural alerts.

**Technical Implementation**:
- **OpenWeatherMap API**: Current weather (`/api/weather/current`) and 5-day forecast (`/api/weather/forecast`) endpoints proxy to OpenWeatherMap with the user's coordinates.
- **10-minute in-memory cache**: Responses are cached by rounded lat/lon to minimize API calls.
- **Agricultural alerts**: Generated based on weather conditions: extreme heat (>40°C), high heat (>35°C), frost risk (<10°C), fungal disease risk (humidity >80%), spray restriction (wind >30km/h).
- **UV Index simulation**: Realistic UV index calculated from time of day, cloud cover, and solar angle.
- **Reverse geocoding**: Dual-provider strategy using Nominatim (OSM) with OpenWeatherMap fallback.
- **City search**: Direct geocoding via OpenWeatherMap restricted to India (`,IN` suffix).

---

## 7.7 Mandi Prices Module

**Purpose**: Track real-time government mandi (agricultural market) prices for crops across Indian states.

**Technical Implementation**:
- **data.gov.in API**: Queries the official government commodity price API (`resource/9ef84268-d588-465a-a308-a864a43d0070`) for state-filtered, crop-filtered results.
- **30-minute cache**: In-memory caching by state+crop key.
- **Intelligent fallback**: If the API fails or returns no results, the system generates realistic mock prices using a curated database of: 6 states (Punjab, Haryana, UP, Rajasthan, default), 10 crops (wheat, paddy, maize, cotton, mustard, potato, onion, tomato, soybean, moong) with region-appropriate price ranges and variety names.
- **Trend calculation**: Modal price vs. min/max midpoint comparison determines up/down/neutral trends with percentage change.

---

## 7.8 Reminders Module

**Purpose**: Agricultural task reminders with categorization, priority levels, and due date tracking.

**Technical Implementation**:
- Categories: Irrigation, Fertilization, Harvesting, Pest Control, Other
- Priorities: Low, Medium, High, Critical
- Fields: task (description), category, priority, dueDate, completed (boolean)
- CRUD via `POST /api/reminders`, `GET /api/reminders`, `PUT /api/reminders/:id`, `DELETE /api/reminders/:id`

---

## 7.9 Fertilizer Hub Module

**Purpose**: NPK fertilizer recommendation calculator based on soil data and crop requirements.

**Technical Implementation**:
- Linked to `SoilData` model (nitrogen, phosphorus, potassium, phLevel per farm)
- Provides fertilizer recommendations based on crop type and growth stage

---

## 7.10 Profile & Onboarding Module

**Purpose**: User profile management with location setup, and a multi-step onboarding wizard for creating the first farm plot.

---

## 7.11 Dashboard Module

**Purpose**: Centralized summary view with quick-access cards for all modules, active farm status, weather snapshot, and recent activity.

---

## 7.12 Location System Module

**Purpose**: GPS-based automatic location detection and manual city search for weather, recommendations, and farm creation.

**Technical Implementation**:
- **LocationContext** manages: GPS coordinates, resolved city/state/district/pincode, location source (GPS vs. manual)
- **GPS detection**: Uses `navigator.geolocation.getCurrentPosition()` → reverse geocodes via `/api/weather/reverse-geocode`
- **Manual search**: City search via `/api/weather/search-city` (OpenWeatherMap geo/direct API, India-filtered)
- **Persistence**: Location stored in User model (`home_city`, `home_state`, `home_latitude`, `home_longitude`, `location_source`)

---

## 7.13 Landing Page Module

**Purpose**: Public-facing marketing page showcasing AgroSmart's features with call-to-action buttons.

---

# 8. Database Design

## 8.1 Entity-Relationship Description

```mermaid
erDiagram
    Users ||--o{ Farms : "has many (legacy)"
    Users ||--o{ FarmsNew : "has many"
    Users ||--o{ Reminders : "has many"
    Users ||--o{ DiseaseScans : "has many"
    Users ||--o{ AIRecommendations : "has many"
    Users ||--o{ ChatHistory : "has many"
    
    Farms ||--o| SoilData : "has one"
    Farms ||--o| CropRecords : "has one"
    
    FarmsNew ||--o{ CropRotations : "has many"
    FarmsNew ||--o{ DiseaseScans : "has many"
    FarmsNew ||--o{ AIRecommendations : "has many"
    FarmsNew ||--o{ ChatHistory : "has many"
```

## 8.2 All Entities and Attributes

### Users
| Column | Type | Constraints | Description |
|:---|:---|:---|:---|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Unique user ID |
| `fullName` | VARCHAR(255) | NOT NULL | User's full name |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE, isEmail | Login email |
| `phoneNumber` | VARCHAR(255) | NULLABLE | Contact number |
| `dob` | DATEONLY | NULLABLE | Date of birth |
| `avatarUrl` | VARCHAR(255) | NULLABLE | Profile picture URL |
| `tier` | VARCHAR(255) | DEFAULT "Golden Tier" | User tier level |
| `password` | VARCHAR(255) | NOT NULL | bcrypt-hashed password |
| `home_city` | VARCHAR(255) | NULLABLE | Home city |
| `home_state` | VARCHAR(255) | NULLABLE | Home state |
| `home_district` | VARCHAR(255) | NULLABLE | Home district |
| `home_pincode` | VARCHAR(255) | NULLABLE | Home PIN code |
| `home_latitude` | FLOAT | NULLABLE | GPS latitude |
| `home_longitude` | FLOAT | NULLABLE | GPS longitude |
| `location_source` | ENUM('gps','manual') | NOT NULL, DEFAULT 'manual' | How location was set |
| `createdAt` | TIMESTAMPTZ | DEFAULT NOW | Registration timestamp |
| `updatedAt` | TIMESTAMPTZ | DEFAULT NOW | Last update timestamp |

### FarmsNew (Primary Land Management)
| Column | Type | Constraints | Description |
|:---|:---|:---|:---|
| `id` | UUID | PK | Farm plot ID |
| `userId` | UUID | FK → Users.id, NOT NULL | Owner reference |
| `plotName` | VARCHAR(255) | NOT NULL | Plot display name |
| `size` | FLOAT | NOT NULL | Area measurement |
| `sizeUnit` | ENUM('acres','bigha','hectare') | NOT NULL | Unit of measurement |
| `landType` | ENUM('irrigated','rain-fed','mixed') | NOT NULL | Irrigation classification |
| `ownership` | ENUM('owned','leased','shared') | NOT NULL | Ownership status |
| `notes` | TEXT | NULLABLE | Free-form notes |
| `village` | VARCHAR(255) | NOT NULL | Village name |
| `city` | VARCHAR(255) | NULLABLE | City name |
| `district` | VARCHAR(255) | NOT NULL | District name |
| `state` | VARCHAR(255) | NOT NULL | State name |
| `pincode` | VARCHAR(255) | NOT NULL | PIN code |
| `latitude` | FLOAT | NULLABLE | GPS latitude |
| `longitude` | FLOAT | NULLABLE | GPS longitude |
| `currentCrop` | VARCHAR(255) | NOT NULL | Active crop |
| `sowingDate` | DATEONLY | NOT NULL | Sowing date |
| `harvestDate` | DATEONLY | NOT NULL | Expected harvest |
| `previousCrop` | VARCHAR(255) | NULLABLE | Last season's crop |
| `irrigationSource` | VARCHAR(255) | NOT NULL | Water source |

### Farms (Legacy with PostGIS)
| Column | Type | Constraints | Description |
|:---|:---|:---|:---|
| `id` | UUID | PK | Farm ID |
| `userId` | UUID | FK → Users.id | Owner |
| `farmName` | VARCHAR(255) | DEFAULT "My Farm" | Display name |
| `state`, `cityVillage`, `location` | VARCHAR(255) | NULLABLE | Location fields |
| `acres` | FLOAT | DEFAULT 0 | Area in acres |
| `experienceYears` | INTEGER | DEFAULT 0 | Farming experience |
| `cropType` | VARCHAR(255) | DEFAULT "Wheat" | Primary crop |
| `soilType` | VARCHAR(255) | DEFAULT "Alluvial" | Soil classification |
| `irrigationType` | VARCHAR(255) | DEFAULT "Well / Tube Well" | Irrigation type |
| `ownershipType` | VARCHAR(255) | DEFAULT "Owned" | Ownership |
| `boundary` | GEOMETRY('POLYGON') | NULLABLE | PostGIS boundary |
| `season` | VARCHAR(255) | DEFAULT "Kharif" | Growing season |
| `secondaryCrop`, `waterSource` | VARCHAR(255) | NULLABLE | Additional fields |
| `soilTestAvailable` | BOOLEAN | DEFAULT false | Soil test status |
| `images` | JSONB | NULLABLE | Farm photos |
| `notes` | TEXT | NULLABLE | Notes |

### DiseaseScans
| Column | Type | Constraints | Description |
|:---|:---|:---|:---|
| `id` | UUID | PK | Scan ID |
| `user_id` | UUID | FK → Users.id | Scanner |
| `farm_id` | UUID | FK → FarmsNew.id, NULLABLE | Associated plot |
| `image_filename` | VARCHAR(255) | NOT NULL | Stored image file |
| `crop_type` | VARCHAR(255) | NOT NULL | Detected crop |
| `disease_name` | VARCHAR(255) | NOT NULL | Diagnosed disease |
| `confidence` | FLOAT | NOT NULL | Prediction confidence |
| `severity` | ENUM('High','Medium','Low') | NOT NULL | Severity level |
| `is_healthy` | BOOLEAN | NOT NULL | Healthy flag |
| `symptoms_text` | TEXT | NULLABLE | User-provided symptoms |
| `treatment_json` | JSON | NOT NULL | Treatment protocol |
| `top_3_json` | JSON | NOT NULL | Top-3 predictions |
| `grad_cam_url` | TEXT | NULLABLE | Grad-CAM image URL |
| `scan_date` | DATEONLY | NOT NULL, DEFAULT NOW | Scan date |

### AIRecommendations
| Column | Type | Description |
|:---|:---|:---|
| `id` | UUID | Recommendation ID |
| `user_id` | UUID (FK) | Requesting user |
| `farm_id` | UUID (FK, nullable) | Target farm |
| `recommendation_json` | JSON | Full recommendation data |
| `farm_context_snapshot` | JSON | Input context at generation time |
| `generated_at` | TIMESTAMPTZ | Generation timestamp |
| `expires_at` | TIMESTAMPTZ | Expiry timestamp |
| `is_dismissed` | BOOLEAN | Dismissed flag |
| `dismissed_indices` | JSON (array) | Individually dismissed items |
| `refresh_timestamps` | JSON (array) | Refresh history |

### ChatHistory
| Column | Type | Description |
|:---|:---|:---|
| `id` | UUID | Message ID |
| `user_id` | UUID (FK) | User reference |
| `role` | ENUM('user','model') | Message sender |
| `message` | TEXT | Message content |
| `farm_id` | UUID (FK, nullable) | Farm context |

### CropRotations, CropRecords, SoilData, Reminders

*(Defined in detail in Section 5.2 Backend models listing above.)*

## 8.3 Normalization Level

The database schema is normalized to **Third Normal Form (3NF)**:
- All tables have atomic values (1NF)
- No partial dependencies on composite keys (2NF — all PKs are single UUIDs)
- No transitive dependencies (3NF — non-key attributes depend only on the primary key)

## 8.4 Indexing Strategy

```sql
CREATE INDEX IF NOT EXISTS "idx_farms_user" ON "Farms"("userId");
CREATE INDEX IF NOT EXISTS "idx_reminders_user" ON "Reminders"("userId");
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "Users"("email");
```

Additional implicit indexes on all UUID primary keys and foreign keys via Sequelize.

## 8.5 Migrations Approach

The backend uses Sequelize's `sync()` with automatic schema synchronization:
```javascript
await sequelize.sync(); // Creates/updates tables to match model definitions
```

The `migrations/` directory exists for version-controlled schema changes in production deployments.

---

# 9. API Documentation

## 9.1 Authentication APIs

| Method | Endpoint | Auth | Request Body | Response | Description |
|:---:|:---|:---:|:---|:---|:---|
| POST | `/api/auth/register` | No | `{ fullName, email, password, phoneNumber?, dob? }` | `{ id, fullName, email, token, ... }` | Register new user |
| POST | `/api/auth/login` | No | `{ email, password }` | `{ id, fullName, email, token, ... }` | Login |
| PUT | `/api/auth/profile` | Yes | `{ fullName?, phoneNumber?, dob? }` | Updated user object | Update profile |
| POST | `/api/auth/upload-avatar` | Yes | `multipart: avatar (file)` | `{ message, avatarUrl }` | Upload avatar |

## 9.2 User APIs

| Method | Endpoint | Auth | Description |
|:---:|:---|:---:|:---|
| GET | `/api/user/me` | Yes | Get current user profile |
| PUT | `/api/user/location` | Yes | Update home location |

## 9.3 Farm Management APIs

| Method | Endpoint | Auth | Description |
|:---:|:---|:---:|:---|
| GET | `/api/farms` | Yes | List all user's farms |
| POST | `/api/farms` | Yes | Create new farm plot |
| GET | `/api/farms/:id` | Yes | Get farm details with crop rotations |
| PUT | `/api/farms/:id` | Yes | Update farm details |
| DELETE | `/api/farms/:id` | Yes | Delete farm and associated data |
| POST | `/api/farms/:id/crop-rotation` | Yes | Add crop rotation record |
| DELETE | `/api/farms/:farmId/crop-rotation/:rotationId` | Yes | Delete rotation record |

## 9.4 Disease Detection APIs

| Method | Endpoint | Auth | Request | Response | Description |
|:---:|:---|:---:|:---|:---|:---|
| POST | `/api/disease/predict` | Yes | `multipart: image, symptoms?, cropType?, farmId?` | `{ prediction, top_3, treatment, grad_cam_image, ... }` | Run disease inference |
| POST | `/api/disease/save` | Yes | `{ scanId, farmId? }` | `{ success, scan }` | Link scan to farm |
| GET | `/api/disease/history` | Yes | — | Array of last 20 scans | Get scan history |
| GET | `/api/disease/health` | Yes | — | `{ online, model_loaded, num_classes, ... }` | Check AI server status |

## 9.5 AI Recommendation APIs

| Method | Endpoint | Auth | Description |
|:---:|:---|:---:|:---|
| POST | `/api/ai/recommendations` | Yes | Generate farm recommendations via Gemini |
| GET | `/api/ai/recommendations` | Yes | Get cached recommendations |
| POST | `/api/ai/chat` | Yes | Send message to AgroBot |
| GET | `/api/ai/chat/history` | Yes | Get chat history |

## 9.6 Weather APIs

| Method | Endpoint | Auth | Query Params | Description |
|:---:|:---|:---:|:---|:---|
| GET | `/api/weather/current` | No | `lat, lon` | Current weather with alerts |
| GET | `/api/weather/forecast` | No | `lat, lon` | 5-day + hourly forecast |
| GET | `/api/weather/reverse-geocode` | No | `lat, lon` | Reverse geocode coordinates |
| GET | `/api/weather/search-city` | No | `q` | Search Indian cities |

## 9.7 Mandi Price APIs

| Method | Endpoint | Auth | Query Params | Description |
|:---:|:---|:---:|:---|:---|
| GET | `/api/mandi/prices` | No | `state?, crop?` | Get mandi prices (with fallback) |

## 9.8 Reminder APIs

| Method | Endpoint | Auth | Description |
|:---:|:---|:---:|:---|
| GET | `/api/reminders` | Yes | List user's reminders |
| POST | `/api/reminders` | Yes | Create reminder |
| PUT | `/api/reminders/:id` | Yes | Update reminder |
| DELETE | `/api/reminders/:id` | Yes | Delete reminder |

## 9.9 Flask AI Server APIs

| Method | Endpoint | Request | Response | Description |
|:---:|:---|:---|:---|:---|
| POST | `/predict` | `multipart: image, symptoms?, crop_type?` | `{ success, prediction, top_3, treatment, grad_cam_image, processing_time_ms, model_version }` | Run disease inference |
| GET | `/health` | — | `{ status, model_loaded, num_classes, device, uptime_seconds }` | Health check |
| GET | `/classes` | — | `{ classes, total, crops_covered }` | List supported diseases |
| GET | `/model-info` | — | `{ primary_model, available_models, input_shape, is_multimodal, classes }` | Model metadata |

---

# 10. ML Model Documentation

## 10.1 Dataset

### PlantVillage (Primary Dataset)
- **Source**: Hughes & Salathe (2015), hosted on Kaggle
- **Total Images**: ~54,305 lab-condition leaf images
- **Classes**: 38 (14 crop species × diseases + healthy)
- **Image Properties**: Consistent white/dark backgrounds, high resolution, single-leaf focus
- **Split**: 80% train / 10% validation / 10% test (stratified by class via `sklearn.train_test_split`)

### PlantDoc (Domain Adaptation Dataset)
- **Source**: Singh et al. (2020), real-world leaf images
- **Total Mappable Images**: Varies (28 PlantDoc categories mapped to 38 PlantVillage classes via `PLANTDOC_MAPPING`)
- **Image Properties**: Natural backgrounds, multiple leaves, varying lighting
- **Split**: 70% fine-tune train / 30% fine-tune test (stratified)

### Merged Dataset (Stress Test)
- **Purpose**: Out-of-distribution evaluation
- **Split**: 100% test only

### Data Augmentation Techniques (Training Only)

Implemented in [data_loader.py](file:///Users/kartik/Documents/Projects/AGRO/ai/utils/data_loader.py) using Keras layers:

| Augmentation | Implementation | Parameters |
|:---|:---|:---|
| Random Horizontal & Vertical Flip | `layers.RandomFlip("horizontal_and_vertical")` | 50% probability each |
| Random Rotation | `layers.RandomRotation(factor=20/360)` | ±20° |
| Random Zoom | `layers.RandomZoom(height_factor=(-0.1, 0.1))` | ±10% |
| Random Translation | `layers.RandomTranslation(height_factor=(-0.1, 0.1))` | ±10% |
| Random Brightness | `layers.RandomBrightness(factor=0.15)` | ±15% |
| Random Contrast | `layers.RandomContrast(factor=0.15)` | ±15% |
| **Random Erasing (Cutout)** | Custom TF implementation | 2–20% area, aspect ratio 0.3–3.3, 50% probability |

### Synthetic Symptom Text Generation

The [preprocess.py](file:///Users/kartik/Documents/Projects/AGRO/ai/utils/preprocess.py) generates 500 synthetic symptom sentences using:
- **38 disease-specific keyword sets** (3 keywords per class describing visual symptoms)
- **6 template sentences** (e.g., "The plant exhibits {}.", "Leaves show symptoms of {}.")
- **Keras Tokenizer** fitted on the corpus with `vocab_size=5000` and `<OOV>` token, serialized to `tokenizer.pkl`

---

## 10.2 Model Architecture

### Multimodal Model (EfficientNetB3 + BiLSTM)

Defined in [model.py](file:///Users/kartik/Documents/Projects/AGRO/ai/model.py):

```
IMAGE BRANCH:
  Input: (224, 224, 3) float32 → "image_input"
    ↓
  EfficientNetB3 (ImageNet pretrained, initially frozen)
    ↓
  GlobalAveragePooling2D → "image_gap"
    ↓
  Dense(512, relu) → "image_dense_512"
    ↓
  BatchNormalization → "image_bn_512"
    ↓
  Dropout(0.4) → "image_dropout_512"
    ↓
  Dense(256, relu) → "image_projection"         ← 256-dim image embedding

TEXT BRANCH:
  Input: (50,) int32 → "text_input"
    ↓
  Embedding(vocab=5000, dim=128) → "text_embedding"
    ↓
  SpatialDropout1D(0.2) → "text_spatial_dropout"
    ↓
  Bidirectional(LSTM(128, return_sequences=True, unroll=True)) → "text_bilstm"
    ↓
  GlobalMaxPooling1D → "text_gmp"
    ↓
  Dense(128, relu) → "text_dense_128"
    ↓
  Dropout(0.3) → "text_dropout_128"
    ↓
  Dense(64, relu) → "text_projection"            ← 64-dim text embedding

FUSION BRANCH:
  Concatenate([image_projection, text_projection]) → 320-dim → "multimodal_fusion"
    ↓
  Dense(256, relu) → "fusion_dense_256"
    ↓
  BatchNormalization → "fusion_bn_256"
    ↓
  Dropout(0.3) → "fusion_dropout_256"
    ↓
  Dense(128, relu) → "fusion_dense_128"
    ↓
  Dropout(0.2) → "fusion_dropout_128"
    ↓
  Dense(38, softmax) → "disease_output"          ← 38-class probability distribution
```

### Unimodal Model (Image-Only)

Used in the actual 3-phase training pipeline. Identical to the image branch + fusion/classification head, but without the text branch. This avoids dependency on synthetic text data during training.

### Why EfficientNetB3?

| Model | Parameters | ImageNet Top-1 | Reason |
|:---|:---:|:---:|:---|
| VGG-16 | 138M | 71.3% | Too large for edge deployment |
| ResNet-50 | 25.6M | 76.2% | Good but lower accuracy-per-parameter |
| MobileNetV2 | 3.4M | 71.9% | Too lightweight for fine-grained disease classification |
| **EfficientNetB3** | **12M** | **84.1%** | **Optimal accuracy/size ratio** |
| EfficientNetB7 | 66M | 84.3% | Marginal accuracy gain, 5× more parameters |

---

## 10.3 Training

### 3-Phase Training Pipeline

Defined in [train.py](file:///Users/kartik/Documents/Projects/AGRO/ai/train.py):

**Phase 1: Frozen Base (PlantVillage)**
- **Strategy**: Freeze all EfficientNetB3 layers; train only the projection and classification heads
- **Learning Rate**: 1e-3 (from Optuna or default)
- **Epochs**: 3 (with early stopping, patience=5)
- **Data**: 10% stratified subset of PlantVillage train/val
- **Purpose**: Learn disease-specific features in the projection layers without disturbing ImageNet weights

**Phase 2: Fine-tune EfficientNetB3 (PlantVillage)**
- **Strategy**: Unfreeze the top 30 layers of EfficientNetB3; keep earlier layers frozen
- **Learning Rate**: 1e-5 (10× lower to prevent catastrophic forgetting)
- **Epochs**: 2 (with early stopping)
- **Data**: Same PlantVillage subset
- **Purpose**: Adapt high-level EfficientNet features to plant disease patterns

**Phase 3: Domain Adaptation (PlantDoc)**
- **Strategy**: Unfreeze the entire model
- **Learning Rate**: 5e-6 (very low for careful adaptation)
- **Epochs**: 2 (with early stopping)
- **Data**: PlantDoc train (70%) / test (30%)
- **Purpose**: Bridge the domain gap between lab-condition PlantVillage and real-world PlantDoc images

### Training Configuration

| Parameter | Value |
|:---|:---|
| Loss Function | Categorical Crossentropy |
| Optimizer | Adam |
| Metrics | Accuracy, Top-3 Accuracy, AUC, Precision, Recall, Macro F1-Score |
| Batch Size | 32 (Phase 1 & 2), 16 (Phase 3) |
| Image Size | 224 × 224 × 3 |
| Max Text Length | 50 tokens |
| Vocabulary Size | 5,000 |

### Callbacks

| Callback | Configuration |
|:---|:---|
| `EarlyStopping` | monitor=val_loss, patience=5, restore_best_weights=True |
| `ModelCheckpoint` | monitor=val_loss, save_best_only=True |
| `ReduceLROnPlateau` | monitor=val_loss, factor=0.3, patience=3, min_lr=1e-6 (1e-7 in Phase 3) |
| `TensorBoard` | Separate log directory per phase |
| `CSVLogger` | Append mode for continuous logging across phases |

### Class Weight Computation

Computed via `sklearn.compute_class_weight('balanced')` on the training set to handle class imbalance. Stored in `class_weights.json`.

---

## 10.4 Evaluation

Defined in [evaluate.py](file:///Users/kartik/Documents/Projects/AGRO/ai/evaluate.py):

### Multi-Split Evaluation Pipeline

The model is evaluated on **3 independent test datasets**:

1. **PlantVillage Test** (10% held-out from PlantVillage) — measures in-distribution accuracy
2. **PlantDoc Test** (30% of PlantDoc) — measures real-world generalization
3. **Merged Dataset Stress Test** — measures out-of-distribution robustness

### Metrics Computed Per Dataset

| Metric | Description |
|:---|:---|
| Overall Accuracy | Percentage of correct top-1 predictions |
| Top-3 Accuracy | Percentage where correct class is in top-3 predictions |
| Macro AUC (OVR) | One-vs-Rest macro-averaged area under ROC curve |
| Macro Precision | Average precision across all classes |
| Macro Recall | Average recall across all classes |
| Macro F1-Score | Harmonic mean of precision and recall |
| Per-Class Report | Full `sklearn.classification_report` |
| Confusion Matrix | Heatmap saved as PNG (green colormap) |
| ROC Curves | Per-class OVR ROC curves with AUC annotations |

---

## 10.5 Grad-CAM Explainability

Implemented in [gradcam.py](file:///Users/kartik/Documents/Projects/AGRO/ai/utils/gradcam.py):

### What Grad-CAM Is

**Gradient-weighted Class Activation Mapping (Grad-CAM)** is a visual explainability technique introduced by Selvaraju et al. (2017). It produces a coarse localization map highlighting the image regions that are most important for a CNN's prediction.

### How It Works in AgroSmart

1. **Identify the last convolutional layer** in EfficientNetB3 by walking backward through `model.layers` looking for `Conv2D` layers.
2. **Build a sub-model** with two outputs: the feature maps from the last conv layer and the final predictions.
3. **Compute gradients** of the predicted class score with respect to the feature map activations using `tf.GradientTape`.
4. **Global Average Pool** the gradients across spatial dimensions to get per-channel importance weights.
5. **Compute weighted sum** of feature maps: `heatmap = feature_maps @ channel_weights`.
6. **Apply ReLU** (keep only positive contributions) and normalize to [0, 1].
7. **Resize heatmap** to match the original image dimensions (224×224).
8. **Apply JET colormap** (`cv2.COLORMAP_JET`) and **overlay** onto the original image with alpha blending (60% original, 40% heatmap).
9. **Encode as base64 JPEG** and return inline in the API response.

### Why Explainability Matters for Farmer Trust

Indian farmers are understandably skeptical of AI-generated diagnoses. A model that simply says "Late Blight — 92% confidence" is a black box. By showing a Grad-CAM heatmap that highlights the exact leaf lesions the model focused on, AgroSmart transforms the diagnosis into a **transparent, verifiable recommendation** that the farmer can cross-reference with their own visual inspection.

---

## 10.6 SHAP Explainability

Implemented in [shap_explainer.py](file:///Users/kartik/Documents/Projects/AGRO/ai/utils/shap_explainer.py):

- **SHAP DeepExplainer**: Uses 10 background images from the test set as the reference distribution. Computes Shapley values for each pixel, showing which pixels contribute positively or negatively to each class prediction.
- **Subprocess Isolation**: SHAP's DeepExplainer modifies TensorFlow's gradient registry, which can conflict with Grad-CAM. To prevent this, SHAP runs in an isolated subprocess via `subprocess.run([sys.executable, __file__, "--only-shap"])`.
- **Gradient Saliency Fallback**: If SHAP fails (library compatibility issues), the system falls back to a custom gradient saliency map using `tf.GradientTape` to compute `∂class_score/∂input_image` and visualizes the absolute gradient magnitude.

---

## 10.7 TFLite Conversion

Implemented in [convert_tflite.py](file:///Users/kartik/Documents/Projects/AGRO/ai/convert_tflite.py):

### Float32 Conversion
- Standard `tf.lite.TFLiteConverter.from_keras_model()` with `SELECT_TF_OPS` for LSTM/Embedding compatibility.

### INT8 Quantization
- Full integer quantization with representative dataset (100 training images).
- Calibrates quantization ranges using actual training data distributions.

### Comparison Testing
- Runs inference on 5 test images across all 3 formats (Keras, TFLite Float32, TFLite INT8).
- Compares: predicted class agreement, confidence scores, and inference latency.
- Reports model size compression ratios.

---

## 10.8 Hyperparameter Tuning (Optuna)

Implemented in [optuna_tuning.py](file:///Users/kartik/Documents/Projects/AGRO/ai/optuna_tuning.py):

### Search Space

| Hyperparameter | Range | Type |
|:---|:---|:---|
| `learning_rate` | 1e-5 to 1e-2 | Log-uniform |
| `dropout_rate` | 0.2 to 0.5 | Uniform |
| `dense_units` | {128, 256, 512} | Categorical |
| `batch_size` | {16, 32, 64} | Categorical |
| `lstm_units` | {64, 128, 256} | Categorical |

### Configuration
- **Trials**: 30
- **Sampler**: TPE (Tree-structured Parzen Estimator) — Bayesian optimization
- **Objective**: Maximize validation accuracy
- **Training per trial**: 1 epoch on 0.2% train / 1% val subset (for speed)
- **Output**: `best_params.json` consumed by `train.py`

---

# 11. Security

| Security Measure | Implementation | Details |
|:---|:---|:---|
| **JWT Authentication** | `jsonwebtoken` v9 | 30-day expiry; signed with `JWT_SECRET` env variable; verified in `auth.middleware.js` |
| **Password Hashing** | `bcryptjs` v3 | 10 salt rounds; applied in Sequelize `beforeCreate` hook; `validPassword()` uses `bcrypt.compare()` |
| **Input Validation** | `express-validator` v7 | Declarative validation chains on request bodies; prevents malformed data injection |
| **CORS Policy** | `cors` middleware | Configured to allow cross-origin requests from the Vite frontend origin |
| **SQL Injection Prevention** | Sequelize ORM | All queries use parameterized statements via Sequelize; no raw SQL with user input |
| **File Upload Validation** | Multer + custom filter | Only JPG/PNG/WEBP allowed; 10MB size limit; memory storage prevents disk-based attacks |
| **Environment Variables** | `dotenv` | All secrets (`JWT_SECRET`, `DB_PASS`, `GEMINI_API_KEY`, `OPENWEATHER_API_KEY`) stored in `.env` files, excluded from Git via `.gitignore` |
| **UUID Primary Keys** | Sequelize UUIDV4 | Non-sequential, globally unique IDs prevent enumeration attacks |
| **Password Exclusion** | Sequelize `attributes` | Password field is never returned in any API response (`exclude: ['password']`) |
| **API Key Protection** | Server-side only | External API keys (Gemini, OpenWeatherMap, data.gov.in) are used only on the backend; never exposed to the frontend |

---

# 12. Performance & Optimization

| Optimization | Component | Implementation | Impact |
|:---|:---|:---|:---|
| **Vite HMR** | Frontend | Native ESM hot module replacement; sub-second updates during development | 10-100× faster than CRA webpack |
| **Lazy Loading** | Frontend | React lazy imports for page-level code splitting | Reduces initial bundle size |
| **In-Memory Weather Cache** | Backend | 10-minute TTL cache by rounded lat/lon | Reduces OpenWeatherMap API calls by ~90% |
| **In-Memory Mandi Cache** | Backend | 30-minute TTL cache by state+crop | Reduces data.gov.in API calls |
| **Connection Pooling** | Backend | Sequelize pool: max=5, min=0, acquire=30s, idle=10s | Reuses PostgreSQL connections |
| **Multer Memory Storage** | Backend | Image kept in RAM buffer; proxied to Flask without disk write until after prediction | Eliminates intermediate disk I/O |
| **Model Preloading** | AI Server | `init_resources()` loads model, tokenizer, and treatment DB at Flask startup | Zero cold-start latency for predictions |
| **Gunicorn Preload** | AI Server | `preload_app = True` shares model weights across 2 workers | Halves memory usage |
| **tf.data Pipeline** | AI Training | `num_parallel_calls=AUTOTUNE`, `.prefetch(AUTOTUNE)`, `.batch()`, `.shuffle()` | Overlaps data loading with GPU training |
| **Stratified Subsetting** | AI Training | 10% stratified subset in Phase 1 & 2; class-balanced sampling | 10× faster training without accuracy loss |
| **GPU Memory Growth** | AI Training | `tf.config.experimental.set_memory_growth(gpu, True)` | Prevents TensorFlow from allocating all GPU memory upfront |
| **TFLite INT8 Quantization** | AI Deployment | Full integer quantization with calibration | ~4× model size reduction; faster edge inference |
| **Gemini Timeout** | Backend | 15-second `Promise.race` timeout wrapper | Prevents hung requests from blocking the event loop |
| **Image Resize at Preprocessing** | AI Pipeline | Images resized to 224×224 and saved to disk during preprocessing | Avoids repeated resizing during training |

---

# 13. Challenges & Solutions

### Challenge 1: Multimodal Model Fusion with Missing Text Data
- **Problem**: No large-scale dataset of farmer-described crop symptoms exists. The BiLSTM text branch requires text input during inference.
- **Tried**: Training with empty/zero text arrays → text branch learned noise patterns.
- **Solution**: Generated 500 synthetic symptom sentences using disease-specific keyword templates. During inference, if no symptoms are provided, a zero-padded array is sent, and the model relies primarily on the image branch. The crop prior mask further constrains predictions.

### Challenge 2: Grad-CAM with EfficientNetB3
- **Problem**: EfficientNetB3 has complex compound-scaled architecture with many conv layers. Identifying the correct "last conv layer" for Grad-CAM required dynamic layer discovery.
- **Tried**: Hardcoding layer names → failed across model versions (multimodal vs unimodal).
- **Solution**: Implemented `get_last_conv_layer_name()` that walks backward through `model.layers`, finding the last `Conv2D` layer (excluding projection/fusion layers) dynamically.

### Challenge 3: SHAP Compatibility with TensorFlow
- **Problem**: SHAP's `DeepExplainer` modifies TensorFlow's gradient registry, conflicting with Grad-CAM's `GradientTape` usage in the same process.
- **Solution**: Run SHAP in an isolated subprocess (`subprocess.run([sys.executable, __file__, "--only-shap"])`). If the subprocess fails, fall back to a custom gradient saliency map using `tf.GradientTape`.

### Challenge 4: Gemini API Rate Limits and JSON Parsing
- **Problem**: Gemini 2.5 Flash has per-minute rate limits that caused 429 errors during multi-user testing. Responses sometimes included markdown code blocks around JSON.
- **Solution**: 3-tier fallback (Flash → Flash Lite → hardcoded), `cleanGeminiResponse()` strips markdown code blocks, and `responseMimeType: 'application/json'` forces structured output. A 15-second timeout prevents hung requests.

### Challenge 5: PostgreSQL + PostGIS + Sequelize GEOMETRY Support
- **Problem**: Sequelize's `GEOMETRY('POLYGON')` type requires the PostGIS extension, which is not installed by default on PostgreSQL.
- **Solution**: Added `await sequelize.query('CREATE EXTENSION IF NOT EXISTS postgis;')` in the server startup before `sequelize.sync()`.

### Challenge 6: CORS Issues with Multipart File Uploads
- **Problem**: CORS preflight requests for `multipart/form-data` were rejected when the frontend (port 5173) posted to the backend (port 5000).
- **Solution**: Applied `cors()` middleware with default permissive configuration. The Multer middleware was integrated inline within the route handler (not as a global middleware) to prevent CORS conflicts with error responses.

### Challenge 7: TFLite Conversion for LSTM/Embedding Layers
- **Problem**: TFLite's default builtins don't support LSTM and Embedding operations.
- **Solution**: Added `SELECT_TF_OPS` to `target_spec.supported_ops` and set `unroll=True` on the LSTM layer to eliminate dynamic control flow, enabling TFLite compilation.

### Challenge 8: PlantVillage → PlantDoc Domain Gap
- **Problem**: Models trained only on PlantVillage (lab conditions) performed poorly on PlantDoc (real-world images with natural backgrounds).
- **Solution**: The 3-phase training pipeline dedicates Phase 3 to domain adaptation on PlantDoc with a very low learning rate (5e-6), gradually adapting the model to real-world conditions while preserving PlantVillage knowledge.

### Challenge 9: Class Imbalance in PlantVillage
- **Problem**: Some classes (e.g., Tomato diseases) have significantly more samples than others (e.g., Orange Huanglongbing).
- **Solution**: Computed balanced class weights via `sklearn.compute_class_weight('balanced')` and applied them during training. Data augmentation (including Random Erasing) also helps by generating synthetic variations of underrepresented classes.

### Challenge 10: Mandi API Reliability
- **Problem**: The data.gov.in API frequently times out or returns empty results for certain state/crop combinations.
- **Solution**: Implemented a comprehensive fallback system with realistic mock prices for 6 states and 10 crops, using deterministic pseudo-random price generation that produces consistent, region-appropriate values. Fallback data is cached for 5 minutes (vs. 30 minutes for live data) to trigger retries sooner.

---

# 14. Testing

## 14.1 API Testing with Postman

All REST API endpoints were manually tested using Postman with saved request collections:

- **Auth flow**: Register → Login → Protected endpoint with token → Expired token rejection
- **Disease detection**: Image upload with valid/invalid file types, oversized files, missing image, Flask server down scenarios
- **Farm CRUD**: Create plot → Update → Add crop rotation → Delete
- **Weather**: Valid/invalid coordinates, cache hit verification
- **Mandi**: Valid state/crop, empty results (fallback trigger), API timeout (fallback trigger)

## 14.2 Flask Integration Test

[test_flask_predict.py](file:///Users/kartik/Documents/Projects/AGRO/ai/test_flask_predict.py) sends a sample leaf image to the Flask `/predict` endpoint and validates the response structure.

## 14.3 Model Evaluation Testing

The [evaluate.py](file:///Users/kartik/Documents/Projects/AGRO/ai/evaluate.py) pipeline provides comprehensive model evaluation across 3 datasets with:
- Per-class precision, recall, F1-score
- Confusion matrix heatmaps
- ROC curves with per-class AUC
- Summary comparison table (Markdown format)

## 14.4 TFLite Comparison Testing

[convert_tflite.py](file:///Users/kartik/Documents/Projects/AGRO/ai/convert_tflite.py) compares Keras vs. Float32 TFLite vs. INT8 TFLite:
- Prediction agreement (same class predicted across all 3)
- Confidence divergence
- Latency comparison (ms per inference)
- Model size compression ratios

## 14.5 Manual UI Testing

- Responsive layout testing across desktop, tablet, and mobile viewports
- Error boundary crash recovery testing
- Toast notification rendering
- Form validation (registration, login, plot creation)
- Protected route redirect behavior

## 14.6 Known Limitations

- No automated unit test suite (Jest/Vitest) for frontend components
- No automated integration test suite for backend routes
- Model evaluation metrics depend on dataset availability in the local file system
- The multimodal model's text branch has not been evaluated independently from the image branch

---

# 15. Future Scope

| Feature | Description | Priority |
|:---|:---|:---:|
| **Mobile App** | React Native or Flutter app using the TFLite model for offline on-device inference | High |
| **IoT Sensor Integration** | Soil moisture sensors, temperature probes, and weather stations feeding real-time data into the recommendation engine | High |
| **Multilingual Support** | Hindi UI, regional language translations (Marathi, Tamil, Telugu, Punjabi, Bengali), voice input for illiterate farmers | High |
| **Crop Price Prediction** | Time-series forecasting of mandi prices using historical data (ARIMA, LSTM) to advise farmers on optimal selling windows | Medium |
| **Satellite Imagery Integration** | NDVI (Normalized Difference Vegetation Index) analysis from Sentinel-2 satellite data for large-scale crop health monitoring | Medium |
| **Offline Mode** | Progressive Web App (PWA) with service workers, local TFLite inference, and sync-on-reconnect for low-connectivity rural areas | High |
| **Government Scheme Engine** | Eligibility matching for PM-KISAN, PMFBY (crop insurance), KCC (Kisan Credit Card), and state-specific subsidies based on farmer profile | Medium |
| **Pest Prediction Model** | Weather-based pest outbreak prediction using historical pest incidence data and current weather patterns | Medium |
| **Community Forum** | Farmer-to-farmer knowledge sharing platform with expert moderation | Low |
| **Drone Integration** | Automated drone-based field surveying for large farms with disease detection on aerial images | Low |
| **Yield Estimation** | CNN-based yield estimation from crop images at different growth stages | Medium |
| **Soil Test Integration** | Integration with government soil testing lab APIs for automated NPK/pH data import | Medium |

---

# 16. Conclusion

## Summary

AgroSmart is a comprehensive, full-stack smart farming platform that successfully integrates deep learning plant disease detection, explainable AI, real-time weather monitoring, government market price tracking, intelligent farm management, and AI-powered advisory — all purpose-built for Indian farmers.

## Key Achievements

1. **Multimodal Deep Learning**: Successfully built and trained an EfficientNetB3 + BiLSTM multimodal architecture classifying 38 plant diseases across 14 crops, with a rigorous 3-phase training pipeline (frozen base → fine-tuning → domain adaptation).
2. **Explainable AI**: Implemented both Grad-CAM and SHAP/Saliency map explainability, making the AI's reasoning transparent and verifiable by farmers.
3. **Full-Stack Integration**: Delivered a 3-tier distributed system (React + Express + Flask) with 50+ REST API endpoints, 10 database models, and seamless inter-service communication.
4. **AI-Powered Advisory**: Integrated Google Gemini 2.5 Flash for context-aware farm recommendations and a bilingual chatbot with 3-tier fallback resilience (Primary → Lite → Offline).
5. **Production Readiness**: Implemented Gunicorn serving, TFLite model export (float32 + INT8 quantization), in-memory caching, and comprehensive error handling.
6. **India-Specific Design**: Mandi price tracking, KVK referrals, Hindi language support, Kharif/Rabi season awareness, and Indian crop varieties.

## Learning Outcomes

- Hands-on experience with transfer learning, domain adaptation, and the challenges of deploying deep learning models in production web applications.
- Understanding of multimodal model fusion, balancing image and text branches, and the importance of explainability for end-user trust.
- Practical knowledge of microservice architecture, inter-service communication, and the trade-offs between monolithic and distributed systems.
- Experience with Gemini API integration, prompt engineering for structured output, and building resilient fallback systems.

## Impact on Indian Agriculture

AgroSmart demonstrates that modern AI and web technologies can be combined to create accessible, practical tools for Indian farmers. By providing disease diagnosis, weather monitoring, market intelligence, and personalized advisory in a single platform — with visual explainability and bilingual support — AgroSmart takes a meaningful step toward democratizing precision agriculture for India's 150+ million farming households.

---

# 17. References

1. Mohanty, S.P., Hughes, D.P., & Salathé, M. (2016). "Using Deep Learning for Image-Based Plant Disease Detection." *Frontiers in Plant Science*, 7, 1419. DOI: 10.3389/fpls.2016.01419
2. Ferentinos, K.P. (2018). "Deep Learning Models for Plant Disease Detection and Diagnosis." *Computers and Electronics in Agriculture*, 145, 311-318.
3. Singh, D., Jain, N., et al. (2020). "PlantDoc: A Dataset for Visual Plant Disease Detection." *Proceedings of the 7th ACM IKDD CoDS and 25th COMAD*, 249-253.
4. Tan, M. & Le, Q.V. (2019). "EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks." *ICML 2019*.
5. Selvaraju, R.R., et al. (2017). "Grad-CAM: Visual Explanations from Deep Networks via Gradient-based Localization." *ICCV 2017*.
6. Lundberg, S.M. & Lee, S.I. (2017). "A Unified Approach to Interpreting Model Predictions." *NeurIPS 2017*.
7. Hughes, D.P. & Salathé, M. (2015). "An Open Access Repository of Images on Plant Health to Enable the Development of Mobile Disease Diagnostics." *arXiv:1511.08060*.
8. React Documentation — https://react.dev/
9. Vite Documentation — https://vitejs.dev/
10. Tailwind CSS v4 Documentation — https://tailwindcss.com/
11. Express.js Documentation — https://expressjs.com/
12. Sequelize ORM Documentation — https://sequelize.org/
13. TensorFlow/Keras Documentation — https://www.tensorflow.org/
14. Flask Documentation — https://flask.palletsprojects.com/
15. Google Gemini API Documentation — https://ai.google.dev/
16. OpenWeatherMap API Documentation — https://openweathermap.org/api
17. data.gov.in Open Data API — https://data.gov.in/
18. Optuna Documentation — https://optuna.org/
19. SHAP Documentation — https://shap.readthedocs.io/
20. PostGIS Documentation — https://postgis.net/
21. Akiba, T., et al. (2019). "Optuna: A Next-generation Hyperparameter Optimization Framework." *KDD 2019*.

---

# 18. Appendix

## 18.1 Environment Setup Instructions

### Root `.env` (for `inference.py` precision agriculture engine)
```env
OPENAI_API_KEY=your_openai_api_key_here
HF_TOKEN=your_hf_token_here
API_BASE_URL=https://api.openai.com/v1
MODEL_NAME=gpt-4-turbo-preview
ENV_URL=http://localhost:8000
```

### Backend `.env` (`server/.env`)
```env
PORT=5000
NODE_ENV=development
DB_NAME=agrosmart
DB_USER=your_postgres_username
DB_PASS=your_postgres_password
DB_HOST=localhost
DB_DIALECT=postgres
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_gemini_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
FLASK_AI_URL=http://localhost:5001
MANDI_API_KEY=your_data_gov_in_api_key
```

## 18.2 How to Run: Step by Step

### Prerequisites
1. **Node.js** v18+
2. **Python** 3.10+
3. **PostgreSQL** 18+ with **PostGIS** extension

### Option A: Unified Launcher
```bash
# 1. Clone and configure
git clone <repository_url>
cd AGRO
cp .env.example .env
cp server/.env.example server/.env
# Edit both .env files with your credentials

# 2. Create database
createdb agrosmart

# 3. Install dependencies
cd client && npm install && cd ..
cd server && npm install && cd ..
cd ai && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && cd ..

# 4. Start all servers
python3 app.py
```

### Option B: Manual Start (3 terminals)

**Terminal 1 — AI Server:**
```bash
cd ai
source venv/bin/activate
python api/app.py
# OR for production:
# gunicorn -c gunicorn_config.py api.app:app
```

**Terminal 2 — Backend:**
```bash
cd server
npm start
```

**Terminal 3 — Frontend:**
```bash
cd client
npm run dev
```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **AI Service**: http://localhost:5001

## 18.3 Complete Folder Structure

```
AGRO/
├── app.py                           # Unified launcher (starts all 3 servers)
├── inference.py                     # Standalone precision agriculture AI engine
├── .env.example                     # Root env template
├── .gitignore
├── README.md
├── sample_leaf.jpg                  # Test images
├── sample_tomato.jpg
│
├── client/                          # TIER 1: React Frontend
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── eslint.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── assets/
│       ├── components/ (auth, common, farm, landing, layout, ui)
│       ├── context/ (AuthContext, FarmContext, LocationContext)
│       ├── data/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/ (13 page modules)
│       ├── routes/ (AppRoutes.jsx)
│       ├── services/ (7 service modules)
│       └── utils/
│
├── server/                          # TIER 2: Express Backend
│   ├── package.json
│   ├── index.js
│   ├── .env / .env.example
│   ├── migrations/
│   ├── public/uploads/
│   └── src/
│       ├── config/ (database.js, server.js)
│       ├── controllers/ (auth, farms, reminders)
│       ├── middleware/ (auth, multer)
│       ├── models/ (10 models + index.js)
│       ├── prompts/ (chatbot, recommendation)
│       ├── routes/ (9 route modules + index.js)
│       └── services/ (gemini, recommendation)
│
├── ai/                              # TIER 3: Flask AI Server
│   ├── requirements.txt
│   ├── model.py
│   ├── train.py
│   ├── evaluate.py
│   ├── optuna_tuning.py
│   ├── convert_tflite.py
│   ├── gunicorn_config.py
│   ├── start.sh
│   ├── test_flask_predict.py
│   ├── api/ (app.py, config.py)
│   ├── data/ (datasets, processed, class_names, tokenizer)
│   ├── models/ (checkpoints, final models, TFLite)
│   ├── notebooks/
│   ├── outputs/ (evaluation, logs, plots, params)
│   └── utils/ (data_loader, preprocess, gradcam, severity_rules, shap_explainer)
│
├── database/                        # Database Reference
│   ├── schema.sql                   # SQL schema definition
│   └── setup.md                     # Setup instructions
│
└── ML_Models/
    └── Disease_detection/           # Additional ML model assets
```

## 18.4 Glossary of Technical Terms

| Term | Definition |
|:---|:---|
| **BiLSTM** | Bidirectional Long Short-Term Memory — a recurrent neural network that processes sequences in both forward and backward directions |
| **CNN** | Convolutional Neural Network — a deep learning architecture specialized for image recognition |
| **CORS** | Cross-Origin Resource Sharing — an HTTP mechanism that allows a web page to make requests to a different domain |
| **EfficientNet** | A family of neural network architectures that uniformly scales depth, width, and resolution using compound scaling |
| **Grad-CAM** | Gradient-weighted Class Activation Mapping — a technique that produces visual explanations for CNN predictions |
| **HMR** | Hot Module Replacement — a development feature that updates code in the browser without a full page reload |
| **JWT** | JSON Web Token — a compact, self-contained token format for securely transmitting authentication information |
| **KVK** | Krishi Vigyan Kendra — Indian agricultural extension centers providing local farming expertise |
| **Mandi** | Agricultural marketplace in India where farmers sell produce; prices are regulated by state governments |
| **ORM** | Object-Relational Mapping — a technique for converting database records into programming language objects |
| **PostGIS** | A spatial database extension for PostgreSQL that adds support for geographic objects |
| **SHAP** | SHapley Additive exPlanations — a method for explaining individual predictions based on game theory |
| **SPA** | Single Page Application — a web application that loads a single HTML page and dynamically updates content |
| **TFLite** | TensorFlow Lite — a lightweight version of TensorFlow for mobile and edge device deployment |
| **Transfer Learning** | A machine learning technique where a model trained on one task is adapted for a different but related task |
| **WSGI** | Web Server Gateway Interface — a specification for Python web servers to communicate with web applications |
| **Kharif** | The monsoon crop season in India (June–October); crops include rice, maize, cotton |
| **Rabi** | The winter crop season in India (October–March); crops include wheat, mustard, gram |
| **NPK** | Nitrogen, Phosphorus, Potassium — the three primary macronutrients for plant growth |

---

*End of Report*

---
