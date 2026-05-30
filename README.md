# JobCrafter AI — Workspace & STAR Interview Copilot

JobCrafter AI is a premium, full-suite professional campaign workspace designed to help candidates prepare for senior roles and technical interviews. It allows you to analyze target job descriptions, generate highly tailored cover letters, draft capability task presentation slides or operational spreadsheets, and practice answering behavioral and technical questions in an interactive STAR interview simulator.

The application supports **Gemini 3.5 Flash** by default, and can also run through **OpenRouter** (default model: `owl-alpha`) for API compatibility in custom hosting environments.

---

## Key Capabilities & Features

### 1. Document & Campaign Generator
*   **Targeted Job Extraction**: Uses Gemini to analyze complex job postings (or URLs) and extract key requirements, company context, and employer details.
*   **Tailored Cover Letter Suite**: Pairs the candidate's professional profile against job post criteria to generate clean, formatted, and optimized cover letters with centered header structures.
*   **Iterative Paragraph Refinement**: Highlight any text snippet or paragraph in the letter to prompt custom, targeted AI rewrites or case-study swaps.
*   **"Remove AI Voice" Humanizer**: Applies career coaching strategies to strip away generic corporate fillers or "smooth" transitions, making the letter sound like an authentic experienced professional.
*   **Associated Submission Email**: Automatically drafts short, highly direct submission emails corresponding to the tailored letters.

### 2. Capability Task workspace
*   **Slide Deck Outline Drafter**: Converts complex task instructions into an executive briefing deck. Follows MIT Sloan presenting standards (distinct non-repetitive slides, crisp under-ten-word outlines, and thorough point-form presenter notes). Supports high-quality visual backdrop prompts optimized for Slides AI tools.
*   **Work Sheet Matrix Generator**: Generates complete spreadsheet grids and tables (e.g., budget shift calculations, NTv2 coordinate transformation sheets, operational compliance) populated with realistic technical data points and professional summary metrics.
*   **Responsible AI Use Disclosures**: Programmatically appends compliant AI Use statements to every generated slide-deck, report, or spreadsheet to maintain alignment with transparency directives.

### 3. STAR Interview prep & Mock Live Arena
*   **Pre-generated Scenario Checklists**: Automatically builds targeted mock interview questions (Behavioral and Technical) based on the candidate's profile, custom panel questions, and the generated portfolio assets.
*   **Voice-Enabled Practice Arena**: Record your answer in real time using your microphone, or type your response directly into the workspace.
*   **Dynamic Response Evaluation**: Analyzes your transcribed practice response and returns a structured scorecard, custom numerical rating (1-10), constructive critique, and a polished revised answer combining your notes with strategic STAR frameworks.
*   **Simulated Hiring Panel**: Outlines three realistic professional panelists tailored to the target organization. Outlines their background, strategic communication tactics, and candidate-led questions to ask.
*   **Elevator Pitch Blueprint**: Outlines the five essential landmarks for a compelling introductory speech (Passion, Community, Experience, Current, Value).

---

## Getting Started

Follow these steps to clone the code, configure your credentials, and run the developer server locally.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or higher is recommended)
*   An active internet connection to communicate with the configured AI API provider (Gemini or OpenRouter).

### Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone <your-repository-url>
    cd job-crafter
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    To run the app locally, configure one provider:
    
    *   Duplicate the `.env.example` template:
        ```bash
        cp .env.example .env
        ```
    *   **Gemini (default)**:
        ```env
        GEMINI_API_KEY="your_actual_gemini_api_key_here"
        ```
    *   **OpenRouter (`owl-alpha`)**:
        ```env
        OPENROUTER_API_KEY="your_openrouter_api_key"
        OPENROUTER_MODEL="owl-alpha"
        # optional
        OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"
        ```

4.  **Launch the Local Server**
    ```bash
    npm run dev
    ```
    By default, the app starts on **`http://localhost:3000`**.  
    To avoid host port conflicts, you can set a custom port:
    ```bash
    PORT=3001 npm run dev
    ```
    You can also set `PORT=3001` in your `.env` file before running `npm run dev`.

---

## Importing Back Into Google AI Studio

If you want to continue editing, deploying, or sharing this application within the **Google AI Studio** environment:

1.  **Create a ZIP Archive or Connect to GitHub**
    *   Compress the project directory into a standard `.zip` archive (be sure to exclude `node_modules/` and `dist/`), or push the updated codebase to a public/private GitHub repository.
2.  **Upload to AI Studio Build**
    *   Go to [AI Studio Build](https://ai.studio/build).
    *   Use the **Import Code** or **Sync GitHub Repo** action to load your file directory.
3.  **Platform Environment Variables**
    *   AI Studio automatically provisions the secure hosting container.
    *   You do not need to hardcode API keys into any files. Configure `GEMINI_API_KEY` (or `OPENROUTER_API_KEY`/`OPENROUTER_MODEL`) in the platform secrets panel.

---

## Technical Architecture Notes

*   **UI Core**: Built with **React 19** and **TypeScript** configured over **Vite**.
*   **Styling**: Styled using utility-first classes from **Tailwind CSS**.
*   **Animations**: Liquid fluid layouts and transitions powered by the **Motion** library (`motion/react`).
*   **API Client**: Uses `@google/genai` for Gemini and supports OpenRouter-compatible chat completions when OpenRouter environment variables are set.
*   **Build Scripts**:
    *   `npm run build`: Bundles compiling client-side static assets inside the `dist/` folder.
    *   `npm run dev`: Launches the developer preview framework locally on port `3000` by default (or `PORT` if provided).
