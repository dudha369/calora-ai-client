import { BrowserMultiFormatReader } from "@zxing/browser";

const reader = new BrowserMultiFormatReader();

export async function decodeBarcode(dataUrl: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = async () => {
      try {
        const result = await reader.decodeFromImageElement(img);
        resolve(result.getText());
      } catch {
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}
