var fs = require('fs')
var input = fs.readFileSync('example.txt', 'utf-8')
var math =  require('math')
var Env = new Map()

function tokenize (chars) {
/* Converts a string of character into a list of tokens
by adding spaces around each paranthesis
and then splitting it by calling input.split(' '). */
  return chars.replace(/\(/g, ' ( ')
              .replace(/\)/g, ' ) ')
              .trim()
              .split(/\s+/)
}

function parse (program) {
// Read an expression from a string.
  return readFromTokens(tokenize(program))
}

function readFromTokens (tokens) {
// Read an expression from a sequence of tokens.
  if (tokens.length === 0) throw SyntaxError('Whoops! Unexpected EOF while reading')
  let token = tokens.pop(0)
  if (token === '(') {
    let L = []
    while (tokens[0] !== ')') {
      L.push(readFromTokens(tokens))
    }
// Popping off #
    tokens.pop(0)
    return L
  } else if (token === ')') throw SyntaxError('Unexpected )')
  else return atom(token)
}

function atom (token) {
// Numbers become numbers and every other token is a symbol
  try {
    return parseInt(token)
  } catch (err) {
    if (err instanceof TypeError) {
      try {
        return parseFloat(token)
      } catch (e) {
        if (e instanceof TypeError) {
          return Symbol(token)
        }
      }
    }
  }
}

function standardEnv () {
  var env = Env()
  env.set({
    '+': function (a, b) { return a + b },
    '-': function (a, b) { if (!b) { return -a } return a - b },
    '*': function (a, b) { return a*b },
    '/': function (a, b) { return a/b },
    '>': function (a, b) { return a>b },
    '>=': function (a, b) { return a>=b },
    '<': function (a, b) { return a<b },
    '<=': function (a, b) { return a<=b },
    'abs': function (x) { return math.abs(x) },
    'cbrt': function (x) { return math.cbrt(x) },
    'ceil': function (x) { return math.ceil(x) },
    'floor': function (x) { return math.floor(x) },
    'log': function (x) { return math.log()}



  })
}

console.log(parse(input))
