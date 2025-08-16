import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SettingsContainer } from "../container";

// Mock the presentational component
vi.mock("../presentational", () => ({
	SettingsPresentation: () => (
		<div data-testid="settings-presentation">Settings Presentation</div>
	)
}));

describe("SettingsContainer", () => {
	it("should render SettingsPresentation component", () => {
		render(<SettingsContainer />);

		expect(screen.getByTestId("settings-presentation")).toBeInTheDocument();
		expect(screen.getByText("Settings Presentation")).toBeInTheDocument();
	});
});
