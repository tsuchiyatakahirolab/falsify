import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("landing page", () => {
  it("states the product promise and non-scoring boundary", () => {
    const html = renderToStaticMarkup(<Home />);

    expect(html).toContain("Inspect its evidence");
    expect(html).toContain("No truth score");
    expect(html).toContain("Turn the same adversarial method back on Falsify");
  });
});
