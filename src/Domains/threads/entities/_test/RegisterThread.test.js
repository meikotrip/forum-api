const RegisterThread = require('../RegisterThread');

describe('A RegisterThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'Bagaimana pengalaman Anda bermain Marvel SNAP ?',
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new RegisterThread(payload)).toThrowError('REGISTER_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      title: true,
      body: ['halo'],
      owner: {},
    };

    // Action and Assert
    expect(() => new RegisterThread(payload)).toThrowError('REGISTER_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create RegisteredThread object correctly', () => {
    // Arrange
    const payload = {
      title: 'Bagaimana pengalaman Anda bermain Marvel SNAP ?',
      body: 'Selama saya bermain Marvel SNAP, saya merasakan ...',
      owner: 'user-123',
    };

    // Action
    const registerThread = new RegisterThread(payload);

    // Assert
    expect(registerThread.body).toEqual(payload.body);
    expect(registerThread.title).toEqual(payload.title);
    expect(registerThread.owner).toEqual(payload.owner);
  });
});
