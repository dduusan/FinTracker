import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate, cn } from "../lib/utils";

describe("formatCurrency", () => {
  it("formats a positive number as RSD currency", () => {
    const result = formatCurrency(15000);
    expect(result).toContain("15,000");
    expect(result).toContain("RSD");
  });

  it("formats zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
    expect(result).toContain("RSD");
  });

  it("formats decimals up to 2 places", () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain("1,234.56");
  });
});

describe("formatDate", () => {
  it("formats a date string in English format", () => {
    const result = formatDate("2026-02-15");
    expect(result).toBe("Feb 15, 2026");
  });

  it("formats another date correctly", () => {
    const result = formatDate("2025-12-01");
    expect(result).toBe("Dec 01, 2025");
  });
});

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("filters out falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("returns empty string for no valid classes", () => {
    expect(cn(false, null, undefined)).toBe("");
  });
});
