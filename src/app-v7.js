(function () {
  const app = document.getElementById("app");
  const demo = window.TALENTPULSE_DEMO_V7 || { clean: { employee_master: [], workforce_monthly: [], recruiting_reqs: [], exit_events: [], metadata: {} }, dirty: { employee_master: [], workforce_monthly: [], recruiting_reqs: [], exit_events: [], metadata: {} }, metadata: {} };
  const analysisEngine = window.TalentPulseAnalysisV7 || null;

  const ROUTES = [
    { key: "home", label: "首页" },
    { key: "overview", label: "总览" },
    { key: "operations", label: "组织运营" },
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
    workforceMonthly: [],
    recruitingReqs: [],
    exitEvents: [],
    mappingMeta: { fieldMap: {}, matchedFields: [], lowConfidenceFields: [], unmappedHeaders: [], rows: [] },
    quality: { autoFixed: [], caution: [], risk: [], confidence: { score: 90, label: "高" } },
    selectedDepartment: "All",
    selectedJobLevel: "All",
    selectedOverviewDepartment: "",
    selectedOperationsDepartment: "",
    selectedIssueIndex: 0,
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

  function average(rows, selector) {
    if (!(rows || []).length) return 0;
    return rows.reduce((sum, row) => sum + selector(row), 0) / rows.length;
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
      return analysisEngine.buildDiagnostics({ rows, departmentSummary: summary, roles, workforceMonthly: state.workforceMonthly, recruitingReqs: state.recruitingReqs, exitEvents: state.exitEvents }).issues.map((item) => ({
        title: item.title,
        departments: item.departments || [],
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
      if (route === "operations") guide.push({ route: "operations", label: "再看组织运营", reason: "用三年人数、离职、招聘和内部补位轨迹解释变化来源。" });
      if (route === "review") guide.push({ route: "review", label: "再看人才盘点", reason: "用九宫格和代表人才说明结构差异与高潜转化。" });
      if (route === "succession") guide.push({ route: "succession", label: "再看继任分析", reason: "用岗位暴露和候选梯队解释谁能接上、谁接不上。" });
    });
    guide.push({ route: "report", label: "最后收口到报告", reason: "把现状、原因、风险和建议整理成一页可汇报输出。" });
    return unique(guide.map((item) => item.route)).map((route) => guide.find((item) => item.route === route));
  }

  function executiveSummary(rows) {
    const summary = summarizeDepartments(rows);
    const roles = getCriticalRoles(rows);
    const diagnostics = analysisEngine && analysisEngine.buildDiagnostics ? analysisEngine.buildDiagnostics({ rows, departmentSummary: summary, roles, workforceMonthly: state.workforceMonthly, recruitingReqs: state.recruitingReqs, exitEvents: state.exitEvents }) : null;
    const issues = diagnostics ? diagnostics.issues.map((item) => ({
      title: item.title,
      departments: item.departments || [],
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
    if (/后备|关键岗位|接任|继任/.test(text)) return { target: "关键岗位与后备梯队", purpose: "缩小近端接班空窗" };
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
      departments: item.departments || [],
      route: item.route,
      phenomenon: item.detail,
      rootCause: item.rootCause || "当前结构信号说明潜力、岗位覆盖与培养动作之间仍然没有完全打通。",
      likelyConsequence: item.likelyConsequence || item.predict || "如果不处理，当前问题会在业务扩张或人员变化时被放大。",
      managementRead: item.managementRead || "当前问题更像结构性风险，而不是单点异常。",
      judgment: item.recommendedMove || item.actionNow || summary.priority,
      actionNow: item.actionNow || summary.priority,
      actionSoon: item.actionSoon || "",
      actionLater: item.actionLater || ""
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
  function renderEmployeeDrawerV5(title, employees, selectedEmployee) {
    const samples = (employees || []).slice(0, 6);
    if (!samples.length && !selectedEmployee) return "";
    return `<details class="card detail-drawer"><summary>${safe(title)}</summary><div class="drawer-sample-list">${samples.map((employee) => `<button class="sample-chip ${selectedEmployee && selectedEmployee.employee_id === employee.employee_id ? "active" : ""}" data-employee="${safe(employee.employee_id)}">${safe(employee.name)} · ${safe(employee.position_title)}</button>`).join("")}</div>${renderProfileCard(selectedEmployee || samples[0], title, true)}</details>`;
  }

  function buildDepartmentInsightV5(name, item) {
    const coverage = item.criticalCount ? Math.round(((item.criticalCount - item.uncoveredRoles) / Math.max(1, item.criticalCount)) * 100) : 100;
    const talentDensity = Math.round((item.hipoA / Math.max(1, item.count)) * 100);
    if (talentDensity >= 12 && item.readyNow <= Math.max(1, Math.round(item.hipoA * 0.4))) return "高潜储备不低，但近端梯队偏薄";
    if (item.highPerf >= Math.max(3, Math.round(item.count * 0.18)) && item.highRisk >= Math.max(2, Math.round(item.highPerf * 0.35))) return "当前结果强，但头部依赖偏重";
    if (coverage <= 60 || item.uncoveredRoles >= 2) return "关键岗位覆盖偏薄，岗位暴露明显";
    if (item.hipoA <= 1 && item.readySoon <= 2) return "运行稳定，但成长动能偏弱";
    if (["人力资源", "财务法务", "IT与数据平台"].includes(name) && (item.uncoveredRoles >= 1 || item.readyNow === 0)) return "体量不大，但继任暴露偏高";
    return "当前结构可用，但梯队深度仍需补强";
  }

  function overviewDepartmentsV5(summary) {
    const preferred = ["研发中心", "销售增长", "交付运营", "产品与设计", "客户成功", "人力资源", "财务法务", "IT与数据平台"];
    return preferred.filter((name) => summary.summary[name]).map((name) => {
      const item = summary.summary[name];
      const coverage = item.criticalCount ? Math.round(((item.criticalCount - item.uncoveredRoles) / Math.max(1, item.criticalCount)) * 100) : 100;
      return {
        name,
        item,
        coverage,
        talentDensity: Math.round((item.hipoA / Math.max(1, item.count)) * 100),
        judgment: buildDepartmentInsightV5(name, item)
      };
    });
  }

  function overviewIssueDepartmentsV5(summary, issue) {
    if (!issue) return [];
    if (issue.departments && issue.departments.length) return issue.departments;
    const signals = summary.diagnostics && summary.diagnostics.signals;
    if (!signals) return [];
    if (/高潜|梯队|转化/.test(issue.title)) return (signals.conversionLagDepartments || []).map((item) => item.department);
    if (/业绩|关键人|韧性/.test(issue.title)) return (signals.fragileOutputDepartments || []).map((item) => item.department);
    if (/稳定|停滞/.test(issue.title)) return (signals.stagnationDepartments || []).map((item) => item.department);
    if (/覆盖|岗位|暴露|单点/.test(issue.title)) return (signals.exposureDepartments || []).map((item) => item.department);
    if (/支持职能/.test(issue.title)) return (signals.supportRiskDepartments || []).map((item) => item.department);
    return [];
  }

  function renderHomeV5() {
    const preview = demoPreviewModel();
    const summary = executiveSummary(state.employees);
    return `<section class="home-stage-hero card"><div class="hero-copy"><div class="tag">组织诊断汇报台</div><h2>把员工数据转成可汇报的组织诊断</h2><p>${safe(summary.headline)}</p><div class="hero-actions"><button class="btn btn-primary" data-action="try-demo">体验官方案例</button><label class="btn btn-secondary upload-inline">上传员工数据<input id="upload-input" type="file" accept=".csv,.xlsx" hidden></label></div><div class="hero-note">支持 Excel / CSV，字段名可以不统一，系统会先给可信度判断，再进入分析。</div></div><div class="preview-board"><div class="preview-board-head"><span>官方案例预览</span><strong>${safe(preview.company)}</strong></div><div class="preview-score"><span>公司现状</span><strong>${safe(summary.headline)}</strong></div><div class="preview-findings">${preview.issueTags.slice(0, 3).map((item) => `<div class="preview-finding"><strong>${safe(item)}</strong></div>`).join("")}</div><div class="priority-card"><strong>当前优先动作</strong><p>${safe(summary.priority)}</p></div></div></section>`;
  }

  function renderOverviewV5() {
    const summary = executiveSummary(state.employees);
    const actions = detailedActionPlan(summary);
    const issueCards = topIssueCards(summary).slice(0, 3);
    const departments = overviewDepartmentsV5(summary);
    const currentDepartment = departments.find((item) => item.name === state.selectedOverviewDepartment) || departments[0] || null;
    const selectedIssue = issueCards[state.selectedIssueIndex] || issueCards[0] || null;
    const linkedDepartments = overviewIssueDepartmentsV5(summary, selectedIssue);
    const linkedDepartmentCards = departments.filter((item) => linkedDepartments.includes(item.name));
    const evidenceCards = [
      { label: "高潜占比", value: `${Math.round((summary.kpis.hipoA / Math.max(1, state.employees.length)) * 100)}%`, note: "储备并不低，但转化速度仍慢于组织需要。" },
      { label: "现在可接任", value: summary.kpis.readyNow, note: "近端接班人数仍然偏薄。" },
      { label: "关键岗位覆盖率", value: `${summary.kpis.coverage}%`, note: summary.kpis.coverage < 70 ? "覆盖不足，岗位暴露真实存在。" : "覆盖可用，但深度仍不均衡。" },
      { label: "高风险高绩效", value: summary.kpis.highRiskHighPerf, note: "这是最容易放大短期波动的人群。" }
    ];
    const presenter = state.uploadMode === "demo" && /author=1/.test(window.location.search || "") ? `<details class="card presenter-note"><summary>演示者备注</summary><p>先说公司现状，再切部门现状，最后点开问题卡讲风险和建议。</p></details>` : "";
    return `<section class="executive-hero card"><div class="executive-main"><div class="tag">公司现状总判断</div><h2>${safe(summary.headline)}</h2><p>${safe(summary.state)}</p><div class="summary-kpis"><div><span>风险等级</span><strong>${safe(summary.riskLevel)}</strong></div><div><span>当前优先动作</span><strong>${safe(summary.priority)}</strong></div></div></div><div class="executive-side">${issueCards.map((item) => `<div class="summary-point"><strong>${safe(item.title)}</strong><span>${safe(item.managementRead)}</span></div>`).join("")}</div></section>${presenter}<section class="card"><div class="section-head"><h3>公司现状</h3><span>只保留最关键的四个证据</span></div><div class="grid-kpi">${evidenceCards.map((item) => `<article class="card kpi-card"><span>${safe(item.label)}</span><strong>${safe(item.value)}</strong><small>${safe(item.note)}</small></article>`).join("")}</div></section><section class="card overview-workbench"><div class="section-head"><h3>部门现状</h3><span>先看部门，再收束成组织问题</span></div><div class="overview-department-layout"><div class="department-nav">${departments.map((item) => `<button class="department-chip ${currentDepartment && currentDepartment.name === item.name ? "active" : ""}" data-overview-department="${safe(item.name)}"><span>${safe(item.name)}</span><strong>${safe(item.judgment)}</strong><small>${safe(`${item.item.count} 人 · 覆盖率 ${item.coverage}%`)}</small></button>`).join("")}</div><div class="department-panel">${currentDepartment ? `<div class="department-panel-head"><div><span>当前部门</span><h3>${safe(currentDepartment.name)}</h3></div><div class="status ${currentDepartment.coverage < 60 || currentDepartment.item.highRisk >= 4 ? "danger" : currentDepartment.talentDensity >= 12 ? "warning" : "info"}">${safe(currentDepartment.judgment)}</div></div><div class="compare-strip"><div><span>人才密度</span><strong>${safe(`${currentDepartment.talentDensity}%`)}</strong></div><div><span>现在可接任</span><strong>${safe(currentDepartment.item.readyNow)}</strong></div><div><span>关键岗位覆盖</span><strong>${safe(`${currentDepartment.coverage}%`)}</strong></div></div><div class="priority-card"><strong>当前部门问题</strong><p>${safe(currentDepartment.judgment)}</p></div><div class="story-grid"><div><strong>高潜</strong><p>${safe(`${currentDepartment.item.hipoA} 人，说明未来储备的厚度。`)}</p></div><div><strong>高绩效</strong><p>${safe(`${currentDepartment.item.highPerf} 人，说明当前结果强度。`)}</p></div><div><strong>高风险</strong><p>${safe(`${currentDepartment.item.highRisk} 人，决定了短期波动的敏感度。`)}</p></div><div><strong>无后备关键岗</strong><p>${safe(`${currentDepartment.item.uncoveredRoles} 个，决定了关键岗位暴露。`)}</p></div></div>` : `<div class="empty-state">当前没有部门证据可展示。</div>`}</div></div></section><section class="card"><div class="section-head"><h3>组织问题</h3><span>点击问题后，继续看它由哪些部门现状构成</span></div><div class="issue-switcher">${issueCards.map((item, index) => { const issueDepartments = overviewIssueDepartmentsV5(summary, item); return `<button class="issue-switch-card ${state.selectedIssueIndex === index ? "active" : ""}" data-overview-issue="${index}" data-overview-issue-dept="${safe(issueDepartments[0] || "")}"><span>${safe(`问题 ${index + 1}`)}</span><strong>${safe(item.title)}</strong><small>${safe(item.managementRead)}</small></button>`; }).join("")}</div>${selectedIssue ? `<div class="issue-detail-panel"><div class="issue-detail-main"><div class="priority-card"><strong>现状表现</strong><p>${safe(selectedIssue.phenomenon)}</p></div><div class="priority-card"><strong>根因解释</strong><p>${safe(selectedIssue.rootCause)}</p></div></div><div class="issue-detail-side"><div class="priority-card"><strong>风险外推</strong><p>${safe(selectedIssue.likelyConsequence)}</p></div><div class="priority-card"><strong>建议动作</strong><p>${safe(selectedIssue.judgment)}</p><p>${safe([selectedIssue.actionNow, selectedIssue.actionSoon, selectedIssue.actionLater].filter(Boolean).join(" "))}</p></div></div></div><div class="focus-strip"><strong>当前优先聚焦</strong><span>${safe(actions.immediate.slice(0, 2).map((item) => item.action).join("；"))}</span></div><div class="linked-department-grid">${linkedDepartmentCards.length ? linkedDepartmentCards.map((item) => `<button class="linked-department-card" data-overview-department="${safe(item.name)}"><span>${safe(item.name)}</span><strong>${safe(item.judgment)}</strong><small>${safe(`${item.item.count} 人 · 高潜 ${item.item.hipoA} · 现在可接任 ${item.item.readyNow}`)}</small></button>`).join("") : `<div class="priority-card"><strong>部门关联</strong><p>当前问题更多来自整体结构，而不是单一部门。</p></div>`}</div>` : ""}</section>${renderGuideCards([{ route: "review", label: "查看更多人才盘点证据", reason: "继续看人才密度、伪强项和梯队断层" }, { route: "succession", label: "查看更多继任证据", reason: "继续看岗位暴露、覆盖深度和单点依赖" }, { route: "health", label: "查看更多数据健康", reason: "继续看自动识别、自动修复和风险提示" }, { route: "report", label: "进入建议报告", reason: "把现状、风险和动作收束成汇报稿" }])}`;
  }

  function renderTalentReviewV5() {
    const rows = reviewRows();
    const summary = executiveSummary(rows);
    const departments = summarizeDepartments(rows);
    const cells = buildNineBox(rows);
    const selectedCell = cells.find((cell) => cell.key === state.selectedNineBoxKey) || cells.find((cell) => cell.employees.length) || cells[0];
    const sampleEmployees = (selectedCell ? selectedCell.employees : []).slice().sort((a, b) => b.shl.score - a.shl.score);
    const selectedEmployee = findEmployee(state.selectedEmployeeId) || sampleEmployees[0] || rows[0] || null;
    const structuralCards = [
      { title: "哪些部门人才密度强", detail: departmentStoryCards(summary)[0] ? departmentStoryCards(summary)[0].detail : "当前没有可展示的高潜集中部门。" },
      { title: "哪些部门看起来强其实脆", detail: benchGapCards(rows, { summary: departments })[0].detail },
      { title: "哪些部门梯队薄", detail: topIssueCards(summary)[0] ? topIssueCards(summary)[0].phenomenon : "当前没有明显梯队断层。" }
    ];
    const focusDepartments = ["研发中心", "销售增长", "交付运营", "产品与设计", "客户成功"].filter((department) => departments[department]);
    return `<section class="executive-summary card"><div class="executive-main"><div class="tag">人才盘点</div><h2>${safe(summary.kpis.hipoA > summary.kpis.readyNow ? "人才储备并不差，但梯队成熟度弱于绩效表象" : "人才结构总体可用，但不同团队之间的梯队厚度并不均衡")}</h2><p>${safe(`当前样本 ${rows.length} 人。高潜 A ${summary.kpis.hipoA}，现在可接任 ${summary.kpis.readyNow}，高绩效但尚未进入现在可接任梯队 ${countBy(rows, (row) => scorePerformance(row.performance_current) >= 4 && row.succession.band !== "Ready Now")} 人。`)}</p></div><div class="executive-side">${structuralCards.map((item) => `<div class="summary-point"><strong>${safe(item.title)}</strong><span>${safe(item.detail)}</span></div>`).join("")}</div></section><section class="section-grid-3">${structuralCards.map((item) => `<article class="card"><div class="section-head"><h3>${safe(item.title)}</h3><span>结构判断</span></div><div class="priority-card"><p>${safe(item.detail)}</p></div></article>`).join("")}</section><section class="section-grid-2"><article class="card"><div class="section-head"><h3>九宫格证据</h3><span>九宫格是证据，不是主角</span></div><div class="filter-row"><select class="filter-select" data-filter="department"><option value="All">全部部门</option>${unique(state.employees.map((row) => row.department)).map((department) => `<option value="${safe(department)}" ${state.selectedDepartment === department ? "selected" : ""}>${safe(department)}</option>`).join("")}</select><select class="filter-select" data-filter="jobLevel"><option value="All">全部职级</option>${unique(state.employees.map((row) => row.job_level)).map((level) => `<option value="${safe(level)}" ${state.selectedJobLevel === level ? "selected" : ""}>${safe(level)}</option>`).join("")}</select><span class="status info">当前样本 ${rows.length} 人</span></div><div class="ninebox-grid push-top">${cells.map((cell) => `<button class="ninebox-cell ${selectedCell && selectedCell.key === cell.key ? "active" : ""}" data-ninebox="${safe(cell.key)}"><span class="cell-title">${safe(cell.title)}</span><strong>${safe(cell.employees.length)}</strong><small>${safe(cell.key === "3-3" ? "高潜集中区" : cell.key === "3-2" ? "高绩效但接班偏薄" : "结构证据")}</small></button>`).join("")}</div><div class="priority-card push-top"><strong>${safe(selectedCell && selectedCell.key === "3-3" ? "高潜集中并不等于梯队成熟" : selectedCell && selectedCell.key === "3-2" ? "高绩效集中区暴露出接班不足" : "当前格子用于说明结构差异")}</strong><p>${safe(selectedCell && selectedCell.employees.length ? `当前格子 ${selectedCell.employees.length} 人。` : "当前格子暂无代表员工。")}</p></div></article><article class="card"><div class="section-head"><h3>部门现状摘要</h3><span>先讲组织，再讲个体</span></div><div class="story-grid">${focusDepartments.map((department) => { const item = departments[department]; return `<div><strong>${safe(buildDepartmentInsightV5(department, item))}</strong><p>${safe(`${department} ${item.count} 人，高潜 ${item.hipoA}，现在可接任 ${item.readyNow}，无后备关键岗 ${item.uncoveredRoles}。`)}</p></div>`; }).join("")}</div></article></section><section class="section-grid-2"><article class="card"><div class="section-head"><h3>看起来强，其实脆</h3><span>优先讲伪强项</span></div>${benchGapCards(rows, { summary: departments }).map((item) => `<div class="priority-card"><strong>${safe(item.title)}</strong><p>${safe(item.detail)}</p></div>`).join("")}</article><article class="card"><div class="section-head"><h3>梯队薄弱点</h3><span>这些地方最容易断档</span></div>${topIssueCards(summary).filter((item) => /梯队|高潜|转化|成熟/.test(item.title + item.rootCause + item.managementRead)).slice(0, 3).map((item) => `<div class="priority-card"><strong>${safe(item.title)}</strong><p>${safe(item.phenomenon)}</p></div>`).join("")}</article></section>${renderEmployeeDrawerV5("查看人才样本", sampleEmployees, selectedEmployee)}`;
  }

  function renderSuccessionV5() {
    const summary = executiveSummary(state.employees);
    const roles = getCriticalRoles(state.employees);
    const singlePoints = singlePointRoles(roles);
    const supportRoles = supportRiskRoles(roles);
    const uncoveredRoles = roles.filter((role) => !role.candidates.length).slice(0, 6);
    const weaklyCoveredRoles = roles.filter((role) => role.candidates.length && (role.candidates[0].succession.band !== "Ready Now" || role.candidates.length <= 1)).slice(0, 6);
    const selectedRole = roles.find((role) => role.key === state.selectedRoleKey) || roles[0] || null;
    const candidatePool = selectedRole ? selectedRole.candidates : [];
    const selectedEmployee = findEmployee(state.selectedEmployeeId) || candidatePool[0] || null;
    return `<section class="executive-summary card"><div class="executive-main"><div class="tag">继任分析</div><h2>${safe(summary.kpis.coverage < 70 ? "关键岗位覆盖存在明显暴露，后备深度不足" : "名义覆盖可用，但过多岗位仍依赖单一候选人")}</h2><p>${safe(`关键岗位 ${summary.kpis.criticalRoles} 个，已覆盖 ${summary.kpis.coveredCriticalRoles} 个，现在可接任 ${summary.kpis.readyNow} 人，无后备岗位 ${summary.kpis.uncovered} 个。`)}</p></div><div class="executive-side"><div class="summary-point"><strong>无后备</strong><span>${safe(`${uncoveredRoles.length} 类岗位需要立即补位`)}</span></div><div class="summary-point"><strong>名义覆盖但弱</strong><span>${safe(`${weaklyCoveredRoles.length} 类岗位需要补深度`)}</span></div><div class="summary-point"><strong>单点依赖</strong><span>${safe(`${singlePoints.length} 类岗位过度依赖单一候选`)}</span></div></div></section><section class="section-grid-3"><article class="card"><div class="section-head"><h3>无后备</h3><span>最直接的空窗</span></div>${uncoveredRoles.length ? uncoveredRoles.slice(0, 3).map((role) => `<div class="priority-card"><strong>${safe(role.key)}</strong><p>当前没有明确后备。</p></div>`).join("") : `<div class="priority-card"><p>当前无明显无后备岗位。</p></div>`}</article><article class="card"><div class="section-head"><h3>名义覆盖但弱</h3><span>有提名，不代表可用</span></div>${weaklyCoveredRoles.length ? weaklyCoveredRoles.slice(0, 3).map((role) => `<div class="priority-card"><strong>${safe(role.key)}</strong><p>${safe(role.candidates[0] ? `${role.candidates[0].name} 为首位候选，但当前仍处于 ${readinessText(role.candidates[0].succession.band)}。` : "当前覆盖深度不足。")}</p></div>`).join("") : `<div class="priority-card"><p>当前弱覆盖岗位较少。</p></div>`}</article><article class="card"><div class="section-head"><h3>单点依赖</h3><span>覆盖深度的真实风险</span></div>${singlePoints.length ? singlePoints.slice(0, 3).map((role) => `<div class="priority-card"><strong>${safe(role.key)}</strong><p>${safe(role.candidates[0] ? `${role.candidates[0].name} 是当前唯一或明显领先的候选人。` : "当前没有可用候选人。")}</p></div>`).join("") : `<div class="priority-card"><p>当前显著单点依赖岗位较少。</p></div>`}</article></section><section class="section-grid-2"><article class="card"><div class="section-head"><h3>覆盖快照</h3><span>先讲岗位暴露结构</span></div><div class="grid-kpi"><article class="card kpi-card"><span>关键岗位</span><strong>${safe(summary.kpis.criticalRoles)}</strong><small>决定了组织真实的继任压力。</small></article><article class="card kpi-card"><span>已覆盖岗位</span><strong>${safe(summary.kpis.coveredCriticalRoles)}</strong><small>覆盖只是第一层，不代表深度充足。</small></article><article class="card kpi-card"><span>现在可接任</span><strong>${safe(summary.kpis.readyNow)}</strong><small>这是最短期可用的接班供给。</small></article><article class="card kpi-card"><span>1-2 年可接任</span><strong>${safe(countBy(state.employees, (row) => row.succession.band === "Ready in 1-2 Years"))}</strong><small>这是近中期最值得培养的候选池。</small></article></div></article><article class="card"><div class="section-head"><h3>支持职能风险</h3><span>小团队也可能是高暴露点</span></div>${supportRoles.length ? supportRoles.slice(0, 4).map((role) => `<div class="priority-card"><strong>${safe(role.key)}</strong><p>${safe(role.candidates[0] ? `${role.candidates[0].name} 是当前首位候选，准备度 ${readinessText(role.candidates[0].succession.band)}。` : "当前没有明确候选，属于高优先级暴露。")}</p></div>`).join("") : `<div class="priority-card"><p>当前没有可展示的支持职能关键岗位。</p></div>`}</article></section><section class="card"><div class="section-head"><h3>岗位风险热力图</h3><span>这是证据，不是主角</span></div><div class="heatmap-grid">${roles.slice(0, 9).map((role) => { const best = role.candidates[0]; const alpha = Math.max(0.2, Math.min(0.88, (best ? best.succession.score : 36) / 100)); return `<button class="heat-cell ${selectedRole && selectedRole.key === role.key ? "active" : ""}" data-role="${safe(role.key)}" style="background: rgba(47,107,255,${alpha})"><strong>${safe(role.department)}</strong><span>${safe(role.position)}</span><em>${safe(best ? readinessText(best.succession.band) : "暂无后备")}</em></button>`; }).join("")}</div><div class="priority-card push-top"><strong>怎么看</strong><p>优先看无后备、单点依赖和支持职能岗位，不先讲候选人个体。</p></div></section><details class="card detail-drawer"><summary>查看岗位与候选人样本</summary><div class="drawer-sample-list">${roles.slice(0, 8).map((role) => `<button class="sample-chip ${selectedRole && selectedRole.key === role.key ? "active" : ""}" data-role="${safe(role.key)}">${safe(role.department)} · ${safe(role.position)}</button>`).join("")}</div>${selectedRole ? `<div class="section-grid-2"><article class="card"><div class="section-head"><h3>岗位样本</h3><span>${safe(selectedRole.key)}</span></div><div class="priority-card"><strong>${safe(selectedRole.candidates[0] ? `${selectedRole.candidates[0].name} 是当前最优候选` : "当前没有可用后备")}</strong><p>${safe(selectedRole.candidates[0] ? `${readinessText(selectedRole.candidates[0].succession.band)}，综合分 ${selectedRole.candidates[0].succession.score}。` : "这类岗位属于立即需要命名后备的风险点。")}</p></div></article><article class="card"><div class="section-head"><h3>候选人样本</h3><span>${safe(selectedEmployee ? selectedEmployee.name : "暂无候选")}</span></div>${selectedEmployee ? renderProfileCard(selectedEmployee, "候选人画像", true) : `<div class="empty-state">当前没有可展示的候选人样本。</div>`}</article></div>` : `<div class="empty-state">当前没有岗位样本。</div>`}</details>`;
  }

  function healthRowsByTabV5(tab) {
    if (tab === "autoFixed") return state.quality.autoFixed;
    if (tab === "caution") return state.quality.caution;
    return state.quality.risk;
  }

  function renderHealthV5() {
    const quality = state.quality;
    const rows = healthRowsByTabV5(state.activeHealthTab);
    const selectedIssue = rows[state.selectedHealthIndex] || rows[0] || null;
    const verdict = quality.confidence.score >= 82 ? "可以直接用于演示" : quality.confidence.score >= 68 ? "可以分析，但要带风险提示" : "需要先清理再汇报";
    return `<section class="executive-summary card"><div class="executive-main"><div class="tag">可信度结论</div><h2>${safe(verdict)}</h2><p>${safe(`已识别 ${state.mappingMeta.matchedFields.length} 个分析字段，低置信字段 ${state.mappingMeta.lowConfidenceFields.length} 个，关键风险 ${quality.risk.length} 项。`)}</p></div><div class="executive-side"><div class="summary-point"><strong>自动识别</strong><span>${safe(`${state.mappingMeta.matchedFields.length} 个字段进入主分析链路`)}</span></div><div class="summary-point"><strong>自动修复</strong><span>${safe(`${quality.autoFixed.length} 项问题已被首轮处理`)}</span></div><div class="summary-point"><strong>影响范围</strong><span>${safe(quality.risk.length ? "继任判断与部门对比需带风险提示。" : "当前结论足以直接进入诊断与汇报。")}</span></div></div></section><section class="section-grid-2"><article class="card"><div class="section-head"><h3>自动识别了什么</h3><span>系统已完成理解</span></div><div class="story-grid"><div><strong>已识别字段</strong><p>${safe(`${state.mappingMeta.matchedFields.length} 个`)}</p></div><div><strong>低置信字段</strong><p>${safe(`${state.mappingMeta.lowConfidenceFields.length} 个`)}</p></div><div><strong>未使用字段</strong><p>${safe(`${state.mappingMeta.unmappedHeaders.length} 个`)}</p></div><div><strong>当前结论</strong><p>${safe(verdict)}</p></div></div></article><article class="card"><div class="section-head"><h3>自动修复了什么</h3><span>已完成首轮清洗</span></div>${normalizationActions().map((item) => `<div class="priority-card"><strong>${safe(item)}</strong></div>`).join("")}</article></section><section class="section-grid-2"><article class="card"><div class="section-head"><h3>需要谨慎的地方</h3><span>这些位置仍需提示</span></div>${(state.mappingMeta.lowConfidenceFields.length ? state.mappingMeta.lowConfidenceFields : ["当前低置信字段较少"]).slice(0, 6).map((field) => `<div class="priority-card"><strong>${safe(field)}</strong><p>${safe(field === "当前低置信字段较少" ? "当前自动识别结果较稳定。" : "该字段通过相似命名推断得到，建议人工确认口径。")}</p></div>`).join("")}</article><article class="card"><div class="section-head"><h3>会影响什么</h3><span>说明这些问题影响哪些结论</span></div><div class="grid-kpi"><article class="card kpi-card"><span>已自动修复</span><strong>${quality.autoFixed.length}</strong><small>这些问题已不再阻断主分析链路。</small></article><article class="card kpi-card"><span>需谨慎解读</span><strong>${quality.caution.length}</strong><small>会影响高潜与部门对比的精度。</small></article><article class="card kpi-card"><span>关键风险</span><strong>${quality.risk.length}</strong><small>会直接影响继任判断与汇报结论。</small></article></div></article></section><section class="card"><div class="section-head"><h3>附录证据</h3><span>问题样本下沉，不抢主视觉</span></div><div class="tabs"><button class="tab ${state.activeHealthTab === "autoFixed" ? "active" : ""}" data-health-tab="autoFixed">已自动修复</button><button class="tab ${state.activeHealthTab === "caution" ? "active" : ""}" data-health-tab="caution">需谨慎</button><button class="tab ${state.activeHealthTab === "risk" ? "active" : ""}" data-health-tab="risk">关键风险</button></div>${selectedIssue ? `<div class="priority-card"><strong>${safe(selectedIssue.title)}</strong><p>${safe(selectedIssue.detail)}</p></div>` : `<div class="empty-state">当前分类暂无问题。</div>`}<table class="data-table compact"><thead><tr><th>问题</th><th>字段</th><th>员工</th></tr></thead><tbody>${rows.length ? rows.slice(0, 6).map((item, index) => `<tr class="${state.selectedHealthIndex === index ? "table-row-active" : ""}" data-health-index="${index}"><td>${safe(item.title)}</td><td>${safe(item.field)}</td><td>${safe(item.employeeId)}</td></tr>`).join("") : `<tr><td colspan="3"><div class="empty-state compact-empty">当前分类暂无问题。</div></td></tr>`}</tbody></table></section>`;
  }

  function renderReportV5() {
    const summary = executiveSummary(state.employees);
    const actions = detailedActionPlan(summary);
    const issues = topIssueCards(summary).slice(0, 3);
    const signals = predictSignals(summary);
    const departments = overviewDepartmentsV5(summary).slice(0, 5);
    return `<section class="report-hero card"><div class="tag">建议报告</div><h2>${safe(summary.headline)}</h2><p>${safe(summary.priority)}</p><div class="button-row"><button class="btn btn-primary" data-action="download-report">导出汇报摘要</button><a class="btn btn-secondary" href="#overview">回到总览</a></div></section><section class="executive-summary card"><div class="executive-main"><div class="tag">公司现状</div><h2>${safe(summary.headline)}</h2><p>${safe(summary.state)}</p></div><div class="executive-side"><div class="summary-point"><strong>风险等级</strong><span>${safe(summary.riskLevel)}</span></div><div class="summary-point"><strong>当前优先动作</strong><span>${safe(summary.priority)}</span></div></div></section><section class="card"><div class="section-head"><h3>部门现状摘要</h3><span>只保留最值得先讲的团队</span></div><div class="story-grid">${departments.map((item) => `<div><strong>${safe(item.name)}</strong><p>${safe(`${item.judgment}。高潜 ${item.item.hipoA}，现在可接任 ${item.item.readyNow}，关键岗位覆盖 ${item.coverage}%。`)}</p></div>`).join("")}</div></section><section class="card"><div class="section-head"><h3>三个核心问题</h3><span>每个问题都能直接进入汇报</span></div>${issues.map((item, index) => `<div class="priority-card"><strong>${safe(`${index + 1}. ${item.title}`)}</strong><p><b>现状表现：</b>${safe(item.phenomenon)}</p><p><b>根因解释：</b>${safe(item.rootCause)}</p><p><b>风险外推：</b>${safe(item.likelyConsequence)}</p><p><b>建议动作：</b>${safe(item.judgment)}</p></div>`).join("")}</section><section class="section-grid-2"><article class="card"><div class="section-head"><h3>根因解释</h3><span>回答为什么会这样</span></div>${issues.map((item) => `<div class="priority-card"><strong>${safe(item.title)}</strong><p>${safe(item.rootCause)}</p></div>`).join("")}</article><article class="card"><div class="section-head"><h3>风险外推</h3><span>未来 6-12 个月</span></div>${signals.slice(0, 4).map((text) => `<div class="priority-card"><strong>${safe(text)}</strong></div>`).join("")}</article></section><section class="card"><div class="section-head"><h3>优先建议</h3><span>先降风险，再稳结构，再补梯队</span></div><div class="section-grid-3"><article class="card"><div class="section-head"><h3>立即动作</h3><span>先稳高暴露点</span></div>${actions.immediate.map((item) => `<div class="priority-card"><strong>${safe(item.action)}</strong><p>${safe(`${item.target} · ${item.purpose}`)}</p></div>`).join("")}</article><article class="card"><div class="section-head"><h3>中期动作</h3><span>缩小近端缺口</span></div>${actions.mid.map((item) => `<div class="priority-card"><strong>${safe(item.action)}</strong><p>${safe(`${item.target} · ${item.purpose}`)}</p></div>`).join("")}</article><article class="card"><div class="section-head"><h3>梯队建设</h3><span>建立持续供给</span></div>${actions.bench.map((item) => `<div class="priority-card"><strong>${safe(item.action)}</strong><p>${safe(`${item.target} · ${item.purpose}`)}</p></div>`).join("")}</article></div></section>`;
  }

  function sparkPathV6(values, width, height, padding) {
    const safeValues = (values || []).length ? values : [0, 0];
    const max = Math.max(1, ...safeValues);
    const min = Math.min(...safeValues);
    const range = Math.max(1, max - min);
    return safeValues.map((value, index) => {
      const x = padding + (index * (width - padding * 2)) / Math.max(1, safeValues.length - 1);
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");
  }

  function renderSparklineV6(values, color) {
    const width = 180;
    const height = 56;
    const padding = 6;
    return `<svg class="sparkline-v6" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"><path d="${safe(sparkPathV6(values, width, height, padding))}" fill="none" stroke="${safe(color || "var(--primary)")}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
  }

  function renderDonutV6(value, color, label) {
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.max(0, Math.min(100, Number(value || 0)));
    const offset = circumference * (1 - progress / 100);
    return `<div class="donut-wrap"><svg class="donut-v6" viewBox="0 0 120 120"><circle cx="60" cy="60" r="${radius}" class="donut-track"></circle><circle cx="60" cy="60" r="${radius}" class="donut-fill" style="stroke:${safe(color || "var(--primary)")};stroke-dasharray:${circumference.toFixed(2)};stroke-dashoffset:${offset.toFixed(2)}"></circle></svg><div class="donut-label"><strong>${safe(`${progress}%`)}</strong><span>${safe(label || "")}</span></div></div>`;
  }

  function polarPointV6(cx, cy, radius, angle) {
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle)
    };
  }

  function renderRadarV6(items) {
    const list = (items || []).slice(0, 4);
    const cx = 120;
    const cy = 120;
    const radius = 78;
    const angles = list.map((_, index) => -Math.PI / 2 + (index * Math.PI * 2) / list.length);
    const polygon = list.map((item, index) => {
      const point = polarPointV6(cx, cy, radius * Math.max(0.18, Math.min(1, (item.value || 0) / 100)), angles[index]);
      return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
    }).join(" ");
    return `<svg class="radar-v6" viewBox="0 0 240 240">${[1, 0.72, 0.45].map((scale) => `<polygon points="${angles.map((angle) => { const point = polarPointV6(cx, cy, radius * scale, angle); return `${point.x.toFixed(1)},${point.y.toFixed(1)}`; }).join(" ")}" class="radar-ring-v6"></polygon>`).join("")}${angles.map((angle) => { const point = polarPointV6(cx, cy, radius, angle); return `<line x1="${cx}" y1="${cy}" x2="${point.x.toFixed(1)}" y2="${point.y.toFixed(1)}" class="radar-axis-v6"></line>`; }).join("")}<polygon points="${polygon}" class="radar-shape-v6"></polygon>${list.map((item, index) => { const point = polarPointV6(cx, cy, radius + 22, angles[index]); return `<text x="${point.x.toFixed(1)}" y="${point.y.toFixed(1)}" class="radar-text-v6">${safe(item.label)}</text>`; }).join("")}</svg>`;
  }

  function renderScatterV6(points) {
    const list = (points || []).slice(0, 10);
    const width = 360;
    const height = 220;
    const pad = 28;
    return `<svg class="scatter-v6" viewBox="0 0 ${width} ${height}"><line x1="${pad}" y1="${height - pad}" x2="${width - pad}" y2="${height - pad}" class="chart-axis-v6"></line><line x1="${pad}" y1="${pad}" x2="${pad}" y2="${height - pad}" class="chart-axis-v6"></line>${list.map((item) => { const x = pad + (Math.max(0, Math.min(100, item.x || 0)) / 100) * (width - pad * 2); const y = height - pad - (Math.max(0, Math.min(100, item.y || 0)) / 100) * (height - pad * 2); const r = 8 + Math.max(0, Math.min(12, item.size || 0)); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" class="scatter-point-v6"></circle><text x="${(x + 12).toFixed(1)}" y="${(y - 6).toFixed(1)}" class="scatter-label-v6">${safe(item.label)}</text>`; }).join("")}<text x="${width - pad}" y="${height - 8}" class="chart-caption-v6">高绩效密度</text><text x="12" y="${pad}" class="chart-caption-v6">高潜密度</text></svg>`;
  }

  function renderWaterfallV6(items) {
    const list = (items || []).slice(0, 4);
    const max = Math.max(1, ...list.map((item) => Math.abs(item.value || 0)));
    return `<div class="waterfall-v6">${list.map((item) => `<div class="waterfall-row-v6"><span>${safe(item.label)}</span><div class="waterfall-track-v6"><div class="waterfall-bar-v6 ${item.tone || ""}" style="width:${Math.max(8, ((Math.abs(item.value || 0) / max) * 100).toFixed(1))}%"></div></div><strong>${safe(item.value)}</strong></div>`).join("")}</div>`;
  }

  function renderLollipopV6(items) {
    const list = (items || []).slice(0, 5);
    const max = Math.max(1, ...list.map((item) => item.value || 0));
    return `<div class="lollipop-v6">${list.map((item) => `<div class="lollipop-row-v6"><span>${safe(item.label)}</span><div class="lollipop-track-v6"><div class="lollipop-line-v6" style="width:${Math.max(8, (((item.value || 0) / max) * 100).toFixed(1))}%"></div><div class="lollipop-dot-v6"></div></div><strong>${safe(item.value)}</strong></div>`).join("")}</div>`;
  }

  function renderProcessRailV6() {
    const steps = ["员工数据", "公司现状", "部门现状", "组织问题", "建议报告"];
    return `<div class="process-rail-v6">${steps.map((item, index) => `<div class="process-step-v6"><span>${safe(`0${index + 1}`)}</span><strong>${safe(item)}</strong></div>`).join("")}</div>`;
  }

  function renderLineChartV7(values, label) {
    const list = (values || []).map((item) => Number(item || 0));
    if (!list.length) return `<div class="empty-state compact-empty">暂无趋势数据。</div>`;
    const width = 560;
    const height = 220;
    const pad = 24;
    const max = Math.max(1, ...list);
    const min = Math.min(...list);
    const range = Math.max(1, max - min);
    const points = list.map((value, index) => {
      const x = pad + (index * (width - pad * 2)) / Math.max(1, list.length - 1);
      const y = height - pad - ((value - min) / range) * (height - pad * 2);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");
    const last = list[list.length - 1];
    return `<div class="line-chart-wrap-v7"><svg class="line-chart-v7" viewBox="0 0 ${width} ${height}"><line x1="${pad}" y1="${height - pad}" x2="${width - pad}" y2="${height - pad}" class="chart-axis-v6"></line><path d="${safe(points)}" class="line-path-v7"></path></svg><div class="line-caption-v7"><span>${safe(label || "")}</span><strong>${safe(last)}</strong></div></div>`;
  }

  function monthsInState() {
    return unique((state.workforceMonthly || []).map((item) => item.month)).sort();
  }

  function companyMonthlySeries() {
    const months = monthsInState();
    return months.map((month) => {
      const rows = (state.workforceMonthly || []).filter((item) => item.month === month);
      const companyHeadcount = rows[0] ? Number(rows[0].company_headcount || 0) : 0;
      const hires = rows.reduce((sum, item) => sum + Number(item.hires || 0), 0);
      const exits = rows.reduce((sum, item) => sum + Number(item.exits || 0), 0);
      const criticalRoleGapCount = rows.reduce((sum, item) => sum + Number(item.critical_role_gap_count || 0), 0);
      const voluntaryAttritionRate = Number((rows.reduce((sum, item) => sum + Number(item.voluntary_attrition_rate || 0), 0) / Math.max(1, rows.length)).toFixed(1));
      const regrettableAttritionRate = Number((rows.reduce((sum, item) => sum + Number(item.regrettable_attrition_rate || 0), 0) / Math.max(1, rows.length)).toFixed(1));
      const readyNowCoverage = Number((rows.reduce((sum, item) => sum + Number(item.ready_now_coverage || 0), 0) / Math.max(1, rows.length)).toFixed(1));
      const readySoonCoverage = Number((rows.reduce((sum, item) => sum + Number(item.ready_soon_coverage || 0), 0) / Math.max(1, rows.length)).toFixed(1));
      const highPotentialRate = Number((rows.reduce((sum, item) => sum + Number(item.high_potential_rate || 0), 0) / Math.max(1, rows.length)).toFixed(1));
      const internalMoves = rows.reduce((sum, item) => sum + Number(item.internal_moves || 0), 0);
      return { month, companyHeadcount, hires, exits, voluntaryAttritionRate, regrettableAttritionRate, readyNowCoverage, readySoonCoverage, highPotentialRate, criticalRoleGapCount, internalMoves };
    });
  }

  function departmentMonthlySeries(department) {
    return (state.workforceMonthly || []).filter((item) => item.department === department).sort((a, b) => String(a.month).localeCompare(String(b.month)));
  }

  function recruitingMonthlySeries() {
    const months = unique((state.recruitingReqs || []).map((item) => String(item.open_date || "").slice(0, 7))).sort();
    return months.map((month) => {
      const rows = (state.recruitingReqs || []).filter((item) => String(item.open_date || "").startsWith(month));
      return {
        month,
        avgTimeToFill: Number((rows.reduce((sum, item) => sum + Number(item.time_to_fill_days || 0), 0) / Math.max(1, rows.length)).toFixed(1)),
        avgCost: Math.round(rows.reduce((sum, item) => sum + Number(item.total_cost || 0), 0) / Math.max(1, rows.length)),
        offerAcceptRate: Number(((rows.reduce((sum, item) => sum + Number(item.offer_acceptance_rate || 0), 0) / Math.max(1, rows.length)) * 100).toFixed(1)),
        internalFillRate: Number(((rows.reduce((sum, item) => sum + (String(item.internal_fill_flag || "") === "Y" ? 1 : 0), 0) / Math.max(1, rows.length)) * 100).toFixed(1))
      };
    });
  }

  function yearBucket(month) {
    return String(month || "").slice(0, 4);
  }

  function annualCompareSeries() {
    const company = companyMonthlySeries();
    return ["2023", "2024", "2025"].map((year) => {
      const rows = company.filter((item) => item.month.startsWith(year));
      const last = rows[rows.length - 1] || {};
      return {
        year,
        headcount: Number(last.companyHeadcount || 0),
        attrition: Number((rows.reduce((sum, item) => sum + Number(item.voluntaryAttritionRate || 0), 0) / Math.max(1, rows.length)).toFixed(1)),
        readyNowCoverage: Number((rows.reduce((sum, item) => sum + Number(item.readyNowCoverage || 0), 0) / Math.max(1, rows.length)).toFixed(1)),
        criticalGap: Number((rows.reduce((sum, item) => sum + Number(item.criticalRoleGapCount || 0), 0) / Math.max(1, rows.length)).toFixed(1))
      };
    });
  }

  function operationsDepartmentCards() {
    const recruiting = recruitingMonthlySeries();
    return overviewDepartmentsV5(executiveSummary(state.employees)).map((item) => {
      const monthly = departmentMonthlySeries(item.name);
      const ttf = average((state.recruitingReqs || []).filter((req) => req.department === item.name && String(req.open_date || "").startsWith("2025")), (req) => Number(req.time_to_fill_days || 0));
      return {
        name: item.name,
        headcount: monthly.length ? Number(monthly[monthly.length - 1].department_headcount || 0) : 0,
        attrition: Number((average(monthly.filter((entry) => String(entry.month).startsWith("2025")), (entry) => Number(entry.voluntary_attrition_rate || 0))).toFixed(1)),
        ttf: Number(ttf.toFixed(1)),
        readiness: Number((average(monthly.filter((entry) => String(entry.month).startsWith("2025")), (entry) => Number(entry.ready_now_coverage || 0))).toFixed(1)),
        recruitingRef: recruiting.length
      };
    });
  }

  function renderYearCompareV7(items, metricKey, unitLabel) {
    const list = items || [];
    const max = Math.max(1, ...list.map((item) => Number(item[metricKey] || 0)));
    return `<div class="year-compare-v7">${list.map((item) => `<div class="year-col-v7"><span>${safe(item.year)}</span><div class="year-bar-v7"><div style="height:${Math.max(12, ((Number(item[metricKey] || 0) / max) * 100).toFixed(1))}%"></div></div><strong>${safe(`${item[metricKey]}${unitLabel || ""}`)}</strong></div>`).join("")}</div>`;
  }

  function renderDepartmentMatrixV7(items) {
    const points = (items || []).map((item) => ({
      label: item.name.replace("中心", "").replace("与数据平台", "数据"),
      x: item.coverage,
      y: item.talentDensity,
      size: Math.max(2, Math.round((item.item.count || 0) / 10))
    }));
    return renderScatterV6(points);
  }

  function renderProblemEvidenceV7(issue, linkedCards) {
    const cards = linkedCards && linkedCards.length ? linkedCards : [];
    return `<div class="problem-evidence-v7">${cards.map((item) => `<div class="problem-branch-v7"><span>${safe(item.name)}</span><strong>${safe(item.judgment)}</strong><small>${safe(`高潜 ${item.item.hipoA} · 近端接班 ${item.item.readyNow} · 覆盖 ${item.coverage}%`)}</small></div>`).join("") || `<div class="empty-state compact-empty">当前暂无可关联的部门证据。</div>`}</div>`;
  }

  function renderRiskActionMapV7(issue) {
    const rows = [
      { left: issue.title, right: issue.actionNow || issue.judgment, label: "立即动作" },
      { left: issue.likelyConsequence, right: issue.actionSoon || issue.judgment, label: "中期动作" },
      { left: issueImpactTextV6(issue), right: issue.actionLater || issue.judgment, label: "梯队建设" }
    ];
    return `<div class="risk-action-map-v7">${rows.map((row) => `<div class="risk-action-item-v7"><div><span>${safe(row.label)}</span><strong>${safe(row.left)}</strong></div><div><span>对应动作</span><strong>${safe(row.right)}</strong></div></div>`).join("")}</div>`;
  }

  function metricSeriesV6(value) {
    const end = Math.max(1, Number(value) || 0);
    return [end * 0.42 + 2, end * 0.58 + 3, end * 0.74 + 2, end];
  }

  function renderHeroMetricsV6(items) {
    return `<div class="hero-metrics-v6">${(items || []).map((item) => `<article class="hero-metric-v6"><span>${safe(item.label)}</span><strong>${safe(item.value)}</strong>${renderSparklineV6(item.series || metricSeriesV6(item.raw || 0), item.color || "var(--primary)")}<small>${safe(item.note || "")}</small></article>`).join("")}</div>`;
  }

  function issueEvidenceMetricsV6(issue, departmentCards) {
    const totals = (departmentCards || []).reduce((acc, card) => {
      const item = card.item || {};
      acc.count += item.count || 0;
      acc.hipoA += item.hipoA || 0;
      acc.readyNow += item.readyNow || 0;
      acc.readySoon += item.readySoon || 0;
      acc.highPerf += item.highPerf || 0;
      acc.highRisk += item.highRisk || 0;
      acc.uncoveredRoles += item.uncoveredRoles || 0;
      acc.criticalCount += item.criticalCount || 0;
      acc.mobilityYes += item.mobilityYes || 0;
      return acc;
    }, { count: 0, hipoA: 0, readyNow: 0, readySoon: 0, highPerf: 0, highRisk: 0, uncoveredRoles: 0, criticalCount: 0, mobilityYes: 0 });
    const text = `${issue ? issue.title : ""} ${issue ? issue.rootCause : ""}`;
    if (/高潜|梯队|转化|管理/.test(text)) {
      return [
        { label: "高潜储备", value: totals.hipoA, tone: "info" },
        { label: "现在可接任", value: totals.readyNow, tone: "warning" },
        { label: "转化缺口", value: Math.max(0, totals.hipoA - totals.readyNow), tone: "danger" }
      ];
    }
    if (/业绩|关键人|保留|流失|结果/.test(text)) {
      return [
        { label: "高绩效", value: totals.highPerf, tone: "info" },
        { label: "高风险", value: totals.highRisk, tone: "danger" },
        { label: "错位人数", value: Math.max(0, totals.highPerf - totals.readyNow), tone: "warning" }
      ];
    }
    if (/稳定|停滞|成长/.test(text)) {
      return [
        { label: "高潜人数", value: totals.hipoA, tone: "warning" },
        { label: "1-2 年储备", value: totals.readySoon, tone: "info" },
        { label: "流动意愿", value: totals.mobilityYes, tone: "muted" }
      ];
    }
    return [
      { label: "关键岗位", value: totals.criticalCount, tone: "info" },
      { label: "无后备", value: totals.uncoveredRoles, tone: "danger" },
      { label: "近端可接任", value: totals.readyNow, tone: "warning" }
    ];
  }

  function issueImpactTextV6(issue) {
    const text = `${issue ? issue.title : ""} ${issue ? issue.rootCause : ""}`;
    if (/高潜|梯队|转化|管理/.test(text)) return "管理梯队成熟速度会继续落后于业务扩张速度。";
    if (/业绩|关键人|保留|流失|结果/.test(text)) return "短期产出会更依赖少数关键人，结果波动更大。";
    if (/稳定|停滞|成长/.test(text)) return "团队会继续稳定，但会越来越难补出下一层骨干。";
    return "关键岗位一旦发生流动或调整，业务连续性会直接承压。";
  }

  function renderIssueActionRowsV6(issue) {
    const steps = [
      { phase: "立即动作", action: issue.actionNow || issue.judgment },
      { phase: "中期动作", action: issue.actionSoon || issue.judgment },
      { phase: "梯队建设", action: issue.actionLater || issue.judgment }
    ].filter((item) => item.action);
    return `<div class="action-map-v6">${steps.map((item) => { const meta = actionMeta(item.action); return `<div class="action-row-v6"><span>${safe(item.phase)}</span><strong>${safe(item.action)}</strong><small>${safe(`${meta.target} · ${meta.purpose}`)}</small></div>`; }).join("")}</div>`;
  }

  function renderEvidenceLinksV6(items) {
    return `<section class="evidence-links-v6">${(items || []).map((item) => `<a class="link-tile-v6" href="#${safe(item.route)}"><span>${safe(item.label)}</span><strong>${safe(item.title)}</strong></a>`).join("")}</section>`;
  }

  function renderDepartmentCanvasV6(card) {
    if (!card) return `<div class="department-canvas-v6"><div class="empty-state">当前没有可展示的部门样本。</div></div>`;
    const item = card.item || {};
    const count = Math.max(1, item.count || 1);
    const hipoRate = Math.round(((item.hipoA || 0) / count) * 100);
    const readyNowRate = Math.round(((item.readyNow || 0) / count) * 100);
    const riskRate = Math.round(((item.highRisk || 0) / count) * 100);
    const radar = [
      { label: "人才密度", value: clamp(item.avgShl || 0, 0, 100) },
      { label: "高潜占比", value: hipoRate },
      { label: "近端接班", value: readyNowRate },
      { label: "关键覆盖", value: card.coverage || 0 }
    ];
    const compare = [
      { label: "人才密度", value: clamp(item.avgShl || 0, 0, 100), color: "var(--primary)" },
      { label: "高潜占比", value: hipoRate, color: "#4a7cff" },
      { label: "现在可接任", value: readyNowRate, color: "var(--warning)" },
      { label: "关键岗位覆盖", value: card.coverage || 0, color: "var(--success)" }
    ];
    return `<div class="department-canvas-v6"><div class="department-canvas-head-v6"><div><span>${safe(card.name)}</span><h3>${safe(card.judgment)}</h3></div><div class="status ${card.coverage < 60 ? "danger" : card.coverage < 75 ? "warning" : "success"}">${safe(card.coverage < 60 ? "高暴露" : card.coverage < 75 ? "需跟进" : "相对稳定")}</div></div><div class="department-visual-v6"><div class="department-radar-v6">${renderRadarV6(radar)}</div><div class="department-kpis-v6"><div>${renderDonutV6(card.coverage || 0, "var(--primary)", "覆盖")}</div><div>${renderDonutV6(hipoRate, "#4a7cff", "高潜")}</div><div>${renderDonutV6(readyNowRate, "var(--warning)", "近端接班")}</div><div>${renderDonutV6(Math.max(0, 100 - riskRate), "var(--success)", "稳定度")}</div></div></div><div class="department-bars-v6">${renderBars(compare)}</div><div class="evidence-chip-row-v6"><span class="tag muted">${safe(`${item.count || 0} 人`)}</span><span class="tag ${riskRate >= 18 ? "danger" : "muted"}">${safe(`高风险 ${item.highRisk || 0}`)}</span><span class="tag ${item.uncoveredRoles ? "warning" : "success"}">${safe(`无后备 ${item.uncoveredRoles || 0}`)}</span></div></div>`;
  }

  function renderHomeV6() {
    const summary = executiveSummary(state.employees);
    const preview = demoPreviewModel();
    const departments = overviewDepartmentsV5(summary).slice(0, 5);
    const previewPoints = departments.map((item) => ({
      label: item.name.replace("中心", "").replace("与数据平台", "数据"),
      x: item.coverage,
      y: item.talentDensity,
      size: Math.max(2, Math.round((item.item.count || 0) / 10))
    }));
    return `<section class="display-hero-v6 home-hero-v6"><div class="hero-copy-v6"><div class="tag">TalentPulse</div><h2>把员工数据转成可汇报的组织诊断</h2><p class="hero-subtitle-v6">用于面试展示，也可用于轻量真实分析。</p><div class="hero-actions"><button class="btn btn-primary" data-action="try-demo">体验官方案例</button><label class="btn btn-secondary upload-inline">上传员工数据<input id="upload-input" type="file" accept=".csv,.xlsx" hidden></label></div><div class="hero-footnote-v6">支持 Excel / CSV，字段名不统一也可直接进入分析。</div></div><div class="hero-preview-v6"><div class="preview-head-v6"><span>${safe(preview.company)}</span><strong>${safe(summary.headline)}</strong></div><div class="preview-tags-v6">${topIssueCards(summary).slice(0, 3).map((item) => `<span class="tag ${item.route === "succession" ? "warning" : item.route === "review" ? "muted" : ""}">${safe(item.title)}</span>`).join("")}</div><div class="preview-priority-v6"><span>当前优先动作</span><strong>${safe(summary.priority)}</strong></div><div class="preview-chart-v6">${renderScatterV6(previewPoints)}</div></div></section><section class="stage-strip-v6">${renderProcessRailV6()}<div class="stage-note-v6">${safe(preview.company)} · ${safe(`${state.employees.length} 人`)} · ${safe("官方案例可直接进入总览开始讲述")}</div></section>`;
  }

  function renderOverviewV6() {
    const summary = executiveSummary(state.employees);
    const departments = overviewDepartmentsV5(summary);
    const issues = topIssueCards(summary).slice(0, 3);
    const currentDepartment = departments.find((item) => item.name === state.selectedOverviewDepartment) || departments[0] || null;
    const selectedIssue = issues[state.selectedIssueIndex] || issues[0] || null;
    const linkedDepartments = overviewIssueDepartmentsV5(summary, selectedIssue);
    const linkedCards = departments.filter((item) => linkedDepartments.includes(item.name));
    const anomalyMetrics = issueEvidenceMetricsV6(selectedIssue, linkedCards);
    const heroMetrics = [
      { label: "高潜储备", value: summary.kpis.hipoA, raw: summary.kpis.hipoA, color: "var(--primary)", note: "未来储备" },
      { label: "现在可接任", value: summary.kpis.readyNow, raw: summary.kpis.readyNow, color: "var(--warning)", note: "近端梯队" },
      { label: "关键岗位覆盖", value: `${summary.kpis.coverage}%`, raw: summary.kpis.coverage, color: "var(--success)", note: "当前覆盖" },
      { label: "高风险高绩效", value: summary.kpis.highRiskHighPerf, raw: summary.kpis.highRiskHighPerf, color: "var(--danger)", note: "波动来源" }
    ];
    const stateCards = [
      { title: "高潜占比", value: `${Math.round((summary.kpis.hipoA / Math.max(1, state.employees.length)) * 100)}%`, note: "储备不低，但转化慢于需求。" },
      { title: "现在可接任", value: summary.kpis.readyNow, note: "近端接班仍然偏薄。" },
      { title: "关键岗位覆盖率", value: `${summary.kpis.coverage}%`, note: summary.kpis.coverage < 70 ? "覆盖不足，风险可见。" : "覆盖可用，但深度不均。" },
      { title: "风险岗位", value: summary.kpis.uncovered, note: "这些岗位最容易放大组织波动。" }
    ];
    const focusDepartments = linkedCards.length ? linkedCards : departments.slice(0, 3);
    return `<section class="display-hero-v6 overview-hero-v6"><div class="hero-copy-v6"><div class="tag">公司现状</div><h2>${safe(summary.headline)}</h2><p class="hero-subtitle-v6">${safe(summary.priority)}</p><div class="hero-flag-row-v6"><span class="status ${summary.riskLevel === "高" ? "danger" : summary.riskLevel === "中高" ? "warning" : "info"}">风险等级：${safe(summary.riskLevel)}</span><span class="status info">当前主讲页</span></div></div><div class="hero-summary-side-v6"><div class="summary-callout-v6"><span>当前判断</span><strong>${safe(summary.state)}</strong></div><div class="summary-callout-v6"><span>立即动作</span><strong>${safe(summary.priority)}</strong></div></div></section><section class="metric-stage-v6">${renderHeroMetricsV6(heroMetrics)}</section><section class="analysis-stage-v6"><div class="section-head"><h3>部门现状</h3><span>点击左侧部门，右侧证据画布同步更新</span></div><div class="department-stage-v6"><div class="department-list-v6">${departments.map((item) => `<button class="department-item-v6 ${currentDepartment && currentDepartment.name === item.name ? "active" : ""}" data-overview-department="${safe(item.name)}"><span>${safe(item.name)}</span><strong>${safe(item.judgment)}</strong><small>${safe(`高潜 ${item.item.hipoA} · 现在可接任 ${item.item.readyNow} · 覆盖 ${item.coverage}%`)}</small></button>`).join("")}</div>${renderDepartmentCanvasV6(currentDepartment)}</div></section><section class="analysis-stage-v6"><div class="section-head"><h3>组织问题</h3><span>只保留 3 个最重要问题</span></div><div class="issue-deck-v6">${issues.map((item, index) => { const focusDept = (item.departments && item.departments[0]) || ""; return `<button class="issue-card-v6 ${selectedIssue && selectedIssue.title === item.title ? "active" : ""}" data-overview-issue="${index}" data-overview-issue-dept="${safe(focusDept)}"><span>${safe(`问题 ${index + 1}`)}</span><strong>${safe(item.title)}</strong><small>${safe(item.managementRead)}</small></button>`; }).join("")}</div><div class="issue-expanded-v6"><div class="issue-panel-v6"><span class="small-label">现状表现</span><h3>${safe(selectedIssue ? selectedIssue.title : "当前暂无问题")}</h3><p>${safe(selectedIssue ? selectedIssue.phenomenon : "")}</p><div class="issue-metric-board-v6">${renderWaterfallV6(anomalyMetrics)}</div><div class="issue-branches-v6">${focusDepartments.map((item) => `<div class="branch-card-v6"><span>${safe(item.name)}</span><strong>${safe(item.judgment)}</strong><small>${safe(`高潜 ${item.item.hipoA} · 现在可接任 ${item.item.readyNow} · 无后备 ${item.item.uncoveredRoles}`)}</small></div>`).join("")}</div></div><div class="issue-side-v6"><div class="issue-note-v6"><span>不是表面问题</span><strong>${safe(selectedIssue ? selectedIssue.rootCause : "")}</strong></div><div class="issue-note-v6"><span>管理判断</span><strong>${safe(selectedIssue ? selectedIssue.managementRead : "")}</strong></div></div></div></section><section class="analysis-stage-v6"><div class="section-head"><h3>风险外推</h3><span>风险跟着问题走，不做散装平铺</span></div><div class="risk-map-v6"><div class="risk-node-v6"><span>当前问题</span><strong>${safe(selectedIssue ? selectedIssue.title : "")}</strong></div><div class="risk-node-v6"><span>未来 6-12 个月</span><strong>${safe(selectedIssue ? selectedIssue.likelyConsequence : "")}</strong></div><div class="risk-node-v6"><span>组织影响</span><strong>${safe(selectedIssue ? issueImpactTextV6(selectedIssue) : "")}</strong></div></div></section><section class="analysis-stage-v6"><div class="section-head"><h3>建议动作</h3><span>动作绑定问题和风险</span></div>${renderIssueActionRowsV6(selectedIssue || { judgment: summary.priority })}</section>${renderEvidenceLinksV6([{ route: "review", label: "查看更多证据", title: "人才盘点" }, { route: "succession", label: "查看更多证据", title: "继任分析" }, { route: "health", label: "查看更多证据", title: "数据健康" }, { route: "report", label: "查看更多证据", title: "汇报报告" }])}`;
  }

  function renderTalentReviewV6() {
    const rows = reviewRows();
    const summary = executiveSummary(rows);
    const departments = overviewDepartmentsV5(summary).slice(0, 6);
    const cells = buildNineBox(rows);
    const selectedCell = cells.find((cell) => cell.key === state.selectedNineBoxKey) || cells.find((cell) => cell.employees.length) || cells[0];
    const cellEmployees = (selectedCell ? selectedCell.employees : []).slice().sort((a, b) => b.shl.score - a.shl.score);
    const selectedEmployee = findEmployee(state.selectedEmployeeId) || cellEmployees[0] || rows[0] || null;
    const densityItems = departments.map((item) => ({ label: item.name.replace("中心", ""), value: item.talentDensity }));
    const mismatchPoints = departments.map((item) => ({
      label: item.name.replace("中心", "").replace("与数据平台", "数据"),
      x: Math.round(((item.item.highPerf || 0) / Math.max(1, item.item.count || 1)) * 100),
      y: Math.round(((item.item.hipoA || 0) / Math.max(1, item.item.count || 1)) * 100),
      size: Math.max(2, item.item.uncoveredRoles || 0)
    }));
    const gapItems = departments.slice(0, 4).map((item) => {
      const readyNowRate = Math.round(((item.item.readyNow || 0) / Math.max(1, item.item.count || 1)) * 100);
      return { label: item.name, value: Math.max(0, item.talentDensity - readyNowRate), tone: item.talentDensity - readyNowRate >= 10 ? "danger" : "warning" };
    });
    return `<section class="display-hero-v6 section-hero-v6"><div class="hero-copy-v6"><div class="tag">人才盘点</div><h2>${safe(summary.kpis.hipoA > summary.kpis.readyNow ? "人才储备并不差，但梯队成熟度弱于绩效表象" : "人才密度总体可用，但不同团队之间的梯队转化并不均衡")}</h2><p class="hero-subtitle-v6">${safe(`当前样本 ${rows.length} 人，高潜 ${summary.kpis.hipoA}，现在可接任 ${summary.kpis.readyNow}。`)}</p></div></section><section class="section-grid-3 v6-chart-grid"><article class="chart-stage-v6"><div class="section-head"><h3>人才密度分布</h3><span>部门剖面</span></div>${renderLollipopV6(densityItems)}<div class="chart-note-v6">研发中心和销售增长的人才密度更高，但不自动等于梯队成熟。</div></article><article class="chart-stage-v6"><div class="section-head"><h3>伪强项识别</h3><span>高绩效与高潜错位</span></div>${renderScatterV6(mismatchPoints)}<div class="chart-note-v6">越靠右但越低的点，越像“强结果但后备偏薄”的团队。</div></article><article class="chart-stage-v6"><div class="section-head"><h3>梯队断层</h3><span>人才密度减去近端接班</span></div>${renderWaterfallV6(gapItems)}<div class="chart-note-v6">落差越大，说明人才储备还没有顺利转成近端梯队。</div></article></section><section class="analysis-stage-v6"><div class="section-head"><h3>九宫格证据</h3><span>九宫格是证据，不是主角</span></div><div class="filter-row"><select class="filter-select" data-filter="department"><option value="All">全部部门</option>${unique(state.employees.map((row) => row.department)).map((department) => `<option value="${safe(department)}" ${state.selectedDepartment === department ? "selected" : ""}>${safe(department)}</option>`).join("")}</select><select class="filter-select" data-filter="jobLevel"><option value="All">全部职级</option>${unique(state.employees.map((row) => row.job_level)).map((level) => `<option value="${safe(level)}" ${state.selectedJobLevel === level ? "selected" : ""}>${safe(level)}</option>`).join("")}</select></div><div class="ninebox-grid push-top">${cells.map((cell) => `<button class="ninebox-cell ${selectedCell && selectedCell.key === cell.key ? "active" : ""}" data-ninebox="${safe(cell.key)}"><span class="cell-title">${safe(cell.title)}</span><strong>${safe(cell.employees.length)}</strong><small>${safe(cell.key === "3-3" ? "高潜集中区" : cell.key === "3-2" ? "高绩效但接班尚未成熟" : "结构证据")}</small></button>`).join("")}</div><div class="chart-note-v6">${safe(selectedCell && selectedCell.employees.length ? `当前选中格子 ${selectedCell.title}，共 ${selectedCell.employees.length} 人。` : "当前格子暂无样本。")}</div></section>${renderEmployeeDrawerV5("查看代表样本", cellEmployees, selectedEmployee)}`;
  }

  function renderSuccessionV6() {
    const roles = getCriticalRoles(state.employees);
    const summary = executiveSummary(state.employees);
    const selectedRole = roles.find((role) => role.key === state.selectedRoleKey) || roles[0] || null;
    const selectedEmployee = findEmployee(state.selectedEmployeeId) || (selectedRole && selectedRole.candidates[0]) || null;
    const singlePoints = singlePointRoles(roles);
    const uncoveredCount = roles.filter((role) => role.incumbent.successor_nomination_flag !== "Y" || !role.candidates.length).length;
    const weakCoverageCount = roles.filter((role) => role.candidates.length && (role.candidates.length < 2 || role.candidates[0].succession.band !== "Ready Now")).length;
    const exposureItems = [
      { label: "无后备", value: uncoveredCount, tone: "danger" },
      { label: "名义覆盖但弱", value: weakCoverageCount, tone: "warning" },
      { label: "单点依赖", value: singlePoints.length, tone: "info" }
    ];
    const depthItems = roles.slice(0, 5).map((role) => ({ label: role.position, value: role.candidates.length, tone: role.candidates.length <= 1 ? "danger" : role.candidates.length === 2 ? "warning" : "info" }));
    const supportRoles = supportRiskRoles(roles);
    return `<section class="display-hero-v6 section-hero-v6"><div class="hero-copy-v6"><div class="tag">继任分析</div><h2>${safe(summary.kpis.coverage < 70 ? "关键岗位覆盖已经可见，但后备深度仍然偏薄" : "名义覆盖可用，但过多岗位仍然依赖单一候选人")}</h2><p class="hero-subtitle-v6">${safe(`关键岗位 ${summary.kpis.criticalRoles} 个，已覆盖 ${summary.kpis.coveredCriticalRoles} 个，无后备 ${summary.kpis.uncovered} 个。`)}</p></div></section><section class="section-grid-3 v6-chart-grid"><article class="chart-stage-v6"><div class="section-head"><h3>岗位暴露结构</h3><span>三类暴露</span></div>${renderWaterfallV6(exposureItems)}<div class="chart-note-v6">先看无后备，再看弱覆盖，最后看单点依赖。</div></article><article class="chart-stage-v6"><div class="section-head"><h3>覆盖深度</h3><span>候选池厚度</span></div>${renderWaterfallV6(depthItems)}<div class="chart-note-v6">候选人数少于 2 的岗位，即使名义覆盖也仍然脆弱。</div></article><article class="chart-stage-v6"><div class="section-head"><h3>单点依赖</h3><span>高风险岗位</span></div>${renderLollipopV6(singlePoints.slice(0, 5).map((role) => ({ label: role.position, value: Math.round(role.riskScore) })))}<div class="chart-note-v6">分数越高，说明岗位越依赖单一候选或仍无可用后备。</div></article></section><section class="section-grid-2"><article class="chart-stage-v6"><div class="section-head"><h3>支持职能暴露</h3><span>容易被忽视的区域</span></div>${supportRoles.length ? supportRoles.map((role) => `<div class="priority-card"><strong>${safe(role.key)}</strong><p>${safe(role.candidates[0] ? `${role.candidates[0].name} 是当前最佳候选，准备度 ${readinessText(role.candidates[0].succession.band)}。` : "当前没有明确候选。")}</p></div>`).join("") : `<div class="empty-state">当前没有可展示的支持职能关键岗位。</div>`}</article><article class="chart-stage-v6"><div class="section-head"><h3>岗位证据</h3><span>${safe(selectedRole ? selectedRole.key : "暂无岗位")}</span></div>${selectedRole ? `<div class="priority-card"><strong>${safe(selectedRole.key)}</strong><p>${safe(selectedRole.candidates[0] ? `${selectedRole.candidates[0].name} 是当前最优候选，准备度 ${readinessText(selectedRole.candidates[0].succession.band)}。` : "当前没有可用后备。")}</p></div><div class="heatmap-grid">${roles.slice(0, 6).map((role) => { const best = role.candidates[0]; const alpha = Math.max(0.22, Math.min(0.88, (best ? best.succession.score : 30) / 100)); return `<button class="heat-cell ${selectedRole && selectedRole.key === role.key ? "active" : ""}" data-role="${safe(role.key)}" style="background: rgba(47,107,255,${alpha})"><strong>${safe(role.department)}</strong><span>${safe(role.position)}</span><em>${safe(best ? readinessText(best.succession.band) : "暂无后备")}</em></button>`; }).join("")}</div>` : `<div class="empty-state">当前没有岗位样本。</div>`}</article></section><details class="card detail-drawer"><summary>查看岗位与候选人样本</summary><div class="drawer-sample-list">${roles.slice(0, 8).map((role) => `<button class="sample-chip ${selectedRole && selectedRole.key === role.key ? "active" : ""}" data-role="${safe(role.key)}">${safe(role.department)} · ${safe(role.position)}</button>`).join("")}</div>${selectedRole ? `<div class="section-grid-2"><article class="card"><div class="section-head"><h3>岗位样本</h3><span>${safe(selectedRole.key)}</span></div><div class="priority-card"><strong>${safe(selectedRole.candidates[0] ? `${selectedRole.candidates[0].name} 是当前最优候选` : "当前没有可用候选")}</strong><p>${safe(selectedRole.candidates[0] ? `${readinessText(selectedRole.candidates[0].succession.band)}，综合分 ${selectedRole.candidates[0].succession.score}。` : "建议先命名后备，再校验准备度。")}</p></div></article><article class="card"><div class="section-head"><h3>候选人画像</h3><span>${safe(selectedEmployee ? selectedEmployee.name : "暂无候选")}</span></div>${selectedEmployee ? renderProfileCard(selectedEmployee, "候选人画像", true) : `<div class="empty-state">当前没有可展示的候选人样本。</div>`}</article></div>` : `<div class="empty-state">当前没有岗位样本。</div>`}</details>`;
  }

  function renderHealthV6() {
    const quality = state.quality;
    const rows = healthRowsByTab(state.activeHealthTab);
    const selectedIssue = rows[state.selectedHealthIndex] || rows[0] || null;
    const verdict = quality.confidence.score >= 82 ? "可以直接演示" : quality.confidence.score >= 68 ? "可以分析，但要带风险提示" : "需要先清理再汇报";
    const understoodRate = Math.round((state.mappingMeta.matchedFields.length / Math.max(1, FIELDS.length)) * 100);
    const totalIssues = quality.autoFixed.length + quality.caution.length + quality.risk.length;
    const autoFixRate = Math.round((quality.autoFixed.length / Math.max(1, totalIssues)) * 100);
    const cautionRate = Math.round(((quality.caution.length + quality.risk.length) / Math.max(1, totalIssues)) * 100);
    return `<section class="display-hero-v6 section-hero-v6"><div class="hero-copy-v6"><div class="tag">数据健康</div><h2>${safe(verdict)}</h2><p class="hero-subtitle-v6">${safe(`已识别 ${state.mappingMeta.matchedFields.length} 个分析字段，关键风险 ${quality.risk.length} 项。`)}</p></div></section><section class="section-grid-4 v6-health-grid"><article class="chart-stage-v6"><div class="section-head"><h3>数据可用等级</h3><span>${safe(quality.confidence.label)}</span></div>${renderDonutV6(quality.confidence.score, "var(--primary)", "可信度")}</article><article class="chart-stage-v6"><div class="section-head"><h3>自动识别完成度</h3><span>${safe(`${state.mappingMeta.matchedFields.length} 项`)}</span></div>${renderDonutV6(understoodRate, "#4a7cff", "识别覆盖")}</article><article class="chart-stage-v6"><div class="section-head"><h3>自动修复占比</h3><span>${safe(`${quality.autoFixed.length} 项`)}</span></div>${renderDonutV6(autoFixRate, "var(--success)", "自动修复")}</article><article class="chart-stage-v6"><div class="section-head"><h3>仍需谨慎项</h3><span>${safe(`${quality.caution.length + quality.risk.length} 项`)}</span></div>${renderDonutV6(cautionRate, "var(--warning)", "谨慎项")}</article></section><section class="section-grid-2"><article class="chart-stage-v6"><div class="section-head"><h3>自动识别了什么</h3><span>字段与口径</span></div>${renderLollipopV6([{ label: "已识别字段", value: state.mappingMeta.matchedFields.length }, { label: "低置信字段", value: state.mappingMeta.lowConfidenceFields.length }, { label: "未使用字段", value: state.mappingMeta.unmappedHeaders.length }])}<div class="chart-note-v6">识别覆盖已足以支撑主分析链路。</div></article><article class="chart-stage-v6"><div class="section-head"><h3>自动修复了什么</h3><span>清洗前后</span></div>${renderWaterfallV6([{ label: "已自动修复", value: quality.autoFixed.length, tone: "info" }, { label: "需谨慎", value: quality.caution.length, tone: "warning" }, { label: "关键风险", value: quality.risk.length, tone: "danger" }])}<div class="chart-note-v6">当前问题主要影响的是继任判断与部门对比的精度。</div></article></section><section class="section-grid-2"><article class="chart-stage-v6"><div class="section-head"><h3>需要谨慎的地方</h3><span>仍需提示</span></div>${(state.mappingMeta.lowConfidenceFields.length ? state.mappingMeta.lowConfidenceFields : ["当前低置信字段较少"]).slice(0, 5).map((field) => `<div class="priority-card"><strong>${safe(field)}</strong><p>${safe(field === "当前低置信字段较少" ? "当前自动识别结果较稳定。" : "该字段建议人工确认口径。")}</p></div>`).join("")}</article><article class="chart-stage-v6"><div class="section-head"><h3>影响哪些结论</h3><span>用于提示汇报边界</span></div><div class="priority-card"><strong>${safe(quality.risk.length ? "继任判断与部门对比需要带风险提示。" : "当前结果足以直接进入组织诊断与汇报。")}</strong><p>${safe(selectedIssue ? selectedIssue.detail : "当前没有额外风险样本。")}</p></div></article></section><section class="card appendix-table-v6"><div class="section-head"><h3>附录证据</h3><span>问题样本下沉</span></div><div class="tabs"><button class="tab ${state.activeHealthTab === "autoFixed" ? "active" : ""}" data-health-tab="autoFixed">已自动修复</button><button class="tab ${state.activeHealthTab === "caution" ? "active" : ""}" data-health-tab="caution">需谨慎</button><button class="tab ${state.activeHealthTab === "risk" ? "active" : ""}" data-health-tab="risk">关键风险</button></div><table class="data-table compact"><thead><tr><th>问题</th><th>字段</th><th>员工</th></tr></thead><tbody>${rows.length ? rows.slice(0, 6).map((item, index) => `<tr class="${state.selectedHealthIndex === index ? "table-row-active" : ""}" data-health-index="${index}"><td>${safe(item.title)}</td><td>${safe(item.field)}</td><td>${safe(item.employeeId)}</td></tr>`).join("") : `<tr><td colspan="3"><div class="empty-state compact-empty">当前分类暂无问题。</div></td></tr>`}</tbody></table></section>`;
  }

  function renderReportV6() {
    const summary = executiveSummary(state.employees);
    const issues = topIssueCards(summary).slice(0, 3);
    const actions = detailedActionPlan(summary);
    const departments = overviewDepartmentsV5(summary).slice(0, 4);
    const roles = getCriticalRoles(state.employees).slice(0, 4);
    return `<section class="display-hero-v6 report-hero-v6"><div class="hero-copy-v6"><div class="tag">汇报报告</div><h2>${safe(summary.headline)}</h2><p class="hero-subtitle-v6">${safe(summary.priority)}</p></div><div class="hero-summary-side-v6"><div class="summary-callout-v6"><span>风险等级</span><strong>${safe(summary.riskLevel)}</strong></div><div class="summary-callout-v6"><span>当前优先动作</span><strong>${safe(summary.priority)}</strong></div></div></section><section class="report-strip-v6"><div><span>公司现状</span><strong>${safe(summary.state)}</strong></div><div><span>部门现状</span><strong>${safe("差异主要集中在研发中心、销售增长、交付运营和产品与设计。")}</strong></div></section><section class="issue-triptych-v6">${issues.map((item) => `<article class="report-issue-v6"><span>${safe(item.title)}</span><div class="report-issue-line-v6"><strong>现状表现</strong><p>${safe(item.phenomenon)}</p></div><div class="report-issue-line-v6"><strong>根因解释</strong><p>${safe(item.rootCause)}</p></div><div class="report-issue-line-v6"><strong>风险外推</strong><p>${safe(item.likelyConsequence)}</p></div><div class="report-issue-line-v6"><strong>建议动作</strong><p>${safe(item.judgment)}</p></div></article>`).join("")}</section><section class="analysis-stage-v6"><div class="section-head"><h3>风险—建议映射</h3><span>一项风险对应一组动作</span></div><div class="risk-action-board-v6">${issues.map((item) => `<div class="risk-action-row-v6"><div><span>${safe(item.title)}</span><strong>${safe(item.likelyConsequence)}</strong></div><div><span>建议动作</span><strong>${safe(item.actionNow || item.judgment)}</strong></div></div>`).join("")}</div></section><section class="section-grid-3 v6-chart-grid"><article class="chart-stage-v6"><div class="section-head"><h3>部门证据</h3><span>人才密度</span></div>${renderLollipopV6(departments.map((item) => ({ label: item.name.replace("中心", ""), value: item.talentDensity })))} </article><article class="chart-stage-v6"><div class="section-head"><h3>岗位证据</h3><span>暴露深度</span></div>${renderWaterfallV6(roles.map((role) => ({ label: role.position, value: role.candidates.length, tone: role.candidates.length <= 1 ? "danger" : role.candidates.length === 2 ? "warning" : "info" })))} </article><article class="chart-stage-v6"><div class="section-head"><h3>动作优先级</h3><span>先降风险，再补梯队</span></div>${renderLollipopV6([{ label: "立即动作", value: actions.immediate.length }, { label: "中期动作", value: actions.mid.length }, { label: "梯队建设", value: actions.bench.length }])}</article></section>`;
  }

  function renderHomeV7() {
    const summary = executiveSummary(state.employees);
    const company = companyMonthlySeries();
    const previewSeries = company.map((item) => item.companyHeadcount);
    const annual = annualCompareSeries();
    const metadata = (demo.clean && demo.clean.metadata) || demo.metadata || {};
    return `<section class="stage-hero-v7"><div class="stage-copy-v7"><div class="tag">澄曜云服科技 · 组织诊断</div><h2>把员工数据转成可汇报的组织诊断</h2><p>${safe(metadata.company_judgement || "用于面试展示，也可用于轻量真实分析。")}</p><div class="hero-actions"><button class="btn btn-primary" data-action="try-demo">体验官方案例</button><label class="btn btn-secondary upload-inline">上传员工数据<input id="upload-input" type="file" accept=".csv,.xlsx" hidden></label></div></div><div class="hero-exhibit-v7"><div class="exhibit-head-v7"><span>官方案例预览</span><strong>${safe(summary.headline)}</strong></div><div class="exhibit-tags-v7">${(metadata.core_issue_tags || []).slice(0, 3).map((item) => `<span class="tag muted">${safe(item)}</span>`).join("")}</div><div class="exhibit-priority-v7"><span>当前优先动作</span><strong>${safe(summary.priority)}</strong></div><div class="exhibit-chart-v7">${renderLineChartV7(previewSeries, "公司人数")}</div><div class="exhibit-years-v7">${renderYearCompareV7(annual, "headcount", "人")}</div></div></section><section class="stage-rail-v7">${renderProcessRailV6()}</section>`;
  }

  function renderOverviewV7() {
    const summary = executiveSummary(state.employees);
    const annual = annualCompareSeries();
    const departments = overviewDepartmentsV5(summary);
    const currentDepartment = departments.find((item) => item.name === state.selectedOverviewDepartment) || departments[0] || null;
    const issues = topIssueCards(summary).slice(0, 3);
    const selectedIssue = issues[state.selectedIssueIndex] || issues[0] || null;
    const linkedDepartments = overviewIssueDepartmentsV5(summary, selectedIssue);
    const linkedCards = departments.filter((item) => linkedDepartments.includes(item.name));
    const company = companyMonthlySeries();
    const kpis = [
      { label: "公司人数", value: company.length ? company[company.length - 1].companyHeadcount : state.employees.length, series: company.map((item) => item.companyHeadcount), note: "2023-2025" },
      { label: "近端覆盖", value: `${summary.kpis.coverage}%`, series: company.map((item) => item.readyNowCoverage), note: "关键岗位覆盖" },
      { label: "高潜储备", value: summary.kpis.hipoA, series: company.map((item) => item.highPotentialRate), note: "高潜占比" },
      { label: "关键岗位空窗", value: summary.kpis.uncovered, series: company.map((item) => item.criticalRoleGapCount), note: "岗位暴露" }
    ];
    return `<section class="overview-hero-v7"><div><div class="tag">公司现状</div><h2>${safe(summary.headline)}</h2><p>${safe(summary.priority)}</p><div class="overview-badges-v7"><span class="status ${summary.riskLevel === "高" ? "danger" : summary.riskLevel === "中高" ? "warning" : "info"}">风险等级：${safe(summary.riskLevel)}</span><span class="status info">当前主讲页</span></div></div><div class="overview-year-board-v7">${renderYearCompareV7(annual, "headcount", "人")}</div></section><section class="overview-kpi-strip-v7">${renderHeroMetricsV6(kpis)}</section><section class="overview-stage-v7"><div class="section-head"><h3>部门现状</h3><span>点击部门，右侧证据画布同步更新</span></div><div class="overview-grid-v7"><div class="overview-departments-v7">${departments.map((item) => `<button class="department-item-v7 ${currentDepartment && currentDepartment.name === item.name ? "active" : ""}" data-overview-department="${safe(item.name)}"><span>${safe(item.name)}</span><strong>${safe(item.judgment)}</strong><small>${safe(`人才密度 ${item.talentDensity}% · 近端接班 ${item.item.readyNow} · 覆盖 ${item.coverage}%`)}</small></button>`).join("")}</div><div class="overview-canvas-v7"><div class="canvas-head-v7"><div><span>${safe(currentDepartment ? currentDepartment.name : "")}</span><h3>${safe(currentDepartment ? currentDepartment.judgment : "暂无部门样本")}</h3></div><div class="status ${currentDepartment && currentDepartment.coverage < 60 ? "danger" : currentDepartment && currentDepartment.coverage < 75 ? "warning" : "success"}">${safe(currentDepartment && currentDepartment.coverage < 60 ? "高暴露" : currentDepartment && currentDepartment.coverage < 75 ? "需跟进" : "相对稳定")}</div></div><div class="canvas-chart-v7">${renderDepartmentMatrixV7(departments)}</div><div class="canvas-metrics-v7">${currentDepartment ? renderBars([{ label: "人才密度", value: currentDepartment.talentDensity, color: "var(--primary)" }, { label: "高潜占比", value: Math.round((currentDepartment.item.hipoA / Math.max(1, currentDepartment.item.count)) * 100), color: "#4a7cff" }, { label: "近端接班", value: Math.round((currentDepartment.item.readyNow / Math.max(1, currentDepartment.item.count)) * 100), color: "var(--warning)" }, { label: "关键岗位覆盖", value: currentDepartment.coverage, color: "var(--success)" }]) : `<div class="empty-state compact-empty">暂无部门数据。</div>`}</div></div></div></section><section class="overview-stage-v7"><div class="section-head"><h3>关键问题</h3><span>只保留 3 个问题，并和风险、动作联动</span></div><div class="issue-tabs-v7">${issues.map((item, index) => `<button class="issue-card-v7 ${selectedIssue && selectedIssue.title === item.title ? "active" : ""}" data-overview-issue="${index}" data-overview-issue-dept="${safe((item.departments && item.departments[0]) || "")}"><span>${safe(`问题 ${index + 1}`)}</span><strong>${safe(item.title)}</strong><small>${safe(item.managementRead)}</small></button>`).join("")}</div><div class="issue-stage-v7"><div class="issue-left-v7"><span>问题证据</span><h3>${safe(selectedIssue ? selectedIssue.title : "")}</h3><p>${safe(selectedIssue ? selectedIssue.phenomenon : "")}</p>${renderProblemEvidenceV7(selectedIssue || {}, linkedCards)}</div><div class="issue-right-v7"><div class="priority-card"><strong>根因解释</strong><p>${safe(selectedIssue ? selectedIssue.rootCause : "")}</p></div><div class="priority-card"><strong>为什么不是表面问题</strong><p>${safe(selectedIssue ? selectedIssue.managementRead : "")}</p></div></div></div></section><section class="overview-stage-v7"><div class="section-head"><h3>风险外推与建议动作</h3><span>风险和动作绑定问题联动</span></div>${renderRiskActionMapV7(selectedIssue || { title: summary.headline, likelyConsequence: summary.priority, actionNow: summary.priority, actionSoon: summary.priority, actionLater: summary.priority })}</section>${renderEvidenceLinksV6([{ route: "operations", label: "查看更多证据", title: "组织运营" }, { route: "review", label: "查看更多证据", title: "人才盘点" }, { route: "succession", label: "查看更多证据", title: "继任分析" }, { route: "health", label: "查看更多证据", title: "数据健康" }, { route: "report", label: "查看更多证据", title: "汇报报告" }])}`;
  }

  function renderOperationsV7() {
    const company = companyMonthlySeries();
    const recruiting = recruitingMonthlySeries();
    const cards = operationsDepartmentCards();
    const currentDepartment = cards.find((item) => item.name === state.selectedOperationsDepartment) || cards[0] || null;
    return `<section class="stage-hero-v7 compact-hero-v7"><div class="stage-copy-v7"><div class="tag">组织运营</div><h2>三年的人力与招聘轨迹，解释今天的组织状态</h2><p>时间范围覆盖 2023-01 至 2025-12，重点看人数、离职、招聘效率、成本和内部补位。</p></div></section><section class="operations-grid-v7"><article class="chart-stage-v7"><div class="section-head"><h3>人数趋势</h3><span>2023-2025</span></div>${renderLineChartV7(company.map((item) => item.companyHeadcount), "公司人数")}</article><article class="chart-stage-v7"><div class="section-head"><h3>离职率趋势</h3><span>主动离职率</span></div>${renderLineChartV7(company.map((item) => item.voluntaryAttritionRate), "主动离职率")}</article><article class="chart-stage-v7"><div class="section-head"><h3>招聘周期趋势</h3><span>平均填补天数</span></div>${renderLineChartV7(recruiting.map((item) => item.avgTimeToFill), "招聘周期")}</article><article class="chart-stage-v7"><div class="section-head"><h3>招聘成本趋势</h3><span>单需求平均成本</span></div>${renderLineChartV7(recruiting.map((item) => item.avgCost), "招聘成本")}</article><article class="chart-stage-v7"><div class="section-head"><h3>offer 接受率</h3><span>招聘转化</span></div>${renderLineChartV7(recruiting.map((item) => item.offerAcceptRate), "offer 接受率")}</article><article class="chart-stage-v7"><div class="section-head"><h3>内部补位率</h3><span>内部供给能力</span></div>${renderLineChartV7(recruiting.map((item) => item.internalFillRate), "内部补位率")}</article></section><section class="overview-stage-v7"><div class="section-head"><h3>部门招聘效率对比</h3><span>点击部门查看右侧运营证据</span></div><div class="overview-grid-v7"><div class="overview-departments-v7">${cards.map((item) => `<button class="department-item-v7 ${currentDepartment && currentDepartment.name === item.name ? "active" : ""}" data-operations-department="${safe(item.name)}"><span>${safe(item.name)}</span><strong>${safe(`招聘周期 ${item.ttf || 0} 天`)}</strong><small>${safe(`人数 ${item.headcount} · 离职率 ${item.attrition}% · 近端覆盖 ${item.readiness}%`)}</small></button>`).join("")}</div><div class="overview-canvas-v7">${currentDepartment ? `<div class="canvas-head-v7"><div><span>${safe(currentDepartment.name)}</span><h3>${safe("当前部门运营证据")}</h3></div><div class="status info">${safe("2025 视角")}</div></div><div class="canvas-metrics-v7">${renderBars([{ label: "招聘周期", value: currentDepartment.ttf || 0, color: "var(--primary)" }, { label: "主动离职率", value: currentDepartment.attrition || 0, color: "var(--danger)" }, { label: "近端接班覆盖", value: currentDepartment.readiness || 0, color: "var(--warning)" }, { label: "人数", value: currentDepartment.headcount || 0, color: "var(--success)" }])}</div><div class="priority-card"><strong>${safe(currentDepartment.name)}</strong><p>${safe(currentDepartment.attrition >= 4 ? "离职率和招聘周期都偏高，说明外部补员压力与内部供给不足同时存在。" : currentDepartment.readiness <= 10 ? "招聘效率已回落，但近端覆盖仍然不足，说明问题不只在招不到人，也在内部供给偏薄。" : "当前运营指标相对平稳，更值得关注的是结构性暴露而不是单月波动。")}</p></div>` : `<div class="empty-state">暂无部门运营数据。</div>`}</div></div></section>`;
  }

  function renderTalentReviewV7() {
    const rows = reviewRows();
    const summary = executiveSummary(rows);
    const departments = overviewDepartmentsV5(summary).slice(0, 6);
    const cells = buildNineBox(rows);
    const selectedCell = cells.find((cell) => cell.key === state.selectedNineBoxKey) || cells.find((cell) => cell.employees.length) || cells[0];
    const cellEmployees = (selectedCell ? selectedCell.employees : []).slice().sort((a, b) => b.shl.score - a.shl.score);
    const selectedEmployee = findEmployee(state.selectedEmployeeId) || cellEmployees[0] || rows[0] || null;
    const densityItems = departments.map((item) => ({ label: item.name.replace("中心", ""), value: item.talentDensity }));
    const mismatchPoints = departments.map((item) => ({ label: item.name.replace("中心", "").replace("与数据平台", "数据"), x: Math.round(((item.item.highPerf || 0) / Math.max(1, item.item.count || 1)) * 100), y: Math.round(((item.item.hipoA || 0) / Math.max(1, item.item.count || 1)) * 100), size: Math.max(2, item.item.uncoveredRoles || 0) }));
    const gapItems = departments.slice(0, 4).map((item) => ({ label: item.name, value: Math.max(0, item.talentDensity - Math.round(((item.item.readyNow || 0) / Math.max(1, item.item.count || 1)) * 100)), tone: item.talentDensity >= 10 && item.item.readyNow <= 4 ? "danger" : "warning" }));
    return `<section class="stage-hero-v7 compact-hero-v7"><div class="stage-copy-v7"><div class="tag">人才盘点</div><h2>${safe(summary.kpis.hipoA > summary.kpis.readyNow ? "人才储备并不差，但梯队成熟度弱于绩效表象" : "人才密度总体可用，但不同团队之间的梯队转化并不均衡")}</h2><p>${safe(`当前样本 ${rows.length} 人，高潜 ${summary.kpis.hipoA}，现在可接任 ${summary.kpis.readyNow}。`)}</p></div></section><section class="section-grid-3 v6-chart-grid"><article class="chart-stage-v7"><div class="section-head"><h3>人才密度分布</h3><span>部门剖面</span></div>${renderLollipopV6(densityItems)}</article><article class="chart-stage-v7"><div class="section-head"><h3>高绩效 / 高潜错位</h3><span>伪强项识别</span></div>${renderScatterV6(mismatchPoints)}</article><article class="chart-stage-v7"><div class="section-head"><h3>梯队断层</h3><span>人才密度与近端接班的落差</span></div>${renderWaterfallV6(gapItems)}</article></section><section class="overview-stage-v7"><div class="section-head"><h3>九宫格证据</h3><span>九宫格退到证据位</span></div><div class="filter-row"><select class="filter-select" data-filter="department"><option value="All">全部部门</option>${unique(state.employees.map((row) => row.department)).map((department) => `<option value="${safe(department)}" ${state.selectedDepartment === department ? "selected" : ""}>${safe(department)}</option>`).join("")}</select><select class="filter-select" data-filter="jobLevel"><option value="All">全部职级</option>${unique(state.employees.map((row) => row.job_level)).map((level) => `<option value="${safe(level)}" ${state.selectedJobLevel === level ? "selected" : ""}>${safe(level)}</option>`).join("")}</select></div><div class="ninebox-grid push-top">${cells.map((cell) => `<button class="ninebox-cell ${selectedCell && selectedCell.key === cell.key ? "active" : ""}" data-ninebox="${safe(cell.key)}"><span class="cell-title">${safe(cell.title)}</span><strong>${safe(cell.employees.length)}</strong><small>${safe(cell.key === "3-3" ? "高潜集中区" : cell.key === "3-2" ? "高绩效但接班未成熟" : "结构证据")}</small></button>`).join("")}</div></section>${renderEmployeeDrawerV5("查看代表样本", cellEmployees, selectedEmployee)}`;
  }

  function renderSuccessionV7() {
    const roles = getCriticalRoles(state.employees);
    const summary = executiveSummary(state.employees);
    const selectedRole = roles.find((role) => role.key === state.selectedRoleKey) || roles[0] || null;
    const selectedEmployee = findEmployee(state.selectedEmployeeId) || (selectedRole && selectedRole.candidates[0]) || null;
    const singlePoints = singlePointRoles(roles);
    const uncoveredCount = roles.filter((role) => role.incumbent.successor_nomination_flag !== "Y" || !role.candidates.length).length;
    const weakCoverageCount = roles.filter((role) => role.candidates.length && (role.candidates.length < 2 || role.candidates[0].succession.band !== "Ready Now")).length;
    const exposureItems = [
      { label: "无后备", value: uncoveredCount, tone: "danger" },
      { label: "名义覆盖但弱", value: weakCoverageCount, tone: "warning" },
      { label: "单点依赖", value: singlePoints.length, tone: "info" }
    ];
    const coverageItems = roles.slice(0, 6).map((role) => ({ label: role.position, value: role.candidates.length, tone: role.candidates.length <= 1 ? "danger" : role.candidates.length === 2 ? "warning" : "info" }));
    return `<section class="stage-hero-v7 compact-hero-v7"><div class="stage-copy-v7"><div class="tag">继任分析</div><h2>${safe(summary.kpis.coverage < 70 ? "关键岗位覆盖已经可见，但后备深度仍然偏薄" : "名义覆盖可用，但过多岗位仍然依赖单一候选人")}</h2><p>${safe(`关键岗位 ${summary.kpis.criticalRoles} 个，已覆盖 ${summary.kpis.coveredCriticalRoles} 个，无后备 ${summary.kpis.uncovered} 个。`)}</p></div></section><section class="section-grid-3 v6-chart-grid"><article class="chart-stage-v7"><div class="section-head"><h3>岗位暴露结构</h3><span>三类暴露</span></div>${renderWaterfallV6(exposureItems)}</article><article class="chart-stage-v7"><div class="section-head"><h3>覆盖深度条带</h3><span>候选池厚度</span></div>${renderWaterfallV6(coverageItems)}</article><article class="chart-stage-v7"><div class="section-head"><h3>单点依赖</h3><span>风险岗位</span></div>${renderLollipopV6(singlePoints.slice(0, 5).map((role) => ({ label: role.position, value: Math.round(role.riskScore) })))}</article></section><section class="overview-stage-v7"><div class="section-head"><h3>岗位样本</h3><span>先岗位，后候选人</span></div><div class="heatmap-grid">${roles.slice(0, 8).map((role) => { const best = role.candidates[0]; const alpha = Math.max(0.22, Math.min(0.88, (best ? best.succession.score : 30) / 100)); return `<button class="heat-cell ${selectedRole && selectedRole.key === role.key ? "active" : ""}" data-role="${safe(role.key)}" style="background: rgba(47,107,255,${alpha})"><strong>${safe(role.department)}</strong><span>${safe(role.position)}</span><em>${safe(best ? readinessText(best.succession.band) : "暂无后备")}</em></button>`; }).join("")}</div></section><details class="card detail-drawer"><summary>查看岗位与候选人样本</summary><div class="drawer-sample-list">${roles.slice(0, 8).map((role) => `<button class="sample-chip ${selectedRole && selectedRole.key === role.key ? "active" : ""}" data-role="${safe(role.key)}">${safe(role.department)} · ${safe(role.position)}</button>`).join("")}</div>${selectedRole ? `<div class="section-grid-2"><article class="card"><div class="section-head"><h3>岗位样本</h3><span>${safe(selectedRole.key)}</span></div><div class="priority-card"><strong>${safe(selectedRole.candidates[0] ? `${selectedRole.candidates[0].name} 是当前最优候选` : "当前没有可用候选")}</strong><p>${safe(selectedRole.candidates[0] ? `${readinessText(selectedRole.candidates[0].succession.band)}，综合分 ${selectedRole.candidates[0].succession.score}。` : "建议先命名后备，再校验准备度。")}</p></div></article><article class="card"><div class="section-head"><h3>候选人画像</h3><span>${safe(selectedEmployee ? selectedEmployee.name : "暂无候选")}</span></div>${selectedEmployee ? renderProfileCard(selectedEmployee, "候选人画像", true) : `<div class="empty-state">当前没有可展示的候选人样本。</div>`}</article></div>` : `<div class="empty-state">当前没有岗位样本。</div>`}</details>`;
  }

  function renderHealthV7() {
    const quality = state.quality;
    const rows = healthRowsByTab(state.activeHealthTab);
    const verdict = quality.confidence.score >= 82 ? "可以直接演示" : quality.confidence.score >= 68 ? "可以分析，但要带风险提示" : "需要先清理再汇报";
    const understoodRate = Math.round((state.mappingMeta.matchedFields.length / Math.max(1, FIELDS.length)) * 100);
    const totalIssues = quality.autoFixed.length + quality.caution.length + quality.risk.length;
    const autoFixRate = Math.round((quality.autoFixed.length / Math.max(1, totalIssues)) * 100);
    const cautionRate = Math.round(((quality.caution.length + quality.risk.length) / Math.max(1, totalIssues)) * 100);
    return `<section class="stage-hero-v7 compact-hero-v7"><div class="stage-copy-v7"><div class="tag">数据健康</div><h2>${safe(verdict)}</h2><p>${safe(`已识别 ${state.mappingMeta.matchedFields.length} 个分析字段，关键风险 ${quality.risk.length} 项。`)}</p></div></section><section class="section-grid-4 v6-health-grid"><article class="chart-stage-v7">${renderDonutV6(quality.confidence.score, "var(--primary)", "可用等级")}</article><article class="chart-stage-v7">${renderDonutV6(understoodRate, "#4a7cff", "自动识别")}</article><article class="chart-stage-v7">${renderDonutV6(autoFixRate, "var(--success)", "自动修复")}</article><article class="chart-stage-v7">${renderDonutV6(cautionRate, "var(--warning)", "谨慎项")}</article></section><section class="section-grid-2"><article class="chart-stage-v7"><div class="section-head"><h3>自动识别了什么</h3><span>字段与口径</span></div>${renderLollipopV6([{ label: "已识别字段", value: state.mappingMeta.matchedFields.length }, { label: "低置信字段", value: state.mappingMeta.lowConfidenceFields.length }, { label: "未使用字段", value: state.mappingMeta.unmappedHeaders.length }])}</article><article class="chart-stage-v7"><div class="section-head"><h3>自动修复了什么</h3><span>清洗前后</span></div>${renderWaterfallV6([{ label: "已自动修复", value: quality.autoFixed.length, tone: "info" }, { label: "需谨慎", value: quality.caution.length, tone: "warning" }, { label: "关键风险", value: quality.risk.length, tone: "danger" }])}</article></section><section class="card appendix-table-v6"><div class="section-head"><h3>附录证据</h3><span>问题样本下沉</span></div><div class="tabs"><button class="tab ${state.activeHealthTab === "autoFixed" ? "active" : ""}" data-health-tab="autoFixed">已自动修复</button><button class="tab ${state.activeHealthTab === "caution" ? "active" : ""}" data-health-tab="caution">需谨慎</button><button class="tab ${state.activeHealthTab === "risk" ? "active" : ""}" data-health-tab="risk">关键风险</button></div><table class="data-table compact"><thead><tr><th>问题</th><th>字段</th><th>员工</th></tr></thead><tbody>${rows.length ? rows.slice(0, 6).map((item, index) => `<tr class="${state.selectedHealthIndex === index ? "table-row-active" : ""}" data-health-index="${index}"><td>${safe(item.title)}</td><td>${safe(item.field)}</td><td>${safe(item.employeeId)}</td></tr>`).join("") : `<tr><td colspan="3"><div class="empty-state compact-empty">当前分类暂无问题。</div></td></tr>`}</tbody></table></section>`;
  }

  function renderReportV7() {
    const summary = executiveSummary(state.employees);
    const issues = topIssueCards(summary).slice(0, 3);
    const annual = annualCompareSeries();
    const company = companyMonthlySeries();
    return `<section class="stage-hero-v7 report-stage-v7"><div class="stage-copy-v7"><div class="tag">汇报报告</div><h2>${safe(summary.headline)}</h2><p>${safe(summary.priority)}</p></div><div class="report-summary-v7"><div><span>风险等级</span><strong>${safe(summary.riskLevel)}</strong></div><div><span>当前优先动作</span><strong>${safe(summary.priority)}</strong></div></div></section><section class="report-strip-v7"><div><span>公司现状</span><strong>${safe(summary.state)}</strong></div><div><span>三年变化</span><strong>${safe(`2023-2025 公司人数从 ${annual[0] ? annual[0].headcount : 0} 人增长到 ${annual[2] ? annual[2].headcount : state.employees.length} 人，但关键岗位空窗没有同步收敛。`)}</strong></div></section><section class="issue-triptych-v7">${issues.map((item) => `<article class="report-issue-v7"><span>${safe(item.title)}</span><div class="report-issue-line-v6"><strong>现状表现</strong><p>${safe(item.phenomenon)}</p></div><div class="report-issue-line-v6"><strong>根因解释</strong><p>${safe(item.rootCause)}</p></div><div class="report-issue-line-v6"><strong>风险外推</strong><p>${safe(item.likelyConsequence)}</p></div><div class="report-issue-line-v6"><strong>建议动作</strong><p>${safe(item.judgment)}</p></div></article>`).join("")}</section><section class="overview-stage-v7"><div class="section-head"><h3>风险—建议映射</h3><span>按问题收束，而不是散装建议</span></div>${renderRiskActionMapV7(issues[0] || { title: summary.headline, likelyConsequence: summary.priority, actionNow: summary.priority, actionSoon: summary.priority, actionLater: summary.priority })}</section><section class="section-grid-3 v6-chart-grid"><article class="chart-stage-v7"><div class="section-head"><h3>公司人数轨迹</h3><span>2023-2025</span></div>${renderLineChartV7(company.map((item) => item.companyHeadcount), "公司人数")}</article><article class="chart-stage-v7"><div class="section-head"><h3>离职率轨迹</h3><span>主动离职率</span></div>${renderLineChartV7(company.map((item) => item.voluntaryAttritionRate), "主动离职率")}</article><article class="chart-stage-v7"><div class="section-head"><h3>关键岗位空窗</h3><span>岗位暴露</span></div>${renderLineChartV7(company.map((item) => item.criticalRoleGapCount), "关键岗位空窗")}</article></section>`;
  }

  function renderShell() {
    const content = state.route === "home" ? renderHomeV7() : state.route === "overview" ? renderOverviewV7() : state.route === "operations" ? renderOperationsV7() : state.route === "review" ? renderTalentReviewV7() : state.route === "succession" ? renderSuccessionV7() : state.route === "health" ? renderHealthV7() : state.route === "profile" ? renderProfile() : renderReportV7();
    const homeMode = state.route === "home";
    if (homeMode) {
      return `<div class="home-stage"><header class="home-stage-header"><div class="brand"><div class="brand-mark">TP</div><div><div class="brand-title">TalentPulse</div><div class="brand-sub">组织诊断汇报台</div></div></div><div class="status info">${safe(state.sourceName)}</div></header><main class="content home-stage-content">${content}</main></div>`;
    }
    return `<div class="shell"><aside class="sidebar"><div class="brand"><div class="brand-mark">TP</div><div><div class="brand-title">TalentPulse</div><div class="brand-sub">组织诊断汇报台</div></div></div><nav class="nav">${visibleRoutes().map((route) => `<a class="nav-item ${state.route === route.key ? "active" : ""}" href="#${route.key}">${safe(route.label)}</a>`).join("")}</nav><div class="sidebar-foot"><div class="small-label">数据来源</div><div class="sidebar-company">${safe(state.sourceName)}</div></div></aside><section class="main"><header class="topbar"><div><div class="page-eyebrow">公司现状 → 部门现状 → 组织问题 → 风险外推 → 建议报告</div><h1>${safe(routeLabel(state.route))}</h1></div><div class="topbar-actions"><button class="btn btn-secondary" data-action="try-demo">官方案例</button><label class="btn btn-primary upload-inline">上传员工数据<input id="upload-input-top" type="file" accept=".csv,.xlsx" hidden></label></div></header><main class="content">${content}</main></section></div>`;
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

  function useRows(rawRows, sourceName, mode, extras) {
    state.sourceName = sourceName;
    state.uploadMode = mode;
    state.rawRows = rawRows.slice();
    state.mappingMeta = autoMapRows(rawRows);
    state.employees = enrichEmployees(state.mappingMeta.rows);
    state.quality = detectQuality(rawRows, state.employees, state.mappingMeta);
    state.workforceMonthly = (extras && extras.workforceMonthly ? extras.workforceMonthly.slice() : []);
    state.recruitingReqs = (extras && extras.recruitingReqs ? extras.recruitingReqs.slice() : []);
    state.exitEvents = (extras && extras.exitEvents ? extras.exitEvents.slice() : []);
  }

  function handleDemo() {
    useRows((demo.clean && (demo.clean.employee_master || demo.clean.employees)) || [], "官方讲述版", "demo", {
      workforceMonthly: (demo.clean && demo.clean.workforce_monthly) || [],
      recruitingReqs: (demo.clean && demo.clean.recruiting_reqs) || [],
      exitEvents: (demo.clean && demo.clean.exit_events) || []
    });
    state.selectedDepartment = "All";
    state.selectedJobLevel = "All";
    state.selectedOverviewDepartment = "";
    state.selectedOperationsDepartment = "";
    state.selectedIssueIndex = 0;
    state.selectedNineBoxKey = "3-3";
    state.selectedEmployeeId = "";
    state.selectedRoleKey = "";
    state.activeHealthTab = "risk";
    state.selectedHealthIndex = 0;
    state.cleaningView = "after";
    state.uploadNote = "已切回官方讲述版，可直接进入总览开始讲述。";
    state.route = "overview";
    window.location.hash = "overview";
    render();
  }

  function handleDirtyDemo() {
    useRows((demo.dirty && (demo.dirty.employee_master || demo.dirty.employees)) || [], "AI 清洗演示版", "upload", {
      workforceMonthly: (demo.dirty && demo.dirty.workforce_monthly) || (demo.clean && demo.clean.workforce_monthly) || [],
      recruitingReqs: (demo.dirty && demo.dirty.recruiting_reqs) || (demo.clean && demo.clean.recruiting_reqs) || [],
      exitEvents: (demo.dirty && demo.dirty.exit_events) || (demo.clean && demo.clean.exit_events) || []
    });
    state.selectedDepartment = "All";
    state.selectedJobLevel = "All";
    state.selectedOverviewDepartment = "";
    state.selectedOperationsDepartment = "";
    state.selectedIssueIndex = 0;
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
    state.selectedOverviewDepartment = "";
    state.selectedOperationsDepartment = "";
    state.selectedIssueIndex = 0;
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
      "TalentPulse V7 组织诊断汇报摘要",
      "",
      "一、公司现状",
      summary.state,
      "",
      "二、三个核心问题",
      issues.slice(0, 3).map((item) => `- ${item.title}\n  现状表现：${item.phenomenon}\n  根因解释：${item.rootCause}\n  风险外推：${item.likelyConsequence}\n  建议动作：${item.judgment}`).join("\n"),
      "",
      "三、未来风险",
      predictSignals(summary).map((item) => `- ${item}`).join("\n"),
      "",
      "四、优先建议",
      `- 立即动作：${actions.immediate.map((item) => item.action).join("；")}`,
      `- 中期动作：${actions.mid.map((item) => item.action).join("；")}`,
      `- 梯队建设：${actions.bench.map((item) => item.action).join("；")}`
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "澄曜云服科技-组织诊断汇报摘要.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  function bindEvents() {
    document.querySelectorAll('[data-action="try-demo"]').forEach((node) => { node.onclick = handleDemo; });
    document.querySelectorAll('[data-action="try-dirty-demo"]').forEach((node) => { node.onclick = handleDirtyDemo; });
    document.querySelectorAll('#upload-input, #upload-input-top').forEach((input) => { input.onchange = (event) => handleFile(event.target.files && event.target.files[0]); });
    document.querySelectorAll('[data-overview-department]').forEach((node) => { node.onclick = () => { state.selectedOverviewDepartment = node.getAttribute('data-overview-department') || ""; render(); }; });
    document.querySelectorAll('[data-operations-department]').forEach((node) => { node.onclick = () => { state.selectedOperationsDepartment = node.getAttribute('data-operations-department') || ""; render(); }; });
    document.querySelectorAll('[data-overview-issue]').forEach((node) => { node.onclick = () => { state.selectedIssueIndex = Number(node.getAttribute('data-overview-issue') || 0); const focusDepartment = node.getAttribute('data-overview-issue-dept') || ""; if (focusDepartment) state.selectedOverviewDepartment = focusDepartment; render(); }; });
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
    render();
  }

  useRows((demo.clean && (demo.clean.employee_master || demo.clean.employees)) || [], '官方讲述版', 'demo', {
    workforceMonthly: (demo.clean && demo.clean.workforce_monthly) || [],
    recruitingReqs: (demo.clean && demo.clean.recruiting_reqs) || [],
    exitEvents: (demo.clean && demo.clean.exit_events) || []
  });
  window.addEventListener('hashchange', syncRoute);
  syncRoute();
})();
