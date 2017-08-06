const readline = require('readline')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '>'
})
rl.prompt()
rl.on('line', (line) => {
  console.log(parseProgram(line))
  rl.prompt()
}).on('close', () => {
  process.exit(0)
})
const ENV = {}
let mat, regexp = /^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/

const skipSpaces = (input) => (mat = input.match(/^[\s\t\n]+/)) ? [mat[0], input.slice(mat[0].length)] : null
const findIdentifier = (input) => (mat = input.match(/^[a-z]+[0-9]*[a-z]*/i)) ? [mat[0], input.slice(mat[0].length)] : null
const findNumber = (input) => (mat = regexp.exec(input)) ? [parseFloat(mat[0]), input.slice(mat[0].length)] : null
const findString = (data) => {
  if (data[0] === '"') {
    data = data.substring(1, data.length)
    let i = data.search('"')
    return ([data.substring(0, i), data.slice(i + 1)])
  }
  return null
}

const determineOperator = (input) => {
  let op = ''
  for (let i = 0; i < 6; i++) {
    if (input[i] !== ' ') {
      op = op.concat(input[i])
    } else {
      break
    }
  }
  switch (op) {
    case '+' : return [input => input.reduce((accum, value) => (ENV[value]) ? accum + ENV[value] : accum + value, 0), input.slice(op.length)]
    case '-' : return [input => input.reduce((accum, value) => (ENV[value]) ? accum - ENV[value] : accum - value), input.slice(op.length)]
    case '*' : return [input => input.reduce((accum, value) => (ENV[value]) ? accum * ENV[value] : accum * value, 1), input.slice(op.length)]
    case '/' : return [input => input.reduce((accum, value) => (ENV[value]) ? accum / ENV[value] : accum / value), input.slice(op.length)]
    case '>' : return [(a, b) => a > b, input.slice(op.length), 3]
    case '<' : return [(a, b) => a < b, input.slice(op.length), 3]
    case '>=' : return [(a, b) => a >= b, input.slice(op.length), 3]
    case '<=' : return [(a, b) => a <= b, input.slice(op.length), 3]
    case '==' : return [(a, b) => a === b, input.slice(op.length), 3]
    case 'max' : return [(a, b) => a > b ? a : b, input.slice(op.length), 3]
    case 'min' : return [(a, b) => a < b ? a : b, input.slice(op.length), 3]
    case 'not' : return [(a) => !a, input.slice(op.length), 3]
    case 'list' : return [(a) => { return { type: 'list', args: a } }, input.slice(op.length)]
    case 'car' : return [(a) => a[0][0], input.slice(op.length)]
    case 'cdr' : return [(a) => a[0].slice(1), input.slice(op.length)]
    case 'cons' : return [(a) => {
      let temp = []
      temp.push(a[0])
      a[1].map((b) => temp.push(b))
      return temp
    }, input.slice(op.length)]
    case 'isList' : return [(a) => (Array.isArray(a)), input.slice(op.length)]
    default : return null
  }
}

const findDefine = (data) => data.startsWith('define') ? [(a, b) => { ENV[a] = b }, data.slice(6)] : null
const findIf = (data) => data.startsWith('if') ? [(a, b, c) => a ? b : c, data.slice(2)] : null
const findPrint = (data) => data.startsWith('print') ? [(a) => (ENV[a]) ? console.log(ENV[a]) : a, data.slice(5)] : null
const findLambda = (data) => data.startsWith('lambda') ? ['lambda', data.slice(6)] : null
const findOpenBracket = (input) => (input.startsWith('(')) ? ['(', input.slice(1)] : null
const findCloseBracket = (input) => (input.startsWith(')')) ? [')', input.slice(1)] : null

const parserFactory = (...parsers) => (input, key) => parsers.reduce((accum, parser) => (accum === null) ? parser(input, key) : accum, null)

const allParser = (...parsers) => (input) => {
  let result = []
  for (let parser of parsers) {
    let output = parser(input)
    if (output === null) return null
    result.push(output[0])
    input = output[1]
  }
  return [result, input]
}

const parseOperators = (input, key) => {
  let count = 1
  if (!input.startsWith('(')) return null
  input = input.slice(1)
  let result = [], findItem = ''
  let output = (findItem = determineOperator(input)) ? findItem : null
  if (output[2]) count = output[2]
  result.push(output[0])
  while (output[0] !== ')') {
    output = skipSpaces(output[1])
    output = parseExpression(output[1], key)
    result.push(findType(output, key))
    output = (findItem = findCloseBracket(output[1])) ? findItem : output
  }
  if (output[0] === ')') {
    let compute = applyFunction(result, count)
    if (output[1] === '') return [compute]
    return [compute, output[1]]
  }
}

const findType = (input, key) => {
  if (ENV[input[0]] !== undefined && ENV[input[0]].type === 'list') return ENV[input[0]].args
  if (key !== undefined && ENV[key].type === 'lambda' && ENV[key].env[input[0]] !== undefined) return ENV[key].env[input[0]]
  if (ENV[input[0]]) return ENV[input[0]]
  return input[0]
}
const applyFunction = (input, count) => {
  let operation = input.shift()
  if (count > 1) return operation(...input)
  return operation(input)
}

const parseExpression = (input, key) => parserFactory(findNumber, findString,
  parseLambda, findIdentifier, parseOperators)(input, key)

const findLambdaArguments = (input) => {
  input = findOpenBracket(input)
  input = input[1]
  let result = []
  while (!input.startsWith(')')) {
    input = findIdentifier(input)
    result.push(input[0])
    let output
    input = (output = skipSpaces(input[1])) ? output[1] : input[1]
  }
  input = findCloseBracket(input)
  return [result, input[1]]
}

const findLambdaBody = (input) => {
  let count = 0, k = 0, output = ''
  do {
    if (input[k] === '(') count++
    if (input[k] === ')') count--
    output += input[k]
    k++
  } while (count !== 0)
  input = input.slice(k)
  return [output, input]
}

const defineLambda = (input) => {
  let output = allParser(findOpenBracket, findLambda, skipSpaces, findLambdaArguments,
    skipSpaces, findLambdaBody, findCloseBracket)(input)
  if (output === null) return null
  let [[, Type, , Args, , Body], rest] = output
  let obj = {}, count = 3
  obj.type = Type, obj.args = Args, obj.body = Body, obj.env = {}
  return [obj, rest, count]
}
const findIdenNum = (output, arr) => {
  while (!output[1].startsWith(')')) {
    output = skipSpaces(output[1])
    if (findNumber(output[1])) {
      output = findNumber(output[1])
      arr.push(output[0])
    }
    if (findIdentifier(output[1])) {
      output = findIdentifier(output[1])
      if (ENV[output[0]] !== undefined) {
        output[0] = ENV[output[0]]
        arr.push(output[0])
      }
    }
    if (output[1].startsWith('(')) {
      output = parseLambda(output[1])
      arr.push(output[0][0])
    }
  }
  return [arr, output[1]]
}
const parseLambda = (input) => {
  input = (input = findOpenBracket(input)) ? input[1] : null
  if (input === null) return null
  let output = findIdentifier(input)
  if (output === null || ENV[output[0]] === undefined || output[0] === 'if') return null
  if (ENV[output[0]].type === 'lambda') {
    let key = output[0], arr = []
    output = findIdenNum(output, arr)
    let env = {}
    for (let i = 0; i < arr.length; i++) {
      env[ENV[key].args[i]] = arr[i]
    }
    ENV[key].env = env
    env = {}
    let args = ''
    output = (args = findCloseBracket(output[1])) ? args : output
    if (output[0] === ')') {
      return [parseOperators(ENV[key].body, key), output[1]]
    }
  }
}

const parseDefine = (input) => {
  let arr = [], count = 1
  let output = allParser(findOpenBracket, findDefine, skipSpaces, findIdentifier,
    skipSpaces)(input)
  if (output === null) return null
  let [[ , defineFunc, , iden], rest] = output
  input = rest
  output = (output = defineLambda(input)) ? output : parseExpression(input)
  let [val1, val2] = output
  arr.push(defineFunc, iden, val1)
  applyFunction(arr, count + 3)
  input = findCloseBracket(val2)
  console.log(ENV[iden])
  return input[1]
}

const parsePrint = (input) => {
  let arr = [], count = 1
  let output = allParser(findOpenBracket, findPrint, skipSpaces, parseExpression,
    findCloseBracket)(input)
  if (output === null) return null
  let [[, printFunc, , exp], rest] = output
  arr.push(printFunc)
  ENV[exp] ? arr.push(ENV[exp]) : arr.push(exp)
  console.log(' ' + applyFunction(arr, count))
  return rest
}

const parseIf = (input) => {
  let arr = [], count = 0
  let output = allParser(findOpenBracket, findIf, skipSpaces, parseExpression, skipSpaces,
   parseExpression, skipSpaces, parseExpression, findCloseBracket)(input)
  if (output === null) return null
  let [[, ifFun, , test, , conseq, , alt], rest] = output
  arr.push(ifFun, test, conseq, alt)
  console.log('Evaluate to ' + applyFunction(arr, count + 3))
  return rest
}

const parseStatement = (input) => parserFactory(parseDefine, parsePrint, parseIf)(input)

const parseProgram = (input) => {
  while (input !== '' && input !== null) {
    let spaceParsed = ''
    input = (spaceParsed = skipSpaces(input)) ? spaceParsed[1] : input
    input = parseStatement(input)
  }
  return ''
}
