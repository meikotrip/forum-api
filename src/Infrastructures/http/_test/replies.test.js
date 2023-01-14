const pool = require('../../database/postgres/pool');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  const userThread = {
    username: 'userthread',
    password: 'secret',
    fullname: 'user pembuat thread',
  };

  const userComment = {
    username: 'usercomment',
    password: 'secret',
    fullname: 'user pembuat comment',
  };

  const exampleThread = {
    title: 'title thread test',
    body: 'body thread test',
  };

  const exampleComment = {
    content: 'mantap',
  };

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
  });

  beforeAll(async () => {
    const server = await createServer(container);

    const userThreadResponse = await server.inject({
      method: 'POST',
      url: '/users',
      payload: userThread,
    });

    const userCommentResponse = await server.inject({
      method: 'POST',
      url: '/users',
      payload: userComment,
    });

    const authUserThreadResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: userThread.username,
        password: userThread.password,
      },
    });

    const authUserCommentResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: userComment.username,
        password: userComment.password,
      },
    });

    userThread.id = JSON.parse(userThreadResponse.payload).data.addedUser.id;
    userComment.id = JSON.parse(userCommentResponse.payload).data.addedUser.id;
    userThread.accessToken = JSON.parse(authUserThreadResponse.payload).data.accessToken;
    userComment.accessToken = JSON.parse(authUserCommentResponse.payload).data.accessToken;
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and response registered reply', async () => {
      // Arrange
      const server = await createServer(container);

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: exampleThread,
        headers: {
          Authorization: `Bearer ${userThread.accessToken}`,
        },
      });

      const { addedThread } = JSON.parse(threadResponse.payload).data;

      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: exampleComment,
        headers: {
          Authorization: `Bearer ${userComment.accessToken}`,
        },
      });

      const { addedComment } = JSON.parse(commentResponse.payload).data;

      // Action
      const replyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        payload: {
          content: 'mantap',
        },
        headers: {
          Authorization: `Bearer ${userThread.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(replyResponse.payload);
      expect(replyResponse.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });

    it('should response 401 when not given accessToken', async () => {
      // Arrange
      const server = await createServer(container);

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: exampleThread,
        headers: {
          Authorization: `Bearer ${userThread.accessToken}`,
        },
      });

      const { addedThread } = JSON.parse(threadResponse.payload).data;

      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: exampleComment,
        headers: {
          Authorization: `Bearer ${userComment.accessToken}`,
        },
      });

      const { addedComment } = JSON.parse(commentResponse.payload).data;

      // Action
      const replyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        payload: {
          content: 'mantap',
        },
        headers: {}, // Empty
      });

      // Assert
      const responseJson = JSON.parse(replyResponse.payload);
      expect(replyResponse.statusCode).toEqual(401);
      expect(responseJson.message).toBeDefined();
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const server = await createServer(container);

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: exampleThread,
        headers: {
          Authorization: `Bearer ${userThread.accessToken}`,
        },
      });

      const { addedThread } = JSON.parse(threadResponse.payload).data;

      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: exampleComment,
        headers: {
          Authorization: `Bearer ${userComment.accessToken}`,
        },
      });

      const { addedComment } = JSON.parse(commentResponse.payload).data;

      // Action
      const replyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        payload: { },
        headers: {
          Authorization: `Bearer ${userThread.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(replyResponse.payload);
      expect(replyResponse.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const server = await createServer(container);

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: exampleThread,
        headers: {
          Authorization: `Bearer ${userThread.accessToken}`,
        },
      });

      const { addedThread } = JSON.parse(threadResponse.payload).data;

      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: exampleComment,
        headers: {
          Authorization: `Bearer ${userComment.accessToken}`,
        },
      });

      const { addedComment } = JSON.parse(commentResponse.payload).data;

      // Action
      const replyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        payload: {
          content: [true],
        },
        headers: {
          Authorization: `Bearer ${userThread.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(replyResponse.payload);
      expect(replyResponse.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena tipe data tidak sesuai');
    });

    it('should response 404 when given invalid thread', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const replyResponse = await server.inject({
        method: 'POST',
        url: '/threads/thread-notfound/comments/comment-notfound/replies',
        payload: {
          content: 'mantap',
        },
        headers: {
          Authorization: `Bearer ${userThread.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(replyResponse.payload);
      expect(replyResponse.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });

    it('should response 404 when given invalid comment', async () => {
      // Arrange
      const server = await createServer(container);

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: exampleThread,
        headers: {
          Authorization: `Bearer ${userThread.accessToken}`,
        },
      });

      const { addedThread } = JSON.parse(threadResponse.payload).data;

      // Action
      const replyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments/comment-notfound/replies`,
        payload: {
          content: 'mantap',
        },
        headers: {
          Authorization: `Bearer ${userThread.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(replyResponse.payload);
      expect(replyResponse.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Komentar tidak ditemukan');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 when given valid payload', async () => {
      // Arrange
      const server = await createServer(container);

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: exampleThread,
        headers: {
          Authorization: `Bearer ${userThread.accessToken}`,
        },
      });

      const { addedThread } = JSON.parse(threadResponse.payload).data;

      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: exampleComment,
        headers: {
          Authorization: `Bearer ${userComment.accessToken}`,
        },
      });

      const { addedComment } = JSON.parse(commentResponse.payload).data;

      const replyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        payload: {
          content: 'mantap',
        },
        headers: {
          Authorization: `Bearer ${userThread.accessToken}`,
        },
      });

      const { addedReply } = JSON.parse(replyResponse.payload).data;

      // Action
      const deleteReplyResponse = await server.inject({
        method: 'DELETE',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies/${addedReply.id}`,
        headers: {
          Authorization: `Bearer ${userThread.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(deleteReplyResponse.payload);
      expect(deleteReplyResponse.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 401 status code when not given accessToken', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-fake/comments/comment-fake/replies/reply-fake',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 403 when invalid owner', async () => {
      // Arrange
      const server = await createServer(container);

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: exampleThread,
        headers: {
          Authorization: `Bearer ${userThread.accessToken}`,
        },
      });

      const { addedThread } = JSON.parse(threadResponse.payload).data;

      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: exampleComment,
        headers: {
          Authorization: `Bearer ${userComment.accessToken}`,
        },
      });

      const { addedComment } = JSON.parse(commentResponse.payload).data;

      const replyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        payload: {
          content: 'mantap',
        },
        headers: {
          Authorization: `Bearer ${userThread.accessToken}`,
        },
      });

      const { addedReply } = JSON.parse(replyResponse.payload).data;

      // Action
      const deleteReplyResponse = await server.inject({
        method: 'DELETE',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies/${addedReply.id}`,
        headers: {
          Authorization: `Bearer ${userComment.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(deleteReplyResponse.payload);
      expect(deleteReplyResponse.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Anda tidak berhak mengakses resource ini');
    });

    it('should response 404 status code when not given valid threadId', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-notfound/comments/comment-notfound/replies/reply-notfound',
        headers: {
          Authorization: `Bearer ${userThread.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });

    it('should response 404 status code when not given valid commentId', async () => {
      // Arrange
      const server = await createServer(container);

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: exampleThread,
        headers: {
          Authorization: `Bearer ${userThread.accessToken}`,
        },
      });

      const { addedThread } = JSON.parse(threadResponse.payload).data;

      // Action
      const deleteReplyResponse = await server.inject({
        method: 'DELETE',
        url: `/threads/${addedThread.id}/comments/comment-notfound/replies/reply-notfound`,
        headers: {
          Authorization: `Bearer ${userThread.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(deleteReplyResponse.payload);
      expect(deleteReplyResponse.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Komentar tidak ditemukan');
    });

    it('should response 404 status code when not given valid replyId', async () => {
      // Arrange
      const server = await createServer(container);

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: exampleThread,
        headers: {
          Authorization: `Bearer ${userThread.accessToken}`,
        },
      });

      const { addedThread } = JSON.parse(threadResponse.payload).data;

      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: exampleComment,
        headers: {
          Authorization: `Bearer ${userComment.accessToken}`,
        },
      });

      const { addedComment } = JSON.parse(commentResponse.payload).data;

      // Action
      const deleteReplyResponse = await server.inject({
        method: 'DELETE',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies/reply-notfound`,
        headers: {
          Authorization: `Bearer ${userThread.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(deleteReplyResponse.payload);
      expect(deleteReplyResponse.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Reply tidak ditemukan');
    });
  });
});
