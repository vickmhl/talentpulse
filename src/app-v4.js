(function () {
  const app = document.getElementById("app");
  const demo = window.TALENTPULSE_DEMO || { clean: { employees: [], metadata: {} }, dirty: { employees: [], metadata: {} }, employees: [], metadata: {} };
  const analysisEngine = window.TalentPulseAnalysis || null;

  const ROUTES = [
    { key: "home", label: "首页" },
    { key: "overview", label: "总览" },
    { key: "review", label: "人才盘点" },
    { key: "succession", label: "继任分析" },
    { key: "health", label: "数据健康" },
    { key: "report", label: "汇报报告" }
  ];

  const FIELDS = ["employee_id", "name", "gender", "age", "department", "sub_department", "position_title", "job_family", "job_level", "manager_id", "tenure_years", "hire_date", "city", "performance_current", "performance_last_year", "potential_level", "training_completion_rate", "promotion_count", "mobility_flag", "critical_role_flag", "successor_nomination_flag", "readiness_level", "flight_risk", "manager_recommendation", "engagement_score", "salary_band", "critical_experience_gap", "management_span", "role_change_count", "key_talent_flag", "succession_depth", "risk_source_tags"];

  const ALIASES = {
    employee_id: ["employeeid", "employee_id", "empid", "id", "工号", "员工编号"],
    name: ["name", "fullname", "姓名", "员工姓名"],
    gender: ["gender", "sex", "性别"],
    age: ["age", "年龄"],
    department: ["department", "dept", "部门"],
    sub_department: ["subdepartment", "sub_dept", "team", "子部门", "小组", "团队"],
    position_title: ["position", "positiontitle", "title", "jobtitle", "岗位", "职位"],
    job_family: ["jobfamily", "function", "岗位族", "职能"],
    job_level: ["joblevel", "level", "grade", "职级"],
    manager_id: ["managerid", "manager", "leaderid", "直属上级", "上级工号"],
    tenure_years: ["tenure", "tenureyears", "yearsincompany", "司龄", "在职年限"],
    hire_date: ["hiredate", "startdate", "entrydate", "入职日期"],
    city: ["city", "location", "城市"],
    performance_current: ["performancecurrent", "performance", "currentperformance", "当前绩效", "本年绩效"],
    performance_last_year: ["performancelastyear", "lastyearperformance", "去年绩效", "上年绩效"],
    potential_level: ["potential", "potentiallevel", "潜力", "潜力等级"],
    training_completion_rate: ["trainingcompletionrate", "trainingcompletion", "培训完成率"],
    promotion_count: ["promotioncount", "promotions", "晋升次数"],
    mobility_flag: ["mobilityflag", "mobility", "流动意愿"],
    critical_role_flag: ["criticalroleflag", "criticalrole", "关键岗位"],
    successor_nomination_flag: ["successornominationflag", "successornomination", "继任提名"],
    readiness_level: ["readinesslevel", "readiness", "准备度", "继任准备度"],
    flight_risk: ["flightrisk", "attritionrisk", "离职风险"],
    manager_recommendation: ["managerrecommendation", "recommendation", "经理推荐"],
    engagement_score: ["engagementscore", "engagement", "敬业度", "投入度"],
    salary_band: ["salaryband", "band", "payband", "薪级"],
    critical_experience_gap: ["criticalexperiencegap", "experiencegap", "关键经验缺口"],
    management_span: ["managementspan", "spanofcontrol", "管理跨度", "带人数量"],
    role_change_count: ["rolechangecount", "rolechanges", "岗位变动次数", "岗位变动记录"],
    key_talent_flag: ["keytalentflag", "keytalent", "关键人才", "核心人才标记"],
    succession_depth: ["successiondepth", "benchdepth", "继任覆盖深度", "后备深度"],
    risk_source_tags: ["risksourcetags", "risktags", "风险来源标签", "风险标签"]
  };

  const DEPT_ALIAS = {
    "Engineering Center": "研发中心",
    "  Engineering  ": "研发中心",
    "Sales Team": "销售增长",
    "Finance Legal": "财务法务",
    "Operations Hub": "交付运营",
    "战略办": "战略办公室",
    "战办": "战略办公室",
    "产品设计": "产品与设计",
    "产品设计部": "产品与设计",
    "研发": "研发中心",
    "研发部": "研发中心",
    "研發中心": "研发中心",
    "销售部": "销售增长",
    "销售增长部": "销售增长",
    "客户成功部": "客户成功",
    "交付运营部": "交付运营",
    "运营中心": "交付运营",
    "市场部": "市场品牌",
    "品牌市场": "市场品牌",
    "财法": "财务法务",
    "IT/Data": "IT与数据平台",
    "IT / 数据支持": "IT与数据平台",
    "数据平台": "IT与数据平台",
    "HR": "人力资源",
    "Finance & Legal": "财务法务",
    "IT / Data Support": "IT与数据平台",
    "Customer Success": "客户成功",
    "Operations": "交付运营",
    "Sales": "销售增长",
    "Product": "产品与设计",
    "Engineering": "研发中心",
    "Marketing": "市场品牌",
    "CEO Office / Strategy Office": "战略办公室"
  };

  const TITLE_ALIAS = {
    PM: "产品经理",
    "Cust Success Specialist": "客户成功顾问",
    "产经": "产品经理",
    "产设负责人": "产品设计负责人",
    "研经": "研发经理",
    "AE": "客户经理",
    "CSM": "客户成功顾问",
    "运管": "运营经理",
    "HRBP Mgr": "HRBP 经理",
    "IT Ops Mgr": "IT 运维经理"
  };

  const state = {
    route: "home",
    sourceName: "官方讲述版",
    uploadMode: "demo",
    uploadNote: "已内置官方讲述版，也支持上传 CSV 或 XLSX 员工数据。",
    rawRows: [],
    employees: [],
    mappingMeta: { fieldMap: {}, matchedFields: [], lowConfidenceFields: [], unmappedHeaders: [], rows: [] },
    quality: { autoFixed: [], caution: [], risk: [], confidence: { score: 90, label: "高" } },
    selectedDepartment: "All",
    selectedJobLevel: "All",
    selectedNineBoxKey: "3-3",
    selectedEmployeeId: "",
    selectedRoleKey: "",
    activeHealthTab: "risk",
    selectedHealthIndex: 0,
    cleaningView: "after",
    demoTrack: "interview",
    demoStep: 0,
    selectedStoryKey: "engineering"
  };

  const DEMO_TRACKS = {
    quick: {
      label: "90 秒快讲",
      duration: "约 90 秒",
      audience: "第一次给面试官看作品",
      promise: "先定调，再收口。",
      steps: [
        { route: "overview", title: "组织状态", cue: "先讲风险、覆盖率和优先动作。", outcome: "先定调。", focus: "看 Executive Summary。" },
        { route: "succession", title: "岗位暴露", cue: "再讲关键岗位谁能接上。", outcome: "把风险讲实。", focus: "看高暴露岗位。" },
        { route: "report", title: "汇报收口", cue: "最后用一页报告收尾。", outcome: "形成闭环。", focus: "看优先动作。" }
      ]
    },
    interview: {
      label: "3 分钟面试版",
      duration: "约 3 分钟",
      audience: "HR 岗位面试深聊",
      promise: "完整展示分析与诊断能力。",
      steps: [
        { route: "overview", title: "总览", cue: "先讲状态、风险和优先动作。", outcome: "建立视角。", focus: "先说结论。" },
        { route: "review", title: "人才盘点", cue: "再讲人才结构差异。", outcome: "体现分析能力。", focus: "优先讲研发和运营。" },
        { route: "succession", title: "继任分析", cue: "再讲谁能接班、谁接不上。", outcome: "落到岗位。", focus: "优先讲产品和支持职能。" },
        { route: "report", title: "报告收口", cue: "最后收成汇报结论。", outcome: "落到动作。", focus: "看时间层动作。" }
      ]
    },
    deep: {
      label: "5 分钟深挖版",
      duration: "约 5 分钟",
      audience: "作品集复盘 / 课程答辩 / 深度追问",
      promise: "把可信度与组织问题讲透。",
      steps: [
        { route: "overview", title: "风险框架", cue: "先搭好现状、原因、风险和动作框架。", outcome: "先统一框架。", focus: "看四段式结构。" },
        { route: "review", title: "人才结构", cue: "再讲高绩效、高潜和接班不是一回事。", outcome: "体现判断层次。", focus: "看九宫格对比。" },
        { route: "succession", title: "岗位暴露", cue: "再讲关键岗位梯队。", outcome: "体现继任分析。", focus: "看 ready now 和 ready soon。" },
        { route: "health", title: "数据可信度", cue: "最后补充系统自动理解和清洗。", outcome: "体现 AI 数据准备能力。", focus: "只讲关键风险。" },
        { route: "report", title: "报告收口", cue: "最后用报告收束。", outcome: "完整结束。", focus: "看问题卡片。" }
      ]
    }
  };

  const DEMO_ITERATIONS = [
    { version: "V1", title: "把首页改成作品入口", detail: "不再像后台首页，而是直接强调 Demo 和 Upload 两个入口。" },
    { version: "V2", title: "明确 AI 自动分析定位", detail: "把自动识别、自动清洗、自动洞察做成首页主价值。" },
    { version: "V3", title: "重做总览叙事", detail: "把总览改成 Executive Summary 主导，而不是图表堆叠。" },
    { version: "V4", title: "补 Describe-Explain-Predict-Control", detail: "让分析过程具备可汇报的逻辑闭环。" },
    { version: "V5", title: "让人才盘点更像组织诊断", detail: "不只展示九宫格，还突出高绩效非接班与结构断层。" },
    { version: "V6", title: "让继任分析落到岗位暴露", detail: "把谁能接班、谁接不上做成关键岗位热力图与候选梯队。" },
    { version: "V7", title: "把数据健康改成可信度页面", detail: "强调系统自动理解了什么，而不是逼用户手动清洗。" },
    { version: "V8", title: "让报告页像正式汇报稿", detail: "把现状、原因、风险和建议整理成一页收口。" },
    { version: "V9", title: "加入 Demo 故事切换", detail: "让研发、销售、运营、产品和支持职能都能快速切入讲述。" },
    { version: "V10", title: "加入演示轨道与讲述引导", detail: "根据面试时长自动引导你按步骤讲清问题、证据与行动。" }
  ];

  function safe(value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
  }

  function normalizeKey(value) {
    return String(value || "").toLowerCase().replace(/[\s_\-\/()（）]/g, "");
  }

  function unique(list) {
    return Array.from(new Set((list || []).filter(Boolean)));
  }

  function countBy(rows, predicate) {
    return (rows || []).reduce((total, row) => total + (predicate(row) ? 1 : 0), 0);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function toNumber(value, fallback) {
    const n = Number(String(value == null ? "" : value).replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : (fallback == null ? 0 : fallback);
  }

  function normalizeFlag(value) {
    const key = String(value || "").trim().toLowerCase();
    if (["y", "yes", "true", "1"].includes(key)) return "Y";
    if (["n", "no", "false", "0"].includes(key)) return "N";
    return String(value || "").trim().toUpperCase();
  }

  function normalizeDate(value) {
    const text = String(value || "").trim();
    if (!text) return "";
    const normalized = text.replace(/[./]/g, "-");
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(normalized)) {
      const parts = normalized.split("-");
      return `${parts[0]}-${String(parts[1]).padStart(2, "0")}-${String(parts[2]).padStart(2, "0")}`;
    }
    if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(normalized)) {
      const parts = normalized.split("-");
      return `${parts[2]}-${String(parts[0]).padStart(2, "0")}-${String(parts[1]).padStart(2, "0")}`;
    }
    return normalized;
  }

  function normalizeRecommendation(value) {
    const text = String(value || "").trim();
    if (/强烈推荐|重点推荐/.test(text)) return "Strongly Recommend";
    if (/推荐/.test(text) && !/不/.test(text)) return "Recommend";
    if (/观察|保留观察/.test(text)) return "Observe";
    if (/不推荐|暂不推荐/.test(text)) return "Not Recommend";
    if (/strong/i.test(text)) return "Strongly Recommend";
    if (/recommend/i.test(text) && !/not/i.test(text)) return "Recommend";
    if (/observe/i.test(text)) return "Observe";
    if (/not/i.test(text)) return "Not Recommend";
    return text || "Observe";
  }

  function normalizePotential(value) {
    const text = String(value || "").trim();
    if (/high/i.test(text) || text === "高" || text === "高潜") return "High";
    if (/medium/i.test(text) || text === "中" || text === "中潜") return "Medium";
    if (/low/i.test(text) || text === "低" || text === "低潜") return "Low";
    return "";
  }

  function normalizeReadiness(value) {
    const text = String(value || "").trim();
    if (/现在可接任|立即可接任|ready now/i.test(text)) return "Ready Now";
    if (/1-2|1–2|一年到两年|1到2年/i.test(text)) return "Ready in 1-2 Years";
    if (/2-3|2–3|两年到三年|2到3年/i.test(text)) return "Ready in 2-3 Years";
    if (/暂未就绪|not ready/i.test(text)) return "Not Ready Yet";
    if (/ready now/i.test(text)) return "Ready Now";
    if (/1-2/i.test(text)) return "Ready in 1-2 Years";
    if (/2-3/i.test(text)) return "Ready in 2-3 Years";
    if (/not ready/i.test(text)) return "Not Ready Yet";
    return text;
  }

  function normalizeFlightRisk(value) {
    const text = String(value || "").trim();
    if (/高|high/i.test(text)) return "High";
    if (/中|medium/i.test(text)) return "Medium";
    if (/低|low/i.test(text)) return "Low";
    return text || "Medium";
  }

  function scorePerformance(value) {
    return { A: 5, "B+": 4, B: 3, C: 2 }[String(value || "").trim()] || 2;
  }

  function routeLabel(routeKey) {
    if (routeKey === "profile") return "员工画像";
    const route = ROUTES.find((item) => item.key === routeKey);
    return route ? route.label : "首页";
  }

  function visibleRoutes() {
    return ROUTES;
  }

  function readinessText(value) {
    return { "Ready Now": "现在可接任", "Ready in 1-2 Years": "1-2 年可接任", "Ready in 2-3 Years": "2-3 年可接任", "Not Ready Yet": "暂未就绪" }[value] || value || "-";
  }

  function potentialText(value) {
    return { High: "高潜", Medium: "中潜", Low: "低潜" }[value] || value || "待补充";
  }

  function recommendationText(value) {
    return { "Strongly Recommend": "强烈推荐", Recommend: "推荐", Observe: "继续观察", "Not Recommend": "暂不推荐" }[value] || value || "继续观察";
  }

  function riskText(value) {
    return { High: "高", Medium: "中", Low: "低" }[value] || value || "-";
  }

  function autoMapRows(rawRows) {
    const headers = rawRows.length ? Object.keys(rawRows[0]) : [];
    const normalized = headers.map((header) => ({ raw: header, normalized: normalizeKey(header) }));
    const fieldMap = {};
    const matchedFields = [];
    const lowConfidenceFields = [];

    FIELDS.forEach((field) => {
      const aliases = (ALIASES[field] || []).map(normalizeKey);
      let match = normalized.find((item) => aliases.includes(item.normalized));
      let lowConfidence = false;
      if (!match) {
        match = normalized.find((item) => aliases.some((alias) => item.normalized.includes(alias) || alias.includes(item.normalized)));
        lowConfidence = Boolean(match);
      }
      fieldMap[field] = match ? match.raw : "";
      if (match) matchedFields.push(field);
      if (!match || lowConfidence) lowConfidenceFields.push(field);
    });

    const rows = rawRows.map((raw) => {
      const mapped = {};
      FIELDS.forEach((field) => {
        mapped[field] = fieldMap[field] ? raw[fieldMap[field]] : "";
      });
      return mapped;
    });

    const used = unique(Object.values(fieldMap));
    const unmappedHeaders = headers.filter((header) => !used.includes(header));
    return { fieldMap, matchedFields, lowConfidenceFields, unmappedHeaders, rows };
  }

  function enrichEmployees(rows) {
    const deduped = new Map();
    rows.forEach((raw, index) => {
      const employee_id = String(raw.employee_id || `TMP${index + 1}`).trim();
      if (deduped.has(employee_id)) return;
      const employee = {
        employee_id,
        name: String(raw.name || "未命名员工").trim(),
        gender: String(raw.gender || "").trim(),
        age: toNumber(raw.age, 0),
        department: DEPT_ALIAS[String(raw.department || "").trim()] || String(raw.department || "").trim(),
        sub_department: String(raw.sub_department || "").trim(),
        position_title: TITLE_ALIAS[String(raw.position_title || "").trim()] || String(raw.position_title || "").trim(),
        job_family: String(raw.job_family || "综合职能").trim() || "综合职能",
        job_level: String(raw.job_level || "P2").trim() || "P2",
        manager_id: String(raw.manager_id || "").trim(),
        tenure_years: toNumber(raw.tenure_years, 0),
        hire_date: normalizeDate(raw.hire_date),
        city: String(raw.city || "").trim(),
        performance_current: String(raw.performance_current || "B").trim() || "B",
        performance_last_year: String(raw.performance_last_year || "B").trim() || "B",
        potential_level: normalizePotential(raw.potential_level),
        training_completion_rate: clamp(toNumber(raw.training_completion_rate, 60), 0, 100),
        promotion_count: clamp(toNumber(raw.promotion_count, 0), 0, 8),
        mobility_flag: normalizeFlag(raw.mobility_flag || "N"),
        critical_role_flag: normalizeFlag(raw.critical_role_flag || "N"),
        successor_nomination_flag: normalizeFlag(raw.successor_nomination_flag || "N"),
        readiness_level: normalizeReadiness(raw.readiness_level),
        flight_risk: normalizeFlightRisk(raw.flight_risk || "Medium"),
        manager_recommendation: normalizeRecommendation(raw.manager_recommendation),
        engagement_score: clamp(toNumber(raw.engagement_score, 72), 0, 100),
        salary_band: String(raw.salary_band || "").trim(),
        critical_experience_gap: String(raw.critical_experience_gap || "").trim(),
        management_span: clamp(toNumber(raw.management_span, 0), 0, 40),
        role_change_count: clamp(toNumber(raw.role_change_count, 0), 0, 10),
        key_talent_flag: normalizeFlag(raw.key_talent_flag || "N"),
        succession_depth: clamp(toNumber(raw.succession_depth, 0), 0, 5),
        risk_source_tags: String(raw.risk_source_tags || "").trim()
      };
      deduped.set(employee_id, employee);
    });

    const employees = Array.from(deduped.values());
    const ids = new Set(employees.map((item) => item.employee_id));

    employees.forEach((employee) => {
      const perf = scorePerformance(employee.performance_current);
      const perfLast = scorePerformance(employee.performance_last_year);
      const recommend = { "Strongly Recommend": 90, Recommend: 76, Observe: 58, "Not Recommend": 36 }[employee.manager_recommendation] || 58;
      const learning = clamp(Math.round(employee.training_completion_rate * 0.5 + (employee.mobility_flag === "Y" ? 16 : 8) + employee.promotion_count * 6 + perfLast * 4), 45, 95);
      const leadership = clamp(Math.round(perf * 12 + recommend * 0.25 + ((employee.job_level.startsWith("M") || employee.job_level === "D1") ? 16 : 6) + employee.promotion_count * 6), 45, 95);
      const influence = clamp(Math.round(employee.engagement_score * 0.58 + recommend * 0.22 + (employee.critical_role_flag === "Y" ? 10 : 0)), 45, 95);
      const strategic = clamp(Math.round(perf * 11 + perfLast * 8 + (employee.critical_role_flag === "Y" ? 14 : 6) + ((employee.job_level.startsWith("M") || employee.job_level === "D1") ? 10 : 4)), 45, 95);
      const shlScore = Math.round((learning + leadership + influence + strategic) / 4);
      employee.shl = { learning, leadership, influence, strategic, score: shlScore, tier: shlScore >= 80 ? "A" : shlScore >= 68 ? "B" : "C" };

      const potentialScore = employee.potential_level === "High" ? 88 : employee.potential_level === "Medium" ? 68 : employee.potential_level === "Low" ? 48 : clamp(shlScore - 4, 50, 82);
      const fit = clamp(perf * 18 + ((employee.job_level.startsWith("M") || employee.job_level === "D1") ? 12 : 0) + (employee.critical_role_flag === "Y" ? 10 : 4), 45, 95);
      const experience = clamp(42 + employee.tenure_years * 6 + employee.promotion_count * 8, 42, 95);
      const successionScore = Math.round(perf * 18 * 0.24 + potentialScore * 0.22 + fit * 0.2 + experience * 0.16 + recommend * 0.18);
      let band = employee.readiness_level || (successionScore >= 82 && perf >= 4 ? "Ready Now" : successionScore >= 70 ? "Ready in 1-2 Years" : successionScore >= 60 ? "Ready in 2-3 Years" : "Not Ready Yet");
      if (perf <= 2 && band === "Ready Now") band = "Not Ready Yet";
      employee.succession = { score: successionScore, band };
      employee.ninebox = { x: perf >= 4 ? 3 : perf === 3 ? 2 : 1, y: employee.potential_level === "High" || employee.shl.tier === "A" ? 3 : employee.potential_level === "Medium" || employee.shl.tier === "B" ? 2 : 1 };
      employee.riskTags = unique([
        employee.flight_risk === "High" ? "离职风险高" : "",
        employee.critical_role_flag === "Y" && employee.successor_nomination_flag !== "Y" ? "关键岗位无后备" : "",
        employee.shl.tier === "A" && employee.succession.band !== "Ready Now" ? "高潜未转化" : "",
        perf >= 4 && employee.succession.band !== "Ready Now" ? "高绩效未准备接班" : "",
        employee.critical_experience_gap && /高|是|缺口/.test(employee.critical_experience_gap) ? "关键经验未补齐" : "",
        employee.succession_depth <= 1 && employee.critical_role_flag === "Y" ? "覆盖深度不足" : "",
        employee.manager_id && !ids.has(employee.manager_id) && !/^CEO/i.test(employee.manager_id) ? "汇报线需复核" : "",
        employee.risk_source_tags
      ]);
    });

    return employees;
  }

  function makeIssueItem(title, row, employeeId, field, detail) {
    return { title, row, employeeId: employeeId || "-", field, detail };
  }

  function detectQuality(rawRows, employees, mappingMeta) {
    const quality = { autoFixed: [], caution: [], risk: [], confidence: { score: 88, label: "高" } };
    const counts = {};
    rawRows.forEach((row) => {
      const id = String(row.employee_id || row.employeeId || row.工号 || row.emp_id || row.员工编号 || "").trim();
      if (!id) return;
      counts[id] = (counts[id] || 0) + 1;
    });

    rawRows.forEach((row, index) => {
      const line = index + 2;
      const id = String(row.employee_id || row.employeeId || row.工号 || row.emp_id || row.员工编号 || `ROW-${line}`).trim();
      const department = String(row.department || row.dept || row.部门 || "");
      const hireDate = String(row.hire_date || row.hireDate || row.入职日期 || "");
      if (department && department !== department.trim()) quality.autoFixed.push(makeIssueItem("已自动清理部门空格", line, id, "department", "系统已去除部门前后的多余空格。"));
      if (hireDate && normalizeDate(hireDate) !== hireDate) quality.autoFixed.push(makeIssueItem("已统一日期格式", line, id, "hire_date", "系统已将日期归一化为标准格式。"));
      if (counts[id] > 1) quality.autoFixed.push(makeIssueItem("已在分析视图中去重", line, id, "employee_id", "重复工号已在分析层去重，但源数据仍建议复核。"));
      if (!String(row.potential_level || row.potential || row.潜力 || "").trim() && scorePerformance(row.performance_current || row.当前绩效) >= 4) quality.caution.push(makeIssueItem("高绩效员工缺少潜力标签", line, id, "potential_level", "高绩效不应直接等同于高潜，建议补齐潜力判断。"));
      const age = toNumber(row.age || row.Age, 0);
      if (age && (age < 20 || age > 60)) quality.caution.push(makeIssueItem("发现年龄异常值", line, id, "age", "年龄明显偏离常见员工区间，建议复核。"));
    });

    const ids = new Set(employees.map((item) => item.employee_id));
    employees.forEach((employee) => {
      if (employee.manager_id && !ids.has(employee.manager_id) && !/^CEO/i.test(employee.manager_id)) quality.risk.push(makeIssueItem("manager_id 无法回溯", "-", employee.employee_id, "manager_id", "汇报线无法回溯到上级，可能影响结构判断。"));
      if (employee.critical_role_flag === "Y" && employee.successor_nomination_flag !== "Y") quality.risk.push(makeIssueItem("关键岗位无继任提名", "-", employee.employee_id, "successor_nomination_flag", "关键岗位缺少明确后备，属于高优先级风险。"));
      if (employee.readiness_level === "Ready Now" && (scorePerformance(employee.performance_current) <= 2 || !employee.potential_level)) quality.risk.push(makeIssueItem("准备度与绩效/潜力冲突", "-", employee.employee_id, "readiness_level", "源数据中的准备度与绩效或潜力口径不一致。"));
    });

    mappingMeta.lowConfidenceFields.forEach((field) => quality.caution.push(makeIssueItem("字段识别置信度偏低", "-", "-", field, "该字段通过相似命名推断得到，建议上传数据时手动确认。")));
    let score = 92 - Math.min(quality.autoFixed.length, 12) - quality.caution.length * 2 - quality.risk.length * 4 - mappingMeta.lowConfidenceFields.length * 2;
    score = clamp(score, 48, 96);
    quality.confidence = { score, label: score >= 82 ? "高" : score >= 68 ? "中" : "低" };
    return quality;
  }
  function summarizeDepartments(rows) {
    const summary = {};
    rows.forEach((row) => {
      if (!summary[row.department]) summary[row.department] = { count: 0, hipoA: 0, readyNow: 0, readySoon: 0, highRisk: 0, uncoveredRoles: 0, highPerf: 0, avgShl: 0, mobilityYes: 0, criticalCount: 0 };
      const item = summary[row.department];
      item.count += 1;
      item.avgShl += row.shl.score;
      if (row.shl.tier === "A") item.hipoA += 1;
      if (row.succession.band === "Ready Now") item.readyNow += 1;
      if (row.succession.band === "Ready in 1-2 Years") item.readySoon += 1;
      if (row.flight_risk === "High") item.highRisk += 1;
      if (row.critical_role_flag === "Y" && row.successor_nomination_flag !== "Y") item.uncoveredRoles += 1;
      if (row.critical_role_flag === "Y") item.criticalCount += 1;
      if (row.mobility_flag === "Y") item.mobilityYes += 1;
      if (scorePerformance(row.performance_current) >= 4) item.highPerf += 1;
    });
    Object.keys(summary).forEach((key) => {
      summary[key].avgShl = Math.round(summary[key].avgShl / summary[key].count);
    });
    return summary;
  }

  function makeInsight(title, detail, score, route, predict, actionNow, actionSoon, actionLater) {
    return { title, detail, score, route, predict, actionNow, actionSoon, actionLater };
  }

  function buildIssues(rows, summary) {
    const roles = getCriticalRoles(rows);
    if (analysisEngine && analysisEngine.buildDiagnostics) {
      return analysisEngine.buildDiagnostics({ rows, departmentSummary: summary, roles }).issues.map((item) => ({
        title: item.title,
        detail: item.phenomenon,
        score: item.score,
        route: item.route,
        predict: item.likelyConsequence,
        actionNow: item.actionNow,
        actionSoon: item.actionSoon,
        actionLater: item.actionLater,
        rootCause: item.rootCause,
        likelyConsequence: item.likelyConsequence,
        recommendedMove: item.recommendedMove,
        managementRead: item.managementRead
      }));
    }
    return [makeInsight("组织需要优先核验关键岗位覆盖", "当前没有极端异常，但关键岗位覆盖和高潜转化仍值得优先确认。", 70, "succession", "如果不持续滚动复核，继任暴露会在组织调整时被放大。", "先核验高暴露岗位后备名单。", "建立 1-2 年可接任候选池。", "形成周期性的继任盘点机制。")];
  }

  function buildGuide(summary) {
    const guide = [];
    const needsHealth = state.uploadMode === "upload" && (state.quality.confidence.score < 78 || state.quality.risk.length >= 8);
    guide.push(needsHealth ? { route: "health", label: "先看数据健康", reason: "上传数据仍有高风险项，建议先确认可信度再讲结论。" } : { route: "overview", label: "先讲总览", reason: "先用 2 分钟讲清当前状态、风险等级和优先动作。" });
    (summary.focusModules || []).forEach((route) => {
      if (route === "review") guide.push({ route: "review", label: "再看人才盘点", reason: "用九宫格和代表人才说明结构差异与高潜转化。" });
      if (route === "succession") guide.push({ route: "succession", label: "再看继任分析", reason: "用岗位暴露和候选梯队解释谁能接上、谁接不上。" });
    });
    guide.push({ route: "report", label: "最后收口到报告", reason: "把现状、原因、风险和建议整理成一页可汇报输出。" });
    return unique(guide.map((item) => item.route)).map((route) => guide.find((item) => item.route === route));
  }

  function executiveSummary(rows) {
    const summary = summarizeDepartments(rows);
    const roles = getCriticalRoles(rows);
    const diagnostics = analysisEngine && analysisEngine.buildDiagnostics ? analysisEngine.buildDiagnostics({ rows, departmentSummary: summary, roles }) : null;
    const issues = diagnostics ? diagnostics.issues.map((item) => ({
      title: item.title,
      detail: item.phenomenon,
      score: item.score,
      route: item.route,
      predict: item.likelyConsequence,
      actionNow: item.actionNow,
      actionSoon: item.actionSoon,
      actionLater: item.actionLater,
      rootCause: item.rootCause,
      likelyConsequence: item.likelyConsequence,
      recommendedMove: item.recommendedMove,
      managementRead: item.managementRead
    })) : buildIssues(rows, summary);
    const criticalRoles = countBy(rows, (row) => row.critical_role_flag === "Y");
    const coveredCriticalRoles = countBy(rows, (row) => row.critical_role_flag === "Y" && row.successor_nomination_flag === "Y");
    const uncovered = countBy(rows, (row) => row.critical_role_flag === "Y" && row.successor_nomination_flag !== "Y");
    const readyNow = countBy(rows, (row) => row.succession.band === "Ready Now");
    const hipoA = countBy(rows, (row) => row.shl.tier === "A");
    const highRiskHighPerf = countBy(rows, (row) => row.flight_risk === "High" && scorePerformance(row.performance_current) >= 4);
    const coverage = criticalRoles ? Math.round((coveredCriticalRoles / criticalRoles) * 100) : 0;
    const conversionGap = Math.max(0, hipoA - readyNow);
    const riskLevel = uncovered >= 14 || coverage < 55 ? "高" : uncovered >= 7 || coverage < 70 ? "中高" : "中";
    const headline = coverage < 60 ? "组织存在明显继任暴露，高潜储备尚未充分转化为关键岗位后备。" : conversionGap >= 12 ? "组织具备未来人才储备，但高潜向关键岗位准备度的转化仍偏慢。" : "组织整体结构可用，但部门之间的人才厚度与接任准备度差异明显。";
    return {
      headline,
      state: `当前共有 ${hipoA} 位高潜 A、${readyNow} 位现在可接任人才，关键岗位覆盖率约 ${coverage}%，高风险高绩效人群 ${highRiskHighPerf} 人。`,
      riskLevel,
      priority: issues[0] ? issues[0].actionNow : "先核验关键岗位后备，再稳住高风险核心人才。",
      issues: issues.slice(0, 4),
      summary,
      focusModules: unique(issues.map((item) => item.route)),
      kpis: { criticalRoles, coveredCriticalRoles, uncovered, readyNow, hipoA, highRiskHighPerf, coverage, conversionGap },
      diagnostics
    };
  }

  function predictSignals(summary) {
    const signals = summary.diagnostics && summary.diagnostics.predictions ? summary.diagnostics.predictions.slice() : (summary.issues || []).map((item) => item.predict).filter(Boolean);
    if (summary.kpis.coverage < 70) signals.push("如果关键岗位覆盖率继续低于 70%，组织在扩张或人员流动阶段会更加被动。");
    if (summary.kpis.conversionGap >= 10) signals.push("如果高潜到现在可接任梯队的缺口继续扩大，未来储备会难以转成短期可用的管理梯队。");
    return unique(signals).slice(0, 4);
  }

  function actionPlan(summary) {
    if (summary.diagnostics && summary.diagnostics.actionPlan) {
      return {
        now: summary.diagnostics.actionPlan.immediate.slice(0, 3),
        soon: summary.diagnostics.actionPlan.mid.slice(0, 3),
        later: summary.diagnostics.actionPlan.bench.slice(0, 3)
      };
    }
    return {
      now: unique(summary.issues.map((item) => item.actionNow).concat(["核验前 10 个高暴露关键岗位的后备名单与真实准备度。"])) .slice(0, 3),
      soon: unique(summary.issues.map((item) => item.actionSoon).concat(["围绕关键团队建立定向培养计划与人才校准节奏。"])) .slice(0, 3),
      later: unique(summary.issues.map((item) => item.actionLater).concat(["形成跨部门滚动盘点与继任校准机制。"])) .slice(0, 3)
    };
  }

  function getActiveTrack() {
    return DEMO_TRACKS[state.demoTrack] || DEMO_TRACKS.interview;
  }

  function getTrackSteps() {
    return getActiveTrack().steps || [];
  }

  function getCurrentTrackStep() {
    const steps = getTrackSteps();
    return steps[state.demoStep] || steps[0] || null;
  }

  function navigateToRoute(route) {
    state.route = route;
    if (window.location.hash !== `#${route}`) window.location.hash = route;
    else render();
  }

  function jumpDemoStep(index) {
    const steps = getTrackSteps();
    if (!steps.length) return;
    state.demoStep = clamp(index, 0, steps.length - 1);
    navigateToRoute(steps[state.demoStep].route);
  }

  function departmentSnapshot(summary, name) {
    return summary.summary[name] || { count: 0, hipoA: 0, readyNow: 0, readySoon: 0, highRisk: 0, uncoveredRoles: 0, highPerf: 0, avgShl: 0 };
  }

  function buildDemoStories(summary) {
    const engineering = departmentSnapshot(summary, "研发中心");
    const sales = departmentSnapshot(summary, "销售增长");
    const operations = departmentSnapshot(summary, "交付运营");
    const product = departmentSnapshot(summary, "产品与设计");
    const supportRisk = ["人力资源", "财务法务", "IT与数据平台"].map((name) => departmentSnapshot(summary, name)).reduce((acc, item) => ({
      count: acc.count + item.count,
      uncoveredRoles: acc.uncoveredRoles + item.uncoveredRoles,
      readyNow: acc.readyNow + item.readyNow
    }), { count: 0, uncoveredRoles: 0, readyNow: 0 });
    return [
      {
        key: "engineering",
        label: "研发梯队",
        route: "review",
        title: "研发增长快于管理准备度",
        metric: `高潜 ${engineering.hipoA} / 现在可接任 ${engineering.readyNow}`,
        talk: `研发高潜储备并不差，但现在可接任偏薄，说明储备还没有顺利转成可用梯队。`,
        why: "高潜识别存在，但带人经验、岗位锚点和管理历练还不够。",
        action: "先把研发高潜拉出名单，安排带人任务和关键项目历练。"
      },
      {
        key: "sales",
        label: "销售风险",
        route: "succession",
        title: "销售业绩强，但依赖头部明星员工",
        metric: `高风险 ${sales.highRisk} / 高绩效 ${sales.highPerf}`,
        talk: `销售的结果亮眼，但高绩效与高离职风险叠加，业绩更像被少数核心员工托住。`,
        why: "关键岗位替补不足，保留策略和梯队建设没有同步推进。",
        action: "先对高绩效高风险人群做保留对话，再补关键岗位备份。"
      },
      {
        key: "operations",
        label: "运营稳态",
        route: "review",
        title: "运营稳定，但成长动能偏弱",
        metric: `高潜 ${operations.hipoA} / 1-2 年可接任 ${operations.readySoon}`,
        talk: `运营团队稳定不代表健康，真正的问题是高潜和 1-2 年可接任储备都偏少。`,
        why: "当前更像稳态支撑团队，而不是持续输出骨干的梯队池。",
        action: "先识别潜在骨干，再用轮岗和专项项目补成长机会。"
      },
      {
        key: "product",
        label: "产品暴露",
        route: "succession",
        title: "产品关键岗位存在单点依赖",
        metric: `缺后备 ${product.uncoveredRoles} / 部门人数 ${product.count}`,
        talk: `产品岗位看起来稳定，但关键岗位覆盖偏窄，一旦出现变化，恢复成本会很高。`,
        why: "后备识别和 1-2 年可接任候选池没有跟上岗位关键度。",
        action: "先补齐关键岗位的后备名单，再压缩单点依赖。"
      },
      {
        key: "support",
        label: "支持职能",
        route: "succession",
        title: "支持职能体量不大，但继任风险被低估",
        metric: `缺后备 ${supportRisk.uncoveredRoles} / 现在可接任 ${supportRisk.readyNow}`,
        talk: `人力、财务和 IT 不显眼，但关键岗位一旦空缺，组织恢复速度会明显变慢。`,
        why: "低可见度岗位往往没有被放进固定节奏的继任校准里。",
        action: "把支持职能纳入固定盘点节奏，补齐 1-2 年可接任候选。"
      }
    ];
  }

  function renderTrackCards() {
    return `<div class="demo-track-group">${Object.keys(DEMO_TRACKS).map((key) => {
      const track = DEMO_TRACKS[key];
      return `<button class="demo-track-card ${state.demoTrack === key ? "active" : ""}" data-demo-track="${safe(key)}"><span>${safe(track.duration)}</span><strong>${safe(track.label)}</strong><small>${safe(track.audience)}</small><p>${safe(track.promise)}</p></button>`;
    }).join("")}</div>`;
  }

  function renderStorySwitcher(summary) {
    const stories = buildDemoStories(summary);
    const selected = stories.find((item) => item.key === state.selectedStoryKey) || stories[0];
    return `<section class="section-grid-2"><article class="card"><div class="section-head"><h3>Demo 故事</h3><span>选择一个部门切入</span></div><div class="demo-story-grid">${stories.map((item) => `<button class="demo-story-card ${selected.key === item.key ? "active" : ""}" data-demo-story="${safe(item.key)}"><span>${safe(item.label)}</span><strong>${safe(item.title)}</strong><small>${safe(item.metric)}</small></button>`).join("")}</div></article><article class="card demo-note-card"><div class="section-head"><h3>当前讲法</h3><span>${safe(selected.label)}</span></div><div class="priority-card"><strong>${safe(selected.talk)}</strong><p>${safe(selected.action)}</p></div><div class="button-row"><button class="btn btn-secondary" data-demo-jump="${safe(selected.route)}">进入${safe(routeLabel(selected.route))}</button></div></article></section>`;
  }

  function renderDemoRail(summary) {
    const track = getActiveTrack();
    const steps = getTrackSteps();
    const current = getCurrentTrackStep();
    const stories = buildDemoStories(summary);
    const selectedStory = stories.find((item) => item.key === state.selectedStoryKey) || stories[0];
    return `<section class="demo-rail"><div class="demo-rail-main"><div><div class="page-eyebrow">Demo 轨道</div><strong>${safe(track.label)}</strong><span>${safe(`${track.duration} · ${track.audience}`)}</span></div><div class="demo-toolbar"><span class="status info">故事：${safe(selectedStory.label)}</span><button class="btn btn-secondary" data-demo-prev ${state.demoStep <= 0 ? "disabled" : ""}>上一步</button><button class="btn btn-primary" data-demo-next ${state.demoStep >= steps.length - 1 ? "disabled" : ""}>下一步</button></div></div><div class="demo-stepper">${steps.map((step, index) => `<button class="demo-step ${index === state.demoStep ? "active" : ""}" data-demo-step="${index}"><span>${safe(`Step ${index + 1}`)}</span><strong>${safe(step.title)}</strong><small>${safe(step.route === state.route ? "当前" : routeLabel(step.route))}</small></button>`).join("")}</div><div class="demo-track-note"><strong>${safe(current ? current.cue : track.promise)}</strong><span>${safe(current ? current.outcome : track.promise)}</span></div></section>`;
  }

  function renderIterationTimeline() {
    return `<section class="card"><div class="section-head"><h3>Demo 自我迭代 10 版</h3><span>把产品从看板打磨成可讲的演示作品</span></div><div class="iteration-grid">${DEMO_ITERATIONS.map((item) => `<div class="iteration-card"><span>${safe(item.version)}</span><strong>${safe(item.title)}</strong><p>${safe(item.detail)}</p></div>`).join("")}</div></section>`;
  }

  function renderDemoClose(summary) {
    const track = getActiveTrack();
    const actions = actionPlan(summary);
    const firstIssue = summary.issues[0];
    return `<section class="section-grid-2"><article class="card"><div class="section-head"><h3>30 秒收口话术</h3><span>${safe(track.label)}</span></div><div class="priority-card"><strong>结论化表达</strong><p>${safe(`这套 Demo 的重点不是展示流程，而是证明系统能把杂乱员工数据自动转成组织洞察。当前最重要的问题是“${firstIssue ? firstIssue.title : summary.headline}”，所以我会优先建议 ${actions.now[0] || summary.priority}`)}</p></div></article><article class="card"><div class="section-head"><h3>如果被追问</h3><span>把问题回答得更像分析师</span></div><div class="priority-card"><strong>为什么这不是普通看板</strong><p>因为它不只展示结果，还能解释问题来源、预测未来暴露，并给出按时间层拆分的行动建议。</p></div><div class="priority-card"><strong>AI 体现在哪里</strong><p>AI 体现在字段识别、数据清洗、问题归纳、风险提示和汇报式摘要生成，而不是一个聊天入口。</p></div></article></section>`;
  }

  function reviewRows() {
    return state.employees.filter((row) => (state.selectedDepartment === "All" || row.department === state.selectedDepartment) && (state.selectedJobLevel === "All" || row.job_level === state.selectedJobLevel));
  }

  function buildNineBox(rows) {
    const cells = [];
    for (let y = 3; y >= 1; y -= 1) {
      for (let x = 1; x <= 3; x += 1) {
        const key = `${x}-${y}`;
        cells.push({ key, x, y, title: ["低绩效", "稳态绩效", "高绩效"][x - 1] + " / " + ["低潜", "中潜", "高潜"][y - 1], employees: rows.filter((row) => row.ninebox.x === x && row.ninebox.y === y) });
      }
    }
    return cells;
  }

  function getCriticalRoles(rows) {
    const map = new Map();
    rows.filter((row) => row.critical_role_flag === "Y").forEach((row) => {
      const key = `${row.department} / ${row.position_title}`;
      if (!map.has(key)) map.set(key, { key, department: row.department, position: row.position_title, incumbent: row, candidates: [] });
    });
    Array.from(map.values()).forEach((role) => {
      role.candidates = rows.filter((row) => row.employee_id !== role.incumbent.employee_id && (row.department === role.department || row.job_family === role.incumbent.job_family)).map((row) => ({ ...row, candidateScore: row.succession.score + (row.successor_nomination_flag === "Y" ? 10 : 0) + (row.shl.tier === "A" ? 6 : 0) - (row.flight_risk === "High" ? 10 : 0) })).sort((a, b) => b.candidateScore - a.candidateScore).slice(0, 4);
      role.riskScore = role.candidates[0] ? 100 - role.candidates[0].succession.score + (role.incumbent.successor_nomination_flag !== "Y" ? 10 : 0) : 100;
    });
    return Array.from(map.values()).sort((a, b) => b.riskScore - a.riskScore);
  }

  function findEmployee(id) {
    return state.employees.find((item) => item.employee_id === id) || null;
  }

  function renderBars(items) {
    const max = Math.max(1, ...items.map((item) => item.value));
    return `<div class="bars">${items.map((item) => `<div class="bar-row"><span>${safe(item.label)}</span><div class="bar-track"><div class="bar-fill" style="width:${(item.value / max) * 100}%;background:${item.color}"></div></div><strong>${safe(item.value)}</strong></div>`).join("")}</div>`;
  }

  function renderGuideCards(items) {
    return `<section class="grid-kpi drill-grid">${(items || []).map((item) => `<a class="card quick-link" href="#${safe(item.route)}"><strong>${safe(item.label)}</strong><small>${safe(item.reason)}</small></a>`).join("")}</section>`;
  }

  function renderProfileCard(employee, title, openButton) {
    if (!employee) return `<article class="card"><div class="section-head"><h3>${safe(title || "员工画像")}</h3><span>请选择员工</span></div><div class="empty-state">请从列表中选择一位员工查看画像。</div></article>`;
    return `<article class="card"><div class="section-head"><h3>${safe(title || "员工画像")}</h3><span>${safe(employee.name)}</span></div><div class="profile-grid"><div><span>基础信息</span><strong>${safe(employee.department + " / " + employee.position_title)}</strong></div><div><span>绩效 / 潜力 / 准备度</span><strong>${safe(employee.performance_current + " / " + potentialText(employee.potential_level) + " / " + readinessText(employee.succession.band))}</strong></div><div><span>关键人才 / 覆盖深度</span><strong>${safe((employee.key_talent_flag === "Y" ? "关键人才" : "普通人才") + " / " + employee.succession_depth + " 层")}</strong></div><div><span>关键风险</span><strong>${safe(employee.riskTags.length ? employee.riskTags.join("、") : "当前无明显风险标签")}</strong></div></div><div class="insight-line"><strong>高潜解释</strong><p>${safe(`${employee.name} 的 SHL 综合得分 ${employee.shl.score}，当前更像一位${employee.shl.tier === "A" ? "值得重点培养的高潜人才" : employee.shl.tier === "B" ? "具备发展空间的骨干" : "需要继续观察的人才"}。`)}</p></div><div class="insight-line"><strong>继任解释</strong><p>${safe(`当前继任准备度为“${readinessText(employee.succession.band)}”，综合得分 ${employee.succession.score}。`)}</p></div><div class="insight-line"><strong>培养建议</strong><p>${safe(employee.shl.tier === "A" && employee.succession.band !== "Ready Now" ? "建议优先安排带人任务、跨部门项目和关键岗位影子学习。" : employee.flight_risk === "High" ? "建议同时做保留和发展，避免高绩效与高离职风险叠加成组织暴露。" : "建议围绕岗位匹配度和关键经验补齐，把绩效逐步转成继任准备度。")}</p></div>${openButton ? `<div class="button-row push-top"><button class="btn btn-secondary" data-action="open-profile">查看完整画像</button></div>` : ""}</article>`;
  }

  function renderProfileDrawer(employee, title) {
    return `<details class="card detail-drawer"><summary>${safe(title || "查看画像")}</summary>${renderProfileCard(employee, title || "画像", true)}</details>`;
  }

  function demoPreviewModel() {
    const metadata = (demo.clean && demo.clean.metadata) || demo.metadata || {};
    return {
      company: metadata.company_name || "澄曜科技",
      industry: metadata.industry || "企业软件 / 数字科技",
      size: state.employees.length,
      departments: unique(state.employees.map((row) => row.department)).length,
      issueTags: metadata.org_risks || [
        "研发中心：高潜储备不低，但现在可接任管理梯队偏薄",
        "销售增长：当前业绩强，但头部依赖重、保留风险高",
        "交付运营：运行稳定，但成长动能不足、后备薄",
        "产品与设计：关键岗位集中，单点依赖明显",
        "支持职能：人力、财务、IT 的继任暴露容易被低估"
      ]
    };
  }

  function actionMeta(text) {
    if (/后备|关键岗位|接任|继任/.test(text)) return { target: "关键岗位与后备梯队", purpose: "缩小 ready-now 空窗" };
    if (/高风险|保留|流失/.test(text)) return { target: "高风险核心人才", purpose: "降低头部流失冲击" };
    if (/高潜|培养|带人|历练/.test(text)) return { target: "高潜与中坚骨干", purpose: "把潜力转成可用梯队" };
    if (/校准|滚动|机制/.test(text)) return { target: "业务负责人和人力伙伴", purpose: "形成持续盘点节奏" };
    return { target: "核心团队", purpose: "稳定人才供给" };
  }

  function detailedActionPlan(summary) {
    const plan = actionPlan(summary);
    return {
      immediate: plan.now.map((text) => ({ action: text, ...actionMeta(text) })),
      mid: plan.soon.map((text) => ({ action: text, ...actionMeta(text) })),
      bench: plan.later.map((text) => ({ action: text, ...actionMeta(text) }))
    };
  }

  function topIssueCards(summary) {
    return summary.issues.slice(0, 4).map((item) => ({
      title: item.title,
      phenomenon: item.detail,
      rootCause: item.rootCause || "当前结构信号说明潜力、岗位覆盖与培养动作之间仍然没有完全打通。",
      likelyConsequence: item.likelyConsequence || item.predict || "如果不处理，当前问题会在业务扩张或人员变化时被放大。",
      managementRead: item.managementRead || "当前问题更像结构性风险，而不是单点异常。",
      judgment: item.recommendedMove || item.actionNow || summary.priority
    }));
  }

  function departmentStoryCards(summary) {
    const stories = [
      { key: "研发中心", label: "研发中心", insight: "研发增长快于管理梯队成熟速度" },
      { key: "销售增长", label: "销售增长", insight: "强业绩掩盖了脆弱的接班深度" },
      { key: "交付运营", label: "交付运营", insight: "稳定产出并不等于长期健康" },
      { key: "产品与设计", label: "产品与设计", insight: "产品关键岗位暴露高度集中" },
      { key: "客户成功", label: "客户成功", insight: "团队规模不小，但高潜识别偏弱" }
    ];
    return stories.map((item) => {
      const dept = summary.summary[item.key] || { count: 0, hipoA: 0, readyNow: 0, highPerf: 0, uncoveredRoles: 0 };
      return {
        title: item.insight,
        detail: `${item.label} ${dept.count} 人，高潜 ${dept.hipoA}，现在可接任 ${dept.readyNow}，无后备关键岗 ${dept.uncoveredRoles}。`
      };
    });
  }

  function benchGapCards(rows, summary) {
    const highPerfNotReady = countBy(rows, (row) => scorePerformance(row.performance_current) >= 4 && row.succession.band !== "Ready Now");
    const highPotentialNotReady = countBy(rows, (row) => row.shl.tier === "A" && row.succession.band !== "Ready Now");
    const operations = summary.summary["交付运营"] || { hipoA: 0, readySoon: 0 };
    return [
      { title: "高绩效并不等于梯队成熟", detail: `${highPerfNotReady} 位高绩效员工尚未进入现在可接任梯队，强结果没有自动转成可接班深度。` },
      { title: "高潜集中不等于管理准备充分", detail: `${highPotentialNotReady} 位高潜 A 还没有进入现在可接任梯队，潜力转化慢于业务需求。` },
      { title: "运营稳定不等于长期健康", detail: `交付运营高潜 ${operations.hipoA}、1-2 年可接任 ${operations.readySoon || 0}，稳定更多来自惯性而不是后备供给。` }
    ];
  }

  function singlePointRoles(roles) {
    return roles.filter((role) => role.candidates.length <= 1 || (role.candidates[0] && (!role.candidates[1] || role.candidates[0].candidateScore - role.candidates[1].candidateScore >= 12))).slice(0, 4);
  }

  function supportRiskRoles(roles) {
    return roles.filter((role) => ["人力资源", "财务法务", "IT与数据平台"].includes(role.department)).slice(0, 4);
  }

  function normalizationActions() {
    return [
      `统一绩效/潜力/准备度口径 ${state.mappingMeta.matchedFields.length} 个字段`,
      `自动去重与空格清洗 ${state.quality.autoFixed.filter((item) => /去重|空格/.test(item.title)).length} 项`,
      `日期归一和异常标记 ${state.quality.autoFixed.filter((item) => /日期/.test(item.title)).length + state.quality.caution.filter((item) => /异常/.test(item.title)).length} 项`,
      `保留低置信提示 ${state.mappingMeta.lowConfidenceFields.length} 项`
    ];
  }

  function renderHome() {
    const preview = demoPreviewModel();
    const priority = executiveSummary(state.employees).priority;
    return `<section class="hero hero-v2 card home-hero"><div class="hero-copy"><div class="tag">AI 人才盘点与继任诊断作品</div><h2>把员工数据转成可汇报的组织诊断</h2><p>这不是流程后台，而是一套面向人力资源面试展示的分析工作台。系统会先理解数据，再给出组织判断、风险前瞻和动作建议。</p><div class="hero-actions"><button class="btn btn-primary" data-action="try-demo">体验官方演示版</button><label class="btn btn-secondary upload-inline">上传员工数据<input id="upload-input" type="file" accept=".csv,.xlsx" hidden></label></div><div class="hero-note">${safe(state.uploadNote)}</div></div><div class="preview-board"><div class="preview-board-head"><span>演示驾驶舱</span><strong>${safe(preview.company)}</strong></div><div class="preview-score"><span>2 分钟内可讲清的内容</span><strong>当前状态、三类问题、未来风险、优先动作</strong></div><div class="preview-metrics"><div><span>公司规模</span><strong>${safe(`${preview.size} 人`)}</strong></div><div><span>组织单元</span><strong>${safe(`${preview.departments} 个`)}</strong></div><div><span>当前优先动作</span><strong>${safe(priority)}</strong></div></div><div class="preview-findings">${preview.issueTags.slice(0, 3).map((item) => `<div class="preview-finding"><strong>${safe(item)}</strong></div>`).join("")}</div></div></section><section class="section-grid-3 home-value-grid"><article class="card value-card"><span>AI 数据结构化</span><strong>自动识别常见人力字段并统一分析口径</strong></article><article class="card value-card"><span>组织诊断能力</span><strong>把人才断层、继任暴露和伪强项显性化</strong></article><article class="card value-card"><span>汇报输出能力</span><strong>生成可直接拿去讲的管理语言与动作建议</strong></article></section><section class="section-grid-2"><article class="card"><div class="section-head"><h3>演示公司预览</h3><span>官方讲述版样本</span></div><div class="story-grid"><div><strong>公司</strong><p>${safe(preview.company)}</p></div><div><strong>行业</strong><p>${safe(preview.industry)}</p></div><div><strong>人数</strong><p>${safe(`${preview.size} 人`)}</p></div><div><strong>部门</strong><p>${safe(`${preview.departments} 个部门`)}</p></div></div><div class="issue-chip-grid push-top">${preview.issueTags.map((item) => `<span class="tag warning">${safe(item)}</span>`).join("")}</div></article><article class="card"><div class="section-head"><h3>分析流程</h3><span>结果导向，不做重流程</span></div><div class="workflow-strip workflow-strip-v2"><div><span>步骤 1</span><strong>体验演示版 / 上传数据</strong></div><div><span>步骤 2</span><strong>自动识别与归一</strong></div><div><span>步骤 3</span><strong>组织诊断</strong></div><div><span>步骤 4</span><strong>汇报输出</strong></div></div><div class="priority-card push-top"><strong>上传说明</strong><p>支持 Excel / CSV，允许字段名不统一，系统会先给出可信度判断，再进入分析。</p><div class="button-row push-top"><button class="btn btn-secondary" data-action="try-dirty-demo">加载 AI 清洗演示版</button></div></div></article></section>`;
  }

  function renderOverview() {
    const summary = executiveSummary(state.employees);
    const actions = detailedActionPlan(summary);
    const signals = predictSignals(summary);
    const ninebox = buildNineBox(state.employees);
    const issueCards = topIssueCards(summary);
    const stateCards = [
      { label: "高潜占比", value: `${Math.round((summary.kpis.hipoA / Math.max(1, state.employees.length)) * 100)}%`, note: "储备并不低，但转化速度慢于组织需求。" },
      { label: "现在可接任", value: summary.kpis.readyNow, note: "可立即接任的人数仍然偏薄。" },
      { label: "关键岗位覆盖率", value: `${summary.kpis.coverage}%`, note: summary.kpis.coverage < 70 ? "覆盖不足，关键岗位暴露真实存在。" : "覆盖可用，但深度不够均衡。" },
      { label: "风险岗位数", value: summary.kpis.uncovered, note: "这些岗位最容易在人员变化时放大风险。" }
    ];
    const presenter = state.uploadMode === "demo" ? `<details class="card presenter-note"><summary>演示者备注</summary><p>先用总览标题定调，再讲 3 个最重要问题，最后用“立即动作”收口并下钻到证据页。</p></details>` : "";
    return `<section class="executive-hero card"><div class="executive-main"><div class="tag">总览判断</div><h2>${safe(summary.headline)}</h2><p>${safe(summary.state)}</p><div class="summary-kpis"><div><span>风险等级</span><strong>${safe(summary.riskLevel)}</strong></div><div><span>立即优先动作</span><strong>${safe(summary.priority)}</strong></div></div></div><div class="executive-side">${summary.issues.slice(0, 3).map((item) => `<div class="summary-point"><strong>${safe(item.title)}</strong><span>${safe(item.detail)}</span></div>`).join("")}</div></section>${presenter}<section class="card"><div class="section-head"><h3>当前状态</h3><span>只保留 4 个最关键证据</span></div><div class="grid-kpi">${stateCards.map((item) => `<article class="card kpi-card"><span>${safe(item.label)}</span><strong>${safe(item.value)}</strong><small>${safe(item.note)}</small></article>`).join("")}</div><div class="section-grid-2 push-top"><article class="card"><div class="section-head"><h3>部门差异</h3><span>只讲最有故事的团队</span></div><div class="story-grid">${departmentStoryCards(summary).slice(0, 4).map((item) => `<div><strong>${safe(item.title)}</strong><p>${safe(item.detail)}</p></div>`).join("")}</div></article><article class="card"><div class="section-head"><h3>九宫格证据</h3><span>九宫格是证据，不是主角</span></div>${renderBars(ninebox.filter((cell) => cell.employees.length).sort((a, b) => b.employees.length - a.employees.length).slice(0, 4).map((cell) => ({ label: cell.title, value: cell.employees.length, color: cell.key === "3-3" ? "var(--primary)" : cell.key === "3-2" ? "#4a7cff" : "var(--warning)" })))}<div class="priority-card push-top"><strong>怎么看</strong><p>右上格代表核心高潜，右中格代表高绩效但接班尚未成熟的人群。</p></div></article></div></section><section class="card"><div class="section-head"><h3>重点问题</h3><span>只留 3 张最强问题卡</span></div><div class="section-grid-3">${issueCards.slice(0, 3).map((item) => `<article class="card insight-card"><div class="insight-line"><strong>${safe(item.title)}</strong><p>${safe(item.phenomenon)}</p></div><div class="insight-line"><strong>为什么重要</strong><p>${safe(item.likelyConsequence)}</p></div><div class="insight-line"><strong>管理判断</strong><p>${safe(item.managementRead)}</p></div></article>`).join("")}</div></section><section class="section-grid-2"><article class="card"><div class="section-head"><h3>原因解释</h3><span>用根因卡解释，不重复现象</span></div>${issueCards.slice(0, 3).map((item) => `<div class="priority-card"><strong>${safe(item.title)}</strong><p>${safe(item.rootCause)}</p></div>`).join("")}</article><article class="card"><div class="section-head"><h3>当前优先聚焦</h3><span>现在先盯两件事</span></div>${actions.immediate.slice(0, 2).map((item) => `<div class="priority-card"><strong>${safe(item.action)}</strong><p>${safe(`${item.target} · ${item.purpose}`)}</p></div>`).join("")}</article></section><section class="section-grid-2"><article class="card"><div class="section-head"><h3>风险前瞻</h3><span>未来 6-12 个月</span></div>${signals.slice(0, 4).map((text) => `<div class="priority-card"><strong>${safe(text)}</strong></div>`).join("")}</article><article class="card"><div class="section-head"><h3>行动建议</h3><span>立即动作 / 中期动作 / 梯队建设</span></div><div class="time-list"><div><strong>立即动作</strong><p>${safe(actions.immediate.map((item) => item.action).join(" "))}</p></div><div><strong>中期动作</strong><p>${safe(actions.mid.map((item) => item.action).join(" "))}</p></div><div><strong>梯队建设</strong><p>${safe(actions.bench.map((item) => item.action).join(" "))}</p></div></div></article></section>${renderGuideCards([{ route: "review", label: "查看人才盘点证据", reason: "继续看人才密度、伪强项和梯队断层" }, { route: "succession", label: "查看继任暴露证据", reason: "继续看覆盖、空窗和单点依赖" }, { route: "health", label: "查看数据可信度", reason: "继续看系统自动识别和自动修复了什么" }, { route: "report", label: "进入汇报报告", reason: "进入可直接展示的中文汇报稿" }])}`;
  }
  function renderTalentReview() {
    const rows = reviewRows();
    const cells = buildNineBox(rows);
    const selectedCell = cells.find((cell) => cell.key === state.selectedNineBoxKey) || cells.find((cell) => cell.employees.length) || cells[0];
    const cellEmployees = (selectedCell ? selectedCell.employees : []).slice().sort((a, b) => b.shl.score - a.shl.score);
    const selectedEmployee = findEmployee(state.selectedEmployeeId) || cellEmployees[0] || rows[0] || null;
    const summary = executiveSummary(rows);
    const departments = summarizeDepartments(rows);
    const misleading = benchGapCards(rows, { summary: departments });
    const focusDepartments = ["研发中心", "销售增长", "交付运营", "客户成功"].filter((department) => departments[department]);
    return `<section class="executive-summary card"><div class="executive-main"><div class="tag">人才快照</div><h2>${safe(summary.kpis.hipoA > summary.kpis.readyNow ? "人才储备并不差，但梯队成熟度弱于绩效表象" : "人才密度总体可用，但不同团队之间的梯队转化并不均衡")}</h2><p>${safe(`当前样本 ${rows.length} 人。高潜 A ${summary.kpis.hipoA}，现在可接任 ${summary.kpis.readyNow}，高绩效但未进入现在可接任梯队 ${countBy(rows, (row) => scorePerformance(row.performance_current) >= 4 && row.succession.band !== "Ready Now")} 人。`)}</p></div><div class="executive-side"><div class="summary-point"><strong>这一页证明什么</strong><span>人才密度、结构断层与伪强项。</span></div></div></section><section class="section-grid-3"><article class="card"><div class="section-head"><h3>结构判断 1</h3><span>人才集中在哪里</span></div><div class="priority-card"><strong>${safe(departmentStoryCards(summary)[0].title)}</strong><p>${safe(departmentStoryCards(summary)[0].detail)}</p></div></article><article class="card"><div class="section-head"><h3>结构判断 2</h3><span>哪些强项具有误导性</span></div><div class="priority-card"><strong>${safe(misleading[0].title)}</strong><p>${safe(misleading[0].detail)}</p></div></article><article class="card"><div class="section-head"><h3>结构判断 3</h3><span>哪里最薄</span></div><div class="priority-card"><strong>${safe(topIssueCards(summary)[0].title)}</strong><p>${safe(topIssueCards(summary)[0].phenomenon)}</p></div></article></section><section class="card"><div class="section-head"><h3>九宫格证据</h3><span>先讲组织，再看个体</span></div><div class="filter-row"><select class="filter-select" data-filter="department"><option value="All">全部部门</option>${unique(state.employees.map((row) => row.department)).map((department) => `<option value="${safe(department)}" ${state.selectedDepartment === department ? "selected" : ""}>${safe(department)}</option>`).join("")}</select><select class="filter-select" data-filter="jobLevel"><option value="All">全部职级</option>${unique(state.employees.map((row) => row.job_level)).map((level) => `<option value="${safe(level)}" ${state.selectedJobLevel === level ? "selected" : ""}>${safe(level)}</option>`).join("")}</select><span class="status info">当前样本 ${rows.length} 人</span></div><div class="ninebox-grid push-top">${cells.map((cell) => `<button class="ninebox-cell ${selectedCell && selectedCell.key === cell.key ? "active" : ""}" data-ninebox="${safe(cell.key)}"><span class="cell-title">${safe(cell.title)}</span><strong>${safe(cell.employees.length)}</strong><small>${safe(cell.key === "3-3" ? "高潜集中区" : cell.key === "3-2" ? "高绩效但梯队未成熟" : cell.key === "2-1" ? "稳定但成长有限" : "结构证据")}</small></button>`).join("")}</div><div class="priority-card push-top"><strong>${safe(selectedCell && selectedCell.key === "3-3" ? "高潜集中并不等于梯队成熟" : selectedCell && selectedCell.key === "3-2" ? "高绩效集中区暴露出接班不足" : "当前格子更适合说明结构差异")}</strong><p>${safe(selectedCell && selectedCell.employees.length ? `当前格子 ${selectedCell.employees.length} 人。` : "当前格子暂无代表员工。")}</p></div></section><section class="section-grid-2"><article class="card"><div class="section-head"><h3>部门判断卡</h3><span>只讲最有故事的 4 个部门</span></div><div class="story-grid">${focusDepartments.map((department) => `<div><strong>${safe(department)}</strong><p>${safe(`${departments[department].count} 人，高潜 ${departments[department].hipoA}，现在可接任 ${departments[department].readyNow}，高绩效 ${departments[department].highPerf}。`)}</p></div>`).join("")}</div></article><article class="card"><div class="section-head"><h3>伪强项</h3><span>比弱项更容易误导判断</span></div>${misleading.map((item) => `<div class="priority-card"><strong>${safe(item.title)}</strong><p>${safe(item.detail)}</p></div>`).join("")}</article></section><section class="section-grid-2"><article class="card"><div class="section-head"><h3>梯队断层</h3><span>哪里最容易断档</span></div>${topIssueCards(summary).filter((item) => /梯队|高潜|成熟|转化|储备/.test(item.title + item.rootCause + item.managementRead)).slice(0, 3).map((item) => `<div class="priority-card"><strong>${safe(item.title)}</strong><p>${safe(item.phenomenon)}</p></div>`).join("")}</article><article class="card"><div class="section-head"><h3>AI 人才洞察</h3><span>可直接拿来讲的判断</span></div>${departmentStoryCards(summary).slice(0, 4).map((item) => `<div class="priority-card"><strong>${safe(item.title)}</strong><p>${safe(item.detail)}</p></div>`).join("")}</article></section>${renderProfileDrawer(selectedEmployee, "查看人才样本")}`;
  }

  function renderSuccession() {
    const roles = getCriticalRoles(state.employees);
    const selectedRole = roles.find((role) => role.key === state.selectedRoleKey) || roles[0] || null;
    const selectedEmployee = findEmployee(state.selectedEmployeeId) || (selectedRole && selectedRole.candidates[0]) || null;
    const summary = executiveSummary(state.employees);
    const singlePoints = singlePointRoles(roles);
    const supportRoles = supportRiskRoles(roles);
    const coverageCards = [
      { label: "关键岗位数", value: summary.kpis.criticalRoles, note: "关键岗位数量决定组织的真实接班压力。" },
      { label: "已覆盖岗位", value: summary.kpis.coveredCriticalRoles, note: "被提名不等于可用，覆盖只是第一层。" },
      { label: "现在可接任", value: summary.kpis.readyNow, note: "真正能马上接上的人数依然有限。" },
      { label: "1-2 年可接任", value: countBy(state.employees, (row) => row.succession.band === "Ready in 1-2 Years"), note: "这是最值得培养的近中期梯队池。" },
      { label: "无后备岗位", value: summary.kpis.uncovered, note: "这些岗位是最直接的继任空窗。" }
    ];
    return `<section class="executive-summary card"><div class="executive-main"><div class="tag">继任健康判断</div><h2>${safe(summary.kpis.coverage < 70 ? "关键岗位覆盖已经可见，但后备深度仍然偏薄" : "名义覆盖可用，但过多岗位仍然依赖单一候选人")}</h2><p>${safe(`关键岗位 ${summary.kpis.criticalRoles} 个，已覆盖 ${summary.kpis.coveredCriticalRoles} 个，现在可接任 ${summary.kpis.readyNow} 人。`)}</p></div><div class="executive-side"><div class="summary-point"><strong>这一页证明什么</strong><span>覆盖、空窗、单点依赖与支持职能风险。</span></div></div></section><section class="section-grid-3"><article class="card"><div class="section-head"><h3>无后备</h3><span>没有明确后备</span></div><div class="priority-card"><strong>${safe(summary.kpis.uncovered)}</strong><p>这些岗位是最直接的继任空窗。</p></div></article><article class="card"><div class="section-head"><h3>名义覆盖但弱</h3><span>表面有覆盖，深度不够</span></div><div class="priority-card"><strong>${safe(Math.max(0, singlePoints.length - summary.kpis.uncovered))}</strong><p>这些岗位往往只依赖一个明显候选。</p></div></article><article class="card"><div class="section-head"><h3>单点依赖</h3><span>过度绑定单个人</span></div><div class="priority-card"><strong>${safe(singlePoints.length)}</strong><p>覆盖数量不能代表可用深度。</p></div></article></section><section class="card"><div class="section-head"><h3>覆盖快照</h3><span>每个指标都带判断</span></div><div class="grid-kpi">${coverageCards.map((item) => `<article class="card kpi-card"><span>${safe(item.label)}</span><strong>${safe(item.value)}</strong><small>${safe(item.note)}</small></article>`).join("")}</div></section><section class="section-grid-2"><article class="card"><div class="section-head"><h3>单点依赖</h3><span>优先级高于热力图</span></div>${singlePoints.length ? singlePoints.map((role) => `<div class="priority-card"><strong>${safe(role.key)}</strong><p>${safe(role.candidates[0] ? `${role.candidates[0].name} 是当前唯一或明显领先的候选人。` : "当前没有明确候选人。")}</p></div>`).join("") : `<div class="empty-state">当前未识别到显著单点依赖岗位。</div>`}</article><article class="card"><div class="section-head"><h3>支持职能风险</h3><span>小部门风险最容易被忽视</span></div>${supportRoles.length ? supportRoles.map((role) => `<div class="priority-card"><strong>${safe(role.key)}</strong><p>${safe(role.candidates[0] ? `${role.candidates[0].name} 是当前最佳候选，准备度 ${readinessText(role.candidates[0].succession.band)}。` : "当前没有明确候选。")}</p></div>`).join("") : `<div class="empty-state">当前没有可展示的支持职能关键岗位。</div>`}</article></section><section class="section-grid-2"><article class="card"><div class="section-head"><h3>岗位风险热力图</h3><span>危险区证据</span></div><div class="heatmap-grid">${roles.slice(0, 9).map((role) => { const best = role.candidates[0]; const alpha = Math.max(0.2, Math.min(0.88, (best ? best.succession.score : 36) / 100)); return `<button class="heat-cell ${selectedRole && selectedRole.key === role.key ? "active" : ""}" data-role="${safe(role.key)}" style="background: rgba(47,107,255,${alpha})"><strong>${safe(role.department)}</strong><span>${safe(role.position)}</span><em>${safe(best ? readinessText(best.succession.band) : "暂无后备")}</em></button>`; }).join("")}</div></article><article class="card"><div class="section-head"><h3>岗位详情</h3><span>${safe(selectedRole ? selectedRole.key : "暂无岗位")}</span></div><div class="priority-card"><strong>${safe(selectedRole && selectedRole.candidates[0] ? `${selectedRole.candidates[0].name} 是当前最优候选` : "当前没有可用后备")}</strong><p>${safe(selectedRole && selectedRole.candidates[0] ? `${readinessText(selectedRole.candidates[0].succession.band)}，综合分 ${selectedRole.candidates[0].succession.score}。` : "这类岗位属于立即需要命名后备的风险点。")}</p></div></article></section><section class="card"><div class="section-head"><h3>AI 继任洞察</h3><span>可直接用于汇报的继任判断</span></div>${topIssueCards(summary).filter((item) => /覆盖|风险|依赖|梯队|接班|岗位|继任|空窗/i.test(item.title + item.rootCause + item.managementRead)).slice(0, 4).map((item) => `<div class="priority-card"><strong>${safe(item.title)}</strong><p>${safe(item.phenomenon)}</p></div>`).join("")}</section>${renderProfileDrawer(selectedEmployee, "查看候选人画像")}`;
  }

  function healthRowsByTab(tab) {
    if (tab === "autoFixed") return state.quality.autoFixed;
    if (tab === "caution") return state.quality.caution;
    return state.quality.risk;
  }

  function renderHealth() {
    const quality = state.quality;
    const rows = healthRowsByTab(state.activeHealthTab);
    const selectedIssue = rows[state.selectedHealthIndex] || rows[0] || null;
    const verdict = quality.confidence.score >= 82 ? "可以直接演示" : quality.confidence.score >= 68 ? "可以分析，但要带风险提示" : "需要先清理再汇报";
    return `<section class="executive-summary card"><div class="executive-main"><div class="tag">可信度结论</div><h2>${safe(verdict)}</h2><p>${safe(`已识别 ${state.mappingMeta.matchedFields.length} 个分析字段，低置信字段 ${state.mappingMeta.lowConfidenceFields.length} 个，关键风险 ${quality.risk.length} 项。`)}</p></div><div class="executive-side"><div class="summary-point"><strong>当前可信度</strong><span>${safe(`${quality.confidence.score} / ${quality.confidence.label}`)}</span></div><div class="summary-point"><strong>会影响什么</strong><span>${safe(quality.risk.length ? "继任判断和组织结构解释需要带着风险提示看。" : "当前结果足以直接进入组织诊断和汇报。")}</span></div></div></section><section class="section-grid-2"><article class="card"><div class="section-head"><h3>自动识别了什么</h3><span>系统先理解，再分析</span></div><div class="story-grid"><div><strong>已识别字段</strong><p>${safe(`${state.mappingMeta.matchedFields.length} 个字段进入主分析链路`)}</p></div><div><strong>低置信字段</strong><p>${safe(`${state.mappingMeta.lowConfidenceFields.length} 个字段建议人工复核`)}</p></div><div><strong>未使用字段</strong><p>${safe(`${state.mappingMeta.unmappedHeaders.length} 个字段未影响当前分析`)}</p></div><div><strong>当前建议</strong><p>${safe(verdict)}</p></div></div></article><article class="card"><div class="section-head"><h3>自动修复了什么</h3><span>AI 自动做了什么</span></div>${normalizationActions().map((item) => `<div class="priority-card"><strong>${safe(item)}</strong></div>`).join("")}</article></section><section class="section-grid-2"><article class="card"><div class="section-head"><h3>需谨慎的地方</h3><span>诚实指出不稳的位置</span></div>${(state.mappingMeta.lowConfidenceFields.length ? state.mappingMeta.lowConfidenceFields : ["当前低置信字段较少"]).slice(0, 6).map((field) => `<div class="priority-card"><strong>${safe(field)}</strong><p>${safe(field === "当前低置信字段较少" ? "当前自动识别结果较稳定。" : "该字段通过相似命名推断得到，建议人工确认口径。")}</p></div>`).join("")}</article><article class="card"><div class="section-head"><h3>影响范围</h3><span>这些问题会影响什么</span></div><div class="grid-kpi"><article class="card kpi-card"><span>已自动修复</span><strong>${quality.autoFixed.length}</strong><small>这些问题已不再阻断主分析链路。</small></article><article class="card kpi-card"><span>需谨慎解读</span><strong>${quality.caution.length}</strong><small>这些问题会影响高潜或部门对比的精度。</small></article><article class="card kpi-card"><span>关键风险</span><strong>${quality.risk.length}</strong><small>这些问题会直接影响继任判断与汇报结论。</small></article></div></article></section><section class="card"><div class="section-head"><h3>附录证据</h3><span>问题样本下沉，不抢主视觉</span></div><div class="tabs"><button class="tab ${state.activeHealthTab === "autoFixed" ? "active" : ""}" data-health-tab="autoFixed">已自动修复</button><button class="tab ${state.activeHealthTab === "caution" ? "active" : ""}" data-health-tab="caution">需谨慎解读</button><button class="tab ${state.activeHealthTab === "risk" ? "active" : ""}" data-health-tab="risk">关键风险</button></div>${selectedIssue ? `<div class="priority-card"><strong>${safe(selectedIssue.title)}</strong><p>${safe(selectedIssue.detail)}</p></div>` : `<div class="empty-state">当前分类暂无问题。</div>`}<table class="data-table compact"><thead><tr><th>问题</th><th>字段</th><th>员工</th></tr></thead><tbody>${rows.length ? rows.slice(0, 6).map((item, index) => `<tr class="${state.selectedHealthIndex === index ? "table-row-active" : ""}" data-health-index="${index}"><td>${safe(item.title)}</td><td>${safe(item.field)}</td><td>${safe(item.employeeId)}</td></tr>`).join("") : `<tr><td colspan="3"><div class="empty-state compact-empty">当前分类暂无问题。</div></td></tr>`}</tbody></table></section>`;
  }

  function renderProfile() {
    const employee = findEmployee(state.selectedEmployeeId) || state.employees.slice().sort((a, b) => b.shl.score - a.shl.score)[0];
    if (!employee) return `<section class="card"><div class="empty-state">当前没有可展示的员工画像。</div></section>`;
    return `<section class="executive-summary card"><div class="executive-main"><div class="tag">员工画像</div><h2>${safe(employee.name + " · " + employee.position_title)}</h2><p>${safe(employee.department + " / " + employee.city + " / " + employee.job_level)}</p><div class="summary-kpis"><div><span>绩效 / 潜力</span><strong>${safe(employee.performance_current + " / " + potentialText(employee.potential_level))}</strong></div><div><span>继任准备度</span><strong>${safe(readinessText(employee.succession.band))}</strong></div><div><span>关键身份</span><strong>${safe(employee.critical_role_flag === "Y" ? "关键岗位人才" : "普通岗位人才")}</strong></div></div></div><div class="executive-side"><div class="summary-point"><strong>高潜判断</strong><span>${safe(`${employee.name} 的 SHL 综合得分 ${employee.shl.score}。`)}</span></div><div class="summary-point"><strong>培养建议</strong><span>${safe(employee.shl.tier === "A" && employee.succession.band !== "Ready Now" ? "优先安排带人任务、跨部门项目和关键岗位影子学习。" : employee.flight_risk === "High" ? "建议同时做保留和发展。" : "围绕岗位匹配度和关键经验补齐。")}</span></div><div class="summary-point"><strong>风险提示</strong><span>${safe(employee.riskTags.length ? employee.riskTags.join("、") : "当前无明显风险标签。")}</span></div></div></section><section class="grid-kpi"><article class="card kpi-card"><span>SHL 综合分</span><strong>${safe(employee.shl.score)}</strong></article><article class="card kpi-card"><span>关键经验缺口</span><strong>${safe(employee.critical_experience_gap || "无")}</strong></article><article class="card kpi-card"><span>管理跨度</span><strong>${safe(employee.management_span || 0)}</strong></article><article class="card kpi-card"><span>继任覆盖深度</span><strong>${safe(`${employee.succession_depth} 层`)}</strong></article></section><section class="section-grid-2"><article class="card"><div class="section-head"><h3>SHL 四维表现</h3><span>高潜识别的核心依据</span></div>${renderBars([{ label: "学习敏捷度", value: employee.shl.learning, color: "var(--primary)" }, { label: "领导驱动力", value: employee.shl.leadership, color: "var(--success)" }, { label: "人际影响力", value: employee.shl.influence, color: "#4a7cff" }, { label: "战略认知", value: employee.shl.strategic, color: "var(--warning)" }])}</article><article class="card"><div class="section-head"><h3>继任与发展建议</h3><span>为什么适合或不适合接班</span></div><div class="insight-line"><strong>继任视角</strong><p>${safe(`当前继任准备度为“${readinessText(employee.succession.band)}”，综合得分 ${employee.succession.score}。`)}</p></div><div class="insight-line"><strong>候选身份</strong><p>${safe(employee.successor_nomination_flag === "Y" ? "已进入后备名单，可作为继任梯队讲述样本。" : "目前未进入明确后备名单，适合说明识别盲区或培养缺口。")}</p></div><div class="insight-line"><strong>发展动作</strong><p>${safe(employee.shl.tier === "A" && employee.succession.band !== "Ready Now" ? "优先安排带人任务、跨部门项目和关键岗位影子学习。" : employee.flight_risk === "High" ? "建议同时做保留和发展。" : "围绕岗位匹配度和关键经验补齐。")}</p></div></article></section><section class="section-grid-2"><article class="card"><div class="section-head"><h3>历史趋势</h3><span>用于讲述变化，而不是只看当前点位</span></div><div class="priority-card"><strong>绩效趋势</strong><p>${safe(`去年绩效 ${employee.performance_last_year}，当前绩效 ${employee.performance_current}，可用来说明表现是否稳定提升。`)}</p></div><div class="priority-card"><strong>准备度趋势</strong><p>${safe(employee.succession.band === "Ready Now" ? "已经接近可接任状态，建议尽快做岗位校验。" : "仍处于准备阶段，更适合安排关键经验与带人任务。")}</p></div></article><article class="card"><div class="section-head"><h3>回到主链路</h3><span>把画像重新放回组织诊断上下文</span></div><div class="button-row"><a class="btn btn-secondary" href="#review">回到人才盘点</a><a class="btn btn-secondary" href="#succession">回到继任分析</a><a class="btn btn-primary" href="#report">用于汇报引用</a></div><div class="insight-line"><strong>适合怎么讲</strong><p>先讲此人的当前表现，再讲为什么被识别为高潜或为什么尚未进入可接任状态，最后落到组织层面的培养建议。</p></div></article></section>`;
  }

  function renderReport() {
    const summary = executiveSummary(state.employees);
    const actions = detailedActionPlan(summary);
    const signals = predictSignals(summary);
    const issueCards = topIssueCards(summary);
    return `<section class="report-hero card"><div class="tag">汇报报告</div><h2>一页读懂当前状态、根因判断与优先动作</h2><p>这是一份可直接展示和讲解的中文汇报稿。</p><div class="button-row"><button class="btn btn-primary" data-action="download-report">导出汇报摘要</button><a class="btn btn-secondary" href="#overview">返回总览</a></div></section><section class="executive-summary card"><div class="executive-main"><div class="tag">汇报摘要</div><h2>${safe(summary.headline)}</h2><p>${safe(summary.priority)}</p><div class="summary-kpis"><div><span>当前状态</span><strong>${safe(summary.state)}</strong></div><div><span>风险等级</span><strong>${safe(summary.riskLevel)}</strong></div></div></div><div class="executive-side"><div class="summary-point"><strong>首要问题</strong><span>${safe(issueCards[0] ? issueCards[0].title : summary.headline)}</span></div><div class="summary-point"><strong>优先动作</strong><span>${safe(actions.immediate[0] ? actions.immediate[0].action : summary.priority)}</span></div></div></section><section class="section-grid-2"><article class="card"><div class="section-head"><h3>当前状态</h3><span>现在发生了什么</span></div><div class="priority-card"><strong>${safe(summary.state)}</strong></div></article><article class="card"><div class="section-head"><h3>主要问题</h3><span>当前最值得先讲的 3 个问题</span></div>${issueCards.slice(0, 3).map((item) => `<div class="priority-card"><strong>${safe(item.title)}</strong><p>${safe(item.phenomenon)}</p></div>`).join("")}</article></section><section class="section-grid-2"><article class="card"><div class="section-head"><h3>根因解释</h3><span>回答“为什么会这样”</span></div>${issueCards.slice(0, 3).map((item) => `<div class="priority-card"><strong>${safe(item.title)}</strong><p>${safe(item.rootCause)}</p></div>`).join("")}</article><article class="card"><div class="section-head"><h3>未来风险</h3><span>如果不处理会怎样</span></div>${signals.slice(0, 4).map((text) => `<div class="priority-card"><strong>${safe(text)}</strong></div>`).join("")}</article></section><section class="card"><div class="section-head"><h3>优先动作</h3><span>按优先级排序，而不是按功能分组</span></div><div class="section-grid-3"><article class="card"><div class="section-head"><h3>P1 立即降风险</h3><span>先稳住高暴露点</span></div>${actions.immediate.map((item) => `<div class="priority-card"><strong>${safe(item.action)}</strong><p>${safe(item.purpose)}</p></div>`).join("")}</article><article class="card"><div class="section-head"><h3>P2 近期稳结构</h3><span>缩小近端梯队缺口</span></div>${actions.mid.map((item) => `<div class="priority-card"><strong>${safe(item.action)}</strong><p>${safe(item.purpose)}</p></div>`).join("")}</article><article class="card"><div class="section-head"><h3>P3 补梯队</h3><span>中期建立持续供给</span></div>${actions.bench.map((item) => `<div class="priority-card"><strong>${safe(item.action)}</strong><p>${safe(item.purpose)}</p></div>`).join("")}</article></div></section><section class="card"><div class="section-head"><h3>重点问题卡</h3><span>经得起追问的现象 - 根因 - 后果 - 动作</span></div>${issueCards.map((item, index) => `<div class="priority-card"><strong>${safe(`${index + 1}. ${item.title}`)}</strong><p><b>现象：</b>${safe(item.phenomenon)}</p><p><b>根因：</b>${safe(item.rootCause)}</p><p><b>未来后果：</b>${safe(item.likelyConsequence)}</p><p><b>推荐动作：</b>${safe(item.judgment)}</p></div>`).join("")}</section><details class="card presenter-note"><summary>追问准备</summary><div class="priority-card"><strong>如果被追问“为什么不是单点问题”</strong><p>可以强调：问题不是某一个人或某一个岗位出错，而是潜力转化、后备深度和关键岗位覆盖之间没有形成稳定机制。</p></div><div class="priority-card"><strong>如果被追问“AI 体现在哪里”</strong><p>可以强调：AI 先做字段识别、口径归一、问题检测和洞察归纳，再把分析结果转成可汇报的管理语言。</p></div></details>`;
  }
  function renderShell() {
    const content = state.route === "home" ? renderHome() : state.route === "overview" ? renderOverview() : state.route === "review" ? renderTalentReview() : state.route === "succession" ? renderSuccession() : state.route === "health" ? renderHealth() : state.route === "profile" ? renderProfile() : renderReport();
    const homeMode = state.route === "home";
    return `<div class="shell ${homeMode ? "home-shell" : ""}"><aside class="sidebar ${homeMode ? "home-sidebar" : ""}"><div class="brand"><div class="brand-mark">TP</div><div><div class="brand-title">TalentPulse</div><div class="brand-sub">AI 人才盘点与继任诊断作品</div></div></div><nav class="nav">${visibleRoutes().map((route) => `<a class="nav-item ${state.route === route.key ? "active" : ""}" href="#${route.key}">${safe(route.label)}</a>`).join("")}</nav><div class="sidebar-foot"><div class="small-label">数据来源</div><div class="sidebar-company">${safe(state.sourceName)}</div></div></aside><section class="main"><header class="topbar ${homeMode ? "home-topbar" : ""}"><div><div class="page-eyebrow">结论 → 证据 → 解释 → 风险 → 动作</div><h1>${safe(routeLabel(state.route))}</h1></div><div class="topbar-actions"><button class="btn btn-secondary" data-action="try-demo">官方演示版</button><label class="btn btn-primary upload-inline">上传员工数据<input id="upload-input-top" type="file" accept=".csv,.xlsx" hidden></label></div></header><main class="content ${homeMode ? "home-content" : ""}">${content}</main></section></div>`;
  }

  function render() {
    app.innerHTML = renderShell();
    bindEvents();
  }

  function parseCsv(text) {
    const source = String(text || "").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    if (!source.trim()) return [];
    const splitLine = (line, delimiter) => {
      const cells = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        const next = line[i + 1];
        if (char === '"') {
          if (inQuotes && next === '"') { current += '"'; i += 1; }
          else inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          cells.push(current);
          current = "";
        } else {
          current += char;
        }
      }
      cells.push(current);
      return cells;
    };
    const firstLine = source.split("\n").find((line) => line.trim()) || "";
    const delimiter = [",", "\t", ";", "|"].sort((a, b) => splitLine(firstLine, b).length - splitLine(firstLine, a).length)[0];
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;
    for (let i = 0; i < source.length; i += 1) {
      const char = source[i];
      const next = source[i + 1];
      if (char === '"') {
        if (inQuotes && next === '"') { field += '"'; i += 1; }
        else inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        row.push(field);
        field = "";
      } else if (char === "\n" && !inQuotes) {
        row.push(field);
        if (row.some((item) => String(item || "").trim())) rows.push(row);
        row = [];
        field = "";
      } else {
        field += char;
      }
    }
    row.push(field);
    if (row.some((item) => String(item || "").trim())) rows.push(row);
    if (!rows.length) return [];
    const headers = rows[0].map((item) => String(item || "").trim());
    return rows.slice(1).filter((values) => values.some((item) => String(item || "").trim())).map((values) => {
      const result = {};
      headers.forEach((header, index) => { result[header] = values[index] != null ? String(values[index]).trim() : ""; });
      return result;
    });
  }

  function useRows(rawRows, sourceName, mode) {
    state.sourceName = sourceName;
    state.uploadMode = mode;
    state.rawRows = rawRows.slice();
    state.mappingMeta = autoMapRows(rawRows);
    state.employees = enrichEmployees(state.mappingMeta.rows);
    state.quality = detectQuality(rawRows, state.employees, state.mappingMeta);
  }

  function handleDemo() {
    useRows((demo.clean && demo.clean.employees) || demo.employees || [], "官方讲述版", "demo");
    state.selectedDepartment = "All";
    state.selectedJobLevel = "All";
    state.selectedNineBoxKey = "3-3";
    state.selectedEmployeeId = "";
    state.selectedRoleKey = "";
    state.activeHealthTab = "risk";
    state.selectedHealthIndex = 0;
    state.cleaningView = "after";
    state.demoTrack = "interview";
    state.demoStep = 0;
    state.selectedStoryKey = "engineering";
    state.uploadNote = "已切回官方讲述版，可直接进入总览开始讲述。";
    state.route = "overview";
    window.location.hash = "overview";
    render();
  }

  function handleDirtyDemo() {
    useRows((demo.dirty && demo.dirty.employees) || demo.dirtyEmployees || (demo.clean && demo.clean.employees) || demo.employees || [], "AI 清洗演示版", "upload");
    state.selectedDepartment = "All";
    state.selectedJobLevel = "All";
    state.selectedNineBoxKey = "3-3";
    state.selectedEmployeeId = "";
    state.selectedRoleKey = "";
    state.selectedHealthIndex = 0;
    state.cleaningView = "after";
    state.activeHealthTab = "risk";
    state.uploadNote = "已载入 AI 清洗演示版，可直接展示字段识别、自动修复和可信度说明。";
    state.route = "health";
    window.location.hash = "health";
    render();
  }

  function useUploadedRows(rows, filename) {
    if (!rows || !rows.length) {
      state.uploadNote = "未识别到可用数据，请检查表头、分隔符，或先体验官方讲述版。";
      state.route = "home";
      window.location.hash = "home";
      render();
      return;
    }
    useRows(rows, filename, "upload");
    state.selectedDepartment = "All";
    state.selectedJobLevel = "All";
    state.selectedNineBoxKey = "3-3";
    state.selectedEmployeeId = "";
    state.selectedRoleKey = "";
    state.selectedHealthIndex = 0;
    state.cleaningView = "after";
    state.activeHealthTab = state.quality.risk.length ? "risk" : state.quality.caution.length ? "caution" : "autoFixed";
    const needsHealth = state.quality.confidence.score < 78 || state.quality.risk.length >= 8 || state.mappingMeta.lowConfidenceFields.length >= 3;
    state.uploadNote = needsHealth ? "系统已自动识别字段并完成首轮清洗，但仍有一些低置信或高风险项，已先带你进入数据健康页。" : "系统已自动识别字段并完成清洗，当前可信度足以直接进入总览讲结论。";
    state.route = needsHealth ? "health" : "overview";
    window.location.hash = state.route;
    render();
  }

  function handleFile(file) {
    if (!file) return;
    if (/\.csv$/i.test(file.name)) {
      file.text().then((text) => useUploadedRows(parseCsv(text), file.name));
      return;
    }
    if (/\.xlsx$/i.test(file.name) && window.XLSX) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const workbook = window.XLSX.read(event.target.result, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        useUploadedRows(window.XLSX.utils.sheet_to_json(sheet, { defval: "" }), file.name);
      };
      reader.readAsArrayBuffer(file);
      return;
    }
    state.uploadNote = /\.xlsx$/i.test(file.name) ? "当前环境没有成功加载 XLSX 解析器，请先使用 CSV，或在线上环境直接上传 XLSX。" : "暂不支持该文件类型，请上传 CSV 或 XLSX。";
    render();
  }

  function downloadReport() {
    const summary = executiveSummary(state.employees);
    const actions = detailedActionPlan(summary);
    const issues = topIssueCards(summary);
    const content = [
      "TalentPulse V4 汇报摘要",
      "",
      "一、当前状态",
      summary.state,
      "",
      "二、重点问题",
      issues.map((item) => `- ${item.title}\n  现象：${item.phenomenon}\n  原因：${item.rootCause}\n  风险：${item.likelyConsequence}\n  建议：${item.judgment}`).join("\n"),
      "",
      "三、未来风险",
      predictSignals(summary).map((item) => `- ${item}`).join("\n"),
      "",
      "四、优先动作",
      `- P1：${actions.immediate.map((item) => item.action).join(" ")}`,
      `- P2：${actions.mid.map((item) => item.action).join(" ")}`,
      `- P3：${actions.bench.map((item) => item.action).join(" ")}`
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "澄曜科技-人才诊断汇报摘要.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  function bindEvents() {
    document.querySelectorAll('[data-action="try-demo"]').forEach((node) => { node.onclick = handleDemo; });
    document.querySelectorAll('[data-action="try-dirty-demo"]').forEach((node) => { node.onclick = handleDirtyDemo; });
    document.querySelectorAll('#upload-input, #upload-input-top').forEach((input) => { input.onchange = (event) => handleFile(event.target.files && event.target.files[0]); });
    document.querySelectorAll('[data-demo-track]').forEach((node) => { node.onclick = () => { state.demoTrack = node.getAttribute('data-demo-track') || "interview"; state.demoStep = 0; navigateToRoute(getTrackSteps()[0].route); }; });
    document.querySelectorAll('[data-demo-step]').forEach((node) => { node.onclick = () => { jumpDemoStep(Number(node.getAttribute('data-demo-step') || 0)); }; });
    document.querySelectorAll('[data-demo-next]').forEach((node) => { node.onclick = () => { jumpDemoStep(state.demoStep + 1); }; });
    document.querySelectorAll('[data-demo-prev]').forEach((node) => { node.onclick = () => { jumpDemoStep(state.demoStep - 1); }; });
    document.querySelectorAll('[data-demo-story]').forEach((node) => { node.onclick = () => { state.selectedStoryKey = node.getAttribute('data-demo-story') || "engineering"; render(); }; });
    document.querySelectorAll('[data-demo-jump]').forEach((node) => { node.onclick = () => { navigateToRoute(node.getAttribute('data-demo-jump') || "overview"); }; });
    document.querySelectorAll('[data-employee]').forEach((node) => { node.onclick = () => { state.selectedEmployeeId = node.getAttribute('data-employee'); render(); }; });
    document.querySelectorAll('[data-action="open-profile"]').forEach((node) => { node.onclick = () => { state.route = 'profile'; window.location.hash = 'profile'; render(); }; });
    document.querySelectorAll('[data-role]').forEach((node) => { node.onclick = () => { state.selectedRoleKey = node.getAttribute('data-role'); state.selectedEmployeeId = ''; render(); }; });
    document.querySelectorAll('[data-ninebox]').forEach((node) => { node.onclick = () => { state.selectedNineBoxKey = node.getAttribute('data-ninebox'); state.selectedEmployeeId = ''; render(); }; });
    document.querySelectorAll('[data-health-tab]').forEach((node) => { node.onclick = () => { state.activeHealthTab = node.getAttribute('data-health-tab'); state.selectedHealthIndex = 0; render(); }; });
    document.querySelectorAll('[data-health-index]').forEach((node) => { node.onclick = () => { state.selectedHealthIndex = Number(node.getAttribute('data-health-index') || 0); render(); }; });
    document.querySelectorAll('[data-cleaning-view]').forEach((node) => { node.onclick = () => { state.cleaningView = node.getAttribute('data-cleaning-view'); render(); }; });
    const departmentFilter = document.querySelector('[data-filter="department"]');
    if (departmentFilter) departmentFilter.onchange = (event) => { state.selectedDepartment = event.target.value; state.selectedEmployeeId = ''; render(); };
    const levelFilter = document.querySelector('[data-filter="jobLevel"]');
    if (levelFilter) levelFilter.onchange = (event) => { state.selectedJobLevel = event.target.value; state.selectedEmployeeId = ''; render(); };
    const reportButton = document.querySelector('[data-action="download-report"]');
    if (reportButton) reportButton.onclick = downloadReport;
  }

  function syncRoute() {
    const hash = String(window.location.hash || '').replace('#', '');
    const valid = ROUTES.some((route) => route.key === hash) || hash === 'profile';
    state.route = valid ? (hash || 'home') : 'home';
    const stepIndex = getTrackSteps().findIndex((step) => step.route === state.route);
    if (stepIndex >= 0) state.demoStep = stepIndex;
    if (state.route === 'home') state.demoStep = 0;
    render();
  }

  useRows((demo.clean && demo.clean.employees) || demo.employees || [], '官方讲述版', 'demo');
  window.addEventListener('hashchange', syncRoute);
  syncRoute();
})();
