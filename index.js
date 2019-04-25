//fonte: https://blog.risingstack.com/your-first-node-js-http-server/

const http = require('http')
const https = require('https')
const fs = require('fs')
const JSZip = require('jszip')
const path = require('path')
const PNG = require('pngjs').PNG
const port = 3000

var JSON_imagens;

//fonte: https://code-maven.com/reading-a-file-with-nodejs
fs.readFile('anexo_01.json','utf8',function(erro,conteudo){
	JSON_imagens = JSON.parse(conteudo);
})

//TODO: um pouco instavel, tentar achar um jeito de 
//fazer ficar mais future-proof
function extrairNomeImagem(url_imagem){
	var reg = new RegExp("[a-zA-Z0-9]{25}\\.(png|jpeg|jpg|ico)");
	return reg.exec(url_imagem)[0];
}

function baixarImagens(){
	//fonte: https://stackoverflow.com/questions/11944932/how-to-download-a-file-with-node-js-without-using-third-party-libraries
	//fonte: https://stackoverflow.com/questions/18310990/nodejs-lost-data-when-using-loop-for-download-many-files
	var dir = 'images';
	for(var i in JSON_imagens.images){
		(function(i){
			var nome_imagem = extrairNomeImagem(JSON_imagens.images[i]);
			//fonte: https://www.w3schools.com/nodejs/met_path_join.asp
			var imagem = fs.createWriteStream(path.join(dir,nome_imagem));
			var request = https.get(JSON_imagens.images[i],function(resposta){
				resposta.pipe(imagem);
			});
			request.end();
		})(i);
	}
}

function comprimirImagens(erro,arquivos){
	var zip = new JSZip();
	for(var i in arquivos){
		(function(i){
			var nomeImagem = arquivos[i];
			var caminhoImagem = path.join('images',nomeImagem);
			var arquivoImagem = fs.readFileSync(caminhoImagem);
			zip = zip.file(nomeImagem, arquivoImagem, {base64: true});
		})(i);
	}
	zip.generateAsync({type:"nodebuffer"}, function(metadados){
	}).then(function(conteudo){
		fs.writeFile("./imagens.zip",conteudo,function(err){});
	});
}

const requestHandler = (request, response) => {
	//gambis, por enquanto
	//fonte: https://stackoverflow.com/questions/15241819/node-js-executed-function-twice
	if(request.url === '/favicon.ico'){
		return;
	}
	//cria diretorio assincronizadamente
	//fonte: https://nodejs.org/api/fs.html#fs_fs_mkdir_path_options_callback
	fs.mkdir('images', {recursive: true}, baixarImagens);
	fs.readdir('images',comprimirImagens);
	console.log(request.url);
  response.end(JSON.stringify(JSON_imagens));
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})