(async () => {
	const addGroup = groupName => {
		const group = document.getElementById(`${groupName}Group`);

		const lastValue = group.lastElementChild.lastElementChild;
		// not to get text nodes
		const lastKey = lastValue.previousElementSibling;

		const newCount = Number(lastValue.id.slice(-1)) + 1;

		const newValue = lastValue.cloneNode(false);
		const newKey = lastKey.cloneNode(false);

		const newValueIdentifier = `${groupName}Value${newCount}`;
		const newKeyIdentifier = `${groupName}Key${newCount}`;

		newValue.id = newValueIdentifier;
		newValue.name = newValueIdentifier;
		newValue.value = "";

		newKey.id = newKeyIdentifier;
		newKey.name = newKeyIdentifier;
		newKey.value = "";

		const divNode = document.createElement("div");

		divNode.appendChild(newKey);
		divNode.appendChild(newValue);

		group.appendChild(divNode);
	};

	const handleAddHeader = event => {
		event.preventDefault();
		event.stopPropagation();

		addGroup("header");
	};

	const handleAddParam = event => {
		event.preventDefault();
		event.stopPropagation();

		addGroup("param");
	};

	const submitValidation = e => {
		const form = document.getElementById("requestForm");
		const formData = new FormData(form);
		const body = formData.get("body");

		if (
			!formData.has("method") ||
			!formData.has("url") ||
			(formData.get("method") === "POST" && !body)
		) {
			e.preventDefault();
			e.stopPropagation();
		}

		document
			.getElementsByClassName("alertFormHidden")[0]
			.classList.toggle("alertFormHidden");
	};

	// Add params
	const addParamButton = document.getElementById("addParam");
	addParamButton.addEventListener("click", handleAddParam);

	// Add headers
	const addHeaderButton = document.getElementById("addHeader");
	addHeaderButton.addEventListener("click", handleAddHeader);

	// Form validation
	const submitBtn = document.getElementById("submit");
	submitBtn.addEventListener("click", submitValidation);
})();
