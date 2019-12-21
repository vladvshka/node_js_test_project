(async () => {
	// refactor form to contain array of params
	const handleSubmit = async event => {
		event.preventDefault();
		event.stopPropagation();

		const formData = new FormData(form);

		// Display the key/value pairs
		for (const pair of formData.entries()) {
			console.log(pair[0] + ", " + pair[1]);
		}

		try {
			const response = await fetch("/", {
				method: "POST",
				body: formData,
			});

			// if (response.ok) {
			//     await updateStatistics();
			// };
		} catch (error) {
			console.error("error", error);
		}
	};

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

	// Entry point.
	const form = document.getElementById("requestForm");
	form.addEventListener("submit", handleSubmit);

	// Add params
	const addParamButton = document.getElementById("addParam");
	addParamButton.addEventListener("click", handleAddParam);

	// Add headers
	const addHeaderButton = document.getElementById("addHeader");
	addHeaderButton.addEventListener("click", handleAddHeader);
})();
