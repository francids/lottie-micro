export const convertToHex = (r: number, g: number, b: number): string => {
  const rHex = Math.round(Math.max(0, Math.min(255, r * 255)))
    .toString(16)
    .padStart(2, "0");
  const gHex = Math.round(Math.max(0, Math.min(255, g * 255)))
    .toString(16)
    .padStart(2, "0");
  const bHex = Math.round(Math.max(0, Math.min(255, b * 255)))
    .toString(16)
    .padStart(2, "0");
  return `#${rHex}${gHex}${bHex}`;
};

export const normalizeHexColor = (hex: string): string => {
  hex = hex.replace("#", "");

  if (hex.length > 6) {
    hex = hex.substring(0, 6);
  }

  if (hex.length < 6) {
    hex = hex.padEnd(6, "0");
  }

  return `#${hex}`;
};

export const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

export const extractColors = (lottieData: any): string[] => {
  if (!lottieData) return [];

  const colors = new Set<string>();

  const findColors = (obj: any, path: string = ""): void => {
    if (typeof obj === "object" && obj !== null) {
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => findColors(item, `${path}[${index}]`));
      } else {
        Object.keys(obj).forEach((key) => {
          const currentPath = path ? `${path}.${key}` : key;

          if (Array.isArray(obj[key]) && obj[key].length >= 3) {
            const firstThreeAreNumbers = obj[key]
              .slice(0, 3)
              .every((val) => typeof val === "number");
            if (firstThreeAreNumbers) {
              const maxVal = Math.max(...obj[key].slice(0, 3));
              let r, g, b;

              if (maxVal <= 1) {
                r = obj[key][0];
                g = obj[key][1];
                b = obj[key][2];
              } else {
                r = obj[key][0] / 255;
                g = obj[key][1] / 255;
                b = obj[key][2] / 255;
              }

              if (r >= 0 && r <= 1 && g >= 0 && g <= 1 && b >= 0 && b <= 1) {
                const hex = convertToHex(r, g, b);
                colors.add(hex);
              }
            }
          }

          if (typeof obj[key] === "string") {
            const str = obj[key].toString();
            if (str.match(/^#?[0-9A-Fa-f]{6,}$/)) {
              const normalizedHex = normalizeHexColor(str);
              colors.add(normalizedHex);
            }
          }

          findColors(obj[key], currentPath);
        });
      }
    }
  };

  findColors(lottieData);

  if (colors.size === 0) {
    const aggressiveSearch = (obj: any, path: string = ""): void => {
      if (typeof obj === "object" && obj !== null) {
        if (Array.isArray(obj)) {
          obj.forEach((item, index) =>
            aggressiveSearch(item, `${path}[${index}]`)
          );
        } else {
          Object.keys(obj).forEach((key) => {
            const currentPath = path ? `${path}.${key}` : key;

            if (Array.isArray(obj[key]) && obj[key].length >= 3) {
              const isNumericArray = obj[key]
                .slice(0, 3)
                .every((val) => typeof val === "number" && !isNaN(val));

              if (isNumericArray) {
                const values = obj[key].slice(0, 3);

                if (values.every((v) => v >= 0 && v <= 1)) {
                  const hex = convertToHex(values[0], values[1], values[2]);
                  colors.add(hex);
                }

                if (values.every((v) => v >= 0 && v <= 255)) {
                  const hex = convertToHex(values[0] / 255, values[1] / 255, values[2] / 255);
                  colors.add(hex);
                }
              }
            }

            if (typeof obj[key] === "string") {
              const str = obj[key].toString();
              const hexMatch = str.match(/#?([0-9A-Fa-f]{6,})/);
              if (hexMatch) {
                const normalizedHex = normalizeHexColor(hexMatch[1]);
                colors.add(normalizedHex);
              }
            }

            aggressiveSearch(obj[key], currentPath);
          });
        }
      }
    };

    aggressiveSearch(lottieData);
  }

  const validColors = Array.from(colors).filter((color) => {
    const isValid = /^#[0-9A-Fa-f]{6}$/.test(color);
    return isValid;
  });

  return validColors;
};

export const updateColorInLottieData = (
  lottieData: any,
  oldColor: string,
  newColor: string,
  animationColors: string[]
): { updatedData: any; updatedColors: string[]; updatedCount: number } => {
  if (!lottieData) return { updatedData: lottieData, updatedColors: animationColors, updatedCount: 0 };

  const oldRgb = hexToRgb(oldColor);
  const newRgb = hexToRgb(newColor);

  if (!oldRgb || !newRgb) return { updatedData: lottieData, updatedColors: animationColors, updatedCount: 0 };

  const isColorMatch = (colorValue: any, targetRgb: any): boolean => {
    if (Array.isArray(colorValue) && colorValue.length >= 3) {
      const maxVal = Math.max(...colorValue.slice(0, 3));
      let r, g, b;

      if (maxVal <= 1) {
        r = Math.round(colorValue[0] * 255);
        g = Math.round(colorValue[1] * 255);
        b = Math.round(colorValue[2] * 255);
      } else {
        r = Math.round(colorValue[0]);
        g = Math.round(colorValue[1]);
        b = Math.round(colorValue[2]);
      }

      return r === targetRgb.r && g === targetRgb.g && b === targetRgb.b;
    } else if (
      typeof colorValue === "string" &&
      colorValue.match(/^#?[0-9A-Fa-f]+$/)
    ) {
      const normalizedHex = normalizeHexColor(colorValue);
      const hexRgb = hexToRgb(normalizedHex);
      if (hexRgb) {
        return (
          hexRgb.r === targetRgb.r &&
          hexRgb.g === targetRgb.g &&
          hexRgb.b === targetRgb.b
        );
      }
    }
    return false;
  };

  const updateColorValue = (obj: any, key: string, newRgb: any): void => {
    if (Array.isArray(obj[key]) && obj[key].length >= 3) {
      const maxVal = Math.max(...obj[key].slice(0, 3));

      if (maxVal <= 1) {
        obj[key][0] = newRgb.r / 255;
        obj[key][1] = newRgb.g / 255;
        obj[key][2] = newRgb.b / 255;
      } else {
        obj[key][0] = newRgb.r;
        obj[key][1] = newRgb.g;
        obj[key][2] = newRgb.b;
      }
    } else if (
      typeof obj[key] === "string" &&
      obj[key].match(/^#?[0-9A-Fa-f]+$/)
    ) {
      const newHex = `#${newRgb.r.toString(16).padStart(2, "0")}${newRgb.g
        .toString(16)
        .padStart(2, "0")}${newRgb.b.toString(16).padStart(2, "0")}`;
      if (obj[key].startsWith("#")) {
        obj[key] = newHex + obj[key].substring(7);
      } else {
        obj[key] = newHex.substring(1) + obj[key].substring(6);
      }
    }
  };

  let updatedCount = 0;

  const replaceColor = (obj: any, path: string = ""): void => {
    if (typeof obj === "object" && obj !== null) {
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => replaceColor(item, `${path}[${index}]`));
      } else {
        Object.keys(obj).forEach((key) => {
          const currentPath = path ? `${path}.${key}` : key;

          if (isColorMatch(obj[key], oldRgb)) {
            updateColorValue(obj, key, newRgb);
            updatedCount++;
          }

          if (key === "k" && Array.isArray(obj[key])) {
            obj[key].forEach((keyframe: any) => {
              if (keyframe.s && isColorMatch(keyframe.s, oldRgb)) {
                updateColorValue(keyframe, "s", newRgb);
                updatedCount++;
              }
              if (keyframe.e && isColorMatch(keyframe.e, oldRgb)) {
                updateColorValue(keyframe, "e", newRgb);
                updatedCount++;
              }
            });
          }

          replaceColor(obj[key], currentPath);
        });
      }
    }
  };

  replaceColor(lottieData);

  const updatedColors = [...animationColors];
  const colorIndex = updatedColors.indexOf(oldColor);
  if (colorIndex !== -1) {
    updatedColors[colorIndex] = newColor;
  }

  return { updatedData: lottieData, updatedColors, updatedCount };
};

// Layer Editing Utilities

export interface BlendMode {
  value: number;
  label: string;
}

export const BLEND_MODES: BlendMode[] = [
  { value: 0, label: "Normal" },
  { value: 1, label: "Multiply" },
  { value: 2, label: "Screen" },
  { value: 3, label: "Overlay" },
  { value: 4, label: "Darken" },
  { value: 5, label: "Lighten" },
  { value: 6, label: "Color Dodge" },
  { value: 7, label: "Color Burn" },
  { value: 8, label: "Hard Light" },
  { value: 9, label: "Soft Light" },
  { value: 10, label: "Difference" },
  { value: 11, label: "Exclusion" },
  { value: 12, label: "Hue" },
  { value: 13, label: "Saturation" },
  { value: 14, label: "Color" },
  { value: 15, label: "Luminosity" },
  // Values 16 (Add) and 17 (Hard Mix) might require specific renderer support or have visual quirks.
  // For simplicity, starting with the common ones.
];

export const getBlendModeLabel = (value: number | undefined): string => {
  if (value === undefined) return BLEND_MODES[0].label;
  const mode = BLEND_MODES.find(m => m.value === value);
  return mode ? mode.label : String(value); // Fallback to value if not found
};
