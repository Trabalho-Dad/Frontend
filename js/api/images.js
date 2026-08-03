import { apiFetch, CLOUDINARY_UPLOAD_URL, CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_CLOUD_NAME } from "./config.js";

export function uploadImageToCloudinary(file, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", CLOUDINARY_UPLOAD_URL);

    xhr.upload.onprogress = (event) => {
      if (onProgress && event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          reject(new Error(data?.error?.message ?? "Erro ao enviar imagem para o Cloudinary."));
        }
      } catch (e) {
        reject(new Error("Resposta inválida do Cloudinary."));
      }
    };

    xhr.onerror = () => reject(new Error("Falha de conexão ao enviar a imagem para o Cloudinary."));

    xhr.send(formData);
  });
}

export async function createImage({ description, url, imageType }) {
  return apiFetch("/api/admin/images", {
    method: "POST",
    body: { description, url, imageType }
  });
}

export async function findManyImages({ description, type, page = 1, take = 30 } = {}) {
  return apiFetch("/api/admin/images", { query: { description, type, page, take } });
}

export async function uploadAndRegisterImage(file, { description, imageType }, onProgress) {
  const cloudinaryResult = await uploadImageToCloudinary(file, onProgress);
  return createImage({ description, url: cloudinaryResult.secure_url, imageType });
}
