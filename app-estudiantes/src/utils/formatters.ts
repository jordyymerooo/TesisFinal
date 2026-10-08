/**
 * Helper para estandarizar el formateo de precios en la aplicación
 * (ej. 90 -> "90.00", 90.1 -> "90.10", "180.5" -> "180.50")
 */
export const formatPrice = (price: number | string | null | undefined): string => {
  if (price === null || price === undefined || price === '') {
    return '0.00';
  }
  const cleanStr = typeof price === 'string' ? price.replace(/[$,]/g, '').trim() : price;
  const num = Number(cleanStr);
  if (isNaN(num)) {
    return '0.00';
  }
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
