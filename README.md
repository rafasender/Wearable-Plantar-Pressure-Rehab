# 🩺 Wearable Plantar Pressure Rehab

**Web system for monitoring and analyzing plantar pressure in patients undergoing physiotherapeutic rehabilitation.**

---

## 🧠 Overview

This project integrates a **wearable device** equipped with **FSR-402 pressure sensors** and an **Arduino microcontroller** with a **FastAPI backend** and a **React + Vite frontend**.

It provides real-time visualization of **plantar pressure distribution** on an anatomical foot silhouette and computes metrics such as **maximum pressure** and **regional load distribution**.

The system supports physiotherapists in tracking the **rehabilitation progress of post-stroke patients**, enabling the recording of sessions, comparison of results, and interactive visualization of evolution over time.

---

## ⚙️ Tech Stack

**Hardware:**
- Arduino + FSR-402 pressure sensors

**Backend:**
- FastAPI (Python)
- Serial communication with Arduino

**Frontend:**
- React + TypeScript
- Vite (build tool)

---

## 🚀 How to Run

### 1. Backend

cd backend
pip install -r requirements.txt
uvicorn main:app --reload

### 2. Frontend

cd frontend
npm install
npm run dev

---

## 📊 Features

- Real-time plantar pressure monitoring

- Visualization over anatomical foot silhouette

- Metrics: max pressure, load distribution, session tracking

- Data acquisition via Arduino (serial communication)

- Designed for physiotherapy and post-stroke rehabilitation

### Authors

Developed by students of Biomedical Engineering from FICSAE
Project for the Semester 2025.2