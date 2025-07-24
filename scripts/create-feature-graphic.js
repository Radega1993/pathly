const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

async function createFeatureGraphic() {
    // Dimensiones requeridas para Google Play
    const width = 1024;
    const height = 500;

    // Crear canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fondo degradado azul (color principal del juego)
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#3B82F6'); // Azul principal
    gradient.addColorStop(1, '#1E40AF'); // Azul oscuro
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    try {
        // Cargar el logo
        const logo = await loadImage(path.join(__dirname, '../assets/logo.png'));

        // Calcular dimensiones del logo (centrado)
        const logoSize = 200;
        const logoX = (width - logoSize) / 2;
        const logoY = (height - logoSize) / 2 - 30;

        // Dibujar el logo
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);

        // Texto del título
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 48px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Pathly Game', width / 2, logoY + logoSize + 60);

        // Subtítulo
        ctx.font = '24px Arial, sans-serif';
        ctx.fillStyle = '#E5E7EB';
        ctx.fillText('Puzzles de Conexión', width / 2, logoY + logoSize + 90);

        // Elementos decorativos (puntos conectados)
        ctx.strokeStyle = '#22C55E';
        ctx.lineWidth = 3;

        // Dibujar algunos puntos conectados como ejemplo
        const points = [
            { x: 150, y: 100 },
            { x: 250, y: 150 },
            { x: 350, y: 100 },
            { x: 450, y: 150 },
            { x: 550, y: 100 }
        ];

        // Puntos
        ctx.fillStyle = '#22C55E';
        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Líneas de conexión
        for (let i = 0; i < points.length - 1; i++) {
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[i + 1].x, points[i + 1].y);
            ctx.stroke();
        }

        // Más puntos en el lado derecho
        const rightPoints = [
            { x: 750, y: 120 },
            { x: 850, y: 80 },
            { x: 950, y: 120 }
        ];

        rightPoints.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
            ctx.fill();
        });

        for (let i = 0; i < rightPoints.length - 1; i++) {
            ctx.beginPath();
            ctx.moveTo(rightPoints[i].x, rightPoints[i].y);
            ctx.lineTo(rightPoints[i + 1].x, rightPoints[i + 1].y);
            ctx.stroke();
        }

        // Guardar la imagen
        const buffer = canvas.toBuffer('image/png');
        const outputPath = path.join(__dirname, '../assets/feature-graphic.png');
        fs.writeFileSync(outputPath, buffer);

        console.log('✅ Feature Graphic creada exitosamente:');
        console.log(`📁 Ubicación: ${outputPath}`);
        console.log(`📏 Dimensiones: ${width}x${height} píxeles`);
        console.log(`💾 Tamaño: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);

    } catch (error) {
        console.error('❌ Error al crear la feature graphic:', error);
    }
}

createFeatureGraphic(); 