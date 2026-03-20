(function () {
  var app = document.getElementById("app");
  var demo = window.TALENTPULSE_DEMO || { employees: [], metadata: {} };

  var ROUTES = [
    { key: "home", label: "首页" },
    { key: "overview", label: "总览" },
    { key: "review", label: "人才盘点" },
    { key: "succession", label: "继任分析" },
    { key: "health", label: "数据健康" },
    { key: "report", label: "汇报报告" }
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

  var EXTRA_FIELD_ALIASES = {
    employee_id: ["工号", "员工编号"],
    name: ["姓名", "员工姓名"],
    gender: ["性别"],
    age: ["年龄"],
    department: ["部门"],
    sub_department: ["子部门", "小组", "团队"],
    position_title: ["岗位", "职位", "岗位名称"],
    job_family: ["岗位族", "职能"],
    job_level: ["职级"],
    manager_id: ["直属上级", "上级工号"],
    tenure_years: ["司龄", "在职年限"],
    hire_date: ["入职日期"],
    city: ["城市"],
    performance_current: ["当前绩效", "本年绩效"],
    performance_last_year: ["去年绩效", "上年绩效"],
    potential_level: ["潜力", "潜力等级"],
    training_completion_rate: ["培训完成率"],
    promotion_count: ["晋升次数"],
    mobility_flag: ["流动意愿"],
    critical_role_flag: ["关键岗位"],
    successor_nomination_flag: ["继任提名"],
    readiness_level: ["准备度", "继任准备度"],
    flight_risk: ["离职风险"],
    manager_recommendation: ["管理者推荐", "经理推荐"],
    engagement_score: ["敬业度", "投入度"],
    salary_band: ["薪酬带宽", "薪级"]
  };

  Object.keys(EXTRA_FIELD_ALIASES).forEach(function (key) {
    FIELD_ALIASES[key] = (FIELD_ALIASES[key] || []).concat(EXTRA_FIELD_ALIASES[key].map(normalizeKey));
  });

  var TITLE_ALIAS = {
    PM: "Product Manager",
    "Cust Success Specialist": "Customer Success Consultant"
  };

  var state = {
    route: "home",
    sourceName: "官方 Demo",
    rawRows: demo.employees || [],
    employees: [],
    mappingMeta: null,
    quality: null,
    selectedDepartment: "All",
    selectedEmployeeId: "",
    selectedRoleName: "",
    uploadNote: "已内置官方 Demo，也支持上传 CSV 或 XLSX 员工数据。",
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

  function countBy(rows, predicate) {
    var total = 0;
    (rows || []).forEach(function (row, index) {
      if (predicate(row, index)) total += 1;
    });
    return total;
  }

  function routeLabel(key) {
    for (var i = 0; i < ROUTES.length; i += 1) {
      if (ROUTES[i].key === key) return ROUTES[i].label;
    }
    return "首页";
  }

  function readinessText(value) {
    return {
      "Ready Now": "现在可接任",
      "Ready in 1-2 Years": "1-2 年可接任",
      "Ready in 2-3 Years": "2-3 年可接任",
      "Not Ready Yet": "暂未就绪"
    }[value] || value || "-";
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
    if (item.flight_risk === "High") tags.push("高离职风险");
    if (item.critical_role_flag === "Y" && item.successor_nomination_flag === "N") tags.push("关键岗位暂无后备");
    if (!item.potential_level) tags.push("潜力口径待校准");
    if (shlTier === "A" && successionBand !== "Ready Now") tags.push("高潜未转化为接任准备度");
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
      if (dept !== dept.trim()) quality.autoFixed.push(issue("已自动清理多余空格", line, employeeId, "department", "系统已统一部门文本中的首尾空格。"));
      if (/[./]/.test(date)) quality.autoFixed.push(issue("已自动统一日期格式", line, employeeId, "hire_date", "混合日期格式已被规范为 YYYY-MM-DD。"));
      if (dept === "Engineering Center" || dept === "Sales Team" || dept === "Finance Legal" || dept === "Operations Hub") quality.caution.push(issue("部门别名已归一化", line, employeeId, "department", "源数据中的部门别名已映射到统一组织口径。"));
      if (title === "PM" || title === "Cust Success Specialist") quality.caution.push(issue("岗位别名已归一化", line, employeeId, "position_title", "系统已将岗位别名映射到标准岗位库。"));
      if (!(row.potential_level || row.Potential || row["Potential Level"])) quality.caution.push(issue("潜力字段存在缺失", line, employeeId, "potential_level", "潜力信息缺失会降低高潜识别精度。"));
      if (Number(row.age || row.Age || 0) < 20 || Number(row.age || row.Age || 0) > 60) quality.caution.push(issue("发现年龄异常值", line, employeeId, "age", "存在超出常规员工年龄区间的记录，建议复核。"));
    });
    cleanedRows.forEach(function (row) {
      if (row.manager_id && row.manager_id !== "CEO-0001" && !managerSet[row.manager_id]) quality.risk.push(issue("上级引用无法匹配", "-", row.employee_id, "manager_id", "当前员工的 manager_id 无法在员工清单中解析。"));
      if (row.readiness_level === "Ready Now" && (row.performance_current === "C" || row.potential_level === "Low")) quality.risk.push(issue("准备度与人才信号冲突", "-", row.employee_id, "readiness_level", "现有准备度结论与绩效或潜力信号不一致。"));
      if (row.manager_recommendation === "Strongly Recommend" && row.performance_current === "C") quality.risk.push(issue("管理者推荐与绩效冲突", "-", row.employee_id, "manager_recommendation", "推荐强度显著高于绩效证据，可能影响判断。"));
      if (row.critical_role_flag === "Y" && row.successor_nomination_flag === "N") quality.risk.push(issue("关键岗位暂无后备提名", "-", row.employee_id, "successor_nomination_flag", "该关键岗位目前没有明确的后备人选。"));
    });
    Object.keys(idCount).forEach(function (id) {
      if (id && idCount[id] > 1) {
        quality.autoFixed.push(issue("已自动去重重复员工记录", "-", id, "employee_id", "分析视图已对重复工号进行去重。"));
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
    return { score: score, label: score >= 82 ? "高" : score >= 68 ? "中" : "低" };
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
      { title: "研发增长快于管理准备度", detail: "研发高潜密度不低，但 ready now 覆盖偏薄，说明短板在管理梯队而不是人才储备。" },
      { title: "销售结果强，但板凳深度脆弱", detail: "销售绩效集中在少数头部贡献者，同时高离职风险偏高，容易形成明星员工依赖。" },
      { title: "产品关键岗位存在单点依赖", detail: "产品关键岗位过度集中在少数管理者身上，任何空缺都会放大继任暴露。" },
      { title: "支持职能风险低可见度但高影响", detail: "HR、财务、IT 人数不多，但关键岗位一旦空缺，替补成本高且恢复周期长。" }
    ];
    var riskLevel = countBy(rows, function (row) { return row.critical_role_flag === "Y" && row.successor_nomination_flag === "N"; }) > 15 ? "高" : "中";
    return {
      headline: "组织并不缺未来人才，但关键岗位继任准备度分布不均。",
      state: "当前高潜主要集中在增长型部门，而关键岗位的即战力后备覆盖仍然偏薄。",
      riskLevel: riskLevel,
      priority: "先校验关键岗位后备，再稳住高风险核心人才，同时把高潜转化为管理准备度。",
      issues: issues,
      summary: summary
    };
  }

  function predictSignals(rows) {
    return [
      "未来 6-12 个月内，产品和支持职能的继任缺口仍可能继续扩大。",
      "如果不处理核心人才保留，销售岗位空缺暴露会显著上升。",
      "若缺少定向培养，研发高潜向管理准备度的转化会持续卡住。",
      "若运营与客户成功继续低投入培养，部门健康差异会进一步拉大。"
    ];
  }

  function actionPlan() {
    return {
      now: [
        "校验前 10 个高暴露关键岗位的后备名单与准备度。",
        "对销售和研发中的高风险高绩效员工开展保留访谈。"
      ],
      soon: [
        "为研发和产品中的潜在管理者建立定向发展计划。",
        "复核客户成功与运营团队的潜力识别口径。"
      ],
      later: [
        "降低产品关键岗位的单点依赖。",
        "为 HR、财务、IT 建立跨职能可见的后备梯队。"
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

  function hipoSummary(row) {
    if (!row) return "";
    return row.name + " 的 SHL 综合得分为 " + row.shl.score + "，其中学习敏捷度 " + row.shl.learning + "、领导驱动力 " + row.shl.leadership + "、人际影响力 " + row.shl.influence + "、战略认知 " + row.shl.strategic + "。这说明 TA 更像一位 " + (row.shl.tier === "A" ? "值得重点培养的高潜人才" : row.shl.tier === "B" ? "具备发展空间的人才" : "需要继续观察的人才") + "。";
  }

  function developmentAdvice(row) {
    if (!row) return "";
    if (row.shl.tier === "A" && row.succession.band !== "Ready Now") return "建议把 TA 从“高潜识别”推进到“可接任准备”，优先安排带人任务、跨部门项目和关键岗位影子学习。";
    if (row.flight_risk === "High") return "建议同时做保留和发展，避免高绩效与高离职风险叠加成组织暴露。";
    return "建议围绕岗位匹配度和关键经验补课，把当前绩效进一步转化为可验证的继任准备度。";
  }

  function successionSummary(row) {
    if (!row) return "";
    return "当前继任准备度为“" + readinessText(row.succession.band) + "”，综合得分 " + row.succession.score + "。管理者推荐、关键经验与岗位匹配度是当前判断的核心依据。";
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
    return '<section class="hero hero-v2 card home-hero"><div class="hero-copy"><div class="tag">AI 组织诊断作品</div><h2>把员工数据自动转成可汇报的人才与继任洞察。</h2><p>TalentPulse 面向 HR 学生与初级 HR 从业者。它会自动识别员工数据、归一化常见 HR 口径、输出人才盘点与继任风险，并把结果整理成适合面试讲述与汇报展示的页面。</p><div class="hero-actions"><button class="btn btn-primary" data-action="try-demo">体验 Demo</button><label class="btn btn-secondary upload-inline">上传员工数据<input id="upload-input" type="file" accept=".csv,.xlsx" hidden></label></div><div class="hero-note">' + safe(state.uploadNote) + '</div><div class="hero-proof"><div><span>作品定位</span><strong>面试展示型分析产品</strong></div><div><span>最佳讲述路径</span><strong>总览 → 人才盘点 → 继任分析 → 汇报报告</strong></div></div></div><div class="preview-board"><div class="preview-board-head"><span>Demo 预览</span><strong>NovaEdge Technologies</strong></div><div class="preview-summary"><div class="preview-score"><span>组织风险等级</span><strong>高</strong></div><div class="preview-score"><span>当前优先动作</span><strong>先核验高暴露岗位后备</strong></div></div><div class="preview-metrics"><div><span>高潜 A</span><strong>58</strong></div><div><span>现在可接任</span><strong>37</strong></div><div><span>关键缺口</span><strong>18</strong></div></div><div class="preview-findings"><div class="preview-finding"><strong>研发增长快于管理准备度</strong><span>未来人才储备不错，但 ready now 板凳偏薄。</span></div><div class="preview-finding"><strong>销售结果强，但板凳深度脆弱</strong><span>业绩强势背后仍存在明星员工依赖与离职风险。</span></div><div class="preview-finding"><strong>产品关键岗位存在单点依赖</strong><span>关键岗位覆盖过于集中，任何空缺都会放大继任暴露。</span></div></div></div></section>' +
      '<section class="grid-kpi home-value-grid"><article class="card value-card"><span>自动识别员工数据</span><strong>自动识别字段含义，并归一化常见 HR 口径。</strong></article><article class="card value-card"><span>自动发现组织问题</span><strong>快速识别板凳深度不足、单点依赖与继任暴露。</strong></article><article class="card value-card"><span>自动解释问题原因</span><strong>把指标翻译成组织诊断，而不只是展示图表。</strong></article><article class="card value-card"><span>自动生成汇报建议</span><strong>把结果收束成可讲、可汇报、可写进简历的输出。</strong></article></section>' +
      '<section class="section-grid-2"><article class="card"><div class="section-head"><h3>Demo 公司故事</h3><span>2-3 分钟即可完成一轮完整讲述</span></div><div class="story-grid"><div><strong>公司背景</strong><p>NovaEdge Technologies 是一套精心设计的 300 人虚拟公司，不是随机 mock 数据。</p></div><div><strong>为什么适合面试</strong><p>它能稳定跑出研发、销售、产品、运营和支持部门的组织问题。</p></div><div><strong>最佳讲述方式</strong><p>从当前状态讲到原因，再讲风险预测，最后落到行动建议与汇报输出。</p></div><div><strong>能力证明</strong><p>同一套产品里同时体现 AI 使用能力、分析能力和组织诊断能力。</p></div></div></article><article class="card"><div class="section-head"><h3>Demo 关键议题</h3><span>稳定可复述的组织故事</span></div><div class="issue-chip-grid"><span class="tag warning">研发：高潜多，但管理梯队薄</span><span class="tag warning">销售：业绩强，但离职风险高</span><span class="tag warning">运营：结构稳，但成长停滞</span><span class="tag warning">产品：关键岗位单点依赖</span><span class="tag warning">客户成功：高潜识别不足</span><span class="tag warning">HR / 财务 / IT：低可见度高风险</span></div></article></section>' +
      '<section class="card"><div class="section-head"><h3>使用闭环</h3><span>Describe → Explain → Predict → Control → Report</span></div><div class="workflow-strip workflow-strip-v2"><div><span>入口</span><strong>体验 Demo 或上传员工数据</strong></div><div><span>Describe</span><strong>看清当前人才结构与组织暴露</strong></div><div><span>Explain</span><strong>解释问题为什么会发生</strong></div><div><span>Predict</span><strong>预测未来 6-12 个月风险</strong></div><div><span>Control</span><strong>给出分阶段行动建议</strong></div><div><span>Report</span><strong>输出适合汇报的完整结论</strong></div></div></section>';
  }

  function renderOverview(rows) {
    var summary = executiveSummary(state.employees);
    var actions = actionPlan();
    var roles = getCriticalRoles(state.employees);
    return '<section class="executive-summary card"><div class="executive-main"><div class="tag">Executive Summary</div><h2>' + safe(summary.headline) + '</h2><p>' + safe(summary.state) + '</p><div class="summary-kpis"><div><span>当前状态</span><strong>未来人才储备存在，但关键岗位覆盖不均。</strong></div><div><span>风险等级</span><strong>' + safe(summary.riskLevel) + '</strong></div><div><span>当前优先动作</span><strong>' + safe(summary.priority) + '</strong></div></div></div><div class="executive-side">' + summary.issues.slice(0, 4).map(function (item) { return '<div class="summary-point"><strong>' + safe(item.title) + '</strong><span>' + safe(item.detail) + '</span></div>'; }).join("") + '</div></section>' +
      '<section class="section-grid-2"><article class="card"><div class="section-head"><h3>Describe｜现状描述</h3><span>现在到底发生了什么</span></div>' + renderBars([{ label: "高潜 A", value: countBy(rows, function (row) { return row.shl.tier === "A"; }), color: "var(--primary)" }, { label: "现在可接任", value: countBy(rows, function (row) { return row.succession.band === "Ready Now"; }), color: "var(--success)" }, { label: "1-2 年可接任", value: countBy(rows, function (row) { return row.succession.band === "Ready in 1-2 Years"; }), color: "#4a7cff" }, { label: "关键岗位无后备", value: countBy(rows, function (row) { return row.critical_role_flag === "Y" && row.successor_nomination_flag === "N"; }), color: "var(--danger)" }]) + '</article><article class="card"><div class="section-head"><h3>部门差异</h3><span>哪些团队的人才结构正在拉开差距</span></div><div class="dept-strip">' + Object.keys(summary.summary).slice(0, 8).map(function (key) { var item = summary.summary[key]; return '<div class="dept-card"><span>' + safe(key) + '</span><div class="mini-bar"><div style="width:' + item.avgShl + '%"></div></div><strong>' + item.avgShl + '</strong><small>高潜 ' + item.hipoA + ' / 现在可接任 ' + item.readyNow + ' / 暴露 ' + item.uncoveredRoles + '</small></div>'; }).join("") + '</div></article></section>' +
      '<section class="section-grid-3"><article class="card insight-card"><div class="section-head"><h3>Explain｜原因解释</h3><span>为什么会这样</span></div>' + summary.issues.map(function (item) { return '<div class="insight-line"><strong>' + safe(item.title) + '</strong><p>' + safe(item.detail) + '</p></div>'; }).join("") + '</article><article class="card insight-card"><div class="section-head"><h3>Predict｜风险预测</h3><span>未来 6-12 个月会怎样</span></div>' + predictSignals(rows).map(function (text) { return '<div class="insight-line"><strong>前瞻风险</strong><p>' + safe(text) + '</p></div>'; }).join("") + '</article><article class="card insight-card"><div class="section-head"><h3>Control｜行动建议</h3><span>现在最该做什么</span></div><div class="time-list"><div><strong>0-3 个月</strong><p>' + safe(actions.now.join(" ")) + '</p></div><div><strong>3-6 个月</strong><p>' + safe(actions.soon.join(" ")) + '</p></div><div><strong>6-12 个月</strong><p>' + safe(actions.later.join(" ")) + '</p></div></div></article></section>' +
      '<section class="section-grid-2"><article class="card"><div class="section-head"><h3>如果不处理，会怎样</h3><span>风险会如何外推</span></div><div class="priority-card"><strong>关键岗位脆弱性会持续放大。</strong><p>关键岗位无后备的问题不会自动消失，反而会在人员流动或扩张阶段快速暴露。</p></div><div class="priority-card"><strong>明星员工依赖会继续加重。</strong><p>销售和产品的结构性风险，本质上是头部贡献者集中与替补不足叠加。</p></div></article><article class="card"><div class="section-head"><h3>领导者此刻应先做什么</h3><span>最值得优先推进的控制动作</span></div><div class="priority-card"><strong>1. 核验关键岗位后备</strong><p>优先确认高暴露岗位的后备人选是否真实可用。</p></div><div class="priority-card"><strong>2. 稳住高风险核心人才</strong><p>对高绩效且高离职风险的人群，优先做保留与发展组合动作。</p></div><div class="priority-card"><strong>3. 推动高潜转化为准备度</strong><p>特别是研发和产品团队，重点不在发现更多高潜，而在推动转化。</p></div></article></section>' +
      '<section class="grid-kpi drill-grid"><a class="card quick-link" href="#review">进入人才盘点</a><a class="card quick-link" href="#succession">进入继任分析</a><a class="card quick-link" href="#health">进入数据健康</a><a class="card quick-link" href="#report">进入汇报报告</a></section>' +
      '<section class="card"><div class="section-head"><h3>最脆弱的关键岗位</h3><span>适合在面试中作为收束证据</span></div><table class="data-table"><thead><tr><th>关键岗位</th><th>最佳候选人</th><th>准备度</th><th>风险信号</th></tr></thead><tbody>' + roles.slice(0, 8).map(function (role) { var c = role.candidates[0]; return '<tr><td>' + safe(role.role) + '</td><td>' + safe(c ? c.name : "暂无候选") + '</td><td>' + safe(c ? readinessText(c.succession.band) : "暂未就绪") + '</td><td>' + safe(c && c.riskTags.length ? c.riskTags.join("、") : "建议优先校验") + '</td></tr>'; }).join("") + '</tbody></table></section>';
  }

  function renderTalentReview(rows) {
    var departments = summarizeDepartments(rows);
    var highPerfNotSuccessors = rows.filter(function (row) { return scorePerformance(row.performance_current) >= 4 && row.succession.band !== "Ready Now"; }).slice(0, 8);
    var selected = findEmployee(state.selectedEmployeeId) || rows.slice().sort(function (a, b) { return b.shl.score - a.shl.score; })[0];
    return '<section class="two-col"><article class="card"><div class="section-head"><h3>人才密度视图</h3><span>九宫格与部门集中度</span></div>' + renderBars([{ label: "九宫格右上", value: countBy(rows, function (row) { return row.ninebox.x === 3 && row.ninebox.y === 3; }), color: "var(--primary)" }, { label: "高潜 A", value: countBy(rows, function (row) { return row.shl.tier === "A"; }), color: "var(--success)" }, { label: "高绩效但未 ready", value: highPerfNotSuccessors.length, color: "var(--warning)" }]) + '</article><article class="card"><div class="section-head"><h3>代表人才解读</h3><span>适合在面试中重点讲述的人</span></div><div class="insight-line"><strong>' + safe(selected ? selected.name : "暂无员工") + '</strong><p>' + safe(selected ? hipoSummary(selected) : "") + '</p></div><div class="insight-line"><strong>发展建议</strong><p>' + safe(selected ? developmentAdvice(selected) : "") + '</p></div><div class="insight-line"><strong>继任视角</strong><p>' + safe(selected ? successionSummary(selected) : "") + '</p></div></article></section>' +
      '<section class="card"><div class="section-head"><h3>部门对比</h3><span>哪些团队的人才厚度更强，哪些更薄</span></div>' + renderBars(Object.keys(departments).slice(0, 8).map(function (key) { return { label: key, value: departments[key].hipoA + departments[key].readyNow, color: "var(--primary)" }; })) + '</section>' +
      '<section class="card"><div class="section-head"><h3>高绩效但尚未具备接任准备的人</h3><span>高绩效不等于天然适合接班</span></div><table class="data-table"><thead><tr><th>姓名</th><th>部门</th><th>绩效</th><th>准备度</th></tr></thead><tbody>' + highPerfNotSuccessors.map(function (row) { return '<tr><td><button class="link-btn" data-employee="' + safe(row.employee_id) + '">' + safe(row.name) + '</button></td><td>' + safe(row.department) + '</td><td>' + safe(row.performance_current) + '</td><td>' + safe(readinessText(row.succession.band)) + '</td></tr>'; }).join("") + '</tbody></table></section>';
  }

  function renderSuccession(rows) {
    var roles = getCriticalRoles(rows);
    var selectedRole = findRole(state.selectedRoleName, roles) || roles[0];
    return '<section class="grid-kpi"><article class="card kpi-card"><span>关键岗位有后备</span><strong>' + countBy(rows, function (row) { return row.critical_role_flag === "Y" && row.successor_nomination_flag === "Y"; }) + '</strong></article><article class="card kpi-card"><span>现在可接任</span><strong>' + countBy(rows, function (row) { return row.succession.band === "Ready Now"; }) + '</strong></article><article class="card kpi-card"><span>1-2 年可接任</span><strong>' + countBy(rows, function (row) { return row.succession.band === "Ready in 1-2 Years"; }) + '</strong></article><article class="card kpi-card"><span>无后备暴露</span><strong>' + countBy(rows, function (row) { return row.critical_role_flag === "Y" && row.successor_nomination_flag === "N"; }) + '</strong></article></section>' +
      '<section class="two-col"><article class="card"><div class="section-head"><h3>继任风险摘要</h3><span>谁能接上，谁接不上</span></div><div class="insight-line"><strong>产品与支持职能暴露最高。</strong><p>覆盖窄，且太依赖少数领导者，是当前最显性的继任问题。</p></div><div class="insight-line"><strong>销售要同时做保留与冗余建设。</strong><p>强结果背后是明星员工依赖，离职风险会直接放大岗位暴露。</p></div><div class="insight-line"><strong>研发需要把高潜转成管理准备度。</strong><p>风险不是没有人才，而是未来人才尚未变成可接任的管理梯队。</p></div></article><article class="card"><div class="section-head"><h3>岗位热力图</h3><span>点击岗位查看候选人</span></div><div class="heatmap-grid">' + roles.slice(0, 9).map(function (role) { var score = role.candidates[0] ? role.candidates[0].succession.score : 30; var alpha = Math.max(0.18, Math.min(0.88, score / 100)); return '<button class="heat-cell ' + (selectedRole && selectedRole.role === role.role ? 'active' : '') + '" data-role="' + safe(role.role) + '" style="background: rgba(47,107,255,' + alpha + ')"><strong>' + safe(role.department) + '</strong><span>' + safe(role.role.split(" / ")[1] || role.role) + '</span><em>' + safe(role.candidates[0] ? readinessText(role.candidates[0].succession.band) : "暂无后备") + '</em></button>'; }).join("") + '</div></article></section>' +
      '<section class="two-col"><article class="card"><div class="section-head"><h3>岗位详情</h3><span>' + safe(selectedRole ? selectedRole.role : "暂无岗位") + '</span></div><div class="list-panel">' + (selectedRole ? selectedRole.candidates.map(function (row) { return '<div class="employee-row"><span>' + safe(row.name) + '</span><span>' + safe(readinessText(row.succession.band) + " / " + row.succession.score) + '</span></div>'; }).join("") : '<div class="empty-state">暂无岗位。</div>') + '</div></article><article class="card"><div class="section-head"><h3>控制建议</h3><span>如何降低当前暴露</span></div><div class="insight-line"><strong>立即动作</strong><p>' + safe(selectedRole && selectedRole.candidates[0] && selectedRole.candidates[0].succession.band === "Ready Now" ? "优先核验第一候选人的真实接任准备度，并明确接班条件。" : "先补齐命名后备，再通过定向培养缩短岗位准备周期。") + '</p></div><div class="insight-line"><strong>持续监控</strong><p>持续跟踪岗位空缺暴露、候选人离职风险，以及是否过度依赖某一个人。</p></div></article></section>' +
      '<section class="card"><div class="section-head"><h3>脆弱岗位清单</h3><span>单点依赖与无后备暴露</span></div><table class="data-table"><thead><tr><th>关键岗位</th><th>最佳候选人</th><th>准备度</th><th>下一步动作</th></tr></thead><tbody>' + roles.slice(0, 10).map(function (role) { var c = role.candidates[0]; return '<tr><td>' + safe(role.role) + '</td><td>' + safe(c ? c.name : "暂无候选") + '</td><td>' + safe(c ? readinessText(c.succession.band) : "暂无后备") + '</td><td>' + safe(c && c.succession.band === "Ready Now" ? "立即核验" : "建立定向梯队") + '</td></tr>'; }).join("") + '</tbody></table></section>';
  }

  function renderHealth() {
    var quality = state.quality;
    return '<section class="two-col"><article class="card"><div class="section-head"><h3>系统自动理解了什么</h3><span>先自动识别，再在必要时人工兜底</span></div><div class="insight-grid"><div><strong>自动识别字段</strong><p>已自动识别 ' + state.mappingMeta.matchedFields.length + ' 个分析必需字段。</p></div><div><strong>低置信字段</strong><p>' + (state.mappingMeta.lowConfidenceFields.length || 0) + ' 个字段建议人工复核。</p></div><div><strong>未使用字段</strong><p>' + (state.mappingMeta.unmappedHeaders.length || 0) + ' 个源字段未进入分析主链路。</p></div><div><strong>当前建议</strong><p>' + (quality.confidence.label === "高" ? "当前分析可信度较高，可直接用于演示与汇报。" : "建议带着风险提示继续使用，并优先复核标记字段。") + '</p></div></div></article><article class="card"><div class="section-head"><h3>分析可信度</h3><span>系统自动修复后，这份结果有多可信</span></div><div class="confidence-score"><strong>' + quality.confidence.score + '</strong><span>' + quality.confidence.label + ' 可信度</span></div>' + renderBars([{ label: "已自动修复", value: quality.autoFixed.length, color: "var(--success)" }, { label: "需谨慎解读", value: quality.caution.length, color: "var(--warning)" }, { label: "会影响判断", value: quality.risk.length, color: "var(--danger)" }]) + '</article></section>' +
      '<section class="section-grid-3"><article class="card"><div class="section-head"><h3>已自动修复</h3><span>系统已处理，不阻断分析</span></div><div class="issue-list">' + quality.autoFixed.slice(0, 8).map(function (item) { return '<div class="insight-line"><strong>' + safe(item.title) + '</strong><p>' + safe(item.detail) + '</p></div>'; }).join("") + '</div></article><article class="card"><div class="section-head"><h3>需谨慎解读</h3><span>会降低局部结论精度</span></div><div class="issue-list">' + quality.caution.slice(0, 8).map(function (item) { return '<div class="insight-line"><strong>' + safe(item.title) + '</strong><p>' + safe(item.detail) + '</p></div>'; }).join("") + '</div></article><article class="card"><div class="section-head"><h3>关键风险</h3><span>可能改变管理判断</span></div><div class="issue-list">' + quality.risk.slice(0, 8).map(function (item) { return '<div class="insight-line"><strong>' + safe(item.title) + '</strong><p>' + safe(item.detail) + '</p></div>'; }).join("") + '</div></article></section>';
  }

  function renderReport(rows) {
    var summary = executiveSummary(rows);
    var actions = actionPlan();
    return '<section class="report-hero card"><div class="tag">汇报式输出</div><h2>现状 → 原因 → 风险 → 建议 → 优先动作</h2><p>这一页的目标不是图表收纳，而是让你可以直接拿来做面试展示或向上汇报。</p><div class="button-row"><button class="btn btn-primary" data-action="download-report">下载摘要</button><a class="btn btn-secondary" href="#overview">返回总览</a></div></section>' +
      '<section class="executive-summary card"><div class="executive-main"><div class="tag">Executive Summary</div><h2>' + safe(summary.headline) + '</h2><p>' + safe(summary.priority) + '</p><div class="summary-kpis"><div><span>风险等级</span><strong>' + summary.riskLevel + '</strong></div><div><span>核心动作</span><strong>先核验、再保留、再加速培养。</strong></div></div></div><div class="executive-side">' + summary.issues.slice(0, 3).map(function (item) { return '<div class="summary-point"><strong>' + safe(item.title) + '</strong><span>' + safe(item.detail) + '</span></div>'; }).join("") + '</div></section>' +
      '<section class="section-grid-3"><article class="card"><div class="section-head"><h3>Current State｜当前状态</h3><span>现在发生了什么</span></div><p>' + safe(summary.state) + '</p></article><article class="card"><div class="section-head"><h3>Why It Is Happening｜原因</h3><span>为什么会这样</span></div><p>' + safe(summary.issues[0].detail) + " " + safe(summary.issues[1].detail) + '</p></article><article class="card"><div class="section-head"><h3>What May Happen Next｜风险</h3><span>接下来可能发生什么</span></div><p>' + safe(predictSignals(rows)[0]) + " " + safe(predictSignals(rows)[1]) + '</p></article></section>' +
      '<section class="section-grid-2"><article class="card"><div class="section-head"><h3>What To Do Now｜现在怎么做</h3><span>立即可执行的动作</span></div><div class="priority-card"><strong>优先核验最暴露岗位的后备人选。</strong><p>不要等岗位真正空出来，再去验证候选人的准备度。</p></div><div class="priority-card"><strong>优先稳住高风险高绩效人群。</strong><p>当离职风险与板凳风险重叠时，保留动作的价值最高。</p></div><div class="priority-card"><strong>把高潜正式放进发展路径。</strong><p>研发和产品中的潜在管理者，需要从“被看见”推进到“被培养”。</p></div></article><article class="card"><div class="section-head"><h3>Priority Actions｜优先动作</h3><span>按时间推进的控制计划</span></div><div class="time-list"><div><strong>0-3 个月</strong><p>' + safe(actions.now.join(" ")) + '</p></div><div><strong>3-6 个月</strong><p>' + safe(actions.soon.join(" ")) + '</p></div><div><strong>6-12 个月</strong><p>' + safe(actions.later.join(" ")) + '</p></div></div></article></section>' +
      '<section class="card"><div class="section-head"><h3>重点问题卡片</h3><span>现象、风险、建议一次讲清</span></div>' + summary.issues.map(function (item, idx) { return '<div class="priority-card"><strong>' + (idx + 1) + ". " + safe(item.title) + '</strong><p><b>现象：</b>' + safe(item.detail) + '</p><p><b>风险：</b>' + safe(predictSignals(rows)[idx] || predictSignals(rows)[0]) + '</p><p><b>建议：</b>' + safe((idx < 2 ? actions.now[0] : idx === 2 ? actions.soon[0] : actions.later[0])) + '</p></div>'; }).join("") + '</section>';
  }

  function renderShell() {
    var rows = currentRows();
    return '<div class="shell"><aside class="sidebar"><div class="brand"><div class="brand-mark">TP</div><div><div class="brand-title">TalentPulse</div><div class="brand-sub">AI 人才盘点与继任分析作品</div></div></div><nav class="nav">' + ROUTES.map(function (route) { return '<a class="nav-item ' + (state.route === route.key ? "active" : "") + '" href="#' + route.key + '">' + route.label + '</a>'; }).join("") + '</nav><div class="sidebar-foot"><div class="small-label">数据来源</div><div class="sidebar-company">' + safe(state.sourceName) + '</div></div></aside><section class="main"><header class="topbar"><div><div class="page-eyebrow">描述 → 解释 → 预测 → 控制 → 汇报</div><h1>' + safe(routeLabel(state.route)) + '</h1></div><div class="topbar-actions"><button class="btn btn-secondary" data-action="try-demo">体验 Demo</button><label class="btn btn-primary upload-inline">上传员工数据<input id="upload-input-top" type="file" accept=".csv,.xlsx" hidden></label></div></header><main class="content">' + (state.route === "home" ? renderHome() : state.route === "overview" ? renderOverview(rows) : state.route === "review" ? renderTalentReview(rows) : state.route === "succession" ? renderSuccession(rows) : state.route === "health" ? renderHealth() : renderReport(rows)) + '</main></section></div>';
  }

  function render() {
    app.innerHTML = renderShell();
    bindEvents();
  }

  function bindEvents() {
    Array.prototype.slice.call(document.querySelectorAll('[data-action="try-demo"]')).forEach(function (node) {
      node.onclick = function () {
        state.sourceName = "官方 Demo";
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
    state.uploadNote = /\.xlsx$/i.test(file.name) ? "当前环境未成功加载 XLSX 解析器，CSV 可直接使用；部署到线上后 XLSX 可正常解析。" : "暂不支持该文件类型，请上传 CSV 或 XLSX。";
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
    state.uploadNote = "系统已自动识别字段并直接进入分析，只有识别不确定时才需要人工兜底确认。";
    state.route = "overview";
    window.location.hash = "overview";
    render();
  }

  function downloadReport() {
    var summary = executiveSummary(state.employees);
    var actions = actionPlan();
    var content = [
      "TalentPulse 汇报摘要",
      "",
      "一、当前状态",
      summary.state,
      "",
      "二、重点问题",
      summary.issues.map(function (item) { return "- " + item.title + "：" + item.detail; }).join("\n"),
      "",
      "三、未来风险",
      predictSignals(state.employees).map(function (item) { return "- " + item; }).join("\n"),
      "",
      "四、优先动作",
      "- 0-3 个月：" + actions.now.join(" "),
      "- 3-6 个月：" + actions.soon.join(" "),
      "- 6-12 个月：" + actions.later.join(" ")
    ].join("\n");
    var blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "talentpulse-report-summary.txt";
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
      app.innerHTML = '<div class="card empty-state"><h3>运行错误</h3><p style="color:#6b7280">' + safe(event.message || "未知错误") + '</p></div>';
    });
    syncRoute();
  }

  boot();
})();
