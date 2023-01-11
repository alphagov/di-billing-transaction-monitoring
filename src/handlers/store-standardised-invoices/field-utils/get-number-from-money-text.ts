export const getNumberFromMoneyText = (text: string): number => {
  const numberText = text.match(/^£? ?((?:\d+,?)+\.\d\d)$/);
  if (numberText === null) throw new Error(`Unsupported money format: ${text}`);
  return Number(numberText[1].replace(",", ""));
};
