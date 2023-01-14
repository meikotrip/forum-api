const RegisterReply = require('../../Domains/replies/entities/RegisterReply');

class AddReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const { thread, comment } = useCasePayload;
    const registerReply = new RegisterReply(useCasePayload);

    await this._threadRepository.verifyThreadIsExist(thread);
    await this._commentRepository.verifyCommentIsExist(comment);
    return this._replyRepository.addReply(registerReply);
  }
}

module.exports = AddReplyUseCase;
