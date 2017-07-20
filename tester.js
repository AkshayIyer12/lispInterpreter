const spaceParser = (input) => {
  let pulsar = input.match(/^\s+/)
  if (!pulsar) return null
  let pulsarLength = pulsar[0].length
  return [null, input.slice(pulsarLength)]
}
const identifierParser = (input) => {
  let re = /^[a-z]+[0-9]*[a-z]*/i
  let indica = input.match(re)
  if (!indica) return null
  let indicaLength = indica[0].length
  return [indica[0], input.slice(indicaLength)]
}
const numParser = (input) => {
  let re = /^[0-9]+/
  let data = re.exec(input)
  if (data) return [parseInt(data[0]), input.slice(data[0].length)]
  return null
}
const statementParser = (input) => {
let output 
	while(true){
	if(input.startsWith('('))
	{
		input = input.slice(1)
		if(input.startsWith('print'))
		{
        input = input.slice(6)
        output = numParser(input) || identifierParser(input)
        console.log(output[0])
        input = output[1]
        if (!output[1].startsWith(')')) return null
        input = input.slice(1)
        if (input !== null) {
          output = spaceParser(input)
          if (output !== null) {
            input = output[1]
          }
        }
        if (input === '') break	
	}
}
		
}
}

let input = `(print 10)(print a)`
let output = statementParser(input)
console.log(output)