/*
var fs = require('fs')
var data = fs.readFileSync('newexample.txt', 'utf-8')
*/
/*
const openBracketOp = (input) => (input.startsWith('(')) ? ['(', input.slice(1)] : null
const closeBracketOp = (input) => (input.startsWith(')')) ? [')', input.slice(1)] : null
*/
const spaceParsedOp = (input) => {
  let pulsar = input.match(/^\s+/)
  if (!pulsar) return null
  let pulsarLength = pulsar[0].length
  return [null, input.slice(pulsarLength)]
}

const plusParser = (data) => data.startsWith('+') ? [add, data.slice(1)] : null
const minusParser = (data) => data.startsWith('-') ? [sub, data.slice(1)] : null
const starParser = (data) => data.startsWith('*') ? [mul, data.slice(1)] : null
const slashParser = (data) => data.startsWith('/') ? [div, data.slice(1)] : null

const greaterThanParser = (data) => data.startsWith('>') ? [greaterThan, data.slice(1)] : null
const lessThanParser = (data) => data.startsWith('<') ? [lessThan, data.slice(1)] : null
const greaterThanEqualToParser = (data) => data.startsWith('>=') ? [greaterThanEqualTo, data.slice(2)] : null
const lessThanEqualToParser = (data) => data.startsWith('<=') ? [lessThanEqualTo, data.slice(2)] : null
const EqualToParser = (data) => data.startsWith('==') ? [EqualTo, data.slice(2)] : null

const maxParser = (data) => data.startsWith('max') ? [maxNumber, input.slice(3)] : null
const minParser = (data) => data.startsWith('min') ? [minNumber, input.slice(3)] : null
const notParser = (data) => data.startsWith('not') ? [notNumber, input.slice(3)] : null

/*
const defineParsedOp = (input) => (input.startsWith('define')) ? ['define', input.slice(6)] : null
const printParsedOp = (input) => (input.startsWith('print')) ? ['print', input.slice(6)] : null
const ifParsedOp = (input) => (input.startsWith('if')) ? ['if', input.slice(6)] : null
*/

const identifierParsedOp = (input) => {
  let re = /^[a-z]+[0-9]*[a-z]*/i
  let indica = input.match(re)
  if (!indica) return null
  let indicaLength = indica[0].length
  return [indica[0], input.slice(indicaLength)]
}
const numberParserOp = (input) => {
  let re = /^[0-9]+/
  let data = re.exec(input)
  if (data) return [parseInt(data[0]), input.slice(data[0].length)]
  return null
}
const operatorParser = (input) => { return (plusParser(input) || minusParser(input) || starParser(input) || slashParser(input) || greaterThanParser(input) || lessThanParser(input) || greaterThanEqualToParser(input) || lessThanEqualToParser(input) || maxParser(input) || minParser(input) || notParser(input)) }

const add = (a, b) => a + b
const sub = (a, b) => a - b
const mul = (a, b) => a * b
const div = (a, b) => {
  if (b === 0) return 'Divide by zero Error'
  return a / b
}

const greaterThan = (a, b) => a > b
const lessThan = (a, b) => a < b
const greaterThanEqualTo = (a, b) => a >= b
const lessThanEqualTo = (a, b) => a <= b
const EqualTo = (a, b) => a === b

const maxNumber = (a, b) => a > b ? a : b
const minNumber = (a, b) => a < b ? a : b
const notNumber = (a) => !a

const expressionParser = (input) => {
  let result = []
  let output
  if (!input.startsWith('(')) return null
  input = input.slice(1)
  while (true) {
    output = greaterThanEqualToParser(input)
    if (!output) return null
    result.push(output[0])
    output = spaceParsedOp(output[1])
    output = numberParserOp(output[1])
    result.push(output[0])
    output = spaceParsedOp(output[1])
    output = numberParserOp(output[1])
    result.push(output[0])
    if (output[1] === ')') return result
  }
}
let result = []
let input = '(>= 100 50)'
result = expressionParser(input)
let doga = result.shift()
let output = doga(...result)
console.log(output)
