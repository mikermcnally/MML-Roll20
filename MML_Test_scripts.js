_ = require('underscore');
var roll20 = require('../Roll20 Emulation/Roll20');

state = roll20.state;
log = roll20.log;
sendChat = roll20.sendChat;
createObj = roll20.createObj;
getObj = roll20.getObj;
findObj = roll20.findObj;
randomInteger = roll20.randomInteger;
Campaign = roll20.Campaign;
on = function(event){};

var MML = require('./MML_test').MML;

console.log(MML);

_.each(MML, function(thing){
    console.log(thing);
});