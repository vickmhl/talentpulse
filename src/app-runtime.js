(function () {
  var app = document.getElementById("app");
  var demo = window.TALENTPULSE_DEMO || { employees: [] };
  var routes = [
    { key: "home", label: "首页" },
    { key: "overview", label: "分析总览" },
    { key: "quality", label: "数据质量" },
    { key: "ninebox", label: "九宫格" },
    { key: "hipo", label: "高潜分析" },
    { key: "succession", label: "继任分析" },
    { key: "heatmap", label: "继任热力图" },
    { key: "profile", label: "员工画像" },
    { key: "report", label: "报告页" }
  ];
  var state = {
    route: "home",
    raw: demo.employees || [],
    employees: [],
    department: "All",
    employeeId: "",
    roleName: "",
    qualityTab: "auto"
  };

  var DEPT_ALIAS = {
    "Engineering Center": "Engineering",
    "  Engineering  ": "Engineering",
    "Sales Team": "Sales",
    "Finance Legal": "Finance & Legal",
    "Operations Hub": "Operations"
  };

  var TITLE_ALIAS = {
    "PM": "Product Manager",
    "Cust Success Specialist": "Customer Success Consultant"
  };

  function safe(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function copy(obj) {
    var out = {};
    for (var key in obj) out[key] = obj[key];
    return out;
  }

  function scorePerformance(value) {
    return { A: 5, "B+": 4, B: 3, C: 2 }[value] || 2;
  }

  function scorePotential(value) {
    return { High: 5, Medium: 3, Low: 2 }[value] || 1;
  }

  function recommendationScore(value) {
    if (value === "Strongly Recommend") return 4.8;
    if (value === "Recommend") return 4.1;
    if (value === "Observe") return 3.1;
    return 2.2;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Math.round(value)));
  }

  function normalizeDate(value) {
    if (!value) return "";
    var text = String(value).replace(/\./g, "-").replace(/\//g, "-").trim();
    var match = text.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (match) return match[3] + "-" + match[1] + "-" + match[2];
    var parts = text.split("-");
    if (parts.length === 3 && parts[0].length === 4) {
      return parts[0] + "-" + pad(parts[1]) + "-" + pad(parts[2]);
    }
    return text;
  }

  function pad(value) {
    value = String(value);
    return value.length === 1 ? "0" + value : value;
  }

  function cleanEmployees(rows) {
    var seen = {};
    var output = [];
    for (var i = 0; i < rows.length; i += 1) {
      var row = copy(rows[i]);
      row.department = DEPT_ALIAS[String(row.department || "").trim()] || String(row.department || "").trim();
      row.position_title = TITLE_ALIAS[String(row.position_title || "").trim()] || String(row.position_title || "").trim();
      row.name = String(row.name || "").trim();
      row.hire_date = normalizeDate(row.hire_date);
      row.age = Number(row.age || 0);
      row.tenure_years = Number(row.tenure_years || 0);
      row.training_completion_rate = Number(row.training_completion_rate || 0);
      row.promotion_count = Number(row.promotion_count || 0);
      row.engagement_score = Number(row.engagement_score || 0);
      var key = row.name + "|" + row.hire_date + "|" + row.department;
      if (seen[key]) continue;
      seen[key] = true;
      output.push(row);
    }
    return output;
  }

  function enrichEmployees(rows) {
    return rows.map(function (row) {
      var item = copy(row);
      var learning = clamp(item.training_completion_rate * 0.38 + item.promotion_count * 15 + (item.mobility_flag === "Y" ? 10 : 0) + scorePotential(item.potential_level) * 7, 35, 95);
      var leadership = clamp(scorePerformance(item.performance_current) * 14 + recommendationScore(item.manager_recommendation) * 5 + (item.critical_role_flag === "Y" ? 10 : 0), 30, 96);
      var influence = clamp(item.engagement_score * 0.72 + (item.manager_recommendation === "Strongly Recommend" ? 10 : item.manager_recommendation === "Recommend" ? 6 : 2), 35, 94);
      var strategic = clamp(scorePerformance(item.performance_current) * 11 + scorePerformance(item.performance_last_year) * 7 + (item.job_level === "D1" ? 18 : item.job_level === "M2" ? 14 : item.job_level === "M1" ? 10 : 4), 30, 95);
      var shlScore = Math.round((learning + leadership + influence + strategic) / 4);
      var shlTier = shlScore >= 80 ? "A" : shlScore >= 68 ? "B" : "C";
      var successionScore = Math.round(scorePerformance(item.performance_current) * 13 + scorePotential(item.potential_level) * 11 + fitScore(item) * 16 + experienceScore(item) * 15 + recommendationScore(item.manager_recommendation) * 14);
      var successionBand = successionScore >= 76 ? "Ready Now" : successionScore >= 63 ? "Ready in 1-2 Years" : successionScore >= 50 ? "Ready in 2-3 Years" : "Not Ready Yet";
      item.shl = { learning: learning, leadership: leadership, influence: influence, strategic: strategic, score: shlScore, tier: shlTier };
      item.succession = { score: successionScore, band: successionBand };
      item.ninebox = { x: item.performance_current === "A" ? 3 : item.performance_current === "B+" ? 2 : 1, y: item.potential_level === "High" ? 3 : item.potential_level === "Medium" ? 2 : 1 };
      item.riskTags = buildRiskTags(item, successionBand, shlTier);
      return item;
    });
  }

  function fitScore(item) {
    if (item.critical_role_flag === "Y" && (item.job_level === "M2" || item.job_level === "D1")) return 4.8;
    if (item.job_level === "M1") return 4.2;
    if (item.department === "Engineering" || item.department === "Sales" || item.department === "Product") return 3.8;
    return 3.2;
  }

  function experienceScore(item) {
    return Math.min(4.8, 2.2 + item.tenure_years / 4 + item.promotion_count * 0.4);
  }

  function buildRiskTags(item, successionBand, shlTier) {
    var tags = [];
    if (item.flight_risk === "High") tags.push("高流动风险");
    if (item.critical_role_flag === "Y" && item.successor_nomination_flag === "N") tags.push("关键岗位无人接班");
    if (!item.potential_level) tags.push("潜力待校准");
    if (shlTier === "A" && successionBand !== "Ready Now") tags.push("高潜待加速");
    return tags;
  }

  function detectQuality(rawRows, cleanedRows) {
    var quality = { auto: [], review: [], risk: [] };
    var managerSet = {};
    var idCount = {};
    cleanedRows.forEach(function (row) { managerSet[row.employee_id] = true; });
    rawRows.forEach(function (row, index) {
      var line = index + 2;
      var dept = String(row.department || "");
      var title = String(row.position_title || "");
      var date = String(row.hire_date || "");
      idCount[row.employee_id] = (idCount[row.employee_id] || 0) + 1;
      if (dept !== dept.trim()) quality.auto.push(issue("空格清洗", "auto", line, row, "department", "系统已自动清洗首尾空格。"));
      if (/[./]/.test(date)) quality.auto.push(issue("日期标准化", "auto", line, row, "hire_date", "系统已统一日期格式。"));
      if (dept === "Engineering Center" || dept === "Sales Team" || dept === "Finance Legal" || dept === "Operations Hub") quality.review.push(issue("部门别名确认", "review", line, row, "department", "系统已自动识别别名，建议确认是否回写。"));
      if (title === "PM" || title === "Cust Success Specialist") quality.review.push(issue("岗位别名确认", "review", line, row, "position_title", "岗位名称存在非标准口径。"));
      if (!row.potential_level) quality.review.push(issue("潜力值缺失", "review", line, row, "potential_level", "会影响高潜判断准确性。"));
      if (Number(row.age) < 20 || Number(row.age) > 60 || Number(row.tenure_years) > Number(row.age) - 18) quality.review.push(issue("年龄/司龄异常", "review", line, row, "age", "年龄或司龄存在明显异常。"));
      if (row.manager_id && row.manager_id !== "CEO-0001" && !managerSet[row.manager_id]) quality.risk.push(issue("manager_id 异常", "risk", line, row, "manager_id", "直属上级不在当前员工清单中。"));
      if (row.readiness_level === "Ready Now" && (row.performance_current === "C" || row.potential_level === "Low")) quality.risk.push(issue("准备度冲突", "risk", line, row, "readiness_level", "Ready Now 与绩效/潜力不一致。"));
      if (row.manager_recommendation === "Strongly Recommend" && row.performance_current === "C") quality.risk.push(issue("推荐冲突", "risk", line, row, "manager_recommendation", "强推荐与绩效结果不一致。"));
      if (row.critical_role_flag === "Y" && row.successor_nomination_flag === "N") quality.risk.push(issue("关键岗位无继任提名", "risk", line, row, "successor_nomination_flag", "关键岗位尚未建立候选梯队。"));
    });
    Object.keys(idCount).forEach(function (id) {
      if (idCount[id] > 1) {
        quality.auto.push(issue("重复工号自动去重", "auto", "-", { employee_id: id, name: id, department: "-" }, "employee_id", "系统已在分析视图中自动去重。"));
        quality.review.push(issue("工号冲突待确认", "review", "-", { employee_id: id, name: id, department: "-" }, "employee_id", "重复工号可能影响历史追溯。"));
      }
    });
    return quality;
  }

  function issue(title, type, row, employee, field, summary) {
    return {
      id: type + "-" + title + "-" + row + "-" + (employee.employee_id || employee.name || "x"),
      title: title,
      type: type,
      row: row,
      name: employee.name || "-",
      department: employee.department || "-",
      field: field,
      summary: summary
    };
  }

  function summarizeDepartments(rows) {
    var map = {};
    rows.forEach(function (row) {
      if (!map[row.department]) map[row.department] = { count: 0, hipoA: 0, readyNow: 0, flightRisk: 0, keyRisk: 0, avgShl: 0 };
      var item = map[row.department];
      item.count += 1;
      item.avgShl += row.shl.score;
      if (row.shl.tier === "A") item.hipoA += 1;
      if (row.succession.band === "Ready Now") item.readyNow += 1;
      if (row.flight_risk === "High") item.flightRisk += 1;
      if (row.critical_role_flag === "Y" && row.successor_nomination_flag === "N") item.keyRisk += 1;
    });
    Object.keys(map).forEach(function (key) {
      map[key].avgShl = Math.round(map[key].avgShl / map[key].count);
    });
    return map;
  }

  function getCriticalRoles(rows) {
    var map = {};
    rows.forEach(function (row) {
      if (row.critical_role_flag !== "Y") return;
      var role = row.department + " / " + row.position_title;
      if (!map[role]) map[role] = [];
      map[role].push(row);
    });
    return Object.keys(map).map(function (role) {
      map[role].sort(function (a, b) { return b.succession.score - a.succession.score; });
      return { role: role, department: map[role][0].department, candidates: map[role].slice(0, 4) };
    }).sort(function (a, b) {
      return (a.candidates[0] ? a.candidates[0].succession.score : 0) - (b.candidates[0] ? b.candidates[0].succession.score : 0);
    });
  }

  function currentRows() {
    if (state.department === "All") return state.employees.slice();
    return state.employees.filter(function (row) { return row.department === state.department; });
  }

  function countBy(rows, fn) {
    var count = 0;
    rows.forEach(function (row) { if (fn(row)) count += 1; });
    return count;
  }

  function avg(rows, fn) {
    if (!rows.length) return 0;
    var total = 0;
    rows.forEach(function (row) { total += fn(row); });
    return Math.round(total / rows.length);
  }

  function findEmployee(id) {
    for (var i = 0; i < state.employees.length; i += 1) {
      if (state.employees[i].employee_id === id) return state.employees[i];
    }
    return null;
  }

  function findRole(name, roles) {
    for (var i = 0; i < roles.length; i += 1) {
      if (roles[i].role === name) return roles[i];
    }
    return null;
  }

  function departmentOptions() {
    var set = { All: true };
    var list = ["All"];
    state.employees.forEach(function (row) {
      if (!set[row.department]) {
        set[row.department] = true;
        list.push(row.department);
      }
    });
    return list;
  }

  function insightList() {
    return [
      "研发部高潜相对集中，但管理 Ready Now 覆盖偏弱，存在梯队断层风险。",
      "销售部当前绩效表现强，但高流动风险较高，依赖少数头部人才。",
      "运营团队结构稳定，但高潜比例低，成长动能不足。",
      "产品部关键岗位集中，核心岗位存在单点依赖。",
      "HR、财务和 IT 团队人数不多，但继任风险往往被低估。"
    ];
  }

  function developmentAdvice(row) {
    if (!row) return "暂无建议。";
    if (row.flight_risk === "High") return "优先做保留沟通，并通过关键项目授权降低流失风险。";
    if (row.shl.tier === "A" && row.succession.band !== "Ready Now") return "建议增加跨部门项目和带队经历，加速从高潜到 Ready Now 的转化。";
    if (!row.potential_level) return "先补齐潜力校准，再决定培养投入优先级。";
    return "保持绩效稳定，同时补齐关键经验和继任曝光。";
  }

  function hipoSummary(row) {
    if (!row) return "暂无高潜解释。";
    if (row.shl.tier === "A") return row.name + " 属于重点高潜，学习敏捷度与领导驱动力较强。";
    if (row.shl.tier === "B") return row.name + " 具备一定潜力，但仍需更多关键经验验证。";
    return row.name + " 当前更适合作为稳定执行型人才观察。";
  }

  function successionSummary(row) {
    if (!row) return "暂无建议。";
    if (row.succession.band === "Ready Now") return "可以进入关键岗位短期接任名单，但仍需持续观察稳定性。";
    if (row.succession.band === "Ready in 1-2 Years") return "适合纳入核心后备梯队，重点补管理和关键经验。";
    if (row.succession.band === "Ready in 2-3 Years") return "具备中长期培养价值，但尚不适合承担即时接班责任。";
    return "当前不建议进入核心继任池，应先提升绩效稳定性或潜力识别质量。";
  }

  function bars(items) {
    var max = 1;
    items.forEach(function (item) { max = Math.max(max, item.value); });
    return '<div class="bars">' + items.map(function (item) {
      return '<div class="bar-row"><span>' + safe(item.label) + '</span><div class="bar-track"><div class="bar-fill" style="width:' + ((item.value / max) * 100) + '%; background:' + item.color + '"></div></div><strong>' + item.value + '</strong></div>';
    }).join("") + '</div>';
  }

  function employeeButton(row) {
    return '<button class="employee-row ' + (state.employeeId === row.employee_id ? "active" : "") + '" data-employee="' + safe(row.employee_id) + '"><span>' + safe(row.name) + '</span><span>' + safe(row.department + " · " + row.shl.tier + " / " + row.succession.band) + '</span></button>';
  }

  function nineboxMatrix(rows, compact) {
    var matrix = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    rows.forEach(function (row) { matrix[row.ninebox.y - 1][row.ninebox.x - 1] += 1; });
    return '<div class="ninebox-grid">' + [2, 1, 0].map(function (y) {
      return [0, 1, 2].map(function (x) {
        return '<div class="ninebox-cell"><span class="cell-title">潜力 ' + (y + 1) + ' / 绩效 ' + (x + 1) + '</span><strong>' + matrix[y][x] + '</strong><small>' + (compact ? "系统自动分层" : nineboxLabel(x + 1, y + 1)) + '</small></div>';
      }).join("");
    }).join("") + "</div>";
  }

  function nineboxLabel(x, y) {
    if (x === 3 && y === 3) return "明星人才";
    if (x >= 2 && y >= 2) return "重点培养";
    if (x === 1 && y === 1) return "风险观察";
    return "结构性样本";
  }

  function departmentSummary(summary) {
    return '<div class="dept-strip">' + Object.keys(summary).slice(0, 8).map(function (key) {
      var item = summary[key];
      return '<div class="dept-card"><span>' + safe(key) + '</span><div class="mini-bar"><div style="width:' + item.avgShl + '%"></div></div><strong>' + item.avgShl + '</strong><small>高潜 ' + item.hipoA + ' / Ready Now ' + item.readyNow + ' / 风险 ' + item.keyRisk + '</small></div>';
    }).join("") + '</div>';
  }

  function radar(row) {
    if (!row) return '<div class="empty-state">暂无数据。</div>';
    var values = [row.shl.learning, row.shl.leadership, row.shl.influence, row.shl.strategic];
    var labels = ["学习敏捷度", "领导驱动力", "人际影响力", "战略思维"];
    var points = [];
    for (var i = 0; i < values.length; i += 1) {
      var angle = -Math.PI / 2 + Math.PI * 2 * i / values.length;
      var radius = 90 * values[i] / 100;
      points.push((120 + Math.cos(angle) * radius) + "," + (120 + Math.sin(angle) * radius));
    }
    return '<div class="radar-wrap"><svg viewBox="0 0 240 240" class="radar"><polygon points="120,30 210,120 120,210 30,120" class="radar-grid"></polygon><polygon points="120,60 180,120 120,180 60,120" class="radar-grid inner"></polygon><line x1="120" y1="120" x2="120" y2="30"></line><line x1="120" y1="120" x2="210" y2="120"></line><line x1="120" y1="120" x2="120" y2="210"></line><line x1="120" y1="120" x2="30" y2="120"></line><polygon points="' + points.join(" ") + '" class="radar-data"></polygon></svg><div class="radar-legend">' + labels.map(function (label, idx) {
      return '<div><span>' + label + '</span><strong>' + values[idx] + '</strong></div>';
    }).join("") + '</div></div>';
  }

  function heatCell(role, selectedRole) {
    var score = role.candidates[0] ? role.candidates[0].succession.score : 28;
    var alpha = Math.max(0.18, Math.min(0.88, score / 100));
    return '<button class="heat-cell ' + (selectedRole && selectedRole.role === role.role ? "active" : "") + '" data-role="' + safe(role.role) + '" style="background: rgba(47,107,255,' + alpha + ')"><strong>' + safe(role.department) + '</strong><span>' + safe(role.role.split(" / ")[1] || role.role) + '</span><em>' + safe(role.candidates[0] ? role.candidates[0].succession.band : "Not Ready Yet") + '</em></button>';
  }

  function renderPage(rows, quality, roles, selectedEmployee, selectedRole) {
    if (state.route === "home") return renderHome();
    if (state.route === "overview") return renderOverview(rows, quality, roles);
    if (state.route === "quality") return renderQuality(quality);
    if (state.route === "ninebox") return renderNinebox(rows);
    if (state.route === "hipo") return renderHiPo(rows, selectedEmployee);
    if (state.route === "succession") return renderSuccession(roles);
    if (state.route === "heatmap") return renderHeatmap(roles, selectedRole);
    if (state.route === "profile") return renderProfile(selectedEmployee);
    if (state.route === "report") return renderReport(rows, quality, roles);
    return renderHome();
  }

  function renderHome() {
    return '<section class="hero card"><div><div class="tag">AI for HR Analysis</div><h2>上传员工数据后，系统自动理解字段、自动识别问题、自动生成人才与继任洞察。</h2><p>这不是后台配置工具，而是一个帮助 HR 学生在面试中展示 AI 使用能力、分析能力和组织诊断能力的作品。</p><div class="hero-actions"><button class="btn btn-primary" data-action="demo">体验 Demo</button><a class="btn btn-secondary" href="#overview">直接看分析结果</a></div></div><div class="hero-panel"><div class="mini-stat"><span>员工规模</span><strong>300</strong></div><div class="mini-stat"><span>自动识别字段</span><strong>26</strong></div><div class="mini-stat"><span>组织洞察</span><strong>6</strong></div></div></section>' +
      '<section class="grid-kpi"><article class="card kpi-card"><span>自动分析</span><strong>字段理解 + 清洗 + 评分</strong></article><article class="card kpi-card"><span>人才盘点</span><strong>九宫格 + 核心骨干 + 风险人群</strong></article><article class="card kpi-card"><span>高潜识别</span><strong>SHL 4 维解释</strong></article><article class="card kpi-card"><span>继任风险</span><strong>关键岗位 + 准备度分层</strong></article></section>' +
      '<section class="two-col"><article class="card"><div class="section-head"><h3>演示路径</h3><span>2-3 分钟讲完整个故事</span></div><div class="insight-grid"><div><strong>1. 进入 Demo</strong><p>系统自动理解数据并给出组织摘要。</p></div><div><strong>2. 看分析总览</strong><p>从公司级人才结构快速定位部门问题。</p></div><div><strong>3. 深入高潜与继任</strong><p>说明谁值得培养，哪些岗位最脆弱。</p></div><div><strong>4. 用报告页收口</strong><p>把关键发现整理成面试可复述结论。</p></div></div></article><article class="card"><div class="section-head"><h3>官方 Demo 预埋问题</h3><span>稳定跑出组织诊断</span></div><div class="list-panel"><div class="employee-row"><span>研发部</span><span>高潜多，但管理梯队断层</span></div><div class="employee-row"><span>销售部</span><span>绩效强，但高流动风险</span></div><div class="employee-row"><span>运营部</span><span>稳定但停滞</span></div><div class="employee-row"><span>产品部</span><span>关键岗位单点依赖</span></div><div class="employee-row"><span>HR / 财务 / IT</span><span>人数少但继任风险高</span></div></div></article></section>';
  }

  function renderOverview(rows, quality, roles) {
    var summary = summarizeDepartments(state.employees);
    var cards = [
      ["员工总数", state.employees.length],
      ["高潜 A 池", countBy(state.employees, function (row) { return row.shl.tier === "A"; })],
      ["Ready Now", countBy(state.employees, function (row) { return row.succession.band === "Ready Now"; })],
      ["高风险关键岗", countBy(state.employees, function (row) { return row.critical_role_flag === "Y" && row.successor_nomination_flag === "N"; })]
    ];
    return '<section class="grid-kpi">' + cards.map(function (card) {
      return '<article class="card kpi-card"><span>' + safe(card[0]) + '</span><strong>' + card[1] + '</strong></article>';
    }).join("") + '</section>' +
      '<section class="two-col"><article class="card"><div class="section-head"><h3>自动生成的组织问题摘要</h3><span>适合汇报和面试讲述</span></div><div class="list-panel">' + insightList().map(function (text) {
        return '<div class="employee-row"><span>Insight</span><span>' + safe(text) + '</span></div>';
      }).join("") + '</div></article><article class="card"><div class="section-head"><h3>系统自动处理摘要</h3><span>结果优先，不以流程为主角</span></div>' + bars([{ label: "自动修复", value: quality.auto.length, color: "var(--success)" }, { label: "需人工确认", value: quality.review.length, color: "var(--warning)" }, { label: "风险提醒", value: quality.risk.length, color: "var(--danger)" }]) + '</article></section>' +
      '<section class="two-col"><article class="card"><div class="section-head"><h3>部门差异</h3><span>高潜、Ready Now 与风险并看</span></div>' + departmentSummary(summary) + '</article><article class="card"><div class="section-head"><h3>关键岗位风险</h3><span>优先关注最脆弱岗位</span></div><table class="data-table"><thead><tr><th>岗位</th><th>最佳候选</th><th>准备度</th></tr></thead><tbody>' + roles.slice(0, 8).map(function (role) {
        return '<tr><td>' + safe(role.role) + '</td><td>' + safe(role.candidates[0] ? role.candidates[0].name : "待补位") + '</td><td>' + safe(role.candidates[0] ? role.candidates[0].succession.band : "Not Ready Yet") + '</td></tr>';
      }).join("") + '</tbody></table></article></section>' +
      '<section class="two-col"><article class="card"><div class="section-head"><h3>九宫格摘要</h3><span>绩效 x 潜力</span></div>' + nineboxMatrix(rows, true) + '</article><article class="card"><div class="section-head"><h3>高潜与继任概览</h3><span>结果页优先</span></div>' + bars([{ label: "高潜 A", value: countBy(rows, function (r) { return r.shl.tier === "A"; }), color: "var(--primary)" }, { label: "Ready Now", value: countBy(rows, function (r) { return r.succession.band === "Ready Now"; }), color: "var(--success)" }, { label: "高流动风险", value: countBy(rows, function (r) { return r.flight_risk === "High"; }), color: "var(--warning)" }]) + '</article></section>';
  }

  function renderQuality(quality) {
    var list = quality[state.qualityTab] || [];
    return '<section class="grid-kpi"><article class="card kpi-card"><span>自动修复</span><strong>' + quality.auto.length + '</strong></article><article class="card kpi-card"><span>需确认</span><strong>' + quality.review.length + '</strong></article><article class="card kpi-card"><span>风险提醒</span><strong>' + quality.risk.length + '</strong></article><article class="card kpi-card"><span>分析可信度</span><strong>高</strong></article></section>' +
      '<section class="card"><div class="section-head"><h3>数据质量说明</h3><span>系统自动理解数据，不阻断分析</span></div><div class="tabs"><button class="tab ' + (state.qualityTab === "auto" ? "active" : "") + '" data-tab="auto">自动修复</button><button class="tab ' + (state.qualityTab === "review" ? "active" : "") + '" data-tab="review">需确认</button><button class="tab ' + (state.qualityTab === "risk" ? "active" : "") + '" data-tab="risk">风险提醒</button></div><table class="data-table"><thead><tr><th>问题</th><th>员工</th><th>字段</th><th>说明</th></tr></thead><tbody>' + list.slice(0, 12).map(function (item) { return '<tr><td>' + safe(item.title) + '</td><td>' + safe(item.name) + '</td><td>' + safe(item.field) + '</td><td>' + safe(item.summary) + '</td></tr>'; }).join("") + '</tbody></table></section>';
  }

  function renderNinebox(rows) {
    return '<section class="card"><div class="section-head"><h3>部门筛选</h3><span>聚焦结果差异</span></div><div class="filter-row"><select class="filter-select" data-filter="department">' + departmentOptions().map(function (dept) { return '<option value="' + safe(dept) + '" ' + (state.department === dept ? "selected" : "") + '>' + safe(dept === "All" ? "全部部门" : dept) + '</option>'; }).join("") + '</select><a class="btn btn-secondary" href="#profile">查看选中人才画像</a></div></section>' +
      '<section class="ninebox-layout"><article class="card"><div class="section-head"><h3>九宫格</h3><span>系统自动完成人才分层</span></div>' + nineboxMatrix(rows, false) + '</article><aside class="card"><div class="section-head"><h3>重点人才</h3><span>适合面试时点名展开</span></div><div class="list-panel">' + rows.slice().sort(function (a, b) { return b.shl.score - a.shl.score; }).slice(0, 10).map(employeeButton).join("") + '</div></aside></section>';
  }

  function renderHiPo(rows, selectedEmployee) {
    var top = rows.slice().sort(function (a, b) { return b.shl.score - a.shl.score; }).slice(0, 12);
    var employee = findEmployee(state.employeeId) || top[0];
    var summary = summarizeDepartments(rows);
    return '<section class="two-col"><article class="card"><div class="section-head"><h3>高潜池名单</h3><span>谁值得重点培养，为什么</span></div><div class="list-panel">' + top.map(employeeButton).join("") + '</div></article><article class="card"><div class="section-head"><h3>高潜解释</h3><span>SHL 4 维</span></div>' + radar(employee) + '<div class="insight-grid"><div><strong>综合结论</strong><p>' + safe(hipoSummary(employee)) + '</p></div><div><strong>发展建议</strong><p>' + safe(developmentAdvice(employee)) + '</p></div></div></article></section>' +
      '<section class="card"><div class="section-head"><h3>部门高潜占比</h3><span>哪些团队更容易出未来人才</span></div>' + bars(Object.keys(summary).slice(0, 8).map(function (key) { return { label: key, value: summary[key].hipoA, color: "var(--primary)" }; })) + '</section>';
  }

  function renderSuccession(roles) {
    return '<section class="grid-kpi"><article class="card kpi-card"><span>Ready Now</span><strong>' + countBy(state.employees, function (row) { return row.succession.band === "Ready Now"; }) + '</strong></article><article class="card kpi-card"><span>1-2 Years</span><strong>' + countBy(state.employees, function (row) { return row.succession.band === "Ready in 1-2 Years"; }) + '</strong></article><article class="card kpi-card"><span>2-3 Years</span><strong>' + countBy(state.employees, function (row) { return row.succession.band === "Ready in 2-3 Years"; }) + '</strong></article><article class="card kpi-card"><span>单点依赖岗位</span><strong>' + roles.slice(0, 8).length + '</strong></article></section>' +
      '<section class="two-col"><article class="card"><div class="section-head"><h3>自动生成的继任建议</h3><span>组织诊断而不是堆指标</span></div><div class="list-panel"><div class="employee-row"><span>研发</span><span>高潜储备存在，但管理 Ready Now 明显不足，应加速一线经理培养。</span></div><div class="employee-row"><span>销售</span><span>当前业绩亮眼，但明星依赖较高，建议增加关键岗位双备份。</span></div><div class="employee-row"><span>产品</span><span>关键岗位集中，应优先补齐产品核心负责人后备名单。</span></div><div class="employee-row"><span>支持职能</span><span>HR / 财务 / IT 规模小但不可替代性高，需要提高继任可见度。</span></div></div></article><article class="card"><div class="section-head"><h3>准备度模型</h3><span>5 维综合判断</span></div>' + bars([{ label: "当前绩效", value: avg(state.employees, function (row) { return scorePerformance(row.performance_current) * 20; }), color: "var(--primary)" }, { label: "潜力水平", value: avg(state.employees, function (row) { return scorePotential(row.potential_level) * 18; }), color: "var(--success)" }, { label: "岗位匹配", value: avg(state.employees, function (row) { return fitScore(row) * 18; }), color: "#4a7cff" }, { label: "关键经验", value: avg(state.employees, function (row) { return experienceScore(row) * 18; }), color: "var(--warning)" }, { label: "发展准备", value: avg(state.employees, function (row) { return recommendationScore(row.manager_recommendation) * 18; }), color: "var(--danger)" }]) + '</article></section>' +
      '<section class="card"><div class="section-head"><h3>关键岗位候选梯队</h3><span>点击热力图继续讲</span></div><table class="data-table"><thead><tr><th>关键岗位</th><th>最佳候选</th><th>准备度</th><th>风险标签</th></tr></thead><tbody>' + roles.slice(0, 10).map(function (role) { var c = role.candidates[0]; return '<tr><td>' + safe(role.role) + '</td><td>' + safe(c ? c.name : "待补位") + '</td><td>' + safe(c ? c.succession.band : "Not Ready Yet") + '</td><td>' + safe(c && c.riskTags.length ? c.riskTags.join(" / ") : "需继续观察") + '</td></tr>'; }).join("") + '</tbody></table></section>';
  }

  function renderHeatmap(roles, selectedRole) {
    return '<section class="heatmap-layout"><article class="card"><div class="section-head"><h3>继任热力图</h3><span>颜色越深，准备度越高</span></div><div class="heatmap-grid">' + roles.slice(0, 12).map(function (role) { return heatCell(role, selectedRole); }).join("") + '</div><div class="legend-line"><span>浅色：后备薄弱</span><span>中度：1-2 年可承接</span><span>深色：Ready Now</span></div></article><aside class="card"><div class="section-head"><h3>风险解释</h3><span>' + safe(selectedRole ? selectedRole.role : "未选择岗位") + '</span></div><div class="list-panel">' + (selectedRole ? selectedRole.candidates.map(employeeButton).join("") : '<div class="empty-state">请选择一个关键岗位</div>') + '</div></aside></section>';
  }

  function renderProfile(employee) {
    if (!employee) return '<section class="card empty-state">暂无员工数据。</section>';
    return '<section class="profile-layout"><article class="card"><div class="section-head"><h3>基础信息</h3><span>' + safe(employee.name) + '</span></div><div class="profile-grid"><div><span>部门</span><strong>' + safe(employee.department) + '</strong></div><div><span>岗位</span><strong>' + safe(employee.position_title) + '</strong></div><div><span>职级</span><strong>' + safe(employee.job_level) + '</strong></div><div><span>城市</span><strong>' + safe(employee.city) + '</strong></div></div></article><article class="card"><div class="section-head"><h3>绩效 / 潜力 / 准备度</h3><span>单人解释</span></div><div class="profile-grid"><div><span>当前绩效</span><strong>' + safe(employee.performance_current) + '</strong></div><div><span>潜力等级</span><strong>' + safe(employee.potential_level || "待校准") + '</strong></div><div><span>SHL</span><strong>' + safe(employee.shl.tier + " / " + employee.shl.score) + '</strong></div><div><span>继任准备</span><strong>' + safe(employee.succession.band) + '</strong></div></div>' + bars([{ label: "学习敏捷度", value: employee.shl.learning, color: "var(--primary)" }, { label: "领导驱动力", value: employee.shl.leadership, color: "var(--success)" }, { label: "人际影响力", value: employee.shl.influence, color: "#4a7cff" }, { label: "战略思维", value: employee.shl.strategic, color: "var(--warning)" }]) + '</article></section>' +
      '<section class="two-col"><article class="card"><div class="section-head"><h3>AI 生成画像摘要</h3><span>可直接拿来讲</span></div><div class="insight-grid"><div><strong>人才结论</strong><p>' + safe(hipoSummary(employee)) + '</p></div><div><strong>培养建议</strong><p>' + safe(developmentAdvice(employee)) + '</p></div><div><strong>继任建议</strong><p>' + safe(successionSummary(employee)) + '</p></div><div><strong>风险提示</strong><p>' + safe(employee.riskTags.length ? employee.riskTags.join("，") : "当前未识别到明显风险标签。") + '</p></div></div></article><article class="card"><div class="section-head"><h3>切换员工</h3><span>从重点样本切入</span></div><div class="list-panel">' + state.employees.slice().sort(function (a, b) { return b.shl.score - a.shl.score; }).slice(0, 12).map(employeeButton).join("") + '</div></article></section>';
  }

  function renderReport(rows, quality, roles) {
    return '<section class="two-col"><article class="card"><div class="section-head"><h3>汇报摘要</h3><span>面试收口页</span></div><div class="insight-grid"><div><strong>数据概览</strong><p>共分析 ' + state.employees.length + ' 人，系统自动修复 ' + quality.auto.length + ' 类格式问题。</p></div><div><strong>关键发现</strong><p>' + safe(insightList()[0]) + '</p></div><div><strong>高潜摘要</strong><p>A 类高潜 ' + countBy(rows, function (r) { return r.shl.tier === "A"; }) + ' 人，重点集中在研发与销售。</p></div><div><strong>继任摘要</strong><p>关键岗位中存在 ' + countBy(state.employees, function (r) { return r.critical_role_flag === "Y" && r.successor_nomination_flag === "N"; }) + ' 个明显薄弱点。</p></div></div><div class="button-row"><button class="btn btn-primary" data-action="export">导出摘要</button><a class="btn btn-secondary" href="#overview">返回总览</a></div></article><article class="card"><div class="section-head"><h3>图表摘要</h3><span>适合展示页截图</span></div>' + bars([{ label: "自动修复", value: quality.auto.length, color: "var(--success)" }, { label: "高潜 A", value: countBy(rows, function (r) { return r.shl.tier === "A"; }), color: "var(--primary)" }, { label: "Ready Now", value: countBy(rows, function (r) { return r.succession.band === "Ready Now"; }), color: "var(--warning)" }, { label: "高风险关键岗", value: roles.slice(0, 8).length, color: "var(--danger)" }]) + '</article></section>';
  }

  function routeLabel() {
    for (var i = 0; i < routes.length; i += 1) if (routes[i].key === state.route) return routes[i].label;
    return "首页";
  }

  function render() {
    var rows = currentRows();
    var quality = detectQuality(state.raw, state.employees);
    var roles = getCriticalRoles(state.employees);
    var employee = findEmployee(state.employeeId) || rows[0] || state.employees[0] || null;
    var role = findRole(state.roleName, roles) || roles[0] || null;
    app.innerHTML = '<div class="shell"><aside class="sidebar"><div class="brand"><div class="brand-mark">TP</div><div><div class="brand-title">TalentPulse</div><div class="brand-sub">AI-driven talent review portfolio</div></div></div><nav class="nav">' + routes.map(function (item) { return '<a class="nav-item ' + (state.route === item.key ? "active" : "") + '" href="#' + item.key + '">' + item.label + '</a>'; }).join("") + '</nav><div class="sidebar-foot"><div class="small-label">Demo Company</div><div class="sidebar-company">NovaEdge Technologies</div></div></aside><section class="main"><header class="topbar"><div><div class="page-eyebrow">PC Web Portfolio Product</div><h1>' + routeLabel() + '</h1></div><div class="topbar-actions"><button class="btn btn-secondary" data-action="demo">体验 Demo</button><a class="btn btn-primary" href="#overview">查看自动分析</a></div></header><main class="content">' + renderPage(rows, quality, roles, employee, role) + '</main></section></div>';
    bindEvents(roles);
  }

  function bindEvents(roles) {
    var demoButton = document.querySelector('[data-action="demo"]');
    if (demoButton) demoButton.onclick = function () { state.route = "overview"; window.location.hash = "overview"; render(); };
    var exportButton = document.querySelector('[data-action="export"]');
    if (exportButton) exportButton.onclick = function () {
      var content = ["TalentPulse Report Summary", "Employees: " + state.employees.length, "HiPo A: " + countBy(state.employees, function (r) { return r.shl.tier === "A"; }), "Ready Now: " + countBy(state.employees, function (r) { return r.succession.band === "Ready Now"; })].join("\n");
      var blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var link = document.createElement("a");
      link.href = url;
      link.download = "talentpulse-report-summary.txt";
      link.click();
      URL.revokeObjectURL(url);
    };
    Array.prototype.slice.call(document.querySelectorAll("[data-employee]")).forEach(function (node) {
      node.onclick = function () { state.employeeId = node.getAttribute("data-employee"); state.route = "profile"; window.location.hash = "profile"; render(); };
    });
    Array.prototype.slice.call(document.querySelectorAll("[data-role]")).forEach(function (node) {
      node.onclick = function () { state.roleName = node.getAttribute("data-role"); render(); };
    });
    var department = document.querySelector('[data-filter="department"]');
    if (department) department.onchange = function () { state.department = department.value; render(); };
    Array.prototype.slice.call(document.querySelectorAll("[data-tab]")).forEach(function (node) {
      node.onclick = function () { state.qualityTab = node.getAttribute("data-tab"); render(); };
    });
  }

  function syncRoute() {
    var hash = String(window.location.hash || "").replace("#", "");
    var valid = routes.some(function (item) { return item.key === hash; });
    state.route = valid ? hash : "home";
    render();
  }

  function boot() {
    if (!app) return;
    if (!state.raw.length) {
      app.innerHTML = '<div class="card empty-state">未找到 Demo 数据。</div>';
      return;
    }
    state.employees = enrichEmployees(cleanEmployees(state.raw));
    state.employeeId = state.employees[0] ? state.employees[0].employee_id : "";
    state.roleName = getCriticalRoles(state.employees)[0] ? getCriticalRoles(state.employees)[0].role : "";
    window.addEventListener("hashchange", syncRoute);
    window.addEventListener("error", function (event) {
      app.innerHTML = '<div class="card empty-state"><h3>页面脚本出错</h3><p style="color:#6b7280">' + safe(event.message || "Unknown error") + '</p></div>';
    });
    syncRoute();
  }

  boot();
})();
