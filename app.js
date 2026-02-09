const excelInput = document.getElementById('excelFile');
const areaFilter = document.getElementById('areaFilter');
const brandFilter = document.getElementById('brandFilter');
const monthFilter = document.getElementById('monthFilter');
const totalSalesEl = document.getElementById('totalSales');
const totalTransactionsEl = document.getElementById('totalTransactions');
const avgSalesEl = document.getElementById('avgSales');
const salesTableBody = document.getElementById('salesTableBody');

const currency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

let dataset = [
  { tanggal: '2026-01-02', area: 'Jabodetabek', brand: 'SunFresh', sales: 12500000 },
  { tanggal: '2026-01-05', area: 'Jawa Barat', brand: 'SnackPro', sales: 8900000 },
  { tanggal: '2026-02-09', area: 'Jawa Timur', brand: 'SunFresh', sales: 10100000 },
  { tanggal: '2026-02-12', area: 'Sumatera Utara', brand: 'DailyMilk', sales: 7600000 },
  { tanggal: '2026-03-03', area: 'Jabodetabek', brand: 'DailyMilk', sales: 11250000 },
  { tanggal: '2026-03-16', area: 'Bali', brand: 'SnackPro', sales: 5800000 },
];
let chart;

function normalizeRow(row) {
  const dateVal = row.Tanggal || row.tanggal || row.Date || row.date;
  const areaVal = row.Area || row.area;
  const brandVal = row.Brand || row.brand;
  const salesVal = row.Sales || row.sales;

  if (!dateVal || !areaVal || !brandVal || salesVal == null) {
    return null;
  }

  const parsedDate = new Date(dateVal);
  const tanggal = Number.isNaN(parsedDate.getTime())
    ? String(dateVal).slice(0, 10)
    : parsedDate.toISOString().slice(0, 10);

  return {
    tanggal,
    area: String(areaVal).trim(),
    brand: String(brandVal).trim(),
    sales: Number(salesVal) || 0,
  };
}

function getMonth(dateString) {
  return dateString.slice(0, 7);
}

function setOptions(select, values, defaultLabel) {
  select.innerHTML = '';
  const defaultOption = document.createElement('option');
  defaultOption.value = 'all';
  defaultOption.textContent = defaultLabel;
  select.appendChild(defaultOption);

  values.forEach((v) => {
    const option = document.createElement('option');
    option.value = v;
    option.textContent = v;
    select.appendChild(option);
  });
}

function populateFilters(rows) {
  const areas = [...new Set(rows.map((r) => r.area))].sort();
  const brands = [...new Set(rows.map((r) => r.brand))].sort();
  const months = [...new Set(rows.map((r) => getMonth(r.tanggal)))].sort();

  setOptions(areaFilter, areas, 'Semua Area');
  setOptions(brandFilter, brands, 'Semua Brand');
  setOptions(monthFilter, months, 'Semua Bulan');
}

function getFilteredData() {
  return dataset.filter((row) => {
    const byArea = areaFilter.value === 'all' || row.area === areaFilter.value;
    const byBrand = brandFilter.value === 'all' || row.brand === brandFilter.value;
    const byMonth = monthFilter.value === 'all' || getMonth(row.tanggal) === monthFilter.value;
    return byArea && byBrand && byMonth;
  });
}

function renderKPIs(rows) {
  const totalSales = rows.reduce((sum, r) => sum + r.sales, 0);
  const tx = rows.length;
  const avg = tx > 0 ? totalSales / tx : 0;

  totalSalesEl.textContent = currency.format(totalSales);
  totalTransactionsEl.textContent = tx.toLocaleString('id-ID');
  avgSalesEl.textContent = currency.format(avg);
}

function renderTable(rows) {
  salesTableBody.innerHTML = '';

  rows.forEach((r) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.tanggal}</td>
      <td>${r.area}</td>
      <td>${r.brand}</td>
      <td>${currency.format(r.sales)}</td>
    `;
    salesTableBody.appendChild(tr);
  });
}

function renderChart(rows) {
  const grouped = rows.reduce((acc, row) => {
    acc[row.brand] = (acc[row.brand] || 0) + row.sales;
    return acc;
  }, {});

  const labels = Object.keys(grouped);
  const data = Object.values(grouped);

  if (chart) {
    chart.destroy();
  }

  const ctx = document.getElementById('brandChart');
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Sales (IDR)',
          data,
          borderWidth: 1,
          backgroundColor: '#60a5fa',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          ticks: {
            callback: (value) => currency.format(value),
          },
        },
      },
    },
  });
}

function renderAll() {
  const rows = getFilteredData();
  renderKPIs(rows);
  renderTable(rows);
  renderChart(rows);
}

[areaFilter, brandFilter, monthFilter].forEach((el) => {
  el.addEventListener('change', renderAll);
});

excelInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheet = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheet];
    const rows = XLSX.utils.sheet_to_json(worksheet, { raw: false });

    const normalized = rows.map(normalizeRow).filter(Boolean);
    if (normalized.length > 0) {
      dataset = normalized;
      populateFilters(dataset);
      renderAll();
    } else {
      alert('Data tidak valid. Pastikan kolom: Tanggal, Area, Brand, Sales tersedia.');
    }
  };

  reader.readAsArrayBuffer(file);
});

populateFilters(dataset);
renderAll();
