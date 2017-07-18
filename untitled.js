var fs = require('fs')
var data = fs.readFileSync('newexample.txt', 'utf-8')
var hummer = new Map()

function programParser (data) {
	if(data) { return defineParser(data) }
	return null 
}

function statementParser (input) {
	return defineParser(input)
}
const openBracketOp = (input) => (input.startsWith('(')) ? ['(', input.slice(1)] : null
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
const closeBracketOp = (input) => (input.startsWith(')')) ? [')', input.slice(1)] : null

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

 	indigo = numberParserOp(indigo[1])// will return [number, remData] or null
 	let value = indigo[0]

 	hummer.set(key,value)

 	return hummer
}
console.log(programParser(data))









































