let nomeUsuario=prompt("Qual seu nome?");
const objetoUsuario={
    name:nomeUsuario
}
function enviarSolicitacaoNome(){
    const promise=axios.post("https://mock-api.driven.com.br/api/v6/uol/participants",objetoUsuario);
    promise.then(tratarSucessoNome);
    promise.catch(tratarErroNome);
}
function tratarErroNome(erro){
    let statusCode = erro.response.status;
    if(statusCode!==200){
        nomeUsuario=prompt("Nome já está sendo usado. Digite outro nome");
        objetoUsuario.name=nomeUsuario;
        enviarSolicitacaoNome();
    }
}
function tratarSucessoNome(resposta){
    let statusCode=resposta.status;
    if(statusCode===200){
        setInterval(verificarStatus,5000)
    }
}
function verificarStatus(){
    const promise=axios.post("https://mock-api.driven.com.br/api/v6/uol/status",objetoUsuario);
    promise.then(tratarSucessoStatus);
    promise.catch(tratarErroStatus);
}
function tratarSucessoStatus(resposta){
    console.log(resposta.data);
}
enviarSolicitacaoNome();
