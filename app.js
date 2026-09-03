// Elementos do DOM
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');
const loading = document.getElementById('loading');
const statusMessage = document.getElementById('statusMessage');
const videoPreview = document.getElementById('videoPreview');
const previewBox = document.getElementById('previewBox');

// Controles
const durationInput = document.getElementById('duration');
const motionTypeSelect = document.getElementById('motionType');
const fpsSelect = document.getElementById('fps');
const promptInput = document.getElementById('prompt');

let uploadedImage = null;
let generatedVideoUrl = null;

// Event Listeners para upload
uploadArea.addEventListener('click', () => imageInput.click());
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleImageUpload(files[0]);
    }
});

imageInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleImageUpload(e.target.files[0]);
    }
});

generateBtn.addEventListener('click', generateVideo);
clearBtn.addEventListener('click', clearAll);
downloadBtn.addEventListener('click', downloadVideo);

// Funções
function handleImageUpload(file) {
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
        showStatus('Por favor, selecione uma imagem válida', 'error');
        return;
    }

    // Validar tamanho (50MB)
    if (file.size > 50 * 1024 * 1024) {
        showStatus('A imagem é muito grande. Máximo: 50MB', 'error');
        return;
    }

    uploadedImage = file;
    
    // Mostrar preview
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreview.classList.add('show');
        showStatus(`✅ Imagem carregada: ${file.name}`, 'success');
    };
    reader.readAsDataURL(file);
}

function showStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message show ${type}`;
    
    if (type === 'success') {
        setTimeout(() => statusMessage.classList.remove('show'), 5000);
    }
}

function generateVideo() {
    if (!uploadedImage) {
        showStatus('Por favor, selecione uma imagem primeiro', 'error');
        return;
    }

    // Simular geração de vídeo
    loading.classList.add('show');
    generateBtn.disabled = true;
    
    // Simular delay de processamento
    setTimeout(() => {
        createVideoFromImage();
    }, 2000);
}

function createVideoFromImage() {
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.onload = () => {
        const duration = parseInt(durationInput.value) || 5;
        const fps = parseInt(fpsSelect.value) || 30;
        const totalFrames = duration * fps;
        const motionType = motionTypeSelect.value;

        // Criar vídeo usando canvas
        const mediaRecorder = createMediaRecorder(canvas, fps);
        let frame = 0;

        const animate = () => {
            if (frame >= totalFrames) {
                mediaRecorder.stop();
                return;
            }

            const progress = frame / totalFrames;
            
            // Limpar canvas
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Aplicar movimento baseado no tipo
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);

            switch (motionType) {
                case 'zoom':
                    const zoom = 1 + (Math.sin(progress * Math.PI * 2) * 0.2);
                    ctx.scale(zoom, zoom);
                    break;
                case 'pan':
                    ctx.translate(Math.sin(progress * Math.PI * 2) * 100, 0);
                    break;
                case 'rotate':
                    ctx.rotate(progress * Math.PI * 2);
                    break;
                case 'wave':
                    ctx.skewX(Math.sin(progress * Math.PI * 2) * 0.1);
                    break;
                case 'pulse':
                    const pulse = 1 + (Math.sin(progress * Math.PI * 4) * 0.15);
                    ctx.scale(pulse, pulse);
                    break;
                default:
                    break;
            }

            // Desenhar imagem centralizada
            ctx.drawImage(
                img,
                -img.width / 2,
                -img.height / 2,
                img.width,
                img.height
            );

            ctx.restore();

            frame++;
            requestAnimationFrame(animate);
        };

        animate();
    };

    // Carregar imagem
    const reader = new FileReader();
    reader.onload = (e) => {
        img.src = e.target.result;
    };
    reader.readAsDataURL(uploadedImage);
}

function createMediaRecorder(canvas, fps) {
    const stream = canvas.captureStream(fps);
    const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2500000
    });

    const chunks = [];

    mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        generatedVideoUrl = URL.createObjectURL(blob);
        
        videoPreview.src = generatedVideoUrl;
        previewBox.style.display = 'flex';
        videoPreview.classList.add('show');
        downloadBtn.classList.add('show');
        
        loading.classList.remove('show');
        generateBtn.disabled = false;
        
        showStatus('✅ Vídeo gerado com sucesso!', 'success');
    };

    mediaRecorder.start();
    return mediaRecorder;
}

function downloadVideo() {
    if (!generatedVideoUrl) {
        showStatus('Nenhum vídeo para baixar', 'error');
        return;
    }

    const link = document.createElement('a');
    link.href = generatedVideoUrl;
    link.download = `video-ia-${Date.now()}.webm`;
    link.click();
    
    showStatus('📥 Vídeo baixado com sucesso!', 'success');
}

function clearAll() {
    uploadedImage = null;
    generatedVideoUrl = null;
    
    imageInput.value = '';
    imagePreview.classList.remove('show');
    videoPreview.classList.remove('show');
    previewBox.style.display = 'none';
    downloadBtn.classList.remove('show');
    loading.classList.remove('show');
    statusMessage.classList.remove('show');
    generateBtn.disabled = false;
    
    durationInput.value = '5';
    motionTypeSelect.value = 'zoom';
    fpsSelect.value = '30';
    promptInput.value = '';
    
    showStatus('🗑️ Tudo limpo!', 'info');
}

// Inicializar
console.log('✅ Gerador de Vídeos IA carregado');
showStatus('🎉 Bem-vindo! Carregue uma imagem para começar', 'info');
