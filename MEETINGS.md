# Team 02 - weekly meetings


Team 02: Bhargavi Udari, Shravani Vanapakula, Manas Teja Katakam
Frequency: once per week, plus asynchronous updates in the team chat.

---

## Week 1 - 07/16/2026

Present: all three.

Topic selection and team setup. Agreed on a wellness tracker as the topic and on GitHub Codespaces for collaboration, with instructor and TA access enabled.


## Week 2 - 07/23/2026

Present: all three.

Drafted and submitted TP01, the project proposal. Split the application into three feature areas so that each member owns one.


## Week 3 — 07/30/2026

Present: all three.

Worked the five use cases out to their front-end and back-end pieces. Fixed the AsyncStorage schema and the function names in the service layer so the three features could be built in parallel rather than in sequence.


## Week 4 — [DATE]

Present: all three.

Design review. Wireframes, architecture diagram, sequence diagram and component tree. Checked the Open Food Facts documentation and revised two assumptions carried from the proposal.



## Week 5 — [DATE]

Present: all three.

Submitted TP02, the progress report. Confirmed the decision to drop Firebase in favour of AsyncStorage and Fetch, on the grounds that a synchronised, account-bearing back end contradicts the offline-first position the report argues for.



## Week 6 — [DATE]

Present: all three.

Implementation began. The shared service layer and the navigation shell were built first so that neither feature owner was blocked waiting on the other.

- **Bhargavi Udari.** Built `offApi.js`, the nutriment parser and the response cache. Wired the meal detail screen to the search field.
- **Shravani Vanapakula.** Built `storageService.js` — the collection functions, the settings merge and the weekly aggregation — and the `useAsyncStorage` hook.
- **Manas Teja Katakam.** Built the tab navigator and the nested meal stack in `App.js`. Started the dashboard.

## Week 7 — [DATE]

Present: all three.

Feature build-out. First live calls against the nutrition service, which is where the version 3 search assumption broke.

- **Bhargavi Udari.** Finished the meal log and meal detail screens, including edit and delete and the manual-entry path.
- **Shravani Vanapakula.** Finished the activity screen, the quick-add buttons, the goal progress bars and the settings screen.
- **Manas Teja Katakam.** Finished the dashboard: the seven-day trend charts, the daily tiles and the one-tap mood picker.

## Week 8 — [DATE]

Present: all three.

Testing and measurement. Ran the interface checks against the live service and recorded what each returned.

- **Bhargavi Udari.** Wrote the `offApi` test suite — 14 tests covering the endpoint, the cache, error handling and nutriment parsing.
- **Shravani Vanapakula.** Wrote the `storageService` test suite — 13 tests covering CRUD, corrupt values, settings defaults and the seven-day window.
- **Manas Teja Katakam.** Wrote and ran the scaling benchmark across six store sizes. Captured the screenshots from the running build.

## Week 9 — [DATE]

Present: all three.

Drafted TP03, the final report, and TP04, the presentation. Verified every reference against its registry record.

- **Bhargavi Udari.** Wrote the abstract, the introduction and Section 5.1. Built the feature and results slides.
- **Shravani Vanapakula.** Wrote Sections 4.1 to 4.3 and Section 5.2. Built the architecture and testing slides.
- **Manas Teja Katakam.** Wrote the literature review, Sections 4.4 to 5.6 and the conclusion. Coordinated the report. Built the cover, agenda, measurement and conclusion slides.

## Week 10 — [DATE]

Present: all three.

Final review, recording and submission.

- **Bhargavi Udari.** [Fill in.]
- **Shravani Vanapakula.** [Fill in.]
- **Manas Teja Katakam.** [Fill in.]
