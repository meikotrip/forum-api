const RegisterComment = require('../../../Domains/comments/entitites/RegisterComment');
const RegisteredComment = require('../../../Domains/comments/entitites/RegisteredComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'mantap',
      thread: 'thread-001',
      owner: 'user-234',
    };

    const expectedRegisteredComment = new RegisteredComment({
      id: 'comment-001',
      content: 'mantap',
      owner: 'user-234',
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadIsExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(new RegisteredComment({
        id: 'comment-001',
        content: 'mantap',
        owner: 'user-234',
      })));

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const registeredComment = await addCommentUseCase.execute(useCasePayload);

    // Assert
    expect(registeredComment).toStrictEqual(expectedRegisteredComment);
    expect(mockThreadRepository.verifyThreadIsExist).toBeCalledWith(useCasePayload.thread);
    expect(mockCommentRepository.addComment).toBeCalledWith(new RegisterComment({
      content: useCasePayload.content,
      thread: useCasePayload.thread,
      owner: useCasePayload.owner,
    }));
  });
});
