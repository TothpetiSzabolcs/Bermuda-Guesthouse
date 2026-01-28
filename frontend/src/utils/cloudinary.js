export const CLOUD =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dzbnzveh9";

export const cld = (url, t = "f_auto,q_auto,w_1200") => {
  if (!url) return url;
  const marker = "/upload/";
  const i = url.indexOf(marker);
  if (i === -1) return url;
  return url.slice(0, i + marker.length) + `${t}/` + url.slice(i + marker.length);
};

// Kép-URL transzform (upload után)
export const cldImg = (url, t = "f_auto,q_auto,w_600") =>
  url ? url.replace("/upload/", `/upload/${t}/`) : url;

// Videó-URL transzform (pl. lejátszáshoz mp4/h264)
export const cldVideo = (url, t = "f_mp4,vc_h264,q_auto") =>
  url ? url.replace("/video/upload/", `/video/upload/${t}/`) : url;

// Ha nincs posterUrl a DB-ben, kinyerünk 1. másodperces kockát
export const cldVideoPoster = (url, t = "so_1,f_jpg,q_auto,w_600") =>
  url ? url.replace("/video/upload/", `/video/upload/${t}/`) : url;

export const cldFromId = (publicId, t = "f_auto,q_auto") =>
  publicId ? `https://res.cloudinary.com/${CLOUD}/image/upload/${t}/${publicId}` : null;