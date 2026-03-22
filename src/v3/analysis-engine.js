(function () {
  const SUPPORT_DEPARTMENTS = ["HR", "Finance & Legal", "IT / Data Support"];

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
    const highPotentialNotReadyCount = countBy(rows, (row) => row.shl && row.shl.tier === "A" && row.succession && row.succession.band !== "Ready Now");
    const highPerformerMismatchCount = countBy(rows, (row) => scorePerformance(row.performance_current) >= 4 && row.succession && row.succession.band !== "Ready Now");
    const readyNowCount = countBy(rows, (row) => row.succession && row.succession.band === "Ready Now");
    const readySoonCount = countBy(rows, (row) => row.succession && row.succession.band === "Ready in 1-2 Years");
    const highRiskHighPerfCount = countBy(rows, (row) => scorePerformance(row.performance_current) >= 4 && row.flight_risk === "High");
    const criticalRoles = countBy(rows, (row) => row.critical_role_flag === "Y");
    const uncoveredCriticalRoles = countBy(rows, (row) => row.critical_role_flag === "Y" && row.successor_nomination_flag !== "Y");
    const singlePointRoles = (roles || []).filter((role) => role.candidates.length <= 1 || (role.candidates[0] && (!role.candidates[1] || role.candidates[0].candidateScore - role.candidates[1].candidateScore >= 12)));

    return {
      conversionLagDepartments: metrics.filter((item) => item.hipoRate >= 10 && item.readyNowRate <= 10),
      fragileOutputDepartments: metrics.filter((item) => item.highPerfRate >= 20 && item.highRiskRate >= 15),
      stagnationDepartments: metrics.filter((item) => item.count >= 18 && item.hipoRate <= 7 && item.readySoonRate <= 12 && item.mobilityRate <= 25),
      exposureDepartments: metrics.filter((item) => item.uncoveredRoles >= 2 || item.coverageRate <= 60),
      supportRiskDepartments: metrics.filter((item) => SUPPORT_DEPARTMENTS.includes(item.department) && (item.uncoveredRoles >= 1 || item.readyNow === 0)),
      lowPipelineDepartments: metrics.filter((item) => item.hipoRate <= 7 && item.readySoonRate <= 12),
      singlePointRoles,
      highPotentialNotReadyCount,
      highPerformerMismatchCount,
      highRiskHighPerfCount,
      readyNowCount,
      readySoonCount,
      criticalRoles,
      uncoveredCriticalRoles
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
        title: "Leadership readiness is lagging behind visible talent strength",
        route: "review",
        score: 96,
        phenomenon: `${departments} 的高潜储备并不弱，但 ready-now 管理接班仍然偏薄，当前有 ${signals.highPotentialNotReadyCount} 位高潜 A 尚未转成 ready-now。`,
        rootCause: "高潜识别已经发生，但带人经验、关键岗位锚点和管理历练没有同步推进，潜力没有被及时转成可用梯队。",
        likelyConsequence: "如果不补转化链路，业务增长会继续快于领导梯队成熟速度，关键管理岗位空窗会被放大。",
        recommendedMove: "先把高潜转化最慢的团队拉出名单，优先安排带人任务和关键经验补齐。",
        managementRead: "Potential-rich does not mean bench-ready.",
        actionNow: "核验高潜密度高但 ready-now 偏薄团队的后备名单与带人历练安排。",
        actionSoon: "围绕潜在管理者建立带人任务、关键项目和岗位影子学习。",
        actionLater: "把高潜转化效率纳入季度盘点，持续缩小 ready-now 缺口。"
      }));
    }

    if (signals.fragileOutputDepartments.length || (signals.highRiskHighPerfCount >= 8 && signals.highPerformerMismatchCount >= 10)) {
      const departments = joinNames(signals.fragileOutputDepartments.map((item) => item.department));
      issues.push(makeIssue({
        title: "Performance strength is concentrated in a fragile talent segment",
        route: "succession",
        score: 93,
        phenomenon: `${departments} 的高绩效人群与高离职风险发生重叠，当前有 ${signals.highRiskHighPerfCount} 位高风险高绩效员工。`,
        rootCause: "强结果更多来自少数头部个体，而不是来自有足够深度的岗位替补和稳定梯队。",
        likelyConsequence: "如果头部人才流失或角色变化，产出会快速波动，关键岗位空窗也会被同步暴露。",
        recommendedMove: "先做头部人才保留，再补关键岗位的替补与跨岗备份。",
        managementRead: "Strong output is not the same as organizational resilience.",
        actionNow: "优先对高绩效且高风险的人群做保留对话，并核验其岗位备份。",
        actionSoon: "为高暴露岗位补齐 ready-soon 候选人和跨区替补。",
        actionLater: "降低组织对少数明星个体的结构性依赖。"
      }));
    }

    if (signals.stagnationDepartments.length || signals.lowPipelineDepartments.length >= 2) {
      const departments = joinNames(signals.stagnationDepartments.map((item) => item.department));
      issues.push(makeIssue({
        title: "Stability is masking a weak internal pipeline",
        route: "review",
        score: 88,
        phenomenon: `${departments} 的 headcount 和日常产出相对稳定，但高潜和 ready-soon 储备都偏弱。`,
        rootCause: "低流动和稳定绩效掩盖了成长动能不足，团队更像在维持存量，而不是持续输出下一层骨干。",
        likelyConsequence: "如果继续沿用当前培养方式，团队会越来越稳定，但也会越来越难提供后续梯队。",
        recommendedMove: "把稳定团队中的潜在骨干识别出来，用轮岗与专项项目重新打开成长通道。",
        managementRead: "Stability should not be mistaken for long-term health.",
        actionNow: "先识别低 pipeline 团队里的潜在骨干和跨岗培养对象。",
        actionSoon: "安排轮岗、专项改进项目和跨团队历练。",
        actionLater: "把低 pipeline 团队纳入固定的人才校准节奏。"
      }));
    }

    if (signals.exposureDepartments.length || signals.singlePointRoles.length >= 2) {
      const departments = joinNames(signals.exposureDepartments.map((item) => item.department));
      issues.push(makeIssue({
        title: "Critical-role coverage is thinner than headline performance suggests",
        route: "succession",
        score: 94,
        phenomenon: `${departments} 出现关键岗位无后备或浅覆盖，同时已有 ${signals.singlePointRoles.length} 个岗位表现出单点依赖。`,
        rootCause: "关键岗位识别与后备深度没有同步推进，部分岗位表面被覆盖，实则只有一个可用人选。",
        likelyConsequence: "一旦出现核心岗位流动、晋升或组织调整，替补深度不足会直接影响业务连续性。",
        recommendedMove: "先核验高暴露岗位，再区分无后备与单点依赖两类风险分别补位。",
        managementRead: "Coverage counts can hide shallow bench depth.",
        actionNow: "核验前 10 个高暴露关键岗位的后备名单与真实准备度。",
        actionSoon: "为高暴露岗位建立 ready-soon 候选梯队。",
        actionLater: "形成关键岗位滚动继任校准机制。"
      }));
    }

    if (signals.supportRiskDepartments.length) {
      const departments = joinNames(signals.supportRiskDepartments.map((item) => item.department));
      issues.push(makeIssue({
        title: "Support-function succession risk is easy to overlook",
        route: "succession",
        score: 84,
        phenomenon: `${departments} 体量不大，但关键岗位覆盖薄，ready-now 供给也弱。`,
        rootCause: "支持职能的低可见度让它们更容易被排除在固定节奏的继任盘点之外。",
        likelyConsequence: "一旦支持职能关键岗位空缺，组织恢复速度会明显慢于业务岗位。",
        recommendedMove: "把支持职能纳入和业务团队同样频率的继任校准，补齐 ready-soon 候选池。",
        managementRead: "Low visibility does not mean low risk.",
        actionNow: "优先核验支持职能关键岗位的后备名单。",
        actionSoon: "为支持职能补齐 ready-soon 候选人和跨岗备份。",
        actionLater: "将支持职能纳入固定节奏的继任校准。"
      }));
    }

    if (!issues.length) {
      issues.push(makeIssue({
        title: "Bench maturity needs a closer review",
        route: "succession",
        score: 72,
        phenomenon: "当前没有极端异常，但高潜转化、关键岗位覆盖和候选梯队深度仍值得优先确认。",
        rootCause: "组织当前更多是结构差异而不是单一失衡，问题容易在扩张或流动时集中暴露。",
        likelyConsequence: "如果不持续复核，当前看起来可用的结构会在关键岗位变化时迅速变脆弱。",
        recommendedMove: "先从高暴露岗位和高潜转化慢的团队开始复核。",
        managementRead: "Stable structures still need active bench management.",
        actionNow: "先核验高暴露岗位和高潜转化慢团队的名单。",
        actionSoon: "建立 ready-soon 候选池和定向培养计划。",
        actionLater: "形成周期性的滚动盘点和继任机制。"
      }));
    }

    return issues.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  function buildActionPlan(issues) {
    const collect = (key, fallback) => unique((issues || []).map((item) => item[key]).concat([fallback])).slice(0, 3);
    return {
      immediate: collect("actionNow", "核验高暴露岗位与高风险核心人才的名单与准备度。"),
      mid: collect("actionSoon", "围绕关键团队建立定向培养计划与人才校准节奏。"),
      bench: collect("actionLater", "形成跨部门滚动盘点与继任校准机制。")
    };
  }

  function buildPredictions(issues, signals) {
    const predictions = unique((issues || []).map((item) => item.likelyConsequence));
    if (signals.criticalRoles && signals.uncoveredCriticalRoles / Math.max(1, signals.criticalRoles) >= 0.25) {
      predictions.push("如果关键岗位空窗比例继续维持在当前水平，岗位替补的响应速度会继续落后于业务变化。");
    }
    if (signals.highPotentialNotReadyCount >= 10) {
      predictions.push("如果高潜转化节奏不提升，未来储备会继续停留在潜力层，而不是进入 ready-now 管理梯队。");
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
