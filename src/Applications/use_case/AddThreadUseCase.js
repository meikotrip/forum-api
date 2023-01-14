const RegisterThread = require('../../Domains/threads/entities/RegisterThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePaylaod) {
    const registerThread = new RegisterThread(useCasePaylaod);
    return this._threadRepository.addThread(registerThread);
  }
}

module.exports = AddThreadUseCase;
