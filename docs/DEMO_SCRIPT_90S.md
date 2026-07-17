# Falsify — 90-second English demo

Use this version for the Build Week video. The screen recording stays entirely
inside Falsify: do not open source PDFs or external tabs.

The optional `scripts/record-demo.mjs` recorder expects Google Chrome and a
Playwright package. It uses a local `playwright` install by default, or the
package path supplied through `PLAYWRIGHT_PACKAGE`. The generated video belongs
in local submission storage rather than Git because the 1080p export is large.

| Time      | Screen                             | English narration                                                                                                                                                                      |
| --------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0:00–0:10 | Landing page                       | Falsify is an open-source adversarial evidence verification tool. It does not ask you to trust an answer. It exposes the evidence chain behind each claim.                             |
| 0:10–0:22 | Load flagship demo                 | This demonstration examines a Japanese-language strategic narrative concerning China and Japan. Falsify separates its factual premises, historical analogies, and claims about intent. |
| 0:22–0:34 | Evidence Map                       | The narrative becomes four atomic claims. There is no overall truth score and no ranking of a person, institution, or country.                                                         |
| 0:34–0:48 | Claim 2 and falsification question | For each claim, Falsify states what evidence would make it wrong or require qualification. The original Japanese text remains visible beside an English normalized claim.              |
| 0:48–1:02 | Support and challenge columns      | Supporting evidence and contradictory or qualifying evidence are searched and displayed separately. Every item retains its title, publisher, URL, and evidentiary limits.              |
| 1:02–1:14 | Inspectable finding                | Here, the increase in Japan's defense budget is supported, while the strongest historical analogy is not established by that fact alone.                                               |
| 1:14–1:27 | Challenge button and result        | Falsify's own finding is challengeable. An adversarial re-check introduces parliamentary evidence and qualifies the reasoning while preserving the original result.                    |
| 1:27–1:38 | New National Diet evidence         | The new counter-evidence is inspectable and attributed to the National Diet of Japan. If evidence is unavailable, Falsify reports the gap instead of inventing a citation.             |
| 1:38–1:45 | Final result                       | Falsify was built with Codex and is available as a public MIT-licensed repository and a judge-ready web demo.                                                                          |
| 1:34–1:49 | Codex and GPT-5.6 disclosure       | Codex drove Falsify's architecture, implementation, testing, and deployment. Its typed GPT-5.6 Responses API path performs claim decomposition, separate evidence searches, and finding synthesis. |

## Recording note

On-screen disclosure may say: `Built with Codex. Demo operated and narrated with AI assistance.`
Do not describe a non-OpenAI TTS voice as an official OpenAI voice.
