// api/chat.js — runs on Vercel's SERVER. The key never reaches the browser.
import { GoogleGenAI } from "@google/genai";

export const config = { runtime: "nodejs" };

async function readBody(req) {
  // Vercel Node runtime auto-parses JSON when content-type is application/json,
  // but be defensive: fall back to reading the raw stream if req.body is empty.
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY not set on server" });
  }
  try {
    const { contents, systemInstruction } = await readBody(req);
    if (!Array.isArray(contents) || contents.length === 0) {
      return res.status(400).json({ error: "contents[] required" });
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: systemInstruction ? { systemInstruction } : undefined,
    });
    res.status(200).json({ text: result.text });
  } catch (e) {
    res.status(500).json({ error: e.message || String(e) });
  }
}
