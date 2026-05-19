# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: recovery-flow.spec.ts >> recovery flow >> save for later adds to memorize and shows home notice
- Location: e2e/recovery-flow.spec.ts:105:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Good and evil are not equal.')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for getByText('Good and evil are not equal.')

```

```yaml
- main:
  - heading "Ayah assignment" [level=1]
  - link "You":
    - /url: /settings
    - text: person
  - paragraph: "For: anger"
  - paragraph: Chapter 41 · 41:34 · Ayah 34
  - paragraph: وَلَا تَسْتَوِى ٱلْحَسَنَةُ وَلَا ٱلسَّيِّئَةُ ۚ ٱدْفَعْ بِٱلَّتِى هِىَ أَحْسَنُ فَإِذَا ٱلَّذِى بَيْنَكَ وَبَيْنَهُۥ عَدَٰوَةٌ كَأَنَّهُۥ وَلِىٌّ حَمِيمٌ
  - paragraph: And not equal are the good deed and the bad. Repel [evil] by that [deed] which is better; and thereupon, the one whom between you and him is enmity [will become] as though he was a devoted friend.
  - separator
  - paragraph: Reflect
  - paragraph: The Messenger of Allah ﷺ said, “Our Lord – Glorified and Exalted is He – descends every night to the lowest heaven when one-third of the night remains and says, ‘Who will call upon Me, that I may answer Him? Who will ask of Me, that I may give him? Who will seek My forgiveness, that I may forgive him?’” (Bukhārī).
  - paragraph: Tafsir
  - button "flip_to_front Ayah"
  - button "Listen"
  - button "Tafsir"
  - button "Begin memorizing"
  - button "Save for later"
- navigation "Main":
  - link "home Home":
    - /url: /
  - link "auto_stories Memorize":
    - /url: /memorize
  - link "group Community":
    - /url: /community
- alert
```

# Test source

```ts
  11  |     tafsirSnippet: "Repel evil with what is better.",
  12  |     translationText: "Good and evil are not equal.",
  13  |     verseKey: "41:34",
  14  |     demo: true,
  15  |   },
  16  |   ok: true,
  17  | };
  18  | 
  19  | test.describe("recovery flow", () => {
  20  |   test.beforeEach(async ({ page }) => {
  21  |     if (process.env.PLAYWRIGHT_MOCK_API === "1") {
  22  |       await page.route("**/api/fbg/tafsir**", async (route) => {
  23  |         await route.fulfill({
  24  |           status: 200,
  25  |           contentType: "application/json",
  26  |           body: JSON.stringify({
  27  |             ok: true,
  28  |             text: "Good and evil are not equal in the sight of Allah.",
  29  |           }),
  30  |         });
  31  |       });
  32  | 
  33  |       await page.route("**/api/fbg/audio**", async (route) => {
  34  |         await route.fulfill({
  35  |           status: 502,
  36  |           contentType: "application/json",
  37  |           body: JSON.stringify({
  38  |             error: "Audio unavailable in test.",
  39  |             ok: false,
  40  |           }),
  41  |         });
  42  |       });
  43  | 
  44  |       await page.route("**/api/fbg/assign", async (route) => {
  45  |         if (route.request().method() === "POST") {
  46  |           await route.fulfill({
  47  |             status: 200,
  48  |             contentType: "application/json",
  49  |             body: JSON.stringify(mockAssignment),
  50  |           });
  51  |           return;
  52  |         }
  53  |         if (route.request().method() === "GET") {
  54  |           await route.fulfill({
  55  |             status: 200,
  56  |             contentType: "application/json",
  57  |             body: JSON.stringify(mockAssignment),
  58  |           });
  59  |           return;
  60  |         }
  61  |         await route.continue();
  62  |       });
  63  |     }
  64  | 
  65  |     await page.goto("/");
  66  |     await page.evaluate(() => {
  67  |       localStorage.clear();
  68  |       sessionStorage.clear();
  69  |     });
  70  |   });
  71  | 
  72  |   test("slip → assign → memorize → memorize hub", async ({ page }) => {
  73  |     await page.setViewportSize({ width: 390, height: 844 });
  74  | 
  75  |     await page.getByPlaceholder(/Name it gently/i).fill("I lost my temper at work");
  76  |     await page.getByRole("button", { name: "Continue" }).click();
  77  | 
  78  |     await expect(page.getByText("Good and evil are not equal.")).toBeVisible({
  79  |       timeout: 15_000,
  80  |     });
  81  | 
  82  |     await page.getByRole("button", { name: "Listen" }).click();
  83  |     await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
  84  |     await expect(page.getByText("Good and evil are not equal.")).toBeVisible();
  85  | 
  86  |     await page.getByRole("button", { name: "Begin memorizing" }).click();
  87  | 
  88  |     await expect(page.getByText(/^Memorize$/).first()).toBeVisible({ timeout: 10_000 });
  89  |     await expect(page.getByText("Type to recall (translation)")).toBeVisible();
  90  |     await page.getByRole("link", { name: "Home" }).click();
  91  | 
  92  |     await expect(page.getByText(/What slipped today/i)).toBeVisible({
  93  |       timeout: 10_000,
  94  |     });
  95  | 
  96  |     await expect(page.getByText(/^In review$/)).not.toBeVisible();
  97  | 
  98  |     await page.getByRole("link", { name: "Memorize" }).click();
  99  | 
  100 |     await expect(page.getByRole("heading", { name: "Memorize" })).toBeVisible();
  101 |     await expect(page.getByText("Avg progress")).toBeVisible();
  102 |     await expect(page.getByText(/% retention/).first()).toBeVisible();
  103 |   });
  104 | 
  105 |   test("save for later adds to memorize and shows home notice", async ({ page }) => {
  106 |     await page.setViewportSize({ width: 390, height: 844 });
  107 | 
  108 |     await page.getByPlaceholder(/Name it gently/i).fill("I lost my temper at work");
  109 |     await page.getByRole("button", { name: "Continue" }).click();
  110 | 
> 111 |     await expect(page.getByText("Good and evil are not equal.")).toBeVisible({
      |                                                                  ^ Error: expect(locator).toBeVisible() failed
  112 |       timeout: 15_000,
  113 |     });
  114 | 
  115 |     await page.getByRole("button", { name: "Save for later" }).click();
  116 | 
  117 |     await expect(
  118 |       page.getByText(/Saved to Memorize — review it when you're ready/i),
  119 |     ).toBeVisible({ timeout: 10_000 });
  120 | 
  121 |     await page.getByRole("link", { name: "Memorize" }).click();
  122 |     await expect(page.getByText(/SRS review due|Anger/).first()).toBeVisible();
  123 |   });
  124 | });
  125 | 
```