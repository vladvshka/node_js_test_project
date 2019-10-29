(async() =>{
    const URL = 'https://fe.it-academy.by/Examples/words_tree/';
    const ROOT_FILE_NAME = 'root.txt';

    let resultingPhrase = '';

    const renderPhrase = () => {
        const renderNode = document.getElementById('async-text');
        renderNode.innerHTML = resultingPhrase;
        console.log('Async/await resultingPhrase :', resultingPhrase);
    }

    const isJsonValidArray = (structure) => {
        if (typeof structure !== 'string') {
            return false;
        }
        try {
            const result = JSON.parse(structure);
            const type = Object.prototype.toString.call(result);

            return type === '[object Array]';
        } catch (error) {
            return false;
        }
    };

    const generateText = async (fileName) => {
        try {
            const response = await fetch(`${URL}${fileName}`);
        
            if (response.ok) {
                const responseText = await response.text();

                if (isJsonValidArray(responseText)) {
                    const data = JSON.parse(responseText);

                    for (const file of data) {
                        await generateText(file);
                    }
                } else if (typeof responseText === 'string') {
                    resultingPhrase += ` ${responseText}`;
                }
            }
        } catch (error) {
            console.error('error', error);
        }
    };

    await generateText(ROOT_FILE_NAME);

    renderPhrase();
})();