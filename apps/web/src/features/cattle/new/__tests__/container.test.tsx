import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CattleNewContainer from "../container";

describe("CattleNewContainer", () => {
	it("should render new cattle form", async () => {
		const container = await CattleNewContainer();
		render(container);

		expect(screen.getByLabelText(/個体識別番号/)).toBeInTheDocument();
		expect(screen.getByLabelText(/耳標番号/)).toBeInTheDocument();
		expect(screen.getByLabelText(/名号/)).toBeInTheDocument();
		expect(screen.getByLabelText(/品種/)).toBeInTheDocument();
		expect(screen.getByText("登録")).toBeInTheDocument();
	});
});
