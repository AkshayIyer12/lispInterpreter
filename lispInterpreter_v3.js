var fs = require('fs')
var input = fs.readFileSync('newexample.txt', 'utf-8')
const ENV = {}
// Space parser
const spaceParsedOp = (input) => {
  let matched = input.match(/^\s+/)
  if (!matched) return null
  let matchedLength = matched[0].length
  return [null, input.slice(matchedLength)]
}

// Identifier Parser
const identifierParsedOp = (input) => {
  let matched = input.match(/^[a-z]+[0-9]*[a-z]*/i)
  if (!matched) return null
  let matchedLength = matched[0].length
  return [matched[0], input.slice(matchedLength)]
}

// Number parser
const numberParserOp = (input) => {
  let regexp = /^[0-9]+/
  let matched = regexp.exec(input)
  if (matched) return [parseInt(matched[0]), input.slice(matched[0].length)]
  return null
}

/* Simple arithmetic functions */
const add = input => input.reduce((accum, value) => {
  if (ENV[value]) return accum + ENV[value]
  return accum + value
}, 0)
const sub = input => input.reduce((accum, value) => {
  if (ENV[value]) return accum - ENV[value]
  return accum - value
})
const mul = input => input.reduce((accum, value) => {
  if (ENV[value]) return accum * ENV[value]
  return accum * value
}, 1)
const div = input => input.reduce((accum, value) => {
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

/* Define, print, if and lambda string slicer */
const defineSlicerParser = (data) => data.startsWith('define') ? [defLisp, data.slice(6)] : null
const ifSlicerParser = (data) => data.startsWith('if') ? [ifLisp, input.slice(2)] : null
const printSlicerParser = (data) => data.startsWith('print') ? [printLisp, data.slice(5)] : null
const lambdaSlicerParser = (data) => data.startsWith('lambda') ? ['lambda', data.slice(6)] : null

/* Finding openBracket and closeBracket */
const openBracketOp = (input) => (input.startsWith('(')) ? ['(', input.slice(1)] : null
const closeBracketOp = (input) => (input.startsWith(')')) ? [')', input.slice(1)] : null

// Operator parser
const operatorParser = (input) => {
  return (plusParser(input) ||
          minusParser(input) ||
          starParser(input) ||
          slashParser(input) ||
          greaterThanEqualToParser(input) ||
          lessThanEqualToParser(input) ||
          equalToParser(input) ||
          greaterThanParser(input) ||
          lessThanParser(input) ||
          defineParser(input) ||
          maxParser(input) ||
          minParser(input) ||
          notParser(input))
}

// Evaluate for expression parser result array
function evaluate (input, count) {
  let operation = input.shift()
  if (count > 1) return operation(...input)
  else return operation(input)
}

// Expression Parser
const expressionParser = (input) => {
  let result = []
  let vid
  let count = 1
  let output
  if (numberParserOp(input) != null) {
    output = numberParserOp(input)
    return output
  }
  if (!input.startsWith('(')) return null
  input = input.slice(1)
  while (true) {
    if (input.startsWith('>') ||
        input.startsWith('>=') ||
        input.startsWith('<') ||
        input.startsWith('<=') ||
        input.startsWith('==')) {
      count++
    }
    output = operatorParser(input)
    if (output) {
      // For Operator Operand1 Operand2
      vid = ''
      result.push(output[0])
      while (true) {
        output = spaceParsedOp(output[1])
        output = numberParserOp(output[1]) || expressionParser(output[1]) || identifierParsedOp(output[1])
        result.push(output[0])
        output = (vid = closeBracketOp(output[1])) ? vid : output
        if (output[0] === ')') {
          if (output[1] === '') return [evaluate(result, count)]
          else {
            return [evaluate(result, count), output[1]]
          }
        }
      }
    } else {
      // For lambda parsing
      vid = ''
      let env = {}
      let arr = []
      output = identifierParsedOp(input)
      if (!output) return null
      let key = output[0]
      while (true) {
        // For parsing a number
        output = spaceParsedOp(output[1])
        if (numberParserOp(output[1])) {
          output = numberParserOp(output[1])
          arr.push(output[0])
        }
        // For parsing identifier
        if (identifierParsedOp(output[1])) {
          output = identifierParsedOp(output[1])
          if (ENV[output[0]] !== undefined) {
            output[0] = ENV[output[0]]
            arr.push(output[0])
          }
        }
        if (output[1].startsWith(')')) break
      }
      let value = output[0]
      let args = 'args'
      let body = 'body'
      // For passing value to the key in a local object env
      for (let i = 0; i < arr.length; i++) {
        env[ENV[key].args[i]] = arr[i]
      }
      // Replacing any occurrence of key with its value
      env[body] = ENV[key].body
      for (let i = 0; i < arr.length; i++) {
        env[body] = env[body].replace(ENV[key].args[i], env[ENV[key].args[i]])
      }

      env[body] = env[body].replace(ENV[key].args[0], value)
      output = (vid = closeBracketOp(output[1])) ? vid : output
      if (output[0] === ')') {
        return [expressionParser(env[body]), output[1]]
      }
    }
  }
}

// Arguments Parser for lambda function
const lambdaArgumentsParser = (input) => {
  let result = []
  input = openBracketOp(input)
  input = input[1]
  let output
  while (!input.startsWith(')')) {
    input = identifierParsedOp(input)
    result.push(input[0])
    input = (output = spaceParsedOp(input[1])) ? output[1] : input[1]
  }
  input = closeBracketOp(input)
  return [result, input[1]]
}

// Body Parser for lambda function
const lambdaBodyParser = (input) => {
  let count = 0
  let k = 0
  let output = ''
  do {
    if (input[k] === '(') count++
    if (input[k] === ')') count--
    output += input[k]
    k++
  } while (count !== 0)
  input = input.slice(k)
  return [output, input]
}

// lambda Parser
const lambdaParser = (input) => {
  let obj = {}
  let count = 3
  input = openBracketOp(input)
  if (input === null) return null
  input = lambdaSlicerParser(input[1])
  if (input === null) return null
  obj.type = input[0]
  if (input === null) return null
  input = spaceParsedOp(input[1])
  input = lambdaArgumentsParser(input[1])
  obj.args = input[0]
  input = spaceParsedOp(input[1])
  input = lambdaBodyParser(input[1])
  obj.body = input[0]
  input = closeBracketOp(input[1])
  return [obj, input[1], count]
}

// Define parser
function defineParser (input) {
  let arr = []
  let count = 1
  input = openBracketOp(input)
  if (input === null) return null
  input = defineSlicerParser(input[1])
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
  input = numberParserOp(input[1]) || lambdaParser(input[1]) || expressionParser(input[1])
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
  input = printSlicerParser(input[1])
  if (input === null) return null
  arr.push(input[0])
  input = spaceParsedOp(input[1])
  input = expressionParser(input[1])
  arr.push(input[0])
  input = closeBracketOp(input[1])
  output = evaluate(arr, count)
  console.log(output[0])
  if (input === null || input[1] === '') {
    return null
  }
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
