# Start here

Welcome to **Modern Angular for Professionals**, a self-paced program built around this project, Karkhana.
Plan on 8–10 hours a week. You learn by reading, watching, exploring the running app, studying its code and doing one
exercise per week.

## Day 1 (about 2 hours)

1. **Read the program overview** in the training document shared by your trainer: tracks, checkpoints and how to get
   help.
2. **Set up your machine:** Node.js 22.12 or later, `npm i -g @angular/cli@22`, VS Code with the *Angular Language
   Service* extension, and Chrome with *Angular DevTools*.
3. **Get the code** and create your own branch:
   ```bash
   git clone <repository-url> karkhana && cd karkhana
   git checkout -b training/<your-name>
   npm install
   npm start          # http://localhost:4200
   npm run test:all   # everything should pass
   ```
4. **Open Learn** in the app's header (`/learn`) and choose your track:
   - **Foundations** if you are new to Angular or to frontend frameworks (6 weeks).
   - **Accelerated** if you already work in React, Vue, Flutter or similar (3–4 weeks).
5. **Post in the team channel** that you are set up, with your track.

## How you move through the program

The path is a fixed order of **stages**: Week 1 → Week 2 → … → Week 5 → Module → Week 6. Each stage is a list of steps,
always done top to bottom:

| Step type | What you do | Where it points |
| --- | --- | --- |
| Read | Official docs on one concept | angular.dev and library docs |
| Watch | A course section or video on the same concept | Udemy, Pluralsight or the Angular YouTube channel |
| Explore | See the concept working | A page in the running app (e.g. `/lab/signals`) |
| Study | Read the code behind it, with "look for" hints | Files in this repository |
| Exercise | Change the app yourself | One pull request per exercise |
| Self-check | Answer three questions without looking | Bring the hard ones to office hours |

Tick steps on the **Learn** page as you finish them (saved in your browser). The same path is available as Markdown in
[`docs/learning-path/`](docs/learning-path/README.md) if you prefer reading on GitHub/GitLab.

## Where everything is mapped

- [`docs/learning-path/`](docs/learning-path/README.md): every stage and step in order.
- [`docs/CONCEPT-MAP.md`](docs/CONCEPT-MAP.md): each concept → what to read and watch → where to see it in the app →
  which code to study → where you practise it.
- [`docs/RESOURCES.md`](docs/RESOURCES.md): the curated docs, courses and videos.
- [`EXERCISES.md`](EXERCISES.md): all exercises by stage, plus the definition of done.

All four, and the in-app Learn page, are generated from one file: `public/content/learning-path.json`.

## Your weekly rhythm

1. **Monday:** open the stage on the Learn page, do the reads and watches.
2. **Midweek:** explore and study; answer the self-check.
3. **By Friday:** open the exercise PR using the template, paste your progress (Learn page → *Copy progress for your
   PR*), and request a review from your buddy.
4. **Stuck?** 15 minutes with the docs and the README "Notes and gotchas", then your buddy, then the team channel,
   then the weekly office hour.

At the end of weeks 2, 4 and 6 you submit a **checkpoint** (listed at the bottom of those stages).
