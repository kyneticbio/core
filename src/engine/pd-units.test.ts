import { describe, it, expect } from "vitest";
import { convertConcentration } from "./engine";

describe("convertConcentration", () => {
  const MOLAR_MASS = 200; // g/mol, typical small molecule

  describe("mass-based conversions", () => {
    it("mg/L returns identity (factor 1)", () => {
      expect(convertConcentration(10, undefined, "mg/L")).toBe(10);
    });

    it("mg/dL converts correctly (factor 0.1)", () => {
      expect(convertConcentration(10, undefined, "mg/dL")).toBeCloseTo(1, 5);
    });

    it("µg/dL converts correctly (factor 100)", () => {
      expect(convertConcentration(1, undefined, "µg/dL")).toBe(100);
    });

    it("ng/mL converts correctly (factor 1e3)", () => {
      expect(convertConcentration(1, undefined, "ng/mL")).toBe(1000);
    });

    it("pg/mL converts correctly (factor 1e6)", () => {
      expect(convertConcentration(1, undefined, "pg/mL")).toBe(1e6);
    });

    it("ng/dL converts correctly (factor 1e5)", () => {
      expect(convertConcentration(1, undefined, "ng/dL")).toBe(1e5);
    });

    it("mass conversions do not require molarMass", () => {
      expect(convertConcentration(5, undefined, "ng/mL")).toBe(5000);
      expect(convertConcentration(5, 0, "ng/mL")).toBe(5000);
    });
  });

  describe("molar-based conversions", () => {
    it("nM converts correctly", () => {
      // 1 mg/L of MW=200 → (1/200)*1e6 = 5000 nM
      expect(convertConcentration(1, MOLAR_MASS, "nM")).toBeCloseTo(5000, 1);
    });

    it("uM converts correctly", () => {
      // 1 mg/L of MW=200 → (1/200)*1e3 = 5 µM
      expect(convertConcentration(1, MOLAR_MASS, "uM")).toBeCloseTo(5, 3);
    });

    it("µM converts same as uM", () => {
      expect(convertConcentration(1, MOLAR_MASS, "µM")).toBeCloseTo(5, 3);
    });

    it("pmol/L converts correctly", () => {
      // 1 mg/L of MW=200 → (1/200)*1e9 = 5e6 pmol/L
      expect(convertConcentration(1, MOLAR_MASS, "pmol/L")).toBeCloseTo(5e6, 0);
    });

    it("µmol/L converts correctly", () => {
      // Same as µM: (1/200)*1e3 = 5
      expect(convertConcentration(1, MOLAR_MASS, "µmol/L")).toBeCloseTo(5, 3);
    });
  });

  describe("error handling", () => {
    it("throws for unsupported unit string", () => {
      expect(() => convertConcentration(1, MOLAR_MASS, "x")).toThrow(
        /Unsupported PD unit "x"/,
      );
    });

    it("throws for percentage unit", () => {
      expect(() => convertConcentration(1, MOLAR_MASS, "%")).toThrow(
        /Unsupported PD unit "%"/,
      );
    });

    it("throws for kcal/min", () => {
      expect(() => convertConcentration(1, MOLAR_MASS, "kcal/min")).toThrow(
        /Unsupported PD unit/,
      );
    });

    it("throws for mmHg", () => {
      expect(() => convertConcentration(1, MOLAR_MASS, "mmHg")).toThrow(
        /Unsupported PD unit/,
      );
    });

    it("error message lists supported units", () => {
      expect(() => convertConcentration(1, MOLAR_MASS, "bad")).toThrow(
        /Supported:/,
      );
    });

    it("throws when molar unit is used without molarMass", () => {
      expect(() => convertConcentration(1, undefined, "nM")).toThrow(
        /requires molarMass/,
      );
    });

    it("throws when molar unit is used with molarMass=0", () => {
      expect(() => convertConcentration(1, 0, "nM")).toThrow(
        /requires molarMass/,
      );
    });

    it("throws when molar unit is used with negative molarMass", () => {
      expect(() => convertConcentration(1, -1, "nM")).toThrow(
        /requires molarMass/,
      );
    });
  });

  describe("pharmacological sanity checks", () => {
    it("caffeine 200mg gives reasonable nM concentration", () => {
      // ~8 mg/L peak, MW=194.19
      const conc_nM = convertConcentration(8, 194.19, "nM");
      // Should be ~41,200 nM — therapeutic range
      expect(conc_nM).toBeGreaterThan(30000);
      expect(conc_nM).toBeLessThan(60000);
    });

    it("semaglutide 1mg gives reasonable pmol/L concentration", () => {
      // ~0.1 mg/L peak, MW=4113.58
      const conc_pmolL = convertConcentration(0.1, 4113.58, "pmol/L");
      // Should be ~24,310 pmol/L
      expect(conc_pmolL).toBeGreaterThan(20000);
      expect(conc_pmolL).toBeLessThan(30000);
    });

    it("zero concentration returns zero for any unit", () => {
      expect(convertConcentration(0, 200, "nM")).toBe(0);
      expect(convertConcentration(0, undefined, "pg/mL")).toBe(0);
      expect(convertConcentration(0, 200, "mg/dL")).toBe(0);
    });
  });
});
