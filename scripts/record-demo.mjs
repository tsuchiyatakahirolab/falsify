import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

const require = createRequire(import.meta.url);
const playwrightPackage = process.env.PLAYWRIGHT_PACKAGE || "playwright";
const { chromium } = require(playwrightPackage);

const targetUrl = process.env.DEMO_URL || "https://falsify-mu.vercel.app/";
const outputPath = resolve(
  process.argv[2] || "artifacts/video/falsify-build-week-demo.webm",
);
const chromePath =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

await mkdir(dirname(outputPath), { recursive: true });

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
  args: ["--hide-scrollbars", "--force-device-scale-factor=1"],
});

const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  recordVideo: {
    dir: dirname(outputPath),
    size: { width: 1440, height: 900 },
  },
});

const page = await context.newPage();

async function pause(milliseconds) {
  await page.waitForTimeout(milliseconds);
}

async function installCursor() {
  await page.evaluate(() => {
    const cursor = document.createElement("div");
    cursor.id = "codex-demo-cursor";
    Object.assign(cursor.style, {
      position: "fixed",
      left: "50%",
      top: "50%",
      width: "22px",
      height: "22px",
      border: "3px solid white",
      borderRadius: "999px",
      background: "#125d50",
      boxShadow: "0 2px 10px rgba(0,0,0,.35)",
      pointerEvents: "none",
      transform: "translate(-50%, -50%)",
      transition: "left 600ms ease, top 600ms ease",
      zIndex: "2147483647",
    });
    document.body.append(cursor);
  });
}

async function moveCursorTo(locator) {
  await locator.evaluate((element) =>
    element.scrollIntoView({ behavior: "smooth", block: "center" }),
  );
  await pause(1300);
  const box = await locator.boundingBox();
  if (!box) throw new Error("Target element is not visible in the recording.");
  await page.evaluate(
    ({ x, y }) => {
      const cursor = document.querySelector("#codex-demo-cursor");
      if (!(cursor instanceof HTMLElement)) return;
      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;
    },
    { x: box.x + box.width / 2, y: box.y + box.height / 2 },
  );
  await pause(900);
}

async function present(locator, milliseconds) {
  await locator.evaluate((element) =>
    element.scrollIntoView({ behavior: "smooth", block: "center" }),
  );
  await pause(1400);
  await moveCursorTo(locator);
  await pause(milliseconds);
}

try {
  await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 30_000 });
  await page.waitForSelector("main", { timeout: 15_000 });
  await installCursor();
  await pause(6000);

  const flagshipButton = page.getByRole("button", {
    name: /Load flagship public-source demo/i,
  });
  await moveCursorTo(flagshipButton);
  await pause(2500);
  await flagshipButton.click();

  const mapHeader = page.locator("#evidence-map .map-header");
  await mapHeader.waitFor({ state: "visible", timeout: 20_000 });
  await present(mapHeader, 6000);

  const claimTwo = page.locator("#result-claim-2");
  await present(claimTwo.locator("header"), 5000);
  await present(claimTwo.locator(".falsification-box"), 6500);
  await present(claimTwo.locator(".result-evidence-grid"), 10_000);
  await present(claimTwo.locator(".finding-panel"), 6500);

  const challengeButton = claimTwo.locator(".challenge-button");
  await moveCursorTo(challengeButton);
  await pause(2200);
  await challengeButton.click();

  const challengeResult = claimTwo.locator(".challenge-result");
  await challengeResult.waitFor({ state: "visible", timeout: 20_000 });
  await present(challengeResult.locator(":scope > div").first(), 7500);
  await present(challengeResult.locator(".finding-comparison"), 8000);
  await present(challengeResult.locator(".recheck-sources"), 10_000);
  await pause(4000);

  const video = page.video();
  await context.close();
  if (!video) throw new Error("Playwright did not create a video artifact.");
  await video.saveAs(outputPath);
  console.log(`Saved demo video to ${outputPath}`);
} finally {
  await browser.close();
}
