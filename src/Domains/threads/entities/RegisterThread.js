class RegisterThread {
  constructor(payload) {
    this._verifyPayload(payload);

    const { title, body, owner } = payload;

    this.body = body;
    this.title = title;
    this.owner = owner;
  }

  _verifyPayload({ body, title, owner }) {
    if (!body || !title || !owner) {
      throw new Error('REGISTER_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof body !== 'string' || typeof title !== 'string' || typeof owner !== 'string') {
      throw new Error('REGISTER_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = RegisterThread;
