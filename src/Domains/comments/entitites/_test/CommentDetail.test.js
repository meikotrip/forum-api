const CommentDetail = require('../CommentDetail');

describe('A CommentDetail entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-001',
      username: 'user-001',
    };

    // Action and Assert
    expect(() => new CommentDetail(payload)).toThrowError('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      username: true,
      date: [],
      content: ['januari'],
      is_delete: {},
    };

    // Action and Assert
    expect(() => new CommentDetail(payload)).toThrowError('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CommentDetail object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-001',
      username: 'user-001',
      date: new Date(),
      content: 'Menurut Marvel Snap merupakan game yang sangat seru. Saya ...',
      is_delete: false,
    };

    // Action
    const commentDetail = new CommentDetail(payload);

    // Assert
    expect(commentDetail.id).toEqual(payload.id);
    expect(commentDetail.username).toEqual(payload.username);
    expect(commentDetail.date).toEqual(payload.date);
    expect(commentDetail.content).toEqual(payload.content);
  });

  it('should give string "**komentar telah dihapus**" when is_delete value is true', () => {
    // Arrange
    const payload = {
      id: 'comment-001',
      username: 'user-001',
      date: new Date(),
      content: 'Menurut Marvel Snap merupakan game yang sangat seru. Saya ...',
      is_delete: true,
    };

    // Action
    const commentDetail = new CommentDetail(payload);

    // Assert
    expect(commentDetail.content).toEqual('**komentar telah dihapus**');
  });
});
