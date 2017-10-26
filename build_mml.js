var fs = require('fs');
_ = require('underscore');

var source_path = './src/';
var lib_path = './src/lib/';
var require_string = `var _ = require('underscore');
var MML = MML || {};
`;
var export_string = `
module.exports = MML;
`;

var file_names = fs.readdirSync(source_path).filter(file_name => file_name.search(/\.js$/) !== -1);
var lib_files = fs.readdirSync(lib_path).filter(file_name => file_name.search(/\.js$/) !== -1);
var roll20_string = '';
var test_string = `var _ = require('underscore');
var test = {};
`;

_.each(file_names, function(file_name, index) {
  var file_text = fs.readFileSync(source_path + file_name, 'utf-8')
    .replace(/^var _ = require\('underscore'\);$/gm, '')
    .replace(/^var MML = {};\s*/gm, '')
    .replace(/\s*module.exports = MML;$/gm, '');
  if (file_name === 'init.js') {
    roll20_string = 'var MML = MML || {};' + file_text + roll20_string;
  } else {
    roll20_string += file_text;
  }
  test_string += `_.extend(test, require('.${source_path + file_name}'));` + '\n';
  fs.writeFileSync(source_path + file_name, require_string + file_text + export_string, 'utf-8');
});

_.each(lib_files, function(file_name, index) {
  var file_text = fs.readFileSync(lib_path + file_name, 'utf-8')
    .replace(/^var _ = require\('underscore'\);$/gm, '')
    .replace(/^var MML = {};\s*/gm, '')
    .replace(/^module.exports = MML;$/gm, '');
  roll20_string += file_text;
  test_string += `_.extend(test, require('.${lib_path + file_name}'));` + '\n';
  fs.writeFileSync(lib_path + file_name, require_string + file_text + export_string, 'utf-8');
});

test_string += `module.exports = test;`;

fs.writeFileSync('../r20/MML.txt', roll20_string, 'utf8');
fs.writeFileSync('../r20/test/test.js', test_string, 'utf8');
