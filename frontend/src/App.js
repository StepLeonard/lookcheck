import React, { useState, useRef, useCallback, useEffect } from "react";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

// ─── Download Card Generator ──────────────────────────────────────────────────
async function generateShareCard(photoDataUrl, result) {
  const W = 1080, H = 1440;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  const tierColor  = result.tier === "great" ? "#00ff88" : result.tier === "okay" ? "#ffe600" : "#ff2d78";
  const tierColor2 = result.tier === "great" ? "#00e5ff" : result.tier === "okay" ? "#ff6b00" : "#bf00ff";

  // ── Black background ──
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, W, H);

  // ── Subtle star dots ──
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  for (let i = 0; i < 120; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Background glow blobs ──
  const g1 = ctx.createRadialGradient(W * 0.2, H * 0.15, 0, W * 0.2, H * 0.15, 400);
  g1.addColorStop(0, `${tierColor}22`); g1.addColorStop(1, "transparent");
  ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);
  const g2 = ctx.createRadialGradient(W * 0.8, H * 0.85, 0, W * 0.8, H * 0.85, 400);
  g2.addColorStop(0, `${tierColor2}22`); g2.addColorStop(1, "transparent");
  ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);

  // ── Photo (full width, top portion) ──
  const photo = await new Promise((res) => {
    const img = new Image();
    img.onload = () => res(img);
    img.src = photoDataUrl;
  });

  const PHOTO_H = 720;
  const PHOTO_Y = 60;
  const photoAspect = photo.naturalWidth / photo.naturalHeight;
  let photoDrawW = PHOTO_H * photoAspect;
  let photoDrawH = PHOTO_H;
  // if wider than canvas, fill width instead
  if (photoDrawW > W - 80) {
    photoDrawW = W - 80;
    photoDrawH = photoDrawW / photoAspect;
  }
  const photoX = (W - photoDrawW) / 2;

  const RADIUS = 40;
  ctx.save();
  roundRect(ctx, photoX, PHOTO_Y, photoDrawW, photoDrawH, RADIUS);
  ctx.clip();
  ctx.drawImage(photo, photoX, PHOTO_Y, photoDrawW, photoDrawH);
  ctx.restore();

  // rainbow border on photo
  const borderGrad = ctx.createLinearGradient(photoX, PHOTO_Y, photoX + photoDrawW, PHOTO_Y + photoDrawH);
  borderGrad.addColorStop(0, "#ff2d78");
  borderGrad.addColorStop(0.25, "#ff6b00");
  borderGrad.addColorStop(0.5, "#ffe600");
  borderGrad.addColorStop(0.75, "#00e5ff");
  borderGrad.addColorStop(1, "#bf00ff");
  ctx.save();
  roundRect(ctx, photoX, PHOTO_Y, photoDrawW, photoDrawH, RADIUS);
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.restore();

  // ── Score badge on photo (top-right corner) ──
  const BX = photoX + photoDrawW - 150, BY = PHOTO_Y + 24;
  ctx.save();
  roundRect(ctx, BX, BY, 126, 72, 18);
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.fill();
  ctx.strokeStyle = tierColor;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
  ctx.textAlign = "center";
  ctx.font = "bold 42px Fredoka, sans-serif";
  ctx.fillStyle = tierColor;
  ctx.shadowColor = tierColor; ctx.shadowBlur = 12;
  ctx.fillText(`${result.score}`, BX + 63, BY + 46);
  ctx.shadowBlur = 0;
  ctx.font = "600 16px Nunito, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillText("/ 100", BX + 63, BY + 65);
  ctx.textAlign = "left";

  const CONTENT_Y = PHOTO_Y + photoDrawH + 50;

  // ── BIG VERDICT ──
  ctx.textAlign = "center";
  ctx.font = "700 88px Fredoka, sans-serif";
  const vGrad = ctx.createLinearGradient(0, CONTENT_Y - 80, W, CONTENT_Y);
  vGrad.addColorStop(0, tierColor);
  vGrad.addColorStop(1, tierColor2);
  ctx.fillStyle = vGrad;
  ctx.shadowColor = tierColor; ctx.shadowBlur = 30;
  ctx.fillText(result.verdict, W / 2, CONTENT_Y);
  ctx.shadowBlur = 0;

  // ── Summary ──
  ctx.font = "600 30px Nunito, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText(result.summary, W / 2, CONTENT_Y + 52);
  ctx.textAlign = "left";

  // ── Divider ──
  const DIV_Y = CONTENT_Y + 86;
  const divGrad = ctx.createLinearGradient(60, 0, W - 60, 0);
  divGrad.addColorStop(0, "transparent");
  divGrad.addColorStop(0.3, tierColor + "88");
  divGrad.addColorStop(0.7, tierColor2 + "88");
  divGrad.addColorStop(1, "transparent");
  ctx.beginPath(); ctx.moveTo(60, DIV_Y); ctx.lineTo(W - 60, DIV_Y);
  ctx.strokeStyle = divGrad; ctx.lineWidth = 2; ctx.stroke();

  // ── Details ──
  const BULLET_COLORS = [tierColor, tierColor2, "#ffffff"];
  let detailY = DIV_Y + 52;
  ctx.font = "600 24px Nunito, sans-serif";
  for (let i = 0; i < Math.min(result.details.length, 3); i++) {
    ctx.fillStyle = BULLET_COLORS[i % 3];
    ctx.shadowColor = BULLET_COLORS[i % 3]; ctx.shadowBlur = 8;
    ctx.fillText("→", 60, detailY);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    wrapText(ctx, result.details[i], 108, detailY, W - 180, 34);
    detailY += 54;
  }

  // ── Pro tip pill ──
  const TIP_Y = detailY + 20;
  ctx.save();
  roundRect(ctx, 60, TIP_Y, W - 120, 130, 22);
  ctx.fillStyle = "rgba(77,121,255,0.1)";
  ctx.fill();
  ctx.strokeStyle = "rgba(77,121,255,0.35)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
  ctx.font = "700 18px Nunito, sans-serif";
  ctx.fillStyle = "#4d79ff";
  ctx.letterSpacing = "3px";
  ctx.fillText("💡  PRO TIP", 88, TIP_Y + 40);
  ctx.letterSpacing = "0px";
  ctx.font = "600 22px Nunito, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  wrapText(ctx, result.tip, 88, TIP_Y + 76, W - 200, 30);

  // ── LOOKCHECK LOGO at bottom ──
  const LOGO_Y = H - 90;

  // logo background pill
  ctx.save();
  const pillW = 360, pillH = 68, pillX = (W - pillW) / 2, pillY = LOGO_Y - 50;
  roundRect(ctx, pillX, pillY, pillW, pillH, 34);
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fill();
  // rainbow pill border
  const pillBorder = ctx.createLinearGradient(pillX, pillY, pillX + pillW, pillY);
  pillBorder.addColorStop(0, "#ff2d78");
  pillBorder.addColorStop(0.5, "#ffe600");
  pillBorder.addColorStop(1, "#00e5ff");
  ctx.strokeStyle = pillBorder;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();

  // LOOK text
  ctx.textAlign = "center";
  ctx.font = "700 42px Fredoka, sans-serif";
  const lookGrad = ctx.createLinearGradient(W/2 - 100, 0, W/2, 0);
  lookGrad.addColorStop(0, "#ff2d78");
  lookGrad.addColorStop(1, "#ff6b00");
  ctx.fillStyle = lookGrad;
  ctx.shadowColor = "#ff2d78"; ctx.shadowBlur = 14;
  ctx.fillText("LOOK", W / 2 - 48, LOGO_Y - 4);
  ctx.shadowBlur = 0;

  // CHECK text
  const checkGrad = ctx.createLinearGradient(W/2, 0, W/2 + 100, 0);
  checkGrad.addColorStop(0, "#00e5ff");
  checkGrad.addColorStop(1, "#bf00ff");
  ctx.fillStyle = checkGrad;
  ctx.shadowColor = "#00e5ff"; ctx.shadowBlur = 14;
  ctx.fillText("CHECK", W / 2 + 62, LOGO_Y - 4);
  ctx.shadowBlur = 0;

  // lookcheck.app tagline
  ctx.font = "600 18px Nunito, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fillText("lookcheck.app", W / 2, LOGO_Y + 26);
  ctx.textAlign = "left";

  return canvas.toDataURL("image/jpeg", 0.93);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let cy = y;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      ctx.fillText(line, x, cy);
      line = words[n] + " ";
      cy += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, cy);
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, tier }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = tier === "great" ? "#00ff88" : tier === "okay" ? "#ffe600" : "#ff2d78";

  return (
    <div className="score-ring-wrapper">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)", filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="score-ring-label">
        <span className="score-number">{score}</span>
        <span className="score-sub">/ 100</span>
      </div>
    </div>
  );
}

// ─── Result Card ──────────────────────────────────────────────────────────────
function ResultCard({ result, photo, onReset }) {
  const [visible, setVisible] = useState(false);
  const [verdictPop, setVerdictPop] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
    setTimeout(() => setVerdictPop(true), 400);
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const cardUrl = await generateShareCard(photo, result);
      const a = document.createElement("a");
      a.href = cardUrl;
      const label = result.type === "face" ? "face" : "outfit";
      a.download = `lookcheck-${label}-${result.score}.jpg`;
      a.click();
      setDownloaded(true);
    } catch (e) {
      console.error("Download failed", e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={`result-card ${visible ? "result-card--visible" : ""} tier-${result.tier}`}>
      {photo && (
        <div className="result-photo-wrap">
          <img src={photo} alt="Your scan" className="result-photo" />
          <div className={`result-photo-badge tier-badge-${result.tier}`}>{result.score}</div>
        </div>
      )}

      {/* Big good/bad verdict pop */}
      <div className={`verdict-pop verdict-pop--${result.tier} ${verdictPop ? "verdict-pop--visible" : ""}`}>
        <span className="verdict-emoji">
          {result.tier === "great" ? "🔥" : result.tier === "okay" ? "👍" : "😬"}
        </span>
        <span className="verdict-word">
          {result.tier === "great" ? "LOOKING GOOD!" : result.tier === "okay" ? "NOT BAD!" : "ROUGH DAY!"}
        </span>
      </div>

      <div className="result-top">
        <ScoreRing score={result.score} tier={result.tier} />
        <div className="result-header">
          <h2 className="result-verdict">{result.verdict}</h2>
          <p className="result-summary">{result.summary}</p>
        </div>
      </div>

      <div className="result-details">
        {result.details.map((d, i) => (
          <div key={i} className="detail-item" style={{ animationDelay: `${0.5 + i * 0.12}s` }}>
            <span className="detail-bullet">→</span>
            <span>{d}</span>
          </div>
        ))}
      </div>

      <div className="result-tip">
        <span className="tip-label">PRO TIP</span>
        <p>{result.tip}</p>
      </div>

      <div className="result-actions">
        <button
          className={`btn-download ${downloading ? "btn-download--loading" : ""}`}
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? (
            <><span className="btn-spinner" /> Generating card…</>
          ) : (
            <><span className="btn-icon">↓</span> Save Your Look</>
          )}
        </button>
        <button className="btn-scan-again" onClick={onReset}>Scan Again</button>
      </div>

      {downloaded && (
        <div className="preview-hint">✓ Share card saved to your photos!</div>
      )}
    </div>
  );
}

// ─── Analyzing Screen ──────────────────────────────────────────────────────────
function AnalyzingScreen({ photo, mode }) {
  const messages = mode === "face"
    ? ["Reading your face…", "Checking your glow…", "Almost there…"]
    : ["Scanning your fit…", "Checking the vibes…", "Almost there…"];
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setMsgIdx(i => (i + 1) % messages.length), 1400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="analyzing">
      {/* Photo with spinner overlay */}
      <div className="analyzing-photo-wrap">
        {photo && <img src={photo} alt="" className="analyzing-photo" />}
        <div className="analyzing-spinner-ring" />
        <div className="analyzing-spinner-ring analyzing-spinner-ring--2" />
        <div className="analyzing-overlay-text">
          <span className="analyzing-icon">{mode === "face" ? "👤" : "👕"}</span>
        </div>
      </div>

      <p className="analyzing-text" key={msgIdx}>{messages[msgIdx]}</p>

      <div className="analyzing-dots">
        {[0,1,2].map(i => (
          <div key={i} className="analyzing-dot" style={{ animationDelay: `${i * 0.25}s` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Camera View ──────────────────────────────────────────────────────────────
function CameraView({ mode, onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setReady(true);
        }
      } catch (err) {
        console.error("Camera error:", err);
      }
    }
    startCamera();
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const shoot = useCallback(() => {
    let count = 3;
    setCountdown(count);
    const interval = setInterval(() => {
      count--;
      if (count === 0) {
        clearInterval(interval);
        setCountdown(null);
        setFlash(true);
        setTimeout(() => setFlash(false), 300);
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        onCapture(dataUrl);
      } else {
        setCountdown(count);
      }
    }, 1000);
  }, [onCapture]);

  return (
    <div className="camera-wrapper">
      {flash && <div className="flash-overlay" />}
      <div className="camera-frame">
        <div className="camera-corner tl" /><div className="camera-corner tr" />
        <div className="camera-corner bl" /><div className="camera-corner br" />
        <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
        {!ready && <div className="camera-loading">Initializing camera…</div>}
        {countdown !== null && (
          <div className="countdown-overlay">
            <span className="countdown-number">{countdown}</span>
          </div>
        )}
        <div className="scan-label">{mode === "face" ? "FACE SCAN" : "OUTFIT SCAN"}</div>
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <p className="camera-hint">
        {mode === "face"
          ? "Center your face in the frame, good lighting helps"
          : "Step back so your full outfit is visible"}
      </p>
      <button className={`btn-capture ${ready ? "" : "btn-capture--disabled"}`} onClick={ready ? shoot : undefined}>
        <span className="btn-capture-inner" />
      </button>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("home");
  const [mode, setMode] = useState(null);
  const [result, setResult] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState(null);

  const selectMode = (m) => {
    setMode(m);
    setScreen("camera");
    setError(null);
  };

  const handleCapture = async (dataUrl) => {
    setPhoto(dataUrl);
    setScreen("analyzing");
    try {
      const res = await fetch(`${API_URL}/analyze/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setResult(data);
      setScreen("result");
    } catch (err) {
      setError("Couldn't reach the server. Is the API running?");
      setScreen("camera");
    }
  };

  const reset = () => {
    setScreen("home");
    setMode(null);
    setResult(null);
    setPhoto(null);
    setError(null);
  };

  return (
    <div className="app">
      <div className="bg-noise" />
      <div className="bg-glow" />

      <header className="header">
        <div className="logo" onClick={reset}>
          <span className="logo-look">LOOK</span><span className="logo-check">CHECK</span>
        </div>
        {screen !== "home" && (
          <button className="btn-back" onClick={reset}>← Back</button>
        )}
      </header>

      <main className="main">
        {screen === "home" && (
          <div className="home">
            <div className="home-hero">
              <h1 className="home-title">
                HOW DO<br />YOU LOOK<span className="title-dot">?</span>
              </h1>
              <p className="home-sub">Point your camera. Get real feedback. No filter.</p>
            </div>
            {error && <p className="error-msg">{error}</p>}
            <div className="mode-cards">
              <button className="mode-card mode-card--face" onClick={() => selectMode("face")}>
                <div className="mode-card-icon">👤</div>
                <div className="mode-card-label">FACE<br />SCAN</div>
                <div className="mode-card-desc">Is your face looking fresh today?</div>
              </button>
              <button className="mode-card mode-card--outfit" onClick={() => selectMode("outfit")}>
                <div className="mode-card-icon">👕</div>
                <div className="mode-card-label">OUTFIT<br />CHECK</div>
                <div className="mode-card-desc">Does your fit actually go?</div>
              </button>
            </div>
          </div>
        )}

        {screen === "camera" && (
          <CameraView mode={mode} onCapture={handleCapture} />
        )}

        {screen === "analyzing" && (
          <AnalyzingScreen photo={photo} mode={mode} />
        )}

        {screen === "result" && result && (
          <ResultCard result={result} photo={photo} onReset={reset} />
        )}
      </main>
    </div>
  );
}
