/**
 * Estandariza el formato de la moneda para la aplicación financiera.
 * Formato Venezolano/Europeo: `1.234,56`
 * 
 * @param amount El monto numérico a formatear
 * @param decimals Cantidad de decimales (por defecto 2)
 * @returns Cadena de texto con el número formateado
 */
export const formatCurrency = (amount: number | string | undefined | null, decimals: number = 2): string => {
  if (amount === undefined || amount === null) return "0,00";
  
  const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(parsedAmount)) return "0,00";

  // El locale 'de-DE' (Alemán) usa punto para miles y coma para decimales naturalmente.
  return parsedAmount.toLocaleString('de-DE', {
    minimumFractionDigits: decimals,
  });
};

/**
 * Devuelve el símbolo de moneda apropiado según el código o símbolo técnico.
 * @param codeOrSymbol El código ISO (USD, VES) o el símbolo guardado.
 */
export const getCurrencySymbol = (codeOrSymbol: string | undefined | null): string => {
  if (!codeOrSymbol) return '$';
  const clean = codeOrSymbol.toUpperCase().trim();
  // Soportar variantes de Bolívares
  if (clean === 'VES' || clean === 'BS' || clean === 'BS.' || clean === 'BS.S' || clean === 'VES.' || clean === 'BOLIVARES') return 'BS';
  if (clean === 'EUR') return '€';
  if (clean === 'USDT') return 'USDT';
  return '$';
};

/**
 * Formatea un monto con su símbolo de moneda correspondiente.
 */
export const formatCurrencyWithSymbol = (amount: number | string | undefined | null, codeOrSymbol: string | undefined | null, decimals: number = 2): string => {
  const symbol = getCurrencySymbol(codeOrSymbol);
  const formatted = formatCurrency(amount, decimals);
  
  // Para Bolívares, solemos poner el símbolo al final o al principio según preferencia, 
  // pero mantendremos consistencia: Símbolo Espacio Monto
  return `${symbol} ${formatted}`;
};
