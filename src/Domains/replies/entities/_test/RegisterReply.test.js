const RegisterReply = require('../RegisterReply');

describe('A RegisterReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'Marvel Snap merupakan game yang sangat seru. Saya ...',
      thread: 'thread-001',
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new RegisterReply(payload)).toThrowError('REGISTER_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: true,
      thread: ['halo'],
      comment: [321],
      owner: {},
    };

    // Action and Assert
    expect(() => new RegisterReply(payload)).toThrowError('REGISTER_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create RegisterReply object correctly', () => {
    // Arrange
    const payload = {
      content: 'Marvel Snap merupakan game yang sangat seru. Saya ...',
      thread: 'thread-001',
      comment: 'comment-001',
      owner: 'user-123',
    };

    // Action
    const registerReply = new RegisterReply(payload);

    // Assert
    expect(registerReply.content).toEqual(payload.content);
    expect(registerReply.thread).toEqual(payload.thread);
    expect(registerReply.comment).toEqual(payload.comment);
    expect(registerReply.owner).toEqual(payload.owner);
  });
});
