const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentDetail = require('../../../Domains/comments/entitites/CommentDetail');
const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');
const ReplyDetail = require('../../../Domains/replies/entities/ReplyDetail');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');

describe('GetDetailThreadUseCase', () => {
  it('should orchestrating get detail thread correctly', async () => {
    // Arrange
    const payload = {
      threadId: 'thread-001',
    };

    const mockThread = new ThreadDetail({
      id: 'thread-001',
      title: 'title thread test',
      body: 'body thread test',
      date: new Date(),
      username: 'dicoding',
    });

    const mockComments = [
      new CommentDetail({
        id: 'comment-001',
        username: 'dikoding',
        date: new Date(),
        content: 'content comment test',
        is_delete: false,
      }),
    ];

    const mockReplies = [
      {
        id: 'reply-001',
        comment: 'comment-001',
        username: 'dicoding',
        date: new Date(),
        content: 'content reply test',
        is_delete: false,
      },
      {
        id: 'reply-002',
        comment: 'comment-001',
        username: 'dicoding',
        date: new Date(),
        content: 'content reply test 2',
        is_delete: false,
      },
    ];

    const expectedThread = {
      ...mockThread,
      comments: mockComments.map((comment) => {
        const repliesComment = mockReplies.filter((reply) => reply.comment === comment.id);
        const replies = repliesComment.map((reply) => new ReplyDetail(reply));
        return {
          ...comment,
          replies,
        };
      }),
    };

    /** creating dependency use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockComments));
    mockReplyRepository.getRepliesByCommentIds = jest.fn()
      .mockImplementation(() => Promise.resolve(mockReplies));

    /** creating use case instance */
    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const thread = await getDetailThreadUseCase.execute(payload);

    // Assert
    expect(thread).toStrictEqual(expectedThread);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(payload.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(payload.threadId);
    expect(mockReplyRepository.getRepliesByCommentIds)
      .toBeCalledWith(mockComments.map((comment) => comment.id));
  });
});
