const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments endpoint', () => {
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

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
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
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments/', () => {
    it('should response 201 and response registered comments', async () => {
      // Arrange
      const server = await createServer(container);

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'Title thread test',
          body: 'Body thread test',
        },
        headers: {
          Authorization: `Bearer ${userThread.accessToken}`,
        },
      });

      const { addedThread } = JSON.parse(threadResponse.payload).data;

      const requestCommentPayload = {
        content: 'content comment test',
      };

      // Action
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: requestCommentPayload,
        headers: {
          Authorization: `Bearer ${userComment.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(commentResponse.payload);
      expect(commentResponse.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 401 when not given accessToken', async () => {
      // Arrange
      const server = await createServer(container);

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'Title thread test',
          body: 'Body thread test',
        },
        headers: {
          Authorization: `Bearer ${userThread.accessToken}`,
        },
      });

      const { addedThread } = JSON.parse(threadResponse.payload).data;

      const requestCommentPayload = {
        content: 'content comment test',
      };

      // Action
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: requestCommentPayload,
        headers: {}, // accessToken empty
      });

      // Assert
      const responseJson = JSON.parse(commentResponse.payload);
      expect(commentResponse.statusCode).toEqual(401);
      expect(responseJson.message).toBeDefined();
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const server = await createServer(container);

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'Title thread test',
          body: 'Body thread test',
        },
        headers: {
          Authorization: `Bearer ${userThread.accessToken}`,
        },
      });

      const { addedThread } = JSON.parse(threadResponse.payload).data;

      const requestCommentPayload = { };

      // Action
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: requestCommentPayload,
        headers: {
          Authorization: `Bearer ${userComment.accessToken}`,
        },
      });

      const responseJson = JSON.parse(commentResponse.payload);
      expect(commentResponse.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const server = await createServer(container);

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'Title thread test',
          body: 'Body thread test',
        },
        headers: {
          Authorization: `Bearer ${userThread.accessToken}`,
        },
      });

      const { addedThread } = JSON.parse(threadResponse.payload).data;

      const requestCommentPayload = {
        content: [true],
      };

      // Action
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: requestCommentPayload,
        headers: {
          Authorization: `Bearer ${userComment.accessToken}`,
        },
      });

      const responseJson = JSON.parse(commentResponse.payload);
      expect(commentResponse.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena tipe data tidak sesuai');
    });

    it('should response 404 when given invalid threadId', async () => {
      // Arrange
      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'Title thread test',
          body: 'Body thread test',
        },
        headers: {
          Authorization: `Bearer ${userThread.accessToken}`,
        },
      });

      const requestCommentPayload = {
        content: 'content comment test',
      };

      // Action
      const commentResponse = await server.inject({
        method: 'POST',
        url: '/threads/thread-fakeId/comments',
        payload: requestCommentPayload,
        headers: {
          Authorization: `Bearer ${userComment.accessToken}`,
        },
      });

      const responseJson = JSON.parse(commentResponse.payload);
      expect(commentResponse.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 status when given valid payload', async () => {
      // Arrange
      const server = await createServer(container);

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'Title thread test',
          body: 'Body thread test',
        },
        headers: {
          Authorization: `Bearer ${userThread.accessToken}`,
        },
      });

      const { addedThread } = JSON.parse(threadResponse.payload).data;

      const postCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: {
          content: 'content comment test',
        },
        headers: {
          Authorization: `Bearer ${userComment.accessToken}`,
        },
      });

      const { addedComment } = JSON.parse(postCommentResponse.payload).data;

      // Action
      const deleteCommentResponse = await server.inject({
        method: 'DELETE',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}`,
        headers: {
          Authorization: `Bearer ${userComment.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(deleteCommentResponse.payload);
      expect(deleteCommentResponse.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 401 status code when not given accessToken', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-fake/comments/comment-fake',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 status code when not given valid threadId', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-notfound/comments/comment-invalid',
        headers: {
          Authorization: `Bearer ${userComment.accessToken}`,
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
        payload: {
          title: 'Title thread test',
          body: 'Body thread test',
        },
        headers: {
          Authorization: `Bearer ${userThread.accessToken}`,
        },
      });

      const { addedThread } = JSON.parse(threadResponse.payload).data;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${addedThread.id}/comments/comment-notfound`,
        headers: {
          Authorization: `Bearer ${userComment.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Komentar tidak ditemukan');
    });

    it('should response 403 when invalid owner', async () => {
      // Arrange
      const server = await createServer(container);

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'Title thread test',
          body: 'Body thread test',
        },
        headers: {
          Authorization: `Bearer ${userThread.accessToken}`,
        },
      });

      const { addedThread } = JSON.parse(threadResponse.payload).data;

      const postCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: {
          content: 'content comment test',
        },
        headers: {
          Authorization: `Bearer ${userComment.accessToken}`,
        },
      });

      const { addedComment } = JSON.parse(postCommentResponse.payload).data;

      // Action
      const deleteCommentResponse = await server.inject({
        method: 'DELETE',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}`,
        headers: {
          Authorization: `Bearer ${userThread.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(deleteCommentResponse.payload);
      expect(deleteCommentResponse.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Anda tidak berhak mengakses resource ini');
    });
  });
});
