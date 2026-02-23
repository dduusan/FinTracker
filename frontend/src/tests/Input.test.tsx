import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Input from "../components/ui/Input";

describe("Input", () => {
  it("renders with label", () => {
    render(<Input id="email" label="Email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("renders without label", () => {
    render(<Input id="email" placeholder="Enter email" />);
    expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(<Input id="email" label="Email" error="Email is required" />);
    expect(screen.getByText("Email is required")).toBeInTheDocument();
  });

  it("has red border when error is present", () => {
    render(<Input id="email" error="Required" />);
    expect(screen.getByRole("textbox")).toHaveClass("border-red-500");
  });

  it("accepts user input", async () => {
    const user = userEvent.setup();
    render(<Input id="name" label="Name" />);
    const input = screen.getByLabelText("Name");
    await user.type(input, "John");
    expect(input).toHaveValue("John");
  });
});
