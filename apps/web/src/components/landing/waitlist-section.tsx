import { FAQSection } from "./faq/faq-section";
import { EmailSignup } from "./waitlist/email-signup";

export function WaitlistSection() {
	return (
		<>
			<FAQSection />
			<EmailSignup />
		</>
	);
}
