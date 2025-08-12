import type { SearchEventsResType } from "@/services/eventService";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { format, parseISO } from "date-fns";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EventDeleteDialog } from "../EventDeleteDialog";

vi.mock("sonner", () => ({
	toast: { error: vi.fn() },
}));

describe("EventDeleteDialog", () => {
	const baseEvent: SearchEventsResType["results"][0] = {
		eventId: 1,
		cattleId: 2,
		eventType: "INSEMINATION",
		eventDatetime: "2024-01-15T10:00:00.000Z",
		notes: "メモ",
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-01T00:00:00.000Z",
		cattleName: "花子",
		cattleEarTagNumber: "1234567890",
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns null when closed", () => {
		const { container } = render(
			<EventDeleteDialog
				event={baseEvent}
				isOpen={false}
				onClose={vi.fn()}
				onDelete={vi.fn()}
			/>,
		);
		expect(container.firstChild).toBeNull();
	});

	it("returns null when event is null", () => {
		const { container } = render(
			<EventDeleteDialog
				event={null}
				isOpen
				onClose={vi.fn()}
				onDelete={vi.fn()}
			/>,
		);
		expect(container.firstChild).toBeNull();
	});

	it("renders event details when open", () => {
		render(
			<EventDeleteDialog
				event={baseEvent}
				isOpen
				onClose={vi.fn()}
				onDelete={vi.fn()}
			/>,
		);

		expect(screen.getByText("イベントを削除")).toBeInTheDocument();
		expect(screen.getByText("削除対象のイベント")).toBeInTheDocument();
		expect(screen.getByText("牛の名前:")).toBeInTheDocument();
		expect(screen.getByText("花子")).toBeInTheDocument();
		expect(screen.getByText("個体識別番号:")).toBeInTheDocument();
		expect(screen.getByText("1234567890")).toBeInTheDocument();
		// label and value are split; assert both present
		expect(screen.getByText("イベント種別:")).toBeInTheDocument();
		expect(screen.getByText("人工授精")).toBeInTheDocument();

		const formatted = format(
			parseISO(baseEvent.eventDatetime),
			"yyyy年MM月dd日 HH:mm",
		);
		expect(screen.getByText("日時:")).toBeInTheDocument();
		expect(screen.getByText(formatted)).toBeInTheDocument();
		expect(screen.getByText("メモ:")).toBeInTheDocument();
		expect(screen.getByText("メモ")).toBeInTheDocument();
	});

	it("calls onClose when clicking cancel", () => {
		const onClose = vi.fn();
		render(
			<EventDeleteDialog
				event={baseEvent}
				isOpen
				onClose={onClose}
				onDelete={vi.fn()}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("calls onDelete and shows loading state, disables buttons, then recovers", async () => {
		let resolveDelete!: () => void;
		const onDelete = vi.fn().mockImplementation(
			() =>
				new Promise<void>((res) => {
					resolveDelete = res;
				}),
		);
		render(
			<EventDeleteDialog
				event={baseEvent}
				isOpen
				onClose={vi.fn()}
				onDelete={onDelete}
			/>,
		);

		const deleteButton = screen.getByRole("button", { name: "削除" });
		const cancelButton = screen.getByRole("button", { name: "キャンセル" });

		fireEvent.click(deleteButton);
		expect(onDelete).toHaveBeenCalledWith(1);

		// During loading
		expect(screen.getByText("削除中...")).toBeInTheDocument();
		expect(deleteButton).toBeDisabled();
		expect(cancelButton).toBeDisabled();

		// Resolve
		resolveDelete?.();
		await waitFor(() => expect(deleteButton).not.toBeDisabled());
		expect(screen.queryByText("削除中...")).not.toBeInTheDocument();
	});

	it("shows error toast on delete failure and exits loading state", async () => {
		const { toast } = await import("sonner");
		const onDelete = vi.fn().mockRejectedValue(new Error("boom"));
		render(
			<EventDeleteDialog
				event={baseEvent}
				isOpen
				onClose={vi.fn()}
				onDelete={onDelete}
			/>,
		);

		const deleteButton = screen.getByRole("button", { name: "削除" });
		fireEvent.click(deleteButton);

		await waitFor(() => expect(onDelete).toHaveBeenCalled());
		expect(vi.mocked(toast.error)).toHaveBeenCalled();
		await waitFor(() => expect(deleteButton).not.toBeDisabled());
	});
});
