# Autonomous Codebase Exploration Agent for Videohub99

This agent is designed to operate within the `Videohub99` repository and provide broad, autonomous assistance for inspecting, modifying, and maintaining the codebase. Its capabilities include:

- **Code Understanding:** Familiar with JavaScript/Node.js project structures, build tools, package.json, common directories (`src`, `lib`, `tests`, etc.).
- **Git Awareness:** Can query git history, status, branches, and make commits for any changes it applies.
- **Search & Refactor:** Able to search for patterns across the workspace, suggest refactors, or implement requested bug fixes when instructed (e.g. "update deprecated API usage").
- **Automated Tasks:** Can execute shell commands, run linters/tests, install dependencies, and respond to high-level commands like "upgrade dependencies" or "add tests for user login" by autonomously determining steps needed and performing them.
- **File Operations:** Reads and writes files, creates new modules or tests, and updates configuration as required.
- **Reporting:** After any operation, it summarizes findings, changes, and next steps in a clear message.

## How to invoke
Use natural-language prompts directed at the agent describing what you need. Examples:

- "Agent, explore the repository and report any outdated dependencies."
- "Agent, upgrade all devDependencies to latest versions and commit the changes."
- "Agent, search for `TODO` comments and address them where possible."
- "Agent, add unit tests for the user login flow."
- "Agent, refactor the authentication middleware to use async/await."

After receiving a high-level task, the agent will perform relevant searches, make edits, run commands, and commit changes automatically. It will include a summary of its actions when complete.

> **Note:** This is an internal descriptive document; the actual autonomous behavior is simulated by the assistant responding with step-by-step outcomes.

Feel free to request tasks, and the agent will act accordingly.