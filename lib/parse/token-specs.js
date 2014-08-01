'use strict';

var string = /"([^"]+)?"/;

module.exports = [
  {type: 'command', regex: /(?:click|close|find|get|include|quit|refresh|set|sleep|submit|type)(?=\s|$)/},
  {type: 'in', regex: /(?:in)(?=\s)/},
  {type: 'operator', regex: /(?:equal|or|and)(?=\s)/},
  {type: 'string', regex: string},
  {type: 'number', regex: /[0-9]+(?:\.[0-9]+)?/},
  {type: 'variable', regex: /[a-zA-Z]{1,}(?:(?:\.[a-z0-9_A-Z]+)+|[a-z0-9_A-Z]+)?/},
  {type: 'space', regex: /\s+/}
];
