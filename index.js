//fonte: https://blog.risingstack.com/your-first-node-js-http-server/

const http = require('http')
const fs = require('fs')
const port = 3000

var JSON_imagens;

//fonte: https://code-maven.com/reading-a-file-with-nodejs
fs.readFile('anexo_01.json','utf8',function(erro,conteudo){
	JSON_imagens = JSON.parse(conteudo);
})

const requestHandler = (request, response) => {
  response.end(JSON.stringify(JSON_imagens));
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})