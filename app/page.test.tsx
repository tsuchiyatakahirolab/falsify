import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("landing page", () => {
  it("states the product promise and non-scoring boundary", () => {
    const html = renderToStaticMarkup(<Home />);

    expect(html).toContain("by TSUCHIYA LAB");
    expect(html).toContain("主張と根拠の対応を確認する");
    expect(html).toContain("人物や文書全体に真偽の点数は付けません");
    expect(html).toContain("説明用に作成した架空の例");
  });
});
