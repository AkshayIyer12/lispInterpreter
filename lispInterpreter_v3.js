var input = require('fs').readFileSync('newexample.txt', 'utf-8')
const ENV = {}
let mat, regexp = /^[0-9]+/, output
const spaceParser = (input) => (mat = input.match(/^[\s\t\n]+/)) ? [mat[0], input.slice(mat[0].length)] : null
const identifierParser = (input) => (mat = input.match(/^[a-z]+[0-9]*[a-z]*/i)) ? [mat[0], input.slice(mat[0].length)] : null
const numberParser = (input) => (mat = regexp.exec(input)) ? [parseInt(mat[0]), input.slice(mat[0].length)] : null
const stringParser = (data) => {
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
const div = input => input.reduce((accum, value) => (ENV[value]) ? accum / ENV[value] : accum / value)
const greaterThan = (a, b) => a > b
const lessThan = (a, b) => a < b
const greaterThanEqualTo = (a, b) => a >= b
const lessThanEqualTo = (a, b) => a <= b
const EqualTo = (a, b) => a === b
const notNumber = (a) => !a
const maxNumber = (a, b) => a > b ? a : b
const minNumber = (a, b) => a < b ? a : b
const listCall = (a) => { return { type: 'list', args: a } }
const listCar = (a) => a[0].shift()
const listCdr = (a) => {
  a[0].shift()
  return a[0]
}
const listCons = (a) => {
  a[1].unshift(a[0])
  return a[1]
}
const isListLisp = (a) => !!(Array.isArray(a))
const defineLisp = (a, b) => { ENV[a] = b }
const printLisp = (a) => (ENV[a]) ? console.log(ENV[a]) : a
const ifLisp = (a, b, c) => a ? b : c
const plusParser = (data) => data.startsWith('+') ? [add, data.slice(1)] : null
const minusParser = (data) => data.startsWith('-') ? [sub, data.slice(1)] : null
const starParser = (data) => data.startsWith('*') ? [mul, data.slice(1)] : null
const slashParser = (data) => data.startsWith('/') ? [div, data.slice(1)] : null
const greaterThanParser = (data) => data.startsWith('>') ? [greaterThan, data.slice(1)] : null
const lessThanParser = (data) => data.startsWith('<') ? [lessThan, data.slice(1)] : null
const greaterThanEqualToParser = (data) => data.startsWith('>=') ? [greaterThanEqualTo, data.slice(2)] : null
const lessThanEqualToParser = (data) => data.startsWith('<=') ? [lessThanEqualTo, data.slice(2)] : null
const equalToParser = (data) => data.startsWith('==') ? [EqualTo, data.slice(2)] : null
const maxParser = (data) => data.startsWith('max') ? [maxNumber, data.slice(3)] : null
const minParser = (data) => data.startsWith('min') ? [minNumber, data.slice(3)] : null
const notParser = (data) => data.startsWith('not') ? [notNumber, data.slice(3)] : null
const listParser = (data) => data.startsWith('list') ? [listCall, data.slice(4)] : null
const carList = (data) => data.startsWith('car') ? [listCar, data.slice(3)] : null
const cdrList = (data) => data.startsWith('cdr') ? [listCdr, data.slice(3)] : null
const consList = (data) => data.startsWith('cons') ? [listCons, data.slice(4)] : null
const isListIden = (data) => data.startsWith('isList') ? [isListLisp, data.slice(6)] : null
const defineSlicerParser = (data) => data.startsWith('define') ? [defineLisp, data.slice(6)] : null
const ifSlicerParser = (data) => data.startsWith('if') ? [ifLisp, data.slice(2)] : null
const printSlicerParser = (data) => data.startsWith('print') ? [printLisp, data.slice(5)] : null
const lambdaSlicerParser = (data) => data.startsWith('lambda') ? ['lambda', data.slice(6)] : null
const openBracket = (input) => (input.startsWith('(')) ? ['(', input.slice(1)] : null
const closeBracket = (input) => (input.startsWith(')')) ? [')', input.slice(1)] : null
const parserFactory = (...parsers) => (input) => {
  for (let parser of parsers) {
    let output = parser(input)
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
const operatorFinder = (input) => parserFactory(plusParser, minusParser, starParser,
  slashParser, greaterThanEqualToParser, lessThanEqualToParser, equalToParser,
  greaterThanParser, lessThanParser, maxParser, minParser, notParser, listParser,
  carList, cdrList, consList, isListIden)(input)
const operatorParser = (input) => {
  let count = 1
  if (!input.startsWith('(')) return null
  input = input.slice(1)
  if (input.startsWith('>') || input.startsWith('>=') ||
    input.startsWith('<') || input.startsWith('<=') ||
    input.startsWith('==') || input.startsWith('max') ||
    input.startsWith('min')) {
    count++
  }
  let output = operatorFinder(input)
  if (output === null) return null
  // For Operator Operand1 Operand2
  let result = [], vid = '', args = 'args'
  result.push(output[0])
  while (output[0] !== ')') {
    output = spaceParser(output[1])
    output = expressionParser(output[1])
    if (ENV[output[0]]) {
      (ENV[output[0]].args) ? result.push(ENV[output[0]].args) : result.push(ENV[output[0]])
    } else {
      result.push(output[0])
    }
    output = (vid = closeBracket(output[1])) ? vid : output
  }
  if (output[0] === ')') {
    if (output[1] === '') {
      return [evaluate(result, count)]
    } else {
      return [evaluate(result, count), output[1]]
    }
  }
}
const evaluate = (input, count) => {
  let operation = input.shift()
  if (count > 1) return operation(...input)
  else return operation(input)
}
const expressionParser = (input) => parserFactory(numberParser, stringParser,
  lambdaParser, identifierParser, operatorParser)(input)
const lambdaArgumentsParser = (input) => {
  let result = [], output
  input = openBracket(input)
  input = input[1]
  while (!input.startsWith(')')) {
    input = identifierParser(input)
    result.push(input[0])
    input = (output = spaceParser(input[1])) ? output[1] : input[1]
  }
  input = closeBracket(input)
  return [result, input[1]]
}
const lambdaBodyParser = (input) => {
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
  let output = allParser(openBracket, lambdaSlicerParser, spaceParser, lambdaArgumentsParser,
    spaceParser, lambdaBodyParser, closeBracket)(input)
  if (output === null) return null
  let [[, Type, , Args, , Body], rest] = output
  obj.type = Type, obj.args = Args, obj.body = Body
  return [obj, rest, count]
}
const checker = (output) => {
  if ((output[0] === 'list') || (output[0] === 'max') || (output[0] === 'min') ||
   (output[0] === 'car') || (output[0] === 'cdr') || (output[0] === 'cons') ||
   (output[0] === 'isList')) {
    return null
  }
}
const lambdaParser = (input) => {
  if (!input.startsWith('(')) return null
  input = input.slice(1)
  let output = identifierParser(input)
  if (output === null) return null
  if (checker(output) === null) return null
  let type = 'type'
  if (ENV[output[0]].type === undefined) return null
  let key = output[0], arr = []
  while (!output[1].startsWith(')')) {
    output = spaceParser(output[1])
    if (numberParser(output[1])) {
      output = numberParser(output[1])
      arr.push(output[0])
    }
    if (identifierParser(output[1])) {
      output = identifierParser(output[1])
      if (ENV[output[0]] !== undefined) {
        output[0] = ENV[output[0]]
        arr.push(output[0])
      }
    }
    if (output[1].startsWith('(')) {
      output = lambdaParser(output[1])
      arr.push(output[0][0])
    }
  }
  let value = output[0], args = 'args', body = 'body', env = {}
  for (let i = 0; i < arr.length; i++) {
    env[ENV[key].args[i]] = arr[i]
  }
  env[body] = ENV[key].body
  for (let i = 0; i < arr.length; i++) {
    env[body] = env[body].replace(ENV[key].args[i], env[ENV[key].args[i]])
  }
  env[body] = env[body].replace(ENV[key].args[0], value)
  env[body] = env[body].replace(ENV[key].args[0], value)
  output = (vid = closeBracket(output[1])) ? vid : output
  if (output[0] === ')') {
    return [operatorParser(env[body]), output[1]]
  }
}
const defineParser = (input) => {
  let arr = [], count = 1
  let output = allParser(openBracket, defineSlicerParser, spaceParser, identifierParser,
    spaceParser)(input)
  if (output === null) return null
  let [[ , defineFunc, , iden], rest] = output
  input = rest
  output = defineLambda(input)
  if (output === null) output = expressionParser(input)
  let [val1, val2] = output
  arr.push(defineFunc, iden, val1)
  count += 3
  evaluate(arr, count)
  input = closeBracket(val2)
  return input[1]
}
const printParser = (input) => {
  let arr = [], count = 1
  let output = allParser(openBracket, printSlicerParser, spaceParser, expressionParser,
    closeBracket)(input)
  if (output === null) return null
  let [[, printFunc, , exp], rest] = output
  arr.push(printFunc)
  ENV[exp] ? arr.push(ENV[exp]) : arr.push(exp)
  console.log('Evaluate to ' + evaluate(arr, count))
  if (rest === null) {
    return null
  }
  return rest
}
const ifParser = (input) => {
  let arr = [], count = 0
  let output = allParser(openBracket, ifSlicerParser, spaceParser, expressionParser, spaceParser, expressionParser, spaceParser, expressionParser, closeBracket)(input)
  if (output === null) return null
  let [[, ifFun, , test, , conseq, , alt], rest] = output
  arr.push(ifFun, test, conseq, alt)
  console.log('Evaluate to ' + evaluate(arr, count + 3))
  return rest
}
const statementParser = (input) => parserFactory(defineParser, printParser, ifParser)(input)
const programParser = (input) => {
  while (input !== '' && input !== null) {
    let spaceParsed = ''
    input = (spaceParsed = spaceParser(input)) ? spaceParsed[1] : input
    input = statementParser(input)
  }
  return ENV
}
console.log((output = programParser(input)) ? output : 'Error')
