var fs = require('fs')
var data = fs.readFileSync('newexample.txt', 'utf-8')
var hummer = new Map()
function programParser (data) {
	if(data) { return statementParser(data) }
	return null 
}
function statementParser (input) {
	return defineParser(input)
}
const openBracketOp = (input) => (input.startsWith('(')) ? ['(', input.slice(1)] : null
const closeBracketOp = (input) => (input.startsWith(')')) ? [')', input.slice(1)] : null
const spaceParsedOp = (input) => { 
	let sumo = input.match(/^\s+/)
	if(!sumo) return null
	let sumoLength = sumo[0].length
	return [null, input.slice(sumoLength)] 
}
const defineParsedOp = (input) => (input.startsWith('define')) ? ['define', input.slice(6)] : null
const identifierParsedOp = (input) => {
	let re = /^[a-z]+[0-9]*[a-z]*/i
	let indica = input.match(re)
	if(!indica) return null
	let indicaLength = indica[0].length
	return [indica[0], input.slice(indicaLength)]
}
const numberParserOp = (input) => {
	let re = /^[0-9]+/
	let data = re.exec(input)
	if(data) return [parseInt(data[0]), input.slice(data[0].length)]
	return null	
}
function defineParser (input) {
 	let indigo = openBracketOp(input)// will return ['(', remData] or null
 	if(!indigo) return null
 	indigo = spaceParsedOp(indigo[1])// will return [null, remData] or null
 	if(!indigo) return null
 	indigo = defineParsedOp(indigo[1])// will return ['define', remData] or null
 	if(!indigo) return null
 	indigo = spaceParsedOp(indigo[1])// will return [null, remData] or null
 	if(!indigo) return null
 	indigo = identifierParsedOp(indigo[1])// will return [matchedIdentifier, remData] or null
 	if(!indigo) return null
 	let key = indigo[0]
 	indigo = spaceParsedOp(indigo[1])// will return [null, remData] or null
 	if(!indigo) return null
 	//OPERATION TO BE PERFORMED HERE
 	indigo = expressionParser(indigo[1])
 	//indigo = numberParserOp(indigo[1])// will return [number, remData] or null
 	let value = indigo
 	hummer.set(key,value)
 	return hummer
}
const plusParser = (data) => data.startsWith('+') ? ['+', data.slice(1)] : null
const minusParser = (data) => data.startsWith('-') ? ['-', data.slice(1)] : null
const starParser = (data) => data.startsWith('*') ? ['*', data.slice(1)] : null 
const divParser = (data) => data.startsWith('/') ? ['/', data.slice(1)] : null 
function expressionParser (input) {
	let sum = 0
	var arr = []
	let Tiago = openBracketOp(input) // will return ['(', remData] or null
	if((Tiago = plusParser(Tiago[1])) !== null) // will return ['+', 'remData'] or null
	arr.push(Tiago[0])
	else if((Tiago = minusParser(Tiago[1])) !== null)
	arr.push(Tiago[0])
	else if((Tiago = starParser(Tiago[1])) !== null) 
	arr.push(Tiago[0])
	else {
		(Tiago = divParser(Tiago[1]))
		arr.push(Tiago[0])
	}
	Tiago = spaceParsedOp(Tiago[1]) // will return [null, remData] or null
	Tiago = numberParserOp(Tiago[1])
	arr.push(Tiago[0])
	Tiago = spaceParsedOp(Tiago[1]) // will return [null, remData] or null
	Tiago = numberParserOp(Tiago[1])
	arr.push(Tiago[0])
	Tiago = closeBracketOp(Tiago[1])
	for(let i = 1; i < arr.length; i++)
		if(arr[0] === '+')
			sum += arr[i]
		else if(arr[0] === '-')
			sum = arr[i]
	return sum
}
console.log(programParser(data))