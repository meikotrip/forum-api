const RegisterComment = require('../RegisterComment');

describe('A RegisterComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'Marvel Snap merupakan game yang sangat seru. Saya ...',
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new RegisterComment(payload)).toThrowError('REGISTER_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: true,
      thread: ['halo'],
      owner: {},
    };

    // Action and Assert
    expect(() => new RegisterComment(payload)).toThrowError('REGISTER_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create RegisterComment object correctly', () => {
    // Arrange
    const payload = {
      content: 'Marvel Snap merupakan game yang sangat seru. Saya ...',
      thread: 'thread-001',
      owner: 'user-123',
    };

    // Action
    const registerComment = new RegisterComment(payload);

    // Assert
    expect(registerComment.content).toEqual(payload.content);
    expect(registerComment.thread).toEqual(payload.thread);
    expect(registerComment.owner).toEqual(payload.owner);
  });
});
