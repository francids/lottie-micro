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
                  const hex = convertToHex(
                    values[0] / 255,
                    values[1] / 255,
                    values[2] / 255
                  );
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
  if (!lottieData)
    return {
      updatedData: lottieData,
      updatedColors: animationColors,
      updatedCount: 0,
    };

  const oldRgb = hexToRgb(oldColor);
  const newRgb = hexToRgb(newColor);

  if (!oldRgb || !newRgb)
    return {
      updatedData: lottieData,
      updatedColors: animationColors,
      updatedCount: 0,
    };

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
  const mode = BLEND_MODES.find((m) => m.value === value);
  return mode ? mode.label : String(value); // Fallback to value if not found
};

// Color context information for better identification
interface ColorContext {
  color: string;
  path: string;
  type: "fill" | "stroke" | "gradient" | "unknown";
  parentType?: string;
}

// Layer Color Utilities
export const extractColorsFromLayer = (layer: any): ColorContext[] => {
  if (!layer) return [];

  const colorContexts: ColorContext[] = [];

  const findColors = (
    obj: any,
    path: string = "",
    parentType?: string
  ): void => {
    if (typeof obj === "object" && obj !== null) {
      if (Array.isArray(obj)) {
        obj.forEach((item, index) =>
          findColors(item, `${path}[${index}]`, parentType)
        );
      } else {
        Object.keys(obj).forEach((key) => {
          const currentPath = path ? `${path}.${key}` : key;

          // Determine color type based on context
          let colorType: "fill" | "stroke" | "gradient" | "unknown" = "unknown";

          // Check for fill colors
          if (key === "c" && (path.includes("fl") || parentType === "fill")) {
            colorType = "fill";
          }
          // Check for stroke colors
          else if (
            key === "c" &&
            (path.includes("st") || parentType === "stroke")
          ) {
            colorType = "stroke";
          }
          // Check for gradient colors
          else if (
            key === "c" &&
            (path.includes("g") ||
              path.includes("grd") ||
              parentType === "gradient")
          ) {
            colorType = "gradient";
          }
          // Additional specific color property checks
          else if (key === "fc" || (key === "c" && path.includes("fc"))) {
            colorType = "fill";
          } else if (key === "sc" || (key === "c" && path.includes("sc"))) {
            colorType = "stroke";
          }
          // If we're in a known color context (fill, stroke, gradient), accept 'c' keys
          else if (
            key === "c" &&
            (parentType === "fill" ||
              parentType === "stroke" ||
              parentType === "gradient")
          ) {
            colorType = parentType;
          }

          // Exclude known non-color paths (transforms, positions, etc.)
          const isNonColorPath =
            path.includes("tr.") || // transforms
            path.includes("ks.p") || // position
            path.includes("ks.a") || // anchor
            path.includes("ks.s") || // scale
            path.includes("ks.r") || // rotation
            path.includes("ks.sk") || // skew
            path.includes("ks.sa") || // skew axis
            path.includes("ks.rx") || // rotation x
            path.includes("ks.ry") || // rotation y
            path.includes("ks.rz") || // rotation z
            path.includes("ks.or") || // orientation
            key === "o" || // opacity
            key === "w" || // stroke width
            key === "ml" || // miter limit
            key === "t" || // tracking/time
            key === "lh" || // line height
            key === "ls" || // letter spacing
            key === "sw" || // stroke width
            key === "sh" || // stroke height
            key === "sz" || // size
            key === "ps" || // path start
            key === "pe" || // path end
            key === "cc" || // corner count
            key === "ir" || // inner radius
            key === "or" || // outer radius
            key === "pt" || // point
            key === "sy" || // star type
            key === "ix" || // index
            key === "x" ||
            key === "y" ||
            key === "z"; // coordinates

          if (
            Array.isArray(obj[key]) &&
            obj[key].length >= 3 &&
            !isNonColorPath
          ) {
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

              // Accept as color if it's in valid RGB range
              if (r >= 0 && r <= 1 && g >= 0 && g <= 1 && b >= 0 && b <= 1) {
                const hex = convertToHex(r, g, b);
                colorContexts.push({
                  color: hex,
                  path: currentPath,
                  type: colorType,
                  parentType,
                });
              }
            }
          }

          if (typeof obj[key] === "string" && !isNonColorPath) {
            const str = obj[key].toString();
            if (str.match(/^#?[0-9A-Fa-f]{6,}$/)) {
              const normalizedHex = normalizeHexColor(str);
              colorContexts.push({
                color: normalizedHex,
                path: currentPath,
                type: colorType,
                parentType,
              });
            }
          }

          // Pass context for known types
          let nextParentType = parentType;
          if (key === "fl" || obj[key]?.ty === 1) {
            nextParentType = "fill";
          } else if (key === "st" || obj[key]?.ty === 6) {
            nextParentType = "stroke";
          } else if (key === "gf" || key === "gs" || obj[key]?.ty === 5) {
            nextParentType = "gradient";
          } else if (key === "it" && Array.isArray(obj[key])) {
            // Shape items can contain fills and strokes
            nextParentType = parentType;
          }

          findColors(obj[key], currentPath, nextParentType);
        });
      }
    }
  };

  findColors(layer);

  return colorContexts;
};

// Helper function to get unique colors for backward compatibility
export const getUniqueColorsFromLayer = (layer: any): string[] => {
  const contexts = extractColorsFromLayer(layer);
  const uniqueColors = new Set(contexts.map((ctx) => ctx.color));
  return Array.from(uniqueColors).filter((color) => {
    const isValid = /^#[0-9A-Fa-f]{6}$/.test(color);
    return isValid;
  });
};

export const updateColorInLayer = (
  layer: any,
  oldColor: string,
  newColor: string,
  specificPath?: string
): { updatedLayer: any; updatedCount: number } => {
  if (!layer) return { updatedLayer: layer, updatedCount: 0 };

  const oldRgb = hexToRgb(oldColor);
  const newRgb = hexToRgb(newColor);

  if (!oldRgb || !newRgb) return { updatedLayer: layer, updatedCount: 0 };

  let updatedCount = 0;

  const isColorMatch = (
    colorValue: any,
    targetRgb: any,
    tolerance: number = 2
  ): boolean => {
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

      // Use tolerance for RGB matching to account for conversion precision
      return (
        Math.abs(r - targetRgb.r) <= tolerance &&
        Math.abs(g - targetRgb.g) <= tolerance &&
        Math.abs(b - targetRgb.b) <= tolerance
      );
    } else if (
      typeof colorValue === "string" &&
      colorValue.match(/^#?[0-9A-Fa-f]+$/)
    ) {
      const normalizedHex = normalizeHexColor(colorValue);
      const hexRgb = hexToRgb(normalizedHex);
      if (hexRgb) {
        return (
          Math.abs(hexRgb.r - targetRgb.r) <= tolerance &&
          Math.abs(hexRgb.g - targetRgb.g) <= tolerance &&
          Math.abs(hexRgb.b - targetRgb.b) <= tolerance
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
      updatedCount++;
    } else if (
      typeof obj[key] === "string" &&
      obj[key].match(/^#?[0-9A-Fa-f]+$/)
    ) {
      obj[key] = newColor;
      updatedCount++;
    }
  };

  const replaceColor = (obj: any, currentPath: string = ""): void => {
    if (typeof obj === "object" && obj !== null) {
      if (Array.isArray(obj)) {
        obj.forEach((item, index) =>
          replaceColor(item, `${currentPath}[${index}]`)
        );
      } else {
        Object.keys(obj).forEach((key) => {
          const fullPath = currentPath ? `${currentPath}.${key}` : key;

          // If a specific path is provided, only update colors at that path
          if (specificPath && !fullPath.startsWith(specificPath)) {
            replaceColor(obj[key], fullPath);
            return;
          }

          if (isColorMatch(obj[key], oldRgb)) {
            updateColorValue(obj, key, newRgb);
          }
          replaceColor(obj[key], fullPath);
        });
      }
    }
  };

  // Create a deep copy to avoid mutating the original layer
  const layerCopy = JSON.parse(JSON.stringify(layer));
  replaceColor(layerCopy);

  return { updatedLayer: layerCopy, updatedCount };
};

// Preview function to see what will be affected by a color change
export const previewColorChange = (
  layer: any,
  targetColor: string,
  specificPath?: string
): { affectedPaths: string[]; estimatedCount: number } => {
  if (!layer) return { affectedPaths: [], estimatedCount: 0 };

  const targetRgb = hexToRgb(targetColor);
  if (!targetRgb) return { affectedPaths: [], estimatedCount: 0 };

  const affectedPaths: string[] = [];
  let estimatedCount = 0;

  const isColorMatch = (
    colorValue: any,
    targetRgb: any,
    tolerance: number = 2
  ): boolean => {
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

      return (
        Math.abs(r - targetRgb.r) <= tolerance &&
        Math.abs(g - targetRgb.g) <= tolerance &&
        Math.abs(b - targetRgb.b) <= tolerance
      );
    } else if (
      typeof colorValue === "string" &&
      colorValue.match(/^#?[0-9A-Fa-f]+$/)
    ) {
      const normalizedHex = normalizeHexColor(colorValue);
      const hexRgb = hexToRgb(normalizedHex);
      if (hexRgb) {
        return (
          Math.abs(hexRgb.r - targetRgb.r) <= tolerance &&
          Math.abs(hexRgb.g - targetRgb.g) <= tolerance &&
          Math.abs(hexRgb.b - targetRgb.b) <= tolerance
        );
      }
    }
    return false;
  };

  const checkColor = (obj: any, currentPath: string = ""): void => {
    if (typeof obj === "object" && obj !== null) {
      if (Array.isArray(obj)) {
        obj.forEach((item, index) =>
          checkColor(item, `${currentPath}[${index}]`)
        );
      } else {
        Object.keys(obj).forEach((key) => {
          const fullPath = currentPath ? `${currentPath}.${key}` : key;

          // If a specific path is provided, only check colors at that path
          if (specificPath && !fullPath.startsWith(specificPath)) {
            checkColor(obj[key], fullPath);
            return;
          }

          if (isColorMatch(obj[key], targetRgb)) {
            affectedPaths.push(fullPath);
            estimatedCount++;
          }
          checkColor(obj[key], fullPath);
        });
      }
    }
  };

  checkColor(layer);

  return { affectedPaths, estimatedCount };
};
