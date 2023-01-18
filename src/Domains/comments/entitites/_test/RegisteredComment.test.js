const RegisteredComment = require('../RegisteredComment');

describe('A RegisteredComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'Marvel Snap merupakan game yang sangat seru. Saya ...',
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new RegisteredComment(payload)).toThrowError('REGISTERED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: [12],
      content: true,
      owner: {},
    };

    // Action and Assert
    expect(() => new RegisteredComment(payload)).toThrowError('REGISTERED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create RegisteredThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-001',
      content: 'Marvel Snap merupakan game yang sangat seru. Saya ...',
      owner: 'user-123',
    };

    // Action
    const registeredComment = new RegisteredComment(payload);

    // Assert
    expect(registeredComment.id).toEqual(payload.id);
    expect(registeredComment.content).toEqual(payload.content);
    expect(registeredComment.owner).toEqual(payload.owner);
  });
});
