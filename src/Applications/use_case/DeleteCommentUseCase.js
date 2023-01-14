class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { comment, thread, owner } = useCasePayload;

    await this._threadRepository.verifyThreadIsExist(thread);
    await this._commentRepository.verifyCommentIsExist(comment);
    await this._commentRepository.verifyCommentOwner(comment, owner);
    await this._commentRepository.deleteCommentById(comment);
  }
}

module.exports = DeleteCommentUseCase;
