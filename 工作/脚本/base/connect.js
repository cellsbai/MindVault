const { MongoClient } = require('mongodb');

const uris = {
  main: {
    dev: 'mongodb://4099cc31d596:635c886634d9@mongo.zf.link:57017/4099cc31d596?tls=true&directConnection=true',
    prd: 'mongodb://4099cc31d596:635c886634d9@master.alphabets.cn:57017/4099cc31d596?tls=true&directConnection=true',
  },
  training: {
    dev: 'mongodb://0eb03adfc1ab:09451bf573b6@mongo.zf.link:57017/0eb03adfc1ab?tls=true&directConnection=true',
    prd: 'mongodb://developer:0cde967185fc@master.alphabets.cn:57017/0eb03adfc1ab?tls=true&directConnection=true',
  },
  shoteyes: {
    dev: 'mongodb://developer:fd7d08440fbb@mongo.zf.link:57017/b37bc664b5a4?tls=true&directConnection=true',
    prd: 'mongodb://b37bc664b5a4:44f5a5fce65c@master.alphabets.cn:57017/b37bc664b5a4?tls=true&directConnection=true',
  },
  toolkit: {
    dev: 'mongodb://ecea37b820e9:727ed4a88d78@mongo.zf.link:57017/ecea37b820e9?tls=true&directConnection=true',
    prd: 'mongodb://ecea37b820e9:727ed4a88d78@master.alphabets.cn:57017/ecea37b820e9?tls=true&directConnection=true',
  },
};

class Connect {
  product = null;
  dev = true;
  preview = false;

  constructor(product, dev = true, preview = false) {
    this.product = product;
    this.dev = dev;
    this.preview = preview;
    const uri = uris[product]?.[dev ? 'dev' : 'prd'];
    if (!uri) throw new Error(`Unknown connection: ${product}`);
    this._client = MongoClient.connect(uri);
    this.db = this._client.then(client => client.db());
  }

  async fetchTenants() {
    if (this.product === 'training') {
      return this.db.then(db =>
        db.collection('light.tenants')
          .find({ valid: 1, status: { $in: ['0', '1'] } })
          .toArray()
      ).then(tenants => tenants.map(tenant => tenant.code));
    }
  }

  async insertOne(collection, data) {
    if (this.preview) {
      console.info('insertOne', collection, data);
      return;
    }
    return this.db.then(db => db.collection(collection).insertOne(data));
  }

  async find(collection, query, projection = {}) {
    return this._retry(() =>
      this.db.then(db => db.collection(collection).find(query).project(projection).toArray())
    );
  }

  async updateOne(collection, query, update) {
    if (this.preview) {
      console.info('updateOne', collection, query, update);
      return;
    }
    return this._retry(() =>
      this.db.then(db => db.collection(collection).updateOne(query, { $set: update }))
    );
  }

  async updateMany(collection, query, update) {
    if (this.preview) {
      console.info('updateMany', collection, query, update);
      return;
    }
    return this._retry(() =>
      this.db.then(db => db.collection(collection).updateMany(query, { $set: update }))
    );
  }

  async _retry(fn, retries = 5, delay = 2000) {
    for (let index = 0; index < retries; index += 1) {
      try {
        return await fn();
      } catch (error) {
        if (index < retries - 1 && error.name === 'MongoNetworkError') {
          console.warn(`网络错误，${delay / 1000}s 后重试 (${index + 1}/${retries}):`, error.message);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
  }

  async close() {
    return (await this._client)?.close();
  }

}

module.exports = { Connect };
