const routes = [
  ["overview", "首页概览"],
  ["import", "数据导入"],
  ["mapping", "字段映射"],
  ["issues", "数据问题中心"],
  ["nine-box", "九宫格盘点"],
  ["shl", "SHL 高潜分析"],
  ["succession", "继任分析"],
  ["heatmap", "继任热力图"],
  ["profile", "员工画像"],
  ["export", "报告导出"],
];

const state = {
  route: "overview",
  rawEmployees: [],
  employees: [],
  metadata: null,
  guide: "",
  insights: "",
  importStatus: "已加载官方 Demo 数据",
  issueTab: "auto",
  issueDrawerId: null,
  filters: { department: "全部", family: "全部", level: "全部" },
  selectedEmployeeId: null,
  selectedRole: null,
  reportOptions: ["组织概览", "问题中心", "九宫格分布", "SHL 高潜池", "继任梯队"],
};

const app = document.querySelector("#app");

const labelMap = {
  department: "部门",
  sub_department: "子部门",
  position_title: "岗位名称",
  job_family: "岗位族",
  job_level: "职级",
  manager_id: "直属上级",
  hire_date: "入职日期",
  performance_current: "今年绩效",
  performance_last_year: "去年绩效",
  potential_level: "潜力等级",
  training_completion_rate: "培训完成率",
  promotion_count: "晋升次数",
  mobility_flag: "跨城流动意愿",
  critical_role_flag: "关键岗位",
  successor_nomination_flag: "继任提名",
  readiness_level: "继任准备度",
  flight_risk: "流动风险",
  manager_recommendation: "管理者推荐",
  engagement_score: "敬业度",
  salary_band: "薪酬带",
};

const mappingPairs = [
  ["employee_id", "employee_id"], ["name", "name"], ["gender", "gender"], ["age", "age"],
  ["department", "department"], ["sub_department", "sub_department"], ["position_title", "position_title"], ["job_family", "job_family"],
  ["job_level", "job_level"], ["manager_id", "manager_id"], ["tenure_years", "tenure_years"], ["hire_date", "hire_date"],
  ["city", "city"], ["performance_current", "performance_current"], ["performance_last_year", "performance_last_year"], ["potential_level", "potential_level"],
  ["training_completion_rate", "training_completion_rate"], ["promotion_count", "promotion_count"], ["mobility_flag", "mobility_flag"], ["critical_role_flag", "critical_role_flag"],
  ["successor_nomination_flag", "successor_nomination_flag"], ["readiness_level", "readiness_level"], ["flight_risk", "flight_risk"], ["manager_recommendation", "manager_recommendation"],
  ["engagement_score", "engagement_score"], ["salary_band", "salary_band"],
];

init();

async function init() {
  window.addEventListener("hashchange", syncRouteFromHash);
  syncRouteFromHash();
  await loadDemoData();
  render();
}

async function loadDemoData() {
  const localDemo = window.TALENTPULSE_DEMO;
  if (localDemo) {
    state.rawEmployees = localDemo.employees;
    state.metadata = localDemo.metadata;
    state.guide = localDemo.guide;
    state.insights = localDemo.insights;
  } else {
    const [employeesRes, metadataRes, guideRes, insightsRes] = await Promise.all([
      fetch("./demo/demo_employees.json"),
      fetch("./demo/demo_org_metadata.json"),
      fetch("./demo/demo_scenario_guide.md"),
      fetch("./demo/demo_expected_insights.md"),
    ]);
    state.rawEmployees = await employeesRes.json();
    state.metadata = await metadataRes.json();
    state.guide = await guideRes.text();
    state.insights = await insightsRes.text();
  }
  state.employees = enrichEmployees(cleanEmployees(state.rawEmployees));
  state.selectedEmployeeId = state.employees[0]?.employee_id ?? null;
  state.selectedRole = getCriticalRoles(state.employees)[0]?.role ?? null;
}

function syncRouteFromHash() {
  const route = window.location.hash.replace("#", "");
  state.route = routes.find(([key]) => key === route)?.[0] ?? "overview";
}

function render() {
  if (!state.employees.length) {
    app.innerHTML = `<div class="loading-screen">TalentPulse 数据加载中...</div>`;
    return;
  }
  const issueStats = detectIssues(state.rawEmployees, state.employees);
  const filteredEmployees = getFilteredEmployees();
  const criticalRoles = getCriticalRoles(state.employees);
  const selectedEmployee = state.employees.find((item) => item.employee_id === state.selectedEmployeeId) ?? filteredEmployees[0];
  const selectedRole = criticalRoles.find((item) => item.role === state.selectedRole) ?? criticalRoles[0];
  app.innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark">TP</div>
          <div><div class="brand-title">TalentPulse</div><div class="brand-sub">人才盘点与继任分析系统</div></div>
        </div>
        <nav class="nav">${routes.map(([key, name]) => `<a class="nav-item ${state.route === key ? "active" : ""}" href="#${key}">${name}</a>`).join("")}</nav>
        <div class="sidebar-foot"><div class="small-label">Demo 企业</div><div class="sidebar-company">NovaEdge Technologies</div></div>
      </aside>
      <section class="main">
        <header class="topbar">
          <div><div class="page-eyebrow">PC Web · HR Portfolio Demo</div><h1>${getRouteTitle()}</h1></div>
          <div class="topbar-actions">
            <button data-action="load-demo" class="btn btn-secondary">加载官方 Demo</button>
            <a class="btn btn-primary" href="./demo/demo_talentpulse_company.xlsx" download>下载 Demo 数据</a>
          </div>
        </header>
        <main class="content">${renderRoute(state.route, { issueStats, filteredEmployees, selectedEmployee, criticalRoles, selectedRole })}</main>
      </section>
    </div>`;
  bindEvents(issueStats);
}

function getRouteTitle() {
  return routes.find(([key]) => key === state.route)?.[1] ?? "TalentPulse";
}

function cleanEmployees(rawEmployees) {
  const deptAliases = { "Engineering Center": "Engineering", "  Engineering  ": "Engineering", "Sales Team": "Sales", "Finance Legal": "Finance & Legal", "Operations Hub": "Operations" };
  const positionAliases = { PM: "Product Manager", "Cust Success Specialist": "Customer Success Consultant" };
  const deduped = [];
  const seenComposite = new Set();
  rawEmployees.forEach((item) => {
    const composite = `${item.name}-${item.hire_date}-${item.department}`;
    if (seenComposite.has(composite)) return;
    seenComposite.add(composite);
    const employee = { ...item };
    employee.department = deptAliases[(employee.department || "").trim()] ?? (employee.department || "").trim();
    employee.position_title = positionAliases[(employee.position_title || "").trim()] ?? (employee.position_title || "").trim();
    employee.hire_date = normalizeDate(employee.hire_date);
    employee.name = (employee.name || "").trim();
    employee.job_level = (employee.job_level || "").trim().toUpperCase();
    ["age", "tenure_years", "training_completion_rate", "promotion_count", "engagement_score"].forEach((key) => employee[key] = Number(employee[key]));
    deduped.push(employee);
  });
  return deduped;
}

function enrichEmployees(employees) {
  const perfScore = { A: 5, "B+": 4, B: 3, C: 2 };
  const potentialScore = { High: 5, Medium: 3, Low: 2, "": 0 };
  const readinessScore = { "Ready Now": 4, "Ready in 1-2 Years": 3, "Ready in 2-3 Years": 2, "Not Ready Yet": 1 };
  return employees.map((employee) => {
    const learningAgility = clamp(employee.training_completion_rate * 0.35 + employee.promotion_count * 18 + (employee.mobility_flag === "Y" ? 12 : 0) + (potentialScore[employee.potential_level] || 0) * 7, 35, 96);
    const leadershipDrive = clamp((perfScore[employee.performance_current] || 2) * 14 + (employee.manager_recommendation === "Strongly Recommend" ? 22 : employee.manager_recommendation === "Recommend" ? 14 : 6) + (employee.critical_role_flag === "Y" ? 8 : 0), 30, 95);
    const interpersonalInfluence = clamp(employee.engagement_score * 0.68 + (employee.manager_recommendation.includes("Recommend") ? 12 : 2), 35, 95);
    const strategicThinking = clamp((perfScore[employee.performance_current] || 2) * 11 + (perfScore[employee.performance_last_year] || 2) * 8 + (employee.critical_role_flag === "Y" ? 18 : 8) + (employee.job_level.startsWith("M") || employee.job_level === "D1" ? 12 : 0), 30, 96);
    const shlScore = Math.round((learningAgility + leadershipDrive + interpersonalInfluence + strategicThinking) / 4);
    const shlTier = shlScore >= 80 ? "A" : shlScore >= 68 ? "B" : "C";
    const successionScore = Math.round((perfScore[employee.performance_current] || 2) * 12 + (potentialScore[employee.potential_level] || 0) * 11 + fitScore(employee) * 16 + experienceScore(employee) * 15 + recommendationScore(employee) * 13);
    const successionBand = successionScore >= 76 ? "Ready Now" : successionScore >= 63 ? "Ready in 1-2 Years" : successionScore >= 50 ? "Ready in 2-3 Years" : "Not Ready Yet";
    return { ...employee, shl: { learningAgility, leadershipDrive, interpersonalInfluence, strategicThinking, score: shlScore, tier: shlTier }, succession: { score: successionScore, band: successionBand }, nineBox: getNineBox(employee.performance_current, employee.potential_level), riskTags: getRiskTags(employee, successionBand, shlTier) };
  });
}

function normalizeDate(value) {
  if (!value) return "";
  const text = String(value).trim().replaceAll(".", "-").replaceAll("/", "-");
  const mmddyyyy = /^(\d{2})-(\d{2})-(\d{4})$/;
  if (mmddyyyy.test(text)) {
    const [, mm, dd, yyyy] = text.match(mmddyyyy);
    return `${yyyy}-${mm}-${dd}`;
  }
  const parts = text.split("-");
  if (parts.length === 3 && parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
  return text;
}

function clamp(value, min, max) { return Math.max(min, Math.min(max, Math.round(value))); }
function fitScore(employee) { if (employee.critical_role_flag === "Y" && employee.job_level.startsWith("M")) return 4.6; if (employee.job_level === "D1" || employee.job_level === "M2") return 4.3; return employee.job_family === "Engineering" || employee.job_family === "Sales" ? 3.8 : 3.2; }
function experienceScore(employee) { return Math.min(4.8, 2.4 + employee.tenure_years / 4 + employee.promotion_count * 0.35); }
function recommendationScore(employee) { if (employee.manager_recommendation === "Strongly Recommend") return 4.8; if (employee.manager_recommendation === "Recommend") return 4.1; if (employee.manager_recommendation === "Observe") return 3.2; return 2.3; }
function getNineBox(performance, potential) { const x = performance === "A" ? 3 : performance === "B+" ? 2 : 1; const y = potential === "High" ? 3 : potential === "Medium" ? 2 : 1; return { x, y, label: `${x}-${y}` }; }

function getRiskTags(employee, successionBand, shlTier) {
  const tags = [];
  if (employee.flight_risk === "High") tags.push("高流动风险");
  if (employee.critical_role_flag === "Y" && employee.successor_nomination_flag === "N") tags.push("关键岗位无人接棒");
  if (successionBand === "Not Ready Yet" && shlTier === "A") tags.push("高潜培养加速");
  if (!employee.potential_level) tags.push("潜力待确认");
  return tags;
}

function detectIssues(rawEmployees, cleanedEmployees) {
  const auto = [], confirm = [], mark = [];
  const rawIds = new Map();
  const managerIds = new Set(cleanedEmployees.map((item) => item.employee_id));
  rawEmployees.forEach((employee, index) => {
    const row = index + 2;
    if (employee.department !== String(employee.department || "").trim()) auto.push(issue("首尾空格", "auto", row, employee, "department", "部门字段带空格，系统已自动清洗。"));
    if (/[./]/.test(String(employee.hire_date || ""))) auto.push(issue("日期格式标准化", "auto", row, employee, "hire_date", "日期格式混用，系统已统一为 YYYY-MM-DD。"));
    const id = employee.employee_id;
    rawIds.set(id, (rawIds.get(id) || 0) + 1);
    if (["Engineering Center", "Sales Team", "Finance Legal", "Operations Hub"].includes(String(employee.department).trim())) confirm.push(issue("部门别名待确认", "confirm", row, employee, "department", "别名已自动建议映射，请确认是否回写。"));
    if (["PM", "Cust Success Specialist"].includes(String(employee.position_title).trim())) confirm.push(issue("岗位别名待确认", "confirm", row, employee, "position_title", "岗位名称存在非标准口径。"));
    if (!employee.potential_level) confirm.push(issue("潜力值缺失", "confirm", row, employee, "potential_level", "缺失潜力等级，建议结合绩效与培养记录补齐。"));
    if (Number(employee.age) < 20 || Number(employee.age) > 60 || Number(employee.tenure_years) > Number(employee.age) - 18) confirm.push(issue("年龄/司龄异常", "confirm", row, employee, "age", "年龄或司龄超出合理区间。"));
    if (employee.position_title.includes("Director") && !employee.job_level.startsWith("M") && employee.job_level !== "D1") confirm.push(issue("职级与岗位不一致", "confirm", row, employee, "job_level", "职位头衔与职级疑似不匹配。"));
    if (!managerIds.has(employee.manager_id) && employee.manager_id !== "CEO-0001") mark.push(issue("manager_id 错误", "mark", row, employee, "manager_id", "直属上级不存在于员工主表。"));
    if (employee.readiness_level === "Ready Now" && (employee.performance_current === "C" || employee.potential_level === "Low")) mark.push(issue("准备度与绩效/潜力冲突", "mark", row, employee, "readiness_level", "Ready Now 与当前绩效或潜力不一致。"));
    if (employee.manager_recommendation === "Strongly Recommend" && employee.performance_current === "C") mark.push(issue("推荐与绩效冲突", "mark", row, employee, "manager_recommendation", "管理者强推与绩效结果不一致。"));
    if (employee.critical_role_flag === "Y" && employee.successor_nomination_flag === "N") mark.push(issue("关键岗位无继任提名", "mark", row, employee, "successor_nomination_flag", "关键岗位尚未建立继任候选人。"));
  });
  rawIds.forEach((count, employeeId) => {
    if (count > 1) {
      const hit = rawEmployees.find((item) => item.employee_id === employeeId);
      auto.push(issue("重复工号", "auto", "-", hit, "employee_id", "系统识别到重复工号，已保留最新一条记录。"));
      confirm.push(issue("工号冲突", "confirm", "-", hit, "employee_id", "重复工号可能导致历史记录覆盖，请人工确认。"));
    }
  });
  aggregateBy(cleanedEmployees, "department").filter((item) => item.avgPerformance > 4.2 || item.avgPerformance < 2.8).forEach((item) => {
    mark.push(issue("部门评分口径偏差", "mark", "-", { department: item.key, name: `${item.key} 评分样本` }, "performance_current", "部门整体绩效均值偏离明显，建议复核标尺。"));
  });
  return { auto, confirm, mark };
}

function issue(title, type, row, employee, field, description) {
  return { id: `${type}-${title}-${row}-${employee.employee_id || employee.name}`, title, type, row, employeeId: employee.employee_id ?? "-", name: employee.name ?? "-", department: employee.department ?? "-", field, description };
}

function aggregateBy(employees, key) {
  const perfScore = { A: 5, "B+": 4, B: 3, C: 2 };
  const groups = {};
  employees.forEach((employee) => {
    groups[employee[key]] ||= { key: employee[key], count: 0, perf: 0 };
    groups[employee[key]].count += 1;
    groups[employee[key]].perf += perfScore[employee.performance_current] || 0;
  });
  return Object.values(groups).map((item) => ({ ...item, avgPerformance: item.perf / item.count }));
}

function getFilteredEmployees() {
  return state.employees.filter((employee) => {
    if (state.filters.department !== "全部" && employee.department !== state.filters.department) return false;
    if (state.filters.family !== "全部" && employee.job_family !== state.filters.family) return false;
    if (state.filters.level !== "全部" && employee.job_level !== state.filters.level) return false;
    return true;
  });
}

function getCriticalRoles(employees) {
  const map = new Map();
  employees.filter((item) => item.critical_role_flag === "Y").forEach((employee) => {
    const role = `${employee.department} / ${employee.position_title}`;
    if (!map.has(role)) map.set(role, []);
    map.get(role).push(employee);
  });
  return Array.from(map.entries()).slice(0, 16).map(([role, items]) => ({ role, department: items[0].department, candidates: items.sort((a, b) => b.succession.score - a.succession.score).slice(0, 4) }));
}

function renderRoute(route, context) {
  switch (route) {
    case "overview": return renderOverview(context);
    case "import": return renderImport();
    case "mapping": return renderMapping();
    case "issues": return renderIssues(context.issueStats);
    case "nine-box": return renderNineBox(context.filteredEmployees);
    case "shl": return renderShl(context.filteredEmployees);
    case "succession": return renderSuccession(context.criticalRoles);
    case "heatmap": return renderHeatmap(context.criticalRoles, context.selectedRole);
    case "profile": return renderProfile(context.selectedEmployee);
    case "export": return renderExport(context.issueStats);
    default: return "";
  }
}

function renderOverview({ issueStats, filteredEmployees }) {
  const kpis = [
    { label: "员工总数", value: state.employees.length },
    { label: "关键岗位", value: state.employees.filter((item) => item.critical_role_flag === "Y").length },
    { label: "高潜 A 池", value: state.employees.filter((item) => item.shl.tier === "A").length },
    { label: "Ready Now", value: state.employees.filter((item) => item.succession.band === "Ready Now").length },
  ];
  return `
    <section class="hero card">
      <div>
        <div class="tag">Portfolio-ready HR SaaS Demo</div>
        <h2>把“人才盘点 + 继任分析”主链路做成可演示、可解释、可继续迭代的 PC 产品。</h2>
        <p>覆盖导入、映射、问题治理、九宫格、SHL 高潜、继任准备度、热力图、员工画像与报告导出。</p>
        <div class="hero-actions"><a class="btn btn-primary" href="#import">进入 Demo 主链路</a><a class="btn btn-secondary" href="./demo/demo_scenario_guide.md" download>下载演示脚本</a></div>
      </div>
      <div class="hero-panel"><div class="mini-stat"><span>自动处理</span><strong>${issueStats.auto.length}</strong></div><div class="mini-stat"><span>需确认</span><strong>${issueStats.confirm.length}</strong></div><div class="mini-stat"><span>仅标记</span><strong>${issueStats.mark.length}</strong></div></div>
    </section>
    <section class="grid-kpi">${kpis.map((item) => `<article class="card kpi-card"><span>${item.label}</span><strong>${item.value}</strong></article>`).join("")}</section>
    <section class="two-col">
      <article class="card"><div class="section-head"><h3>组织概览趋势</h3><span>高潜、Ready Now、关键岗位</span></div>${renderBars([{ label: "高潜 A 池", value: state.employees.filter((item) => item.shl.tier === "A").length, color: "var(--primary)" }, { label: "Ready Now", value: state.employees.filter((item) => item.succession.band === "Ready Now").length, color: "var(--success)" }, { label: "高流动风险", value: state.employees.filter((item) => item.flight_risk === "High").length, color: "var(--warning)" }, { label: "关键岗位", value: state.employees.filter((item) => item.critical_role_flag === "Y").length, color: "var(--danger)" }])}</article>
      <article class="card"><div class="section-head"><h3>快速入口</h3><span>完整主链路直达</span></div><div class="quick-grid">${routes.slice(1).map(([key, name]) => `<a class="quick-link" href="#${key}">${name}</a>`).join("")}</div></article>
    </section>
    <section class="two-col">
      <article class="card"><div class="section-head"><h3>部门人才热度</h3><span>九宫格与高潜综合视角</span></div>${renderDepartmentStrip(filteredEmployees)}</article>
      <article class="card markdown-card"><div class="section-head"><h3>预期洞察</h3><span>面试讲述用摘要</span></div><pre>${state.insights}</pre></article>
    </section>`;
}

function renderImport() {
  return `
    <section class="two-col">
      <article class="card">
        <div class="section-head"><h3>上传区</h3><span>支持 CSV / JSON，本项目附带官方 XLSX 模板</span></div>
        <label class="upload-zone"><input id="file-input" type="file" accept=".csv,.json,.xlsx" hidden /><span>点击上传或拖入文件</span><strong>推荐直接使用官方 Demo 数据</strong></label>
        <div class="status-banner">${state.importStatus}</div>
        <div class="button-row"><button class="btn btn-secondary" data-action="load-demo">载入官方 Demo</button><a class="btn btn-primary" href="#mapping">下一步：字段映射</a></div>
      </article>
      <article class="card">
        <div class="section-head"><h3>格式说明</h3><span>官方字段模板</span></div>
        <div class="field-list">${mappingPairs.slice(0, 12).map(([field]) => `<span class="tag muted">${field}</span>`).join("")}</div>
        <div class="download-list"><a href="./demo/demo_talentpulse_company.xlsx" download>下载：demo_talentpulse_company.xlsx</a><a href="./demo/demo_org_metadata.json" download>下载：demo_org_metadata.json</a><a href="./demo/demo_scenario_guide.md" download>下载：demo_scenario_guide.md</a><a href="./demo/demo_expected_insights.md" download>下载：demo_expected_insights.md</a></div>
      </article>
    </section>`;
}

function renderMapping() {
  return `
    <section class="two-col">
      <article class="card">
        <div class="section-head"><h3>字段映射</h3><span>自动匹配 + 手动调整入口</span></div>
        <table class="data-table">
          <thead><tr><th>系统字段</th><th>用户字段</th><th>匹配状态</th><th>说明</th></tr></thead>
          <tbody>${mappingPairs.map(([systemField, userField], index) => `<tr><td>${systemField}</td><td><select class="inline-select"><option selected>${userField}</option></select></td><td><span class="status ${index < 22 ? "success" : "warning"}">${index < 22 ? "自动匹配" : "建议确认"}</span></td><td>${labelMap[systemField] ?? "标准字段"}</td></tr>`).join("")}</tbody>
        </table>
      </article>
      <article class="card">
        <div class="section-head"><h3>冲突提示与预览</h3><span>演示用前三行样本</span></div>
        <div class="field-list"><span class="tag warning">department 存在别名</span><span class="tag warning">hire_date 混合格式</span><span class="tag danger">employee_id 存在冲突</span></div>
        ${renderPreviewTable(state.rawEmployees.slice(0, 3))}
        <div class="button-row"><a class="btn btn-secondary" href="#import">返回导入</a><a class="btn btn-primary" href="#issues">下一步：数据问题中心</a></div>
      </article>
    </section>`;
}

function renderIssues(issueStats) {
  const items = issueStats[state.issueTab];
  return `
    <section class="grid-kpi"><article class="card kpi-card"><span>自动处理</span><strong>${issueStats.auto.length}</strong></article><article class="card kpi-card"><span>需确认</span><strong>${issueStats.confirm.length}</strong></article><article class="card kpi-card"><span>仅标记</span><strong>${issueStats.mark.length}</strong></article><article class="card kpi-card"><span>清洗后记录数</span><strong>${state.employees.length}</strong></article></section>
    <section class="card">
      <div class="section-head"><h3>分类导航</h3><span>分层治理，不打断分析链路</span></div>
      <div class="tabs"><button class="tab ${state.issueTab === "auto" ? "active" : ""}" data-tab="auto">自动处理</button><button class="tab ${state.issueTab === "confirm" ? "active" : ""}" data-tab="confirm">需确认</button><button class="tab ${state.issueTab === "mark" ? "active" : ""}" data-tab="mark">仅标记</button></div>
      <div class="button-row"><button class="btn btn-secondary">批量处理</button><button class="btn btn-secondary">回滚上一步</button><a class="btn btn-primary" href="#nine-box">执行清洗并进入盘点</a></div>
    </section>
    <section class="issues-layout">
      <article class="card"><div class="section-head"><h3>问题表格</h3><span>${items.length} 条问题</span></div><table class="data-table"><thead><tr><th>问题</th><th>员工</th><th>部门</th><th>字段</th><th>处理</th></tr></thead><tbody>${items.slice(0, 14).map((item) => `<tr><td>${item.title}</td><td>${item.name}</td><td>${item.department}</td><td>${item.field}</td><td><button class="link-btn" data-issue="${item.id}">查看详情</button></td></tr>`).join("")}</tbody></table></article>
      <aside class="card drawer"><div class="section-head"><h3>详情抽屉</h3><span>问题解释与建议动作</span></div>${renderIssueDrawer(items)}</aside>
    </section>
    <section class="two-col"><article class="card"><div class="section-head"><h3>清洗前后对比</h3><span>以问题密度展示收益</span></div>${renderBars([{ label: "原始异常", value: state.rawEmployees.length - state.employees.length + issueStats.confirm.length + issueStats.mark.length, color: "var(--warning)" }, { label: "已自动清洗", value: issueStats.auto.length, color: "var(--success)" }, { label: "待人工确认", value: issueStats.confirm.length, color: "var(--primary)" }])}</article><article class="card markdown-card"><div class="section-head"><h3>演示说明</h3><span>可以直接用于汇报</span></div><pre>${state.guide}</pre></article></section>`;
}

function renderIssueDrawer(items) {
  const current = items.find((item) => item.id === state.issueDrawerId) ?? items[0];
  if (!current) return `<div class="empty-state">当前分类暂无问题。</div>`;
  return `<div class="drawer-block"><div class="drawer-title">${current.title}</div><p>${current.description}</p><div class="meta-list"><span>员工：${current.name}</span><span>工号：${current.employeeId}</span><span>部门：${current.department}</span><span>来源行：${current.row}</span></div><div class="button-row"><button class="btn btn-secondary">标记已处理</button><button class="btn btn-primary">应用建议</button></div></div>`;
}

function renderNineBox(filteredEmployees) {
  const matrix = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => []));
  filteredEmployees.forEach((employee) => matrix[employee.nineBox.y - 1][employee.nineBox.x - 1].push(employee));
  return `
    <section class="card"><div class="section-head"><h3>筛选器</h3><span>部门 / 岗位族 / 职级</span></div>${renderFilters()}</section>
    <section class="ninebox-layout">
      <article class="card">
        <div class="section-head"><h3>九宫格主体</h3><span>横轴绩效，纵轴潜力</span></div>
        <div class="ninebox-grid">${[2, 1, 0].map((row) => [0, 1, 2].map((col) => {
          const cell = matrix[row][col];
          return `<div class="ninebox-cell"><span class="cell-title">潜力 ${row + 1} / 绩效 ${col + 1}</span><strong>${cell.length}</strong><small>${cell.slice(0, 3).map((item) => item.name).join(" / ") || "暂无样本"}</small></div>`;
        }).join("")).join("")}</div>
      </article>
      <aside class="card">
        <div class="section-head"><h3>标签说明</h3><span>便于面试表达</span></div>
        <div class="legend-list"><div><span class="dot high"></span> 明星人才 / 加速培养</div><div><span class="dot mid"></span> 稳定骨干 / 定向发展</div><div><span class="dot low"></span> 风险群体 / 调整观察</div></div>
        <div class="section-head push-top"><h3>员工列表</h3><span>按 SHL 评分排序</span></div>
        <div class="list-panel">${filteredEmployees.slice().sort((a, b) => b.shl.score - a.shl.score).slice(0, 10).map((employee) => `<button class="employee-row ${employee.employee_id === state.selectedEmployeeId ? "active" : ""}" data-employee="${employee.employee_id}">${employee.name}<span>${employee.department}</span></button>`).join("")}</div>
        <a class="btn btn-primary full" href="#shl">导出人才盘点视图</a>
      </aside>
    </section>`;
}

function renderShl(filteredEmployees) {
  const topPool = filteredEmployees.filter((item) => item.shl.tier === "A").slice(0, 12);
  const selected = filteredEmployees.find((item) => item.employee_id === state.selectedEmployeeId) ?? filteredEmployees[0];
  return `
    <section class="two-col">
      <article class="card"><div class="section-head"><h3>SHL 4 维雷达</h3><span>学习敏捷度 / 领导驱动力 / 人际影响力 / 战略思维</span></div>${renderRadar(selected)}</article>
      <article class="card"><div class="section-head"><h3>高潜池名单</h3><span>A / B / C 分层</span></div><div class="list-panel">${filteredEmployees.slice().sort((a, b) => b.shl.score - a.shl.score).slice(0, 12).map((employee) => `<button class="employee-row ${employee.employee_id === state.selectedEmployeeId ? "active" : ""}" data-employee="${employee.employee_id}">${employee.name}<span>${employee.shl.tier} 类高潜 · ${employee.shl.score}</span></button>`).join("")}</div></article>
    </section>
    <section class="grid-kpi"><article class="card kpi-card"><span>A 类高潜</span><strong>${topPool.length}</strong></article><article class="card kpi-card"><span>学习敏捷度均值</span><strong>${average(filteredEmployees, (item) => item.shl.learningAgility)}</strong></article><article class="card kpi-card"><span>领导驱动力均值</span><strong>${average(filteredEmployees, (item) => item.shl.leadershipDrive)}</strong></article><article class="card kpi-card"><span>战略思维均值</span><strong>${average(filteredEmployees, (item) => item.shl.strategicThinking)}</strong></article></section>
    <section class="card"><div class="section-head"><h3>维度解释</h3><span>可与员工详情联动</span></div><div class="insight-grid"><div><strong>学习敏捷度</strong><p>培训完成率、晋升记录、流动意愿共同衡量成长速度。</p></div><div><strong>领导驱动力</strong><p>当前绩效、关键岗位暴露与管理者推荐共同反映带队意愿。</p></div><div><strong>人际影响力</strong><p>敬业度与推荐口径体现协同推动能力。</p></div><div><strong>战略思维 / 认知潜力</strong><p>绩效稳定性、岗位层级与关键岗位经历体现复杂判断力。</p></div></div></section>`;
}

function renderSuccession(criticalRoles) {
  const bands = ["Ready Now", "Ready in 1-2 Years", "Ready in 2-3 Years", "Not Ready Yet"];
  return `
    <section class="grid-kpi">${bands.map((band) => `<article class="card kpi-card"><span>${band}</span><strong>${state.employees.filter((item) => item.succession.band === band).length}</strong></article>`).join("")}</section>
    <section class="card"><div class="section-head"><h3>5 维继任准备度模型</h3><span>绩效 / 潜力 / 岗位匹配 / 关键经验 / 管理者推荐</span></div>${renderBars([{ label: "当前绩效", value: Math.round(average(state.employees, (item) => scorePerformance(item.performance_current) * 20)), color: "var(--primary)" }, { label: "潜力水平", value: Math.round(average(state.employees, (item) => scorePotential(item.potential_level) * 18)), color: "var(--success)" }, { label: "岗位匹配度", value: Math.round(average(state.employees, (item) => fitScore(item) * 18)), color: "#4A7CFF" }, { label: "关键经验", value: Math.round(average(state.employees, (item) => experienceScore(item) * 18)), color: "var(--warning)" }, { label: "推荐/发展准备", value: Math.round(average(state.employees, (item) => recommendationScore(item) * 18)), color: "var(--danger)" }])}</section>
    <section class="card">
      <div class="section-head"><h3>关键岗位候选梯队</h3><span>按岗位输出综合准备度与风险标签</span></div>
      <table class="data-table"><thead><tr><th>关键岗位</th><th>候选人</th><th>准备度</th><th>分层</th><th>风险标签</th></tr></thead><tbody>${criticalRoles.slice(0, 10).map((item) => `<tr><td>${item.role}</td><td>${item.candidates[0]?.name ?? "待补位"}</td><td>${item.candidates[0]?.succession.score ?? "-"}</td><td><span class="status ${bandClass(item.candidates[0]?.succession.band)}">${item.candidates[0]?.succession.band ?? "Not Ready Yet"}</span></td><td>${item.candidates[0]?.riskTags.join(" / ") || "无"}</td></tr>`).join("")}</tbody></table>
    </section>`;
}

function renderHeatmap(criticalRoles, selectedRole) {
  const departments = [...new Set(criticalRoles.map((item) => item.department))];
  return `
    <section class="card"><div class="section-head"><h3>部门 / 岗位切换</h3><span>颜色越深，准备度越高</span></div><div class="field-list">${departments.map((dept) => `<span class="tag muted">${dept}</span>`).join("")}</div></section>
    <section class="heatmap-layout">
      <article class="card">
        <div class="section-head"><h3>继任热力图</h3><span>hover / click 查看详情</span></div>
        <div class="heatmap-grid">${criticalRoles.slice(0, 12).map((item) => {
          const maxScore = item.candidates[0]?.succession.score ?? 35;
          const tone = Math.max(0.2, maxScore / 100);
          return `<button class="heat-cell ${item.role === selectedRole?.role ? "active" : ""}" style="background: rgba(47,107,255,${tone})" data-role="${item.role}"><strong>${item.role.split(" / ")[0]}</strong><span>${item.role.split(" / ")[1]}</span><em>${item.candidates[0]?.succession.band ?? "Not Ready Yet"}</em></button>`;
        }).join("")}</div>
        <div class="legend-line"><span>浅色：准备度弱</span><span>中度：1-2 年可接任</span><span>深色：Ready Now</span></div>
      </article>
      <aside class="card"><div class="section-head"><h3>右侧详情面板</h3><span>${selectedRole?.role ?? "未选中岗位"}</span></div><div class="list-panel">${(selectedRole?.candidates ?? []).map((employee) => `<button class="employee-row" data-employee="${employee.employee_id}">${employee.name}<span>${employee.succession.band} · ${employee.succession.score}</span></button>`).join("")}</div></aside>
    </section>`;
}

function renderProfile(employee) {
  if (!employee) return `<div class="card empty-state">暂无员工可展示。</div>`;
  return `
    <section class="profile-layout">
      <article class="card"><div class="section-head"><h3>基础信息</h3><span>${employee.name}</span></div><div class="profile-grid"><div><span>部门</span><strong>${employee.department}</strong></div><div><span>岗位</span><strong>${employee.position_title}</strong></div><div><span>职级</span><strong>${employee.job_level}</strong></div><div><span>城市</span><strong>${employee.city}</strong></div></div><div class="field-list">${employee.riskTags.map((tag) => `<span class="tag warning">${tag}</span>`).join("") || '<span class="tag success">画像稳定</span>'}</div></article>
      <article class="card"><div class="section-head"><h3>绩效 / 潜力 / 准备度</h3><span>核心人才结论</span></div><div class="profile-grid"><div><span>当前绩效</span><strong>${employee.performance_current}</strong></div><div><span>潜力等级</span><strong>${employee.potential_level || "待确认"}</strong></div><div><span>SHL 高潜</span><strong>${employee.shl.tier} / ${employee.shl.score}</strong></div><div><span>继任准备</span><strong>${employee.succession.band}</strong></div></div>${renderBars([{ label: "学习敏捷度", value: employee.shl.learningAgility, color: "var(--primary)" }, { label: "领导驱动力", value: employee.shl.leadershipDrive, color: "var(--success)" }, { label: "人际影响力", value: employee.shl.interpersonalInfluence, color: "#4A7CFF" }, { label: "战略思维", value: employee.shl.strategicThinking, color: "var(--warning)" }])}</article>
    </section>
    <section class="two-col"><article class="card"><div class="section-head"><h3>候选身份</h3><span>关键岗位与发展建议</span></div><div class="insight-grid"><div><strong>关键岗位</strong><p>${employee.critical_role_flag === "Y" ? "是，已进入关键岗位盘点清单。" : "否，建议作为后备梯队观察对象。"}</p></div><div><strong>继任提名</strong><p>${employee.successor_nomination_flag === "Y" ? "已进入继任名单。" : "当前尚未被提名，需要补充评审。"}</p></div><div><strong>培养建议</strong><p>${getDevelopmentAdvice(employee)}</p></div><div><strong>历史趋势</strong><p>今年绩效 ${employee.performance_current}，去年 ${employee.performance_last_year}，培训完成 ${employee.training_completion_rate}% 。</p></div></div></article><article class="card"><div class="section-head"><h3>员工切换</h3><span>从九宫格 / 热力图联动进入</span></div><div class="list-panel">${state.employees.slice().sort((a, b) => b.shl.score - a.shl.score).slice(0, 12).map((item) => `<button class="employee-row ${item.employee_id === employee.employee_id ? "active" : ""}" data-employee="${item.employee_id}">${item.name}<span>${item.department}</span></button>`).join("")}</div></article></section>`;
}

function renderExport(issueStats) {
  return `
    <section class="two-col">
      <article class="card"><div class="section-head"><h3>报告内容摘要</h3><span>适合汇报与面试展示</span></div><div class="check-list">${["组织概览", "字段映射结论", "数据问题中心", "九宫格分布", "SHL 高潜池", "继任梯队", "热力图截图", "重点员工画像"].map((item) => `<label><input type="checkbox" checked data-report-option="${item}" />${item}</label>`).join("")}</div><div class="button-row"><button class="btn btn-primary" data-action="export-report">导出报告</button><span id="export-status" class="status success">可立即导出</span></div></article>
      <article class="card"><div class="section-head"><h3>图表预览</h3><span>导出前预览核心摘要</span></div>${renderBars([{ label: "问题中心", value: issueStats.auto.length + issueStats.confirm.length + issueStats.mark.length, color: "var(--warning)" }, { label: "高潜 A 池", value: state.employees.filter((item) => item.shl.tier === "A").length, color: "var(--primary)" }, { label: "Ready Now", value: state.employees.filter((item) => item.succession.band === "Ready Now").length, color: "var(--success)" }])}</article>
    </section>`;
}

function renderPreviewTable(rows) { return `<table class="data-table compact"><thead><tr><th>employee_id</th><th>name</th><th>department</th><th>hire_date</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${row.employee_id}</td><td>${row.name}</td><td>${row.department}</td><td>${row.hire_date}</td></tr>`).join("")}</tbody></table>`; }
function renderFilters() { const departments = ["全部", ...new Set(state.employees.map((item) => item.department))], families = ["全部", ...new Set(state.employees.map((item) => item.job_family))], levels = ["全部", ...new Set(state.employees.map((item) => item.job_level))]; return `<div class="filter-row">${renderSelect("department", departments, state.filters.department)}${renderSelect("family", families, state.filters.family)}${renderSelect("level", levels, state.filters.level)}</div>`; }
function renderSelect(key, options, value) { return `<select data-filter="${key}" class="filter-select">${options.map((option) => `<option ${option === value ? "selected" : ""}>${option}</option>`).join("")}</select>`; }
function renderBars(items) { const max = Math.max(...items.map((item) => item.value), 1); return `<div class="bars">${items.map((item) => `<div class="bar-row"><span>${item.label}</span><div class="bar-track"><div class="bar-fill" style="width:${(item.value / max) * 100}%; background:${item.color}"></div></div><strong>${item.value}</strong></div>`).join("")}</div>`; }

function renderDepartmentStrip(employees) {
  const groups = {};
  employees.forEach((employee) => {
    groups[employee.department] ||= { department: employee.department, score: 0, total: 0, ready: 0, highPotential: 0 };
    groups[employee.department].total += 1;
    groups[employee.department].score += employee.shl.score;
    if (employee.succession.band === "Ready Now") groups[employee.department].ready += 1;
    if (employee.shl.tier === "A") groups[employee.department].highPotential += 1;
  });
  const list = Object.values(groups).map((item) => ({ department: item.department, score: Math.round(item.score / item.total), note: `高潜 ${item.highPotential} / Ready Now ${item.ready}` })).slice(0, 8);
  const max = Math.max(...list.map((item) => item.score), 1);
  return `<div class="dept-strip">${list.map((item) => `<div class="dept-card"><span>${item.department}</span><div class="mini-bar"><div style="width:${(item.score / max) * 100}%"></div></div><strong>${item.score}</strong><small>${item.note}</small></div>`).join("")}</div>`;
}

function renderRadar(employee) {
  const values = [employee.shl.learningAgility, employee.shl.leadershipDrive, employee.shl.interpersonalInfluence, employee.shl.strategicThinking];
  const labels = ["学习敏捷度", "领导驱动力", "人际影响力", "战略思维"];
  const points = values.map((value, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / values.length;
    const radius = 90 * (value / 100);
    const x = 120 + Math.cos(angle) * radius;
    const y = 120 + Math.sin(angle) * radius;
    return `${x},${y}`;
  }).join(" ");
  return `<div class="radar-wrap"><svg viewBox="0 0 240 240" class="radar"><polygon points="120,30 210,120 120,210 30,120" class="radar-grid"></polygon><polygon points="120,60 180,120 120,180 60,120" class="radar-grid inner"></polygon><line x1="120" y1="120" x2="120" y2="30"></line><line x1="120" y1="120" x2="210" y2="120"></line><line x1="120" y1="120" x2="120" y2="210"></line><line x1="120" y1="120" x2="30" y2="120"></line><polygon points="${points}" class="radar-data"></polygon></svg><div class="radar-legend">${labels.map((label, index) => `<div><span>${label}</span><strong>${values[index]}</strong></div>`).join("")}</div></div>`;
}

function average(items, getter) { if (!items.length) return 0; return Math.round(items.reduce((sum, item) => sum + getter(item), 0) / items.length); }
function bandClass(band) { if (band === "Ready Now") return "success"; if (band === "Ready in 1-2 Years") return "info"; if (band === "Ready in 2-3 Years") return "warning"; return "danger"; }
function scorePerformance(value) { return { A: 5, "B+": 4, B: 3, C: 2 }[value] ?? 2; }
function scorePotential(value) { return { High: 5, Medium: 3, Low: 2 }[value] ?? 1; }
function getDevelopmentAdvice(employee) { if (employee.flight_risk === "High") return "优先安排保留沟通与关键项目授权，降低明星员工流失风险。"; if (employee.shl.tier === "A" && employee.succession.band !== "Ready Now") return "建议安排跨部门项目、带小团队机会，加快从高潜到 Ready Now 的转换。"; if (!employee.potential_level) return "先完成潜力校准，再决定培养投入优先级。"; return "保持绩效稳定，同时补齐关键经验和继任提名。"; }

function bindEvents(issueStats) {
  app.querySelectorAll("[data-filter]").forEach((element) => element.addEventListener("change", (event) => { state.filters[event.target.dataset.filter] = event.target.value; render(); }));
  app.querySelectorAll("[data-tab]").forEach((element) => element.addEventListener("click", () => { state.issueTab = element.dataset.tab; state.issueDrawerId = issueStats[state.issueTab][0]?.id ?? null; render(); }));
  app.querySelectorAll("[data-issue]").forEach((element) => element.addEventListener("click", () => { state.issueDrawerId = element.dataset.issue; render(); }));
  app.querySelectorAll("[data-employee]").forEach((element) => element.addEventListener("click", () => { state.selectedEmployeeId = element.dataset.employee; window.location.hash = "#profile"; }));
  app.querySelectorAll("[data-role]").forEach((element) => element.addEventListener("click", () => { state.selectedRole = element.dataset.role; render(); }));
  app.querySelectorAll("[data-action='load-demo']").forEach((element) => element.addEventListener("click", async () => { state.importStatus = "已重新载入官方 Demo 数据"; await loadDemoData(); render(); }));
  const fileInput = app.querySelector("#file-input");
  if (fileInput) {
    fileInput.addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      if (file.name.endsWith(".json")) { state.rawEmployees = JSON.parse(await file.text()); state.employees = enrichEmployees(cleanEmployees(state.rawEmployees)); state.importStatus = `已导入 ${file.name}`; }
      else if (file.name.endsWith(".csv")) { state.rawEmployees = parseCsv(await file.text()); state.employees = enrichEmployees(cleanEmployees(state.rawEmployees)); state.importStatus = `已导入 ${file.name}`; }
      else { state.importStatus = "当前前端 Demo 上传解析支持 CSV / JSON，官方 XLSX 已随项目提供下载与演示入口。"; }
      render();
    });
  }
  app.querySelectorAll("[data-report-option]").forEach((element) => element.addEventListener("change", () => { state.reportOptions = Array.from(app.querySelectorAll("[data-report-option]:checked")).map((item) => item.dataset.reportOption); }));
  const exportButton = app.querySelector("[data-action='export-report']");
  if (exportButton) {
    exportButton.addEventListener("click", () => {
      const content = ["TalentPulse Demo Report", `Modules: ${state.reportOptions.join(", ")}`, `Employees: ${state.employees.length}`, `High Potential A: ${state.employees.filter((item) => item.shl.tier === "A").length}`, `Ready Now: ${state.employees.filter((item) => item.succession.band === "Ready Now").length}`].join("\n");
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "talentpulse-report-summary.txt";
      link.click();
      URL.revokeObjectURL(url);
      const status = app.querySelector("#export-status");
      if (status) status.textContent = "导出成功";
    });
  }
}

function parseCsv(text) {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(",").map((item) => item.trim());
  return lines.map((line) => {
    const values = line.split(",");
    return Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() ?? ""]));
  });
}
