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
      const hipoRate = pct(item.hipoA || 0, count);
      const readyNowRate = pct(item.readyNow || 0, count);
      const readySoonRate = pct(item.readySoon || 0, count);
      const highPerfRate = pct(item.highPerf || 0, count);
      const highRiskRate = pct(item.highRisk || 0, count);
      const mobilityRate = pct(item.mobilityYes || 0, count);
      const coverageRate = item.criticalCount ? pct((item.criticalCount - item.uncoveredRoles), item.criticalCount) : 100;
      return {
        department,
        ...item,
        hipoRate,
        readyNowRate,
        readySoonRate,
        highPerfRate,
        highRiskRate,
        mobilityRate,
        coverageRate
      };
    });
  }

  function buildSignals(rows, departmentSummary, roles) {
    const metrics = metricsFromSummary(departmentSummary);
    const criticalRows = (rows || []).filter((row) => row.critical_role_flag === "Y");

    return {
      metrics,
      conversionLagDepartments: metrics.filter((item) => item.hipoRate >= 10 && item.readyNowRate <= 9),
      fragileOutputDepartments: metrics.filter((item) => item.highPerfRate >= 18 && item.highRiskRate >= 15),
      stagnationDepartments: metrics.filter((item) => item.count >= 18 && item.hipoRate <= 7 && item.readySoonRate <= 12 && item.mobilityRate <= 28),
      exposureDepartments: metrics.filter((item) => item.uncoveredRoles >= 2 || item.coverageRate <= 60),
      supportRiskDepartments: metrics.filter((item) => isSupportDepartment(item.department) && (item.uncoveredRoles >= 1 || item.readyNow === 0)),
      shallowPipelineDepartments: metrics.filter((item) => item.hipoRate <= 7 && item.readySoonRate <= 12),
      singlePointRoles: (roles || []).filter((role) => role.candidates.length <= 1 || (role.candidates[0] && (!role.candidates[1] || role.candidates[0].candidateScore - role.candidates[1].candidateScore >= 12))),
      thinDepthRoles: (roles || []).filter((role) => Number(role.incumbent && role.incumbent.succession_depth || 0) <= 1 || role.candidates.length <= 1),
      highPotentialNotReadyCount: countBy(rows, (row) => row.shl && row.shl.tier === "A" && row.succession && row.succession.band !== "Ready Now"),
      highPerformerMismatchCount: countBy(rows, (row) => scorePerformance(row.performance_current) >= 4 && row.succession && row.succession.band !== "Ready Now"),
      highRiskHighPerfCount: countBy(rows, (row) => scorePerformance(row.performance_current) >= 4 && row.flight_risk === "High"),
      criticalRoleCount: criticalRows.length,
      uncoveredCriticalRoleCount: countBy(rows, (row) => row.critical_role_flag === "Y" && row.successor_nomination_flag !== "Y"),
      experienceGapCount: countBy(criticalRows, (row) => /高|缺/.test(String(row.critical_experience_gap || ""))),
      spanPressureCount: countBy(criticalRows, (row) => Number(row.management_span || 0) >= 9),
      lowMobilityRate: pct(countBy(rows, (row) => row.mobility_flag !== "Y"), rows.length || 0)
    };
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

  function buildIssues(signals) {
    const issues = [];

    if (signals.conversionLagDepartments.length || signals.highPotentialNotReadyCount >= 12) {
      const departments = unique(signals.conversionLagDepartments.map((item) => item.department));
      issues.push(makeIssue({
        title: "高潜储备没有顺利转成近端梯队",
        route: "review",
        score: 96,
        departments,
        phenomenon: `${joinNames(departments)}的高潜储备并不低，但现在可接任人数仍然偏薄，当前有 ${signals.highPotentialNotReadyCount} 位高潜人才尚未进入现在可接任梯队。`,
        rootCause: `高潜识别已经发生，但关键经验补齐、带人历练和岗位锚点建设没有同步推进${signals.experienceGapCount ? `，至少 ${signals.experienceGapCount} 位关键岗位人才仍带着经验缺口` : ""}。`,
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

    if (signals.stagnationDepartments.length || signals.shallowPipelineDepartments.length >= 2) {
      const departments = unique(signals.stagnationDepartments.map((item) => item.department));
      issues.push(makeIssue({
        title: "稳定表象掩盖了梯队停滞",
        route: "review",
        score: 89,
        departments,
        phenomenon: `${joinNames(departments)}的人数和日常输出相对稳定，但高潜和 1-2 年可接任储备都偏薄。`,
        rootCause: `低流动与稳定绩效掩盖了成长动能不足，团队更像在维持存量，而不是持续输送下一层骨干${signals.lowMobilityRate >= 70 ? "；整体流动意愿偏低，也压缩了跨岗培养机会" : ""}。`,
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
        title: "关键岗位覆盖存在结构性暴露",
        route: "succession",
        score: 95,
        departments,
        phenomenon: `${joinNames(departments)}出现了无后备、弱覆盖或单点依赖，当前已有 ${signals.singlePointRoles.length} 个岗位呈现明显单点依赖。`,
        rootCause: `关键岗位识别与后备深度建设没有同步推进${signals.thinDepthRoles.length ? `，其中 ${signals.thinDepthRoles.length} 个岗位的覆盖深度不足 2 层` : ""}${signals.spanPressureCount ? "；部分关键岗位管理跨度偏大，也加剧了接班准备难度" : ""}。`,
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
        score: 85,
        departments,
        phenomenon: `${joinNames(departments)}人数不多，但关键岗位覆盖薄、现在可接任供给也弱。`,
        rootCause: "支持职能的低可见度使其更容易被排除在固定节奏的继任校准之外，继任建设明显慢于岗位关键度。",
        likelyConsequence: "一旦支持职能关键岗位空缺，组织恢复速度会明显慢于业务岗位，风险却往往更晚被看到。",
        recommendedMove: "把支持职能纳入与业务团队同样频率的继任校准，补齐近中期候选池。",
        managementRead: "体量小不代表风险小，低可见度岗位反而更需要主动盘点。",
        actionNow: "优先核验支持职能关键岗位的后备名单。",
        actionSoon: "为支持职能补齐近中期候选人与跨岗备份。",
        actionLater: "将支持职能纳入固定节奏的继任盘点。"
      }));
    }

    if (!issues.length) {
      issues.push(makeIssue({
        title: "当前结构可用，但梯队成熟度仍需持续复核",
        route: "succession",
        score: 72,
        departments: [],
        phenomenon: "当前没有极端异常，但高潜转化、关键岗位覆盖和后备深度仍值得持续复核。",
        rootCause: "问题更多来自结构差异，而不是单点失衡，容易在扩张或流动时集中暴露。",
        likelyConsequence: "如果不持续滚动复核，看似可用的结构会在关键岗位变化时迅速变脆。",
        recommendedMove: "先从高暴露岗位和高潜转化慢的团队开始复核。",
        managementRead: "稳定结构也需要主动管理梯队，而不是等问题发生后再补。",
        actionNow: "先核验高暴露岗位和高潜转化慢团队的名单。",
        actionSoon: "建立近中期候选池和定向培养计划。",
        actionLater: "形成周期性的滚动盘点与继任机制。"
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
      predictions.push("如果关键岗位空窗比例继续维持在当前水平，岗位替补响应速度会继续落后于业务变化。");
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
    const signals = buildSignals(input.rows || [], input.departmentSummary || {}, input.roles || []);
    const issues = buildIssues(signals);
    return {
      signals,
      issues,
      actionPlan: buildActionPlan(issues),
      predictions: buildPredictions(issues, signals)
    };
  }

  window.TalentPulseAnalysis = {
    buildDiagnostics
  };
})();
