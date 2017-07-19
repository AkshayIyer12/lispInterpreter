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
const divParser = (data) => data.startsWith('/') ? [div, data.slice(1)] : null

/*
const defineParsedOp = (input) => (input.startsWith('define')) ? ['define', input.slice(6)] : null
const ifParsedOp = (input) => (input.startsWith('if')) ? ['if', input.slice(6)] : null
const printParsedOp = (input) => (input.startsWith('print')) ? ['print', input.slice(6)] : null
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

const add = (a, b) => a + b
const sub = (a, b) => a - b
const mul = (a, b) => a * b
const div = (a, b) => {
  if (b === 0) return 'Divide by zero Error'
  return a / b
}

let result = []
let data = '/ 100 50'
let output = divParser(data)
result.push(output[0])
output = spaceParsedOp(output[1])
output = numberParserOp(output[1])
result.push(output[0])
output = spaceParsedOp(output[1])
output = numberParserOp(output[1])
result.push(output[0])
let doga = result.shift()
output = doga(...result)
console.log(output)
