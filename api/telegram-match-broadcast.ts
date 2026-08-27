import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendTelegramMessage } from "./_telegram";

interface MatchBroadcastPayload {
  fixtureId: string | number;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  kickoffTime?: string;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  expectedHomeGoals: number;
  expectedAwayGoals: number;
  mtaaVerdict?: string;
  over25Prob?: number;
  bttsProb?: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const payload = req.body as MatchBroadcastPayload;

  if (!payload || !payload.homeTeam || !payload.awayTeam) {
    return res.status(400).json({ error: "Missing required match fields (homeTeam, awayTeam)." });
  }

  const homeWinPct = Math.round((payload.homeWinProb || 0.45) * 100);
  const drawPct = Math.round((payload.drawProb || 0.28) * 100);
  const awayWinPct = Math.round((payload.awayWinProb || 0.27) * 100);
  const over25Pct = Math.round((payload.over25Prob || 0.52) * 100);
  const bttsPct = Math.round((payload.bttsProb || 0.48) * 100);

  const matchUrl = `https://ballmtaani.com/edge/match/${payload.fixtureId || "101"}`;

  const messageHtml = `⚽ <b>BALLMTAANI EDGE — MATCHDAY INTELLIGENCE</b>
🏆 <i>${payload.competition || "FKF Premier League / Global"}</i>

⚔️ <b>${payload.homeTeam} vs ${payload.awayTeam}</b>
⏰ Kickoff: ${payload.kickoffTime || "Today"}

📊 <b>Dixon-Coles Model Win Probabilities:</b>
🟢 ${payload.homeTeam}: <b>${homeWinPct}%</b>
🟡 Draw: <b>${drawPct}%</b>
🔵 ${payload.awayTeam}: <b>${awayWinPct}%</b>

🎯 <b>Expected Goals (xG):</b> ${payload.expectedHomeGoals ?? 1.45} - ${payload.expectedAwayGoals ?? 0.95}
📈 <b>Over 2.5 Goals:</b> ${over25Pct}% | <b>BTTS:</b> ${bttsPct}%

🎯 <b>Street Verdict:</b>
<i>"${payload.mtaaVerdict || "High confidence on home advantage with tight goal margin."}"</i>

👉 <a href="${matchUrl}"><b>View Full Analysis &amp; Share Receipt on BallMtaani</b></a>`;

  const result = await sendTelegramMessage(messageHtml, {
    parseMode: "HTML",
    disableWebPagePreview: false,
  });

  return res.status(200).json({
    success: result.ok,
    messageId: result.messageId,
    error: result.error,
    formattedMessage: messageHtml,
  });
}
