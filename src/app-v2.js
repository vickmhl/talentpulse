(function () {
  var app = document.getElementById("app");
  var demo = window.TALENTPULSE_DEMO || { employees: [], metadata: {} };

  var ROUTES = [
    { key: "home", label: "Home" },
    { key: "overview", label: "Overview" },
    { key: "review", label: "Talent Review" },
    { key: "succession", label: "Succession" },
    { key: "health", label: "Data Health" },
    { key: "report", label: "Report" }
  ];

  var FIELD_ALIASES = {
    employee_id: ["employeeid", "employee_id", "empid", "emp_id", "id", "gonghao", "工号"],
    name: ["name", "employee", "fullname", "xingming", "姓名"],
    gender: ["gender", "sex", "xingbie", "性别"],
    age: ["age", "nianling", "年龄"],
    department: ["department", "dept", "bumen", "部门"],
    sub_department: ["subdepartment", "sub_dept", "team", "子部门", "teamname"],
    position_title: ["position", "positiontitle", "title", "jobtitle", "岗位", "职位"],
    job_family: ["jobfamily", "function", "岗位族"],
    job_level: ["joblevel", "level", "grade", "职级"],
    manager_id: ["managerid", "manager", "leaderid", "直属上级"],
    tenure_years: ["tenure", "tenureyears", "yearsincompany", "司龄"],
    hire_date: ["hiredate", "startdate", "entrydate", "入职日期"],
    city: ["city", "location", "城市"],
    performance_current: ["performancecurrent", "performance", "currentperformance", "当前绩效"],
    performance_last_year: ["performancelastyear", "lastyearperformance", "去年绩效"],
    potential_level: ["potential", "potentiallevel", "潜力"],
    training_completion_rate: ["trainingcompletionrate", "trainingcompletion", "培训完成率"],
    promotion_count: ["promotioncount", "promotions", "晋升次数"],
    mobility_flag: ["mobilityflag", "mobility", "流动意愿"],
    critical_role_flag: ["criticalroleflag", "criticalrole", "关键岗位"],
    successor_nomination_flag: ["successornominationflag", "successornomination", "继任提名"],
    readiness_level: ["readinesslevel", "readiness", "准备度"],
    flight_risk: ["flightrisk", "attritionrisk", "离职风险"],
    manager_recommendation: ["managerrecommendation", "recommendation", "管理者推荐"],
    engagement_score: ["engagementscore", "engagement", "敬业度"],
    salary_band: ["salaryband", "band", "薪酬带"]
  };

  var DEPT_ALIAS = {
    "Engineering Center": "Engineering",
    "  Engineering  ": "Engineering",
    "Sales Team": "Sales",
    "Finance Legal": "Finance & Legal",
    "Operations Hub": "Operations"
  };

  var TITLE_ALIAS = {
    PM: "Product Manager",
    "Cust Success Specialist": "Customer Success Consultant"
  };

  var state = {
    route: "home",
    sourceName: "Official Demo",
    rawRows: demo.employees || [],
    employees: [],
    mappingMeta: null,
    quality: null,
    selectedDepartment: "All",
    selectedEmployeeId: "",
    selectedRoleName: "",
    uploadNote: "Try Demo is ready. You can also upload employee data in CSV or XLSX.",
    uploadMode: "demo"
  };

  function safe(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function normalizeKey(value) {
    return String(value || "").toLowerCase().replace(/[\s_\-\/()]/g, "");
  }

  function copy(obj) {
    var out = {};
    Object.keys(obj || {}).forEach(function (key) {
      out[key] = obj[key];
    });
    return out;
  }

  function pad(value) {
    value = String(value);
    return value.length === 1 ? "0" + value : value;
  }

  function normalizeDate(value) {
    if (!value) return "";
    var text = String(value).replace(/\./g, "-").replace(/\//g, "-").trim();
    var us = text.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (us) return us[3] + "-" + us[1] + "-" + us[2];
    var parts = text.split("-");
    if (parts.length === 3 && parts[0].length === 4) {
      return parts[0] + "-" + pad(parts[1]) + "-" + pad(parts[2]);
    }
    return text;
  }

  function scorePerformance(value) {
    return { A: 5, "B+": 4, B: 3, C: 2 }[value] || 2;
  }

  function scorePotential(value) {
    return { High: 5, Medium: 3, Low: 2 }[value] || 1;
  }

  function scoreRecommendation(value) {
    if (value === "Strongly Recommend") return 4.8;
    if (value === "Recommend") return 4.1;
    if (value === "Observe") return 3.1;
    return 2.2;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Math.round(value)));
  }

  function autoMapRows(rows) {
    if (!rows.length) return { rows: [], matchedFields: [], lowConfidenceFields: [], unmappedHeaders: [] };
    var headers = Object.keys(rows[0]);
    var headerMap = {};
    var matched = [];
    var lowConfidence = [];
    headers.forEach(function (header) {
      var normalized = normalizeKey(header);
      Object.keys(FIELD_ALIASES).forEach(function (canonical) {
        if (headerMap[canonical]) return;
        if (FIELD_ALIASES[canonical].indexOf(normalized) >= 0) {
          headerMap[canonical] = header;
          matched.push({ canonical: canonical, source: header, confidence: "high" });
        }
      });
    });

    Object.keys(FIELD_ALIASES).forEach(function (canonical) {
      if (headerMap[canonical]) return;
      headers.forEach(function (header) {
        if (headerMap[canonical]) return;
        var normalized = normalizeKey(header);
        if (normalized.indexOf(canonical.replace(/_/g, "")) >= 0) {
          headerMap[canonical] = header;
          matched.push({ canonical: canonical, source: header, confidence: "medium" });
          lowConfidence.push(canonical);
        }
      });
    });

    var mappedRows = rows.map(function (row) {
      var mapped = {};
      Object.keys(FIELD_ALIASES).forEach(function (canonical) {
        if (headerMap[canonical]) mapped[canonical] = row[headerMap[canonical]];
      });
      return mapped;
    });

    return {
      rows: mappedRows,
      matchedFields: matched,
      lowConfidenceFields: lowConfidence,
      unmappedHeaders: headers.filter(function (header) {
        return !matched.some(function (item) { return item.source === header; });
      })
    };
  }

  function cleanAndEnrich(rows) {
    var seen = {};
    return rows.map(function (row) {
      var item = copy(row);
      item.department = DEPT_ALIAS[String(item.department || "").trim()] || String(item.department || "").trim();
      item.position_title = TITLE_ALIAS[String(item.position_title || "").trim()] || String(item.position_title || "").trim();
      item.name = String(item.name || "").trim();
      item.hire_date = normalizeDate(item.hire_date);
      item.age = Number(item.age || 0);
      item.tenure_years = Number(item.tenure_years || 0);
      item.training_completion_rate = Number(item.training_completion_rate || 0);
      item.promotion_count = Number(item.promotion_count || 0);
      item.engagement_score = Number(item.engagement_score || 0);
      item.employee_id = String(item.employee_id || "MISSING");
      item.performance_current = item.performance_current || "B";
      item.performance_last_year = item.performance_last_year || item.performance_current;
      item.potential_level = item.potential_level || "";
      return item;
    }).filter(function (item) {
      var key = item.name + "|" + item.hire_date + "|" + item.department;
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    }).map(function (item) {
      var learning = clamp(item.training_completion_rate * 0.38 + item.promotion_count * 15 + (item.mobility_flag === "Y" ? 10 : 0) + scorePotential(item.potential_level) * 7, 35, 95);
      var leadership = clamp(scorePerformance(item.performance_current) * 14 + scoreRecommendation(item.manager_recommendation) * 5 + (item.critical_role_flag === "Y" ? 10 : 0), 30, 96);
      var influence = clamp(item.engagement_score * 0.72 + (item.manager_recommendation === "Strongly Recommend" ? 10 : item.manager_recommendation === "Recommend" ? 6 : 2), 35, 94);
      var strategic = clamp(scorePerformance(item.performance_current) * 11 + scorePerformance(item.performance_last_year) * 7 + (item.job_level === "D1" ? 18 : item.job_level === "M2" ? 14 : item.job_level === "M1" ? 10 : 4), 30, 95);
      var shlScore = Math.round((learning + leadership + influence + strategic) / 4);
      var shlTier = shlScore >= 80 ? "A" : shlScore >= 68 ? "B" : "C";
      var successionScore = Math.round(scorePerformance(item.performance_current) * 13 + scorePotential(item.potential_level) * 11 + fitScore(item) * 16 + experienceScore(item) * 15 + scoreRecommendation(item.manager_recommendation) * 14);
      var successionBand = successionScore >= 76 ? "Ready Now" : successionScore >= 63 ? "Ready in 1-2 Years" : successionScore >= 50 ? "Ready in 2-3 Years" : "Not Ready Yet";
      item.shl = { learning: learning, leadership: leadership, influence: influence, strategic: strategic, score: shlScore, tier: shlTier };
      item.succession = { score: successionScore, band: successionBand };
      item.ninebox = { x: item.performance_current === "A" ? 3 : item.performance_current === "B+" ? 2 : 1, y: item.potential_level === "High" ? 3 : item.potential_level === "Medium" ? 2 : 1 };
      item.riskTags = buildRiskTags(item, shlTier, successionBand);
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

  function buildRiskTags(item, shlTier, successionBand) {
    var tags = [];
    if (item.flight_risk === "High") tags.push("High flight risk");
    if (item.critical_role_flag === "Y" && item.successor_nomination_flag === "N") tags.push("No successor nominated");
    if (!item.potential_level) tags.push("Potential needs calibration");
    if (shlTier === "A" && successionBand !== "Ready Now") tags.push("HiPo conversion gap");
    return tags;
  }

  function detectQuality(rawRows, cleanedRows, mappingMeta) {
    var quality = { autoFixed: [], caution: [], risk: [] };
    var managerSet = {};
    var idCount = {};
    cleanedRows.forEach(function (row) { managerSet[row.employee_id] = true; });
    rawRows.forEach(function (row, index) {
      var line = index + 2;
      var dept = String(row.department || row.Department || "");
      var title = String(row.position_title || row.Position || "");
      var date = String(row.hire_date || row["Hire Date"] || "");
      var employeeId = String(row.employee_id || row.Employee_ID || row.id || "");
      idCount[employeeId] = (idCount[employeeId] || 0) + 1;
      if (dept !== dept.trim()) quality.autoFixed.push(issue("Trimmed extra spaces", line, employeeId, "department", "The system normalized department text spacing."));
      if (/[./]/.test(date)) quality.autoFixed.push(issue("Standardized date formats", line, employeeId, "hire_date", "Mixed date formats were normalized to YYYY-MM-DD."));
      if (dept === "Engineering Center" || dept === "Sales Team" || dept === "Finance Legal" || dept === "Operations Hub") quality.caution.push(issue("Department alias normalized", line, employeeId, "department", "A department alias was mapped to the standard taxonomy."));
      if (title === "PM" || title === "Cust Success Specialist") quality.caution.push(issue("Role alias normalized", line, employeeId, "position_title", "A role alias was mapped to the standard role library."));
      if (!(row.potential_level || row.Potential || row["Potential Level"])) quality.caution.push(issue("Missing potential input", line, employeeId, "potential_level", "Potential was missing and may weaken high-potential precision."));
      if (Number(row.age || row.Age || 0) < 20 || Number(row.age || row.Age || 0) > 60) quality.caution.push(issue("Age outlier detected", line, employeeId, "age", "One or more records fall outside the expected employee age range."));
    });
    cleanedRows.forEach(function (row) {
      if (row.manager_id && row.manager_id !== "CEO-0001" && !managerSet[row.manager_id]) quality.risk.push(issue("Unknown manager reference", "-", row.employee_id, "manager_id", "Manager reference does not resolve in the employee list."));
      if (row.readiness_level === "Ready Now" && (row.performance_current === "C" || row.potential_level === "Low")) quality.risk.push(issue("Readiness conflicts with talent signal", "-", row.employee_id, "readiness_level", "Ready Now conflicts with current performance or potential signal."));
      if (row.manager_recommendation === "Strongly Recommend" && row.performance_current === "C") quality.risk.push(issue("Manager recommendation conflict", "-", row.employee_id, "manager_recommendation", "Manager recommendation is materially stronger than performance evidence."));
      if (row.critical_role_flag === "Y" && row.successor_nomination_flag === "N") quality.risk.push(issue("Critical role has no successor", "-", row.employee_id, "successor_nomination_flag", "A critical role is currently uncovered by the succession slate."));
    });
    Object.keys(idCount).forEach(function (id) {
      if (id && idCount[id] > 1) {
        quality.autoFixed.push(issue("Removed duplicate employee records", "-", id, "employee_id", "Duplicate records were de-duplicated in the analytical view."));
      }
    });
    quality.confidence = buildConfidence(quality, mappingMeta);
    return quality;
  }

  function issue(title, row, employeeId, field, detail) {
    return { title: title, row: row, employeeId: employeeId || "-", field: field, detail: detail };
  }

  function buildConfidence(quality, mappingMeta) {
    var score = 88;
    score -= quality.caution.length > 10 ? 10 : quality.caution.length;
    score -= quality.risk.length > 8 ? 18 : quality.risk.length * 2;
    score -= mappingMeta.lowConfidenceFields.length * 3;
    score = Math.max(45, Math.min(96, score));
    return { score: score, label: score >= 82 ? "High" : score >= 68 ? "Medium" : "Low" };
  }

  function summarizeDepartments(rows) {
    var map = {};
    rows.forEach(function (row) {
      if (!map[row.department]) map[row.department] = { count: 0, hipoA: 0, readyNow: 0, readySoon: 0, highRisk: 0, uncoveredRoles: 0, avgShl: 0 };
      var item = map[row.department];
      item.count += 1;
      item.avgShl += row.shl.score;
      if (row.shl.tier === "A") item.hipoA += 1;
      if (row.succession.band === "Ready Now") item.readyNow += 1;
      if (row.succession.band === "Ready in 1-2 Years") item.readySoon += 1;
      if (row.flight_risk === "High") item.highRisk += 1;
      if (row.critical_role_flag === "Y" && row.successor_nomination_flag === "N") item.uncoveredRoles += 1;
    });
    Object.keys(map).forEach(function (key) {
      map[key].avgShl = Math.round(map[key].avgShl / map[key].count);
    });
    return map;
  }

  function executiveSummary(rows) {
    var summary = summarizeDepartments(rows);
    var issues = [
      { title: "R&D growth is outpacing leadership readiness", detail: "High-potential density is strong in Engineering, but ready-now leadership cover remains thin." },
      { title: "Sales strength is masking a fragile bench", detail: "Performance is concentrated in a few top contributors while flight risk remains elevated." },
      { title: "Product succession exposure is concentrated", detail: "Critical product roles are too dependent on a small number of leaders." },
      { title: "Support functions carry hidden key-role risk", detail: "HR, Finance and IT are small teams with low visibility but high replacement cost." }
    ];
    var riskLevel = countBy(rows, function (row) { return row.critical_role_flag === "Y" && row.successor_nomination_flag === "N"; }) > 15 ? "High" : "Medium";
    return {
      headline: "The organization has future talent, but succession readiness is uneven and concentrated.",
      state: "HiPo density is healthy in growth functions, while bench coverage for key roles remains fragile.",
      riskLevel: riskLevel,
      priority: "Validate successors for top critical roles, retain high-risk top performers, and accelerate emerging managers.",
      issues: issues,
      summary: summary
    };
  }

  function predictSignals(rows) {
    return [
      "Succession gaps may widen in Product and support functions over the next 6-12 months.",
      "Sales vacancy exposure may rise if retention risk remains unmanaged among top contributors.",
      "R&D high-potential conversion may stall without targeted manager development.",
      "Department health divergence may expand if Operations and Customer Success stay under-invested in future talent."
    ];
  }

  function actionPlan() {
    return {
      now: [
        "Validate successor slates for the top uncovered critical roles.",
        "Run retention conversations for high-risk high performers in Sales and Engineering."
      ],
      soon: [
        "Launch targeted development plans for emerging managers in R&D.",
        "Recalibrate potential assessment quality in Customer Success and Operations."
      ],
      later: [
        "Reduce single-point dependency in Product leadership.",
        "Build a visible cross-functional bench for HR, Finance and IT roles."
      ]
    };
  }

  function currentRows() {
    return state.selectedDepartment === "All" ? state.employees.slice() : state.employees.filter(function (row) { return row.department === state.selectedDepartment; });
  }

  function findEmployee(id) {
    for (var i = 0; i < state.employees.length; i += 1) if (state.employees[i].employee_id === id) return state.employees[i];
    return null;
  }

  function findRole(name, roles) {
    for (var i = 0; i < roles.length; i += 1) if (roles[i].role === name) return roles[i];
    return null;
  }

  function getCriticalRoles(rows) {
    var roleMap = {};
    rows.forEach(function (row) {
      if (row.critical_role_flag !== "Y") return;
      var key = row.department + " / " + row.position_title;
      if (!roleMap[key]) roleMap[key] = [];
      roleMap[key].push(row);
    });
    return Object.keys(roleMap).map(function (key) {
      roleMap[key].sort(function (a, b) { return b.succession.score - a.succession.score; });
      return { role: key, department: roleMap[key][0].department, candidates: roleMap[key].slice(0, 4) };
    }).sort(function (a, b) {
      return (a.candidates[0] ? a.candidates[0].succession.score : 0) - (b.candidates[0] ? b.candidates[0].succession.score : 0);
    });
  }

  function renderBars(items) {
    var max = 1;
    items.forEach(function (item) { max = Math.max(max, item.value); });
    return '<div class="bars">' + items.map(function (item) {
      return '<div class="bar-row"><span>' + safe(item.label) + '</span><div class="bar-track"><div class="bar-fill" style="width:' + ((item.value / max) * 100) + '%; background:' + item.color + '"></div></div><strong>' + item.value + '</strong></div>';
    }).join("") + '</div>';
  }

  function renderHome() {
    return '<section class="hero hero-v2 card home-hero"><div class="hero-copy"><div class="tag">AI Workforce Diagnosis</div><h2>Turn employee data into a report-ready organizational story.</h2><p>TalentPulse is built for interview demonstration. It auto-detects employee data, surfaces talent and succession issues, explains why they exist, predicts exposure, and turns findings into presentation-ready actions.</p><div class="hero-actions"><button class="btn btn-primary" data-action="try-demo">Try Demo</button><label class="btn btn-secondary upload-inline">Upload Employee Data<input id="upload-input" type="file" accept=".csv,.xlsx" hidden></label></div><div class="hero-note">' + safe(state.uploadNote) + '</div><div class="hero-proof"><div><span>Primary use case</span><strong>Portfolio demonstration</strong></div><div><span>Best path</span><strong>Overview -> Talent Review -> Succession -> Report</strong></div></div></div><div class="preview-board"><div class="preview-board-head"><span>Demo Preview</span><strong>NovaEdge Technologies</strong></div><div class="preview-summary"><div class="preview-score"><span>Organization risk</span><strong>High</strong></div><div class="preview-score"><span>Current priority</span><strong>Validate successors for exposed roles</strong></div></div><div class="preview-metrics"><div><span>HiPo A</span><strong>58</strong></div><div><span>Ready Now</span><strong>37</strong></div><div><span>Critical gaps</span><strong>18</strong></div></div><div class="preview-findings"><div class="preview-finding"><strong>R&D growth is outpacing leadership readiness</strong><span>Strong future talent, weak ready-now bench.</span></div><div class="preview-finding"><strong>Sales strength is masking a fragile bench</strong><span>Results are strong, but star dependency and flight risk remain high.</span></div><div class="preview-finding"><strong>Product succession exposure is concentrated</strong><span>Too much key-role dependency sits with too few leaders.</span></div></div></div></section>' +
      '<section class="grid-kpi home-value-grid"><article class="card value-card"><span>Auto-detect employee data</span><strong>Map fields and normalize HR language automatically.</strong></article><article class="card value-card"><span>Surface talent and succession issues</span><strong>Find bench gaps, star dependency, and hidden exposure.</strong></article><article class="card value-card"><span>Explain why the problem exists</span><strong>Translate metrics into organizational diagnosis.</strong></article><article class="card value-card"><span>Generate report-ready recommendations</span><strong>Convert analysis into clear executive actions.</strong></article></section>' +
      '<section class="section-grid-2"><article class="card"><div class="section-head"><h3>Demo company story</h3><span>Built to be explained in 2-3 minutes</span></div><div class="story-grid"><div><strong>Company</strong><p>NovaEdge Technologies is a 300-person software company built to surface realistic organization issues.</p></div><div><strong>Why this demo matters</strong><p>The data is intentionally structured to make AI diagnosis visible, not just chart generation.</p></div><div><strong>Best storytelling angle</strong><p>Move from current state to cause, then to risk, then to actions and report output.</p></div><div><strong>Interview proof</strong><p>Shows AI usage, analysis ability, and organization diagnosis in one flow.</p></div></div></article><article class="card"><div class="section-head"><h3>Demo issue map</h3><span>Stable organizational stories</span></div><div class="issue-chip-grid"><span class="tag warning">R&D: high-potential, weak bench</span><span class="tag warning">Sales: strong results, high flight risk</span><span class="tag warning">Operations: stable, stagnant</span><span class="tag warning">Product: single-point dependency</span><span class="tag warning">Customer Success: under-identified HiPos</span><span class="tag warning">HR / Finance / IT: low visibility, high risk</span></div></article></section>' +
      '<section class="card"><div class="section-head"><h3>How the experience flows</h3><span>Describe -> Explain -> Predict -> Control -> Report</span></div><div class="workflow-strip workflow-strip-v2"><div><span>Entry</span><strong>Try Demo or upload employee data</strong></div><div><span>Describe</span><strong>Surface current talent structure and exposure</strong></div><div><span>Explain</span><strong>Translate signals into organization diagnosis</strong></div><div><span>Predict</span><strong>Show what may happen next if nothing changes</strong></div><div><span>Control</span><strong>Turn issues into time-phased actions</strong></div><div><span>Report</span><strong>Package everything into a presentation-ready output</strong></div></div></section>';
  }

  function renderOverview(rows) {
    var summary = executiveSummary(state.employees);
    var actions = actionPlan();
    var roles = getCriticalRoles(state.employees);
    return '<section class="executive-summary card"><div class="executive-main"><div class="tag">Executive Summary</div><h2>' + safe(summary.headline) + '</h2><p>' + safe(summary.state) + '</p><div class="summary-kpis"><div><span>Current state</span><strong>Future talent exists, but bench coverage is uneven.</strong></div><div><span>Risk level</span><strong>' + summary.riskLevel + '</strong></div><div><span>Current priority</span><strong>' + safe(summary.priority) + '</strong></div></div></div><div class="executive-side">' + summary.issues.slice(0, 4).map(function (item) { return '<div class="summary-point"><strong>' + safe(item.title) + '</strong><span>' + safe(item.detail) + '</span></div>'; }).join("") + '</div></section>' +
      '<section class="section-grid-2"><article class="card"><div class="section-head"><h3>Describe</h3><span>What is happening now</span></div>' + renderBars([{ label: "HiPo A", value: countBy(rows, function (row) { return row.shl.tier === "A"; }), color: "var(--primary)" }, { label: "Ready Now", value: countBy(rows, function (row) { return row.succession.band === "Ready Now"; }), color: "var(--success)" }, { label: "Ready Soon", value: countBy(rows, function (row) { return row.succession.band === "Ready in 1-2 Years"; }), color: "#4a7cff" }, { label: "Uncovered critical roles", value: countBy(rows, function (row) { return row.critical_role_flag === "Y" && row.successor_nomination_flag === "N"; }), color: "var(--danger)" }]) + '</article><article class="card"><div class="section-head"><h3>Department contrast</h3><span>Where the structure is diverging</span></div><div class="dept-strip">' + Object.keys(summary.summary).slice(0, 8).map(function (key) { var item = summary.summary[key]; return '<div class="dept-card"><span>' + safe(key) + '</span><div class="mini-bar"><div style="width:' + item.avgShl + '%"></div></div><strong>' + item.avgShl + '</strong><small>HiPo ' + item.hipoA + ' / Ready Now ' + item.readyNow + ' / Risk ' + item.uncoveredRoles + '</small></div>'; }).join("") + '</div></article></section>' +
      '<section class="section-grid-3"><article class="card insight-card"><div class="section-head"><h3>Explain</h3><span>Why it is happening</span></div>' + summary.issues.map(function (item) { return '<div class="insight-line"><strong>' + safe(item.title) + '</strong><p>' + safe(item.detail) + '</p></div>'; }).join("") + '</article><article class="card insight-card"><div class="section-head"><h3>Predict</h3><span>6-12 month risk outlook</span></div>' + predictSignals(rows).map(function (text) { return '<div class="insight-line"><strong>Forward risk</strong><p>' + safe(text) + '</p></div>'; }).join("") + '</article><article class="card insight-card"><div class="section-head"><h3>Control</h3><span>What to do now</span></div><div class="time-list"><div><strong>0-3 months</strong><p>' + safe(actions.now.join(" ")) + '</p></div><div><strong>3-6 months</strong><p>' + safe(actions.soon.join(" ")) + '</p></div><div><strong>6-12 months</strong><p>' + safe(actions.later.join(" ")) + '</p></div></div></article></section>' +
      '<section class="section-grid-2"><article class="card"><div class="section-head"><h3>If no action is taken</h3><span>What may happen next</span></div><div class="priority-card"><strong>Bench fragility will become more visible.</strong><p>Uncovered critical roles are likely to stay exposed, while successor validation remains incomplete.</p></div><div class="priority-card"><strong>Star dependency may intensify.</strong><p>Sales and Product risk will rise further if key contributors leave without redundant coverage.</p></div></article><article class="card"><div class="section-head"><h3>What leaders should do first</h3><span>Immediate control moves</span></div><div class="priority-card"><strong>1. Confirm top successors</strong><p>Validate readiness for the most exposed critical roles before capacity pressure rises.</p></div><div class="priority-card"><strong>2. Protect top performers at flight risk</strong><p>Use retention conversations and stretch opportunities to reduce exposure.</p></div><div class="priority-card"><strong>3. Accelerate manager pipelines</strong><p>Move emerging leaders from high-potential status into practical readiness.</p></div></article></section>' +
      '<section class="grid-kpi drill-grid"><a class="card quick-link" href="#review">Go to Talent Review</a><a class="card quick-link" href="#succession">Go to Succession</a><a class="card quick-link" href="#health">Go to Data Health</a><a class="card quick-link" href="#report">Go to Report</a></section>' +
      '<section class="card"><div class="section-head"><h3>Most fragile key roles</h3><span>Best used as final proof in interviews</span></div><table class="data-table"><thead><tr><th>Critical role</th><th>Best candidate</th><th>Readiness</th><th>Signal</th></tr></thead><tbody>' + roles.slice(0, 8).map(function (role) { var c = role.candidates[0]; return '<tr><td>' + safe(role.role) + '</td><td>' + safe(c ? c.name : "Open gap") + '</td><td>' + safe(c ? c.succession.band : "Not Ready Yet") + '</td><td>' + safe(c && c.riskTags.length ? c.riskTags.join(", ") : "Needs validation") + '</td></tr>'; }).join("") + '</tbody></table></section>';
  }

  function renderTalentReview(rows) {
    var departments = summarizeDepartments(rows);
    var highPerfNotSuccessors = rows.filter(function (row) { return scorePerformance(row.performance_current) >= 4 && row.succession.band !== "Ready Now"; }).slice(0, 8);
    var selected = findEmployee(state.selectedEmployeeId) || rows.slice().sort(function (a, b) { return b.shl.score - a.shl.score; })[0];
    return '<section class="two-col"><article class="card"><div class="section-head"><h3>Talent density view</h3><span>Nine-box and department concentration</span></div>' + renderBars([{ label: "Top-right nine-box", value: countBy(rows, function (row) { return row.ninebox.x === 3 && row.ninebox.y === 3; }), color: "var(--primary)" }, { label: "HiPo A", value: countBy(rows, function (row) { return row.shl.tier === "A"; }), color: "var(--success)" }, { label: "High performers not ready", value: highPerfNotSuccessors.length, color: "var(--warning)" }]) + '</article><article class="card"><div class="section-head"><h3>Selected talent narrative</h3><span>Who to talk about in interviews</span></div><div class="insight-line"><strong>' + safe(selected ? selected.name : "No employee selected") + '</strong><p>' + safe(selected ? hipoSummary(selected) : "") + '</p></div><div class="insight-line"><strong>Why this person matters</strong><p>' + safe(selected ? developmentAdvice(selected) : "") + '</p></div><div class="insight-line"><strong>Succession angle</strong><p>' + safe(selected ? successionSummary(selected) : "") + '</p></div></article></section>' +
      '<section class="card"><div class="section-head"><h3>Department comparison</h3><span>Which teams are stronger or weaker by talent depth</span></div>' + renderBars(Object.keys(departments).slice(0, 8).map(function (key) { return { label: key, value: departments[key].hipoA + departments[key].readyNow, color: "var(--primary)" }; })) + '</section>' +
      '<section class="card"><div class="section-head"><h3>High performers who are not successor-ready</h3><span>Strong delivery does not always equal successor fit</span></div><table class="data-table"><thead><tr><th>Name</th><th>Department</th><th>Performance</th><th>Readiness</th></tr></thead><tbody>' + highPerfNotSuccessors.map(function (row) { return '<tr><td><button class="link-btn" data-employee="' + safe(row.employee_id) + '">' + safe(row.name) + '</button></td><td>' + safe(row.department) + '</td><td>' + safe(row.performance_current) + '</td><td>' + safe(row.succession.band) + '</td></tr>'; }).join("") + '</tbody></table></section>';
  }

  function renderSuccession(rows) {
    var roles = getCriticalRoles(rows);
    var selectedRole = findRole(state.selectedRoleName, roles) || roles[0];
    return '<section class="grid-kpi"><article class="card kpi-card"><span>Critical role coverage</span><strong>' + countBy(rows, function (row) { return row.critical_role_flag === "Y" && row.successor_nomination_flag === "Y"; }) + '</strong></article><article class="card kpi-card"><span>Ready Now</span><strong>' + countBy(rows, function (row) { return row.succession.band === "Ready Now"; }) + '</strong></article><article class="card kpi-card"><span>Ready Soon</span><strong>' + countBy(rows, function (row) { return row.succession.band === "Ready in 1-2 Years"; }) + '</strong></article><article class="card kpi-card"><span>No bench</span><strong>' + countBy(rows, function (row) { return row.critical_role_flag === "Y" && row.successor_nomination_flag === "N"; }) + '</strong></article></section>' +
      '<section class="two-col"><article class="card"><div class="section-head"><h3>Succession risk summary</h3><span>Who can step in and who cannot</span></div><div class="insight-line"><strong>Product and support functions carry the highest exposure.</strong><p>Coverage is narrow and too dependent on a few leaders.</p></div><div class="insight-line"><strong>Sales needs retention and redundancy at the same time.</strong><p>Bench risk is amplified by star dependency and flight risk.</p></div><div class="insight-line"><strong>Engineering needs manager conversion, not just more HiPos.</strong><p>The biggest risk is not talent scarcity, but leadership readiness.</p></div></article><article class="card"><div class="section-head"><h3>Role heatmap</h3><span>Click a role to inspect candidates</span></div><div class="heatmap-grid">' + roles.slice(0, 9).map(function (role) { var score = role.candidates[0] ? role.candidates[0].succession.score : 30; var alpha = Math.max(0.18, Math.min(0.88, score / 100)); return '<button class="heat-cell ' + (selectedRole && selectedRole.role === role.role ? 'active' : '') + '" data-role="' + safe(role.role) + '" style="background: rgba(47,107,255,' + alpha + ')"><strong>' + safe(role.department) + '</strong><span>' + safe(role.role.split(" / ")[1] || role.role) + '</span><em>' + safe(role.candidates[0] ? role.candidates[0].succession.band : "Open gap") + '</em></button>'; }).join("") + '</div></article></section>' +
      '<section class="two-col"><article class="card"><div class="section-head"><h3>Selected role detail</h3><span>' + safe(selectedRole ? selectedRole.role : "No role selected") + '</span></div><div class="list-panel">' + (selectedRole ? selectedRole.candidates.map(function (row) { return '<div class="employee-row"><span>' + safe(row.name) + '</span><span>' + safe(row.succession.band + " / " + row.succession.score) + '</span></div>'; }).join("") : '<div class="empty-state">No role selected.</div>') + '</div></article><article class="card"><div class="section-head"><h3>Control recommendation</h3><span>What to do with this exposure</span></div><div class="insight-line"><strong>Immediate move</strong><p>' + safe(selectedRole && selectedRole.candidates[0] && selectedRole.candidates[0].succession.band === "Ready Now" ? "Validate the top candidate and confirm successor readiness." : "Build a named slate and close the role with accelerated development.") + '</p></div><div class="insight-line"><strong>What to monitor</strong><p>Track vacancy exposure, retention risk, and whether successor coverage is overly dependent on one person.</p></div></article></section>' +
      '<section class="card"><div class="section-head"><h3>Uncovered or fragile roles</h3><span>Single-point dependency and no-backup exposure</span></div><table class="data-table"><thead><tr><th>Critical role</th><th>Best candidate</th><th>Readiness</th><th>Next move</th></tr></thead><tbody>' + roles.slice(0, 10).map(function (role) { var c = role.candidates[0]; return '<tr><td>' + safe(role.role) + '</td><td>' + safe(c ? c.name : "No named candidate") + '</td><td>' + safe(c ? c.succession.band : "Open gap") + '</td><td>' + safe(c && c.succession.band === "Ready Now" ? "Validate immediately" : "Build targeted bench") + '</td></tr>'; }).join("") + '</tbody></table></section>';
  }

  function renderHealth() {
    var quality = state.quality;
    return '<section class="two-col"><article class="card"><div class="section-head"><h3>What the system auto-understood</h3><span>Auto-detection before manual mapping</span></div><div class="insight-grid"><div><strong>Matched fields</strong><p>' + state.mappingMeta.matchedFields.length + ' fields were auto-recognized.</p></div><div><strong>Low confidence fields</strong><p>' + (state.mappingMeta.lowConfidenceFields.length || 0) + ' fields may need confirmation.</p></div><div><strong>Unmapped headers</strong><p>' + (state.mappingMeta.unmappedHeaders.length || 0) + ' source fields were ignored.</p></div><div><strong>Current recommendation</strong><p>' + (quality.confidence.label === "High" ? "Safe to continue using current analysis." : "Proceed with caution and review flagged fields.") + '</p></div></div></article><article class="card"><div class="section-head"><h3>Analysis confidence</h3><span>How trustworthy is the current output</span></div><div class="confidence-score"><strong>' + quality.confidence.score + '</strong><span>' + quality.confidence.label + ' confidence</span></div>' + renderBars([{ label: "Auto-fixed", value: quality.autoFixed.length, color: "var(--success)" }, { label: "Needs caution", value: quality.caution.length, color: "var(--warning)" }, { label: "Material risk", value: quality.risk.length, color: "var(--danger)" }]) + '</article></section>' +
      '<section class="section-grid-3"><article class="card"><div class="section-head"><h3>Auto-fixed</h3><span>System handled these automatically</span></div><div class="issue-list">' + quality.autoFixed.slice(0, 8).map(function (item) { return '<div class="insight-line"><strong>' + safe(item.title) + '</strong><p>' + safe(item.detail) + '</p></div>'; }).join("") + '</div></article><article class="card"><div class="section-head"><h3>Caution</h3><span>Interpret with care</span></div><div class="issue-list">' + quality.caution.slice(0, 8).map(function (item) { return '<div class="insight-line"><strong>' + safe(item.title) + '</strong><p>' + safe(item.detail) + '</p></div>'; }).join("") + '</div></article><article class="card"><div class="section-head"><h3>Material risk</h3><span>May alter decision quality</span></div><div class="issue-list">' + quality.risk.slice(0, 8).map(function (item) { return '<div class="insight-line"><strong>' + safe(item.title) + '</strong><p>' + safe(item.detail) + '</p></div>'; }).join("") + '</div></article></section>';
  }

  function renderReport(rows) {
    var summary = executiveSummary(rows);
    var actions = actionPlan();
    return '<section class="report-hero card"><div class="tag">Report-ready Output</div><h2>Current State -> Why It Is Happening -> What May Happen Next -> What To Do Now -> Priority Actions</h2><p>This page is designed to be presented directly in an interview or stakeholder review.</p><div class="button-row"><button class="btn btn-primary" data-action="download-report">Download Summary</button><a class="btn btn-secondary" href="#overview">Back to Overview</a></div></section>' +
      '<section class="executive-summary card"><div class="executive-main"><div class="tag">Executive Summary</div><h2>' + safe(summary.headline) + '</h2><p>' + safe(summary.priority) + '</p><div class="summary-kpis"><div><span>Risk level</span><strong>' + summary.riskLevel + '</strong></div><div><span>Priority actions</span><strong>Validate, retain, and accelerate.</strong></div></div></div><div class="executive-side">' + summary.issues.slice(0, 3).map(function (item) { return '<div class="summary-point"><strong>' + safe(item.title) + '</strong><span>' + safe(item.detail) + '</span></div>'; }).join("") + '</div></section>' +
      '<section class="section-grid-3"><article class="card"><div class="section-head"><h3>Current State</h3><span>What is happening now</span></div><p>' + safe(summary.state) + '</p></article><article class="card"><div class="section-head"><h3>Why It Is Happening</h3><span>Root cause summary</span></div><p>' + safe(summary.issues[0].detail) + " " + safe(summary.issues[1].detail) + '</p></article><article class="card"><div class="section-head"><h3>What May Happen Next</h3><span>Risk outlook</span></div><p>' + safe(predictSignals(rows)[0]) + " " + safe(predictSignals(rows)[1]) + '</p></article></section>' +
      '<section class="section-grid-2"><article class="card"><div class="section-head"><h3>What To Do Now</h3><span>Immediate control moves</span></div><div class="priority-card"><strong>Validate successors for the most exposed roles.</strong><p>Do not wait for vacancy events to confirm successor readiness.</p></div><div class="priority-card"><strong>Protect high-risk top performers.</strong><p>Use retention and stretch assignments where flight risk and bench risk overlap.</p></div><div class="priority-card"><strong>Move emerging leaders into visible development tracks.</strong><p>Focus first on R&D and Product management pipelines.</p></div></article><article class="card"><div class="section-head"><h3>Priority Actions</h3><span>Time-phased control plan</span></div><div class="time-list"><div><strong>0-3 months</strong><p>' + safe(actions.now.join(" ")) + '</p></div><div><strong>3-6 months</strong><p>' + safe(actions.soon.join(" ")) + '</p></div><div><strong>6-12 months</strong><p>' + safe(actions.later.join(" ")) + '</p></div></div></article></section>' +
      '<section class="card"><div class="section-head"><h3>Priority issues</h3><span>3-5 issues with signal, risk and action</span></div>' + summary.issues.map(function (item, idx) { return '<div class="priority-card"><strong>' + (idx + 1) + ". " + safe(item.title) + '</strong><p><b>Signal:</b> ' + safe(item.detail) + '</p><p><b>Risk:</b> ' + safe(predictSignals(rows)[idx] || predictSignals(rows)[0]) + '</p><p><b>Action:</b> ' + safe((idx < 2 ? actions.now[0] : idx === 2 ? actions.soon[0] : actions.later[0])) + '</p></div>'; }).join("") + '</section>';
  }

  function renderShell() {
    var rows = currentRows();
    return '<div class="shell"><aside class="sidebar"><div class="brand"><div class="brand-mark">TP</div><div><div class="brand-title">TalentPulse</div><div class="brand-sub">AI organization diagnosis portfolio</div></div></div><nav class="nav">' + ROUTES.map(function (route) { return '<a class="nav-item ' + (state.route === route.key ? "active" : "") + '" href="#' + route.key + '">' + route.label + '</a>'; }).join("") + '</nav><div class="sidebar-foot"><div class="small-label">Data source</div><div class="sidebar-company">' + safe(state.sourceName) + '</div></div></aside><section class="main"><header class="topbar"><div><div class="page-eyebrow">Describe -> Explain -> Predict -> Control -> Report</div><h1>' + safe(ROUTES.find(function (route) { return route.key === state.route; }).label) + '</h1></div><div class="topbar-actions"><button class="btn btn-secondary" data-action="try-demo">Try Demo</button><label class="btn btn-primary upload-inline">Upload Employee Data<input id="upload-input-top" type="file" accept=".csv,.xlsx" hidden></label></div></header><main class="content">' + (state.route === "home" ? renderHome() : state.route === "overview" ? renderOverview(rows) : state.route === "review" ? renderTalentReview(rows) : state.route === "succession" ? renderSuccession(rows) : state.route === "health" ? renderHealth() : renderReport(rows)) + '</main></section></div>';
  }

  function render() {
    app.innerHTML = renderShell();
    bindEvents();
  }

  function bindEvents() {
    Array.prototype.slice.call(document.querySelectorAll('[data-action="try-demo"]')).forEach(function (node) {
      node.onclick = function () {
        state.sourceName = "Official Demo";
        state.uploadMode = "demo";
        state.rawRows = demo.employees || [];
        state.mappingMeta = autoMapRows(state.rawRows);
        state.employees = cleanAndEnrich(state.mappingMeta.rows);
        state.quality = detectQuality(state.rawRows, state.employees, state.mappingMeta);
        state.route = "overview";
        window.location.hash = "overview";
        render();
      };
    });
    Array.prototype.slice.call(document.querySelectorAll("#upload-input, #upload-input-top")).forEach(function (input) {
      input.onchange = function (event) { handleFile(event.target.files && event.target.files[0]); };
    });
    Array.prototype.slice.call(document.querySelectorAll("[data-employee]")).forEach(function (node) {
      node.onclick = function () { state.selectedEmployeeId = node.getAttribute("data-employee"); render(); };
    });
    Array.prototype.slice.call(document.querySelectorAll("[data-role]")).forEach(function (node) {
      node.onclick = function () { state.selectedRoleName = node.getAttribute("data-role"); render(); };
    });
    var reportButton = document.querySelector('[data-action="download-report"]');
    if (reportButton) reportButton.onclick = downloadReport;
  }

  function handleFile(file) {
    if (!file) return;
    if (/\.csv$/i.test(file.name)) {
      file.text().then(function (text) {
        useUploadedRows(parseCsv(text), file.name);
      });
      return;
    }
    if (/\.xlsx$/i.test(file.name) && window.XLSX) {
      var reader = new FileReader();
      reader.onload = function (event) {
        var workbook = window.XLSX.read(event.target.result, { type: "array" });
        var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        var rows = window.XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
        useUploadedRows(rows, file.name);
      };
      reader.readAsArrayBuffer(file);
      return;
    }
    state.uploadNote = /\.xlsx$/i.test(file.name) ? "XLSX parsing needs the hosted version to load the spreadsheet parser. CSV works immediately." : "Unsupported file type. Please upload CSV or XLSX.";
    render();
  }

  function parseCsv(text) {
    var lines = text.trim().split(/\r?\n/);
    if (!lines.length) return [];
    var headers = lines[0].split(",").map(function (item) { return item.trim(); });
    return lines.slice(1).map(function (line) {
      var values = line.split(",");
      var row = {};
      headers.forEach(function (header, index) { row[header] = values[index] ? values[index].trim() : ""; });
      return row;
    });
  }

  function useUploadedRows(rows, filename) {
    state.sourceName = filename;
    state.uploadMode = "upload";
    state.rawRows = rows;
    state.mappingMeta = autoMapRows(rows);
    state.employees = cleanAndEnrich(state.mappingMeta.rows);
    state.quality = detectQuality(rows, state.employees, state.mappingMeta);
    state.uploadNote = "Uploaded data was auto-detected and routed directly into diagnosis. Manual mapping is only used as fallback.";
    state.route = "overview";
    window.location.hash = "overview";
    render();
  }

  function downloadReport() {
    var summary = executiveSummary(state.employees);
    var actions = actionPlan();
    var content = [
      "TalentPulse Executive Report",
      "",
      "Current State",
      summary.state,
      "",
      "Priority Issues",
      summary.issues.map(function (item) { return "- " + item.title + ": " + item.detail; }).join("\n"),
      "",
      "What May Happen Next",
      predictSignals(state.employees).map(function (item) { return "- " + item; }).join("\n"),
      "",
      "Priority Actions",
      "- 0-3 months: " + actions.now.join(" "),
      "- 3-6 months: " + actions.soon.join(" "),
      "- 6-12 months: " + actions.later.join(" ")
    ].join("\n");
    var blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "talentpulse-executive-report.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  function syncRoute() {
    var hash = String(window.location.hash || "").replace("#", "");
    state.route = ROUTES.some(function (route) { return route.key === hash; }) ? hash : "home";
    render();
  }

  function boot() {
    state.mappingMeta = autoMapRows(state.rawRows);
    state.employees = cleanAndEnrich(state.mappingMeta.rows);
    state.quality = detectQuality(state.rawRows, state.employees, state.mappingMeta);
    window.addEventListener("hashchange", syncRoute);
    window.addEventListener("error", function (event) {
      app.innerHTML = '<div class="card empty-state"><h3>Runtime error</h3><p style="color:#6b7280">' + safe(event.message || "Unknown error") + '</p></div>';
    });
    syncRoute();
  }

  boot();
})();
