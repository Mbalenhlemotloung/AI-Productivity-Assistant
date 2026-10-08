<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Learner data (applications, exams, tasks, checklists) lives in per-user localStorage via `useLocalStore` — the brief asks for local storage, not a database.
- All AI calls go through the authenticated `askAi` server function with one structured prompt per feature — this keeps the AI key on the server and only lets signed-in users use AI.
- Signed-in pages live under `src/routes/_authenticated/` (client-only guard that sends you back to `/`) — one place to protect every app page.
