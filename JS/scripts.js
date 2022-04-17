let nomeUsuario=prompt("Qual seu nome?");
const objetoUsuario={
    name:nomeUsuario
}
const elementoMensagens=document.querySelector(".container");
enviarSolicitacaoNome();
function enviarSolicitacaoNome(){
    const promise=axios.post("https://mock-api.driven.com.br/api/v6/uol/participants",objetoUsuario);
    promise.then(tratarSucessoNome);
    promise.catch(tratarErroNome);
}
function tratarErroNome(erro){
    let statusCode = erro.response.status;
    if(statusCode!==200 && statusCode===400){
        nomeUsuario=prompt("Nome já está sendo usado. Digite outro nome");
        objetoUsuario.name=nomeUsuario;
        enviarSolicitacaoNome();
    }else{
        alert(`Erro ao enviar status de ${nomeUsuario} ao servidor: ${statusCode}`);
        nomeUsuario=prompt("Qual seu nome?");
        enviarSolicitacaoNome();
    }
}
function tratarSucessoNome(resposta){
    let statusCode=resposta.status;
    if(statusCode===200){
        setInterval(manterConexao,5000);
        setInterval(buscarMensagens,3000);
        
    }
}
function manterConexao(){
    const promise=axios.post("https://mock-api.driven.com.br/api/v6/uol/status",objetoUsuario);
    promise.then(tratarSucessoStatus);
    promise.catch(tratarErroStatus);
}
function tratarSucessoStatus(resposta){
    console.log(`Servidor atualizou o status de ${nomeUsuario}`);
}
function tratarErroStatus(erro){
    alert(`Erro ao enviar status de ${nomeUsuario} ao servidor: ${erro.response.status}`);
}
function buscarMensagens(){
    const promise=axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
    promise.then(tratarSucessoBuscarMensagem);
    promise.catch(tratarErroBuscarMensagem);
}
function tratarSucessoBuscarMensagem(resposta){
    const qntMensagens=resposta.data.length;
    elementoMensagens.innerHTML=``;
    let elementoMensagem;
    for (let i=0;i<qntMensagens;i++){
        if(resposta.data[i].type==="status"){
            elementoMensagens.innerHTML+=
            `<div id="${i}" class="mensagem status">
                <h3><span>(${resposta.data[i].time})</span> <strong>${resposta.data[i].from}</strong> ${resposta.data[i].text}</h3>
            </div>`;
            elementoMensagem=document.getElementById(`${i}`)
            elementoMensagem.scrollIntoView();
        }
        if(resposta.data[i].type==="message" && resposta.data[i].to==="Todos"){
            elementoMensagens.innerHTML+=
            `<div id="${i}" class='mensagem normais'>
                <h3><span>(${resposta.data[i].time})</span> <strong>${resposta.data[i].from}</strong> para ${resposta.data[i].to}: ${resposta.data[i].text}</h3>
            </div>`
            elementoMensagem=document.getElementById(`${i}`)
            elementoMensagem.scrollIntoView();
        }
        if(verificarMensagemPrivada(resposta.data[i].type,resposta.data[i].to,nomeUsuario)){
            elementoMensagens.innerHTML+=
            `<div id="${i}" class='mensagem reservada'>
                <h3><span>(${resposta.data[i].time})</span> <strong>${resposta.data[i].from}</strong>       reservadamente para ${resposta.data[i].to}: ${resposta.data[i].text}</h3>
            </div>`;
            elementoMensagem=document.getElementById(`${i}`)
            elementoMensagem.scrollIntoView();
        }  
    }
    console.log(`site carregou as mensagens do servidor`);
}
function verificarMensagemPrivada(tipoDaMensagem,destinatario,nome){
    if(tipoDaMensagem==="message" && destinatario===nome){
        return true
    }
    return false;
}
function tratarErroBuscarMensagem(erro){
    alert(`Erro ao receber as mensagem do servidor: ${erro.response.status}`);
}
