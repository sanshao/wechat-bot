import { JSONFilePreset } from "lowdb/node";

class db {
  constructor() {
    this.init();
  }
  init = async () => {
    // Read or create db.json
    const defaultData = { posts: [] };
    const db = await JSONFilePreset("db.json", defaultData);
    // 设置默认数据
    db.data ||= { posts: [] };

    this.db = db;
  };

  save = async () => {
    await this.db.write();
  };

  insert = async (ca) => {
    const post = this.db.data.posts.find((p) => p.ca === ca);
    if (!post) {
      this.db.data.posts.push({ ca: ca, count: 1, group: 1 });
      await this.save();
      return this.db.data.posts[this.db.data.posts.length - 1];
    }
    return post;
  };

  addQueryCount = async (ca) => {
    const post = this.db.data.posts.find((p) => p.ca === ca);
    if (post) {
      post.count += 1;
      await this.save();
    } else {
      return await this.insert(ca);
    }
    return post;
  };

  addGroupCount = async (ca) => {
    const post = this.db.data.posts.find((p) => p.ca === ca);
    if (post) {
      post.group += 1;
      await this.save();
    } else {
      await this.insert(ca);
    }
  };

  getPost = async (ca) => {
    const post = this.db.data.posts.find((p) => p.ca === ca);
    if (!post) {
      return await this.insert(ca);
    }
    return post;
  };
}

export default new db();
