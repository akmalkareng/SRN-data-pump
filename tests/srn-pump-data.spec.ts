
import { test } from '@playwright/test';

test('EDS Login and Navigate to Stamping', async ({ page }) => {
test.setTimeout(10 * 60 * 1000);

  // LOGIN CREDENTIALS
  const identificationNumber = '900427085984';
  const password = 'Passw0rd';

  // 1. Open MyTax
  await page.goto('https://mytax-dev.hasil.gov.my/web/');
  await page.waitForTimeout(3000);

  // 2. Reload
  await page.reload();
  await page.waitForTimeout(5000);

  // 3. Select identification type
  await page.getByRole('combobox').selectOption('1');
  await page.waitForTimeout(2000);

  // 4. Enter MyTax ID
  await page.getByRole('textbox', {
    name: 'No. Pengenalan'
  }).fill(identificationNumber);

  await page.waitForTimeout(3000);

  // 5. Click Hantar
  await page.getByRole('button', {
    name: 'Hantar'
  }).click();

  await page.waitForTimeout(4000);

  // 6. Enter password
  await page.getByRole('textbox', {
    name: 'Sila Masukkan Kata Laluan'
  }).fill(password);

  await page.waitForTimeout(3000);

  // 7. Click Log Masuk
  await page.getByRole('button', {
    name: 'Log Masuk'
  }).click();

  await page.waitForTimeout(5000);

  // Wait after login
  await page.waitForTimeout(5000);

  // Handle notification
  try {
    await page.getByRole('button', {
      name: 'Ok'
    }).waitFor({ state: 'visible', timeout: 5000 });

    await page.getByRole('button', {
      name: 'Ok'
    }).click();

    await page.waitForTimeout(2000);

  } catch {
    console.log('No notification appeared');
  }

  // Select Individu
  await page.getByText('Individu', {
    exact: true
  }).click();

  await page.waitForTimeout(3000);

  // Select Wakil Pengarah
  await page.locator('span').filter({
    hasText: 'Wakil Pengarah'
  }).click();

  await page.waitForTimeout(3000);

  // Select company
  await page.getByText('ROONEY (MALAYSIA) SDN BHD').click();

  await page.waitForTimeout(5000);

  // Open Perkhidmatan ezHasil
  await page.getByText('Perkhidmatan ezHasil').click();

  await page.waitForTimeout(3000);

  // Select Duti Setem
  await page.getByText('Duti Setem 2.0 (UAT) e-Duti').click();

  await page.waitForTimeout(3000);

  // Open e-Duti Setem in new tab
  const page1Promise = page.waitForEvent('popup');

  await page.getByRole('link', {
    name: 'e-Duti Setem'
  }).click();

  const page1 = await page1Promise;

  await page1.waitForTimeout(5000);

  // Click Stamping Permohonan Penyeteman
  await page1.getByRole('link', {
    name: 'Stamping Permohonan Penyeteman'
  }).click();

  await page1.waitForTimeout(3000);

  // Click Faham
  await page1.getByRole('button', {
    name: 'Faham'
  }).click();

  // =====================================
  // UPLOAD DOKUMEN UTAMA
  // =====================================

  console.log("EDS: Upload dokumen...");

  // Kekalkan tab kedua (e-Duti Setem)
  await page1.waitForLoadState('domcontentloaded');

  console.log("Current URL:", page1.url());
  console.log("Current Title:", await page1.title());

  // Pastikan berada di halaman upload
  await page1.locator('#fileInput_single').waitFor({
    state: 'attached',
    timeout: 30000
  });

  // Upload dokumen utama
  await page1.locator('#fileInput_single').setInputFiles(
    './test-data/testing.png'
  );

  // Tunggu upload berjaya
  await page1.getByText('Muat naik berjaya!', {
    exact: true
  }).waitFor({
    state: 'visible',
    timeout: 30000
  });

  console.log('File uploaded successfully');

  // Klik Hantar
  await page1.getByRole('button', {
    name: 'Hantar',
    exact: true
  }).click();

  // Klik Teruskan tanpa AI
  await page1.getByRole('button', {
    name: 'Teruskan tanpa AI'
  }).click();

  // Tunggu pilihan jenis surat cara
  await page1.getByRole('option', {
    name: 'DS 2: Pindah Milik Saham'
  }).waitFor({
    state: 'visible',
    timeout: 20000
  });

  // Pilih DS02
  await page1.getByRole('option', {
    name: 'DS 2: Pindah Milik Saham'
  }).click();

  await page1.waitForTimeout(5000);

  console.log("DS02 selected successfully");


  // =====================================
  // STEP 3: MAKLUMAT SURAT CARA DS02
  // =====================================

 // Isi tajuk surat cara
  await page1.locator('#DocTitleStep0').fill('TESTING 12');

  // Tunggu ruangan tarikh
  const dateField = page1.getByRole('textbox', {
    name: 'dd/MM/yyyy'
  }).first();

  await dateField.waitFor({
    state: 'visible',
    timeout: 20000
  });

  // Buka calendar Flatpickr
  for (let i = 0; i < 5; i++) {
    await dateField.click();
    await page1.waitForTimeout(1000);

    if (await page1.locator(
      '.flatpickr-calendar.open'
    ).isVisible()) break;
  }

  // Dapatkan current date
  const now = new Date();
  const dd = now.getDate();
  const mm = now.getMonth();

  const monthNames = [
    'January', 'February', 'March',
    'April', 'May', 'June',
    'July', 'August', 'September',
    'October', 'November', 'December'
  ];

  const monthName = monthNames[mm];

  // Pilih bulan semasa
  await page1.locator(
    '.flatpickr-calendar.open'
  ).getByLabel('Month').selectOption(String(mm));

  // Pilih current date
  await page1.locator(
    '.flatpickr-calendar.open'
  ).getByLabel(`${monthName} ${dd},`).click();

  // Kosongkan tarikh penerimaan
  await page1.locator('#RcvDate_display').fill('');

  // Kosongkan Old Paid Duty Date
  await page1.locator('#OldPaidDutyDate_display').fill('');

  // Pilih Malaysia
  await page1.getByRole('radio', {
    name: 'Malaysia',
    exact: true
  }).check();

  // Klik Seterusnya
  await page1.keyboard.press('Escape');
await page1.waitForTimeout(500);
await page1
  .locator("button.nextBtn:has(span:text-is('Seterusnya'))")
  .first()
  .click({ force: true });

await page1.waitForTimeout(3000);

  // =====================================
  // STEP 4: PIHAK PERTAMA
  // =====================================

  await page1.getByRole('checkbox', {
    name: 'Saya / Syarikat sebagai'
  }).check();

  await page1.locator(
    'input[name="StampingForm.FormACompanyList[0].TelNo"]'
  ).fill('0123456789');

  await page1.locator('#fld-email-com-0Step1')
    .fill('TEST@TEST.COM');

  await page1.getByRole('button', {
    name: 'Seterusnya '
  }).click();


  // =====================================
  // STEP 5: PIHAK KEDUA
  // =====================================

  await page1.getByRole('button', {
    name: ' Pilih Kegemaran'
  }).click();

  await page1.getByRole('button', {
    name: ' Pilih Kegemaran'
  }).click();

  await page1.getByRole('button', {
    name: ' Pilih Kegemaran'
  }).click();

  await page1.getByRole('button', {
    name: ' Pilih Kegemaran'
  }).click();

  await page1.getByRole('button', {
    name: ' Pilih Kegemaran'
  }).click();

  await page1.getByText('JULIZA BINTI JUMRAH').click();

  await page1.getByRole('button', {
    name: 'OK'
  }).click();

  await page1.getByRole('button', {
    name: 'Seterusnya '
  }).click();


  // =====================================
  // STEP 6: MAKLUMAT SAHAM
  // =====================================

  await page1.locator('#jenisSahamContainer > div')
    .first().click();

  await page1.getByRole('radio', {
    name: 'Saham Biasa'
  }).check();

  await page1.locator('#StampingForm_formC_2_ShrTot')
    .fill('3,000,0000');

  await page1.locator('#StampingForm_formC_2_ShrTot')
    .press('Tab');

  await page1.locator('#StampingForm_formC_2_ShrTrf')
    .fill('3,000,0000');

  await page1.locator('.d-flex.gap-4 > div')
    .first().click();

  await page1.getByRole('radio', {
    name: 'Ringgit Malaysia'
  }).check();

  await page1.getByRole('textbox', {
    name: '0.00'
  }).fill('100,000.000');

  await page1.locator('#statusSelect').selectOption('1');

  // Tarikh mula syarikat
  await page1.locator(
    '#section1 input[name="StampingForm.formC_2_CompEstStart"]'
  ).fill('2026-04-01');

  // Sebab transaksi
  await page1.locator('#transactionReason').selectOption('1');

  await page1.getByRole('button', {
    name: 'Seterusnya '
  }).click();


  // =====================================
  // STEP 7: MAKLUMAT SYARIKAT
  // =====================================

  await page1.locator('#StampingForm_formC_2_CompName')
    .fill('SPOONG SDN BHD');

  await page1.locator('#StampingForm_formC_2_CompRegOld')
    .fill('10231');

  await page1.locator('#StampingForm_formC_2_CompRegNew')
    .fill('3212212');

  await page1.locator('#compAct').selectOption('6');

  await page1.locator('#StampingForm_formC_2_CompAddr1')
    .fill('KAMPUNG TENGILING');

  await page1.locator('#StampingForm_formC_2_CompAddr2')
    .fill('SUNGAI GAJAH');

  await page1.locator('#StampingForm_formC_2_CompPostcode')
    .fill('02000');

  await page1.getByRole('button', {
    name: 'Seterusnya '
  }).click();


  // =====================================
  // STEP 8: UPLOAD LAMPIRAN
  // =====================================

  // Klik Muat Naik untuk Dokumen
  await page1.getByRole('button', {
    name: 'Muat Naik untuk Dokumen'
  }).click();

  // TERUS UPLOAD TANPA KLIK TAMBAH FAIL
  await page1.locator('#fileInput_single')
    .setInputFiles('./test-data/TestFile.pdf');

  console.log('Lampiran PDF uploaded successfully');

  // Klik Simpan
  await page1.getByRole('button', {
    name: 'Simpan',
    exact: true
  }).click();

  // Klik Seterusnya
  await page1.getByRole('button', {
    name: 'Seterusnya '
  }).click();


  // =====================================
  // STEP 9: MAKLUMAT PEMBAYARAN
  // =====================================

  await page1.getByRole('radio', {
    name: 'Diri Sendiri'
  }).check();

  await page1.getByText(
    'Duti akan dibayar oleh* Pihak'
  ).click();

  await page1.getByRole('radio', {
    name: 'Pihak Pertama',
    exact: true
  }).check();

  await page1.getByRole('checkbox', {
    name: 'Saya seperti nama dan Nombor'
  }).check();


  // =====================================
  // STEP 10: HANTAR PERMOHONAN
  // =====================================

  await page1.getByRole('button', {
    name: 'Hantar '
  }).click();

  await page1.getByRole('button', {
    name: 'Hantar',
    exact: true
  }).click();

  await page1.getByRole('button', {
    name: 'Ya, Hantar'
  }).click();


  // =====================================
  // STEP 11: CETAK SLIP PENGESAHAN
  // =====================================

  await page1.goto(
    'https://eds-uat.hasil.gov.my/stamping/slip'
  );

  await page1.getByRole('button', {
    name: 'OK'
  }).click();

  const downloadPromise = page1.waitForEvent('download');

  await page1.getByRole('button', {
    name: 'Cetak Slip Pengesahan'
  }).click();

  const download = await downloadPromise;

  await download.saveAs(
    'test-data/Slip-Pengesahan.pdf'
  );

  console.log('Slip Pengesahan berjaya dimuat turun.');

});
