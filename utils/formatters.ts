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
    maximumFractionDigits: decimals,
  });
};
