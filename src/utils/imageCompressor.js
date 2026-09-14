/**
 * Comprime una imagen usando HTML5 Canvas antes de subirla.
 * Redimensiona a un ancho máximo manteniendo la proporción y reduce calidad JPEG.
 * @param {File} file Archivo de imagen original
 * @param {number} maxWidth Ancho máximo permitido (default 800)
 * @param {number} quality Calidad de compresión JPEG (0 a 1) (default 0.7)
 * @returns {Promise<File>} Promise que resuelve con el nuevo File comprimido
 */
export const compressImage = (file, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    if (!file.type.match(/image.*/)) {
      reject(new Error("El archivo no es una imagen."));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Error al comprimir la imagen"));
              return;
            }
            // Crear un nuevo File con el blob
            const extension = file.name.split('.').pop().toLowerCase();
            const isPng = extension === 'png' && quality === 1; // Si es PNG y calidad 1, dejamos como PNG, sino forzamos JPEG para comprimir más.
            
            const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
              type: isPng ? 'image/png' : 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(newFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};
