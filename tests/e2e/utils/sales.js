import { expect } from "@playwright/test";

export async function getDisabledInputValue(locator) {
  await expect(locator).toBeVisible();
  return locator.inputValue();
}

export async function selectFirstRealOption(selectLocator) {
  await expect(selectLocator).toBeVisible();

  const optionValue = await selectLocator.evaluate((select) => {
    const nextOption = Array.from(select.options).find((option) => option.value);
    return nextOption?.value ?? "";
  });

  if (!optionValue) {
    throw new Error("No selectable option was found.");
  }

  await selectLocator.selectOption(optionValue);
  return optionValue;
}

export async function getSelectedOptionLabel(selectLocator) {
  return selectLocator.evaluate(
    (select) => select.options[select.selectedIndex]?.textContent?.trim() ?? "",
  );
}
