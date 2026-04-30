const fs = require('fs');
const dayjs = require('dayjs');
const _ = require('lodash');
const Redis = require('ioredis');

const DEV = false;
const redisOptions = {
  db: 7,
  username: 'light',
  password: '0SswJT9ZwE1Zzlz9V0kfspJEBW4C9ZQd',
  host: DEV ? 'redis.zf.link' : 'redis.alphabets.cn',
  name: 'master'
};
const tenants = [];

class Session {
  tenants = null;

  constructor(tenants) {
    this.tenants = tenants;
  }

   async run() {
    try {
      this.client = await MongoClient.connect(main);
      this.redis = new Redis(redisOptions);
      this.redis.on('connect', () => {
        console.info('redis connected');
      });
      await this.migrateSession();
    } finally {
      this.redis.disconnect();
      this.client.close();
    }
  }

  async migrateSession() {
    for (const tenant of this.tenants) {
      const users = await this._find(this.client, `${tenant}.users`, { valid: 1 });
      console.info(`【${tenant}】开始处理: ${users.length}个用户`);

      let index = 0;

      const addUsers = [];
      for (const items of _.chunk(users, 100)) {
        await Promise.all(items.map(async user => {
          const result = await this.upsertSession(user, tenant);
          if (result) {
            addUsers.push({
              _id: user._id.toString(),
              id: user.id
            });
          }
        }));
        index += items.length;
        console.info(`【${tenant}】处理进度: ${index} / ${users.length}`);
      }

      fs.writeFileSync(`${__dirname}/${tenant}_${dayjs().format('YYYY-MM-DD HH:mm:ss')}.json`, JSON.stringify(addUsers, null, 2));
    }

    console.info('处理完成');
  }

  async upsertSession(user, code) {
    const { _id, id } = user;
    const tenantString = await this.redis.call('HGET', id, 'tenants');
    if (tenantString == null) {
      await this.redis.call(
        'HSET',
        id,
        'tenants',
        JSON.stringify([
          {
            code,
            uid: _id.toString()
          }
        ])
      );
      return true;
    }

    const tenants = JSON.parse(tenantString);
    const targetTenant = tenants.find(item => item.code === code);
    // 新增租户
    if (targetTenant == null) {
      await this.redis.call(
        'HSET',
        id,
        'tenants',
        JSON.stringify([
          ...tenants,
          {
            code,
            uid: _id.toString()
          }
        ])
      );
      return true;
    }
  }

}