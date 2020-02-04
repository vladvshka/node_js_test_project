import { logLine } from "../shared/index.js";

(async () => {
	const signUpForm = document.getElementById("sign-up-form");

	const updateSignUpForm = () => {
		document.getElementById("account-created").classList.toggle("hidden");
		signUpForm.reset();
	};

	const handleSignUp = async e => {
		e.preventDefault();
		e.stopPropagation();

		const formData = new FormData(signUpForm);

		if (
			!formData.get("login") ||
			!formData.get("password") ||
			!formData.get("email")
		) {
			return;
		}

		try {
			const response = await fetch("/sign-up", {
				method: "POST",
				body: formData,
			});

			if (response.ok) {
				const token = await response.text();

				logLine(`token: ${token}`);
				localStorage.setItem("session", JSON.parse(token).session);

				updateSignUpForm();
			} else {
				document.body.innerHTML = await response.text();
			}
		} catch (error) {
			console.error("error", error);
		}
	};

	// if (signUpForm) {
	// 	signUpForm.addEventListener("submit", handleSignUp);
	// }
})();
