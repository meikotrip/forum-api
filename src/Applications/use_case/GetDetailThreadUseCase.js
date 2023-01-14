const ReplyDetail = require('../../Domains/replies/entities/ReplyDetail');

class GetDetailThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this.threadRepository = threadRepository;
    this.commentRepository = commentRepository;
    this.replyRepository = replyRepository;
  }

  async execute(payload) {
    const thread = await this.threadRepository.getThreadById(payload.threadId);
    const commentsDetail = await this.commentRepository.getCommentsByThreadId(payload.threadId);
    const repliesDetail = await this.replyRepository
      .getRepliesByCommentIds(commentsDetail.map((comment) => comment.id));

    const replies = this.mapReply(repliesDetail);

    const comments = commentsDetail.map((comment) => ({
      ...comment,
      replies: replies[comment.id],
    }));

    return {
      ...thread,
      comments,
    };
  }

  mapReply(replies) {
    const result = {};
    replies.forEach((reply) => {
      const comment = new ReplyDetail(reply);
      if (!result[reply.comment]) {
        result[reply.comment] = [comment];
      } else {
        result[reply.comment].push(comment);
      }
    });

    return result;
  }
}

module.exports = GetDetailThreadUseCase;
