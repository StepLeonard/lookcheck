const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ─── Random response banks ───────────────────────────────────────────────────

const faceResponses = {
  great: [
    {
      verdict: "LOOKING FIRE 🔥",
      score: Math.floor(Math.random() * 10) + 90,
      summary: "Your look is on point today.",
      details: [
        "Skin is glowing — great hydration or lighting game.",
        "Symmetry is strong. High cheekbones catching the light perfectly.",
        "Eyes are expressive and clear. Major confidence energy.",
        "Jawline definition is solid. Very photogenic angle.",
      ],
      tip: "Keep that lighting — natural or ring light works wonders. You're camera-ready.",
    },
    {
      verdict: "ABSOLUTELY SERVING 💅",
      score: Math.floor(Math.random() * 10) + 88,
      summary: "Clean, confident, camera-ready.",
      details: [
        "Your complexion looks smooth and even-toned.",
        "The smile (or lack of it) reads as intentional and powerful.",
        "Hair is framing your face really well right now.",
        "Overall expression radiates self-assurance.",
      ],
      tip: "A slight upward chin tilt would make this even more commanding.",
    },
  ],
  okay: [
    {
      verdict: "DECENT LOOK 👍",
      score: Math.floor(Math.random() * 15) + 65,
      summary: "Solid, but there's room to level up.",
      details: [
        "Lighting is a bit flat — try facing a window or adding warmth.",
        "Skin looks slightly tired — could be hydration or sleep.",
        "Expression is neutral — consider a subtle smize for more energy.",
        "Angle is average — shoot slightly from above for a better result.",
      ],
      tip: "Splash cold water on your face, find better light, and try again.",
    },
    {
      verdict: "NOT BAD AT ALL 🙂",
      score: Math.floor(Math.random() * 15) + 60,
      summary: "You've got the base, just needs polish.",
      details: [
        "Your features are strong but the photo isn't doing them justice.",
        "Shadows are falling awkwardly — reposition relative to your light source.",
        "Hair looks a little unsettled. A quick fix could elevate the whole look.",
        "Posture in the shot reads slightly low-energy.",
      ],
      tip: "Fix the lighting first — it's doing the most damage here.",
    },
  ],
  bad: [
    {
      verdict: "ROUGH DAY? 😬",
      score: Math.floor(Math.random() * 20) + 30,
      summary: "Let's be honest — this isn't your best moment.",
      details: [
        "Lighting is harsh and unflattering — avoid overhead or direct flash.",
        "Skin appears dull or red — stress, sleep, or environment could be factors.",
        "Expression reads as disengaged or tired.",
        "Angle is working against you hard right now.",
      ],
      tip: "Rest up, drink water, find soft light, and reshoot. You'll get there.",
    },
  ],
};

const outfitResponses = {
  great: [
    {
      verdict: "FIT CHECK: PASSED ✅",
      score: Math.floor(Math.random() * 10) + 90,
      summary: "This outfit is coordinated and sharp.",
      details: [
        "Colors are complementary and intentional — not accidental.",
        "Fit looks tailored or at least well-proportioned to your frame.",
        "Layering (if any) adds depth without looking chaotic.",
        "Overall styling shows awareness of current aesthetics.",
      ],
      tip: "This is a strong look. Consider accessorizing to push it to iconic.",
    },
    {
      verdict: "DRIP DETECTED 💧",
      score: Math.floor(Math.random() * 10) + 85,
      summary: "You put real effort into this and it shows.",
      details: [
        "The color palette is cohesive — clearly intentional.",
        "Silhouette is flattering and modern.",
        "Pieces feel like they belong together, not random grabs.",
        "Footwear (if visible) ties everything together.",
      ],
      tip: "Play with texture contrasts next time — it'll take this from good to great.",
    },
  ],
  okay: [
    {
      verdict: "MID FIT ⚠️",
      score: Math.floor(Math.random() * 20) + 50,
      summary: "It's fine. But fine isn't memorable.",
      details: [
        "Colors don't clash, but they also don't pop.",
        "Fit is loose in places — tailoring or sizing adjustment could help.",
        "The look reads as safe, not styled.",
        "Missing a focal point — no standout piece to anchor the outfit.",
      ],
      tip: "Swap one piece for something with more personality. A statement top, shoes, or accessory.",
    },
    {
      verdict: "COULD DO BETTER 😐",
      score: Math.floor(Math.random() * 20) + 45,
      summary: "The pieces exist. The outfit doesn't quite.",
      details: [
        "Mixing too many competing patterns or proportions.",
        "Color choices are fighting each other.",
        "Fit seems unintentional — overly baggy or oddly tight.",
        "Lacks a clear style direction.",
      ],
      tip: "Start with a neutral base and build from there. Less is more until you're confident.",
    },
  ],
  bad: [
    {
      verdict: "OUTFIT SOS 🚨",
      score: Math.floor(Math.random() * 20) + 15,
      summary: "We need to talk.",
      details: [
        "Colors are clashing in a way that's hard to ignore.",
        "The proportions are off — top and bottom are fighting.",
        "This looks like a rushed morning — nothing ties together.",
        "Fit issues throughout — nothing is hitting right.",
      ],
      tip: "Start over with solid neutrals. Black, white, grey. Build from there.",
    },
  ],
};

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomTier() {
  const rand = Math.random();
  if (rand < 0.45) return "great";
  if (rand < 0.80) return "okay";
  return "bad";
}

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "lookcheck-api" });
});

app.post("/analyze/face", (req, res) => {
  // Simulate processing delay
  setTimeout(() => {
    const tier = getRandomTier();
    const response = getRandom(faceResponses[tier]);
    // Finalize score with exact number
    response.score = tier === "great"
      ? Math.floor(Math.random() * 12) + 88
      : tier === "okay"
      ? Math.floor(Math.random() * 20) + 55
      : Math.floor(Math.random() * 25) + 20;

    res.json({ type: "face", tier, ...response });
  }, 1500 + Math.random() * 1000);
});

app.post("/analyze/outfit", (req, res) => {
  setTimeout(() => {
    const tier = getRandomTier();
    const response = getRandom(outfitResponses[tier]);
    response.score = tier === "great"
      ? Math.floor(Math.random() * 12) + 85
      : tier === "okay"
      ? Math.floor(Math.random() * 20) + 45
      : Math.floor(Math.random() * 25) + 15;

    res.json({ type: "outfit", tier, ...response });
  }, 1500 + Math.random() * 1000);
});

app.listen(PORT, () => {
  console.log(`LookCheck API running on port ${PORT}`);
});
