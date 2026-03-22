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
    const text = String(name || "");
    return /人力|HR|财务|法务|Finance|Legal|IT|数据平台|Data/i.test(text);
  }

  function joinNames(items) {
    const list = unique(items);
    if (!list.length) return "相关团队";
    return list.slice(0, 3).join("、");
  }

  function metricsFromSummary(summary) {
    return Object.keys(summary || {}).map((key) => {
      const item = summary[key];
      const mobilityRate = pct(item.mobilityYes || 0, item.count || 0);
      const highPerfRate = pct(item.highPerf || 0, item.count || 0);
      const hipoRate = pct(item.hipoA || 0, item.count || 0);
      const readyNowRate = pct(item.readyNow || 0, item.count || 0);
      const readySoonRate = pct(item.readySoon || 0, item.count || 0);
      const highRiskRate = pct(item.highRisk || 0, item.count || 0);
      const coverageRate = item.criticalCount ? pct((item.criticalCount - item.uncoveredRoles), item.criticalCount) : 100;
      return {
        department: key,
        ...item,
        mobilityRate,
        highPerfRate,
        hipoRate,
        readyNowRate,
        readySoonRate,
        highRiskRate,
        coverageRate
      };
    });
  }

  function buildSignals(rows, departmentSummary, roles) {
    const metrics = metricsFromSummary(departmentSummary);
    const criticalRows = (rows || []).filter((row) => row.critical_role_flag === "Y");
    const highPotentialNotReadyCount = countBy(rows, (row) => row.shl && row.shl.tier === "A" && row.succession && row.succession.band !== "Ready Now");
    const highPerformerMismatchCount = countBy(rows, (row) => scorePerformance(row.performance_current) >= 4 && row.succession && row.succession.band !== "Ready Now");
    const highRiskHighPerfCount = countBy(rows, (row) => scorePerformance(row.performance_current) >= 4 && row.flight_risk === "High");
    const readyNowCount = countBy(rows, (row) => row.succession && row.succession.band === "Ready Now");
    const readySoonCount = countBy(rows, (row) => row.succession && row.succession.band === "Ready in 1-2 Years");
    const uncoveredCriticalRoles = countBy(rows, (row) => row.critical_role_flag === "Y" && row.successor_nomination_flag !== "Y");
    const singlePointRoles = (roles || []).filter((role) => role.candidates.length <= 1 || (role.candidates[0] && (!role.candidates[1] || role.candidates[0].candidateScore - role.candidates[1].candidateScore >= 12)));
    const thinDepthRoles = (roles || []).filter((role) => (role.incumbent && Number(role.incumbent.succession_depth || 0) <= 1) || role.candidates.length <= 1);
    const experienceGapCount = countBy(criticalRows, (row) => /高|是|缺口/i.test(String(row.critical_experience_gap || "")));
    const spanPressureCount = countBy(criticalRows, (row) => Number(row.management_span || 0) >= 9);
    const lowMobilityRate = pct(countBy(rows, (row) => row.mobility_flag !== "Y"), rows.length || 0);
    const keyTalentCount = countBy(rows, (row) => row.key_talent_flag === "Y");

    return {
      conversionLagDepartments: metrics.filter((item) => item.hipoRate >= 10 && item.readyNowRate <= 10),
      fragileOutputDepartments: metrics.filter((item) => item.highPerfRate >= 20 && item.highRiskRate >= 15),
      stagnationDepartments: metrics.filter((item) => item.count >= 18 && item.hipoRate <= 7 && item.readySoonRate <= 12 && item.mobilityRate <= 25),
      exposureDepartments: metrics.filter((item) => item.uncoveredRoles >= 2 || item.coverageRate <= 60),
      supportRiskDepartments: metrics.filter((item) => isSupportDepartment(item.department) && (item.uncoveredRoles >= 1 || item.readyNow === 0)),
      lowPipelineDepartments: metrics.filter((item) => item.hipoRate <= 7 && item.readySoonRate <= 12),
      singlePointRoles,
      thinDepthRoles,
      highPotentialNotReadyCount,
      highPerformerMismatchCount,
      highRiskHighPerfCount,
      readyNowCount,
      readySoonCount,
      criticalRoles: criticalRows.length,
      uncoveredCriticalRoles,
      experienceGapCount,
      spanPressureCount,
      lowMobilityRate,
      keyTalentCount
    };
  }

  function makeIssue(config) {
    return {
      title: config.title,
      route: config.route,
      score: config.score,
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
      const departments = joinNames(signals.conversionLagDepartments.map((item) => item.department));
      issues.push(makeIssue({
        title: "高潜储备没有顺利转成近端梯队",
        route: "review",
        score: 96,
        phenomenon: `${departments}的高潜储备并不低，但现在可接任的人才仍然偏薄，当前有 ${signals.highPotentialNotReadyCount} 位高潜 A 尚未进入现在可接任梯队。`,
        rootCause: `高潜识别已经发生，但带人历练、关键经验补齐和岗位锚点建设没有同步推进。${signals.experienceGapCount ? `当前还有 ${signals.experienceGapCount} 个关键岗位样本带着关键经验缺口。` : ""}`,
        likelyConsequence: "如果转化链路不补齐，业务扩张速度会继续快于管理梯队成熟速度，关键管理岗位空窗会被放大。",
        recommendedMove: "先把高潜密度高但现在可接任偏薄的团队拉出名单，优先安排带人任务、关键项目和影子学习。",
        managementRead: "问题不在于没有潜力，而在于潜力尚未被转成短期可用的梯队。",
        actionNow: "核验高潜密度高但现在可接任偏薄团队的后备名单与带人历练安排。",
        actionSoon: "围绕潜在管理者建立带人任务、关键项目和岗位影子学习。",
        actionLater: "把高潜转化效率纳入季度盘点，持续缩小近端梯队缺口。"
      }));
    }

    if (signals.fragileOutputDepartments.length || (signals.highRiskHighPerfCount >= 8 && signals.highPerformerMismatchCount >= 10)) {
      const departments = joinNames(signals.fragileOutputDepartments.map((item) => item.department));
      issues.push(makeIssue({
        title: "当前业绩依赖少数关键人，组织韧性偏弱",
        route: "succession",
        score: 94,
        phenomenon: `${departments}的高绩效人群与高离职风险发生重叠，当前有 ${signals.highRiskHighPerfCount} 位高风险高绩效员工。`,
        rootCause: "业务结果集中在头部个体身上，但岗位替补深度、关键人才保留动作和跨岗备份没有同步跟上。",
        likelyConsequence: "一旦头部人才流失或角色变化，短期产出会明显波动，关键岗位空窗也会被同步暴露。",
        recommendedMove: "先做高风险核心人才保留，再补关键岗位的 ready-soon 候选和跨岗备份。",
        managementRead: "强结果不等于强组织，明星员工越亮，梯队越要看深度。",
        actionNow: "优先对高绩效且高风险的人群做保留对话，并核验其岗位备份。",
        actionSoon: "为高暴露岗位补齐 ready-soon 候选人和跨区域替补。",
        actionLater: "持续降低组织对少数头部人才的结构性依赖。"
      }));
    }

    if (signals.stagnationDepartments.length || signals.lowPipelineDepartments.length >= 2) {
      const departments = joinNames(signals.stagnationDepartments.map((item) => item.department));
      issues.push(makeIssue({
        title: "稳定表象掩盖了内部梯队停滞",
        route: "review",
        score: 89,
        phenomenon: `${departments}的人员规模和日常输出相对稳定，但高潜和 1-2 年可接任储备都偏弱。`,
        rootCause: `低流动和稳态绩效掩盖了成长动能不足，团队更像在维持存量，而不是持续输出下一层骨干。${signals.lowMobilityRate >= 70 ? "整体流动意愿偏低，也压缩了跨岗培养和岗位暴露机会。" : ""}`,
        likelyConsequence: "如果继续沿用当前培养方式，团队会继续稳定，但也会越来越难提供后续骨干和接班梯队。",
        recommendedMove: "把稳态团队中的潜在骨干识别出来，用轮岗、专项项目和带教机制重新打开成长通道。",
        managementRead: "低流动和稳定产出不一定代表健康，也可能代表梯队在变薄。",
        actionNow: "先识别低 pipeline 团队中的潜在骨干和跨岗培养对象。",
        actionSoon: "安排轮岗、专项改进项目和跨团队历练。",
        actionLater: "把低 pipeline 团队纳入固定的人才校准节奏。"
      }));
    }

    if (signals.exposureDepartments.length || signals.singlePointRoles.length >= 2 || signals.thinDepthRoles.length >= 3) {
      const departments = joinNames(signals.exposureDepartments.map((item) => item.department));
      issues.push(makeIssue({
        title: "关键岗位覆盖看似存在，但深度仍然偏薄",
        route: "succession",
        score: 95,
        phenomenon: `${departments}出现关键岗位无后备、浅覆盖或单点依赖，当前已有 ${signals.singlePointRoles.length} 个岗位呈现显著单点依赖。`,
        rootCause: `关键岗位识别与后备深度建设没有同步推进。${signals.thinDepthRoles.length ? `其中 ${signals.thinDepthRoles.length} 个岗位的覆盖深度不足 2 层。` : ""}${signals.spanPressureCount ? "部分关键岗位管理跨度偏大，也加剧了接班准备难度。" : ""}`,
        likelyConsequence: "一旦出现关键岗位流动、晋升或组织调整，替补深度不足会直接影响业务连续性和团队稳定性。",
        recommendedMove: "先核验高暴露岗位，再区分无后备、弱覆盖和单点依赖三类风险分别补位。",
        managementRead: "覆盖数量会掩盖覆盖深度，真正的风险常常出在名义上已覆盖的岗位。",
        actionNow: "核验前 10 个高暴露关键岗位的后备名单、覆盖深度和真实准备度。",
        actionSoon: "为高暴露岗位建立 ready-soon 候选梯队。",
        actionLater: "形成关键岗位滚动继任校准机制。"
      }));
    }

    if (signals.supportRiskDepartments.length) {
      const departments = joinNames(signals.supportRiskDepartments.map((item) => item.department));
      issues.push(makeIssue({
        title: "支持职能体量不大，但继任风险容易被低估",
        route: "succession",
        score: 85,
        phenomenon: `${departments}人数不多，但关键岗位覆盖薄、现在可接任供给也弱。`,
        rootCause: "支持职能的低可见度让它们更容易被排除在固定节奏的继任校准之外，继任建设明显慢于岗位关键度。",
        likelyConsequence: "一旦支持职能关键岗位空缺，组织恢复速度会明显慢于业务岗位，风险暴露却往往更晚被看到。",
        recommendedMove: "把支持职能纳入与业务团队同样频率的继任校准，补齐 ready-soon 候选池。",
        managementRead: "体量小不代表风险小，低可见度岗位反而更需要主动盘点。",
        actionNow: "优先核验支持职能关键岗位的后备名单。",
        actionSoon: "为支持职能补齐 ready-soon 候选人和跨岗备份。",
        actionLater: "将支持职能纳入固定节奏的继任盘点。"
      }));
    }

    if (!issues.length) {
      issues.push(makeIssue({
        title: "当前结构可用，但梯队成熟度仍需持续复核",
        route: "succession",
        score: 72,
        phenomenon: "当前没有极端异常，但高潜转化、关键岗位覆盖和候选梯队深度仍值得优先确认。",
        rootCause: "问题更多来自结构差异而不是单点失衡，容易在扩张或流动时集中暴露。",
        likelyConsequence: "如果不持续滚动复核，当前看似可用的结构会在关键岗位变化时迅速变脆弱。",
        recommendedMove: "先从高暴露岗位和高潜转化慢的团队开始复核。",
        managementRead: "稳定结构也需要主动管理梯队，而不是等问题发生后再补。",
        actionNow: "先核验高暴露岗位和高潜转化慢团队的名单。",
        actionSoon: "建立 ready-soon 候选池和定向培养计划。",
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
    if (signals.criticalRoles && signals.uncoveredCriticalRoles / Math.max(1, signals.criticalRoles) >= 0.25) {
      predictions.push("如果关键岗位空窗比例继续维持在当前水平，岗位替补响应速度会继续落后于业务变化。");
    }
    if (signals.highPotentialNotReadyCount >= 10) {
      predictions.push("如果高潜转化节奏不提升，未来储备会继续停留在潜力层，而不是进入短期可用的管理梯队。");
    }
    if (signals.highRiskHighPerfCount >= 8) {
      predictions.push("如果高绩效高风险人群没有被优先稳住，当前业绩波动会先于梯队建设改善出现。");
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
