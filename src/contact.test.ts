import { describe, expect, it } from "vitest";
import { contactErrors } from "./business";
describe("contact demonstration validation", () => {
  it("rejects blank or whitespace-only fields", () => {
    expect(
      Object.keys(
        contactErrors({ name: "  ", email: "", message: "          " }),
      ),
    ).toEqual(["name", "email", "message"]);
  });
  it("rejects invalid email and too-short message", () => {
    expect(
      contactErrors({ name: "Test", email: "demo@", message: "Hello" }),
    ).toHaveProperty("email");
    expect(
      contactErrors({
        name: "Test",
        email: "demo@example.com",
        message: "Hello",
      }),
    ).toHaveProperty("message");
  });
  it("accepts a valid draft without requiring a real business contact", () => {
    expect(
      contactErrors({
        name: "Test",
        email: "demo@example.com",
        message: "Message de démonstration.",
      }),
    ).toEqual({});
  });
});
