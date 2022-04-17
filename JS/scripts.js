let nomeUsuario=prompt("Qual seu nome?");
const objetoUsuario={
    name:nomeUsuario
}
function enviarSolicitacao(){
    const promise=axios.post("https://mock-api.driven.com.br/api/v6/uol/participants",objetoUsuario);
    promise.then(tratarSucesso);
    promise.catch(tratarErro);
}
function tratarErro(erro){
    let statusCode = erro.response.status;
    if(statusCode===400){
        nomeUsuario=prompt("Nome já está sendo usado. Digite outro nome");
        objetoUsuario.name=nomeUsuario;
        enviarSolicitacao();
    }
}
function tratarSucesso(resposta){
    let statusCode=resposta.status;
    if(statusCode===200){
        console.log("Deu certo, nome pode ser usado")
    }
}
enviarSolicitacao();

function verificarNome(nome,nomes){
    const qntNomes=nomes.length;
    let contador=0;//verificador de nomes disponíveis no servidor
    for (let i=0;i<qntNomes;i++){
        if(nome===nomes[i].name){
            contador++; 
            return contador;
        }
    }
    return contador;

}