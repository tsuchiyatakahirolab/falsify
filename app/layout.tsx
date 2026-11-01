import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Falsify | 主張と根拠の対応を確認する | TSUCHIYA LAB",
  description:
    "Falsify by TSUCHIYA LAB。主張を分け、支持する資料と反証・限定を示す資料を照合する研究用プレビュー。Inspect the evidence behind each claim.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
