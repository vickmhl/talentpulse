$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$demoDir = Join-Path $root "demo"
New-Item -ItemType Directory -Force -Path $demoDir | Out-Null

function Escape-Xml {
  param([string]$Text)
  if ($null -eq $Text) { return "" }
  return [System.Security.SecurityElement]::Escape([string]$Text)
}

function New-Xlsx {
  param(
    [Parameter(Mandatory = $true)] [array]$Rows,
    [Parameter(Mandatory = $true)] [string]$Path
  )

  Add-Type -AssemblyName System.IO.Compression.FileSystem
  if (Test-Path $Path) { Remove-Item $Path -Force }

  $headers = [System.Collections.Generic.List[string]]::new()
  foreach ($property in $Rows[0].PSObject.Properties.Name) {
    [void]$headers.Add($property)
  }

  $sb = [System.Text.StringBuilder]::new()
  [void]$sb.Append('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')
  [void]$sb.Append('<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>')

  $allRows = @()
  $headerRow = [ordered]@{}
  foreach ($header in $headers) { $headerRow[$header] = $header }
  $allRows += [pscustomobject]$headerRow
  $allRows += $Rows

  for ($r = 0; $r -lt $allRows.Count; $r++) {
    $rowNumber = $r + 1
    [void]$sb.Append("<row r=`"$rowNumber`">")
    $colIndex = 0
    foreach ($header in $headers) {
      $colIndex++
      $letters = ""
      $n = $colIndex
      while ($n -gt 0) {
        $mod = ($n - 1) % 26
        $letters = [char](65 + $mod) + $letters
        $n = [math]::Floor(($n - 1) / 26)
      }
      $cellRef = "$letters$rowNumber"
      $value = $allRows[$r].$header
      $stringValue = [string]$value
      $isNumber = $stringValue -match '^-?\d+(\.\d+)?$' -and $stringValue -ne ""
      if ($isNumber) {
        [void]$sb.Append("<c r=`"$cellRef`" t=`"n`"><v>$stringValue</v></c>")
      } else {
        $escaped = Escape-Xml $stringValue
        [void]$sb.Append("<c r=`"$cellRef`" t=`"inlineStr`"><is><t>$escaped</t></is></c>")
      }
    }
    [void]$sb.Append('</row>')
  }
  [void]$sb.Append('</sheetData></worksheet>')
  $worksheetXml = $sb.ToString()

  $contentTypes = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>
'@

  $rootRels = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
'@

  $workbook = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="TalentData" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>
'@

  $workbookRels = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>
'@

  $timestamp = (Get-Date).ToString("s") + "Z"
  $core = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:creator>Codex TalentPulse Generator</dc:creator>
  <cp:lastModifiedBy>Codex TalentPulse Generator</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">$timestamp</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">$timestamp</dcterms:modified>
</cp:coreProperties>
"@

  $app = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>TalentPulse</Application>
</Properties>
'@

  $zip = [System.IO.Compression.ZipFile]::Open($Path, [System.IO.Compression.ZipArchiveMode]::Create)
  try {
    $entries = [ordered]@{
      "[Content_Types].xml" = $contentTypes
      "_rels/.rels" = $rootRels
      "xl/workbook.xml" = $workbook
      "xl/_rels/workbook.xml.rels" = $workbookRels
      "xl/worksheets/sheet1.xml" = $worksheetXml
      "docProps/core.xml" = $core
      "docProps/app.xml" = $app
    }
    foreach ($entryName in $entries.Keys) {
      $entry = $zip.CreateEntry($entryName)
      $writer = [System.IO.StreamWriter]::new($entry.Open())
      try {
        $writer.Write($entries[$entryName])
      } finally {
        $writer.Dispose()
      }
    }
  } finally {
    $zip.Dispose()
  }
}

$departments = @(
  @{ Name = "CEO Office / 战略办公室"; Count = 12; Subs = @("战略规划", "投资管理"); Families = @("战略", "总经办"); Cities = @("上海", "北京") },
  @{ Name = "产品部"; Count = 34; Subs = @("平台产品", "商业化产品", "用户增长产品"); Families = @("产品"); Cities = @("上海", "杭州", "深圳") },
  @{ Name = "研发部"; Count = 92; Subs = @("后端研发", "前端研发", "数据平台", "测试与质量", "架构组"); Families = @("研发", "数据"); Cities = @("上海", "杭州", "成都") },
  @{ Name = "销售部"; Count = 48; Subs = @("华东销售", "华南销售", "大客户销售"); Families = @("销售"); Cities = @("上海", "深圳", "北京") },
  @{ Name = "客户成功部"; Count = 38; Subs = @("交付", "实施", "续费经营"); Families = @("客户成功"); Cities = @("上海", "广州", "成都") },
  @{ Name = "运营部"; Count = 28; Subs = @("业务运营", "流程运营", "质量运营"); Families = @("运营"); Cities = @("上海", "武汉") },
  @{ Name = "市场部"; Count = 16; Subs = @("品牌市场", "增长营销"); Families = @("市场"); Cities = @("上海", "北京") },
  @{ Name = "人力资源部"; Count = 10; Subs = @("招聘", "HRBP", "组织发展"); Families = @("HR"); Cities = @("上海") },
  @{ Name = "财务法务部"; Count = 10; Subs = @("财务", "法务", "内控"); Families = @("财务", "法务"); Cities = @("上海") },
  @{ Name = "IT / 数据支持部"; Count = 12; Subs = @("IT支持", "数据治理", "BI分析"); Families = @("IT", "数据"); Cities = @("上海", "苏州") }
)

$jobLevels = @("P1", "P2", "P3", "P4", "P5", "M1", "M2", "D1")
$salaryBands = @("A1", "A2", "A3", "B1", "B2", "C1", "C2", "D1")
$performanceLevels = @("A", "B+", "B", "C")
$potentialLevels = @("High", "Medium", "Low")
$readinessLevels = @("Ready Now", "Ready in 1-2 Years", "Ready in 2-3 Years", "Not Ready Yet")
$recommendations = @("Strongly Recommend", "Recommend", "Observe", "Not Recommend")
$firstNames = @("陈","林","王","李","张","赵","周","吴","郑","孙","何","高","胡","徐","郭","马","罗","梁","谢","唐")
$lastNames = @("晨","越","嘉","一凡","知远","可欣","宇航","思源","景行","沐阳","星野","奕辰","若宁","书航","予安","景澄","启航","青岚","乐言","子墨")

function Get-Name([int]$Index) {
  return $firstNames[$Index % $firstNames.Count] + $lastNames[[math]::Floor($Index / $firstNames.Count) % $lastNames.Count]
}

$employees = [System.Collections.Generic.List[object]]::new()
$managerPool = @()
$globalIndex = 1

foreach ($dept in $departments) {
  for ($i = 1; $i -le $dept.Count; $i++) {
    $department = $dept.Name
    $subDepartment = $dept.Subs[($i - 1) % $dept.Subs.Count]
    $city = $dept.Cities[($i - 1) % $dept.Cities.Count]
    $jobFamily = $dept.Families[($i - 1) % $dept.Families.Count]
    $employeeId = "NE{0:d4}" -f $globalIndex
    $jobLevel = if ($i -le 1) { "D1" } elseif ($i -le 3) { "M2" } elseif ($i -le 8) { "M1" } else { $jobLevels[($globalIndex + $i) % 5] }
    $positionTitle = switch ($jobFamily) {
      "战略" { if ($jobLevel -in @("D1","M2")) { "战略负责人" } else { "战略分析师" } }
      "总经办" { if ($jobLevel -in @("D1","M2")) { "总经办负责人" } else { "总经办专员" } }
      "产品" { if ($jobLevel -in @("D1","M2")) { "产品总监" } elseif ($jobLevel -eq "M1") { "产品经理负责人" } else { "产品经理" } }
      "研发" { if ($jobLevel -in @("D1","M2")) { "研发总监" } elseif ($jobLevel -eq "M1") { "技术经理" } else { "软件工程师" } }
      "数据" { if ($jobLevel -in @("D1","M2")) { "数据平台主管" } elseif ($jobLevel -eq "M1") { "数据经理" } else { "数据分析师" } }
      "销售" { if ($jobLevel -in @("D1","M2")) { "销售总监" } elseif ($jobLevel -eq "M1") { "销售经理" } else { "客户经理" } }
      "客户成功" { if ($jobLevel -in @("D1","M2")) { "客户成功总监" } elseif ($jobLevel -eq "M1") { "实施经理" } else { "客户成功顾问" } }
      "运营" { if ($jobLevel -in @("D1","M2")) { "运营总监" } elseif ($jobLevel -eq "M1") { "运营经理" } else { "运营专员" } }
      "市场" { if ($jobLevel -in @("D1","M2")) { "市场总监" } elseif ($jobLevel -eq "M1") { "品牌经理" } else { "市场专员" } }
      "HR" { if ($jobLevel -in @("D1","M2")) { "人力资源总监" } elseif ($jobLevel -eq "M1") { "HRBP经理" } else { "HRBP" } }
      "财务" { if ($jobLevel -in @("D1","M2")) { "财务总监" } elseif ($jobLevel -eq "M1") { "财务经理" } else { "财务分析师" } }
      "法务" { if ($jobLevel -in @("D1","M2")) { "法务负责人" } elseif ($jobLevel -eq "M1") { "法务经理" } else { "法务专员" } }
      "IT" { if ($jobLevel -in @("D1","M2")) { "IT负责人" } elseif ($jobLevel -eq "M1") { "IT运维经理" } else { "IT支持工程师" } }
      default { "业务专员" }
    }

    $age = 24 + (($globalIndex * 3) % 20)
    $tenure = [math]::Round((($globalIndex * 7) % 80) / 10 + 0.3, 1)
    $hireDate = (Get-Date "2017-01-01").AddDays(($globalIndex * 31) % 2800)
    $performanceCurrent = $performanceLevels[($globalIndex + $i) % $performanceLevels.Count]
    $performanceLastYear = $performanceLevels[($globalIndex + $i + 1) % $performanceLevels.Count]
    $potentialLevel = $potentialLevels[($globalIndex + $i + 2) % $potentialLevels.Count]
    $trainingCompletion = 55 + (($globalIndex * 11) % 46)
    $promotionCount = ($globalIndex + $i) % 4
    $mobilityFlag = if ((($globalIndex + $i) % 5) -lt 2) { "Y" } else { "N" }
    $criticalRole = if ($jobLevel -in @("D1", "M2") -or (($globalIndex + $i) % 9 -eq 0)) { "Y" } else { "N" }
    $successorNomination = if ($criticalRole -eq "Y" -and (($globalIndex + $i) % 4 -ne 0)) { "Y" } else { "N" }
    $readiness = $readinessLevels[($globalIndex + $i) % $readinessLevels.Count]
    $flightRisk = @("Low", "Medium", "High")[($globalIndex + $i) % 3]
    $managerRecommendation = $recommendations[($globalIndex + $i + 1) % $recommendations.Count]
    $engagementScore = 62 + (($globalIndex * 13) % 36)
    $salaryBand = $salaryBands[($globalIndex + $i) % $salaryBands.Count]
    $gender = if ($globalIndex % 2 -eq 0) { "女" } else { "男" }

    if ($i -le 3) { $managerId = "CEO-0001" }
    elseif ($i -le 8) { $managerId = $employeeId[0..5] -join "" }
    else {
      $managerId = $managerPool[($globalIndex + $i) % [math]::Max(1, $managerPool.Count)]
    }

    if ($jobLevel -in @("D1", "M2", "M1")) { $managerPool += $employeeId }

    switch ($department) {
      "研发部" {
        if ($potentialLevel -eq "High") { $readiness = if ($i % 6 -eq 0) { "Ready in 1-2 Years" } else { "Not Ready Yet" } }
        if ($i % 5 -eq 0) { $performanceCurrent = "B+"; $potentialLevel = "High" }
      }
      "销售部" {
        $performanceCurrent = @("A", "A", "B+", "B")[($i - 1) % 4]
        $flightRisk = if ($i % 3 -eq 0) { "High" } else { "Medium" }
        if ($i % 7 -eq 0) { $managerRecommendation = "Strongly Recommend" }
      }
      "运营部" {
        $performanceCurrent = @("B", "B+", "B", "C")[($i - 1) % 4]
        $potentialLevel = if ($i % 6 -eq 0) { "Medium" } else { "Low" }
      }
      "产品部" {
        $criticalRole = if ($i % 3 -eq 0 -or $jobLevel -in @("D1", "M2")) { "Y" } else { "N" }
        if ($criticalRole -eq "Y" -and $i % 5 -eq 0) { $successorNomination = "N" }
      }
      "客户成功部" {
        if ($i % 4 -eq 0) { $potentialLevel = "" }
      }
      { $_ -in @("人力资源部","财务法务部","IT / 数据支持部") } {
        if ($criticalRole -eq "Y") { $successorNomination = if ($i % 3 -eq 0) { "N" } else { "Y" } }
      }
    }

    $employee = [pscustomobject][ordered]@{
      employee_id = $employeeId
      name = Get-Name $globalIndex
      gender = $gender
      age = $age
      department = $department
      sub_department = $subDepartment
      position_title = $positionTitle
      job_family = $jobFamily
      job_level = $jobLevel
      manager_id = $managerId
      tenure_years = $tenure
      hire_date = $hireDate.ToString("yyyy-MM-dd")
      city = $city
      performance_current = $performanceCurrent
      performance_last_year = $performanceLastYear
      potential_level = $potentialLevel
      training_completion_rate = $trainingCompletion
      promotion_count = $promotionCount
      mobility_flag = $mobilityFlag
      critical_role_flag = $criticalRole
      successor_nomination_flag = $successorNomination
      readiness_level = $readiness
      flight_risk = $flightRisk
      manager_recommendation = $managerRecommendation
      engagement_score = $engagementScore
      salary_band = $salaryBand
    }

    [void]$employees.Add($employee)
    $globalIndex++
  }
}

# Inject deterministic dirty data.
$employees[4].department = "研发中心"
$employees[5].department = "  研发部 "
$employees[8].position_title = "PM"
$employees[12].hire_date = "2021/3/7"
$employees[13].hire_date = "07-04-2020"
$employees[14].employee_id = $employees[10].employee_id
$employees[16].name = $employees[15].name
$employees[16].hire_date = $employees[15].hire_date
$employees[17].age = 17
$employees[18].potential_level = ""
$employees[19].manager_id = "NE9999"
$employees[20].readiness_level = "Ready Now"
$employees[20].performance_current = "C"
$employees[20].potential_level = "Low"
$employees[21].manager_recommendation = "Strongly Recommend"
$employees[21].performance_current = "C"
$employees[22].department = "Sales"
$employees[23].position_title = "Cust Success Specialist"
$employees[24].department = "运营 中心"
$employees[24].tenure_years = 16.2
$employees[24].age = 25
$employees[25].successor_nomination_flag = "N"
$employees[25].critical_role_flag = "Y"
$employees[26].performance_current = "A"
$employees[26].potential_level = ""
$employees[27].department = "财法部"
$employees[28].job_level = "P4"
$employees[28].position_title = "销售总监"
$employees[29].hire_date = "2020.11.18"

$metadata = [ordered]@{
  company_name = "NovaEdge Technologies"
  product_name = "TalentPulse"
  employees_count = $employees.Count
  departments = $departments.Name
  required_workflow = @(
    "import",
    "mapping",
    "data issue center",
    "nine-box",
    "SHL high-potential",
    "succession analysis",
    "succession heatmap",
    "employee profile",
    "report export"
  )
  injected_org_risks = @(
    "研发部高潜多但 Ready Now 少，管理梯队断层",
    "销售部绩效强但流动风险高，依赖明星员工",
    "运营部稳定但成长停滞，高潜不足",
    "产品部关键岗位集中，单点依赖严重",
    "客户成功部人数多但高潜识别不足",
    "HR/财务/IT 人数少但关键岗位继任风险高"
  )
  dirty_data_examples = @(
    "部门别名与首尾空格",
    "职位别名 PM / Cust Success Specialist",
    "日期格式混乱",
    "工号冲突与重复记录",
    "缺失潜力值",
    "异常年龄与司龄",
    "manager_id 错误",
    "业务规则冲突"
  )
}

$guide = @'
# TalentPulse Demo 场景说明

## 虚拟企业
NovaEdge Technologies 是一家中型企业软件公司，正在推进人才盘点、关键岗位继任与高潜识别。

## 推荐演示顺序
1. 首页进入 Demo 数据。
2. 在数据导入页展示官方数据模板与样例入口。
3. 在字段映射页强调自动匹配与冲突提醒。
4. 在数据问题中心展示三层问题处理机制：
   - 自动处理：空格、日期格式、重复记录、大小写统一
   - 需确认：部门别名、岗位别名、工号冲突、异常年龄/司龄、缺失值、职级不一致
   - 仅标记：manager_id、绩效/潜力与 readiness 冲突、关键岗位无继任提名
5. 进入九宫格、SHL 高潜、继任分析与热力图，讲清组织问题与培养优先级。
6. 在员工画像页落到具体个体。
7. 最后在报告导出页勾选模块并展示摘要。

## 面试讲述重点
- 为什么先做数据问题中心：保证后续人才盘点结果可解释。
- 为什么保留 SHL 4 维和 5 维继任准备度：体现 HR 方法论与结构化分析能力。
- 为什么用官方 Demo 数据：便于稳定展示主链路与组织洞察。
'@

$insights = @'
# TalentPulse Demo 预期洞察

## 组织级结论
- 研发部高潜员工占比高，但 Ready Now 候选偏少，说明管理梯队培养断层。
- 销售部当前绩效亮眼，但高流动风险与明星员工依赖并存，需要继任兜底。
- 运营部整体稳定，绩效波动小，但高潜不足，成长动能偏弱。
- 产品部关键岗位集中，若个别核心经理离开，将出现单点风险。
- 客户成功部样本量大，但潜力字段缺失与识别不足较明显。
- HR、财务法务、IT/数据支持人数少，但关键岗位一旦空缺，继任风险高。

## 个人级结论
- 高绩效不等于高潜，需要结合学习敏捷度、跨域流动意愿和管理者推荐综合识别。
- Ready Now 与绩效/潜力冲突的员工需要重新校准，避免错误进入继任池。
- 关键岗位若无继任提名，应优先进入盘点行动清单。
'@

$employees | ConvertTo-Json -Depth 4 | Set-Content -Encoding UTF8 (Join-Path $demoDir "demo_employees.json")
$metadata | ConvertTo-Json -Depth 4 | Set-Content -Encoding UTF8 (Join-Path $demoDir "demo_org_metadata.json")
$guide | Set-Content -Encoding UTF8 (Join-Path $demoDir "demo_scenario_guide.md")
$insights | Set-Content -Encoding UTF8 (Join-Path $demoDir "demo_expected_insights.md")
New-Xlsx -Rows $employees -Path (Join-Path $demoDir "demo_talentpulse_company.xlsx")

Write-Output "Generated demo files in $demoDir"
