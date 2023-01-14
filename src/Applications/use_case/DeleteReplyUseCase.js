class DeleteReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const {
      reply,
      comment,
      thread,
      owner,
    } = useCasePayload;

    await this._threadRepository.verifyThreadIsExist(thread);
    await this._commentRepository.verifyCommentIsExist(comment);
    await this._replyRepository.verifyReplyIsExist(reply);
    await this._replyRepository.verifyReplyOwner(reply, owner);
    await this._replyRepository.deleteReplyById(reply);
  }
}

module.exports = DeleteReplyUseCase;
