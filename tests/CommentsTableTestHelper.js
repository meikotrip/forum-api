/* istanbul ignore file */

const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-001',
    content = 'mantap',
    date = new Date(),
    thread = 'thread-001',
    owner = 'user-234',
  }) {
    const query = {
      text: 'INSERT INTO comments(id, content, date, thread, owner) VALUES($1, $2, $3, $4, $5)',
      values: [id, content, date, thread, owner],
    };

    await pool.query(query);
  },

  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);

    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
