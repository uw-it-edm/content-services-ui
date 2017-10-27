export class FileUtilities {
  public static getMimeTypeFromArrayBuffer(data: ArrayBuffer) {
    const uint = new Uint8Array(data.slice(0, 4));
    const bytes = [];
    uint.forEach(byte => {
      bytes.push(byte.toString(16));
    });
    const hex = bytes.join('').toUpperCase();
    return this.getMimetype(hex);
  }

  // acquire mime-type from magic numbers
  private static getMimetype(signature: string) {
    switch (signature) {
      case '89504E47':
        return 'image/png';
      case '47494638':
        return 'image/gif';
      case '25504446':
        return 'application/pdf';
      case 'FFD8FFDB':
      case 'FFD8FFE0':
        return 'image/jpeg';
      case '504B0304':
        return 'application/zip';
      default:
        return 'unknown';
    }
  }
}
