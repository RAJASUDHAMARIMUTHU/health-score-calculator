import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BMICalculator } from "./BMICalculator";

describe("BMICalculator Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("Rendering", () => {
    it("should render the calculator component", () => {
      render(<BMICalculator />);
      expect(screen.getByText("BMI Calculator")).toBeInTheDocument();
      expect(screen.getByText("Know your number. Own your health.")).toBeInTheDocument();
    });

    it("should render weight and height input fields", () => {
      render(<BMICalculator />);
      expect(screen.getByLabelText("Weight (kg)")).toBeInTheDocument();
      expect(screen.getByLabelText("Height (cm)")).toBeInTheDocument();
    });

    it("should render Calculate and Reset buttons", () => {
      render(<BMICalculator />);
      expect(screen.getByRole("button", { name: /Calculate BMI/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Reset/i })).toBeInTheDocument();
    });

    it("should render BMI categories info card", () => {
      render(<BMICalculator />);
      expect(screen.getByText("BMI Categories")).toBeInTheDocument();
      expect(screen.getByText("Underweight")).toBeInTheDocument();
      expect(screen.getByText("Normal")).toBeInTheDocument();
      expect(screen.getByText("Overweight")).toBeInTheDocument();
      expect(screen.getByText("Obese")).toBeInTheDocument();
    });

    it("should render recent calculations section", () => {
      render(<BMICalculator />);
      expect(screen.getByText("Recent calculations")).toBeInTheDocument();
      expect(screen.getByText(/No history yet/i)).toBeInTheDocument();
    });

    it("should render theme toggle button", () => {
      render(<BMICalculator />);
      const themeButton = screen.getByRole("button", { name: /Toggle theme/i });
      expect(themeButton).toBeInTheDocument();
    });
  });

  describe("BMI Calculation", () => {
    it("should calculate BMI when valid inputs are provided", async () => {
      const user = userEvent.setup();
      render(<BMICalculator />);

      const weightInput = screen.getByLabelText("Weight (kg)");
      const heightInput = screen.getByLabelText("Height (cm)");
      const calculateButton = screen.getByRole("button", { name: /Calculate BMI/i });

      await user.type(weightInput, "70");
      await user.type(heightInput, "175");
      await user.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByText("22.86")).toBeInTheDocument();
      });
    });

    it("should display Normal Weight category for BMI 22.86", async () => {
      const user = userEvent.setup();
      render(<BMICalculator />);

      await user.type(screen.getByLabelText("Weight (kg)"), "70");
      await user.type(screen.getByLabelText("Height (cm)"), "175");
      await user.click(screen.getByRole("button", { name: /Calculate BMI/i }));

      await waitFor(() => {
        expect(screen.getByText("Normal Weight")).toBeInTheDocument();
      });
    });

    it("should display Underweight category for low BMI", async () => {
      const user = userEvent.setup();
      render(<BMICalculator />);

      await user.type(screen.getByLabelText("Weight (kg)"), "50");
      await user.type(screen.getByLabelText("Height (cm)"), "175");
      await user.click(screen.getByRole("button", { name: /Calculate BMI/i }));

      await waitFor(() => {
        expect(screen.getByText("Underweight")).toBeInTheDocument();
      });
    });

    it("should display Overweight category for BMI 25-29.9", async () => {
      const user = userEvent.setup();
      render(<BMICalculator />);

      await user.type(screen.getByLabelText("Weight (kg)"), "85");
      await user.type(screen.getByLabelText("Height (cm)"), "175");
      await user.click(screen.getByRole("button", { name: /Calculate BMI/i }));

      await waitFor(() => {
        expect(screen.getByText("Overweight")).toBeInTheDocument();
      });
    });

    it("should display Obese category for BMI >= 30", async () => {
      const user = userEvent.setup();
      render(<BMICalculator />);

      await user.type(screen.getByLabelText("Weight (kg)"), "100");
      await user.type(screen.getByLabelText("Height (cm)"), "175");
      await user.click(screen.getByRole("button", { name: /Calculate BMI/i }));

      await waitFor(() => {
        expect(screen.getByText("Obese")).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("should show error when weight is empty", async () => {
      const user = userEvent.setup();
      render(<BMICalculator />);

      await user.type(screen.getByLabelText("Height (cm)"), "175");
      await user.click(screen.getByRole("button", { name: /Calculate BMI/i }));

      await waitFor(() => {
        expect(screen.getByText("Please enter both weight and height.")).toBeInTheDocument();
      });
    });

    it("should show error when height is empty", async () => {
      const user = userEvent.setup();
      render(<BMICalculator />);

      await user.type(screen.getByLabelText("Weight (kg)"), "70");
      await user.click(screen.getByRole("button", { name: /Calculate BMI/i }));

      await waitFor(() => {
        expect(screen.getByText("Please enter both weight and height.")).toBeInTheDocument();
      });
    });

    it("should show error for invalid numeric inputs", async () => {
      const user = userEvent.setup();
      render(<BMICalculator />);

      await user.type(screen.getByLabelText("Weight (kg)"), "abc");
      await user.type(screen.getByLabelText("Height (cm)"), "xyz");
      await user.click(screen.getByRole("button", { name: /Calculate BMI/i }));

      await waitFor(() => {
        expect(screen.getByText("Please enter valid positive numbers.")).toBeInTheDocument();
      });
    });

    it("should show error for out-of-range values", async () => {
      const user = userEvent.setup();
      render(<BMICalculator />);

      await user.type(screen.getByLabelText("Weight (kg)"), "600");
      await user.type(screen.getByLabelText("Height (cm)"), "175");
      await user.click(screen.getByRole("button", { name: /Calculate BMI/i }));

      await waitFor(() => {
        expect(
          screen.getByText("Those values look out of range. Please check your input."),
        ).toBeInTheDocument();
      });
    });

    it("should clear error when new valid input is entered", async () => {
      const user = userEvent.setup();
      render(<BMICalculator />);

      // First, trigger an error
      await user.click(screen.getByRole("button", { name: /Calculate BMI/i }));

      await waitFor(() => {
        expect(screen.getByText("Please enter both weight and height.")).toBeInTheDocument();
      });

      // Now enter valid values
      const weightInput = screen.getByLabelText("Weight (kg)");
      const heightInput = screen.getByLabelText("Height (cm)");

      await user.type(weightInput, "70");
      await user.type(heightInput, "175");
      await user.click(screen.getByRole("button", { name: /Calculate BMI/i }));

      await waitFor(() => {
        expect(screen.queryByText("Please enter both weight and height.")).not.toBeInTheDocument();
      });
    });
  });

  describe("Reset Functionality", () => {
    it("should clear inputs and results when Reset is clicked", async () => {
      const user = userEvent.setup();
      render(<BMICalculator />);

      const weightInput = screen.getByLabelText("Weight (kg)") as HTMLInputElement;
      const heightInput = screen.getByLabelText("Height (cm)") as HTMLInputElement;

      await user.type(weightInput, "70");
      await user.type(heightInput, "175");
      await user.click(screen.getByRole("button", { name: /Calculate BMI/i }));

      await waitFor(() => {
        expect(screen.getByText("22.86")).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /Reset/i }));

      expect(weightInput.value).toBe("");
      expect(heightInput.value).toBe("");
      expect(screen.queryByText("22.86")).not.toBeInTheDocument();
    });
  });

  describe("History Management", () => {
    it("should add calculation to history", async () => {
      const user = userEvent.setup();
      render(<BMICalculator />);

      await user.type(screen.getByLabelText("Weight (kg)"), "70");
      await user.type(screen.getByLabelText("Height (cm)"), "175");
      await user.click(screen.getByRole("button", { name: /Calculate BMI/i }));

      await waitFor(() => {
        expect(screen.getByText("22.86")).toBeInTheDocument();
      });

      // Check if BMI appears in history
      const historyBMI = screen.getAllByText("22.86");
      expect(historyBMI.length).toBeGreaterThan(1); // One in result, one in history
    });

    it("should persist history to localStorage", async () => {
      const user = userEvent.setup();
      render(<BMICalculator />);

      await user.type(screen.getByLabelText("Weight (kg)"), "70");
      await user.type(screen.getByLabelText("Height (cm)"), "175");
      await user.click(screen.getByRole("button", { name: /Calculate BMI/i }));

      await waitFor(() => {
        const stored = localStorage.getItem("bmi:history:v1");
        expect(stored).toBeTruthy();
        const history = JSON.parse(stored!);
        expect(history.length).toBe(1);
        expect(history[0].bmi).toBe(22.86);
      });
    });

    it("should limit history to 8 items", async () => {
      const user = userEvent.setup();
      render(<BMICalculator />);

      // Add 10 calculations
      for (let i = 0; i < 10; i++) {
        const weight = 70 + i;
        const height = 175;

        await user.clear(screen.getByLabelText("Weight (kg)"));
        await user.type(screen.getByLabelText("Weight (kg)"), weight.toString());
        await user.click(screen.getByRole("button", { name: /Calculate BMI/i }));

        await waitFor(() => {
          const stored = localStorage.getItem("bmi:history:v1");
          if (stored) {
            const history = JSON.parse(stored);
            expect(history.length).toBeLessThanOrEqual(8);
          }
        });
      }
    });

    it("should clear history when Clear button is clicked", async () => {
      const user = userEvent.setup();
      render(<BMICalculator />);

      // Add a calculation
      await user.type(screen.getByLabelText("Weight (kg)"), "70");
      await user.type(screen.getByLabelText("Height (cm)"), "175");
      await user.click(screen.getByRole("button", { name: /Calculate BMI/i }));

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Clear/i })).toBeInTheDocument();
      });

      // Clear history
      await user.click(screen.getByRole("button", { name: /Clear/i }));

      await waitFor(() => {
        expect(screen.getByText(/No history yet/i)).toBeInTheDocument();
        expect(localStorage.getItem("bmi:history:v1")).toBeNull();
      });
    });
  });

  describe("Theme Management", () => {
    it("should toggle theme on button click", async () => {
      const user = userEvent.setup();
      render(<BMICalculator />);

      const themeButton = screen.getByRole("button", { name: /Toggle theme/i });

      // Initially should have dark mode off
      expect(document.documentElement.classList.contains("dark")).toBeFalsy();

      await user.click(themeButton);

      expect(document.documentElement.classList.contains("dark")).toBeTruthy();

      await user.click(themeButton);

      expect(document.documentElement.classList.contains("dark")).toBeFalsy();
    });

    it("should persist theme preference to localStorage", async () => {
      const user = userEvent.setup();
      render(<BMICalculator />);

      const themeButton = screen.getByRole("button", { name: /Toggle theme/i });
      await user.click(themeButton);

      await waitFor(() => {
        expect(localStorage.getItem("bmi:theme")).toBe("dark");
      });
    });
  });

  describe("Download Report", () => {
    it("should show download button when result is available", async () => {
      const user = userEvent.setup();
      render(<BMICalculator />);

      await user.type(screen.getByLabelText("Weight (kg)"), "70");
      await user.type(screen.getByLabelText("Height (cm)"), "175");
      await user.click(screen.getByRole("button", { name: /Calculate BMI/i }));

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Download report/i })).toBeInTheDocument();
      });
    });

    it("should create and download a report file", async () => {
      const user = userEvent.setup();
      const createElementSpyOn = vi.spyOn(document, "createElement");

      render(<BMICalculator />);

      await user.type(screen.getByLabelText("Weight (kg)"), "70");
      await user.type(screen.getByLabelText("Height (cm)"), "175");
      await user.click(screen.getByRole("button", { name: /Calculate BMI/i }));

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Download report/i })).toBeInTheDocument();
      });

      const downloadButton = screen.getByRole("button", { name: /Download report/i });
      await user.click(downloadButton);

      // Should have attempted to create an anchor element
      expect(createElementSpyOn).toHaveBeenCalledWith("a");

      createElementSpyOn.mockRestore();
    });
  });

  describe("Accessibility", () => {
    it("should have proper form labels", () => {
      render(<BMICalculator />);
      expect(screen.getByLabelText("Weight (kg)")).toBeInTheDocument();
      expect(screen.getByLabelText("Height (cm)")).toBeInTheDocument();
    });

    it("should have error role for error messages", async () => {
      const user = userEvent.setup();
      render(<BMICalculator />);

      await user.click(screen.getByRole("button", { name: /Calculate BMI/i }));

      await waitFor(() => {
        const alert = screen.getByRole("alert");
        expect(alert).toBeInTheDocument();
      });
    });

    it("should have aria-label on theme button", () => {
      render(<BMICalculator />);
      const themeButton = screen.getByRole("button", { name: /Toggle theme/i });
      expect(themeButton).toHaveAttribute("aria-label", "Toggle theme");
    });
  });

  describe("Integration Tests", () => {
    it("should complete full user workflow", async () => {
      const user = userEvent.setup();
      render(<BMICalculator />);

      // Step 1: Enter values
      await user.type(screen.getByLabelText("Weight (kg)"), "85");
      await user.type(screen.getByLabelText("Height (cm)"), "180");

      // Step 2: Calculate
      await user.click(screen.getByRole("button", { name: /Calculate BMI/i }));

      // Step 3: Verify result
      await waitFor(() => {
        expect(screen.getByText("26.23")).toBeInTheDocument();
        expect(screen.getByText("Overweight")).toBeInTheDocument();
      });

      // Step 4: Download report
      const downloadButton = screen.getByRole("button", { name: /Download report/i });
      expect(downloadButton).toBeInTheDocument();

      // Step 5: Reset
      await user.click(screen.getByRole("button", { name: /Reset/i }));

      const weightInput = screen.getByLabelText("Weight (kg)") as HTMLInputElement;
      expect(weightInput.value).toBe("");
      expect(screen.queryByText("26.23")).not.toBeInTheDocument();
    });

    it("should handle multiple calculations in sequence", async () => {
      const user = userEvent.setup();
      render(<BMICalculator />);

      // First calculation
      await user.type(screen.getByLabelText("Weight (kg)"), "70");
      await user.type(screen.getByLabelText("Height (cm)"), "175");
      await user.click(screen.getByRole("button", { name: /Calculate BMI/i }));

      await waitFor(() => {
        expect(screen.getByText("22.86")).toBeInTheDocument();
      });

      // Reset
      await user.click(screen.getByRole("button", { name: /Reset/i }));

      // Second calculation
      await user.type(screen.getByLabelText("Weight (kg)"), "80");
      await user.type(screen.getByLabelText("Height (cm)"), "180");
      await user.click(screen.getByRole("button", { name: /Calculate BMI/i }));

      await waitFor(() => {
        expect(screen.getByText("24.69")).toBeInTheDocument();
      });

      // Both should be in history
      await waitFor(() => {
        const stored = localStorage.getItem("bmi:history:v1");
        expect(stored).toBeTruthy();
        const history = JSON.parse(stored!);
        expect(history.length).toBe(2);
      });
    });
  });
});
