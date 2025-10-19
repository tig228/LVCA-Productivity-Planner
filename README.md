# 🎙️ SyncFlow

An AI-powered voice-based planner that lets you speak or type tasks and automatically schedules them into your calendar using **AWS Bedrock (Claude 3)** and **Google Calendar**.

## 🚀 Features
- 🎤 **Voice Input:** Uses the Web Speech API for 10s voice capture.  
- 🤖 **AI Event Parsing:** AWS Lambda + Bedrock Claude 3 parses natural text into structured events.  
- 🗓️ **Smart Calendar:** Add, edit, or delete tasks stored in browser `localStorage`.  
- 🕓 **Auto Scheduling:** Learns what’s “hard” or “easy” and suggests best times.  
- ☁️ **Moodle Integration (Optional):** Import assignments via AWS Lambda scraper or ICS feed.  
- 📅 **Google Calendar Sync:** One-click button opens prefilled Google Calendar event.

## ⚙️ Tech Stack
**Frontend:** HTML, CSS, JavaScript  
**Backend:** AWS Lambda (Node.js 18) + API Gateway  
**AI Engine:** AWS Bedrock Claude 3 Haiku  
**Extras:** Web Speech API, Google Calendar integration  

## 🧠 How It Works
1. Click 🎙️ and describe your plan — “Lunch with Sarah tomorrow at noon.”  
2. Voice → text → AWS → JSON → calendar event.  
3. Event shows instantly in your planner.  
4. Click to open in Google Calendar.  

## 🛠️ Setup
1. Upload `lambda_bedrock.zip` to AWS Lambda.  
   - Runtime: Python 3.11 or Node.js 18  
   - Add `AmazonBedrockFullAccess` policy  
2. Create API Gateway → REST API → `/process` → POST → Lambda Proxy → enable CORS.  
3. Copy the invoke URL and update in `scripts.js`:
   ```js
   const API_URL = "https://<YOUR_API_ID>.execute-api.us-east-1.amazonaws.com/prod/process";
