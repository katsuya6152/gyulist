// Cross-runtime Base64 utilities with UTF-8 support
// - Uses Web standard atob/btoa
// - Ensures proper UTF-8 encoding/decoding via TextEncoder/TextDecoder

function encodeBinaryToBase64(binary: string): string {
	return btoa(binary);
}

function decodeBase64ToBinary(b64: string): string {
	return atob(b64);
}

export function encodeBase64Utf8(text: string): string {
	const encoder = new TextEncoder();
	const bytes = encoder.encode(text);
	let binary = "";
	const chunkSize = 0x8000; // avoid call stack limits
	for (let i = 0; i < bytes.length; i += chunkSize) {
		const chunk = bytes.subarray(i, i + chunkSize);
		binary += String.fromCharCode(...chunk);
	}
	return encodeBinaryToBase64(binary);
}

export function decodeBase64Utf8(b64: string): string {
	const binary = decodeBase64ToBinary(b64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	const decoder = new TextDecoder();
	return decoder.decode(bytes);
}
