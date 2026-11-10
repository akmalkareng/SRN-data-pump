import { test, expect } from '@playwright/test';

test('EDS Complete Stamping Application Flow', async ({ page }) => {
  // Set extended test timeout for multi-step portal flows
  test.setTimeout(10 * 60 * 1000);

  // 1. Login to MyTax Portal
  await page.goto('https://mytax-dev.hasil.gov.my/web/');
  await page.getByRole('combobox').selectOption('1');
  await page.getByRole('textbox', { name: 'No. Pengenalan' }).fill('900427085984');
  await page.getByRole('button', { name: 'Hantar' }).click();

  await page.getByRole('textbox', { name: 'Sila Masukkan Kata Laluan' }).fill('Passw0rd');
  await page.getByRole('button', { name: 'Log Masuk' }).click();

  // Dismiss popup notification if present
  const okBtn = page.getByRole('button', { name: 'Ok' });
  if (await okBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await okBtn.click();
  }

  // 2. Select Role & Company Profile
  await page.getByText('Individu', { exact: true }).click();
  await page.getByText('Wakil Pengarah').click();
  await page.getByText('ROONEY (MALAYSIA) SDN BHD').click();

  // 3. Open e-Duti Setem Portal in Popup Tab
  await page.getByText('Perkhidmatan ezHasil').click();
  await page.getByText('Duti Setem 2.0 (UAT) e-Duti').click();

  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'e-Duti Setem' }).click();
  const page1 = await page1Promise;

  await page1.waitForLoadState('domcontentloaded');

  // Navigate to Penyeteman Application
  await page1.getByRole('link', { name: 'Stamping Permohonan Penyeteman' }).click();
  await page1.getByRole('button', { name: 'Faham' }).click();

  // File Upload Step
  const fileInput = page1.locator('#fileInput_single');
  if (await fileInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await fileInput.setInputFiles('./test-data/testing.png');
    await expect(page1.getByText('Muat naik berjaya!', { exact: true })).toBeVisible({ timeout: 30000 });
  }

  await page1.getByRole('button', { name: 'Hantar', exact: true }).click();
  await page1.getByRole('button', { name: 'Teruskan tanpa AI' }).click();
  await page1.getByRole('option', { name: 'DS 2: Pindah Milik Saham' }).click();

  // STEP 3: MAKLUMAT SURAT CARA DS02 (Set dates properly for form validation)
  await page1.locator('#DocTitleStep0').fill('TESTING');
  
  // Date selection & underlying model input
  const dateField = page1.getByRole('textbox', { name: 'dd/mm/yyyy' }).first();
  await dateField.click();
  
  // Click date on calendar grid or set inputs directly
  const todayCell = page1.getByLabel(/November 10,/i).first();
  if (await todayCell.isVisible({ timeout: 3000 }).catch(() => false)) {
    await todayCell.click();
  }

  // Ensure hidden input state is updated
  await page1.locator('input[name="StampingForm.stampingData.DocDate"]').fill('2026-11-10');
  await dateField.fill('10/11/2026');

  await page1.getByRole('radio', { name: 'Malaysia', exact: true }).check();

  // Click Seterusnya (Using Regex to handle icon font character safely)
  await page1.getByRole('button', { name: /Seterusnya/i }).first().click();

  // STEP 4: MAKLUMAT PEMOHON / PIHAK-PIHAK
  await page1.getByRole('radio', { name: 'Individu' }).check();
  await page1.getByRole('checkbox', { name: 'Saya / Syarikat sebagai' }).check();
  
  const phoneInput = page1.locator('input[name="StampingForm.FormACompanyList[0].TelNo"]');
  await phoneInput.click();
  await phoneInput.fill('01111111');

  const emailInput = page1.locator('#fld-email-com-0Step1');
  await emailInput.fill('test@test.com');

  await page1.getByRole('button', { name: /Seterusnya/i }).first().click();

  // Favorite / Pick Contact
  const favoriteBtn = page1.getByRole('button', { name: /Pilih Kegemaran/i });
  if (await favoriteBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await favoriteBtn.click();
    await page1.getByText('JULIZA BINTI JUMRAH').click();
    await page1.getByRole('button', { name: 'OK' }).click();
  }

  await page1.getByRole('button', { namex: /Seterusnya/i }).first().click();

  // STEP 5: MAKLUMAT SYARIKAT & TRANSAKSI
  await page1.getByRole('radio', { name: 'Saham Biasa' }).check();
  await page1.locator('#StampingForm_formC_2_ShrTot').fill('30000000');
  await page1.locator('#StampingForm_formC_2_ShrTrf').fill('30000000');
  
  await page1.getByRole('radio', { name: 'Ringgit Malaysia' }).check();
  await page1.getByRole('textbox', { name: '0.00' }).fill('150000.000');
  await page1.locator('#statusSelect').selectOption('1');

  // Date selection for company establishment
  await page1.locator('#section1 input[name="StampingForm.formC_2.CompEstStart"]').fill('2026-01-01');
  await page1.locator('#transactionReason').selectOption('1');

  await page1.getByRole('button', { name: /Seterusnya/i }).first().click();

  // Company Details
  await page1.locator('#StampingForm_formC_2_CompName').fill('SPPON SHD BHD');
  await page1.locator('#StampingForm_formC_2_CompRegOld').fill('123654');
  await page1.locator('#StampingForm_formC_2_CompRegNew').fill('7852369');
  await page1.locator('#compAct').selectOption('13');
  await page1.locator('#StampingForm_formC_2_CompAddr1').fill('23 JALAN SEMENGGAH');
  await page1.locator('#StampingForm_formC_2_CompAddr2').fill('KAMPUNG TUAI');
  await page1.locator('#StampingForm_formC_2_CompPostcode').fill('02000');

  await page1.getByRole('button', { name: /Seterusnya/i }).first().click();
  await page1.getByRole('button', { name: /Seterusnya/i }).first().click();

  // Document Save & Submit
  await page1.getByRole('button', { name: 'Simpan', exact: true }).click();
  await page1.getByRole('button', { name: /Seterusnya/i }).first().click();

  // Declaration Step
  await page1.getByRole('radio', { name: 'Diri Sendiri' }).check();
  await page1.getByRole('radio', { name: 'Pihak Pertama', exact: true }).check();
  await page1.getByRole('checkbox', { name: 'Saya seperti nama dan Nombor' }).check();

  // Submit Application
  await page1.getByRole('button', { name: /Hantar/i }).first().click();
  await page1.getByRole('button', { name: 'Hantar', exact: true }).click();
  await page1.getByRole('button', { name: 'Ya, Hantar' }).click();

  // Slip Confirmation & Download
  await page1.goto('https://eds-uat.hasil.gov.my/stamping/slip');
  await page1.getByRole('button', { name: 'OK' }).click();

  const downloadPromise = page1.waitForEvent('download');
  await page1.getByRole('button', { name: 'Cetak Slip Pengesahan' }).click();
  const download = await downloadPromise;

  console.log('Confirmation Slip downloaded successfully:', await download.suggestedFilename());
});