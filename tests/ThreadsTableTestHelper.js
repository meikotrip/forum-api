/* istanbul ignore file */

const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadsTableTestHelper = {
  async addThread({
    id = 'thread-001',
    title = 'Bagaimana pengalaman kalian dalam bermain game Marvel SNAP ?',
    body = 'Saya telah bermain marvel SNAP selama 2 bulan, game ini sangat menarik',
    date = new Date(),
    owner = 'user-123',
  }) {
    const query = {
      text: 'INSERT INTO threads(id, title, body, date, owner) VALUES($1, $2, $3, $4, $5)',
      values: [id, title, body, date, owner],
    };

    await pool.query(query);
  },

  async findThreadById(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM threads WHERE 1=1');
  },
};

module.exports = ThreadsTableTestHelper;
