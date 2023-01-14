const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  const userTest = {
    username: 'fake',
    password: 'fake123',
    fullname: 'fake user',
  };

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  beforeAll(async () => {
    const server = await createServer(container);

    await server.inject({
      method: 'POST',
      url: '/users',
      payload: userTest,
    });
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('when /POST threads', () => {
    it('should response 201 and response registered threads', async () => {
      // Arrange
      const server = await createServer(container);

      const authenticationResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: userTest.username,
          password: userTest.password,
        },
      });

      const { accessToken } = JSON.parse(authenticationResponse.payload).data;

      const requestThreadPayload = {
        title: 'Title thread test',
        body: 'Body thread test',
      };

      // Action
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestThreadPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(threadResponse.payload);
      expect(threadResponse.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });
  });

  it('should response 401 if not authenticated', async () => {
    // Arrange
    const server = await createServer(container);

    // Action
    const threadResponse = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: {},
    });

    // Assert
    const responseJson = JSON.parse(threadResponse.payload);
    expect(threadResponse.statusCode).toEqual(401);
    expect(responseJson).toHaveProperty('message');
    expect(responseJson.message).toEqual('Missing authentication');
  });

  it('should response 400 when request payload not contain needed property', async () => {
    // Arrange
    const server = await createServer(container);

    const authenticationResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: userTest.username,
        password: userTest.password,
      },
    });

    const { accessToken } = JSON.parse(authenticationResponse.payload).data;

    const requestThreadPayload = {
      title: 'Title thread test',
      // missing body
    };

    // Action
    const threadResponse = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: requestThreadPayload,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Assert
    const responseJson = JSON.parse(threadResponse.payload);
    expect(threadResponse.statusCode).toEqual(400);
    expect(responseJson.status).toEqual('fail');
    expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
  });

  it('should response 400 when request payload not meet data type specification', async () => {
    // Arrange
    const server = await createServer(container);

    const authenticationResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: userTest.username,
        password: userTest.password,
      },
    });

    const { accessToken } = JSON.parse(authenticationResponse.payload).data;

    const requestThreadPayload = {
      title: true,
      body: ['aku'],
    };

    // Action
    const threadResponse = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: requestThreadPayload,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Assert
    const responseJson = JSON.parse(threadResponse.payload);
    expect(threadResponse.statusCode).toEqual(400);
    expect(responseJson.status).toEqual('fail');
    expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 status when given threadId correctly', async () => {
      // Arrange
      const server = await createServer(container);

      //  Registrating Users
      const userSatuPayload = {
        username: 'usersatu',
        password: 'secret',
        fullname: 'user satu',
      };

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: userSatuPayload,
      });

      const userDuaPayload = {
        username: 'userdua',
        password: 'secret',
        fullname: 'user dua',
      };

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: userDuaPayload,
      });

      // Authenticating Users
      const responseLoginUserSatu = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: userSatuPayload.username,
          password: userSatuPayload.password,
        },
      });

      const accessTokenUserSatu = JSON.parse(responseLoginUserSatu.payload).data.accessToken;

      const responseLoginUserDua = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: userDuaPayload.username,
          password: userDuaPayload.password,
        },
      });

      const accessTokenUserDua = JSON.parse(responseLoginUserDua.payload).data.accessToken;

      // Creating Thread by User Satu
      const responseThreadUserSatu = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'title thread test',
          body: 'body thread test',
        },
        headers: {
          Authorization: `Bearer ${accessTokenUserSatu}`,
        },
      });

      const { addedThread } = JSON.parse(responseThreadUserSatu.payload).data;

      // Comment By User Satu
      const responseCommentUserSatu = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: {
          content: 'content comment test',
        },
        headers: {
          Authorization: `Bearer ${accessTokenUserSatu}`,
        },
      });

      const { addedComment: userSatuComment } = JSON.parse(responseCommentUserSatu.payload).data;

      // Delete Comment by User Satu
      await server.inject({
        method: 'DELETE',
        url: `/threads/${addedThread.id}/comments/${userSatuComment.id}`,
        headers: {
          Authorization: `Bearer ${accessTokenUserSatu}`,
        },
      });

      // Comment By User Dua
      const responseCommentUserDua = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: {
          content: 'content comment test',
        },
        headers: {
          Authorization: `Bearer ${accessTokenUserDua}`,
        },
      });

      const { addedComment: userDuaComment } = JSON.parse(responseCommentUserDua.payload).data;

      // Reply Comment User Dua By User Satu
      await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments/${userDuaComment.id}/replies`,
        payload: {
          content: 'reply comment 1',
        },
        headers: {
          Authorization: `Bearer ${accessTokenUserSatu}`,
        },
      });

      // Action
      const responseGetDetailThread = await server.inject({
        method: 'GET',
        url: `/threads/${addedThread.id}`,
      });

      // Assert
      const responseJson = JSON.parse(responseGetDetailThread.payload);
      const { thread } = responseJson.data;
      expect(responseGetDetailThread.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toHaveProperty('thread');
      expect(thread.id).toEqual(addedThread.id);
      expect(thread.username).toEqual(userSatuPayload.username);
      expect(thread.comments).toHaveLength(2);

      const deletedComment = thread.comments.find((comment) => comment.id === userSatuComment.id);
      const notdeletedcomment = thread.comments.find((comment) => comment.id === userDuaComment.id);
      expect(deletedComment.content).toEqual('**komentar telah dihapus**');
      expect(notdeletedcomment).toHaveProperty('replies');
      expect(notdeletedcomment.replies).toHaveLength(1);
    });

    it('should response 404 when given invalid thread id', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-notFound',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });
  });
});
