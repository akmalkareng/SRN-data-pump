import { test, expect } from '@playwright/test';

test('EDS Login and Navigate to Stamping', async ({ page }) => {
  const identificationNumber = process.env.MYTAX_ID;
  const password = process.env.MYTAX_PASSWORD;

  if (!identificationNumber || !password) {
    throw new Error(
      'Set MYTAX_ID and MYTAX_PASSWORD environment variables before running this test.'
    );
  }

  await page.goto('https://mytax-dev.hasil.gov.my/web/');
  await page.getByRole('combobox').selectOption('1');
  await page.getByRole('textbox', { name: 'No. Pengenalan' })
    .fill(identificationNumber);
  await page.getByRole('button', { name: 'Hantar' }).click();

  await page.getByRole('textbox', { name: 'Sila Masukkan Kata Laluan' })
    .fill(password);
  await page.getByRole('button', { name: 'Log Masuk' }).click();

  const okButton = page.getByRole('button', { name: 'Ok' });
  const notificationVisible = await okButton
    .waitFor({ state: 'visible', timeout: 5000 })
    .then(() => true)
    .catch((error: unknown) => {
      if (error instanceof Error && error.name === 'TimeoutError') {
        return false;
      }
      throw error;
    });

  if (notificationVisible) {
    await okButton.click();
  }

  await page.getByText('Individu', { exact: true }).click();
  await page.locator('span').filter({ hasText: 'Wakil Pengarah' }).click();
  await page.getByText('ROONEY (MALAYSIA) SDN BHD').click();
  await page.goto('https://mytax-dev.hasil.gov.my/web/dashboard-content');
  await page.getByText('Perkhidmatan ezHasil').click();
  await page.getByText('Duti Setem 2.0 (UAT) e-Duti').click();

  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'e-Duti Setem' }).click();
  const page1 = await page1Promise;

  await page1.getByRole('link', { name: 'Stamping Permohonan Penyeteman' }).click();
  await page1.getByRole('button', { name: 'Faham' }).click();
});