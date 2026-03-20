$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$demoDir = Join-Path $root "demo"
New-Item -ItemType Directory -Force -Path $demoDir | Out-Null

function Escape-Xml {
  param([string]$Text)
  if ($null -eq $Text) { return "" }
  [System.Security.SecurityElement]::Escape([string]$Text)
}

function New-Xlsx {
  param(
    [Parameter(Mandatory = $true)] [array]$Rows,
    [Parameter(Mandatory = $true)] [string]$Path
  )

  Add-Type -AssemblyName System.IO.Compression
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  if (Test-Path $Path) { Remove-Item $Path -Force }

  $headers = @($Rows[0].PSObject.Properties.Name)
  $allRows = @()
  $headerRow = [ordered]@{}
  foreach ($header in $headers) { $headerRow[$header] = $header }
  $allRows += [pscustomobject]$headerRow
  $allRows += $Rows

  $sheet = [System.Text.StringBuilder]::new()
  [void]$sheet.Append('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')
  [void]$sheet.Append('<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>')

  for ($r = 0; $r -lt $allRows.Count; $r++) {
    $rowIndex = $r + 1
    [void]$sheet.Append("<row r=`"$rowIndex`">")
    for ($c = 0; $c -lt $headers.Count; $c++) {
      $letters = ""
      $n = $c + 1
      while ($n -gt 0) {
        $mod = ($n - 1) % 26
        $letters = [char](65 + $mod) + $letters
        $n = [math]::Floor(($n - 1) / 26)
      }
      $cellRef = "$letters$rowIndex"
      $value = [string]$allRows[$r].($headers[$c])
      $isNumber = $value -match '^-?\d+(\.\d+)?$' -and $value -ne ""
      if ($isNumber) {
        [void]$sheet.Append("<c r=`"$cellRef`" t=`"n`"><v>$value</v></c>")
      } else {
        $escaped = Escape-Xml $value
        [void]$sheet.Append("<c r=`"$cellRef`" t=`"inlineStr`"><is><t>$escaped</t></is></c>")
      }
    }
    [void]$sheet.Append("</row>")
  }

  [void]$sheet.Append("</sheetData></worksheet>")

  $entries = [ordered]@{
    "[Content_Types].xml" = @'
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
    "_rels/.rels" = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
'@
    "xl/workbook.xml" = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="TalentData" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>
'@
    "xl/_rels/workbook.xml.rels" = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>
'@
    "xl/worksheets/sheet1.xml" = $sheet.ToString()
  }

  $timestamp = (Get-Date).ToString("s") + "Z"
  $entries["docProps/core.xml"] = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:creator>Codex TalentPulse Generator</dc:creator>
  <cp:lastModifiedBy>Codex TalentPulse Generator</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">$timestamp</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">$timestamp</dcterms:modified>
</cp:coreProperties>
"@
  $entries["docProps/app.xml"] = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>TalentPulse</Application>
</Properties>
'@

  $zip = [System.IO.Compression.ZipFile]::Open($Path, [System.IO.Compression.ZipArchiveMode]::Create)
  try {
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

$departmentConfig = @(
  @{ department = "CEO Office / Strategy Office"; count = 12; sub = @("Strategy Planning", "Investment Ops"); family = @("Strategy", "Executive"); city = @("Shanghai", "Beijing") },
  @{ department = "Product"; count = 34; sub = @("Platform Product", "Commercial Product", "Growth Product"); family = @("Product"); city = @("Shanghai", "Hangzhou", "Shenzhen") },
  @{ department = "Engineering"; count = 92; sub = @("Backend", "Frontend", "Data Platform", "QA", "Architecture"); family = @("Engineering", "Data"); city = @("Shanghai", "Hangzhou", "Chengdu") },
  @{ department = "Sales"; count = 48; sub = @("East Sales", "South Sales", "Enterprise Sales"); family = @("Sales"); city = @("Shanghai", "Shenzhen", "Beijing") },
  @{ department = "Customer Success"; count = 38; sub = @("Delivery", "Implementation", "Renewal"); family = @("Customer Success"); city = @("Shanghai", "Guangzhou", "Chengdu") },
  @{ department = "Operations"; count = 28; sub = @("Business Ops", "Process Ops", "Quality Ops"); family = @("Operations"); city = @("Shanghai", "Wuhan") },
  @{ department = "Marketing"; count = 16; sub = @("Brand", "Growth Marketing"); family = @("Marketing"); city = @("Shanghai", "Beijing") },
  @{ department = "HR"; count = 10; sub = @("Recruiting", "HRBP", "OD"); family = @("HR"); city = @("Shanghai") },
  @{ department = "Finance & Legal"; count = 10; sub = @("Finance", "Legal", "Compliance"); family = @("Finance", "Legal"); city = @("Shanghai") },
  @{ department = "IT / Data Support"; count = 12; sub = @("IT Support", "Data Governance", "BI"); family = @("IT", "Data"); city = @("Shanghai", "Suzhou") }
)

$firstNames = @("Avery","Blake","Casey","Dylan","Elliot","Finley","Harper","Jamie","Jordan","Kai","Logan","Morgan","Nova","Parker","Quinn","Reese","Riley","Sawyer","Taylor","Wren")
$lastNames = @("Chen","Lin","Wang","Li","Zhao","Zhou","Wu","Xu","Sun","Liu","He","Gao","Ma","Hu","Guo","Tang","Shen","Fang","Yuan","Qin")
$jobLevels = @("P1", "P2", "P3", "P4", "P5")
$performanceLevels = @("A", "B+", "B", "C")
$potentialLevels = @("High", "Medium", "Low")
$readinessLevels = @("Ready Now", "Ready in 1-2 Years", "Ready in 2-3 Years", "Not Ready Yet")
$recommendations = @("Strongly Recommend", "Recommend", "Observe", "Not Recommend")
$salaryBands = @("A1", "A2", "A3", "B1", "B2", "C1", "C2", "D1")

function Get-Name([int]$index) {
  $first = $firstNames[$index % $firstNames.Count]
  $last = $lastNames[[math]::Floor($index / $firstNames.Count) % $lastNames.Count]
  "$first $last"
}

function Get-PositionTitle([string]$family, [string]$jobLevel) {
  switch ($family) {
    "Strategy" { if ($jobLevel -in @("D1","M2")) { "Head of Strategy" } else { "Strategy Analyst" } }
    "Executive" { if ($jobLevel -in @("D1","M2")) { "Chief of Staff" } else { "Executive Associate" } }
    "Product" { if ($jobLevel -in @("D1","M2")) { "Product Director" } elseif ($jobLevel -eq "M1") { "Lead Product Manager" } else { "Product Manager" } }
    "Engineering" { if ($jobLevel -in @("D1","M2")) { "Engineering Director" } elseif ($jobLevel -eq "M1") { "Engineering Manager" } else { "Software Engineer" } }
    "Data" { if ($jobLevel -in @("D1","M2")) { "Data Platform Lead" } elseif ($jobLevel -eq "M1") { "Data Manager" } else { "Data Analyst" } }
    "Sales" { if ($jobLevel -in @("D1","M2")) { "Sales Director" } elseif ($jobLevel -eq "M1") { "Sales Manager" } else { "Account Executive" } }
    "Customer Success" { if ($jobLevel -in @("D1","M2")) { "CS Director" } elseif ($jobLevel -eq "M1") { "Implementation Manager" } else { "Customer Success Consultant" } }
    "Operations" { if ($jobLevel -in @("D1","M2")) { "Operations Director" } elseif ($jobLevel -eq "M1") { "Operations Manager" } else { "Operations Specialist" } }
    "Marketing" { if ($jobLevel -in @("D1","M2")) { "Marketing Director" } elseif ($jobLevel -eq "M1") { "Brand Manager" } else { "Marketing Specialist" } }
    "HR" { if ($jobLevel -in @("D1","M2")) { "HR Director" } elseif ($jobLevel -eq "M1") { "HRBP Manager" } else { "HRBP" } }
    "Finance" { if ($jobLevel -in @("D1","M2")) { "Finance Director" } elseif ($jobLevel -eq "M1") { "Finance Manager" } else { "Finance Analyst" } }
    "Legal" { if ($jobLevel -in @("D1","M2")) { "Head of Legal" } elseif ($jobLevel -eq "M1") { "Legal Manager" } else { "Legal Specialist" } }
    "IT" { if ($jobLevel -in @("D1","M2")) { "IT Director" } elseif ($jobLevel -eq "M1") { "IT Ops Manager" } else { "IT Support Engineer" } }
    default { "Business Specialist" }
  }
}

$employees = [System.Collections.Generic.List[object]]::new()
$managerPool = [System.Collections.Generic.List[string]]::new()
$index = 1

foreach ($cfg in $departmentConfig) {
  for ($i = 1; $i -le $cfg.count; $i++) {
    $employeeId = "NE{0:d4}" -f $index
    $jobLevel = if ($i -eq 1) { "D1" } elseif ($i -le 3) { "M2" } elseif ($i -le 8) { "M1" } else { $jobLevels[($index + $i) % $jobLevels.Count] }
    $jobFamily = $cfg.family[($i - 1) % $cfg.family.Count]
    $department = $cfg.department
    $subDepartment = $cfg.sub[($i - 1) % $cfg.sub.Count]
    $city = $cfg.city[($i - 1) % $cfg.city.Count]
    $age = 24 + (($index * 3) % 20)
    $tenure = [math]::Round((($index * 7) % 80) / 10 + 0.3, 1)
    $hireDate = (Get-Date "2017-01-01").AddDays(($index * 31) % 2800).ToString("yyyy-MM-dd")
    $performanceCurrent = $performanceLevels[($index + $i) % $performanceLevels.Count]
    $performanceLastYear = $performanceLevels[($index + $i + 1) % $performanceLevels.Count]
    $potentialLevel = $potentialLevels[($index + $i + 2) % $potentialLevels.Count]
    $trainingCompletion = 55 + (($index * 11) % 46)
    $promotionCount = ($index + $i) % 4
    $mobilityFlag = if ((($index + $i) % 5) -lt 2) { "Y" } else { "N" }
    $criticalRole = if ($jobLevel -in @("D1", "M2") -or (($index + $i) % 9 -eq 0)) { "Y" } else { "N" }
    $successorNomination = if ($criticalRole -eq "Y" -and (($index + $i) % 4 -ne 0)) { "Y" } else { "N" }
    $readiness = $readinessLevels[($index + $i) % $readinessLevels.Count]
    $flightRisk = @("Low", "Medium", "High")[($index + $i) % 3]
    $managerRecommendation = $recommendations[($index + $i + 1) % $recommendations.Count]
    $engagementScore = 62 + (($index * 13) % 36)
    $salaryBand = $salaryBands[($index + $i) % $salaryBands.Count]
    $gender = if ($index % 2 -eq 0) { "Female" } else { "Male" }

    if ($i -le 3) { $managerId = "CEO-0001" }
    elseif ($i -le 8) { $managerId = $employeeId }
    else { $managerId = $managerPool[($index + $i) % [math]::Max(1, $managerPool.Count)] }

    if ($jobLevel -in @("D1", "M2", "M1")) { [void]$managerPool.Add($employeeId) }

    switch ($department) {
      "Engineering" {
        if ($potentialLevel -eq "High") { $readiness = if ($i % 6 -eq 0) { "Ready in 1-2 Years" } else { "Not Ready Yet" } }
      }
      "Sales" {
        $performanceCurrent = @("A", "A", "B+", "B")[($i - 1) % 4]
        $flightRisk = if ($i % 3 -eq 0) { "High" } else { "Medium" }
      }
      "Operations" {
        $performanceCurrent = @("B", "B+", "B", "C")[($i - 1) % 4]
        $potentialLevel = if ($i % 6 -eq 0) { "Medium" } else { "Low" }
      }
      "Product" {
        if ($criticalRole -eq "Y" -and $i % 5 -eq 0) { $successorNomination = "N" }
      }
      "Customer Success" {
        if ($i % 4 -eq 0) { $potentialLevel = "" }
      }
      { $_ -in @("HR","Finance & Legal","IT / Data Support") } {
        if ($criticalRole -eq "Y" -and $i % 3 -eq 0) { $successorNomination = "N" }
      }
    }

    [void]$employees.Add([pscustomobject][ordered]@{
      employee_id = $employeeId
      name = Get-Name $index
      gender = $gender
      age = $age
      department = $department
      sub_department = $subDepartment
      position_title = Get-PositionTitle $jobFamily $jobLevel
      job_family = $jobFamily
      job_level = $jobLevel
      manager_id = $managerId
      tenure_years = $tenure
      hire_date = $hireDate
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
    })
    $index++
  }
}

$employees[4].department = "Engineering Center"
$employees[5].department = "  Engineering  "
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
$employees[22].department = "Sales Team"
$employees[23].position_title = "Cust Success Specialist"
$employees[24].department = "Operations Hub"
$employees[24].tenure_years = 16.2
$employees[24].age = 25
$employees[25].successor_nomination_flag = "N"
$employees[25].critical_role_flag = "Y"
$employees[26].performance_current = "A"
$employees[26].potential_level = ""
$employees[27].department = "Finance Legal"
$employees[28].job_level = "P4"
$employees[28].position_title = "Sales Director"
$employees[29].hire_date = "2020.11.18"

$metadata = [ordered]@{
  company_name = "NovaEdge Technologies"
  product_name = "TalentPulse"
  employees_count = $employees.Count
  departments = @(
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
  )
  org_risks = @(
    "Engineering has many high-potential employees but too few Ready Now successors.",
    "Sales is strong on performance but carries elevated flight risk and star reliance.",
    "Operations is stable but has a shallow future bench.",
    "Product has concentrated critical roles and single-point dependency.",
    "Customer Success under-identifies high potential talent.",
    "HR, Finance and IT have thin but high-risk succession benches."
  )
}

$guide = @'
# TalentPulse Demo Scenario Guide

1. Start from overview and enter official demo data.
2. Show import, mapping and data issue center.
3. Explain nine-box, SHL potential and succession readiness.
4. Use profile and report export to close the story.
'@

$insights = @'
# TalentPulse Expected Insights

- Engineering: high potential, low ready-now bench.
- Sales: high performance, high flight risk.
- Operations: stable but low growth momentum.
- Product: critical-role concentration.
- Customer Success: missing potential identification.
- HR / Finance / IT: small teams with high succession risk.
'@

$employees | ConvertTo-Json -Depth 4 | Set-Content -Encoding UTF8 (Join-Path $demoDir "demo_employees.json")
$metadata | ConvertTo-Json -Depth 4 | Set-Content -Encoding UTF8 (Join-Path $demoDir "demo_org_metadata.json")
$guide | Set-Content -Encoding UTF8 (Join-Path $demoDir "demo_scenario_guide.md")
$insights | Set-Content -Encoding UTF8 (Join-Path $demoDir "demo_expected_insights.md")
New-Xlsx -Rows $employees -Path (Join-Path $demoDir "demo_talentpulse_company.xlsx")

Write-Output "Generated demo files in $demoDir"
