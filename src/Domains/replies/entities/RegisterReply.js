class RegisterReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      content, thread, comment, owner,
    } = payload;

    this.content = content;
    this.thread = thread;
    this.comment = comment;
    this.owner = owner;
  }

  _verifyPayload({
    content,
    thread,
    comment,
    owner,
  }) {
    if (!content || !thread || !comment || !owner) {
      throw new Error('REGISTER_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }
    if (typeof content !== 'string' || typeof thread !== 'string' || typeof comment !== 'string' || typeof owner !== 'string') {
      throw new Error('REGISTER_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = RegisterReply;
