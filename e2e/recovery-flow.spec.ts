import { expect, test } from "@playwright/test";

const mockAssignment = {
  assignment: {
    assignmentId: "e2e-assign-1",
    arabicText: "وَلَا تَسْتَوِي الْحَسَنَةُ وَلَا السَّيِّئَةُ",
    ayahNumber: 34,
    category: "Anger",
    reflectionPrompt: "What triggered you?",
    surahName: "Fussilat",
    tafsirSnippet: "Repel evil with what is better.",
    translationText: "Good and evil are not equal.",
    verseKey: "41:34",
    demo: true,
  },
  ok: true,
};

test.describe("recovery flow", () => {
  test.beforeEach(async ({ page }) => {
    if (process.env.PLAYWRIGHT_MOCK_API === "1") {
      await page.route("**/api/fbg/audio**", async (route) => {
        await route.fulfill({
          status: 502,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Audio unavailable in test.",
            ok: false,
          }),
        });
      });

      await page.route("**/api/fbg/assign", async (route) => {
        if (route.request().method() === "POST") {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(mockAssignment),
          });
          return;
        }
        if (route.request().method() === "GET") {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(mockAssignment),
          });
          return;
        }
        await route.continue();
      });
    }

    await page.goto("/");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("slip → assign → memorize → memorize hub", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.getByPlaceholder(/Name it gently/i).fill("I lost my temper at work");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText("Good and evil are not equal.")).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole("button", { name: "Listen" }).click();
    await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
    await expect(page.getByText("Good and evil are not equal.")).toBeVisible();

    await page.getByRole("button", { name: "Begin memorizing" }).click();

    await expect(page.getByText(/SRS session/i)).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: "Easy" }).click();

    await expect(page.getByText(/What slipped today/i)).toBeVisible({
      timeout: 10_000,
    });

    await expect(page.getByText(/^In review$/)).not.toBeVisible();

    await page.getByRole("link", { name: "Memorize" }).click();

    await expect(page.getByRole("heading", { name: "Memorize" })).toBeVisible();
    await expect(page.getByText("Avg progress")).toBeVisible();
    await expect(page.getByText(/% retention/).first()).toBeVisible();
  });
});
