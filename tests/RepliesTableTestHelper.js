/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-001',
    content = 'mantap',
    date = new Date(),
    comment = 'comment-001',
    owner = 'user-234',
  }) {
    const query = {
      text: 'INSERT INTO replies(id, content, date, comment, owner) VALUES($1, $2, $3, $4, $5)',
      values: [id, content, date, comment, owner],
    };

    await pool.query(query);
  },

  async findReplyById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);

    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

module.exports = RepliesTableTestHelper;
