let data = [];
let chart;

// Dummy data kalau belum upload
data = [
  {area:"Jakarta",brand:"Kobe",month:"Jan",sales:12000000},
  {area:"Medan",brand:"Kobe",month:"Jan",sales:8000000},
  {area:"Surabaya",brand:"BonCabe",month:"Feb",sales:9000000},
  {area:"Bandung",brand:"Kobe",month:"Mar",sales:11000000},
];

const areaFilter = document.getElementById("areaFilter");
const brandFilter = document.getElementById("brandFilter");
const monthFilter = document.getElementById("monthFilter");

function initFilter(el, values){
  el.innerHTML = `<option value="All">All</option>`;
  values.forEach(v=>{
    el.innerHTML+=`<option>${v}</option>`;
  });
}

function refresh(){

  const a = areaFilter.value;
  const b = brandFilter.value;
  const m = monthFilter.value;

  let f = data.filter(d=>
    (a==="All"||d.area===a)&&
    (b==="All"||d.brand===b)&&
    (m==="All"||d.month===m)
  );

  const total = f.reduce((x,y)=>x+y.sales,0);
  const avg = total/(f.length||1);

  totalSales.innerText = "Rp "+total.toLocaleString();
  trx.innerText = f.length;
  avg.innerText = "Rp "+avg.toLocaleString();

  const grp = {};

  f.forEach(d=>{
    grp[d.month]=(grp[d.month]||0)+d.sales;
  });

  const labels = Object.keys(grp);
  const values = Object.values(grp);

  if(chart) chart.destroy();

  chart = new Chart(chartEl,{
    type:"bar",
    data:{
      labels,
      datasets:[{
        data:values,
        backgroundColor:"#2563eb"
      }]
    }
  });
}

const chartEl = document.getElementById("chart");

function init(){

  initFilter(areaFilter,[...new Set(data.map(d=>d.area))]);
  initFilter(brandFilter,[...new Set(data.map(d=>d.brand))]);
  initFilter(monthFilter,[...new Set(data.map(d=>d.month))]);

  areaFilter.onchange=refresh;
  brandFilter.onchange=refresh;
  monthFilter.onchange=refresh;

  refresh();
}

init();
