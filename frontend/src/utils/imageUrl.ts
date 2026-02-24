const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

export const resolveImageUrl = (value: string | undefined, apiUrl: string): string | null => {
  if (!value) {
    return null;
  }

  if (isAbsoluteUrl(value)) {
    return value;
  }

  return `${apiUrl}/uploads/${value}`;
};
