"use client";

import { useCallback, useEffect, useState } from "react";

type Status = { enabled: boolean; ready?: boolean; remaining?: number | null; resets_at?: string };

export function DemoNotice() {
  const [status, setStatus] = useState<Status | null>(null);
  const [failed, setFailed] = useState(false);
  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/demo-access", { cache: "no-store", credentials: "same-origin" });
      if (!response.ok) throw new Error("unavailable");
      const value = await response.json() as Status;
      setStatus(value);
      setFailed(false);
    } catch { setFailed(true); }
  }, []);
  useEffect(() => {
    void refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [refresh]);
  if (!failed && (!status || !status.enabled)) return null;
  return (
    <aside aria-label="Free preview limits / 無料体験の制限" style={{ padding: "16px 24px", borderBottom: "1px solid currentColor", fontSize: "13px", lineHeight: 1.7 }}>
      <p style={{ margin: "0 0 6px" }}>無料体験は、このブラウザで30日間に3回です。新規分析と再検証を合算し、1回800文字・最大2件の主張を対象とします。保存済みデモの閲覧と再検証は回数に含みません。</p>
      <p style={{ margin: "0 0 6px" }}>Three live operations per browser over 30 days, including re-checks. Up to 800 characters and two selected claims per operation. Prepared examples do not consume the trial.</p>
      <p style={{ margin: "0 0 6px" }}>IPアドレスを使った補助制限と、全利用者で共有する上限があります。これは本人確認ではありません。入力はGroq・Tavilyへ送信されるため、公開済み・機密性のない資料を使用してください。</p>
      <p style={{ margin: "0 0 8px" }}>Network and shared limits also apply; this is not proof of identity. Use public, non-confidential material. Live input is processed by Groq and Tavily.</p>
      <div aria-live="polite">
        {failed ? "利用状況を確認できません。 / Status unavailable."
          : !status?.ready ? "新規検索はAPI接続の準備中です。保存済みデモは利用できます。 / Live search is not yet configured; prepared examples remain available."
          : `前回確認時の残り回数 / Remaining at last check: ${status.remaining ?? "未確認"} / 3`}
      </div>
      <button type="button" onClick={() => void refresh()} style={{ marginTop: 8 }}>利用状況を更新 / Refresh status</button>
    </aside>
  );
}
