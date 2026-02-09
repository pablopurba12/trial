const data = [
  { area: "Jakarta", brand: "Kobe", month: "Jan", sales: 12000000 },
  { area: "Jakarta", brand: "BonCabe", month: "Jan", sales: 9000000 },
  { area: "Medan", brand: "Kobe", month: "Jan", sales: 7000000 },
  { area: "Medan", brand: "BonCabe", month: "Feb", sales: 8000000 },
  { area: "Surabaya", brand: "Kobe", month: "Feb", sales: 11000000 },
  { area: "Surabaya", brand: "BonCabe", month: "Mar", sales: 9500000 },
];

let chart;

// Init filter
function initFilter(id, values) {
  const el = document.getElementById(id);

  el.innerHTML = `<option value="All">All</option>`;

  values.forEach(v => {
    el.innerHTML += `<option value="${v}">${v}</option>`;
  });
}

// Load dashboard
function loadDashboard() {

  const area = areaFilter.value;
  const brand = brandFilter.value;
  const month = monthFilter.value;

  let filtered = data.filter(d =>
    (area === "All" || d.area === area) &&
    (brand === "All" || d.brand === brand) &&
    (month === "All" || d.month === month)
  );

  // KPI
  const total = filtered.reduce((a,b)=>a+b.sales,0);
  const avg = total / (filtered.length || 1);
  const active = new Set(filtered.map(d=>d.area)).size;

  totalSales.innerText = total.toLocaleString();
  avgSales.innerText = avg.toLocaleString();
  activeArea.innerText = active;

  // Chart
  const grouped = {};

  filtered.forEach(d=>{
    grouped[d.month] = (grouped[d.month] || 0) + d.sales;
  });

  const labels = Object.keys(grouped);
  const values = Object.values(grouped);

  if(chart) chart.destroy();

  chart = new Chart(salesChart, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Sales",
        data: values,
        backgroundColor: "#2563eb"
      }]
    }
  });
}

// Init
const areaFilter = document.getElementById("areaFilter");
const brandFilter = document.getElementById("brandFilter");
const monthFilter = document.getElementById("monthFilter");

const areas = [...new Set(data.map(d=>d.area))];
const brands = [...new Set(data.map(d=>d.brand))];
const months = [...new Set(data.map(d=>d.month))];

initFilter("areaFilter", areas);
initFilter("brandFilter", brands);
initFilter("monthFilter", months);

areaFilter.onchange = loadDashboard;
brandFilter.onchange = loadDashboard;
monthFilter.onchange = loadDashboard;

loadDashboard();
