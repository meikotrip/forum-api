const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const RegisterReply = require('../../../Domains/replies/entities/RegisterReply');
const RegisteredComment = require('../../../Domains/comments/entitites/RegisteredComment');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
  });

  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'user123' }); // User who creating thread (user-123)
    await UsersTableTestHelper.addUser({ id: 'user-234', username: 'user234' }); // Users who commenting thread
    await ThreadsTableTestHelper.addThread({ id: 'thread-001', owner: 'user-123' }); // Thread already created by user-123
    await CommentsTableTestHelper.addComment({ id: 'comment-001', thread: 'thread-001', owner: 'user-234' }); // users234 comment thread-001
    await CommentsTableTestHelper.addComment({ id: 'comment-002', thread: 'thread-001', owner: 'user-123' }); // user123 comment thread-001
  });

  afterAll(async () => {
    await RepliesTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  describe('addReply function', () => {
    it('should persist register reply in database', async () => {
      // Arrange
      const registerReply = {
        content: 'mantap juga',
        thread: 'thread-001',
        comment: 'comment-001',
        owner: 'user-123',
      };
      const fakeIdGenerator = jest.fn().mockImplementation(() => '123');
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const registeredReply = await replyRepositoryPostgres.addReply(registerReply);

      // Assert
      const replied = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(registeredReply).toStrictEqual(new RegisteredComment({
        id: 'reply-123',
        content: registerReply.content,
        owner: registerReply.owner,
      }));
      expect(replied.length).toEqual(1);
      expect(fakeIdGenerator).toBeCalledTimes(1);
    });
  });

  describe('verifyReplyIsExist function', () => {
    it('should throw NotFoundError when reply not exist in database', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action and Assert
      expect(replyRepositoryPostgres.verifyReplyIsExist('reply-notfound')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment exist in database', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'mantap',
        comment: 'comment-001',
        owner: 'user-123',
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action and Assert
      expect(replyRepositoryPostgres.verifyReplyIsExist('reply-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw AuthorizationError when given invalid owner', async () => {
      // Arrange
      const registerReply = new RegisterReply({
        content: 'mantap',
        thread: 'thread-001',
        comment: 'comment-001',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const { id } = await replyRepositoryPostgres.addReply(registerReply);

      // Assert
      expect(replyRepositoryPostgres.verifyReplyOwner(id, 'user-fake123')).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when given valid owner', async () => {
      // Arrange
      const registerReply = new RegisterReply({
        content: 'mantap',
        thread: 'thread-001',
        comment: 'comment-001',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
      const { id } = await replyRepositoryPostgres.addReply(registerReply);

      // Action and Assert
      expect(replyRepositoryPostgres.verifyReplyOwner(id, registerReply.owner))
        .resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteReplyById function', () => {
    it('should change value is_delete to true', async () => {
      // Arrange
      const registerReply = new RegisterReply({
        content: 'mantap',
        thread: 'thread-001',
        comment: 'comment-001',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
      const { id } = await replyRepositoryPostgres.addReply(registerReply);

      // Action
      await replyRepositoryPostgres.deleteReplyById(id);

      // Assert
      const [reply] = await RepliesTableTestHelper.findReplyById(id);
      expect(reply.is_delete).toEqual(true);
    });

    it('should throw error when given invalid replyId', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);

      // Action and Assert
      await expect(replyRepositoryPostgres.deleteReplyById('reply-notfound'))
        .rejects
        .toThrowError(NotFoundError);
    });
  });

  describe('getRepliesByCommentIds', () => {
    it('should return replies correctly', async () => {
      // Arrange
      const firstReplyOnComment001 = {
        id: 'reply-001',
        content: 'content test',
        comment: 'comment-001',
        owner: 'user-123',
      };

      const firstReplyOnComment002 = {
        id: 'reply-002',
        content: 'content test',
        comment: 'comment-002',
        owner: 'user-234',
      };

      await RepliesTableTestHelper.addReply(firstReplyOnComment001);
      await RepliesTableTestHelper.addReply(firstReplyOnComment002);

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const getReplies = await replyRepositoryPostgres.getRepliesByCommentIds(['comment-001', 'comment-002']);

      // Assert
      expect(getReplies).toHaveLength(2);

      expect(getReplies[0].id).toEqual(firstReplyOnComment001.id);
      expect(getReplies[0].content).toEqual(firstReplyOnComment001.content);
      expect(getReplies[0].comment).toEqual(firstReplyOnComment001.comment);
      expect(getReplies[0].owner).toEqual(firstReplyOnComment001.owner);
      expect(getReplies[0].username).toEqual('user123');
      expect(getReplies[0]).toHaveProperty('date');
      expect(getReplies[0]).toHaveProperty('is_delete');

      expect(getReplies[1].id).toEqual(firstReplyOnComment002.id);
      expect(getReplies[1].content).toEqual(firstReplyOnComment002.content);
      expect(getReplies[1].comment).toEqual(firstReplyOnComment002.comment);
      expect(getReplies[1].owner).toEqual(firstReplyOnComment002.owner);
      expect(getReplies[1].username).toEqual('user234');
      expect(getReplies[1]).toHaveProperty('date');
      expect(getReplies[1]).toHaveProperty('is_delete');
    });
  });
});
