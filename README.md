# Health Track

A cross-platform wellness app that keeps nutrition, hydration, activity and mood logging in one place. Built with React Native and Expo for CS624, Team 02, City University of Seattle.

Everything stays on the device. There is no account, no sign-in and no server. The app works with no connection except for the one feature that reads the nutrition database.

## Key features

**Meal and nutrition logging.** Search a live food database, pick a result, and the nutrition form fills itself. Every field stays editable afterwards. Typing a meal in by hand is a full path rather than a fallback, because database coverage is uneven. Meals support create, read, update and delete.

**Activity and hydration.** Quick-add buttons log water and workouts in two taps. Progress bars read the daily goals set in Settings.

**Dashboard and mood.** A five-point mood entry takes one tap, with no confirmation and no required note. The dashboard shows seven-day trends for calories, water and active minutes, drawn from ordinary React Native views rather than a charting library.

## How it works

Three layers, and one rule that holds them apart: **no screen calls storage or the network directly.**

```
screens + components        DashboardScreen, MealLogScreen, MealDetailScreen,
                            ActivityScreen, SettingsScreen
        |
service layer               storageService.js   all persistence
                            offApi.js           all network access
                            useAsyncStorage     shared load/save/error cycle
        |
data                        AsyncStorage on the device
                            Open Food Facts over Fetch
```

Storage logic exists in one file instead of five. The service functions can be tested without rendering anything, which is what made the test suite possible. And a synchronising back end could later sit behind the same function signatures without the interface changing.

### Storage

Five keys, each holding a JSON array. Every record carries a generated id and an ISO-8601 timestamp, which is what makes the seven-day window a string comparison rather than a date parse per record.

| Key | Fields |
| --- | --- |
| `@healthtrack:meals` | id, name, barcode, servingSize, calories, protein, carbs, fat, source, timestamp |
| `@healthtrack:activity` | id, type, label, durationMinutes, volumeMl, timestamp |
| `@healthtrack:mood` | id, score, note, timestamp |
| `@healthtrack:settings` | dailyCalorieGoal, dailyWaterGoalMl, dailyActivityGoalMinutes |
| `@healthtrack:cache` | query, payload, fetchedAt |

### Networking

Product lookups use the Open Food Facts v3 API. Full-text search is not part of v3, so search goes to the provider's separate Search-a-licious service. The provider allows 15 product reads and 10 searches a minute per address, so search is debounced at 600 ms and every response is cached for 24 hours. A repeated query costs no request at all.

## Running it

```
npm install
```

```
npx expo start
```

Then open the project in Expo Go on a phone, or press `a` for Android and `i` for iOS.

Tests:

```
npm test
```

## Project layout

```
App.js                        tab navigator + nested meal stack
src/services/storageService.js
src/services/offApi.js
src/hooks/useAsyncStorage.js
src/screens/                  five screens
src/components/               TrendChart, MoodPicker, GoalProgress,
                              MealRow, SearchBar, NutritionForm
__tests__/                    27 service tests + one scaling benchmark
docs/screenshots/             captured from the running build
```

## What we learned

**A service boundary drawn for testability pays for itself immediately.** Because no screen touches storage, 27 tests could be written against pure functions in an afternoon, and those tests found real defects in cache expiry and nutrient parsing before either reached a screen.

**Documentation is a hypothesis.** Three assumptions about the nutrition API were carried for weeks on the strength of having read them. Two were wrong. Version 3 has no full-text search. And browsers refuse to let script set the User-Agent header the provider asks clients to send, which combined with the search service sending no CORS header means search works on device and fails in the web build. Checking all three took under an hour.

**Measure before you optimise.** A caching layer for the dashboard aggregation had been discussed. Measuring it first showed the naive version runs in 15.5 ms at 23,334 records, which is well inside a single frame, so the caching layer was never written.

**Data you do not control will surprise you.** The first live search run, for "oatmeal", returned as its top result a product named "cookies" with the brand recorded as "oatmeal" and an energy value of zero. That single observation settled the design question: manual entry stays a first-class path, and every field remains editable after a database result is applied.

## Known limitations

- No usability evaluation has been run with participants. The instruments were fixed in advance (a heuristic walkthrough and the System Usability Scale) and remain the first thing to do.
- Test coverage stops at the service boundary. There are no rendering, navigation or end-to-end tests.
- Search is unavailable in the web build for the CORS reason above. Device builds are unaffected.
- Activity and mood records support create, read and delete but not update.
- Reminders are absent, because the messaging back end from the original proposal was dropped.
- Nutrition data comes from a community-maintained source whose per-record accuracy varies and which the provider does not warrant.

## Data source

Nutrition data from [Open Food Facts](https://world.openfoodfacts.org/), used read-only under the Open Database License.

## Team

| Member | Owns |
| --- | --- |
| Bhargavi Udari | Meal and nutrition logging — `offApi.js`, meal screens, response cache |
| Shravani Vanapakula | Activity and hydration, plus the shared `storageService.js` and `useAsyncStorage` |
| Manas Teja Katakam | Dashboard and mood — seven-day aggregation, trend charts, navigation structure |
