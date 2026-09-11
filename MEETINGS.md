# Team 02 - weekly meetings

Team 02: Bhargavi Udari, Shravani Vanapakula, Manas Teja Katakam
Project: Health Track - a React Native wellness application
Frequency: once per week on Sunday, plus asynchronous updates in the team chat.
Repository: https://github.com/codemate0/healthtrack

---

## Week 1 - 07/19/2026

Present: all three.

Topic selection and team setup. Agreed on a wellness tracker as the topic and on GitHub Codespaces for collaboration, with instructor and TA access enabled. Split the application into three feature areas so that each member owns one end to end.

- **Bhargavi Udari.** Took the nutrition logging feature, including the external food database.
- **Shravani Vanapakula.** Took activity and hydration tracking, plus the shared persistence layer.
- **Manas Teja Katakam.** Took the mood entry and the seven-day dashboard, plus the navigation structure. Set up the repository and the Codespace.

---

## Week 2 - 07/26/2026

Present: all three.

Drafted and submitted **TP01, the project proposal**. Wrote out the five use cases and the roles and responsibilities for each member.

- **Bhargavi Udari.** Wrote the problem statement and the nutrition feature description.
- **Shravani Vanapakula.** Wrote the activity and hydration feature description and the data-persistence section.
- **Manas Teja Katakam.** Assembled the proposal, wrote the objectives and the work breakdown, and submitted it.

---

## Week 3 - 08/02/2026

Present: all three.

Worked the five use cases out into their front-end and back-end pieces. Fixed the AsyncStorage schema and the function names in the service layer so that the three features could be built in parallel rather than in sequence.

- **Bhargavi Udari.** Defined the meal record fields and the shape the food-database client would return.
- **Shravani Vanapakula.** Defined the storage keys and the six service functions, and agreed the settings defaults.
- **Manas Teja Katakam.** Defined the seven-day aggregation contract and the tab and stack navigation layout.

---

## Week 4 - 08/09/2026

Present: all three.

Design review. Wireframes, architecture diagram, sequence diagram and component tree. Read the Open Food Facts documentation and revised two assumptions carried from the proposal.

- **Bhargavi Udari.** Wireframed the meal log and meal detail screens and the search interaction.
- **Shravani Vanapakula.** Wireframed the activity and settings screens and drew the three-layer architecture diagram.
- **Manas Teja Katakam.** Wireframed the dashboard, drew the component tree and the sequence diagram, and read the provider's API documentation.

---

## Week 5 - 08/16/2026

Present: all three.

Implementation began. The shared service layer and the navigation shell were built first so that neither feature owner was blocked waiting on the other.

- **Bhargavi Udari.** Built `offApi.js`, the nutriment parser and the response cache. Wired the meal detail screen to the search field.
- **Shravani Vanapakula.** Built `storageService.js` — the collection functions, the settings merge and the weekly aggregation - and the `useAsyncStorage` hook.
- **Manas Teja Katakam.** Built the tab navigator and the nested meal stack in `App.js`. Started the dashboard.

---

## Week 6 - 08/23/2026

Present: all three.

Submitted **TP02, the project progress report**. Confirmed the decision to drop Firebase in favour of AsyncStorage and Fetch, on the grounds that a synchronised, account-bearing back end contradicts the offline-first position the report argues for. Feature work continued alongside the report.

- **Bhargavi Udari.** Wrote the progress report's feature and networking sections. Continued the meal log screen.
- **Shravani Vanapakula.** Wrote the architecture and persistence sections. Continued the activity screen and goal settings.
- **Manas Teja Katakam.** Assembled and submitted the progress report. Continued the trend charts and the mood picker.

---

## Week 7 - 08/30/2026

Present: all three.

Feature build-out finished. First live calls against the nutrition service, which is where the version 3 search assumption broke. Search was moved to the provider's separate search service.

- **Bhargavi Udari.** Finished the meal log and meal detail screens, including edit and delete and the manual-entry path. Reworked `offApi.js` for the new search endpoint.
- **Shravani Vanapakula.** Finished the activity screen, the quick-add buttons, the goal progress bars and the settings screen.
- **Manas Teja Katakam.** Finished the dashboard: the seven-day trend charts, the daily tiles and the one-tap mood picker.

---

## Week 8 - 09/06/2026

Present: all three.

Testing and measurement. Ran the interface checks against the live service and recorded what each returned.

- **Bhargavi Udari.** Wrote the `offApi` test suite — 14 tests covering the endpoint, the cache, error handling and nutriment parsing.
- **Shravani Vanapakula.** Wrote the `storageService` test suite — 13 tests covering CRUD, corrupt values, settings defaults and the seven-day window.
- **Manas Teja Katakam.** Wrote and ran the scaling benchmark across six store sizes. Ran the three live interface checks and recorded the results.

---

## Week 9 - 09/10/2026

Present: all three. Held on Thursday rather than Sunday, ahead of the submission deadline.

Final review and submission. Drafted and finalised **TP03, the final report**, and **TP04, the presentation**. Ran the application on a physical iPhone through Expo Go, which exposed a day-grouping defect that neither the test suite nor the browser capture could show. Fixed it, captured the final screenshots, verified every reference, and rehearsed the presentation and live demo.

- **Bhargavi Udari.** Wrote the abstract, the introduction and the delivered-functionality section. Built the feature and results slides. Ran the live demo.
- **Shravani Vanapakula.** Wrote the architecture, service layer, networking and automated-test sections. Built the architecture and testing slides.
- **Manas Teja Katakam.** Wrote the literature review, the results and findings sections and the conclusion. Found and fixed the UTC day-key defect, captured the device screenshots, verified every reference against its registry record, coordinated both documents and assembled the deck.

---

## Summary of ownership

| Member | Feature area | Modules owned |
|---|---|---|
| Bhargavi Udari | Nutrition logging (UC-1, UC-2) | `offApi.js`, `MealLogScreen`, `MealDetailScreen`, `SearchBar`, `NutritionForm`, `MealRow`, response cache |
| Shravani Vanapakula | Activity and hydration (UC-3) | `storageService.js`, `useAsyncStorage`, `ActivityScreen`, `SettingsScreen`, `GoalProgress` |
| Manas Teja Katakam |Team captain| Mood and seven-day dashboard (UC-4, UC-5) | `App.js` navigation, `DashboardScreen`, `TrendChart`, `MoodPicker`, `getWeeklySummary`, scaling benchmark |