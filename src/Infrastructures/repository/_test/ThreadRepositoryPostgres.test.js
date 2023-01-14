const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const RegisterThread = require('../../../Domains/threads/entities/RegisterThread');
const RegisteredThread = require('../../../Domains/threads/entities/RegisteredThread');
const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-001', username: 'user001' });
  });

  afterAll(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('add Thread function', () => {
    it('should persist register thread in database', async () => {
      // Arrange
      const registerThread = new RegisterThread({
        title: 'Bagaimana pengalaman Anda bermain Marvel SNAP ?',
        body: 'Selama saya bermain Marvel SNAP, saya merasakan ...',
        owner: 'user-001',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(registerThread);

      // Assert
      const threaded = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threaded).toHaveLength(1);
    });

    it('should return registered thread correctly', async () => {
      // Arrange
      const registerThread = new RegisterThread({
        title: 'Bagaimana pengalaman Anda bermain Marvel SNAP ?',
        body: 'Selama saya bermain Marvel SNAP, saya merasakan ...',
        owner: 'user-001',
      });
      const fakeIdGenerator = jest.fn().mockImplementation(() => '123');
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const registeredThread = await threadRepositoryPostgres.addThread(registerThread);

      // Assert
      expect(registeredThread).toStrictEqual(new RegisteredThread({
        id: 'thread-123',
        title: registerThread.title,
        owner: registerThread.owner,
      }));
      expect(fakeIdGenerator).toBeCalledTimes(1);
    });
  });

  describe('verifyThreadIsExist function', () => {
    it('should throw NotFoundError when thread not exist in database', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action and Assert
      expect(threadRepositoryPostgres.verifyThreadIsExist('thread-notfound')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread is exist in database', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Bagaimana pengalaman Anda bermain Marvel SNAP ?',
        body: 'Selama saya bermain Marvel SNAP, saya merasakan ...',
        owner: 'user-001',
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action and Assert
      expect(threadRepositoryPostgres.verifyThreadIsExist('thread-123'))
        .resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when given invalid id', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action and assert
      expect(threadRepositoryPostgres.getThreadById('thread-notfound')).rejects.toThrowError(NotFoundError);
    });

    it('should return thread detail correctly', async () => {
      // Arrange
      const createdAt = new Date();
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Bagaimana pengalaman Anda bermain Marvel SNAP ?',
        body: 'Selama saya bermain Marvel SNAP, saya merasakan ...',
        date: createdAt,
        owner: 'user-001',
      });

      const expectedThread = new ThreadDetail({
        id: 'thread-123',
        title: 'Bagaimana pengalaman Anda bermain Marvel SNAP ?',
        body: 'Selama saya bermain Marvel SNAP, saya merasakan ...',
        date: createdAt,
        username: 'user001',
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const threads = await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(threads).toStrictEqual(expectedThread);
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFound error when given invalid thread id', async () => {
      // Arrange
      const threadRepository = new ThreadRepositoryPostgres(pool, {});

      await expect(threadRepository.getThreadById('thread-notfound'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should return thread correctly', async () => {
      const dateThread = new Date();
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-001',
        title: 'Bagaimana pengalaman Anda bermain Marvel SNAP ?',
        body: 'Selama saya bermain Marvel SNAP, saya merasakan ...',
        date: dateThread,
      });

      const expectedThread = new ThreadDetail({
        id: 'thread-123',
        username: 'user001',
        title: 'Bagaimana pengalaman Anda bermain Marvel SNAP ?',
        body: 'Selama saya bermain Marvel SNAP, saya merasakan ...',
        date: dateThread,
      });

      const threadRepository = new ThreadRepositoryPostgres(pool, {});

      const thread = await threadRepository.getThreadById('thread-123');

      expect(thread).toStrictEqual(expectedThread);
    });
  });
});
