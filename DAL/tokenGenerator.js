function generarToken() {
    // Longitud del token
    const longitudToken = 6;
    
    // Caracteres permitidos para el token
    const caracteresPermitidos = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    let token = '';
    
    // Generar token aleatorio
    for (let i = 0; i < longitudToken; i++) {
      const indice = Math.floor(Math.random() * caracteresPermitidos.length);
      token += caracteresPermitidos.charAt(indice);
    }
    return token;
  }
  
module.exports= generarToken;