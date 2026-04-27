
import { useState, useRef } from "react";

async function callAI(messages) {
  const res = await fetch("http://localhost:3001/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages })
  });
  const data = await res.json();
  return data.text;
}

async function loadPdfJs() {
  if (window.pdfjsLib) return window.pdfjsLib;

  await new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  return window.pdfjsLib;
}

async function pdfToText(file) {
  const buf = await file.arrayBuffer();
  const pdfjs = await loadPdfJs();
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;

  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((x) => x.str).join(" ") + "\n";
  }

  return text.slice(0, 3000);
}

export default function App() {
  const fileRef = useRef();
  const [status, setStatus] = useState("");
  const [result, setResult] = useState("");

  async function handleFile(file) {
    setStatus("Reading PDF…");
    const text = await pdfToText(file);

    setStatus("Sending to backend…");
    const reply = await callAI([
      { role: "user", content: text }
    ]);

    setResult(reply);
    setStatus("✅ Done");
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Form AI — PDF Intake</h1>

      <div
        onClick={() => fileRef.current.click()}
        style={{
          border: "2px dashed #888",
          padding: 30,
          cursor: "pointer",
          marginBottom: 20
        }}
      >
        Click to upload PDF
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/pdf"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {status && <p>{status}</p>}

      {result && (
        <pre style={{ background: "#111", color: "#0f0", padding: 16 }}>
          {result}
        </pre>
      )}
    </div>
  );
}
