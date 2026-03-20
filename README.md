# TalentPulse

TalentPulse 是一个面向 HR 学生的 PC Web 作品集项目，用来演示从人才盘点到继任分析的完整主链路。

## 项目目录结构

```text
TalentPulse/
├─ index.html
├─ README.md
├─ demo/
│  ├─ demo_talentpulse_company.xlsx
│  ├─ demo_employees.json
│  ├─ demo_org_metadata.json
│  ├─ demo_scenario_guide.md
│  └─ demo_expected_insights.md
├─ scripts/
│  ├─ generate-demo-clean.ps1
│  └─ generate-demo.ps1
└─ src/
   ├─ app.js
   └─ styles.css
```

## 核心实现说明

- 使用单页 PC 工作台串联完整流程：导入 -> 映射 -> 数据问题中心 -> 九宫格 -> SHL 高潜 -> 继任分析 -> 热力图 -> 员工画像 -> 报告导出。
- 统一蓝白 B 端 SaaS 视觉：卡片化、大留白、轻阴影、统一按钮与表格。
- 内置官方 Demo 数据，并在前端直接完成清洗、字段映射展示、问题识别、高潜计算和继任评分。
- 页面支持筛选、问题抽屉、员工联动、热力图点击和导出摘要。

## 数据模型说明

### 原始字段

官方 Demo 数据包含以下核心字段：

- `employee_id`
- `name`
- `gender`
- `age`
- `department`
- `sub_department`
- `position_title`
- `job_family`
- `job_level`
- `manager_id`
- `tenure_years`
- `hire_date`
- `city`
- `performance_current`
- `performance_last_year`
- `potential_level`
- `training_completion_rate`
- `promotion_count`
- `mobility_flag`
- `critical_role_flag`
- `successor_nomination_flag`
- `readiness_level`
- `flight_risk`
- `manager_recommendation`
- `engagement_score`
- `salary_band`

### 数据处理逻辑

- 字段映射：展示标准字段与自动匹配结果。
- 自动清洗：空格、日期标准化、重复记录去重、别名标准化。
- 需确认：部门别名、岗位别名、工号冲突、异常年龄/司龄、缺失值、职级不一致。
- 仅标记：错误 manager_id、准备度冲突、推荐冲突、关键岗位无继任提名、部门评分偏差。

### SHL 高潜模型

4 维得分：

- 学习敏捷度：培训完成率、晋升次数、流动意愿、潜力等级
- 领导驱动力：绩效、管理者推荐、关键岗位暴露
- 人际影响力：敬业度、推荐口径
- 战略思维：绩效稳定性、岗位层级、关键岗位经历

综合高潜等级：

- `A`: `score >= 80`
- `B`: `68 <= score < 80`
- `C`: `score < 68`

### 5 维继任准备度模型

- 当前绩效
- 潜力水平
- 岗位匹配度
- 关键经验
- 管理者推荐 / 发展准备度

输出层级：

- `Ready Now`
- `Ready in 1-2 Years`
- `Ready in 2-3 Years`
- `Not Ready Yet`

## Demo 数据文件说明

- `demo_talentpulse_company.xlsx`: 官方 Excel 演示数据，约 300 人。
- `demo_employees.json`: 前端直接读取的同源数据文件。
- `demo_org_metadata.json`: 企业元数据与组织风险摘要。
- `demo_scenario_guide.md`: 演示讲述顺序。
- `demo_expected_insights.md`: 预期洞察摘要。

数据中已注入以下组织问题：

- 研发高潜多但 Ready Now 少
- 销售绩效强但流动风险高
- 运营稳定但成长停滞
- 产品关键岗位集中
- 客户成功高潜识别不足
- HR / 财务 / IT 继任风险偏高

同时包含脏数据：

- 空格
- 部门 / 岗位别名
- 日期格式混乱
- 工号冲突
- 重复记录
- 缺失值
- 年龄 / 司龄异常
- 业务规则冲突

## 运行方式

现在可以直接双击 [index.html](D:\Codex\人才盘点工具v4\index.html) 打开。

项目已经内置本地 Demo 脚本数据，即使不启动本地服务器，也能直接展示完整主链路。

如果后续你想切回读取 `demo/` 目录里的真实文件，再用静态服务器打开也可以。

## 重新生成 Demo 数据

```powershell
.\scripts\generate-demo-clean.ps1
```

## 后续优化建议

- 接入真正的 `.xlsx` 浏览器解析能力，补齐前端上传解析闭环。
- 将当前单文件前端拆分为组件模块和数据服务模块，便于后续迭代。
- 增加更完整的图表交互和导出为 PDF 的能力。
- 补充更细的组织层级切换、岗位族对比和部门 drill-down。
