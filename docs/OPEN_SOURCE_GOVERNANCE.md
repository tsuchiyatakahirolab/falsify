# Open-Source Governance

## License

Initial license: MIT.

## Contribution principle

Contributions are welcome if they preserve:
- inspectable evidence provenance;
- symmetric evidentiary standards;
- qualified uncertainty;
- no hard-coded political verdicts;
- no unsupported disinformation-intent inference;
- privacy and security boundaries.

## Issues

Good issue categories:
- false positive;
- false negative;
- source provenance error;
- claim decomposition error;
- citation fit error;
- missed counter-evidence;
- prompt injection/security;
- accessibility;
- performance;
- documentation.

## Model/provider architecture

The Build Week implementation should use GPT-5.6 substantially. The long-term open-source architecture may later support other providers or local models, but provider abstraction is not a Build Week priority unless it costs almost nothing.

## Data contributions

Do not accept:
- confidential manuscripts without rights;
- copyrighted corpora redistributed without permission;
- personal data without clear lawful basis;
- proprietary Tsuchiya Lab data;
- research-participant data.

Prefer:
- synthetic eval cases;
- public-domain or openly licensed examples;
- source URLs and metadata rather than copied full-text corpora.

## Public accountability

A finding should be challengeable through:
- reproducible inputs when legally shareable;
- source URLs;
- issue reports;
- transparent schema and verdict definitions.

Falsify should be open to being falsified.
