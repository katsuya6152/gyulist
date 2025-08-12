import type { SearchEventsResType } from "@/services/eventService";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EventEditDialog } from "../EventEditDialog";

vi.mock("sonner", () => ({
	toast: { error: vi.fn() },
}));

describe("EventEditDialog", () => {
	const baseEvent: SearchEventsResType["results"][0] = {
		eventId: 1,
		cattleId: 2,
		eventType: "OTHER",
		eventDatetime: "2024-01-15T10:00:00.000Z",
		notes: "既存メモ",
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-01T00:00:00.000Z",
		cattleName: "花子",
		cattleEarTagNumber: "1234567890",
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns null when closed or event missing", () => {
		const { container: c1 } = render(
			<EventEditDialog
				event={baseEvent}
				isOpen={false}
				onClose={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
		expect(c1.firstChild).toBeNull();

		const { container: c2 } = render(
			<EventEditDialog
				event={null}
				isOpen
				onClose={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
		expect(c2.firstChild).toBeNull();
	});

	it("initializes form with provided event data when opened", () => {
		render(
			<EventEditDialog
				event={baseEvent}
				isOpen
				onClose={vi.fn()}
				onSave={vi.fn()}
			/>,
		);

		expect(screen.getByText("イベントを編集")).toBeInTheDocument();
		expect(
			screen.getByText(/花子のイベント情報を編集してください。/),
		).toBeInTheDocument();
		const datetime = screen.getByLabelText(/日時/);
		expect((datetime as HTMLInputElement).value).toMatch(
			/2024-01-15T19:00|2024-01-15T10:00/,
		);
		// Timezone makes this vary; accept either ISO local representation.
	});

	it("validates required datetime field and shows error", async () => {
		render(
			<EventEditDialog
				event={baseEvent}
				isOpen
				onClose={vi.fn()}
				onSave={vi.fn()}
			/>,
		);

		const datetime = screen.getByLabelText(/日時/);
		fireEvent.change(datetime, { target: { value: "" } });

		const submitBtn = screen.getByRole("button", { name: "保存" });
		const form = submitBtn.closest("form") as HTMLFormElement;
		fireEvent.submit(form);

		await waitFor(() => {
			// error is rendered as <p> under the field
			const errors = screen.queryAllByText("日時は必須です");
			expect(errors.length).toBeGreaterThan(0);
		});
	});

	it("limits notes to 1000 chars and shows error", async () => {
		render(
			<EventEditDialog
				event={baseEvent}
				isOpen
				onClose={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
		const notes = screen.getByLabelText("メモ") as HTMLTextAreaElement;
		fireEvent.change(notes, { target: { value: "a".repeat(1001) } });

		fireEvent.click(screen.getByRole("button", { name: "保存" }));
		await waitFor(() =>
			expect(
				screen.getByText("メモは1000文字以内で入力してください"),
			).toBeInTheDocument(),
		);
	});

	it("submits with converted ISO datetime and disables inputs while loading", async () => {
		let resolveSave!: () => void;
		const onSave = vi.fn().mockImplementation(
			() =>
				new Promise<void>((res) => {
					resolveSave = res;
				}),
		);
		render(
			<EventEditDialog
				event={baseEvent}
				isOpen
				onClose={vi.fn()}
				onSave={onSave}
			/>,
		);

		// Change type and datetime and notes
		const selectTrigger = screen.getByRole("combobox");
		fireEvent.click(selectTrigger);
		// options rendered in portal; select via text
		const estrusOptions = screen.getAllByText("発情");
		fireEvent.click(estrusOptions[estrusOptions.length - 1]);

		const datetime = screen.getByLabelText(/日時/) as HTMLInputElement;
		fireEvent.change(datetime, { target: { value: "2024-02-01T12:34" } });

		const notes = screen.getByLabelText("メモ") as HTMLTextAreaElement;
		fireEvent.change(notes, { target: { value: "更新メモ" } });

		const submit = screen.getByRole("button", { name: "保存" });
		fireEvent.click(submit);

		expect(onSave).toHaveBeenCalledWith(1, {
			eventType: "ESTRUS",
			eventDatetime: new Date("2024-02-01T12:34").toISOString(),
			notes: "更新メモ",
		});

		// Loading state
		expect(screen.getByText("保存中...")).toBeInTheDocument();
		expect(submit).toBeDisabled();

		resolveSave?.();
		await waitFor(() => expect(submit).not.toBeDisabled());
	});

	it("shows toast on save error", async () => {
		const { toast } = await import("sonner");
		const onSave = vi.fn().mockRejectedValue(new Error("fail"));
		render(
			<EventEditDialog
				event={baseEvent}
				isOpen
				onClose={vi.fn()}
				onSave={onSave}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "保存" }));
		await waitFor(() => expect(onSave).toHaveBeenCalled());
		expect(vi.mocked(toast.error)).toHaveBeenCalled();
	});

	it("does not close while loading and closes after", async () => {
		let resolveSave!: () => void;
		const onSave = vi.fn().mockImplementation(
			() =>
				new Promise<void>((res) => {
					resolveSave = res;
				}),
		);
		const onClose = vi.fn();
		render(
			<EventEditDialog
				event={baseEvent}
				isOpen
				onClose={onClose}
				onSave={onSave}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "保存" }));
		const cancel = screen.getByRole("button", { name: "キャンセル" });
		expect(cancel).toBeDisabled();

		resolveSave?.();
		await waitFor(() => expect(cancel).not.toBeDisabled());
	});
});
