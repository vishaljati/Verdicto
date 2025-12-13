import { getGeminiModel, DEFAULT_MODEL } from "../config/gemini.config.js";


//Run structured debate rounds
//parameter - prob obj ,personas[] list , session obj
const runDebateRounds = async ({ problem, personas, session })=>{
    const maxRounds = session.settings?.maxRounds || 3;
    const modelName = session.model || DEFAULT_MODEL;
    const model = getGeminiModel(modelName);

    const messages = [];
    let round = 1;

    const decisionContext = `
Decision Title: ${problem.title}
Context:
${problem.description || "No additional context provided."}
`;

    while (round <= maxRounds) {
        for (const persona of personas) {
            const debateSoFar = messages
                .map(
                    (m) =>
                        `[Round ${m.roundNumber}] ${m.personaName}: ${m.content}`
                )
                .join("\n");

            const prompt = `
You are acting as: ${persona.name}

${persona.systemPrompt}

Rules:
- Argue your perspective clearly
- Challenge existing arguments if needed
- Do NOT repeat points unless refuting
- Be concise and decisive

Decision:
${decisionContext}

Previous arguments:
${debateSoFar || "None yet."}

Respond ONLY with your argument in short structured manner.
`;

            const result = await model.generateContent(prompt);
            const text = result.response.text();

            messages.push({
                personaName: persona.name,
                roundNumber: round,
                content: text.trim(),
                meta: {
                    model: modelName,
                },
            });
        }
        round++;
    }

    return {
        rounds: maxRounds,
        messages,
    };
}


 // Generate final verdict from debate messages
//parameter - prob obj ,messages[]
const generateVerdict= async ({ problem , messages })=> {
    const model = getGeminiModel(); // default = flash-lite

    const transcript = messages
        .map(
            (m) =>`[${m.personaName} | Round ${m.roundNumber}]\n${m.content}`
        )
        .join("\n\n");

    const prompt = `
You are an expert decision synthesizer.

Analyze the debate and return ONE final verdict.

Decision:
${problem.title}

Context:
${problem.description || "No additional context."}

Debate:
${transcript}

Return ONLY valid JSON:

{
  "summary": "Brief neutral summary",
  "recommendation": "One clear action to take",
  "confidenceScore": 0.0,
  "pros": [],
  "cons": [],
  "risks": [],
  "nextActions": []
}

Rules:
- confidenceScore between 0.0 and 100.0
- recommendation must be decisive and clear
- no markdown
- no extra text
`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch (err) {
        console.error("❌ Verdict JSON parse failed:", raw);
        throw new Error("AI verdict parsing failed");
    }

    return {
        summary: parsed.summary,
        recommendation: parsed.recommendation,
        confidenceScore: parsed.confidenceScore,
        pros: parsed.pros || [],
        cons: parsed.cons || [],
        risks: parsed.risks || [],
        nextActions: parsed.nextActions || [],
    };
}

export {runDebateRounds,generateVerdict}
