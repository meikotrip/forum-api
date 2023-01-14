/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn('replies', {
    is_delete: {
      type: 'boolean',
      default: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('replies', 'is_delete');
};
