const Excel = require('exceljs');
const { Connect } = require('../../base/connect');

const DEV = true;
const tenants = ['bigpizza'];

class GenerationGroup {

  tenant = null;
  mainConnect = null;
  trainingConnect = null;
  queryOptions = { readPreference: 'secondary' };

  async run() {
    try {
      this.mainConnect = new Connect('main', DEV);
      this.trainingConnect = new Connect('training', DEV);

      for (const tenant of tenants) {
        this.tenant = tenant;
        const workbook = new Excel.Workbook();
        this.mainWorksheet = workbook.addWorksheet('main');
        this.trainingWorksheet = workbook.addWorksheet('training');
        this.mainWorksheet.columns = [{ width: 30 }, { width: 30 }, { width: 30 }, { width: 20 }];
        this.trainingWorksheet.columns = [{ width: 30 }, { width: 30 }, { width: 30 }, { width: 30 }, { width: 20 }];
        this.mainWorksheet.getRow(1).values = ['巡店组织名', '类型', '巡店_id', '状态', '巡店父级组织'];
        this.trainingWorksheet.getRow(1).values = ['训练组织名', '类型', '训练原始_id', '合并后Id', '状态', '训练父级组织'];

        await this.fetchGroup();
        await workbook.xlsx.writeFile(`${tenant}-group.xlsx`);
      }
    } catch (error) {
      console.error(`迁移租户${this.tenant}失败:`, error);
      throw error;
    } finally {
      this.trainingConnect?.close();
      this.mainConnect?.close();
    }
  }

  async fetchGroup() {
    const [mainGroups, trainingGroups] = await Promise.all([
      this.mainConnect.find(`${this.tenant}.groups`, { valid: 1 }),
      this.trainingConnect.find(`${this.tenant}.groups`, { valid: 1 })
    ]);

    for (const [index, group] of mainGroups.entries()) {
      const rowNum = index + 2;
      this.mainWorksheet.addRow([
        group.name,
        group.type,
        group._id.toString(),
        { formula: `=IF(COUNTIF(training!D:D,C${rowNum})>0,"存在","不存在")` },
        group.parent || 'ROOT'
      ]);
    }

    for (const [index, group] of trainingGroups.entries()) {
      const rowNum = index + 2;
      const mainGroup = mainGroups.find(item => (item.syncId === group._id.toString() || item.syncId === group.syncId) && item.syncId !== '' && item.syncId != null);
      this.trainingWorksheet.addRow([
        group.name,
        group.type,
        group._id.toString(),
        mainGroup?._id?.toString(),
        { formula: `=IF(COUNTIF(main!C:C,D${rowNum})>0,"存在","不存在")` },
        group.parent || 'ROOT'
      ]);
    }
  }

}

new GenerationGroup().run();
