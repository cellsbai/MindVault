const { Connect } = require('../../base/connect');

const DEV = true;
const preview = false;

class MigrationTrainingFile {
  async run() {
    try {
      this.toolkitClient = new Connect('toolkit', DEV);
      this.trainingClient = new Connect('training', DEV);
      const tenants = await this.trainingClient.fetchTenants();

      console.time('migration');
      for (const tenant of tenants) {
        this.tenant = tenant;
        console.info(`正在迁移租户${tenant}...`);
        await this.migrateFolder();
        await this.migrateFile();
        console.info(`租户${tenant}迁移完成`);
      }
      console.timeEnd('migration');

    } catch (error) {
      console.error(`连接数据库失败:`, error);
      throw error;
    } finally {
      this.trainingClient?.close();
      this.toolkitClient?.close();
    }
  }

  async migrateFolder() {
    const trainingFolders = await this.trainingClient.find(`${this.tenant}.folders`, { valid: 1 });
  }
  async migrateFile() {
    const trainingFiles = await this.trainingClient.find(`${this.tenant}.files`, { valid: 1 });
  }
}

new MigrationTrainingFile().run();
