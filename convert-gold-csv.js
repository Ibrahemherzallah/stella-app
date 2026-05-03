const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'monthly-processed.csv'); // change name if needed
const outputPath = path.join(__dirname, 'goldHistoryMonthlyUsd.ts');

const csv = fs.readFileSync(inputPath, 'utf8').trim();
const lines = csv.split(/\r?\n/);

if (lines.length < 2) {
  throw new Error('CSV file is empty or invalid');
}

const header = lines[0].split(',').map((h) => h.trim());
console.log('Detected columns:', header);

const dateIndex = header.findIndex((h) =>
  h.toLowerCase().includes('date')
);
const priceIndex = header.findIndex((h) =>
  h.toLowerCase().includes('price') ||
  h.toLowerCase().includes('usd')
);

if (dateIndex === -1 || priceIndex === -1) {
  throw new Error('Could not find date or price column in CSV');
}

const rows = [];

for (let i = 1; i < lines.length; i++) {
  const raw = lines[i].trim();
  if (!raw) continue;

  const cols = raw.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));

  const rawDate = cols[dateIndex];
  const rawPrice = cols[priceIndex];

  if (!rawDate || !rawPrice) continue;

  let date = rawDate;

  // if format is YYYY-MM, convert to YYYY-MM-01
  if (/^\d{4}-\d{2}$/.test(date)) {
    date = `${date}-01`;
  }

  // if format is YYYY/MM, convert to YYYY-MM-01
  if (/^\d{4}\/\d{2}$/.test(date)) {
    date = date.replace('/', '-') + '-01';
  }

  const price = Number(rawPrice.replace(/,/g, ''));
  if (!Number.isFinite(price)) continue;

  rows.push(`  { date: '${date}', priceUsdPerOunce: ${price} }`);
}

const output = `export type GoldMonthlyPoint = {
  date: string;
  priceUsdPerOunce: number;
};

export const GOLD_HISTORY_MONTHLY_USD: GoldMonthlyPoint[] = [
${rows.join(',\n')}
];
`;

fs.writeFileSync(outputPath, output, 'utf8');

console.log(`Done. Generated file: ${outputPath}`);
console.log(`Rows: ${rows.length}`);