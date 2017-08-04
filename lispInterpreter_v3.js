var input = require('fs').readFileSync('newexample.txt', 'utf-8')
const ENV = {}
let mat, regexp = /^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/, output

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

const add = input => input.reduce((accum, value) => (ENV[value]) ? accum + ENV[value] : accum + value, 0)
const sub = input => input.reduce((accum, value) => (ENV[value]) ? accum - ENV[value] : accum - value)
const mul = input => input.reduce((accum, value) => (ENV[value]) ? accum * ENV[value] : accum * value, 1)
const div = input => input.reduce((accum, value) => (ENV[value]) ? (accum / ENV[value]) : (accum / value))
const gt = (a, b) => a > b
const lt = (a, b) => a < b
const gteq = (a, b) => a >= b
const lteq = (a, b) => a <= b
const eq = (a, b) => a === b
const not = (a) => !a
const max = (a, b) => a > b ? a : b
const min = (a, b) => a < b ? a : b
const listCall = (a) => { return { type: 'list', args: a } }
const car = (a) => a[0].shift()
const cdr = (a) => {
  a[0].shift()
  return a[0]
}
const cons = (a) => {
  a[1].unshift(a[0])
  return a[1]
}
const isList = (a) => !!(Array.isArray(a))
const operationDefine = (a, b) => { ENV[a] = b }
const operationPrint = (a) => (ENV[a]) ? console.log(ENV[a]) : a
const operationIf = (a, b, c) => a ? b : c

const findPlus = (data) => data.startsWith('+') ? [add, data.slice(1)] : null
const findMinus = (data) => data.startsWith('-') ? [sub, data.slice(1)] : null
const findMult = (data) => data.startsWith('*') ? [mul, data.slice(1)] : null
const findDiv = (data) => data.startsWith('/') ? [div, data.slice(1)] : null
const findGT = (data) => data.startsWith('>') ? [gt, data.slice(1)] : null
const findLT = (data) => data.startsWith('<') ? [lt, data.slice(1)] : null
const findGTEQ = (data) => data.startsWith('>=') ? [gteq, data.slice(2)] : null
const findLTEQ = (data) => data.startsWith('<=') ? [lteq, data.slice(2)] : null
const findEQ = (data) => data.startsWith('==') ? [eq, data.slice(2)] : null
const findMax = (data) => data.startsWith('max') ? [max, data.slice(3)] : null
const findMin = (data) => data.startsWith('min') ? [min, data.slice(3)] : null
const findNot = (data) => data.startsWith('not') ? [not, data.slice(3)] : null

const findList = (data) => data.startsWith('list') ? [listCall, data.slice(4)] : null
const findCar = (data) => data.startsWith('car') ? [car, data.slice(3)] : null
const findCdr = (data) => data.startsWith('cdr') ? [cdr, data.slice(3)] : null
const findCons = (data) => data.startsWith('cons') ? [cons, data.slice(4)] : null
const findIsList = (data) => data.startsWith('isList') ? [isList, data.slice(6)] : null

const findDefine = (data) => data.startsWith('define') ? [operationDefine, data.slice(6)] : null
const findIf = (data) => data.startsWith('if') ? [operationIf, data.slice(2)] : null
const findPrint = (data) => data.startsWith('print') ? [operationPrint, data.slice(5)] : null
const findLambda = (data) => data.startsWith('lambda') ? ['lambda', data.slice(6)] : null
const findOpenBracket = (input) => (input.startsWith('(')) ? ['(', input.slice(1)] : null
const findCloseBracket = (input) => (input.startsWith(')')) ? [')', input.slice(1)] : null

const parserFactory = (...parsers) => (input, key) => {
  for (let parser of parsers) {
    let output = parser(input, key)
    if (output !== null) return output
  }
  return null
}

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

const findOperator = (input) => parserFactory(findPlus, findMinus, findMult,
  findDiv, findGTEQ, findLTEQ, findEQ,
  findGT, findLT, findMax, findMin, findNot, findList,
  findCar, findCdr, findCons, findIsList)(input)

const parseOperators = (input, key) => {
  let count = 1
  if (!input.startsWith('(')) return null
  input = input.slice(1)
  if (findGT(input) || findGTEQ(input) || findLT(input) || findLTEQ(input) || findEQ(input) || 
      findMax(input) || findMin(input)) count++
  let result = [], vid = ''
  let output = (vid = findOperator(input)) ? vid : null
  result.push(output[0])
  while (output[0] !== ')') {
    output = skipSpaces(output[1])
    output = parseExpression(output[1], key)
    result.push(findType(output, key))
    output = (vid = findCloseBracket(output[1])) ? vid : output
  }
  if (output[0] === ')') {
    if (output[1] === '') return [applyFunction(result, count)]
    return [applyFunction(result, count), output[1]]
  }
}

const findType = (input, key) => {
  let type = 'type'
  if (ENV[input[0]] !== undefined && ENV[input[0]].type === 'list') return ENV[input[0]].args
  if (key !== undefined && ENV[key].type === 'lambda' && ENV[key].env[input[0]] !== undefined) return ENV[key].env[input[0]]
  if (ENV[input[0]]) return ENV[input[0]]
  else {
    return input[0]
  }
}
const applyFunction = (input, count) => {
  let operation = input.shift()
  if (count > 1) return operation(...input)
  else return operation(input)
}

const parseExpression = (input, key) => parserFactory(findNumber, findString,
  parseLambda, findIdentifier, parseOperators)(input, key)

const findLambdaArguments = (input) => {
  let result = [], output
  input = findOpenBracket(input)
  input = input[1]
  while (!input.startsWith(')')) {
    input = findIdentifier(input)
    result.push(input[0])
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
  let obj = {}, count = 3
  let output = allParser(findOpenBracket, findLambda, skipSpaces, findLambdaArguments,
    skipSpaces, findLambdaBody, findCloseBracket)(input)
  if (output === null) return null
  let [[, Type, , Args, , Body], rest] = output
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
  let type = 'type'
  if (ENV[output[0]].type === 'lambda') {
    let key = output[0], arr = []
    output = findIdenNum(output, arr)
    let args = 'args', body = 'body', env = {}
    for (let i = 0; i < arr.length; i++) {
      env[ENV[key].args[i]] = arr[i]
    }
    ENV[key].env = env
    env = {}
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
  console.log('Evaluate to ' + applyFunction(arr, count))
  return (rest === null) ? null : rest
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
  return ENV
}
console.log((output = parseProgram(input)) ? output : 'Error')
