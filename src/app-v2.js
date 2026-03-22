(function () {
  var app = document.getElementById("app");
  var demo = window.TALENTPULSE_DEMO || { employees: [], metadata: {} };

  var ROUTES = [
    { key: "home", label: "棣栭〉" },
    { key: "overview", label: "鎬昏" },
    { key: "review", label: "浜烘墠鐩樼偣" },
    { key: "succession", label: "缁т换鍒嗘瀽" },
    { key: "health", label: "鏁版嵁鍋ュ悍" },
    { key: "report", label: "姹囨姤鎶ュ憡" }
  ];

  var FIELD_ALIASES = {
    employee_id: ["employeeid", "employee_id", "empid", "emp_id", "id", "gonghao", "yuangongbianhao"],
    name: ["name", "employee", "fullname", "xingming", "yuangongxingming"],
    gender: ["gender", "sex", "xingbie"],
    age: ["age", "nianling"],
    department: ["department", "dept", "bumen"],
    sub_department: ["subdepartment", "sub_dept", "team", "teamname", "zibumen", "xiaozu", "tuandui"],
    position_title: ["position", "positiontitle", "title", "jobtitle", "gangwei", "zhiwei", "gangweimingcheng"],
    job_family: ["jobfamily", "function", "jobfunction", "gangweizu", "zhineng"],
    job_level: ["joblevel", "level", "grade", "zhiji"],
    manager_id: ["managerid", "manager", "leaderid", "shangji", "zhishushangji"],
    tenure_years: ["tenure", "tenureyears", "yearsincompany", "siling", "zaizhinianshu"],
    hire_date: ["hiredate", "startdate", "entrydate", "ruzhiriqi"],
    city: ["city", "location", "chengshi"],
    performance_current: ["performancecurrent", "performance", "currentperformance", "dangqianjixiao", "bennianjixiao"],
    performance_last_year: ["performancelastyear", "lastyearperformance", "qunianjixiao", "shangnianjixiao"],
    potential_level: ["potential", "potentiallevel", "qianli", "qianlidengji"],
    training_completion_rate: ["trainingcompletionrate", "trainingcompletion", "trainingrate", "peixunwanchenglve"],
    promotion_count: ["promotioncount", "promotions", "jinshengcishu"],
    mobility_flag: ["mobilityflag", "mobility", "liudongyiyuan"],
    critical_role_flag: ["criticalroleflag", "criticalrole", "guanjiangangwei"],
    successor_nomination_flag: ["successornominationflag", "successornomination", "jirentiming"],
    readiness_level: ["readinesslevel", "readiness", "successionreadiness", "zhunbeidu"],
    flight_risk: ["flightrisk", "attritionrisk", "lizhifengxian"],
    manager_recommendation: ["managerrecommendation", "recommendation", "managerrating", "jinglituijian"],
    engagement_score: ["engagementscore", "engagement", "engagementindex", "jingyedu"],
    salary_band: ["salaryband", "band", "payband", "xinjibie"]
  };

  var DEPT_ALIAS = {
    "Engineering Center": "Engineering",
    "  Engineering  ": "Engineering",
    "Sales Team": "Sales",
    "Finance Legal": "Finance & Legal",
    "Operations Hub": "Operations"
  };

  var EXTRA_FIELD_ALIASES = {
    employee_id: ["gonghao", "yuangongbianhao"],
    name: ["xingming", "yuangongxingming"],
    gender: ["xingbie"],
    age: ["nianling"],
    department: ["bumen"],
    sub_department: ["zibumen", "xiaozu", "tuandui"],
    position_title: ["gangwei", "zhiwei", "gangweimingcheng"],
    job_family: ["gangweizu", "zhineng"],
    job_level: ["zhiji"],
    manager_id: ["zhishushangji", "shangjigonghao"],
    tenure_years: ["siling", "zaizhinianxian"],
    hire_date: ["ruzhiriqi"],
    city: ["chengshi"],
    performance_current: ["dangqianjixiao", "bennianjixiao"],
    performance_last_year: ["qunianjixiao", "shangnianjixiao"],
    potential_level: ["qianli", "qianlidengji"],
    training_completion_rate: ["peixunwanchenglve"],
    promotion_count: ["jinshengcishu"],
    mobility_flag: ["liudongyiyuan"],
    critical_role_flag: ["guanjiangangwei"],
    successor_nomination_flag: ["jirentiming"],
    readiness_level: ["zhunbeidu", "jirenzhunbeidu"],
    flight_risk: ["lizhifengxian"],
    manager_recommendation: ["jinglituijian", "jinglitijian"],
    engagement_score: ["jingyedu", "tourudu"],
    salary_band: ["xinchoudaikuan", "xinjibie"]
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
    selectedJobLevel: "All",
    selectedNineBoxKey: "3-3",
    activeHealthTab: "risk",
    selectedHealthIndex: 0,
    cleaningView: "after",
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
    if (key === "profile") return "鍛樺伐鐢诲儚";
    for (var i = 0; i < ROUTES.length; i += 1) {
      if (ROUTES[i].key === key) return ROUTES[i].label;
    }
    return "棣栭〉";
  }

  function readinessText(value) {
    return {
      "Ready Now": "鐜板湪鍙帴浠?,
      "Ready in 1-2 Years": "1-2 骞村彲鎺ヤ换",
      "Ready in 2-3 Years": "2-3 骞村彲鎺ヤ换",
      "Not Ready Yet": "鏆傛湭灏辩华"
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
    if (item.flight_risk === "High") tags.push("楂樼鑱岄闄?);
    if (item.critical_role_flag === "Y" && item.successor_nomination_flag === "N") tags.push("鍏抽敭宀椾綅鏆傛棤鍚庡");
    if (!item.potential_level) tags.push("娼滃姏鍙ｅ緞寰呮牎鍑?);
    if (shlTier === "A" && successionBand !== "Ready Now") tags.push("楂樻綔鏈浆鍖栦负鎺ヤ换鍑嗗搴?);
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
      if (dept !== dept.trim()) quality.autoFixed.push(issue("宸茶嚜鍔ㄦ竻鐞嗗浣欑┖鏍?, line, employeeId, "department", "绯荤粺宸茬粺涓€閮ㄩ棬鏂囨湰涓殑棣栧熬绌烘牸銆?));
      if (/[./]/.test(date)) quality.autoFixed.push(issue("宸茶嚜鍔ㄧ粺涓€鏃ユ湡鏍煎紡", line, employeeId, "hire_date", "娣峰悎鏃ユ湡鏍煎紡宸茶瑙勮寖涓?YYYY-MM-DD銆?));
      if (dept === "Engineering Center" || dept === "Sales Team" || dept === "Finance Legal" || dept === "Operations Hub") quality.caution.push(issue("閮ㄩ棬鍒悕宸插綊涓€鍖?, line, employeeId, "department", "婧愭暟鎹腑鐨勯儴闂ㄥ埆鍚嶅凡鏄犲皠鍒扮粺涓€缁勭粐鍙ｅ緞銆?));
      if (title === "PM" || title === "Cust Success Specialist") quality.caution.push(issue("宀椾綅鍒悕宸插綊涓€鍖?, line, employeeId, "position_title", "绯荤粺宸插皢宀椾綅鍒悕鏄犲皠鍒版爣鍑嗗矖浣嶅簱銆?));
      if (!(row.potential_level || row.Potential || row["Potential Level"])) quality.caution.push(issue("娼滃姏瀛楁瀛樺湪缂哄け", line, employeeId, "potential_level", "娼滃姏淇℃伅缂哄け浼氶檷浣庨珮娼滆瘑鍒簿搴︺€?));
      if (Number(row.age || row.Age || 0) < 20 || Number(row.age || row.Age || 0) > 60) quality.caution.push(issue("鍙戠幇骞撮緞寮傚父鍊?, line, employeeId, "age", "瀛樺湪瓒呭嚭甯歌鍛樺伐骞撮緞鍖洪棿鐨勮褰曪紝寤鸿澶嶆牳銆?));
    });
    cleanedRows.forEach(function (row) {
      if (row.manager_id && row.manager_id !== "CEO-0001" && !managerSet[row.manager_id]) quality.risk.push(issue("涓婄骇寮曠敤鏃犳硶鍖归厤", "-", row.employee_id, "manager_id", "褰撳墠鍛樺伐鐨?manager_id 鏃犳硶鍦ㄥ憳宸ユ竻鍗曚腑瑙ｆ瀽銆?));
      if (row.readiness_level === "Ready Now" && (row.performance_current === "C" || row.potential_level === "Low")) quality.risk.push(issue("鍑嗗搴︿笌浜烘墠淇″彿鍐茬獊", "-", row.employee_id, "readiness_level", "鐜版湁鍑嗗搴︾粨璁轰笌缁╂晥鎴栨綔鍔涗俊鍙蜂笉涓€鑷淬€?));
      if (row.manager_recommendation === "Strongly Recommend" && row.performance_current === "C") quality.risk.push(issue("绠＄悊鑰呮帹鑽愪笌缁╂晥鍐茬獊", "-", row.employee_id, "manager_recommendation", "鎺ㄨ崘寮哄害鏄捐憲楂樹簬缁╂晥璇佹嵁锛屽彲鑳藉奖鍝嶅垽鏂€?));
      if (row.critical_role_flag === "Y" && row.successor_nomination_flag === "N") quality.risk.push(issue("鍏抽敭宀椾綅鏆傛棤鍚庡鎻愬悕", "-", row.employee_id, "successor_nomination_flag", "璇ュ叧閿矖浣嶇洰鍓嶆病鏈夋槑纭殑鍚庡浜洪€夈€?));
    });
    Object.keys(idCount).forEach(function (id) {
      if (id && idCount[id] > 1) {
        quality.autoFixed.push(issue("宸茶嚜鍔ㄥ幓閲嶉噸澶嶅憳宸ヨ褰?, "-", id, "employee_id", "鍒嗘瀽瑙嗗浘宸插閲嶅宸ュ彿杩涜鍘婚噸銆?));
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
    return { score: score, label: score >= 82 ? "楂? : score >= 68 ? "涓? : "浣? };
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

  function ratio(value, total) {
    return total ? value / total : 0;
  }

  function percent(value, total) {
    return Math.round(ratio(value, total) * 100);
  }

  function uniqueText(items) {
    var seen = {};
    return (items || []).filter(function (item) {
      if (!item || seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }

  function makeIssue(title, detail, score, route, predict, actionNow, actionSoon, actionLater) {
    return {
      title: title,
      detail: detail,
      score: score,
      route: route,
      predict: predict,
      actionNow: actionNow,
      actionSoon: actionSoon,
      actionLater: actionLater
    };
  }

  function buildIssueCandidates(rows, summary) {
    var issues = [];
    Object.keys(summary || {}).forEach(function (department) {
      var item = summary[department];
      var hipoRate = percent(item.hipoA, item.count);
      var readyNowRate = percent(item.readyNow, item.count);
      var highRiskRate = percent(item.highRisk, item.count);
      var readySoonRate = percent(item.readySoon, item.count);

      if (hipoRate >= 14 && readyNowRate <= 8) {
        issues.push(makeIssue(
          department + " 楂樻綔鍌ㄥ涓嶉敊锛屼絾 ready now 鍋忚杽",
          "楂樻綔鍗犳瘮绾?" + hipoRate + "%锛屼絾鐜板湪鍙帴浠讳粎 " + readyNowRate + "%锛屾洿鍍忔槸鈥滀汉鎵嶆湁浜嗐€佹闃熻繕娌¤窡涓娾€濄€?,
          88 + (hipoRate - readyNowRate),
          "review",
          "濡傛灉涓嶆帹鍔ㄧ鐞嗚€呭煿鍏伙紝" + department + " 鐨勯珮娼滆浆鍖栦細缁х画鎱簬涓氬姟澧為暱銆?,
          "浼樺厛涓?" + department + " 鏍搁獙娼滃湪绠＄悊鑰呭悕鍗曪紝骞跺畨鎺掑甫浜轰换鍔℃垨鍏抽敭椤圭洰銆?,
          "鎶?" + department + " 鐨勯珮娼滀汉缇ょ撼鍏ュ畾鍚戝煿鍏昏鍒掋€?,
          "寤虹珛 " + department + " 鐨勬粴鍔ㄦ闃熸牎鍑嗘満鍒躲€?
        ));
      }

      if (highRiskRate >= 18 && item.count >= 18) {
        issues.push(makeIssue(
          department + " 缁撴灉涓嶉敊锛屼絾淇濈暀椋庨櫓鍋忛珮",
          "楂樼鑱岄闄╃害 " + highRiskRate + "%锛岃鏄庡綋鍓嶇粨鏋滆緝瀹规槗渚濊禆灏戞暟鏍稿績璐＄尞鑰呫€?,
          84 + highRiskRate,
          "succession",
          "濡傛灉鏍稿績浜烘墠娴佸け锛? + department + " 鐨勫矖浣嶇┖缂烘毚闇蹭細杩呴€熸斁澶с€?,
          "浼樺厛瀵?" + department + " 鐨勯珮缁╂晥楂橀闄╀汉缇ゅ仛淇濈暀璁胯皥銆?,
          "琛ラ綈 " + department + " 鐨勬浛琛ヤ笌璺ㄥ矖鍩瑰吇銆?,
          "闄嶄綆 " + department + " 瀵瑰皯鏁版槑鏄熷憳宸ョ殑缁撴瀯鎬т緷璧栥€?
        ));
      }

      if (item.uncoveredRoles >= 2 || (item.uncoveredRoles >= 1 && item.count <= 16)) {
        issues.push(makeIssue(
          department + " 鍏抽敭宀椾綅瑕嗙洊鍋忕獎",
          "褰撳墠鑷冲皯鏈?" + item.uncoveredRoles + " 涓叧閿矖浣嶇己灏戞槑纭悗澶囷紝缁т换鏆撮湶涓嶅簲琚拷鐣ャ€?,
          82 + item.uncoveredRoles * 6,
          "succession",
          "鍏抽敭宀椾綅涓€鏃︾┖缂猴紝" + department + " 鐨勭粍缁囨仮澶嶆垚鏈細鏄庢樉涓婂崌銆?,
          "鍏堟牳楠?" + department + " 鐨勫叧閿矖浣嶅悗澶囧悕鍗曘€?,
          "涓烘毚闇插矖浣嶅缓绔?ready soon 鍊欓€夋睜銆?,
          "褰㈡垚 " + department + " 鐨勬粴鍔ㄧ户浠荤洏鐐规満鍒躲€?
        ));
      }

      if (item.count >= 22 && hipoRate <= 6) {
        issues.push(makeIssue(
          department + " 瑙勬ā涓嶅皬锛屼絾楂樻綔璇嗗埆鍋忓急",
          "鍥㈤槦浜烘暟 " + item.count + " 浜猴紝浣嗛珮娼滃崰姣斾粎绾?" + hipoRate + "%锛屽彲鑳藉瓨鍦ㄨ瘑鍒彛寰勫亸淇濆畧鎴栧煿鍏绘姇鍏ヤ笉瓒炽€?,
          74 + (22 - Math.min(22, hipoRate)),
          "review",
          "濡傛灉缁х画浣庤瘑鍒紝" + department + " 鐨勬湭鏉ヤ汉鎵嶄緵缁欎細閫愭涓嶈冻銆?,
          "澶嶆牳 " + department + " 鐨勬綔鍔涜瘑鍒彛寰勪笌鎻愬悕鍚嶅崟銆?,
          "澧炲姞璺ㄥ矖椤圭洰鍜屼汉鎵嶆牎鍑嗕細璁€?,
          "寤虹珛 " + department + " 鐨勯珮娼滆瘑鍒笌鍩瑰吇鑺傚銆?
        ));
      }

      if (item.count >= 20 && hipoRate <= 8 && readySoonRate <= 10) {
        issues.push(makeIssue(
          department + " 缁撴瀯绋冲畾锛屼絾鎴愰暱鍔ㄨ兘鍋忓急",
          "楂樻綔鍗犳瘮绾?" + hipoRate + "%锛?-2 骞村彲鎺ヤ换鍗犳瘮绾?" + readySoonRate + "%锛岃鏄庡洟闃熺ǔ瀹氫絾鍚庣画澧為暱鍔ㄨ兘涓嶈冻銆?,
          70 + (10 - Math.min(10, readySoonRate)),
          "review",
          "濡傛灉缁х画娌跨敤褰撳墠鍩瑰吇鏂瑰紡锛? + department + " 鐨勬闃熸垚鐔熷害浼氭寔缁亸鎱€?,
          "涓?" + department + " 寤虹珛璺ㄥ矖杞矖鎴栭」鐩巻缁冦€?,
          "鐢ㄤ汉鎵嶆牎鍑嗕細璁瘑鍒綔鍦ㄩ珮娼滀笌楠ㄥ共銆?,
          "鎶婄ǔ瀹氬洟闃熻浆鍖栦负鍙寔缁緵缁欑殑浜烘墠姹犮€?
        ));
      }
    });

    issues.sort(function (a, b) { return b.score - a.score; });
    return issues.slice(0, 5);
  }

  function buildUsageGuide(summary) {
    var guide = [];
    if (state.uploadMode === "upload" && state.quality && (state.quality.confidence.score < 78 || state.quality.risk.length >= 8)) {
      guide.push({ route: "health", label: "鍏堢湅鏁版嵁鍋ュ悍", reason: "杩欐涓婁紶鐨勬暟鎹粛鏈夎緝澶氶闄╅」锛屽缓璁厛纭鍙俊搴﹀啀璁插垎鏋愮粨璁恒€? });
    } else {
      guide.push({ route: "overview", label: "鍏堣鎬昏", reason: "鍏堢敤 2 鍒嗛挓璁叉竻缁勭粐褰撳墠鐘舵€併€侀闄╃瓑绾у拰浼樺厛鍔ㄤ綔銆? });
    }

    (summary.focusModules || []).forEach(function (route) {
      if (route === "overview" || route === "health") return;
      guide.push({
        route: route,
        label: route === "review" ? "鍐嶇湅浜烘墠鐩樼偣" : route === "succession" ? "鍐嶇湅缁т换鍒嗘瀽" : "鏈€鍚庢敹鍙ｅ埌鎶ュ憡",
        reason: route === "review" ? "鐢ㄤ節瀹牸鍜屼唬琛ㄤ汉鎵嶈鏄庣粨鏋勫樊寮備笌楂樻綔杞寲銆? : route === "succession" ? "鐢ㄥ矖浣嶆毚闇插拰鍊欓€夋闃熻鏄庤皝鑳芥帴涓娿€佽皝鎺ヤ笉涓娿€? : "鎶婃礊瀵熸暣鐞嗘垚鍙眹鎶ョ殑缁撹銆?
      });
    });

    guide.push({ route: "report", label: "鏈€鍚庢敹鍙ｅ埌鎶ュ憡", reason: "鎶婄幇鐘躲€佸師鍥犮€侀闄╁拰寤鸿鏁寸悊鎴愪竴椤靛彲姹囨姤杈撳嚭銆? });
    return uniqueText(guide.map(function (item) { return item.route; })).map(function (route) {
      for (var i = 0; i < guide.length; i += 1) {
        if (guide[i].route === route) return guide[i];
      }
      return null;
    }).filter(function (item) { return item; });
  }

  function renderGuideCards(items) {
    return '<section class="grid-kpi drill-grid">' + (items || []).map(function (item) {
      return '<a class="card quick-link quick-link-detail" href="#' + safe(item.route) + '"><strong>' + safe(item.label) + '</strong><small>' + safe(item.reason) + '</small></a>';
    }).join("") + '</section>';
  }

  function executiveSummary(rows) {
    var summary = summarizeDepartments(rows);
    var issues = buildIssueCandidates(rows, summary);
    var criticalRoles = countBy(rows, function (row) { return row.critical_role_flag === "Y"; });
    var coveredCriticalRoles = countBy(rows, function (row) { return row.critical_role_flag === "Y" && row.successor_nomination_flag === "Y"; });
    var uncovered = countBy(rows, function (row) { return row.critical_role_flag === "Y" && row.successor_nomination_flag === "N"; });
    var readyNow = countBy(rows, function (row) { return row.succession.band === "Ready Now"; });
    var hipoA = countBy(rows, function (row) { return row.shl.tier === "A"; });
    var highRiskHighPerf = countBy(rows, function (row) { return row.flight_risk === "High" && scorePerformance(row.performance_current) >= 4; });
    var coverage = percent(coveredCriticalRoles, criticalRoles);
    var conversionGap = Math.max(0, hipoA - readyNow);
    var riskLevel = uncovered >= 14 || coverage < 55 ? "楂? : uncovered >= 7 || coverage < 70 ? "涓珮" : "涓?;
    var headline = coverage < 60
      ? "缁勭粐瀛樺湪鏄庢樉缁т换鏆撮湶锛岄珮娼滃偍澶囧皻鏈厖鍒嗚浆鍖栦负鍏抽敭宀椾綅鍚庡銆?
      : conversionGap >= 12
        ? "缁勭粐鍏峰鏈潵浜烘墠鍌ㄥ锛屼絾楂樻綔鍚戝叧閿矖浣嶅噯澶囧害鐨勮浆鍖栦粛鐒跺亸鎱€?
        : "缁勭粐鏁翠綋缁撴瀯鍙敤锛屼絾閮ㄩ棬涔嬮棿鐨勪汉鎵嶅帤搴﹀拰缁т换鍑嗗搴﹀樊寮傛槑鏄俱€?;
    var stateText = "褰撳墠鍏辨湁 " + hipoA + " 鍚嶉珮娼?A銆? + readyNow + " 鍚嶇幇鍦ㄥ彲鎺ヤ换浜烘墠锛屽叧閿矖浣嶈鐩栫巼绾?" + coverage + "%锛岄珮椋庨櫓楂樼哗鏁堜汉缇?" + highRiskHighPerf + " 浜恒€?;
    var focusModules = uniqueText((issues || []).map(function (item) { return item.route; }));
    return {
      headline: headline,
      state: stateText,
      riskLevel: riskLevel,
      priority: issues.length ? issues[0].actionNow : "鍏堟牎楠屽叧閿矖浣嶅悗澶囷紝鍐嶇ǔ浣忛珮椋庨櫓鏍稿績浜烘墠锛屽悓鏃舵妸楂樻綔杞寲涓虹鐞嗗噯澶囧害銆?,
      issues: issues.length ? issues.slice(0, 4) : [makeIssue("缁勭粐闇€瑕佷紭鍏堟牳楠屽叧閿矖浣嶅悗澶?, "褰撳墠娌℃湁瓒冲寮虹殑寮傚父妯″紡锛屼絾鍏抽敭宀椾綅瑕嗙洊浠嶇劧鍊煎緱浼樺厛纭銆?, 60, "succession", "濡傛灉涓嶆寔缁粴鍔ㄦ牎楠岋紝缁т换鏆撮湶浼氬湪缁勭粐鍙樺姩鏃惰鏀惧ぇ銆?, "鍏堟牳楠岄珮鏆撮湶宀椾綅鍚庡鍚嶅崟銆?, "寤虹珛 ready soon 鍊欓€夋睜銆?, "褰㈡垚鍛ㄦ湡鎬х户浠荤洏鐐规満鍒躲€?)],
      summary: summary,
      focusModules: focusModules,
      guide: buildUsageGuide({ focusModules: focusModules }),
      kpis: {
        criticalRoles: criticalRoles,
        coveredCriticalRoles: coveredCriticalRoles,
        uncovered: uncovered,
        readyNow: readyNow,
        hipoA: hipoA,
        highRiskHighPerf: highRiskHighPerf,
        coverage: coverage,
        conversionGap: conversionGap
      }
    };
  }

  function predictSignals(rows, summaryData) {
    var summary = summaryData || executiveSummary(rows);
    var signals = (summary.issues || []).map(function (item) { return item.predict; }).filter(function (item) { return item; });
    if (summary.kpis && summary.kpis.coverage < 70) signals.push("濡傛灉鍏抽敭宀椾綅瑕嗙洊鐜囩户缁綆浜?70%锛岀粍缁囧湪鎵╁紶鎴栦汉鍛樻祦鍔ㄩ樁娈典細鏇磋鍔ㄣ€?);
    if (summary.kpis && summary.kpis.conversionGap >= 10) signals.push("濡傛灉楂樻綔涓?ready now 鐨勭己鍙ｇ户缁墿澶э紝鏈潵浜烘墠鍌ㄥ灏嗛毦浠ヨ浆鎴愮煭鏈熷彲鐢ㄧ殑绠＄悊姊槦銆?);
    return uniqueText(signals).slice(0, 4);
  }

  function actionPlan(summaryData) {
    var summary = summaryData || executiveSummary(state.employees);
    var issues = summary.issues || [];
    var now = uniqueText(issues.map(function (item) { return item.actionNow; }).concat(["鏍￠獙鍓?10 涓珮鏆撮湶鍏抽敭宀椾綅鐨勫悗澶囧悕鍗曚笌鍑嗗搴︺€?])).slice(0, 3);
    var soon = uniqueText(issues.map(function (item) { return item.actionSoon; }).concat(["涓哄叧閿洟闃熷缓绔嬪畾鍚戝彂灞曡鍒掍笌浜烘墠鏍″噯鑺傚銆?])).slice(0, 3);
    var later = uniqueText(issues.map(function (item) { return item.actionLater; }).concat(["褰㈡垚璺ㄩ儴闂ㄦ粴鍔ㄧ洏鐐瑰拰缁т换鏍″噯鏈哄埗銆?])).slice(0, 3);
    return {
      now: now,
      soon: soon,
      later: later
    };
  }

  function currentRows() {
    if (state.route === "review") return reviewRows(state.employees);
    return state.employees.slice();
  }

  function uniqueValues(rows, key) {
    var seen = {};
    var list = [];
    (rows || []).forEach(function (row) {
      var value = row[key];
      if (!value || seen[value]) return;
      seen[value] = true;
      list.push(value);
    });
    return list.sort();
  }

  function reviewRows(rows) {
    return (rows || []).filter(function (row) {
      var departmentPass = state.selectedDepartment === "All" || row.department === state.selectedDepartment;
      var levelPass = state.selectedJobLevel === "All" || row.job_level === state.selectedJobLevel;
      return departmentPass && levelPass;
    });
  }

  function nineBoxTitle(x, y) {
    var performance = ["浣庣哗鏁?, "绋虫€佺哗鏁?, "楂樼哗鏁?][x - 1];
    var potential = ["浣庢綔", "涓綔", "楂樻綔"][y - 1];
    return performance + " / " + potential;
  }

  function buildNineBox(rows) {
    var cells = [];
    for (var y = 3; y >= 1; y -= 1) {
      for (var x = 1; x <= 3; x += 1) {
        var key = x + "-" + y;
        var employees = (rows || []).filter(function (row) {
          return row.ninebox.x === x && row.ninebox.y === y;
        });
        cells.push({
          key: key,
          x: x,
          y: y,
          title: nineBoxTitle(x, y),
          employees: employees
        });
      }
    }
    return cells;
  }

  function cellSummary(cell) {
    if (!cell) return "褰撳墠鏍煎瓙鏆傛棤鏁版嵁銆?;
    if (cell.x === 3 && cell.y === 3) return "杩欐槸鏈€鍊煎緱閲嶇偣璁茶堪鐨勪汉鎵嶆睜锛岄€傚悎浣滀负楂樻綔涓庨珮缁╂晥鍏煎叿鐨勪唬琛ㄦ牱鏈€?;
    if (cell.x === 3 && cell.y <= 2) return "杩欓噷鐨勪汉缁╂晥寮猴紝浣嗘綔鍔涙垨鎺ヤ换鍑嗗搴﹀苟涓嶅厖鍒嗭紝閫傚悎璇存槑鈥滈珮缁╂晥涓嶇瓑浜庤兘鎺ョ彮鈥濄€?;
    if (cell.x <= 2 && cell.y === 3) return "杩欓噷浣撶幇鐨勬槸鏈潵浜烘墠鍌ㄥ锛岄渶瑕佹洿澶氱鐞嗛敾鐐煎拰鍏抽敭缁忛獙杞寲銆?;
    if (cell.x === 1 && cell.y === 1) return "杩欐槸浼樺厛瑙傚療鎴栫籂鍋忕殑浜虹兢锛岄€傚悎瑙ｉ噴缁勭粐涓殑绋冲畾鎬т笌浣庢姇鍏ュ洖鎶ラ棶棰樸€?;
    return "杩欎釜鏍煎瓙鏇撮€傚悎鐢ㄦ潵璁蹭汉鎵嶇粨鏋勫樊寮傦紝鑰屼笉鏄崟鐙綔涓烘槑鏄熸牱鏈€?;
  }

  function renderEmployeeProfile(employee, title) {
    if (!employee) {
      return '<article class="card"><div class="section-head"><h3>' + safe(title || "鍛樺伐鐢诲儚") + '</h3><span>璇烽€夋嫨鍛樺伐</span></div><div class="empty-state">璇蜂粠鍛樺伐鍒楄〃涓€夋嫨涓€浣嶅憳宸ユ煡鐪嬬敾鍍忋€?/div></article>';
    }

    return '<article class="card"><div class="section-head"><h3>' + safe(title || "鍛樺伐鐢诲儚") + '</h3><span>' + safe(employee.name) + '</span></div><div class="profile-grid"><div><span>鍩虹淇℃伅</span><strong>' + safe(employee.department + " / " + employee.position_title) + '</strong></div><div><span>缁╂晥 / 娼滃姏 / 鍑嗗搴?/span><strong>' + safe(employee.performance_current + " / " + (employee.potential_level || "寰呰ˉ鍏?) + " / " + readinessText(employee.succession.band)) + '</strong></div><div><span>SHL 缁煎悎鍒?/span><strong>' + safe(employee.shl.score + "锛? + employee.shl.tier + "锛?) + '</strong></div><div><span>鍏抽敭椋庨櫓</span><strong>' + safe(employee.riskTags.length ? employee.riskTags.join("銆?) : "褰撳墠鏃犳樉钁楅闄╂爣绛?) + '</strong></div></div><div class="insight-line"><strong>楂樻綔瑙ｉ噴</strong><p>' + safe(hipoSummary(employee)) + '</p></div><div class="insight-line"><strong>缁т换瑙ｉ噴</strong><p>' + safe(successionSummary(employee)) + '</p></div><div class="insight-line"><strong>鍩瑰吇寤鸿</strong><p>' + safe(developmentAdvice(employee)) + '</p></div><div class="button-row push-top"><button class="btn btn-secondary" data-action="open-profile">鏌ョ湅瀹屾暣鐢诲儚</button></div></article>';
  }

  function healthRowsByTab(quality, tab) {
    if (!quality) return [];
    if (tab === "autoFixed") return quality.autoFixed;
    if (tab === "caution") return quality.caution;
    return quality.risk;
  }

  function healthTabLabel(tab) {
    return {
      autoFixed: "宸茶嚜鍔ㄤ慨澶?,
      caution: "闇€璋ㄦ厧瑙ｈ",
      risk: "鍏抽敭椋庨櫓"
    }[tab] || tab;
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
    return row.name + " 鐨?SHL 缁煎悎寰楀垎涓?" + row.shl.score + "锛屽叾涓涔犳晱鎹峰害 " + row.shl.learning + "銆侀瀵奸┍鍔ㄥ姏 " + row.shl.leadership + "銆佷汉闄呭奖鍝嶅姏 " + row.shl.influence + "銆佹垬鐣ヨ鐭?" + row.shl.strategic + "銆傝繖璇存槑 TA 鏇村儚涓€浣?" + (row.shl.tier === "A" ? "鍊煎緱閲嶇偣鍩瑰吇鐨勯珮娼滀汉鎵? : row.shl.tier === "B" ? "鍏峰鍙戝睍绌洪棿鐨勪汉鎵? : "闇€瑕佺户缁瀵熺殑浜烘墠") + "銆?;
  }

  function developmentAdvice(row) {
    if (!row) return "";
    if (row.shl.tier === "A" && row.succession.band !== "Ready Now") return "寤鸿鎶?TA 浠庘€滈珮娼滆瘑鍒€濇帹杩涘埌鈥滃彲鎺ヤ换鍑嗗鈥濓紝浼樺厛瀹夋帓甯︿汉浠诲姟銆佽法閮ㄩ棬椤圭洰鍜屽叧閿矖浣嶅奖瀛愬涔犮€?;
    if (row.flight_risk === "High") return "寤鸿鍚屾椂鍋氫繚鐣欏拰鍙戝睍锛岄伩鍏嶉珮缁╂晥涓庨珮绂昏亴椋庨櫓鍙犲姞鎴愮粍缁囨毚闇层€?;
    return "寤鸿鍥寸粫宀椾綅鍖归厤搴﹀拰鍏抽敭缁忛獙琛ヨ锛屾妸褰撳墠缁╂晥杩涗竴姝ヨ浆鍖栦负鍙獙璇佺殑缁т换鍑嗗搴︺€?;
  }

  function successionSummary(row) {
    if (!row) return "";
    return "褰撳墠缁т换鍑嗗搴︿负鈥? + readinessText(row.succession.band) + "鈥濓紝缁煎悎寰楀垎 " + row.succession.score + "銆傜鐞嗚€呮帹鑽愩€佸叧閿粡楠屼笌宀椾綅鍖归厤搴︽槸褰撳墠鍒ゆ柇鐨勬牳蹇冧緷鎹€?;
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
    var summary = executiveSummary(state.employees);
    var guide = summary.guide || buildUsageGuide(summary);
    var previewFindings = summary.issues.slice(0, 3).map(function (item) {
      return '<div class="preview-finding"><strong>' + safe(item.title) + '</strong><span>' + safe(item.detail) + '</span></div>';
    }).join("");
    return '<section class="hero hero-v2 card home-hero"><div class="hero-copy"><div class="tag">AI 缂佸嫮绮愮拠濠冩焽娴ｆ粌鎼?/div><h2>閹跺﹤鎲冲銉︽殶閹诡喛鍤滈崝銊ㄦ祮閹存劕褰插Ч鍥ㄥГ閻ㄥ嫪姹夐幍宥勭瑢缂佈傛崲濞茬偛鐧傞妴?/h2><p>TalentPulse 闂堛垹鎮?HR 鐎涳妇鏁撴稉搴″灥缁?HR 娴犲簼绗熼懓鍛偓鍌氱暊娴兼俺鍤滈崝銊ㄧ槕閸掝偄鎲冲銉︽殶閹诡喓鈧礁缍婃稉鈧崠鏍х埗鐟?HR 閸欙絽绶為妴浣界翻閸戣桨姹夐幍宥囨磸閻愰€涚瑢缂佈傛崲妞嬪酣娅撻敍灞借嫙閹跺﹦绮ㄩ弸婊勬殻閻炲棙鍨氶柅鍌氭値闂堛垼鐦拋鑼跺牚娑撳孩鐪归幎銉ョ潔缁€铏规畱妞ょ敻娼伴妴?/p><div class="hero-actions"><button class="btn btn-primary" data-action="try-demo">娴ｆ捇鐛?Demo</button><label class="btn btn-secondary upload-inline">娑撳﹣绱堕崨妯轰紣閺佺増宓?input id="upload-input" type="file" accept=".csv,.xlsx" hidden></label></div><div class="hero-note">' + safe(state.uploadNote) + '</div><div class="hero-proof"><div><span>娴ｆ粌鎼х€规矮缍?/span><strong>闂堛垼鐦仦鏇犮仛閸ㄥ鍨庨弸鎰獓閸?/strong></div><div><span>閺堚偓娴ｅ疇顔夋潻鎷岀熅瀵?/span><strong>閹槒顫?閳?娴滅儤澧犻惄妯煎仯 閳?缂佈傛崲閸掑棙鐎?閳?濮瑰洦濮ら幎銉ユ啞</strong></div></div></div><div class="preview-board"><div class="preview-board-head"><span>Demo 妫板嫯顫?/span><strong>NovaEdge Technologies</strong></div><div class="preview-summary"><div class="preview-score"><span>缂佸嫮绮愭搴ㄦ珦缁涘楠?/span><strong>' + safe(summary.riskLevel) + '</strong></div><div class="preview-score"><span>瑜版挸澧犳导妯哄帥閸斻劋缍?/span><strong>' + safe(summary.priority) + '</strong></div></div><div class="preview-metrics"><div><span>妤傛ɑ缍?A</span><strong>' + safe(summary.kpis.hipoA) + '</strong></div><div><span>閻滄澘婀崣顖涘复娴?/span><strong>' + safe(summary.kpis.readyNow) + '</strong></div><div><span>閸忔娊鏁紓鍝勫經</span><strong>' + safe(summary.kpis.uncovered) + '</strong></div></div><div class="preview-findings">' + previewFindings + '</div></div></section>' +
      '<section class="grid-kpi home-value-grid"><article class="card value-card"><span>閼奉亜濮╃拠鍡楀焼閸涙ê浼愰弫鐗堝祦</span><strong>閼奉亜濮╃拠鍡楀焼鐎涙顔岄崥顐＄疅閿涘苯鑻熻ぐ鎺嶇閸栨牕鐖剁憴?HR 閸欙絽绶為妴?/strong></article><article class="card value-card"><span>閼奉亜濮╅崣鎴犲箛缂佸嫮绮愰梻顕€顣?/span><strong>韫囶偊鈧喕鐦戦崚顐ｆ緲閸戣櫕绻佹惔锔跨瑝鐡掔偨鈧礁宕熼悙閫涚贩鐠ф牔绗岀紒褌鎹㈤弳鎾苟閵?/strong></article><article class="card value-card"><span>閼奉亜濮╃憴锝夊櫞闂傤噣顣介崢鐔锋礈</span><strong>閹跺﹥瀵氶弽鍥╃倳鐠囨垶鍨氱紒鍕矏鐠囧﹥鏌囬敍宀冣偓灞肩瑝閸欘亝妲哥仦鏇犮仛閸ユ崘銆冮妴?/strong></article><article class="card value-card"><span>閼奉亜濮╅悽鐔稿灇濮瑰洦濮ゅ楦款唴</span><strong>閹跺﹦绮ㄩ弸婊勬暪閺夌喐鍨氶崣顖濐唹閵嗕礁褰插Ч鍥ㄥГ閵嗕礁褰查崘娆掔箻缁犫偓閸樺棛娈戞潏鎾冲毉閵?/strong></article></section>' +
      '<section class="section-grid-2"><article class="card"><div class="section-head"><h3>Demo 閸忣剙寰冮弫鍛皑</h3><span>2-3 閸掑棝鎸撻崡鍐插讲鐎瑰本鍨氭稉鈧潪顔肩暚閺佺顔夋潻?/span></div><div class="story-grid"><div><strong>閸忣剙寰冮懗灞炬珯</strong><p>NovaEdge Technologies 閺勵垯绔存總妤冪翱韫囧啳顔曠拋锛勬畱 300 娴滈缚娅勯幏鐔峰彆閸欓潻绱濇稉宥嗘Ц闂呭繑婧€ mock 閺佺増宓侀妴?/p></div><div><strong>娑撹桨绮堟稊鍫モ偓鍌氭値闂堛垼鐦?/strong><p>鐎瑰啳鍏樼粙鍐茬暰鐠烘垵鍤惍鏂垮絺閵嗕線鏀㈤崬顔衡偓浣烽獓閸濅降鈧浇绻嶉拃銉ユ嫲閺€顖涘瘮闁劑妫惃鍕矋缂佸洭妫舵０妯糕偓?/p></div><div><strong>閺堚偓娴ｅ疇顔夋潻鐗堟煙瀵?/strong><p>娴犲骸缍嬮崜宥囧Ц閹浇顔夐崚鏉垮斧閸ョ媴绱濋崘宥堫唹妞嬪酣娅撴０鍕ゴ閿涘本娓堕崥搴ゆ儰閸掓媽顢戦崝銊ョ紦鐠侇喕绗屽Ч鍥ㄥГ鏉堟挸鍤妴?/p></div><div><strong>閼宠棄濮忕拠浣规</strong><p>閸氬奔绔存總妞鹃獓閸濅線鍣烽崥灞炬娴ｆ挾骞?AI 娴ｈ法鏁ら懗钘夊閵嗕礁鍨庨弸鎰厴閸旀稑鎷扮紒鍕矏鐠囧﹥鏌囬懗钘夊閵?/p></div></div></article><article class="card"><div class="section-head"><h3>Demo 閸忔娊鏁拋顕€顣?/h3><span>缁嬪啿鐣鹃崣顖氼槻鏉╂壆娈戠紒鍕矏閺佸懍绨?/span></div><div class="issue-chip-grid"><span class="tag warning">閻柨褰傞敍姘剁彯濞兼粌顦块敍灞肩稻缁狅紕鎮婂顖炴Е閽?/span><span class="tag warning">闁库偓閸烆噯绱版稉姘卞摋瀵尨绱濇担鍡欘瀲閼卞矂顥撻梽鈺呯彯</span><span class="tag warning">鏉╂劘鎯€閿涙氨绮ㄩ弸鍕旈敍灞肩稻閹存劙鏆遍崑婊勭哺</span><span class="tag warning">娴溠冩惂閿涙艾鍙ч柨顔肩煐娴ｅ秴宕熼悙閫涚贩鐠?/span><span class="tag warning">鐎广垺鍩涢幋鎰閿涙岸鐝婊嗙槕閸掝偂绗夌搾?/span><span class="tag warning">HR / 鐠愩垹濮?/ IT閿涙矮缍嗛崣顖濐潌鎼达箓鐝搴ㄦ珦</span></div></article></section>' +
      '<section class="card"><div class="section-head"><h3>娴ｈ法鏁ら梻顓犲箚</h3><span>Describe 閳?Explain 閳?Predict 閳?Control 閳?Report</span></div><div class="workflow-strip workflow-strip-v2"><div><span>閸忋儱褰?/span><strong>娴ｆ捇鐛?Demo 閹存牔绗傛导鐘叉喅瀹搞儲鏆熼幑?/strong></div><div><span>Describe</span><strong>閻绔昏ぐ鎾冲娴滅儤澧犵紒鎾寸€稉搴ｇ矋缂佸洦姣氶棁?/strong></div><div><span>Explain</span><strong>鐟欙綁鍣撮梻顕€顣芥稉杞扮矆娑斿牅绱伴崣鎴犳晸</strong></div><div><span>Predict</span><strong>妫板嫭绁撮張顏呮降 6-12 娑擃亝婀€妞嬪酣娅?/strong></div><div><span>Control</span><strong>缂佹瑥鍤崚鍡涙▉濞堜絻顢戦崝銊ョ紦鐠?/strong></div><div><span>Report</span><strong>鏉堟挸鍤柅鍌氭値濮瑰洦濮ら惃鍕暚閺佸绮ㄧ拋?/strong></div></div></section>' +
      renderGuideCards(guide);
    return '<section class="hero hero-v2 card home-hero"><div class="hero-copy"><div class="tag">AI 缁勭粐璇婃柇浣滃搧</div><h2>鎶婂憳宸ユ暟鎹嚜鍔ㄨ浆鎴愬彲姹囨姤鐨勪汉鎵嶄笌缁т换娲炲療銆?/h2><p>TalentPulse 闈㈠悜 HR 瀛︾敓涓庡垵绾?HR 浠庝笟鑰呫€傚畠浼氳嚜鍔ㄨ瘑鍒憳宸ユ暟鎹€佸綊涓€鍖栧父瑙?HR 鍙ｅ緞銆佽緭鍑轰汉鎵嶇洏鐐逛笌缁т换椋庨櫓锛屽苟鎶婄粨鏋滄暣鐞嗘垚閫傚悎闈㈣瘯璁茶堪涓庢眹鎶ュ睍绀虹殑椤甸潰銆?/p><div class="hero-actions"><button class="btn btn-primary" data-action="try-demo">浣撻獙 Demo</button><label class="btn btn-secondary upload-inline">涓婁紶鍛樺伐鏁版嵁<input id="upload-input" type="file" accept=".csv,.xlsx" hidden></label></div><div class="hero-note">' + safe(state.uploadNote) + '</div><div class="hero-proof"><div><span>浣滃搧瀹氫綅</span><strong>闈㈣瘯灞曠ず鍨嬪垎鏋愪骇鍝?/strong></div><div><span>鏈€浣宠杩拌矾寰?/span><strong>鎬昏 鈫?浜烘墠鐩樼偣 鈫?缁т换鍒嗘瀽 鈫?姹囨姤鎶ュ憡</strong></div></div></div><div class="preview-board"><div class="preview-board-head"><span>Demo 棰勮</span><strong>NovaEdge Technologies</strong></div><div class="preview-summary"><div class="preview-score"><span>缁勭粐椋庨櫓绛夌骇</span><strong>楂?/strong></div><div class="preview-score"><span>褰撳墠浼樺厛鍔ㄤ綔</span><strong>鍏堟牳楠岄珮鏆撮湶宀椾綅鍚庡</strong></div></div><div class="preview-metrics"><div><span>楂樻綔 A</span><strong>58</strong></div><div><span>鐜板湪鍙帴浠?/span><strong>37</strong></div><div><span>鍏抽敭缂哄彛</span><strong>18</strong></div></div><div class="preview-findings"><div class="preview-finding"><strong>鐮斿彂澧為暱蹇簬绠＄悊鍑嗗搴?/strong><span>鏈潵浜烘墠鍌ㄥ涓嶉敊锛屼絾 ready now 鏉垮嚦鍋忚杽銆?/span></div><div class="preview-finding"><strong>閿€鍞粨鏋滃己锛屼絾鏉垮嚦娣卞害鑴嗗急</strong><span>涓氱哗寮哄娍鑳屽悗浠嶅瓨鍦ㄦ槑鏄熷憳宸ヤ緷璧栦笌绂昏亴椋庨櫓銆?/span></div><div class="preview-finding"><strong>浜у搧鍏抽敭宀椾綅瀛樺湪鍗曠偣渚濊禆</strong><span>鍏抽敭宀椾綅瑕嗙洊杩囦簬闆嗕腑锛屼换浣曠┖缂洪兘浼氭斁澶х户浠绘毚闇层€?/span></div></div></div></section>' +
      '<section class="grid-kpi home-value-grid"><article class="card value-card"><span>鑷姩璇嗗埆鍛樺伐鏁版嵁</span><strong>鑷姩璇嗗埆瀛楁鍚箟锛屽苟褰掍竴鍖栧父瑙?HR 鍙ｅ緞銆?/strong></article><article class="card value-card"><span>鑷姩鍙戠幇缁勭粐闂</span><strong>蹇€熻瘑鍒澘鍑虫繁搴︿笉瓒炽€佸崟鐐逛緷璧栦笌缁т换鏆撮湶銆?/strong></article><article class="card value-card"><span>鑷姩瑙ｉ噴闂鍘熷洜</span><strong>鎶婃寚鏍囩炕璇戞垚缁勭粐璇婃柇锛岃€屼笉鍙槸灞曠ず鍥捐〃銆?/strong></article><article class="card value-card"><span>鑷姩鐢熸垚姹囨姤寤鸿</span><strong>鎶婄粨鏋滄敹鏉熸垚鍙銆佸彲姹囨姤銆佸彲鍐欒繘绠€鍘嗙殑杈撳嚭銆?/strong></article></section>' +
      '<section class="section-grid-2"><article class="card"><div class="section-head"><h3>Demo 鍏徃鏁呬簨</h3><span>2-3 鍒嗛挓鍗冲彲瀹屾垚涓€杞畬鏁磋杩?/span></div><div class="story-grid"><div><strong>鍏徃鑳屾櫙</strong><p>NovaEdge Technologies 鏄竴濂楃簿蹇冭璁＄殑 300 浜鸿櫄鎷熷叕鍙革紝涓嶆槸闅忔満 mock 鏁版嵁銆?/p></div><div><strong>涓轰粈涔堥€傚悎闈㈣瘯</strong><p>瀹冭兘绋冲畾璺戝嚭鐮斿彂銆侀攢鍞€佷骇鍝併€佽繍钀ュ拰鏀寔閮ㄩ棬鐨勭粍缁囬棶棰樸€?/p></div><div><strong>鏈€浣宠杩版柟寮?/strong><p>浠庡綋鍓嶇姸鎬佽鍒板師鍥狅紝鍐嶈椋庨櫓棰勬祴锛屾渶鍚庤惤鍒拌鍔ㄥ缓璁笌姹囨姤杈撳嚭銆?/p></div><div><strong>鑳藉姏璇佹槑</strong><p>鍚屼竴濂椾骇鍝侀噷鍚屾椂浣撶幇 AI 浣跨敤鑳藉姏銆佸垎鏋愯兘鍔涘拰缁勭粐璇婃柇鑳藉姏銆?/p></div></div></article><article class="card"><div class="section-head"><h3>Demo 鍏抽敭璁</h3><span>绋冲畾鍙杩扮殑缁勭粐鏁呬簨</span></div><div class="issue-chip-grid"><span class="tag warning">鐮斿彂锛氶珮娼滃锛屼絾绠＄悊姊槦钖?/span><span class="tag warning">閿€鍞細涓氱哗寮猴紝浣嗙鑱岄闄╅珮</span><span class="tag warning">杩愯惀锛氱粨鏋勭ǔ锛屼絾鎴愰暱鍋滄粸</span><span class="tag warning">浜у搧锛氬叧閿矖浣嶅崟鐐逛緷璧?/span><span class="tag warning">瀹㈡埛鎴愬姛锛氶珮娼滆瘑鍒笉瓒?/span><span class="tag warning">HR / 璐㈠姟 / IT锛氫綆鍙搴﹂珮椋庨櫓</span></div></article></section>' +
      '<section class="card"><div class="section-head"><h3>浣跨敤闂幆</h3><span>Describe 鈫?Explain 鈫?Predict 鈫?Control 鈫?Report</span></div><div class="workflow-strip workflow-strip-v2"><div><span>鍏ュ彛</span><strong>浣撻獙 Demo 鎴栦笂浼犲憳宸ユ暟鎹?/strong></div><div><span>Describe</span><strong>鐪嬫竻褰撳墠浜烘墠缁撴瀯涓庣粍缁囨毚闇?/strong></div><div><span>Explain</span><strong>瑙ｉ噴闂涓轰粈涔堜細鍙戠敓</strong></div><div><span>Predict</span><strong>棰勬祴鏈潵 6-12 涓湀椋庨櫓</strong></div><div><span>Control</span><strong>缁欏嚭鍒嗛樁娈佃鍔ㄥ缓璁?/strong></div><div><span>Report</span><strong>杈撳嚭閫傚悎姹囨姤鐨勫畬鏁寸粨璁?/strong></div></div></section>';
  }

  function renderOverview(rows) {
    var summary = executiveSummary(state.employees);
    var actions = actionPlan(summary);
    var roles = getCriticalRoles(state.employees);
    var signals = predictSignals(rows, summary);
    var guide = summary.guide || buildUsageGuide(summary);
    return '<section class="executive-summary card"><div class="executive-main"><div class="tag">Executive Summary</div><h2>' + safe(summary.headline) + '</h2><p>' + safe(summary.state) + '</p><div class="summary-kpis"><div><span>瑜版挸澧犻悩鑸碘偓?/span><strong>閺堫亝娼垫禍鐑樺閸屻劌顦€涙ê婀敍灞肩稻閸忔娊鏁畝妞剧秴鐟曞棛娲婃稉宥呮綆閵?/strong></div><div><span>妞嬪酣娅撶粵澶岄獓</span><strong>' + safe(summary.riskLevel) + '</strong></div><div><span>瑜版挸澧犳导妯哄帥閸斻劋缍?/span><strong>' + safe(summary.priority) + '</strong></div></div></div><div class="executive-side">' + summary.issues.slice(0, 4).map(function (item) { return '<div class="summary-point"><strong>' + safe(item.title) + '</strong><span>' + safe(item.detail) + '</span></div>'; }).join("") + '</div></section>' +
      '<section class="section-grid-2"><article class="card"><div class="section-head"><h3>Describe</h3><span>Look at the current structure and immediate exposure.</span></div>' + renderBars([{ label: "HiPo A", value: countBy(rows, function (row) { return row.shl.tier === "A"; }), color: "var(--primary)" }, { label: "Ready Now", value: countBy(rows, function (row) { return row.succession.band === "Ready Now"; }), color: "var(--success)" }, { label: "Ready 1-2Y", value: countBy(rows, function (row) { return row.succession.band === "Ready in 1-2 Years"; }), color: "#4a7cff" }, { label: "Uncovered Roles", value: countBy(rows, function (row) { return row.critical_role_flag === "Y" && row.successor_nomination_flag === "N"; }), color: "var(--danger)" }]) + '</article><article class="card"><div class="section-head"><h3>Department Gap</h3><span>Show which teams are pulling ahead and which ones are getting thinner.</span></div><div class="dept-strip">' + Object.keys(summary.summary).slice(0, 8).map(function (key) { var item = summary.summary[key]; return '<div class="dept-card"><span>' + safe(key) + '</span><div class="mini-bar"><div style="width:' + item.avgShl + '%"></div></div><strong>' + item.avgShl + '</strong><small>HiPo ' + item.hipoA + ' / Ready Now ' + item.readyNow + ' / Gap ' + item.uncoveredRoles + '</small></div>'; }).join("") + '</div></article></section>' +
      '<section class="section-grid-3"><article class="card insight-card"><div class="section-head"><h3>Explain閿濇粌甯崶鐘盒掗柌?/h3><span>娑撹桨绮堟稊鍫滅窗鏉╂瑦鐗?/span></div>' + summary.issues.map(function (item) { return '<div class="insight-line"><strong>' + safe(item.title) + '</strong><p>' + safe(item.detail) + '</p></div>'; }).join("") + '</article><article class="card insight-card"><div class="section-head"><h3>Predict閿濇粓顥撻梽鈺咁暕濞?/h3><span>閺堫亝娼?6-12 娑擃亝婀€娴兼碍鈧孩鐗?/span></div>' + signals.map(function (text) { return '<div class="insight-line"><strong>閸撳秶鐏搴ㄦ珦</strong><p>' + safe(text) + '</p></div>'; }).join("") + '</article><article class="card insight-card"><div class="section-head"><h3>Control閿濇粏顢戦崝銊ョ紦鐠?/h3><span>閻滄澘婀張鈧拠銉ヤ粵娴犫偓娑?/span></div><div class="time-list"><div><strong>0-3 娑擃亝婀€</strong><p>' + safe(actions.now.join(" ")) + '</p></div><div><strong>3-6 娑擃亝婀€</strong><p>' + safe(actions.soon.join(" ")) + '</p></div><div><strong>6-12 娑擃亝婀€</strong><p>' + safe(actions.later.join(" ")) + '</p></div></div></article></section>' +
      '<section class="section-grid-2"><article class="card"><div class="section-head"><h3>婵″倹鐏夋稉宥咁槱閻炲棴绱濇导姘偓搴㈢壉</h3><span>妞嬪酣娅撴导姘洤娴ｆ洖顦婚幒?/span></div>' + signals.slice(0, 2).map(function (text) { return '<div class="priority-card"><strong>' + safe(text) + '</strong><p>鏉╂瑦妲歌ぐ鎾冲缂佸嫮绮愰梻顕€顣介崷?6-12 娑擃亝婀€閸愬懏娓堕張澶婂讲閼宠姤鏂佹径褏娈戦弬鐟版倻閵?/p></div>'; }).join("") + '</article><article class="card"><div class="section-head"><h3>妫板棗顕遍懓鍛劃閸掕绨查崗鍫濅粵娴犫偓娑?/h3><span>閺堚偓閸婄厧绶辨导妯哄帥閹恒劏绻橀惃鍕付閸掕泛濮╂担?/span></div>' + actions.now.map(function (text, index) { return '<div class="priority-card"><strong>' + safe((index + 1) + ". " + text) + '</strong><p>鏉╂瑦妲歌ぐ鎾冲閺堚偓閸婄厧绶遍崗鍫熷腹鏉╂稓娈戦崝銊ょ稊閿涘苯褰查惄瀛樺复閻劋绨粙鍏呯秶閺夊灝鍤﹂崪灞芥倵婢跺洩顩惄鏍モ偓?/p></div>'; }).join("") + '</article></section>' +
      renderGuideCards(guide) +
      '<section class="card"><div class="section-head"><h3>閺堚偓閼村棗鎬ラ惃鍕彠闁款喖鐭栨担?/h3><span>闁倸鎮庨崷銊╂桨鐠囨洑鑵戞担婊€璐熼弨鑸垫将鐠囦焦宓?/span></div><table class="data-table"><thead><tr><th>閸忔娊鏁畝妞剧秴</th><th>閺堚偓娴ｅ啿鈧瑩鈧姹?/th><th>閸戝棗顦惔?/th><th>妞嬪酣娅撴穱鈥冲娇</th></tr></thead><tbody>' + roles.slice(0, 8).map(function (role) { var c = role.candidates[0]; return '<tr><td>' + safe(role.role) + '</td><td>' + safe(c ? c.name : "閺嗗倹妫ら崐娆撯偓?) + '</td><td>' + safe(c ? readinessText(c.succession.band) : "閺嗗倹婀亸杈╁崕") + '</td><td>' + safe(c && c.riskTags.length ? c.riskTags.join("閵?) : "瀵ら缚顔呮导妯哄帥閺嶏繝鐛?) + '</td></tr>'; }).join("") + '</tbody></table></section>';
    var summary = executiveSummary(state.employees);
    var actions = actionPlan();
    var roles = getCriticalRoles(state.employees);
    return '<section class="executive-summary card"><div class="executive-main"><div class="tag">Executive Summary</div><h2>' + safe(summary.headline) + '</h2><p>' + safe(summary.state) + '</p><div class="summary-kpis"><div><span>褰撳墠鐘舵€?/span><strong>鏈潵浜烘墠鍌ㄥ瀛樺湪锛屼絾鍏抽敭宀椾綅瑕嗙洊涓嶅潎銆?/strong></div><div><span>椋庨櫓绛夌骇</span><strong>' + safe(summary.riskLevel) + '</strong></div><div><span>褰撳墠浼樺厛鍔ㄤ綔</span><strong>' + safe(summary.priority) + '</strong></div></div></div><div class="executive-side">' + summary.issues.slice(0, 4).map(function (item) { return '<div class="summary-point"><strong>' + safe(item.title) + '</strong><span>' + safe(item.detail) + '</span></div>'; }).join("") + '</div></section>' +
      '<section class="section-grid-2"><article class="card"><div class="section-head"><h3>Describe锝滅幇鐘舵弿杩?/h3><span>鐜板湪鍒板簳鍙戠敓浜嗕粈涔?/span></div>' + renderBars([{ label: "楂樻綔 A", value: countBy(rows, function (row) { return row.shl.tier === "A"; }), color: "var(--primary)" }, { label: "鐜板湪鍙帴浠?, value: countBy(rows, function (row) { return row.succession.band === "Ready Now"; }), color: "var(--success)" }, { label: "1-2 骞村彲鎺ヤ换", value: countBy(rows, function (row) { return row.succession.band === "Ready in 1-2 Years"; }), color: "#4a7cff" }, { label: "鍏抽敭宀椾綅鏃犲悗澶?, value: countBy(rows, function (row) { return row.critical_role_flag === "Y" && row.successor_nomination_flag === "N"; }), color: "var(--danger)" }]) + '</article><article class="card"><div class="section-head"><h3>閮ㄩ棬宸紓</h3><span>鍝簺鍥㈤槦鐨勪汉鎵嶇粨鏋勬鍦ㄦ媺寮€宸窛</span></div><div class="dept-strip">' + Object.keys(summary.summary).slice(0, 8).map(function (key) { var item = summary.summary[key]; return '<div class="dept-card"><span>' + safe(key) + '</span><div class="mini-bar"><div style="width:' + item.avgShl + '%"></div></div><strong>' + item.avgShl + '</strong><small>楂樻綔 ' + item.hipoA + ' / 鐜板湪鍙帴浠?' + item.readyNow + ' / 鏆撮湶 ' + item.uncoveredRoles + '</small></div>'; }).join("") + '</div></article></section>' +
      '<section class="section-grid-3"><article class="card insight-card"><div class="section-head"><h3>Explain锝滃師鍥犺В閲?/h3><span>涓轰粈涔堜細杩欐牱</span></div>' + summary.issues.map(function (item) { return '<div class="insight-line"><strong>' + safe(item.title) + '</strong><p>' + safe(item.detail) + '</p></div>'; }).join("") + '</article><article class="card insight-card"><div class="section-head"><h3>Predict锝滈闄╅娴?/h3><span>鏈潵 6-12 涓湀浼氭€庢牱</span></div>' + predictSignals(rows).map(function (text) { return '<div class="insight-line"><strong>鍓嶇灮椋庨櫓</strong><p>' + safe(text) + '</p></div>'; }).join("") + '</article><article class="card insight-card"><div class="section-head"><h3>Control锝滆鍔ㄥ缓璁?/h3><span>鐜板湪鏈€璇ュ仛浠€涔?/span></div><div class="time-list"><div><strong>0-3 涓湀</strong><p>' + safe(actions.now.join(" ")) + '</p></div><div><strong>3-6 涓湀</strong><p>' + safe(actions.soon.join(" ")) + '</p></div><div><strong>6-12 涓湀</strong><p>' + safe(actions.later.join(" ")) + '</p></div></div></article></section>' +
      '<section class="section-grid-2"><article class="card"><div class="section-head"><h3>濡傛灉涓嶅鐞嗭紝浼氭€庢牱</h3><span>椋庨櫓浼氬浣曞鎺?/span></div><div class="priority-card"><strong>鍏抽敭宀椾綅鑴嗗急鎬т細鎸佺画鏀惧ぇ銆?/strong><p>鍏抽敭宀椾綅鏃犲悗澶囩殑闂涓嶄細鑷姩娑堝け锛屽弽鑰屼細鍦ㄤ汉鍛樻祦鍔ㄦ垨鎵╁紶闃舵蹇€熸毚闇层€?/p></div><div class="priority-card"><strong>鏄庢槦鍛樺伐渚濊禆浼氱户缁姞閲嶃€?/strong><p>閿€鍞拰浜у搧鐨勭粨鏋勬€ч闄╋紝鏈川涓婃槸澶撮儴璐＄尞鑰呴泦涓笌鏇胯ˉ涓嶈冻鍙犲姞銆?/p></div></article><article class="card"><div class="section-head"><h3>棰嗗鑰呮鍒诲簲鍏堝仛浠€涔?/h3><span>鏈€鍊煎緱浼樺厛鎺ㄨ繘鐨勬帶鍒跺姩浣?/span></div><div class="priority-card"><strong>1. 鏍搁獙鍏抽敭宀椾綅鍚庡</strong><p>浼樺厛纭楂樻毚闇插矖浣嶇殑鍚庡浜洪€夋槸鍚︾湡瀹炲彲鐢ㄣ€?/p></div><div class="priority-card"><strong>2. 绋充綇楂橀闄╂牳蹇冧汉鎵?/strong><p>瀵归珮缁╂晥涓旈珮绂昏亴椋庨櫓鐨勪汉缇わ紝浼樺厛鍋氫繚鐣欎笌鍙戝睍缁勫悎鍔ㄤ綔銆?/p></div><div class="priority-card"><strong>3. 鎺ㄥ姩楂樻綔杞寲涓哄噯澶囧害</strong><p>鐗瑰埆鏄爺鍙戝拰浜у搧鍥㈤槦锛岄噸鐐逛笉鍦ㄥ彂鐜版洿澶氶珮娼滐紝鑰屽湪鎺ㄥ姩杞寲銆?/p></div></article></section>' +
      '<section class="grid-kpi drill-grid"><a class="card quick-link" href="#review">杩涘叆浜烘墠鐩樼偣</a><a class="card quick-link" href="#succession">杩涘叆缁т换鍒嗘瀽</a><a class="card quick-link" href="#health">杩涘叆鏁版嵁鍋ュ悍</a><a class="card quick-link" href="#report">杩涘叆姹囨姤鎶ュ憡</a></section>' +
      '<section class="card"><div class="section-head"><h3>鏈€鑴嗗急鐨勫叧閿矖浣?/h3><span>閫傚悎鍦ㄩ潰璇曚腑浣滀负鏀舵潫璇佹嵁</span></div><table class="data-table"><thead><tr><th>鍏抽敭宀椾綅</th><th>鏈€浣冲€欓€変汉</th><th>鍑嗗搴?/th><th>椋庨櫓淇″彿</th></tr></thead><tbody>' + roles.slice(0, 8).map(function (role) { var c = role.candidates[0]; return '<tr><td>' + safe(role.role) + '</td><td>' + safe(c ? c.name : "鏆傛棤鍊欓€?) + '</td><td>' + safe(c ? readinessText(c.succession.band) : "鏆傛湭灏辩华") + '</td><td>' + safe(c && c.riskTags.length ? c.riskTags.join("銆?) : "寤鸿浼樺厛鏍￠獙") + '</td></tr>'; }).join("") + '</tbody></table></section>';
  }

  function renderTalentReview(rows) {
    var filtered = reviewRows(rows);
    var departments = summarizeDepartments(filtered);
    var highPerfNotSuccessors = filtered.filter(function (row) { return scorePerformance(row.performance_current) >= 4 && row.succession.band !== "Ready Now"; }).slice(0, 8);
    var cells = buildNineBox(filtered);
    var selectedCell = null;
    var i = 0;
    for (i = 0; i < cells.length; i += 1) {
      if (cells[i].key === state.selectedNineBoxKey) selectedCell = cells[i];
    }
    if (!selectedCell) {
      for (i = 0; i < cells.length; i += 1) {
        if (cells[i].employees.length) {
          selectedCell = cells[i];
          break;
        }
      }
    }
    if (!selectedCell) selectedCell = cells[0];

    var selectedCellEmployees = (selectedCell && selectedCell.employees ? selectedCell.employees.slice() : []).sort(function (a, b) {
      return b.shl.score - a.shl.score;
    });
    var selected = findEmployee(state.selectedEmployeeId);
    if (!selected || selectedCellEmployees.map(function (row) { return row.employee_id; }).indexOf(selected.employee_id) < 0) {
      selected = selectedCellEmployees[0] || filtered.slice().sort(function (a, b) { return b.shl.score - a.shl.score; })[0];
    }

    return '<section class="card"><div class="section-head"><h3>涔濆鏍间汉鎵嶇洏鐐?/h3><span>鐢ㄧ粨鏋勫樊寮傝娓呬汉鎵嶅瘑搴︿笌鏂眰浣嶇疆</span></div><div class="filter-row"><select class="filter-select" data-filter="department"><option value="All">鍏ㄩ儴閮ㄩ棬</option>' + uniqueValues(state.employees, "department").map(function (item) { return '<option value="' + safe(item) + '"' + (state.selectedDepartment === item ? " selected" : "") + '>' + safe(item) + '</option>'; }).join("") + '</select><select class="filter-select" data-filter="jobLevel"><option value="All">鍏ㄩ儴鑱岀骇</option>' + uniqueValues(state.employees, "job_level").map(function (item) { return '<option value="' + safe(item) + '"' + (state.selectedJobLevel === item ? " selected" : "") + '>' + safe(item) + '</option>'; }).join("") + '</select><span class="status info">褰撳墠鏍锋湰 ' + safe(filtered.length) + ' 浜?/span></div><div class="two-col push-top"><div><div class="ninebox-grid">' + cells.map(function (cell) { return '<button class="ninebox-cell ' + (selectedCell && selectedCell.key === cell.key ? "active" : "") + '" data-ninebox="' + safe(cell.key) + '"><span class="cell-title">' + safe(cell.title) + '</span><strong>' + safe(cell.employees.length) + '</strong><small>' + safe(cell.x === 3 && cell.y === 3 ? "楂樼哗鏁堥珮娼滐紝浼樺厛璁茶堪" : cell.x === 3 ? "缁╂晥寮猴紝浣嗕笉涓€瀹氬彲鎺ョ彮" : cell.y === 3 ? "鏈潵鍌ㄥ锛岄渶瑕佽浆鍖? : "鐢ㄤ簬璇存槑绋冲畾涓庢柇灞?) + '</small></button>'; }).join("") + '</div><div class="insight-line"><strong>褰撳墠鏍煎瓙瑙ｈ</strong><p>' + safe(cellSummary(selectedCell)) + '</p></div></div><div><div class="section-head"><h3>鏍煎瓙鑱斿姩鍛樺伐</h3><span>' + safe(selectedCell ? selectedCell.title : "鏆傛棤鏍煎瓙") + '</span></div><div class="list-panel">' + (selectedCellEmployees.length ? selectedCellEmployees.slice(0, 12).map(function (row) { return '<button class="employee-row ' + (selected && selected.employee_id === row.employee_id ? "active" : "") + '" data-employee="' + safe(row.employee_id) + '"><strong>' + safe(row.name) + '</strong><span>' + safe(row.department + " / " + row.position_title + " / " + readinessText(row.succession.band)) + '</span></button>'; }).join("") : '<div class="empty-state">杩欎釜鏍煎瓙褰撳墠娌℃湁鍛樺伐銆?/div>') + '</div></div></div></section>' +
      '<section class="two-col"><article class="card"><div class="section-head"><h3>閮ㄩ棬瀵规瘮</h3><span>鍝簺鍥㈤槦鐨勪汉鎵嶅帤搴︽洿寮猴紝鍝簺鏇磋杽</span></div>' + renderBars(Object.keys(departments).slice(0, 8).map(function (key) { return { label: key, value: departments[key].hipoA + departments[key].readyNow, color: "var(--primary)" }; })) + '</article>' + renderEmployeeProfile(selected, "鍛樺伐鐢诲儚") + '</section>' +
      '<section class="card"><div class="section-head"><h3>楂樼哗鏁堜絾灏氭湭鍏峰鎺ヤ换鍑嗗鐨勪汉</h3><span>楂樼哗鏁堜笉绛変簬澶╃劧閫傚悎鎺ョ彮</span></div><table class="data-table"><thead><tr><th>濮撳悕</th><th>閮ㄩ棬</th><th>缁╂晥</th><th>鍑嗗搴?/th></tr></thead><tbody>' + highPerfNotSuccessors.map(function (row) { return '<tr><td><button class="link-btn" data-employee="' + safe(row.employee_id) + '">' + safe(row.name) + '</button></td><td>' + safe(row.department) + '</td><td>' + safe(row.performance_current) + '</td><td>' + safe(readinessText(row.succession.band)) + '</td></tr>'; }).join("") + '</tbody></table></section>';
  }

  function renderSuccession(rows) {
    var roles = getCriticalRoles(rows);
    var selectedRole = findRole(state.selectedRoleName, roles) || roles[0];
    var profileEmployee = findEmployee(state.selectedEmployeeId) || (selectedRole && selectedRole.candidates ? selectedRole.candidates[0] : null);
    return '<section class="grid-kpi"><article class="card kpi-card"><span>鍏抽敭宀椾綅鏈夊悗澶?/span><strong>' + countBy(rows, function (row) { return row.critical_role_flag === "Y" && row.successor_nomination_flag === "Y"; }) + '</strong></article><article class="card kpi-card"><span>鐜板湪鍙帴浠?/span><strong>' + countBy(rows, function (row) { return row.succession.band === "Ready Now"; }) + '</strong></article><article class="card kpi-card"><span>1-2 骞村彲鎺ヤ换</span><strong>' + countBy(rows, function (row) { return row.succession.band === "Ready in 1-2 Years"; }) + '</strong></article><article class="card kpi-card"><span>鏃犲悗澶囨毚闇?/span><strong>' + countBy(rows, function (row) { return row.critical_role_flag === "Y" && row.successor_nomination_flag === "N"; }) + '</strong></article></section>' +
      '<section class="two-col"><article class="card"><div class="section-head"><h3>缁т换椋庨櫓鎽樿</h3><span>璋佽兘鎺ヤ笂锛岃皝鎺ヤ笉涓?/span></div><div class="insight-line"><strong>浜у搧涓庢敮鎸佽亴鑳芥毚闇叉渶楂樸€?/strong><p>瑕嗙洊绐勶紝涓斿お渚濊禆灏戞暟棰嗗鑰咃紝鏄綋鍓嶆渶鏄炬€х殑缁т换闂銆?/p></div><div class="insight-line"><strong>閿€鍞鍚屾椂鍋氫繚鐣欎笌鍐椾綑寤鸿銆?/strong><p>寮虹粨鏋滆儗鍚庢槸鏄庢槦鍛樺伐渚濊禆锛岀鑱岄闄╀細鐩存帴鏀惧ぇ宀椾綅鏆撮湶銆?/p></div><div class="insight-line"><strong>鐮斿彂闇€瑕佹妸楂樻綔杞垚绠＄悊鍑嗗搴︺€?/strong><p>椋庨櫓涓嶆槸娌℃湁浜烘墠锛岃€屾槸鏈潵浜烘墠灏氭湭鍙樻垚鍙帴浠荤殑绠＄悊姊槦銆?/p></div></article><article class="card"><div class="section-head"><h3>宀椾綅鐑姏鍥?/h3><span>鐐瑰嚮宀椾綅鏌ョ湅鍊欓€変汉</span></div><div class="heatmap-grid">' + roles.slice(0, 9).map(function (role) { var score = role.candidates[0] ? role.candidates[0].succession.score : 30; var alpha = Math.max(0.18, Math.min(0.88, score / 100)); return '<button class="heat-cell ' + (selectedRole && selectedRole.role === role.role ? 'active' : '') + '" data-role="' + safe(role.role) + '" style="background: rgba(47,107,255,' + alpha + ')"><strong>' + safe(role.department) + '</strong><span>' + safe(role.role.split(" / ")[1] || role.role) + '</span><em>' + safe(role.candidates[0] ? readinessText(role.candidates[0].succession.band) : "鏆傛棤鍚庡") + '</em></button>'; }).join("") + '</div></article></section>' +
      '<section class="two-col"><article class="card"><div class="section-head"><h3>宀椾綅璇︽儏</h3><span>' + safe(selectedRole ? selectedRole.role : "鏆傛棤宀椾綅") + '</span></div><div class="list-panel">' + (selectedRole ? selectedRole.candidates.map(function (row) { return '<button class="employee-row ' + (profileEmployee && profileEmployee.employee_id === row.employee_id ? "active" : "") + '" data-employee="' + safe(row.employee_id) + '"><strong>' + safe(row.name) + '</strong><span>' + safe(readinessText(row.succession.band) + " / " + row.succession.score) + '</span></button>'; }).join("") : '<div class="empty-state">鏆傛棤宀椾綅銆?/div>') + '</div></article><article class="card"><div class="section-head"><h3>鎺у埗寤鸿</h3><span>濡備綍闄嶄綆褰撳墠鏆撮湶</span></div><div class="insight-line"><strong>绔嬪嵆鍔ㄤ綔</strong><p>' + safe(selectedRole && selectedRole.candidates[0] && selectedRole.candidates[0].succession.band === "Ready Now" ? "浼樺厛鏍搁獙绗竴鍊欓€変汉鐨勭湡瀹炴帴浠诲噯澶囧害锛屽苟鏄庣‘鎺ョ彮鏉′欢銆? : "鍏堣ˉ榻愬懡鍚嶅悗澶囷紝鍐嶉€氳繃瀹氬悜鍩瑰吇缂╃煭宀椾綅鍑嗗鍛ㄦ湡銆?) + '</p></div><div class="insight-line"><strong>鎸佺画鐩戞帶</strong><p>鎸佺画璺熻釜宀椾綅绌虹己鏆撮湶銆佸€欓€変汉绂昏亴椋庨櫓锛屼互鍙婃槸鍚﹁繃搴︿緷璧栨煇涓€涓汉銆?/p></div></article></section>' +
      '<section class="two-col">' + renderEmployeeProfile(profileEmployee, "鍊欓€変汉鐢诲儚") + '<article class="card"><div class="section-head"><h3>鑴嗗急宀椾綅娓呭崟</h3><span>鍗曠偣渚濊禆涓庢棤鍚庡鏆撮湶</span></div><table class="data-table"><thead><tr><th>鍏抽敭宀椾綅</th><th>鏈€浣冲€欓€変汉</th><th>鍑嗗搴?/th><th>涓嬩竴姝ュ姩浣?/th></tr></thead><tbody>' + roles.slice(0, 10).map(function (role) { var c = role.candidates[0]; return '<tr><td>' + safe(role.role) + '</td><td>' + safe(c ? c.name : "鏆傛棤鍊欓€?) + '</td><td>' + safe(c ? readinessText(c.succession.band) : "鏆傛棤鍚庡") + '</td><td>' + safe(c && c.succession.band === "Ready Now" ? "绔嬪嵆鏍搁獙" : "寤虹珛瀹氬悜姊槦") + '</td></tr>'; }).join("") + '</tbody></table></article></section>';
  }

  function renderHealth() {
    var quality = state.quality;
    var currentTab = state.activeHealthTab || "risk";
    var issueRows = healthRowsByTab(quality, currentTab);
    var selectedIssue = issueRows[state.selectedHealthIndex] || issueRows[0] || null;
    var beforeCount = quality.autoFixed.length + quality.caution.length + quality.risk.length;
    var afterCount = quality.caution.length + quality.risk.length;
    return '<section class="two-col"><article class="card"><div class="section-head"><h3>绯荤粺鑷姩鐞嗚В浜嗕粈涔?/h3><span>鍏堣嚜鍔ㄨ瘑鍒紝鍐嶅湪蹇呰鏃朵汉宸ュ厹搴?/span></div><div class="insight-grid"><div><strong>鑷姩璇嗗埆瀛楁</strong><p>宸茶嚜鍔ㄨ瘑鍒?' + state.mappingMeta.matchedFields.length + ' 涓垎鏋愬繀闇€瀛楁銆?/p></div><div><strong>浣庣疆淇″瓧娈?/strong><p>' + (state.mappingMeta.lowConfidenceFields.length || 0) + ' 涓瓧娈靛缓璁汉宸ュ鏍搞€?/p></div><div><strong>鏈娇鐢ㄥ瓧娈?/strong><p>' + (state.mappingMeta.unmappedHeaders.length || 0) + ' 涓簮瀛楁鏈繘鍏ュ垎鏋愪富閾捐矾銆?/p></div><div><strong>褰撳墠寤鸿</strong><p>' + (quality.confidence.label === "楂? ? "褰撳墠鍒嗘瀽鍙俊搴﹁緝楂橈紝鍙洿鎺ョ敤浜庢紨绀轰笌姹囨姤銆? : "寤鸿甯︾潃椋庨櫓鎻愮ず缁х画浣跨敤锛屽苟浼樺厛澶嶆牳鏍囪瀛楁銆?) + '</p></div></div></article><article class="card"><div class="section-head"><h3>鍒嗘瀽鍙俊搴?/h3><span>绯荤粺鑷姩淇鍚庯紝杩欎唤缁撴灉鏈夊鍙俊</span></div><div class="confidence-score"><strong>' + quality.confidence.score + '</strong><span>' + quality.confidence.label + ' 鍙俊搴?/span></div>' + renderBars([{ label: "宸茶嚜鍔ㄤ慨澶?, value: quality.autoFixed.length, color: "var(--success)" }, { label: "闇€璋ㄦ厧瑙ｈ", value: quality.caution.length, color: "var(--warning)" }, { label: "浼氬奖鍝嶅垽鏂?, value: quality.risk.length, color: "var(--danger)" }]) + '</article></section>' +
      '<section class="issues-layout"><article class="card"><div class="section-head"><h3>鏁版嵁闂涓績</h3><span>鑷姩淇 / 闇€纭 / 浠呮彁閱?/span></div><div class="tabs"><button class="tab ' + (currentTab === "autoFixed" ? "active" : "") + '" data-health-tab="autoFixed">宸茶嚜鍔ㄤ慨澶嶏紙' + quality.autoFixed.length + '锛?/button><button class="tab ' + (currentTab === "caution" ? "active" : "") + '" data-health-tab="caution">闇€璋ㄦ厧瑙ｈ锛? + quality.caution.length + '锛?/button><button class="tab ' + (currentTab === "risk" ? "active" : "") + '" data-health-tab="risk">鍏抽敭椋庨櫓锛? + quality.risk.length + '锛?/button></div><table class="data-table compact"><thead><tr><th>闂</th><th>瀛楁</th><th>鍛樺伐</th><th>鎿嶄綔寤鸿</th></tr></thead><tbody>' + (issueRows.length ? issueRows.map(function (item, index) { return '<tr class="' + (state.selectedHealthIndex === index ? "table-row-active" : "") + '" data-health-index="' + index + '"><td>' + safe(item.title) + '</td><td>' + safe(item.field) + '</td><td>' + safe(item.employeeId) + '</td><td>' + safe(currentTab === "autoFixed" ? "宸茬撼鍏ユ竻娲楄鍥? : currentTab === "caution" ? "寤鸿澶嶆牳鍙ｅ緞" : "浼樺厛浜哄伐纭") + '</td></tr>'; }).join("") : '<tr><td colspan="4"><div class="empty-state compact-empty">褰撳墠鍒嗙被鏆傛棤闂銆?/div></td></tr>') + '</tbody></table></article><article class="card drawer"><div class="section-head"><h3>闂璇︽儏鎶藉眽</h3><span>' + safe(selectedIssue ? healthTabLabel(currentTab) : "鏆傛棤闂") + '</span></div>' + (selectedIssue ? '<div class="drawer-title">' + safe(selectedIssue.title) + '</div><div class="meta-list"><span>瀛楁锛? + safe(selectedIssue.field) + '</span><span>鍛樺伐锛? + safe(selectedIssue.employeeId) + '</span><span>鏉ユ簮琛岋細' + safe(selectedIssue.row) + '</span></div><div class="insight-line"><strong>闂璇存槑</strong><p>' + safe(selectedIssue.detail) + '</p></div><div class="insight-line"><strong>寤鸿鍔ㄤ綔</strong><p>' + safe(currentTab === "autoFixed" ? "璇ラ棶棰樺凡杩涘叆鑷姩娓呮礂瑙嗗浘锛屽彲鐩存帴缁х画鍒嗘瀽銆? : currentTab === "caution" ? "寤鸿浜哄伐纭瀛楁鍙ｅ緞鎴栦笟鍔¤В閲婏紝鍐嶅喅瀹氭槸鍚﹀奖鍝嶆渶缁堟眹鎶ョ粨璁恒€? : "寤鸿浼樺厛浜哄伐纭锛屽洜涓哄畠鍙兘鐩存帴褰卞搷缁т换銆佹綔鍔涙垨绠＄悊鍒ゆ柇銆?) + '</p></div><div class="insight-line"><strong>褰卞搷绾у埆</strong><p>' + safe(currentTab === "risk" ? "楂橈細寤鸿鍦ㄦ眹鎶ヤ腑鏄惧紡鎻愰啋銆? : currentTab === "caution" ? "涓細涓嶉樆鏂垎鏋愶紝浣嗕細褰卞搷灞€閮ㄧ簿搴︺€? : "浣庯細绯荤粺宸插鐞嗗畬鎴愩€?) + '</p></div>' : '<div class="empty-state">褰撳墠鍒嗙被鏆傛棤闂銆?/div>') + '</article></section>' +
      '<section class="section-grid-2"><article class="card"><div class="section-head"><h3>娓呮礂鍓嶅悗瀵规瘮</h3><span>鑷姩娓呮礂鏄惁鏀瑰杽浜嗗垎鏋愬彲淇″害</span></div><div class="compare-strip"><div><span>娓呮礂鍓嶉棶棰橀噺</span><strong>' + beforeCount + '</strong></div><div><span>娓呮礂鍚庡緟鍏虫敞</span><strong>' + afterCount + '</strong></div><div><span>鑷姩澶勭悊瀹屾垚</span><strong>' + quality.autoFixed.length + '</strong></div></div><div class="button-row push-top"><button class="btn ' + (state.cleaningView === "after" ? "btn-primary" : "btn-secondary") + '" data-cleaning-view="after">鏌ョ湅娓呮礂鍚庤鍥?/button><button class="btn ' + (state.cleaningView === "before" ? "btn-primary" : "btn-secondary") + '" data-cleaning-view="before">鍥炵湅鍘熷闂</button></div><div class="priority-card"><strong>' + safe(state.cleaningView === "after" ? "褰撳墠灞曠ず鐨勬槸鑷姩娓呮礂鍚庣殑鍒嗘瀽瑙嗗浘銆? : "褰撳墠灞曠ず鐨勬槸鍘熷闂瑙嗚锛岀敤浜庤鏄庣郴缁熻瘑鍒埌浜嗕粈涔堛€?) + '</strong><p>' + safe(state.cleaningView === "after" ? "杩欓€傚悎鍦ㄩ潰璇曚腑寮鸿皟鈥滅郴缁熷凡缁忓府鎴戞妸鏁版嵁鍑嗗濂解€濄€? : "杩欓€傚悎鍦ㄩ潰璇曚腑瑙ｉ噴鈥滃師濮嬫暟鎹负浠€涔堜笉鑳界洿鎺ユ嬁鏉ュ仛鍒ゆ柇鈥濄€?) + '</p></div></article><article class="card"><div class="section-head"><h3>鎵归噺澶勭悊寤鸿</h3><span>涓嬩竴姝ユ渶鍊煎緱鎺ㄨ繘鐨勫鐞嗗姩浣?/span></div><div class="priority-card"><strong>鑷姩淇绫?/strong><p>缁х画娌跨敤绯荤粺鑷姩娓呮礂缁撴灉锛屼笉蹇呰鐢ㄦ埛鎵嬪伐鍥炲～绌烘牸銆佹棩鏈熷拰閲嶅鍊笺€?/p></div><div class="priority-card"><strong>闇€纭绫?/strong><p>浼樺厛澶嶆牳娼滃姏缂哄け銆侀儴闂ㄥ埆鍚嶄笌骞撮緞寮傚父锛岃繖浜涢棶棰樻渶瀹规槗褰卞搷楂樻綔涓庨儴闂ㄥ姣旂粨璁恒€?/p></div><div class="priority-card"><strong>鍏抽敭椋庨櫓绫?/strong><p>浼樺厛纭 manager_id銆佸叧閿矖浣嶆棤鍚庡銆佸噯澶囧害鍐茬獊锛岃繖浜涢棶棰樹細鐩存帴褰卞搷缁т换鍒ゆ柇銆?/p></div></article></section>';
  }

  function renderProfile(rows) {
    var employee = findEmployee(state.selectedEmployeeId) || rows.slice().sort(function (a, b) { return b.shl.score - a.shl.score; })[0];
    if (!employee) {
      return '<section class="card"><div class="empty-state">褰撳墠娌℃湁鍙睍绀虹殑鍛樺伐鐢诲儚銆?/div></section>';
    }

    return '<section class="executive-summary card"><div class="executive-main"><div class="tag">Employee Profile</div><h2>' + safe(employee.name + "锝? + employee.position_title) + '</h2><p>' + safe(employee.department + " / " + employee.city + " / " + employee.job_level) + '</p><div class="summary-kpis"><div><span>缁╂晥 / 娼滃姏</span><strong>' + safe(employee.performance_current + " / " + (employee.potential_level || "寰呰ˉ鍏?)) + '</strong></div><div><span>缁т换鍑嗗搴?/span><strong>' + safe(readinessText(employee.succession.band)) + '</strong></div><div><span>鍏抽敭韬唤</span><strong>' + safe(employee.critical_role_flag === "Y" ? "鍏抽敭宀椾綅浜烘墠" : "鏅€氬矖浣嶄汉鎵?) + '</strong></div></div></div><div class="executive-side"><div class="summary-point"><strong>楂樻綔鍒ゆ柇</strong><span>' + safe(hipoSummary(employee)) + '</span></div><div class="summary-point"><strong>鍩瑰吇寤鸿</strong><span>' + safe(developmentAdvice(employee)) + '</span></div><div class="summary-point"><strong>椋庨櫓鎻愰啋</strong><span>' + safe(employee.riskTags.length ? employee.riskTags.join("銆?) : "褰撳墠鏃犳樉钁楅闄╂爣绛俱€?) + '</span></div></div></section>' +
      '<section class="grid-kpi"><article class="card kpi-card"><span>SHL 缁煎悎鍒?/span><strong>' + safe(employee.shl.score) + '</strong></article><article class="card kpi-card"><span>瀛︿範鏁忔嵎搴?/span><strong>' + safe(employee.shl.learning) + '</strong></article><article class="card kpi-card"><span>棰嗗椹卞姩鍔?/span><strong>' + safe(employee.shl.leadership) + '</strong></article><article class="card kpi-card"><span>浜洪檯褰卞搷鍔?/span><strong>' + safe(employee.shl.influence) + '</strong></article></section>' +
      '<section class="section-grid-2"><article class="card"><div class="section-head"><h3>SHL 鍥涚淮琛ㄧ幇</h3><span>楂樻綔璇嗗埆鐨勬牳蹇冧緷鎹?/span></div>' + renderBars([{ label: "瀛︿範鏁忔嵎搴?, value: employee.shl.learning, color: "var(--primary)" }, { label: "棰嗗椹卞姩鍔?, value: employee.shl.leadership, color: "var(--success)" }, { label: "浜洪檯褰卞搷鍔?, value: employee.shl.influence, color: "#4a7cff" }, { label: "鎴樼暐璁ょ煡", value: employee.shl.strategic, color: "var(--warning)" }]) + '</article><article class="card"><div class="section-head"><h3>缁т换涓庡彂灞曞缓璁?/h3><span>涓轰粈涔堥€傚悎鎴栦笉閫傚悎鎺ョ彮</span></div><div class="insight-line"><strong>缁т换瑙嗚</strong><p>' + safe(successionSummary(employee)) + '</p></div><div class="insight-line"><strong>鍊欓€夎韩浠?/strong><p>' + safe(employee.successor_nomination_flag === "Y" ? "宸茶繘鍏ュ悗澶囧悕鍗曪紝鍙綔涓虹户浠绘闃熻杩版牱鏈€? : "鐩墠鏈繘鍏ユ槑纭悗澶囧悕鍗曪紝閫傚悎璇存槑璇嗗埆鐩插尯鎴栧煿鍏荤己鍙ｃ€?) + '</p></div><div class="insight-line"><strong>鍙戝睍鍔ㄤ綔</strong><p>' + safe(developmentAdvice(employee)) + '</p></div></article></section>' +
      '<section class="section-grid-2"><article class="card"><div class="section-head"><h3>鍘嗗彶瓒嬪娍</h3><span>鐢ㄤ簬璁茶堪鍙樺寲锛岃€屼笉鏄彧鐪嬪綋鍓嶇偣浣?/span></div><div class="priority-card"><strong>缁╂晥瓒嬪娍</strong><p>' + safe("鍘诲勾缁╂晥 " + employee.performance_last_year + "锛屽綋鍓嶇哗鏁?" + employee.performance_current + "锛屽彲鐢ㄦ潵璇存槑琛ㄧ幇鏄惁绋冲畾鎻愬崌銆?) + '</p></div><div class="priority-card"><strong>鍑嗗搴﹁秼鍔?/strong><p>' + safe(employee.succession.band === "Ready Now" ? "宸茬粡鎺ヨ繎鍙帴浠荤姸鎬侊紝寤鸿灏藉揩鍋氬矖浣嶆牎楠屻€? : "浠嶅浜庡噯澶囬樁娈碉紝鏇撮€傚悎瀹夋帓鍏抽敭缁忛獙涓庡甫浜轰换鍔°€?) + '</p></div></article><article class="card"><div class="section-head"><h3>鍥炲埌涓婚摼璺?/h3><span>鎶婄敾鍍忛噸鏂版斁鍥炵粍缁囪瘖鏂笂涓嬫枃</span></div><div class="button-row"><a class="btn btn-secondary" href="#review">鍥炲埌浜烘墠鐩樼偣</a><a class="btn btn-secondary" href="#succession">鍥炲埌缁т换鍒嗘瀽</a><a class="btn btn-primary" href="#report">鐢ㄤ簬姹囨姤寮曠敤</a></div><div class="insight-line"><strong>閫傚悎鎬庝箞璁?/strong><p>' + safe("鍏堣姝や汉鐨勫綋鍓嶈〃鐜帮紝鍐嶈涓轰粈涔堣璇嗗埆涓洪珮娼滄垨涓轰粈涔堝皻鏈?ready锛屾渶鍚庤惤鍒扮粍缁囧眰闈㈢殑鍩瑰吇寤鸿銆?) + '</p></div></article></section>';
  }

  function renderReport(rows) {
    var summary = executiveSummary(rows);
    var actions = actionPlan(summary);
    var signals = predictSignals(rows, summary);
    var whyText = summary.issues.slice(0, 2).map(function (item) { return item.detail; }).join(" ");
    return '<section class="report-hero card"><div class="tag">濮瑰洦濮ゅ蹇氱翻閸?/div><h2>閻滄壆濮?閳?閸樼喎娲?閳?妞嬪酣娅?閳?瀵ら缚顔?閳?娴兼ê鍘涢崝銊ょ稊</h2><p>鏉╂瑤绔存い鐢垫畱閻╊喗鐖ｆ稉宥嗘Ц閸ユ崘銆冮弨鍓佹捈閿涘矁鈧本妲哥拋鈺€缍橀崣顖欎簰閻╁瓨甯撮幏鎸庢降閸嬫岸娼扮拠鏇炵潔缁€鐑樺灗閸氭垳绗傚Ч鍥ㄥГ閵?/p><div class="button-row"><button class="btn btn-primary" data-action="download-report">娑撳娴囬幗妯款洣</button><a class="btn btn-secondary" href="#overview">鏉╂柨娲栭幀鏄忣潔</a></div></section>' +
      '<section class="executive-summary card"><div class="executive-main"><div class="tag">Executive Summary</div><h2>' + safe(summary.headline) + '</h2><p>' + safe(summary.priority) + '</p><div class="summary-kpis"><div><span>妞嬪酣娅撶粵澶岄獓</span><strong>' + safe(summary.riskLevel) + '</strong></div><div><span>閺嶇绺鹃崝銊ょ稊</span><strong>' + safe(actions.now[0] || summary.priority) + '</strong></div></div></div><div class="executive-side">' + summary.issues.slice(0, 3).map(function (item) { return '<div class="summary-point"><strong>' + safe(item.title) + '</strong><span>' + safe(item.detail) + '</span></div>'; }).join("") + '</div></section>' +
      '<section class="section-grid-3"><article class="card"><div class="section-head"><h3>Current State閿濇粌缍嬮崜宥囧Ц閹?/h3><span>閻滄澘婀崣鎴犳晸娴滃棔绮堟稊?/span></div><p>' + safe(summary.state) + '</p></article><article class="card"><div class="section-head"><h3>Why It Is Happening閿濇粌甯崶?/h3><span>娑撹桨绮堟稊鍫滅窗鏉╂瑦鐗?/span></div><p>' + safe(whyText || summary.priority) + '</p></article><article class="card"><div class="section-head"><h3>What May Happen Next閿濇粓顥撻梽?/h3><span>閹恒儰绗呴弶銉ュ讲閼宠棄褰傞悽鐔剁矆娑?/span></div><p>' + safe((signals[0] || "") + " " + (signals[1] || "")) + '</p></article></section>' +
      '<section class="section-grid-2"><article class="card"><div class="section-head"><h3>What To Do Now閿濇粎骞囬崷銊︹偓搴濈疄閸?/h3><span>缁斿宓嗛崣顖涘⒔鐞涘瞼娈戦崝銊ょ稊</span></div>' + actions.now.map(function (text) { return '<div class="priority-card"><strong>' + safe(text) + '</strong><p>鏉╂瑩銆嶉崝銊ょ稊閸欘垳鏁ゆ禍搴濈喘閸忓牏菙娴ｅ繐缍嬮崜宥囨畱閸忔娊鏁畝妞剧秴鐟曞棛娲婇崪灞剧壋韫囧啩姹夐幍宥勭返缂佹瑣鈧?/p></div>'; }).join("") + '</article><article class="card"><div class="section-head"><h3>Priority Actions閿濇粈绱崗鍫濆З娴?/h3><span>閹稿妞傞梻瀛樺腹鏉╂稓娈戦幒褍鍩楃拋鈥冲灊</span></div><div class="time-list"><div><strong>0-3 娑擃亝婀€</strong><p>' + safe(actions.now.join(" ")) + '</p></div><div><strong>3-6 娑擃亝婀€</strong><p>' + safe(actions.soon.join(" ")) + '</p></div><div><strong>6-12 娑擃亝婀€</strong><p>' + safe(actions.later.join(" ")) + '</p></div></div></article></section>' +
      '<section class="card"><div class="section-head"><h3>闁插秶鍋ｉ梻顕€顣介崡锛勫</h3><span>閻滄媽钖勯妴渚€顥撻梽鈹库偓浣哥紦鐠侇喕绔村▎陇顔夊〒?/span></div>' + summary.issues.map(function (item, idx) { return '<div class="priority-card"><strong>' + safe((idx + 1) + ". " + item.title) + '</strong><p><b>閻滄媽钖勯敍?/b>' + safe(item.detail) + '</p><p><b>妞嬪酣娅撻敍?/b>' + safe(signals[idx] || item.predict || signals[0] || "") + '</p><p><b>瀵ら缚顔呴敍?/b>' + safe(item.actionNow || actions.now[0] || "") + '</p></div>'; }).join("") + '</section>';
    var summary = executiveSummary(rows);
    var actions = actionPlan();
    return '<section class="report-hero card"><div class="tag">姹囨姤寮忚緭鍑?/div><h2>鐜扮姸 鈫?鍘熷洜 鈫?椋庨櫓 鈫?寤鸿 鈫?浼樺厛鍔ㄤ綔</h2><p>杩欎竴椤电殑鐩爣涓嶆槸鍥捐〃鏀剁撼锛岃€屾槸璁╀綘鍙互鐩存帴鎷挎潵鍋氶潰璇曞睍绀烘垨鍚戜笂姹囨姤銆?/p><div class="button-row"><button class="btn btn-primary" data-action="download-report">涓嬭浇鎽樿</button><a class="btn btn-secondary" href="#overview">杩斿洖鎬昏</a></div></section>' +
      '<section class="executive-summary card"><div class="executive-main"><div class="tag">Executive Summary</div><h2>' + safe(summary.headline) + '</h2><p>' + safe(summary.priority) + '</p><div class="summary-kpis"><div><span>椋庨櫓绛夌骇</span><strong>' + summary.riskLevel + '</strong></div><div><span>鏍稿績鍔ㄤ綔</span><strong>鍏堟牳楠屻€佸啀淇濈暀銆佸啀鍔犻€熷煿鍏汇€?/strong></div></div></div><div class="executive-side">' + summary.issues.slice(0, 3).map(function (item) { return '<div class="summary-point"><strong>' + safe(item.title) + '</strong><span>' + safe(item.detail) + '</span></div>'; }).join("") + '</div></section>' +
      '<section class="section-grid-3"><article class="card"><div class="section-head"><h3>Current State锝滃綋鍓嶇姸鎬?/h3><span>鐜板湪鍙戠敓浜嗕粈涔?/span></div><p>' + safe(summary.state) + '</p></article><article class="card"><div class="section-head"><h3>Why It Is Happening锝滃師鍥?/h3><span>涓轰粈涔堜細杩欐牱</span></div><p>' + safe(summary.issues[0].detail) + " " + safe(summary.issues[1].detail) + '</p></article><article class="card"><div class="section-head"><h3>What May Happen Next锝滈闄?/h3><span>鎺ヤ笅鏉ュ彲鑳藉彂鐢熶粈涔?/span></div><p>' + safe(predictSignals(rows)[0]) + " " + safe(predictSignals(rows)[1]) + '</p></article></section>' +
      '<section class="section-grid-2"><article class="card"><div class="section-head"><h3>What To Do Now锝滅幇鍦ㄦ€庝箞鍋?/h3><span>绔嬪嵆鍙墽琛岀殑鍔ㄤ綔</span></div><div class="priority-card"><strong>浼樺厛鏍搁獙鏈€鏆撮湶宀椾綅鐨勫悗澶囦汉閫夈€?/strong><p>涓嶈绛夊矖浣嶇湡姝ｇ┖鍑烘潵锛屽啀鍘婚獙璇佸€欓€変汉鐨勫噯澶囧害銆?/p></div><div class="priority-card"><strong>浼樺厛绋充綇楂橀闄╅珮缁╂晥浜虹兢銆?/strong><p>褰撶鑱岄闄╀笌鏉垮嚦椋庨櫓閲嶅彔鏃讹紝淇濈暀鍔ㄤ綔鐨勪环鍊兼渶楂樸€?/p></div><div class="priority-card"><strong>鎶婇珮娼滄寮忔斁杩涘彂灞曡矾寰勩€?/strong><p>鐮斿彂鍜屼骇鍝佷腑鐨勬綔鍦ㄧ鐞嗚€咃紝闇€瑕佷粠鈥滆鐪嬭鈥濇帹杩涘埌鈥滆鍩瑰吇鈥濄€?/p></div></article><article class="card"><div class="section-head"><h3>Priority Actions锝滀紭鍏堝姩浣?/h3><span>鎸夋椂闂存帹杩涚殑鎺у埗璁″垝</span></div><div class="time-list"><div><strong>0-3 涓湀</strong><p>' + safe(actions.now.join(" ")) + '</p></div><div><strong>3-6 涓湀</strong><p>' + safe(actions.soon.join(" ")) + '</p></div><div><strong>6-12 涓湀</strong><p>' + safe(actions.later.join(" ")) + '</p></div></div></article></section>' +
      '<section class="card"><div class="section-head"><h3>閲嶇偣闂鍗＄墖</h3><span>鐜拌薄銆侀闄┿€佸缓璁竴娆¤娓?/span></div>' + summary.issues.map(function (item, idx) { return '<div class="priority-card"><strong>' + (idx + 1) + ". " + safe(item.title) + '</strong><p><b>鐜拌薄锛?/b>' + safe(item.detail) + '</p><p><b>椋庨櫓锛?/b>' + safe(predictSignals(rows)[idx] || predictSignals(rows)[0]) + '</p><p><b>寤鸿锛?/b>' + safe((idx < 2 ? actions.now[0] : idx === 2 ? actions.soon[0] : actions.later[0])) + '</p></div>'; }).join("") + '</section>';
  }

  function renderShell() {
    var rows = currentRows();
    return '<div class="shell"><aside class="sidebar"><div class="brand"><div class="brand-mark">TP</div><div><div class="brand-title">TalentPulse</div><div class="brand-sub">AI 浜烘墠鐩樼偣涓庣户浠诲垎鏋愪綔鍝?/div></div></div><nav class="nav">' + ROUTES.map(function (route) { return '<a class="nav-item ' + (state.route === route.key ? "active" : "") + '" href="#' + route.key + '">' + route.label + '</a>'; }).join("") + '</nav><div class="sidebar-foot"><div class="small-label">鏁版嵁鏉ユ簮</div><div class="sidebar-company">' + safe(state.sourceName) + '</div></div></aside><section class="main"><header class="topbar"><div><div class="page-eyebrow">鎻忚堪 鈫?瑙ｉ噴 鈫?棰勬祴 鈫?鎺у埗 鈫?姹囨姤</div><h1>' + safe(routeLabel(state.route)) + '</h1></div><div class="topbar-actions"><button class="btn btn-secondary" data-action="try-demo">浣撻獙 Demo</button><label class="btn btn-primary upload-inline">涓婁紶鍛樺伐鏁版嵁<input id="upload-input-top" type="file" accept=".csv,.xlsx" hidden></label></div></header><main class="content">' + (state.route === "home" ? renderHome() : state.route === "overview" ? renderOverview(rows) : state.route === "review" ? renderTalentReview(rows) : state.route === "succession" ? renderSuccession(rows) : state.route === "health" ? renderHealth() : state.route === "profile" ? renderProfile(rows) : renderReport(rows)) + '</main></section></div>';
  }

  function render() {
    app.innerHTML = renderShell();
    bindEvents();
  }

  function bindEvents() {
    Array.prototype.slice.call(document.querySelectorAll('[data-action="try-demo"]')).forEach(function (node) {
      node.onclick = function () {
        state.sourceName = "瀹樻柟 Demo";
        state.uploadMode = "demo";
        state.rawRows = demo.employees || [];
        state.mappingMeta = autoMapRows(state.rawRows);
        state.employees = cleanAndEnrich(state.mappingMeta.rows);
        state.quality = detectQuality(state.rawRows, state.employees, state.mappingMeta);
        state.selectedDepartment = "All";
        state.selectedJobLevel = "All";
        state.selectedNineBoxKey = "3-3";
        state.selectedEmployeeId = "";
        state.selectedRoleName = "";
        state.activeHealthTab = "risk";
        state.selectedHealthIndex = 0;
        state.cleaningView = "after";
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
    Array.prototype.slice.call(document.querySelectorAll('[data-action="open-profile"]')).forEach(function (node) {
      node.onclick = function () {
        state.route = "profile";
        window.location.hash = "profile";
        render();
      };
    });
    Array.prototype.slice.call(document.querySelectorAll("[data-role]")).forEach(function (node) {
      node.onclick = function () { state.selectedRoleName = node.getAttribute("data-role"); render(); };
    });
    Array.prototype.slice.call(document.querySelectorAll("[data-ninebox]")).forEach(function (node) {
      node.onclick = function () {
        state.selectedNineBoxKey = node.getAttribute("data-ninebox");
        state.selectedEmployeeId = "";
        render();
      };
    });
    Array.prototype.slice.call(document.querySelectorAll("[data-health-tab]")).forEach(function (node) {
      node.onclick = function () {
        state.activeHealthTab = node.getAttribute("data-health-tab");
        state.selectedHealthIndex = 0;
        render();
      };
    });
    Array.prototype.slice.call(document.querySelectorAll("[data-health-index]")).forEach(function (node) {
      node.onclick = function () {
        state.selectedHealthIndex = Number(node.getAttribute("data-health-index") || 0);
        render();
      };
    });
    Array.prototype.slice.call(document.querySelectorAll("[data-cleaning-view]")).forEach(function (node) {
      node.onclick = function () {
        state.cleaningView = node.getAttribute("data-cleaning-view");
        render();
      };
    });
    var departmentFilter = document.querySelector('[data-filter="department"]');
    if (departmentFilter) {
      departmentFilter.onchange = function (event) {
        state.selectedDepartment = event.target.value;
        state.selectedEmployeeId = "";
        render();
      };
    }
    var levelFilter = document.querySelector('[data-filter="jobLevel"]');
    if (levelFilter) {
      levelFilter.onchange = function (event) {
        state.selectedJobLevel = event.target.value;
        state.selectedEmployeeId = "";
        render();
      };
    }
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
    state.uploadNote = /\.xlsx$/i.test(file.name) ? "褰撳墠鐜鏈垚鍔熷姞杞?XLSX 瑙ｆ瀽鍣紝CSV 鍙洿鎺ヤ娇鐢紱閮ㄧ讲鍒扮嚎涓婂悗 XLSX 鍙甯歌В鏋愩€? : "鏆備笉鏀寔璇ユ枃浠剁被鍨嬶紝璇蜂笂浼?CSV 鎴?XLSX銆?;
    render();
  }

  function parseCsv(text) {
    function splitDelimitedLine(line, delimiter) {
      var cells = [];
      var current = "";
      var inQuotes = false;
      var i = 0;
      for (i = 0; i < line.length; i += 1) {
        var char = line[i];
        var next = line[i + 1];
        if (char === '"') {
          if (inQuotes && next === '"') {
            current += '"';
            i += 1;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === delimiter && !inQuotes) {
          cells.push(current);
          current = "";
        } else {
          current += char;
        }
      }
      cells.push(current);
      return cells;
    }

    function detectDelimiter(source) {
      var firstLine = String(source || "").replace(/^\uFEFF/, "").split(/\r?\n/).filter(function (line) {
        return String(line || "").trim();
      })[0] || "";
      var candidates = [",", "\t", ";", "|"];
      var best = ",";
      var bestCount = 0;
      candidates.forEach(function (delimiter) {
        var count = splitDelimitedLine(firstLine, delimiter).length;
        if (count > bestCount) {
          best = delimiter;
          bestCount = count;
        }
      });
      return best;
    }

    var source = String(text || "").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    if (!source.trim()) return [];
    var delimiter = detectDelimiter(source);
    var rows = [];
    var row = [];
    var field = "";
    var inQuotes = false;
    var i = 0;

    for (i = 0; i < source.length; i += 1) {
      var char = source[i];
      var next = source[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        row.push(field);
        field = "";
      } else if (char === "\n" && !inQuotes) {
        row.push(field);
        if (row.some(function (item) { return String(item || "").trim() !== ""; })) rows.push(row);
        row = [];
        field = "";
      } else {
        field += char;
      }
    }

    row.push(field);
    if (row.some(function (item) { return String(item || "").trim() !== ""; })) rows.push(row);
    if (!rows.length) return [];

    var headers = rows[0].map(function (item) { return String(item || "").trim(); });
    return rows.slice(1).filter(function (values) {
      return values.some(function (item) { return String(item || "").trim() !== ""; });
    }).map(function (values) {
      var item = {};
      headers.forEach(function (header, index) {
        item[header] = values[index] != null ? String(values[index]).trim() : "";
      });
      return item;
    });
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
    if (!rows || !rows.length) {
      state.uploadNote = "閺堫亣鐦戦崚顐㈠煂閸欘垳鏁ら惃鍕殶閹诡喛顢戦敍宀冾嚞濡偓閺屻儴銆冩径娣偓浣稿瀻闂呮梻顑侀幋鏍纯閹恒儰缍嬫灞界暭閺?Demo 閺屻儳婀呴崣鍌濃偓鍐╃壐瀵繈鈧?";
      state.route = "home";
      window.location.hash = "home";
      render();
      return;
    }

    state.sourceName = filename;
    state.uploadMode = "upload";
    state.rawRows = rows;
    state.mappingMeta = autoMapRows(rows);
    state.employees = cleanAndEnrich(state.mappingMeta.rows);
    state.quality = detectQuality(rows, state.employees, state.mappingMeta);
    state.selectedDepartment = "All";
    state.selectedJobLevel = "All";
    state.selectedNineBoxKey = "3-3";
    state.selectedEmployeeId = "";
    state.selectedRoleName = "";
    state.selectedHealthIndex = 0;
    state.cleaningView = "after";
    state.activeHealthTab = state.quality.risk.length ? "risk" : state.quality.caution.length ? "caution" : "autoFixed";

    var shouldCheckHealth = state.quality.confidence.score < 78 || state.quality.risk.length >= 8 || state.mappingMeta.lowConfidenceFields.length >= 3;
    state.uploadNote = shouldCheckHealth
      ? "缁崵绮哄鑼跺殰閸斻劏鐦戦崚顐㈢摟濞堢偣鈧礁鐣幋鎰邦浕鏉烆喗绔诲ú妤嬬礉娴ｅ棔绮涢張澶夌娴滄稐缍嗙純顔讳繆閹存牠鐝搴ㄦ珦妞ょ櫢绱濆鎻掑帥鐢缚缍樻潻娑樺弳閳ユ粍鏆熼幑顔间淮鎼村皝鈧繈銆夐妴?";
      : "缁崵绮哄鑼跺殰閸斻劏鐦戦崚顐㈢摟濞堥潧鑻熺€瑰本鍨氬〒鍛閿涘苯缍嬮崜宥呭讲娣団€冲鐡掑厖浜掗惄瀛樺复鏉╂稑鍙嗛幀鏄忣潔鐠佽尙绮ㄧ拋鎭掆偓?";
    state.route = shouldCheckHealth ? "health" : "overview";
    window.location.hash = state.route;
    render();
    return;
    state.sourceName = filename;
    state.uploadMode = "upload";
    state.rawRows = rows;
    state.mappingMeta = autoMapRows(rows);
    state.employees = cleanAndEnrich(state.mappingMeta.rows);
    state.quality = detectQuality(rows, state.employees, state.mappingMeta);
    state.selectedDepartment = "All";
    state.selectedJobLevel = "All";
    state.selectedNineBoxKey = "3-3";
    state.selectedEmployeeId = "";
    state.selectedRoleName = "";
    state.activeHealthTab = "risk";
    state.selectedHealthIndex = 0;
    state.cleaningView = "after";
    state.uploadNote = "绯荤粺宸茶嚜鍔ㄨ瘑鍒瓧娈靛苟鐩存帴杩涘叆鍒嗘瀽锛屽彧鏈夎瘑鍒笉纭畾鏃舵墠闇€瑕佷汉宸ュ厹搴曠‘璁ゃ€?;
    state.route = "overview";
    window.location.hash = "overview";
    render();
  }

  function downloadReport() {
    var summary = executiveSummary(state.employees);
    var actions = actionPlan(summary);
    var content = [
      "TalentPulse 濮瑰洦濮ら幗妯款洣",
      "",
      "娑撯偓閵嗕礁缍嬮崜宥囧Ц閹?",
      summary.state,
      "",
      "娴滃被鈧線鍣搁悙褰掓６妫?",
      summary.issues.map(function (item) { return "- " + item.title + "閿? + item.detail; }).join("\n"),
      "",
      "娑撳鈧焦婀弶銉╊棑闂?",
      predictSignals(state.employees, summary).map(function (item) { return "- " + item; }).join("\n"),
      "",
      "閸ユ稏鈧椒绱崗鍫濆З娴?",
      "- 0-3 娑擃亝婀€閿? + actions.now.join(" "),
      "- 3-6 娑擃亝婀€閿? + actions.soon.join(" "),
      "- 6-12 娑擃亝婀€閿? + actions.later.join(" ")
    ].join("\n");
    var blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "talentpulse-report-summary.txt";
    link.click();
    URL.revokeObjectURL(url);
    return;
    var summary = executiveSummary(state.employees);
    var actions = actionPlan();
    var content = [
      "TalentPulse 姹囨姤鎽樿",
      "",
      "涓€銆佸綋鍓嶇姸鎬?,
      summary.state,
      "",
      "浜屻€侀噸鐐归棶棰?,
      summary.issues.map(function (item) { return "- " + item.title + "锛? + item.detail; }).join("\n"),
      "",
      "涓夈€佹湭鏉ラ闄?,
      predictSignals(state.employees).map(function (item) { return "- " + item; }).join("\n"),
      "",
      "鍥涖€佷紭鍏堝姩浣?,
      "- 0-3 涓湀锛? + actions.now.join(" "),
      "- 3-6 涓湀锛? + actions.soon.join(" "),
      "- 6-12 涓湀锛? + actions.later.join(" ")
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
    state.route = ROUTES.some(function (route) { return route.key === hash; }) || hash === "profile" ? hash : "home";
    render();
  }

  function boot() {
    state.mappingMeta = autoMapRows(state.rawRows);
    state.employees = cleanAndEnrich(state.mappingMeta.rows);
    state.quality = detectQuality(state.rawRows, state.employees, state.mappingMeta);
    window.addEventListener("hashchange", syncRoute);
    window.addEventListener("error", function (event) {
      app.innerHTML = '<div class="card empty-state"><h3>杩愯閿欒</h3><p style="color:#6b7280">' + safe(event.message || "鏈煡閿欒") + '</p></div>';
    });
    syncRoute();
  }

  boot();
})();
