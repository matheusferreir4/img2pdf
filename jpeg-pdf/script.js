document.addEventListener("DOMContentLoaded", function () {
    // Elementos do DOM
    const fileInput = document.getElementById("fileInput");
    const dropZone = document.getElementById("dropZone");
    const convertButton = document.getElementById("convertButton");
    const previewContainer = document.getElementById("previewContainer");
    const previewImage = document.getElementById("previewImage");
    const previewInfo = document.getElementById("previewInfo");
    const statusMessage = document.getElementById("statusMessage");
    const removeButton = document.getElementById("removeButton");

    // Tipos de arquivo aceitos
    const acceptedFileTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    // Função para mostrar status
    function showStatus(type, message) {
        statusMessage.className = `status-message ${type}`;
        statusMessage.textContent = message;
        statusMessage.style.display = 'block';
        
        // Configura tempo de exibição baseado no tipo de mensagem
        const displayTime = type === 'error' ? 8000 : 5000;
        
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, displayTime);
    }

    // Função para validar arquivo
    function validateFile(file) {
        // Verifica tipo do arquivo
        if (!acceptedFileTypes.includes(file.type)) {
            showStatus('error', 'Formato não suportado. Use JPEG, PNG ou WebP.');
            return false;
        }
        
        // Verifica tamanho do arquivo
        if (file.size > maxFileSize) {
            showStatus('error', 'Arquivo muito grande. Tamanho máximo: 5MB.');
            return false;
        }
        
        return true;
    }

    // Função para manipular arquivo
    function handleFile(file) {
        if (!file) return;
        
        if (!validateFile(file)) {
            previewContainer.style.display = 'none';
            convertButton.disabled = true;
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            // Exibir prévia da imagem
            previewImage.src = e.target.result;
            previewContainer.style.display = 'block';
            
            // Exibir informações do arquivo
            const fileSize = (file.size / 1024).toFixed(2);
            const fileType = file.type.split('/')[1].toUpperCase();
            
            previewInfo.innerHTML = `
                ${file.name}<br>
                Tipo: ${fileType} | Tamanho: ${fileSize} KB
            `;
            
            convertButton.disabled = false;
            showStatus('success', 'Arquivo carregado com sucesso!');
        };
        
        reader.onerror = () => {
            showStatus('error', 'Erro ao ler o arquivo. Tente novamente.');
        };
        
        reader.readAsDataURL(file);
    }

    // Drag & Drop
    dropZone.addEventListener("dragover", (event) => {
        event.preventDefault();
        dropZone.classList.add("dragover");
    });
    
    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("dragover");
    });
    
    dropZone.addEventListener("drop", (event) => {
        event.preventDefault();
        dropZone.classList.remove("dragover");
        
        if (event.dataTransfer.files.length > 0) {
            fileInput.files = event.dataTransfer.files;
            handleFile(event.dataTransfer.files[0]);
        }
    });

    // Seleção manual de arquivo
    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // Botão de remover
    removeButton.addEventListener("click", () => {
        fileInput.value = '';
        previewContainer.style.display = 'none';
        convertButton.disabled = true;
        showStatus('info', 'Arquivo removido. Você pode enviar outro.');
    });

    // Conversão para PDF
    convertButton.addEventListener("click", async () => {
        if (!fileInput.files[0]) {
            showStatus('error', 'Selecione uma imagem antes de converter!');
            return;
        }
        
        const file = fileInput.files[0];
        
        // Mostra status de processamento
        showStatus('info', 'Convertendo imagem para PDF...');
        convertButton.disabled = true;
        convertButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Convertendo...';
        
        try {
            const result = await convertToPDF(file);
            showStatus('success', 'PDF gerado com sucesso!');
            
            // Atualiza o botão de download
            convertButton.innerHTML = '<i class="fas fa-file-download"></i> Converter Novamente';
            
        } catch (error) {
            showStatus('error', 'Erro na conversão: ' + error.message);
            convertButton.innerHTML = '<i class="fas fa-file-download"></i> Tentar Novamente';
        } finally {
            convertButton.disabled = false;
        }
    });

    // Função de conversão para PDF
    async function convertToPDF(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function (event) {
                const img = new Image();
                img.src = event.target.result;
                
                img.onload = function () {
                    try {
                        const { jsPDF } = window.jspdf;
                        const pdf = new jsPDF({ 
                            orientation: "portrait",
                            unit: "mm",
                            format: "a4"
                        });
                        
                        // Calcula dimensões mantendo proporção
                        const pageWidth = pdf.internal.pageSize.getWidth();
                        const pageHeight = pdf.internal.pageSize.getHeight();
                        const imgRatio = img.width / img.height;
                        
                        let imgWidth = pageWidth - 20; // Margem de 10mm cada lado
                        let imgHeight = imgWidth / imgRatio;
                        
                        // Se a altura for maior que a página, ajusta
                        if (imgHeight > pageHeight - 20) {
                            imgHeight = pageHeight - 20;
                            imgWidth = imgHeight * imgRatio;
                        }
                        
                        // Centraliza a imagem
                        const x = (pageWidth - imgWidth) / 2;
                        const y = (pageHeight - imgHeight) / 2;
                        
                        pdf.addImage(img, file.type.split('/')[1], x, y, imgWidth, imgHeight);
                        pdf.save("imagem_convertida.pdf");
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                };
                
                img.onerror = () => {
                    reject(new Error('Erro ao carregar a imagem'));
                };
            };
            
            reader.onerror = () => {
                reject(new Error('Erro ao ler o arquivo'));
            };
            
            reader.readAsDataURL(file);
        });
    }

    // Inicialização
    convertButton.disabled = true;
});

// Formulário de Contato
document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.querySelector('.submit-btn');
    const originalBtnText = submitBtn.innerHTML;
    
    try {
        // Simular envio (substitua por código real)
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;
        
        // Captura dados do formulário
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };
        
        // Aqui você pode adicionar:
        // 1. Validação adicional
        // 2. Envio para um servidor (ex: FormSubmit.co, Formspree)
        // 3. Integração com serviço de e-mail
        
        console.log('Formulário enviado:', formData);
        
        // Simular atraso de rede
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Feedback ao usuário
        alert('Mensagem enviada com sucesso! Responderemos em breve.');
        this.reset();
        
    } catch (error) {
        console.error('Erro no formulário:', error);
        alert('Ocorreu um erro. Tente novamente mais tarde.');
    } finally {
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
});

// Modal Pix - Certifique-se que este código está sendo executado
const pixBtn = document.getElementById('pixBtn');
const pixModal = document.getElementById('pixModal');
const closeModal = document.querySelector('.close-modal');

// Abrir modal
if (pixBtn) {
    pixBtn.addEventListener('click', () => {
        pixModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Impede scroll da página
    });
}

// Fechar modal
if (closeModal) {
    closeModal.addEventListener('click', () => {
        pixModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
}

// Fechar ao clicar fora
window.addEventListener('click', (event) => {
    if (event.target === pixModal) {
        pixModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});
