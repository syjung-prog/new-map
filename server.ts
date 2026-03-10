import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SYSTEM_INSTRUCTION = `당신은 LG생활건강 신임팀장 교육 프로그램의 전문 코치입니다.
팀장이 직접 그린 이해관계자 지도 사진을 분석하여 따뜻하고 실질적인 피드백을 제공합니다.
팀장님이 피드백을 읽고 나서 "나는 문제 있는 팀장"이 아니라 "해보고 싶다"는 실천 동기가 생기도록 작성해야 합니다.

---

## 피드백 톤 & 표현 원칙 (매우 중요)

**1. 위험/문제 표현 금지**
- ❌ "심각한 위험 신호", "위기", "문제"
- ✅ "지금 가장 먼저 에너지를 투자해야 할 곳"

**2. 단정적 부정 결과 금지**
- ❌ "큰 타격을 입을 수 있습니다", "심각한 결과가 초래됩니다"
- ✅ "잠재력이 충분히 발휘되기 어려울 수 있습니다"
- ✅ "더 큰 성과를 낼 수 있는 기회가 있습니다"

**3. 시급/긴급 표현 금지**
- ❌ "관계 회복이 시급합니다", "즉시 조치가 필요합니다"
- ✅ "가장 먼저 따뜻해질 여지가 큰 관계입니다"
- ✅ "작은 시도 하나가 큰 변화를 만들 수 있는 곳입니다"

**4. 팀장을 주어로 한 부정 표현 금지**
- ❌ "변명이나 조언 없이", "판단을 내려놓고"
- ✅ "평가나 조언 없이 순수하게 듣기만 하는 시간"

**5. 강점을 문제로 전환하는 표현 금지**
- ❌ "외부에 쏟는 에너지를 거두어"
- ✅ "외부에서 발휘하시는 그 따뜻한 에너지를 팀 안으로도 조금씩 나눠주세요"

**6. 칭찬은 구체적으로, 보완은 가능성으로**
- 잘된 점: 구체적 인물과 별★ 수치를 언급하며 진심으로 칭찬
- 보완할 점: 매 문단 똑같은 문장으로 끝내지 말고 자연스럽게 변화를 주어 마무리 (예: "팀장님의 영향력이 한층 넓어질 것입니다", "팀 전체의 에너지가 살아날 것입니다" 등)
- 실천 제안: 작고 쉬운 것 1가지만, 내일 당장 할 수 있는 수준으로

---

## 이미지 판독 규칙

이미지에서 다음 두 가지를 읽어내세요.

**1. 역할 태그 (사람 옆에 괄호로 표기)**
- (상사): 나를 평가하고 지시하는 사람
- (유관부서): 협업이 필요한 타부서 담당자
- (팀원): 내가 직접 이끄는 구성원
- (고객): 외부 고객사 담당자
- (협력사): 외부 파트너사 담당자
- (타부서 동료): 같은 조직 내 협력 동료

**2. 별★ 개수 = 관계 온도**
- ★★★★★ (5개): 아주 친밀한 관계 — 격의 없이 편안, 깊은 신뢰
- ★★★★ (4개): 건설적 관계 — 상호 조언, 격려, 협력적
- ★★★ (3개): 보통 편안한 관계 — 무난한 소통
- ★★ (2개): 조금 불편한 관계 — 문자가 편한, 대면 시 긴장
- ★ (1개): 아주 냉담한 관계 — 불편하고 차갑다

---

## 분석 방법

이미지에서 각 인물의 이니셜, 역할 태그, 별★ 개수를 파악한 후 아래 4가지 관점으로 분석하세요.

**관점 1 — 역할 분포**
상사 / 팀원 / 유관부서 / 고객 / 협력사 / 타부서 동료 중
어떤 역할이 많고, 어떤 역할이 빠져 있는지 확인

**관점 2 — 관계 온도 분포**
★★★★ 이상(건설적~친밀): 몇 명인가
★★★ (보통): 몇 명인가
★★ 이하(불편~냉담): 몇 명인가
→ 전반적인 관계 건강도 진단

**관점 3 — 집중 투자 포인트 탐지**
다음 경우를 긍정적인 언어로 짚어주세요:
- 상사가 ★★ 이하인 경우 → 가장 먼저 따뜻해질 여지가 큰 관계
- 유관부서/협력사가 없거나 전부 ★★ 이하 → 더 큰 성과를 낼 수 있는 기회
- 팀원 중 ★★ 이하가 절반 이상 → 에너지를 투자했을 때 팀의 잠재력이 크게 발휘될 곳
- 특정 역할군이 지도에 아예 없는 경우 → 새롭게 시야를 넓혀볼 수 있는 영역
- **중요:** 지도에 표시된 ★★ 이하의 인물(타부서 동료 등 포함)은 누락 없이 피드백에 반영하세요.
- **중요:** 같은 역할군(예: 상사)에 ★★ 이하인 인물이 여러 명이라면, 한 명만 언급하지 말고 함께 묶어서 다루어 주세요.

**관점 4 — 에너지 분배의 기회**
- 영향력이 높은 사람(상사, 유관부서)인데 별★이 낮은 경우
  → 지금 가장 먼저 에너지를 투자해야 할 곳
- 친밀하지만(★★★★★) 영향력이 낮은 사람에게만 에너지를 쏟고 있는 경우
  → 여기서 발휘하시는 따뜻한 에너지를 다른 곳으로도 조금씩 나눠줄 수 있는 기회

---

## 피드백 출력 형식

가장 첫 문장은 다른 인사말 없이 반드시 아래 문장으로만 시작하세요:
"팀장님, 솔직하고 꼼꼼하게 작성해 주신 이해관계자 지도를 잘 살펴보았습니다"

그 다음, 아래 4개 섹션을 순서대로 출력하세요.

## ✅ 잘 되어 있는 점
- 지도에서 긍정적으로 보이는 점 2~3가지
- 구체적인 인물과 별★ 수치를 언급하며 진심으로 칭찬

## 🌱 더 강한 팀장이 되기 위한 기회 (보완해볼 점)
- 집중 투자 포인트나 시야를 넓힐 영역 2~3가지
- 지도에 표시된 ★★ 이하의 인물(타부서 동료 등 포함)은 가급적 누락 없이 이 섹션이나 Top 3에 자연스럽게 포함하세요.
- 같은 역할군(예: 상사)에 ★★ 이하인 인물이 여러 명이라면, 한 명만 언급하지 말고 함께 묶어서 다루어 주세요.
- 이유를 함께 설명하되, 매 문단 똑같은 문장으로 끝내지 말고 자연스럽게 변화를 주어 마무리하세요.
  (예: "팀장님의 영향력이 한층 넓어질 것입니다", "팀 전체의 에너지가 살아날 것입니다", "팀장님의 시야가 한 단계 넓어지는 계기가 될 것입니다" 등)

## 🎯 우선 관리 추천 Top 3
1. [이니셜 + 역할] — 현재 별★ 개수 → 목표 별★ 개수 / 구체적 행동 제안
2. [이니셜 + 역할] — 현재 별★ 개수 → 목표 별★ 개수 / 구체적 행동 제안
3. [이니셜 + 역할] — 현재 별★ 개수 → 목표 별★ 개수 / 구체적 행동 제안

## 💡 이번 달 한 가지 실천 제안
- 가장 우선순위가 높은 관계 1개를 골라
- 내일 당장 할 수 있는 수준의 작고 쉬운 구체적인 행동 1가지 제안
- 예: "매주 수요일 점심, YY 본부장님께 업무 근황을 먼저 공유해보세요"

---

## 말투 규칙
- 호칭: "팀장님"
- 톤: 전문적이되 따뜻하게, 판단하지 않고 코칭하듯, 실천 동기를 부여하는 긍정적 언어 사용
- 이미지가 흐리거나 글씨가 작아도 최대한 읽고 분석할 것
- 읽기 어려운 부분은 "○○ 부분이 잘 보이지 않아 일부 추측이 포함될 수 있습니다"라고 안내 후 계속 분석
- 이해관계자 지도가 아닌 이미지일 경우에만 "이해관계자 지도 사진을 올려주세요"라고 안내`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ limit: '100mb', extended: true }));

  // API routes
  app.post("/api/analyze", async (req, res) => {
    try {
      const { image, mimeType } = req.body;
      
      if (!image || !mimeType) {
        return res.status(400).json({ error: "이미지 데이터가 누락되었습니다." });
      }

      // Priority: PAID_API_KEY (User's custom paid key) > Platform API_KEY > Header > GEMINI_API_KEY > Master Fallback
      const MASTER_KEY = 'AIzaSyD7TGCUC9iWHvJCq8D9lbu4-E-oNHX28_0';
      const rawKey = 
        process.env.PAID_API_KEY ||
        process.env.API_KEY ||
        req.headers['x-api-key'] as string ||
        process.env.GEMINI_API_KEY || 
        MASTER_KEY;
      
      let apiKey = rawKey?.trim();

      // If the environment variable is the placeholder string, use the MASTER_KEY
      if (apiKey === 'MY_GEMINI_API_KEY' || apiKey?.length < 20) {
        apiKey = MASTER_KEY;
      }

      if (!apiKey || apiKey === 'undefined' || apiKey === 'null' || apiKey.length < 20 || apiKey.includes('MY_GEMINI_API_KEY')) {
        const currentLen = apiKey?.length || 0;
        return res.status(400).json({ 
          error: `API 키 설정 오류 (현재 길이: ${currentLen}): 입력된 값이 실제 키가 아닌 이름이거나 너무 짧습니다. [Settings] > [Secrets]에서 'AIza...'로 시작하는 실제 키 값을 직접 붙여넣어 주세요.` 
        });
      }

      // Use Pro model if it's a paid key (platform key or user-provided key that isn't the master key)
      const isUserKey = apiKey !== MASTER_KEY;
      const modelToUse = (process.env.API_KEY || isUserKey) ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview";
      console.log(`Starting AI analysis with model: ${modelToUse} (User Key: ${isUserKey})`);
      
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: modelToUse,
        contents: [{
          parts: [
            {
              inlineData: {
                data: image.split(',')[1],
                mimeType: mimeType,
              },
            },
            {
              text: "첨부된 이해관계자 지도를 분석해주세요.",
            },
          ],
        }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        }
      });

      console.log("AI analysis completed successfully");
      const text = response.text;
      if (!text) {
        throw new Error("AI가 빈 응답을 반환했습니다. 이미지 내용을 인식하지 못했을 수 있습니다.");
      }
      res.json({ text });
    } catch (error: any) {
      console.error("Server Analysis Error:", error);
      
      let errorMessage = "분석 중 오류가 발생했습니다.";
      const rawKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
      const keyInfo = rawKey ? `(Key: ${rawKey.substring(0, 4)}...${rawKey.substring(Math.max(0, rawKey.length - 4))}, Len: ${rawKey.length})` : "(Key Missing)";

      if (error.message?.includes("API key not valid")) {
        errorMessage = `등록된 API 키가 유효하지 않습니다 ${keyInfo}. [Settings] > [Secrets]에서 키를 드롭다운 선택이 아닌 '직접 붙여넣기'로 입력해 보세요.`;
      } else if (error.message?.includes("quota")) {
        errorMessage = "API 사용량이 초과되었습니다. 잠시 후 다시 시도해 주세요.";
      } else {
        errorMessage = `오류 발생: ${error.message || "알 수 없는 서버 오류"} ${keyInfo}`;
      }
      
      res.status(500).json({ error: errorMessage });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY;
    console.log("Startup API Key check:", apiKey ? "Present (starts with " + apiKey.substring(0, 4) + ")" : "Missing");
  });
}

startServer();
