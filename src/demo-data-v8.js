window.TALENTPULSE_DEMO_V8 = (function () {
  const COMPANY_NAME = "澄曜云服科技";
  const PRODUCT_NAME = "TalentPulse";
  const START_MONTH = "2023-01";
  const END_MONTH = "2025-12";

  const surnames = ["陈", "林", "王", "李", "周", "吴", "徐", "孙", "赵", "刘", "何", "高", "马", "郭", "邓", "郑", "罗", "宋", "唐", "许", "谢", "梁"];
  const givenNames = ["知远", "书宁", "景澄", "亦安", "可言", "时安", "映雪", "屿川", "以诺", "明序", "若安", "言之", "承泽", "闻笙", "思远", "星遥", "清和", "观澜", "嘉树", "念之", "予安", "映川"];
  const cities = ["上海", "北京", "杭州", "深圳", "成都", "广州", "苏州", "武汉"];

  const departments = [
    {
      department: "战略与经营",
      story: "strategy",
      size: 8,
      subDepartments: ["战略规划", "经营管理"],
      family: "战略管理",
      icTitles: ["经营分析专家", "战略分析师"],
      managerTitle: "战略规划经理",
      directorTitle: "战略与经营负责人",
      cities: ["上海", "北京"]
    },
    {
      department: "产品与设计",
      story: "product",
      size: 34,
      subDepartments: ["流程产品", "数据平台产品", "体验设计"],
      family: "产品设计",
      icTitles: ["产品经理", "体验设计师", "设计研究员"],
      managerTitle: "产品设计经理",
      directorTitle: "产品与设计总监",
      cities: ["上海", "杭州", "深圳"]
    },
    {
      department: "研发中心",
      story: "engineering",
      size: 96,
      subDepartments: ["后端平台", "前端体验", "数据工程", "测试与质量", "架构与基础设施"],
      family: "研发",
      icTitles: ["后端工程师", "前端工程师", "数据工程师", "测试工程师"],
      managerTitle: "研发经理",
      directorTitle: "研发中心总监",
      cities: ["上海", "杭州", "成都"]
    },
    {
      department: "销售增长",
      story: "sales",
      size: 52,
      subDepartments: ["华东销售", "华南销售", "企业销售"],
      family: "销售",
      icTitles: ["客户经理", "大客户经理"],
      managerTitle: "销售经理",
      directorTitle: "销售增长总监",
      cities: ["上海", "北京", "深圳"]
    },
    {
      department: "客户成功",
      story: "cs",
      size: 36,
      subDepartments: ["实施顾问", "续约增购", "客户运营"],
      family: "客户成功",
      icTitles: ["客户成功经理", "实施顾问", "续约顾问"],
      managerTitle: "客户成功经理",
      directorTitle: "客户成功负责人",
      cities: ["上海", "广州", "成都"]
    },
    {
      department: "交付运营",
      story: "operations",
      size: 30,
      subDepartments: ["项目交付", "流程运营", "质量运营"],
      family: "运营",
      icTitles: ["运营经理", "流程运营专家", "交付专员"],
      managerTitle: "交付运营经理",
      directorTitle: "交付运营负责人",
      cities: ["上海", "武汉"]
    },
    {
      department: "市场品牌",
      story: "marketing",
      size: 12,
      subDepartments: ["品牌传播", "增长营销"],
      family: "市场",
      icTitles: ["品牌经理", "增长营销经理"],
      managerTitle: "市场品牌经理",
      directorTitle: "市场品牌负责人",
      cities: ["上海", "北京"]
    },
    {
      department: "人力资源",
      story: "support",
      size: 10,
      subDepartments: ["招聘", "HRBP", "组织发展"],
      family: "人力资源",
      icTitles: ["HRBP", "招聘顾问", "组织发展顾问"],
      managerTitle: "人力资源经理",
      directorTitle: "人力资源负责人",
      cities: ["上海"]
    },
    {
      department: "财务法务",
      story: "support",
      size: 9,
      subDepartments: ["财务分析", "法务合规"],
      family: "财务法务",
      icTitles: ["财务分析师", "法务合规顾问"],
      managerTitle: "财务法务经理",
      directorTitle: "财务法务负责人",
      cities: ["上海"]
    },
    {
      department: "IT与数据平台",
      story: "support",
      size: 13,
      subDepartments: ["IT 运维", "数据治理", "商业智能"],
      family: "IT与数据",
      icTitles: ["IT 运维工程师", "数据平台工程师", "BI 分析师"],
      managerTitle: "IT 与数据平台经理",
      directorTitle: "IT与数据平台负责人",
      cities: ["上海", "苏州"]
    }
  ];

  const headcountAnchors = {
    "2022-12": {
      "战略与经营": 6, "产品与设计": 22, "研发中心": 60, "销售增长": 28, "客户成功": 18, "交付运营": 18, "市场品牌": 8, "人力资源": 7, "财务法务": 6, "IT与数据平台": 10
    },
    "2023-12": {
      "战略与经营": 7, "产品与设计": 28, "研发中心": 80, "销售增长": 38, "客户成功": 24, "交付运营": 22, "市场品牌": 10, "人力资源": 8, "财务法务": 7, "IT与数据平台": 12
    },
    "2024-12": {
      "战略与经营": 8, "产品与设计": 32, "研发中心": 92, "销售增长": 50, "客户成功": 34, "交付运营": 28, "市场品牌": 12, "人力资源": 10, "财务法务": 8, "IT与数据平台": 14
    },
    "2025-12": {
      "战略与经营": 8, "产品与设计": 34, "研发中心": 96, "销售增长": 52, "客户成功": 36, "交付运营": 30, "市场品牌": 12, "人力资源": 10, "财务法务": 9, "IT与数据平台": 13
    }
  };

  function monthList(start, end) {
    const list = [];
    let [year, month] = start.split("-").map(Number);
    const [endYear, endMonth] = end.split("-").map(Number);
    while (year < endYear || (year === endYear && month <= endMonth)) {
      list.push(`${year}-${String(month).padStart(2, "0")}`);
      month += 1;
      if (month === 13) {
        month = 1;
        year += 1;
      }
    }
    return list;
  }

  const months = monthList(START_MONTH, END_MONTH);

  function seasonal(index, amplitude) {
    const base = [0, 0.2, 0.4, 0.7, 1, 0.8, 0.2, -0.3, -0.5, -0.2, 0.1, 0.4][index % 12];
    return Math.round(base * amplitude * 10) / 10;
  }

  function trendValue(department, month) {
    const year = Number(month.slice(0, 4));
    const monthIndex = Number(month.slice(5, 7));
    const prev = year === 2023 ? headcountAnchors["2022-12"][department] : year === 2024 ? headcountAnchors["2023-12"][department] : headcountAnchors["2024-12"][department];
    const next = year === 2023 ? headcountAnchors["2023-12"][department] : year === 2024 ? headcountAnchors["2024-12"][department] : headcountAnchors["2025-12"][department];
    const progress = (monthIndex - 1) / 11;
    const base = prev + (next - prev) * progress;
    return Math.round(base);
  }

  function companyStoryLabel(story) {
    return {
      strategy: "经营牵引",
      product: "关键岗位集中",
      engineering: "高潜转化偏慢",
      sales: "头部依赖偏重",
      cs: "识别不足",
      operations: "稳定掩盖停滞",
      marketing: "支撑增长",
      support: "低可见度高风险"
    }[story] || "常规团队";
  }

  function nameAt(index) {
    return `${surnames[index % surnames.length]}${givenNames[index % givenNames.length]}`;
  }

  function levelAt(localIndex, size) {
    if (localIndex === 0) return "D1";
    if (localIndex < Math.min(4, size)) return "M2";
    if (localIndex < Math.min(10, size)) return "M1";
    return `P${(localIndex % 5) + 1}`;
  }

  function titleAt(config, level, localIndex) {
    if (level === "D1") return config.directorTitle;
    if (level.startsWith("M")) return config.managerTitle;
    return config.icTitles[localIndex % config.icTitles.length];
  }

  function scoreProfile(story, localIndex, level) {
    const manager = level.startsWith("M") || level === "D1";
    const director = level === "D1";
    if (story === "engineering") {
      return {
        performance: ["B+", "A", "B+", "B", "B+", "B"][localIndex % 6],
        lastPerformance: ["B", "B+", "A", "B", "B+", "B"][localIndex % 6],
        potential: manager ? (localIndex % 3 === 0 ? "Medium" : "High") : (localIndex % 4 <= 1 ? "High" : "Medium"),
        readiness: director ? "Ready in 1-2 Years" : manager ? (localIndex % 5 === 0 ? "Ready Now" : "Ready in 2-3 Years") : (localIndex % 6 === 0 ? "Ready in 1-2 Years" : "Not Ready Yet"),
        flightRisk: localIndex % 8 === 0 ? "Medium" : "Low",
        mobility: localIndex % 3 === 0 ? "Y" : "N",
        successorNomination: manager ? (localIndex % 4 === 0 ? "N" : "Y") : (localIndex % 7 === 0 ? "Y" : "N"),
        experienceGap: manager && localIndex % 3 !== 0 ? "High" : "Medium",
        successionDepth: manager ? (localIndex % 3 === 0 ? 1 : 2) : 0,
        keyTalent: localIndex % 4 === 0 ? "Y" : "N",
        riskTags: "高潜储备、管理转化偏慢"
      };
    }
    if (story === "sales") {
      return {
        performance: ["A", "A", "B+", "A", "B+"][localIndex % 5],
        lastPerformance: ["A", "B+", "A", "B+", "B"][localIndex % 5],
        potential: manager ? "Medium" : (localIndex % 5 === 0 ? "High" : "Medium"),
        readiness: manager ? (localIndex % 3 === 0 ? "Ready Now" : "Ready in 1-2 Years") : (localIndex % 5 === 0 ? "Ready in 1-2 Years" : "Ready in 2-3 Years"),
        flightRisk: localIndex % 3 === 0 ? "High" : (localIndex % 2 === 0 ? "Medium" : "High"),
        mobility: localIndex % 2 === 0 ? "Y" : "N",
        successorNomination: manager ? (localIndex % 5 === 0 ? "N" : "Y") : (localIndex % 6 === 0 ? "Y" : "N"),
        experienceGap: manager ? "Medium" : "Low",
        successionDepth: manager ? 1 : 0,
        keyTalent: localIndex % 3 === 0 ? "Y" : "N",
        riskTags: "头部依赖、保留风险"
      };
    }
    if (story === "operations") {
      return {
        performance: ["B+", "B", "B", "B+", "B"][localIndex % 5],
        lastPerformance: ["B", "B", "B+", "B", "B"][localIndex % 5],
        potential: manager ? "Medium" : (localIndex % 5 === 0 ? "Medium" : "Low"),
        readiness: manager ? (localIndex % 4 === 0 ? "Ready in 1-2 Years" : "Ready in 2-3 Years") : "Not Ready Yet",
        flightRisk: "Low",
        mobility: localIndex % 6 === 0 ? "Y" : "N",
        successorNomination: manager ? (localIndex % 4 === 0 ? "Y" : "N") : "N",
        experienceGap: manager ? "Medium" : "Low",
        successionDepth: manager ? 1 : 0,
        keyTalent: localIndex % 8 === 0 ? "Y" : "N",
        riskTags: "稳定掩盖停滞、后备偏薄"
      };
    }
    if (story === "product") {
      return {
        performance: ["B+", "A", "B+", "B", "B+"][localIndex % 5],
        lastPerformance: ["B", "B+", "A", "B+", "B"][localIndex % 5],
        potential: manager ? "High" : (localIndex % 3 === 0 ? "High" : "Medium"),
        readiness: manager ? (localIndex % 4 === 0 ? "Ready Now" : "Ready in 2-3 Years") : (localIndex % 4 === 0 ? "Ready in 1-2 Years" : "Not Ready Yet"),
        flightRisk: localIndex % 5 === 0 ? "Medium" : "Low",
        mobility: localIndex % 4 === 0 ? "Y" : "N",
        successorNomination: manager ? (localIndex % 3 === 0 ? "N" : "Y") : "N",
        experienceGap: manager ? "High" : "Medium",
        successionDepth: manager ? 1 : 0,
        keyTalent: localIndex % 4 <= 1 ? "Y" : "N",
        riskTags: "关键岗位集中、单点依赖"
      };
    }
    if (story === "cs") {
      return {
        performance: ["B+", "B", "B+", "A", "B"][localIndex % 5],
        lastPerformance: ["B", "B", "B+", "B+", "B"][localIndex % 5],
        potential: manager ? "Medium" : (localIndex % 6 === 0 ? "High" : localIndex % 2 === 0 ? "Medium" : "Low"),
        readiness: manager ? (localIndex % 4 === 0 ? "Ready in 1-2 Years" : "Ready in 2-3 Years") : (localIndex % 7 === 0 ? "Ready in 2-3 Years" : "Not Ready Yet"),
        flightRisk: localIndex % 6 === 0 ? "Medium" : "Low",
        mobility: localIndex % 4 === 0 ? "Y" : "N",
        successorNomination: manager ? "Y" : (localIndex % 8 === 0 ? "Y" : "N"),
        experienceGap: manager ? "Medium" : "Low",
        successionDepth: manager ? 1 : 0,
        keyTalent: localIndex % 7 === 0 ? "Y" : "N",
        riskTags: "规模增长、高潜识别不足"
      };
    }
    if (story === "support") {
      return {
        performance: ["B+", "B", "B+", "B", "A"][localIndex % 5],
        lastPerformance: ["B", "B", "B+", "B", "B+"][localIndex % 5],
        potential: manager ? "Medium" : (localIndex % 4 === 0 ? "Medium" : "Low"),
        readiness: manager ? (localIndex % 3 === 0 ? "Ready in 1-2 Years" : "Ready in 2-3 Years") : "Not Ready Yet",
        flightRisk: localIndex % 6 === 0 ? "Medium" : "Low",
        mobility: localIndex % 5 === 0 ? "Y" : "N",
        successorNomination: manager ? (localIndex % 2 === 0 ? "N" : "Y") : "N",
        experienceGap: manager ? "High" : "Medium",
        successionDepth: manager ? 1 : 0,
        keyTalent: localIndex % 4 === 0 ? "Y" : "N",
        riskTags: "低可见度、继任暴露"
      };
    }
    return {
      performance: ["B+", "B", "A", "B"][localIndex % 4],
      lastPerformance: ["B", "B+", "B", "A"][localIndex % 4],
      potential: manager ? "Medium" : (localIndex % 3 === 0 ? "High" : "Medium"),
      readiness: manager ? "Ready in 1-2 Years" : "Ready in 2-3 Years",
      flightRisk: localIndex % 5 === 0 ? "Medium" : "Low",
      mobility: localIndex % 4 === 0 ? "Y" : "N",
      successorNomination: manager ? "Y" : "N",
      experienceGap: director ? "Medium" : "Low",
      successionDepth: director ? 2 : 0,
      keyTalent: localIndex % 5 === 0 ? "Y" : "N",
      riskTags: companyStoryLabel(story)
    };
  }

  function createEmployeeMaster() {
    const rows = [];
    let id = 1;
    departments.forEach((config) => {
      const leaders = [];
      const managers = [];
      for (let i = 0; i < config.size; i += 1) {
        const level = levelAt(i, config.size);
        const profile = scoreProfile(config.story, i, level);
        const employeeId = `CY${String(id).padStart(4, "0")}`;
        const managerId = i === 0 ? "CEO-0001" : level === "M2" ? (leaders[0] || "CEO-0001") : (managers[i % Math.max(1, managers.length)] || leaders[0] || "CEO-0001");
        const managementSpan = level === "D1" ? 11 + (i % 4) : level === "M2" ? 7 + (i % 3) : level === "M1" ? 4 + (i % 3) : 0;
        const roleChangeCount = level === "D1" ? 3 : level.startsWith("M") ? 2 + (i % 2) : i % 3;
        const employee = {
          employee_id: employeeId,
          name: nameAt(id),
          gender: id % 2 === 0 ? "女" : "男",
          age: 24 + ((id * 3) % 16) + (level === "D1" ? 11 : level.startsWith("M") ? 6 : 0),
          department: config.department,
          sub_department: config.subDepartments[i % config.subDepartments.length],
          position_title: titleAt(config, level, i),
          job_family: config.family,
          job_level: level,
          manager_id: managerId,
          tenure_years: Number((1.2 + ((id * 5) % 64) / 10).toFixed(1)),
          hire_date: `20${18 + (id % 7)}-${String((id % 12) + 1).padStart(2, "0")}-${String((id % 27) + 1).padStart(2, "0")}`,
          city: config.cities[i % config.cities.length] || cities[id % cities.length],
          performance_current: profile.performance,
          performance_last_year: profile.lastPerformance,
          potential_level: profile.potential,
          training_completion_rate: 58 + ((id * 11) % 39),
          promotion_count: level === "D1" ? 3 : level.startsWith("M") ? 2 : id % 3,
          mobility_flag: profile.mobility,
          critical_role_flag: level === "D1" || level === "M2" || (config.story === "product" && level === "M1" && i < 8) ? "Y" : "N",
          successor_nomination_flag: profile.successorNomination,
          readiness_level: profile.readiness,
          flight_risk: profile.flightRisk,
          manager_recommendation: profile.performance === "A" ? "Strongly Recommend" : profile.performance === "B+" ? "Recommend" : profile.performance === "B" ? "Observe" : "Not Recommend",
          engagement_score: 64 + ((id * 13) % 28),
          salary_band: ["A1", "A2", "A3", "B1", "B2", "C1", "C2", "D1"][id % 8],
          critical_experience_gap: profile.experienceGap,
          management_span: managementSpan,
          role_change_count: roleChangeCount,
          key_talent_flag: profile.keyTalent,
          succession_depth: profile.successionDepth,
          risk_source_tags: profile.riskTags
        };
        rows.push(employee);
        if (level === "D1" && !leaders.length) leaders.push(employeeId);
        if (level === "M2" || level === "M1") managers.push(employeeId);
        id += 1;
      }
    });
    return rows;
  }

  function readinessPair(story, year) {
    if (story === "engineering") return year === 2023 ? [7, 16] : year === 2024 ? [7, 18] : [8, 19];
    if (story === "sales") return year === 2023 ? [10, 17] : year === 2024 ? [11, 18] : [11, 18];
    if (story === "operations") return year === 2023 ? [8, 12] : year === 2024 ? [7, 11] : [7, 10];
    if (story === "product") return year === 2023 ? [6, 12] : year === 2024 ? [6, 11] : [6, 10];
    if (story === "cs") return year === 2023 ? [9, 13] : year === 2024 ? [8, 12] : [8, 11];
    if (story === "support") return year === 2023 ? [12, 14] : year === 2024 ? [11, 13] : [9, 11];
    return [10, 15];
  }

  function hipoRate(story, year) {
    if (story === "engineering") return year === 2023 ? 15 : year === 2024 ? 16 : 15;
    if (story === "sales") return year === 2023 ? 9 : year === 2024 ? 8 : 8;
    if (story === "operations") return year === 2023 ? 8 : year === 2024 ? 7 : 6;
    if (story === "product") return year === 2023 ? 13 : year === 2024 ? 12 : 11;
    if (story === "cs") return year === 2023 ? 8 : year === 2024 ? 7 : 7;
    if (story === "support") return year === 2023 ? 9 : year === 2024 ? 8 : 7;
    return 10;
  }

  function monthlyDepartmentRows() {
    const rows = [];
    const previousCount = {};
    months.forEach((month, monthIndex) => {
      const year = Number(month.slice(0, 4));
      departments.forEach((config, deptIndex) => {
        const departmentHeadcount = trendValue(config.department, month) + (monthIndex % 6 === deptIndex % 6 ? 1 : 0);
        const prevHeadcount = previousCount[config.department] == null ? trendValue(config.department, month) : previousCount[config.department];
        const growth = departmentHeadcount - prevHeadcount;
        const phaseHiring = year === 2023 ? 3.2 : year === 2024 ? 2.5 : 1.4;
        const phaseExit = year === 2023 ? 1.1 : year === 2024 ? 1.6 : 1.3;
        const hires = Math.max(0, Math.round(Math.max(growth, 0) + seasonal(monthIndex + deptIndex, phaseHiring) + (config.story === "engineering" && year === 2023 ? 3 : 0) + (config.story === "sales" && year === 2024 ? 2 : 0)));
        const exits = Math.max(0, Math.round(Math.max(-growth, 0) + seasonal(monthIndex + deptIndex + 2, phaseExit) + (config.story === "sales" && year === 2024 ? 2 : 0) + (config.story === "cs" && year === 2024 ? 1 : 0)));
        const voluntaryAttritionRate = Number((((exits + (config.story === "sales" && year === 2024 ? 1.4 : 0)) / Math.max(1, departmentHeadcount)) * 100).toFixed(1));
        const regrettableAttritionRate = Number((voluntaryAttritionRate * (config.story === "sales" && year === 2024 ? 0.48 : config.story === "engineering" ? 0.32 : 0.25)).toFixed(1));
        const [readyNowCoverage, readySoonCoverage] = readinessPair(config.story, year);
        const criticalRoleGapCount =
          config.story === "product" ? (year === 2023 ? 3 : year === 2024 ? 4 : 5) :
          config.story === "engineering" ? (year === 2023 ? 4 : year === 2024 ? 5 : 4) :
          config.story === "sales" ? (year === 2023 ? 2 : year === 2024 ? 3 : 3) :
          config.story === "operations" ? (year === 2023 ? 2 : year === 2024 ? 2 : 3) :
          config.story === "cs" ? (year === 2023 ? 2 : year === 2024 ? 3 : 3) :
          config.story === "support" ? (year === 2023 ? 1 : year === 2024 ? 2 : 2) : 1;
        const internalMoves =
          year === 2023 ? Math.max(0, Math.round(departmentHeadcount * 0.01) + (config.story === "engineering" ? 1 : 0)) :
          year === 2024 ? Math.max(0, Math.round(departmentHeadcount * 0.012) + (config.story === "sales" ? 1 : 0)) :
          Math.max(0, Math.round(departmentHeadcount * 0.013) + (config.story === "operations" ? 1 : 0));
        rows.push({
          month,
          company_headcount: 0,
          department: config.department,
          department_headcount: departmentHeadcount,
          hires,
          exits,
          voluntary_attrition_rate: voluntaryAttritionRate,
          regrettable_attrition_rate: regrettableAttritionRate,
          internal_moves: internalMoves,
          ready_now_coverage: readyNowCoverage,
          ready_soon_coverage: readySoonCoverage,
          high_potential_rate: hipoRate(config.story, year),
          critical_role_gap_count: criticalRoleGapCount
        });
        previousCount[config.department] = departmentHeadcount;
      });
      const companyTotal = rows.filter((item) => item.month === month).reduce((sum, item) => sum + item.department_headcount, 0);
      rows.filter((item) => item.month === month).forEach((item) => { item.company_headcount = companyTotal; });
    });
    return rows;
  }

  function pickPosition(config, index) {
    return config.icTitles[index % config.icTitles.length];
  }

  function recruitingRanges(department) {
    return {
      "研发中心": { low: 45, high: 78 },
      "产品与设计": { low: 35, high: 60 },
      "销售增长": { low: 22, high: 40 },
      "客户成功": { low: 25, high: 42 },
      "交付运营": { low: 18, high: 35 },
      "人力资源": { low: 25, high: 45 },
      "财务法务": { low: 30, high: 55 },
      "IT与数据平台": { low: 35, high: 65 },
      "市场品牌": { low: 24, high: 42 },
      "战略与经营": { low: 28, high: 48 }
    }[department] || { low: 28, high: 52 };
  }

  function recruitingReqs(workforceRows) {
    const reqs = [];
    let reqIndex = 1;
    workforceRows.filter((row) => row.department !== "战略与经营").forEach((row, index) => {
      const config = departments.find((item) => item.department === row.department);
      const year = Number(row.month.slice(0, 4));
      const month = row.month;
      const demand = Math.max(0, Math.round((row.hires / 3) + (row.department === "研发中心" && year === 2023 ? 2 : 0) + (row.department === "销售增长" && year === 2024 ? 2 : 0) + (row.department === "交付运营" && year === 2024 ? 1 : 0)));
      for (let i = 0; i < demand; i += 1) {
        const criticalRole = config.story === "product" ? i % 2 === 0 : config.story === "engineering" ? i % 3 === 0 : config.story === "sales" ? i % 4 === 0 : config.story === "support" ? i % 3 === 0 : false;
        const openDay = String(((index + i) % 23) + 1).padStart(2, "0");
        const range = recruitingRanges(row.department);
        const phaseLift = year === 2023 ? 4 : year === 2024 ? 6 : -2;
        const storyLift = config.story === "engineering" ? 5 : config.story === "sales" && year === 2024 ? 6 : config.story === "product" ? 4 : config.story === "support" ? 3 : 2;
        const internalFill = year === 2025 && (config.story === "support" || config.story === "operations") ? (i % 3 === 0 ? "Y" : "N") : year === 2024 && config.story === "sales" ? "N" : (i % 5 === 0 ? "Y" : "N");
        const rawTimeToFill = range.low + phaseLift + storyLift + ((index + i) % Math.max(6, Math.round((range.high - range.low) / 3)));
        const timeToFill = internalFill === "Y" ? Math.max(16, rawTimeToFill - 12) : Math.min(range.high, Math.max(range.low, rawTimeToFill));
        const sourceChannel = year === 2023 ? ["招聘平台", "内推", "猎头"][i % 3] : year === 2024 ? ["猎头", "招聘平台", "员工推荐"][i % 3] : ["员工推荐", "招聘平台", "人才社区"][i % 3];
        const recruiterType = sourceChannel === "猎头" ? "外部猎头" : "内部招聘";
        const agencyCost = recruiterType === "外部猎头" ? 18000 + ((i + index) % 7) * 2500 : 0;
        const familyCost = row.department === "销售增长" ? 8000 : row.department === "研发中心" ? 12000 : row.department === "产品与设计" ? 10500 : row.department === "IT与数据平台" ? 9800 : row.department === "财务法务" ? 9200 : 7600;
        const phaseCostLift = year === 2024 && (row.department === "销售增长" || row.department === "研发中心") ? 9000 : year === 2025 ? -1800 : 0;
        const totalCost = Math.max(8600, agencyCost + familyCost + phaseCostLift + ((index + i) % 9) * 1500 + (criticalRole ? 11000 : 0));
        reqs.push({
          req_id: `REQ-${String(reqIndex).padStart(4, "0")}`,
          department: row.department,
          position: pickPosition(config, i + index),
          critical_role_flag: criticalRole ? "Y" : "N",
          open_date: `${month}-${openDay}`,
          close_date: addDays(`${month}-${openDay}`, timeToFill),
          time_to_fill_days: timeToFill,
          source_channel: sourceChannel,
          recruiter_type: recruiterType,
          agency_cost: agencyCost,
          total_cost: totalCost,
          offer_count: 1 + ((i + index) % 3),
          offer_acceptance_rate: Number((year === 2023 ? 0.79 : year === 2024 ? 0.71 : 0.77).toFixed(2)),
          internal_fill_flag: internalFill
        });
        reqIndex += 1;
      }
    });
    return reqs;
  }

  function criticalRoles(employeeRows, workforceRows) {
    const latestMonth = "2025-12";
    const monthlyMap = Object.fromEntries((workforceRows || []).filter((row) => row.month === latestMonth).map((row) => [row.department, row]));
    return (employeeRows || [])
      .filter((row) => row.critical_role_flag === "Y")
      .map((row, index) => {
        const monthly = monthlyMap[row.department] || {};
        const depth = Number(row.succession_depth || 0);
        const benchStatus = depth <= 1 ? "单点依赖" : depth === 2 ? "名义覆盖但弱" : "覆盖相对完整";
        return {
          role_id: `CR-${String(index + 1).padStart(4, "0")}`,
          snapshot_month: latestMonth,
          department: row.department,
          sub_department: row.sub_department,
          role_name: row.position_title,
          incumbent_id: row.employee_id,
          incumbent_name: row.name,
          job_level: row.job_level,
          ready_now_coverage: Number(monthly.ready_now_coverage || 0),
          ready_soon_coverage: Number(monthly.ready_soon_coverage || 0),
          succession_depth: depth,
          bench_status: benchStatus,
          critical_gap_count: Number(monthly.critical_role_gap_count || 0),
          key_experience_gap: row.critical_experience_gap,
          risk_source_tags: row.risk_source_tags,
          vacancy_exposure: row.successor_nomination_flag === "Y" ? (depth <= 1 ? "中高" : "中") : "高"
        };
      })
      .sort((a, b) => Number(b.critical_gap_count || 0) - Number(a.critical_gap_count || 0));
  }

  function addDays(dateText, days) {
    const date = new Date(`${dateText}T00:00:00`);
    date.setDate(date.getDate() + days);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function exitEvents(workforceRows) {
    const events = [];
    let exitIndex = 1;
    workforceRows.forEach((row, index) => {
      const count = Math.max(0, Math.round(row.exits * (row.department === "销售增长" && row.month.startsWith("2024") ? 1 : 0.7)));
      for (let i = 0; i < count; i += 1) {
        const regrettable = row.department === "销售增长" && row.month.startsWith("2024") ? (i % 2 === 0 ? "Y" : "N") : row.department === "研发中心" ? (i % 3 === 0 ? "Y" : "N") : "N";
        const reason = row.department === "销售增长" ? "高绩效竞争挖角" : row.department === "交付运营" ? "成长机会有限" : row.department === "产品与设计" ? "关键岗位发展路径不清" : row.department === "客户成功" ? "项目压力与客户压力" : "岗位替代机会";
        const impact = regrettable === "Y" ? "高" : row.department === "产品与设计" || row.department === "研发中心" ? "中高" : "中";
        events.push({
          exit_id: `EXIT-${String(exitIndex).padStart(4, "0")}`,
          employee_id: `HIST-${String(exitIndex).padStart(4, "0")}`,
          exit_date: `${row.month}-${String(((index + i) % 23) + 1).padStart(2, "0")}`,
          department: row.department,
          level: ["P2", "P3", "M1", "M2"][i % 4],
          regrettable_flag: regrettable,
          reason_tag: reason,
          replacement_time_days: row.department === "产品与设计" ? 86 : row.department === "销售增长" ? 62 : row.department === "研发中心" ? 78 : 55,
          impact_level: impact
        });
        exitIndex += 1;
      }
    });
    return events;
  }

  function aliasDepartment(value, index) {
    if (value === "研发中心" && index % 11 === 0) return "Engineering Center";
    if (value === "销售增长" && index % 13 === 0) return "Sales Team";
    if (value === "交付运营" && index % 17 === 0) return "Operations Hub";
    if (value === "产品与设计" && index % 19 === 0) return "产品设计";
    if (value === "财务法务" && index % 23 === 0) return "Finance Legal";
    if (value === "IT与数据平台" && index % 29 === 0) return "IT/Data";
    return value;
  }

  function aliasTitle(value, index) {
    if (value === "产品经理" && index % 7 === 0) return "产经";
    if (value === "客户成功经理" && index % 9 === 0) return "CSM";
    if (value === "客户经理" && index % 8 === 0) return "AE";
    if (value === "IT 与数据平台经理" && index % 6 === 0) return "IT Ops Mgr";
    return value;
  }

  function dirtyEmployeeRows(cleanRows) {
    return cleanRows.map((employee, index) => {
      const row = {
        emp_id: employee.employee_id,
        员工姓名: employee.name,
        sex: employee.gender,
        年龄: index % 37 === 0 ? employee.age + 19 : employee.age,
        dept: aliasDepartment(employee.department, index),
        团队: employee.sub_department,
        岗位简称: aliasTitle(employee.position_title, index),
        职能: employee.job_family,
        职级: employee.job_level,
        直属上级: index % 41 === 0 ? "MISSING-9999" : employee.manager_id,
        司龄: employee.tenure_years,
        入职日期: index % 14 === 0 ? employee.hire_date.replace(/-/g, "/") : employee.hire_date,
        城市: employee.city,
        当前绩效: employee.performance_current,
        上年绩效: employee.performance_last_year,
        potential: index % 16 === 0 ? "" : employee.potential_level === "High" ? "高潜" : employee.potential_level === "Medium" ? "中潜" : "低潜",
        培训完成率: employee.training_completion_rate,
        晋升次数: employee.promotion_count,
        流动意愿: employee.mobility_flag,
        关键岗位flag: employee.critical_role_flag,
        继任提名: index % 22 === 0 ? "N" : employee.successor_nomination_flag,
        继任准备度: employee.readiness_level === "Ready Now" ? "现在可接任" : employee.readiness_level === "Ready in 1-2 Years" ? "1-2 年可接任" : employee.readiness_level === "Ready in 2-3 Years" ? "2-3 年可接任" : "暂未就绪",
        离职风险: employee.flight_risk === "High" ? "高" : employee.flight_risk === "Medium" ? "中" : "低",
        经理推荐: employee.manager_recommendation === "Strongly Recommend" ? "强烈推荐" : employee.manager_recommendation === "Recommend" ? "推荐" : employee.manager_recommendation === "Observe" ? "继续观察" : "暂不推荐",
        敬业度: employee.engagement_score,
        薪级: employee.salary_band,
        关键经验缺口: employee.critical_experience_gap === "High" ? "高" : employee.critical_experience_gap === "Medium" ? "中" : "低",
        管理跨度: employee.management_span,
        岗位变动次数: employee.role_change_count,
        关键人才: employee.key_talent_flag,
        继任覆盖深度: employee.succession_depth,
        风险来源标签: employee.risk_source_tags
      };
      if (index % 27 === 0) row["员工姓名"] = ` ${row["员工姓名"]} `;
      if (index % 31 === 0) row.emp_id = cleanRows[Math.max(0, index - 1)].employee_id;
      return row;
    });
  }

  const employeeMaster = createEmployeeMaster();
  const workforceMonthly = monthlyDepartmentRows();
  const recruitingReqsData = recruitingReqs(workforceMonthly);
  const exitEventsData = exitEvents(workforceMonthly);
  const criticalRolesData = criticalRoles(employeeMaster, workforceMonthly);

  const metadata = {
    company_name: COMPANY_NAME,
    product_name: PRODUCT_NAME,
    industry: "面向中大型企业的 B2B SaaS + 实施交付公司",
    business_modules: ["流程自动化平台", "数据集成与治理", "客户运营与续约支持", "企业级实施与交付服务"],
    revenue_model: ["SaaS 订阅", "实施项目", "存量续费与增购"],
    company_judgement: "业务增长已经进入收敛优化期，组织重点从扩编转向关键岗位稳定与梯队修复。",
    core_issue_tags: [
      "研发中心：高潜储备不低，但现在可接任管理梯队偏薄",
      "销售增长：业绩强，但头部依赖重、保留风险高",
      "交付运营：运行稳定，但成长动能不足、后备偏薄"
    ],
    priority_action: "先核验高暴露关键岗位，再稳住高绩效高风险人群，同时补近端接班梯队。",
    org_risks: [
      "研发中心：高潜储备不低，但现在可接任管理梯队偏薄",
      "销售增长：当前业绩强，但头部依赖重、保留风险高",
      "交付运营：运行稳定，但成长动能不足、后备薄",
      "产品与设计：关键岗位集中，单点依赖明显",
      "客户成功：团队规模不小，但高潜识别不足",
      "人力资源 / 财务法务 / IT与数据平台：人数少但继任暴露高"
    ]
  };

  return {
    clean: {
      label: "官方讲述版",
      employee_master: employeeMaster,
      workforce_monthly: workforceMonthly,
      recruiting_reqs: recruitingReqsData,
      exit_events: exitEventsData,
      critical_roles: criticalRolesData,
      employees: employeeMaster,
      metadata
    },
    dirty: {
      label: "AI 清洗演示版",
      employee_master: dirtyEmployeeRows(employeeMaster),
      workforce_monthly: workforceMonthly,
      recruiting_reqs: recruitingReqsData,
      exit_events: exitEventsData,
      critical_roles: criticalRolesData,
      employees: dirtyEmployeeRows(employeeMaster),
      metadata
    },
    metadata
  };
})();
