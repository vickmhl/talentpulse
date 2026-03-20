window.TALENTPULSE_DEMO = {
  employees: [
    {
      employee_id: "NE0001",
      name: "Avery Chen",
      gender: "Male",
      age: 27,
      department: "CEO Office / Strategy Office",
      sub_department: "Strategy Planning",
      position_title: "Head of Strategy",
      job_family: "Strategy",
      job_level: "D1",
      manager_id: "CEO-0001",
      tenure_years: 1,
      hire_date: "2017-02-01",
      city: "Shanghai",
      performance_current: "B",
      performance_last_year: "C",
      potential_level: "High",
      training_completion_rate: 66,
      promotion_count: 2,
      mobility_flag: "N",
      critical_role_flag: "Y",
      successor_nomination_flag: "Y",
      readiness_level: "Ready in 2-3 Years",
      flight_risk: "High",
      manager_recommendation: "Observe",
      engagement_score: 75,
      salary_band: "A3"
    },
    {
      employee_id: "NE0002",
      name: "Blake Chen",
      gender: "Female",
      age: 30,
      department: "CEO Office / Strategy Office",
      sub_department: "Investment Ops",
      position_title: "Chief of Staff",
      job_family: "Executive",
      job_level: "M2",
      manager_id: "CEO-0001",
      tenure_years: 1.7,
      hire_date: "2017-03-04",
      city: "Beijing",
      performance_current: "A",
      performance_last_year: "A",
      potential_level: "Low",
      training_completion_rate: 77,
      promotion_count: 0,
      mobility_flag: "Y",
      critical_role_flag: "Y",
      successor_nomination_flag: "N",
      readiness_level: "Ready Now",
      flight_risk: "Medium",
      manager_recommendation: "Strongly Recommend",
      engagement_score: 88,
      salary_band: "B1"
    },
    {
      employee_id: "NE0003",
      name: "Casey Chen",
      gender: "Male",
      age: 33,
      department: "CEO Office / Strategy Office",
      sub_department: "Strategy Planning",
      position_title: "Head of Strategy",
      job_family: "Strategy",
      job_level: "M2",
      manager_id: "CEO-0001",
      tenure_years: 2.4,
      hire_date: "2017-04-04",
      city: "Shanghai",
      performance_current: "B",
      performance_last_year: "B+",
      potential_level: "Medium",
      training_completion_rate: 88,
      promotion_count: 2,
      mobility_flag: "N",
      critical_role_flag: "Y",
      successor_nomination_flag: "Y",
      readiness_level: "Ready in 2-3 Years",
      flight_risk: "Low",
      manager_recommendation: "Recommend",
      engagement_score: 65,
      salary_band: "C2"
    },
    {
      employee_id: "NE0004",
      name: "Dylan Chen",
      gender: "Female",
      age: 36,
      department: "CEO Office / Strategy Office",
      sub_department: "Investment Ops",
      position_title: "Chief of Staff",
      job_family: "Executive",
      job_level: "M1",
      manager_id: "NE0004",
      tenure_years: 3.1,
      hire_date: "2017-05-05",
      city: "Beijing",
      performance_current: "C",
      performance_last_year: "B",
      potential_level: "High",
      training_completion_rate: 99,
      promotion_count: 0,
      mobility_flag: "N",
      critical_role_flag: "N",
      successor_nomination_flag: "N",
      readiness_level: "Ready Now",
      flight_risk: "High",
      manager_recommendation: "Not Recommend",
      engagement_score: 78,
      salary_band: "D1"
    },
    {
      employee_id: "NE0005",
      name: "Elliot Chen",
      gender: "Male",
      age: 39,
      department: "Engineering Center",
      sub_department: "Backend",
      position_title: "Engineering Director",
      job_family: "Engineering",
      job_level: "D1",
      manager_id: "CEO-0001",
      tenure_years: 3.8,
      hire_date: "2017-06-05",
      city: "Shanghai",
      performance_current: "B+",
      performance_last_year: "C",
      potential_level: "High",
      training_completion_rate: 64,
      promotion_count: 2,
      mobility_flag: "Y",
      critical_role_flag: "Y",
      successor_nomination_flag: "Y",
      readiness_level: "Not Ready Yet",
      flight_risk: "Low",
      manager_recommendation: "Observe",
      engagement_score: 91,
      salary_band: "A2"
    }
  ],
  metadata: {
    company_name: "NovaEdge Technologies",
    product_name: "TalentPulse",
    employees_count: 300,
    departments: [
      "CEO Office / Strategy Office",
      "Product",
      "Engineering",
      "Sales",
      "Customer Success",
      "Operations",
      "Marketing",
      "HR",
      "Finance & Legal",
      "IT / Data Support"
    ]
  },
  guide: "# TalentPulse Demo Scenario Guide\n\n1. Start from overview and enter official demo data.\n2. Show import, mapping and data issue center.\n3. Explain nine-box, SHL potential and succession readiness.\n4. Use profile and report export to close the story.",
  insights: "# TalentPulse Expected Insights\n\n- Engineering: high potential, low ready-now bench.\n- Sales: high performance, high flight risk.\n- Operations: stable but low growth momentum.\n- Product: critical-role concentration.\n- Customer Success: missing potential identification.\n- HR / Finance / IT: small teams with high succession risk."
};

(function expandDemoData() {
  const seed = window.TALENTPULSE_DEMO.employees.slice();
  const departments = [
    ["Product", ["Platform Product", "Commercial Product", "Growth Product"], ["Product"], ["Shanghai", "Hangzhou", "Shenzhen"]],
    ["Engineering", ["Backend", "Frontend", "Data Platform", "QA", "Architecture"], ["Engineering", "Data"], ["Shanghai", "Hangzhou", "Chengdu"]],
    ["Sales", ["East Sales", "South Sales", "Enterprise Sales"], ["Sales"], ["Shanghai", "Shenzhen", "Beijing"]],
    ["Customer Success", ["Delivery", "Implementation", "Renewal"], ["Customer Success"], ["Shanghai", "Guangzhou", "Chengdu"]],
    ["Operations", ["Business Ops", "Process Ops", "Quality Ops"], ["Operations"], ["Shanghai", "Wuhan"]],
    ["Marketing", ["Brand", "Growth Marketing"], ["Marketing"], ["Shanghai", "Beijing"]],
    ["HR", ["Recruiting", "HRBP", "OD"], ["HR"], ["Shanghai"]],
    ["Finance & Legal", ["Finance", "Legal", "Compliance"], ["Finance", "Legal"], ["Shanghai"]],
    ["IT / Data Support", ["IT Support", "Data Governance", "BI"], ["IT", "Data"], ["Shanghai", "Suzhou"]]
  ];
  const perf = ["A", "B+", "B", "C"];
  const potential = ["High", "Medium", "Low"];
  const readiness = ["Ready Now", "Ready in 1-2 Years", "Ready in 2-3 Years", "Not Ready Yet"];
  const recommend = ["Strongly Recommend", "Recommend", "Observe", "Not Recommend"];
  const bands = ["A1", "A2", "A3", "B1", "B2", "C1", "C2", "D1"];
  const first = ["Avery", "Blake", "Casey", "Dylan", "Elliot", "Finley", "Harper", "Jamie", "Jordan", "Kai", "Logan", "Morgan", "Nova", "Parker", "Quinn", "Reese", "Riley", "Sawyer", "Taylor", "Wren"];
  const last = ["Chen", "Lin", "Wang", "Li", "Zhao", "Zhou", "Wu", "Xu", "Sun", "Liu", "He", "Gao", "Ma", "Hu", "Guo", "Tang"];
  const total = 300;
  for (let i = seed.length + 1; i <= total; i += 1) {
    const deptConf = departments[(i - 1) % departments.length];
    const department = deptConf[0];
    const subDepartment = deptConf[1][i % deptConf[1].length];
    const jobFamily = deptConf[2][i % deptConf[2].length];
    const city = deptConf[3][i % deptConf[3].length];
    const jobLevel = i % 31 === 0 ? "D1" : i % 13 === 0 ? "M2" : i % 7 === 0 ? "M1" : `P${(i % 5) + 1}`;
    const employee = {
      employee_id: `NE${String(i).padStart(4, "0")}`,
      name: `${first[i % first.length]} ${last[Math.floor(i / first.length) % last.length]}`,
      gender: i % 2 ? "Male" : "Female",
      age: 24 + ((i * 3) % 20),
      department,
      sub_department: subDepartment,
      position_title:
        jobFamily === "Engineering" ? (jobLevel.startsWith("M") || jobLevel === "D1" ? "Engineering Manager" : "Software Engineer") :
        jobFamily === "Product" ? (jobLevel.startsWith("M") || jobLevel === "D1" ? "Lead Product Manager" : "Product Manager") :
        jobFamily === "Sales" ? (jobLevel.startsWith("M") || jobLevel === "D1" ? "Sales Manager" : "Account Executive") :
        jobFamily === "Customer Success" ? (jobLevel.startsWith("M") || jobLevel === "D1" ? "Implementation Manager" : "Customer Success Consultant") :
        jobFamily === "Operations" ? (jobLevel.startsWith("M") || jobLevel === "D1" ? "Operations Manager" : "Operations Specialist") :
        jobFamily === "Marketing" ? (jobLevel.startsWith("M") || jobLevel === "D1" ? "Brand Manager" : "Marketing Specialist") :
        jobFamily === "HR" ? (jobLevel.startsWith("M") || jobLevel === "D1" ? "HRBP Manager" : "HRBP") :
        jobFamily === "Finance" ? (jobLevel.startsWith("M") || jobLevel === "D1" ? "Finance Manager" : "Finance Analyst") :
        jobFamily === "Legal" ? (jobLevel.startsWith("M") || jobLevel === "D1" ? "Legal Manager" : "Legal Specialist") :
        jobFamily === "IT" ? (jobLevel.startsWith("M") || jobLevel === "D1" ? "IT Ops Manager" : "IT Support Engineer") :
        "Business Specialist",
      job_family: jobFamily,
      job_level: jobLevel,
      manager_id: i % 9 === 0 ? "NE9999" : `NE${String(Math.max(1, i - (i % 6) - 1)).padStart(4, "0")}`,
      tenure_years: Number((((i * 7) % 80) / 10 + 0.3).toFixed(1)),
      hire_date: i % 23 === 0 ? "2021/3/7" : i % 19 === 0 ? "07-04-2020" : `20${17 + (i % 7)}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
      city,
      performance_current: department === "Sales" ? ["A", "A", "B+", "B"][i % 4] : perf[i % perf.length],
      performance_last_year: perf[(i + 1) % perf.length],
      potential_level: department === "Customer Success" && i % 4 === 0 ? "" : department === "Operations" && i % 5 !== 0 ? "Low" : potential[(i + 2) % potential.length],
      training_completion_rate: 55 + ((i * 11) % 46),
      promotion_count: i % 4,
      mobility_flag: i % 5 < 2 ? "Y" : "N",
      critical_role_flag: i % 9 === 0 || jobLevel === "D1" || jobLevel === "M2" ? "Y" : "N",
      successor_nomination_flag: i % 11 === 0 ? "N" : "Y",
      readiness_level: department === "Engineering" && i % 4 !== 0 ? "Not Ready Yet" : readiness[i % readiness.length],
      flight_risk: department === "Sales" && i % 3 === 0 ? "High" : ["Low", "Medium", "High"][i % 3],
      manager_recommendation: i % 17 === 0 ? "Strongly Recommend" : recommend[(i + 1) % recommend.length],
      engagement_score: 62 + ((i * 13) % 36),
      salary_band: bands[i % bands.length]
    };
    if (i === 15) employee.employee_id = "NE0011";
    if (i === 17) { employee.name = seed[3].name; employee.hire_date = seed[3].hire_date; }
    if (i === 18) employee.age = 17;
    if (i === 21) { employee.readiness_level = "Ready Now"; employee.performance_current = "C"; employee.potential_level = "Low"; }
    if (i === 22) { employee.manager_recommendation = "Strongly Recommend"; employee.performance_current = "C"; }
    if (i === 25) employee.successor_nomination_flag = "N";
    if (i === 27) employee.potential_level = "";
    seed.push(employee);
  }
  window.TALENTPULSE_DEMO.employees = seed;
})();
