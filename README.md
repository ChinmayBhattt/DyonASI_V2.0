# 🚀 DysonASI – AI Virtual Assistant

DysonASI is an advanced **AI-powered chatbot** designed to provide intelligent, **context-aware** responses. It supports **document uploads, chat persistence, predefined responses, and AI-driven text analysis**. DysonASI aims to evolve into **Artificial General Intelligence (AGI)** by continuously improving its capabilities.

---

## 🌟 Key Features

- 🤖 **AI-Powered Responses** – Generates intelligent and dynamic replies based on user input.
- 📂 **Document Upload Support** – Reads and analyzes documents for better contextual understanding.
- 💾 **Chat Persistence** – Saves chat history in MongoDB for easy retrieval and continuation.
- 🏠 **Predefined Responses** – Handles frequently asked questions efficiently.
- 🔍 **Smart Query Recognition** – Recognizes variations in user queries for improved accuracy.
- 🌐 **Web-Based Interface** – Easy-to-use chatbot UI with real-time interaction.
- ⚡ **Scalable Backend** – Built using **Node.js, Express, and MongoDB** for a robust infrastructure.
- 🛠 **Extensible API** – Provides a REST API for integration with third-party applications.

---

## 🏗️ Architecture Overview

DysonASI follows a **modular and scalable** architecture:

1. **Frontend**:
   - Web-based chatbot UI (can be integrated into any webpage)
   - **React.js / Vanilla JavaScript**
  
2. **Backend**:
   - **Node.js & Express.js** for handling API requests
   - **Predefined response engine** for answering common questions
   - **Google Gemini API** integration for AI responses

3. **Database**:
   - **MongoDB** (or any NoSQL database) for chat history storage
   - Uses **structured JSON format** to store conversations

4. **Document Processing**:
   - Supports **PDF, DOCX, TXT** files
   - Extracts key insights for AI-based responses

---

## 🛠️ Installation Guide

### 🔹 Prerequisites

Ensure you have the following installed:

- **Node.js** (Latest LTS version recommended)
- **MongoDB** (Local or cloud-based database)
- **npm** (Node Package Manager)

### 🔹 Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/ChinmayBhattt/DysonASI.git
   cd DysonASI
