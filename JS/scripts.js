//GLOBAL
let nomeUsuario=prompt("Qual seu nome?");
const objetoUsuario={
    name:nomeUsuario
}
const TEMPO_3S=3*1000;
const TEMPO_5S=5*1000;
const TEMPO_10S=10*1000;
let nomeUsuarios=[];
let idInterval;
let usuarioSelecionado="Todos";
let visibilidadeSelecionada="Público";
let elementoMensagens=document.querySelector(".container");
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
        setInterval(manterConexao,TEMPO_5S);
        buscarMensagens();
        idInterval=setInterval(buscarMensagens,TEMPO_3S);
        carregarUsuarios();
        setInterval(carregarUsuarios,TEMPO_10S);
        
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
        if(verificarMensagemPrivada(resposta.data[i],nomeUsuario)){
            elementoMensagens.innerHTML+=
            `<div id="${i}" class='mensagem reservada'>
                <h3><span>(${resposta.data[i].time})</span> <strong>${resposta.data[i].from}</strong> reservadamente para ${resposta.data[i].to}: ${resposta.data[i].text}</h3>
            </div>`;
            elementoMensagem=document.getElementById(`${i}`)
            elementoMensagem.scrollIntoView();
        }  
    }
    console.log(`site carregou as mensagens do servidor`);
}
function verificarMensagemPrivada(dados,nome){
    let destinatario=dados.to;
    let origem=dados.from;
    let tipoMensagem=dados.type;
    if((destinatario===nome || origem===nome) && tipoMensagem==="private_message"){
        return true
    }
    return false;
}
function tratarErroBuscarMensagem(erro){
    alert(`Erro ao receber as mensagem do servidor: ${erro.response.status}`);
}

function enviarMensagem(){
    const objetoMensagem={
        from:nomeUsuario,
        to:"Todos", 
        text: document.querySelector("input").value,
        type: "message" // ou "private_message" para o bônus
    }
    clearInterval(idInterval);
    const promise=axios.post("https://mock-api.driven.com.br/api/v6/uol/messages",objetoMensagem);
    promise.then(tratarSucessoEnviarMensagem);
    promise.catch(tratarErroEnviarMensagem);
    document.querySelector("input").value="";
}
function tratarSucessoEnviarMensagem(resposta){
    //console.log(`ESTA É A RESPOSTA DO SERVER : ${resposta.status}`)
    if(resposta.status===200){
        idInterval=setInterval(buscarMensagens,3000);
    }
}
function tratarErroEnviarMensagem(erro){
    if(erro.response.status!==200){
        alert(`Erro ao enviar mensagem para o servidor, usuário não está online: ${erro.response.status}`);
        window.location.reload();
    }  
}

//BONUS
function carregarUsuarios(){
    const promise=axios.get("https://mock-api.driven.com.br/api/v6/uol/participants");
    promise.then(renderizarUsuarios);
    promise.catch(TratarErroabrirDestinatario);
}
function renderizarUsuarios(resposta){
    const qntUsuarios=resposta.data.length;
    if(nomeUsuarios.length===qntUsuarios){
        return true;
    }
    nomeUsuarios=resposta.data;

    document.querySelector(".participantes").innerHTML=`
    <div class="participante">
        <div onclick="selecionarUsuario(this)">
            <ion-icon name="people"></ion-icon>
            <h2>Todos</h2>
        </div>
        <ion-icon class="selecionado" name="checkmark"></ion-icon>
    </div>`;
    for (let i=0;i<qntUsuarios;i++){
        document.querySelector(".participantes").innerHTML+=`
        <div class="participante" >
            <div onclick="selecionarUsuario(this)">
                <ion-icon name="person-circle-outline"></ion-icon>
                <h2>${resposta.data[i].name}</h2>
            </div>
            <ion-icon class="deselecionado" name="checkmark"></ion-icon>
        </div>`;
    }
}

function abrirDestinatario(){
    document.querySelector(".tela-de-participantes").classList.remove("escondido");
    const elemento=document.querySelector(".tela-escura");
    elemento.classList.add("habilitado");
    elemento.addEventListener("click",desabilitarTelaEscura);
    alterarFrase();
}
function selecionarUsuario(elemento){
    let elementoSelecionado=document.querySelector(".participantes .selecionado");
    let checkDoElementoClicado=elemento.parentNode.querySelector("div+ion-icon");
    if(checkDoElementoClicado!==elementoSelecionado){
        checkDoElementoClicado.classList.add("selecionado");
        checkDoElementoClicado.classList.remove("deselecionado");
        elementoSelecionado.classList.remove("selecionado");
        elementoSelecionado.classList.add("deselecionado");
    }
     usuarioSelecionado=elemento.querySelector("h2").innerHTML;
    alterarFrase();
    
}
function selecionarVisibilidade(elemento){
    let elementoSelecionado=document.querySelector(".opcoes-visibilidade .selecionado");
    let checkDoElementoClicado=elemento.parentNode.querySelector("div+ion-icon");
    if(checkDoElementoClicado!==elementoSelecionado){
        checkDoElementoClicado.classList.add("selecionado");
        checkDoElementoClicado.classList.remove("deselecionado");
        elementoSelecionado.classList.remove("selecionado");
        elementoSelecionado.classList.add("deselecionado");
    }
    visibilidadeSelecionada=elemento.querySelector("h2").innerHTML;
    alterarFrase();
}
function alterarFrase(){
    document.querySelector("footer h4").innerHTML=`Escrevendo para ${usuarioSelecionado} (${visibilidadeSelecionada.toLowerCase()})`
}
function TratarErroabrirDestinatario(erro){
    if(erro.response.status!==200){
        alert(`Erro  para receber dados do servidor: ${erro.response.status}-${erro.response.data}`);
        window.location.reload();
    }
}

function desabilitarTelaEscura(){
    const elemento=document.querySelector(".tela-escura");
    if(elemento.classList.contains("habilitado")){
        elemento.classList.remove("habilitado");
        document.querySelector(".tela-de-participantes").classList.add("escondido");
    }
}