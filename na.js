#!  /usr/local/bin/node

const fs = require('fs');
const readline = require('readline');
const color = require('colors');
const moment = require('moment');
const q = require('./q.json');

const rl = readline.createInterface(process.stdin, process.stdout);
const headers = ['Date'].concat(q.map(i => i.Column)).concat('Total');

const isEdit = Boolean(~process.argv.indexOf('-e'));
let editDate;

if (isEdit) {
  editDate = process.argv[process.argv.indexOf('-e') + 1]
  if (!editDate) {
    error('No date to edit');
  }
}

const isInfo = Boolean(~process.argv.indexOf('--help'));

if (isInfo) {
  console.log(
    q
      .filter(i => i.isValue)
      .map(i => {
        return `Column: ${i.Column}: Question: ${i.Question} (awaits: ${i.awaits || 'anything'}) ${i.default ? '[default: ' + i.default + ' ]' : '' }`;
      }).join('\n'))
  process.exit(0);
}

let f = readFile('data.csv');
let date = isEdit ? editDate : moment().format('DD-MM-YYYY')
let i = 0;
let answers = [date];
let question = q[i];
let weight = 0;

prnt(question);
rl.setPrompt('> ');
rl.prompt();

rl.on('line', (line) => {
  let answer = line.toLowerCase();

  if (question.awaits && !~question.awaits.indexOf(answer) && !(answer === '' && question.default)) {
    console.log((question.Error || `Wrong answers! Awaits: ${question.awaits.join(', ')}`).red);
    prnt(question);
  } else {
    i++;
    let val = value(line || question.default)
    weight += (question.isValue && val) ? 1 : 0;
    answers.push(val);
    question = q[i];
    if (question) {
      prnt(question);
    } else {
      answers.push(weight);
      update(answers);
      rl.close()
    }
  }
  rl.prompt();
}).on('close', () => {
  console.log('Have a great day!'.green);
  process.exit(0);
});

function update (list) {
  if (f) {
    const lines = f.split('\n');
    const hasDate = lines.some(line => {
      return line.split(',')[0] === date;
    });
    
    if (hasDate) {
      f = f.split('\n')
        .map(line => line.split(',')[0] === date ? answers.join(',') : line)
        .join('\n');
    } else {
      f += '\n' + answers.join(',')  ;
    }
  } else {
    f = [
      headers.join(','),
      answers.join(',')
    ].join('\n');
  }

  fs.writeFileSync('./data.csv', f);
}

function value(a) {
  var val = ({
    'y': true,
    'n': false,
    'yes': true,
    'no': false
  })[a];
  return val === undefined ? a : val;
}

function error(msg) {
   console.log(msg.red);
   process.exit(1)
}

function prnt (q) {
  console.log(`${q.Question} ${q.prompt}`.yellow);
}

function readFile (f, callback) {
  let file;
  try {
    file = fs.readFileSync(file, 'utf-8');
  } catch (e) {
    callback && callback(f);
  }
  return file;
}