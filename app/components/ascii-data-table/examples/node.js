var AsciiTable = require('../lib/ascii-data-table')
console.log('\n')
console.log(AsciiTable.default.run([['x', 'y'], ['a', 'b'], ['c', 'd']]))
console.log('\n')
console.log(AsciiTable.default.run([['x', 'y'], [['a', 'b'], 'ab'], [['c'], 'd']]))
console.log('\n')
console.log(AsciiTable.default.run([['x', 'y'], [{a: 'a', b: 'b'}, 'ab'], ['c', {d: 'd'}]]))
console.log('\n')
console.log(AsciiTable.default.run([['xxxxxx', 'yyyyyy'], ['aaaaa', 'bbb'], [{c: 'cccccc'}, ['ddddd']]], {maxColumnWidth: 4}))
console.log('\n')

console.log(AsciiTable.default.run([
  ['title', 'description'],
  ['A Few Good Men', 'In the heart of the nation\'s capital, in a courthouse of the U.S. government, one man will stop at nothing to keep his honor, and one will stop at nothing to find the truth.'],
  ['Charlie Wilson\'s War', 'A stiff drink. A little mascara. A lot of nerve. Who said they couldn\'t bring down the Soviet empire.']
]))
