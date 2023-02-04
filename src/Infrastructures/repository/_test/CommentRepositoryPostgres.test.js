const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const RegisterComment = require('../../../Domains/comments/entitites/RegisterComment');
const RegisteredComment = require('../../../Domains/comments/entitites/RegisteredComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'user123' }); // User who creating thread (user-123)
    await UsersTableTestHelper.addUser({ id: 'user-234', username: 'user234' }); // Users who commenting thread
    await ThreadsTableTestHelper.addThread({ id: 'thread-001', owner: 'user-123' }); // Thread already created by user-123
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  describe('addComment function', () => {
    it('shouls persist register comment in database', async () => {
      // Arrange
      const registerComment = new RegisterComment({
        content: 'mantap',
        thread: 'thread-001',
        owner: 'user-234',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(registerComment);

      // Assert
      const commented = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(commented).toHaveLength(1);
    });

    it('should return registered comment correctly', async () => {
      // Arrange
      const registerComment = new RegisterComment({
        content: 'mantap',
        thread: 'thread-001',
        owner: 'user-234',
      });
      const fakeIdGenerator = jest.fn().mockImplementation(() => '123');
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const registeredComment = await commentRepositoryPostgres.addComment(registerComment);

      // Assert
      expect(registeredComment).toStrictEqual(new RegisteredComment({
        id: 'comment-123',
        content: registerComment.content,
        owner: registerComment.owner,
      }));
      expect(fakeIdGenerator).toBeCalledTimes(1);
    });
  });

  describe('verifyCommentIsExist function', () => {
    it('should throw NotFoundError when comment not exist in database', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      expect(commentRepositoryPostgres.verifyCommentIsExist('comment-notfound')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment exist in database', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'mantap',
        thread: 'thread-001',
        owner: 'user-234',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      expect(commentRepositoryPostgres.verifyCommentIsExist('comment-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError when given invalid owner', async () => {
      // Arrange
      const registerComment = new RegisterComment({
        content: 'mantap',
        thread: 'thread-001',
        owner: 'user-234',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const { id } = await commentRepositoryPostgres.addComment(registerComment);

      // Assert
      expect(commentRepositoryPostgres.verifyCommentOwner(id, 'user-fake234')).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when given valid owner', async () => {
      // Arrange
      const registerComment = new RegisterComment({
        content: 'mantap',
        thread: 'thread-001',
        owner: 'user-234',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      const { id } = await commentRepositoryPostgres.addComment(registerComment);

      // Action and Assert
      expect(commentRepositoryPostgres.verifyCommentOwner(id, registerComment.owner))
        .resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteCommentById function', () => {
    it('should change value is_delete to true', async () => {
      // Arrange
      const registerComment = new RegisterComment({
        content: 'mantap',
        thread: 'thread-001',
        owner: 'user-234',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      const { id } = await commentRepositoryPostgres.addComment(registerComment);

      // Action
      await commentRepositoryPostgres.deleteCommentById(id);

      // Assert
      const [comment] = await CommentsTableTestHelper.findCommentById(id);
      expect(comment.is_delete).toEqual(true);
    });

    it('should throw error when given invalid commentId', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      // Action and Assert
      await expect(commentRepositoryPostgres.deleteCommentById('comment-notfound'))
        .rejects
        .toThrowError(NotFoundError);
    });
  });

  describe('getCommentsByThreadId', () => {
    it('should return comments correctly', async () => {
      // Arrange
      const currentDate = new Date();
      await CommentsTableTestHelper.addComment({
        id: 'comment-001',
        thread: 'thread-001',
        owner: 'user-234',
        content: 'content test',
        date: currentDate,
      });

      async function addCommentAnotherThread() {
        await ThreadsTableTestHelper.addThread({
          id: 'thread-100',
          owner: 'user-123',
        });

        await CommentsTableTestHelper.addComment({
          id: 'comment-100',
          thread: 'thread-100',
          owner: 'user-234',
          content: 'content lain test',
        });
      }
      await addCommentAnotherThread();
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-001');

      // Assert
      expect(comments).toHaveLength(1);
      expect(comments[0].id).toEqual('comment-001');
      expect(comments[0].username).toEqual('user234');
      expect(comments[0].date).toEqual(currentDate);
      expect(comments[0].content).toEqual('content test');
    });
  });
});
