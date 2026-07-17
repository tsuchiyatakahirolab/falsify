# Falsify — public demo narration

Use this version for the Build Week video. The screen recording stays entirely
inside Falsify: do not open source PDFs or external tabs.

The optional `scripts/record-demo.mjs` recorder expects Google Chrome and a
Playwright package. It uses a local `playwright` install by default, or the
package path supplied through `PLAYWRIGHT_PACKAGE`. The generated video belongs
in local submission storage rather than Git because the 1080p export is large.

| Time      | Screen                             | English narration                                                                                                                                                                                                                          |
| --------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0:00–0:10 | Landing page                       | Falsify turns complex narratives into inspectable evidence maps. It shows what supports each claim, what challenges it, and what remains uncertain.                                                                                       |
| 0:10–0:23 | Load flagship demo                 | This demo starts with a Japanese-language strategic narrative about China and Japan. Falsify separates its factual claims, historical comparisons, and assumptions about intent.                                                          |
| 0:23–0:33 | Evidence Map                       | The passage becomes four testable claims. Each claim gets its own evidence map, so conclusions stay connected to the specific sources and reasoning behind them.                                                                           |
| 0:33–0:44 | Claim 2 and falsification question | Every claim begins with a falsification question: what evidence would make it wrong or require qualification? The original Japanese remains beside an English working translation.                                                        |
| 0:44–0:56 | Support and challenge columns      | Supporting and challenging evidence stay in separate columns. Every item keeps its title, publisher, link, and limitations, making the evidence chain easy to inspect.                                                                    |
| 0:56–1:08 | Inspectable finding                | Here, official evidence supports an increase in Japan's defense budget. That fact alone, however, does not establish the larger historical analogy or political intent.                                                                    |
| 1:08–1:19 | Challenge button and result        | Falsify can challenge its own finding. A second pass adds parliamentary evidence, qualifies the conclusion, and preserves both the original and revised results.                                                                          |
| 1:19–1:30 | New National Diet evidence         | When reliable evidence is missing, the gap remains visible. This demonstration uses curated public sources, with every important conclusion open to further challenge.                                                                    |
| 1:30–1:46 | Codex and GPT-5.6                  | Codex drove the architecture, implementation, testing, and deployment. I implemented a typed GPT-5.6 Responses API path for claim decomposition, separate evidence searches, and synthesis. The code and live demo are public.              |

## Publication note

The narration explains the product directly rather than defending it against an
imagined objection. Political neutrality is demonstrated by the product's
inspectable support/challenge structure and symmetric evidence method, not by a
spoken disclaimer.

The YouTube description and repository disclose the runtime boundary: the
public deployment demonstrates curated public sources, the GPT-5.6 path is
implemented for server-side use, and no production OpenAI key is configured.

On-screen disclosure may say: `Built with Codex. Demo operated and narrated with AI assistance.`
Do not describe a non-OpenAI TTS voice as an official OpenAI voice.
