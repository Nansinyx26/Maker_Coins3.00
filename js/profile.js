/**
 * Profile Management Functions
 */
let currentAvatarBase64 = '';

function openProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) {
        modal.classList.add('show');
        loadProfileData();
    }
}

function closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

async function loadProfileData() {
    try {
        const user = await apiClient.getMe();
        document.getElementById('profile-nome').value = user.nome || '';
        document.getElementById('profile-idade').value = user.idade || '';

        if (user.avatar) {
            document.getElementById('profile-preview').src = user.avatar;
            currentAvatarBase64 = user.avatar;
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            convertToWebP(img);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function convertToWebP(img) {
    const canvas = document.getElementById('conversion-canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size (max 500x500 to keep file size reasonable)
    const maxSize = 500;
    let width = img.width;
    let height = img.height;

    if (width > height) {
        if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
        }
    } else {
        if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
        }
    }

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img, 0, 0, width, height);

    // Convert to WebP
    const webpDataUrl = canvas.toDataURL('image/webp', 0.8);

    // Update preview
    document.getElementById('profile-preview').src = webpDataUrl;
    currentAvatarBase64 = webpDataUrl;
}

async function saveProfile() {
    const nome = document.getElementById('profile-nome').value.trim();
    const idade = parseInt(document.getElementById('profile-idade').value);

    if (!nome) {
        alert('Por favor, preencha seu nome.');
        return;
    }

    try {
        const profileData = {
            nome: nome,
            idade: isNaN(idade) ? undefined : idade,
            avatar: currentAvatarBase64 || undefined
        };

        await apiClient.updateProfile(profileData);

        // Update local storage
        const updatedUser = await apiClient.getMe();
        localStorage.setItem('makerUser', JSON.stringify(updatedUser));

        // Update welcome message
        const welcomeEl = document.querySelector('.nb-welcome');
        if (welcomeEl) {
            welcomeEl.textContent = 'Olá, ' + updatedUser.nome;
        }

        // Update header profile image
        const headerImg = document.getElementById('header-profile-img');
        const headerIcon = document.getElementById('header-profile-icon');
        if (updatedUser.avatar && headerImg && headerIcon) {
            headerImg.src = updatedUser.avatar;
            headerImg.style.display = 'block';
            headerIcon.style.display = 'none';
        }

        closeProfileModal();
        alert('Perfil atualizado com sucesso!');
    } catch (error) {
        console.error('Error saving profile:', error);
        alert('Erro ao salvar perfil: ' + error.message);
    }
}
