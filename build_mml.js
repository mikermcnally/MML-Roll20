var fs = require('fs');
_ = require('underscore');

var source_path = './src/';
var lib_path = './src/lib/';
var file_names = fs.readdirSync(source_path).filter(file_name => file_name.search(/\.js$/) !== -1);
var lib_files = fs.readdirSync(lib_path).filter(file_name => file_name.search(/\.js$/) !== -1);
var roll20_string = '';

_.each(file_names, function(file_name, index) {
  var file_text = fs.readFileSync(source_path + file_name, 'utf-8');
  if (file_name === 'rx_wrappers.js') {
    roll20_string = 'const MML = {};\n' + file_text + roll20_string;
  } else {
    roll20_string += file_text;
  }
});

_.each(lib_files, function(file_name, index) {
  var file_text = fs.readFileSync(lib_path + file_name, 'utf-8');
  roll20_string += file_text;
});

fs.writeFileSync('../r20/MML.js', roll20_string, 'utf8');
