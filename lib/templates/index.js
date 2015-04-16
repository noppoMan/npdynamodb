var fs = require('fs');

module.exports = {
  npdfile : fs.readFileSync(__dirname + '/npdfile.stub'),

  generator: fs.readFileSync(__dirname + '/generator.stub')
}
