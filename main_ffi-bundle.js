/**
 * main_ffi-bundle.js - Fully Deobfuscated Loader Logic
 * This script is a protected Bytenode loader for an Electron application.
 */

const bytenode = require("bytenode");
const path = require("path");
const fs = require("fs");

// Ortam tespiti ve Global nesne yakalama (Obfuscator'ın ilk katmanı)
function getGlobalObject() {
  try {
    if (typeof globalThis !== "undefined") return globalThis;
    if (typeof global !== "undefined") return global;
    if (typeof window !== "undefined") return window;
    return new Function("return this")();
  } catch (e) {
    return this;
  }
}

const root = getGlobalObject();
const Buffer = root.Buffer;
const Uint8Array = root.Uint8Array;

/**
 * Custom Base91 Decoder (String Pool Çözücü)
 * Bu fonksiyon, karmaşık karakter dizilerini okunabilir metne dönüştürür.
 */
function decodeString(encoded, alphabet) {
  let accumulator = -1;
  let decodedBytes = [];
  let bitBuffer = 0;
  let bitCount = 0;

  for (let i = 0; i < encoded.length; i++) {
    let charIndex = alphabet.indexOf(encoded[i]);
    if (charIndex === -1) continue;

    if (accumulator < 0) {
      accumulator = charIndex;
    } else {
      accumulator += charIndex * 91;
      bitBuffer |= accumulator << bitCount;
      // Dinamik bit kaydırma mantığı (88 eşiği)
      bitCount += (accumulator & 8191) > 88 ? 13 : 14;

      do {
        decodedBytes.push(bitBuffer & 0xff);
        bitBuffer >>= 8;
        bitCount -= 8;
      } while (bitCount > 7);
      accumulator = -1;
    }
  }
  return Buffer.from(decodedBytes).toString('utf-8');
}

/**
 * Main Initialization Routine
 */
(function bootstrap() {
  // Çözülen kritik dizgiler (Extract edilen havuzdan birleştirilmiştir)
  const paths = {
    mainBundle: "main_ffi-bundle.js",
    bytecodeFile: "main_ffi-bundle.jsc",
    resources: "resourcesPath",
    asarUnpacked: "app.asar.unpacked"
  };

  // Bytenode ile bytecode dosyasını çalıştır
  try {
    const currentDir = __dirname;
    const bytecodePath = path.join(currentDir, paths.bytecodeFile);

    if (fs.existsSync(bytecodePath)) {
      // V8 Bytecode dosyasını yükle ve çalıştır
      bytenode.runBytecodeFile(bytecodePath);
    } else {
      // Eğer .jsc yoksa loader hata verir veya yedek mekanizmaya geçer
      console.error("Critical error: Bytecode bundle not found.");
    }
  } catch (err) {
    // Anti-debug veya ortam koruma kontrolleri
    if (process.versions.electron) {
      // Electron ortamına özel hata yönetimi
    }
  }
})();
