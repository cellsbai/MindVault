任务一览开发计划
> 范围：仅覆盖「任务一览」「任务编辑」「Temporal 配置读写」三部分。

---

### 一、 前置约定
数据源 temporal作为唯一配置真源，配置不存DB
后端，使用zf-server-infra 中提供的temporal来操作temporal，如果缺少可以补充进去
前端代码 放入 admin-web中
后端代码 放入 main-server中

---

### 二、后端开发任务
#### 接口如下
- 列表接口 /api/temporal/schedules Get 无参数 全量返回，不分页
  接口返回值如下 {
    items: [
      {
        scheduleId: 'capture-task', // 任务ID
        description: '', // 任务描述
        cron: '0 * * * * *', // cron表达式
        nextRunTimes: [ // 下5次执行计划
          '2026-09-21 18:10:00',
          '2026-09-21 18:10:00',
          '2026-09-21 18:10:00',
          '2026-09-21 18:10:00',
          '2026-09-21 18:10:00'
        ],
        enabled: true, // 是否启用
        canDelete: false // 复制标记
      },
      ...
    ],
    totalItems: 10 (number)
  }
  **验收**：接口联调通过，全量任务一次性返回
- 详情接口 /api/temporal/getSchedule?scheduleId=capture-task Get
  参数
    scheduleId
  接口返回值如下 {
    scheduleId: 'capture-task', // 任务ID
    description: 'xx', // 任务描述
    cron: '0 * * * * *', // cron表达式
    nextRunTimes: [ // 下5次执行计划
      '2026-09-21 18:10:00',
      '2026-09-21 18:10:00',
      '2026-09-21 18:10:00',
      '2026-09-21 18:10:00',
      '2026-09-21 18:10:00'
    ],
    enabled: true, // 是否启用 由 `state.paused` 取反
    excludeCodes: [], // 排除的租户
    codes: [] // 包含的租户
  }
  **验收**：详情页数据完整；共同任务能看到自己被哪些租户自定义了
- 更新接口 /api/temporal/updateSchedule Put 时区默认UTC
  参数
    scheduleId
    enabled
    cron
    codes
    excludeCodes
  校验
    cron 合法性
  未提交字段保持原值，[] 表示清空，false 表示停用
  **验收**：修改单个字段能正确同步到 Temporal，可在 Temporal Web UI 上验证结果；非法字段/非法 cron 被正确拦截；
- 拷贝接口 /api/temporal/copySchedule Post
  参数
    scheduleId
    copyId
    enabled
    description
    codes
    excludeCodes
    cron
  拷贝其他默认值
  保存时增加一个copy标记，用于页面是否允许删除
- 删除接口 /api/temporal/removeSchedule Delete
  参数
    scheduleId
  校验 只有包含了拷贝标记的才允许删除
  **验收**：删除后，Temporal Web UI 上应该一同消失

---

### 三、前端开发任务
任务一览页面
- 筛选条件：任务描述 + 搜索 使用 LightFilter方式
- 列表组件：表格展示（任务ID、任务描述、类型、执行计划（cron直接展示即可）、下次执行（下5次执行时间，换行展示）、状态（switch开关，启用/停用）操作按钮（编辑、复制、删除））
- 列表全量展示，不分页
- 状态快捷操作：列表行内直接提供「暂停/启用」toggle接口 调用updateSchedule接口，enabled字段，不用进详情页面
- 删除按钮只有是复制的定时任务才会显示
- 任务描述 搜索前台直接搜索，不用后台搜索
验收：启用暂停、搜索均正常工作

任务编辑页面 Editor 侧拉窗
- 只读信息区（任务ID、描述）
- 可编辑区
  - 启用、暂停：Switch组件
  - 执行时间：可视化选择器（每天、每周、每月、Cron 表达式）
    - 每天 执行时间 内部转换成cron表达式
    - 每周 下拉多选周几 + 执行时间 内部转换成cron表达式
    - 每月 下拉多选每日 + 执行时间 内部转换成cron表达式
    - Cron 表达式 input输出框
  - codes 允许哪些租户执行
  - excludeCodes 不允许哪些租户执行
- 展示区 改动完执行时间，自动展示下5次执行时间（AgGrid）展示格式为 YYYY-MM-DD HH:mm:ss 应转换成当前时区进行展示，如果是编辑进入时，自动展示下5次执行时间
- 保存按钮，调用updateSchedule接口，提交前做前端基础校验
- 保存成功/失败提示

复制任务编辑页面 Editor 侧拉窗
- 可编辑区
  - 不可编辑输入框+任务ID（可编辑输入框）
  - 描述
  - 启用、暂停：Switch组件
  - 执行时间：可视化选择器（每天、每周、每月、Cron 表达式）
    - 每天 执行时间 内部转换成cron表达式
    - 每周 下拉多选周几 + 执行时间 内部转换成cron表达式
    - 每月 下拉多选每日 + 执行时间 内部转换成cron表达式
    - Cron 表达式 input输出框
- 展示区 改动完执行时间，自动展示下5次执行时间（AgGrid）展示格式为 YYYY-MM-DD HH:mm:ss 应转换成当前时区进行展示，如果是编辑进入时，自动展示下5次执行时间
- 保存按钮，调用copySchedule接口，提交前做前端基础校验
- 保存成功/失败提示

验收：编辑保存后，页面展示与 Temporal 实际状态一致

---

### 验收清单
- [ ] 列表页数据与 Temporal 实际状态一致，全量展示无遗漏
- [ ] 暂停/启用操作实时生效，Temporal Web UI 可验证
- [ ] cron/时区修改后，下次触发时间符合预览展示
- [ ] 拷贝后的定时任务才允许删除，未拷贝的没有删除按钮