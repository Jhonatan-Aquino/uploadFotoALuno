// ==UserScript==
// @name          Upload Automático de Fotos de Perfil
// @namespace     http://tampermonkey.net/
// @version       1.0.1
// @description   Automatiza o upload de fotos de perfil dos alunos (formato: CODIGOALUNO.jpg)
// @author        Jhonatan Aquino
// @match         https://*.sigeduca.seduc.mt.gov.br/ged/hwmconaluno.aspx*
// @match         http://*.sigeduca.seduc.mt.gov.br/ged/hwmconaluno.aspx*
// @grant         GM_xmlhttpRequest
// @grant         GM_setValue
// @grant         GM_getValue
// @grant         GM_addStyle
// @require       https://code.jquery.com/jquery-3.6.0.min.js
// @updateURL     https://raw.githubusercontent.com/Jhonatan-Aquino/uploadFotoALuno/main/Upload-Automático-de-Fotos-de-Perfil.user.js
// @downloadURL   https://raw.githubusercontent.com/Jhonatan-Aquino/uploadFotoALuno/main/Upload-Automático-de-Fotos-de-Perfil.user.js
// ==/UserScript==

// No início do seu script (fora de qualquer função)
window.arquivosPendentesUAF = [];
window.processamentoEmAndamentoUAF = false;

(function() {
    'use strict';

    // Estilos CSS personalizados (mantidos os mesmos)
    GM_addStyle(`
           /* Estilos base do container principal */
        #containerUAF {
            background: rgba(237, 237, 237, 0.75);
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.15);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(214, 214, 214, 0.5);
            border-radius: 20px;
            color: #293254;
            width: auto;
            text-align: center;
            font-weight: bold;
            position: fixed;
            z-index: 2002;
            padding: 15px;
            bottom: 33px;
            left: 540px;
            height: auto;
            min-width: 350px;
        }
            /* Efeito de brilho nos bordas */
             #containerUAF::after{
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(0, 0, 0, 0.1),
              transparent
            );
          }
                /* Estilos gerais dentro do container */
        #containerUAF * {
            font-family: "SF Pro Text","SF Pro Icons","Helvetica Neue","Helvetica","Arial",sans-serif !important;
        }

        #containerUAF a {
            color: #666 !important;
        }

        /* Estilo base do botão UAF */
        #containerUAF .botaoUAF {
            background: #ebebeb;
            backdrop-filter: blur(6px);
            border-radius: 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.25);
            color: #3982f7;
            font-size: 13px;
            font-weight: normal;
            padding: 9px 20px;
            min-width: 124.5px;
            margin: 5px;
            text-decoration: none;
            transition: all 0.15s ease-in-out;
        }

        /* Variação para labels */
        #containerUAF label.botaoUAF {
            background-color: transparent;
            color: #3982f7;
            border: 1px solid #3982f7;
        }

        #containerUAF label.botaoUAF:hover {
            background: #3982f7;
            transform: scale(1.02);
            color: #fff;
        }

        /* Botão de ação principal */
        #containerUAF #btnIniciarProcessoUAF {
            background: #3982f7;
            color: #fff;
            border: none;
        }

        #containerUAF #btnIniciarProcessoUAF:hover {
            background: #3982f7;
            opacity: 0.9;
            transform: scale(1.02);
        }

        /* Botão secundário */
        #containerUAF #btnDownloadCSV {
            background-color: rgba(255, 255, 255, 0.2);
            color: #293254;
            border: 1px solid rgba(0, 0, 0, 0.1);
        }

        #containerUAF #btnDownloadCSV:hover {
            background-color: #f5f5f5;
            transform: scale(1.02);
        }

        /* Estilos da área de arquivo */
        #containerUAF #fileInputUAF {
            display: none;
        }

        #containerUAF #fileListUAF {
            max-height: 200px;
            overflow-y: auto;
            margin: 20px 0;
            border: 1px dashed #ccc;
            padding: 10px;
            border-radius: 10px;
            scrollbar-width: none;
        }

        #containerUAF .fileItem {
            margin: 3px 0;
            padding: 7px;
            background: rgba(255,255,255,0.5);
            border-radius: 5px;
            font-weight: normal;
            text-align: left;
        }

        #containerUAF .fileItem.error {
            background: rgba(255,200,200,0.7);
        }

        #containerUAF .fileItem.success {
            background: rgb(126, 213, 126) !important;
            transition: background-color 0.3s ease;
        }

        #containerUAF .fileItem.failure {
            background: rgb(227, 122, 122) !important;
            transition: background-color 0.3s ease;
        }

        /* Estilos da div de log */
        #containerUAF .divlogUAF {
            background: rgba(244, 244, 244, 0.58);
            border-radius: 16px;
            box-shadow: 0 5px 10px rgba(0, 0, 0, 0);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(214, 214, 214, 0.27);
            color: #3982f7;
            width: auto;
            text-align: center;
            position: absolute;
            z-index: 2002;
            padding: 5px 15px;
            bottom: 103%;
            min-height: 25px;
            min-width: 340px;
            font-size: 14px;
            font-weight: normal;
            line-height: 25px;
            display: none;
        }

        /* Estilos do botão de exibir */
        #exibirUAF {
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(20px);
            font-weight: 500;
            letter-spacing: 0.3px;
            padding: 5px 15px;
        }

        #exibirUAF:hover {
            background: rgba(0, 0, 0, 0.9);
        }

        /* Estilos do botão de loading */
        #containerUAF #loadingBtn {
            position: relative;
            padding: 15px 20px;
            font-size: 14px;
            background: none;
            color: #3982f7;
            cursor: pointer;
            border-radius: 5px;
            overflow: hidden;
            border: none;
            width: 100%;
            margin-top: 10px;
            display: none;
        }

        #containerUAF #loadingBtn.loading::after {
            content: "";
            position: absolute;
            width: 56px;
            height: 56px;
            border: 3px solid #3982f7;
            border-top-color: transparent;
            border-radius: 50%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation: spin 1.8s linear infinite;
        }

        /* Estilos do iframe de upload */
        #containerUAF #uploadFrame {
            width: 1200px;
            height: 900px;
            border: none;
            position: fixed;
            left: 0px;
            bottom: 0px;
            z-index: 9999;
            display: none;
            visibility: hidden;
        }

        /* Estilos da área de progresso */
        #containerUAF #progressAreaUAF {
            width: 100%;
            margin: 10px 0;
            display: none;
        }

        #containerUAF .progress-container {
            width: 100%;
            margin: 10px 0;
            display: none;
        }

        #containerUAF .progress-bar-wrapper {
            width: 100%;
            background-color: #f0f0f0;
            border-radius: 10px;
            padding: 3px;
            margin-bottom: 8px;
            overflow: hidden;
        }

        #containerUAF .progress-bar {
            height: 5px;
            background-color: #4BB543;
            border-radius: 8px;
            width: 0%;
            transition: width 0.5s ease-in-out;
            position: relative;
            overflow: hidden;
        }

        #containerUAF .progress-bar::after {
            content: "";
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
            animation: glowingEffect 2s infinite linear;
        }

        #containerUAF .progress-text {
            text-align: center;
            color: #293254;
            font-size: 12px;
            font-family: "SF Pro Text","SF Pro Icons","Helvetica Neue","Helvetica","Arial",sans-serif;
            padding: 5px 0;
            font-weight: normal;
        }

        /* Estilos do seletor e ajuda */
        #containerUAF .divseletor {
            padding: 0;
            text-align: center;
            min-width: 460px;
        }

        #containerUAF .divseletor h3 {
            font-size: 28px !important;
            font-weight: 500 !important;
            margin-bottom: 15px;
            color: #1d1d1f;
            letter-spacing: -0.5px;
        }

        #containerUAF .divseletor p {
            font-size: 8pt !important;
            color: rgb(71, 78, 104);
            line-height: 1.5;
            margin-bottom: 20px !important;
        }

        #containerUAF .divseletor p em {
            color: #2997ff;
            font-style: normal;
            font-weight: 500;
        }

        #containerUAF .divajuda {
            display: none;
            max-width: 460px;
            max-height: 700px;
            overflow: hidden;
            line-height: 20px;
            font-size: 11px;
            font-weight: normal;
            text-align: justify;
        }

        /* Estilos SVG e botões de controle */
        #containerUAF svg:hover path {
            fill: #3982f7 !important;
        }

        #containerUAF .btnscontrole {
            cursor: pointer;
            transition: all 0.2s ease-in-out;
        }

        #containerUAF .btnscontrole:hover path {
            fill: #3982f7 !important;
        }

        /* Animações */
        @keyframes spin {
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes glowingEffect {
            0% { left: -100%; }
            100% { left: 100%; }
        }
    `);

    // Função para criar a interface do usuário
    function criarInterface() {
        // Primeiro, remover quaisquer instâncias existentes
        const elementosExistentes = document.querySelectorAll('#containerUAF, #exibirUAF');
        elementosExistentes.forEach(el => el.remove());

        console.log('Criando interface...');

        // Criar o botão
        const btnExibir = document.createElement('input');
        btnExibir.type = 'button';
        btnExibir.id = 'exibirUAF';
        btnExibir.className = 'menuSCT';
        btnExibir.style.backgroundColor = "#293254";
        btnExibir.style.color = "#ffffff";
        btnExibir.style.fontSize = "12px";
        btnExibir.style.border = "none";
        btnExibir.style.width = "auto";
        btnExibir.style.height = "30px";
        btnExibir.style.position = "fixed";
        btnExibir.style.zIndex = "2002";
        btnExibir.style.bottom = "1px";
        btnExibir.style.left = "540px";
        btnExibir.style.cursor = "pointer";
        btnExibir.style.transition = "background-color 0.1s ease-in-out";
        btnExibir.style.borderRadius = "15px";

        // Configurar estado do botão
        const estadoSalvo = getCookie('estadoMenu') || 'aberto';
        btnExibir.value = estadoSalvo === 'fechado' ? "ABRIR | Upload de fotos" : "MINIMIZAR";

        // Criar div principal
        const divCredit = document.createElement('div');
        divCredit.id = 'containerUAF';
        divCredit.className = 'menuSCT';

        // Configurar conteúdo
        divCredit.innerHTML = `
            <div class="divlogUAF" id="divlogUAF"></div>
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" title="Voltar" version="1.1" class="btnscontrole" width="20" height="20" style=" margin: 10px;position: absolute;left: 0; bottom: 0; display:none" id="btnvoltar" viewBox="0 0 256 256" xml:space="preserve">
                <defs></defs>
                <g style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;" transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
                    <path d="M 4 49 h 82 c 2.209 0 4 -1.791 4 -4 s -1.791 -4 -4 -4 H 4 c -2.209 0 -4 1.791 -4 4 S 1.791 49 4 49 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: #666; fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
                    <path d="M 16.993 61.993 c 1.023 0 2.048 -0.391 2.828 -1.172 c 1.563 -1.562 1.563 -4.095 0 -5.656 L 9.657 45 l 10.164 -10.164 c 1.563 -1.562 1.563 -4.095 0 -5.657 c -1.561 -1.562 -4.094 -1.562 -5.656 0 L 1.172 42.171 C 0.422 42.922 0 43.939 0 45 c 0 1.061 0.422 2.078 1.172 2.828 l 12.993 12.993 C 14.945 61.603 15.97 61.993 16.993 61.993 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: #666; fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
                </g>
            </svg>
            <div class="divseletor">
                <h3>Upload Automático de Fotos</h3>
                <p style="font-size: 10pt; font-family: 'SF Pro Text','SF Pro Icons','Helvetica Neue','Helvetica','Arial',sans-serif !important; font-weight: normal; margin-top: -15px;margin-bottom: 40px;">
                    Selecione as fotos para upload!<br>
                    Exemplo: <em>1937175.jpg</em>
                </p>
                <input type="file" id="fileInputUAF" multiple accept=".jpg,.jpeg">
                <label for="fileInputUAF" class="botaoUAF" style="cursor:pointer;">Selecionar Fotos</label>
                <div id="fileListUAF"></div>
                <input type='button' id='btnIniciarProcessoUAF' value='Iniciar Upload' class='botaoUAF' style='display:none;'>
                <div id="progressAreaUAF">
                    <div class="progress-bar-wrapper">
                        <div class="progress-bar"></div>
                    </div>
                    <div class="progress-text">0% - Pronto para iniciar</div>
                </div>
            </div>
            <div class="divajuda">
                <h3 style="font-size:15pt;text-align:center; line-height: 10px;font-family: "SF Pro Text","SF Pro Icons","Helvetica Neue","Helvetica","Arial",sans-serif !important;">Como usar?</h3>

                <p><b>1. Preparar as fotos:</b> Prepare suas fotos seguindo o padrão de nomenclatura CODIGOALUNO.jpg (exemplo: 1937175.jpg). As fotos devem estar no formato JPG ou JPEG.</p>

                <p><b>2. Selecionar fotos:</b> Clique em "Selecionar Fotos" e escolha todas as fotos que deseja enviar. O sistema validará automaticamente os nomes dos arquivos.</p>

                <p><b>3. Iniciar upload:</b> Após a validação, clique em "Iniciar Upload". Uma barra de progresso mostrará o andamento do processo.</p>

                <p><b>4. Acompanhamento:</b> O sistema processará cada foto automaticamente, exibindo mensagens de sucesso ou erro. Ao final, você poderá baixar um relatório completo do processo em formato CSV.</p>

                <p><b>Observações importantes:</b>
                - Tamanho máximo por arquivo: 5MB<br>
                - Formatos aceitos: JPG, JPEG<br>
                - O nome do arquivo deve ser exatamente o código do aluno (ex: 1937175.jpg)<br>
                - Em caso de erro, verifique a mensagem no log<br>
                - O relatório final mostrará detalhes de cada upload</p>
            </div>
            <div class="containerUAF" style="color: #293254;">
                <div>
                    <span style='font-size:8pt;font-weight:normal;font-family: "SF Pro Text","SF Pro Icons","Helvetica Neue","Helvetica","Arial",sans-serif !important;'><a href="https://github.com/Jhonatan-Aquino/" target="_blank" style="text-color:rgb(71, 78, 104) !important;  text-decoration: none !important;">< Jhonatan Aquino /></a></span>
                    <br>
                    <span style='color:inherit;font-weight: normal; font-family: "SF Pro Text","SF Pro Icons","Helvetica Neue","Helvetica","Arial",sans-serif !important;'>Upload Automático de Fotos v${GM_info.script.version}</span>
                </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" title="Ajuda" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="20" height="20" class="btnajuda" id="btnajuda" viewBox="0 0 256 256" style=" margin: 10px;position: absolute;left: 0; bottom: 0;" xml:space="preserve">
                <defs></defs>
                <g style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;" transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
                    <path d="M 45 58.88 c -2.209 0 -4 -1.791 -4 -4 v -4.543 c 0 -1.101 0.454 -2.153 1.254 -2.908 l 8.083 -7.631 c 1.313 -1.377 2.035 -3.181 2.035 -5.087 v -0.302 c 0 -2.005 -0.791 -3.881 -2.228 -5.281 c -1.436 -1.399 -3.321 -2.14 -5.342 -2.089 c -3.957 0.102 -7.175 3.523 -7.175 7.626 c 0 2.209 -1.791 4 -4 4 s -4 -1.791 -4 -4 c 0 -8.402 6.715 -15.411 14.969 -15.623 c 4.183 -0.109 8.138 1.439 11.131 4.357 c 2.995 2.918 4.645 6.829 4.645 11.01 v 0.302 c 0 4.027 -1.546 7.834 -4.354 10.72 c -0.04 0.041 -0.08 0.081 -0.121 0.12 L 49 52.062 v 2.818 C 49 57.089 47.209 58.88 45 58.88 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: #a5a5a5; fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
                    <path d="M 45 71.96 c -1.32 0 -2.61 -0.53 -3.54 -1.46 c -0.23 -0.23 -0.43 -0.49 -0.62 -0.76 c -0.18 -0.271 -0.33 -0.561 -0.46 -0.86 c -0.12 -0.311 -0.22 -0.62 -0.28 -0.94 c -0.07 -0.32 -0.1 -0.65 -0.1 -0.98 c 0 -0.32 0.03 -0.65 0.1 -0.97 c 0.06 -0.32 0.16 -0.641 0.28 -0.94 c 0.13 -0.3 0.28 -0.59 0.46 -0.86 c 0.19 -0.279 0.39 -0.529 0.62 -0.76 c 1.16 -1.16 2.89 -1.7 4.52 -1.37 c 0.32 0.07 0.629 0.16 0.93 0.29 c 0.3 0.12 0.59 0.28 0.859 0.46 c 0.28 0.181 0.53 0.391 0.761 0.62 c 0.239 0.23 0.439 0.48 0.63 0.76 c 0.18 0.271 0.33 0.561 0.46 0.86 c 0.12 0.3 0.22 0.62 0.279 0.94 C 49.97 66.31 50 66.64 50 66.96 c 0 0.33 -0.03 0.66 -0.101 0.979 c -0.06 0.32 -0.159 0.63 -0.279 0.94 c -0.13 0.3 -0.28 0.59 -0.46 0.86 c -0.19 0.27 -0.391 0.529 -0.63 0.76 c -0.23 0.229 -0.48 0.439 -0.761 0.62 c -0.27 0.18 -0.56 0.34 -0.859 0.46 c -0.301 0.13 -0.61 0.22 -0.93 0.279 C 45.65 71.93 45.33 71.96 45 71.96 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: #a5a5a5; fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
                    <path d="M 45 90 C 20.187 90 0 69.813 0 45 S 20.187 0 45 0 s 45 20.187 45 45 S 69.813 90 45 90 z M 45 8 C 24.598 8 8 24.598 8 45 s 16.598 37 37 37 s 37 -16.598 37 -37 S 65.402 8 45 8 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: #bebebe; fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
                </g>
            </svg>
        `;

        // Adicionar elementos ao documento
        document.body.appendChild(btnExibir);
        document.body.appendChild(divCredit);

        // Configurar eventos
        btnExibir.onmouseover = () => btnExibir.style.backgroundColor = "#3982F7";
        btnExibir.onmouseout = () => btnExibir.style.backgroundColor = "#293254";
        btnExibir.onclick = function() {
            const novoEstado = this.value === "MINIMIZAR" ? "fechado" : "aberto";
            $("#containerUAF").slideToggle();
            this.value = novoEstado === "fechado" ? "ABRIR | Upload de fotos" : "MINIMIZAR";
            setCookie('estadoMenu', novoEstado, 30);
        };

        // Configurar visibilidade inicial
        if (estadoSalvo === 'fechado') {
            $("#containerUAF").hide();
        }

        // Adicionar eventos da ajuda
        const btnAjuda = document.getElementById('btnajuda');
        if (btnAjuda) {
            btnAjuda.addEventListener('click', ajuda);
        }

        // Evento para fechar ajuda ao clicar no label de arquivo
        const labelFileInput = document.querySelector('label[for="fileInputUAF"]');
        if (labelFileInput) {
            labelFileInput.addEventListener('click', function() {
                const divAjuda = document.querySelector('.divajuda');
                if (divAjuda && divAjuda.style.display !== 'none') {
                    $('.divajuda').slideUp(500, 'swing');
                    $('.btnajuda').fadeIn(500);
                    $('.divseletor').slideDown(500, 'swing');
                }
            });
            console.log('[UAF] Label fileInputUAF encontrado e evento adicionado');
        } else {
            console.error('[UAF] Label fileInputUAF não encontrado!');
        }

        // Criar barra de progresso
        const progressAreaUAF = document.getElementById('progressAreaUAF');
        if (progressAreaUAF) {
            progressAreaUAF.appendChild(criarBarraProgresso());
        }

        // Adicionar o evento de clique ao botão voltar
        document.getElementById('btnvoltar').addEventListener('click', voltar);

        console.log('Interface criada com sucesso!');

        // Após criar a interface, inicializar o LogManager
        logManager.init();

        // Revinculando todos os eventos necessários
        // Adicionar evento ao fileInputUAF
        const fileInputUAF = document.getElementById('fileInputUAF');
        if (!fileInputUAF) {
            console.error('[UAF] fileInputUAF não encontrado!');
        } else {
            console.log('[UAF] fileInputUAF encontrado, adicionando evento change');

            // Usar uma flag para evitar múltiplos listeners
            if (!fileInputUAF.hasAttribute('data-uaf-listener')) {
                fileInputUAF.setAttribute('data-uaf-listener', 'true');

                fileInputUAF.addEventListener('change', function(e) {
                    console.log('[UAF] Evento change disparado! Arquivos selecionados:', e.target.files.length);

                    // Não chamar resetarSistema aqui pois pode limpar coisas demais
                    // resetarSistema();

                    const fileListUAF = document.getElementById('fileListUAF');
                    if (!fileListUAF) {
                        console.error('[UAF] fileListUAF não encontrado!');
                        return;
                    }

                    // Limpar lista anterior
                    fileListUAF.innerHTML = '';
                    arquivosParaProcessar = [];

                    const files = e.target.files;
                    if (!files || files.length === 0) {
                        console.log('[UAF] Nenhum arquivo selecionado');
                        return;
                    }

                    console.log(`[UAF] Processando ${files.length} arquivo(s)...`);
                    let hasErrors = false;

                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        console.log(`[UAF] Processando arquivo ${i + 1}: ${file.name}`);
                        const fileInfo = parseFileName(file.name);
                        console.log('[UAF] Resultado do parse:', fileInfo);

                        const fileItem = document.createElement('div');
                        fileItem.className = 'fileItem';

                        if (fileInfo.error) {
                            fileItem.classList.add('error');
                            fileItem.textContent = `❌ ${file.name}: ${fileInfo.error}`;
                            hasErrors = true;
                            console.error(`[UAF] Erro no arquivo ${file.name}:`, fileInfo.error);
                        } else {
                            fileInfo.file = file;
                            arquivosParaProcessar.push(fileInfo);
                            fileItem.textContent = `   ${file.name} → Aluno: ${fileInfo.codAluno}`;
                            console.log(`[UAF] Arquivo válido: ${file.name} → Aluno: ${fileInfo.codAluno}`);
                        }

                        fileListUAF.appendChild(fileItem);
                    }

                    console.log(`[UAF] Total de arquivos válidos: ${arquivosParaProcessar.length}`);

                    if (hasErrors) {
                        exibirLog('Alguns arquivos têm problemas. Corrija antes de continuar.', 5000, '#FF4B40');
                    }

                    if (arquivosParaProcessar.length > 0) {
                        exibirLog(`Pronto para processar ${arquivosParaProcessar.length} fotos válidas.`, 3000, '#34A568');
                        const btnIniciarUAF = document.getElementById('btnIniciarProcessoUAF');
                        const progressAreaUAF = document.getElementById('progressAreaUAF');
                        if (btnIniciarUAF) {
                            btnIniciarUAF.style.display = 'inline-block';
                            console.log('[UAF] Botão de iniciar exibido');
                        } else {
                            console.error('[UAF] btnIniciarProcessoUAF não encontrado!');
                        }
                        if (progressAreaUAF) {
                            progressAreaUAF.style.display = 'block';
                        }
                    } else if (!hasErrors) {
                        exibirLog('Nenhum arquivo válido foi selecionado.', 3000, '#FF4B40');
                    }
                });
            } else {
                console.log('[UAF] Listener já adicionado ao fileInputUAF');
            }
        }

        // Evento para iniciar o processo de upload
        const btnIniciarProcessoUAF = document.getElementById('btnIniciarProcessoUAF');
        if (btnIniciarProcessoUAF) {
            btnIniciarProcessoUAF.addEventListener('click', function() {
            if (isProcessing || arquivosParaProcessar.length === 0) return;

            // Inicializar estatísticas
            estatisticasProcesso = {
                inicioProcesso: new Date(),
                fimProcesso: null,
                totalArquivos: arquivosParaProcessar.length,
                arquivosProcessados: 0
            };

            isProcessing = true;
            currentFileIndex = 0;

            // Esconder botão de iniciar
            this.style.display = 'none';
            $('.btnajuda').fadeOut(500);

            // Mostrar e inicializar barra de progresso
            atualizarProgresso(5, 'Iniciando processamento...');

            processarProximoArquivo();
            });
        }

        // Eventos da ajuda
        document.getElementById('btnajuda').addEventListener('click', ajuda);
        document.getElementById('btnvoltar').addEventListener('click', voltar);

        // Evento para fechar ajuda ao clicar em selecionar arquivos (já adicionado acima, não precisa duplicar)

        console.log('[UAF] Eventos revinculados com sucesso!');

        // Garantir que o evento está sendo adicionado após um pequeno delay
        setTimeout(function() {
            const fileInputUAFCheck = document.getElementById('fileInputUAF');
            if (fileInputUAFCheck) {
                console.log('[UAF] fileInputUAF verificado após delay, está presente');
            } else {
                console.error('[UAF] fileInputUAF não encontrado após delay!');
            }
        }, 500);
    }

    // Chamar a função quando o documento estiver pronto
    $(document).ready(function() {
        console.log('[UAF] Documento pronto, criando interface...');
        criarInterface();
    });

    // Variáveis globais
    let arquivosParaProcessar = [];
    let currentFileIndex = 0;
    let isProcessing = false;
    let currentIframe = null;
    let registroLogs = [];
    let estatisticasProcesso = {
        inicioProcesso: null,
        fimProcesso: null,
        totalArquivos: 0,
        arquivosProcessados: 0
    };
    let timeoutWarningTriggered = false;
    let CONFIG_TEMPO_ESPERA_PROXIMO_ARQUIVO = 2000;

    // Configurações globais
    const CONFIG = {
        TEMPO_ESPERA_PADRAO: 3000,
        TEMPO_ESPERA_ERRO: 5000,
        TAMANHO_MAXIMO_ARQUIVO: 5 * 1024 * 1024, // 5MB
        MAX_TENTATIVAS_UPLOAD: 30,
        MAX_TENTATIVAS_PROCESSAMENTO: 60,
        TIMEOUT_TOTAL: 180000, // 3 minutos
        COLUNAS_LOG: ['Nome do Arquivo', 'Código do Aluno', 'Tipo do Retorno', 'Mensagem'],
        DELIMITADOR_CSV: ';'
    };

    // Sistema de Log melhorado
    class LogManager {
        constructor() {
            this.queue = [];
            this.isDisplaying = false;
            this.lastMessage = '';
            this.lastMessageTime = 0;
        }

        init() {
            this.divLog = document.getElementById('divlogUAF');
            if (!this.divLog) {
                console.warn('[UAF] Elemento divlogUAF não encontrado, criando...');
                this.divLog = document.createElement('div');
                this.divLog.id = 'divlogUAF';
                this.divLog.className = 'divlogUAF';
                document.body.appendChild(this.divLog);
            }
        }

        async addLog(mensagem, tempo = 3000, cor = '#3982f7') {
            if (!this.divLog) {
                this.init();
            }

            const now = Date.now();
            if (this.lastMessage === mensagem && (now - this.lastMessageTime) < 2000) {
                return;
            }

            this.lastMessage = mensagem;
            this.lastMessageTime = now;
            this.queue.push({ mensagem, tempo, cor });

            if (!this.isDisplaying) {
                this.processQueue();
            }
        }

        async processQueue() {
            if (!this.divLog) {
                this.init();
            }

            if (this.queue.length === 0) {
                this.isDisplaying = false;
                return;
            }

            this.isDisplaying = true;
            const { mensagem, tempo, cor } = this.queue.shift();

            this.divLog.style.display = 'block';
            this.divLog.style.color = cor;
            this.divLog.innerHTML = mensagem;

            await new Promise(resolve => setTimeout(resolve, tempo));
            this.divLog.style.display = 'none';

            await new Promise(resolve => setTimeout(resolve, 300));
            this.processQueue();
        }
    }

    // Criar instância do LogManager
    const logManager = new LogManager();

    // Função auxiliar de exibição de log
    function exibirLog(mensagem, tempo = 3000, cor = '#3982f7') {
        if (logManager) {
            logManager.addLog(mensagem, tempo, cor);
        } else {
            console.warn('LogManager não está disponível');
        }
    }

    // Função para analisar o nome do arquivo (apenas CODIGOALUNO.jpg)
    function parseFileName(fileName) {
        const baseName = fileName.replace(/\.[^/.]+$/, "");
        const extension = fileName.split('.').pop().toLowerCase();

        // Verificar extensão
        if (extension !== 'jpg' && extension !== 'jpeg') {
            return { error: `Formato inválido: ${fileName}. Use apenas arquivos JPG ou JPEG` };
        }

        // Verificar se o nome base é um número (código do aluno)
        if (!/^\d+$/.test(baseName)) {
            return { error: `Formato inválido: ${fileName}. Use CODIGOALUNO.jpg (exemplo: 1937175.jpg)` };
        }

        return {
            codAluno: baseName,
            fileName: fileName,
            file: null
        };
    }

    // Função para validação de arquivo
    function validarArquivo(file, fileInfo) {
        const tiposPermitidos = ['image/jpeg'];
        const erros = [];

        if (!tiposPermitidos.includes(file.type)) {
            const erro = 'Tipo de arquivo não permitido. Use apenas JPG ou JPEG.';
            erros.push(erro);
            registrarLog(
                fileInfo.fileName,
                fileInfo.codAluno,
                'erro',
                `Erro de validação: ${erro} (Tipo: ${file.type})`
            );
        }

        if (file.size > CONFIG.TAMANHO_MAXIMO_ARQUIVO) {
            const erro = 'Arquivo muito grande. O tamanho máximo permitido é 5MB.';
            erros.push(erro);
            registrarLog(
                fileInfo.fileName,
                fileInfo.codAluno,
                'erro',
                `Erro de validação: ${erro} (Tamanho: ${(file.size / 1024 / 1024).toFixed(2)}MB)`
            );
        }

        return {
            valido: erros.length === 0,
            erros: erros
        };
    }

    // Função centralizada para atualizar o progresso
    function atualizarProgresso(porcentagem, texto) {
        const progressAreaUAF = document.getElementById('progressAreaUAF');
        if (!progressAreaUAF) return;

        const barra = progressAreaUAF.querySelector('.progress-bar');
        const textoElement = progressAreaUAF.querySelector('.progress-text');

        if (barra && textoElement) {
            progressAreaUAF.style.display = 'block';
            barra.style.width = `${porcentagem}%`;
            textoElement.textContent = `${porcentagem}% - ${texto}`;
        }
    }

    // Modificação na função processarProximoArquivo
    async function processarProximoArquivo() {
        if (!arquivosParaProcessar || !Array.isArray(arquivosParaProcessar) || arquivosParaProcessar.length === 0) {
            exibirLog('Nenhum arquivo para processar', CONFIG.TEMPO_ESPERA_ERRO, '#FF4B40');
            $('.btnajuda').fadeIn(500);
            return;
        }

        if (currentFileIndex >= arquivosParaProcessar.length) {
            const progressoFinal = 100;
            atualizarProgresso(progressoFinal, 'Processo concluído!');
            exibirLog('Todas as fotos foram processadas!', CONFIG.TEMPO_ESPERA_PADRAO, '#4CAF50');
            $('.btnajuda').fadeIn(500);
            // Remover botão anterior se existir
            const botaoAnterior = document.getElementById('btnDownloadCSV');
            if (botaoAnterior) {
                botaoAnterior.remove();
            }

            // Criar novo botão
            const btnDownload = document.createElement('button');
            btnDownload.id = 'btnDownloadCSV';
            btnDownload.innerHTML = 'Baixar Relatório CSV';
            btnDownload.className = 'botaoUAF';

            // Inserir após o fileListUAF
            const fileListUAF = document.getElementById('fileListUAF');
            if (fileListUAF) {
                fileListUAF.insertAdjacentElement('afterend', btnDownload);
            }

            // Adicionar evento de click que chama exportarCSV
            btnDownload.addEventListener('click', exportarCSV);

            finalizarProcesso(null, false);
            return;
        }

        const fileInfo = arquivosParaProcessar[currentFileIndex];
        if (!fileInfo || !fileInfo.fileName || !fileInfo.codAluno) {
            exibirLog(`Arquivo inválido no índice ${currentFileIndex}`, CONFIG.TEMPO_ESPERA_ERRO, '#FF4B40');
            currentFileIndex++;
            setTimeout(processarProximoArquivo, CONFIG_TEMPO_ESPERA_PROXIMO_ARQUIVO);
            return;
        }

        const progressoAtual = Math.round(((currentFileIndex + 1) / arquivosParaProcessar.length) * 100);
        atualizarProgresso(progressoAtual, `Processando: ${fileInfo.fileName}`);

        try {
            const iframe = await abrirPaginaAluno(fileInfo.codAluno);
            await enviarFoto(iframe, fileInfo);
        } catch (error) {
            console.error('Erro ao processar arquivo:', error);
            exibirLog(error.message, CONFIG.TEMPO_ESPERA_ERRO, '#FF4B40');
        }

        currentFileIndex++;
        setTimeout(processarProximoArquivo, CONFIG_TEMPO_ESPERA_PROXIMO_ARQUIVO);
    }

    // Função para abrir a página do aluno (sem o último parâmetro)
    async function abrirPaginaAluno(codAluno) {
        return new Promise((resolve, reject) => {
            try {
                // Criar o iframe se não existir
                let currentIframe = document.querySelector('#iframeGED');
                if (!currentIframe) {
                    currentIframe = document.createElement('iframe');
                    currentIframe.id = 'iframeGED';
                    currentIframe.style.display = 'none';
                    document.body.appendChild(currentIframe);
                }

                const url = `http://sigeduca.seduc.mt.gov.br/ged/hwtmgedaluno.aspx?${codAluno},,HWMConAluno,UPD,1,0`;
                currentIframe.src = url;

                currentIframe.onload = () => {
                    resolve(currentIframe);
                };

                currentIframe.onerror = () => {
                    reject(new Error('Erro ao carregar página do aluno'));
                };

            } catch (error) {
                reject(error);
            }
        });
    }

    // Função principal de envio da foto
    async function enviarFoto(iframe, fileInfo) {
        const docFrame = iframe.contentDocument || iframe.contentWindow.document;

        // Aguardar um pouco para garantir que a página carregou completamente
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            // Validar arquivo
            await validarArquivo(fileInfo.file, fileInfo);

            // Encontrar o input de upload de foto
            const fileInputFoto = docFrame.getElementById('fileuploadUPLOADIFYFOTOContainer');
            if (!fileInputFoto) {
                throw new Error('Campo de upload de foto não encontrado');
            }

            exibirLog(`Iniciando upload de ${fileInfo.fileName}...`, CONFIG.TEMPO_ESPERA_PADRAO, '#3982f7');

            // Criar DataTransfer e adicionar o arquivo
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(fileInfo.file);
            fileInputFoto.files = dataTransfer.files;

            // Disparar eventos necessários
            fileInputFoto.dispatchEvent(new Event('change', { bubbles: true }));
            fileInputFoto.dispatchEvent(new Event('input', { bubbles: true }));

            // Aguardar um pouco para o upload processar
            await esperar(2000);

            // Clicar no botão Salvar
            const btnSalvar = docFrame.querySelector('input[name="BTNINCLUIRFOTO"]');
            if (!btnSalvar) {
                throw new Error('Botão de salvar foto não encontrado');
            }

            btnSalvar.click();

            // Aguardar processamento
            let processoConcluido = false;
            let tentativas = 0;

            while (!processoConcluido && tentativas < CONFIG.MAX_TENTATIVAS_PROCESSAMENTO) {
                // Verificar mensagens de sucesso/erro na página
                const avisoElement = docFrame.querySelector('.aviso');
                const erroElement = docFrame.querySelector('.erro');
                const spanMensagem = docFrame.querySelector('span[id*="TEXTO"]');

                const mensagemAviso = avisoElement?.textContent?.trim() || '';
                const mensagemErro = erroElement?.textContent?.trim() || '';
                const mensagemSpan = spanMensagem?.textContent?.trim() || '';

                const mensagemFinal = mensagemErro || mensagemAviso || mensagemSpan;

                if (mensagemFinal) {
                    const palavrasErro = ['erro', 'falha', 'impossível', 'impossivel', 'inválido', 'invalido', 'atenção', 'atencao'];
                    const palavrasSucesso = ['sucesso', 'concluído', 'concluido', 'realizado', 'salvo', 'adicionado'];

                    const ehSucesso = palavrasSucesso.some(palavra => mensagemFinal.toLowerCase().includes(palavra));
                    const ehErro = palavrasErro.some(palavra => mensagemFinal.toLowerCase().includes(palavra)) || !!mensagemErro;

                    // Registrar o log
                    registrarLog(
                        fileInfo.fileName,
                        fileInfo.codAluno,
                        ehErro ? 'erro' : ehSucesso ? 'sucesso' : 'aviso',
                        mensagemFinal
                    );

                    exibirLog(mensagemFinal, CONFIG.TEMPO_ESPERA_PADRAO, ehSucesso ? '#34A568' : ehErro ? '#FF4B40' : '#FFA500');
                    processoConcluido = true;

                    if (ehErro) {
                        throw new Error(mensagemFinal);
                    }

                    break;
                }

                // Verificar se a imagem foi atualizada (indicando sucesso)
                const imgFoto = docFrame.getElementById('FOTOALUNO');
                if (imgFoto && imgFoto.src && !imgFoto.src.includes('Foto3x4.png')) {
                    // Foto foi atualizada, provavelmente sucesso
                    registrarLog(
                        fileInfo.fileName,
                        fileInfo.codAluno,
                        'sucesso',
                        'Foto adicionada com sucesso'
                    );
                    exibirLog('Foto adicionada com sucesso', CONFIG.TEMPO_ESPERA_PADRAO, '#34A568');
                    processoConcluido = true;
                    break;
                }

                if (tentativas === Math.floor(CONFIG.MAX_TENTATIVAS_PROCESSAMENTO * 0.8)) {
                    if (!timeoutWarningTriggered) {
                        timeoutWarningTriggered = true;
                        exibirLog('Processamento está demorando muito. Exportando logs por precaução...', 5000, '#FFA500');
                        try {
                            exportarCSV();
                        } catch (error) {
                            console.error('Erro ao exportar CSV:', error);
                        }
                    }
                }

                await esperar(1000);
                tentativas++;

                if (tentativas % 10 === 0) {
                    exibirLog(`Aguardando processamento... (${tentativas}s)`, CONFIG.TEMPO_ESPERA_PADRAO, '#FFA500');
                }
            }

            if (!processoConcluido) {
                throw new Error('Tempo excedido aguardando resposta do servidor');
            }

            await esperar(2000);
            finalizarProcesso(iframe, false);

        } catch (error) {
            if (!timeoutWarningTriggered) {
                exibirLog('Erro no processamento. Exportando logs...', 5000, '#FFA500');
                try {
                    exportarCSV();
                } catch (exportError) {
                    console.error('Erro ao exportar CSV:', exportError);
                }
            }

            const progressoAtual = Math.round(((currentFileIndex + 1) / arquivosParaProcessar.length) * 100);
            atualizarProgresso(progressoAtual, `Erro: ${error.message}`);

            if (!registroLogs.some(log => log.arquivo === fileInfo.fileName && log.mensagem === error.message)) {
                registrarLog(
                    fileInfo.fileName,
                    fileInfo.codAluno,
                    'erro',
                    error.message
                );
            }
            exibirLog(error.message, CONFIG.TEMPO_ESPERA_ERRO, '#FF4B40');
            finalizarProcesso(iframe, true);
        }
    }

    // Função única de finalização do processo
    function finalizarProcesso(iframe, exportarLogCSV = false) {
        try {
            // Habilitar elementos de interface
            const elementos = document.querySelectorAll('.upload-control');
            elementos.forEach(elem => {
                elem.disabled = false;
            });

            if (exportarLogCSV) {
                // Remover botão anterior se existir
                const botaoAnterior = document.getElementById('btnDownloadCSV');
                if (botaoAnterior) {
                    botaoAnterior.remove();
                }

                // Criar novo botão
                const btnDownload = document.createElement('button');
                btnDownload.id = 'btnDownloadCSV';
                btnDownload.innerHTML = 'Baixar Relatório CSV';
                btnDownload.className = 'botaoUAF';

                // Inserir após o fileListUAF
                const fileListUAF = document.getElementById('fileListUAF');
                if (fileListUAF) {
                    fileListUAF.insertAdjacentElement('afterend', btnDownload);
                }

                btnDownload.addEventListener('click', exportarCSV);
            }

            return true;
        } catch (error) {
            console.error('Erro ao finalizar processo:', error);
            return false;
        }
    }

    // Função auxiliar de espera
    function esperar(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Função para gerenciar cookies
    function setCookie(name, value, days) {
        const d = new Date();
        d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + d.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    // Função para criar a barra de progresso
    function criarBarraProgresso() {
        const container = document.createElement('div');
        container.className = 'progress-container';
        container.innerHTML = `
            <div class="progress-bar-wrapper">
                <div class="progress-bar"></div>
            </div>
            <div class="progress-text">0% - Pronto para iniciar</div>
        `;
        return container;
    }

    // Adicionar a função de ajuda
    function ajuda() {
        $('.divbotoes').slideUp(500, 'swing');
        $('.divajuda').slideDown(500, 'swing');
        $('.btnajuda').fadeOut(500);
        $('.divseletor').slideUp(500, 'swing');
        $('.progress-container').slideUp(500, 'swing');
        $('#btnvoltar').slideDown(500, 'swing');
    }

    // Adicionar a função voltar
    function voltar() {
        $('.divajuda').slideUp(500, 'swing');
        $('#btnvoltar').fadeOut(500);
        $('.btnajuda').fadeIn(500);
        $('.divseletor').slideDown(500, 'swing');
    }

    // Função para registrar log
    function registrarLog(arquivo, codAluno, tipoRetorno, mensagem) {
        // Incrementar contador de arquivos processados
        estatisticasProcesso.arquivosProcessados++;

        // Registrar log
        registroLogs.push({
            arquivo: arquivo,
            codAluno: codAluno,
            tipoRetorno: tipoRetorno,
            mensagem: mensagem
        });

        // Atualizar o status visual do arquivo na lista
        atualizarStatusArquivo(arquivo, tipoRetorno);
    }

    // Função para atualizar o status visual do item na lista
    async function atualizarStatusArquivo(fileName, status) {
        const fileItems = document.querySelectorAll('.fileItem');
        for (const item of fileItems) {
            if (item.textContent.includes(fileName)) {
                // Remover classes existentes
                item.classList.remove('success', 'failure');

                // Adicionar nova classe baseada no status
                if (status === 'sucesso') {
                    item.classList.add('success');
                } else if (status === 'erro') {
                    item.classList.add('failure');
                }
                item.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                await esperar(500);
                break;
            }
        }
    }

    // Função para gerar relatório simplificado
    function gerarRelatorioEstatisticas() {
        if (!estatisticasProcesso || !estatisticasProcesso.inicioProcesso) {
            return [
                ['RESUMO DO PROCESSO'],
                ['Erro: Estatísticas não disponíveis'],
                [''],
                ['DETALHAMENTO DOS ARQUIVOS']
            ];
        }

        estatisticasProcesso.fimProcesso = new Date();
        const tempoTotal = (estatisticasProcesso.fimProcesso - estatisticasProcesso.inicioProcesso) / 1000;

        return [
            ['RESUMO DO PROCESSO'],
            ['Início', estatisticasProcesso.inicioProcesso.toLocaleString('pt-BR')],
            ['Fim', estatisticasProcesso.fimProcesso.toLocaleString('pt-BR')],
            ['Tempo Total', `${tempoTotal.toFixed(1)} segundos`],
            ['Total de Fotos Processadas', estatisticasProcesso.arquivosProcessados],
            [''],
            ['DETALHAMENTO DOS ARQUIVOS']
        ];
    }

    // Função para gerar e baixar CSV
    function exportarCSV() {
        const relatorio = gerarRelatorioEstatisticas();
        let csv = '';

        // Adicionar relatório resumido
        relatorio.forEach(linha => {
            if (Array.isArray(linha)) {
                csv += linha.join(CONFIG.DELIMITADOR_CSV) + '\n';
            } else {
                csv += linha + '\n';
            }
        });

        // Adicionar logs detalhados
        csv += CONFIG.COLUNAS_LOG.join(CONFIG.DELIMITADOR_CSV) + '\n';

        registroLogs.forEach(log => {
            const linha = [
                log.arquivo,
                log.codAluno,
                log.tipoRetorno,
                `"${log.mensagem.replace(/"/g, '""')}"`
            ].join(CONFIG.DELIMITADOR_CSV);

            csv += linha + '\n';
        });

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const dataHora = new Date().toLocaleString('pt-BR').replace(/[/:]/g, '-');

        const link = document.createElement('a');
        link.href = url;
        link.download = `relatorio_upload_fotos_${dataHora}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    function resetarSistema() {
        // Reset de variáveis de controle UAF
        window.arquivosProcessadosUAF = [];
        window.arquivosPendentesUAF = [];
        window.arquivosComErroUAF = [];
        window.processamentoEmAndamentoUAF = false;
        window.totalArquivosUAF = 0;
        window.arquivosProcessadosCountUAF = 0;

        arquivosParaProcessar.length = 0;
        isProcessing = false;
        timeoutWarningTriggered = false;

        // Reset de interface
        atualizarProgresso(0, 'Sistema pronto');

        // Limpar lista de arquivos UAF
        const fileListUAF = document.getElementById('fileListUAF');
        if (fileListUAF) {
            fileListUAF.innerHTML = '';
        }

        // Limpar input de arquivo UAF
        const fileInputUAF = document.getElementById('fileInputUAF');
        if (fileInputUAF) {
            fileInputUAF.value = '';
        }

        // Esconder botão de iniciar UAF
        const btnIniciarUAF = document.getElementById('btnIniciarProcessoUAF');
        if (btnIniciarUAF) {
            btnIniciarUAF.style.display = 'none';
        }

        // Reset do gerenciador de logs
        if (typeof logManager !== 'undefined' && logManager) {
            logManager.init();
        }

        // Habilitar controles
        document.querySelectorAll('.upload-control').forEach(elem => {
            elem.disabled = false;
        });

        // Limpar qualquer estado pendente
        if (window.timeoutProcessamento) {
            clearTimeout(window.timeoutProcessamento);
        }
    }
})();

