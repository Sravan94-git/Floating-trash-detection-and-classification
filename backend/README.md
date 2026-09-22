---
title: Flotect API
emoji: 🌊
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
---

# Flotect FastAPI backend

This folder contains the FastAPI inference backend and the YOLOv8n model used by Flotect.

The API endpoint is `POST /api/detect` with multipart field `images`. The health endpoint is `GET /health`.