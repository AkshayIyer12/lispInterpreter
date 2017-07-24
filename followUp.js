var fs = require('fs')
var input = fs.readFileSync('followUpTestSet.txt', 'utf-8')
const ENV = {}

// Space parser
const spaceParsedOp = (input) => {
  let pulsar = input.match(/^\s+/)
  if (!pulsar) return null
  let pulsarLength = pulsar[0].length
  return [null, input.slice(pulsarLength)]
}

// Identifier Parser
const identifierParsedOp = (input) => {
  let re = /^[a-z]+[0-9]*[a-z]*/i
  let indica = input.match(re)
  if (!indica) return null
  let indicaLength = indica[0].length
  return [indica[0], input.slice(indicaLength)]
}

// Number parser
const numberParserOp = (input) => {
  let re = /^[0-9]+/
  let data = re.exec(input)
  if (data) return [parseInt(data[0]), input.slice(data[0].length)]
  return null
}

/* Simple arithmetic functions */
const add = simba => simba.reduce((accum, value) => {
  if (ENV[value]) return accum + ENV[value]
  return accum + value
}, 0)
const sub = simba => simba.reduce((accum, value) => {
  if (ENV[value]) return accum - ENV[value]
  return accum - value
})
const mul = simba => simba.reduce((accum, value) => {
  if (ENV[value]) return accum * ENV[value]
  return accum * value
}, 1)
const div = simba => simba.reduce((accum, value) => {
  if (ENV[value]) return accum / ENV[value]
  return accum / value
})

/* Comparison Operators */
const greaterThan = (a, b) => a > b
const lessThan = (a, b) => a < b
const greaterThanEqualTo = (a, b) => a >= b
const lessThanEqualTo = (a, b) => a <= b
const EqualTo = (a, b) => a === b
const notNumber = (a) => !a

/* Finding max and min numbers */
const maxNumber = (a, b) => a > b ? a : b
const minNumber = (a, b) => a < b ? a : b

/* Define, Print and if operations */
const defLisp = (a, b) => { ENV[a] = b }
const printLisp = (a) => {
  if (ENV[a]) { console.log(ENV[a]) }
  return a
}
const ifLisp = (a, b, c) => a ? b : c

/* Finding Add, Subtract, Multiply and Divide Symbols */
const plusParser = (data) => data.startsWith('+') ? [add, data.slice(1)] : null
const minusParser = (data) => data.startsWith('-') ? [sub, data.slice(1)] : null
const starParser = (data) => data.startsWith('*') ? [mul, data.slice(1)] : null
const slashParser = (data) => data.startsWith('/') ? [div, data.slice(1)] : null

/* Finding >, >=, <, <=, == Symbols */
const greaterThanParser = (data) => data.startsWith('>') ? [greaterThan, data.slice(1)] : null
const lessThanParser = (data) => data.startsWith('<') ? [lessThan, data.slice(1)] : null
const greaterThanEqualToParser = (data) => data.startsWith('>=') ? [greaterThanEqualTo, data.slice(2)] : null
const lessThanEqualToParser = (data) => data.startsWith('<=') ? [lessThanEqualTo, data.slice(2)] : null
const equalToParser = (data) => data.startsWith('==') ? [EqualTo, data.slice(2)] : null

/* Finding Max, Min and Not string */
const maxParser = (data) => data.startsWith('max') ? [maxNumber, data.slice(3)] : null
const minParser = (data) => data.startsWith('min') ? [minNumber, data.slice(3)] : null
const notParser = (data) => data.startsWith('not') ? [notNumber, data.slice(3)] : null

/* Finding Define, print, if and lambda string */
const defParser = (data) => data.startsWith('define') ? [defLisp, data.slice(6)] : null
const ifParser = (data) => data.startsWith('if') ? [ifLisp, input.slice(2)] : null
const printedParser = (data) => data.startsWith('print') ? [printLisp, data.slice(5)] : null
const lambdaParser = (data) => data.startsWith('lambda') ? [lambdaLisp, data.slice(6)] : null

/* Finding openBracket and closeBracket */
const openBracketOp = (input) => (input.startsWith('(')) ? ['(', input.slice(1)] : null
const closeBracketOp = (input) => (input.startsWith(')')) ? [')', input.slice(1)] : null

// Operator parser
const operatorParser = (input) => {
  return (plusParser(input) || minusParser(input) || starParser(input) || slashParser(input) || greaterThanEqualToParser(input) || lessThanEqualToParser(input) || equalToParser(input) ||
           greaterThanParser(input) || lessThanParser(input) || defineParser(input) || identifierParsedOp(input) || maxParser(input) || minParser(input) || notParser(input))
}

// Expression Parser
const expressionParser = (input) => {
  let result = []
  let vid
  let count = 1
  let output
  if (!input.startsWith('(')) return null
  input = input.slice(1)
  while (true) {
    if (input.startsWith('>') || input.startsWith('>=') || input.startsWith('<') || input.startsWith('<=') || input.startsWith('==')) {
      count++
    }
    output = operatorParser(input)
    if (!output) return null
    result.push(output[0])
    while (true) {
      output = spaceParsedOp(output[1])
      output = numberParserOp(output[1]) || expressionParser(output[1]) || identifierParsedOp(output[1])
      result.push(output[0])
      output = (vid = closeBracketOp(output[1])) ? vid : output
      if (output[0] === ')') {
        return [evaluate(result, count), output[1]]
      }
    }
  }
}

// Arguments Parser for lambda function
const argumentsParser = (input) => {
  let result = []
  input = openBracketOp(input)
  if (input !== null) {
    while (!input.startsWith(')')) {
      input = identifierParsedOp(input[1])
      if (input !== null) {
        result.push(input[0])
        input = (input = spaceParsedOp(input[1])) ? input[1] : input
      }
    }
    input = closeBracketOp(input)
    return input[1]
  }
}
const lambdaPar = (input) => {
  input = openBracketOp(input)
  if (input === null) return null
  input = lambdaParser(input[1])
  if (input === null) return null
}

const functionParser = (input) => {

}

// Evaluate for expression parser result array
function evaluate (input, count) {
  let doga = input.shift()
  if (count > 1) return doga(...input)
  else return doga(input)
}

// Define parser
function defineParser (input) {
  let arr = []
  let count = 1
  input = openBracketOp(input)
  if (input === null) return null
  input = defParser(input[1])
  if (input === null) return null
  arr.push(input[0])
  input = spaceParsedOp(input[1])
  if (input === null) return null
  count++
  input = identifierParsedOp(input[1])
  arr.push(input[0])
  if (input === null) return null
  input = spaceParsedOp(input[1])
  if (input === null) return null
  input = numberParserOp(input[1]) || expressionParser(input[1])
  if (input === null) return null
  arr.push(input[0])
  evaluate(arr, count)
  input = closeBracketOp(input[1])
  input = input[1]
  return input
}

// Print parser
function printParser (input) {
  let arr = []
  let count = 1
  let output
  input = openBracketOp(input)
  input = printedParser(input[1])
  if (input === null) return null
  arr.push(input[0])
  input = spaceParsedOp(input[1])
  input = numberParserOp(input[1]) || expressionParser(input[1]) || identifierParsedOp(input[1])
  arr.push(input[0])
  input = closeBracketOp(input[1])
  output = evaluate(arr, count)
  console.log(output[0])
  return input[1]
}

// Switching between define and print parser
function statementParser (input) {
  return defineParser(input) || printParser(input)
}

// Input of whole data through Program parser
function programParser (input) {
  while (input !== '' && input !== null) {
    let output = ''
    output = statementParser(input)
    input = output
  }
  return ENV
}

// Calling Program Parser and Output of computed data
let output = programParser(input)
if (output === null) {
  output = 'Error'
} else {
  console.log(output)
}
