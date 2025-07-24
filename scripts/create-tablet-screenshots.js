const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

async function createTabletScreenshots() {
    // Dimensiones para diferentes tablets
    const tabletSizes = {
        '7inch': {
            width: 1024,
            height: 600, // 16:9 aspect ratio
            name: '7-inch'
        },
        '10inch': {
            width: 1920,
            height: 1080, // 16:9 aspect ratio
            name: '10-inch'
        }
    };

    // Pantallas a generar
    const screens = [
        {
            name: 'home-screen',
            title: 'Pantalla Principal',
            description: 'Selecciona tu nivel y comienza a jugar'
        },
        {
            name: 'game-screen',
            title: 'Juego en Progreso',
            description: 'Conecta los puntos del mismo color'
        },
        {
            name: 'level-complete',
            title: '¡Nivel Completado!',
            description: '¡Excelente trabajo!'
        },
        {
            name: 'settings',
            title: 'Configuración',
            description: 'Ajusta audio y preferencias'
        }
    ];

    for (const [sizeKey, size] of Object.entries(tabletSizes)) {
        console.log(`\n📱 Generando screenshots para ${size.name}...`);

        // Crear directorio si no existe
        const outputDir = path.join(__dirname, `../assets/screenshots/${size.name}`);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        for (let i = 0; i < screens.length; i++) {
            const screen = screens[i];
            await createTabletScreenshot(size, screen, outputDir, i + 1);
        }
    }
}

async function createTabletScreenshot(size, screen, outputDir, index) {
    const canvas = createCanvas(size.width, size.height);
    const ctx = canvas.getContext('2d');

    // Fondo principal
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size.width, size.height);

    // Header con logo
    const headerHeight = size.height * 0.15;
    const gradient = ctx.createLinearGradient(0, 0, size.width, 0);
    gradient.addColorStop(0, '#3B82F6');
    gradient.addColorStop(1, '#1E40AF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size.width, headerHeight);

    try {
        // Logo en el header
        const logo = await loadImage(path.join(__dirname, '../assets/logo.png'));
        const logoSize = Math.min(headerHeight * 0.6, 80);
        const logoX = 20;
        const logoY = (headerHeight - logoSize) / 2;
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);

        // Título en el header
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.floor(size.width * 0.03)}px Arial, sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText('Pathly Game', logoX + logoSize + 15, logoY + logoSize * 0.7);

        // Contenido principal según la pantalla
        const contentY = headerHeight + 20;
        const contentHeight = size.height - headerHeight - 40;

        switch (screen.name) {
            case 'home-screen':
                await createHomeScreen(ctx, size, contentY, contentHeight);
                break;
            case 'game-screen':
                await createGameScreen(ctx, size, contentY, contentHeight);
                break;
            case 'level-complete':
                await createLevelCompleteScreen(ctx, size, contentY, contentHeight);
                break;
            case 'settings':
                await createSettingsScreen(ctx, size, contentY, contentHeight);
                break;
        }

        // Footer con descripción
        ctx.fillStyle = '#E5E7EB';
        ctx.fillRect(0, size.height - 60, size.width, 60);
        ctx.fillStyle = '#374151';
        ctx.font = `${Math.floor(size.width * 0.015)}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(screen.description, size.width / 2, size.height - 25);

        // Guardar screenshot
        const buffer = canvas.toBuffer('image/png');
        const filename = `${index.toString().padStart(2, '0')}-${screen.name}.png`;
        const outputPath = path.join(outputDir, filename);
        fs.writeFileSync(outputPath, buffer);

        console.log(`✅ ${filename} - ${(buffer.length / 1024).toFixed(1)}KB`);

    } catch (error) {
        console.error(`❌ Error al crear ${screen.name}:`, error);
    }
}

async function createHomeScreen(ctx, size, startY, height) {
    // Título principal
    ctx.fillStyle = '#1F2937';
    ctx.font = `bold ${Math.floor(size.width * 0.04)}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Selecciona un Nivel', size.width / 2, startY + 60);

    // Grid de niveles
    const gridCols = 5;
    const gridRows = 3;
    const levelSize = Math.min((size.width - 100) / gridCols, (height - 200) / gridRows);
    const startX = (size.width - (gridCols * levelSize)) / 2;
    const startGridY = startY + 100;

    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
            const levelNum = row * gridCols + col + 1;
            const x = startX + col * levelSize + 10;
            const y = startGridY + row * levelSize + 10;
            const buttonSize = levelSize - 20;

            // Botón del nivel
            ctx.fillStyle = levelNum <= 5 ? '#3B82F6' : '#E5E7EB';
            ctx.fillRect(x, y, buttonSize, buttonSize);

            // Número del nivel
            ctx.fillStyle = levelNum <= 5 ? '#FFFFFF' : '#6B7280';
            ctx.font = `bold ${Math.floor(buttonSize * 0.3)}px Arial, sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(levelNum.toString(), x + buttonSize / 2, y + buttonSize * 0.6);
        }
    }
}

async function createGameScreen(ctx, size, startY, height) {
    // Título del nivel
    ctx.fillStyle = '#1F2937';
    ctx.font = `bold ${Math.floor(size.width * 0.03)}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Nivel 3', size.width / 2, startY + 40);

    // Área del juego
    const gameAreaSize = Math.min(size.width - 100, height - 150);
    const gameX = (size.width - gameAreaSize) / 2;
    const gameY = startY + 60;

    // Fondo del área de juego
    ctx.fillStyle = '#F9FAFB';
    ctx.fillRect(gameX, gameY, gameAreaSize, gameAreaSize);

    // Grid de puntos
    const gridSize = 6;
    const cellSize = gameAreaSize / gridSize;

    // Puntos del juego
    const points = [
        { x: 1, y: 1, color: '#EF4444' },
        { x: 3, y: 1, color: '#EF4444' },
        { x: 5, y: 1, color: '#EF4444' },
        { x: 1, y: 3, color: '#10B981' },
        { x: 3, y: 3, color: '#10B981' },
        { x: 5, y: 3, color: '#10B981' },
        { x: 1, y: 5, color: '#3B82F6' },
        { x: 3, y: 5, color: '#3B82F6' },
        { x: 5, y: 5, color: '#3B82F6' }
    ];

    // Dibujar puntos
    points.forEach(point => {
        const x = gameX + point.x * cellSize - cellSize / 2;
        const y = gameY + point.y * cellSize - cellSize / 2;

        ctx.fillStyle = point.color;
        ctx.beginPath();
        ctx.arc(x, y, cellSize * 0.3, 0, 2 * Math.PI);
        ctx.fill();
    });

    // Líneas de conexión (ejemplo)
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(gameX + 1 * cellSize, gameY + 1 * cellSize);
    ctx.lineTo(gameX + 3 * cellSize, gameY + 1 * cellSize);
    ctx.lineTo(gameX + 5 * cellSize, gameY + 1 * cellSize);
    ctx.stroke();

    // Botones de acción
    const buttonY = gameY + gameAreaSize + 20;
    const buttonWidth = 120;
    const buttonHeight = 40;
    const buttonSpacing = 20;

    // Botón de pista
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(size.width / 2 - buttonWidth - buttonSpacing / 2, buttonY, buttonWidth, buttonHeight);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${Math.floor(size.width * 0.015)}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Pista', size.width / 2 - buttonSpacing / 2, buttonY + buttonHeight * 0.7);

    // Botón de reiniciar
    ctx.fillStyle = '#6B7280';
    ctx.fillRect(size.width / 2 + buttonSpacing / 2, buttonY, buttonWidth, buttonHeight);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Reiniciar', size.width / 2 + buttonWidth / 2 + buttonSpacing / 2, buttonY + buttonHeight * 0.7);
}

async function createLevelCompleteScreen(ctx, size, startY, height) {
    // Fondo de celebración
    const gradient = ctx.createRadialGradient(size.width / 2, size.height / 2, 0, size.width / 2, size.height / 2, size.width / 2);
    gradient.addColorStop(0, '#22C55E');
    gradient.addColorStop(1, '#16A34A');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, startY, size.width, height);

    // Mensaje de victoria
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.floor(size.width * 0.05)}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('¡Nivel Completado!', size.width / 2, startY + height * 0.3);

    // Estrellas
    const starSize = Math.floor(size.width * 0.04);
    const starY = startY + height * 0.4;
    for (let i = 0; i < 3; i++) {
        const x = size.width / 2 + (i - 1) * starSize * 2;
        drawStar(ctx, x, starY, starSize, '#FFD700');
    }

    // Puntuación
    ctx.font = `${Math.floor(size.width * 0.025)}px Arial, sans-serif`;
    ctx.fillText('Puntuación: 3/3 estrellas', size.width / 2, startY + height * 0.6);

    // Botones
    const buttonY = startY + height * 0.7;
    const buttonWidth = 150;
    const buttonHeight = 50;

    // Botón siguiente nivel
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(size.width / 2 - buttonWidth - 20, buttonY, buttonWidth, buttonHeight);
    ctx.fillStyle = '#16A34A';
    ctx.font = `${Math.floor(size.width * 0.02)}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Siguiente', size.width / 2 - buttonWidth / 2 - 20, buttonY + buttonHeight * 0.7);

    // Botón menú
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(size.width / 2 + 20, buttonY, buttonWidth, buttonHeight);
    ctx.fillStyle = '#16A34A';
    ctx.fillText('Menú', size.width / 2 + buttonWidth / 2 + 20, buttonY + buttonHeight * 0.7);
}

async function createSettingsScreen(ctx, size, startY, height) {
    // Título
    ctx.fillStyle = '#1F2937';
    ctx.font = `bold ${Math.floor(size.width * 0.04)}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Configuración', size.width / 2, startY + 50);

    // Opciones de configuración
    const options = [
        { name: 'Música', value: 'ON' },
        { name: 'Efectos de Sonido', value: 'ON' },
        { name: 'Vibración', value: 'OFF' },
        { name: 'Notificaciones', value: 'ON' }
    ];

    const optionHeight = 60;
    const startOptionY = startY + 100;

    options.forEach((option, index) => {
        const y = startOptionY + index * optionHeight;

        // Fondo de la opción
        ctx.fillStyle = index % 2 === 0 ? '#F9FAFB' : '#FFFFFF';
        ctx.fillRect(50, y, size.width - 100, optionHeight - 10);

        // Nombre de la opción
        ctx.fillStyle = '#374151';
        ctx.font = `${Math.floor(size.width * 0.02)}px Arial, sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(option.name, 80, y + optionHeight * 0.6);

        // Toggle switch
        const toggleX = size.width - 150;
        const toggleY = y + optionHeight * 0.3;
        const toggleWidth = 60;
        const toggleHeight = 30;

        // Fondo del toggle
        ctx.fillStyle = option.value === 'ON' ? '#22C55E' : '#D1D5DB';
        ctx.fillRect(toggleX, toggleY, toggleWidth, toggleHeight);

        // Círculo del toggle
        ctx.fillStyle = '#FFFFFF';
        const circleX = option.value === 'ON' ? toggleX + toggleWidth - toggleHeight / 2 : toggleX + toggleHeight / 2;
        ctx.beginPath();
        ctx.arc(circleX, toggleY + toggleHeight / 2, toggleHeight / 2 - 2, 0, 2 * Math.PI);
        ctx.fill();
    });
}

function drawStar(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const px = x + Math.cos(angle) * size;
        const py = y + Math.sin(angle) * size;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
}

createTabletScreenshots().then(() => {
    console.log('\n🎉 ¡Screenshots de tablets generados exitosamente!');
    console.log('📁 Ubicación: assets/screenshots/');
}).catch(error => {
    console.error('❌ Error:', error);
}); 