const RegisterReply = require('../../../Domains/replies/entities/RegisterReply');
const RegisteredComment = require('../../../Domains/comments/entitites/RegisteredComment');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'mantap',
      comment: 'comment-001',
      thread: 'thread-001',
      owner: 'user-234',
    };

    const expectedRegisteredReply = new RegisteredComment({
      id: 'reply-001',
      content: 'mantap',
      owner: 'user-234',
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadIsExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentIsExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(new RegisteredComment({
        id: 'reply-001',
        content: 'mantap',
        owner: 'user-234',
      })));

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const registeredReply = await addReplyUseCase.execute(useCasePayload);

    // Assert
    expect(registeredReply).toStrictEqual(expectedRegisteredReply);
    expect(mockThreadRepository.verifyThreadIsExist).toBeCalledWith(useCasePayload.thread);
    expect(mockCommentRepository.verifyCommentIsExist).toBeCalledWith(useCasePayload.comment);
    expect(mockReplyRepository.addReply).toBeCalledWith(new RegisterReply({
      content: useCasePayload.content,
      comment: useCasePayload.comment,
      thread: useCasePayload.thread,
      owner: useCasePayload.owner,
    }));
  });
});
