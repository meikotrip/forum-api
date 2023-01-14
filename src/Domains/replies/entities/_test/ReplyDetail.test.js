const ReplyDetail = require('../ReplyDetail');

describe('A ReplyDetail entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-001',
      username: 'user-001',
    };

    // Action and Assert
    expect(() => new ReplyDetail(payload)).toThrowError('REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
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
    expect(() => new ReplyDetail(payload)).toThrowError('REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create ReplyDetail object correctly', () => {
    // Arrange
    const payload = {
      id: 'replies-001',
      username: 'user-001',
      date: new Date(),
      content: 'Menurut Marvel Snap merupakan game yang sangat seru. Saya ...',
      is_delete: false,
    };

    // Action
    const replyDetail = new ReplyDetail(payload);

    // Assert
    expect(replyDetail.id).toEqual(payload.id);
    expect(replyDetail.username).toEqual(payload.username);
    expect(replyDetail.date).toEqual(payload.date);
    expect(replyDetail.content).toEqual(payload.content);
  });

  it('should give string "**balasan telah dihapus**" when is_delete value is true', () => {
    // Arrange
    const payload = {
      id: 'reply-001',
      username: 'user-001',
      date: new Date(),
      content: 'Menurut Marvel Snap merupakan game yang sangat seru. Saya ...',
      is_delete: true,
    };

    // Action
    const replyDetail = new ReplyDetail(payload);

    // Assert
    expect(replyDetail.content).toEqual('**balasan telah dihapus**');
  });
});
