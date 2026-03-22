(function () {
  function unique(list) {
    return Array.from(new Set((list || []).filter(Boolean)));
  }

  function countBy(rows, predicate) {
    return (rows || []).reduce((total, row) => total + (predicate(row) ? 1 : 0), 0);
  }

  function scorePerformance(value) {
    return { A: 5, "B+": 4, B: 3, C: 2 }[String(value || "").trim()] || 2;
  }

  function pct(part, total) {
    return total ? Math.round((part / total) * 100) : 0;
  }

  function average(list, selector) {
    if (!(list || []).length) return 0;
    const sum = list.reduce((total, item) => total + selector(item), 0);
    return sum / list.length;
  }

  function isSupportDepartment(name) {
    return ["人力资源", "财务法务", "IT与数据平台"].includes(String(name || ""));
  }

  function joinNames(items) {
    const list = unique(items);
    return list.length ? list.join("、") : "相关团队";
  }

  function metricsFromSummary(summary) {
    return Object.keys(summary || {}).map((department) => {
      const item = summary[department] || {};
      const count = item.count || 0;
      return {
        department,
        ...item,
        hipoRate: pct(item.hipoA || 0, count),
        readyNowRate: pct(item.readyNow || 0, count),
        readySoonRate: pct(item.readySoon || 0, count),
        highPerfRate: pct(item.highPerf || 0, count),
        highRiskRate: pct(item.highRisk || 0, count),
        mobilityRate: pct(item.mobilityYes || 0, count),
        coverageRate: item.criticalCount ? pct((item.criticalCount || 0) - (item.uncoveredRoles || 0), item.criticalCount) : 100
      };
    });
  }

  function buildHistoryMetrics(workforceMonthly, recruitingReqs) {
    const monthly = workforceMonthly || [];
    const reqs = recruitingReqs || [];
    const departments = unique(monthly.map((item) => item.department));
    return departments.map((department) => {
      const rows = monthly.filter((item) => item.department === department);
      const rows2024 = rows.filter((item) => String(item.month || "").startsWith("2024"));
      const rows2025 = rows.filter((item) => String(item.month || "").startsWith("2025"));
      const reqRows = reqs.filter((item) => item.department === department);
      const req2024 = reqRows.filter((item) => String(item.open_date || "").startsWith("2024"));
      const req2025 = reqRows.filter((item) => String(item.open_date || "").startsWith("2025"));
      const headcount2024 = rows2024.length ? rows2024[rows2024.length - 1].department_headcount : 0;
      const headcount2025 = rows2025.length ? rows2025[rows2025.length - 1].department_headcount : 0;
      return {
        department,
        headcountGrowth2025: headcount2024 ? pct(headcount2025 - headcount2024, headcount2024) : 0,
        avgRegrettable2024: Number(average(rows2024, (item) => Number(item.regrettable_attrition_rate || 0)).toFixed(1)),
        avgReadyNow2025: Number(average(rows2025, (item) => Number(item.ready_now_coverage || 0)).toFixed(1)),
        avgReadySoon2025: Number(average(rows2025, (item) => Number(item.ready_soon_coverage || 0)).toFixed(1)),
        avgHighPotential2025: Number(average(rows2025, (item) => Number(item.high_potential_rate || 0)).toFixed(1)),
        avgCriticalGap2025: Number(average(rows2025, (item) => Number(item.critical_role_gap_count || 0)).toFixed(1)),
        avgTimeToFill2024: Number(average(req2024, (item) => Number(item.time_to_fill_days || 0)).toFixed(1)),
        avgTimeToFill2025: Number(average(req2025, (item) => Number(item.time_to_fill_days || 0)).toFixed(1)),
        avgRecruitingCost2024: Math.round(average(req2024, (item) => Number(item.total_cost || 0))),
        avgRecruitingCost2025: Math.round(average(req2025, (item) => Number(item.total_cost || 0))),
        internalFillRate2025: Number((average(req2025, (item) => String(item.internal_fill_flag || "") === "Y" ? 100 : 0)).toFixed(1)),
        offerAcceptRate2025: Number((average(req2025, (item) => Number(item.offer_acceptance_rate || 0) * 100)).toFixed(1))
      };
    });
  }

  function makeIssue(config) {
    return {
      title: config.title,
      route: config.route,
      score: config.score,
      departments: config.departments || [],
      phenomenon: config.phenomenon,
      rootCause: config.rootCause,
      likelyConsequence: config.likelyConsequence,
      recommendedMove: config.recommendedMove,
      managementRead: config.managementRead,
      actionNow: config.actionNow,
      actionSoon: config.actionSoon,
      actionLater: config.actionLater
    };
  }

  function buildSignals(rows, departmentSummary, roles, workforceMonthly, recruitingReqs) {
    const metrics = metricsFromSummary(departmentSummary);
    const history = buildHistoryMetrics(workforceMonthly, recruitingReqs);
    const historyMap = Object.fromEntries(history.map((item) => [item.department, item]));
    const criticalRows = (rows || []).filter((row) => row.critical_role_flag === "Y");
    const combined = metrics.map((item) => ({ ...item, history: historyMap[item.department] || {} }));

    return {
      metrics: combined,
      conversionLagDepartments: combined.filter((item) => item.hipoRate >= 10 && item.readyNowRate <= 9),
      fragileOutputDepartments: combined.filter((item) => item.highPerfRate >= 18 && item.highRiskRate >= 15 && Number(item.history.avgRegrettable2024 || 0) >= 2.6),
      stagnationDepartments: combined.filter((item) => Number(item.history.headcountGrowth2025 || 0) <= 6 && item.hipoRate <= 7 && item.readySoonRate <= 12),
      exposureDepartments: combined.filter((item) => item.uncoveredRoles >= 2 || item.coverageRate <= 60 || Number(item.history.avgCriticalGap2025 || 0) >= 3),
      supportRiskDepartments: combined.filter((item) => isSupportDepartment(item.department) && (item.uncoveredRoles >= 1 || item.readyNow === 0 || Number(item.history.internalFillRate2025 || 0) <= 22)),
      hiringStrainDepartments: combined.filter((item) => Number(item.history.avgTimeToFill2024 || 0) >= 64 || Number(item.history.avgRecruitingCost2024 || 0) >= 32000),
      singlePointRoles: (roles || []).filter((role) => role.candidates.length <= 1 || (role.candidates[0] && (!role.candidates[1] || role.candidates[0].candidateScore - role.candidates[1].candidateScore >= 12))),
      thinDepthRoles: (roles || []).filter((role) => Number((role.incumbent && role.incumbent.succession_depth) || 0) <= 1 || role.candidates.length <= 1),
      highPotentialNotReadyCount: countBy(rows, (row) => row.shl && row.shl.tier === "A" && row.succession && row.succession.band !== "Ready Now"),
      highPerformerMismatchCount: countBy(rows, (row) => scorePerformance(row.performance_current) >= 4 && row.succession && row.succession.band !== "Ready Now"),
      highRiskHighPerfCount: countBy(rows, (row) => scorePerformance(row.performance_current) >= 4 && row.flight_risk === "High"),
      criticalRoleCount: criticalRows.length,
      uncoveredCriticalRoleCount: countBy(rows, (row) => row.critical_role_flag === "Y" && row.successor_nomination_flag !== "Y"),
      experienceGapCount: countBy(criticalRows, (row) => String(row.critical_experience_gap || "") === "High"),
      spanPressureCount: countBy(criticalRows, (row) => Number(row.management_span || 0) >= 9)
    };
  }

  function buildIssues(signals) {
    const issues = [];

    if (signals.conversionLagDepartments.length || signals.highPotentialNotReadyCount >= 12) {
      const departments = unique(signals.conversionLagDepartments.map((item) => item.department));
      issues.push(makeIssue({
        title: "高潜储备没有顺利转成近端管理梯队",
        route: "review",
        score: 96,
        departments,
        phenomenon: `${joinNames(departments)}的高潜储备并不低，但现在可接任人数仍然偏薄，当前有 ${signals.highPotentialNotReadyCount} 位高潜人才尚未进入近端梯队。`,
        rootCause: `高潜识别已经发生，但关键经验补齐、带人历练和岗位锚点建设没有同步推进${signals.experienceGapCount ? `；至少 ${signals.experienceGapCount} 位关键岗位人才仍带着高经验缺口` : ""}。`,
        likelyConsequence: "如果转化链路不补齐，业务扩张会继续快于管理梯队成熟，近端接班空窗会进一步放大。",
        recommendedMove: "先把高潜密度高但近端接班偏薄的团队拉出名单，优先安排带人任务、关键项目和岗位影子学习。",
        managementRead: "问题不在于没有潜力，而在于潜力还没有被转成短期可用的梯队。",
        actionNow: "核验高潜密度高但现在可接任偏薄团队的后备名单与带人历练安排。",
        actionSoon: "围绕潜在管理者安排关键项目、跨团队协同和岗位影子学习。",
        actionLater: "把高潜向近端梯队的转化效率纳入季度盘点。"
      }));
    }

    if (signals.fragileOutputDepartments.length || (signals.highRiskHighPerfCount >= 8 && signals.highPerformerMismatchCount >= 10)) {
      const departments = unique(signals.fragileOutputDepartments.map((item) => item.department));
      issues.push(makeIssue({
        title: "当前业绩依赖少数关键人，组织韧性偏弱",
        route: "succession",
        score: 94,
        departments,
        phenomenon: `${joinNames(departments)}的高绩效与高流失风险发生重叠，当前有 ${signals.highRiskHighPerfCount} 位高绩效高风险员工。`,
        rootCause: "业绩结果集中在头部个体身上，但保留动作、岗位替补深度和跨岗备份没有同步跟上。",
        likelyConsequence: "一旦头部人才流动或角色变化，短期产出会明显波动，关键岗位空窗也会同时暴露。",
        recommendedMove: "先稳住高绩效高风险人群，再补关键岗位的近中期候选与跨岗备份。",
        managementRead: "强结果不等于强组织，明星员工越亮，越要看梯队深度。",
        actionNow: "优先对高绩效且高风险的人群做保留对话，并核验岗位备份。",
        actionSoon: "为高暴露岗位补齐近中期候选人与跨团队替补。",
        actionLater: "持续降低组织对少数头部人才的结构性依赖。"
      }));
    }

    if (signals.stagnationDepartments.length) {
      const departments = unique(signals.stagnationDepartments.map((item) => item.department));
      issues.push(makeIssue({
        title: "稳定表象掩盖了梯队停滞",
        route: "operations",
        score: 89,
        departments,
        phenomenon: `${joinNames(departments)}的人数与日常输出相对稳定，但高潜和 1-2 年可接任储备都偏薄。`,
        rootCause: "低增速与稳定绩效掩盖了成长动能不足，团队更像在维持存量，而不是持续输送下一层骨干。",
        likelyConsequence: "如果继续沿用当前培养方式，团队会继续稳定，但会越来越难提供后续骨干和接班梯队。",
        recommendedMove: "先识别稳定团队里的潜在骨干，再用轮岗、专项项目和带教机制重新打开成长通道。",
        managementRead: "低流动和稳定产出不一定代表健康，也可能代表梯队正在变薄。",
        actionNow: "识别低 pipeline 团队里的潜在骨干与跨岗培养对象。",
        actionSoon: "安排轮岗、专项改进项目和带教机制。",
        actionLater: "把低 pipeline 团队纳入固定的人才校准节奏。"
      }));
    }

    if (signals.exposureDepartments.length || signals.singlePointRoles.length >= 2 || signals.thinDepthRoles.length >= 3) {
      const departments = unique(signals.exposureDepartments.map((item) => item.department));
      issues.push(makeIssue({
        title: "关键岗位暴露具有结构性，而不是单点例外",
        route: "succession",
        score: 95,
        departments,
        phenomenon: `${joinNames(departments)}出现了无后备、弱覆盖或单点依赖，当前已有 ${signals.singlePointRoles.length} 个岗位呈现明显单点依赖。`,
        rootCause: `关键岗位识别与后备深度建设没有同步推进${signals.thinDepthRoles.length ? `；其中 ${signals.thinDepthRoles.length} 个岗位的覆盖深度不足 2 层` : ""}${signals.spanPressureCount ? "；部分关键岗位管理跨度偏大，也加剧了接班准备难度" : ""}。`,
        likelyConsequence: "一旦出现关键岗位流动、晋升或组织调整，替补深度不足会直接影响业务连续性和团队稳定性。",
        recommendedMove: "先核验高暴露岗位，再区分无后备、弱覆盖和单点依赖三类风险分别补位。",
        managementRead: "覆盖数量会掩盖覆盖深度，真正的风险往往出在名义上已覆盖的岗位。",
        actionNow: "核验前 10 个高暴露关键岗位的后备名单、覆盖深度和真实准备度。",
        actionSoon: "为高暴露岗位建立近中期候选梯队。",
        actionLater: "形成关键岗位滚动继任校准机制。"
      }));
    }

    if (signals.supportRiskDepartments.length) {
      const departments = unique(signals.supportRiskDepartments.map((item) => item.department));
      issues.push(makeIssue({
        title: "支持职能体量不大，但继任风险容易被低估",
        route: "succession",
        score: 86,
        departments,
        phenomenon: `${joinNames(departments)}人数不多，但关键岗位覆盖偏薄、现在可接任供给也弱。`,
        rootCause: "支持职能的低可见度使其更容易被排除在固定节奏的继任校准之外，继任建设明显慢于岗位关键度。",
        likelyConsequence: "一旦支持职能关键岗位空缺，组织恢复速度会明显慢于业务岗位，风险却往往更晚被看到。",
        recommendedMove: "把支持职能纳入与业务团队同样频率的继任校准，补齐近中期候选池。",
        managementRead: "体量小不代表风险小，低可见度岗位反而更需要主动盘点。",
        actionNow: "优先核验支持职能关键岗位的后备名单。",
        actionSoon: "为支持职能补齐近中期候选人与跨岗备份。",
        actionLater: "将支持职能纳入固定节奏的继任盘点。"
      }));
    }

    if (signals.hiringStrainDepartments.length) {
      const departments = unique(signals.hiringStrainDepartments.map((item) => item.department));
      issues.push(makeIssue({
        title: "招聘效率改善了，但内部补位能力仍未跟上",
        route: "operations",
        score: 83,
        departments,
        phenomenon: `${joinNames(departments)}在过去三年的招聘周期和招聘成本经历波动，虽然 2025 年回落，但内部补位率仍然偏低。`,
        rootCause: "过去扩张和销售冲刺期更依赖外部补员，内部人才流动与继任供给没有同步建立稳定节奏。",
        likelyConsequence: "如果仍主要依赖外部招聘，关键岗位补位速度会继续受市场供给与成本波动影响。",
        recommendedMove: "把招聘效率和内部补位率放进同一张经营看板里，优先提升关键岗位内部供给。",
        managementRead: "招聘周期回落并不等于供给健康，真正要看内部补位是否建立起来。",
        actionNow: "把关键岗位的内部补位率和外部招聘依赖一起复核。",
        actionSoon: "对高暴露团队建立内部流动和候选池清单。",
        actionLater: "形成招聘、盘点和继任联动的供给机制。"
      }));
    }

    return issues.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  function buildActionPlan(issues) {
    const collect = (key, fallback) => unique((issues || []).map((item) => item[key]).concat([fallback])).slice(0, 3);
    return {
      immediate: collect("actionNow", "核验高暴露岗位与高风险核心人才的名单和真实准备度。"),
      mid: collect("actionSoon", "围绕关键团队建立定向培养计划与人才校准节奏。"),
      bench: collect("actionLater", "形成跨部门滚动盘点与继任校准机制。")
    };
  }

  function buildPredictions(issues, signals) {
    const predictions = unique((issues || []).map((item) => item.likelyConsequence));
    if (signals.criticalRoleCount && signals.uncoveredCriticalRoleCount / Math.max(1, signals.criticalRoleCount) >= 0.25) {
      predictions.push("如果关键岗位空窗比例继续维持在当前水平，岗位补位响应速度会继续落后于业务变化。");
    }
    if (signals.highPotentialNotReadyCount >= 10) {
      predictions.push("如果高潜转化节奏不提升，未来储备会继续停留在潜力层，而不是进入短期可用梯队。");
    }
    if (signals.highRiskHighPerfCount >= 8) {
      predictions.push("如果高绩效高风险人群没有被优先稳住，当前业绩波动会先于梯队改善出现。");
    }
    return predictions.slice(0, 4);
  }

  function buildDiagnostics(input) {
    const signals = buildSignals(input.rows || [], input.departmentSummary || {}, input.roles || [], input.workforceMonthly || [], input.recruitingReqs || []);
    const issues = buildIssues(signals);
    return {
      signals,
      issues,
      actionPlan: buildActionPlan(issues),
      predictions: buildPredictions(issues, signals)
    };
  }

  window.TalentPulseAnalysisV7 = { buildDiagnostics };
})();
