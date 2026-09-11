/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   TAB SWITCHING
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function switchTab(tabId, el) {
  document.querySelectorAll('.tab[data-tab]').forEach(function(t) {
    t.classList.remove('active');
  });
  document.querySelectorAll('.tab-panel').forEach(function(p) {
    p.classList.remove('active');
  });
  el.classList.add('active');
  var panel = document.getElementById('panel-' + tabId);
  if (panel) panel.classList.add('active');
  if (tabId === 'tco-analysis' && typeof buildTCOAnalysis === 'function') buildTCOAnalysis();
  if (tabId === 'tco-analysis' && typeof buildTCOFteCard === 'function') buildTCOFteCard();
  if (tabId === 'tco-analysis' && typeof buildTCOOperationalMetrics === 'function') buildTCOOperationalMetrics();
  if (tabId === 'exec-brief' && typeof buildExecutiveBrief === 'function') buildExecutiveBrief();
}

/* LIVE SIZING CONDITIONAL VISIBILITY
   Hides each live-sizing section (and shows a placeholder message
   instead) until its tower has qualifying input. */
var LIVE_SIZING_PLACEHOLDER_TEXT = {
  'ms-sizing-section': 'Distributed Services infrastructure not configured. Add Physical Servers or Virtual Servers in the Distributed Services tower to enable live sizing.',
  'infra-sizing-section': 'Distributed Services infrastructure not configured. Add Physical Servers or Virtual Servers in the Distributed Services tower to enable live sizing.',
  'midrange-ms-sizing-section': 'Midrange infrastructure not configured. Add Physical Servers or Virtual Servers in the Midrange tower to enable live sizing.',
  'midrange-infra-sizing-section': 'Midrange infrastructure not configured. Add Physical Servers or Virtual Servers in the Midrange tower to enable live sizing.',
  'storage-ms-sizing-section': 'Storage and Backup Managed Services not configured. Add Storage or Backup infrastructure to enable live sizing.',
  'storage-infra-sizing-section': 'Storage infrastructure not configured. Add Storage volume in the Storage tower to enable live sizing.',
  'mf-ms-section': 'Mainframe infrastructure not configured. Add MIPS, DASD, or VTL volume in the Mainframe tower to enable live sizing.',
  'mf-infra-sizing-section': 'Mainframe infrastructure not configured. Add MIPS, DASD, or VTL volume in the Mainframe tower to enable live sizing.',
  'datacenter-infra-sizing-section': 'Datacenter infrastructure not configured. Add Distributed, Midrange, Storage, Backup, or Mainframe infrastructure to enable Datacenter live sizing.',
  'network-infra-sizing-section': 'Network services depend on configured infrastructure (Servers + Storage). Configure Distributed, Midrange, Storage, or Backup infrastructure to enable Network live sizing.',
  'network-ms-sizing-section': 'Network services depend on configured infrastructure (Servers + Storage). Configure Distributed, Midrange, Storage, or Backup infrastructure to enable Network live sizing.',
  'security-ms-sizing-section': 'Security services depend on Network services. Configure infrastructure to enable Security live sizing.',
  'overlays-cfs-sizing-section': 'No Managed Services configured. Cross Functional services depend on configured Managed Services.'
};

// Shows/hides a live-sizing section and its placeholder message in tandem.
function setLiveSizingSectionVisible(sectionId, visible) {
  var section = document.getElementById(sectionId);
  if (!section) return;
  var placeholder = document.getElementById(sectionId + '-placeholder');
  if (!placeholder) {
    placeholder = document.createElement('div');
    placeholder.id = sectionId + '-placeholder';
    placeholder.className = 'live-sizing-placeholder';
    placeholder.textContent = LIVE_SIZING_PLACEHOLDER_TEXT[sectionId] || 'Configure infrastructure inputs above to enable live sizing.';
    section.parentNode.insertBefore(placeholder, section);
  }
  // Use explicit 'block' (not '') — some downstream checks (e.g. Security's networkVisible) compare style.display against 'none' literally.
  section.style.display = visible ? 'block' : 'none';
  placeholder.style.display = visible ? 'none' : '';
}

function readNumericDisplay(id) {
  var el = document.getElementById(id);
  if (!el) return 0;
  var raw = (typeof el.value === 'string' && el.value.trim() !== '') ? el.value : (el.textContent || '');
  var cleaned = String(raw).replace(/[,\s]/g, '').replace(/[^0-9.\-]/g, '');
  var n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

// Re-evaluates whether each tower's live-sizing sections should be shown, based on its own inputs.
function updateLiveSizingVisibility() {
  var distributedHasInput = (readNumericDisplay('compute-prod-servers') + readNumericDisplay('compute-nonprod-servers')) > 0 || readNumericDisplay('compute-total-servers') > 0;
  var midrangeOsTotal = 0;
  document.querySelectorAll('#midrange-os-tbody input[type="number"], #midrange-vcpu-tbody input[type="number"]').forEach(function(inp) {
    var v = parseFloat(inp.value);
    if (!isNaN(v) && v > 0) midrangeOsTotal += v;
  });
  var midrangeHasInput = (readNumericDisplay('midrange-prod-servers') + readNumericDisplay('midrange-nonprod-servers')) > 0 || readNumericDisplay('midrange-total-servers') > 0 || midrangeOsTotal > 0;
  var storageHasInput = readNumericDisplay('storage-total-tb') > 0;
  var mainframeHasInput = (readNumericDisplay('mf-mips') + readNumericDisplay('mf-dasd') + readNumericDisplay('mf-vtl')) > 0;
  var datacenterHasInput = distributedHasInput || midrangeHasInput || storageHasInput || mainframeHasInput;

  setLiveSizingSectionVisible('ms-sizing-section', distributedHasInput);
  setLiveSizingSectionVisible('infra-sizing-section', distributedHasInput);
  setLiveSizingSectionVisible('midrange-ms-sizing-section', midrangeHasInput);
  setLiveSizingSectionVisible('midrange-infra-sizing-section', midrangeHasInput);
  setLiveSizingSectionVisible('storage-ms-sizing-section', storageHasInput);
  setLiveSizingSectionVisible('storage-infra-sizing-section', storageHasInput);
  setLiveSizingSectionVisible('mf-ms-section', mainframeHasInput);
  setLiveSizingSectionVisible('mf-infra-sizing-section', mainframeHasInput);
  setLiveSizingSectionVisible('datacenter-infra-sizing-section', datacenterHasInput);
}

/* PROBENCH MARK - INDUSTRY WISE IT SPEND */
var PROBENCH_MARK_DATA = [
  { industry: 'Aerospace & Defense',              oneToTen: '2.5%', tenPlus: '4.1%' },
  { industry: 'Banking',                          oneToTen: '5.0%', tenPlus: null },
  { industry: 'Business Services and supplies',   oneToTen: '3.9%', tenPlus: '4.8%' },
  { industry: 'Capital Goods',                    oneToTen: '2.0%', tenPlus: '3.0%' },
  { industry: 'Chemicals',                        oneToTen: '2.5%', tenPlus: '2.6%' },
  { industry: 'Conglomerates',                    oneToTen: '1.3%', tenPlus: '2.1%' },
  { industry: 'Construction',                     oneToTen: '1.5%', tenPlus: '1.3%' },
  { industry: 'Consumer Durables',                oneToTen: '2.3%', tenPlus: '3.0%' },
  { industry: 'Diversified Financials',           oneToTen: '7.1%', tenPlus: '6.0%' },
  { industry: 'Drugs and Biotechnology',          oneToTen: '2.5%', tenPlus: '3.2%' },
  { industry: 'Education',                        oneToTen: '5.3%', tenPlus: null },
  { industry: 'Food Market',                      oneToTen: '1.7%', tenPlus: '1.9%' },
  { industry: 'Food, Drink & Tobacco',            oneToTen: '1.4%', tenPlus: '1.8%' },
  { industry: 'Healthcare Equipment & Svcs',      oneToTen: '4.4%', tenPlus: '4.9%' },
  { industry: 'Hotel, Restaurants and Leisure',   oneToTen: '3.3%', tenPlus: '3.6%' },
  { industry: 'Household & Personal Products',   oneToTen: '2.1%', tenPlus: null },
  { industry: 'Insurance',                        oneToTen: '3.0%', tenPlus: '3.4%' },
  { industry: 'Material',                         oneToTen: '1.7%', tenPlus: '2.2%' },
  { industry: 'Media',                            oneToTen: '5.2%', tenPlus: null },
  { industry: 'Oil & Gas Operations',             oneToTen: '1.9%', tenPlus: '2.0%' },
  { industry: 'Public Sector',                    oneToTen: '4.7%', tenPlus: '4.3%' },
  { industry: 'Retailing',                        oneToTen: '1.5%', tenPlus: '1.6%' },
  { industry: 'Semiconductors',                   oneToTen: '4.0%', tenPlus: '4.6%' },
  { industry: 'Software & Services',              oneToTen: '7.0%', tenPlus: '7.3%' },
  { industry: 'Technology Hardware & Equipment',  oneToTen: '4.9%', tenPlus: '4.8%' },
  { industry: 'Telecommunication Services',       oneToTen: '3.4%', tenPlus: '4.1%' },
  { industry: 'Trading Companies',                oneToTen: '6.4%', tenPlus: '5.9%' },
  { industry: 'Transportation',                   oneToTen: '2.9%', tenPlus: '3.6%' },
  { industry: 'Utilities',                        oneToTen: '2.8%', tenPlus: null }
];

function renderProBenchMarkTable() {
  var tbody = document.getElementById('probench-mark-tbody');
  if (!tbody) return;

  var rowsHtml = '';
  PROBENCH_MARK_DATA.forEach(function(row, idx) {
    var zebra = (idx % 2 === 0) ? '#fff' : '#f7fafd';
    rowsHtml +=
      '<tr style="background:' + zebra + ';">' +
        '<td style="padding:8px 10px; color:#1a3a5c; font-weight:500; border-bottom:1px solid #e0e8f0;">' + row.industry + '</td>' +
        '<td class="probench-cell" style="padding:8px 10px; text-align:right; border-bottom:1px solid #e0e8f0;">' + row.oneToTen + '</td>' +
        '<td class="probench-cell" style="padding:8px 10px; text-align:right; border-bottom:1px solid #e0e8f0;' + (row.tenPlus ? '' : ' background:#e8e8e8; color:#666666;') + '">' + (row.tenPlus || 'N/A') + '</td>' +
      '</tr>';
  });

  tbody.innerHTML = rowsHtml;
}

function bindProBenchMarkAdminTargets() {
  var tbody = document.getElementById('probench-mark-tbody');
  if (!tbody) return;

  tbody.querySelectorAll('tr').forEach(function(row) {
    var cells = row.querySelectorAll('td');
    if (cells.length < 3) return;
    var industryKey = slugifyAdminValue(cells[0].textContent);

    var oneToTenCell = cells[1];
    if (isAdminEditableNumber(oneToTenCell.textContent)) {
      bindAdminEditableCell(oneToTenCell, 'probench:' + industryKey + ':1b-10b');
    }

    var tenPlusCell = cells[2];
    if (isAdminEditableNumber(tenPlusCell.textContent)) {
      bindAdminEditableCell(tenPlusCell, 'probench:' + industryKey + ':10b-plus');
    }
  });
}

// Populates the Global Inputs Industry Type dropdown directly from the rendered ProBench Mark table rows.
function populateIndustryTypeDropdown() {
  var select = document.getElementById('industry-type-select');
  var tbody = document.getElementById('probench-mark-tbody');
  if (!select || !tbody) return;

  var industries = [];
  tbody.querySelectorAll('tr').forEach(function(row) {
    var firstCell = row.querySelector('td');
    if (firstCell) industries.push(firstCell.textContent.trim());
  });
  industries.sort(function(a, b) { return a.localeCompare(b); });

  var previousValue = select.value;
  select.innerHTML = '<option value="" selected>Select Industry Type</option>' +
    industries.map(function(name) { return '<option value="' + name.replace(/"/g, '&quot;') + '">' + name + '</option>'; }).join('');
  if (previousValue && industries.indexOf(previousValue) !== -1) select.value = previousValue;
}

// Reads the current IT Spend % for an industry + revenue range directly from the (possibly admin-edited) ProBench Mark table.
function getItSpendPercentFromProBenchTable(industryName, revenueRangeKey) {
  var tbody = document.getElementById('probench-mark-tbody');
  if (!tbody || !industryName || !revenueRangeKey) return null;

  var match = null;
  tbody.querySelectorAll('tr').forEach(function(row) {
    if (match) return;
    var cells = row.querySelectorAll('td');
    if (cells.length < 3) return;
    if (cells[0].textContent.trim() === industryName) match = cells;
  });
  if (!match) return null;

  var cell = revenueRangeKey === '10b-plus' ? match[2] : match[1];
  var text = (cell.textContent || '').trim();
  if (!text || text.toUpperCase() === 'N/A') return 'na';

  var n = parseFloat(text.replace(/[^0-9.\-]/g, ''));
  return isNaN(n) ? 'na' : n;
}

function formatItSpendCurrency(n) {
  return '$' + Math.round(n || 0).toLocaleString('en-US');
}

// Formats a raw dollar amount as "$X.XX Billion" / "$X.XX Million" / "$X.XX K" for readability below inputs/results.
function formatRevenueReadable(n) {
  if (!n || n <= 0) return '';
  if (n >= 1e9) return '$' + (n / 1e9).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Billion';
  if (n >= 1e6) return '$' + (n / 1e6).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Million';
  if (n >= 1e3) return '$' + (n / 1e3).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' K';
  return formatItSpendCurrency(n);
}

// Adds thousands separators while retaining a numeric string for calculations.
function formatRevenueInput(input) {
  if (!input) return;
  var raw = String(input.value || '').replace(/,/g, '').replace(/[^0-9.]/g, '');
  var parts = raw.split('.');
  var integerPart = parts.shift() || '';
  var decimalPart = parts.join('').slice(0, 2);
  integerPart = integerPart.replace(/^0+(?=\d)/, '');
  var formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (raw.indexOf('.') !== -1) formatted += '.' + decimalPart;
  input.value = formatted;
}

// Global Inputs: Industry Type + Revenue Range -> IT Spend % lookup -> Actual Annual IT Spend calculation.
function updateItSpendBenchmark() {
  updateTCOBenchmarkSummary();
  if (typeof buildExecutiveBrief === 'function') buildExecutiveBrief();
  var industrySelect = document.getElementById('industry-type-select');
  var rangeSelect = document.getElementById('revenue-range-select');
  var revenueInput = document.getElementById('actual-annual-revenue');
  var revenueReadableEl = document.getElementById('actual-annual-revenue-readable');
  var resultsWrapper = document.getElementById('it-spend-results-wrapper');
  var pctCell = document.getElementById('it-spend-percentage-display');
  var spendCell = document.getElementById('actual-annual-it-spend-display');
  var spendReadableEl = document.getElementById('actual-annual-it-spend-readable');
  if (!industrySelect || !rangeSelect || !pctCell || !spendCell) return;

  var industry = industrySelect.value;
  var range = rangeSelect.value;
  var rawRevenue = revenueInput ? String(revenueInput.value || '').replace(/[,$\s]/g, '') : '';
  var revenue = parseFloat(rawRevenue);
  var hasRevenue = !isNaN(revenue) && revenue > 0;

  if (revenueReadableEl) revenueReadableEl.textContent = hasRevenue ? formatRevenueReadable(revenue) : '';

  // Only show the results table once Industry Type, Revenue Range, and Actual Annual Revenue are all provided.
  if (resultsWrapper) resultsWrapper.style.display = (industry && range && hasRevenue) ? 'block' : 'none';
  if (!industry || !range || !hasRevenue) return;

  var pct = getItSpendPercentFromProBenchTable(industry, range);
  if (pct === null || pct === 'na') {
    pctCell.textContent = 'N/A - No benchmark available';
    spendCell.textContent = 'N/A';
    if (spendReadableEl) spendReadableEl.textContent = '';
    return;
  }

  pctCell.textContent = pct.toFixed(1) + '%';
  var spendAmount = revenue * (pct / 100);
  spendCell.textContent = formatItSpendCurrency(spendAmount);
  if (spendReadableEl) spendReadableEl.textContent = formatRevenueReadable(spendAmount);
}

// Formats a raw dollar amount as "$X.XB" / "$X,XXXM" for the compact TCO Analysis benchmarking summary panel.
function tcoFormatRevenue(n) {
  if (n >= 1e9) return '$' + (n / 1e9).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'B';
  if (n >= 1e6) return '$' + Math.round(n / 1e6).toLocaleString('en-US') + 'M';
  return '$' + Math.round(n).toLocaleString('en-US');
}

// Mirrors Global Inputs (Industry/Revenue Range/Actual Revenue) + ProBench Mark lookup into the TCO Analysis tab's summary panel.
function updateTCOBenchmarkSummary() {
  var industryEl = document.getElementById('tco-benchmark-industry');
  var rangeEl = document.getElementById('tco-benchmark-revenue-range');
  var revenueEl = document.getElementById('tco-benchmark-revenue');
  var pctEl = document.getElementById('tco-benchmark-pct');
  if (!industryEl || !rangeEl || !revenueEl || !pctEl) return;

  var industrySelect = document.getElementById('industry-type-select');
  var rangeSelect = document.getElementById('revenue-range-select');
  var revenueInput = document.getElementById('actual-annual-revenue');

  var industry = industrySelect ? industrySelect.value : '';
  var range = rangeSelect ? rangeSelect.value : '';
  var rawRevenue = revenueInput ? String(revenueInput.value || '').replace(/[,$\s]/g, '') : '';
  var revenue = parseFloat(rawRevenue);
  var hasRevenue = !isNaN(revenue) && revenue > 0;

  var rangeLabels = { '1b-10b': '$1B to $10B', '10b-plus': 'Greater than $10B' };

  industryEl.textContent = industry || 'Select Industry';
  rangeEl.textContent = range ? rangeLabels[range] : 'Select Range';
  revenueEl.textContent = hasRevenue ? tcoFormatRevenue(revenue) : '--';

  if (!industry || !range) {
    pctEl.textContent = '--';
    return;
  }

  var pct = getItSpendPercentFromProBenchTable(industry, range);
  pctEl.textContent = (pct === null || pct === 'na') ? 'N/A - No benchmark available' : pct.toFixed(1) + '%';
}

// Redundant safety-net listeners in case inline oninput/onchange attributes ever get clobbered by a re-render.
var _itSpendBenchmarkListenersAttached = false;
function wireItSpendBenchmarkListeners() {
  if (_itSpendBenchmarkListenersAttached) return;
  _itSpendBenchmarkListenersAttached = true;

  ['industry-type-select', 'revenue-range-select', 'actual-annual-revenue'].forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', updateItSpendBenchmark);
    el.addEventListener('change', updateItSpendBenchmark);
  });
}

/* TCO ANALYSIS - 5 YEAR PROJECTION */

// Reads a currency banner (element text or input value) as a plain number.
function tcoBannerNum(id) {
  var el = document.getElementById(id);
  if (!el) return 0;
  var raw = (typeof el.value === 'string' && el.value.trim() !== '') ? el.value : (el.textContent || '');
  var n = parseFloat(String(raw).replace(/[^0-9.\-]/g, ''));
  return isNaN(n) ? 0 : n;
}

// Scrapes the Mainframe infra compute table (MAINFRAME/DASD/VTL rows) into Infrastructure line items (no growth).
function tcoGetMainframeInfraLeaves() {
  var tbody = document.getElementById('mf-infra-compute-tbody');
  var leaves = [];
  if (!tbody) return leaves;
  tbody.querySelectorAll('tr').forEach(function(row) {
    if (row.classList.contains('ms-subtotal-row')) return;
    var cells = row.querySelectorAll('td');
    if (cells.length < 4) return;
    var label = (cells[0].textContent || '').trim();
    if (!label) return;
    var monthly = parseFloat((cells[3].textContent || '').replace(/[^0-9.\-]/g, ''));
    if (isNaN(monthly)) return;
    leaves.push({ label: label, annual: monthly * 12, growth: false });
  });
  return leaves;
}

// Reads the Tools/Governance annual cost from the already-rendered Overlays / Cross Functional table.
function tcoGetOverlaysCell(kind) {
  var tbody = document.getElementById('overlays-cfs-tbody');
  if (!tbody) return 0;
  var row = null;
  tbody.querySelectorAll('tr').forEach(function(r) {
    if (row) return;
    var firstCell = r.querySelector('td');
    if (firstCell && firstCell.textContent.trim() === 'Cross Functional Services') row = r;
  });
  if (!row) return 0;
  var cells = row.querySelectorAll('td');
  var cell = kind === 'tools' ? cells[3] : cells[4];
  if (!cell) return 0;
  var n = parseFloat((cell.textContent || '').replace(/[^0-9.\-]/g, ''));
  return isNaN(n) ? 0 : n;
}

// Compounding 5-year series: growth=false keeps every year equal to Yr1; growth=true compounds by pct% each year from Yr2.
function tcoGrowthSeries(y1, growth, pct) {
  var years = [y1, y1, y1, y1, y1];
  if (growth && pct) {
    for (var i = 1; i < 5; i++) years[i] = years[i - 1] * (1 + pct / 100);
  }
  return years;
}

function tcoFmtMoney(n) {
  var thousands = Math.round(Number(n || 0) / 1000);
  return '$' + thousands.toLocaleString('en-US') + 'K';
}

function tcoSumSeries(a, b) {
  var out = [0, 0, 0, 0, 0];
  for (var i = 0; i < 5; i++) out[i] = (a ? a[i] : 0) + (b ? b[i] : 0);
  return out;
}

function tcoTotal(series) {
  return series.reduce(function(s, v) { return s + v; }, 0);
}

function tcoGetInfrastructureTowers() {
  return [
    {
      label: 'DISTRIBUTED SERVERS',
      leaves: [
        { label: 'Infrastructure', annual: tcoBannerNum('infra-total-value'), growth: false },
        { label: 'VMware SW', annual: tcoBannerNum('vmware-total-annual'), growth: true }
      ]
    },
    {
      label: 'MIDRANGE SERVERS',
      leaves: [
        { label: 'Infrastructure', annual: tcoBannerNum('midrange-infra-total-value'), growth: false },
        { label: 'OS SW', annual: tcoBannerNum('swma-total-annual-value'), growth: true }
      ]
    },
    {
      label: 'STORAGE & BACKUP',
      leaves: [
        { label: 'Storage Infrastructure', annual: tcoBannerNum('storage-infra-storage-annual'), growth: false },
        { label: 'Backup Infrastructure', annual: tcoBannerNum('storage-infra-bsc-annual'), growth: false },
        { label: 'Backup SW', annual: tcoBannerNum('storage-infra-backup-annual'), growth: true }
      ]
    },
    { label: 'MAINFRAME', leaves: tcoGetMainframeInfraLeaves() },
    {
      label: 'NETWORK',
      leaves: [
        { label: 'Network Infrastructure', annual: tcoBannerNum('network-infra-total-value'), growth: false }
      ]
    },
    {
      label: 'DATA CENTER',
      leaves: [
        { label: 'Datacenter Cost', annual: tcoBannerNum('dc-total-cost-annual-strip'), growth: false }
      ]
    }
  ];
}

// Reads per-type rows (e.g. OS/DB/Mainframe component) from a US/India table pair, summing each type's annual cost across both locations.
function tcoGetLocationSplitLeaves(usSelector, indiaSelector, subtotalClass) {
  function readRows(selector) {
    var body = document.querySelector(selector);
    if (!body) return [];
    var rows = [];
    body.querySelectorAll('tr').forEach(function(tr) {
      if (subtotalClass && tr.classList.contains(subtotalClass)) return;
      var cells = tr.querySelectorAll('td');
      if (!cells.length) return;
      var label = (cells[0].textContent || '').trim();
      if (!label) return;
      var last = cells[cells.length - 1];
      var n = parseFloat((last.textContent || '').replace(/[^0-9.\-]/g, ''));
      rows.push({ label: label, annual: isNaN(n) ? 0 : n });
    });
    return rows;
  }
  var order = [];
  var totals = {};
  readRows(usSelector).concat(readRows(indiaSelector)).forEach(function(r) {
    if (!totals.hasOwnProperty(r.label)) { totals[r.label] = 0; order.push(r.label); }
    totals[r.label] += r.annual;
  });
  return order.map(function(label) { return { label: label, annual: totals[label] }; });
}

function tcoGetManagedServicesTowers() {
  var storageMs = getMsStyleTowerTotals('#storage-ms-store-us-tbody', '#storage-ms-store-india-tbody', 4, 7);
  var backupMs = getMsStyleTowerTotals('#storage-ms-backup-us-tbody', '#storage-ms-backup-india-tbody', 4, 7);
  return [
    { label: 'DISTRIBUTED SERVERS', annual: tcoBannerNum('ms-total-value'), leaves: tcoGetLocationSplitLeaves('#ms-us-tbody', '#ms-india-tbody', 'ms-subtotal-row') },
    { label: 'MIDRANGE SERVERS', annual: tcoBannerNum('midrange-ms-total-value'), leaves: tcoGetLocationSplitLeaves('#midrange-ms-us-tbody', '#midrange-ms-india-tbody', 'ms-subtotal-row') },
    { label: 'STORAGE', annual: storageMs.annual },
    { label: 'BACKUP', annual: backupMs.annual },
    { label: 'MAINFRAME', annual: tcoBannerNum('mf-ms-total-value'), leaves: tcoGetLocationSplitLeaves('#mf-ms-us-panel-body', '#mf-ms-india-panel-body', 'dbmw-ms-total-row') },
    { label: 'DATABASE', annual: tcoBannerNum('dbmw-database-total-annual'), leaves: tcoGetLocationSplitLeaves('#dbmw-database-us-panel-body', '#dbmw-database-india-panel-body', 'dbmw-ms-total-row') },
    { label: 'MIDDLEWARE', annual: tcoBannerNum('dbmw-middleware-total-annual'), leaves: tcoGetLocationSplitLeaves('#dbmw-middleware-us-panel-body', '#dbmw-middleware-india-panel-body', 'dbmw-ms-total-row') },
    { label: 'NETWORK', annual: tcoBannerNum('network-ms-total-value') },
    { label: 'SECURITY', annual: tcoBannerNum('security-ms-total-value') },
    { label: 'SERVICES MANAGEMENT (SMO/PMO)', annual: tcoGetOverlaysCell('governance') },
    { label: 'MANAGEMENT TOOLS', annual: tcoGetOverlaysCell('tools') }
  ];
}

// Yr1 base for the TCO Analysis benchmark row: Actual Annual Revenue x IT Spend % (both from Global Inputs / ProBench Mark).
function tcoGetEstimatedItSpendYr1() {
  var industrySelect = document.getElementById('industry-type-select');
  var rangeSelect = document.getElementById('revenue-range-select');
  var revenueInput = document.getElementById('actual-annual-revenue');
  var industry = industrySelect ? industrySelect.value : '';
  var range = rangeSelect ? rangeSelect.value : '';
  var rawRevenue = revenueInput ? String(revenueInput.value || '').replace(/[,$\s]/g, '') : '';
  var revenue = parseFloat(rawRevenue);
  if (isNaN(revenue) || revenue <= 0 || !industry || !range) return 0;
  var pct = getItSpendPercentFromProBenchTable(industry, range);
  if (pct === null || pct === 'na') return 0;
  return revenue * (pct / 100);
}

var _tcoGroupSeq = 0;

function tcoRowHtml(opts) {
  // opts: { label, series, total, rowClass, extraClasses, indent, toggleGroup, formatter }
  var indentPx = 15 + (opts.indent || 0) * 15;
  var fmt = opts.formatter || tcoFmtMoney;
  var toggle = '';
  if (opts.toggleGroup) {
    toggle = '<span class="tco-toggle-arrow tco-row-toggle" onclick="tcoToggleGroup(\'' + opts.toggleGroup + '\', this)">\u25bc</span> ';
  }
  var cells = '<td class="dc-label" style="padding-left:' + indentPx + 'px;">' + toggle + opts.label + '</td>';
  opts.series.forEach(function(v, idx) {
    cells += '<td>' + fmt(v) + '</td>';
  });
  cells += '<td>' + fmt(opts.total) + '</td>';
  var classes = opts.rowClass + (opts.extraClasses ? ' ' + opts.extraClasses : '');
  return '<tr class="' + classes + '">' + cells + '</tr>';
}

// Formats a ratio (0-100 scale value) as a whole-number percentage for the Ensono Scope of IT Spend row.
function tcoFmtPercent(n) {
  return Math.round(n || 0) + '%';
}



function buildTCOAnalysis() {
  var tbody = document.getElementById('tco-analysis-tbody');
  if (!tbody) return;

  updateTCOBenchmarkSummary();

  var eciPct = parseFloat((document.getElementById('eci') || {}).value) || 0;
  var noteEl = document.getElementById('tco-assumptions-note');
  if (noteEl) noteEl.textContent = 'Based on ' + eciPct.toLocaleString('en-US', { maximumFractionDigits: 2 }) + '% annual growth applied to Managed Services and Software costs from Year 2 onwards';

  var infraTowers = tcoGetInfrastructureTowers();
  var msTowers = tcoGetManagedServicesTowers();

  var hasAnyInfra = infraTowers.some(function(t) { return t.leaves.some(function(l) { return l.annual > 0; }); });
  var hasAnyMs = msTowers.some(function(t) { return t.annual > 0; });

  if (!hasAnyInfra && !hasAnyMs) {
    tbody.innerHTML = '<tr><td colspan="7" class="ms-loading">Configure towers above to calculate the 5 year TCO...</td></tr>';
    return;
  }

  var html = '';
  var totalInfraSeries = [0, 0, 0, 0, 0];
  var totalMsSeries = [0, 0, 0, 0, 0];

  // Pre-compute infra tower series
  var infraTowerSeries = infraTowers.map(function(tower) {
    var towerSeries = [0, 0, 0, 0, 0];
    var leafSeries = tower.leaves.map(function(leaf) {
      var s = tcoGrowthSeries(leaf.annual, leaf.growth, eciPct);
      towerSeries = tcoSumSeries(towerSeries, s);
      return s;
    });
    totalInfraSeries = tcoSumSeries(totalInfraSeries, towerSeries);
    return { tower: tower, towerSeries: towerSeries, leafSeries: leafSeries };
  });

  var msSeriesList = msTowers.map(function(t) {
    var s = tcoGrowthSeries(t.annual, true, eciPct);
    totalMsSeries = tcoSumSeries(totalMsSeries, s);
    var leafSeries = (t.leaves || []).map(function(leaf) {
      return tcoGrowthSeries(leaf.annual, true, eciPct);
    });
    return { tower: t, series: s, leafSeries: leafSeries };
  });

  var fullStackSeries = tcoSumSeries(totalInfraSeries, totalMsSeries);

  var estimatedItSpendSeries = tcoGrowthSeries(tcoGetEstimatedItSpendYr1(), true, eciPct);

  var ensonoScopeSeries = fullStackSeries.map(function(v, i) {
    return estimatedItSpendSeries[i] ? (v / estimatedItSpendSeries[i]) * 100 : 0;
  });
  var estimatedItSpendTotal = tcoTotal(estimatedItSpendSeries);
  var ensonoScopeTotal = estimatedItSpendTotal ? (tcoTotal(fullStackSeries) / estimatedItSpendTotal) * 100 : 0;

  html += tcoRowHtml({ label: 'ESTIMATED TOTAL IT SPEND', series: estimatedItSpendSeries, total: estimatedItSpendTotal, rowClass: 'tco-full-stack' });

  // SUMMARY IN-SCOPE always renders last in this fixed-position row group, immediately before TOTAL INFRASTRUCTURE.
  html += tcoRowHtml({ label: 'ESTIMATED SUMMARY IN-SCOPE', series: fullStackSeries, total: tcoTotal(fullStackSeries), rowClass: 'tco-full-stack' });

  html += tcoRowHtml({ label: 'ESTIMATED % IN-SCOPE', series: ensonoScopeSeries, total: ensonoScopeTotal, rowClass: 'tco-full-stack', formatter: tcoFmtPercent });

  var infraGroupId = 'tco-group-infra';
  html += tcoRowHtml({ label: 'ESTIMATED TOTAL INFRASTRUCTURE', series: totalInfraSeries, total: tcoTotal(totalInfraSeries), rowClass: 'tco-section-infra', toggleGroup: infraGroupId });

  infraTowerSeries.forEach(function(entry, idx) {
    if (!entry.tower.leaves.length) return;
    var towerGroupId = infraGroupId + '-' + idx;
    var altClass = (idx % 2 === 1) ? ' tco-alt' : '';
    html += tcoRowHtml({
      label: entry.tower.label, series: entry.towerSeries, total: tcoTotal(entry.towerSeries),
      rowClass: 'tco-subsection' + altClass, extraClasses: infraGroupId, indent: 1, toggleGroup: towerGroupId
    });
    entry.leafSeries.forEach(function(s, li) {
      html += tcoRowHtml({
        label: entry.tower.leaves[li].label, series: s, total: tcoTotal(s), rowClass: 'tco-leaf',
        extraClasses: infraGroupId + ' ' + towerGroupId, indent: 2
      });
    });
  });

  var msGroupId = 'tco-group-ms';
  html += tcoRowHtml({ label: 'ESTIMATED TOTAL MANAGED SERVICES', series: totalMsSeries, total: tcoTotal(totalMsSeries), rowClass: 'tco-section-ms', toggleGroup: msGroupId });

  msSeriesList.forEach(function(entry, idx) {
    var altClass = (idx % 2 === 1) ? ' tco-alt' : '';
    var hasLeaves = entry.tower.leaves && entry.tower.leaves.length;
    var towerGroupId = msGroupId + '-' + idx;
    html += tcoRowHtml({
      label: entry.tower.label, series: entry.series, total: tcoTotal(entry.series), rowClass: 'tco-subsection' + altClass,
      extraClasses: msGroupId, indent: 1, toggleGroup: hasLeaves ? towerGroupId : null
    });
    if (hasLeaves) {
      entry.leafSeries.forEach(function(s, li) {
        html += tcoRowHtml({
          label: entry.tower.leaves[li].label, series: s, total: tcoTotal(s), rowClass: 'tco-leaf',
          extraClasses: msGroupId + ' ' + towerGroupId, indent: 2
        });
      });
    }
  });

  tbody.innerHTML = html;
}

/* ══════════════════════════════════════════════════
   EXECUTIVE BRIEF DASHBOARD
   ══════════════════════════════════════════════════ */

function tcoFmtMillions(n) {
  return '$' + (Number(n || 0) / 1e6).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'M';
}

function tcoCagr(yr1, yr5) {
  if (!yr1 || yr1 <= 0 || !yr5 || yr5 <= 0) return 0;
  return (Math.pow(yr5 / yr1, 1 / 4) - 1) * 100;
}

function toggleExecSection(headerEl) {
  var body = headerEl.nextElementSibling;
  var arrow = headerEl.querySelector('.exec-section-arrow');
  if (!body) return;
  var collapsing = !body.classList.contains('exec-collapsed');
  body.classList.toggle('exec-collapsed', collapsing);
  if (arrow) arrow.innerHTML = collapsing ? '&#9654;' : '&#9660;';
}

// Maps Infrastructure/Managed Services/FTE tower labels (which differ slightly between builder functions) to a shared display label + color.
var EXEC_TOWER_MAP = [
  { label: 'Distributed', msLabel: 'DISTRIBUTED SERVERS', fteLabel: 'DISTRIBUTED', color: '#1976D2' },
  { label: 'Midrange', msLabel: 'MIDRANGE SERVERS', fteLabel: 'MIDRANGE', color: '#D32F2F' },
  { label: 'Storage', msLabel: 'STORAGE', fteLabel: 'STORAGE', color: '#F57C00' },
  { label: 'Backup', msLabel: 'BACKUP', fteLabel: 'BACKUP', color: '#FF7043' },
  { label: 'Mainframe', msLabel: 'MAINFRAME', fteLabel: 'MAINFRAME', color: '#6A1B9A' },
  { label: 'Database', msLabel: 'DATABASE', fteLabel: 'DATABASE', color: '#3F51B5' },
  { label: 'Middleware', msLabel: 'MIDDLEWARE', fteLabel: 'MIDDLEWARE', color: '#FBC02D' },
  { label: 'Network', msLabel: 'NETWORK', fteLabel: 'NETWORK', color: '#00796B' },
  { label: 'Security', msLabel: 'SECURITY', fteLabel: 'SECURITY', color: '#CDDC39' },
  { label: 'Services Mgmt (SMO/PMO)', msLabel: 'SERVICES MANAGEMENT (SMO/PMO)', fteLabel: 'SERVICES MANAGEMENT (SMO/PMO)', color: '#607D8B' },
  { label: 'Management Tools', msLabel: 'MANAGEMENT TOOLS', fteLabel: 'MANAGEMENT TOOLS', color: '#00BCD4' }
];

var EXEC_INFRA_ITEMS = [
  { label: 'Distributed', key: 'DISTRIBUTED SERVERS', color: '#1976D2' },
  { label: 'Midrange', key: 'MIDRANGE SERVERS', color: '#D32F2F' },
  { label: 'Storage & Backup', key: 'STORAGE & BACKUP', color: '#F57C00' },
  { label: 'Mainframe', key: 'MAINFRAME', color: '#6A1B9A' },
  { label: 'Network', key: 'NETWORK', color: '#00796B' },
  { label: 'Datacenter', key: 'DATA CENTER', color: '#C2185B' }
];

// Recomputes the same Infrastructure/Managed Services/Ensono Scope series used by the TCO Analysis table, for reuse by the Executive Brief dashboard.
function tcoComputeExecBriefData() {
  var eciPct = parseFloat((document.getElementById('eci') || {}).value) || 0;
  var infraTowers = tcoGetInfrastructureTowers();
  var msTowers = tcoGetManagedServicesTowers();

  var totalInfraSeries = [0, 0, 0, 0, 0];
  var infraTowerYr1 = {};
  var infraLeafYr1Growth = 0;
  var infraLeafYr1Flat = 0;
  infraTowers.forEach(function(tower) {
    var towerSeries = [0, 0, 0, 0, 0];
    tower.leaves.forEach(function(leaf) {
      var s = tcoGrowthSeries(leaf.annual, leaf.growth, eciPct);
      towerSeries = tcoSumSeries(towerSeries, s);
      if (leaf.growth) infraLeafYr1Growth += (leaf.annual || 0);
      else infraLeafYr1Flat += (leaf.annual || 0);
    });
    infraTowerYr1[tower.label] = towerSeries[0];
    totalInfraSeries = tcoSumSeries(totalInfraSeries, towerSeries);
  });

  var totalMsSeries = [0, 0, 0, 0, 0];
  var msTowerYr1 = {};
  msTowers.forEach(function(t) {
    var s = tcoGrowthSeries(t.annual, true, eciPct);
    totalMsSeries = tcoSumSeries(totalMsSeries, s);
    msTowerYr1[t.label] = t.annual;
  });

  var fullStackSeries = tcoSumSeries(totalInfraSeries, totalMsSeries);
  var fullStackTotal = tcoTotal(fullStackSeries);

  var estimatedItSpendSeries = tcoGrowthSeries(tcoGetEstimatedItSpendYr1(), true, eciPct);
  var estimatedItSpendTotal = tcoTotal(estimatedItSpendSeries);

  var ensonoScopeSeries = fullStackSeries.map(function(v, i) {
    return estimatedItSpendSeries[i] ? (v / estimatedItSpendSeries[i]) * 100 : 0;
  });
  var ensonoScopeTotalPct = estimatedItSpendTotal ? (fullStackTotal / estimatedItSpendTotal) * 100 : 0;

  var fteTowers = tcoGetFteTowers();
  var fteTowerMap = {};
  var totalFte = 0;
  fteTowers.forEach(function(t) { fteTowerMap[t.label] = t.fte; totalFte += t.fte; });

  var toolsAnnual = tcoGetOverlaysCell('tools');
  var governanceAnnual = tcoGetOverlaysCell('governance');

  return {
    infraTowerYr1: infraTowerYr1,
    totalInfraSeries: totalInfraSeries,
    totalMsSeries: totalMsSeries,
    fullStackSeries: fullStackSeries,
    fullStackTotal: fullStackTotal,
    estimatedItSpendSeries: estimatedItSpendSeries,
    estimatedItSpendTotal: estimatedItSpendTotal,
    ensonoScopeSeries: ensonoScopeSeries,
    ensonoScopeTotalPct: ensonoScopeTotalPct,
    msTowerYr1: msTowerYr1,
    fteTowerMap: fteTowerMap,
    totalFte: totalFte,
    toolsAnnual: toolsAnnual,
    governanceAnnual: governanceAnnual,
    infraLeafYr1Growth: infraLeafYr1Growth,
    infraLeafYr1Flat: infraLeafYr1Flat
  };
}

// Renders every Executive Brief infographic card from live Global Inputs + TCO Analysis data.
function buildExecutiveBrief() {
  if (!document.getElementById('exec-industry-value')) return;

  var data = tcoComputeExecBriefData();

  var industrySelect = document.getElementById('industry-type-select');
  var rangeSelect = document.getElementById('revenue-range-select');
  var revenueInput = document.getElementById('actual-annual-revenue');
  var industry = industrySelect ? industrySelect.value : '';
  var range = rangeSelect ? rangeSelect.value : '';
  var rangeLabels = { '1b-10b': '$1B to $10B', '10b-plus': 'Greater than $10B' };
  var rawRevenue = revenueInput ? String(revenueInput.value || '').replace(/[,$\s]/g, '') : '';
  var revenue = parseFloat(rawRevenue);
  var hasRevenue = !isNaN(revenue) && revenue > 0;
  var pct = (industry && range) ? getItSpendPercentFromProBenchTable(industry, range) : null;
  var itSpendPct = (pct === null || pct === 'na') ? 0 : pct;
  var benchmarkPct = 3.5;

  var infraYr1 = data.totalInfraSeries[0];
  var msYr1 = data.totalMsSeries[0];
  var fullYr1 = data.fullStackSeries[0];
  var infraPct = fullYr1 ? (infraYr1 / fullYr1) * 100 : 0;
  var msPct = fullYr1 ? (msYr1 / fullYr1) * 100 : 0;
  var yr1ScopePct = data.ensonoScopeSeries[0] || 0;
  var yr5ScopePct = data.ensonoScopeSeries[4] || 0;

  var subtitleEl = document.getElementById('exec-brief-subtitle');
  if (subtitleEl) subtitleEl.textContent = 'COMPANY PROFILE: ' + (industry || 'Select Industry Type') + (range ? ' - ' + rangeLabels[range] : '');

  // Sections/cards only appear when the underlying tower data is actually configured (case-by-case, not a fixed template).
  setVisible('exec-section-infra', infraYr1 > 0);
  setVisible('exec-section-ms', msYr1 > 0);
  setVisible('exec-card-datacenter', (data.infraTowerYr1['DATA CENTER'] || 0) > 0);
  setVisible('exec-card-capex', (data.infraLeafYr1Flat + data.infraLeafYr1Growth) > 0);
  setVisible('exec-card-cfs', (data.toolsAnnual + data.governanceAnnual) > 0);

  /* ─── SECTION 1: Company Profile & Overview ─── */
  setText('exec-industry-value', industry || 'Not Selected');
  setText('exec-range-value', range ? rangeLabels[range] : '--');
  setText('exec-revenue-value', hasRevenue ? tcoFormatRevenue(revenue) : '--');
  setText('exec-itspend-value', itSpendPct ? itSpendPct.toFixed(1) + '%' : '--');

  setText('exec-benchmark-actual', (itSpendPct ? itSpendPct.toFixed(1) : '0.0') + '% vs ' + benchmarkPct.toFixed(1) + '%');
  var variance = itSpendPct - benchmarkPct;
  var varianceEl = document.getElementById('exec-benchmark-variance');
  if (varianceEl) {
    varianceEl.textContent = (variance >= 0 ? '+' : '') + variance.toFixed(1) + '% ' + (variance >= 0 ? 'above' : 'below') + ' benchmark';
    varianceEl.style.color = variance > 0 ? '#E53935' : '#4CAF50';
  }
  var itIntensityBarFill = document.getElementById('exec-itintensity-bar-fill');
  var itIntensityMarker = document.getElementById('exec-itintensity-bar-marker');
  if (itIntensityBarFill) itIntensityBarFill.style.width = Math.min(100, (itSpendPct / 10) * 100) + '%';
  if (itIntensityMarker) itIntensityMarker.style.left = Math.min(100, (benchmarkPct / 10) * 100) + '%';

  setText('exec-budget-yr1', tcoFmtMillions(fullYr1));
  setText('exec-budget-total5yr', '5-Year Total: ' + tcoFmtMillions(data.fullStackTotal));

  setBarWidth('exec-splitbar-infra', infraPct, Math.round(infraPct) + '%');
  setBarWidth('exec-splitbar-ms', msPct, Math.round(msPct) + '%');

  setText('exec-scope-coverage-value', Math.round(yr1ScopePct) + '%');
  setText('exec-scope-opportunity-value', Math.round(100 - yr1ScopePct) + '%');

  /* ─── SECTION 2: Infrastructure Analysis ─── */
  setText('exec-infra-total-value', tcoFmtMillions(infraYr1));
  setText('exec-infra-total-pct', Math.round(infraPct) + '% of Total IT Budget');

  renderDonutWithLegend('exec-infra-donut', 'exec-infra-donut-legend', EXEC_INFRA_ITEMS.map(function(item) {
    return { label: item.label, value: data.infraTowerYr1[item.key] || 0, color: item.color };
  }));

  var infraBarsContainer = document.getElementById('exec-infra-bars');
  if (infraBarsContainer) {
    var infraTotalForPct = infraYr1 || 1;
    var barsHtml = '';
    EXEC_INFRA_ITEMS.forEach(function(item) {
      var v = data.infraTowerYr1[item.key] || 0;
      var pctOfInfra = (v / infraTotalForPct) * 100;
      barsHtml += '<div class="exec-infra-bar-row">' +
        '<div class="exec-infra-bar-label"><span>' + item.label + '</span><span>' + tcoFmtMillions(v) + ' (' + Math.round(pctOfInfra) + '%)</span></div>' +
        '<div class="exec-infra-bar-track"><div class="exec-infra-bar-fill" style="width:' + Math.min(100, pctOfInfra) + '%; background:' + item.color + ';"></div></div>' +
      '</div>';
    });
    infraBarsContainer.innerHTML = barsHtml;
  }

  renderTrendChart('exec-infra-trend-chart', data.totalInfraSeries);
  setText('exec-infra-cagr-value', 'CAGR: ' + tcoCagr(data.totalInfraSeries[0], data.totalInfraSeries[4]).toFixed(1) + '%');

  renderDonutWithLegend('exec-capex-donut', null, [
    { label: 'Hardware/Flat', value: data.infraLeafYr1Flat, color: '#1976D2' },
    { label: 'Software/Growing', value: data.infraLeafYr1Growth, color: '#FBC02D' }
  ]);
  setText('exec-capex-value', tcoFmtMillions(data.infraLeafYr1Flat));
  setText('exec-opex-value', tcoFmtMillions(data.infraLeafYr1Growth));

  var dcYr1 = data.infraTowerYr1['DATA CENTER'] || 0;
  setText('exec-dc-value', tcoFmtMillions(dcYr1));
  setText('exec-dc-pct-value', (infraYr1 ? Math.round((dcYr1 / infraYr1) * 100) : 0) + '% of Infrastructure Spend');

  /* ─── SECTION 3: Managed Services Analysis ─── */
  setText('exec-ms-total-value', tcoFmtMillions(msYr1));
  setText('exec-ms-total-pct', Math.round(msPct) + '% of Total IT Budget');

  var msDonutItems = EXEC_TOWER_MAP.map(function(t) {
    return { label: t.label, value: data.msTowerYr1[t.msLabel] || 0, color: t.color };
  });
  renderDonutWithLegend('exec-ms-donut', 'exec-ms-donut-legend', msDonutItems);

  var rankedContainer = document.getElementById('exec-ms-ranked-list');
  if (rankedContainer) {
    var ranked = EXEC_TOWER_MAP.map(function(t) {
      var cost = data.msTowerYr1[t.msLabel] || 0;
      var fte = data.fteTowerMap[t.fteLabel] || 0;
      return { label: t.label, cost: cost, fte: fte, color: t.color };
    }).sort(function(a, b) { return b.cost - a.cost; });
    var maxCost = ranked.length ? ranked[0].cost || 1 : 1;
    var rankedHtml = '';
    ranked.forEach(function(r, idx) {
      var costPerFte = r.fte ? (r.cost / r.fte) : 0;
      rankedHtml += '<div class="exec-rank-row">' +
        '<span>' + (idx + 1) + '. ' + r.label + '</span>' +
        '<div class="exec-rank-bar-track"><div class="exec-rank-bar-fill" style="width:' + Math.min(100, (r.cost / maxCost) * 100) + '%; background:' + r.color + ';"></div></div>' +
        '<span>' + tcoFmtMillions(r.cost) + (r.fte ? ' / $' + Math.round(costPerFte).toLocaleString('en-US') + ' per FTE' : '') + '</span>' +
      '</div>';
    });
    rankedContainer.innerHTML = rankedHtml;
  }

  setText('exec-fte-total-value', Math.round(data.totalFte).toLocaleString('en-US'));
  setText('exec-fte-cost-per-fte', 'Cost per FTE: ' + (data.totalFte ? '$' + Math.round(msYr1 / data.totalFte).toLocaleString('en-US') : '$0'));

  renderTrendChart('exec-ms-trend-chart', data.totalMsSeries);
  setText('exec-ms-cagr-value', 'CAGR: ' + tcoCagr(data.totalMsSeries[0], data.totalMsSeries[4]).toFixed(1) + '%');

  var cfsTotal = data.toolsAnnual + data.governanceAnnual;
  setBarWidth('exec-cfs-tools-bar', cfsTotal ? (data.toolsAnnual / cfsTotal) * 100 : 0, 'Tools');
  setBarWidth('exec-cfs-gov-bar', cfsTotal ? (data.governanceAnnual / cfsTotal) * 100 : 0, 'Gov');
  setText('exec-cfs-tools-value', tcoFmtMillions(data.toolsAnnual));
  setText('exec-cfs-gov-value', tcoFmtMillions(data.governanceAnnual));

  /* ─── SECTION 4: Financial Analysis ─── */
  renderTrendChart('exec-trend-chart', data.fullStackSeries);
  setText('exec-fullstack-5yr-total', '5-Year Total: ' + tcoFmtMillions(data.fullStackTotal));

  var yoyContainer = document.getElementById('exec-yoy-list');
  if (yoyContainer) {
    var yoyHtml = '';
    for (var i = 1; i < 5; i++) {
      var prev = data.fullStackSeries[i - 1];
      var cur = data.fullStackSeries[i];
      var growth = prev ? ((cur - prev) / prev) * 100 : 0;
      yoyHtml += '<div class="exec-yoy-row"><span>Yr' + i + ' &rarr; Yr' + (i + 1) + '</span><span style="color:' + (growth >= 0 ? '#4CAF50' : '#E53935') + ';">' + (growth >= 0 ? '+' : '') + growth.toFixed(1) + '%</span></div>';
    }
    yoyContainer.innerHTML = yoyHtml;
  }

  setText('exec-estimated-value', tcoFmtMillions(data.estimatedItSpendSeries[0]));
  setText('exec-actual-value', tcoFmtMillions(fullYr1));
  var gapPct = data.estimatedItSpendSeries[0] ? ((fullYr1 - data.estimatedItSpendSeries[0]) / data.estimatedItSpendSeries[0]) * 100 : 0;
  var gapEl = document.getElementById('exec-gap-variance');
  if (gapEl) {
    gapEl.textContent = 'Variance: ' + (gapPct >= 0 ? '+' : '') + gapPct.toFixed(1) + '% ' + (gapPct >= 0 ? 'over' : 'under') + ' estimate';
    gapEl.style.color = gapPct > 0 ? '#E53935' : '#4CAF50';
  }

  setText('exec-cost-per-revenue-value', hasRevenue ? '$' + (fullYr1 / revenue).toFixed(3) : '$0.000');
  setText('exec-avg-annual-value', tcoFmtMillions(data.fullStackTotal / 5));

  var cumulativeContainer = document.getElementById('exec-cumulative-list');
  if (cumulativeContainer) {
    var cumulative = 0;
    var maxCumulative = data.fullStackTotal || 1;
    var cumulativeHtml = '';
    data.fullStackSeries.forEach(function(v, i) {
      cumulative += v;
      cumulativeHtml += '<div class="exec-rank-row">' +
        '<span>Yr1&ndash;Yr' + (i + 1) + '</span>' +
        '<div class="exec-rank-bar-track"><div class="exec-rank-bar-fill" style="width:' + Math.min(100, (cumulative / maxCumulative) * 100) + '%; background:#17A2B8;"></div></div>' +
        '<span>' + tcoFmtMillions(cumulative) + '</span>' +
      '</div>';
    });
    cumulativeContainer.innerHTML = cumulativeHtml;
  }

  /* ─── SECTION 5: Strategic Insights ─── */
  var gaugeNeedle = document.getElementById('exec-gauge-needle');
  var gaugeBg = document.getElementById('exec-gauge-bg');
  if (gaugeBg) gaugeBg.style.background = 'conic-gradient(from 270deg, #E53935 0deg 54deg, #FF9800 54deg 126deg, #4CAF50 126deg 180deg, transparent 180deg 360deg)';
  if (gaugeNeedle) {
    var clamped = Math.max(0, Math.min(100, yr1ScopePct));
    gaugeNeedle.style.transform = 'rotate(' + (-90 + (clamped / 100) * 180) + 'deg)';
  }
  setText('exec-gauge-value', Math.round(yr1ScopePct) + '% of IT Spend');
  setText('exec-gauge-yr1', 'Yr1: ' + Math.round(yr1ScopePct) + '%');
  setText('exec-gauge-yr5', 'Yr5: ' + Math.round(yr5ScopePct) + '%');
  setText('exec-gauge-total', 'Total: ' + Math.round(data.ensonoScopeTotalPct) + '%');
  var gaugeTrendEl = document.getElementById('exec-gauge-trend');
  var declining = yr5ScopePct < yr1ScopePct;
  if (gaugeTrendEl) {
    gaugeTrendEl.textContent = (declining ? '\u2193 Declining trend' : '\u2191 Improving trend');
    gaugeTrendEl.style.color = declining ? '#E53935' : '#4CAF50';
  }
  setText('exec-gauge-summary', Math.round(yr1ScopePct) + '% of the organization\'s estimated annual IT spend is in scope. Opportunity: ' + Math.round(100 - yr1ScopePct) + '% of IT spend area for optimization.');

  renderTrendChart('exec-ensono-trend-chart', data.ensonoScopeSeries, function(v) { return Math.round(v) + '%'; });

  setText('exec-kpi-itpct', (itSpendPct ? itSpendPct.toFixed(1) : '0.0') + '%');
  setText('exec-kpi-infrapct', Math.round(infraPct) + '%');
  setText('exec-kpi-mspct', Math.round(msPct) + '%');
  setText('exec-kpi-ensono', Math.round(yr1ScopePct) + '%');

  var insightsContainer = document.getElementById('exec-insights-list');
  if (insightsContainer) {
    var insights = [];
    var infraRanked = EXEC_INFRA_ITEMS.map(function(item) { return { label: item.label, v: data.infraTowerYr1[item.key] || 0 }; }).sort(function(a, b) { return b.v - a.v; });
    var topInfra = infraRanked[0];
    var msRanked = EXEC_TOWER_MAP.map(function(t) {
      var cost = data.msTowerYr1[t.msLabel] || 0;
      var fte = data.fteTowerMap[t.fteLabel] || 0;
      return { label: t.label, cost: cost, fte: fte, costPerFte: fte ? cost / fte : 0 };
    }).sort(function(a, b) { return b.cost - a.cost; });
    var topMs = msRanked[0];

    if (topInfra && topInfra.v > 0) {
      insights.push('Largest infrastructure cost driver: <strong>' + topInfra.label + '</strong> at ' + tcoFmtMillions(topInfra.v) + ' (Yr1).');
      var topInfraPctOfInfra = infraYr1 ? (topInfra.v / infraYr1) * 100 : 0;
      if (topInfraPctOfInfra > 50) insights.push('<strong>Concentration risk:</strong> ' + topInfra.label + ' alone accounts for ' + Math.round(topInfraPctOfInfra) + '% of infrastructure spend &mdash; consider diversification or modernization review.');
    }
    var mainframeYr1 = data.infraTowerYr1['MAINFRAME'] || 0;
    if (infraYr1 && (mainframeYr1 / infraYr1) * 100 > 30) insights.push('<strong>Legacy dependency:</strong> Mainframe represents ' + Math.round((mainframeYr1 / infraYr1) * 100) + '% of infrastructure spend, indicating continued reliance on legacy platforms.');

    if (topMs && topMs.cost > 0) insights.push('Largest managed services cost driver: <strong>' + topMs.label + '</strong> at ' + tcoFmtMillions(topMs.cost) + ' (Yr1).');
    var fteCandidates = msRanked.filter(function(r) { return r.fte > 0; });
    if (fteCandidates.length > 1) {
      var highestCpf = fteCandidates.slice().sort(function(a, b) { return b.costPerFte - a.costPerFte; })[0];
      var lowestCpf = fteCandidates.slice().sort(function(a, b) { return a.costPerFte - b.costPerFte; })[0];
      if (highestCpf.label !== lowestCpf.label && lowestCpf.costPerFte > 0 && highestCpf.costPerFte / lowestCpf.costPerFte > 1.5) {
        insights.push('<strong>Labor cost disparity:</strong> ' + highestCpf.label + ' costs $' + Math.round(highestCpf.costPerFte).toLocaleString('en-US') + '/FTE vs ' + lowestCpf.label + ' at $' + Math.round(lowestCpf.costPerFte).toLocaleString('en-US') + '/FTE.');
      }
    }

    if (declining && data.estimatedItSpendSeries[4]) {
      var opportunityGap = data.estimatedItSpendSeries[4] - data.fullStackSeries[4];
      if (opportunityGap > 0) insights.push('In-scope estimated IT spend declines from ' + Math.round(yr1ScopePct) + '% to ' + Math.round(yr5ScopePct) + '% by Yr5 &mdash; a growth opportunity of approximately ' + tcoFmtMillions(opportunityGap) + '.');
    } else if (!declining && yr1ScopePct > 0) {
      insights.push('In-scope estimated IT spend is improving, from ' + Math.round(yr1ScopePct) + '% (Yr1) to ' + Math.round(yr5ScopePct) + '% (Yr5).');
    }
    if (yr1ScopePct > 0 && yr1ScopePct < 50) insights.push('<strong>Expansion opportunity:</strong> The current in-scope coverage is ' + Math.round(yr1ScopePct) + '% of estimated IT spend, leaving ' + Math.round(100 - yr1ScopePct) + '% addressable.');
    else if (yr1ScopePct >= 90) insights.push('In-scope coverage is already high at ' + Math.round(yr1ScopePct) + '% of estimated IT spend &mdash; limited remaining expansion headroom.');

    if (fullYr1 > 0) {
      var msYr5Pct = data.fullStackSeries[4] ? (data.totalMsSeries[4] / data.fullStackSeries[4]) * 100 : 0;
      if (msYr5Pct - msPct > 3) insights.push('Managed Services share of total IT spend is projected to grow from ' + Math.round(msPct) + '% (Yr1) to ' + Math.round(msYr5Pct) + '% (Yr5), driven by labor cost growth outpacing flat infrastructure hardware costs.');
      if (msPct > infraPct) insights.push('Managed Services (' + Math.round(msPct) + '%) now represents a larger share of IT spend than Infrastructure (' + Math.round(infraPct) + '%), reflecting an OpEx-driven cost model.');
    }

    if (itSpendPct > 0) {
      if (variance > 1) insights.push('<strong>Overspend risk:</strong> IT spend is ' + variance.toFixed(1) + ' points above the ' + benchmarkPct.toFixed(1) + '% industry benchmark, meaningfully higher than peers.');
      else if (variance < -1) insights.push('<strong>Underinvestment risk:</strong> IT spend is ' + Math.abs(variance).toFixed(1) + ' points below the ' + benchmarkPct.toFixed(1) + '% industry benchmark, which may signal underinvestment.');
    }

    if (!insights.length) insights.push('Configure towers and Global Inputs above to generate data-driven cost insights.');
    insightsContainer.innerHTML = insights.map(function(text) { return '<div class="exec-insight-item">' + text + '</div>'; }).join('');

    var headlineEl = document.getElementById('exec-brief-headline');
    if (headlineEl) {
      if (fullYr1 > 0) {
        headlineEl.textContent = (industry || 'This organization') + ' spends ' + tcoFmtMillions(fullYr1) + ' annually on IT (' + (itSpendPct ? itSpendPct.toFixed(1) : '0.0') + '% of revenue, ' + (variance >= 0 ? '+' : '') + variance.toFixed(1) + '% vs benchmark). In-scope coverage is ' + Math.round(yr1ScopePct) + '% of estimated spend, with ' + (topInfra ? topInfra.label : 'Infrastructure') + ' as the top infrastructure cost driver.';
      } else {
        headlineEl.textContent = 'Configure Global Inputs and towers above to generate a live executive summary.';
      }
    }
  }

  /* ─── SECTION 8: Executive Summary Scorecard ─── */
  var summaryGrid = document.getElementById('exec-summary-grid');
  if (summaryGrid) {
    var kpis = [
      { label: 'Total IT Budget (Yr1)', value: tcoFmtMillions(fullYr1) },
      { label: 'Total IT Budget (5-Yr)', value: tcoFmtMillions(data.fullStackTotal) },
      { label: 'Infrastructure Spend', value: tcoFmtMillions(infraYr1) + ' (' + Math.round(infraPct) + '%)' },
      { label: 'Managed Services Spend', value: tcoFmtMillions(msYr1) + ' (' + Math.round(msPct) + '%)' },
      { label: 'Total FTEs', value: Math.round(data.totalFte).toLocaleString('en-US') },
      { label: 'In-Scope Coverage (Yr1)', value: Math.round(yr1ScopePct) + '%' },
      { label: 'IT % of Revenue', value: (itSpendPct ? itSpendPct.toFixed(1) : '0.0') + '%' },
      { label: 'Infrastructure CAGR', value: tcoCagr(data.totalInfraSeries[0], data.totalInfraSeries[4]).toFixed(1) + '%' },
      { label: 'Managed Services CAGR', value: tcoCagr(data.totalMsSeries[0], data.totalMsSeries[4]).toFixed(1) + '%' },
      { label: 'Benchmark Variance', value: (variance >= 0 ? '+' : '') + variance.toFixed(1) + '%' }
    ];
    summaryGrid.innerHTML = kpis.map(function(k) {
      return '<div class="exec-kpi-box"><div class="exec-metric-label">' + k.label + '</div><div class="exec-metric-value" style="font-size:14px;">' + k.value + '</div></div>';
    }).join('');
  }
}

function setText(id, text) {
  var el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setVisible(id, visible) {
  var el = document.getElementById(id);
  if (el) el.style.display = visible ? '' : 'none';
}

function setBarWidth(id, pct, label) {
  var el = document.getElementById(id);
  if (!el) return;
  el.style.width = Math.max(0, Math.min(100, pct)) + '%';
  el.textContent = label;
}

// Builds a CSS conic-gradient donut plus an optional legend list from an array of {label, value, color}.
function renderDonutWithLegend(donutId, legendId, items) {
  var donutEl = document.getElementById(donutId);
  var total = items.reduce(function(s, it) { return s + (it.value || 0); }, 0) || 1;
  if (donutEl) {
    var cursor = 0;
    var stops = items.map(function(it) {
      var start = (cursor / total) * 100;
      cursor += (it.value || 0);
      var end = (cursor / total) * 100;
      return it.color + ' ' + start + '% ' + end + '%';
    }).join(', ');
    donutEl.style.background = 'conic-gradient(' + stops + ')';
  }
  if (legendId) {
    var legendEl = document.getElementById(legendId);
    if (legendEl) {
      legendEl.innerHTML = items.map(function(it) {
        var pct = total ? Math.round(((it.value || 0) / total) * 100) : 0;
        return '<div><span class="exec-legend-swatch" style="background:' + it.color + ';"></span>' + it.label + ': <strong>' + pct + '%</strong> (' + tcoFmtMillions(it.value) + ')</div>';
      }).join('');
    }
  }
}

// Renders a 5-column bar chart into the given container from a 5-value series, with an optional custom value formatter.
function renderTrendChart(containerId, series, fmt) {
  var container = document.getElementById(containerId);
  if (!container) return;
  var formatter = fmt || tcoFmtMillions;
  var maxVal = Math.max.apply(null, series.concat([1]));
  var html = '';
  series.forEach(function(v, i) {
    var heightPct = maxVal ? (v / maxVal) * 100 : 0;
    html += '<div class="exec-trend-col">' +
      '<div class="exec-trend-value">' + formatter(v) + '</div>' +
      '<div class="exec-trend-bar" style="height:' + Math.max(4, heightPct) + '%;"></div>' +
      '<div class="exec-trend-label">Yr' + (i + 1) + '</div>' +
    '</div>';
  });
  container.innerHTML = html;
}

function tcoToggleGroup(groupClass, arrowEl) {
  var rows = document.querySelectorAll('.' + groupClass);
  var collapsing = arrowEl.textContent.indexOf('\u25bc') !== -1;
  rows.forEach(function(r) {
    if (r.classList.contains(groupClass) && r !== arrowEl.closest('tr')) {
      r.classList.toggle('tco-row-hidden', collapsing);
    }
  });
  arrowEl.textContent = collapsing ? '\u25b6 ' : '\u25bc ';
}

function tcoExpandAll() {
  document.querySelectorAll('#tco-analysis-tbody tr').forEach(function(r) { r.classList.remove('tco-row-hidden'); });
  document.querySelectorAll('#tco-analysis-tbody .tco-row-toggle').forEach(function(a) { a.textContent = '\u25bc '; });
}

function tcoCollapseAll() {
  document.querySelectorAll('#tco-analysis-tbody .tco-row-toggle').forEach(function(a) {
    var groupMatch = a.getAttribute('onclick').match(/tcoToggleGroup\('([^']+)'/);
    if (!groupMatch) return;
    document.querySelectorAll('.' + groupMatch[1]).forEach(function(r) {
      if (r !== a.closest('tr')) r.classList.add('tco-row-hidden');
    });
    a.textContent = '\u25b6 ';
  });
}

function tcoExpandAllFte() {
  document.querySelectorAll('#tco-fte-tbody tr').forEach(function(r) { r.classList.remove('tco-row-hidden'); });
  document.querySelectorAll('#tco-fte-tbody .tco-row-toggle').forEach(function(a) { a.textContent = '\u25bc '; });
}

function tcoCollapseAllFte() {
  document.querySelectorAll('#tco-fte-tbody .tco-row-toggle').forEach(function(a) {
    var groupMatch = a.getAttribute('onclick').match(/tcoToggleGroup\('([^']+)'/);
    if (!groupMatch) return;
    document.querySelectorAll('.' + groupMatch[1]).forEach(function(r) {
      if (r !== a.closest('tr')) r.classList.add('tco-row-hidden');
    });
    a.textContent = '\u25b6 ';
  });
}

function tcoExcelCellStyle(element) {
  var style = window.getComputedStyle(element);
  var border = { style: 'thin', color: { rgb: 'D8E1EB' } };
  return {
    font: {
      name: 'Arial',
      sz: 10,
      bold: parseInt(style.fontWeight, 10) >= 600,
      color: { rgb: style.color === 'rgb(255, 255, 255)' ? 'FFFFFF' : '15385B' }
    },
    fill: { patternType: 'solid', fgColor: { rgb: tcoExcelColor(style.backgroundColor) } },
    alignment: { horizontal: element.cellIndex === 0 ? 'left' : 'right', vertical: 'center', wrapText: true },
    border: { top: border, bottom: border, left: border, right: border }
  };
}

function tcoExcelColor(color) {
  var match = String(color || '').match(/\d+/g);
  if (!match || match.length < 3) return 'FFFFFF';
  return match.slice(0, 3).map(function(value) {
    return Number(value).toString(16).padStart(2, '0');
  }).join('').toUpperCase();
}

function tcoExcelValue(text) {
  var value = String(text || '').trim();
  if (/^\$[\d,]+(?:\.\d+)?[KM]?$/i.test(value)) {
    var multiplier = /M$/i.test(value) ? 1000000 : (/K$/i.test(value) ? 1000 : 1);
    return { value: Number(value.replace(/[$,KM]/gi, '')) * multiplier, format: '$#,##0' };
  }
  if (/^-?[\d,]+(?:\.\d+)?%$/.test(value)) return { value: Number(value.replace(/[,%]/g, '')) / 100, format: '0%' };
  if (/^-?[\d,]+(?:\.\d+)?$/.test(value)) return { value: Number(value.replace(/,/g, '')), format: '#,##0' };
  return { value: value, format: null };
}

function tcoExcelBenchmarkStyle(isHeader, isLabel) {
  var border = { style: 'thin', color: { rgb: 'D8E1EB' } };
  return {
    font: { name: 'Arial', sz: 10, bold: true, color: { rgb: isHeader ? 'FFFFFF' : (isLabel ? '1A2B45' : '15385B') } },
    fill: { patternType: 'solid', fgColor: { rgb: isHeader ? '003366' : 'FFFFFF' } },
    alignment: { horizontal: isLabel ? 'left' : 'right', vertical: 'center', wrapText: true },
    border: { top: border, bottom: border, left: border, right: border }
  };
}

function tcoAddExcelTable(workbook, sheetName, cardId, tableSelector, includeBenchmark) {
  var card = document.getElementById(cardId);
  var table = card ? card.querySelector(tableSelector) : null;
  if (!table) return;
  var rows = [];
  var title = card.querySelector('div[style*="font-size:15px"]');
  var subtitle = title ? title.nextElementSibling : null;
  rows.push([title ? title.textContent.trim() : sheetName]);
  if (subtitle) rows.push([subtitle.textContent.trim()]);
  rows.push([]);
  if (includeBenchmark) {
    rows.push(['IT Spend Benchmarking Summary', 'Value']);
    [['Industry', 'tco-benchmark-industry'], ['Revenue Range (in $)', 'tco-benchmark-revenue-range'], ['Actual Annual Revenue (in $)', 'tco-benchmark-revenue'], ['IT Spend as a % of Revenue', 'tco-benchmark-pct']].forEach(function(entry) {
      var valueElement = document.getElementById(entry[1]);
      rows.push([entry[0], valueElement ? valueElement.textContent.trim() : '']);
    });
    rows.push([]);
  }
  Array.prototype.slice.call(table.rows).forEach(function(row) {
    rows.push(Array.prototype.slice.call(row.cells).map(function(cell) { return cell.textContent.trim(); }));
  });

  var worksheet = XLSX.utils.aoa_to_sheet(rows);
  var tableStartRow = includeBenchmark ? 10 : 4;
  var columnCount = table.rows[0].cells.length;
  worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: columnCount - 1 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: columnCount - 1 } }];
  worksheet['!cols'] = Array.prototype.slice.call(table.rows[0].cells).map(function(cell, index) {
    return { wch: index === 0 ? 34 : Math.max(13, Math.min(19, cell.textContent.trim().length + 4)) };
  });
  worksheet['!rows'] = rows.map(function() { return { hpt: 20 }; });

  var titleStyle = { font: { name: 'Arial', sz: 14, bold: true, color: { rgb: '1A3A5C' } }, alignment: { vertical: 'center' } };
  worksheet.A1.s = titleStyle;
  if (worksheet.A2) worksheet.A2.s = { font: { name: 'Arial', sz: 10, color: { rgb: '555555' } } };
  if (includeBenchmark) {
    ['A4', 'B4'].forEach(function(address) {
      if (worksheet[address]) worksheet[address].s = tcoExcelBenchmarkStyle(true, address === 'A4');
    });
    ['A5', 'A6', 'A7', 'A8'].forEach(function(address) {
      if (worksheet[address]) worksheet[address].s = tcoExcelBenchmarkStyle(false, true);
    });
    ['B5', 'B6', 'B7', 'B8'].forEach(function(address) {
      if (worksheet[address]) {
        var benchmarkValue = tcoExcelValue(worksheet[address].v);
        worksheet[address].v = benchmarkValue.value;
        worksheet[address].t = typeof benchmarkValue.value === 'number' ? 'n' : 's';
        if (benchmarkValue.format) worksheet[address].z = benchmarkValue.format;
        worksheet[address].s = tcoExcelBenchmarkStyle(false, false);
      }
    });
  }

  Array.prototype.slice.call(table.rows).forEach(function(row, rowIndex) {
    Array.prototype.slice.call(row.cells).forEach(function(cell, columnIndex) {
      var address = XLSX.utils.encode_cell({ r: tableStartRow - 1 + rowIndex, c: columnIndex });
      var cellValue = tcoExcelValue(cell.textContent);
      worksheet[address] = { v: cellValue.value, t: typeof cellValue.value === 'number' ? 'n' : 's', s: tcoExcelCellStyle(cell) };
      if (cellValue.format) worksheet[address].z = cellValue.format;
    });
  });
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
}

function exportTCOAnalysisExcel() {
  if (!window.XLSX) {
    alert('The Excel export library is unavailable. Please check your internet connection and try again.');
    return;
  }
  var exportButton = document.getElementById('tco-export-excel-button');
  var exportButtonText = exportButton ? exportButton.textContent : '';
  try {
    if (typeof buildTCOAnalysis === 'function') buildTCOAnalysis();
    if (typeof buildTCOFteCard === 'function') buildTCOFteCard();
    if (typeof buildTCOOperationalMetrics === 'function') buildTCOOperationalMetrics();
    tcoExpandAll();
    tcoExpandAllFte();
    if (exportButton) { exportButton.disabled = true; exportButton.textContent = 'Preparing Excel...'; }
    var workbook = XLSX.utils.book_new();
    tcoAddExcelTable(workbook, 'TCO Analysis', 'tco-analysis-card', 'table', true);
    tcoAddExcelTable(workbook, 'FTE Count', 'tco-fte-card', 'table', false);
    tcoAddExcelTable(workbook, 'Operational Metrics', 'tco-operational-metrics-card', 'table', false);
    XLSX.writeFile(workbook, 'TCO-Analysis.xlsx');
  } catch (error) {
    console.error('Unable to export TCO Analysis Excel:', error);
    alert('Unable to create the Excel file. Please try again.');
  } finally {
    if (exportButton) { exportButton.disabled = false; exportButton.textContent = exportButtonText; }
  }
}

function tcoAddPdfExecutiveOverview() {
  var benchmarkPanel = document.getElementById('tco-benchmark-summary-panel');
  var firstExecutiveSection = document.querySelector('#panel-exec-brief .exec-section');
  var sectionCards = firstExecutiveSection ? Array.prototype.slice.call(firstExecutiveSection.querySelectorAll('.exec-card')) : [];
  var executiveCards = [sectionCards[0], sectionCards[2], sectionCards[3]].filter(function(card) { return !!card; });
  if (!benchmarkPanel || executiveCards.length !== 3) return null;

  var overview = document.createElement('div');
  overview.className = 'tco-pdf-exec-overview';
  executiveCards.forEach(function(card) {
    var cardClone = card.cloneNode(true);
    cardClone.removeAttribute('id');
    cardClone.querySelectorAll('[id]').forEach(function(element) { element.removeAttribute('id'); });
    overview.appendChild(cardClone);
  });

  benchmarkPanel.style.display = 'none';
  benchmarkPanel.parentNode.insertAdjacentElement('afterend', overview);
  return { benchmarkPanel: benchmarkPanel, overview: overview };
}

async function exportExecutiveBriefPdf() {
  if (!window.html2canvas || !window.jspdf || !window.jspdf.jsPDF) {
    alert('The PDF export libraries are unavailable. Please check your internet connection and try again.');
    return;
  }

  var exportButton = document.getElementById('exec-export-pdf-button');
  var exportButtonText = exportButton ? exportButton.textContent : '';
  var executiveBrief = document.querySelector('#panel-exec-brief .exec-brief-wrap');
  var collapsedSections = [];
  if (!executiveBrief) return;

  try {
    if (typeof buildExecutiveBrief === 'function') buildExecutiveBrief();
    executiveBrief.querySelectorAll('.exec-section-body.exec-collapsed').forEach(function(body) {
      collapsedSections.push(body);
      body.classList.remove('exec-collapsed');
    });
    if (exportButton) {
      exportButton.disabled = true;
      exportButton.textContent = 'Preparing PDF...';
      exportButton.style.display = 'none';
    }

    await new Promise(function(resolve) {
      requestAnimationFrame(function() { requestAnimationFrame(resolve); });
    });

    var pdf = new window.jspdf.jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
    var margin = 6;
    var contentWidth = pdf.internal.pageSize.getWidth() - (margin * 2);
    var contentHeight = pdf.internal.pageSize.getHeight() - (margin * 2);
    var sections = Array.prototype.slice.call(executiveBrief.querySelectorAll('.exec-section'));

    for (var sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
      if (sectionIndex > 0) pdf.addPage();
      var section = sections[sectionIndex];
      var canvas = await window.html2canvas(section, {
        backgroundColor: '#f4f7fb',
        scale: 2.5,
        useCORS: true,
        logging: false,
        windowWidth: document.documentElement.scrollWidth,
        onclone: function(clonedDocument) {
          var clonedBody = clonedDocument.body;
          if (!clonedBody) return;
          clonedBody.style.zoom = '1';
          clonedBody.style.transform = 'none';
          clonedBody.style.transformOrigin = 'top left';
          clonedBody.style.width = '100%';
        }
      });
      var scale = Math.min(contentWidth / canvas.width, contentHeight / canvas.height);
      var renderWidth = canvas.width * scale;
      var renderHeight = canvas.height * scale;
      var offsetX = margin + ((contentWidth - renderWidth) / 2);
      var offsetY = margin + ((contentHeight - renderHeight) / 2);
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', offsetX, offsetY, renderWidth, renderHeight, undefined, 'FAST');
    }

    pdf.save('Executive-Brief.pdf');
  } catch (error) {
    console.error('Unable to export Executive Brief PDF:', error);
    alert('Unable to create the PDF. Please try again.');
  } finally {
    collapsedSections.forEach(function(body) { body.classList.add('exec-collapsed'); });
    if (exportButton) {
      exportButton.disabled = false;
      exportButton.textContent = exportButtonText;
      exportButton.style.display = '';
    }
  }
}

async function exportTCOAnalysisPdf() {
  if (!window.html2canvas || !window.jspdf || !window.jspdf.jsPDF) {
    alert('The PDF export libraries are unavailable. Please check your internet connection and try again.');
    return;
  }

  var exportButton = document.getElementById('tco-export-pdf-button');
  var exportButtonText = exportButton ? exportButton.textContent : '';
  var hiddenButtons = [];
  var pdfExecutiveOverview = null;

  try {
    if (typeof buildTCOAnalysis === 'function') buildTCOAnalysis();
    if (typeof buildTCOFteCard === 'function') buildTCOFteCard();
    if (typeof buildTCOOperationalMetrics === 'function') buildTCOOperationalMetrics();
    if (typeof buildExecutiveBrief === 'function') buildExecutiveBrief();
    tcoExpandAll();
    tcoExpandAllFte();

    if (exportButton) {
      exportButton.disabled = true;
      exportButton.textContent = 'Preparing PDF...';
    }

    document.querySelectorAll('#panel-tco-analysis button').forEach(function(button) {
      hiddenButtons.push({ button: button, display: button.style.display });
      button.style.display = 'none';
    });
    pdfExecutiveOverview = tcoAddPdfExecutiveOverview();

    await new Promise(function(resolve) {
      requestAnimationFrame(function() { requestAnimationFrame(resolve); });
    });

    var jsPDF = window.jspdf.jsPDF;
    var pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
    var pageWidth = pdf.internal.pageSize.getWidth();
    var pageHeight = pdf.internal.pageSize.getHeight();
    var margin = 6;
    var contentWidth = pageWidth - (margin * 2);
    var contentHeight = pageHeight - (margin * 2);
    var cards = ['tco-analysis-card', 'tco-fte-card', 'tco-operational-metrics-card'];

    for (var cardIndex = 0; cardIndex < cards.length; cardIndex++) {
      var card = document.getElementById(cards[cardIndex]);
      if (!card) continue;
      if (cardIndex > 0) pdf.addPage();

      var rowBreaks = [];
      var clonedCardHeight = 0;
      var canvas = await window.html2canvas(card, {
        backgroundColor: '#ffffff',
        scale: 2.5,
        useCORS: true,
        logging: false,
        windowWidth: document.documentElement.scrollWidth,
        onclone: function(clonedDocument) {
          var clonedBody = clonedDocument.body;
          if (!clonedBody) return;
          clonedBody.style.zoom = '1';
          clonedBody.style.transform = 'none';
          clonedBody.style.transformOrigin = 'top left';
          clonedBody.style.width = '100%';

          var clonedCard = clonedDocument.getElementById(card.id);
          if (!clonedCard) return;
          var clonedCardRect = clonedCard.getBoundingClientRect();
          clonedCardHeight = clonedCardRect.height;
          var clonedRows = Array.prototype.slice.call(clonedCard.querySelectorAll('tr'));
          rowBreaks = clonedRows.map(function(row) {
            return row.getBoundingClientRect().top - clonedCardRect.top;
          }).filter(function(position, index, positions) {
            return position > 0 && positions.indexOf(position) === index;
          }).sort(function(a, b) { return a - b; });
        }
      });
      var scale = contentWidth / canvas.width;
      var sourcePageHeight = Math.floor(contentHeight / scale);
      var sourceTop = 0;
      var canvasScaleY = clonedCardHeight ? canvas.height / Math.max(clonedCardHeight, 1) : 1;
      rowBreaks = rowBreaks.map(function(position) { return Math.round(position * canvasScaleY); });

      while (sourceTop < canvas.height) {
        var pageLimit = Math.min(sourceTop + sourcePageHeight, canvas.height);
        var sourceBottom = pageLimit;
        var nextRowTop = 0;
        rowBreaks.forEach(function(rowTop) {
          if (rowTop > sourceTop && rowTop <= pageLimit) sourceBottom = rowTop;
          if (!nextRowTop && rowTop > pageLimit) nextRowTop = rowTop;
        });
        if (nextRowTop && nextRowTop - pageLimit <= 40 * canvasScaleY) sourceBottom = nextRowTop;
        if (sourceBottom <= sourceTop) sourceBottom = pageLimit;
        var sourceHeight = sourceBottom - sourceTop;
        var pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;
        pageCanvas.getContext('2d').drawImage(canvas, 0, sourceTop, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
        pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', margin, margin, contentWidth, sourceHeight * scale, undefined, 'FAST');
        sourceTop = sourceBottom;
        if (sourceTop < canvas.height) pdf.addPage();
      }
    }

    pdf.save('TCO-Analysis.pdf');
  } catch (error) {
    console.error('Unable to export TCO Analysis PDF:', error);
    alert('Unable to create the PDF. Please try again.');
  } finally {
    if (pdfExecutiveOverview) {
      pdfExecutiveOverview.overview.remove();
      pdfExecutiveOverview.benchmarkPanel.style.display = '';
    }
    hiddenButtons.forEach(function(entry) { entry.button.style.display = entry.display; });
    if (exportButton) {
      exportButton.disabled = false;
      exportButton.textContent = exportButtonText;
    }
  }
}

function tcoFmtFte(n) {
  return Math.round(n || 0).toLocaleString('en-US');
}

// US/India delivery split leaves (FTE count) for a tower row, omitted where the source tables don't split by location.
function tcoFteSplitLeaves(usFte, indiaFte) {
  return [
    { label: 'US Delivery', fte: usFte },
    { label: 'India Delivery', fte: indiaFte }
  ];
}

// Assembles every tower's total FTE count plus (where available) its US/India delivery split.
function tcoGetFteTowers() {
  var distributedUs = getManagedServicesSummaryFromTable('#ms-us-tbody', 3, 6).fte;
  var distributedIndia = getManagedServicesSummaryFromTable('#ms-india-tbody', 3, 6).fte;
  var midrangeUs = getManagedServicesSummaryFromTable('#midrange-ms-us-tbody', 3, 6).fte;
  var midrangeIndia = getManagedServicesSummaryFromTable('#midrange-ms-india-tbody', 3, 6).fte;
  var storageUs = getManagedServicesSummaryFromTable('#storage-ms-store-us-tbody', 4, 7).fte;
  var storageIndia = getManagedServicesSummaryFromTable('#storage-ms-store-india-tbody', 4, 7).fte;
  var backupUs = getManagedServicesSummaryFromTable('#storage-ms-backup-us-tbody', 4, 7).fte;
  var backupIndia = getManagedServicesSummaryFromTable('#storage-ms-backup-india-tbody', 4, 7).fte;
  var mainframeUs = getDbmwStyleTowerLocationFte('#mf-ms-us-panel-body');
  var mainframeIndia = getDbmwStyleTowerLocationFte('#mf-ms-india-panel-body');
  var mainframeFte = getDbmwStyleTowerFte('#mf-ms-us-panel-body');
  var databaseUs = getDbmwStyleTowerLocationFte('#dbmw-database-us-panel-body');
  var databaseIndia = getDbmwStyleTowerLocationFte('#dbmw-database-india-panel-body');
  var databaseFte = getDbmwStyleTowerFte('#dbmw-database-us-panel-body');
  var middlewareUs = getDbmwStyleTowerLocationFte('#dbmw-middleware-us-panel-body');
  var middlewareIndia = getDbmwStyleTowerLocationFte('#dbmw-middleware-india-panel-body');
  var middlewareFte = getDbmwStyleTowerFte('#dbmw-middleware-us-panel-body');
  var networkFte = getManagedServicesSummaryFromTable('#network-ms-fte-tbody', 1, 1).fte;
  var securityFte = getManagedServicesSummaryFromTable('#security-ms-fte-tbody', 1, 1).fte;

  var towers = [
    { label: 'DISTRIBUTED SERVERS', fte: distributedUs + distributedIndia, leaves: tcoFteSplitLeaves(distributedUs, distributedIndia) },
    { label: 'MIDRANGE SERVERS', fte: midrangeUs + midrangeIndia, leaves: tcoFteSplitLeaves(midrangeUs, midrangeIndia) },
    { label: 'STORAGE', fte: storageUs + storageIndia, leaves: tcoFteSplitLeaves(storageUs, storageIndia) },
    { label: 'BACKUP', fte: backupUs + backupIndia, leaves: tcoFteSplitLeaves(backupUs, backupIndia) },
    { label: 'MAINFRAME', fte: mainframeFte, leaves: tcoFteSplitLeaves(mainframeUs, mainframeIndia) },
    { label: 'DATABASE', fte: databaseFte, leaves: tcoFteSplitLeaves(databaseUs, databaseIndia) },
    { label: 'MIDDLEWARE', fte: middlewareFte, leaves: tcoFteSplitLeaves(middlewareUs, middlewareIndia) },
    { label: 'NETWORK', fte: networkFte },
    { label: 'SECURITY', fte: securityFte }
  ];

  // Governance FTE allocation mirrors the Overlays/Cross Functional Services 20% ceil'd share.
  var subtotalFte = towers.reduce(function(s, t) { return s + t.fte; }, 0);
  towers.push({ label: 'SERVICES MANAGEMENT (SMO/PMO)', fte: Math.ceil(subtotalFte * 0.20) });

  return towers;
}

function buildTCOFteCard() {
  var tbody = document.getElementById('tco-fte-tbody');
  if (!tbody) return;

  var towers = tcoGetFteTowers();
  var hasAny = towers.some(function(t) { return t.fte > 0; });
  if (!hasAny) {
    tbody.innerHTML = '<tr><td colspan="7" class="ms-loading">Configure towers above to calculate FTE counts...</td></tr>';
    return;
  }

  function sameSeries(v) { return [v, v, v, v, v]; }

  var totalFte = towers.reduce(function(s, t) { return s + t.fte; }, 0);
  var fteGroupId = 'tco-fte-group';
  var html = '';

  html += tcoRowHtml({ label: 'ESTIMATED IN-SCOPE FTE', series: sameSeries(totalFte), total: totalFte, rowClass: 'tco-full-stack', formatter: tcoFmtFte });

  towers.forEach(function(t, idx) {
    var altClass = (idx % 2 === 1) ? ' tco-alt' : '';
    var hasLeaves = t.leaves && t.leaves.length;
    var towerGroupId = fteGroupId + '-' + idx;
    html += tcoRowHtml({
      label: t.label, series: sameSeries(t.fte), total: t.fte, rowClass: 'tco-subsection' + altClass,
      indent: 1, toggleGroup: hasLeaves ? towerGroupId : null, formatter: tcoFmtFte
    });
    if (hasLeaves) {
      t.leaves.forEach(function(leaf) {
        html += tcoRowHtml({
          label: leaf.label, series: sameSeries(leaf.fte), total: leaf.fte, rowClass: 'tco-leaf',
          extraClasses: towerGroupId, indent: 2, formatter: tcoFmtFte
        });
      });
    }
  });

  tbody.innerHTML = html;
}

function buildTCOOperationalMetrics() {
  var tbody = document.getElementById('tco-operational-metrics-tbody');
  if (!tbody) return;

  function metricText(id, fallback) {
    var el = document.getElementById(id);
    var text = el ? (el.textContent || '').trim() : '';
    return text || fallback || '0';
  }

  function parseMetricValue(value) {
    var n = parseFloat(String(value || '').replace(/[^0-9.\-]/g, ''));
    return isNaN(n) ? 0 : n;
  }

  function formatMetricValue(n, isCurrency) {
    return isCurrency ? ('$' + Math.round(n || 0).toLocaleString('en-US')) : Math.round(n || 0).toLocaleString('en-US');
  }

  function isGrowthMetric(label) {
    return /Managed Services|Software|VMware/i.test(label);
  }

  function isInfrastructureMetric(label) {
    return /Infrastructure|Datacenter Cost/i.test(label);
  }

  function isDatacenterKwGrowthMetric(label) {
    return label === 'Monthly Datacenter Cost / KW';
  }

  function row(label, value) {
    var numericValue = parseMetricValue(value);
    var isCurrency = String(value || '').indexOf('$') !== -1;
    var growthMetric = isCurrency && ((isGrowthMetric(label) && !isInfrastructureMetric(label)) || isDatacenterKwGrowthMetric(label));
    var eciEl = document.getElementById('eci');
    var eciPct = parseFloat(eciEl ? eciEl.value : 0) || 0;
    var yearValues = [numericValue, numericValue, numericValue, numericValue, numericValue];
    if (growthMetric) {
      for (var y = 1; y < 5; y++) yearValues[y] = yearValues[y - 1] * (1 + eciPct / 100);
    }

    var growthStyle = 'background:#eef3f9; color:#15385b; font-weight:700;';
    var normalStyle = 'background:#fbfcfe;';
    var cells = '<td style="text-align:left; font-weight:600; background:#fbfcfe;">' + label + '</td>';
    for (var i = 0; i < 5; i++) {
      var style = growthMetric && i > 0 && eciPct !== 0 ? growthStyle : normalStyle;
      cells += '<td style="' + style + '">' + formatMetricValue(yearValues[i], isCurrency) + '</td>';
    }
    var averageValue = yearValues.reduce(function(sum, n) { return sum + n; }, 0) / yearValues.length;
    var averageStyle = growthMetric && eciPct !== 0 ? growthStyle : 'background:#fbfcfe; font-weight:700; color:#003366;';
    cells += '<td style="' + averageStyle + '">' + formatMetricValue(averageValue, isCurrency) + '</td>';
    return '<tr>' +
      cells +
    '</tr>';
  }

  function section(label) {
    return '<tr class="tco-subsection">' +
      '<td style="text-align:left; font-weight:700; text-transform:uppercase;">' + label + '</td>' +
      '<td></td><td></td><td></td><td></td><td></td><td></td>' +
    '</tr>';
  }

  var sections = [
    { label: 'Distributed Servers', metrics: [
      ['Total no of Servers', 'ms-total-servers-meta'],
      ['Monthly Managed Services Cost / Server', 'ms-monthly-per-server'],
      ['Monthly Infrastructure Cost / Server', 'infra-monthly-per-server'],
      ['Monthly VMware Cost / Virtual Server', 'vmware-monthly-per-vs']
    ]},
    { label: 'Midrange Servers', metrics: [
      ['Total no of Servers', 'midrange-ms-total-servers-meta'],
      ['Monthly Managed Services Cost / Server', 'midrange-ms-monthly-per-server'],
      ['Monthly Infrastructure Cost / Server', 'midrange-infra-monthly-per-server'],
      ['Monthly OS Software Charges / Server', 'swma-monthly-per-server']
    ]},
    { label: 'Storage', metrics: [
      ['Total Storage in TB', 'storage-ms-store-total-tb'],
      ['Monthly Storage Managed Services Cost / TB', 'storage-ms-store-monthly-per-tb'],
      ['Monthly Storage Infrastructure Cost / TB', 'storage-infra-monthly-per-tb']
    ]},
    { label: 'Backup', metrics: [
      ['Total Backup Storage TB', 'storage-infra-bsc-total-tb-meta'],
      ['Total Front End Protected TB', 'storage-infra-fep-total-tb-meta'],
      ['Monthly Backup Managed Services Cost / TB', 'storage-ms-backup-monthly-per-tb'],
      ['Monthly Backup Storage Infrastructure Cost / TB', 'storage-infra-bsc-monthly-per-tb'],
      ['Monthly Software Cost / FEP TB', 'storage-infra-fep-monthly-per-tb']
    ]},
    { label: 'Network', metrics: [
      ['Total no of Servers', 'network-infra-total-servers-meta'],
      ['Monthly Network Infrastructure Cost / Server OS', 'network-infra-monthly-per-server'],
      ['Monthly Network Managed Services Cost / Server', 'network-ms-monthly-per-server']
    ]},
    { label: 'Security', metrics: [
      ['Total no of Servers', 'security-ms-total-servers-meta'],
      ['Monthly Security Managed Services Cost / Server', 'security-ms-monthly-per-server']
    ]},
    { label: 'Database', metrics: [
      ['Total Database Instances', 'dbmw-database-total-instances'],
      ['Monthly Database Managed Services Cost / Instance', 'dbmw-database-monthly-per-instance']
    ]},
    { label: 'Middleware', metrics: [
      ['Total Middleware Instances', 'dbmw-middleware-total-instances'],
      ['Monthly Middleware Managed Services Cost / Instance', 'dbmw-middleware-monthly-per-instance']
    ]},
    { label: 'Mainframe', metrics: [
      ['Total MIPS', 'mf-ms-total-mips-meta'],
      ['Monthly Mainframe Managed Services Cost / MIPS', 'mf-ms-monthly-per-mips'],
      ['Monthly Mainframe Infrastructure Cost / MIPS', 'mf-infra-monthly-per-mips']
    ]},
    { label: 'Datacenter', metrics: [
      ['Total KWs', 'dc-total-kw-meta'],
      ['Total Rack', 'dc-total-rack-meta'],
      ['Monthly Datacenter Cost / KW', 'dc-monthly-per-kw'],
      ['Monthly Datacenter Cost / Rack', 'dc-monthly-per-rack']
    ]}
  ];

  var html = '';
  sections.forEach(function(group) {
    html += section(group.label);
    group.metrics.forEach(function(metric) {
      html += row(metric[0], metricText(metric[1]));
    });
  });
  tbody.innerHTML = html;
}



/* ══════════════════════════════════════════════════════
   US / INDIA DELIVERY SYNC
══════════════════════════════════════════════════════ */
function syncDelivery(changed) {
  var usInput    = document.getElementById('usDelivery');
  var indiaInput = document.getElementById('indiaDelivery');
  var usVal      = parseFloat(usInput.value);
  var indiaVal   = parseFloat(indiaInput.value);

  if (changed === 'us') {
    if (isNaN(usVal) || usVal < 0) usVal = 0;
    if (usVal > 100)               usVal = 100;
    usInput.value    = usVal;
    indiaInput.value = 100 - usVal;
  } else {
    if (isNaN(indiaVal) || indiaVal < 0) indiaVal = 0;
    if (indiaVal > 100)                  indiaVal = 100;
    indiaInput.value = indiaVal;
    usInput.value    = 100 - indiaVal;
  }

  updateAllManagedServicesSizing();
}

function updateAllManagedServicesSizing() {
  updateManagedServicesSizing();
  updateMidrangeMSSizing();
  calcStorageMSSizing();
  calcMainframeMSSizing();
  calcDbMwManagedServicesSizing();
  updateNetworkMSSizing();
  if (typeof buildTCOFteCard === 'function') buildTCOFteCard();
  if (typeof buildTCOAnalysis === 'function') buildTCOAnalysis();
  if (typeof buildExecutiveBrief === 'function') buildExecutiveBrief();
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   TOWER CARD TOGGLE
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
// Toggle visibility of tower card based on checkbox state
function toggleTowerCard(towerId) {
  console.log('toggleTowerCard called with:', towerId);
  var checkbox = document.getElementById(towerId);
  var card     = document.getElementById('card-' + towerId);
  
  console.log('Checkbox found:', !!checkbox, 'Card found:', !!card);
  
  if (!checkbox || !card) {
    console.warn('Tower element missing: ' + towerId);
    return;
  }
  
  console.log('Checkbox checked:', checkbox.checked);
  
  if (checkbox.checked) {
    console.log('Setting display to block');
    card.style.setProperty('display', 'block', 'important');
  } else {
    console.log('Setting display to none');
    card.style.setProperty('display', 'none', 'important');
  }
  
  console.log('Card display after toggle:', card.style.display);
  updateNetworkInfraSizing();
}

// Initialize all tower card visibility based on checkbox states
function initializeTowerCards() {
  var allTowerIds = [
    'tower-compute',
    'tower-midrange',
    'tower-storage',
    'tower-database',
    'tower-mainframe',
    'tower-datacenter'
  ];
  
  allTowerIds.forEach(function(towerId) {
    toggleTowerCard(towerId);
  });
  // Handle the combined Network + Security checkbox
  toggleNetworkSecurityCard();
}

function toggleNetworkSecurityCard() {
  var cb = document.getElementById('tower-network-security');
  var checked = cb ? cb.checked : false;
  ['tower-network', 'tower-security'].forEach(function(id) {
    var card = document.getElementById('card-' + id);
    if (card) {
      if (checked) {
        card.style.setProperty('display', 'block', 'important');
      } else {
        card.style.setProperty('display', 'none', 'important');
      }
    }
  });
  updateNetworkInfraSizing();
  updateNetworkMSSizing();
  updateSecurityMSSizing();
}

function parseCurrencyNumber(value) {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  var cleaned = String(value)
    .replace(/[$,\s]/g, '')
    .replace(/[()]/g, '-')
    .replace(/[–—]/g, '-')
    .replace(/[^0-9.\-]/g, '');
  if (!cleaned || cleaned === '-' || cleaned === '-.' || cleaned === '.-') return 0;
  var parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function formatMoneyValue(value, decimals) {
  var numeric = Number(value) || 0;
  var digits = decimals === undefined ? 2 : decimals;
  return '$' + numeric.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}

function toggleNetworkInfraSizing() {
  var body = document.getElementById('network-infra-sizing-body');
  var arrow = document.getElementById('network-infra-sizing-arrow');
  var label = document.getElementById('network-infra-sizing-label');
  var collapsed = document.getElementById('network-infra-collapsed-total');
  if (!body) return;

  var isCollapsed = body.style.display === 'none';
  if (isCollapsed) {
    body.style.display = 'block';
    if (arrow) arrow.style.transform = 'rotate(0deg)';
    if (label) label.textContent = 'Collapse';
    if (collapsed) collapsed.style.display = 'none';
  } else {
    body.style.display = 'none';
    if (arrow) arrow.style.transform = 'rotate(-90deg)';
    if (label) label.textContent = 'Expand';
    if (collapsed) {
      var totalValue = document.getElementById('network-infra-total-value');
      var collapsedValue = document.getElementById('network-infra-collapsed-total-value');
      if (totalValue && collapsedValue) collapsedValue.textContent = totalValue.textContent;
      collapsed.style.display = 'inline-flex';
    }
  }
}

function updateNetworkInfraSizing() {
  var section = document.getElementById('network-infra-sizing-section');
  if (!section) return;

  var networkCb = document.getElementById('tower-network-security');
  var checked = networkCb ? networkCb.checked : false;
  if (!checked) {
    section.style.display = 'none';
    return;
  }

  function getAnnualText(id) {
    var el = document.getElementById(id);
    return parseCurrencyNumber(el ? el.textContent : '0');
  }

  var computeCb = document.getElementById('tower-compute');
  var midrangeCb = document.getElementById('tower-midrange');
  var storageCb = document.getElementById('tower-storage');

  var computeAnnual = computeCb && computeCb.checked ? getAnnualText('infra-total-value') + getAnnualText('vmware-total-annual') : 0;
  var midrangeAnnual = midrangeCb && midrangeCb.checked ? getAnnualText('midrange-infra-total-value') + getAnnualText('swma-total-annual-value') : 0;
  var storageAnnual = storageCb && storageCb.checked ? getAnnualText('storage-infra-total-value') : 0;

  var rows = [];
  if (computeCb && computeCb.checked && computeAnnual > 0) {
    rows.push({ label: 'Distributed Services: Compute (Infrastructure & SW)', annual: computeAnnual, monthly: computeAnnual / 12 });
  }
  if (midrangeCb && midrangeCb.checked && midrangeAnnual > 0) {
    rows.push({ label: 'Midrange: Compute (Infrastructure & SW)', annual: midrangeAnnual, monthly: midrangeAnnual / 12 });
  }
  if (storageCb && storageCb.checked && storageAnnual > 0) {
    rows.push({ label: 'Storage and Backup (Infrastructure & SW)', annual: storageAnnual, monthly: storageAnnual / 12 });
  }

  var subtotalAnnual = rows.reduce(function(sum, row) { return sum + row.annual; }, 0);
  var subtotalMonthly = subtotalAnnual / 12;
  var networkAnnual = subtotalAnnual * 0.12;
  var networkMonthly = networkAnnual / 12;

  var computeTbody = document.getElementById('network-infra-compute-tbody');
  var totalBanner = document.getElementById('network-infra-total-value');
  var collapsedBanner = document.getElementById('network-infra-collapsed-total-value');
  var totalServersMeta = document.getElementById('network-infra-total-servers-meta');
  var monthlyPerServerMeta = document.getElementById('network-infra-monthly-per-server');
  var annualPerServerMeta = document.getElementById('network-infra-annual-per-server');

  if (!rows.length || subtotalAnnual <= 0) {
    section.style.display = 'none';
    setLiveSizingSectionVisible('network-infra-sizing-section', false);
    if (computeTbody) computeTbody.innerHTML = '<tr><td colspan="5" class="ms-loading">Select applicable towers to see Network Infrastructure cost</td></tr>';
    if (totalBanner) totalBanner.textContent = '$0';
    var networkInfraMonthlyEl = document.getElementById('network-infra-total-monthly-value');
    if (networkInfraMonthlyEl) networkInfraMonthlyEl.textContent = '$0';
    if (collapsedBanner) collapsedBanner.textContent = '$0';
    if (totalServersMeta) totalServersMeta.textContent = '0';
    if (monthlyPerServerMeta) monthlyPerServerMeta.textContent = '$0';
    if (annualPerServerMeta) annualPerServerMeta.textContent = '$0';
    return;
  }

  section.style.display = 'block';
  setLiveSizingSectionVisible('network-infra-sizing-section', true);

  if (computeTbody) {
    var rowHtml = '';
    rows.forEach(function(row) {
      var rowNetwork = row.annual * 0.12;
      rowHtml += '<tr>' +
        '<td>' + row.label + '</td>' +
        '<td>' + formatMoneyValue(row.annual, 0) + '</td>' +
        '<td>' + formatMoneyValue(row.monthly, 0) + '</td>' +
        '<td>' + formatMoneyValue(rowNetwork, 0) + '</td>' +
        '<td>' + formatMoneyValue(row.annual, 0) + '</td>' +
      '</tr>';
    });

    var subtotalNetwork = subtotalAnnual * 0.12;
    rowHtml += '<tr class="ms-subtotal-row">' +
      '<td style="text-align:left;"><strong>SUBTOTAL</strong></td>' +
      '<td><strong>' + formatMoneyValue(subtotalAnnual, 0) + '</strong></td>' +
      '<td><strong>' + formatMoneyValue(subtotalMonthly, 0) + '</strong></td>' +
      '<td><strong>' + formatMoneyValue(subtotalNetwork, 0) + '</strong></td>' +
      '<td><strong>' + formatMoneyValue(subtotalAnnual, 0) + '</strong></td>' +
    '</tr>';

    rowHtml += '<tr class="ms-subtotal-row">' +
      '<td style="text-align:left; font-weight:700;"><strong>NETWORK INFRASTRUCTURE COST (12%)</strong></td>' +
      '<td><strong>' + formatMoneyValue(networkAnnual, 0) + '</strong></td>' +
      '<td><strong>' + formatMoneyValue(networkMonthly, 0) + '</strong></td>' +
      '<td><strong>' + formatMoneyValue(networkAnnual, 0) + '</strong></td>' +
      '<td style="color:#22c55e; font-weight:700;"><strong>' + formatMoneyValue(networkAnnual, 0) + '</strong></td>' +
    '</tr>';
    computeTbody.innerHTML = rowHtml;
  }

  if (totalBanner) totalBanner.textContent = formatMoneyValue(networkAnnual, 0);
  var networkInfraMonthlyEl = document.getElementById('network-infra-total-monthly-value');
  if (networkInfraMonthlyEl) networkInfraMonthlyEl.textContent = formatMoneyValue(networkMonthly, 0);
  if (collapsedBanner) collapsedBanner.textContent = formatMoneyValue(networkAnnual, 0);

  var distributedServers = computeCb && computeCb.checked ? readNumericDisplay('compute-total-servers') : 0;
  var midrangeServers = midrangeCb && midrangeCb.checked ? readNumericDisplay('midrange-total-servers') : 0;
  var totalNetworkServerOs = distributedServers + midrangeServers;
  var monthlyPerServer = totalNetworkServerOs > 0 ? networkMonthly / totalNetworkServerOs : 0;
  var annualPerServer = totalNetworkServerOs > 0 ? networkAnnual / totalNetworkServerOs : 0;
  if (totalServersMeta) totalServersMeta.textContent = Math.round(totalNetworkServerOs).toLocaleString('en-US');
  if (monthlyPerServerMeta) monthlyPerServerMeta.textContent = formatMoneyValue(monthlyPerServer, 0);
  if (annualPerServerMeta) annualPerServerMeta.textContent = formatMoneyValue(annualPerServer, 0);

  updateNetworkMSSizing();
}

function getManagedServicesSummaryFromTable(selector, fteIndex, annualIndex) {
  var tbody = document.querySelector(selector);
  if (!tbody) return { fte: 0, annual: 0 };

  var totalFte = 0;
  var totalAnnual = 0;
  var lastSubtotal = null;

  tbody.querySelectorAll('tr').forEach(function(row) {
    if (row.classList.contains('ms-subtotal-row')) {
      lastSubtotal = row;
    }
  });

  if (lastSubtotal) {
    var cells = lastSubtotal.querySelectorAll('td');
    if (cells[fteIndex]) {
      var fteText = cells[fteIndex].textContent.replace(/[^0-9.]/g, '');
      totalFte = parseFloat(fteText) || 0;
    }
    if (cells[annualIndex]) {
      totalAnnual = parseCurrencyNumber(cells[annualIndex].textContent);
    }
  }

  return { fte: totalFte, annual: totalAnnual };
}

function toggleNetworkMSSizing() {
  var body = document.getElementById('network-ms-sizing-body');
  var arrow = document.getElementById('network-ms-sizing-arrow');
  var label = document.getElementById('network-ms-sizing-label');
  var collapsedTotal = document.getElementById('network-ms-collapsed-total');
  if (!body) return;

  var isCollapsed = body.style.display === 'none';
  if (isCollapsed) {
    body.style.display = 'block';
    if (arrow) arrow.style.transform = 'rotate(0deg)';
    if (label) label.textContent = 'Collapse';
    if (collapsedTotal) collapsedTotal.style.display = 'none';
  } else {
    body.style.display = 'none';
    if (arrow) arrow.style.transform = 'rotate(-90deg)';
    if (label) label.textContent = 'Expand';
    if (collapsedTotal) {
      var bannerVal = document.getElementById('network-ms-total-value');
      var collapsedValue = document.getElementById('network-ms-collapsed-total-value');
      if (bannerVal && collapsedValue) collapsedValue.textContent = bannerVal.textContent;
      collapsedTotal.style.display = 'inline-flex';
    }
  }
}

function getDerivedNetworkFte() {
  var tbody = document.getElementById('network-ms-fte-tbody');
  if (!tbody) return 0;

  var rows = tbody.querySelectorAll('tr');
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var text = (row.textContent || '').replace(/\s+/g, ' ').trim();
    if (text.indexOf('Network FTEs') !== -1) {
      var cells = row.querySelectorAll('td');
      if (cells.length > 1) {
        var parsed = parseFloat((cells[1].textContent || '').replace(/[^0-9.]/g, ''));
        return isNaN(parsed) ? 0 : parsed;
      }
      var match = text.match(/Network FTEs\s*([0-9.]+)/i);
      if (match && match[1]) return parseFloat(match[1]) || 0;
    }
  }
  return 0;
}

function toggleSecurityMSSizing() {
  var body = document.getElementById('security-ms-sizing-body');
  var arrow = document.getElementById('security-ms-sizing-arrow');
  var label = document.getElementById('security-ms-sizing-label');
  var collapsedTotal = document.getElementById('security-ms-collapsed-total');
  if (!body) return;

  var isCollapsed = body.style.display === 'none';
  if (isCollapsed) {
    body.style.display = 'block';
    if (arrow) arrow.style.transform = 'rotate(0deg)';
    if (label) label.textContent = 'Collapse';
    if (collapsedTotal) collapsedTotal.style.display = 'none';
  } else {
    body.style.display = 'none';
    if (arrow) arrow.style.transform = 'rotate(-90deg)';
    if (label) label.textContent = 'Expand';
    if (collapsedTotal) {
      var bannerVal = document.getElementById('security-ms-total-value');
      var collapsedValue = document.getElementById('security-ms-collapsed-total-value');
      if (bannerVal && collapsedValue) collapsedValue.textContent = bannerVal.textContent;
      collapsedTotal.style.display = 'inline-flex';
    }
  }
}

function getDeliveryMix() {
  var usEl = document.getElementById('usDelivery');
  var indiaEl = document.getElementById('indiaDelivery');
  var usVal = parseFloat(usEl ? usEl.value : 70);
  var indiaVal = parseFloat(indiaEl ? indiaEl.value : 30);
  var usPct = (isNaN(usVal) ? 70 : Math.max(0, Math.min(100, usVal))) / 100;
  var indiaPct = (isNaN(indiaVal) ? 30 : Math.max(0, Math.min(100, indiaVal))) / 100;
  return {
    usPct: usPct,
    indiaPct: indiaPct
  };
}

function extractManagedServicesMonthlyRate(matchFn, locationKey, fallbackRate) {
  var resolved = fallbackRate;

  document.querySelectorAll('#ms-rates-tbody tr').forEach(function(row) {
    var cells = row.querySelectorAll('td');
    if (cells.length < 7 || cells[0].getAttribute('colspan')) return;

    var tower = (cells[0].textContent || '').trim().toLowerCase();
    var description = (cells[1].textContent || '').trim().toLowerCase();
    var deliveredFrom = (cells[3].textContent || '').trim().toLowerCase();
    var rate = parseCurrencyNumber(cells[4].textContent || '0');
    if (rate <= 0) return;

    var rowLocation = deliveredFrom.indexOf('india') !== -1 ? 'india'
      : (deliveredFrom.indexOf('united states') !== -1 ? 'us' : '');
    if (!rowLocation || rowLocation !== locationKey) return;
    if (!matchFn(tower, description)) return;

    resolved = rate;
  });

  return resolved;
}

function extractManagedServicesDiscountedRate(matchFn, locationKey, fallbackRate) {
  var resolved = fallbackRate;

  document.querySelectorAll('#ms-rates-tbody tr').forEach(function(row) {
    var cells = row.querySelectorAll('td');
    if (cells.length < 7 || cells[0].getAttribute('colspan')) return;

    var tower = (cells[0].textContent || '').trim().toLowerCase();
    var description = (cells[1].textContent || '').trim().toLowerCase();
    var deliveredFrom = (cells[3].textContent || '').trim().toLowerCase();
    var rate = parseCurrencyNumber((cells[6] ? cells[6].textContent : '0'));
    if (rate <= 0) return;

    var rowLocation = deliveredFrom.indexOf('india') !== -1 ? 'india'
      : (deliveredFrom.indexOf('united states') !== -1 ? 'us' : '');
    if (!rowLocation || rowLocation !== locationKey) return;
    if (!matchFn(tower, description)) return;

    resolved = rate;
  });

  return resolved;
}

function extractNetworkSecurityBlendedRates() {
  var delivery = getDeliveryMix();

  var networkUsRate = extractManagedServicesMonthlyRate(function(tower, description) {
    return tower === 'complex switch' || description === 'managed switch - complex';
  }, 'us', 19055.38);
  var networkIndiaRate = extractManagedServicesMonthlyRate(function(tower, description) {
    return tower === 'complex switch' || description === 'managed switch - complex';
  }, 'india', 5422.22);

  var securityUsRate = extractManagedServicesMonthlyRate(function(tower, description) {
    return tower === 'security' || description === 'security services';
  }, 'us', 25916.57);
  var securityIndiaRate = extractManagedServicesMonthlyRate(function(tower, description) {
    return tower === 'security' || description === 'security services';
  }, 'india', 7725.58);

  var networkUsBlended = networkUsRate * delivery.usPct;
  var networkIndiaBlended = networkIndiaRate * delivery.indiaPct;
  var securityUsBlended = securityUsRate * delivery.usPct;
  var securityIndiaBlended = securityIndiaRate * delivery.indiaPct;

  return {
    usPct: delivery.usPct,
    indiaPct: delivery.indiaPct,
    networkUsRate: networkUsRate,
    networkIndiaRate: networkIndiaRate,
    securityUsRate: securityUsRate,
    securityIndiaRate: securityIndiaRate,
    networkUsBlended: networkUsBlended,
    networkIndiaBlended: networkIndiaBlended,
    securityUsBlended: securityUsBlended,
    securityIndiaBlended: securityIndiaBlended,
    networkTotalBlendedRate: networkUsBlended + networkIndiaBlended,
    securityTotalBlendedRate: securityUsBlended + securityIndiaBlended
  };
}

function updateNetworkMSSizing() {
  var section = document.getElementById('network-ms-sizing-section');
  if (!section) return;

  var networkCb = document.getElementById('tower-network-security');
  var checked = networkCb ? networkCb.checked : false;
  if (!checked) {
    section.style.display = 'none';
    return;
  }

  var distributedAnnual = parseCurrencyNumber(document.getElementById('ms-total-value') ? document.getElementById('ms-total-value').textContent : '0');
  var midrangeAnnual = parseCurrencyNumber(document.getElementById('midrange-ms-total-value') ? document.getElementById('midrange-ms-total-value').textContent : '0');
  var storageAnnual = parseCurrencyNumber(document.getElementById('storage-ms-total-value') ? document.getElementById('storage-ms-total-value').textContent : '0');

  var distributedSummary = {
    fte: 0,
    annual: distributedAnnual
  };
  var midrangeSummary = {
    fte: 0,
    annual: midrangeAnnual
  };
  var storageSummary = {
    fte: 0,
    annual: storageAnnual
  };

  var distributedUs = getManagedServicesSummaryFromTable('#ms-us-tbody', 3, 6);
  var distributedIndia = getManagedServicesSummaryFromTable('#ms-india-tbody', 3, 6);
  distributedSummary.fte = distributedUs.fte + distributedIndia.fte;

  var midrangeUs = getManagedServicesSummaryFromTable('#midrange-ms-us-tbody', 3, 6);
  var midrangeIndia = getManagedServicesSummaryFromTable('#midrange-ms-india-tbody', 3, 6);
  midrangeSummary.fte = midrangeUs.fte + midrangeIndia.fte;

  // Storage and Backup subtotal rows expose the country-specific FTE in column 4,
  // while column 3 is the combined total FTE. Reading column 3 doubles the values
  // in the Network FTE derivation (e.g. 2 -> 4, 5 -> 10).
  var storageStoreUs = getManagedServicesSummaryFromTable('#storage-ms-store-us-tbody', 4, 7);
  var storageStoreIndia = getManagedServicesSummaryFromTable('#storage-ms-store-india-tbody', 4, 7);
  var backupUs = getManagedServicesSummaryFromTable('#storage-ms-backup-us-tbody', 4, 7);
  var backupIndia = getManagedServicesSummaryFromTable('#storage-ms-backup-india-tbody', 4, 7);

  var storageFte = storageStoreUs.fte + storageStoreIndia.fte;
  var backupFte = backupUs.fte + backupIndia.fte;
  var storageComponentAnnual = storageStoreUs.annual + storageStoreIndia.annual;
  var backupComponentAnnual = backupUs.annual + backupIndia.annual;

  storageSummary.fte = storageFte + backupFte;

  var totalFte = distributedSummary.fte + midrangeSummary.fte + storageFte + backupFte;
  var totalManagedAnnual = distributedAnnual + midrangeAnnual + storageComponentAnnual + backupComponentAnnual;
  var networkInfraAnnual = parseCurrencyNumber(document.getElementById('network-infra-total-value') ? document.getElementById('network-infra-total-value').textContent : '0');
  var networkManagedAnnual = networkInfraAnnual * 0.20;
  var networkManagedMonthly = networkManagedAnnual / 12;
  var delivery = getDeliveryMix();
  var usComplexSwitchDiscountedRate = extractManagedServicesDiscountedRate(function(tower, description) {
    return tower === 'complex switch' || description === 'managed switch - complex';
  }, 'us', 11910);
  var indiaComplexSwitchDiscountedRate = extractManagedServicesDiscountedRate(function(tower, description) {
    return tower === 'complex switch' || description === 'managed switch - complex';
  }, 'india', 3389);
  var usBlendedRate = usComplexSwitchDiscountedRate * delivery.usPct;
  var indiaBlendedRate = indiaComplexSwitchDiscountedRate * delivery.indiaPct;
  var totalBlendedRate = usBlendedRate + indiaBlendedRate;
  var networkFte = totalBlendedRate > 0 ? (networkManagedMonthly / totalBlendedRate) : 0;
  var networkFteDisplay = Math.ceil(networkFte);

  var totalBanner = document.getElementById('network-ms-total-value');
  var collapsedBanner = document.getElementById('network-ms-collapsed-total-value');
  var totalServersMeta = document.getElementById('network-ms-total-servers-meta');
  var monthlyPerServerMeta = document.getElementById('network-ms-monthly-per-server');
  var annualPerServerMeta = document.getElementById('network-ms-annual-per-server');
  var laborTbody = document.getElementById('network-ms-labor-tbody');
  var fteTbody = document.getElementById('network-ms-fte-tbody');

  if (!checked || totalManagedAnnual <= 0 || networkInfraAnnual <= 0 || totalBlendedRate <= 0) {
    section.style.display = 'none';
    setLiveSizingSectionVisible('network-ms-sizing-section', false);
    if (laborTbody) laborTbody.innerHTML = '<tr><td colspan="3" class="ms-loading">No managed services totals available…</td></tr>';
    if (fteTbody) fteTbody.innerHTML = '<tr><td colspan="4" class="ms-loading">No managed services totals available…</td></tr>';
    if (totalBanner) totalBanner.textContent = '$0';
    var networkMsMonthlyEl = document.getElementById('network-ms-total-monthly-value');
    if (networkMsMonthlyEl) networkMsMonthlyEl.textContent = '$0';
    if (collapsedBanner) collapsedBanner.textContent = '$0';
    if (totalServersMeta) totalServersMeta.textContent = '0';
    if (monthlyPerServerMeta) monthlyPerServerMeta.textContent = '$0';
    if (annualPerServerMeta) annualPerServerMeta.textContent = '$0';
    return;
  }

  section.style.display = 'block';
  setLiveSizingSectionVisible('network-ms-sizing-section', true);

  function fmtPct(value) {
    return (value * 100).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }) + '%';
  }

  if (laborTbody) {
    laborTbody.innerHTML =
      '<tr>' +
        '<td style="text-align:left;"></td>' +
        '<td style="text-align:center; font-weight:700;">Annual Cost</td>' +
        '<td style="text-align:center; font-weight:700;">Monthly Cost</td>' +
      '</tr>' +
      '<tr>' +
        '<td style="text-align:left; font-weight:600;">Network Infrastructure Cost</td>' +
        '<td style="text-align:right;">' + formatMoneyValue(networkInfraAnnual, 0) + '</td>' +
        '<td style="text-align:right;"></td>' +
      '</tr>' +
      '<tr>' +
        '<td style="text-align:left; font-weight:600;">Network Labor Cost as a % of Network Infrastructure</td>' +
        '<td style="text-align:right;">20%</td>' +
        '<td style="text-align:right;"></td>' +
      '</tr>' +
      '<tr class="ms-subtotal-row">' +
        '<td style="text-align:left; font-weight:700;"><strong>Network Labor Cost</strong></td>' +
        '<td style="text-align:right;"><strong>' + formatMoneyValue(networkManagedAnnual, 0) + '</strong></td>' +
        '<td style="text-align:right;"><strong>' + formatMoneyValue(networkManagedMonthly, 0) + '</strong></td>' +
      '</tr>';
  }

  if (fteTbody) {
    fteTbody.innerHTML =
      '<tr>' +
        '<td style="text-align:left;">Network Labor (US)</td>' +
        '<td style="text-align:right;">' + formatMoneyValue(usComplexSwitchDiscountedRate, 0) + '</td>' +
        '<td style="text-align:center;">' + fmtPct(delivery.usPct) + '</td>' +
        '<td style="text-align:right;">' + formatMoneyValue(usBlendedRate, 0) + '</td>' +
      '</tr>' +
      '<tr>' +
        '<td style="text-align:left;">Network Labor (India)</td>' +
        '<td style="text-align:right;">' + formatMoneyValue(indiaComplexSwitchDiscountedRate, 0) + '</td>' +
        '<td style="text-align:center;">' + fmtPct(delivery.indiaPct) + '</td>' +
        '<td style="text-align:right;">' + formatMoneyValue(indiaBlendedRate, 0) + '</td>' +
      '</tr>' +
      '<tr class="ms-subtotal-row">' +
        '<td style="text-align:left; font-weight:700;"><strong>Total Blended</strong></td>' +
        '<td style="text-align:right;"></td>' +
        '<td style="text-align:center;"></td>' +
        '<td style="text-align:right;"><strong>' + formatMoneyValue(totalBlendedRate, 0) + '</strong></td>' +
      '</tr>' +
      '<tr>' +
        '<td style="text-align:left;">&nbsp;</td>' +
        '<td style="text-align:right;"></td>' +
        '<td style="text-align:center;"></td>' +
        '<td style="text-align:right;"></td>' +
      '</tr>' +
      '<tr class="ms-subtotal-row">' +
        '<td style="text-align:left; font-weight:700;"><strong>Network FTEs per month</strong></td>' +
        '<td style="text-align:right;"><strong>' + networkFteDisplay.toFixed(0) + '</strong></td>' +
        '<td style="text-align:center;"></td>' +
        '<td style="text-align:right;"><strong>' + formatMoneyValue(networkManagedMonthly, 0) + ' ÷ ' + formatMoneyValue(totalBlendedRate, 0) + '</strong></td>' +
      '</tr>';
  }

  if (totalBanner) totalBanner.textContent = formatMoneyValue(networkManagedAnnual, 0);
  var networkMsMonthlyEl = document.getElementById('network-ms-total-monthly-value');
  if (networkMsMonthlyEl) networkMsMonthlyEl.textContent = formatMoneyValue(networkManagedMonthly, 0);
  if (collapsedBanner) collapsedBanner.textContent = formatMoneyValue(networkManagedAnnual, 0);

  var distributedServers = readNumericDisplay('compute-total-servers');
  var midrangeServers = readNumericDisplay('midrange-total-servers');
  var totalNetworkServerOs = distributedServers + midrangeServers;
  var monthlyPerServer = totalNetworkServerOs > 0 ? networkManagedMonthly / totalNetworkServerOs : 0;
  var annualPerServer = totalNetworkServerOs > 0 ? networkManagedAnnual / totalNetworkServerOs : 0;
  if (totalServersMeta) totalServersMeta.textContent = Math.round(totalNetworkServerOs).toLocaleString('en-US');
  if (monthlyPerServerMeta) monthlyPerServerMeta.textContent = formatMoneyValue(monthlyPerServer, 0);
  if (annualPerServerMeta) annualPerServerMeta.textContent = formatMoneyValue(annualPerServer, 0);

  updateSecurityMSSizing();
}

function updateSecurityMSSizing() {
  var section = document.getElementById('security-ms-sizing-section');
  if (!section) return;

  var networkCb = document.getElementById('tower-network-security');
  var checked = networkCb ? networkCb.checked : false;
  var securityCb = document.getElementById('network-security-applicable');
  var securityApplicable = securityCb ? securityCb.checked : false;
  var networkSection = document.getElementById('network-ms-sizing-section');
  var networkVisible = !!(networkSection && networkSection.style.display !== 'none' && networkSection.style.display !== '');
  var networkAnnual = parseCurrencyNumber(document.getElementById('network-ms-total-value') ? document.getElementById('network-ms-total-value').textContent : '0');

  var laborTbody = document.getElementById('security-ms-labor-tbody');
  var fteTbody = document.getElementById('security-ms-fte-tbody');
  var totalBanner = document.getElementById('security-ms-total-value');
  var collapsedBanner = document.getElementById('security-ms-collapsed-total-value');
  var totalServersMeta = document.getElementById('security-ms-total-servers-meta');
  var monthlyPerServerMeta = document.getElementById('security-ms-monthly-per-server');
  var annualPerServerMeta = document.getElementById('security-ms-annual-per-server');

  if (!checked || !securityApplicable) {
    section.style.display = 'none';
    var placeholder = document.getElementById('security-ms-sizing-section-placeholder');
    if (placeholder) placeholder.style.display = 'none';
    if (laborTbody) laborTbody.innerHTML = '<tr><td colspan="3" class="ms-loading">Security is not applicable…</td></tr>';
    if (fteTbody) fteTbody.innerHTML = '<tr><td colspan="4" class="ms-loading">Security is not applicable…</td></tr>';
    if (totalBanner) totalBanner.textContent = '$0';
    var securityMsMonthlyEl = document.getElementById('security-ms-total-monthly-value');
    if (securityMsMonthlyEl) securityMsMonthlyEl.textContent = '$0';
    if (collapsedBanner) collapsedBanner.textContent = '$0';
    if (totalServersMeta) totalServersMeta.textContent = '0';
    if (monthlyPerServerMeta) monthlyPerServerMeta.textContent = '$0';
    if (annualPerServerMeta) annualPerServerMeta.textContent = '$0';
    if (typeof updateOverlaysCFSSizing === 'function') updateOverlaysCFSSizing();
    return;
  }

  if (!networkVisible || networkAnnual <= 0) {
    section.style.display = 'none';
    setLiveSizingSectionVisible('security-ms-sizing-section', false);
    if (laborTbody) laborTbody.innerHTML = '<tr><td colspan="3" class="ms-loading">No security managed services totals available…</td></tr>';
    if (fteTbody) fteTbody.innerHTML = '<tr><td colspan="4" class="ms-loading">No security FTE derivation available…</td></tr>';
    if (totalBanner) totalBanner.textContent = '$0';
    var securityMsMonthlyEl = document.getElementById('security-ms-total-monthly-value');
    if (securityMsMonthlyEl) securityMsMonthlyEl.textContent = '$0';
    if (collapsedBanner) collapsedBanner.textContent = '$0';
    if (totalServersMeta) totalServersMeta.textContent = '0';
    if (monthlyPerServerMeta) monthlyPerServerMeta.textContent = '$0';
    if (annualPerServerMeta) annualPerServerMeta.textContent = '$0';
    if (typeof updateOverlaysCFSSizing === 'function') updateOverlaysCFSSizing();
    return;
  }

  section.style.display = 'block';
  setLiveSizingSectionVisible('security-ms-sizing-section', true);

  var securityAnnual = networkAnnual * 0.80;
  var securityMonthly = securityAnnual / 12;
  var delivery = getDeliveryMix();

  var usSecurityDiscountedRate = extractManagedServicesDiscountedRate(function(tower, description) {
    return tower === 'security' || description === 'security services';
  }, 'us', 16198);
  var indiaSecurityDiscountedRate = extractManagedServicesDiscountedRate(function(tower, description) {
    return tower === 'security' || description === 'security services';
  }, 'india', 4828);

  var usSecurityBlendedRate = usSecurityDiscountedRate * delivery.usPct;
  var indiaSecurityBlendedRate = indiaSecurityDiscountedRate * delivery.indiaPct;
  var totalSecurityBlendedRate = usSecurityBlendedRate + indiaSecurityBlendedRate;
  var securityFte = totalSecurityBlendedRate > 0 ? (securityMonthly / totalSecurityBlendedRate) : 0;
  var securityFteDisplay = Math.ceil(securityFte);

  if (totalSecurityBlendedRate <= 0) {
    section.style.display = 'none';
    setLiveSizingSectionVisible('security-ms-sizing-section', false);
    if (laborTbody) laborTbody.innerHTML = '<tr><td colspan="3" class="ms-loading">No security managed services totals available…</td></tr>';
    if (fteTbody) fteTbody.innerHTML = '<tr><td colspan="4" class="ms-loading">No security FTE derivation available…</td></tr>';
    if (totalBanner) totalBanner.textContent = '$0';
    if (collapsedBanner) collapsedBanner.textContent = '$0';
    if (totalServersMeta) totalServersMeta.textContent = '0';
    if (monthlyPerServerMeta) monthlyPerServerMeta.textContent = '$0';
    if (annualPerServerMeta) annualPerServerMeta.textContent = '$0';
    if (typeof updateOverlaysCFSSizing === 'function') updateOverlaysCFSSizing();
    return;
  }

  function fmtPct(value) {
    return (value * 100).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    }) + '%';
  }

  if (laborTbody) {
    laborTbody.innerHTML =
      '<tr>' +
        '<td style="text-align:left;"></td>' +
        '<td style="text-align:center; font-weight:700;">Annual Cost</td>' +
        '<td style="text-align:center; font-weight:700;">Monthly Cost</td>' +
      '</tr>' +
      '<tr>' +
        '<td style="text-align:left; font-weight:600;">Network Labour Cost</td>' +
        '<td style="text-align:right;">' + formatMoneyValue(networkAnnual, 0) + '</td>' +
        '<td style="text-align:right;"></td>' +
      '</tr>' +
      '<tr>' +
        '<td style="text-align:left; font-weight:600;">Security Labor Cost as a % of Network Labour Cost</td>' +
        '<td style="text-align:right;">80%</td>' +
        '<td style="text-align:right;"></td>' +
      '</tr>' +
      '<tr class="ms-subtotal-row">' +
        '<td style="text-align:left; font-weight:700;"><strong>NETWORK LABOR COST</strong></td>' +
        '<td style="text-align:right;"><strong>' + formatMoneyValue(securityAnnual, 0) + '</strong></td>' +
        '<td style="text-align:right;"><strong>' + formatMoneyValue(securityMonthly, 0) + '</strong></td>' +
      '</tr>';
  }

  if (fteTbody) {
    fteTbody.innerHTML =
      '<tr>' +
        '<td style="text-align:left;">Security Labor (US)</td>' +
        '<td style="text-align:right;">' + formatMoneyValue(usSecurityDiscountedRate, 0) + '</td>' +
        '<td style="text-align:center;">' + fmtPct(delivery.usPct) + '</td>' +
        '<td style="text-align:right;">' + formatMoneyValue(usSecurityBlendedRate, 0) + '</td>' +
      '</tr>' +
      '<tr>' +
        '<td style="text-align:left;">Security Labor (India)</td>' +
        '<td style="text-align:right;">' + formatMoneyValue(indiaSecurityDiscountedRate, 0) + '</td>' +
        '<td style="text-align:center;">' + fmtPct(delivery.indiaPct) + '</td>' +
        '<td style="text-align:right;">' + formatMoneyValue(indiaSecurityBlendedRate, 0) + '</td>' +
      '</tr>' +
      '<tr class="ms-subtotal-row">' +
        '<td style="text-align:left; font-weight:700;"><strong>TOTAL BLENDED</strong></td>' +
        '<td style="text-align:right;"></td>' +
        '<td style="text-align:center;"></td>' +
        '<td style="text-align:right;"><strong>' + formatMoneyValue(totalSecurityBlendedRate, 0) + '</strong></td>' +
      '</tr>' +
      '<tr>' +
        '<td style="text-align:left;">&nbsp;</td>' +
        '<td style="text-align:right;"></td>' +
        '<td style="text-align:center;"></td>' +
        '<td style="text-align:right;"></td>' +
      '</tr>' +
      '<tr class="ms-subtotal-row">' +
        '<td style="text-align:left; font-weight:700;"><strong>SECURITY FTEs PER MONTH</strong></td>' +
        '<td style="text-align:right;"><strong>' + securityFteDisplay.toFixed(0) + '</strong></td>' +
        '<td style="text-align:center;"></td>' +
        '<td style="text-align:right;"><strong>' + formatMoneyValue(securityMonthly, 0) + ' ÷ ' + formatMoneyValue(totalSecurityBlendedRate, 0) + '</strong></td>' +
      '</tr>';
  }

  if (totalBanner) totalBanner.textContent = formatMoneyValue(securityAnnual, 0);
  var securityMsMonthlyEl = document.getElementById('security-ms-total-monthly-value');
  if (securityMsMonthlyEl) securityMsMonthlyEl.textContent = formatMoneyValue(securityMonthly, 0);
  if (collapsedBanner) collapsedBanner.textContent = formatMoneyValue(securityAnnual, 0);

  var distributedServers = readNumericDisplay('compute-total-servers');
  var midrangeServers = readNumericDisplay('midrange-total-servers');
  var totalSecurityServerOs = distributedServers + midrangeServers;
  var monthlyPerServer = totalSecurityServerOs > 0 ? securityMonthly / totalSecurityServerOs : 0;
  var annualPerServer = totalSecurityServerOs > 0 ? securityAnnual / totalSecurityServerOs : 0;
  if (totalServersMeta) totalServersMeta.textContent = Math.round(totalSecurityServerOs).toLocaleString('en-US');
  if (monthlyPerServerMeta) monthlyPerServerMeta.textContent = formatMoneyValue(monthlyPerServer, 0);
  if (annualPerServerMeta) annualPerServerMeta.textContent = formatMoneyValue(annualPerServer, 0);
  updateOverlaysCFSSizing();
}

function toggleMainframeJobScheduling() {
  var cb     = document.getElementById('mf-job-scheduling');
  var fields = document.getElementById('mf-job-scheduling-fields');
  if (!fields) return;
  var show = cb && cb.checked;
  fields.style.display = show ? 'block' : 'none';
  if (!show) {
    var inp = document.getElementById('mf-jobs-per-month');
    if (inp) inp.value = '';
  } else {
    updateMFJobTranslation();
  }
}

function updateMFJobTranslation() {
  var inp = document.getElementById('mf-jobs-per-month');
  var val = document.getElementById('mf-job-translation-value');
  if (!inp || !val) return;
  var n = parseFloat(inp.value);
  val.textContent = (!isNaN(n) && n > 0) ? n : '';
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ADMIN EDIT MODE
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
var ADMIN_EDIT_STORAGE_KEY = 'assumptiveBaseCase.adminEditableValues.v1';
var ADMIN_EDIT_PASSWORD = 'Admin@123';
var _adminEditMode = false;

function ensureAdminUnlocked() {
  var entered = window.prompt('Enter admin password to enable edit mode:');
  if (entered === null) return false;

  if (entered === ADMIN_EDIT_PASSWORD) {
    return true;
  }

  window.alert('Incorrect password. Admin Edit Mode remains disabled.');
  return false;
}

function slugifyAdminValue(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function getAdminEditableStore() {
  try {
    var raw = localStorage.getItem(ADMIN_EDIT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveAdminEditableStore(store) {
  try {
    localStorage.setItem(ADMIN_EDIT_STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    /* ignore storage failures */
  }
}

function readAdminEditableValue(key) {
  var store = getAdminEditableStore();
  return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
}

function writeAdminEditableValue(key, value) {
  var store = getAdminEditableStore();
  store[key] = value;
  saveAdminEditableStore(store);
}

function isAdminEditableNumber(text) {
  return /[0-9]/.test(String(text || ''));
}

function bindAdminEditableCell(cell, key) {
  if (!cell || !key) return;

  cell.dataset.adminKey = key;
  cell.dataset.adminEditable = 'true';

  var saved = readAdminEditableValue(key);
  if (saved !== null && saved !== undefined && saved !== '') {
    cell.textContent = saved;
  }

  cell.setAttribute('contenteditable', _adminEditMode ? 'true' : 'false');
  cell.spellcheck = false;

  if (cell.dataset.adminBound === 'true') return;
  cell.dataset.adminBound = 'true';

  cell.addEventListener('input', function() {
    if (!_adminEditMode) return;
    writeAdminEditableValue(key, cell.textContent.trim());
    refreshAdminEditableCalculations();
  });

  cell.addEventListener('blur', function() {
    if (!_adminEditMode) return;
    writeAdminEditableValue(key, cell.textContent.trim());
    refreshAdminEditableCalculations();
  });
}

function bindAdminEditableInput(input, key) {
  if (!input || !key) return;

  input.dataset.adminKey = key;
  var saved = readAdminEditableValue(key);
  if (saved !== null && saved !== undefined && saved !== '') {
    input.value = saved;
  }

  input.dataset.lastValidValue = input.value;

  input.readOnly = !_adminEditMode;

  if (input.dataset.adminBound === 'true') return;
  input.dataset.adminBound = 'true';

  input.addEventListener('input', function() {
    if (!_adminEditMode) return;
    if (key.indexOf('datacenter-util-uom:') === 0) {
      var candidateUom = String(input.value || '').trim();
      if (candidateUom && !/^[a-z0-9\s()./%-]+$/i.test(candidateUom)) {
        input.value = input.dataset.lastValidValue || '';
        return;
      }
    }
    writeAdminEditableValue(key, input.value);
  });

  input.addEventListener('change', function() {
    if (!_adminEditMode) return;
    var raw = String(input.value || '').trim();

    if (key.indexOf('datacenter-rates:') === 0) {
      var rate = parseFloat(raw.replace(/[^0-9.]/g, ''));
      if (isNaN(rate) || rate <= 0) {
        input.value = input.dataset.lastValidValue || input.defaultValue || '0.01';
      } else {
        input.value = rate.toFixed(2);
      }
    }

    if (key.indexOf('datacenter-util:') === 0) {
      var isNetworkRatio = key === 'datacenter-util:network';
      var isPercent = /%\s*$/.test(raw);
      var ratio = parseFloat(raw.replace(/[^0-9.]/g, ''));

      if (isNaN(ratio) || ratio <= 0) {
        input.value = input.dataset.lastValidValue || input.defaultValue || (isNetworkRatio ? '10%' : '1');
      } else if (isNetworkRatio && isPercent) {
        input.value = ratio.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }) + '%';
      } else {
        input.value = ratio.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        });
      }
    }

    if (key.indexOf('datacenter-util-uom:') === 0) {
      if (!raw || !/^[a-z0-9\s()./%-]+$/i.test(raw)) {
        input.value = input.dataset.lastValidValue || input.defaultValue || '';
      } else {
        input.value = raw;
      }
    }

    input.dataset.lastValidValue = input.value;
    writeAdminEditableValue(key, input.value);
    refreshAdminEditableCalculations();
  });
}

function parseMoneyNumber(text) {
  var cleaned = String(text || '').replace(/[^0-9.-]/g, '');
  var n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function parseDiscountPercent(text) {
  var m = String(text || '').match(/(\d+(?:\.\d+)?)\s*%/);
  if (!m) return null;
  return parseFloat(m[1]) / 100;
}

function formatCurrencyWithDecimals(value, decimals) {
  return '$' + Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function applyManagedServicesDiscounts() {
  var table = document.getElementById('ms-rates-table');
  if (!table) return;

  var ths = table.querySelectorAll('thead th');
  if (!ths.length) return;

  var monthlyIdx = -1;
  var discountedIdx = -1;
  var discountMultiplier = null;

  ths.forEach(function(th, idx) {
    var txt = (th.textContent || '').toLowerCase();
    if (txt.indexOf('monthly typical price') !== -1) monthlyIdx = idx;
    if (txt.indexOf('discount') !== -1) {
      discountedIdx = idx;
      discountMultiplier = parseDiscountPercent(th.textContent);
    }
  });

  if (monthlyIdx < 0 || discountedIdx < 0 || discountMultiplier === null) return;

  table.querySelectorAll('#ms-rates-tbody tr').forEach(function(row) {
    var cells = row.querySelectorAll('td');
    if (!cells.length) return;
    if (cells.length === 1 || cells[0].hasAttribute('colspan')) return;
    if (cells.length <= discountedIdx || cells.length <= monthlyIdx) return;

    var monthly = parseMoneyNumber(cells[monthlyIdx].textContent);
    var discounted = Math.round(monthly * discountMultiplier);
    var target = cells[discountedIdx];
    target.textContent = formatCurrencyWithDecimals(discounted, 0);
    target.dataset.autoDiscounted = 'true';
  });
}

function applyVmwareDiscounts() {
  var tables = document.querySelectorAll('#panel-vmware-rate table');
  tables.forEach(function(table, tableIndex) {
    var ths = table.querySelectorAll('thead th');
    if (!ths.length) return;

    var listIdx = -1;
    var discountedIdx = -1;
    var discountMultiplier = null;

    ths.forEach(function(th, idx) {
      var txt = (th.textContent || '').toLowerCase();
      if (txt.indexOf('list price') !== -1) listIdx = idx;
      if (txt.indexOf('discount') !== -1) {
        discountedIdx = idx;
        discountMultiplier = parseDiscountPercent(th.textContent);
      }
    });

    if (discountedIdx < 0 || discountMultiplier === null) return;
    if (listIdx < 0) listIdx = discountedIdx - 1;
    if (listIdx < 0) return;

    table.querySelectorAll('tbody tr').forEach(function(row, rowIndex) {
      var cells = row.querySelectorAll('td');
      if (cells.length <= discountedIdx || cells.length <= listIdx) return;

      var base = parseMoneyNumber(cells[listIdx].textContent);
      var discounted = base * (1 - discountMultiplier);
      var targetCell = cells[discountedIdx];
      var targetInput = targetCell.querySelector('input[type="number"]');

      if (targetInput) {
        var fixed = discounted.toFixed(2);
        targetInput.value = fixed;
        targetInput.readOnly = true;
        targetInput.dataset.autoDiscounted = 'true';
      } else {
        targetCell.textContent = formatCurrencyWithDecimals(discounted, 2);
        targetCell.dataset.autoDiscounted = 'true';
      }

      targetCell.dataset.autoDiscountedKey = 'vmware-discount:' + tableIndex + ':' + rowIndex;
    });
  });
}

function applyDiscountCalculations() {
  applyManagedServicesDiscounts();
  applyVmwareDiscounts();
}

var _mainframeInfraRateListenersAttached = false;

function getMainframeInfraRateConfigs() {
  return [
    {
      key: 'mainframe',
      rateInputId: 'mf-infra-rate',
      premiumInputId: 'mf-infra-insourced-premium',
      rateDisplayId: 'mf-infra-rate-display',
      premiumDisplayId: 'mf-infra-insourced-premium-display',
      finalDisplayId: 'mf-infra-final-rate'
    },
    {
      key: 'storage',
      rateInputId: 'mf-storage-infra-rate',
      premiumInputId: 'mf-storage-insourced-premium',
      rateDisplayId: 'mf-storage-infra-rate-display',
      premiumDisplayId: 'mf-storage-insourced-premium-display',
      finalDisplayId: 'mf-storage-final-rate'
    },
    {
      key: 'backup',
      rateInputId: 'mf-backup-infra-rate',
      premiumInputId: 'mf-backup-insourced-premium',
      rateDisplayId: 'mf-backup-infra-rate-display',
      premiumDisplayId: 'mf-backup-insourced-premium-display',
      finalDisplayId: 'mf-backup-final-rate'
    }
  ];
}

function setMainframeInfraEditVisibility(isAdminMode) {
  document.querySelectorAll('.mf-infra-rate-display, .mf-infra-premium-display').forEach(function(el) {
    el.style.display = isAdminMode ? 'none' : 'inline';
  });
  document.querySelectorAll('.mf-infra-rate-edit, .mf-infra-premium-edit').forEach(function(el) {
    el.style.display = isAdminMode ? 'inline' : 'none';
  });
}

function calcMainframeInfraFinalRate() {
  getMainframeInfraRateConfigs().forEach(function(cfg) {
    var rateInput = document.getElementById(cfg.rateInputId);
    var premiumInput = document.getElementById(cfg.premiumInputId);
    var rateDisplay = document.getElementById(cfg.rateDisplayId);
    var premiumDisplay = document.getElementById(cfg.premiumDisplayId);
    var finalEl = document.getElementById(cfg.finalDisplayId);
    if (!rateInput || !premiumInput || !finalEl) return;

    var baseRate = parseFloat(rateInput.value);
    var premiumPct = parseFloat(premiumInput.value);

    if (isNaN(baseRate) || baseRate < 0) baseRate = 0;
    if (isNaN(premiumPct)) premiumPct = 0;
    if (premiumPct < 0) premiumPct = 0;
    if (premiumPct > 100) premiumPct = 100;

    rateInput.value = baseRate.toFixed(2);
    premiumInput.value = (Math.round(premiumPct * 100) / 100).toString();

    var finalRate = baseRate * (1 + (premiumPct / 100));
    var truncatedFinalRate = Math.floor(finalRate * 100) / 100;
    if (rateDisplay) rateDisplay.textContent = formatCurrencyWithDecimals(baseRate, 2);
    if (premiumDisplay) premiumDisplay.textContent = (Math.round(premiumPct * 100) / 100).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }) + '%';
    finalEl.textContent = formatCurrencyWithDecimals(truncatedFinalRate, 2);
  });

  calcMainframeInfraCost();
}

function wireMainframeInfraRateListeners() {
  if (_mainframeInfraRateListenersAttached) return;
  _mainframeInfraRateListenersAttached = true;

  [
    'mf-infra-rate',
    'mf-infra-insourced-premium',
    'mf-storage-infra-rate',
    'mf-storage-insourced-premium',
    'mf-backup-infra-rate',
    'mf-backup-insourced-premium'
  ].forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', calcMainframeInfraFinalRate);
    el.addEventListener('change', calcMainframeInfraFinalRate);
  });
}

function initAdminEditableTargets() {
  var fteTables = document.querySelectorAll('#panel-fte-kpis table tbody');
  fteTables.forEach(function(tbody, tableIndex) {
    tbody.querySelectorAll('tr').forEach(function(row) {
      var cells = row.querySelectorAll('td');
      if (cells.length < 5) return;

      var rowLabel = slugifyAdminValue(cells[0].textContent);
      ['lower', 'upper', 'median'].forEach(function(colKey, offset) {
        var cell = cells[offset + 2];
        if (!cell || !isAdminEditableNumber(cell.textContent)) return;
        bindAdminEditableCell(cell, 'fte-kpis:' + tableIndex + ':' + rowLabel + ':' + colKey);
      });
    });
  });

  var infraTbody = document.getElementById('infra-rates-tbody');
  if (infraTbody) {
    infraTbody.querySelectorAll('tr').forEach(function(row) {
      var cells = row.querySelectorAll('td');
      if (cells.length !== 4) return;
      var rateCell = cells[2];
      if (!rateCell || !isAdminEditableNumber(rateCell.textContent)) return;
      var key = 'infra-rates:' + slugifyAdminValue(cells[0].textContent) + ':' + slugifyAdminValue(cells[1].textContent);
      bindAdminEditableCell(rateCell, key);
    });
  }

  var mfInfraRateInput = document.getElementById('mf-infra-rate');
  if (mfInfraRateInput) {
    bindAdminEditableInput(mfInfraRateInput, 'mainframe-infra:mainframe:rate');
  }

  var mfInfraPremiumInput = document.getElementById('mf-infra-insourced-premium');
  if (mfInfraPremiumInput) {
    bindAdminEditableInput(mfInfraPremiumInput, 'mainframe-infra:mainframe:insourced-premium');
  }

  var mfStorageRateInput = document.getElementById('mf-storage-infra-rate');
  if (mfStorageRateInput) {
    bindAdminEditableInput(mfStorageRateInput, 'mainframe-infra:storage:rate');
  }

  var mfStoragePremiumInput = document.getElementById('mf-storage-insourced-premium');
  if (mfStoragePremiumInput) {
    bindAdminEditableInput(mfStoragePremiumInput, 'mainframe-infra:storage:insourced-premium');
  }

  var mfBackupRateInput = document.getElementById('mf-backup-infra-rate');
  if (mfBackupRateInput) {
    bindAdminEditableInput(mfBackupRateInput, 'mainframe-infra:backup:rate');
  }

  var mfBackupPremiumInput = document.getElementById('mf-backup-insourced-premium');
  if (mfBackupPremiumInput) {
    bindAdminEditableInput(mfBackupPremiumInput, 'mainframe-infra:backup:insourced-premium');
  }

  document.querySelectorAll('[data-admin-key^="datacenter-rates:"]').forEach(function(input) {
    bindAdminEditableInput(input, input.dataset.adminKey);
  });

  document.querySelectorAll('[data-admin-key^="datacenter-util:"]').forEach(function(input) {
    bindAdminEditableInput(input, input.dataset.adminKey);
  });

  document.querySelectorAll('[data-admin-key^="datacenter-util-uom:"]').forEach(function(input) {
    bindAdminEditableInput(input, input.dataset.adminKey);
  });

  var dasdMultiplierInput = document.getElementById('rate-storage-dasd-midrange-multiplier');
  if (dasdMultiplierInput) {
    bindAdminEditableInput(dasdMultiplierInput, 'storage-rates:dasd-midrange:multiplier');
  }

  calcMainframeInfraFinalRate();

  var msRows = document.querySelectorAll('#ms-rates-tbody tr');
  msRows.forEach(function(row) {
    var cells = row.querySelectorAll('td');
    if (cells.length < 7) return;

    var rowKey = 'ms-rates:' + slugifyAdminValue(cells[0].textContent) + ':' + slugifyAdminValue(cells[1].textContent) + ':' + slugifyAdminValue(cells[3].textContent);
    if (cells[4] && isAdminEditableNumber(cells[4].textContent)) {
      bindAdminEditableCell(cells[4], rowKey + ':monthly');
    }
  });

  document.querySelectorAll('#ms-rates-table thead th').forEach(function(th, idx) {
    var txt = (th.textContent || '').toLowerCase();
    if (txt.indexOf('discount') !== -1 && parseDiscountPercent(th.textContent) !== null) {
      bindAdminEditableCell(th, 'ms-rates:header:discount:' + idx);
    }
  });

  var vmwareRateTables = document.querySelectorAll('#panel-vmware-rate table');
  vmwareRateTables.forEach(function(table, tableIndex) {
    table.querySelectorAll('thead th').forEach(function(th, idx) {
      var txt = (th.textContent || '').toLowerCase();
      if (txt.indexOf('discount') !== -1 && parseDiscountPercent(th.textContent) !== null) {
        bindAdminEditableCell(th, 'vmware:header:discount:' + tableIndex + ':' + idx);
      }
    });

    table.querySelectorAll('tbody tr').forEach(function(row, rowIndex) {
      var cells = row.querySelectorAll('td');
      if (cells.length >= 2 && isAdminEditableNumber(cells[1].textContent) && cells[1].textContent.indexOf('$') !== -1) {
        bindAdminEditableCell(cells[1], 'vmware:list-price:' + tableIndex + ':' + rowIndex);
      }
    });
  });

  var vmwareConstantRows = document.querySelectorAll('#panel-vmware-rate table tbody tr');
  vmwareConstantRows.forEach(function(row, rowIndex) {
    var cells = row.querySelectorAll('td');
    if (cells.length !== 2) return;
    var valueCell = cells[1];
    if (!valueCell || !isAdminEditableNumber(valueCell.textContent)) return;
    bindAdminEditableCell(valueCell, 'vmware-constants:' + rowIndex + ':' + slugifyAdminValue(cells[0].textContent));
  });

  bindProBenchMarkAdminTargets();
}

function refreshAdminEditableCalculations() {
  updateItSpendBenchmark();
  applyDiscountCalculations();
  updateDasdMidrangeRate();
  calcMainframeInfraFinalRate();
  calcMainframeInfraCost();
  updateManagedServicesSizing();
  updateMidrangeMSSizing();
  calcStorageMSSizing();
  calcDbMwManagedServicesSizing();
  calcInfraCost();
  calcMidrangeInfraCost();
  updateVmwareSizing();
  calcMainframeMSSizing();
  if (typeof calcDatacenterInfraCost === 'function') calcDatacenterInfraCost();
  if (typeof updateDatacenterSizing === 'function') updateDatacenterSizing();
  if (typeof buildTCOAnalysis === 'function') buildTCOAnalysis();
  if (typeof buildTCOFteCard === 'function') buildTCOFteCard();
  if (typeof buildTCOOperationalMetrics === 'function') buildTCOOperationalMetrics();
  if (typeof buildExecutiveBrief === 'function') buildExecutiveBrief();
}

function toggleAdminEditMode(enabled) {
  if (enabled && !ensureAdminUnlocked()) {
    var adminToggle = document.getElementById('adminEditMode');
    if (adminToggle) adminToggle.checked = false;
    _adminEditMode = false;
    document.body.classList.remove('admin-edit-mode');

    document.querySelectorAll('[data-admin-editable="true"]').forEach(function(cell) {
      cell.setAttribute('contenteditable', 'false');
    });

    document.querySelectorAll('#panel-vmware-rate input[type="number"]').forEach(function(input) {
      input.readOnly = true;
    });
    setMainframeInfraEditVisibility(false);
    return;
  }

  _adminEditMode = !!enabled;
  document.body.classList.toggle('admin-edit-mode', _adminEditMode);

  document.querySelectorAll('[data-admin-editable="true"]').forEach(function(cell) {
    cell.setAttribute('contenteditable', _adminEditMode ? 'true' : 'false');
  });

  document.querySelectorAll('input[data-admin-key]').forEach(function(input) {
    if (input.dataset.autoDiscounted === 'true') {
      input.readOnly = true;
      return;
    }
    input.readOnly = !_adminEditMode;
  });

  setMainframeInfraEditVisibility(_adminEditMode);

  document.querySelectorAll('#panel-vmware-rate input[type="number"]').forEach(function(input) {
    if (input.dataset.autoDiscounted === 'true') {
      input.readOnly = true;
      return;
    }
    input.readOnly = !_adminEditMode;
  });

  if (_adminEditMode) {
    refreshAdminEditableCalculations();
  }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   DISTRIBUTED COMPUTE â€” OS ROWS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function addComputeOSRow() {
  var tbody = document.getElementById('compute-os-tbody');
  var rowNum = tbody.rows.length;
  var row   = document.createElement('tr');
  row.className = 'compute-row';
  row.innerHTML =
    '<td class="compute-td">' +
      '<div class="select-wrapper">' +
        '<select class="compute-select" id="compute_os_' + rowNum + '" name="compute_os_' + rowNum + '" onchange="updateComputeServerSummary(); updateManagedServicesSizing();">' +
          '<option value="windows" selected>Windows</option>' +
          '<option value="linux">Linux</option>' +
          '<option value="unix">Unix/AIX</option>' +
        '</select>' +
      '</div>' +
    '</td>' +
    '<td class="compute-td">' +
      '<div class="select-wrapper">' +
        '<select class="compute-select" id="compute_type_' + rowNum + '" name="compute_type_' + rowNum + '">' +
          '<option value="prod" selected>Prod</option>' +
          '<option value="nonprod">Non-Prod</option>' +
        '</select>' +
      '</div>' +
    '</td>' +
    '<td class="compute-td">' +
      '<input type="number" id="compute_servers_' + rowNum + '" name="compute_servers_' + rowNum + '" class="compute-number" value="0" min="0" step="1"' +
      ' oninput="validateComputeCounts(); updateComputeServerSummary()" />' +
    '</td>' +
    '<td class="compute-td" style="text-align:center;">' +
      '<button class="delete-btn" onclick="deleteComputeOSRow(this)" title="Delete row">\u2715</button>' +
    '</td>';
  tbody.appendChild(row);
  validateComputeCounts();
  updateComputeServerSummary();
}

function deleteComputeOSRow(btn) {
  var tbody = document.getElementById('compute-os-tbody');
  if (tbody.rows.length <= 1) return;
  var row = btn.closest('tr');
  if (row) {
    row.remove();
    validateComputeCounts();
    updateComputeServerSummary();
  }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   SERVER SUMMARY HELPER
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function updateServerSummary(tbodyId, totalId, prodId, nonprodId) {
  var total = 0, prod = 0, nonprod = 0;
  document.querySelectorAll('#' + tbodyId + ' tr').forEach(function(row) {
    var selects = row.querySelectorAll('select');
    var input   = row.querySelector('input[type="number"]');
    var count   = parseFloat(input && input.value) || 0;
    total += count;
    if (selects.length >= 2) {
      if (selects[1].value === 'prod')         prod    += count;
      else if (selects[1].value === 'nonprod') nonprod += count;
    }
  });

  /* FIX â€” null checks before setting textContent */
  var totalEl   = document.getElementById(totalId);
  var prodEl    = document.getElementById(prodId);
  var nonprodEl = document.getElementById(nonprodId);
  if (totalEl)   totalEl.textContent   = total;
  if (prodEl)    prodEl.textContent    = prod;
  if (nonprodEl) nonprodEl.textContent = nonprod;
}

function normalizeComputeServerType(id, value) {
  if (String(id || '').indexOf('compute_type_') === 0 && value === 'dr') {
    return 'prod';
  }
  return value;
}

function updateComputeServerSummary() {
  syncLinkedComputeRows('compute');
  updateServerSummary(
    'compute-os-tbody',
    'compute-total-servers',
    'compute-prod-servers',
    'compute-nonprod-servers'
  );
  calcInfraCost();
  if (typeof updateDatacenterSizing === 'function') updateDatacenterSizing();
  updateLiveSizingVisibility();
}

function updateMidrangeServerSummary() {
  syncLinkedComputeRows('midrange');
  updateServerSummary(
    'midrange-os-tbody',
    'midrange-total-servers',
    'midrange-prod-servers',
    'midrange-nonprod-servers'
  );
  validateMidrangeCounts();
  calcMidrangeInfraCost();
  if (typeof updateDatacenterSizing === 'function') updateDatacenterSizing();
  updateLiveSizingVisibility();
}

function getLinkedComputeDefaults(tower, os) {
  if (tower === 'midrange' && os === 'ibmi_lpar') {
    return { vcpu: 8, vram: 96 };
  }
  return { vcpu: 4, vram: 32 };
}

function createLinkedComputeRow(tower, index, os, vcpu, vram, servers) {
  var isMidrange = tower === 'midrange';
  var prefix = isMidrange ? 'midrange_' : 'compute_';
  var labels = isMidrange ?
    '<option value="aix_lpar">AIX LPAR</option><option value="ibmi_lpar">IBMi LPAR</option>' :
    '<option value="windows">Windows</option><option value="linux">Linux</option><option value="unix">Unix/AIX</option>';
  var row = document.createElement('tr');
  row.className = 'compute-row';
  row.innerHTML =
    '<td class="compute-td"><select class="compute-select" id="' + prefix + 'vcpu_os_' + index + '" name="' + prefix + 'vcpu_os_' + index + '" disabled>' + labels + '</select></td>' +
    '<td class="compute-td"><input type="number" id="' + prefix + 'vcpu_' + index + '" name="' + prefix + 'vcpu_' + index + '" class="compute-number" value="' + vcpu + '" min="0" step="1" oninput="' + (isMidrange ? 'updateMidrangeMSSizing(); calcMidrangeInfraCost();' : 'calcInfraCost(); updateVmwareSizing();') + '" /></td>' +
    '<td class="compute-td"><input type="number" id="' + prefix + 'vram_' + index + '" name="' + prefix + 'vram_' + index + '" class="compute-number" value="' + vram + '" min="0" step="1" oninput="' + (isMidrange ? 'updateMidrangeMSSizing(); calcMidrangeInfraCost();' : 'calcInfraCost(); updateVmwareSizing();') + '" /></td>' +
    '<td class="compute-td"><input type="number" id="' + prefix + 'vcpu_servers_' + index + '" name="' + prefix + 'vcpu_servers_' + index + '" class="compute-number" value="' + servers + '" min="0" step="1" readonly /></td>';
  row.querySelector('select').value = os;
  return row;
}

function syncComputeTotalRow() {
  var leftTbody = document.getElementById('compute-os-tbody');
  var rightTbody = document.getElementById('compute-vcpu-tbody');
  if (!leftTbody || !rightTbody) return;

  var totalServers = 0;
  leftTbody.querySelectorAll('input[type="number"]').forEach(function(input) {
    totalServers += parseFloat(input.value) || 0;
  });

  var currentVcpu = document.getElementById('compute_vcpu_0');
  var currentVram = document.getElementById('compute_vram_0');
  var vcpu = currentVcpu ? currentVcpu.value : '';
  var vram = currentVram ? currentVram.value : '';
  rightTbody.innerHTML =
    '<tr class="compute-row">' +
      '<td class="compute-td"><input type="number" id="compute_vcpu_0" name="compute_vcpu_0" class="compute-number" value="' + vcpu + '" min="0" step="1" oninput="calcInfraCost(); updateVmwareSizing()" /></td>' +
      '<td class="compute-td"><input type="number" id="compute_vram_0" name="compute_vram_0" class="compute-number" value="' + vram + '" min="0" step="1" oninput="calcInfraCost(); updateVmwareSizing()" /></td>' +
      '<td class="compute-td"><input type="number" id="compute_vcpu_servers_0" name="compute_vcpu_servers_0" class="compute-number" value="' + totalServers + '" min="0" step="1" readonly /></td>' +
    '</tr>';
}

function syncMidrangeComputeRows() {
  var leftTbody = document.getElementById('midrange-os-tbody');
  var rightTbody = document.getElementById('midrange-vcpu-tbody');
  if (!leftTbody || !rightTbody) return;

  var valuesByOs = {};
  rightTbody.querySelectorAll('tr.compute-row').forEach(function(row) {
    var osSelect = row.querySelector('select');
    var inputs = row.querySelectorAll('input[type="number"]');
    if (!osSelect) return;
    valuesByOs[osSelect.value] = {
      vcpu: inputs[0] && inputs[0].value !== '0' && inputs[0].value !== '' ? inputs[0].value : '',
      vram: inputs[1] && inputs[1].value !== '0' && inputs[1].value !== '' ? inputs[1].value : ''
    };
  });

  var totals = { aix_lpar: 0, ibmi_lpar: 0 };
  leftTbody.querySelectorAll('tr.compute-row').forEach(function(row) {
    var selects = row.querySelectorAll('select');
    var serverInput = row.querySelector('input[type="number"]');
    var os = selects[0] ? selects[0].value : 'aix_lpar';
    totals[os] = (totals[os] || 0) + (parseFloat(serverInput && serverInput.value) || 0);
  });

  rightTbody.innerHTML = '';
  ['aix_lpar', 'ibmi_lpar'].forEach(function(os, index) {
    var saved = valuesByOs[os] || { vcpu: '', vram: '' };
    var defaults = getLinkedComputeDefaults('midrange', os);
    var vcpuVal = (saved.vcpu !== undefined && saved.vcpu !== '') ? saved.vcpu : defaults.vcpu;
    var vramVal = (saved.vram !== undefined && saved.vram !== '') ? saved.vram : defaults.vram;

    var row = document.createElement('tr');
    row.className = 'compute-row';
    row.innerHTML =
      '<td class="compute-td"><select class="compute-select" id="midrange_vcpu_os_' + index + '" name="midrange_vcpu_os_' + index + '" disabled>' +
        '<option value="aix_lpar"' + (os === 'aix_lpar' ? ' selected' : '') + '>AIX LPAR</option>' +
        '<option value="ibmi_lpar"' + (os === 'ibmi_lpar' ? ' selected' : '') + '>IBMi LPAR</option>' +
      '</select></td>' +
      '<td class="compute-td"><input type="number" id="midrange_vcpu_' + index + '" name="midrange_vcpu_' + index + '" class="compute-number" value="' + vcpuVal + '" min="0" step="1" oninput="updateMidrangeMSSizing(); calcMidrangeInfraCost();" /></td>' +
      '<td class="compute-td"><input type="number" id="midrange_vram_' + index + '" name="midrange_vram_' + index + '" class="compute-number" value="' + vramVal + '" min="0" step="1" oninput="updateMidrangeMSSizing(); calcMidrangeInfraCost();" /></td>' +
      '<td class="compute-td"><input type="number" id="midrange_vcpu_servers_' + index + '" name="midrange_vcpu_servers_' + index + '" class="compute-number" value="' + totals[os] + '" min="0" step="1" readonly /></td>';
    rightTbody.appendChild(row);
  });
}

function syncLinkedComputeRows(tower) {
  if (tower === 'compute') {
    syncComputeTotalRow();
    return;
  }
  if (tower === 'midrange') {
    syncMidrangeComputeRows();
    return;
  }
  var leftId = tower === 'midrange' ? 'midrange-os-tbody' : 'compute-os-tbody';
  var rightId = tower === 'midrange' ? 'midrange-vcpu-tbody' : 'compute-vcpu-tbody';
  var leftTbody = document.getElementById(leftId);
  var rightTbody = document.getElementById(rightId);
  if (!leftTbody || !rightTbody) return;

  var existing = [];
  rightTbody.querySelectorAll('tr.compute-row').forEach(function(row) {
    var inputs = row.querySelectorAll('input[type="number"]');
    var osSelect = row.querySelector('select');
    existing.push({
      os: osSelect ? osSelect.value : '',
      vcpu: inputs[0] ? inputs[0].value : '',
      vram: inputs[1] ? inputs[1].value : '',
      lastOs: row.dataset.lastOs || ''
    });
  });

  var rows = leftTbody.querySelectorAll('tr.compute-row');
  while (rightTbody.firstChild) rightTbody.removeChild(rightTbody.firstChild);
  rows.forEach(function(leftRow, index) {
    var selects = leftRow.querySelectorAll('select');
    var serverInput = leftRow.querySelector('input[type="number"]');
    var os = selects[0] ? selects[0].value : '';
    var servers = serverInput ? serverInput.value : '0';
    var previous = existing[index];
    var defaults = getLinkedComputeDefaults(tower, os);
    var osChanged = !previous || !previous.lastOs || previous.lastOs !== os;
    var vcpu = osChanged || previous.vcpu === '' ? defaults.vcpu : previous.vcpu;
    var vram = osChanged || previous.vram === '' ? defaults.vram : previous.vram;
    var rightRow = createLinkedComputeRow(tower, index, os, vcpu, vram, servers);
    rightRow.dataset.lastOs = os;
    rightTbody.appendChild(rightRow);
  });
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   COMPUTE SERVER COUNT VALIDATION
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function getComputeOSTotal() {
  var total = 0;
  document.querySelectorAll('#compute-os-tbody .compute-number').forEach(function(inp) {
    var v = parseFloat(inp.value);
    if (!isNaN(v) && v > 0) total += v;
  });
  return total;
}

function getComputeVCPUTotal() {
  var total  = 0;
  var inputs = document.querySelectorAll('#compute-vcpu-tbody .compute-number');
  inputs.forEach(function(inp, idx) {
    if ((idx + 1) % 3 === 0) {
      var v = parseFloat(inp.value);
      if (!isNaN(v) && v > 0) total += v;
    }
  });
  return total;
}

function validateComputeCounts() {
  var warning = document.getElementById('compute-count-warning');
  if (warning) warning.style.display = 'none';
}

function getMidrangeOSBreakdown() {
  var totals = { aix_lpar: 0, ibmi_lpar: 0 };
  document.querySelectorAll('#midrange-os-tbody tr').forEach(function(row) {
    var osSelect = row.querySelector('select.compute-select');
    var serverInput = row.querySelector('input.compute-number');
    if (!osSelect || !serverInput) return;

    var os = String(osSelect.value || '').toLowerCase();
    var count = parseFloat(serverInput.value);
    if (isNaN(count) || count <= 0) return;

    if (os === 'aix_lpar') totals.aix_lpar += count;
    if (os === 'ibmi_lpar') totals.ibmi_lpar += count;
  });
  return totals;
}

function getMidrangeVCPUBreakdown() {
  var totals = { aix_lpar: 0, ibmi_lpar: 0 };
  document.querySelectorAll('#midrange-vcpu-tbody tr').forEach(function(row) {
    var osSelect = row.querySelector('select.compute-select');
    var inputs = row.querySelectorAll('input.compute-number');
    if (!osSelect || inputs.length < 3) return;

    var os = String(osSelect.value || '').toLowerCase();
    var count = parseFloat(inputs[2].value);
    if (isNaN(count) || count <= 0) return;

    if (os === 'aix_lpar') totals.aix_lpar += count;
    if (os === 'ibmi_lpar') totals.ibmi_lpar += count;
  });
  return totals;
}

function validateMidrangeCounts() {
  var osTotals = getMidrangeOSBreakdown();
  var vcpuTotals = getMidrangeVCPUBreakdown();
  var aixOsTotal = osTotals.aix_lpar;
  var ibmiOsTotal = osTotals.ibmi_lpar;
  var aixVcpuTotal = vcpuTotals.aix_lpar;
  var ibmiVcpuTotal = vcpuTotals.ibmi_lpar;

  var warning = document.getElementById('midrange-count-warning');
  var warnAixOS = document.getElementById('warn-midrange-aix-os-count');
  var warnAixVCPU = document.getElementById('warn-midrange-aix-vcpu-count');
  var warnIbmiOS = document.getElementById('warn-midrange-ibmi-os-count');
  var warnIbmiVCPU = document.getElementById('warn-midrange-ibmi-vcpu-count');
  if (!warning) return;

  var matchesAix = aixOsTotal === aixVcpuTotal;
  var matchesIbmi = ibmiOsTotal === ibmiVcpuTotal;

  if (!matchesAix || !matchesIbmi) {
    if (warnAixOS) warnAixOS.textContent = aixOsTotal;
    if (warnAixVCPU) warnAixVCPU.textContent = aixVcpuTotal;
    if (warnIbmiOS) warnIbmiOS.textContent = ibmiOsTotal;
    if (warnIbmiVCPU) warnIbmiVCPU.textContent = ibmiVcpuTotal;
    warning.style.display = 'flex';
  } else {
    warning.style.display = 'none';
  }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MIDRANGE ROWS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function updateMidrangeAddButton() {
  var tbody  = document.getElementById('midrange-os-tbody');
  var button = document.getElementById('midrange-add-row-btn');
  if (!button || !tbody) return;
  button.disabled      = false;
  button.style.opacity = '1';
  button.style.cursor  = 'pointer';
}

function addMidrangeOSRow() {
  var tbody = document.getElementById('midrange-os-tbody');
  var rowNum = tbody.rows.length;
  var row = document.createElement('tr');
  row.className = 'compute-row';
  row.innerHTML =
    '<td class="compute-td">' +
      '<div class="select-wrapper">' +
        '<select class="compute-select" id="midrange_os_' + rowNum + '" name="midrange_os_' + rowNum + '"' +
        ' onchange="updateMidrangeServerSummary(); updateMidrangeMSSizing();">' +
          '<option value="aix_lpar" selected>AIX LPAR</option>' +
          '<option value="ibmi_lpar">IBMi LPAR</option>' +
        '</select>' +
      '</div>' +
    '</td>' +
    '<td class="compute-td">' +
      '<div class="select-wrapper">' +
        '<select class="compute-select" id="midrange_type_' + rowNum + '" name="midrange_type_' + rowNum + '"' +
        ' onchange="updateMidrangeServerSummary(); updateMidrangeMSSizing();">' +
          '<option value="prod" selected>Prod</option>' +
          '<option value="nonprod">Non-Prod</option>' +
        '</select>' +
      '</div>' +
    '</td>' +
    '<td class="compute-td">' +
      '<input type="number" id="midrange_servers_' + rowNum + '" name="midrange_servers_' + rowNum + '" class="compute-number" value="0" min="0" step="1"' +
      ' oninput="updateMidrangeServerSummary(); updateMidrangeMSSizing();" />' +
    '</td>' +
    '<td class="compute-td" style="text-align:center;">' +
      '<button class="delete-btn" onclick="deleteMidrangeOSRow(this)" title="Delete row">\u2715</button>' +
    '</td>';
  tbody.appendChild(row);
  updateMidrangeAddButton();
  updateMidrangeServerSummary();
  row.querySelectorAll('.compute-number').forEach(function(inp) {
    inp.addEventListener('input', updateMidrangeMSSizing);
  });
}

function deleteMidrangeOSRow(btn) {
  var tbody = document.getElementById('midrange-os-tbody');
  if (tbody.rows.length <= 1) return;
  var row = btn.closest('tr');
  if (row) {
    row.remove();
    updateMidrangeAddButton();
    updateMidrangeServerSummary();
    updateMidrangeMSSizing();
  }
}

function updateMidrangeVcpuButton() {
  var tbody  = document.getElementById('midrange-vcpu-tbody');
  var button = document.getElementById('midrange-vcpu-add-row-btn');
  if (!button || !tbody) return;
  var activeRows = tbody.querySelectorAll('tr.compute-row').length;
  button.disabled      = activeRows >= 2;
  button.style.opacity = button.disabled ? '0.65' : '1';
  button.style.cursor  = button.disabled ? 'not-allowed' : 'pointer';
}

function addMidrangeVcpuRow() {
  var tbody = document.getElementById('midrange-vcpu-tbody');
  if (!tbody) return;
  var activeRows = tbody.querySelectorAll('tr.compute-row').length;
  if (activeRows >= 2) return;

  var rowNum = 0;
  tbody.querySelectorAll('input[id^="midrange_vcpu_servers_"]').forEach(function(inp) {
    var id = inp.id || '';
    var m = id.match(/midrange_vcpu_servers_(\d+)$/);
    if (!m) return;
    var n = parseInt(m[1], 10);
    if (!isNaN(n) && n >= rowNum) rowNum = n + 1;
  });

  var row = document.createElement('tr');
  row.className = 'compute-row';
  row.innerHTML =
    '<td class="compute-td">' +
      '<div class="select-wrapper">' +
        '<select class="compute-select" id="midrange_vcpu_os_' + rowNum + '" name="midrange_vcpu_os_' + rowNum + '"' +
        ' onchange="updateMidrangeServerSummary(); updateMidrangeMSSizing(); calcMidrangeInfraCost();">' +
          '<option value="aix_lpar" selected>AIX LPAR</option>' +
          '<option value="ibmi_lpar">IBMi LPAR</option>' +
        '</select>' +
      '</div>' +
    '</td>' +
    '<td class="compute-td">' +
      '<input type="number" id="midrange_vcpu_' + rowNum + '" name="midrange_vcpu_' + rowNum + '" class="compute-number" value="0" min="0" step="1" oninput="updateMidrangeServerSummary(); updateMidrangeMSSizing(); calcMidrangeInfraCost();" />' +
    '</td>' +
    '<td class="compute-td">' +
      '<input type="number" id="midrange_vram_' + rowNum + '" name="midrange_vram_' + rowNum + '" class="compute-number" value="0" min="0" step="1" oninput="updateMidrangeServerSummary(); updateMidrangeMSSizing(); calcMidrangeInfraCost();" />' +
    '</td>' +
    '<td class="compute-td" style="display:flex; align-items:center; justify-content:space-between; gap:8px;">' +
      '<input type="number" id="midrange_vcpu_servers_' + rowNum + '" name="midrange_vcpu_servers_' + rowNum + '" class="compute-number" value="0" min="0" step="1" style="flex:1;" oninput="updateMidrangeServerSummary(); updateMidrangeMSSizing(); calcMidrangeInfraCost();" />' +
      '<button class="delete-btn" onclick="deleteMidrangeVcpuRow(this)" title="Delete row">\u2715</button>' +
    '</td>';
  tbody.appendChild(row);
  updateMidrangeVcpuButton();
}

function deleteMidrangeVcpuRow(btn) {
  var tbody = document.getElementById('midrange-vcpu-tbody');
  if (tbody.rows.length <= 1) return;
  var row = btn.closest('tr');
  if (row) {
    row.remove();
    updateMidrangeVcpuButton();
    validateMidrangeCounts();
  }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   STORAGE ROWS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function addStorageRow() {
  var tbody = document.getElementById('storage-tbody');
  var rowNum = tbody.rows.length;
  var row   = document.createElement('tr');
  row.className = 'compute-row';
  row.innerHTML =
    '<td class="compute-td">' +
      '<div class="select-wrapper">' +
        '<select class="compute-select" id="storage_arch_' + rowNum + '" name="storage_arch_' + rowNum + '" onchange="updateStorageSummary()">' +
          '<option value="san_high">SAN High Performance</option>' +
          '<option value="san_standard">SAN Standard Performance</option>' +
          '<option value="nas_high">NAS High Performance</option>' +
          '<option value="nas_standard">NAS Standard Performance</option>' +
          '<option value="object_storage">Object Storage</option>' +
          '<option value="dasd_midrange">DASD Storage - Midrange</option>' +
        '</select>' +
      '</div>' +
    '</td>' +
    '<td class="compute-td">' +
      '<div class="select-wrapper">' +
        '<select class="compute-select" id="storage_type_' + rowNum + '" name="storage_type_' + rowNum + '" onchange="updateStorageSummary()">' +
          '<option value="prod">Prod</option>' +
          '<option value="nonprod">Non-Prod</option>' +
        '</select>' +
      '</div>' +
    '</td>' +
    '<td class="compute-td">' +
      '<input type="number" id="storage_tb_' + rowNum + '" name="storage_tb_' + rowNum + '" class="compute-number" value="0" min="0" step="1"' +
      ' oninput="updateStorageSummary()" />' +
    '</td>' +
    '<td class="compute-td" style="text-align:center;">' +
      '<button class="delete-btn" onclick="deleteStorageRow(this)" title="Delete row">\u2715</button>' +
    '</td>';
  tbody.appendChild(row);
  updateStorageSummary();
}

function deleteStorageRow(btn) {
  var tbody = document.getElementById('storage-tbody');
  if (tbody.rows.length <= 1) return;
  var row = btn.closest('tr');
  if (row) {
    row.remove();
    updateStorageSummary();
  }
}

function updateStorageSummary() {
  var total = 0, prodTotal = 0, nonProdTotal = 0, fepTotal = 0;

  document.querySelectorAll('#storage-tbody tr').forEach(function(row) {
    var selects = row.querySelectorAll('select');
    if (selects.length < 2) return;
    var arch    = selects[0].value;
    var type    = selects[1].value;
    var tbInput = row.querySelector('input[type="number"]');
    var tb      = parseFloat(tbInput ? tbInput.value : 0) || 0;

    total += tb;
    if (type === 'prod') {
      prodTotal += tb;
      if (arch !== 'object_storage') fepTotal += tb;
    } else {
      nonProdTotal += tb;
    }
  });

  var stTotalEl   = document.getElementById('storage-total-tb');
  var stProdEl    = document.getElementById('storage-prod-tb');
  var stNprodEl   = document.getElementById('storage-nonprod-tb');
  var fedTbEl     = document.getElementById('backup-fed-tb');
  var backupTbEl  = document.getElementById('backup-storage-tb');

  if (stTotalEl)  stTotalEl.textContent  = total.toFixed(0);
  if (stProdEl)   stProdEl.textContent   = prodTotal.toFixed(0);
  if (stNprodEl)  stNprodEl.textContent  = nonProdTotal.toFixed(0);
  if (fedTbEl)    fedTbEl.value          = fepTotal.toFixed(0);
  if (backupTbEl) backupTbEl.value       = (fepTotal * 3).toFixed(0);
  calcStorageMSSizing();
  calcStorageInfraCost();
  if (typeof updateDatacenterSizing === 'function') updateDatacenterSizing();
  updateLiveSizingVisibility();
}

function parseDatacenterNumber(value, fallback) {
  var cleaned = String(value === undefined || value === null ? '' : value)
    .replace(/[,\s]/g, '')
    .replace(/[^0-9.\-]/g, '');
  var n = parseFloat(cleaned);
  return isNaN(n) ? (fallback || 0) : n;
}

function parseDatacenterRatio(value, fallback, isPercent) {
  var raw = String(value === undefined || value === null ? '' : value).trim();
  var parsed = parseDatacenterNumber(raw, fallback || 0);
  if (isPercent) {
    if (/%\s*$/.test(raw) || parsed > 1) return parsed / 100;
  }
  return parsed;
}

// Extracts the TB denominator (e.g. 250 from "KW per 250TB") from the UOM field so it stays in sync with Infrastructure Rates.
function parseDatacenterTbDivisor(uomValue, fallback) {
  var match = String(uomValue || '').match(/([\d,.]+)\s*TB/i);
  if (match) {
    var num = parseDatacenterNumber(match[1], fallback);
    if (num > 0) return num;
  }
  return fallback;
}

function formatDatacenterPct(value) {
  return (Number(value || 0) * 100).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }) + '%';
}

function formatDatacenterKw(value) {
  return Math.round(Number(value || 0)).toLocaleString('en-US');
}

function formatDatacenterRate(value) {
  return '$' + Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatDatacenterMoney(value) {
  return '$' + Math.round(Number(value || 0)).toLocaleString('en-US');
}

function splitPhysicalHosts(totalHosts, prodShare) {
  var total = Math.max(0, Math.round(Number(totalHosts || 0)));
  var share = Number(prodShare || 0);
  if (share < 0) share = 0;
  if (share > 1) share = 1;
  var prod = Math.round(total * share);
  if (prod > total) prod = total;
  var nonProd = total - prod;
  return { total: total, prod: prod, nonProd: nonProd };
}

function readDistributedPhysicalHostsFromVmware() {
  return parseDatacenterNumber((document.getElementById('vcf-hosts') || {}).textContent, 0);
}

function readMidrangePhysicalHostsFromSwma() {
  var aixHosts = parseDatacenterNumber((document.getElementById('swma-aix-max-hosts') || {}).textContent, 0);
  var ibmiHosts = parseDatacenterNumber((document.getElementById('swma-ibmi-max-hosts') || {}).textContent, 0);
  return aixHosts + ibmiHosts;
}

function readDatacenterNumericField(id, fallback) {
  var el = document.getElementById(id);
  if (!el) return fallback || 0;
  var value = '';
  if (typeof el.value === 'string' && el.value.trim() !== '') value = el.value;
  else value = el.textContent || '';
  return parseDatacenterNumber(value, fallback || 0);
}

function getDatacenterRatesByRegion() {
  return {
    'US Northeast': parseDatacenterNumber((document.getElementById('datacenter-rate-us-northeast') || {}).value, 400),
    'US Southeast': parseDatacenterNumber((document.getElementById('datacenter-rate-us-southeast') || {}).value, 350),
    'US Midwest': parseDatacenterNumber((document.getElementById('datacenter-rate-us-midwest') || {}).value, 325),
    'US West': parseDatacenterNumber((document.getElementById('datacenter-rate-us-west') || {}).value, 425)
  };
}

function buildDatacenterPowerTableRows(model) {
  var rows = [];

  function addSection(title) {
    rows.push('<tr><td class="dc-section-header" colspan="10">' + title + '</td></tr>');
  }

  function addRow(label, metric) {
    rows.push(
      '<tr>' +
        '<td class="dc-label">' + label + '</td>' +
        '<td>' + formatDatacenterKw(metric.total) + '</td>' +
        '<td>' + formatDatacenterKw(metric.prod) + '</td>' +
        '<td>' + formatDatacenterKw(metric.nonProd) + '</td>' +
        '<td>' + formatDatacenterPct(metric.prodPct) + '</td>' +
        '<td>' + formatDatacenterPct(metric.nonProdPct) + '</td>' +
        '<td>' + metric.ratioText + '</td>' +
        '<td>' + formatDatacenterKw(metric.totalKw) + '</td>' +
        '<td>' + formatDatacenterKw(metric.prodKw) + '</td>' +
        '<td>' + formatDatacenterKw(metric.nonProdKw) + '</td>' +
      '</tr>'
    );
  }

  addSection('Distributed Services');
  addRow('Physical Servers (Hosts)', model.distributed);

  addSection('Midrange');
  addRow('Physical Servers (Hosts)', model.midrange);

  addSection('Storage & Backup');
  addRow('Storage Total TBs (Prod and Non Prod)', model.storage);
  addRow('Backup Total TBs - Backup Capacity', model.backupCapacity);
  addRow('Backup Total TBs - FEP', model.backupFep);

  addSection('Mainframe');
  addRow('No. of DC sites', model.mainframe);
  rows.push('<tr><td class="dc-note">&nbsp;</td><td class="dc-note" colspan="9">Assuming 1 site is Prod and 1 site is DR</td></tr>');

  return rows.join('');
}

function calcDatacenterInfraCost() {
  updateDatacenterSizing();
}

function updateDatacenterSizing() {
  var powerTbody = document.getElementById('datacenter-power-tbody');
  if (!powerTbody) return;

  // Distributed host source of truth: VMware Live Sizing (vcf-hosts).
  // Virtual server split is only used to allocate Prod/Non-Prod share.
  var distributedVirtualProd = readDatacenterNumericField('compute-prod-servers', 0);
  var distributedVirtualNonProd = readDatacenterNumericField('compute-nonprod-servers', 0);
  var distributedVirtualTotal = distributedVirtualProd + distributedVirtualNonProd;
  var distributedProdShare = distributedVirtualTotal > 0 ? distributedVirtualProd / distributedVirtualTotal : 0;
  var distributedPhysical = splitPhysicalHosts(readDistributedPhysicalHostsFromVmware(), distributedProdShare);
  var distributedTotal = distributedPhysical.total;
  var distributedProd = distributedPhysical.prod;
  var distributedNonProd = distributedPhysical.nonProd;
  var distributedProdPct = distributedTotal > 0 ? distributedProd / distributedTotal : 0;
  var distributedNonProdPct = distributedTotal > 0 ? distributedNonProd / distributedTotal : 0;

  // Midrange host source of truth: SWMA Live Sizing (AIX + IBMi max hosts).
  // Virtual server split is only used to allocate Prod/Non-Prod share.
  var midrangeVirtualProd = readDatacenterNumericField('midrange-prod-servers', 0);
  var midrangeVirtualNonProd = readDatacenterNumericField('midrange-nonprod-servers', 0);
  var midrangeVirtualTotal = midrangeVirtualProd + midrangeVirtualNonProd;
  var midrangeProdShare = midrangeVirtualTotal > 0 ? midrangeVirtualProd / midrangeVirtualTotal : 0;
  var midrangePhysical = splitPhysicalHosts(readMidrangePhysicalHostsFromSwma(), midrangeProdShare);
  var midrangeTotal = midrangePhysical.total;
  var midrangeProd = midrangePhysical.prod;
  var midrangeNonProd = midrangePhysical.nonProd;
  var midrangeProdPct = midrangeTotal > 0 ? midrangeProd / midrangeTotal : 0;
  var midrangeNonProdPct = midrangeTotal > 0 ? midrangeNonProd / midrangeTotal : 0;

  var storageTotal = parseDatacenterNumber((document.getElementById('storage-total-tb') || {}).textContent, 0);
  var storageProd = parseDatacenterNumber((document.getElementById('storage-prod-tb') || {}).textContent, 0);
  var storageNonProd = parseDatacenterNumber((document.getElementById('storage-nonprod-tb') || {}).textContent, 0);
  var storageBase = storageTotal > 0 ? storageTotal : (storageProd + storageNonProd);
  var storageProdPct = storageBase > 0 ? storageProd / storageBase : 0;
  var storageNonProdPct = storageBase > 0 ? storageNonProd / storageBase : 0;

  var backupCapacityTotal = parseDatacenterNumber((document.getElementById('backup-storage-tb') || {}).value, 0);
  var backupFepTotal = parseDatacenterNumber((document.getElementById('backup-fed-tb') || {}).value, 0);
  var backupCapacityProd = backupCapacityTotal * storageProdPct;
  var backupCapacityNonProd = backupCapacityTotal * storageNonProdPct;
  var backupFepProd = backupFepTotal * storageProdPct;
  var backupFepNonProd = backupFepTotal * storageNonProdPct;

  var ratioDistributed = parseDatacenterRatio((document.getElementById('datacenter-util-distributed') || {}).value, 1, false);
  var ratioMidrange = parseDatacenterRatio((document.getElementById('datacenter-util-midrange') || {}).value, 3, false);
  var ratioStorage = parseDatacenterRatio((document.getElementById('datacenter-util-storage') || {}).value, 1, false);
  var ratioBackupCapacity = parseDatacenterRatio((document.getElementById('datacenter-util-backup-capacity') || {}).value, ratioStorage, false);
  var ratioBackupFep = parseDatacenterRatio((document.getElementById('datacenter-util-backup-fep') || {}).value, ratioStorage, false);
  var ratioMainframe = parseDatacenterRatio((document.getElementById('datacenter-util-mainframe') || {}).value, 10, false);
  var ratioNetwork = parseDatacenterRatio((document.getElementById('datacenter-util-network') || {}).value, 10, true);

  // TB denominators are read from the UOM text (e.g. "KW per 250TB") so ratio changes on Infrastructure Rates propagate automatically.
  var storageTbDivisor = parseDatacenterTbDivisor((document.getElementById('datacenter-util-uom-storage') || {}).value, 250);
  var backupCapacityTbDivisor = parseDatacenterTbDivisor((document.getElementById('datacenter-util-uom-backup-capacity') || {}).value, 250);
  var backupFepTbDivisor = parseDatacenterTbDivisor((document.getElementById('datacenter-util-uom-backup-fep') || {}).value, 250);

  function makeMetric(total, prod, nonProd, prodPct, nonProdPct, ratio, tbDivisor) {
    var totalKw = tbDivisor ? (total / tbDivisor) * ratio : total * ratio;
    var prodKw = totalKw * prodPct;
    var nonProdKw = totalKw * nonProdPct;
    var ratioNumberText = Number(ratio).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    return {
      total: total,
      prod: prod,
      nonProd: nonProd,
      prodPct: prodPct,
      nonProdPct: nonProdPct,
      ratioText: tbDivisor ? (ratioNumberText + ' per ' + Number(tbDivisor).toLocaleString('en-US') + 'TB') : ratioNumberText,
      totalKw: totalKw,
      prodKw: prodKw,
      nonProdKw: nonProdKw
    };
  }

  var distributed = makeMetric(distributedTotal, distributedProd, distributedNonProd, distributedProdPct, distributedNonProdPct, ratioDistributed, 0);
  var midrange = makeMetric(midrangeTotal, midrangeProd, midrangeNonProd, midrangeProdPct, midrangeNonProdPct, ratioMidrange, 0);
  var storage = makeMetric(storageTotal, storageProd, storageNonProd, storageProdPct, storageNonProdPct, ratioStorage, storageTbDivisor);
  var backupCapacity = makeMetric(backupCapacityTotal, backupCapacityProd, backupCapacityNonProd, storageProdPct, storageNonProdPct, ratioBackupCapacity, backupCapacityTbDivisor);
  var backupFep = makeMetric(backupFepTotal, backupFepProd, backupFepNonProd, storageProdPct, storageNonProdPct, ratioBackupFep, backupFepTbDivisor);
  var mainframe = {
    total: 2,
    prod: 1,
    nonProd: 1,
    prodPct: 0.5,
    nonProdPct: 0.5,
    ratioText: Number(ratioMainframe).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }),
    totalKw: 2 * ratioMainframe,
    prodKw: ratioMainframe,
    nonProdKw: ratioMainframe
  };

  powerTbody.innerHTML = buildDatacenterPowerTableRows({
    distributed: distributed,
    midrange: midrange,
    storage: storage,
    backupCapacity: backupCapacity,
    backupFep: backupFep,
    mainframe: mainframe
  });

  var totalKwExclNetwork = distributed.totalKw + midrange.totalKw + storage.totalKw + backupCapacity.totalKw + backupFep.totalKw + mainframe.totalKw;
  var prodKwExclNetwork = distributed.prodKw + midrange.prodKw + storage.prodKw + backupCapacity.prodKw + backupFep.prodKw + mainframe.prodKw;
  var nonProdKwExclNetwork = distributed.nonProdKw + midrange.nonProdKw + storage.nonProdKw + backupCapacity.nonProdKw + backupFep.nonProdKw + mainframe.nonProdKw;

  var totalKwNetwork = totalKwExclNetwork * ratioNetwork;
  var prodKwNetwork = prodKwExclNetwork * ratioNetwork;
  var nonProdKwNetwork = nonProdKwExclNetwork * ratioNetwork;

  // Round KW requirements once here; cost calculations below must use these rounded values, not the raw decimals.
  var totalKwRequirement = Math.round(totalKwExclNetwork + totalKwNetwork);
  var prodKwRequirement = Math.round(prodKwExclNetwork + prodKwNetwork);
  var nonProdKwRequirement = Math.round(nonProdKwExclNetwork + nonProdKwNetwork);

  var networkSummaryLabel = document.getElementById('dc-network-summary-label');
  if (networkSummaryLabel) {
    networkSummaryLabel.textContent = 'Network Overhead (' + formatDatacenterPct(ratioNetwork) + ')';
  }

  var summaryMap = {
    'dc-total-kw-excl': totalKwExclNetwork,
    'dc-prod-kw-excl': prodKwExclNetwork,
    'dc-nonprod-kw-excl': nonProdKwExclNetwork,
    'dc-total-kw-network': totalKwNetwork,
    'dc-prod-kw-network': prodKwNetwork,
    'dc-nonprod-kw-network': nonProdKwNetwork,
    'dc-total-kw-req': totalKwRequirement,
    'dc-prod-kw-req': prodKwRequirement,
    'dc-nonprod-kw-req': nonProdKwRequirement
  };

  Object.keys(summaryMap).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = formatDatacenterKw(summaryMap[id]);
  });

  var ratesByRegion = getDatacenterRatesByRegion();
  var prodRegion = ((document.getElementById('datacenter-prod-location') || {}).value || 'US Northeast');
  var nonProdRegion = ((document.getElementById('datacenter-nonprod-location') || {}).value || 'US Northeast');
  var prodRate = ratesByRegion[prodRegion] || 0;
  var nonProdRate = ratesByRegion[nonProdRegion] || 0;

  var prodMonthlyCost = prodKwRequirement * prodRate;
  var prodAnnualCost = prodMonthlyCost * 12;
  var nonProdMonthlyCost = nonProdKwRequirement * nonProdRate;
  var nonProdAnnualCost = nonProdMonthlyCost * 12;
  var totalMonthlyCost = prodMonthlyCost + nonProdMonthlyCost;
  var totalAnnualCost = prodAnnualCost + nonProdAnnualCost;
  var prodRackRequirement = Math.ceil(prodKwRequirement / 5);
  var nonProdRackRequirement = Math.ceil(nonProdKwRequirement / 5);
  var totalRackRequirement = prodRackRequirement + nonProdRackRequirement;

  var prodRateDisplay = document.getElementById('datacenter-prod-rate-display');
  if (prodRateDisplay) prodRateDisplay.textContent = 'Prod Rate: ' + formatDatacenterRate(prodRate) + '/KW';
  var nonProdRateDisplay = document.getElementById('datacenter-nonprod-rate-display');
  if (nonProdRateDisplay) nonProdRateDisplay.textContent = 'Non-Prod Rate: ' + formatDatacenterRate(nonProdRate) + '/KW';

  var costMap = {
    'dc-prod-region-rate': prodRegion + ' @ ' + formatDatacenterRate(prodRate) + '/KW',
    'dc-nonprod-region-rate': nonProdRegion + ' @ ' + formatDatacenterRate(nonProdRate) + '/KW',
    'dc-total-region-rate': 'Prod + Non-Prod',
    'dc-prod-kw-cost-input': formatDatacenterKw(prodKwRequirement) + ' KW',
    'dc-nonprod-kw-cost-input': formatDatacenterKw(nonProdKwRequirement) + ' KW',
    'dc-total-kw-cost-input': formatDatacenterKw(totalKwRequirement) + ' KW',
    'dc-prod-monthly': formatDatacenterMoney(prodMonthlyCost),
    'dc-nonprod-monthly': formatDatacenterMoney(nonProdMonthlyCost),
    'dc-total-monthly': formatDatacenterMoney(totalMonthlyCost),
    'dc-prod-annual': formatDatacenterMoney(prodAnnualCost),
    'dc-nonprod-annual': formatDatacenterMoney(nonProdAnnualCost),
    'dc-total-annual': formatDatacenterMoney(totalAnnualCost)
  };

  Object.keys(costMap).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = costMap[id];
  });

  var breakdownTbody = document.getElementById('datacenter-cost-breakdown-tbody');
  if (breakdownTbody) {
    breakdownTbody.innerHTML =
      '<tr>' +
        '<td class="dc-label">Prod</td>' +
        '<td>' + prodRegion + '</td>' +
        '<td>' + formatDatacenterRate(prodRate) + '</td>' +
        '<td>' + formatDatacenterKw(prodKwRequirement) + ' KW</td>' +
        '<td>' + prodRackRequirement.toLocaleString('en-US') + '</td>' +
        '<td>' + formatDatacenterMoney(prodMonthlyCost) + '</td>' +
        '<td>' + formatDatacenterMoney(prodAnnualCost) + '</td>' +
      '</tr>' +
      '<tr>' +
        '<td class="dc-label">Non-Prod</td>' +
        '<td>' + nonProdRegion + '</td>' +
        '<td>' + formatDatacenterRate(nonProdRate) + '</td>' +
        '<td>' + formatDatacenterKw(nonProdKwRequirement) + ' KW</td>' +
        '<td>' + nonProdRackRequirement.toLocaleString('en-US') + '</td>' +
        '<td>' + formatDatacenterMoney(nonProdMonthlyCost) + '</td>' +
        '<td>' + formatDatacenterMoney(nonProdAnnualCost) + '</td>' +
      '</tr>' +
      '<tr class="dc-emphasis-row">' +
        '<td class="dc-label">TOTAL</td>' +
        '<td>Prod: ' + prodRegion + ', Non-Prod: ' + nonProdRegion + '</td>' +
        '<td>Prod: ' + formatDatacenterRate(prodRate) + ', Non-Prod: ' + formatDatacenterRate(nonProdRate) + '</td>' +
        '<td>' + formatDatacenterKw(totalKwRequirement) + ' KW</td>' +
        '<td>' + totalRackRequirement.toLocaleString('en-US') + '</td>' +
        '<td>' + formatDatacenterMoney(totalMonthlyCost) + '</td>' +
        '<td>' + formatDatacenterMoney(totalAnnualCost) + '</td>' +
      '</tr>';
  }

  var totalKwMeta = document.getElementById('dc-total-kw-meta');
  var totalRackMeta = document.getElementById('dc-total-rack-meta');
  var monthlyPerKwMeta = document.getElementById('dc-monthly-per-kw');
  var annualPerKwMeta = document.getElementById('dc-annual-per-kw');
  var monthlyPerRackMeta = document.getElementById('dc-monthly-per-rack');
  var annualPerRackMeta = document.getElementById('dc-annual-per-rack');
  if (totalKwMeta) totalKwMeta.textContent = formatDatacenterKw(totalKwRequirement);
  if (totalRackMeta) totalRackMeta.textContent = totalRackRequirement.toLocaleString('en-US');
  if (monthlyPerKwMeta) monthlyPerKwMeta.textContent = totalKwRequirement > 0 ? formatDatacenterMoney(totalMonthlyCost / totalKwRequirement) : '$0';
  if (annualPerKwMeta) annualPerKwMeta.textContent = totalKwRequirement > 0 ? formatDatacenterMoney(totalAnnualCost / totalKwRequirement) : '$0';
  if (monthlyPerRackMeta) monthlyPerRackMeta.textContent = totalRackRequirement > 0 ? formatDatacenterMoney(totalMonthlyCost / totalRackRequirement) : '$0';
  if (annualPerRackMeta) annualPerRackMeta.textContent = totalRackRequirement > 0 ? formatDatacenterMoney(totalAnnualCost / totalRackRequirement) : '$0';
  var stripAnnual = document.getElementById('dc-total-cost-annual-strip');
  if (stripAnnual) stripAnnual.textContent = formatDatacenterMoney(totalAnnualCost);
  var stripMonthly = document.getElementById('dc-total-cost-monthly-strip');
  if (stripMonthly) stripMonthly.textContent = formatDatacenterMoney(totalMonthlyCost);
  var collapsed = document.getElementById('datacenter-infra-collapsed-total-value');
  if (collapsed) collapsed.textContent = formatDatacenterMoney(totalAnnualCost);
}

function toggleDatacenterInfraSizing() {
  var body = document.getElementById('datacenter-infra-sizing-body');
  var arrow = document.getElementById('datacenter-infra-sizing-arrow');
  var label = document.getElementById('datacenter-infra-sizing-label');
  var collapsed = document.getElementById('datacenter-infra-collapsed-total');
  if (!body) return;

  var isCollapsed = body.style.display === 'none';
  if (isCollapsed) {
    body.style.display = 'block';
    if (arrow) arrow.style.transform = 'rotate(0deg)';
    if (label) label.textContent = 'Collapse';
    if (collapsed) collapsed.style.display = 'none';
  } else {
    body.style.display = 'none';
    if (arrow) arrow.style.transform = 'rotate(-90deg)';
    if (label) label.textContent = 'Expand';
    if (collapsed) collapsed.style.display = 'inline-flex';
  }
}

function toggleOverlaysCFSSizing() {
  var body = document.getElementById('overlays-cfs-sizing-body');
  var arrow = document.getElementById('overlays-cfs-sizing-arrow');
  var label = document.getElementById('overlays-cfs-sizing-label');
  var collapsed = document.getElementById('overlays-cfs-collapsed-total');
  if (!body) return;

  var isCollapsed = body.style.display === 'none';
  if (isCollapsed) {
    body.style.display = 'block';
    if (arrow) arrow.style.transform = 'rotate(0deg)';
    if (label) label.textContent = 'Collapse';
    if (collapsed) collapsed.style.display = 'none';
  } else {
    body.style.display = 'none';
    if (arrow) arrow.style.transform = 'rotate(-90deg)';
    if (label) label.textContent = 'Expand';
    if (collapsed) {
      var bannerVal = document.getElementById('overlays-cfs-total-value');
      var collapsedVal = document.getElementById('overlays-cfs-collapsed-total-value');
      if (bannerVal && collapsedVal) collapsedVal.textContent = bannerVal.textContent;
      collapsed.style.display = 'inline-flex';
    }
  }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   OVERLAYS / CROSS FUNCTIONAL (TOOLS & PMO/SMO/GOVERNANCE)
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

// Reads FTE + annual totals from a pair of US/India ".ms-subtotal-row" style tables.
function getMsStyleTowerTotals(usSelector, indiaSelector, fteCol, annualCol) {
  var us = getManagedServicesSummaryFromTable(usSelector, fteCol, annualCol);
  var india = getManagedServicesSummaryFromTable(indiaSelector, fteCol, annualCol);
  return { fte: us.fte + india.fte, annual: us.annual + india.annual };
}

// Reads the overall (pre-split) FTE total from a ".dbmw-ms-total-row" style panel (Database/Middleware/Mainframe).
function getDbmwStyleTowerFte(panelSelector) {
  var panel = document.querySelector(panelSelector);
  if (!panel) return 0;
  var row = panel.querySelector('tr.dbmw-ms-total-row');
  if (!row) return 0;
  var cells = row.querySelectorAll('td');
  if (!cells[3]) return 0;
  var n = parseFloat((cells[3].textContent || '').replace(/[^0-9.\-]/g, ''));
  return isNaN(n) ? 0 : n;
}

// Reads the location-specific FTE split (column 4, distinct from column 3's pre-split total) from a US or India dbmw-ms-total-row panel.
function getDbmwStyleTowerLocationFte(panelSelector) {
  var panel = document.querySelector(panelSelector);
  if (!panel) return 0;
  var row = panel.querySelector('tr.dbmw-ms-total-row');
  if (!row) return 0;
  var cells = row.querySelectorAll('td');
  if (!cells[4]) return 0;
  var n = parseFloat((cells[4].textContent || '').replace(/[^0-9.\-]/g, ''));
  return isNaN(n) ? 0 : n;
}

// Shows/hides the whole Overlays card + placeholder, driven only by aggregated Managed Services cost (never by a tower checkbox).
function setOverlaysCardVisible(visible) {
  var card = document.getElementById('card-tower-overlays');
  if (!card) return;
  var placeholder = document.getElementById('card-tower-overlays-placeholder');
  if (!placeholder) {
    placeholder = document.createElement('div');
    placeholder.id = 'card-tower-overlays-placeholder';
    placeholder.className = 'live-sizing-placeholder';
    placeholder.style.marginTop = '16px';
    placeholder.textContent = 'No Managed Services configured. Cross Functional services depend on configured Managed Services.';
    card.parentNode.insertBefore(placeholder, card);
  }
  if (visible) {
    card.style.setProperty('display', 'block', 'important');
    placeholder.style.display = 'none';
  } else {
    card.style.setProperty('display', 'none', 'important');
    placeholder.style.display = '';
  }
}

function updateOverlaysCFSSizing() {
  var section = document.getElementById('overlays-cfs-sizing-section');
  if (!section) return;

  var distributed = { annual: parseCurrencyNumber(document.getElementById('ms-total-value') ? document.getElementById('ms-total-value').textContent : '0') };
  distributed.fte = getMsStyleTowerTotals('#ms-us-tbody', '#ms-india-tbody', 3, 6).fte;

  var midrange = { annual: parseCurrencyNumber(document.getElementById('midrange-ms-total-value') ? document.getElementById('midrange-ms-total-value').textContent : '0') };
  midrange.fte = getMsStyleTowerTotals('#midrange-ms-us-tbody', '#midrange-ms-india-tbody', 3, 6).fte;

  var storageTotals = getMsStyleTowerTotals('#storage-ms-store-us-tbody', '#storage-ms-store-india-tbody', 4, 7);
  var backupTotals = getMsStyleTowerTotals('#storage-ms-backup-us-tbody', '#storage-ms-backup-india-tbody', 4, 7);

  var mainframe = { annual: parseCurrencyNumber(document.getElementById('mf-ms-total-value') ? document.getElementById('mf-ms-total-value').textContent : '0') };
  mainframe.fte = getDbmwStyleTowerFte('#mf-ms-us-panel-body');

  var database = { annual: parseCurrencyNumber(document.getElementById('dbmw-database-total-annual') ? document.getElementById('dbmw-database-total-annual').textContent : '0') };
  database.fte = getDbmwStyleTowerFte('#dbmw-database-us-panel-body');

  var middleware = { annual: parseCurrencyNumber(document.getElementById('dbmw-middleware-total-annual') ? document.getElementById('dbmw-middleware-total-annual').textContent : '0') };
  middleware.fte = getDbmwStyleTowerFte('#dbmw-middleware-us-panel-body');

  var network = { annual: parseCurrencyNumber(document.getElementById('network-ms-total-value') ? document.getElementById('network-ms-total-value').textContent : '0') };
  network.fte = getManagedServicesSummaryFromTable('#network-ms-fte-tbody', 1, 1).fte;

  var security = { annual: parseCurrencyNumber(document.getElementById('security-ms-total-value') ? document.getElementById('security-ms-total-value').textContent : '0') };
  security.fte = getManagedServicesSummaryFromTable('#security-ms-fte-tbody', 1, 1).fte;

  var towers = [
    { label: 'DISTRIBUTED', annual: distributed.annual, fte: distributed.fte },
    { label: 'MIDRANGE', annual: midrange.annual, fte: midrange.fte },
    { label: 'STORAGE', annual: storageTotals.annual, fte: storageTotals.fte },
    { label: 'BACKUP', annual: backupTotals.annual, fte: backupTotals.fte },
    { label: 'MAINFRAME', annual: mainframe.annual, fte: mainframe.fte },
    { label: 'DATABASE', annual: database.annual, fte: database.fte },
    { label: 'MIDDLEWARE', annual: middleware.annual, fte: middleware.fte },
    { label: 'NETWORK', annual: network.annual, fte: network.fte },
    { label: 'SECURITY', annual: security.annual, fte: security.fte }
  ];

  var totalAnnual = towers.reduce(function(sum, t) { return sum + t.annual; }, 0);
  var totalFte = towers.reduce(function(sum, t) { return sum + t.fte; }, 0);

  var tbody = document.getElementById('overlays-cfs-tbody');
  var totalBanner = document.getElementById('overlays-cfs-total-value');
  var collapsedBanner = document.getElementById('overlays-cfs-collapsed-total-value');
  var metaBanner = document.getElementById('overlays-cfs-total-meta');

  if (totalAnnual <= 0) {
    setOverlaysCardVisible(false);
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="ms-loading">Configure Managed Services above to calculate Tools &amp; Governance allocations...</td></tr>';
    if (totalBanner) totalBanner.textContent = '$0';
    if (collapsedBanner) collapsedBanner.textContent = '$0';
    if (metaBanner) metaBanner.textContent = 'Tools: $0 + Governance: $0 (0 FTEs)';
    return;
  }

  setOverlaysCardVisible(true);

  var toolsAnnual = totalAnnual * 0.15;
  var governanceAnnual = totalAnnual * 0.20;
  var governanceFte = Math.ceil(totalFte * 0.20);
  var cfsAnnual = toolsAnnual + governanceAnnual;

  function fmtMoney(n) { return '$' + Math.round(n || 0).toLocaleString('en-US'); }
  function fmtFte(n) { return (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function fmtFteWhole(n) { return Math.round(n || 0).toLocaleString('en-US'); }

  var rowsHtml = '';
  towers.forEach(function(t) {
    if (t.annual <= 0) return;
    rowsHtml += '<tr>' +
      '<td class="dc-label">' + t.label + '</td>' +
      '<td>' + fmtMoney(t.annual) + '</td>' +
      '<td>' + fmtFte(t.fte) + '</td>' +
      '<td></td>' +
      '<td></td>' +
    '</tr>';
  });

  rowsHtml += '<tr class="dc-emphasis-row">' +
    '<td class="dc-label">Total</td>' +
    '<td>' + fmtMoney(totalAnnual) + '</td>' +
    '<td>' + fmtFte(totalFte) + '</td>' +
    '<td></td>' +
    '<td></td>' +
  '</tr>';

  rowsHtml += '<tr class="dc-cfs-allocation-row">' +
    '<td class="dc-label">CFS as a % Total Labor</td>' +
    '<td></td>' +
    '<td></td>' +
    '<td class="dc-cfs-tools">15%</td>' +
    '<td class="dc-cfs-governance">20%</td>' +
  '</tr>';

  rowsHtml += '<tr class="dc-cfs-allocation-row">' +
    '<td class="dc-label">Cross Functional Services</td>' +
    '<td></td>' +
    '<td></td>' +
    '<td class="dc-cfs-tools">' + fmtMoney(toolsAnnual) + '</td>' +
    '<td class="dc-cfs-governance">' + fmtMoney(governanceAnnual) + '</td>' +
  '</tr>';

  rowsHtml += '<tr class="dc-cfs-allocation-row">' +
    '<td class="dc-label">Governance FTEs</td>' +
    '<td></td>' +
    '<td></td>' +
    '<td class="dc-cfs-tools"></td>' +
    '<td class="dc-cfs-governance">' + fmtFteWhole(governanceFte) + '</td>' +
  '</tr>';

  if (tbody) tbody.innerHTML = rowsHtml;
  if (totalBanner) totalBanner.textContent = fmtMoney(cfsAnnual);
  var overlaysMonthlyEl = document.getElementById('overlays-cfs-total-monthly-value');
  if (overlaysMonthlyEl) overlaysMonthlyEl.textContent = fmtMoney(cfsAnnual / 12);
  if (collapsedBanner) collapsedBanner.textContent = fmtMoney(cfsAnnual);
  if (metaBanner) metaBanner.textContent = 'Tools: ' + fmtMoney(toolsAnnual) + ' + Governance: ' + fmtMoney(governanceAnnual) + ' (' + fmtFteWhole(governanceFte) + ' FTEs)';
}

var _datacenterSizingListenersBound = false;
function wireDatacenterSizingListeners() {
  if (_datacenterSizingListenersBound) return;
  _datacenterSizingListenersBound = true;

  var listeners = [
    'compute-os-tbody',
    'midrange-os-tbody',
    'storage-tbody',
    'backup-fed-tb',
    'backup-storage-tb',
    'datacenter-prod-location',
    'datacenter-nonprod-location',
    'datacenter-rate-us-northeast',
    'datacenter-rate-us-southeast',
    'datacenter-rate-us-midwest',
    'datacenter-rate-us-west',
    'datacenter-util-distributed',
    'datacenter-util-midrange',
    'datacenter-util-storage',
    'datacenter-util-backup-capacity',
    'datacenter-util-backup-fep',
    'datacenter-util-mainframe',
    'datacenter-util-network'
  ];

  listeners.forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', updateDatacenterSizing);
    el.addEventListener('change', updateDatacenterSizing);
  });
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MIDRANGE â€” MANAGED SERVICES LIVE SIZING
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function getMidrangeServerCounts() {
  var counts = { aix_lpar: 0, ibmi_lpar: 0 };
  var tbody  = document.getElementById('midrange-os-tbody');
  if (!tbody) return counts;

  var rows = tbody.getElementsByTagName('tr');
  for (var i = 0; i < rows.length; i++) {
    var selects = rows[i].getElementsByTagName('select');
    var inputs  = rows[i].getElementsByTagName('input');
    if (!selects.length) continue;
    var os  = selects[0].value.toLowerCase();
    for (var j = 0; j < inputs.length; j++) {
      if (inputs[j].type === 'number') {
        var qty = parseFloat(inputs[j].value) || 0;
        if (os.indexOf('aix_lpar') !== -1)  counts.aix_lpar += qty;
        else if (os.indexOf('ibmi_lpar') !== -1) counts.ibmi_lpar += qty;
        else if (os.indexOf('unix') !== -1) counts.aix_lpar += qty; // Backwards compatibility
        break;
      }
    }
  }
  return counts;
}

function extractMidrangeUnixKPI() {
  var maturityEl = document.getElementById('maturityLevel');
  var maturity   = maturityEl ? maturityEl.value : 'median';

  var colMap = { lower: 2, median: 4, upper: 3 };
  var colIdx = (colMap[maturity] !== undefined) ? colMap[maturity] : 4;
  var kpi    = 76;

  var fteTables = document.querySelectorAll('#panel-fte-kpis table');
  for (var t = 0; t < fteTables.length; t++) {
    var fteRows = fteTables[t].querySelectorAll('tbody tr');
    for (var r = 0; r < fteRows.length; r++) {
      var fteCells = fteRows[r].querySelectorAll('td');
      if (fteCells.length < 5) continue;
      var rowLabel = fteCells[0].textContent.toLowerCase().trim();
      if (rowLabel.indexOf('unix') !== -1) {
        var kpiText = fteCells[colIdx].textContent.replace(/,/g, '').trim();
        var kpiVal  = parseFloat(kpiText);
        if (!isNaN(kpiVal) && kpiVal > 0) {
          kpi = kpiVal;
          break;
        }
      }
    }
  }
  return kpi;
}

function extractMidrangeUnixRates() {
  var rates = {
    us:    { aix_lpar: 11957, ibmi_lpar: 11957 },
    india: { aix_lpar:  3734, ibmi_lpar:  3734 }
  };

  var tbody = document.getElementById('ms-rates-tbody');
  if (!tbody) return rates;

  var rows = tbody.getElementsByTagName('tr');
  for (var i = 0; i < rows.length; i++) {
    var cells = rows[i].getElementsByTagName('td');
    if (cells.length < 7) continue;
    if (cells[0].getAttribute('colspan')) continue;

    var tower    = cells[0].textContent.trim().toLowerCase();
    var desc     = cells[1].textContent.trim().toLowerCase();
    var location = cells[3].textContent.trim().toLowerCase();

    var isUnix = (tower.indexOf('unix') !== -1)
                 || (desc.indexOf('unix') !== -1)
                 || (desc.indexOf('aix')  !== -1);
    if (!isUnix) continue;

    var isUS    = (location.indexOf('united states') !== -1)
                  || (location.indexOf('onshore') !== -1);
    var isIndia = (location.indexOf('india') !== -1)
                  || (location.indexOf('offshore') !== -1);
    if (!isUS && !isIndia) continue;

    var rawStr = cells[6].textContent.trim()
                 .replace(/\$/g, '').replace(/,/g, '').trim();
    var raw    = parseFloat(rawStr);
    if (isNaN(raw) || raw <= 0) continue;

    if (isUS)    { rates.us.aix_lpar = raw; rates.us.ibmi_lpar = raw; }
    if (isIndia) { rates.india.aix_lpar = raw; rates.india.ibmi_lpar = raw; }
  }
  return rates;
}

function updateMidrangeMSSizing() {
  var mix              = getDeliveryMix();
  var usDeliveryPct    = mix.usPct;
  var indiaDeliveryPct = mix.indiaPct;

  /* Update delivery % in card headers */
  var usDeliverySpan = document.getElementById('midrange-ms-us-delivery');
  if (usDeliverySpan) usDeliverySpan.textContent = '(' + Math.round(usDeliveryPct * 100) + '% Delivery)';
  var indiaDeliverySpan = document.getElementById('midrange-ms-india-delivery');
  if (indiaDeliverySpan) indiaDeliverySpan.textContent = '(' + Math.round(indiaDeliveryPct * 100) + '% Delivery)';

  var counts = getMidrangeServerCounts();
  var kpi    = extractMidrangeUnixKPI();
  var rates  = extractMidrangeUnixRates();

  var allOS = [
    { key: 'aix_lpar', label: 'AIX LPAR' },
    { key: 'ibmi_lpar', label: 'IBMi LPAR' }
  ];

  var activeOS = allOS.filter(function(os) {
    return (counts[os.key] || 0) > 0;
  });

  var blendedAnnual = 0;
  activeOS.forEach(function(os) {
    var servers = counts[os.key] || 0;
    var usRate = rates.us[os.key] || 0;
    var indiaRate = rates.india[os.key] || 0;
    var totalFTE = Math.ceil(servers / kpi);
    var usMonthly = (totalFTE * usDeliveryPct) * usRate;
    var indiaMonthly = (totalFTE * indiaDeliveryPct) * indiaRate;
    blendedAnnual += (usMonthly + indiaMonthly) * 12;
  });

  function fmtNum(n) { return n.toLocaleString('en-US'); }
  function fmtMoney(n) { return '$' + Math.round(n).toLocaleString('en-US'); }

  function buildRows(tbodyId) {
    var el = document.getElementById(tbodyId);
    if (!el) return 0;
    while (el.firstChild) el.removeChild(el.firstChild);

    if (activeOS.length === 0) {
      var ph = document.createElement('tr');
      ph.innerHTML = '<td colspan="7" class="ms-loading">Enter server counts above to calculate\u2026</td>';
      el.appendChild(ph);
      return 0;
    }

    var isUsTable = (tbodyId === 'midrange-ms-us-tbody');
    var totalServers = 0, totalFTEs = 0, totalMonthly = 0, locationAnnual = 0;

    activeOS.forEach(function(os) {
      var servers = counts[os.key] || 0;
      var totalFTE = Math.ceil(servers / kpi);
      var displayFTE = isUsTable ? totalFTE * usDeliveryPct : totalFTE * indiaDeliveryPct;
      var rate = isUsTable ? (rates.us[os.key] || 0) : (rates.india[os.key] || 0);
      var monthlyRaw = displayFTE * rate;
      var monthly = Math.round(monthlyRaw);   /* round Monthly Cost first */
      var annual = monthly * 12;              /* Annual = rounded MRC Ã— 12 */

      totalServers += servers;
      totalFTEs    += displayFTE;
      totalMonthly += monthly;
      locationAnnual += annual;

      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td class="compute-td">'              + os.label              + '</td>' +
        '<td class="compute-td ms-number">'    + fmtNum(servers)       + '</td>' +
        '<td class="compute-td ms-number">'    + fmtNum(kpi)           + '</td>' +
        '<td class="compute-td ms-number">'    + displayFTE.toFixed(1) + '</td>' +
        '<td class="compute-td ms-number">'    + fmtMoney(rate)        + '</td>' +
        '<td class="compute-td ms-number">'    + fmtMoney(monthly)     + '</td>' +
        '<td class="compute-td ms-cost">'      + fmtMoney(annual)      + '</td>';
      el.appendChild(tr);
    });

    /* Subtotal row â€” matches Distributed Compute style exactly */
    var subTr = document.createElement('tr');
    subTr.className = 'ms-subtotal-row';
    subTr.innerHTML =
      '<td class="compute-td" style="text-align:left;"><strong>Subtotal</strong></td>' +
      '<td class="compute-td ms-number"><strong>' + fmtNum(totalServers)      + '</strong></td>' +
      '<td class="compute-td"></td>' +
      '<td class="compute-td ms-number"><strong>' + totalFTEs.toFixed(1)      + '</strong></td>' +
      '<td class="compute-td"></td>' +
      '<td class="compute-td ms-number"><strong>' + fmtMoney(totalMonthly)    + '</strong></td>' +
      '<td class="compute-td ms-cost"><strong>'   + fmtMoney(locationAnnual)  + '</strong></td>';
    el.appendChild(subTr);

    return Math.round(locationAnnual);
  }

  var usTotal    = buildRows('midrange-ms-us-tbody');
  var indiaTotal = buildRows('midrange-ms-india-tbody');

  var totalEl = document.getElementById('midrange-ms-total-value');
  if (totalEl) totalEl.textContent = fmtMoney(usTotal + indiaTotal);

  var totalMidrangeMonthlyEl = document.getElementById('midrange-ms-total-monthly-value');
  if (totalMidrangeMonthlyEl) totalMidrangeMonthlyEl.textContent = fmtMoney((usTotal + indiaTotal) / 12);

  var midrangeTotalServers = 0;
  activeOS.forEach(function(os) {
    var servers = counts[os.key] || 0;
    midrangeTotalServers += servers;
  });

  var midrangeBlendedAnnual = usTotal + indiaTotal;
  var midrangeMonthlyPerServer = midrangeTotalServers > 0 ? (midrangeBlendedAnnual / 12) / midrangeTotalServers : 0;
  var midrangeAnnualPerServer  = midrangeTotalServers > 0 ? midrangeBlendedAnnual / midrangeTotalServers : 0;

  var midrangeMsTotalServersEl     = document.getElementById('midrange-ms-total-servers-meta');
  var midrangeMsMonthlyPerServerEl = document.getElementById('midrange-ms-monthly-per-server');
  var midrangeMsAnnualPerServerEl  = document.getElementById('midrange-ms-annual-per-server');
  if (midrangeMsTotalServersEl)     midrangeMsTotalServersEl.textContent     = Math.round(midrangeTotalServers).toLocaleString('en-US');
  if (midrangeMsMonthlyPerServerEl) midrangeMsMonthlyPerServerEl.textContent = fmtMoney(midrangeMonthlyPerServer);
  if (midrangeMsAnnualPerServerEl)  midrangeMsAnnualPerServerEl.textContent  = fmtMoney(midrangeAnnualPerServer);

  updateNetworkMSSizing();
}

var _midrangeMSListenersAttached = false;
var _midrangeInfraListenersAttached = false;

function wireMidrangeMSSizingListeners() {
  if (_midrangeMSListenersAttached) return;
  _midrangeMSListenersAttached = true;

  var globalIds = ['maturityLevel', 'usDelivery', 'indiaDelivery'];
  for (var g = 0; g < globalIds.length; g++) {
    var gEl = document.getElementById(globalIds[g]);
    if (gEl) {
      gEl.addEventListener('input',  updateAllManagedServicesSizing);
      gEl.addEventListener('change', updateAllManagedServicesSizing);
    }
  }

  var midrangeTbody = document.getElementById('midrange-os-tbody');
  if (midrangeTbody) {
    midrangeTbody.addEventListener('input',  updateMidrangeMSSizing);
    midrangeTbody.addEventListener('change', updateMidrangeMSSizing);
  }

  var ftePanel = document.getElementById('panel-fte-kpis');
  if (ftePanel) ftePanel.addEventListener('input', updateMidrangeMSSizing);

  var msPanel = document.getElementById('panel-managed-services');
  if (msPanel) msPanel.addEventListener('input', updateMidrangeMSSizing);
}

function toggleMidrangeMSSizing() {
  var body         = document.getElementById('midrange-ms-sizing-body');
  var arrow        = document.getElementById('midrange-ms-sizing-arrow');
  var label        = document.getElementById('midrange-ms-sizing-label');
  var collapsedTot = document.getElementById('midrange-ms-collapsed-total');
  if (!body) return;

  var isCollapsed = body.style.display === 'none';
  if (isCollapsed) {
    body.style.display    = 'block';
    if (arrow) arrow.style.transform = 'rotate(0deg)';
    if (label) label.textContent     = 'Collapse';
    if (collapsedTot) collapsedTot.style.display = 'none';
  } else {
    body.style.display    = 'none';
    if (arrow) arrow.style.transform = 'rotate(-90deg)';
    if (label) label.textContent     = 'Expand';
    if (collapsedTot) {
      var bannerVal    = document.getElementById('midrange-ms-total-value');
      var collapsedVal = document.getElementById('midrange-ms-collapsed-total-value');
      if (bannerVal && collapsedVal) collapsedVal.textContent = bannerVal.textContent;
      collapsedTot.style.display = 'inline';
    }
  }
}

function initMidrangeMSSizing() {
  var body         = document.getElementById('midrange-ms-sizing-body');
  var arrow        = document.getElementById('midrange-ms-sizing-arrow');
  var label        = document.getElementById('midrange-ms-sizing-label');
  var collapsedTot = document.getElementById('midrange-ms-collapsed-total');
  if (!body) return;
  body.style.display    = 'block';
  if (arrow) arrow.style.transform = 'rotate(0deg)';
  if (label) label.textContent     = 'Collapse';
  if (collapsedTot) collapsedTot.style.display = 'none';
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MIDRANGE INFRASTRUCTURE COST LIVE SIZING
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function calcMidrangeInfraCost() {
  var osTotals = typeof getMidrangeOSBreakdown === 'function' ? getMidrangeOSBreakdown() : { aix_lpar: 0, ibmi_lpar: 0 };
  var aix = { vcpu: 0, vram: 0, vms: 0 };
  var ibmi = { vcpu: 0, vram: 0, vms: 0 };

  // Iterate through each row in the vCPU/vRAM tbody
  var tbody = document.getElementById('midrange-vcpu-tbody');
  if (tbody) {
    var rows = tbody.querySelectorAll('tr.compute-row');
    rows.forEach(function(row, rowIdx) {
      var osSelect = row.querySelector('.compute-select');
      var inputs = row.querySelectorAll('.compute-number');
      
      if (inputs.length >= 3) {
        var osType = (osSelect && osSelect.value) ? osSelect.value : (rowIdx === 0 ? 'aix_lpar' : 'ibmi_lpar');
        if (rowIdx === 0) osType = 'aix_lpar';
        if (rowIdx === 1) osType = 'ibmi_lpar';

        var defaults = getLinkedComputeDefaults('midrange', osType);
        var rawVcpu = inputs[0] ? inputs[0].value : '';
        var rawVram = inputs[1] ? inputs[1].value : '';
        var vcpu = (rawVcpu !== '' && !isNaN(parseFloat(rawVcpu))) ? parseFloat(rawVcpu) : defaults.vcpu;
        var vram = (rawVram !== '' && !isNaN(parseFloat(rawVram))) ? parseFloat(rawVram) : defaults.vram;
        var serversFromInput = parseFloat(inputs[2].value);
        var servers = (!isNaN(serversFromInput) && serversFromInput > 0) ? serversFromInput : (osTotals[osType] || 0);

        if (osType === 'aix_lpar') {
          aix.vcpu = vcpu * servers;
          aix.vram = vram * servers;
          aix.vms = servers;
        } else if (osType === 'ibmi_lpar') {
          ibmi.vcpu = vcpu * servers;
          ibmi.vram = vram * servers;
          ibmi.vms = servers;
        }
      }
    });
  }

  // Fallback to osTotals if tbody rows weren't populated yet
  if (aix.vms === 0 && osTotals.aix_lpar > 0) {
    var aixDefaults = getLinkedComputeDefaults('midrange', 'aix_lpar');
    aix.vms = osTotals.aix_lpar;
    aix.vcpu = aixDefaults.vcpu * osTotals.aix_lpar;
    aix.vram = aixDefaults.vram * osTotals.aix_lpar;
  }
  if (ibmi.vms === 0 && osTotals.ibmi_lpar > 0) {
    var ibmiDefaults = getLinkedComputeDefaults('midrange', 'ibmi_lpar');
    ibmi.vms = osTotals.ibmi_lpar;
    ibmi.vcpu = ibmiDefaults.vcpu * osTotals.ibmi_lpar;
    ibmi.vram = ibmiDefaults.vram * osTotals.ibmi_lpar;
  }

  var serverCount = aix.vms + ibmi.vms;

  var aixVcpuTotal = aix.vcpu;
  var aixVramTotal = aix.vram;
  var ibmiVcpuTotal = ibmi.vcpu;
  var ibmiVramTotal = ibmi.vram;

  // Always source rates from the Infrastructure Rates tab.
  var midrangeRates = extractMidrangeInfraRates();
  var aixVcpuRate = midrangeRates.aix.vcpu;
  var aixVramRate = midrangeRates.aix.vram;
  var ibmiVcpuRate = midrangeRates.ibmi.vcpu;
  var ibmiVramRate = midrangeRates.ibmi.vram;

  // Calculate monthly costs
  var aixVcpuMonthly = aixVcpuTotal * aixVcpuRate;
  var aixVramMonthly = aixVramTotal * aixVramRate;
  var ibmiVcpuMonthly = ibmiVcpuTotal * ibmiVcpuRate;
  var ibmiVramMonthly = ibmiVramTotal * ibmiVramRate;

  var aixMonthly = aixVcpuMonthly + aixVramMonthly;
  var ibmiMonthly = ibmiVcpuMonthly + ibmiVramMonthly;
  
  var vcpuCostTotal = aixVcpuMonthly + ibmiVcpuMonthly;
  var vramCostTotal = aixVramMonthly + ibmiVramMonthly;
  var totalMonthly = vcpuCostTotal + vramCostTotal;
  var totalAnnual = totalMonthly * 12;

  function fmt(n) {
    return '$' + Math.round(n || 0).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  function fmtRate(n) {
    var v = parseFloat(n) || 0;
    var hasDecimals = Math.round(v * 100) !== Math.round(v) * 100;
    return '$' + v.toLocaleString('en-US', {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: 2
    });
  }

  function fmtUnit(n) {
    var v = parseFloat(n) || 0;
    var hasDecimals = Math.round(v * 10) !== Math.round(v) * 10;
    return v.toLocaleString('en-US', {
      minimumFractionDigits: hasDecimals ? 1 : 0,
      maximumFractionDigits: 2
    });
  }

  var computeTbody = document.getElementById('midrange-infra-compute-tbody');
  var totalBanner = document.getElementById('midrange-infra-total-value');
  var totalMonthlyEl = document.getElementById('midrange-infra-total-monthly-value');
  var collapsedVal = document.getElementById('midrange-infra-collapsed-total-value');
  var annualPerSrv = document.getElementById('midrange-infra-annual-per-server');
  var monthlyPerSrv = document.getElementById('midrange-infra-monthly-per-server');
  var totalServersEl = document.getElementById('midrange-infra-total-servers-meta');

  // Check if there are any servers or vCPU/vRAM entries
  var hasData = (aixVcpuTotal + aixVramTotal + ibmiVcpuTotal + ibmiVramTotal) > 0;

  if (!hasData) {
    if (computeTbody) computeTbody.innerHTML =
      '<tr><td colspan="7" class="ms-loading">' +
      'Enter server counts above to calculate\u2026</td></tr>';
    if (totalBanner) totalBanner.textContent = '$0';
    if (totalMonthlyEl) totalMonthlyEl.textContent = '$0';
    if (collapsedVal) collapsedVal.textContent = '$0';
    if (totalServersEl) totalServersEl.textContent = '0';
    if (annualPerSrv) annualPerSrv.textContent = '$0';
    if (monthlyPerSrv) monthlyPerSrv.textContent = '$0';
    return;
  }

  // Build Compute Summary table
  if (computeTbody) {
    var rows = '';
    
    if (aixVcpuTotal > 0) {
      var aixVcpuAvg = aix.vms > 0 ? aixVcpuTotal / aix.vms : 0;
      rows += '<tr>' +
        '<td class="compute-td">AIX LPAR - vCPU</td>' +
        '<td class="compute-td ms-number">' + aix.vms.toLocaleString('en-US') + '</td>' +
        '<td class="compute-td ms-number">' + fmtUnit(aixVcpuAvg) + '</td>' +
        '<td class="compute-td ms-number">' + aixVcpuTotal.toLocaleString('en-US') + '</td>' +
        '<td class="compute-td ms-number">' + fmtRate(aixVcpuRate) + '</td>' +
        '<td class="compute-td ms-number">' + fmt(aixVcpuMonthly) + '</td>' +
        '<td class="compute-td ms-cost">' + fmt(aixVcpuMonthly * 12) + '</td>' +
      '</tr>';
    }
    
    if (aixVramTotal > 0) {
      var aixVramAvg = aix.vms > 0 ? aixVramTotal / aix.vms : 0;
      rows += '<tr>' +
        '<td class="compute-td">AIX LPAR - vRAM (GB)</td>' +
        '<td class="compute-td ms-number">' + aix.vms.toLocaleString('en-US') + '</td>' +
        '<td class="compute-td ms-number">' + fmtUnit(aixVramAvg) + '</td>' +
        '<td class="compute-td ms-number">' + aixVramTotal.toLocaleString('en-US') + '</td>' +
        '<td class="compute-td ms-number">' + fmtRate(aixVramRate) + '</td>' +
        '<td class="compute-td ms-number">' + fmt(aixVramMonthly) + '</td>' +
        '<td class="compute-td ms-cost">' + fmt(aixVramMonthly * 12) + '</td>' +
      '</tr>';
    }
    
    if (ibmiVcpuTotal > 0) {
      var ibmiVcpuAvg = ibmi.vms > 0 ? ibmiVcpuTotal / ibmi.vms : 0;
      rows += '<tr>' +
        '<td class="compute-td">IBMi LPAR - vCPU</td>' +
        '<td class="compute-td ms-number">' + ibmi.vms.toLocaleString('en-US') + '</td>' +
        '<td class="compute-td ms-number">' + fmtUnit(ibmiVcpuAvg) + '</td>' +
        '<td class="compute-td ms-number">' + ibmiVcpuTotal.toLocaleString('en-US') + '</td>' +
        '<td class="compute-td ms-number">' + fmtRate(ibmiVcpuRate) + '</td>' +
        '<td class="compute-td ms-number">' + fmt(ibmiVcpuMonthly) + '</td>' +
        '<td class="compute-td ms-cost">' + fmt(ibmiVcpuMonthly * 12) + '</td>' +
      '</tr>';
    }
    
    if (ibmiVramTotal > 0) {
      var ibmiVramAvg = ibmi.vms > 0 ? ibmiVramTotal / ibmi.vms : 0;
      rows += '<tr>' +
        '<td class="compute-td">IBMi LPAR - vRAM (GB)</td>' +
        '<td class="compute-td ms-number">' + ibmi.vms.toLocaleString('en-US') + '</td>' +
        '<td class="compute-td ms-number">' + fmtUnit(ibmiVramAvg) + '</td>' +
        '<td class="compute-td ms-number">' + ibmiVramTotal.toLocaleString('en-US') + '</td>' +
        '<td class="compute-td ms-number">' + fmtRate(ibmiVramRate) + '</td>' +
        '<td class="compute-td ms-number">' + fmt(ibmiVramMonthly) + '</td>' +
        '<td class="compute-td ms-cost">' + fmt(ibmiVramMonthly * 12) + '</td>' +
      '</tr>';
    }
    
    rows += '<tr class="ms-subtotal-row">' +
      '<td class="compute-td"><strong>Subtotal</strong></td>' +
      '<td class="compute-td ms-number"><strong>' + serverCount.toLocaleString('en-US') + '</strong></td>' +
      '<td class="compute-td"></td>' +
      '<td class="compute-td"></td>' +
      '<td class="compute-td"></td>' +
      '<td class="compute-td ms-number"><strong>' + fmt(totalMonthly) + '</strong></td>' +
      '<td class="compute-td ms-cost"><strong>' + fmt(totalAnnual) + '</strong></td>' +
    '</tr>';
    
    computeTbody.innerHTML = rows;
  }

  var annualPerServer = serverCount > 0 ? totalAnnual / serverCount : 0;

  if (totalBanner) totalBanner.textContent = fmt(totalAnnual);
  if (totalMonthlyEl) totalMonthlyEl.textContent = fmt(totalMonthly);
  if (collapsedVal) collapsedVal.textContent = fmt(totalAnnual);
  if (totalServersEl) totalServersEl.textContent = Math.round(serverCount).toLocaleString('en-US');
  if (annualPerSrv) annualPerSrv.textContent = fmt(annualPerServer);
  if (monthlyPerSrv) monthlyPerSrv.textContent = fmt(annualPerServer / 12);
  updateNetworkInfraSizing();
}

function wireMidrangeInfraSizingListeners() {
  if (_midrangeInfraListenersAttached) return;
  _midrangeInfraListenersAttached = true;

  var midrangeVcpuTbody = document.getElementById('midrange-vcpu-tbody');
  if (midrangeVcpuTbody) {
    midrangeVcpuTbody.addEventListener('input',  calcMidrangeInfraCost);
    midrangeVcpuTbody.addEventListener('change', calcMidrangeInfraCost);
    midrangeVcpuTbody.addEventListener('input',  validateMidrangeCounts);
    midrangeVcpuTbody.addEventListener('change', validateMidrangeCounts);
  }
}

function toggleMidrangeInfraSizing() {
  var body = document.getElementById('midrange-infra-sizing-body');
  var arrow = document.getElementById('midrange-infra-sizing-arrow');
  var label = document.getElementById('midrange-infra-sizing-label');
  var collapsedTot = document.getElementById('midrange-infra-collapsed-total');
  if (!body) return;

  var isCollapsed = body.style.display === 'none';
  if (isCollapsed) {
    body.style.display = 'block';
    if (arrow) arrow.style.transform = 'rotate(0deg)';
    if (label) label.textContent = 'Collapse';
    if (collapsedTot) collapsedTot.style.display = 'none';
  } else {
    body.style.display = 'none';
    if (arrow) arrow.style.transform = 'rotate(-90deg)';
    if (label) label.textContent = 'Expand';
    if (collapsedTot) {
      var bannerVal = document.getElementById('midrange-infra-total-value');
      var collapsedVal = document.getElementById('midrange-infra-collapsed-total-value');
      if (bannerVal && collapsedVal) collapsedVal.textContent = bannerVal.textContent;
      collapsedTot.style.display = 'inline';
    }
  }
}

function initMidrangeInfraSizing() {
  var body = document.getElementById('midrange-infra-sizing-body');
  var arrow = document.getElementById('midrange-infra-sizing-arrow');
  var label = document.getElementById('midrange-infra-sizing-label');
  var collapsedTot = document.getElementById('midrange-infra-collapsed-total');
  if (!body) return;
  body.style.display = 'block';
  if (arrow) arrow.style.transform = 'rotate(0deg)';
  if (label) label.textContent = 'Collapse';
  if (collapsedTot) collapsedTot.style.display = 'none';
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   VMWARE SIZING TOGGLE
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function toggleVmwareSizing() {
  var cb    = document.getElementById('compute-vmware');
  var panel = document.getElementById('vmware-sizing-panel');
  if (!panel) return;
  if (cb && cb.checked) {
    panel.style.display = 'block';
    initVmwareSizingCollapse();
    initMSSizing();
    wireMSSizingListeners();
    updateManagedServicesSizing();
    calcInfraCost();
    updateVmwareSizing();
  } else {
    panel.style.display = 'none';
  }
}

function toggleVmwareSizingCollapse() {
  var body         = document.getElementById('vmware-sizing-body');
  var arrow        = document.getElementById('vmware-sizing-arrow');
  var label        = document.getElementById('vmware-sizing-label');
  var collapsedTot = document.getElementById('vmware-collapsed-total');
  if (!body) return;

  var isCollapsed = body.style.display === 'none';
  if (isCollapsed) {
    body.style.display    = 'block';
    if (arrow) arrow.style.transform = 'rotate(0deg)';
    if (label) label.textContent     = 'Collapse';
    if (collapsedTot) collapsedTot.style.display = 'none';
  } else {
    body.style.display    = 'none';
    if (arrow) arrow.style.transform = 'rotate(-90deg)';
    if (label) label.textContent     = 'Expand';
    if (collapsedTot) {
      var bannerVal    = document.getElementById('vmware-total-annual');
      var collapsedVal = document.getElementById('vmware-collapsed-total-value');
      if (bannerVal && collapsedVal) collapsedVal.textContent = bannerVal.textContent;
      collapsedTot.style.display = 'inline-flex';
    }
  }
}

function initVmwareSizingCollapse() {
  var body  = document.getElementById('vmware-sizing-body');
  var arrow = document.getElementById('vmware-sizing-arrow');
  var label = document.getElementById('vmware-sizing-label');
  if (!body) return;
  body.style.display    = 'block';
  if (arrow) arrow.style.transform = 'rotate(0deg)';
  if (label) label.textContent     = 'Collapse';
  var ct = document.getElementById('vmware-collapsed-total');
  if (ct) ct.style.display = 'none';
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   SWMA LIVE SIZING TOGGLE
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function toggleSwmaSizing() {
  var cb    = document.getElementById('swmaApplicable');
  var panel = document.getElementById('swmaLiveSizingSection');
  if (!panel) return;
  if (cb && cb.checked) {
    panel.style.display = 'block';
    initSwmaSizingCollapse();
    wireSwmaSizingListeners();
    calcSwmaSizing();
  } else {
    panel.style.display = 'none';
  }
}

function toggleSwmaSizingCollapse() {
  var body         = document.getElementById('swma-sizing-body');
  var arrow        = document.getElementById('swma-sizing-arrow');
  var label        = document.getElementById('swma-sizing-label');
  var collapsedTot = document.getElementById('swma-collapsed-total');
  if (!body) return;

  var isCollapsed = body.style.display === 'none';
  if (isCollapsed) {
    body.style.display    = 'block';
    if (arrow) arrow.style.transform = 'rotate(0deg)';
    if (label) label.textContent     = 'Collapse';
    if (collapsedTot) collapsedTot.style.display = 'none';
  } else {
    body.style.display    = 'none';
    if (arrow) arrow.style.transform = 'rotate(-90deg)';
    if (label) label.textContent     = 'Expand';
    if (collapsedTot) {
      var bannerVal    = document.getElementById('swma-total-annual-value');
      var collapsedVal = document.getElementById('swma-collapsed-total-value');
      if (bannerVal && collapsedVal) collapsedVal.textContent = bannerVal.textContent;
      collapsedTot.style.display = 'inline-flex';
    }
  }
}

function initSwmaSizingCollapse() {
  var body  = document.getElementById('swma-sizing-body');
  var arrow = document.getElementById('swma-sizing-arrow');
  var label = document.getElementById('swma-sizing-label');
  if (!body) return;
  body.style.display    = 'block';
  if (arrow) arrow.style.transform = 'rotate(0deg)';
  if (label) label.textContent     = 'Collapse';
  var ct = document.getElementById('swma-collapsed-total');
  if (ct) ct.style.display = 'none';
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   SWMA LIVE SIZING CALCULATION
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
var _swmaListenersAttached = false;

function wireSwmaSizingListeners() {
  if (_swmaListenersAttached) return;
  _swmaListenersAttached = true;

  // React to vCPU/vRAM input changes
  var tbody = document.getElementById('midrange-vcpu-tbody');
  if (tbody) {
    tbody.addEventListener('input',  calcSwmaSizing);
    tbody.addEventListener('change', calcSwmaSizing);
  }

  // React to rate card changes
  var rateIds = [
    'rate-swma-aix-annual', 'rate-swma-aix-discount',
    'rate-swma-ibmi-annual', 'rate-swma-ibmi-discount',
    'ratio-swma-aix-vcpu-cores', 'ratio-swma-aix-vram-cores', 'ratio-swma-aix-cores-per-host',
    'ratio-swma-ibmi-vcpu-cores', 'ratio-swma-ibmi-vram-cores', 'ratio-swma-ibmi-cores-per-gb'
  ];
  rateIds.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', calcSwmaSizing);
  });
}

function calcSwmaSizing() {
  var swmaCb = document.getElementById('swmaApplicable');
  if (!swmaCb || !swmaCb.checked) {
    if (typeof updateDatacenterSizing === 'function') updateDatacenterSizing();
    return;
  }

  // â”€â”€ Aggregate AIX / IBMi from the vCPU/vRAM table â”€â”€
  var aix  = { vcpu: 0, vram: 0, vms: 0 };
  var ibmi = { vcpu: 0, vram: 0, vms: 0 };

  var tbody = document.getElementById('midrange-vcpu-tbody');
  if (tbody) {
    tbody.querySelectorAll('tr.compute-row').forEach(function(row) {
      var osSel  = row.querySelector('.compute-select');
      var inputs = row.querySelectorAll('.compute-number');
      if (osSel && inputs.length >= 3) {
        var vcpu    = parseFloat(inputs[0].value) || 0;
        var vram    = parseFloat(inputs[1].value) || 0;
        var servers = parseFloat(inputs[2].value) || 0;
        if (servers > 0) {
          if (osSel.value === 'aix_lpar') {
            aix.vcpu += vcpu * servers;
            aix.vram += vram * servers;
            aix.vms  += servers;
          } else if (osSel.value === 'ibmi_lpar') {
            ibmi.vcpu += vcpu * servers;
            ibmi.vram += vram * servers;
            ibmi.vms  += servers;
          }
        }
      }
    });
  }

  // â”€â”€ Read rates / ratios from VMware Rate Card inputs â”€â”€
  function rv(id, def) {
    var el = document.getElementById(id);
    var v  = el ? parseFloat(el.value) : NaN;
    return (isNaN(v) || v <= 0) ? def : v;
  }

  var aixVcpuRatio   = rv('ratio-swma-aix-vcpu-cores',  2.5);
  var aixVramRatio   = rv('ratio-swma-aix-vram-cores',  0.7);
  var ibmiVcpuRatio  = rv('ratio-swma-ibmi-vcpu-cores', 2.5);
  var ibmiVramRatio  = rv('ratio-swma-ibmi-vram-cores', 0.7);
  var coresPerHost   = rv('ratio-swma-aix-cores-per-host', 32);
  var gbPerHost      = rv('ratio-swma-ibmi-cores-per-gb', 1024);
  var aixAnnualRate  = rv('rate-swma-aix-annual',  1600);
  var ibmiAnnualRate = rv('rate-swma-ibmi-annual', 10500);
  var aixMoRate      = aixAnnualRate  / 12;
  var ibmiMoRate     = ibmiAnnualRate / 12;

  // â”€â”€ DOM refs â”€â”€
  var costTbody    = document.getElementById('swma-cost-tbody');
  var totalEl      = document.getElementById('swma-total-annual-value');
  var totalMonthlyEl = document.getElementById('swma-total-monthly-value');
  var collapsedEl  = document.getElementById('swma-collapsed-total-value');
  var aixRateSpan  = document.getElementById('swma-aix-rate-display');
  var ibmiRateSpan = document.getElementById('swma-ibmi-rate-display');
  var totalServersEl = document.getElementById('swma-total-servers-meta');
  var monthlyPerServerEl = document.getElementById('swma-monthly-per-server');
  var annualPerServerEl = document.getElementById('swma-annual-per-server');
  // Card elements
  var hostsEmpty      = document.getElementById('swma-hosts-empty');
  var hostsCards      = document.getElementById('swma-hosts-cards');
  var aixMaxHostsEl   = document.getElementById('swma-aix-max-hosts');
  var aixVcpuCoresEl  = document.getElementById('swma-aix-vcpu-cores-disp');
  var aixVramCoresEl  = document.getElementById('swma-aix-vram-cores-disp');
  var aixDetailEl     = document.getElementById('swma-aix-detail');
  var aixRatiosEl     = document.getElementById('swma-aix-ratios');
  var ibmiMaxHostsEl  = document.getElementById('swma-ibmi-max-hosts');
  var ibmiVcpuCoresEl = document.getElementById('swma-ibmi-vcpu-cores-disp');
  var ibmiVramCoresEl = document.getElementById('swma-ibmi-vram-cores-disp');
  var ibmiDetailEl    = document.getElementById('swma-ibmi-detail');
  var ibmiRatiosEl    = document.getElementById('swma-ibmi-ratios');

  var hasData = (aix.vms + ibmi.vms) > 0;

  // Update rate badge spans regardless
  if (aixRateSpan)  aixRateSpan.textContent  = '$' + aixMoRate.toFixed(2);
  if (ibmiRateSpan) ibmiRateSpan.textContent = '$' + ibmiMoRate.toFixed(2);

  if (!hasData) {
    if (hostsEmpty) hostsEmpty.style.display = 'block';
    if (hostsCards) hostsCards.style.display = 'none';
    if (costTbody)  costTbody.innerHTML = '<tr><td colspan="4" class="ms-loading">Enter server counts above to calculateâ€¦</td></tr>';
    if (totalEl)     totalEl.textContent    = '$0';
    if (totalMonthlyEl) totalMonthlyEl.textContent = '$0';
    if (collapsedEl) collapsedEl.textContent = '$0';
    if (totalServersEl) totalServersEl.textContent = '0';
    if (monthlyPerServerEl) monthlyPerServerEl.textContent = '$0';
    if (annualPerServerEl) annualPerServerEl.textContent = '$0';
    if (typeof updateDatacenterSizing === 'function') updateDatacenterSizing();
    return;
  }
  if (hostsEmpty) hostsEmpty.style.display = 'none';
  if (hostsCards) hostsCards.style.display = 'grid';

  updateNetworkInfraSizing();

  function fmtD(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }
  function fmtC(n, dec) {
    dec = dec !== undefined ? dec : 2;
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  function fmtNum(n, dec) {
    dec = dec !== undefined ? dec : 2;
    return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }

  // â”€â”€ Part 1: Physical Hosts â”€â”€
  // AIX
  var aixVcpuSize = aix.vms > 0 ? aix.vcpu / aix.vms : 0;
  var aixVramSize = aix.vms > 0 ? aix.vram / aix.vms : 0;

  var aixVcpuCores = aixVcpuRatio > 0 ? aix.vcpu / aixVcpuRatio : 0;
  var aixVramCores = aixVramRatio > 0 ? aix.vram / aixVramRatio : 0;
  var aixVcpuHosts = coresPerHost > 0 ? aixVcpuCores / coresPerHost : 0;
  var aixVramHosts = gbPerHost    > 0 ? aixVramCores / gbPerHost    : 0;
  var aixMaxRaw    = Math.max(aixVcpuHosts, aixVramHosts);
  var aixMaxHosts  = Math.round(aixMaxRaw);

  // IBMi
  var ibmiVcpuSize = ibmi.vms > 0 ? ibmi.vcpu / ibmi.vms : 0;
  var ibmiVramSize = ibmi.vms > 0 ? ibmi.vram / ibmi.vms : 0;

  var ibmiVcpuCores = ibmiVcpuRatio > 0 ? ibmi.vcpu / ibmiVcpuRatio : 0;
  var ibmiVramCores = ibmiVramRatio > 0 ? ibmi.vram / ibmiVramRatio : 0;
  var ibmiVcpuHosts = coresPerHost  > 0 ? ibmiVcpuCores / coresPerHost : 0;
  var ibmiVramHosts = gbPerHost     > 0 ? ibmiVramCores / gbPerHost    : 0;
  var ibmiMaxRaw    = Math.max(ibmiVcpuHosts, ibmiVramHosts);
  var ibmiMaxHosts  = Math.round(ibmiMaxRaw);

  // â”€â”€ Part 2: SWMA Volume & Cost (use unrounded maxRaw to avoid compounding rounding errors) â”€â”€
  var aixVolume  = Math.round(aixMaxRaw  * coresPerHost);
  var ibmiVolume = Math.round(ibmiMaxRaw * coresPerHost);
  var aixMrc     = aixMaxRaw  * coresPerHost * aixMoRate;
  var ibmiMrc    = ibmiMaxRaw * coresPerHost * ibmiMoRate;
  var totalMrc   = aixMrc + ibmiMrc;
  var totalAnnual = totalMrc * 12;
  var totalServers = aix.vms + ibmi.vms;
  var monthlyPerServer = totalServers > 0 ? totalMrc / totalServers : 0;
  var annualPerServer = totalServers > 0 ? totalAnnual / totalServers : 0;

  // â”€â”€ Populate AIX card â”€â”€
  if (aix.vms > 0) {
    if (aixMaxHostsEl)  aixMaxHostsEl.textContent  = aixMaxHosts;
    if (aixVcpuCoresEl) aixVcpuCoresEl.textContent = Math.round(aixVcpuCores).toLocaleString('en-US');
    if (aixVramCoresEl) aixVramCoresEl.textContent = Math.round(aixVramCores).toLocaleString('en-US');
    if (aixDetailEl) aixDetailEl.innerHTML =
      'Total vCPU: <strong>' + Math.round(aix.vcpu).toLocaleString('en-US') + '</strong>' +
      ' | Phys. Cores: <strong>' + Math.round(aixVcpuCores).toLocaleString('en-US') + '</strong>' +
      ' | Hosts: <strong>' + Math.round(aixVcpuHosts).toLocaleString('en-US') + '</strong><br>' +
      'Total vRAM: <strong>' + Math.round(aix.vram).toLocaleString('en-US') + ' GB</strong>' +
      ' | Phys. Cores: <strong>' + Math.round(aixVramCores).toLocaleString('en-US') + '</strong>' +
      ' | Hosts: <strong>' + Math.round(aixVramHosts).toLocaleString('en-US') + '</strong>';
    if (aixRatiosEl) aixRatiosEl.textContent =
      'Ratios: vCPU ' + aixVcpuRatio + ':1 | vRAM ' + aixVramRatio + ':1 | Cores/Host: ' + coresPerHost + ' | GB/Host: ' + gbPerHost.toLocaleString('en-US');
  } else {
    if (aixMaxHostsEl)  aixMaxHostsEl.textContent  = 'â€“';
    if (aixVcpuCoresEl) aixVcpuCoresEl.textContent = 'â€“';
    if (aixVramCoresEl) aixVramCoresEl.textContent = 'â€“';
    if (aixDetailEl)    aixDetailEl.textContent    = 'No AIX LPAR data entered.';
    if (aixRatiosEl)    aixRatiosEl.textContent    = '';
  }

  // â”€â”€ Populate IBMi card â”€â”€
  if (ibmi.vms > 0) {
    if (ibmiMaxHostsEl)  ibmiMaxHostsEl.textContent  = ibmiMaxHosts;
    if (ibmiVcpuCoresEl) ibmiVcpuCoresEl.textContent = Math.round(ibmiVcpuCores).toLocaleString('en-US');
    if (ibmiVramCoresEl) ibmiVramCoresEl.textContent = Math.round(ibmiVramCores).toLocaleString('en-US');
    if (ibmiDetailEl) ibmiDetailEl.innerHTML =
      'Total vCPU: <strong>' + Math.round(ibmi.vcpu).toLocaleString('en-US') + '</strong>' +
      ' | Phys. Cores: <strong>' + Math.round(ibmiVcpuCores).toLocaleString('en-US') + '</strong>' +
      ' | Hosts: <strong>' + Math.round(ibmiVcpuHosts).toLocaleString('en-US') + '</strong><br>' +
      'Total vRAM: <strong>' + Math.round(ibmi.vram).toLocaleString('en-US') + ' GB</strong>' +
      ' | Phys. Cores: <strong>' + Math.round(ibmiVramCores).toLocaleString('en-US') + '</strong>' +
      ' | Hosts: <strong>' + Math.round(ibmiVramHosts).toLocaleString('en-US') + '</strong>';
    if (ibmiRatiosEl) ibmiRatiosEl.textContent =
      'Ratios: vCPU ' + ibmiVcpuRatio + ':1 | vRAM ' + ibmiVramRatio + ':1 | Cores/Host: ' + coresPerHost + ' | GB/Host: ' + gbPerHost.toLocaleString('en-US');
  } else {
    if (ibmiMaxHostsEl)  ibmiMaxHostsEl.textContent  = 'â€“';
    if (ibmiVcpuCoresEl) ibmiVcpuCoresEl.textContent = 'â€“';
    if (ibmiVramCoresEl) ibmiVramCoresEl.textContent = 'â€“';
    if (ibmiDetailEl)    ibmiDetailEl.textContent    = 'No IBMi LPAR data entered.';
    if (ibmiRatiosEl)    ibmiRatiosEl.textContent    = '';
  }

  // â”€â”€ Build OS Software & Maintenance Cost table â”€â”€
  if (costTbody) {
    var cRows = '';

    if (aix.vms > 0) {
      cRows +=
        '<tr>' +
          '<td>AIX</td>' +
          '<td>' + aixVolume.toLocaleString('en-US') + '</td>' +
          '<td>' + fmtC(aixMoRate, 2) + '</td>' +
          '<td class="ms-cost">' + fmtD(aixMrc) + '</td>' +
        '</tr>';
    }
    if (ibmi.vms > 0) {
      cRows +=
        '<tr>' +
          '<td>IBMi</td>' +
          '<td>' + ibmiVolume.toLocaleString('en-US') + '</td>' +
          '<td>' + fmtC(ibmiMoRate, 2) + '</td>' +
          '<td class="ms-cost">' + fmtD(ibmiMrc) + '</td>' +
        '</tr>';
    }
    cRows +=
      '<tr class="ms-subtotal-row">' +
        '<td>Total OS Software &amp; Maintenance</td>' +
        '<td></td>' +
        '<td></td>' +
        '<td class="ms-cost">' + fmtD(totalMrc) + '</td>' +
      '</tr>';

    costTbody.innerHTML = cRows;
  }

  var annualFmt = fmtD(totalAnnual);
  if (totalEl)     totalEl.textContent     = annualFmt;
  if (totalMonthlyEl) totalMonthlyEl.textContent = fmtD(totalMrc);
  if (collapsedEl) collapsedEl.textContent = annualFmt;
  if (totalServersEl) totalServersEl.textContent = Math.round(totalServers).toLocaleString('en-US');
  if (monthlyPerServerEl) monthlyPerServerEl.textContent = fmtD(monthlyPerServer);
  if (annualPerServerEl) annualPerServerEl.textContent = fmtD(annualPerServer);
  if (typeof updateDatacenterSizing === 'function') updateDatacenterSizing();
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   VMWARE RATE EXTRACTION
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function extractVmwareRates() {
  function readInput(id) {
    var el  = document.getElementById(id);
    if (!el) return 0;
    var val = parseFloat(el.value);
    return isNaN(val) ? 0 : val;
  }
  return {
    vcfPerCore: readInput('rate-vcf'),
    lrPerVm:    readInput('rate-lr'),
    dfwPerCore: readInput('rate-dfw'),
    aviPerSe:   readInput('rate-avi')
  };
}

function extractSizingConstants() {
  var constants = {
    vcpuRatio:     2.5,
    coresPerHost:  32,
    ramOvercommit: 0.7,
    gbpsPerSe:     1.5
  };

  var panel = document.getElementById('panel-vmware-rate');
  if (!panel) return constants;

  panel.querySelectorAll('table tbody tr').forEach(function(row) {
    var cells = row.querySelectorAll('td');
    if (cells.length < 2) return;
    var lbl     = cells[0].innerText.toLowerCase().trim();
    var valText = cells[cells.length - 1].innerText.trim();

    /* FIX â€” renamed match variables to avoid shadowing */
    if (lbl.indexOf('vcpu') !== -1 &&
        (lbl.indexOf('ratio') !== -1 || lbl.indexOf('core') !== -1)) {
      var mVcpu = valText.replace(/,/g, '').match(/([\d.]+)\s*[:to]/i);
      if (mVcpu) constants.vcpuRatio = parseFloat(mVcpu[1]);
      else {
        var mVcpu2 = valText.match(/([\d.]+)/);
        if (mVcpu2) constants.vcpuRatio = parseFloat(mVcpu2[1]);
      }
    }
    if (lbl.indexOf('cores per host') !== -1 ||
        (lbl.indexOf('core') !== -1 && lbl.indexOf('host') !== -1)) {
      var mCores = valText.match(/(\d+)/);
      if (mCores) constants.coresPerHost = parseInt(mCores[1]);
    }
    if (lbl.indexOf('ram') !== -1 &&
        (lbl.indexOf('overcommit') !== -1 || lbl.indexOf('ratio') !== -1)) {
      var mRam = valText.replace(/,/g, '').match(/([\d.]+)\s*[:to]/i);
      if (mRam) constants.ramOvercommit = parseFloat(mRam[1]);
      else {
        var mRam2 = valText.match(/([\d.]+)/);
        if (mRam2) constants.ramOvercommit = parseFloat(mRam2[1]);
      }
    }
    if (lbl.indexOf('gbps') !== -1 ||
        (lbl.indexOf('throughput') !== -1 && lbl.indexOf('se') !== -1)) {
      var mGbps = valText.match(/([\d.]+)/);
      if (mGbps) constants.gbpsPerSe = parseFloat(mGbps[1]);
    }
  });

  return constants;
}

/* FIX â€” target vCPU tbody only, not all tbodies in the card */
function getComputeTotals() {
  var totalVcpus  = 0;
  var totalVramGb = 0;
  var totalServers = 0;

  document.querySelectorAll('#compute-vcpu-tbody tr.compute-row').forEach(function(row) {
    var inputs = row.querySelectorAll('input.compute-number');
    if (inputs.length >= 3) {
      var vcpu  = parseFloat(inputs[0].value) || 0;
      var vram  = parseFloat(inputs[1].value) || 0;
      var count = parseFloat(inputs[2].value) || 0;
      totalVcpus   += vcpu  * count;
      totalVramGb  += vram  * count;
      totalServers += count;
    }
  });

  return { totalVcpus: totalVcpus, totalVramGb: totalVramGb, totalServers: totalServers };
}

function fmtCurrency(val) {
  if (val === null || val === undefined || isNaN(val)) return '\u2013';
  return '$' + val.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   LIVE RECOVERY SYNC
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function getProdServerTotal() {
  var total = 0;
  document.querySelectorAll('#compute-os-tbody tr').forEach(function(row) {
    var selects = row.querySelectorAll('select.compute-select');
    var inp     = row.querySelector('input[type="number"]');
    if (selects.length >= 2 && inp && selects[1].value === 'prod') {
      total += parseFloat(inp.value) || 0;
    }
  });
  return total;
}

function lrSyncFromCount() {
  var countInput = document.getElementById('lr-vm-count');
  var pctInput   = document.getElementById('lr-vm-pct');
  if (!countInput || !pctInput) return;
  var prodTotal  = getProdServerTotal();
  var count      = parseFloat(countInput.value) || 0;
  if (prodTotal > 0) pctInput.value = Math.round((count / prodTotal) * 100);
  else               pctInput.value = '';
  updateVmwareSizing();
}

function lrSyncFromPct() {
  var countInput = document.getElementById('lr-vm-count');
  var pctInput   = document.getElementById('lr-vm-pct');
  if (!countInput || !pctInput) return;
  var prodTotal  = getProdServerTotal();
  var pct        = parseFloat(pctInput.value) || 0;
  var count      = Math.round((pct / 100) * prodTotal);
  countInput.value = count > 0 ? count : '';
  updateVmwareSizing();
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   VMWARE LIVE SIZING CALCULATION
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function updateVmwareSizing() {
  calcInfraCost();

  var panel = document.getElementById('vmware-sizing-panel');
  if (!panel || panel.style.display === 'none') return;

  var rates     = extractVmwareRates();
  var constants = extractSizingConstants();
  var totals    = getComputeTotals();

  var prodTotal   = getProdServerTotal();
  var prodTotalEl = document.getElementById('lr-prod-total');
  if (prodTotalEl) prodTotalEl.textContent = prodTotal;

  var totalVcpus = totals.totalVcpus;

  /* VCF */
  var vcfCores       = (constants.vcpuRatio > 0)
                       ? Math.ceil(totalVcpus / constants.vcpuRatio) : 0;
  var vcfHosts       = (constants.coresPerHost > 0)
                       ? Math.ceil(vcfCores / constants.coresPerHost) : 0;
  var vcfActualCores = vcfHosts * constants.coresPerHost;
  var vcfAnnual      = (vcfActualCores > 0) ? vcfActualCores * rates.vcfPerCore : null;

  function setEl(id, val) {
    var el = document.getElementById(id);
    if (el) el.innerText = val;
  }

  setEl('vcf-hosts',         vcfHosts       || '\u2013');
  setEl('vcf-cores',         vcfActualCores || '\u2013');
  setEl('vcf-vcpus',         totalVcpus     || '\u2013');
  setEl('vcf-annual',        fmtCurrency(vcfAnnual));
  setEl('vcf-ratio-display', constants.vcpuRatio);

  /* DFW */
  var dfwCores  = vcfActualCores;
  var dfwAnnual = (dfwCores > 0) ? dfwCores * rates.dfwPerCore : null;
  setEl('dfw-cores',         dfwCores  || '\u2013');
  setEl('dfw-cost',          fmtCurrency(dfwAnnual));
  setEl('dfw-annual',        fmtCurrency(dfwAnnual));

  /* Live Recovery */
  var lrVmInput = document.getElementById('lr-vm-count');
  var lrVms     = lrVmInput ? (parseFloat(lrVmInput.value) || 0) : 0;
  var lrAnnual  = (lrVms > 0) ? lrVms * rates.lrPerVm : null;
  setEl('lr-vms',            lrVms || '\u2013');
  setEl('lr-annual',         fmtCurrency(lrAnnual));

  /* Avi / NSX LB */
  var aviGbpsInput = document.getElementById('avi-gbps');
  var aviGbps      = aviGbpsInput ? (parseFloat(aviGbpsInput.value) || 0) : 0;
  var aviSes       = (aviGbps > 0 && constants.gbpsPerSe > 0)
                     ? Math.ceil(aviGbps / constants.gbpsPerSe) : 0;
  var aviAnnual    = (aviSes > 0) ? aviSes * rates.aviPerSe : null;
  setEl('avi-ses',           aviSes || '\u2013');
  setEl('avi-annual',        fmtCurrency(aviAnnual));
  setEl('avi-gbps-display',  constants.gbpsPerSe);

  /* Grand Total */
  var grandTotal = 0;
  var anyMissing = false;
  [vcfAnnual, dfwAnnual, lrAnnual, aviAnnual].forEach(function(v) {
    if (v !== null && !isNaN(v)) grandTotal += v;
    else anyMissing = true;
  });

  setEl('vmware-total-annual',
    grandTotal > 0
      ? fmtCurrency(grandTotal) + (anyMissing ? ' *' : '')
      : '\u2013');
  setEl('vmware-total-monthly-value',
    grandTotal > 0
      ? fmtCurrency(grandTotal / 12)
      : '$0');

  var distributedServerCount = totals.totalServers;
  var annualPerVs  = distributedServerCount > 0 ? grandTotal / distributedServerCount : 0;
  var monthlyPerVs = annualPerVs / 12;
  setEl('vmware-total-servers-meta', Math.round(distributedServerCount).toLocaleString('en-US'));
  setEl('vmware-annual-per-vs',  fmtCurrency(annualPerVs));
  setEl('vmware-monthly-per-vs', fmtCurrency(monthlyPerVs));
  updateNetworkInfraSizing();
  if (typeof updateDatacenterSizing === 'function') updateDatacenterSizing();
}

/* FIX â€” guard flag prevents duplicate listeners */
var _rateCardListenersAttached = false;

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   STORAGE & BACKUP MANAGED SERVICES LIVE SIZING
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function toggleStorageMSSizing() {
  var body         = document.getElementById('storage-ms-sizing-body');
  var arrow        = document.getElementById('storage-ms-sizing-arrow');
  var label        = document.getElementById('storage-ms-sizing-label');
  var collapsedTot = document.getElementById('storage-ms-collapsed-total');
  if (!body) return;
  var isCollapsed = (body.style.display === 'none');
  if (isCollapsed) {
    body.style.display = 'block';
    if (arrow) arrow.style.transform = 'rotate(0deg)';
    if (label) label.textContent = 'Collapse';
    if (collapsedTot) collapsedTot.style.display = 'none';
  } else {
    body.style.display = 'none';
    if (arrow) arrow.style.transform = 'rotate(-90deg)';
    if (label) label.textContent = 'Expand';
    if (collapsedTot) {
      var bannerVal = document.getElementById('storage-ms-total-value');
      var colVal    = document.getElementById('storage-ms-collapsed-total-value');
      if (bannerVal && colVal) colVal.textContent = bannerVal.textContent;
      collapsedTot.style.display = 'inline-flex';
    }
  }
}

function initStorageMSSizing() {
  var body  = document.getElementById('storage-ms-sizing-body');
  var arrow = document.getElementById('storage-ms-sizing-arrow');
  var label = document.getElementById('storage-ms-sizing-label');
  if (!body) return;
  body.style.display = 'block';
  if (arrow) arrow.style.transform = 'rotate(0deg)';
  if (label) label.textContent = 'Collapse';
  var ct = document.getElementById('storage-ms-collapsed-total');
  if (ct) ct.style.display = 'none';
}

function extractStorageKPIs() {
  var maturityEl = document.getElementById('maturityLevel');
  var maturity   = maturityEl ? maturityEl.value : 'median';
  var colMap     = { lower: 2, median: 4, upper: 3 };
  var colIdx     = (colMap[maturity] !== undefined) ? colMap[maturity] : 4;
  var kpis       = { storage: 1218, backup: 1215 };

  document.querySelectorAll('#panel-fte-kpis table tbody tr').forEach(function(row) {
    var cells = row.querySelectorAll('td');
    if (cells.length < 5) return;
    var desc   = (cells[0].textContent || '').toLowerCase().trim();
    var cellEl = cells[colIdx];
    if (!cellEl) return;
    var raw = parseFloat((cellEl.textContent || '').replace(/,/g, ''));
    if (isNaN(raw) || raw <= 0) return;
    if (desc === 'storage') {
      kpis.storage = raw;
    } else if (desc === 'backup') {
      kpis.backup = raw;
    }
  });

  return kpis;
}

var _storageMSListenersAttached = false;
function wireStorageMSSizingListeners() {
  if (_storageMSListenersAttached) return;
  _storageMSListenersAttached = true;
  var storageTbody = document.getElementById('storage-tbody');
  if (storageTbody) {
    storageTbody.addEventListener('input',  calcStorageMSSizing);
    storageTbody.addEventListener('change', calcStorageMSSizing);
  }
  ['maturityLevel', 'usDelivery', 'indiaDelivery', 'rate-backup-ratio'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) { el.addEventListener('input', updateAllManagedServicesSizing); el.addEventListener('change', updateAllManagedServicesSizing); }
  });
  ['panel-fte-kpis', 'panel-managed-services'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) { el.addEventListener('input', updateAllManagedServicesSizing); el.addEventListener('change', updateAllManagedServicesSizing); }
  });
}

function calcStorageMSSizing() {
  var mix       = getDeliveryMix();
  var usPct     = mix.usPct;
  var offshoreP = mix.indiaPct;

  // Update delivery labels
  ['storage-us-del-pct','backup-us-del-pct'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = '(' + Math.round(usPct * 100) + '% Delivery)';
  });
  ['storage-india-del-pct','backup-india-del-pct'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = '(' + Math.round(offshoreP * 100) + '% Delivery)';
  });

  // Extract storage & backup FTE KPIs dynamically based on Operational Maturity Level
  var extractedStorageKpis = extractStorageKPIs();
  var sKpiInput = document.getElementById('ms-kpi-storage');
  var bKpiInput = document.getElementById('ms-kpi-backup');

  if (sKpiInput) sKpiInput.value = extractedStorageKpis.storage;
  if (bKpiInput) bKpiInput.value = extractedStorageKpis.backup;

  // Also sync sub-type KPI inputs in Rate Card
  ['ms-kpi-san-high', 'ms-kpi-san-std', 'ms-kpi-nas-high', 'ms-kpi-nas-std', 'ms-kpi-object-hot'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = extractedStorageKpis.storage;
  });
  ['ms-kpi-fep-backup', 'ms-kpi-backup-storage'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = extractedStorageKpis.backup;
  });

  // Collect total volumes (Prod + Non-Prod)
  var vols = { san_high: 0, san_standard: 0, nas_high: 0, nas_standard: 0, object_storage: 0, dasd_midrange: 0 };
  document.querySelectorAll('#storage-tbody tr.compute-row').forEach(function(row) {
    var sels = row.querySelectorAll('select');
    if (sels.length < 2) return;
    var arch = sels[0].value;
    var tb = parseFloat((row.querySelector('input[type="number"]') || {}).value) || 0;
    if (vols.hasOwnProperty(arch)) vols[arch] += tb;
  });

  var brEl = document.getElementById('rate-backup-ratio');
  var backupRatio = parseFloat(brEl ? brEl.value : 3) || 3;
  var storageVol  = vols.san_high + vols.san_standard + vols.nas_high + vols.nas_standard + vols.object_storage + vols.dasd_midrange;
  var fepVolume   = vols.san_high + vols.san_standard + vols.nas_high + vols.nas_standard + vols.dasd_midrange;
  var backupCapacityInput = document.getElementById('backup-storage-tb');
  var displayedBackupCapacity = parseFloat(backupCapacityInput ? backupCapacityInput.value : NaN);
  var bscVolume = isNaN(displayedBackupCapacity) ? fepVolume * backupRatio : displayedBackupCapacity;

  var hasData = (storageVol + bscVolume) > 0;

  function rv(id, def) {
    var el = document.getElementById(id); var v = el ? parseFloat(el.value) : NaN;
    return (isNaN(v) || v <= 0) ? def : v;
  }
  function fmtM(n)    { return '$' + Math.round(n).toLocaleString('en-US'); }
  function fmtN(n, d) { d = d !== undefined ? d : 2; return n.toLocaleString('en-US', {minimumFractionDigits:d, maximumFractionDigits:d}); }

  // Build one panel (US or India) for one or more managed-services components.
  function buildPanel(tbodyId, components, isUS) {
    var el = document.getElementById(tbodyId);
    if (!el) return 0;
    while (el.firstChild) el.removeChild(el.firstChild);

    if (!hasData) {
      var ph = document.createElement('tr');
      ph.innerHTML = '<td colspan="8" class="ms-loading">Enter storage volumes above to calculate\u2026</td>';
      el.appendChild(ph); return 0;
    }

    var totalVol = 0, totalFTE = 0, totalCountryFTE = 0, totalMrc = 0, totalAnn = 0;
    components.forEach(function(component) {
      if (component.vol <= 0) return;
      var mrc = Math.round(component.fte * component.rate);
      var ann = mrc * 12;
      totalVol += component.vol;
      totalFTE += component.totalFTE;
      totalCountryFTE += component.fte;
      totalMrc += mrc;
      totalAnn += ann;

      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td class="compute-td">' + component.label + '</td>' +
        '<td class="compute-td ms-number">' + fmtN(component.kpi, 0) + '</td>' +
        '<td class="compute-td ms-number">' + fmtN(component.vol, 0) + '</td>' +
        '<td class="compute-td ms-number">' + fmtN(component.totalFTE, 2) + '</td>' +
        '<td class="compute-td ms-number">' + fmtN(component.fte, 2) + '</td>' +
        '<td class="compute-td ms-number">' + fmtM(component.rate) + '</td>' +
        '<td class="compute-td ms-number">' + fmtM(mrc) + '</td>' +
        '<td class="compute-td ms-cost">' + fmtM(ann) + '</td>';
      el.appendChild(tr);
    });

    // Subtotal row
    var sub = document.createElement('tr');
    sub.className = 'ms-subtotal-row';
    sub.innerHTML =
      '<td class="compute-td"><strong>Subtotal</strong></td>' +
      '<td class="compute-td"></td>' +
      '<td class="compute-td ms-number"><strong>' + (totalVol > 0 ? fmtN(totalVol, 0) : '\u2014') + '</strong></td>' +
      '<td class="compute-td ms-number"><strong>' + fmtN(totalFTE, 2) + '</strong></td>' +
      '<td class="compute-td ms-number"><strong>' + fmtN(totalCountryFTE, 2) + '</strong></td>' +
      '<td class="compute-td"></td>' +
      '<td class="compute-td ms-number"><strong>' + fmtM(totalMrc) + '</strong></td>' +
      '<td class="compute-td ms-cost"><strong>' + fmtM(totalAnn) + '</strong></td>';
    el.appendChild(sub);

    return { mrc: totalMrc, ann: totalAnn, totalFTE: totalFTE };
  }

  // ── Read rates ──
  var sKpi = extractedStorageKpis.storage;
  var sUsR = rv('ms-rate-us-storage', 11473);
  var sInR = rv('ms-rate-india-storage', 3226);
  var bKpi = extractedStorageKpis.backup;
  var bUsR = rv('ms-rate-us-backup', 10405);
  var bInR = rv('ms-rate-india-backup', 3249);
  var bUsR = rv('ms-rate-us-backup', 10405);
  var bInR = rv('ms-rate-india-backup', 3249);

  // ── Storage calculations ──
  var sTotalFTE = storageVol > 0 && sKpi > 0 ? Math.ceil(storageVol / sKpi) : 0;
  var storageUsComponents = [
    { label: 'STORAGE', kpi: sKpi, vol: storageVol, totalFTE: sTotalFTE, fte: sTotalFTE * usPct, rate: sUsR }
  ];
  var storageIndiaComponents = [
    { label: 'STORAGE', kpi: sKpi, vol: storageVol, totalFTE: sTotalFTE, fte: sTotalFTE * offshoreP, rate: sInR }
  ];

  var sUs   = buildPanel('storage-ms-store-us-tbody', storageUsComponents, true);
  var sIndia= buildPanel('storage-ms-store-india-tbody', storageIndiaComponents, false);

  var sCombMrc = (sUs ? sUs.mrc : 0) + (sIndia ? sIndia.mrc : 0);
  var sCombAnn = (sUs ? sUs.ann : 0) + (sIndia ? sIndia.ann : 0);
  var sMrcEl  = document.getElementById('store-combined-mrc');
  var sAnnEl  = document.getElementById('store-combined-annual');
  if (sMrcEl)  sMrcEl.textContent  = fmtM(sCombMrc);
  if (sAnnEl)  sAnnEl.textContent  = fmtM(sCombAnn);

  // ── Backup calculations ──
  var bTotalFTE = hasData && bKpi > 0 ? Math.ceil(bscVolume / bKpi) : 0;
  var bUsFTE    = bTotalFTE * usPct;
  var bInFTE    = bTotalFTE * offshoreP;

  var bUs   = buildPanel('storage-ms-backup-us-tbody', [{ label: 'BACKUP', kpi: bKpi, vol: bscVolume, totalFTE: bTotalFTE, fte: bUsFTE, rate: bUsR }], true);
  var bIndia= buildPanel('storage-ms-backup-india-tbody', [{ label: 'BACKUP', kpi: bKpi, vol: bscVolume, totalFTE: bTotalFTE, fte: bInFTE, rate: bInR }], false);

  var bCombMrc = (bUs ? bUs.mrc : 0) + (bIndia ? bIndia.mrc : 0);
  var bCombAnn = (bUs ? bUs.ann : 0) + (bIndia ? bIndia.ann : 0);
  var bMrcEl  = document.getElementById('backup-combined-mrc');
  var bAnnEl  = document.getElementById('backup-combined-annual');
  if (bMrcEl)  bMrcEl.textContent  = fmtM(bCombMrc);
  if (bAnnEl)  bAnnEl.textContent  = fmtM(bCombAnn);

  // ── Grand total ──
  var grandAnn = sCombAnn + bCombAnn;
  var grandMonthly = sCombMrc + bCombMrc;
  var fmt = fmtM(grandAnn);
  var totalEl = document.getElementById('storage-ms-total-value');
  var totalMonthlyEl = document.getElementById('storage-ms-total-monthly-value');
  var collEl  = document.getElementById('storage-ms-collapsed-total-value');
  if (totalEl) totalEl.textContent = fmt;
  if (totalMonthlyEl) totalMonthlyEl.textContent = fmtM(grandMonthly);
  if (collEl)  collEl.textContent  = fmt;

  // ── Per-TB metrics: Storage, Backup, and combined tower ──
  var storageMonthlyPerTB = storageVol > 0 ? sCombMrc / storageVol : 0;
  var storageAnnualPerTB  = storageVol > 0 ? sCombAnn / storageVol : 0;
  var backupMonthlyPerTB  = bscVolume > 0 ? bCombMrc / bscVolume : 0;
  var backupAnnualPerTB   = bscVolume > 0 ? bCombAnn / bscVolume : 0;
  var combinedMonthly      = sCombMrc + bCombMrc;
  var combinedVolume       = storageVol + bscVolume;
  var combinedMonthlyPerTB = combinedVolume > 0 ? combinedMonthly / combinedVolume : 0;
  var combinedAnnualPerTB  = combinedVolume > 0 ? grandAnn / combinedVolume : 0;

  setTextIfExists('storage-ms-store-total-tb', Math.round(storageVol).toLocaleString('en-US'));
  setTextIfExists('storage-ms-store-monthly-per-tb', fmtM(storageMonthlyPerTB));
  setTextIfExists('storage-ms-store-annual-per-tb',  fmtM(storageAnnualPerTB));
  setTextIfExists('storage-ms-backup-total-tb', Math.round(bscVolume).toLocaleString('en-US'));
  setTextIfExists('storage-ms-backup-monthly-per-tb', fmtM(backupMonthlyPerTB));
  setTextIfExists('storage-ms-backup-annual-per-tb',  fmtM(backupAnnualPerTB));
  setTextIfExists('storage-ms-total-tb-meta', Math.round(combinedVolume).toLocaleString('en-US'));
  setTextIfExists('storage-ms-total-monthly-per-tb', fmtM(combinedMonthlyPerTB));
  setTextIfExists('storage-ms-total-annual-per-tb',  fmtM(combinedAnnualPerTB));

  function setTextIfExists(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  updateNetworkMSSizing();
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   STORAGE & BACKUP RATE CARD HELPERS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
/* ══════════════════════════════════════════
   STORAGE & BACKUP INFRASTRUCTURE COST LIVE SIZING
══════════════════════════════════════════ */
function toggleStorageInfraSizing(){
  var b=document.getElementById('storage-infra-sizing-body'),ar=document.getElementById('storage-infra-sizing-arrow'),lb=document.getElementById('storage-infra-sizing-label'),ct=document.getElementById('storage-infra-collapsed-total');
  if(!b) return;
  if(b.style.display==='none'){b.style.display='block';if(ar)ar.style.transform='rotate(0deg)';if(lb)lb.textContent='Collapse';if(ct)ct.style.display='none';}
  else{b.style.display='none';if(ar)ar.style.transform='rotate(-90deg)';if(lb)lb.textContent='Expand';if(ct){var tv=document.getElementById('storage-infra-total-value'),cv=document.getElementById('storage-infra-collapsed-total-value');if(tv&&cv)cv.textContent=tv.textContent;ct.style.display='inline-flex';}}
}

function initStorageInfraSizing(){
  var b=document.getElementById('storage-infra-sizing-body'),ar=document.getElementById('storage-infra-sizing-arrow'),lb=document.getElementById('storage-infra-sizing-label');
  if(b)b.style.display='block'; if(ar)ar.style.transform='rotate(0deg)'; if(lb)lb.textContent='Collapse';
  var ct=document.getElementById('storage-infra-collapsed-total'); if(ct)ct.style.display='none';
}

var _storageInfraListenersAttached=false;
function wireStorageInfraListeners(){
  if(_storageInfraListenersAttached) return; _storageInfraListenersAttached=true;
  var t=document.getElementById('storage-tbody');
  if(t){t.addEventListener('input',calcStorageInfraCost);t.addEventListener('change',calcStorageInfraCost);}
  ['rate-storage-san-high-final','rate-storage-san-std-final','rate-storage-nas-high-final','rate-storage-nas-std-final','rate-storage-object-hot-final','rate-backup-fep-final','rate-backup-storage-final','rate-backup-ratio'].forEach(function(id){var el=document.getElementById(id);if(el)el.addEventListener('input',calcStorageInfraCost);});
}

/* ══════════════════════════════════════════
   STORAGE & BACKUP INFRASTRUCTURE COST LIVE SIZING
══════════════════════════════════════════ */
function toggleStorageInfraSizing() {
  var b = document.getElementById('storage-infra-sizing-body');
  var ar = document.getElementById('storage-infra-sizing-arrow');
  var lb = document.getElementById('storage-infra-sizing-label');
  var ct = document.getElementById('storage-infra-collapsed-total');
  if (!b) return;
  if (b.style.display === 'none') {
    b.style.display = 'block';
    if (ar) ar.style.transform = 'rotate(0deg)';
    if (lb) lb.textContent = 'Collapse';
    if (ct) ct.style.display = 'none';
  } else {
    b.style.display = 'none';
    if (ar) ar.style.transform = 'rotate(-90deg)';
    if (lb) lb.textContent = 'Expand';
    if (ct) {
      var tv = document.getElementById('storage-infra-total-value');
      var cv = document.getElementById('storage-infra-collapsed-total-value');
      if (tv && cv) cv.textContent = tv.textContent;
      ct.style.display = 'inline-flex';
    }
  }
}

function initStorageInfraSizing() {
  var b  = document.getElementById('storage-infra-sizing-body');
  var ar = document.getElementById('storage-infra-sizing-arrow');
  var lb = document.getElementById('storage-infra-sizing-label');
  if (b)  b.style.display = 'block';
  if (ar) ar.style.transform = 'rotate(0deg)';
  if (lb) lb.textContent = 'Collapse';
  var ct = document.getElementById('storage-infra-collapsed-total');
  if (ct) ct.style.display = 'none';
}

var _storageInfraListenersAttached = false;
function wireStorageInfraListeners() {
  if (_storageInfraListenersAttached) return;
  _storageInfraListenersAttached = true;
  var t = document.getElementById('storage-tbody');
  if (t) {
    t.addEventListener('input',  calcStorageInfraCost);
    t.addEventListener('change', calcStorageInfraCost);
  }
  var ids = ['rate-storage-san-high-final','rate-storage-san-std-final',
             'rate-storage-nas-high-final','rate-storage-nas-std-final',
             'rate-storage-object-hot-final','rate-storage-dasd-midrange-multiplier','rate-backup-fep-final',
             'rate-backup-storage-final','rate-backup-ratio'];
  ids.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', id === 'rate-storage-san-high-final' || id === 'rate-storage-dasd-midrange-multiplier' ? updateDasdMidrangeRate : calcStorageInfraCost);
  });
}

function updateDasdMidrangeRate() {
  var sanInput = document.getElementById('rate-storage-san-high-final');
  var multiplierInput = document.getElementById('rate-storage-dasd-midrange-multiplier');
  var referenceEl = document.getElementById('rate-storage-dasd-midrange-san-reference');
  var rateInput = document.getElementById('rate-storage-dasd-midrange-final');
  var errorEl = document.getElementById('rate-storage-dasd-midrange-error');
  if (!multiplierInput || !rateInput) return;

  var sanRate = parseFloat(sanInput ? sanInput.value : 100);
  if (isNaN(sanRate) || sanRate < 0) sanRate = 0;
  var multiplier = parseFloat(multiplierInput.value);
  var error = '';
  if (isNaN(multiplier) || multiplier < 0) {
    multiplier = 0;
    error = 'Value must be positive';
  } else if (multiplier > 100) {
    multiplier = 100;
    error = 'Value must be 100% or less';
  }

  if (referenceEl) referenceEl.textContent = formatCurrencyWithDecimals(sanRate, 2);
  if (errorEl) {
    errorEl.textContent = error;
    errorEl.style.display = error ? 'block' : 'none';
  }
  rateInput.value = (sanRate * (1 + multiplier / 100)).toFixed(2);
  calcStorageInfraCost();
}

function calcStorageInfraCost() {
  var pv = { san_high:0, san_standard:0, nas_high:0, nas_standard:0, object_storage:0, dasd_midrange:0 };
  var av = { san_high:0, san_standard:0, nas_high:0, nas_standard:0, object_storage:0, dasd_midrange:0 };

  document.querySelectorAll('#storage-tbody tr.compute-row').forEach(function(row) {
    var s = row.querySelectorAll('select');
    if (s.length < 2) return;
    var arch = s[0].value, type = s[1].value;
    var tb = parseFloat((row.querySelector('input[type="number"]') || {}).value) || 0;
    if (av.hasOwnProperty(arch)) av[arch] += tb;
    if (type === 'prod' && pv.hasOwnProperty(arch)) pv[arch] += tb;
  });

  function rv(id, def) {
    var el = document.getElementById(id), v = el ? parseFloat(el.value) : NaN;
    return (isNaN(v) || v < 0) ? def : v;
  }
  var r = {
    sanHigh: rv('rate-storage-san-high-final',  100),
    sanStd:  rv('rate-storage-san-std-final',    64),
    nasHigh: rv('rate-storage-nas-high-final',  104),
    nasStd:  rv('rate-storage-nas-std-final',   12.8),
    obj:     rv('rate-storage-object-hot-final', 18.4),
    dasdMidrange: rv('rate-storage-dasd-midrange-final', 115),
    fep:     rv('rate-backup-fep-final',         40),
    bsc:     rv('rate-backup-storage-final',     37.5),
    ratio:   rv('rate-backup-ratio',             3)
  };

  var hasData = Object.keys(av).some(function(k) { return (av[k] + pv[k]) > 0; });

  function fM(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function fD(n) { return '$' + n.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2}); }
  function td(s, right, bold) {
    var style = 'padding:6px 8px;border:1px solid #dde3ea;';
    if (right) style += 'text-align:right;';
    if (bold)  style += 'font-weight:600;';
    return '<td style="' + style + '">' + s + '</td>';
  }

  var types = [
    { l:'SAN High Performance', p:pv.san_high,       a:av.san_high,       rt:r.sanHigh },
    { l:'SAN Std. Performance', p:pv.san_standard,   a:av.san_standard,   rt:r.sanStd  },
    { l:'NAS High Perf.',       p:pv.nas_high,        a:av.nas_high,        rt:r.nasHigh },
    { l:'NAS Std. Perf.',       p:pv.nas_standard,   a:av.nas_standard,   rt:r.nasStd  },
    { l:'Object Storage',       p:pv.object_storage, a:av.object_storage, rt:r.obj     },
    { l:'DASD Storage - Midrange', p:pv.dasd_midrange, a:av.dasd_midrange, rt:r.dasdMidrange }
  ];

  // Storage Compute Summary
  var smrc = 0;
  var storageProdVol = 0;
  var storageTotalVol = 0;
  var cTbody = document.getElementById('storage-infra-compute-tbody');
  if (cTbody) {
    while (cTbody.firstChild) cTbody.removeChild(cTbody.firstChild);
    if (!hasData) {
      var ph = document.createElement('tr');
      ph.innerHTML = '<td colspan="7" class="ms-loading">Enter storage volumes above to calculate\u2026</td>';
      cTbody.appendChild(ph);
    } else {
      types.forEach(function(t, i) {
        var mrc = Math.round(t.a * t.rt);
        var ann = mrc * 12;
        smrc += mrc;
        storageProdVol += t.p;
        storageTotalVol += t.a;
        var tr = document.createElement('tr');
        tr.style.background = (i % 2 === 0) ? '#fff' : '#f7faff';
        tr.innerHTML = td(t.l, false, false) +
          td(t.p > 0 ? t.p.toLocaleString('en-US') : '\u2014', true, false) +
          td(t.a - t.p > 0 ? (t.a - t.p).toLocaleString('en-US') : '\u2014', true, false) +
          td(t.a > 0 ? t.a.toLocaleString('en-US') : '\u2014', true, false) +
          td(fD(t.rt), true, false) +
          td(fM(mrc), true, true) +
          td(fM(ann), true, true);
        cTbody.appendChild(tr);
      });
      var sub = document.createElement('tr');
      sub.className = 'ms-subtotal-row';
      sub.innerHTML = '<td><strong>Storage Subtotal</strong></td>' +
        '<td style="text-align:right;"><strong>' + storageProdVol.toLocaleString('en-US') + '</strong></td>' +
        '<td style="text-align:right;"><strong>' + (storageTotalVol - storageProdVol).toLocaleString('en-US') + '</strong></td>' +
        '<td style="text-align:right;"><strong>' + storageTotalVol.toLocaleString('en-US') + '</strong></td>' +
        '<td></td>' +
        '<td style="text-align:right;"><strong>' + fM(smrc) + '</strong></td>' +
        '<td style="text-align:right;"><strong>' + fM(smrc * 12) + '</strong></td>';
      cTbody.appendChild(sub);
    }
  }

  var sAnn = smrc * 12;
  var sba = document.getElementById('storage-infra-storage-annual');
  var sbm = document.getElementById('storage-infra-storage-monthly');
  if (sba) sba.textContent = hasData ? fM(sAnn) : '$0';
  if (sbm) sbm.textContent = hasData ? fM(smrc) : '$0';

  var storageMonthlyPerTB = storageTotalVol > 0 ? smrc / storageTotalVol : 0;
  var storageAnnualPerTB  = storageTotalVol > 0 ? sAnn / storageTotalVol : 0;
  var storageTotalTBEl = document.getElementById('storage-infra-total-tb-meta');
  var smptEl = document.getElementById('storage-infra-monthly-per-tb');
  var saptEl = document.getElementById('storage-infra-annual-per-tb');
  if (storageTotalTBEl) storageTotalTBEl.textContent = Math.round(storageTotalVol).toLocaleString('en-US');
  if (smptEl) smptEl.textContent = fM(storageMonthlyPerTB);
  if (saptEl) saptEl.textContent = fM(storageAnnualPerTB);

  // Front End Protected Backup (standalone)
  var fepVol = pv.san_high + pv.san_standard + pv.nas_high + pv.nas_standard + pv.dasd_midrange;
  var bscVol = fepVol * r.ratio;
  var fepMrc = Math.round(fepVol * r.fep);
  var fepAnn = fepMrc * 12;

  var bTbody = document.getElementById('storage-infra-backup-tbody');
  if (bTbody) {
    while (bTbody.firstChild) bTbody.removeChild(bTbody.firstChild);
    if (!hasData) {
      var ph3 = document.createElement('tr');
      ph3.innerHTML = '<td colspan="6" class="ms-loading">Enter storage volumes above to calculate\u2026</td>';
      bTbody.appendChild(ph3);
    } else {
      var tr3 = document.createElement('tr');
      tr3.style.background = '#fff';
      tr3.innerHTML = td('Front End Protected Backup (TB)', false, false) +
        td(Math.round(fepVol).toLocaleString('en-US'), true, false) +
        td(Math.round(fepVol).toLocaleString('en-US'), true, false) +
        td(fD(r.fep), true, false) +
        td(fM(fepMrc), true, true) +
        td(fM(fepAnn), true, true);
      bTbody.appendChild(tr3);
      var bs = document.createElement('tr');
      bs.className = 'ms-subtotal-row';
      bs.innerHTML = '<td><strong>Software Charges (Commvault License) Subtotal</strong></td>' +
        '<td style="text-align:right;"><strong>' + Math.round(fepVol).toLocaleString('en-US') + '</strong></td>' +
        '<td style="text-align:right;"><strong>' + Math.round(fepVol).toLocaleString('en-US') + '</strong></td><td></td>' +
        '<td style="text-align:right;"><strong>' + fM(fepMrc) + '</strong></td>' +
        '<td style="text-align:right;"><strong>' + fM(fepAnn) + '</strong></td>';
      bTbody.appendChild(bs);
    }
  }

  var bba = document.getElementById('storage-infra-backup-annual');
  var bbm = document.getElementById('storage-infra-backup-monthly');
  var fepTotalTBEl = document.getElementById('storage-infra-fep-total-tb-meta');
  var fepMonthlyPerTBEl = document.getElementById('storage-infra-fep-monthly-per-tb');
  var fepAnnualPerTBEl = document.getElementById('storage-infra-fep-annual-per-tb');
  if (bba) bba.textContent = hasData ? fM(fepAnn) : '$0';
  if (bbm) bbm.textContent = hasData ? fM(fepMrc) : '$0';
  if (fepTotalTBEl) fepTotalTBEl.textContent = Math.round(fepVol).toLocaleString('en-US');
  if (fepMonthlyPerTBEl) fepMonthlyPerTBEl.textContent = fepVol > 0 ? fM(fepMrc / fepVol) : '$0';
  if (fepAnnualPerTBEl) fepAnnualPerTBEl.textContent = fepVol > 0 ? fM(fepAnn / fepVol) : '$0';

  // Backup Storage Capacity (standalone)
  var bscMrc = Math.round(bscVol * r.bsc);
  var bscAnn = bscMrc * 12;

  var bscTbody = document.getElementById('storage-infra-bsc-tbody');
  if (bscTbody) {
    while (bscTbody.firstChild) bscTbody.removeChild(bscTbody.firstChild);
    if (!hasData) {
      var ph5 = document.createElement('tr');
      ph5.innerHTML = '<td colspan="7" class="ms-loading">Enter storage volumes above to calculate\u2026</td>';
      bscTbody.appendChild(ph5);
    } else {
      var trb = document.createElement('tr');
      trb.style.background = '#fff';
      trb.innerHTML = td('Backup Storage Capacity (TB)', false, false) +
        td(Math.round(fepVol).toLocaleString('en-US'), true, false) +
        td(r.ratio.toLocaleString('en-US'), true, false) +
        td(Math.round(bscVol).toLocaleString('en-US'), true, false) +
        td(fD(r.bsc), true, false) +
        td(fM(bscMrc), true, true) +
        td(fM(bscAnn), true, true);
      bscTbody.appendChild(trb);
      var bscSub = document.createElement('tr');
      bscSub.className = 'ms-subtotal-row';
      bscSub.innerHTML = '<td><strong>Backup Storage Capacity Subtotal</strong></td>' +
        '<td style="text-align:right;"><strong>' + Math.round(fepVol).toLocaleString('en-US') + '</strong></td>' +
        '<td style="text-align:right;"><strong>' + r.ratio.toLocaleString('en-US') + '</strong></td>' +
        '<td style="text-align:right;"><strong>' + Math.round(bscVol).toLocaleString('en-US') + '</strong></td><td></td>' +
        '<td style="text-align:right;"><strong>' + fM(bscMrc) + '</strong></td>' +
        '<td style="text-align:right;"><strong>' + fM(bscAnn) + '</strong></td>';
      bscTbody.appendChild(bscSub);
    }
  }

  var bscBannerAnn  = document.getElementById('storage-infra-bsc-annual');
  var bscBannerMo   = document.getElementById('storage-infra-bsc-monthly');
  if (bscBannerAnn) bscBannerAnn.textContent = hasData ? fM(bscAnn) : '$0';
  if (bscBannerMo)  bscBannerMo.textContent  = hasData ? fM(bscMrc) : '$0';

  var bscMonthlyPerTB = bscVol > 0 ? bscMrc / bscVol : 0;
  var bscAnnualPerTB  = bscVol > 0 ? bscAnn / bscVol : 0;
  var bscTotalTBEl = document.getElementById('storage-infra-bsc-total-tb-meta');
  var bscMptEl = document.getElementById('storage-infra-bsc-monthly-per-tb');
  var bscAptEl = document.getElementById('storage-infra-bsc-annual-per-tb');
  if (bscTotalTBEl) bscTotalTBEl.textContent = Math.round(bscVol).toLocaleString('en-US');
  if (bscMptEl) bscMptEl.textContent = fM(bscMonthlyPerTB);
  if (bscAptEl) bscAptEl.textContent = fM(bscAnnualPerTB);

  var grand = sAnn + fepAnn + bscAnn;
  var grandMonthly = smrc + fepMrc + bscMrc;
  var protectedStorageTotalVol = av.san_high + av.san_standard + av.nas_high + av.nas_standard + av.dasd_midrange;
  var combinedStorageBackupTb = storageTotalVol + protectedStorageTotalVol + bscVol;
  var te = document.getElementById('storage-infra-total-value');
  var tm = document.getElementById('storage-infra-total-monthly-value');
  var ce = document.getElementById('storage-infra-collapsed-total-value');
  var combinedTbEl = document.getElementById('storage-infra-total-combined-tb');
  var combinedMonthlyPerTbEl = document.getElementById('storage-infra-total-monthly-per-tb');
  var combinedAnnualPerTbEl = document.getElementById('storage-infra-total-annual-per-tb');
  if (te) te.textContent = hasData ? fM(grand) : '$0';
  if (tm) tm.textContent = hasData ? fM(grandMonthly) : '$0';
  if (ce) ce.textContent = hasData ? fM(grand) : '$0';
  if (combinedTbEl) combinedTbEl.textContent = Math.round(combinedStorageBackupTb).toLocaleString('en-US');
  if (combinedMonthlyPerTbEl) combinedMonthlyPerTbEl.textContent = combinedStorageBackupTb > 0 ? fM(grandMonthly / combinedStorageBackupTb) : '$0';
  if (combinedAnnualPerTbEl) combinedAnnualPerTbEl.textContent = combinedStorageBackupTb > 0 ? fM(grand / combinedStorageBackupTb) : '$0';
  updateNetworkInfraSizing();
}

/* ══════════════════════════════════════════
   DATABASE AND MIDDLEWARE ROWS
══════════════════════════════════════════ */
var _dbRowCount = 1;
var _mwRowCount = 1;

var DB_OPTIONS =
  '<option value="oracle">Managed Database (Oracle)</option>' +
  '<option value="sql">Managed Database (SQL)</option>' +
  '<option value="db2">Managed Database (DB2)</option>';

var MW_OPTIONS =
  '<option value="web_server">Managed Web Servers (Apache HTTP, Internet Information Services - IIS, Sun Java Web, Jigsaw etc.)</option>' +
  '<option value="web_app_server">Managed Web Application Server (IBM Websphere, Oracle Weblogic, Apache TomCat etc.)</option>' +
  '<option value="cloud_app_server">Managed Cloud Application Server (Cloud services, API integrations, API management, B2B integration etc.)</option>';

function addDbRow() {
  var n = _dbRowCount++;
  var tbody = document.getElementById('db-os-tbody');
  var row = document.createElement('tr');
  row.className = 'compute-row';
  row.innerHTML =
    '<td class="compute-td"><div class="select-wrapper"><select class="compute-select" id="db_type_' + n + '" name="db_type_' + n + '" onchange="updateDbSummary()">' + DB_OPTIONS + '</select></div></td>' +
    '<td class="compute-td"><input type="number" id="db_count_' + n + '" name="db_count_' + n + '" class="compute-number" value="" min="0" step="1" placeholder="0" oninput="updateDbSummary()" /></td>' +
    '<td class="compute-td" style="text-align:center;"><button class="delete-btn" onclick="deleteDbRow(this)" title="Delete row">\u2715</button></td>';
  tbody.appendChild(row);
  updateDbSummary();
}

function deleteDbRow(btn) {
  var row   = btn.closest('tr');
  var tbody = btn.closest('tbody');
  if (tbody.rows.length <= 1) return;
  row.remove();
  updateDbSummary();
}

function updateDbSummary() {
  var total = 0;
  document.querySelectorAll('#db-os-tbody tr.compute-row').forEach(function(row) {
    var inp = row.querySelector('.compute-number');
    total += parseFloat(inp ? inp.value : 0) || 0;
  });
  var te = document.getElementById('db-total-instances');
  if (te) te.textContent = total.toLocaleString('en-US');
  calcDbMwManagedServicesSizing();
}

function addMwRow() {
  var n = _mwRowCount++;
  var tbody = document.getElementById('mw-os-tbody');
  var row = document.createElement('tr');
  row.className = 'compute-row';
  row.innerHTML =
    '<td class="compute-td"><div class="select-wrapper"><select class="compute-select" id="mw_type_' + n + '" name="mw_type_' + n + '" onchange="updateMwSummary()">' + MW_OPTIONS + '</select></div></td>' +
    '<td class="compute-td"><input type="number" id="mw_count_' + n + '" name="mw_count_' + n + '" class="compute-number" value="" min="0" step="1" placeholder="0" oninput="updateMwSummary()" /></td>' +
    '<td class="compute-td" style="text-align:center;"><button class="delete-btn" onclick="deleteMwRow(this)" title="Delete row">\u2715</button></td>';
  tbody.appendChild(row);
  updateMwSummary();
}

function deleteMwRow(btn) {
  var row   = btn.closest('tr');
  var tbody = btn.closest('tbody');
  if (tbody.rows.length <= 1) return;
  row.remove();
  updateMwSummary();
}

function updateMwSummary() {
  var total = 0;
  document.querySelectorAll('#mw-os-tbody tr.compute-row').forEach(function(row) {
    var inp = row.querySelector('.compute-number');
    total += parseFloat(inp ? inp.value : 0) || 0;
  });
  var te = document.getElementById('mw-total-instances');
  if (te) te.textContent = total.toLocaleString('en-US');
  calcDbMwManagedServicesSizing();
}

var DBMW_OFFSHORE_PCT = 0.60;
var DBMW_RATE_DISCOUNT = 0.625;
var _dbmwMSListenersAttached = false;

/* ══════════════════════════════════════════════════════
   MAINFRAME MANAGED SERVICES LIVE SIZING
══════════════════════════════════════════════════════ */
var MF_RATE_DISCOUNT = 0.625;
var _mfMSListenersAttached = false;

var MF_COMPONENT_CONFIG = [
  { key: 'mainframe', label: 'MAINFRAME',     kpiLabel: 'mainframe',               fallbackKpi: 1067 },
  { key: 'dasd',      label: 'DASD',          kpiLabel: 'storage',                 fallbackKpi: 1218 },
  { key: 'vtl',       label: 'VTL',           kpiLabel: 'backup',                  fallbackKpi: 1215 },
  { key: 'jobsched',  label: 'JOB SCHEDULING', kpiLabel: 'mainframe job scheduling', fallbackKpi: 133 }
];

function extractMainframeKPIs() {
  var maturityEl = document.getElementById('maturityLevel');
  var maturity   = maturityEl ? maturityEl.value : 'median';
  var colMap     = { lower: 2, median: 4, upper: 3 };
  var colIdx     = (colMap[maturity] !== undefined) ? colMap[maturity] : 4;

  var kpis = {};
  MF_COMPONENT_CONFIG.forEach(function(c) { kpis[c.key] = c.fallbackKpi; });
  /* Column matching maturityLevel: Tower | UOM | LQ(2) | UQ(3) | Median(4) */
  document.querySelectorAll('#panel-fte-kpis table tbody tr').forEach(function(row) {
    var cells = row.querySelectorAll('td');
    if (cells.length < 5) return;
    var lbl = (cells[0].textContent || '').trim().toLowerCase();
    var raw = parseFloat((cells[colIdx].textContent || '').replace(/,/g, ''));
    if (isNaN(raw) || raw <= 0) return;
    MF_COMPONENT_CONFIG.forEach(function(c) { if (lbl === c.kpiLabel) kpis[c.key] = raw; });
  });
  return kpis;
}

function extractMainframeRates() {
  var rates = {
    mainframe: { us: 9654,  india: 2903 },
    dasd:      { us: 6884,  india: 1936 },
    vtl:       { us: 6243,  india: 1950 },
    jobsched:  { us: 12489, india: 3977 }
  };
  document.querySelectorAll('#ms-rates-tbody tr').forEach(function(row) {
    var cells = row.querySelectorAll('td');
    if (cells.length < 7 || cells[0].getAttribute('colspan')) return;
    var tower = (cells[0].textContent || '').trim().toLowerCase();
    var from  = (cells[3].textContent || '').trim().toLowerCase();
    var disc  = parseFloat((cells[6].textContent || '').replace(/[^0-9.]/g, ''));
    if (isNaN(disc) || disc <= 0) return;
    var loc = (from.indexOf('india') !== -1) ? 'india'
            : (from.indexOf('united states') !== -1) ? 'us' : null;
    if (!loc) return;
    if (tower === 'mainframe')       rates.mainframe[loc] = disc;
    else if (tower === 'storage' || tower === 'dasd' || tower === 'dasad') rates.dasd[loc] = disc;
    else if (tower === 'back up' || tower === 'backup' || tower === 'vtl') rates.vtl[loc] = disc;
    else if (tower === 'job scheduling') rates.jobsched[loc] = disc;
  });
  return rates;
}

function calcMainframeMSSizing() {
  var mix   = getDeliveryMix();
  var usPct = mix.usPct;
  var inPct = mix.indiaPct;

  var usSpan = document.getElementById('mf-ms-us-delivery');
  var inSpan = document.getElementById('mf-ms-india-delivery');
  if (usSpan) usSpan.textContent = '(' + Math.round(usPct * 100) + '% DELIVERY)';
  if (inSpan) inSpan.textContent = '(' + Math.round(inPct * 100) + '% DELIVERY)';

  var kpis  = extractMainframeKPIs();
  var rates = extractMainframeRates();

  function numVal(id) { var el = document.getElementById(id); return parseFloat(el ? el.value : 0) || 0; }
  var mipsVol = numVal('mf-mips');
  var dasdVol = numVal('mf-dasd');
  var vtlVol  = numVal('mf-vtl');
  var jobsCb  = document.getElementById('mf-job-scheduling');
  var jobsOn  = jobsCb && jobsCb.checked;
  /* volume stored in thousands to match KPI unit (1000 JOBS per FTE) */
  var jobsVol = jobsOn ? numVal('mf-jobs-per-month') : 0;

  var components = [
    { key: 'mainframe', label: 'MAINFRAME',          vol: mipsVol, kpi: kpis.mainframe, usRate: rates.mainframe.us, inRate: rates.mainframe.india },
    { key: 'dasd',      label: 'DASD',               vol: dasdVol, kpi: kpis.dasd,      usRate: rates.dasd.us,      inRate: rates.dasd.india      },
    { key: 'vtl',       label: 'VTL',                vol: vtlVol,  kpi: kpis.vtl,       usRate: rates.vtl.us,       inRate: rates.vtl.india       }
  ];
  if (jobsOn) components.push({ key: 'jobsched', label: 'MAINFRAME JOB SCHEDULING', vol: jobsVol, kpi: kpis.jobsched, usRate: rates.jobsched.us, inRate: rates.jobsched.india });

  function fmtN(n, d) { return n.toLocaleString('en-US', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
  function fmtC(n) { return '$' + fmtN(Math.round(n)); }

  /* Pre-compute row quantities and per-location rates/FTEs. */
  var rowData = components.map(function(c) {
    var ftes     = (c.vol > 0 && c.kpi > 0) ? Math.ceil(c.vol / c.kpi) : 0;
    var usFte    = ftes * usPct;
    var indiaFte = ftes * inPct;
    return {
      label: c.label,
      kpi: c.kpi,
      vol: c.vol,
      ftes: ftes,
      usFte: usFte,
      indiaFte: indiaFte,
      usRate: c.usRate,
      inRate: c.inRate
    };
  });

  function buildPanel(panelId, isUs) {
    var el = document.getElementById(panelId);
    if (!el) return { mrc: 0, ann: 0 };
    var totFte = 0, totLoc = 0, totMrc = 0, totAnn = 0;
    var rows = '';
    rowData.forEach(function(r) {
      var locFte = isUs ? r.usFte : r.indiaFte;
      var rate   = isUs ? r.usRate : r.inRate;
      var preciseMonthly = locFte * rate;
      var rowMrc = Math.round(preciseMonthly);
      var rowAnn = Math.round(preciseMonthly * 12);
      totFte  += r.ftes;
      totLoc  += locFte;
      totMrc  += rowMrc;
      totAnn  += rowAnn;
      rows +=
        '<tr>' +
          '<td>'                          + r.label            + '</td>' +
          '<td class="dbmw-ms-number">'  + fmtN(r.kpi)        + '</td>' +
          '<td class="dbmw-ms-number">'  + fmtN(Math.round(r.vol)) + '</td>' +
          '<td class="dbmw-ms-number">'  + fmtN(r.ftes, 2)    + '</td>' +
          '<td class="dbmw-ms-number">'  + fmtN(locFte, 2)    + '</td>' +
          '<td class="dbmw-ms-rate">'    + fmtC(rate)         + '</td>' +
          '<td class="dbmw-ms-number">'  + fmtC(rowMrc)       + '</td>' +
          '<td class="dbmw-ms-annual">'  + fmtC(rowAnn)       + '</td>' +
        '</tr>';
    });
    rows +=
      '<tr class="dbmw-ms-total-row">' +
        '<td>SUBTOTAL</td><td></td><td></td>' +
        '<td class="dbmw-ms-number">' + fmtN(totFte, 2) + '</td>' +
        '<td class="dbmw-ms-number">' + fmtN(totLoc, 2) + '</td>' +
        '<td></td>' +
        '<td class="dbmw-ms-number">' + fmtC(totMrc) + '</td>' +
        '<td class="dbmw-ms-annual">'  + fmtC(totAnn) + '</td>' +
      '</tr>';
    var html =
      '<div class="dbmw-ms-table-caption">Calculation of Labor Costs</div>' +
      '<table class="dbmw-ms-table"><thead><tr>' +
        '<th>Component</th><th>KPI</th><th>Volume</th><th>FTEs</th>' +
        '<th>' + (isUs ? 'US FTE' : 'India FTE') + '</th>' +
        '<th>' + (isUs ? 'US Rate' : 'India Rate') + '</th>' +
        '<th>Monthly Cost</th><th>Annual Cost</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table>';
    return { html: html, mrc: totMrc, ann: totAnn };
  }

  var usResult = buildPanel('mf-ms-us-panel-body', true);
  var inResult = buildPanel('mf-ms-india-panel-body', false);
  var usEl2 = document.getElementById('mf-ms-us-panel-body');
  var inEl2 = document.getElementById('mf-ms-india-panel-body');
  if (usEl2) usEl2.innerHTML = usResult.html;
  if (inEl2) inEl2.innerHTML = inResult.html;

  /* Summary banner should show total across both locations. */
  var totalMrc = usResult.mrc + inResult.mrc;
  var totalAnn = usResult.ann + inResult.ann;
  function setText(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }
  setText('mf-ms-total-mrc',            fmtC(totalMrc));
  setText('mf-ms-total-annual',         fmtC(totalAnn));
  setText('mf-ms-total-mips-meta',       fmtN(Math.round(mipsVol)));
  setText('mf-ms-monthly-per-mips',      fmtC(mipsVol > 0 ? totalMrc / mipsVol : 0));
  setText('mf-ms-annual-per-mips',       fmtC(mipsVol > 0 ? totalAnn / mipsVol : 0));
  setText('mf-ms-total-value',          fmtC(totalAnn));
  setText('mf-ms-total-monthly-value',  fmtC(totalMrc));
  setText('mf-ms-collapsed-total-value', fmtC(totalAnn));
  updateOverlaysCFSSizing();
}

function toggleMFMSSizing() {
  var body   = document.getElementById('mf-ms-sizing-body');
  var arrow  = document.getElementById('mf-ms-sizing-arrow');
  var label  = document.getElementById('mf-ms-sizing-label');
  var colTot = document.getElementById('mf-ms-collapsed-total');
  if (!body) return;
  var isCollapsed = (body.style.display === 'none');
  if (isCollapsed) {
    body.style.display = 'block';
    if (arrow)  arrow.style.transform = 'rotate(0deg)';
    if (label)  label.textContent = 'Collapse';
    if (colTot) colTot.style.display = 'none';
  } else {
    body.style.display = 'none';
    if (arrow)  arrow.style.transform = 'rotate(-90deg)';
    if (label)  label.textContent = 'Expand';
    if (colTot) {
      var bv = document.getElementById('mf-ms-total-value');
      var cv = document.getElementById('mf-ms-collapsed-total-value');
      if (bv && cv) cv.textContent = bv.textContent;
      colTot.style.display = 'inline-flex';
    }
  }
}

function initMFMSSizing() {
  var body   = document.getElementById('mf-ms-sizing-body');
  var arrow  = document.getElementById('mf-ms-sizing-arrow');
  var label  = document.getElementById('mf-ms-sizing-label');
  var colTot = document.getElementById('mf-ms-collapsed-total');
  if (!body) return;
  body.style.display = 'block';
  if (arrow)  arrow.style.transform = 'rotate(0deg)';
  if (label)  label.textContent = 'Collapse';
  if (colTot) colTot.style.display = 'none';
}

function wireMFMSSizingListeners() {
  if (_mfMSListenersAttached) return;
  _mfMSListenersAttached = true;
  ['maturityLevel', 'usDelivery', 'indiaDelivery'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) { el.addEventListener('input', updateAllManagedServicesSizing); el.addEventListener('change', updateAllManagedServicesSizing); }
  });
  ['mf-mips', 'mf-dasd', 'mf-vtl', 'mf-jobs-per-month'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) { el.addEventListener('input', calcMainframeMSSizing); el.addEventListener('change', calcMainframeMSSizing); }
  });
  var jobsCb = document.getElementById('mf-job-scheduling');
  if (jobsCb) jobsCb.addEventListener('change', calcMainframeMSSizing);
  ['panel-fte-kpis', 'panel-managed-services'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) { el.addEventListener('input', calcMainframeMSSizing); el.addEventListener('change', calcMainframeMSSizing); }
  });
}

var _mfInfraListenersAttached = false;

function extractMainframeInfraRate() {
  var rates = {
    mainframe: 0,
    storage: 0,
    backup: 0
  };

  getMainframeInfraRateConfigs().forEach(function(cfg) {
    var finalRateEl = document.getElementById(cfg.finalDisplayId);
    var baseInput = document.getElementById(cfg.rateInputId);
    var premiumInput = document.getElementById(cfg.premiumInputId);

    var finalRate = 0;
    if (finalRateEl) {
      finalRate = parseFloat((finalRateEl.textContent || '').replace(/[^0-9.]/g, ''));
    }

    if (isNaN(finalRate) || finalRate <= 0) {
      var baseRate = parseFloat(baseInput ? baseInput.value : 0);
      var premiumPct = parseFloat(premiumInput ? premiumInput.value : 0);
      if (isNaN(baseRate) || baseRate < 0) baseRate = 0;
      if (isNaN(premiumPct)) premiumPct = 0;
      if (premiumPct < 0) premiumPct = 0;
      if (premiumPct > 100) premiumPct = 100;
      finalRate = baseRate * (1 + (premiumPct / 100));
    }

    rates[cfg.key] = finalRate;
  });

  return rates;
}

function toggleMainframeInfraSizing() {
  var body = document.getElementById('mf-infra-sizing-body');
  var arrow = document.getElementById('mf-infra-sizing-arrow');
  var label = document.getElementById('mf-infra-sizing-label');
  var collapsedTot = document.getElementById('mf-infra-collapsed-total');
  if (!body) return;

  var isCollapsed = body.style.display === 'none';
  if (isCollapsed) {
    body.style.display = 'block';
    if (arrow) arrow.style.transform = 'rotate(0deg)';
    if (label) label.textContent = 'Collapse';
    if (collapsedTot) collapsedTot.style.display = 'none';
  } else {
    body.style.display = 'none';
    if (arrow) arrow.style.transform = 'rotate(-90deg)';
    if (label) label.textContent = 'Expand';
    if (collapsedTot) {
      var bannerVal = document.getElementById('mf-infra-total-value');
      var collapsedVal = document.getElementById('mf-infra-collapsed-total-value');
      if (bannerVal && collapsedVal) collapsedVal.textContent = bannerVal.textContent;
      collapsedTot.style.display = 'inline-flex';
    }
  }
}

function initMainframeInfraSizing() {
  var body = document.getElementById('mf-infra-sizing-body');
  var arrow = document.getElementById('mf-infra-sizing-arrow');
  var label = document.getElementById('mf-infra-sizing-label');
  var collapsedTot = document.getElementById('mf-infra-collapsed-total');
  if (!body) return;
  body.style.display = 'block';
  if (arrow) arrow.style.transform = 'rotate(0deg)';
  if (label) label.textContent = 'Collapse';
  if (collapsedTot) collapsedTot.style.display = 'none';
}

function wireMainframeInfraSizingListeners() {
  if (_mfInfraListenersAttached) return;
  _mfInfraListenersAttached = true;

  [
    'mf-mips',
    'mf-dasd',
    'mf-vtl',
    'mf-infra-rate',
    'mf-infra-insourced-premium',
    'mf-storage-infra-rate',
    'mf-storage-insourced-premium',
    'mf-backup-infra-rate',
    'mf-backup-insourced-premium'
  ].forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', calcMainframeInfraCost);
    el.addEventListener('change', calcMainframeInfraCost);
  });
}

function calcMainframeInfraCost() {
  var mipsInput = document.getElementById('mf-mips');
  var dasdInput = document.getElementById('mf-dasd');
  var vtlInput = document.getElementById('mf-vtl');
  var mipsUnits = parseFloat(mipsInput ? mipsInput.value : 0) || 0;
  var dasdUnits = parseFloat(dasdInput ? dasdInput.value : 0) || 0;
  var vtlUnits = parseFloat(vtlInput ? vtlInput.value : 0) || 0;

  var rates = extractMainframeInfraRate();
  var rows = [
    { component: 'MAINFRAME', units: mipsUnits, rate: rates.mainframe },
    { component: 'DASD', units: dasdUnits, rate: rates.storage },
    { component: 'VTL', units: vtlUnits, rate: rates.backup }
  ];

  var monthlyCost = rows.reduce(function(sum, row) {
    return sum + (row.units * row.rate);
  }, 0);
  var annualCost = monthlyCost * 12;

  function fmt(n) {
    return '$' + Math.round(n || 0).toLocaleString('en-US');
  }

  function fmtRate(n) {
    return '$' + (parseFloat(n) || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  var rateDisplayMainframe = document.getElementById('mf-live-infra-rate-display');
  if (rateDisplayMainframe) rateDisplayMainframe.textContent = fmtRate(rates.mainframe);
  var rateDisplayStorage = document.getElementById('mf-live-storage-rate-display');
  if (rateDisplayStorage) rateDisplayStorage.textContent = fmtRate(rates.storage);
  var rateDisplayBackup = document.getElementById('mf-live-backup-rate-display');
  if (rateDisplayBackup) rateDisplayBackup.textContent = fmtRate(rates.backup);
  updateLiveSizingVisibility();

  var computeTbody = document.getElementById('mf-infra-compute-tbody');
  var costTbody = document.getElementById('mf-infra-cost-tbody');
  var totalBanner = document.getElementById('mf-infra-total-value');
  var totalMonthlyEl = document.getElementById('mf-infra-total-monthly-value');
  var collapsedVal = document.getElementById('mf-infra-collapsed-total-value');
  var totalMipsMeta = document.getElementById('mf-infra-total-mips-meta');
  var monthlyPerMipsMeta = document.getElementById('mf-infra-monthly-per-mips');
  var annualPerMipsMeta = document.getElementById('mf-infra-annual-per-mips');

  if ((mipsUnits + dasdUnits + vtlUnits) <= 0) {
    if (computeTbody) computeTbody.innerHTML =
      '<tr><td colspan="4" class="ms-loading">Enter Mainframe inputs above to calculate…</td></tr>';
    if (costTbody) costTbody.innerHTML =
      '<tr><td colspan="2" class="ms-loading">Enter Mainframe inputs above to calculate…</td></tr>';
    if (totalBanner) totalBanner.textContent = '$0';
    if (totalMonthlyEl) totalMonthlyEl.textContent = '$0';
    if (collapsedVal) collapsedVal.textContent = '$0';
    if (totalMipsMeta) totalMipsMeta.textContent = '0';
    if (monthlyPerMipsMeta) monthlyPerMipsMeta.textContent = '$0';
    if (annualPerMipsMeta) annualPerMipsMeta.textContent = '$0';
    return;
  }

  if (computeTbody) {
    var computeRows = '';
    rows.forEach(function(row) {
      var rowMonthly = row.units * row.rate;
      computeRows +=
        '<tr>' +
          '<td>' + row.component + '</td>' +
          '<td>' + Math.round(row.units).toLocaleString('en-US') + '</td>' +
          '<td>' + fmtRate(row.rate) + '</td>' +
          '<td>' + fmt(rowMonthly) + '</td>' +
        '</tr>';
    });

    computeRows +=
      '<tr class="ms-subtotal-row">' +
        '<td style="text-align:right; padding-right:10px;">Monthly Total</td>' +
        '<td></td>' +
        '<td></td>' +
        '<td>' + fmt(monthlyCost) + '</td>' +
      '</tr>';

    computeTbody.innerHTML = computeRows;
  }

  if (costTbody) {
    costTbody.innerHTML =
      '<tr>' +
        '<td>Monthly</td>' +
        '<td>' + fmt(monthlyCost) + '</td>' +
      '</tr>' +
      '<tr class="ms-subtotal-row">' +
        '<td>Annual (&times;12)</td>' +
        '<td style="color:#2ecc71; font-weight:700;">' + fmt(annualCost) + '</td>' +
      '</tr>';
  }

  if (totalBanner) totalBanner.textContent = fmt(annualCost);
  if (totalMonthlyEl) totalMonthlyEl.textContent = fmt(monthlyCost);
  if (collapsedVal) collapsedVal.textContent = fmt(annualCost);
  if (totalMipsMeta) totalMipsMeta.textContent = Math.round(mipsUnits).toLocaleString('en-US');
  if (monthlyPerMipsMeta) monthlyPerMipsMeta.textContent = mipsUnits > 0 ? fmt(monthlyCost / mipsUnits) : '$0';
  if (annualPerMipsMeta) annualPerMipsMeta.textContent = mipsUnits > 0 ? fmt(annualCost / mipsUnits) : '$0';
}

/* ══════════════════════════════════════════════════════ */

var DBMW_DATABASE_CONFIG = [
  { key: 'sql', label: 'SQL DATABASE', kpiLabel: 'sql database', rateLabel: 'sql database', fallbackKpi: 170, fallbackRates: { us: 11454, india: 3365 } },
  { key: 'oracle', label: 'ORACLE DATABASE', kpiLabel: 'oracle database', rateLabel: 'oracle database', fallbackKpi: 94, fallbackRates: { us: 12928, india: 3798 } },
  { key: 'db2', label: 'DB2 DATABASE', kpiLabel: 'db2 database', rateLabel: 'db2 database', fallbackKpi: 74, fallbackRates: { us: 13245, india: 3992 } }
];

var DBMW_MIDDLEWARE_CONFIG = [
  { key: 'web_server', label: 'Web Server', kpiLabel: 'middleware (web server)', rateLabel: 'middleware (web server)', fallbackKpi: 425, fallbackRates: { us: 10405, india: 3249 } },
  { key: 'web_app_server', label: 'Web Application Server', kpiLabel: 'middleware (web application server)', rateLabel: 'middleware (web application server)', fallbackKpi: 365, fallbackRates: { us: 12489, india: 3977 } },
  { key: 'cloud_app_server', label: 'Cloud Application Server', kpiLabel: 'middleware (cloud application server)', rateLabel: 'middleware (cloud application server)', fallbackKpi: 425, fallbackRates: { us: 11957, india: 3734 } }
];

function extractDbMwKPIs() {
  var maturityEl = document.getElementById('maturityLevel');
  var maturity   = maturityEl ? maturityEl.value : 'median';
  var colMap     = { lower: 2, median: 4, upper: 3 };
  var colIdx     = (colMap[maturity] !== undefined) ? colMap[maturity] : 4;
  var kpis = {};

  DBMW_DATABASE_CONFIG.concat(DBMW_MIDDLEWARE_CONFIG).forEach(function(item) {
    kpis[item.key] = item.fallbackKpi;
  });

  document.querySelectorAll('#panel-fte-kpis table tbody tr').forEach(function(row) {
    var cells = row.querySelectorAll('td');
    if (cells.length <= colIdx) return;
    var label = (cells[0].textContent || '').trim().toLowerCase();
    var raw = parseFloat((cells[colIdx].textContent || '').replace(/,/g, ''));
    if (isNaN(raw) || raw <= 0) return;

    DBMW_DATABASE_CONFIG.concat(DBMW_MIDDLEWARE_CONFIG).forEach(function(item) {
      if (label === item.kpiLabel) kpis[item.key] = raw;
    });
  });

  return kpis;
}

function getDbMwCounts() {
  var counts = {
    database: { sql: 0, oracle: 0, db2: 0 },
    middleware: { web_server: 0, web_app_server: 0, cloud_app_server: 0 }
  };

  document.querySelectorAll('#db-os-tbody tr.compute-row').forEach(function(row) {
    var select = row.querySelector('select.compute-select');
    var input = row.querySelector('input.compute-number');
    var key = select ? select.value : '';
    var qty = parseFloat(input ? input.value : 0) || 0;
    if (counts.database.hasOwnProperty(key)) counts.database[key] += qty;
  });

  document.querySelectorAll('#mw-os-tbody tr.compute-row').forEach(function(row) {
    var select = row.querySelector('select.compute-select');
    var input = row.querySelector('input.compute-number');
    var key = select ? select.value : '';
    var qty = parseFloat(input ? input.value : 0) || 0;
    if (counts.middleware.hasOwnProperty(key)) counts.middleware[key] += qty;
  });

  return counts;
}

function getDbMwMiddlewareEntries() {
  var entries = [];

  document.querySelectorAll('#mw-os-tbody tr.compute-row').forEach(function(row) {
    var select = row.querySelector('select.compute-select');
    var input = row.querySelector('input.compute-number');
    var key = select ? select.value : '';
    var qty = parseFloat(input ? input.value : 0) || 0;
    if (key && qty > 0) entries.push({ key: key, volume: qty });
  });

  return entries;
}

function getDbMwDatabaseEntries() {
  var entries = [];

  document.querySelectorAll('#db-os-tbody tr.compute-row').forEach(function(row) {
    var select = row.querySelector('select.compute-select');
    var input = row.querySelector('input.compute-number');
    var key = select ? select.value : '';
    var qty = parseFloat(input ? input.value : 0) || 0;
    if (key && qty > 0) entries.push({ key: key, volume: qty });
  });

  return entries;
}

function extractDbMwRates() {
  var rates = { database: {}, middleware: {} };
  var sourceRows = document.querySelectorAll('#ms-rates-tbody tr');

  function parseRate(text) {
    var raw = parseFloat((text || '').replace(/[^0-9.]/g, ''));
    return isNaN(raw) ? null : raw;
  }

  function assignFallbacks(configList, bucket) {
    configList.forEach(function(item) {
      rates[bucket][item.key] = {
        us: { exact: item.fallbackRates.us, display: Math.round(item.fallbackRates.us) },
        india: { exact: item.fallbackRates.india, display: Math.round(item.fallbackRates.india) }
      };
    });
  }

  assignFallbacks(DBMW_DATABASE_CONFIG, 'database');
  assignFallbacks(DBMW_MIDDLEWARE_CONFIG, 'middleware');

  sourceRows.forEach(function(row) {
    var cells = row.querySelectorAll('td');
    if (cells.length < 5) return;

    var tower = (cells[0].textContent || '').trim().toLowerCase();
    var deliveredFrom = (cells[3].textContent || '').trim().toLowerCase();
    var monthlyTypical = parseRate(cells[4].textContent || '');
    var discountedDisplay = parseRate(cells[6] ? cells[6].textContent : '');
    if (!monthlyTypical && !discountedDisplay) return;

    var discountedExact = monthlyTypical ? (monthlyTypical * DBMW_RATE_DISCOUNT) : discountedDisplay;
    var discountedRate = discountedDisplay || Math.round(discountedExact || 0);
    var locationKey = deliveredFrom.indexOf('india') !== -1 ? 'india'
      : (deliveredFrom.indexOf('united states') !== -1 ? 'us' : '');
    if (!locationKey) return;

    DBMW_DATABASE_CONFIG.forEach(function(item) {
      if (tower === item.rateLabel) {
        rates.database[item.key][locationKey] = {
          exact: discountedExact,
          display: discountedRate
        };
      }
    });

    DBMW_MIDDLEWARE_CONFIG.forEach(function(item) {
      if (tower === item.rateLabel) {
        rates.middleware[item.key][locationKey] = {
          exact: discountedExact,
          display: discountedRate
        };
      }
    });
  });

  return rates;
}

function wireDbMwManagedServicesListeners() {
  if (_dbmwMSListenersAttached) return;
  _dbmwMSListenersAttached = true;

  ['maturityLevel', 'usDelivery', 'indiaDelivery'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateAllManagedServicesSizing);
      el.addEventListener('change', updateAllManagedServicesSizing);
    }
  });

  ['panel-fte-kpis', 'panel-managed-services'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', calcDbMwManagedServicesSizing);
      el.addEventListener('change', calcDbMwManagedServicesSizing);
    }
  });
}

function toggleDbMwMSSizing() {
  var body = document.getElementById('dbmw-ms-sizing-body');
  var arrow = document.getElementById('dbmw-ms-sizing-arrow');
  var label = document.getElementById('dbmw-ms-sizing-label');
  var collapsedTot = document.getElementById('dbmw-ms-collapsed-total');
  if (!body) return;

  var isCollapsed = (body.style.display === 'none');
  if (isCollapsed) {
    body.style.display = 'block';
    if (arrow) arrow.style.transform = 'rotate(0deg)';
    if (label) label.textContent = 'Collapse';
    if (collapsedTot) collapsedTot.style.display = 'none';
  } else {
    body.style.display = 'none';
    if (arrow) arrow.style.transform = 'rotate(-90deg)';
    if (label) label.textContent = 'Expand';
    if (collapsedTot) {
      var bannerVal = document.getElementById('dbmw-ms-total-value');
      var collapsedVal = document.getElementById('dbmw-ms-collapsed-total-value');
      if (bannerVal && collapsedVal) collapsedVal.textContent = bannerVal.textContent;
      collapsedTot.style.display = 'inline-flex';
    }
  }
}

function initDbMwMSSizing() {
  var body = document.getElementById('dbmw-ms-sizing-body');
  var arrow = document.getElementById('dbmw-ms-sizing-arrow');
  var label = document.getElementById('dbmw-ms-sizing-label');
  var collapsedTot = document.getElementById('dbmw-ms-collapsed-total');
  if (!body) return;
  body.style.display = 'block';
  if (arrow) arrow.style.transform = 'rotate(0deg)';
  if (label) label.textContent = 'Collapse';
  if (collapsedTot) collapsedTot.style.display = 'none';
}

function calcDbMwManagedServicesSizing() {
  var delivery = getDeliveryMix();
  var usPct = delivery.usPct;
  var indiaPct = delivery.indiaPct;

  ['dbmw-db-us-delivery', 'dbmw-mw-us-delivery'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = '(' + Math.round(usPct * 100) + '% DELIVERY)';
  });
  ['dbmw-db-india-delivery', 'dbmw-mw-india-delivery'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = '(' + Math.round(indiaPct * 100) + '% DELIVERY)';
  });

  var counts = getDbMwCounts();
  var databaseEntries = getDbMwDatabaseEntries();
  var middlewareEntries = getDbMwMiddlewareEntries();
  var kpis = extractDbMwKPIs();
  var rates = extractDbMwRates();

  function fmtInt(value) {
    return (value || 0).toLocaleString('en-US');
  }

  function fmtFixed(value) {
    return (value || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function fmtCurrency(value) {
    return '$' + Math.round(value || 0).toLocaleString('en-US');
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function renderRegionalPanel(panelId, componentLabel, fteLabel, rateLabel, configList, volumeMap, rateMap, location, emptyMessage) {
    var panel = document.getElementById(panelId);
    if (!panel) return { monthly: 0, annual: 0, volume: 0, ftes: 0, locationFte: 0 };

    var activeItems = configList.filter(function(item) {
      return (volumeMap[item.key] || 0) > 0;
    });

    var totalVolume = 0;
    activeItems.forEach(function(item) {
      totalVolume += volumeMap[item.key] || 0;
    });

    if (totalVolume <= 0) {
      panel.innerHTML = '<div class="ms-loading">' + emptyMessage + '</div>';
      return { monthly: 0, annual: 0, volume: 0, ftes: 0, locationFte: 0 };
    }

    var totalMonthly = 0;
    var totalAnnual = 0;
    var totalFtes = 0;
    var totalLocationFte = 0;
    var rowsHtml = '';
    var isUs = location === 'us';

    activeItems.forEach(function(item) {
      var volume = volumeMap[item.key] || 0;
      var kpi = kpis[item.key] || item.fallbackKpi || 1;
      var ftes = (volume > 0 && kpi > 0) ? Math.ceil(volume / kpi) : 0;
      var usFte = ftes * usPct;
      var indiaFte = ftes * indiaPct;
      var rate = rateMap[item.key] || item.fallbackRates;
      var displayFte = isUs ? usFte : indiaFte;
      var displayRate = isUs ? ((rate.us && rate.us.display) || 0) : ((rate.india && rate.india.display) || 0);
      var exactUsRate = (rate.us && rate.us.exact) || displayRate;
      var exactIndiaRate = (rate.india && rate.india.exact) || ((rate.india && rate.india.display) || 0);
      var preciseMonthly = (usFte * exactUsRate) + (indiaFte * exactIndiaRate);
      var rowMrc = Math.round(preciseMonthly);
      var rowAnnual = rowMrc * 12;
      totalMonthly += rowMrc;
      totalAnnual += rowAnnual;
      totalFtes += ftes;
      totalLocationFte += displayFte;

      rowsHtml +=
        '<tr>' +
          '<td>' + item.label + '</td>' +
          '<td class="dbmw-ms-number">' + fmtInt(kpi) + '</td>' +
          '<td class="dbmw-ms-number">' + fmtInt(volume) + '</td>' +
          '<td class="dbmw-ms-number">' + fmtFixed(ftes) + '</td>' +
          '<td class="dbmw-ms-number">' + fmtFixed(displayFte) + '</td>' +
          '<td class="dbmw-ms-rate">' + fmtCurrency(displayRate) + '</td>' +
          '<td class="dbmw-ms-number">' + fmtCurrency(rowMrc) + '</td>' +
          '<td class="dbmw-ms-annual">' + fmtCurrency(rowAnnual) + '</td>' +
        '</tr>';
    });

    rowsHtml +=
      '<tr class="dbmw-ms-total-row">' +
        '<td>SUBTOTAL</td>' +
        '<td></td>' +
        '<td class="dbmw-ms-number">' + fmtInt(totalVolume) + '</td>' +
        '<td class="dbmw-ms-number">' + fmtFixed(totalFtes) + '</td>' +
        '<td class="dbmw-ms-number">' + fmtFixed(totalLocationFte) + '</td>' +
        '<td></td>' +
        '<td class="dbmw-ms-number">' + fmtCurrency(totalMonthly) + '</td>' +
        '<td class="dbmw-ms-annual">' + fmtCurrency(totalAnnual) + '</td>' +
      '</tr>';

    panel.innerHTML =
      '<div class="dbmw-ms-table-caption">Calculation of Labor Costs</div>' +
      '<table class="dbmw-ms-table">' +
        '<thead>' +
          '<tr>' +
            '<th>' + componentLabel + '</th>' +
            '<th>KPI</th>' +
            '<th>Volume</th>' +
            '<th>FTEs</th>' +
            '<th>' + fteLabel + '</th>' +
            '<th>' + rateLabel + '</th>' +
            '<th>Monthly Cost</th>' +
            '<th>Annual Cost</th>' +
          '</tr>' +
        '</thead>' +
        '<tbody>' + rowsHtml + '</tbody>' +
      '</table>';

    return {
      monthly: totalMonthly,
      annual: totalAnnual,
      volume: totalVolume,
      ftes: totalFtes,
      locationFte: totalLocationFte
    };
  }

  function renderRegionalEntryPanel(panelId, componentLabel, fteLabel, rateLabel, configList, entryList, rateMap, location, emptyMessage) {
    var panel = document.getElementById(panelId);
    if (!panel) return { monthly: 0, annual: 0, volume: 0, ftes: 0, locationFte: 0 };

    var configMap = {};
    configList.forEach(function(item) {
      configMap[item.key] = item;
    });

    var activeEntries = entryList.filter(function(entry) {
      return configMap.hasOwnProperty(entry.key) && entry.volume > 0;
    });

    if (!activeEntries.length) {
      panel.innerHTML = '<div class="ms-loading">' + emptyMessage + '</div>';
      return { monthly: 0, annual: 0, volume: 0, ftes: 0, locationFte: 0 };
    }

    var totalVolume = 0;
    var totalMonthly = 0;
    var totalAnnual = 0;
    var totalFtes = 0;
    var totalLocationFte = 0;
    var rowsHtml = '';
    var isUs = location === 'us';

    activeEntries.forEach(function(entry) {
      var item = configMap[entry.key];
      var volume = entry.volume || 0;
      var kpi = kpis[item.key] || item.fallbackKpi || 1;
      var ftes = (volume > 0 && kpi > 0) ? Math.ceil(volume / kpi) : 0;
      var usFte = ftes * usPct;
      var indiaFte = ftes * indiaPct;
      var rate = rateMap[item.key] || item.fallbackRates;
      var displayFte = isUs ? usFte : indiaFte;
      var displayRate = isUs ? ((rate.us && rate.us.display) || 0) : ((rate.india && rate.india.display) || 0);
      var exactRate = isUs
        ? ((rate.us && rate.us.exact) || displayRate)
        : ((rate.india && rate.india.exact) || displayRate);
      var preciseMonthly = displayFte * exactRate;
      var rowMrc = Math.round(preciseMonthly);
      var rowAnnual = rowMrc * 12;

      totalVolume += volume;
      totalMonthly += rowMrc;
      totalAnnual += rowAnnual;
      totalFtes += ftes;
      totalLocationFte += displayFte;

      rowsHtml +=
        '<tr>' +
          '<td>' + item.label + '</td>' +
          '<td class="dbmw-ms-number">' + fmtInt(kpi) + '</td>' +
          '<td class="dbmw-ms-number">' + fmtInt(volume) + '</td>' +
          '<td class="dbmw-ms-number">' + fmtFixed(ftes) + '</td>' +
          '<td class="dbmw-ms-number">' + fmtFixed(displayFte) + '</td>' +
          '<td class="dbmw-ms-rate">' + fmtCurrency(displayRate) + '</td>' +
          '<td class="dbmw-ms-number">' + fmtCurrency(rowMrc) + '</td>' +
          '<td class="dbmw-ms-annual">' + fmtCurrency(rowAnnual) + '</td>' +
        '</tr>';
    });

    rowsHtml +=
      '<tr class="dbmw-ms-total-row">' +
        '<td>SUBTOTAL</td>' +
        '<td></td>' +
        '<td class="dbmw-ms-number">' + fmtInt(totalVolume) + '</td>' +
        '<td class="dbmw-ms-number">' + fmtFixed(totalFtes) + '</td>' +
        '<td class="dbmw-ms-number">' + fmtFixed(totalLocationFte) + '</td>' +
        '<td></td>' +
        '<td class="dbmw-ms-number">' + fmtCurrency(totalMonthly) + '</td>' +
        '<td class="dbmw-ms-annual">' + fmtCurrency(totalAnnual) + '</td>' +
      '</tr>';

    panel.innerHTML =
      '<div class="dbmw-ms-table-caption">Calculation of Labor Costs</div>' +
      '<table class="dbmw-ms-table">' +
        '<thead>' +
          '<tr>' +
            '<th>' + componentLabel + '</th>' +
            '<th>KPI</th>' +
            '<th>Volume</th>' +
            '<th>FTEs</th>' +
            '<th>' + fteLabel + '</th>' +
            '<th>' + rateLabel + '</th>' +
            '<th>Monthly Cost</th>' +
            '<th>Annual Cost</th>' +
          '</tr>' +
        '</thead>' +
        '<tbody>' + rowsHtml + '</tbody>' +
      '</table>';

    return {
      monthly: totalMonthly,
      annual: totalAnnual,
      volume: totalVolume,
      ftes: totalFtes,
      locationFte: totalLocationFte
    };
  }

  var dbUs = renderRegionalEntryPanel(
    'dbmw-database-us-panel-body',
    'Component',
    'US FTE',
    'US Rate',
    DBMW_DATABASE_CONFIG,
    databaseEntries,
    rates.database,
    'us',
    'Add database instances above to see managed services calculations'
  );

  var dbIndia = renderRegionalEntryPanel(
    'dbmw-database-india-panel-body',
    'Component',
    'India FTE',
    'India Rate',
    DBMW_DATABASE_CONFIG,
    databaseEntries,
    rates.database,
    'india',
    'Add database instances above to see managed services calculations'
  );

  var mwUs = renderRegionalEntryPanel(
    'dbmw-middleware-us-panel-body',
    'Component',
    'US FTE',
    'US Rate',
    DBMW_MIDDLEWARE_CONFIG,
    middlewareEntries,
    rates.middleware,
    'us',
    'Add middleware instances above to see managed services calculations'
  );

  var mwIndia = renderRegionalEntryPanel(
    'dbmw-middleware-india-panel-body',
    'Component',
    'India FTE',
    'India Rate',
    DBMW_MIDDLEWARE_CONFIG,
    middlewareEntries,
    rates.middleware,
    'india',
    'Add middleware instances above to see managed services calculations'
  );

  // Keep summary numbers aligned with visible panel row totals (US + India).
  var databaseMonthly = dbUs.monthly + dbIndia.monthly;
  var databaseAnnual = dbUs.annual + dbIndia.annual;
  var databaseInstances = dbUs.volume;
  var middlewareMonthly = mwUs.monthly + mwIndia.monthly;
  var middlewareAnnual = mwUs.annual + mwIndia.annual;
  var middlewareInstances = mwUs.volume;
  var grandAnnual = databaseAnnual + middlewareAnnual;

  function parseMoneyText(id) {
    var el = document.getElementById(id);
    if (!el) return 0;
    var raw = (el.textContent || '').replace(/[^0-9.-]/g, '');
    var num = parseFloat(raw);
    return isNaN(num) ? 0 : num;
  }

  setText('dbmw-database-total-mrc', fmtCurrency(databaseMonthly));
  setText('dbmw-database-total-annual', fmtCurrency(databaseAnnual));
  setText('dbmw-database-total-instances', fmtInt(databaseInstances));
  setText('dbmw-database-monthly-per-instance', fmtCurrency(databaseInstances > 0 ? databaseMonthly / databaseInstances : 0));
  setText('dbmw-database-annual-per-instance', fmtCurrency(databaseInstances > 0 ? databaseAnnual / databaseInstances : 0));
  setText('dbmw-middleware-total-mrc', fmtCurrency(middlewareMonthly));
  setText('dbmw-middleware-total-annual', fmtCurrency(middlewareAnnual));
  setText('dbmw-middleware-total-instances', fmtInt(middlewareInstances));
  setText('dbmw-middleware-monthly-per-instance', fmtCurrency(middlewareInstances > 0 ? middlewareMonthly / middlewareInstances : 0));
  setText('dbmw-middleware-annual-per-instance', fmtCurrency(middlewareInstances > 0 ? middlewareAnnual / middlewareInstances : 0));

  // Keep banner in lockstep with the displayed tower annual totals.
  grandAnnual = parseMoneyText('dbmw-database-total-annual') + parseMoneyText('dbmw-middleware-total-annual');
  var grandMonthly = databaseMonthly + middlewareMonthly;
  var totalInstances = databaseInstances + middlewareInstances;
  setText('dbmw-ms-total-instances', fmtInt(totalInstances));
  setText('dbmw-ms-monthly-per-instance', fmtCurrency(totalInstances > 0 ? grandMonthly / totalInstances : 0));
  setText('dbmw-ms-annual-per-instance', fmtCurrency(totalInstances > 0 ? grandAnnual / totalInstances : 0));
  setText('dbmw-ms-total-value', fmtCurrency(grandAnnual));
  setText('dbmw-ms-total-monthly-value', fmtCurrency(grandMonthly));
  setText('dbmw-ms-collapsed-total-value', fmtCurrency(grandAnnual));
  updateOverlaysCFSSizing();
}

function extractStorageRates() {
  function rv(id, def) {
    var el = document.getElementById(id);
    var v  = el ? parseFloat(el.value) : NaN;
    return (isNaN(v) || v < 0) ? def : v;
  }
  return {
    sanHigh:      rv('rate-storage-san-high-final',  100.00),
    sanStd:       rv('rate-storage-san-std-final',    64.00),
    nasHigh:      rv('rate-storage-nas-high-final',  104.00),
    nasStd:       rv('rate-storage-nas-std-final',    12.80),
    objectHot:    rv('rate-storage-object-hot-final', 18.40),
    backupFep:    rv('rate-backup-fep-final',         40.00),
    backupStorage:rv('rate-backup-storage-final',     37.50),
    backupRatio:  rv('rate-backup-ratio',              3)
  };
}

// Keeps the ratio display spans in the Calculation Logic box in sync
function updateStorageCalc() {
  updateDasdMidrangeRate();
  var ratio = (function() {
    var el = document.getElementById('rate-backup-ratio');
    var v  = el ? parseFloat(el.value) : NaN;
    return isNaN(v) ? 3 : v;
  })();
  var d1 = document.getElementById('backup-ratio-display');
  var d2 = document.getElementById('backup-ratio-display-2');
  if (d1) d1.textContent = ratio;
  if (d2) d2.textContent = ratio;
  // Trigger downstream storage/backup cost recalculation if it exists
  if (typeof calcStorageAndBackupCost === 'function') calcStorageAndBackupCost();
}

function attachRateCardListeners() {
  if (_rateCardListenersAttached) return;
  document.querySelectorAll(
    '#panel-vmware-rate input[type="number"], #panel-vmware-rate select'
  ).forEach(function(el) {
    el.addEventListener('input',  updateVmwareSizing);
    el.addEventListener('change', updateVmwareSizing);
  });
  // Storage & Backup rate card listeners
  var storageIds = [
    'rate-storage-san-high-final', 'rate-storage-san-std-final',
    'rate-storage-nas-high-final', 'rate-storage-nas-std-final',
    'rate-storage-object-hot-final', 'rate-backup-fep-final',
    'rate-backup-storage-final', 'rate-backup-ratio'
  ];
  storageIds.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('input',  updateStorageCalc);
      el.addEventListener('change', updateStorageCalc);
    }
  });
  _rateCardListenersAttached = true;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MANAGED SERVICES LIVE SIZING
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function extractFTEKPIs() {
  var maturityEl = document.getElementById('maturityLevel');
  var maturity   = maturityEl ? maturityEl.value : 'median';

  /* FIX â€” correct column indices matching HTML table structure:
     col[0]=Tower, col[1]=UOM, col[2]=LQ, col[3]=UQ, col[4]=Median */
  var colMap = { lower: 2, median: 4, upper: 3 };
  var colIdx = (colMap[maturity] !== undefined) ? colMap[maturity] : 4;

  /* FIX â€” hardcoded defaults matching HTML table values */
  var kpis = { windows: 182, linux: 496, unix: 76, aix_lpar: 76, ibmi_lpar: 76 };

  /* FIX â€” target the actual panel tables directly */
  document.querySelectorAll('#panel-fte-kpis table tbody tr').forEach(function(row) {
    var cells = row.querySelectorAll('td');
    if (cells.length < 5) return;
    var desc   = cells[0].textContent.toLowerCase().trim();
    var cellEl = cells[colIdx];
    if (!cellEl) return;
    var raw = parseFloat(cellEl.textContent.replace(/,/g, ''));
    if (isNaN(raw)) return;
    if (desc.indexOf('window') !== -1)                                  kpis.windows = raw;
    else if (desc.indexOf('linux') !== -1)                              kpis.linux   = raw;
    else if (desc.indexOf('unix') !== -1 || desc.indexOf('aix') !== -1) { kpis.unix = raw; kpis.aix_lpar = raw; kpis.ibmi_lpar = raw; }
  });

  return kpis;
}

function getOSServerCounts() {
  var counts = { windows: 0, linux: 0, unix: 0, aix_lpar: 0, ibmi_lpar: 0 };
  var tbody  = document.getElementById('compute-os-tbody');
  if (!tbody) return counts;

  tbody.querySelectorAll('tr.compute-row').forEach(function(row) {
    var selects = row.querySelectorAll('select.compute-select');
    var input   = row.querySelector('input.compute-number');
    if (!selects.length || !input) return;
    var os  = selects[0].value.toLowerCase();
    var qty = parseFloat(input.value) || 0;
    
    if (os.indexOf('windows') !== -1)    counts.windows += qty;
    else if (os.indexOf('linux') !== -1) counts.linux   += qty;
    else if (os.indexOf('unix') !== -1)  counts.unix    += qty;
    else if (os.indexOf('aix_lpar') !== -1) counts.aix_lpar += qty;
    else if (os.indexOf('ibmi_lpar') !== -1) counts.ibmi_lpar += qty;
  });
  return counts;
}

function extractMSRates() {
  var rates = {
    us:    { windows: 10405, linux: 10868, unix: 11957, aix_lpar: 11957, ibmi_lpar: 11957 },
    india: { windows:  3249, linux:  3461, unix:  3734, aix_lpar:  3734, ibmi_lpar:  3734 }
  };

  var rows = document.querySelectorAll('#ms-rates-tbody tr');
  if (rows.length === 0) return rates;

  rows.forEach(function(row) {
    var cells = row.querySelectorAll('td');
    if (cells.length < 7) return;

    var tower    = cells[0].textContent.trim().toLowerCase();
    var desc     = cells[1].textContent.trim().toLowerCase();
    var location = cells[3].textContent.trim().toLowerCase();

    var isWindows = tower.indexOf('window') !== -1 || desc.indexOf('windows') !== -1;
    var isLinux   = tower.indexOf('linux')  !== -1 || desc.indexOf('linux')   !== -1;
    var isUnix    = tower.indexOf('unix')   !== -1 || desc.indexOf('unix')    !== -1
                    || desc.indexOf('aix')  !== -1;

    /* FIX â€” was corrupted "!isWindows && !isif (!isWindows..." */
    if (!isWindows && !isLinux && !isUnix) return;

    var isUS    = location.indexOf('united states') !== -1
                  || location.indexOf('onshore') !== -1;
    var isIndia = location.indexOf('india') !== -1
                  || location.indexOf('offshore') !== -1;
    if (!isUS && !isIndia) return;

    var rateCell  = cells[cells.length - 1];
    var rateInput = rateCell ? rateCell.querySelector('input') : null;
    var rawStr    = rateInput
                    ? rateInput.value
                    : (rateCell ? rateCell.textContent : '0');
    rawStr = rawStr.replace(/\$/g, '').replace(/,/g, '')
                   .replace(/K/gi, '000').trim();
    var raw = parseFloat(rawStr);
    if (isNaN(raw) || raw <= 0) return;

    var osKey = isWindows ? 'windows' : isLinux ? 'linux' : 'unix';
    if (isUnix) {
      if (isUS)    { rates.us['unix'] = raw; rates.us['aix_lpar'] = raw; rates.us['ibmi_lpar'] = raw; }
      if (isIndia) { rates.india['unix'] = raw; rates.india['aix_lpar'] = raw; rates.india['ibmi_lpar'] = raw; }
    } else {
      if (isUS)    rates.us[osKey]    = raw;
      if (isIndia) rates.india[osKey] = raw;
    }
  });

  return rates;
}

function updateManagedServicesSizing() {
  var usEl    = document.getElementById('usDelivery');
  var indiaEl = document.getElementById('indiaDelivery');

  var usDeliveryPct    = (parseFloat(usEl    ? usEl.value    : 70) || 70)  / 100;
  var indiaDeliveryPct = (parseFloat(indiaEl ? indiaEl.value : 30) || 30)  / 100;

  /* Display delivery percentages in table headers */
  var usDeliverySpan = document.getElementById('ms-us-delivery');
  if (usDeliverySpan) {
    usDeliverySpan.textContent = '(' + Math.round(usDeliveryPct * 100) + '% Delivery)';
  }
  var indiaDeliverySpan = document.getElementById('ms-india-delivery');
  if (indiaDeliverySpan) {
    indiaDeliverySpan.textContent = '(' + Math.round(indiaDeliveryPct * 100) + '% Delivery)';
  }

  var kpis   = extractFTEKPIs();
  var counts = getOSServerCounts();
  var rates  = extractMSRates();

  var allOS = [
    { key: 'windows', label: 'Windows'  },
    { key: 'linux',   label: 'Linux'    },
    { key: 'unix',    label: 'Unix/AIX' },
    { key: 'aix_lpar', label: 'AIX LPAR' },
    { key: 'ibmi_lpar', label: 'IBMi LPAR' }
  ];

  var activeOS = allOS.filter(function(os) {
    return (counts[os.key] || 0) > 0;
  });

  function buildRows(tbodyId) {
    var el = document.getElementById(tbodyId);
    if (!el) return;
    el.innerHTML = '';

    if (activeOS.length === 0) {
      var ph = document.createElement('tr');
      ph.innerHTML =
        '<td colspan="7" class="ms-loading">' +
        'Enter server counts above to calculate\u2026</td>';
      el.appendChild(ph);
      return;
    }

    var locationAnnual = 0;
    var totalServers = 0;
    var totalFTEs = 0;
    var totalMonthly = 0;
    var isUsTable = (tbodyId === 'ms-us-tbody');

    activeOS.forEach(function(os) {
      var servers     = counts[os.key] || 0;
      var kpi         = kpis[os.key]   || 1;
      var usRate      = (rates.us && rates.us[os.key]) ? rates.us[os.key] : 0;
      var indiaRate   = (rates.india && rates.india[os.key]) ? rates.india[os.key] : 0;
      
      /* Step 1-2: Calculate total FTE and round UP */
      var totalFTE = Math.ceil(servers / kpi);
      /* Step 3: Split by delivery % */
      var usFTE = totalFTE * usDeliveryPct;
      var indiaFTE = totalFTE * indiaDeliveryPct;
      
      /* Select appropriate split FTE and rate based on table */
      var displayFTE = isUsTable ? usFTE : indiaFTE;
      var rate = isUsTable ? usRate : indiaRate;
      /* Step 4-5: Monthly = FTE Ã— rate, Annual = Monthly Ã— 12 */
      var monthly = displayFTE * rate;
      var annual = monthly * 12;
      
      /* Track totals for subtotal row */
      totalServers += servers;
      totalFTEs += displayFTE;
      totalMonthly += monthly;
      locationAnnual += annual;

      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td class="compute-td">'            + os.label                            + '</td>' +
        '<td class="compute-td ms-number">'  + servers.toLocaleString()             + '</td>' +
        '<td class="compute-td ms-number">'  + kpi.toLocaleString()                 + '</td>' +
        '<td class="compute-td ms-number">'  + displayFTE.toFixed(1)                + '</td>' +
        '<td class="compute-td ms-number">$' + rate.toLocaleString()                + '</td>' +
        '<td class="compute-td ms-number">$' + Math.round(monthly).toLocaleString('en-US') + '</td>' +
        '<td class="compute-td ms-cost">$'   + Math.round(annual).toLocaleString('en-US')  + '</td>';
      el.appendChild(tr);
    });

    /* Subtotal row - show sums for Servers, FTEs, Monthly Cost, and Annual */
    var subTr = document.createElement('tr');
    subTr.className = 'ms-subtotal-row';
    subTr.innerHTML =
      '<td class="compute-td"><strong>Subtotal</strong></td>' +
      '<td class="compute-td ms-number"><strong>' + totalServers.toLocaleString() + '</strong></td>' +
      '<td class="compute-td ms-number"></td>' +
      '<td class="compute-td ms-number"><strong>' + totalFTEs.toFixed(1) + '</strong></td>' +
      '<td class="compute-td ms-number"></td>' +
      '<td class="compute-td ms-number"><strong>$' + Math.round(totalMonthly).toLocaleString('en-US') + '</strong></td>' +
      '<td class="compute-td ms-cost"><strong>$' + Math.round(locationAnnual).toLocaleString('en-US') + '</strong></td>';
    el.appendChild(subTr);
  }

  buildRows('ms-us-tbody');
  buildRows('ms-india-tbody');

  /* Calculate blended total - round each row's monthly cost before summing */
  var totalMonthly = 0;
  activeOS.forEach(function(os) {
    var servers     = counts[os.key] || 0;
    var kpi         = kpis[os.key]   || 1;
    var usRate      = (rates.us && rates.us[os.key]) ? rates.us[os.key] : 0;
    var indiaRate   = (rates.india && rates.india[os.key]) ? rates.india[os.key] : 0;
    /* Step 1-2: Total FTE = servers / kpi, rounded UP */
    var totalFTE = Math.ceil(servers / kpi);
    /* Step 3: Split by delivery % */
    var usFTE = totalFTE * usDeliveryPct;
    var indiaFTE = totalFTE * indiaDeliveryPct;
    /* Step 4: Calculate monthly costs per region */
    var usMonthly = usFTE * usRate;
    var indiaMonthly = indiaFTE * indiaRate;
    /* Step 5: Round each row's monthly total to nearest dollar BEFORE summing */
    var rowMonthly = Math.round(usMonthly + indiaMonthly);
    totalMonthly += rowMonthly;
  });

  /* Step 6: Annual = Rounded Total Monthly * 12 */
  var blendedAnnual = totalMonthly * 12;

  var totalEl = document.getElementById('ms-total-value');
  if (totalEl) totalEl.textContent = '$' + blendedAnnual.toLocaleString('en-US');

  var totalMonthlyEl = document.getElementById('ms-total-monthly-value');
  if (totalMonthlyEl) totalMonthlyEl.textContent = '$' + Math.round(totalMonthly).toLocaleString('en-US');

  var totalServers = 0;
  activeOS.forEach(function(os) {
    totalServers += counts[os.key] || 0;
  });

  var monthlyPerServer = totalServers > 0 ? totalMonthly / totalServers : 0;
  var annualPerServer  = totalServers > 0 ? blendedAnnual / totalServers : 0;

  var totalServersEl     = document.getElementById('ms-total-servers-meta');
  var monthlyPerServerEl = document.getElementById('ms-monthly-per-server');
  var annualPerServerEl  = document.getElementById('ms-annual-per-server');
  if (totalServersEl)     totalServersEl.textContent     = Math.round(totalServers).toLocaleString('en-US');
  if (monthlyPerServerEl) monthlyPerServerEl.textContent = '$' + Math.round(monthlyPerServer).toLocaleString('en-US');
  if (annualPerServerEl)  annualPerServerEl.textContent  = '$' + Math.round(annualPerServer).toLocaleString('en-US');

  updateNetworkMSSizing();
}

/* FIX â€” guard flag prevents duplicate listeners */
var _msSizingListenersAttached = false;

function wireMSSizingListeners() {
  if (_msSizingListenersAttached) return;
  _msSizingListenersAttached = true;

  ['maturityLevel', 'usDelivery', 'indiaDelivery'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input',  updateAllManagedServicesSizing);
    if (el) el.addEventListener('change', updateAllManagedServicesSizing);
  });

  var osTbody = document.getElementById('compute-os-tbody');
  if (osTbody) {
    osTbody.addEventListener('input',  updateManagedServicesSizing);
    osTbody.addEventListener('change', updateManagedServicesSizing);
  }

  var panel = document.getElementById('panel-fte-kpis');
  if (panel) panel.addEventListener('input', updateManagedServicesSizing);
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MS SIZING COLLAPSE / EXPAND
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function toggleMSSizing() {
  var body         = document.getElementById('ms-sizing-body');
  var arrow        = document.getElementById('ms-sizing-arrow');
  var label        = document.getElementById('ms-sizing-label');
  var collapsedTot = document.getElementById('ms-collapsed-total');
  if (!body) return;

  var isCollapsed = body.style.display === 'none';
  if (isCollapsed) {
    body.style.display    = 'block';
    if (arrow) arrow.style.transform = 'rotate(0deg)';
    if (label) label.textContent     = 'Collapse';
    if (collapsedTot) collapsedTot.style.display = 'none';
  } else {
    body.style.display    = 'none';
    if (arrow) arrow.style.transform = 'rotate(-90deg)';
    if (label) label.textContent     = 'Expand';
    if (collapsedTot) {
      var bannerVal    = document.getElementById('ms-total-value');
      var collapsedVal = document.getElementById('ms-collapsed-total-value');
      if (bannerVal && collapsedVal) collapsedVal.textContent = bannerVal.textContent;
      collapsedTot.style.display = 'inline';
    }
  }
}

function initMSSizing() {
  var body         = document.getElementById('ms-sizing-body');
  var arrow        = document.getElementById('ms-sizing-arrow');
  var label        = document.getElementById('ms-sizing-label');
  var collapsedTot = document.getElementById('ms-collapsed-total');
  if (!body) return;
  body.style.display    = 'block';
  if (arrow) arrow.style.transform = 'rotate(0deg)';
  if (label) label.textContent     = 'Collapse';
  if (collapsedTot) collapsedTot.style.display = 'none';
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   INFRASTRUCTURE COST LIVE SIZING
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function toggleInfraSizing() {
  var body         = document.getElementById('infra-sizing-body');
  var arrow        = document.getElementById('infra-sizing-arrow');
  var label        = document.getElementById('infra-sizing-label');
  var collapsedTot = document.getElementById('infra-collapsed-total');
  if (!body) return;
  var isCollapsed = body.style.display === 'none';
  if (isCollapsed) {
    body.style.display    = 'block';
    if (arrow) arrow.style.transform = 'rotate(0deg)';
    if (label) label.textContent     = 'Collapse';
    if (collapsedTot) collapsedTot.style.display = 'none';
  } else {
    body.style.display    = 'none';
    if (arrow) arrow.style.transform = 'rotate(180deg)';
    if (label) label.textContent     = 'Expand';
    if (collapsedTot) collapsedTot.style.display = 'inline-flex';
  }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   CASE SAVE / LOAD FUNCTIONALITY
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

var CASE_STORAGE_KEY = 'assumptiveBaseCase.savedCases.v1';
var currentLoadedCaseName = null;

// Collect all input values from the page
function collectCaseData() {
  var data = {
    timestamp: new Date().toISOString(),
    inputs: {},
    serverData: {}
  };
  
  // Collect all input, select, and textarea elements with IDs
  document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el) {
    if (el.type === 'checkbox') {
      data.inputs[el.id] = el.checked;
    } else if (el.type === 'radio') {
      if (el.checked) data.inputs[el.id] = el.value;
    } else {
      data.inputs[el.id] = el.value;
    }
  });
  
  // Also collect server data from dynamic rows for reconstruction
  var tableIds = ['compute-os-tbody', 'compute-vcpu-tbody', 'midrange-os-tbody', 'midrange-vcpu-tbody', 'storage-tbody', 'db-os-tbody', 'mw-os-tbody'];
  tableIds.forEach(function(tbodyId) {
    var tbody = document.getElementById(tbodyId);
    if (tbody) {
      var rows = [];
      tbody.querySelectorAll('tr').forEach(function(row) {
        var rowData = {};
        var inputs = row.querySelectorAll('input, select');
        inputs.forEach(function(inp) {
          if (inp.type === 'checkbox') {
            rowData[inp.id || inp.name] = inp.checked;
          } else {
            rowData[inp.id || inp.name] = inp.value;
          }
        });
        if (Object.keys(rowData).length > 0) {
          rows.push(rowData);
        }
      });
      if (rows.length > 0) {
        data.serverData[tbodyId] = rows;
      }
    }
  });
  
  return data;
}

// Restore all input values to the page
function restoreCaseData(data) {
  if (!data || !data.inputs) return;

  // Reset row counters before restoring so new rows get correct IDs
  _dbRowCount = 1;
  _mwRowCount = 1;
  
  // First restore all global inputs
  // Skip elements that must not be auto-restored to avoid side-effects
  var skipIds = { 'loadCaseSelect': true, 'saveCaseNameInput': true, 'importFileInput': true };
  Object.keys(data.inputs).forEach(function(id) {
    if (skipIds[id]) return;
    var el = document.getElementById(id);
    if (!el) return;
    
    if (el.type === 'checkbox') {
      el.checked = data.inputs[id];
      // Dispatch change event to trigger handlers like toggleTowerCard
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (el.type === 'radio') {
      if (el.value === data.inputs[id]) {
        el.checked = true;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } else {
      el.value = normalizeComputeServerType(id, data.inputs[id]);
      // Dispatch change event to trigger calculation handlers
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  
  // Wait for tower sections to render, then restore table data
  setTimeout(function() {
    if (data.serverData) {
      Object.keys(data.serverData).forEach(function(tbodyId) {
        var tbody = document.getElementById(tbodyId);
        if (tbody && data.serverData[tbodyId].length > 0) {
          var savedRows = data.serverData[tbodyId];
          
          // Find the Add Row button - it should be after the table
          var table = tbody.closest('table');
          var addBtn = null;
          if (table && table.parentElement) {
            // Look for button with "Add Row" text in the parent container
            var buttons = table.parentElement.querySelectorAll('button');
            for (var i = 0; i < buttons.length; i++) {
              if (buttons[i].textContent.includes('Add Row') || buttons[i].textContent.includes('Add')) {
                addBtn = buttons[i];
                break;
              }
            }
          }
          
          // Add rows until we have enough (or trim back to saved count)
          var currentRows = tbody.querySelectorAll('tr');
          var targetRowCount = savedRows.length;
          var fixedMidrangeRows = tbodyId === 'midrange-vcpu-tbody';

          if (fixedMidrangeRows) {
            updateMidrangeServerSummary();
            currentRows = tbody.querySelectorAll('tr');
          }

          // If we have MORE rows than saved (e.g. default HTML row + stale rows), trim first
          if (!fixedMidrangeRows) {
            while (tbody.rows.length > 1) {
              tbody.deleteRow(tbody.rows.length - 1);
            }
          }
          
          while (!fixedMidrangeRows && currentRows.length < targetRowCount && addBtn) {
            addBtn.click();
            // Small delay to allow row to be added
            currentRows = tbody.querySelectorAll('tr');
            if (currentRows.length >= targetRowCount) break;
          }
          
          // Restore values for each row
          currentRows = tbody.querySelectorAll('tr');
          currentRows.forEach(function(row, rowIdx) {
            if (rowIdx < savedRows.length) {
              var inputs = row.querySelectorAll('input, select');
              var savedData = savedRows[rowIdx];
              
              inputs.forEach(function(inp) {
                var key = inp.id || inp.name;
                if (key && savedData[key] !== undefined) {
                  if (inp.type === 'checkbox') {
                    inp.checked = savedData[key];
                  } else {
                    inp.value = normalizeComputeServerType(key, savedData[key]);
                  }
                  inp.dispatchEvent(new Event('input', { bubbles: true }));
                  inp.dispatchEvent(new Event('change', { bubbles: true }));
                }
              });
            }
          });
        }
      });
    }
    
    // Wait a bit more for all rows to settle, then trigger calculations
    setTimeout(function() {
      updateManagedServicesSizing();
      updateMidrangeMSSizing();
      calcMidrangeInfraCost();
      calcInfraCost();
      calcSwmaSizing();
      calcStorageMSSizing();
      calcStorageInfraCost();
      updateVmwareSizing();
      // Restore right-panel vCPU/vRAM for DB/MW (added rows)
      if (data && data.inputs) {
        document.querySelectorAll('#db-vcpu-tbody input[id], #db-vcpu-tbody select[id], #mw-vcpu-tbody input[id], #mw-vcpu-tbody select[id]').forEach(function(el) {
          if (data.inputs[el.id] !== undefined) el.value = data.inputs[el.id];
        });
      }
      updateDbSummary();
      updateMwSummary();
      if (typeof applyManagedServicesDiscounts === 'function') applyManagedServicesDiscounts();
      // Sync tower card visibility with checkbox states after restore
      toggleTowerCard('tower-database');
      toggleTowerCard('tower-datacenter');
      toggleNetworkSecurityCard();
      // Sync mainframe job translation after all input values have settled
      updateMFJobTranslation();
      calcMainframeMSSizing();
      calcMainframeInfraCost();
      if (typeof updateDatacenterSizing === 'function') updateDatacenterSizing();
    }, 300);
  }, 500);
}

// Save the current case with a name
function saveCase() {
  // If a case is already loaded, save directly with the same name
  if (currentLoadedCaseName) {
    confirmSaveCase(currentLoadedCaseName);
    return;
  }
  
  // Otherwise, show the modal to ask for a new name
  var modal = document.getElementById('saveCaseModal');
  var input = document.getElementById('saveCaseNameInput');
  if (modal && input) {
    modal.style.display = 'flex';
    input.value = '';
    input.focus();
  }
}

// Confirm and save the case
function confirmSaveCase(providedCaseName) {
  var caseName;
  
  // If a case name is provided (from saveCase for loaded cases), use it directly
  if (providedCaseName) {
    caseName = providedCaseName;
  } else {
    // Otherwise, get it from the input field (for new cases)
    var input = document.getElementById('saveCaseNameInput');
    caseName = input.value.trim();
    
    if (!caseName) {
      alert('Please enter a case name before saving.');
      return;
    }
    
    closeSaveDialog();
  }
  
  var cases = JSON.parse(localStorage.getItem(CASE_STORAGE_KEY) || '{}');
  var caseData = collectCaseData();
  cases[caseName] = caseData;
  
  localStorage.setItem(CASE_STORAGE_KEY, JSON.stringify(cases));
  alert('Case "' + caseName + '" saved successfully!');
  
  populateSavedCasesList();
  showLoadedCaseDisplay(caseName);
}

// Close the save dialog
function closeSaveDialog() {
  var modal = document.getElementById('saveCaseModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Show loaded case name display
function showLoadedCaseDisplay(caseName) {
  currentLoadedCaseName = caseName;
  var display = document.getElementById('loadedCaseDisplay');
  var nameSpan = document.getElementById('loadedCaseName');
  if (display && nameSpan) {
    nameSpan.textContent = caseName;
    display.style.display = 'block';
  }
}

// Hide loaded case name display
function hideLoadedCaseDisplay() {
  currentLoadedCaseName = null;
  var display = document.getElementById('loadedCaseDisplay');
  if (display) {
    display.style.display = 'none';
  }
}

// Load a saved case
function loadCase() {
  var select = document.getElementById('loadCaseSelect');
  var caseName = select.value;
  
  if (!caseName) {
    hideLoadedCaseDisplay();
    return;
  }
  
  var cases = JSON.parse(localStorage.getItem(CASE_STORAGE_KEY) || '{}');
  if (!cases[caseName]) {
    alert('Case not found.');
    select.value = '';
    hideLoadedCaseDisplay();
    return;
  }
  
  // Load case directly without confirmation dialog
  restoreCaseData(cases[caseName]);
  showLoadedCaseDisplay(caseName);
  select.value = '';
  select.value = caseName;
}

// Populate the load cases dropdown
function populateSavedCasesList() {
  var select = document.getElementById('loadCaseSelect');
  var cases = JSON.parse(localStorage.getItem(CASE_STORAGE_KEY) || '{}');
  
  // Keep the default option
  select.innerHTML = '<option value="">&#128194; Load Case...</option>';
  
  Object.keys(cases).sort().forEach(function(caseName) {
    var option = document.createElement('option');
    option.value = caseName;
    option.textContent = caseName;
    select.appendChild(option);
  });
}

// Export case as JSON file
function exportCase() {
  var caseData = collectCaseData();
  var caseName = currentLoadedCaseName ||
                 (document.getElementById('loadCaseSelect') && document.getElementById('loadCaseSelect').value) ||
                 'BaseCase_' + new Date().toISOString().slice(0, 10);
  // Sanitize filename
  caseName = caseName.replace(/[^a-z0-9_\-\. ]/gi, '_').trim() || 'BaseCase';
  var json = JSON.stringify(caseData, null, 2);

  var blob = new Blob([json], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.href = url;
  link.download = caseName + '.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Start a brand-new case (clears all inputs)
function newCase() {
  if (!confirm('Start a new case? Any unsaved changes will be lost.')) return;

  // Reset all dynamic tables to a single blank row
  var dynamicTables = [
    { id: 'compute-os-tbody',   keepFirst: true },
    { id: 'compute-vcpu-tbody', keepFirst: true },
    { id: 'midrange-os-tbody',  keepFirst: true },
    { id: 'midrange-vcpu-tbody',keepFirst: true },
    { id: 'storage-tbody',      keepFirst: true },
    { id: 'db-os-tbody',        keepFirst: true },
    { id: 'mw-os-tbody',        keepFirst: true }
  ];
  dynamicTables.forEach(function(t) {
    var tbody = document.getElementById(t.id);
    if (!tbody) return;
    // Remove all rows except the first
    while (tbody.rows.length > 1) {
      tbody.deleteRow(tbody.rows.length - 1);
    }
    // Reset inputs in the first row to blank/default
    if (tbody.rows[0]) {
      tbody.rows[0].querySelectorAll('input[type="number"]').forEach(function(inp) {
        inp.value = inp.readOnly ? '' : '';
        inp.dispatchEvent(new Event('input', { bubbles: true }));
      });
      tbody.rows[0].querySelectorAll('select').forEach(function(sel) {
        sel.selectedIndex = 0;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }
  });
  // Reset row counters
  _dbRowCount = 1;
  _mwRowCount = 1;

  // Uncheck all tower checkboxes and hide their cards
  var towerIds = [
    'tower-compute', 'tower-midrange', 'tower-storage', 'tower-network-security', 'network-security-applicable',
    'tower-database', 'tower-mainframe', 'tower-datacenter'
  ];
  towerIds.forEach(function(id) {
    var cb = document.getElementById(id);
    if (cb && cb.checked) {
      cb.checked = false;
      cb.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  // Reset all global inputs to their defaults
  var defaults = {
    'maturity': 'median',
    'usDelivery': '70',
    'indiaDelivery': '30',
    'eci': '3.8'
  };
  document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el) {
    if (towerIds.indexOf(el.id) !== -1) return; // skip tower checkboxes already handled
    if (el.type === 'checkbox') {
      el.checked = false;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (el.type === 'radio') {
      // leave radios â€” they'll be reset by defaults below
    } else {
      if (defaults[el.id] !== undefined) {
        el.value = defaults[el.id];
      } else {
        el.value = el.defaultValue !== undefined ? el.defaultValue : '';
      }
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  // Reset load dropdown
  var select = document.getElementById('loadCaseSelect');
  if (select) select.value = '';

  // Hide loaded-case label
  hideLoadedCaseDisplay();

  // Recalculate all summaries to reflect the cleared state
  updateDbSummary();
  updateMwSummary();
  updateStorageSummary();
  updateComputeServerSummary();
  updateMidrangeServerSummary();

  // Scroll to top
  window.scrollTo(0, 0);
}

// Import case from JSON file
function importCase() {
  var fileInput = document.getElementById('importFileInput');
  var file = fileInput.files[0];
  
  if (!file) return;
  
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var caseData = JSON.parse(e.target.result);
      restoreCaseData(caseData);
      alert('Case imported successfully!');
    } catch (error) {
      alert('Error importing file: ' + error.message);
    }
    fileInput.value = '';
  };
  reader.readAsText(file);
}

// Delete a saved case
function deleteCase() {
  var dropdown = document.getElementById('loadCaseSelect');
  var selectedCaseName = dropdown.value;
  
  if (!selectedCaseName) {
    alert('Please select a case to delete from the dropdown.');
    return;
  }
  
  if (!confirm('Are you sure you want to delete "' + selectedCaseName + '"? This action cannot be undone.')) {
    return;
  }
  
  var key = 'assumptiveBaseCase.savedCases.v1';
  var cases = JSON.parse(localStorage.getItem(key) || '{}');
  
  if (cases[selectedCaseName]) {
    delete cases[selectedCaseName];
    localStorage.setItem(key, JSON.stringify(cases));
    
    // Reset dropdown and refresh list
    dropdown.value = '';
    populateSavedCasesList();
    hideLoadedCaseDisplay();
    
    alert('Case "' + selectedCaseName + '" deleted successfully.');
  } else {
    alert('Case not found.');
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Initialize saved cases dropdown
  setTimeout(populateSavedCasesList, 500);
  
  // Close dialog when pressing Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeSaveDialog();
    }
  });
  
  // Close dialog when clicking outside it
  var modal = document.getElementById('saveCaseModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeSaveDialog();
      }
    });
  }
  
  // Allow Enter key to save
  var saveInput = document.getElementById('saveCaseNameInput');
  if (saveInput) {
    saveInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        confirmSaveCase();
      }
    });
  }
});

function normalizeInfraText(value) {
  return String(value || '').trim().toLowerCase();
}

function parseInfraRateValue(value) {
  var cleaned = String(value || '').replace(/[^0-9.]/g, '');
  var parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

function extractInfraSectionRates(contextTokens, defaults) {
  var resolved = {
    vcpu: defaults.vcpu,
    vram: defaults.vram
  };

  try {
    var tbody = document.getElementById('infra-rates-tbody');
    if (!tbody) return resolved;

    var currentSection = '';
    var currentTowerRow = '';

    tbody.querySelectorAll('tr').forEach(function(row) {
      var cells = row.querySelectorAll('td');
      if (!cells.length) return;

      if (cells.length === 1 && cells[0].hasAttribute('colspan')) {
        currentSection = normalizeInfraText(cells[0].textContent);
        currentTowerRow = '';
        return;
      }

      if (cells.length < 3) return;

      var towerCell = normalizeInfraText(cells[0].textContent);
      if (towerCell) currentTowerRow = towerCell;

      var context = normalizeInfraText(currentSection + ' ' + currentTowerRow);
      var matchesContext = contextTokens.some(function(token) {
        return context.indexOf(token) !== -1;
      });
      if (!matchesContext) return;

      var component = normalizeInfraText(cells[1].textContent);
      var rate = parseInfraRateValue(cells[2].textContent);
      if (rate === null) return;

      if (component.indexOf('vcpu') !== -1) resolved.vcpu = rate;
      if (component.indexOf('vram') !== -1) resolved.vram = rate;
    });

    return resolved;
  } catch (e) {
    return resolved;
  }
}

function extractInfraRates() {
  return extractInfraSectionRates(
    ['distributed services: compute', 'compute infra rates'],
    { vcpu: 8.00, vram: 1.50 }
  );
}

function extractMidrangeInfraRates() {
  return {
    aix: extractInfraSectionRates(
      ['midrange: compute - aix lpar'],
      { vcpu: 110.00, vram: 7.00 }
    ),
    ibmi: extractInfraSectionRates(
      ['midrange: compute - ibmi lpar'],
      { vcpu: 150.00, vram: 10.00 }
    )
  };
}

function calcInfraCost() {
  var totalVcpuUnits = 0;
  var totalVramUnits = 0;
  var serverCount    = 0;

  var allInputs = document.querySelectorAll('#compute-vcpu-tbody .compute-number');
  for (var i = 0; i < allInputs.length; i += 3) {
    var rowVcpu    = parseFloat(allInputs[i]     ? allInputs[i].value     : 0) || 0;
    var rowVram    = parseFloat(allInputs[i + 1] ? allInputs[i + 1].value : 0) || 0;
    var rowServers = parseFloat(allInputs[i + 2] ? allInputs[i + 2].value : 0) || 0;
    totalVcpuUnits += rowVcpu  * rowServers;
    totalVramUnits += rowVram  * rowServers;
    serverCount    += rowServers;
  }

  var rates        = extractInfraRates();
  var vcpuRate     = rates.vcpu;
  var vramRate     = rates.vram;
  var vcpuMonthly  = totalVcpuUnits * vcpuRate;
  var vramMonthly  = totalVramUnits * vramRate;
  var vcpuAnnual   = vcpuMonthly * 12;
  var vramAnnual   = vramMonthly * 12;
  var totalMonthly = vcpuMonthly + vramMonthly;
  var totalAnnual  = totalMonthly * 12;

  function fmt(n) {
    return '$' + Math.round(n || 0).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  function fmtRate(n) {
    var v = parseFloat(n) || 0;
    var hasDecimals = Math.round(v * 100) !== Math.round(v) * 100;
    return '$' + v.toLocaleString('en-US', {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: 2
    });
  }

  function fmtUnit(n) {
    var v = parseFloat(n) || 0;
    var hasDecimals = Math.round(v * 10) !== Math.round(v) * 10;
    return v.toLocaleString('en-US', {
      minimumFractionDigits: hasDecimals ? 1 : 0,
      maximumFractionDigits: 2
    });
  }

  var computeTbody = document.getElementById('infra-compute-tbody');
  var totalBanner  = document.getElementById('infra-total-value');
  var totalMonthlyEl = document.getElementById('infra-total-monthly-value');
  var collapsedVal = document.getElementById('infra-collapsed-total-value');
  var annualPerSrv  = document.getElementById('infra-annual-per-server');
  var monthlyPerSrv = document.getElementById('infra-monthly-per-server');
  var totalServersEl = document.getElementById('infra-total-servers-meta');

  if (serverCount === 0 && totalVcpuUnits === 0 && totalVramUnits === 0) {
    if (computeTbody) computeTbody.innerHTML =
      '<tr><td colspan="7" class="ms-loading">' +
      'Enter server counts above to calculate\u2026</td></tr>';
    if (totalBanner)  totalBanner.textContent  = '$0';
    if (totalMonthlyEl) totalMonthlyEl.textContent = '$0';
    if (collapsedVal) collapsedVal.textContent = '$0';
    if (totalServersEl) totalServersEl.textContent = '0';
    if (annualPerSrv)  annualPerSrv.textContent  = '$0';
    if (monthlyPerSrv) monthlyPerSrv.textContent = '$0';
    updateNetworkInfraSizing();
    return;
  }

  if (computeTbody) {
    var avgVcpu = serverCount > 0 ? totalVcpuUnits / serverCount : 0;
    var avgVram = serverCount > 0 ? totalVramUnits / serverCount : 0;

    computeTbody.innerHTML =
      '<tr>' +
        '<td class="compute-td">vCPU</td>' +
        '<td class="compute-td ms-number">' + serverCount.toLocaleString('en-US') + '</td>' +
        '<td class="compute-td ms-number">' + fmtUnit(avgVcpu) + '</td>' +
        '<td class="compute-td ms-number">' + totalVcpuUnits.toLocaleString('en-US') + '</td>' +
        '<td class="compute-td ms-number">' + fmtRate(vcpuRate) + '</td>' +
        '<td class="compute-td ms-number">' + fmt(vcpuMonthly) + '</td>' +
        '<td class="compute-td ms-cost">' + fmt(vcpuAnnual) + '</td>' +
      '</tr>' +
      '<tr>' +
        '<td class="compute-td">vRAM (GB)</td>' +
        '<td class="compute-td ms-number">' + serverCount.toLocaleString('en-US') + '</td>' +
        '<td class="compute-td ms-number">' + fmtUnit(avgVram) + '</td>' +
        '<td class="compute-td ms-number">' + totalVramUnits.toLocaleString('en-US') + '</td>' +
        '<td class="compute-td ms-number">' + fmtRate(vramRate) + '</td>' +
        '<td class="compute-td ms-number">' + fmt(vramMonthly) + '</td>' +
        '<td class="compute-td ms-cost">' + fmt(vramAnnual) + '</td>' +
      '</tr>' +
      '<tr class="ms-subtotal-row">' +
        '<td class="compute-td"><strong>Subtotal</strong></td>' +
        '<td class="compute-td ms-number"><strong>' + serverCount.toLocaleString('en-US') + '</strong></td>' +
        '<td class="compute-td"></td>' +
        '<td class="compute-td"></td>' +
        '<td class="compute-td"></td>' +
        '<td class="compute-td ms-number"><strong>' + fmt(totalMonthly) + '</strong></td>' +
        '<td class="compute-td ms-cost"><strong>' + fmt(totalAnnual) + '</strong></td>' +
      '</tr>';
  }

  var annualPerServer  = serverCount > 0 ? totalAnnual / serverCount : 0;
  var monthlyPerServer = annualPerServer / 12;

  if (totalBanner)  totalBanner.textContent  = fmt(totalAnnual);
  if (totalMonthlyEl) totalMonthlyEl.textContent = fmt(totalMonthly);
  if (collapsedVal) collapsedVal.textContent = fmt(totalAnnual);
  if (totalServersEl) totalServersEl.textContent = Math.round(serverCount).toLocaleString('en-US');
  if (annualPerSrv)  annualPerSrv.textContent  = fmt(annualPerServer);
  if (monthlyPerSrv) monthlyPerSrv.textContent = fmt(monthlyPerServer);
  updateNetworkInfraSizing();
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   DOM READY â€” INIT
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
document.addEventListener('DOMContentLoaded', function() {

  /* FIX â€” showRatesKPIs listener moved inside DOMContentLoaded */
  var showRatesKPIs = document.getElementById('showRatesKPIs');
  function applyRatesKpisVisibility() {
    var display = (showRatesKPIs && showRatesKPIs.checked) ? 'inline-flex' : 'none';
    ['infra-rates', 'fte-kpis', 'managed-services', 'probench-mark', 'vmware-rate'].forEach(function(tabId) {
      var el = document.querySelector('[data-tab="' + tabId + '"]');
      if (el) el.style.display = display;
    });
  }

  if (showRatesKPIs) {
    showRatesKPIs.addEventListener('change', applyRatesKpisVisibility);
  }
  applyRatesKpisVisibility();

  updateMidrangeAddButton();
  updateMidrangeVcpuButton();
  updateStorageSummary();
  updateComputeServerSummary();
  updateMidrangeServerSummary();
  initMidrangeMSSizing();
  wireMidrangeMSSizingListeners();
  updateMidrangeMSSizing();
  initMidrangeInfraSizing();
  wireMidrangeInfraSizingListeners();
  calcMidrangeInfraCost();
  wireSwmaSizingListeners();
  initStorageMSSizing();
  wireStorageMSSizingListeners();
  calcStorageMSSizing();
  initStorageInfraSizing();
  wireStorageInfraListeners();
  calcStorageInfraCost();
  initDbMwMSSizing();
  updateDbSummary();
  updateMwSummary();
  wireDbMwManagedServicesListeners();
  calcDbMwManagedServicesSizing();
  initMFMSSizing();
  wireMFMSSizingListeners();
  calcMainframeMSSizing();
  initMainframeInfraSizing();
  wireMainframeInfraSizingListeners();
  calcMainframeInfraCost();
  wireMainframeInfraRateListeners();
  renderProBenchMarkTable();
  populateIndustryTypeDropdown();
  wireItSpendBenchmarkListeners();
  updateItSpendBenchmark();
  var eciInput = document.getElementById('eci');
  if (eciInput) eciInput.addEventListener('input', function() { if (typeof buildTCOAnalysis === 'function') buildTCOAnalysis(); if (typeof buildTCOFteCard === 'function') buildTCOFteCard(); if (typeof buildTCOOperationalMetrics === 'function') buildTCOOperationalMetrics(); if (typeof buildExecutiveBrief === 'function') buildExecutiveBrief(); });
  initAdminEditableTargets();
  setMainframeInfraEditVisibility(false);
  applyDiscountCalculations();
  wireDatacenterSizingListeners();
  wireMSSizingListeners();
  attachRateCardListeners();
  updateNetworkInfraSizing();
  updateDatacenterSizing();
  updateOverlaysCFSSizing();

  var msSizingBody = document.getElementById('ms-sizing-body');
  if (msSizingBody) msSizingBody.style.display = 'block';

  refreshAdminEditableCalculations();

  document.querySelectorAll(
    '#compute-os-tbody .compute-number, #compute-vcpu-tbody .compute-number'
  ).forEach(function(inp) {
    inp.addEventListener('input', validateComputeCounts);
  });

  document.querySelectorAll('#compute-vcpu-tbody .compute-number').forEach(function(inp) {
    inp.addEventListener('input', updateVmwareSizing);
  });

  document.querySelectorAll('#compute-vcpu-tbody .compute-number').forEach(function(inp) {
    inp.addEventListener('input', calcInfraCost);
  });

  toggleAdminEditMode(false);
});

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   WINDOW LOAD â€” ATTACH RATE CARD LISTENERS ONLY
   FIX â€” removed duplicate calls, kept only what is needed here
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
window.addEventListener('load', function() {
  attachRateCardListeners();
});
