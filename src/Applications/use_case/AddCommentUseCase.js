const RegisterComment = require('../../Domains/comments/entitites/RegisterComment');

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { thread } = useCasePayload;
    const registerComment = new RegisterComment(useCasePayload);

    await this._threadRepository.verifyThreadIsExist(thread);
    return this._commentRepository.addComment(registerComment);
  }
}

module.exports = AddCommentUseCase;
