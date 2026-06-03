import { describe, it, expect } from "vitest";
import {
  getCategory,
  calculateBMI,
  calculateGaugePct,
  validateInputs,
} from "./bmi";

describe("BMI Utility Functions", () => {
  describe("calculateBMI", () => {
    it("should calculate BMI correctly for normal inputs", () => {
      expect(calculateBMI(70, 175)).toBe(22.86);
      expect(calculateBMI(80, 180)).toBe(24.69);
      expect(calculateBMI(60, 160)).toBe(23.44);
    });

    it("should return null for invalid inputs", () => {
      expect(calculateBMI(0, 175)).toBeNull();
      expect(calculateBMI(70, 0)).toBeNull();
      expect(calculateBMI(-70, 175)).toBeNull();
      expect(calculateBMI(70, -175)).toBeNull();
    });

    it("should return null for NaN inputs", () => {
      expect(calculateBMI(NaN, 175)).toBeNull();
      expect(calculateBMI(70, NaN)).toBeNull();
    });

    it("should return null for out-of-range values", () => {
      expect(calculateBMI(501, 175)).toBeNull();
      expect(calculateBMI(70, 301)).toBeNull();
    });

    it("should round to 2 decimal places", () => {
      const result = calculateBMI(73.5, 178.3);
      expect(result).toBe(23.15);
      expect(String(result).split(".")[1].length).toBeLessThanOrEqual(2);
    });

    it("should handle edge case values", () => {
      expect(calculateBMI(1, 1)).toBe(10000);
      expect(calculateBMI(500, 300)).toBe(5.56);
    });
  });

  describe("getCategory", () => {
    it("should return Underweight for BMI < 18.5", () => {
      const category = getCategory(18.4);
      expect(category.label).toBe("Underweight");
      expect(category.range).toBe("< 18.5");
      expect(category.colorVar).toBe("var(--bmi-under)");
      expect(category.tip).toContain("nutrient-dense diet");
    });

    it("should return Normal Weight for BMI 18.5-24.9", () => {
      const category = getCategory(21.5);
      expect(category.label).toBe("Normal Weight");
      expect(category.range).toBe("18.5 – 24.9");
      expect(category.colorVar).toBe("var(--bmi-normal)");
      expect(category.tip).toContain("Great job");
    });

    it("should return Overweight for BMI 25-29.9", () => {
      const category = getCategory(27.5);
      expect(category.label).toBe("Overweight");
      expect(category.range).toBe("25 – 29.9");
      expect(category.colorVar).toBe("var(--bmi-over)");
      expect(category.tip).toContain("gradual changes");
    });

    it("should return Obese for BMI >= 30", () => {
      const category = getCategory(32);
      expect(category.label).toBe("Obese");
      expect(category.range).toBe("≥ 30");
      expect(category.colorVar).toBe("var(--bmi-obese)");
      expect(category.tip).toContain("healthcare professional");
    });

    it("should handle boundary values", () => {
      expect(getCategory(18.5).label).toBe("Normal Weight");
      expect(getCategory(25).label).toBe("Overweight");
      expect(getCategory(30).label).toBe("Obese");
    });

    it("should handle extreme values", () => {
      expect(getCategory(10).label).toBe("Underweight");
      expect(getCategory(50).label).toBe("Obese");
    });
  });

  describe("calculateGaugePct", () => {
    it("should return 0 for null BMI", () => {
      expect(calculateGaugePct(null)).toBe(0);
    });

    it("should map BMI 10 to 0%", () => {
      expect(calculateGaugePct(10)).toBe(0);
    });

    it("should map BMI 25 to ~50%", () => {
      expect(calculateGaugePct(25)).toBeCloseTo(50, 0);
    });

    it("should map BMI 40 to 100%", () => {
      expect(calculateGaugePct(40)).toBe(100);
    });

    it("should clamp values between 0 and 100", () => {
      expect(calculateGaugePct(5)).toBe(0);
      expect(calculateGaugePct(50)).toBe(100);
    });

    it("should calculate correctly for normal BMI ranges", () => {
      expect(calculateGaugePct(18.5)).toBeCloseTo(28.33, 1);
      expect(calculateGaugePct(22.5)).toBeCloseTo(41.67, 1);
      expect(calculateGaugePct(30)).toBeCloseTo(66.67, 1);
    });
  });

  describe("validateInputs", () => {
    it("should return null for valid inputs", () => {
      expect(validateInputs("70", "175")).toBeNull();
      expect(validateInputs("80.5", "180.2")).toBeNull();
    });

    it("should return error for empty inputs", () => {
      expect(validateInputs("", "175")).toBe("Please enter both weight and height.");
      expect(validateInputs("70", "")).toBe("Please enter both weight and height.");
      expect(validateInputs("", "")).toBe("Please enter both weight and height.");
    });

    it("should return error for invalid numeric inputs", () => {
      const error = validateInputs("abc", "175");
      expect(error).toBe("Please enter valid positive numbers.");
    });

    it("should return error for negative inputs", () => {
      const error = validateInputs("-70", "175");
      expect(error).toBe("Please enter valid positive numbers.");
      const error2 = validateInputs("70", "-175");
      expect(error2).toBe("Please enter valid positive numbers.");
    });

    it("should return error for zero inputs", () => {
      const error = validateInputs("0", "175");
      expect(error).toBe("Please enter valid positive numbers.");
    });

    it("should return error for out-of-range values", () => {
      const error = validateInputs("501", "175");
      expect(error).toBe("Those values look out of range. Please check your input.");
      const error2 = validateInputs("70", "301");
      expect(error2).toBe("Those values look out of range. Please check your input.");
    });

    it("should handle edge cases", () => {
      expect(validateInputs("0.1", "0.1")).toBeNull();
      expect(validateInputs("500", "300")).toBeNull();
    });
  });
});
