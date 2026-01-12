import QRCode from "qrcode";

/**
 * Convert Pakasir QR string (payment_number) into PNG buffer.
 * @param {string} qrString
 */
export async function qrisToPngBuffer(qrString) {
  const buf = await QRCode.toBuffer(qrString, {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 1,
    scale: 8,
  });
  return buf;
}
