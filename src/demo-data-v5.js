window.TALENTPULSE_DEMO = (function () {
  const COMPANY_NAME = "澄曜科技";
  const PRODUCT_NAME = "TalentPulse";
  const surnames = ["陈", "林", "王", "李", "赵", "周", "吴", "徐", "孙", "刘", "何", "高", "马", "胡", "郭", "唐", "邓", "罗", "朱", "蒋"];
  const givenNames = ["若衡", "知言", "景川", "以宁", "书昀", "亦安", "泽言", "嘉树", "清和", "映雪", "时安", "闻笙", "予诺", "星遥", "承泽", "念之", "思远", "观澜", "昭宁", "可言", "言初", "明序"];
  const cities = ["上海", "北京", "杭州", "深圳", "成都", "广州", "苏州", "武汉"];
  const deptConfigs = [
    { department: "战略办公室", size: 8, subDepartments: ["战略规划", "经营管理"], family: "战略管理", icTitles: ["战略分析师"], managerTitle: "战略经理", directorTitle: "战略负责人", cities: ["上海", "北京"], story: "strategy" },
    { department: "产品与设计", size: 34, subDepartments: ["平台产品", "商业化产品", "体验设计"], family: "产品设计", icTitles: ["产品经理", "体验设计师"], managerTitle: "产品设计负责人", directorTitle: "产品与设计总监", cities: ["上海", "杭州", "深圳"], story: "product" },
    { department: "研发中心", size: 96, subDepartments: ["后端平台", "前端体验", "数据平台", "质量工程", "架构组"], family: "研发", icTitles: ["软件工程师", "数据工程师", "测试工程师"], managerTitle: "研发经理", directorTitle: "研发总监", cities: ["上海", "杭州", "成都"], story: "engineering" },
    { department: "销售增长", size: 52, subDepartments: ["华东销售", "华南销售", "企业销售"], family: "销售", icTitles: ["客户经理"], managerTitle: "销售经理", directorTitle: "销售总监", cities: ["上海", "北京", "深圳"], story: "sales" },
    { department: "客户成功", size: 40, subDepartments: ["实施交付", "续约增长", "客户运营"], family: "客户成功", icTitles: ["客户成功顾问", "实施顾问"], managerTitle: "客户成功经理", directorTitle: "客户成功负责人", cities: ["上海", "广州", "成都"], story: "cs" },
    { department: "交付运营", size: 30, subDepartments: ["业务运营", "流程运营", "质量运营"], family: "运营", icTitles: ["运营专员"], managerTitle: "运营经理", directorTitle: "交付运营负责人", cities: ["上海", "武汉"], story: "operations" },
    { department: "市场品牌", size: 12, subDepartments: ["品牌传播", "增长市场"], family: "市场", icTitles: ["品牌专员", "增长营销专员"], managerTitle: "市场经理", directorTitle: "市场品牌负责人", cities: ["上海", "北京"], story: "marketing" },
    { department: "人力资源", size: 10, subDepartments: ["招聘", "HRBP", "组织发展"], family: "人力资源", icTitles: ["HRBP", "招聘顾问"], managerTitle: "HRBP 经理", directorTitle: "人力资源负责人", cities: ["上海"], story: "support" },
    { department: "财务法务", size: 9, subDepartments: ["财务分析", "法务合规"], family: "财务法务", icTitles: ["财务分析师", "法务专员"], managerTitle: "财务法务经理", directorTitle: "财务法务负责人", cities: ["上海"], story: "support" },
    { department: "IT与数据平台", size: 9, subDepartments: ["IT 运维", "数据治理", "商业智能"], family: "IT与数据", icTitles: ["IT 运维工程师", "数据分析工程师"], managerTitle: "IT 数据平台主管", directorTitle: "IT与数据平台负责人", cities: ["上海", "苏州"], story: "support" }
  ];

  function nameAt(index) {
    return `${surnames[index % surnames.length]}${givenNames[index % givenNames.length]}`;
  }

  function levelAt(localIndex, size) {
    if (localIndex === 0) return "D1";
    if (localIndex < 4) return "M2";
    if (localIndex < Math.min(10, size)) return "M1";
    return `P${(localIndex % 5) + 1}`;
  }

  function titleAt(config, level, localIndex) {
    if (level === "D1") return config.directorTitle;
    if (level.startsWith("M")) return config.managerTitle;
    return config.icTitles[localIndex % config.icTitles.length];
  }

  function storyProfile(story, localIndex, level) {
    const leader = level === "D1" || level === "M2";
    const manager = level.startsWith("M") || level === "D1";
    if (story === "engineering") {
      return {
        performance: ["B+", "A", "B+", "B", "B+", "B"][localIndex % 6],
        lastPerformance: ["B", "B+", "A", "B", "B+", "B"][localIndex % 6],
        potential: leader ? (localIndex % 3 === 0 ? "中" : "高") : (localIndex % 4 < 2 ? "高" : "中"),
        readiness: leader ? (localIndex % 5 === 0 ? "现在可接任" : "2-3 年可接任") : (localIndex % 5 === 0 ? "1-2 年可接任" : "暂未就绪"),
        flightRisk: localIndex % 7 === 0 ? "中" : "低",
        mobility: localIndex % 3 === 0 ? "Y" : "N",
        successorNomination: manager ? (localIndex % 4 === 0 ? "N" : "Y") : (localIndex % 6 === 0 ? "Y" : "N"),
        criticalGap: manager && localIndex % 3 !== 0 ? "高" : "中",
        successionDepth: manager ? (localIndex % 3 === 0 ? 1 : 2) : 0,
        keyTalent: localIndex % 4 === 0 ? "Y" : "N",
        riskTags: manager ? "高潜未转化、管理梯队偏薄" : "高潜转化偏慢"
      };
    }
    if (story === "sales") {
      return {
        performance: ["A", "A", "B+", "A", "B+"][localIndex % 5],
        lastPerformance: ["A", "B+", "A", "B+", "B"][localIndex % 5],
        potential: leader ? "中" : (localIndex % 5 === 0 ? "高" : "中"),
        readiness: leader ? (localIndex % 3 === 0 ? "现在可接任" : "1-2 年可接任") : (localIndex % 4 === 0 ? "1-2 年可接任" : "2-3 年可接任"),
        flightRisk: localIndex % 3 === 0 ? "高" : (localIndex % 2 === 0 ? "中" : "高"),
        mobility: localIndex % 2 === 0 ? "Y" : "N",
        successorNomination: manager ? (localIndex % 5 === 0 ? "N" : "Y") : (localIndex % 7 === 0 ? "Y" : "N"),
        criticalGap: manager ? "中" : "低",
        successionDepth: manager ? 1 : 0,
        keyTalent: localIndex % 3 === 0 ? "Y" : "N",
        riskTags: "头部依赖、保留风险高"
      };
    }
    if (story === "operations") {
      return {
        performance: ["B+", "B", "B", "B+", "B"][localIndex % 5],
        lastPerformance: ["B", "B", "B+", "B", "B"][localIndex % 5],
        potential: manager ? "中" : (localIndex % 5 === 0 ? "中" : "低"),
        readiness: manager ? (localIndex % 4 === 0 ? "1-2 年可接任" : "2-3 年可接任") : "暂未就绪",
        flightRisk: "低",
        mobility: localIndex % 5 === 0 ? "Y" : "N",
        successorNomination: manager ? (localIndex % 4 === 0 ? "Y" : "N") : "N",
        criticalGap: manager ? "中" : "低",
        successionDepth: manager ? 1 : 0,
        keyTalent: localIndex % 8 === 0 ? "Y" : "N",
        riskTags: "成长动能不足、后备偏薄"
      };
    }
    if (story === "product") {
      return {
        performance: ["B+", "A", "B+", "B", "B+"][localIndex % 5],
        lastPerformance: ["B", "B+", "A", "B+", "B"][localIndex % 5],
        potential: leader ? "高" : (localIndex % 3 === 0 ? "高" : "中"),
        readiness: leader ? (localIndex % 4 === 0 ? "现在可接任" : "2-3 年可接任") : (localIndex % 4 === 0 ? "1-2 年可接任" : "暂未就绪"),
        flightRisk: localIndex % 5 === 0 ? "中" : "低",
        mobility: localIndex % 4 === 0 ? "Y" : "N",
        successorNomination: manager ? (localIndex % 3 === 0 ? "N" : "Y") : "N",
        criticalGap: manager ? "高" : "中",
        successionDepth: manager ? 1 : 0,
        keyTalent: localIndex % 4 < 2 ? "Y" : "N",
        riskTags: "关键岗位集中、单点依赖"
      };
    }
    if (story === "cs") {
      return {
        performance: ["B+", "B", "B+", "A", "B"][localIndex % 5],
        lastPerformance: ["B", "B", "B+", "B+", "B"][localIndex % 5],
        potential: leader ? "中" : (localIndex % 6 === 0 ? "高" : localIndex % 2 === 0 ? "中" : "低"),
        readiness: manager ? (localIndex % 4 === 0 ? "1-2 年可接任" : "2-3 年可接任") : (localIndex % 6 === 0 ? "2-3 年可接任" : "暂未就绪"),
        flightRisk: localIndex % 5 === 0 ? "中" : "低",
        mobility: localIndex % 4 === 0 ? "Y" : "N",
        successorNomination: manager ? "Y" : (localIndex % 8 === 0 ? "Y" : "N"),
        criticalGap: manager ? "中" : "低",
        successionDepth: manager ? 1 : 0,
        keyTalent: localIndex % 7 === 0 ? "Y" : "N",
        riskTags: "高潜识别不足、规模大但梯队薄"
      };
    }
    if (story === "support") {
      return {
        performance: ["B+", "B", "B+", "B", "A"][localIndex % 5],
        lastPerformance: ["B", "B", "B+", "B", "B+"][localIndex % 5],
        potential: leader ? "中" : (localIndex % 4 === 0 ? "中" : "低"),
        readiness: leader ? (localIndex % 3 === 0 ? "1-2 年可接任" : "2-3 年可接任") : "暂未就绪",
        flightRisk: localIndex % 6 === 0 ? "中" : "低",
        mobility: localIndex % 5 === 0 ? "Y" : "N",
        successorNomination: manager ? (localIndex % 2 === 0 ? "N" : "Y") : "N",
        criticalGap: manager ? "高" : "中",
        successionDepth: manager ? 1 : 0,
        keyTalent: localIndex % 4 === 0 ? "Y" : "N",
        riskTags: "低可见度风险、支持职能继任暴露"
      };
    }
    return {
      performance: ["B+", "B", "A", "B"][localIndex % 4],
      lastPerformance: ["B", "B+", "B", "A"][localIndex % 4],
      potential: manager ? "中" : (localIndex % 3 === 0 ? "高" : "中"),
      readiness: manager ? "1-2 年可接任" : "2-3 年可接任",
      flightRisk: localIndex % 5 === 0 ? "中" : "低",
      mobility: localIndex % 4 === 0 ? "Y" : "N",
      successorNomination: manager ? "Y" : "N",
      criticalGap: leader ? "中" : "低",
      successionDepth: leader ? 2 : 0,
      keyTalent: localIndex % 5 === 0 ? "Y" : "N",
      riskTags: "常规人才供给"
    };
  }

  function createCleanEmployees() {
    const rows = [];
    let id = 1;
    deptConfigs.forEach((config) => {
      const leaders = [];
      const mids = [];
      for (let i = 0; i < config.size; i += 1) {
        const level = levelAt(i, config.size);
        const profile = storyProfile(config.story, i, level);
        const employeeId = `CY${String(id).padStart(4, "0")}`;
        const title = titleAt(config, level, i);
        const departmentLeader = leaders[0] || "CEO-0001";
        const managerId = i === 0 ? "CEO-0001" : level === "M2" ? departmentLeader : (mids[i % Math.max(1, mids.length)] || departmentLeader);
        const managementSpan = level === "D1" ? 10 + (i % 4) : level === "M2" ? 8 + (i % 3) : level === "M1" ? 5 + (i % 3) : 0;
        const roleChangeCount = level.startsWith("M") || level === "D1" ? 2 + (i % 2) : i % 3;
        const employee = {
          employee_id: employeeId,
          name: nameAt(id),
          gender: id % 2 === 0 ? "女" : "男",
          age: 24 + ((id * 3) % 18) + (level === "D1" ? 10 : level.startsWith("M") ? 6 : 0),
          department: config.department,
          sub_department: config.subDepartments[i % config.subDepartments.length],
          position_title: title,
          job_family: config.family,
          job_level: level,
          manager_id: managerId,
          tenure_years: Number((1.2 + ((id * 5) % 70) / 10).toFixed(1)),
          hire_date: `20${17 + (id % 7)}-${String((id % 12) + 1).padStart(2, "0")}-${String((id % 27) + 1).padStart(2, "0")}`,
          city: config.cities[i % config.cities.length] || cities[id % cities.length],
          performance_current: profile.performance,
          performance_last_year: profile.lastPerformance,
          potential_level: profile.potential,
          training_completion_rate: 58 + ((id * 11) % 40),
          promotion_count: level === "D1" ? 3 : level.startsWith("M") ? 2 : id % 3,
          mobility_flag: profile.mobility,
          critical_role_flag: level === "D1" || level === "M2" || (config.story === "product" && level === "M1" && i < 8) ? "Y" : "N",
          successor_nomination_flag: profile.successorNomination,
          readiness_level: profile.readiness,
          flight_risk: profile.flightRisk,
          manager_recommendation: profile.performance === "A" ? "强烈推荐" : profile.performance === "B+" ? "推荐" : profile.performance === "B" ? "继续观察" : "暂不推荐",
          engagement_score: 64 + ((id * 13) % 28),
          salary_band: ["A1", "A2", "A3", "B1", "B2", "C1", "C2", "D1"][id % 8],
          critical_experience_gap: profile.criticalGap,
          management_span: managementSpan,
          role_change_count: roleChangeCount,
          key_talent_flag: profile.keyTalent,
          succession_depth: profile.successionDepth,
          risk_source_tags: profile.riskTags
        };
        rows.push(employee);
        if (level === "D1" && !leaders.length) leaders.push(employeeId);
        if (level === "M2" || level === "M1") mids.push(employeeId);
        id += 1;
      }
    });
    return rows;
  }

  function departmentAlias(name, index) {
    if (name === "研发中心" && index % 11 === 0) return " Engineering Center ";
    if (name === "销售增长" && index % 13 === 0) return "销售增长部";
    if (name === "交付运营" && index % 17 === 0) return "Operations Hub";
    if (name === "产品与设计" && index % 19 === 0) return "产品设计";
    if (name === "财务法务" && index % 23 === 0) return "Finance Legal";
    if (name === "IT与数据平台" && index % 29 === 0) return "IT/Data";
    if (name === "战略办公室" && index % 31 === 0) return "战略办";
    return name;
  }

  function titleAlias(title, index) {
    if (title === "产品经理" && index % 7 === 0) return "产经";
    if (title === "客户成功顾问" && index % 9 === 0) return "CSM";
    if (title === "客户经理" && index % 8 === 0) return "AE";
    if (title === "IT 运维经理" && index % 6 === 0) return "IT Ops Mgr";
    return title;
  }

  function buildDirtyEmployees(cleanRows) {
    return cleanRows.map((employee, index) => {
      const raw = {
        emp_id: employee.employee_id,
        员工姓名: employee.name,
        sex: employee.gender,
        年龄: employee.age,
        dept: departmentAlias(employee.department, index),
        团队: employee.sub_department,
        岗位简称: titleAlias(employee.position_title, index),
        职能: employee.job_family,
        职级: employee.job_level,
        直属上级: employee.manager_id,
        司龄: employee.tenure_years,
        入职日期: employee.hire_date,
        城市: employee.city,
        当前绩效: employee.performance_current,
        上年绩效: employee.performance_last_year,
        potential: employee.potential_level,
        培训完成率: employee.training_completion_rate,
        晋升次数: employee.promotion_count,
        流动意愿: employee.mobility_flag,
        关键岗位flag: employee.critical_role_flag,
        继任提名: employee.successor_nomination_flag,
        继任准备度: employee.readiness_level,
        离职风险: employee.flight_risk,
        经理推荐: employee.manager_recommendation,
        敬业度: employee.engagement_score,
        薪级: employee.salary_band,
        关键经验缺口: employee.critical_experience_gap,
        管理跨度: employee.management_span,
        岗位变动次数: employee.role_change_count,
        关键人才: employee.key_talent_flag,
        继任覆盖深度: employee.succession_depth,
        风险来源标签: employee.risk_source_tags
      };

      if (index % 14 === 0) raw.入职日期 = employee.hire_date.replace(/-/g, "/");
      if (index % 17 === 0) {
        const parts = employee.hire_date.split("-");
        raw.入职日期 = `${parts[1]}-${parts[2]}-${parts[0]}`;
      }
      if (index === 14) raw.emp_id = cleanRows[10].employee_id;
      if (index === 18) raw.年龄 = 17;
      if (index % 21 === 0 && ["A", "B+"].includes(employee.performance_current)) raw.potential = "";
      if (index === 22) {
        raw.继任准备度 = "现在可接任";
        raw.当前绩效 = "C";
        raw.potential = "低";
      }
      if (index === 25) {
        raw.经理推荐 = "强烈推荐";
        raw.当前绩效 = "C";
      }
      if (index % 28 === 0) raw.直属上级 = "CY9999";
      if (index % 33 === 0 && raw["关键岗位flag"] === "Y") {
        raw.继任提名 = "N";
        raw["继任覆盖深度"] = 0;
      }
      if (index % 37 === 0) raw.dept = ` ${raw.dept} `;
      if (index % 41 === 0) raw.离职风险 = raw.离职风险 === "高" ? "High" : raw.离职风险 === "中" ? "Medium" : "Low";
      if (index % 47 === 0) raw.经理推荐 = "Observe";

      return raw;
    });
  }

  const cleanEmployees = createCleanEmployees();
  const dirtyEmployees = buildDirtyEmployees(cleanEmployees);
  const cleanMetadata = {
    company_name: COMPANY_NAME,
    product_name: PRODUCT_NAME,
    industry: "企业软件 / 数字科技",
    employees_count: cleanEmployees.length,
    demo_type: "官方讲述版",
    departments: deptConfigs.map((item) => item.department),
    org_risks: [
      "研发中心：高潜储备不低，但现在可接任管理梯队偏薄",
      "销售增长：当前业绩强，但头部依赖重、保留风险高",
      "交付运营：运行稳定，但成长动能不足、后备薄",
      "产品与设计：关键岗位集中，单点依赖明显",
      "客户成功：团队规模不小，但高潜识别不足",
      "人力资源 / 财务法务 / IT与数据平台：人数少但继任暴露高"
    ]
  };
  const dirtyMetadata = {
    company_name: COMPANY_NAME,
    product_name: PRODUCT_NAME,
    industry: "企业软件 / 数字科技",
    employees_count: dirtyEmployees.length,
    demo_type: "AI 清洗演示版",
    purpose: "用于展示字段识别、口径归一、自动修复与可信度说明"
  };

  return {
    clean: { employees: cleanEmployees, metadata: cleanMetadata },
    dirty: { employees: dirtyEmployees, metadata: dirtyMetadata },
    employees: cleanEmployees,
    dirtyEmployees,
    metadata: cleanMetadata,
    guide: "# TalentPulse V4 演示指引\n\n1. 官方讲述版用于首页、总览和汇报报告。\n2. AI 清洗演示版用于数据健康、字段识别和自动修复说明。\n3. 建议先讲总览，再下钻人才盘点和继任分析。\n4. 最后用汇报报告收口。",
    insights: "# TalentPulse V4 预期洞察\n\n- 研发中心：高潜储备不低，但近端管理梯队偏薄。\n- 销售增长：业绩亮眼，但依赖少数关键人且保留风险高。\n- 交付运营：稳定运行掩盖了梯队停滞。\n- 产品与设计：关键岗位集中，单点依赖明显。\n- 客户成功：团队规模不小，但高潜识别偏弱。\n- 人力资源、财务法务、IT与数据平台：体量不大，但继任暴露高。"
  };
})();
