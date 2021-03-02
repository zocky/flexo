const { Plugin } = require("../lib/Plugin")
exports.Plugin = class UsersBasic extends Plugin {
 
  setup() {
    this.store = this.engine.getOrCreateService(this.conf.store);
    let auth = [].concat(this.conf.auth);
    for (const a of auth) {
      const service = this.engine.getOrCreateService(a);
      service.on('success', async (req, res, info, profile) => {
        await this.loginOrRegister(res, info, profile);
      })
      service.on('fail', async (req, res, info, profile) => {
        await this.logout(res);
      })
    }
    this.engine.routerUse(async (req, res) => {
      if (req.userId) {
        req.user = await this.get(req.userId);
      }
    })
  }

  authIdField(authId) {
    return '_auth_' + authId + '_id';
  }
  authProfileField(authId) {
    return '_auth_' + authId + '_profile';
  }

  async getAuthProfile(authId) {
    const idField = this.authIdField(authId);
    const profileField = this.authProfileField(authId);
    return await this.store.findOne({ [idField]: userId })
  }

  async getByAuthId(authId, userId) {
    const idField = this.authIdField(authId);
    return await this.store.findOne({ [idField]: userId })
  }

  async createFromAuth(authId, userId, username, profile) {
    username = await this.findAvailableUsername(username);
    const idField = this.authIdField(authId);
    const profileField = this.authProfileField(authId);
    this.debug('create new user', authId, userId, username);
    await this.store.create({
      username,
      [idField]: userId,
      [profileField]: profile
    })
    return await this.store.findOne({ username })
  }

  async findAvailableUsername(username) {
    let sameUser = await this.store.findOne({ username });
    while (sameUser) {
      username += (Math.random() * 10).toFixed(0);
      sameUser = await this.store.findOne({ username });
    }
    return username;
  }

  /**
 * 
 * @param {string} authId the id of this auth authority
 * @param {string} userId the unique id of the user on this authority
 * @param {string} username suggested username for a new user
 * @param {object} profile the user data returned by the authority
 */
  getOrCreate = async ({
    authId,
    userId,
    username
  },
    profile
  ) => {
    const oldUser = await this.getByAuthId(authId, userId);
    if (oldUser) return oldUser;
    const newUser = await this.createFromAuth(authId, userId, username, profile)
    return newUser;
  }

  /**
   * 
   * @param {object} res response object that will be used to login the user
   * @param {string} authId the id of this auth authority
   * @param {string} userId the unique id of the user on this authority
   * @param {string} username suggested username for a new user
   * @param {object} profile the user data returned by the authority
   */
  loginOrRegister = async (res, ...args) => {
    const user = await this.getOrCreate(...args);
    if (user) await this.engine.login(res, user.username);
    else await this.logout(res);
  }

  logout = async (res) => {
    awaitthis.engine.logout(res);
  }

  get = (username) => {
    return this.store.findOne({ username });
  }
}
